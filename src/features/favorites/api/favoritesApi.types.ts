/**
 * 즐겨찾기 API 타입 정의
 * API 요청/응답 관련 타입
 */

// 기본 타입 재내보내기
export type {
  GetFavoritesParams,
  GetFavoritesResponse,
  BulkDeleteRequest,
  BulkDeleteResult,
  FavoritesStatsResponse,
  Favorite,
  PaginationInfo,
  FavoritesMeta,
  CategoryCount,
} from '../types';

/**
 * API 에러 응답
 */
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

/**
 * API 응답 래퍼 (성공/실패 구분용)
 */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };
