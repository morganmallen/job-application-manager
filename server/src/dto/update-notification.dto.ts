import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
} from 'class-validator';
import {
  NotificationType,
  NotificationStatus,
} from '../entities/notification.entity';

export class UpdateNotificationDto {
  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    required: false,
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'Interview Reminder',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'You have a technical interview scheduled for tomorrow at 2:00 PM',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'Notification status',
    enum: NotificationStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @ApiProperty({
    description: 'Event ID this notification is related to',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  eventId?: string;

  @ApiProperty({
    description: 'Scheduled date for the related event',
    example: '2024-01-30T14:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
