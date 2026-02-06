/**
 * Analytics API 클라이언트
 * 분석 API와 통신하는 클라이언트 함수들
 */

import {
  SummaryQueryParams,
  TrendQueryParams,
  PDFReportQueryParams,
  AnalyticsSummaryResponse,
  ActivityTrendResponse,
  CategoryCount,
  RecommendationStats,
  FavoritesSummaryResponse,
  UserInsight,
} from './analyticsApi.types';

// API 기본 URL (환경변수에서 가져오기)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * API 요청 헬퍼 함수
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // 쿠키 포함
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * 쿼리 스트링 생성 헬퍼
 */
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// ==================== API 함수들 ====================

/**
 * 전체 분석 요약 조회
 * GET /api/analytics/summary
 */
export async function getAnalyticsSummary(
  params: SummaryQueryParams = {},
): Promise<AnalyticsSummaryResponse> {
  const queryString = buildQueryString(params);
  return fetchApi<AnalyticsSummaryResponse>(`/analytics/summary${queryString}`);
}

/**
 * 카테고리별 분포 조회
 * GET /api/analytics/category-distribution
 */
export async function getCategoryDistribution(
  params: SummaryQueryParams = {},
): Promise<CategoryCount[]> {
  const queryString = buildQueryString(params);
  return fetchApi<CategoryCount[]>(
    `/analytics/category-distribution${queryString}`,
  );
}

/**
 * 활동 트렌드 조회
 * GET /api/analytics/activity-trend
 */
export async function getActivityTrend(
  params: TrendQueryParams = {},
): Promise<ActivityTrendResponse> {
  const queryString = buildQueryString(params);
  return fetchApi<ActivityTrendResponse>(
    `/analytics/activity-trend${queryString}`,
  );
}

/**
 * 추천 통계 조회
 * GET /api/analytics/recommendation-stats
 */
export async function getRecommendationStats(
  params: SummaryQueryParams = {},
): Promise<RecommendationStats> {
  const queryString = buildQueryString(params);
  return fetchApi<RecommendationStats>(
    `/analytics/recommendation-stats${queryString}`,
  );
}

/**
 * 즐겨찾기 요약 조회
 * GET /api/analytics/favorites-summary
 */
export async function getFavoritesSummary(
  params: SummaryQueryParams = {},
): Promise<FavoritesSummaryResponse> {
  const queryString = buildQueryString(params);
  return fetchApi<FavoritesSummaryResponse>(
    `/analytics/favorites-summary${queryString}`,
  );
}

/**
 * 인사이트 목록 조회
 * GET /api/analytics/insights
 */
export async function getInsights(limit?: number): Promise<UserInsight[]> {
  const queryString = limit ? `?limit=${limit}` : '';
  return fetchApi<UserInsight[]>(`/analytics/insights${queryString}`);
}

/**
 * 인사이트 읽음 처리
 * PATCH /api/analytics/insights/:id/read
 */
export async function markInsightAsRead(insightId: string): Promise<void> {
  await fetchApi<void>(`/analytics/insights/${insightId}/read`, {
    method: 'PATCH',
  });
}

/**
 * PDF 리포트 다운로드
 * GET /api/analytics/report/pdf
 */
export async function downloadPDFReport(
  params: PDFReportQueryParams = {},
): Promise<Blob> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}/analytics/report/pdf${queryString}`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`PDF 다운로드 실패: ${response.status}`);
  }

  return response.blob();
}

/**
 * PDF 다운로드 및 저장 헬퍼
 */
export async function downloadAndSavePDF(
  params: PDFReportQueryParams = {},
): Promise<void> {
  const blob = await downloadPDFReport(params);

  // 파일명 생성
  const period = params.period || 'month';
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `welfare-analytics-${period}-${timestamp}.pdf`;

  // 다운로드 트리거
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// ==================== Analytics API 객체 ====================

export const analyticsApi = {
  getSummary: getAnalyticsSummary,
  getCategoryDistribution,
  getActivityTrend,
  getRecommendationStats,
  getFavoritesSummary,
  getInsights,
  markInsightAsRead,
  downloadPDFReport,
  downloadAndSavePDF,
};

export default analyticsApi;
