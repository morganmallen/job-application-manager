import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApplicationsService } from '../services/applications.service';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { UpdateApplicationDto } from '../dto/update-application.dto';
import { Application } from '../entities/application.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new application' })
  @ApiResponse({
    status: 201,
    description: 'Application created successfully',
    type: Application,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(
    @Body() createApplicationDto: CreateApplicationDto,
    @Req() req: Request,
  ): Promise<Application> {
    const userId = (req.user as { userId: string })?.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    return this.applicationsService.create({
      ...createApplicationDto,
      userId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all applications for the authenticated user' })
  @ApiQuery({
    name: 'companyId',
    required: false,
    description: 'Filter by company ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by application status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of applications',
    type: [Application],
  })
  findAll(
    @Req() req: Request,
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
  ): Promise<Application[]> {
    const userId = (req.user as { userId: string })?.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    return this.applicationsService.findAll(userId, companyId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'Application details',
    type: Application,
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  findOne(@Param('id') id: string): Promise<Application> {
    return this.applicationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'Application updated successfully',
    type: Application,
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ): Promise<Application> {
    return this.applicationsService.update(id, updateApplicationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 204, description: 'Application deleted successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.applicationsService.remove(id);
  }
}
