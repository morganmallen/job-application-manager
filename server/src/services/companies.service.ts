import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { User } from '../entities/user.entity';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(userId?: string): Promise<Company[]> {
    const where = userId ? { userId } : {};
    return this.companiesRepository.find({
      where,
      relations: ['applications', 'user'],
    });
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { id },
      relations: ['applications', 'user'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async findByName(name: string): Promise<Company | null> {
    return this.companiesRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.applications', 'applications')
      .leftJoinAndSelect('company.user', 'user')
      .where('LOWER(company.name) = LOWER(:name)', { name })
      .getOne();
  }

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    if (!createCompanyDto.userId) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.usersRepository.findOne({
      where: { id: createCompanyDto.userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const company = this.companiesRepository.create(createCompanyDto);
    const result = await this.companiesRepository.insert(company);
    return this.findOne(result.identifiers[0].id);
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.findOne(id);
    Object.assign(company, updateCompanyDto);
    return this.companiesRepository.save(company);
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);
    await this.companiesRepository.remove(company);
  }
}
