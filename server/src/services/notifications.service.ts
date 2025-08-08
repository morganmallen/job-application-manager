import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
  Notification,
  NotificationStatus,
  NotificationType,
} from '../entities/notification.entity';
import { ApplicationEvent } from '../entities/application-event.entity';
import { User } from '../entities/user.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { EmailService } from './email.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(ApplicationEvent)
    private eventsRepository: Repository<ApplicationEvent>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  async findAll(userId: string, limit?: number): Promise<Notification[]> {
    const query = this.notificationsRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.event', 'event')
      .leftJoinAndSelect('event.application', 'application')
      .leftJoinAndSelect('application.company', 'company')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC');

    if (limit) {
      query.limit(limit);
    }

    return query.getMany();
  }

  async findUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
    });
  }

  async findOne(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id, userId },
      relations: ['event', 'event.application', 'event.application.company'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const user = await this.usersRepository.findOne({
      where: { id: createNotificationDto.userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (createNotificationDto.eventId) {
      const event = await this.eventsRepository.findOne({
        where: { id: createNotificationDto.eventId },
        relations: ['application', 'application.company'],
      });

      if (!event) {
        throw new BadRequestException('Event not found');
      }
    }

    const notificationData: any = { ...createNotificationDto };
    if (createNotificationDto.scheduledAt) {
      notificationData.scheduledAt = new Date(
        createNotificationDto.scheduledAt,
      );
    }

    const notification = this.notificationsRepository.create(notificationData);
    const result = await this.notificationsRepository.insert(notification);
    const savedNotification = await this.findOne(
      result.identifiers[0].id,
      createNotificationDto.userId,
    );

    // Send email notification if it's an interview reminder
    if (
      savedNotification.type === NotificationType.INTERVIEW_REMINDER &&
      savedNotification.event
    ) {
      try {
        await this.emailService.sendInterviewReminder(
          user.email,
          `${user.first_name} ${user.last_name}`,
          savedNotification.event.title,
          savedNotification.event.type,
          savedNotification.event.scheduledAt,
          savedNotification.event.application.company.name,
        );
      } catch (error) {
        // Log error but don't fail the notification creation
        console.error('Failed to send email notification:', error);
      }
    }

    return savedNotification;
  }

  async update(
    id: string,
    userId: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    const notification = await this.findOne(id, userId);

    const updateData: any = { ...updateNotificationDto };
    if (updateNotificationDto.scheduledAt) {
      updateData.scheduledAt = new Date(updateNotificationDto.scheduledAt);
    }

    Object.assign(notification, updateData);
    return this.notificationsRepository.save(notification);
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.findOne(id, userId);
    notification.status = NotificationStatus.READ;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, status: NotificationStatus.UNREAD },
      { status: NotificationStatus.READ },
    );
  }

  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.findOne(id, userId);
    await this.notificationsRepository.remove(notification);
  }

  async createInterviewReminders(): Promise<void> {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find events scheduled for tomorrow
    const upcomingEvents = await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.application', 'application')
      .leftJoinAndSelect('application.user', 'user')
      .leftJoinAndSelect('application.company', 'company')
      .where('event.scheduledAt >= :tomorrow', { tomorrow })
      .andWhere('event.scheduledAt < :dayAfterTomorrow', { dayAfterTomorrow })
      .andWhere('event.completedAt IS NULL')
      .getMany();

    for (const event of upcomingEvents) {
      // Check if notification already exists for this event
      const existingNotification = await this.notificationsRepository.findOne({
        where: {
          eventId: event.id,
          userId: event.application.user.id,
          type: NotificationType.INTERVIEW_REMINDER,
        },
      });

      if (!existingNotification) {
        const notification = this.notificationsRepository.create({
          type: NotificationType.INTERVIEW_REMINDER,
          title: `Interview Reminder: ${event.title}`,
          message: `You have a ${event.type.toLowerCase().replace('_', ' ')} scheduled for tomorrow at ${event.scheduledAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} with ${event.application.company.name}.`,
          userId: event.application.user.id,
          eventId: event.id,
          scheduledAt: event.scheduledAt,
        });

        const savedNotification =
          await this.notificationsRepository.save(notification);

        // Send email notification
        try {
          await this.emailService.sendInterviewReminder(
            event.application.user.email,
            `${event.application.user.first_name} ${event.application.user.last_name}`,
            event.title,
            event.type,
            event.scheduledAt,
            event.application.company.name,
          );
        } catch (error) {
          console.error('Failed to send email notification:', error);
        }
      }
    }
  }

  async cleanupOldNotifications(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.notificationsRepository.delete({
      createdAt: LessThanOrEqual(thirtyDaysAgo),
      status: NotificationStatus.READ,
    });
  }
}
