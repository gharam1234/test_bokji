/**
 * 일별 집계 배치 작업
 * 매일 자정에 전날 데이터 집계 수행
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AggregationService } from '../modules/analytics/services/aggregation.service';
import { subDays } from 'date-fns';

@Injectable()
export class DailyAggregationJob {
  private readonly logger = new Logger(DailyAggregationJob.name);

  constructor(private readonly aggregationService: AggregationService) {}

  /**
   * 매일 자정 1분에 실행 (전날 데이터 집계)
   * Cron: 0 1 0 * * * (매일 00:01)
   */
  @Cron('0 1 0 * * *')
  async handleDailyAggregation(): Promise<void> {
    this.logger.log('Starting daily aggregation job...');

    try {
      const yesterday = subDays(new Date(), 1);

      // 모든 사용자 ID 조회 (실제 구현 필요)
      const userIds = await this.getAllUserIds();

      await this.aggregationService.aggregateDaily(yesterday, userIds);

      this.logger.log('Daily aggregation job completed successfully');
    } catch (error) {
      this.logger.error(`Daily aggregation job failed: ${error.message}`, error.stack);
    }
  }

  /**
   * 수동 실행 (관리자용)
   * @param date 집계 대상 날짜
   */
  async runManually(date: Date): Promise<void> {
    this.logger.log(`Running manual daily aggregation for ${date.toISOString()}`);

    const userIds = await this.getAllUserIds();
    await this.aggregationService.aggregateDaily(date, userIds);
  }

  /**
   * 모든 사용자 ID 조회
   * 실제 구현시 User 서비스에서 조회
   */
  private async getAllUserIds(): Promise<string[]> {
    // TODO: 실제 구현 필요
    // return this.userService.getAllActiveUserIds();
    return [];
  }
}
