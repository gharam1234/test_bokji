/**
 * 필터 관련 유틸리티 함수
 * 필터 상태 관리, URL 쿼리 변환 등
 */

import type {
  GetFavoritesParams,
  FavoriteCategory,
  FavoriteSortOption,
  SortOrder,
  FilterState,
} from '../types';
import { DEFAULT_SORT } from '../constants';

/**
 * 기본 필터 상태
 */
export const DEFAULT_FILTER_STATE: FilterState = {
  category: 'all',
  sortBy: DEFAULT_SORT.sortBy,
  sortOrder: DEFAULT_SORT.sortOrder,
  search: '',
  showDeadlineOnly: false,
};

/**
 * FilterState를 GetFavoritesParams로 변환
 */
export function filterStateToParams(
  state: FilterState,
  page: number = 1,
  limit: number = 20,
): GetFavoritesParams {
  const params: GetFavoritesParams = {
    page,
    limit,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
  };

  if (state.category !== 'all') {
    params.category = state.category;
  }

  if (state.search.trim()) {
    params.search = state.search.trim();
  }

  if (state.showDeadlineOnly) {
    params.deadlineWithin = 7;
  }

  return params;
}

/**
 * URL 쿼리 파라미터를 GetFavoritesParams로 변환
 */
export function parseQueryParams(
  searchParams: URLSearchParams,
): GetFavoritesParams {
  const params: GetFavoritesParams = {};

  const category = searchParams.get('category');
  if (category && isValidCategory(category)) {
    params.category = category;
  }

  const sortBy = searchParams.get('sortBy');
  if (sortBy && isValidSortOption(sortBy)) {
    params.sortBy = sortBy;
  }

  const sortOrder = searchParams.get('sortOrder');
  if (sortOrder && isValidSortOrder(sortOrder)) {
    params.sortOrder = sortOrder;
  }

  const search = searchParams.get('search');
  if (search) {
    params.search = search;
  }

  const page = searchParams.get('page');
  if (page) {
    const pageNum = parseInt(page, 10);
    if (!isNaN(pageNum) && pageNum > 0) {
      params.page = pageNum;
    }
  }

  const limit = searchParams.get('limit');
  if (limit) {
    const limitNum = parseInt(limit, 10);
    if (!isNaN(limitNum) && limitNum > 0 && limitNum <= 100) {
      params.limit = limitNum;
    }
  }

  const deadlineWithin = searchParams.get('deadlineWithin');
  if (deadlineWithin) {
    const days = parseInt(deadlineWithin, 10);
    if (!isNaN(days) && days > 0) {
      params.deadlineWithin = days;
    }
  }

  return params;
}

/**
 * GetFavoritesParams를 URL 쿼리 문자열로 변환
 */
export function paramsToQueryString(params: GetFavoritesParams): string {
  const searchParams = new URLSearchParams();

  if (params.category) {
    searchParams.set('category', params.category);
  }

  if (params.sortBy && params.sortBy !== DEFAULT_SORT.sortBy) {
    searchParams.set('sortBy', params.sortBy);
  }

  if (params.sortOrder && params.sortOrder !== DEFAULT_SORT.sortOrder) {
    searchParams.set('sortOrder', params.sortOrder);
  }

  if (params.search) {
    searchParams.set('search', params.search);
  }

  if (params.page && params.page > 1) {
    searchParams.set('page', params.page.toString());
  }

  if (params.limit && params.limit !== 20) {
    searchParams.set('limit', params.limit.toString());
  }

  if (params.deadlineWithin) {
    searchParams.set('deadlineWithin', params.deadlineWithin.toString());
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * 유효한 카테고리인지 확인
 */
function isValidCategory(value: string): value is FavoriteCategory {
  const validCategories: FavoriteCategory[] = [
    'employment',
    'housing',
    'education',
    'healthcare',
    'childcare',
    'culture',
    'safety',
    'other',
  ];
  return validCategories.includes(value as FavoriteCategory);
}

/**
 * 유효한 정렬 옵션인지 확인
 */
function isValidSortOption(value: string): value is FavoriteSortOption {
  const validOptions: FavoriteSortOption[] = [
    'bookmarkedAt',
    'deadline',
    'matchScore',
    'programName',
  ];
  return validOptions.includes(value as FavoriteSortOption);
}

/**
 * 유효한 정렬 순서인지 확인
 */
function isValidSortOrder(value: string): value is SortOrder {
  return value === 'asc' || value === 'desc';
}

/**
 * 필터가 활성화되어 있는지 확인
 */
export function hasActiveFilters(state: FilterState): boolean {
  return (
    state.category !== 'all' ||
    state.search.trim() !== '' ||
    state.showDeadlineOnly ||
    state.sortBy !== DEFAULT_SORT.sortBy ||
    state.sortOrder !== DEFAULT_SORT.sortOrder
  );
}

/**
 * 필터 상태 리셋
 */
export function resetFilters(): FilterState {
  return { ...DEFAULT_FILTER_STATE };
}
