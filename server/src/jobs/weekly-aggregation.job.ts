/**
 * 주별 집계 배치 작업
 * 매주 월요일에 지난 주 데이터 집계 수행
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AggregationService } from '../modules/analytics/services/aggregation.service';
import { subWeeks, startOfWeek } from 'date-fns';

@Injectable()
export class WeeklyAggregationJob {
  private readonly logger = new Logger(WeeklyAggregationJob.name);

  constructor(private readonly aggregationService: AggregationService) {}

  /**
   * 매주 월요일 새벽 2시에 실행 (지난 주 데이터 집계)
   * Cron: 0 0 2 * * 1 (매주 월요일 02:00)
   */
  @Cron('0 0 2 * * 1')
  async handleWeeklyAggregation(): Promise<void> {
    this.logger.log('Starting weekly aggregation job...');

    try {
      // 지난 주 월요일
      const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });

      // 모든 사용자 ID 조회 (실제 구현 필요)
      const userIds = await this.getAllUserIds();

      await this.aggregationService.aggregateWeekly(lastWeekStart, userIds);

      this.logger.log('Weekly aggregation job completed successfully');
    } catch (error) {
      this.logger.error(`Weekly aggregation job failed: ${error.message}`, error.stack);
    }
  }

  /**
   * 수동 실행 (관리자용)
   * @param weekStart 집계 대상 주의 시작일
   */
  async runManually(weekStart: Date): Promise<void> {
    this.logger.log(`Running manual weekly aggregation for week of ${weekStart.toISOString()}`);

    const userIds = await this.getAllUserIds();
    await this.aggregationService.aggregateWeekly(weekStart, userIds);
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
