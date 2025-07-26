import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotesService } from '../services/notes.service';
import { CreateNoteDto } from '../dto/create-note.dto';
import { UpdateNoteDto } from '../dto/update-note.dto';
import { Note } from '../entities/note.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({
    status: 201,
    description: 'Note created successfully',
    type: Note,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createNoteDto: CreateNoteDto): Promise<Note> {
    return this.notesService.create(createNoteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notes' })
  @ApiQuery({
    name: 'applicationId',
    required: false,
    description: 'Filter by application ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of notes',
    type: [Note],
  })
  findAll(@Query('applicationId') applicationId?: string): Promise<Note[]> {
    return this.notesService.findAll(applicationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get note by ID' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({
    status: 200,
    description: 'Note details',
    type: Note,
  })
  @ApiResponse({ status: 404, description: 'Note not found' })
  findOne(@Param('id') id: string): Promise<Note> {
    return this.notesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update note' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({
    status: 200,
    description: 'Note updated successfully',
    type: Note,
  })
  @ApiResponse({ status: 404, description: 'Note not found' })
  update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ): Promise<Note> {
    return this.notesService.update(id, updateNoteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete note' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({ status: 204, description: 'Note deleted successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.notesService.remove(id);
  }

  @Get('application/:applicationId')
  @ApiOperation({ summary: 'Get notes by application ID' })
  @ApiParam({ name: 'applicationId', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'List of notes for the application',
    type: [Note],
  })
  findByApplication(
    @Param('applicationId') applicationId: string,
  ): Promise<Note[]> {
    return this.notesService.findByApplication(applicationId);
  }
}
