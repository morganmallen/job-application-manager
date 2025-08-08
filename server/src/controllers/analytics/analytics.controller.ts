import {
  Controller,
  Get,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnalyticsService } from '../../services/analytics/analytics.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('applications')
  @ApiOperation({
    summary: 'Get application analytics for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Application analytics data',
  })
  async getApplicationAnalytics(@Req() req: Request): Promise<any> {
    const userId = (req.user as { userId: string })?.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    return this.analyticsService.getApplicationAnalytics(userId);
  }
}
