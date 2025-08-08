import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleInterviewReminders() {
    this.logger.log('Starting interview reminder creation...');
    try {
      await this.notificationsService.createInterviewReminders();
      this.logger.log('Interview reminders created successfully');
    } catch (error) {
      this.logger.error('Failed to create interview reminders:', error);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async handleCleanupOldNotifications() {
    this.logger.log('Starting old notifications cleanup...');
    try {
      await this.notificationsService.cleanupOldNotifications();
      this.logger.log('Old notifications cleaned up successfully');
    } catch (error) {
      this.logger.error('Failed to cleanup old notifications:', error);
    }
  }
}
