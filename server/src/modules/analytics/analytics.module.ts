/**
 * Analytics Module
 * 분석 기능 NestJS 모듈 정의
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsRepository } from './analytics.repository';
import {
  UserActivityLog,
  UserAnalyticsSummary,
  UserInsight,
} from './entities';
import {
  AggregationService,
  InsightGeneratorService,
  PDFGeneratorService,
} from './services';
import {
  DailyAggregationJob,
  WeeklyAggregationJob,
  InsightGenerationJob,
} from '../../jobs';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserActivityLog,
      UserAnalyticsSummary,
      UserInsight,
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
  ],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    AnalyticsRepository,
    AggregationService,
    InsightGeneratorService,
    PDFGeneratorService,
    // 배치 작업
    DailyAggregationJob,
    WeeklyAggregationJob,
    InsightGenerationJob,
  ],
  exports: [AnalyticsService, AggregationService, InsightGeneratorService],
})
export class AnalyticsModule {}
