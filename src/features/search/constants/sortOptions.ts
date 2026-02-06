/**
 * 정렬 옵션 상수 정의
 */

import type { SearchSortOption } from '../types';

/**
 * 정렬 옵션 정보
 */
export interface SortOptionInfo {
  label: string;
  defaultOrder: 'asc' | 'desc';
}

/**
 * 정렬 옵션 맵
 */
export const SORT_OPTIONS: Record<SearchSortOption, SortOptionInfo> = {
  relevance: { label: '관련도순', defaultOrder: 'desc' },
  deadline: { label: '마감일순', defaultOrder: 'asc' },
  latest: { label: '최신순', defaultOrder: 'desc' },
  popular: { label: '인기순', defaultOrder: 'desc' },
};

/**
 * 정렬 옵션 목록 (순서 유지)
 */
export const SORT_OPTION_LIST: SearchSortOption[] = [
  'relevance',
  'deadline',
  'latest',
  'popular',
];

/**
 * 정렬 옵션 라벨 조회
 */
export function getSortOptionLabel(sortBy: SearchSortOption): string {
  return SORT_OPTIONS[sortBy]?.label || '관련도순';
}

/**
 * 정렬 옵션 기본 순서 조회
 */
export function getDefaultSortOrder(sortBy: SearchSortOption): 'asc' | 'desc' {
  return SORT_OPTIONS[sortBy]?.defaultOrder || 'desc';
}
