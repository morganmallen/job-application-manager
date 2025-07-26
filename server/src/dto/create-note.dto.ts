import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({
    description: 'Note content',
    example:
      'Had a great phone interview with the hiring manager. They seemed very interested in my background.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Application ID this note belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  applicationId: string;
}
