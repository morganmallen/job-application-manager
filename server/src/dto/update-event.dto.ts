import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { EventType } from '../entities/enums';

export class UpdateEventDto {
  @ApiProperty({ description: 'Event type', enum: EventType, required: false })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @ApiProperty({
    description: 'Event title',
    example: 'Technical Interview',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiProperty({
    description: 'Event description',
    example: 'Coding challenge and system design',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Scheduled date and time',
    example: '2024-01-30T14:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({
    description: 'Completion date and time',
    example: '2024-01-30T15:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  completedAt?: string;
}
