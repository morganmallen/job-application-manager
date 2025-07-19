import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ description: 'Company name', example: 'TechCorp' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Company website URL',
    example: 'https://techcorp.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    description: 'Company description',
    example: 'A leading technology company',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Company location',
    example: 'San Francisco, CA',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'User ID who owns this company' })
  @IsString()
  userId: string;
}
