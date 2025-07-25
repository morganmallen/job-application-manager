import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateNoteDto {
  @ApiProperty({
    description: 'Note content',
    example: 'Updated note content after the interview.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;
}
