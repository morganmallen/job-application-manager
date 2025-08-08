import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RecentActivityService } from '../services/recent-activity.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Recent Activity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recent-activity')
export class RecentActivityController {
  constructor(private readonly recentActivityService: RecentActivityService) {}

  @Get()
  @ApiOperation({ summary: 'Get recent activity for the current user' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit the number of activities returned (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent activity retrieved successfully',
  })
  async getRecentActivity(
    @Request() req: any,
    @Query('limit') limit?: number,
  ): Promise<any[]> {
    const userId = req.user.id || req.user.userId;
    const limitNumber = limit ? parseInt(limit.toString()) : 10;
    return this.recentActivityService.getRecentActivity(userId, limitNumber);
  }
}
