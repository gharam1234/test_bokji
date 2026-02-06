/**
 * 즐겨찾기 응답 DTO
 * API 응답 타입 정의
 */

import { FavoriteCategory } from './get-favorites.dto';

/**
 * 매칭 영향도
 */
export type MatchImpact = 'high' | 'medium' | 'low';

/**
 * 매칭 사유
 */
export interface MatchReasonDto {
  /** 필드명 */
  field: string;
  /** 설명 */
  description: string;
  /** 영향도 */
  impact: MatchImpact;
}

/**
 * 즐겨찾기 아이템 (조회용)
 */
export interface FavoriteDto {
  /** 추천 ID (즐겨찾기 ID) */
  id: string;
  /** 복지 프로그램 ID */
  programId: string;
  /** 프로그램명 */
  programName: string;
  /** 프로그램 요약 */
  programSummary: string;
  /** 카테고리 */
  category: FavoriteCategory;
  /** 매칭 점수 (0-100) */
  matchScore: number;
  /** 매칭 사유 목록 */
  matchReasons: MatchReasonDto[];
  /** 신청 마감일 (ISO 날짜 문자열) */
  deadline: string | null;
  /** 즐겨찾기 추가 시간 (ISO 문자열) */
  bookmarkedAt: string;
  /** 마감일까지 남은 일수 (null: 마감일 없음) */
  daysUntilDeadline: number | null;
  /** 마감 임박 여부 (7일 이내) */
  isDeadlineNear: boolean;
}

/**
 * 페이지네이션 정보
 */
export interface PaginationDto {
  /** 현재 페이지 */
  page: number;
  /** 페이지 크기 */
  limit: number;
  /** 총 아이템 수 */
  totalCount: number;
  /** 총 페이지 수 */
  totalPages: number;
  /** 다음 페이지 존재 여부 */
  hasNext: boolean;
  /** 이전 페이지 존재 여부 */
  hasPrev: boolean;
}

/**
 * 카테고리별 개수
 */
export interface CategoryCountDto {
  /** 카테고리 코드 */
  category: FavoriteCategory;
  /** 개수 */
  count: number;
  /** 카테고리 라벨 */
  label: string;
}

/**
 * 즐겨찾기 목록 메타 정보
 */
export interface FavoritesMetaDto {
  /** 카테고리별 개수 */
  categories: CategoryCountDto[];
  /** 7일 이내 마감 수 */
  upcomingDeadlines: number;
}

/**
 * 즐겨찾기 목록 응답 DTO
 */
export interface GetFavoritesResponseDto {
  /** 즐겨찾기 목록 */
  favorites: FavoriteDto[];
  /** 페이지네이션 정보 */
  pagination: PaginationDto;
  /** 메타 정보 */
  meta: FavoritesMetaDto;
}

/**
 * 즐겨찾기 통계 응답 DTO
 */
export interface FavoritesStatsResponseDto {
  /** 총 즐겨찾기 수 */
  total: number;
  /** 카테고리별 개수 */
  byCategory: CategoryCountDto[];
  /** 마감 임박 통계 */
  upcomingDeadlines: {
    /** 7일 이내 마감 */
    within7Days: number;
    /** 30일 이내 마감 */
    within30Days: number;
  };
  /** 평균 매칭 점수 */
  averageMatchScore: number;
}

/**
 * 카테고리 라벨 매핑
 */
export const CATEGORY_LABELS: Record<FavoriteCategory, string> = {
  [FavoriteCategory.EMPLOYMENT]: '취업·창업',
  [FavoriteCategory.HOUSING]: '주거·금융',
  [FavoriteCategory.EDUCATION]: '교육',
  [FavoriteCategory.HEALTHCARE]: '건강·의료',
  [FavoriteCategory.CHILDCARE]: '임신·육아',
  [FavoriteCategory.CULTURE]: '문화·생활',
  [FavoriteCategory.SAFETY]: '안전·환경',
  [FavoriteCategory.OTHER]: '기타',
};

/**
 * 카테고리 라벨 조회 유틸리티
 */
export function getCategoryLabel(category: FavoriteCategory): string {
  return CATEGORY_LABELS[category] || '기타';
}
