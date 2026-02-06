/**
 * 정렬 옵션 설정
 * 즐겨찾기 목록 정렬 관련 상수
 */

import type { FavoriteSortOption, SortOrder } from '../types';

/**
 * 정렬 옵션 설정 타입
 */
export interface SortOptionConfig {
  /** 정렬 옵션 라벨 */
  label: string;
  /** 기본 정렬 순서 */
  defaultOrder: SortOrder;
  /** 설명 */
  description: string;
}

/**
 * 정렬 옵션별 설정
 */
export const SORT_OPTIONS: Record<FavoriteSortOption, SortOptionConfig> = {
  bookmarkedAt: {
    label: '저장일순',
    defaultOrder: 'desc',
    description: '최근 저장한 순서대로 정렬',
  },
  deadline: {
    label: '마감일순',
    defaultOrder: 'asc',
    description: '마감일이 가까운 순서대로 정렬',
  },
  matchScore: {
    label: '매칭률순',
    defaultOrder: 'desc',
    description: '매칭 점수가 높은 순서대로 정렬',
  },
  programName: {
    label: '이름순',
    defaultOrder: 'asc',
    description: '프로그램 이름 가나다순 정렬',
  },
};

/**
 * 정렬 옵션 목록 (UI 표시용)
 */
export const SORT_OPTION_LIST: Array<{
  value: FavoriteSortOption;
  label: string;
}> = [
  { value: 'bookmarkedAt', label: '저장일순' },
  { value: 'deadline', label: '마감일순' },
  { value: 'matchScore', label: '매칭률순' },
  { value: 'programName', label: '이름순' },
];

/**
 * 정렬 순서 라벨
 */
export const SORT_ORDER_LABELS: Record<SortOrder, string> = {
  asc: '오름차순',
  desc: '내림차순',
};

/**
 * 기본 정렬 설정
 */
export const DEFAULT_SORT: {
  sortBy: FavoriteSortOption;
  sortOrder: SortOrder;
} = {
  sortBy: 'bookmarkedAt',
  sortOrder: 'desc',
};

/**
 * 정렬 옵션 라벨 조회
 */
export function getSortOptionLabel(sortBy: FavoriteSortOption): string {
  return SORT_OPTIONS[sortBy]?.label || '저장일순';
}

/**
 * 정렬 옵션의 기본 순서 조회
 */
export function getDefaultSortOrder(sortBy: FavoriteSortOption): SortOrder {
  return SORT_OPTIONS[sortBy]?.defaultOrder || 'desc';
}
