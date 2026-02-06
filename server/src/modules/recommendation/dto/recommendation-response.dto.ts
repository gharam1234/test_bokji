/**
 * 추천 응답 DTO
 */

import { WelfareCategory, CATEGORY_LABELS } from '../entities/welfare-program.entity';
import { MatchReason } from '../entities/recommendation.entity';

/** 추천 아이템 (목록용) */
export interface RecommendationItemDto {
  id: string;
  programId: string;
  name: string;
  summary: string;
  category: WelfareCategory;
  categoryLabel: string;
  matchScore: number;
  matchReasons: MatchReason[];
  benefits: string;
  benefitAmount?: string | null;
  deadline?: string | null;
  isBookmarked: boolean;
  tags: string[];
}

/** 카테고리별 개수 */
export interface CategoryCountDto {
  category: WelfareCategory;
  label: string;
  count: number;
}

/** 추천 목록 응답 */
export interface RecommendationListResponseDto {
  recommendations: RecommendationItemDto[];
  totalCount: number;
  categories: CategoryCountDto[];
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * 카테고리 카운트 생성 헬퍼
 */
export function createCategoryCount(
  category: WelfareCategory,
  count: number,
): CategoryCountDto {
  return {
    category,
    label: CATEGORY_LABELS[category],
    count,
  };
}
