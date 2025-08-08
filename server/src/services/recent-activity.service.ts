import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../entities/application.entity';
import { ApplicationEvent } from '../entities/application-event.entity';
import { Note } from '../entities/note.entity';

export interface RecentActivity {
  id: string;
  type: 'application' | 'event' | 'note';
  title: string;
  description: string;
  date: Date;
  status?: string;
  companyName?: string;
  position?: string;
}

@Injectable()
export class RecentActivityService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(ApplicationEvent)
    private eventsRepository: Repository<ApplicationEvent>,
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
  ) {}

  async getRecentActivity(
    userId: string,
    limit: number = 10,
  ): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    // Get recent applications
    const recentApplications = await this.applicationsRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.company', 'company')
      .where('application.userId = :userId', { userId })
      .orderBy('application.updatedAt', 'DESC')
      .limit(limit)
      .getMany();

    // Get recent events
    const recentEvents = await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.application', 'application')
      .leftJoinAndSelect('application.company', 'company')
      .leftJoinAndSelect('application.user', 'user')
      .where('application.userId = :userId', { userId })
      .orderBy('event.updatedAt', 'DESC')
      .limit(limit)
      .getMany();

    // Get recent notes
    const recentNotes = await this.notesRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.application', 'application')
      .leftJoinAndSelect('application.company', 'company')
      .leftJoinAndSelect('application.user', 'user')
      .where('application.userId = :userId', { userId })
      .orderBy('note.createdAt', 'DESC')
      .limit(limit)
      .getMany();

    // Process applications
    recentApplications.forEach((app) => {
      activities.push({
        id: app.id,
        type: 'application',
        title: `Application ${app.status}`,
        description: `Application for ${app.position} at ${app.company?.name || 'Unknown Company'}`,
        date: app.updatedAt,
        status: app.status,
        companyName: app.company?.name,
        position: app.position,
      });
    });

    // Process events
    recentEvents.forEach((event) => {
      activities.push({
        id: event.id,
        type: 'event',
        title: `Event: ${event.title}`,
        description: `${event.type.replace('_', ' ')} for ${event.application.position} at ${event.application.company?.name || 'Unknown Company'}`,
        date: event.updatedAt,
        status: event.completedAt ? 'Completed' : 'Scheduled',
        companyName: event.application.company?.name,
        position: event.application.position,
      });
    });

    // Process notes
    recentNotes.forEach((note) => {
      activities.push({
        id: note.id,
        type: 'note',
        title: 'Note added',
        description: `Note added to application for ${note.application.position} at ${note.application.company?.name || 'Unknown Company'}`,
        date: note.createdAt,
        companyName: note.application.company?.name,
        position: note.application.position,
      });
    });

    // Sort all activities by date (most recent first) and limit
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }
}
