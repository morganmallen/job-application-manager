import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { ApplicationEvent } from './application-event.entity';

export enum NotificationType {
  INTERVIEW_REMINDER = 'INTERVIEW_REMINDER',
  APPLICATION_UPDATE = 'APPLICATION_UPDATE',
  SYSTEM = 'SYSTEM',
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
}

@Entity('notifications')
export class Notification {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Notification type', enum: NotificationType })
  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.INTERVIEW_REMINDER,
  })
  type!: NotificationType;

  @ApiProperty({ description: 'Notification title' })
  @Column()
  title!: string;

  @ApiProperty({ description: 'Notification message' })
  @Column('text')
  message!: string;

  @ApiProperty({ description: 'Notification status', enum: NotificationStatus })
  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD,
  })
  status!: NotificationStatus;

  @ApiProperty({ description: 'User ID this notification belongs to' })
  @Column({ name: 'user_id' })
  userId!: string;

  @ApiProperty({
    description: 'Event ID this notification is related to',
    required: false,
  })
  @Column({ name: 'event_id', nullable: true })
  eventId?: string;

  @ApiProperty({
    description: 'Scheduled date for the related event',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true, name: 'scheduled_at' })
  scheduledAt?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => ApplicationEvent, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event?: ApplicationEvent;
}
