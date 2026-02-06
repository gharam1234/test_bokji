/**
 * Analytics Feature - 도메인 타입 정의
 * 분석 리포트 기능에서 사용되는 모든 타입 정의
 */

// ==================== Enums ====================

/** 사용자 활동 유형 */
export enum ActivityType {
  SEARCH = 'search',           // 검색
  VIEW = 'view',               // 복지 상세 조회
  BOOKMARK = 'bookmark',       // 즐겨찾기 추가
  UNBOOKMARK = 'unbookmark',   // 즐겨찾기 제거
  RECOMMENDATION_CLICK = 'recommendation_click', // 추천 복지 클릭
  RECOMMENDATION_VIEW = 'recommendation_view',   // 추천 목록 조회
}

/** 집계 기간 유형 */
export enum PeriodType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

/** 인사이트 유형 */
export enum InsightType {
  TOP_CATEGORY = 'top_category',           // 최다 관심 카테고리
  ACTIVITY_INCREASE = 'activity_increase', // 활동량 증가
  NEW_RECOMMENDATION = 'new_recommendation', // 새로운 추천
  BOOKMARK_REMINDER = 'bookmark_reminder', // 즐겨찾기 알림
  UNUSED_BENEFIT = 'unused_benefit',       // 미활용 혜택
}

// ==================== Entity Types ====================

/** 활동 메타데이터 */
export interface ActivityMetadata {
  searchQuery?: string;        // 검색어
  filters?: Record<string, string>; // 적용된 필터
  source?: 'search' | 'recommendation' | 'direct'; // 유입 경로
  sessionId?: string;          // 세션 ID
}

/** 사용자 활동 로그 */
export interface UserActivityLog {
  id: string;                  // UUID
  userId: string;              // 사용자 ID (FK)
  activityType: ActivityType;  // 활동 유형
  targetId: string;            // 대상 복지 프로그램 ID
  targetCategory: string;      // 대상 카테고리
  metadata: ActivityMetadata;  // 추가 정보
  createdAt: Date;             // 생성 시간
}

/** 카테고리별 카운트 */
export interface CategoryCount {
  category: string;
  count: number;
  percentage: number;
}

/** 프로그램별 카운트 */
export interface ProgramCount {
  programId: string;
  programName: string;
  category: string;
  viewCount: number;
}

/** 전환율 메트릭 */
export interface ConversionMetrics {
  recommendationToView: number;    // 추천 → 조회 전환율
  viewToBookmark: number;          // 조회 → 즐겨찾기 전환율
  recommendationToBookmark: number; // 추천 → 즐겨찾기 전환율
}

/** 사용자 분석 요약 (집계 테이블) */
export interface UserAnalyticsSummary {
  id: string;
  userId: string;
  periodType: PeriodType;
  periodStart: Date;
  periodEnd: Date;
  totalSearches: number;
  totalViews: number;
  totalBookmarks: number;
  recommendationClicks: number;
  recommendationViews: number;
  topCategories: CategoryCount[];
  topPrograms: ProgramCount[];
  conversionRate: ConversionMetrics;
  createdAt: Date;
  updatedAt: Date;
}

/** 인사이트 관련 데이터 */
export interface InsightRelatedData {
  categoryName?: string;
  programIds?: string[];
  percentageChange?: number;
  comparisonPeriod?: string;
}

/** 사용자 인사이트 */
export interface UserInsight {
  id: string;
  userId: string;
  insightType: InsightType;
  title: string;
  description: string;
  relatedData: InsightRelatedData;
  priority: number;            // 표시 우선순위 (1-10)
  isRead: boolean;
  validUntil: Date;
  createdAt: Date;
}

// ==================== DTO Types ====================

/** 기간 정보 */
export interface PeriodInfo {
  type: PeriodType;
  startDate: string;
  endDate: string;
  label: string; // "최근 7일", "2026년 1월" 등
}

/** 개요 통계 */
export interface OverviewStats {
  totalSearches: number;
  totalViews: number;
  totalBookmarks: number;
  activeDays: number;
  searchesChange: number;      // 전 기간 대비 변화율 (%)
  viewsChange: number;
  bookmarksChange: number;
}

/** 트렌드 데이터 포인트 */
export interface TrendDataPoint {
  date: string;
  searches: number;
  views: number;
  bookmarks: number;
}

/** 퍼널 단계 */
export interface FunnelStep {
  step: string;
  count: number;
  percentage: number;
}

/** 추천 통계 */
export interface RecommendationStats {
  totalRecommendations: number;
  totalClicks: number;
  totalBookmarksFromRecommendation: number;
  clickRate: number;           // 클릭률 (%)
  bookmarkRate: number;        // 즐겨찾기 전환율 (%)
  funnel: FunnelStep[];
}

/** 분석 요약 응답 */
export interface AnalyticsSummaryResponse {
  period: PeriodInfo;
  overview: OverviewStats;
  categoryDistribution: CategoryCount[];
  activityTrend: TrendDataPoint[];
  recommendationStats: RecommendationStats;
  topWelfarePrograms: ProgramCount[];
  insights: UserInsight[];
}

/** PDF 리포트 요청 */
export interface PDFReportRequest {
  periodType: PeriodType;
  startDate?: string;
  endDate?: string;
  includeInsights: boolean;
  includeCharts: boolean;
}

/** 기간 필터 옵션 */
export type PeriodFilter = 'week' | 'month' | 'quarter' | 'year';
