/**
 * 즐겨찾기 API 함수
 * 즐겨찾기 관련 HTTP 요청 함수
 */

import type {
  GetFavoritesParams,
  GetFavoritesResponse,
  BulkDeleteRequest,
  BulkDeleteResult,
  FavoritesStatsResponse,
} from './favoritesApi.types';

/**
 * API 기본 URL
 */
const API_BASE_URL = '/api/favorites';

/**
 * 공통 fetch 옵션
 */
const defaultOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // 인증 쿠키 포함
};

/**
 * API 에러 처리
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '요청 처리 중 오류가 발생했습니다.',
    }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  // 204 No Content의 경우 본문이 없음
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * 쿼리 파라미터 생성
 */
function buildQueryString(params: GetFavoritesParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// ============================================
// API 함수
// ============================================

/**
 * 즐겨찾기 목록 조회
 * GET /api/favorites
 *
 * @param params 조회 파라미터 (카테고리, 정렬, 페이지 등)
 * @returns 즐겨찾기 목록, 페이지네이션, 메타 정보
 */
export async function getFavorites(
  params: GetFavoritesParams = {},
): Promise<GetFavoritesResponse> {
  const queryString = buildQueryString(params);
  const response = await fetch(`${API_BASE_URL}${queryString}`, {
    ...defaultOptions,
    method: 'GET',
  });

  return handleResponse<GetFavoritesResponse>(response);
}

/**
 * 즐겨찾기 통계 조회
 * GET /api/favorites/stats
 *
 * @returns 즐겨찾기 통계 (총 개수, 카테고리별, 마감 임박 등)
 */
export async function getFavoritesStats(): Promise<FavoritesStatsResponse> {
  const response = await fetch(`${API_BASE_URL}/stats`, {
    ...defaultOptions,
    method: 'GET',
  });

  return handleResponse<FavoritesStatsResponse>(response);
}

/**
 * 즐겨찾기 해제 (개별)
 * DELETE /api/favorites/:id
 *
 * @param id 즐겨찾기 ID
 */
export async function removeFavorite(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    ...defaultOptions,
    method: 'DELETE',
  });

  return handleResponse<void>(response);
}

/**
 * 즐겨찾기 일괄 해제
 * DELETE /api/favorites/bulk
 *
 * @param request 삭제할 ID 배열
 * @returns 삭제 결과 (삭제된 개수, 실패한 ID 목록)
 */
export async function bulkRemoveFavorites(
  request: BulkDeleteRequest,
): Promise<BulkDeleteResult> {
  const response = await fetch(`${API_BASE_URL}/bulk`, {
    ...defaultOptions,
    method: 'DELETE',
    body: JSON.stringify(request),
  });

  return handleResponse<BulkDeleteResult>(response);
}

// ============================================
// React Query 키 팩토리
// ============================================

/**
 * React Query 쿼리 키
 */
export const favoritesQueryKeys = {
  /** 모든 즐겨찾기 관련 키 */
  all: ['favorites'] as const,

  /** 즐겨찾기 목록 키 */
  lists: () => [...favoritesQueryKeys.all, 'list'] as const,

  /** 특정 파라미터의 즐겨찾기 목록 키 */
  list: (params: GetFavoritesParams) =>
    [...favoritesQueryKeys.lists(), params] as const,

  /** 즐겨찾기 통계 키 */
  stats: () => [...favoritesQueryKeys.all, 'stats'] as const,
};
