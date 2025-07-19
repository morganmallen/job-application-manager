import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationEvent } from '../entities/application-event.entity';
import { Application } from '../entities/application.entity';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(ApplicationEvent)
    private eventsRepository: Repository<ApplicationEvent>,
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
  ) {}

  async findAll(
    applicationId?: string,
    type?: string,
  ): Promise<ApplicationEvent[]> {
    const where: any = {};
    if (applicationId) where.applicationId = applicationId;
    if (type) where.type = type;

    return this.eventsRepository.find({
      where,
      relations: ['application'],
      order: { scheduledAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ApplicationEvent> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['application'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async create(createEventDto: CreateEventDto): Promise<ApplicationEvent> {
    const application = await this.applicationsRepository.findOne({
      where: { id: createEventDto.applicationId },
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    const eventData: any = { ...createEventDto };
    if (createEventDto.scheduledAt) {
      eventData.scheduledAt = new Date(createEventDto.scheduledAt);
    }
    if (createEventDto.completedAt) {
      eventData.completedAt = new Date(createEventDto.completedAt);
    }

    const event = this.eventsRepository.create(eventData);
    const result = await this.eventsRepository.insert(event);
    return this.findOne(result.identifiers[0].id);
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
  ): Promise<ApplicationEvent> {
    const event = await this.findOne(id);

    const updateData: any = { ...updateEventDto };
    if (updateEventDto.scheduledAt) {
      updateData.scheduledAt = new Date(updateEventDto.scheduledAt);
    }
    if (updateEventDto.completedAt) {
      updateData.completedAt = new Date(updateEventDto.completedAt);
    }

    Object.assign(event, updateData);
    return this.eventsRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventsRepository.remove(event);
  }
}
