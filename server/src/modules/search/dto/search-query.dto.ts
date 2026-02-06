/**
 * 검색 요청 DTO
 * GET /api/search 쿼리 파라미터 검증
 */

import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * 복지 카테고리 타입
 */
export type WelfareCategory =
  | 'employment'   // 취업·창업
  | 'housing'      // 주거·금융
  | 'education'    // 교육
  | 'healthcare'   // 건강·의료
  | 'childcare'    // 임신·육아
  | 'culture'      // 문화·생활
  | 'safety'       // 안전·환경
  | 'other';       // 기타

export const WELFARE_CATEGORIES: WelfareCategory[] = [
  'employment',
  'housing',
  'education',
  'healthcare',
  'childcare',
  'culture',
  'safety',
  'other',
];

/**
 * 정렬 옵션 타입
 */
export type SearchSortOption =
  | 'relevance'    // 관련도순 (기본)
  | 'deadline'     // 마감일순
  | 'latest'       // 최신순
  | 'popular';     // 인기순 (조회수)

export const SEARCH_SORT_OPTIONS: SearchSortOption[] = [
  'relevance',
  'deadline',
  'latest',
  'popular',
];

/**
 * 정렬 순서 타입
 */
export type SortOrder = 'asc' | 'desc';

/**
 * 검색 쿼리 DTO
 */
export class SearchQueryDto {
  /**
   * 검색어 (프로그램명, 설명, 기관명)
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  keyword?: string;

  /**
   * 카테고리 필터
   */
  @IsOptional()
  @IsString()
  category?: WelfareCategory;

  /**
   * 지역 코드 필터
   */
  @IsOptional()
  @IsString()
  @MaxLength(10)
  region?: string;

  /**
   * 정렬 기준
   * @default 'relevance'
   */
  @IsOptional()
  @IsString()
  sortBy?: SearchSortOption;

  /**
   * 정렬 순서
   * @default 'desc'
   */
  @IsOptional()
  @IsString()
  sortOrder?: SortOrder;

  /**
   * 페이지 번호 (1부터 시작)
   * @default 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  /**
   * 페이지 크기
   * @default 20
   * @max 100
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

/**
 * 검색 파라미터 정규화 (기본값 적용)
 */
export interface NormalizedSearchParams {
  keyword: string;
  category: WelfareCategory | null;
  region: string | null;
  sortBy: SearchSortOption;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}

/**
 * 검색 DTO 정규화 함수
 */
export function normalizeSearchQueryDto(dto: SearchQueryDto): NormalizedSearchParams {
  return {
    keyword: dto.keyword || '',
    category: dto.category && WELFARE_CATEGORIES.includes(dto.category) ? dto.category : null,
    region: dto.region || null,
    sortBy: dto.sortBy && SEARCH_SORT_OPTIONS.includes(dto.sortBy) ? dto.sortBy : 'relevance',
    sortOrder: dto.sortOrder === 'asc' ? 'asc' : 'desc',
    page: dto.page && dto.page > 0 ? dto.page : 1,
    limit: dto.limit && dto.limit > 0 ? Math.min(dto.limit, 100) : 20,
  };
}
