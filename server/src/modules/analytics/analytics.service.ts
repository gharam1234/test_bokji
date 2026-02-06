/**
 * Analytics Service
 * 분석 데이터 조회 및 처리 비즈니스 로직
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repository';
import { AggregationService } from './services/aggregation.service';
import { InsightGeneratorService } from './services/insight-generator.service';
import { PDFGeneratorService } from './services/pdf-generator.service';
import { PeriodType } from './entities/user-analytics-summary.entity';
import { ActivityType, ActivityMetadata } from './entities/user-activity-log.entity';
import {
  AnalyticsSummaryResponseDto,
  PeriodInfoDto,
  OverviewStatsDto,
  TrendDataPointDto,
  RecommendationStatsDto,
  CategoryCountDto,
  ActivityTrendResponseDto,
  UserInsightDto,
} from './dto/analytics-summary.dto';
import { PDFReportOptions } from './dto/pdf-report.dto';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subDays,
  format,
  eachDayOfInterval,
} from 'date-fns';
import { ko } from 'date-fns/locale';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly analyticsRepo: AnalyticsRepository,
    private readonly aggregationService: AggregationService,
    private readonly insightGenerator: InsightGeneratorService,
    private readonly pdfGenerator: PDFGeneratorService,
  ) {}

  // ==================== 활동 로그 기록 ====================

  /**
   * 사용자 활동 로그 기록
   */
  async logActivity(
    userId: string,
    activityType: ActivityType,
    targetId?: string,
    targetCategory?: string,
    metadata?: ActivityMetadata,
  ): Promise<void> {
    try {
      await this.analyticsRepo.createActivityLog({
        userId,
        activityType,
        targetId: targetId || null,
        targetCategory: targetCategory || null,
        metadata: metadata || {},
      });

      this.logger.debug(
        `Activity logged: ${activityType} for user ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to log activity: ${error.message}`,
        error.stack,
      );
      // 로깅 실패는 무시 (사용자 경험에 영향 없음)
    }
  }

  // ==================== 분석 요약 조회 ====================

  /**
   * 전체 분석 요약 데이터 조회
   */
  async getSummary(
    userId: string,
    period: 'week' | 'month' | 'quarter' | 'year',
    startDate?: Date,
    endDate?: Date,
  ): Promise<AnalyticsSummaryResponseDto> {
    const { start, end } = this.getPeriodDates(period, startDate, endDate);

    // 병렬로 데이터 조회
    const [
      overview,
      categoryDistribution,
      activityTrend,
      recommendationStats,
      topWelfarePrograms,
      insights,
    ] = await Promise.all([
      this.getOverviewStats(userId, start, end),
      this.getCategoryDistribution(userId, start, end),
      this.getActivityTrend(userId, start, end),
      this.getRecommendationStats(userId, start, end),
      this.analyticsRepo.getTopPrograms(userId, start, end, 5),
      this.getInsights(userId, 5),
    ]);

    return {
      period: this.buildPeriodInfo(period, start, end),
      overview,
      categoryDistribution,
      activityTrend,
      recommendationStats,
      topWelfarePrograms,
      insights,
    };
  }

  /**
   * 개요 통계 조회
   */
  private async getOverviewStats(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<OverviewStatsDto> {
    // 활동 카운트 조회
    const counts = await this.analyticsRepo.getActivityCounts(
      userId,
      startDate,
      endDate,
    );

    // 카운트 파싱
    let totalSearches = 0;
    let totalViews = 0;
    let totalBookmarks = 0;

    for (const { activityType, count } of counts) {
      switch (activityType) {
        case ActivityType.SEARCH:
          totalSearches = Number(count);
          break;
        case ActivityType.VIEW:
          totalViews = Number(count);
          break;
        case ActivityType.BOOKMARK:
          totalBookmarks = Number(count);
          break;
      }
    }

    // 활동 일수 조회
    const activeDays = await this.analyticsRepo.getActiveDays(
      userId,
      startDate,
      endDate,
    );

    // 변화율 계산
    const { searchesChange, viewsChange, bookmarksChange } =
      await this.aggregationService.calculateChangeRate(
        userId,
        PeriodType.MONTHLY,
        startDate,
        endDate,
      );

    return {
      totalSearches,
      totalViews,
      totalBookmarks,
      activeDays,
      searchesChange,
      viewsChange,
      bookmarksChange,
    };
  }

  /**
   * 카테고리별 분포 조회
   */
  async getCategoryDistribution(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CategoryCountDto[]> {
    return this.analyticsRepo.getCategoryDistribution(userId, startDate, endDate);
  }

  /**
   * 활동 트렌드 조회
   */
  async getActivityTrend(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TrendDataPointDto[]> {
    const trend = await this.analyticsRepo.getDailyActivityTrend(
      userId,
      startDate,
      endDate,
    );

    // 날짜 범위의 모든 날짜 생성 (데이터 없는 날도 포함)
    const allDates = eachDayOfInterval({ start: startDate, end: endDate });
    const trendMap = new Map(trend.map((t) => [t.date, t]));

    return allDates.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const existing = trendMap.get(dateStr);

      return {
        date: dateStr,
        searches: existing?.searches || 0,
        views: existing?.views || 0,
        bookmarks: existing?.bookmarks || 0,
      };
    });
  }

  /**
   * 상세 활동 트렌드 조회
   */
  async getActivityTrendDetail(
    userId: string,
    period: 'week' | 'month' | 'quarter' | 'year',
    granularity?: 'day' | 'week' | 'month',
  ): Promise<ActivityTrendResponseDto> {
    const { start, end } = this.getPeriodDates(period);
    const data = await this.getActivityTrend(userId, start, end);

    // 피크 날짜 및 평균 계산
    let peakDay = '';
    let peakActivity = 0;
    let totalActivity = 0;

    for (const point of data) {
      const dayTotal = point.searches + point.views + point.bookmarks;
      totalActivity += dayTotal;

      if (dayTotal > peakActivity) {
        peakActivity = dayTotal;
        peakDay = point.date;
      }
    }

    return {
      period: this.buildPeriodInfo(period, start, end),
      granularity: granularity || 'day',
      data,
      summary: {
        peakDay,
        peakActivity,
        averageDaily: data.length > 0 ? Math.round(totalActivity / data.length) : 0,
      },
    };
  }

  /**
   * 추천 통계 조회
   */
  async getRecommendationStats(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<RecommendationStatsDto> {
    const counts = await this.analyticsRepo.getActivityCounts(
      userId,
      startDate,
      endDate,
    );

    let recommendationViews = 0;
    let recommendationClicks = 0;
    let bookmarks = 0;

    for (const { activityType, count } of counts) {
      switch (activityType) {
        case ActivityType.RECOMMENDATION_VIEW:
          recommendationViews = Number(count);
          break;
        case ActivityType.RECOMMENDATION_CLICK:
          recommendationClicks = Number(count);
          break;
        case ActivityType.BOOKMARK:
          bookmarks = Number(count);
          break;
      }
    }

    const clickRate =
      recommendationViews > 0
        ? Math.round((recommendationClicks / recommendationViews) * 1000) / 10
        : 0;

    const bookmarkRate =
      recommendationClicks > 0
        ? Math.round((bookmarks / recommendationClicks) * 1000) / 10
        : 0;

    // 퍼널 데이터 생성
    const funnel = [
      {
        step: '추천 노출',
        count: recommendationViews,
        percentage: 100,
      },
      {
        step: '클릭',
        count: recommendationClicks,
        percentage: clickRate,
      },
      {
        step: '즐겨찾기',
        count: bookmarks,
        percentage:
          recommendationViews > 0
            ? Math.round((bookmarks / recommendationViews) * 1000) / 10
            : 0,
      },
    ];

    return {
      totalRecommendations: recommendationViews,
      totalClicks: recommendationClicks,
      totalBookmarksFromRecommendation: bookmarks,
      clickRate,
      bookmarkRate,
      funnel,
    };
  }

  // ==================== 인사이트 ====================

  /**
   * 사용자 인사이트 목록 조회
   */
  async getInsights(userId: string, limit?: number): Promise<UserInsightDto[]> {
    const insights = await this.analyticsRepo.findValidInsights(userId, limit);

    return insights.map((insight) => ({
      id: insight.id,
      userId: insight.userId,
      insightType: insight.insightType,
      title: insight.title,
      description: insight.description || '',
      relatedData: insight.relatedData,
      priority: insight.priority,
      isRead: insight.isRead,
      validUntil: insight.validUntil,
      createdAt: insight.createdAt,
    }));
  }

  /**
   * 인사이트 읽음 처리
   */
  async markInsightAsRead(userId: string, insightId: string): Promise<void> {
    await this.analyticsRepo.markInsightAsRead(userId, insightId);
  }

  // ==================== 즐겨찾기 요약 ====================

  /**
   * 즐겨찾기 요약 조회
   */
  async getFavoritesSummary(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalFavorites: number;
    recentlyAdded: Array<{
      programId: string;
      programName: string;
      category: string;
      addedAt: Date;
    }>;
    byCategory: Array<{
      category: string;
      count: number;
      percentage: number;
      items: Array<{
        programId: string;
        programName: string;
        category: string;
        addedAt: Date;
      }>;
    }>;
    addedThisPeriod: number;
    removedThisPeriod: number;
    changeRate: number;
  }> {
    // 즐겨찾기 추가/제거 활동 조회
    const bookmarkLogs = await this.analyticsRepo.findActivityLogs(
      userId,
      startDate,
      endDate,
      ActivityType.BOOKMARK,
    );

    const unbookmarkLogs = await this.analyticsRepo.findActivityLogs(
      userId,
      startDate,
      endDate,
      ActivityType.UNBOOKMARK,
    );

    // 기간 내 추가/제거 수
    const addedThisPeriod = bookmarkLogs.length;
    const removedThisPeriod = unbookmarkLogs.length;

    // 현재 즐겨찾기 목록 조회 (최근 추가 기준)
    const currentFavorites = await this.analyticsRepo.getCurrentFavorites(userId);

    // 총 즐겨찾기 수
    const totalFavorites = currentFavorites.length;

    // 최근 추가된 항목 (최대 5개)
    const recentlyAdded = currentFavorites.slice(0, 5).map((fav) => ({
      programId: fav.targetId,
      programName: fav.metadata?.programName || '알 수 없는 프로그램',
      category: fav.targetCategory || '기타',
      addedAt: fav.createdAt,
    }));

    // 카테고리별 분포 계산
    const categoryMap = new Map<
      string,
      Array<{
        programId: string;
        programName: string;
        category: string;
        addedAt: Date;
      }>
    >();

    for (const fav of currentFavorites) {
      const category = fav.targetCategory || '기타';
      const item = {
        programId: fav.targetId,
        programName: fav.metadata?.programName || '알 수 없는 프로그램',
        category,
        addedAt: fav.createdAt,
      };

      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(item);
    }

    const byCategory = Array.from(categoryMap.entries())
      .map(([category, items]) => ({
        category,
        count: items.length,
        percentage:
          totalFavorites > 0
            ? Math.round((items.length / totalFavorites) * 1000) / 10
            : 0,
        items,
      }))
      .sort((a, b) => b.count - a.count);

    // 변화율 계산 (이전 기간 대비)
    const periodLength = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    const prevEndDate = new Date(startDate.getTime() - 1);

    const prevBookmarkLogs = await this.analyticsRepo.findActivityLogs(
      userId,
      prevStartDate,
      prevEndDate,
      ActivityType.BOOKMARK,
    );

    const prevAdded = prevBookmarkLogs.length;
    const changeRate =
      prevAdded > 0
        ? Math.round(((addedThisPeriod - prevAdded) / prevAdded) * 1000) / 10
        : addedThisPeriod > 0
          ? 100
          : 0;

    return {
      totalFavorites,
      recentlyAdded,
      byCategory,
      addedThisPeriod,
      removedThisPeriod,
      changeRate,
    };
  }

  // ==================== PDF 리포트 ====================

  /**
   * PDF 리포트 생성
   */
  async generatePDFReport(
    userId: string,
    options: Omit<PDFReportOptions, 'userId'>,
  ): Promise<{ buffer: Buffer; filename: string }> {
    // 분석 데이터 조회
    const summary = await this.getSummary(
      userId,
      options.period,
      options.startDate,
      options.endDate,
    );

    // PDF 생성
    const { buffer, metadata } = await this.pdfGenerator.generateReport(summary, {
      ...options,
      userId,
    });

    return {
      buffer,
      filename: metadata.fileName,
    };
  }

  // ==================== 헬퍼 메서드 ====================

  /**
   * 기간 문자열을 날짜 범위로 변환
   */
  private getPeriodDates(
    period: 'week' | 'month' | 'quarter' | 'year',
    customStart?: Date,
    customEnd?: Date,
  ): { start: Date; end: Date } {
    if (customStart && customEnd) {
      return { start: customStart, end: customEnd };
    }

    const now = new Date();

    switch (period) {
      case 'week':
        return {
          start: subDays(now, 7),
          end: now,
        };
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
      case 'quarter':
        return {
          start: startOfQuarter(now),
          end: endOfQuarter(now),
        };
      case 'year':
        return {
          start: startOfYear(now),
          end: endOfYear(now),
        };
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
    }
  }

  /**
   * 기간 정보 DTO 생성
   */
  private buildPeriodInfo(
    period: 'week' | 'month' | 'quarter' | 'year',
    start: Date,
    end: Date,
  ): PeriodInfoDto {
    const periodTypeMap: Record<string, PeriodType> = {
      week: PeriodType.WEEKLY,
      month: PeriodType.MONTHLY,
      quarter: PeriodType.MONTHLY, // 분기는 월간으로 표시
      year: PeriodType.YEARLY,
    };

    let label: string;
    switch (period) {
      case 'week':
        label = '최근 7일';
        break;
      case 'month':
        label = format(start, 'yyyy년 M월', { locale: ko });
        break;
      case 'quarter':
        const quarter = Math.floor(start.getMonth() / 3) + 1;
        label = `${start.getFullYear()}년 ${quarter}분기`;
        break;
      case 'year':
        label = `${start.getFullYear()}년`;
        break;
      default:
        label = format(start, 'yyyy년 M월', { locale: ko });
    }

    return {
      type: periodTypeMap[period],
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
      label,
    };
  }
}
