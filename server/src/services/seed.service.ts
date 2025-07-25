import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, ApplicationStatus, EventType } from '../entities/user.entity';
import { Company } from '../entities/company.entity';
import { Application } from '../entities/application.entity';
import { ApplicationEvent } from '../entities/application-event.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(ApplicationEvent)
    private eventsRepository: Repository<ApplicationEvent>,
  ) {}

  async seed() {
    console.log('🌱 Starting database seeding...');

    // Create sample user
    const user = await this.usersRepository.save(
      this.usersRepository.create({
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
      }),
    );

    console.log('✅ Created user:', `${user.first_name} ${user.last_name}`);

    // Create sample companies
    const companies = await Promise.all([
      this.companiesRepository.save(
        this.companiesRepository.create({
          name: 'TechCorp',
          website: 'https://techcorp.com',
          description: 'A leading technology company',
          location: 'San Francisco, CA',
          userId: user.id,
        }),
      ),
      this.companiesRepository.save(
        this.companiesRepository.create({
          name: 'StartupXYZ',
          website: 'https://startupxyz.com',
          description: 'An innovative startup',
          location: 'New York, NY',
          userId: user.id,
        }),
      ),
      this.companiesRepository.save(
        this.companiesRepository.create({
          name: 'Enterprise Solutions',
          website: 'https://enterprisesolutions.com',
          description: 'Enterprise software solutions',
          location: 'Austin, TX',
          userId: user.id,
        }),
      ),
    ]);

    console.log(
      '✅ Created companies:',
      companies.map((c) => c.name),
    );

    // Create sample applications
    const applications = await Promise.all([
      this.applicationsRepository.save(
        this.applicationsRepository.create({
          position: 'Senior Software Engineer',
          status: ApplicationStatus.INTERVIEWING,
          appliedAt: new Date('2024-01-15'),
          notes: 'Great company culture, exciting projects',
          salary: '$120,000 - $150,000',
          location: 'San Francisco, CA',
          remote: false,
          userId: user.id,
          companyId: companies[0].id,
        }),
      ),
      this.applicationsRepository.save(
        this.applicationsRepository.create({
          position: 'Full Stack Developer',
          status: ApplicationStatus.APPLIED,
          appliedAt: new Date('2024-01-20'),
          notes: 'Early stage startup, equity included',
          salary: '$90,000 - $110,000',
          location: 'New York, NY',
          remote: true,
          userId: user.id,
          companyId: companies[1].id,
        }),
      ),
      this.applicationsRepository.save(
        this.applicationsRepository.create({
          position: 'Software Architect',
          status: ApplicationStatus.OFFER,
          appliedAt: new Date('2024-01-10'),
          notes: 'Received offer, negotiating terms',
          salary: '$140,000 - $170,000',
          location: 'Austin, TX',
          remote: false,
          userId: user.id,
          companyId: companies[2].id,
        }),
      ),
    ]);

    console.log(
      '✅ Created applications:',
      applications.map((a) => a.position),
    );

    // Create sample events
    const events = await Promise.all([
      this.eventsRepository.save(
        this.eventsRepository.create({
          type: EventType.PHONE_SCREEN,
          title: 'Initial Phone Screen',
          description: '30-minute call with HR',
          scheduledAt: new Date('2024-01-25T10:00:00Z'),
          applicationId: applications[0].id,
        }),
      ),
      this.eventsRepository.save(
        this.eventsRepository.create({
          type: EventType.TECHNICAL_INTERVIEW,
          title: 'Technical Interview',
          description: 'Coding challenge and system design',
          scheduledAt: new Date('2024-01-30T14:00:00Z'),
          applicationId: applications[0].id,
        }),
      ),
      this.eventsRepository.save(
        this.eventsRepository.create({
          type: EventType.BEHAVIORAL_INTERVIEW,
          title: 'Behavioral Interview',
          description: 'Team fit and culture interview',
          scheduledAt: new Date('2024-02-05T11:00:00Z'),
          applicationId: applications[0].id,
        }),
      ),
      this.eventsRepository.save(
        this.eventsRepository.create({
          type: EventType.CODING_CHALLENGE,
          title: 'Take-home Assignment',
          description: 'Build a small feature',
          scheduledAt: new Date('2024-01-22T00:00:00Z'),
          completedAt: new Date('2024-01-24T00:00:00Z'),
          applicationId: applications[1].id,
        }),
      ),
    ]);

    console.log(
      '✅ Created events:',
      events.map((e) => e.title),
    );
    console.log('🎉 Database seeding completed successfully!');
  }
}
