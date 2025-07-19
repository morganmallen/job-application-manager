import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApplicationStatus } from '../entities/user.entity';

export class UpdateApplicationDto {
  @ApiProperty({
    description: 'Job position title',
    example: 'Senior Software Engineer',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  position?: string;

  @ApiProperty({
    description: 'Application status',
    enum: ApplicationStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiProperty({
    description: 'Application date',
    example: '2024-01-15T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  appliedAt?: string;

  @ApiProperty({
    description: 'Application notes',
    example: 'Great company culture',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Salary information',
    example: '$120,000 - $150,000',
    required: false,
  })
  @IsOptional()
  @IsString()
  salary?: string;

  @ApiProperty({
    description: 'Job location',
    example: 'San Francisco, CA',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Remote work option', required: false })
  @IsOptional()
  @IsBoolean()
  remote?: boolean;
}
