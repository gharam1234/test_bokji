/**
 * 검색 API 클라이언트
 * 검색 API와 통신하는 클라이언트 함수들
 */

import type {
  SearchParams,
  SearchResponse,
  FilterOptionsResponse,
  SuggestionsResponse,
  WelfareProgram,
} from '../types';

// API 기본 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * API 요청 헬퍼 함수
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * 쿼리 스트링 생성 헬퍼
 */
function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// ==================== API 함수들 ====================

/**
 * 복지 프로그램 검색
 * GET /api/public-welfare/search (공공데이터 API)
 */
export async function searchWelfarePrograms(
  params: SearchParams = {},
): Promise<SearchResponse> {
  const queryString = buildQueryString(params);
  const startedAt = Date.now();
  const raw = await fetchApi<
    | SearchResponse
    | {
        programs?: WelfareProgram[];
        pagination?: {
          totalCount?: number;
          page?: number;
          limit?: number;
          totalPages?: number;
        };
        error?: string;
      }
  >(`/public-welfare/search${queryString}`);

  const searchTime = Date.now() - startedAt;

  // 이미 SearchResponse 형태인 경우에도 pagination 보정
  if ('results' in raw) {
    const pagination = normalizePagination(raw.pagination, params);
    return {
      results: raw.results || [],
      pagination,
      meta: raw.meta || buildMeta(params, searchTime),
    };
  }

  const programs = Array.isArray(raw.programs) ? raw.programs : [];
  const pagination = normalizePagination(raw.pagination, params, programs.length);

  return {
    results: programs,
    pagination,
    meta: buildMeta(params, searchTime),
  };
}

function normalizePagination(
  pagination: {
    totalCount?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  } | undefined,
  params: SearchParams,
  fallbackTotalCount = 0,
): SearchResponse['pagination'] {
  const page = pagination?.page ?? params.page ?? 1;
  const limit = pagination?.limit ?? params.limit ?? 20;
  const totalCount = pagination?.totalCount ?? fallbackTotalCount;
  const totalPages =
    pagination?.totalPages ??
    (limit > 0 ? Math.ceil(totalCount / limit) : 0);
  const hasPrev = pagination?.hasPrev ?? page > 1;
  const hasNext = pagination?.hasNext ?? (totalPages > 0 ? page < totalPages : false);

  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasNext,
    hasPrev,
  };
}

function buildMeta(params: SearchParams, searchTime: number): SearchResponse['meta'] {
  return {
    keyword: params.keyword || '',
    appliedFilters: {
      sortBy: params.sortBy || 'relevance',
      sortOrder: params.sortOrder || 'desc',
      ...(params.category ? { category: params.category } : {}),
    },
    searchTime,
  };
}

/**
 * 필터 옵션 조회
 * GET /api/search/filters
 */
export async function getFilterOptions(): Promise<FilterOptionsResponse> {
  return fetchApi<FilterOptionsResponse>('/search/filters');
}

/**
 * 검색어 자동완성
 * GET /api/search/suggestions
 */
export async function getSuggestions(keyword: string): Promise<SuggestionsResponse> {
  if (!keyword || keyword.length < 2) {
    return { suggestions: [] };
  }
  
  const queryString = buildQueryString({ keyword });
  return fetchApi<SuggestionsResponse>(`/search/suggestions${queryString}`);
}

/**
 * 프로그램 조회수 증가
 * GET /api/search/programs/:id/view
 */
export async function incrementViewCount(programId: string): Promise<void> {
  await fetchApi<void>(`/search/programs/${programId}/view`);
}

// ==================== Query Keys ====================

/**
 * React Query 키 생성
 */
export const searchQueryKeys = {
  all: ['search'] as const,
  search: (params: SearchParams) => [...searchQueryKeys.all, 'results', params] as const,
  filters: () => [...searchQueryKeys.all, 'filters'] as const,
  suggestions: (keyword: string) => [...searchQueryKeys.all, 'suggestions', keyword] as const,
};
