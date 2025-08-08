import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../entities/application.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
  ) {}

  async getApplicationAnalytics(userId: string): Promise<any> {
    // Get status counts for the specific user
    const statusCounts = await this.applicationsRepository
      .createQueryBuilder('application')
      .select('application.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('application.userId = :userId', { userId })
      .groupBy('application.status')
      .getRawMany();

    // Get monthly data for the last 6 months for the specific user
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await this.applicationsRepository
      .createQueryBuilder('application')
      .select("DATE_TRUNC('month', application.appliedAt)", 'month')
      .addSelect('application.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('application.userId = :userId', { userId })
      .andWhere('application.appliedAt >= :sixMonthsAgo', { sixMonthsAgo })
      .groupBy("DATE_TRUNC('month', application.appliedAt), application.status")
      .orderBy('month', 'ASC')
      .getRawMany();

    // Process status counts
    const stats = {
      total: 0,
      applied: 0,
      inProgress: 0,
      rejected: 0,
      accepted: 0,
      jobOffered: 0,
      withdrawn: 0,
    };

    statusCounts.forEach((item: any) => {
      const count = parseInt(item.count);
      stats.total += count;

      switch (item.status) {
        case 'Applied':
          stats.applied = count;
          break;
        case 'In progress':
          stats.inProgress = count;
          break;
        case 'Rejected':
          stats.rejected = count;
          break;
        case 'Accepted':
          stats.accepted = count;
          break;
        case 'Job Offered':
          stats.jobOffered = count;
          break;
        case 'Withdraw':
          stats.withdrawn = count;
          break;
      }
    });

    // Process monthly data
    const monthlyStats: { [key: string]: any } = {};

    monthlyData.forEach((item: any) => {
      const month = item.month;
      const status = item.status;
      const count = parseInt(item.count);

      if (!monthlyStats[month]) {
        monthlyStats[month] = {
          month,
          applied: 0,
          inProgress: 0,
          rejected: 0,
          accepted: 0,
        };
      }

      switch (status) {
        case 'Applied':
          monthlyStats[month].applied = count;
          break;
        case 'In progress':
          monthlyStats[month].inProgress = count;
          break;
        case 'Rejected':
          monthlyStats[month].rejected = count;
          break;
        case 'Accepted':
          monthlyStats[month].accepted = count;
          break;
      }
    });

    const monthlyDataArray = Object.values(monthlyStats);

    return {
      stats,
      monthlyData: monthlyDataArray,
    };
  }
}
