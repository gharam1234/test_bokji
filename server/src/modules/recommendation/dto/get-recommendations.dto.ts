/**
 * 추천 요청 DTO
 */

import { WelfareCategory, SortOption } from '../entities';

/** 추천 목록 조회 요청 */
export interface GetRecommendationsDto {
  /** 카테고리 필터 */
  category?: WelfareCategory;
  
  /** 정렬 기준 (기본: match_score) */
  sortBy?: SortOption;
  
  /** 페이지 번호 (기본: 1) */
  page?: number;
  
  /** 페이지당 개수 (기본: 20) */
  limit?: number;
}

/** 요청 파라미터 검증 및 기본값 설정 */
export function normalizeGetRecommendationsDto(
  dto: GetRecommendationsDto,
): Required<Omit<GetRecommendationsDto, 'category'>> & { category?: WelfareCategory } {
  return {
    category: dto.category,
    sortBy: dto.sortBy || SortOption.MATCH_SCORE,
    page: Math.max(1, dto.page || 1),
    limit: Math.min(100, Math.max(1, dto.limit || 20)),
  };
}
