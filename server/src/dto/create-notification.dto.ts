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
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ description: 'Notification type', enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'Interview Reminder',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'You have a technical interview scheduled for tomorrow at 2:00 PM',
  })
  @IsString()
  @MinLength(1)
  message: string;

  @ApiProperty({ description: 'User ID this notification belongs to' })
  @IsUUID()
  userId: string;

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
