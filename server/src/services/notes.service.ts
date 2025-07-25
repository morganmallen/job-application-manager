import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from '../entities/note.entity';
import { Application } from '../entities/application.entity';
import { CreateNoteDto } from '../dto/create-note.dto';
import { UpdateNoteDto } from '../dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
  ) {}

  async findAll(applicationId?: string): Promise<Note[]> {
    const where = applicationId ? { applicationId } : {};
    return this.notesRepository.find({
      where,
      relations: ['application'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.notesRepository.findOne({
      where: { id },
      relations: ['application'],
    });

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    return note;
  }

  async create(createNoteDto: CreateNoteDto): Promise<Note> {
    // Verify that the application exists
    const application = await this.applicationsRepository.findOne({
      where: { id: createNoteDto.applicationId },
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    const note = this.notesRepository.create(createNoteDto);
    const result = await this.notesRepository.insert(note);
    return this.findOne(result.identifiers[0].id);
  }

  async update(id: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(id);
    Object.assign(note, updateNoteDto);
    return this.notesRepository.save(note);
  }

  async remove(id: string): Promise<void> {
    const note = await this.findOne(id);
    await this.notesRepository.remove(note);
  }

  async findByApplication(applicationId: string): Promise<Note[]> {
    return this.notesRepository.find({
      where: { applicationId },
      order: { createdAt: 'DESC' },
    });
  }
}
