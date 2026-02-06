/**
 * 분석 요약 DTO
 * 클라이언트에 반환되는 분석 데이터 형식
 */

import { IsEnum, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PeriodType } from '../entities/user-analytics-summary.entity';
import { InsightType } from '../entities/user-insight.entity';

// ==================== 공통 타입 ====================

/** 기간 정보 DTO */
export class PeriodInfoDto {
  type: PeriodType;
  startDate: string;
  endDate: string;
  label: string;
}

/** 카테고리별 카운트 DTO */
export class CategoryCountDto {
  category: string;
  count: number;
  percentage: number;
}

/** 프로그램별 카운트 DTO */
export class ProgramCountDto {
  programId: string;
  programName: string;
  category: string;
  viewCount: number;
}

// ==================== 요약 응답 DTO ====================

/** 개요 통계 DTO */
export class OverviewStatsDto {
  totalSearches: number;
  totalViews: number;
  totalBookmarks: number;
  activeDays: number;
  searchesChange: number;
  viewsChange: number;
  bookmarksChange: number;
}

/** 트렌드 데이터 포인트 DTO */
export class TrendDataPointDto {
  date: string;
  searches: number;
  views: number;
  bookmarks: number;
}

/** 퍼널 단계 DTO */
export class FunnelStepDto {
  step: string;
  count: number;
  percentage: number;
}

/** 추천 통계 DTO */
export class RecommendationStatsDto {
  totalRecommendations: number;
  totalClicks: number;
  totalBookmarksFromRecommendation: number;
  clickRate: number;
  bookmarkRate: number;
  funnel: FunnelStepDto[];
}

/** 인사이트 관련 데이터 DTO */
export class InsightRelatedDataDto {
  categoryName?: string;
  programIds?: string[];
  percentageChange?: number;
  comparisonPeriod?: string;
}

/** 사용자 인사이트 DTO */
export class UserInsightDto {
  id: string;
  userId: string;
  insightType: InsightType;
  title: string;
  description: string;
  relatedData: InsightRelatedDataDto;
  priority: number;
  isRead: boolean;
  validUntil: Date;
  createdAt: Date;
}

/** 분석 요약 응답 DTO */
export class AnalyticsSummaryResponseDto {
  period: PeriodInfoDto;
  overview: OverviewStatsDto;
  categoryDistribution: CategoryCountDto[];
  activityTrend: TrendDataPointDto[];
  recommendationStats: RecommendationStatsDto;
  topWelfarePrograms: ProgramCountDto[];
  insights: UserInsightDto[];
}

// ==================== 즐겨찾기 요약 DTO ====================

/** 즐겨찾기 항목 DTO */
export class FavoriteItemDto {
  programId: string;
  programName: string;
  category: string;
  addedAt: Date;
}

/** 카테고리별 즐겨찾기 DTO */
export class FavoritesByCategoryDto {
  category: string;
  count: number;
  percentage: number;
  items: FavoriteItemDto[];
}

/** 즐겨찾기 요약 응답 DTO */
export class FavoritesSummaryResponseDto {
  /** 총 즐겨찾기 수 */
  totalFavorites: number;
  /** 최근 추가된 즐겨찾기 (최대 5개) */
  recentlyAdded: FavoriteItemDto[];
  /** 카테고리별 즐겨찾기 분포 */
  byCategory: FavoritesByCategoryDto[];
  /** 이번 기간 추가된 즐겨찾기 수 */
  addedThisPeriod: number;
  /** 이번 기간 제거된 즐겨찾기 수 */
  removedThisPeriod: number;
  /** 전 기간 대비 변화율 */
  changeRate: number;
}

// ==================== 요청 DTO ====================

/** 요약 조회 요청 파라미터 */
export class SummaryQueryDto {
  @IsEnum(['week', 'month', 'quarter', 'year'])
  @IsOptional()
  period?: 'week' | 'month' | 'quarter' | 'year' = 'month';

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

/** 트렌드 조회 요청 파라미터 */
export class TrendQueryDto extends SummaryQueryDto {
  @IsEnum(['day', 'week', 'month'])
  @IsOptional()
  granularity?: 'day' | 'week' | 'month';
}

/** 활동 트렌드 응답 DTO */
export class ActivityTrendResponseDto {
  period: PeriodInfoDto;
  granularity: string;
  data: TrendDataPointDto[];
  summary: {
    peakDay: string;
    peakActivity: number;
    averageDaily: number;
  };
}
