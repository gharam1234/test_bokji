/**
 * 즐겨찾기 조회 요청 DTO
 * GET /api/favorites 요청 파라미터
 */

import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * 즐겨찾기 카테고리
 */
export enum FavoriteCategory {
  EMPLOYMENT = 'employment',     // 취업·창업
  HOUSING = 'housing',           // 주거·금융
  EDUCATION = 'education',       // 교육
  HEALTHCARE = 'healthcare',     // 건강·의료
  CHILDCARE = 'childcare',       // 임신·육아
  CULTURE = 'culture',           // 문화·생활
  SAFETY = 'safety',             // 안전·환경
  OTHER = 'other',               // 기타
}

/**
 * 정렬 옵션
 */
export enum FavoriteSortOption {
  BOOKMARKED_AT = 'bookmarkedAt',   // 저장일순 (기본)
  DEADLINE = 'deadline',             // 마감일순
  MATCH_SCORE = 'matchScore',        // 매칭률순
  PROGRAM_NAME = 'programName',      // 이름순
}

/**
 * 정렬 순서
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * 즐겨찾기 목록 조회 DTO
 */
export class GetFavoritesDto {
  /**
   * 카테고리 필터
   */
  @IsOptional()
  @IsEnum(FavoriteCategory, { message: '유효하지 않은 카테고리입니다.' })
  category?: FavoriteCategory;

  /**
   * 정렬 기준
   * @default 'bookmarkedAt'
   */
  @IsOptional()
  @IsEnum(FavoriteSortOption, { message: '유효하지 않은 정렬 옵션입니다.' })
  sortBy?: FavoriteSortOption = FavoriteSortOption.BOOKMARKED_AT;

  /**
   * 정렬 순서
   * @default 'desc'
   */
  @IsOptional()
  @IsEnum(SortOrder, { message: '유효하지 않은 정렬 순서입니다.' })
  sortOrder?: SortOrder = SortOrder.DESC;

  /**
   * 검색어 (프로그램명)
   */
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  /**
   * 페이지 번호
   * @default 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: '페이지 번호는 1 이상이어야 합니다.' })
  page?: number = 1;

  /**
   * 페이지 크기
   * @default 20
   * @max 100
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: '페이지 크기는 1 이상이어야 합니다.' })
  @Max(100, { message: '페이지 크기는 100 이하여야 합니다.' })
  limit?: number = 20;

  /**
   * N일 이내 마감 필터
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: '마감일 필터는 1 이상이어야 합니다.' })
  deadlineWithin?: number;
}
