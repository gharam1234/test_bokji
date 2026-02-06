/**
 * 상수 - 정렬 옵션
 */

import { SortOption } from '../types';

/** 정렬 옵션 목록 */
export const SORT_OPTIONS = [
  { value: SortOption.MATCH_SCORE, label: '매칭률순' },
  { value: SortOption.LATEST, label: '최신순' },
  { value: SortOption.DEADLINE, label: '마감임박순' },
  { value: SortOption.POPULARITY, label: '인기순' },
] as const;
