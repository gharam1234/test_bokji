/**
 * Analytics API 타입 정의
 * API 요청/응답에 사용되는 타입
 */

import {
  AnalyticsSummaryResponse,
  CategoryCount,
  TrendDataPoint,
  RecommendationStats,
  ProgramCount,
  UserInsight,
  PeriodInfo,
  PeriodFilter,
  PeriodType,
} from '../types';

// ==================== 요청 파라미터 ====================

/** 분석 요약 조회 파라미터 */
export interface SummaryQueryParams {
  period?: PeriodFilter;
  startDate?: string;
  endDate?: string;
}

/** 활동 트렌드 조회 파라미터 */
export interface TrendQueryParams extends SummaryQueryParams {
  granularity?: 'day' | 'week' | 'month';
}

/** PDF 리포트 조회 파라미터 */
export interface PDFReportQueryParams {
  period?: PeriodFilter;
  startDate?: string;
  endDate?: string;
  includeInsights?: boolean;
  includeCharts?: boolean;
  language?: 'ko' | 'en';
}

// ==================== 응답 타입 ====================

/** 활동 트렌드 응답 */
export interface ActivityTrendResponse {
  period: PeriodInfo;
  granularity: string;
  data: TrendDataPoint[];
  summary: {
    peakDay: string;
    peakActivity: number;
    averageDaily: number;
  };
}

/** 즐겨찾기 항목 */
export interface FavoriteItem {
  programId: string;
  programName: string;
  category: string;
  addedAt: string;
}

/** 카테고리별 즐겨찾기 */
export interface FavoritesByCategory {
  category: string;
  count: number;
  percentage: number;
  items: FavoriteItem[];
}

/** 즐겨찾기 요약 응답 */
export interface FavoritesSummaryResponse {
  /** 총 즐겨찾기 수 */
  totalFavorites: number;
  /** 최근 추가된 즐겨찾기 (최대 5개) */
  recentlyAdded: FavoriteItem[];
  /** 카테고리별 즐겨찾기 분포 */
  byCategory: FavoritesByCategory[];
  /** 이번 기간 추가된 즐겨찾기 수 */
  addedThisPeriod: number;
  /** 이번 기간 제거된 즐겨찾기 수 */
  removedThisPeriod: number;
  /** 전 기간 대비 변화율 */
  changeRate: number;
}

// Re-export 필요한 타입들
export type {
  AnalyticsSummaryResponse,
  CategoryCount,
  TrendDataPoint,
  RecommendationStats,
  ProgramCount,
  UserInsight,
  PeriodInfo,
  PeriodFilter,
  PeriodType,
};
