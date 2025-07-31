import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnalyticsService } from '../../services/analytics/analytics.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('applications')
  @ApiOperation({ summary: 'Get application analytics' })
  @ApiResponse({
    status: 200,
    description: 'Application analytics data',
  })
  async getApplicationAnalytics(): Promise<any> {
    return this.analyticsService.getApplicationAnalytics();
  }
}
