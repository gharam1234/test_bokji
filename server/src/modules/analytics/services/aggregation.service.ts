/**
 * 데이터 집계 서비스
 * 일별/주별/월별 분석 데이터 집계 로직
 */

import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsRepository } from '../analytics.repository';
import {
  PeriodType,
  CategoryCount,
  ConversionMetrics,
} from '../entities/user-analytics-summary.entity';
import { ActivityType } from '../entities/user-activity-log.entity';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
} from 'date-fns';

@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);

  constructor(private readonly analyticsRepo: AnalyticsRepository) {}

  /**
   * 일별 집계 수행
   * @param date 집계 대상 날짜
   * @param userIds 대상 사용자 ID 목록 (없으면 전체)
   */
  async aggregateDaily(date: Date, userIds?: string[]): Promise<void> {
    this.logger.log(`Starting daily aggregation for ${date.toISOString()}`);

    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    // 실제 구현시 사용자 목록 조회 필요
    const users = userIds || [];

    for (const userId of users) {
      await this.aggregateForUser(userId, PeriodType.DAILY, startDate, endDate);
    }

    this.logger.log(`Completed daily aggregation for ${users.length} users`);
  }

  /**
   * 주별 집계 수행
   * @param weekStart 주 시작 날짜
   * @param userIds 대상 사용자 ID 목록
   */
  async aggregateWeekly(weekStart: Date, userIds?: string[]): Promise<void> {
    this.logger.log(`Starting weekly aggregation for week of ${weekStart.toISOString()}`);

    const startDate = startOfWeek(weekStart, { weekStartsOn: 1 }); // 월요일 시작
    const endDate = endOfWeek(weekStart, { weekStartsOn: 1 });

    const users = userIds || [];

    for (const userId of users) {
      await this.aggregateForUser(userId, PeriodType.WEEKLY, startDate, endDate);
    }

    this.logger.log(`Completed weekly aggregation for ${users.length} users`);
  }

  /**
   * 월별 집계 수행
   * @param monthDate 대상 월의 아무 날짜
   * @param userIds 대상 사용자 ID 목록
   */
  async aggregateMonthly(monthDate: Date, userIds?: string[]): Promise<void> {
    this.logger.log(`Starting monthly aggregation for ${monthDate.toISOString()}`);

    const startDate = startOfMonth(monthDate);
    const endDate = endOfMonth(monthDate);

    const users = userIds || [];

    for (const userId of users) {
      await this.aggregateForUser(userId, PeriodType.MONTHLY, startDate, endDate);
    }

    this.logger.log(`Completed monthly aggregation for ${users.length} users`);
  }

  /**
   * 특정 사용자의 분석 데이터 집계
   */
  private async aggregateForUser(
    userId: string,
    periodType: PeriodType,
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    try {
      // 활동 카운트 조회
      const activityCounts = await this.analyticsRepo.getActivityCounts(
        userId,
        startDate,
        endDate,
      );

      // 카운트를 객체로 변환
      const counts = this.parseActivityCounts(activityCounts);

      // 카테고리별 분포 조회
      const topCategories = await this.analyticsRepo.getCategoryDistribution(
        userId,
        startDate,
        endDate,
      );

      // 상위 프로그램 조회
      const topPrograms = await this.analyticsRepo.getTopPrograms(
        userId,
        startDate,
        endDate,
        5,
      );

      // 전환율 계산
      const conversionRate = this.calculateConversionRate(counts);

      // 요약 저장
      await this.analyticsRepo.upsertSummary({
        userId,
        periodType,
        periodStart: startDate,
        periodEnd: endDate,
        totalSearches: counts.searches,
        totalViews: counts.views,
        totalBookmarks: counts.bookmarks,
        recommendationClicks: counts.recommendationClicks,
        recommendationViews: counts.recommendationViews,
        topCategories,
        topPrograms,
        conversionRate,
      });
    } catch (error) {
      this.logger.error(
        `Failed to aggregate for user ${userId}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * 활동 카운트 파싱
   */
  private parseActivityCounts(
    counts: { activityType: ActivityType; count: number }[],
  ): {
    searches: number;
    views: number;
    bookmarks: number;
    recommendationClicks: number;
    recommendationViews: number;
  } {
    const result = {
      searches: 0,
      views: 0,
      bookmarks: 0,
      recommendationClicks: 0,
      recommendationViews: 0,
    };

    for (const { activityType, count } of counts) {
      switch (activityType) {
        case ActivityType.SEARCH:
          result.searches = Number(count);
          break;
        case ActivityType.VIEW:
          result.views = Number(count);
          break;
        case ActivityType.BOOKMARK:
          result.bookmarks = Number(count);
          break;
        case ActivityType.RECOMMENDATION_CLICK:
          result.recommendationClicks = Number(count);
          break;
        case ActivityType.RECOMMENDATION_VIEW:
          result.recommendationViews = Number(count);
          break;
      }
    }

    return result;
  }

  /**
   * 전환율 계산
   */
  private calculateConversionRate(counts: {
    views: number;
    bookmarks: number;
    recommendationClicks: number;
    recommendationViews: number;
  }): ConversionMetrics {
    const recommendationToView =
      counts.recommendationViews > 0
        ? Math.round((counts.recommendationClicks / counts.recommendationViews) * 1000) / 10
        : 0;

    const viewToBookmark =
      counts.views > 0
        ? Math.round((counts.bookmarks / counts.views) * 1000) / 10
        : 0;

    const recommendationToBookmark =
      counts.recommendationViews > 0
        ? Math.round((counts.bookmarks / counts.recommendationViews) * 1000) / 10
        : 0;

    return {
      recommendationToView,
      viewToBookmark,
      recommendationToBookmark,
    };
  }

  /**
   * 기간 대비 변화율 계산
   */
  async calculateChangeRate(
    userId: string,
    periodType: PeriodType,
    currentStart: Date,
    currentEnd: Date,
  ): Promise<{
    searchesChange: number;
    viewsChange: number;
    bookmarksChange: number;
  }> {
    // 이전 기간 계산
    const periodDays = Math.ceil(
      (currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24),
    );
    const prevStart = subDays(currentStart, periodDays);
    const prevEnd = subDays(currentEnd, periodDays);

    // 이전 기간 데이터 조회
    const prevCounts = await this.analyticsRepo.getActivityCounts(
      userId,
      prevStart,
      prevEnd,
    );
    const prev = this.parseActivityCounts(prevCounts);

    // 현재 기간 데이터 조회
    const currentCounts = await this.analyticsRepo.getActivityCounts(
      userId,
      currentStart,
      currentEnd,
    );
    const current = this.parseActivityCounts(currentCounts);

    // 변화율 계산
    const calcChange = (curr: number, prev: number): number => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 1000) / 10;
    };

    return {
      searchesChange: calcChange(current.searches, prev.searches),
      viewsChange: calcChange(current.views, prev.views),
      bookmarksChange: calcChange(current.bookmarks, prev.bookmarks),
    };
  }
}
