import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CompaniesService } from '../services/companies.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { Company } from '../entities/company.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully',
    type: Company,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(
    @Body() createCompanyDto: CreateCompanyDto,
    @Req() req: Request,
  ): Promise<Company> {
    const userId = (req.user as { userId: string })?.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    return this.companiesService.create({
      ...createCompanyDto,
      userId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of companies',
    type: [Company],
  })
  findAll(@Req() req: Request): Promise<Company[]> {
    const userId = (req.user as { userId: string })?.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    return this.companiesService.findAll(userId);
  }

  @Get('search/:name')
  @ApiOperation({ summary: 'Find company by name (case-insensitive)' })
  @ApiParam({ name: 'name', description: 'Company name to search for' })
  @ApiResponse({ status: 200, description: 'Company found', type: Company })
  @ApiResponse({ status: 404, description: 'Company not found' })
  findByName(@Param('name') name: string): Promise<Company | null> {
    return this.companiesService.findByName(name);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Company details', type: Company })
  @ApiResponse({ status: 404, description: 'Company not found' })
  findOne(@Param('id') id: string): Promise<Company> {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully',
    type: Company,
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 204, description: 'Company deleted successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.companiesService.remove(id);
  }
}
