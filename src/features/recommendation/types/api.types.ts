/**
 * API 타입 정의
 */

import {
  WelfareCategory,
  SortOption,
  RecommendationItem,
  CategoryCount,
} from './recommendation.types';
import { WelfareDetailResponse } from './welfare.types';

// ==================== 요청 ====================

/** 추천 목록 조회 요청 */
export interface GetRecommendationsRequest {
  category?: WelfareCategory;
  sortBy?: SortOption;
  page?: number;
  limit?: number;
}

// ==================== 응답 ====================

/** 추천 목록 응답 */
export interface GetRecommendationsResponse {
  recommendations: RecommendationItem[];
  totalCount: number;
  categories: CategoryCount[];
  page: number;
  limit: number;
  hasMore: boolean;
}

/** 추천 새로고침 응답 */
export interface RefreshRecommendationsResponse {
  success: boolean;
  updatedCount: number;
  message: string;
}

/** 조회 기록 응답 */
export interface ViewRecordResponse {
  success: boolean;
  viewedAt: string;
}

/** 북마크 토글 응답 */
export interface BookmarkToggleResponse {
  isBookmarked: boolean;
}

// Re-export
export type { WelfareDetailResponse };
