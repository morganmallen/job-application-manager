import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../entities/application.entity';
import { User } from '../entities/user.entity';
import { Company } from '../entities/company.entity';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { UpdateApplicationDto } from '../dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async findAll(
    userId?: string,
    companyId?: string,
    status?: string,
  ): Promise<Application[]> {
    const where: any = {};
    if (userId) where.userId = userId;
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;

    return this.applicationsRepository.find({
      where,
      relations: ['company', 'user', 'events'],
      order: { appliedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { id },
      relations: ['company', 'user', 'events'],
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  async create(
    createApplicationDto: CreateApplicationDto,
  ): Promise<Application> {
    const user = await this.usersRepository.findOne({
      where: { id: createApplicationDto.userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const company = await this.companiesRepository.findOne({
      where: { id: createApplicationDto.companyId },
    });

    if (!company) {
      throw new BadRequestException('Company not found');
    }

    const applicationData: any = { ...createApplicationDto };
    if (createApplicationDto.appliedAt) {
      applicationData.appliedAt = new Date(createApplicationDto.appliedAt);
    }

    const application = this.applicationsRepository.create(applicationData);
    const result = await this.applicationsRepository.insert(application);
    return this.findOne(result.identifiers[0].id);
  }

  async update(
    id: string,
    updateApplicationDto: UpdateApplicationDto,
  ): Promise<Application> {
    const application = await this.findOne(id);

    const updateData: any = { ...updateApplicationDto };
    if (updateApplicationDto.appliedAt) {
      updateData.appliedAt = new Date(updateApplicationDto.appliedAt);
    }

    Object.assign(application, updateData);
    return this.applicationsRepository.save(application);
  }

  async remove(id: string): Promise<void> {
    const application = await this.findOne(id);
    await this.applicationsRepository.remove(application);
  }
}
