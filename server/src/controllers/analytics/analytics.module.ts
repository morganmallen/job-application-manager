import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from '../../services/analytics/analytics.service';
import { Application } from '../../entities/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
