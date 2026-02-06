/**
 * 인사이트 생성 서비스
 * 사용자 활동 기반 개인화 인사이트 생성
 */

import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsRepository } from '../analytics.repository';
import { InsightType } from '../entities/user-insight.entity';
import { PeriodType } from '../entities/user-analytics-summary.entity';
import { addDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

@Injectable()
export class InsightGeneratorService {
  private readonly logger = new Logger(InsightGeneratorService.name);

  constructor(private readonly analyticsRepo: AnalyticsRepository) {}

  /**
   * 사용자별 인사이트 생성
   * @param userId 사용자 ID
   */
  async generateInsights(userId: string): Promise<void> {
    this.logger.log(`Generating insights for user ${userId}`);

    try {
      // 각 유형별 인사이트 생성
      await Promise.all([
        this.generateTopCategoryInsight(userId),
        this.generateActivityIncreaseInsight(userId),
        this.generateBookmarkReminderInsight(userId),
      ]);

      this.logger.log(`Completed insight generation for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to generate insights for user ${userId}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * 최다 관심 카테고리 인사이트 생성
   */
  private async generateTopCategoryInsight(userId: string): Promise<void> {
    const today = new Date();
    const startDate = startOfMonth(today);
    const endDate = endOfMonth(today);

    // 카테고리별 분포 조회
    const categories = await this.analyticsRepo.getCategoryDistribution(
      userId,
      startDate,
      endDate,
    );

    if (categories.length === 0) return;

    const topCategory = categories[0];

    // 기존 유사 인사이트 확인 (중복 방지)
    const existingInsights = await this.analyticsRepo.findValidInsights(userId, 100);
    const hasExisting = existingInsights.some(
      (i) =>
        i.insightType === InsightType.TOP_CATEGORY &&
        i.relatedData.categoryName === topCategory.category,
    );

    if (hasExisting) return;

    await this.analyticsRepo.createInsight({
      userId,
      insightType: InsightType.TOP_CATEGORY,
      title: `${topCategory.category}에 관심이 높으시네요!`,
      description: `이번 달 조회한 복지 중 ${topCategory.percentage}%가 ${topCategory.category} 관련입니다. 새로운 ${topCategory.category} 복지를 확인해보세요.`,
      relatedData: {
        categoryName: topCategory.category,
        percentageChange: topCategory.percentage,
      },
      priority: 8,
      validUntil: addDays(today, 7),
    });
  }

  /**
   * 활동량 증가 인사이트 생성
   */
  private async generateActivityIncreaseInsight(userId: string): Promise<void> {
    const today = new Date();
    const currentStart = startOfMonth(today);
    const currentEnd = endOfMonth(today);

    // 이전 달
    const prevMonth = subMonths(today, 1);
    const prevStart = startOfMonth(prevMonth);
    const prevEnd = endOfMonth(prevMonth);

    // 현재/이전 활동 카운트 조회
    const currentCounts = await this.analyticsRepo.getActivityCounts(
      userId,
      currentStart,
      currentEnd,
    );
    const prevCounts = await this.analyticsRepo.getActivityCounts(
      userId,
      prevStart,
      prevEnd,
    );

    const currentTotal = currentCounts.reduce((sum, c) => sum + Number(c.count), 0);
    const prevTotal = prevCounts.reduce((sum, c) => sum + Number(c.count), 0);

    if (prevTotal === 0 || currentTotal <= prevTotal) return;

    const increaseRate = Math.round(((currentTotal - prevTotal) / prevTotal) * 100);

    if (increaseRate < 20) return; // 20% 이상 증가시에만

    // 기존 인사이트 확인
    const existingInsights = await this.analyticsRepo.findValidInsights(userId, 100);
    const hasExisting = existingInsights.some(
      (i) => i.insightType === InsightType.ACTIVITY_INCREASE,
    );

    if (hasExisting) return;

    await this.analyticsRepo.createInsight({
      userId,
      insightType: InsightType.ACTIVITY_INCREASE,
      title: `활동량이 ${increaseRate}% 증가했어요!`,
      description: `지난 달 대비 복지 탐색 활동이 크게 늘었습니다. 관심 있는 복지를 즐겨찾기에 추가해보세요.`,
      relatedData: {
        percentageChange: increaseRate,
        comparisonPeriod: '지난 달',
      },
      priority: 7,
      validUntil: addDays(today, 14),
    });
  }

  /**
   * 즐겨찾기 리마인더 인사이트 생성
   */
  private async generateBookmarkReminderInsight(userId: string): Promise<void> {
    const today = new Date();
    const startDate = subMonths(today, 1);

    // 최근 즐겨찾기 조회 활동 확인
    const bookmarkLogs = await this.analyticsRepo.findActivityLogs(
      userId,
      startDate,
      today,
    );

    const bookmarks = bookmarkLogs.filter((l) => l.activityType === 'bookmark');

    if (bookmarks.length === 0) return;

    // 최근 조회하지 않은 즐겨찾기가 있는지 확인
    const viewedIds = new Set(
      bookmarkLogs
        .filter((l) => l.activityType === 'view')
        .map((l) => l.targetId),
    );

    const unviewedBookmarks = bookmarks.filter(
      (b) => b.targetId && !viewedIds.has(b.targetId),
    );

    if (unviewedBookmarks.length < 3) return;

    // 기존 인사이트 확인
    const existingInsights = await this.analyticsRepo.findValidInsights(userId, 100);
    const hasExisting = existingInsights.some(
      (i) => i.insightType === InsightType.BOOKMARK_REMINDER,
    );

    if (hasExisting) return;

    await this.analyticsRepo.createInsight({
      userId,
      insightType: InsightType.BOOKMARK_REMINDER,
      title: `즐겨찾기한 복지를 확인해보세요`,
      description: `최근 즐겨찾기에 추가한 ${unviewedBookmarks.length}개의 복지를 아직 자세히 살펴보지 않았어요. 신청 마감일을 놓치지 않도록 확인해보세요.`,
      relatedData: {
        programIds: unviewedBookmarks
          .slice(0, 5)
          .map((b) => b.targetId)
          .filter(Boolean) as string[],
      },
      priority: 9,
      validUntil: addDays(today, 7),
    });
  }

  /**
   * 전체 사용자 인사이트 배치 생성
   */
  async generateInsightsForAllUsers(userIds: string[]): Promise<void> {
    this.logger.log(`Starting batch insight generation for ${userIds.length} users`);

    for (const userId of userIds) {
      await this.generateInsights(userId);
    }

    this.logger.log('Completed batch insight generation');
  }

  /**
   * 만료된 인사이트 정리
   */
  async cleanupExpiredInsights(): Promise<number> {
    const deleted = await this.analyticsRepo.deleteExpiredInsights();
    this.logger.log(`Deleted ${deleted} expired insights`);
    return deleted;
  }
}
