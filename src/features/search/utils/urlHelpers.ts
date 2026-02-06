/**
 * URL 상태 관리 유틸리티
 */

import type { SearchParams, SearchFilters, SearchSortOption, WelfareCategory } from '../types';
import { DEFAULT_SEARCH_PARAMS } from '../types';
import { getDefaultSortOrder } from '../constants';

/**
 * URL 쿼리 파라미터 키
 */
export const URL_PARAM_KEYS = {
  keyword: 'q',
  category: 'category',
  region: 'region',
  sortBy: 'sortBy',
  sortOrder: 'sortOrder',
  page: 'page',
} as const;

/**
 * URL에서 검색 파라미터 파싱
 */
export function parseSearchParamsFromUrl(searchParams: URLSearchParams): SearchParams {
  const params: SearchParams = { ...DEFAULT_SEARCH_PARAMS };

  const keyword = searchParams.get(URL_PARAM_KEYS.keyword);
  if (keyword) {
    params.keyword = keyword;
  }

  const category = searchParams.get(URL_PARAM_KEYS.category) as WelfareCategory | null;
  if (category) {
    params.category = category;
  }

  const region = searchParams.get(URL_PARAM_KEYS.region);
  if (region && region !== 'all') {
    params.region = region;
  }

  const sortBy = searchParams.get(URL_PARAM_KEYS.sortBy) as SearchSortOption | null;
  if (sortBy) {
    params.sortBy = sortBy;
    params.sortOrder = getDefaultSortOrder(sortBy);
  }

  const sortOrder = searchParams.get(URL_PARAM_KEYS.sortOrder) as 'asc' | 'desc' | null;
  if (sortOrder === 'asc' || sortOrder === 'desc') {
    params.sortOrder = sortOrder;
  }

  const page = searchParams.get(URL_PARAM_KEYS.page);
  if (page) {
    const pageNum = parseInt(page, 10);
    if (!isNaN(pageNum) && pageNum > 0) {
      params.page = pageNum;
    }
  }

  return params;
}

/**
 * 검색 파라미터를 URL 쿼리 스트링으로 변환
 */
export function buildSearchQueryString(params: SearchParams): string {
  const searchParams = new URLSearchParams();

  if (params.keyword) {
    searchParams.set(URL_PARAM_KEYS.keyword, params.keyword);
  }

  if (params.category) {
    searchParams.set(URL_PARAM_KEYS.category, params.category);
  }

  if (params.region && params.region !== 'all') {
    searchParams.set(URL_PARAM_KEYS.region, params.region);
  }

  if (params.sortBy && params.sortBy !== 'relevance') {
    searchParams.set(URL_PARAM_KEYS.sortBy, params.sortBy);
  }

  if (params.sortOrder) {
    const defaultOrder = getDefaultSortOrder(params.sortBy || 'relevance');
    if (params.sortOrder !== defaultOrder) {
      searchParams.set(URL_PARAM_KEYS.sortOrder, params.sortOrder);
    }
  }

  if (params.page && params.page > 1) {
    searchParams.set(URL_PARAM_KEYS.page, String(params.page));
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * 검색 파라미터를 검색 필터로 변환
 */
export function paramsToFilters(params: SearchParams): SearchFilters {
  return {
    category: params.category || 'all',
    region: params.region || 'all',
    sortBy: params.sortBy || 'relevance',
    sortOrder: params.sortOrder || 'desc',
  };
}

/**
 * 검색 필터를 검색 파라미터로 변환
 */
export function filtersToParams(
  filters: SearchFilters,
  keyword?: string,
  page?: number,
): SearchParams {
  return {
    keyword,
    category: filters.category !== 'all' ? filters.category : undefined,
    region: filters.region !== 'all' ? filters.region : undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: page || 1,
    limit: DEFAULT_SEARCH_PARAMS.limit,
  };
}

/**
 * 검색 결과 공유 URL 생성
 */
export function createShareUrl(params: SearchParams): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const queryString = buildSearchQueryString(params);
  return `${baseUrl}/search${queryString}`;
}

/**
 * URL 파라미터 비교 (변경 여부 확인)
 */
export function areParamsEqual(a: SearchParams, b: SearchParams): boolean {
  return (
    a.keyword === b.keyword &&
    a.category === b.category &&
    a.region === b.region &&
    a.sortBy === b.sortBy &&
    a.sortOrder === b.sortOrder &&
    a.page === b.page
  );
}
