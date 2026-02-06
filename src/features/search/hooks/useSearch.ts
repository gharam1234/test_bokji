/**
 * useSearch Hook
 * 복지 프로그램 검색 메인 로직
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams as useRouterSearchParams, useNavigate } from 'react-router-dom';
import { searchWelfarePrograms, searchQueryKeys } from '../api/searchApi';
import type {
  SearchParams,
  SearchResponse,
  WelfareProgram,
  PaginationInfo,
  SearchMeta,
  SearchSortOption,
  WelfareCategory,
} from '../types';
import { DEFAULT_SEARCH_PARAMS } from '../types';
import {
  parseSearchParamsFromUrl,
  buildSearchQueryString,
} from '../utils/urlHelpers';

/**
 * useSearch 옵션
 */
export interface UseSearchOptions {
  initialParams?: SearchParams;
  syncWithUrl?: boolean;
}

/**
 * useSearch 반환 타입
 */
export interface UseSearchReturn {
  // 데이터
  results: WelfareProgram[];
  pagination: PaginationInfo;
  meta: SearchMeta;

  // 상태
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;

  // 검색 파라미터
  params: SearchParams;
  setKeyword: (keyword: string) => void;
  setCategory: (category: WelfareCategory | 'all') => void;
  setRegion: (region: string) => void;
  setSortBy: (sortBy: SearchSortOption) => void;
  setParams: (params: Partial<SearchParams>) => void;
  resetParams: () => void;

  // 페이지네이션
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  // 액션
  search: (keyword?: string) => void;
  refetch: () => void;
}

/**
 * 기본 응답
 */
const DEFAULT_RESPONSE: SearchResponse = {
  results: [],
  pagination: {
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  meta: {
    keyword: '',
    appliedFilters: {
      sortBy: 'relevance',
      sortOrder: 'desc',
    },
    searchTime: 0,
  },
};

/**
 * useSearch Hook
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const { syncWithUrl = true } = options;

  const navigate = useNavigate();
  const [routerSearchParams] = useRouterSearchParams();

  // URL에서 초기 파라미터 파싱
  const initialParams = useMemo(() => {
    if (syncWithUrl) {
      return parseSearchParamsFromUrl(routerSearchParams);
    }
    return options.initialParams || DEFAULT_SEARCH_PARAMS;
  }, [syncWithUrl, routerSearchParams, options.initialParams]);

  // 검색 파라미터 상태
  const [params, setParamsState] = useState<SearchParams>(initialParams);

  // URL 파라미터 변경 시 상태 동기화
  useEffect(() => {
    if (syncWithUrl) {
      const urlParams = parseSearchParamsFromUrl(routerSearchParams);
      setParamsState(urlParams);
    }
  }, [syncWithUrl, routerSearchParams]);

  // URL 업데이트 함수
  const updateUrl = useCallback(
    (newParams: SearchParams) => {
      if (syncWithUrl) {
        const queryString = buildSearchQueryString(newParams);
        navigate(`/search${queryString}`, { replace: true });
      }
    },
    [syncWithUrl, navigate],
  );

  // React Query로 검색 실행
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: searchQueryKeys.search(params),
    queryFn: () => searchWelfarePrograms(params),
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
  });

  // 파라미터 업데이트 함수
  const setParams = useCallback(
    (newParams: Partial<SearchParams>) => {
      setParamsState((prev) => {
        const updated = { ...prev, ...newParams };
        // 필터 변경 시 페이지를 1로 리셋
        if (
          newParams.keyword !== undefined ||
          newParams.category !== undefined ||
          newParams.region !== undefined ||
          newParams.sortBy !== undefined
        ) {
          updated.page = 1;
        }
        updateUrl(updated);
        return updated;
      });
    },
    [updateUrl],
  );

  // 키워드 설정
  const setKeyword = useCallback(
    (keyword: string) => {
      setParams({ keyword });
    },
    [setParams],
  );

  // 카테고리 설정
  const setCategory = useCallback(
    (category: WelfareCategory | 'all') => {
      setParams({
        category: category === 'all' ? undefined : category,
      });
    },
    [setParams],
  );

  // 지역 설정
  const setRegion = useCallback(
    (region: string) => {
      setParams({
        region: region === 'all' ? undefined : region,
      });
    },
    [setParams],
  );

  // 정렬 설정
  const setSortBy = useCallback(
    (sortBy: SearchSortOption) => {
      setParams({ sortBy });
    },
    [setParams],
  );

  // 파라미터 초기화
  const resetParams = useCallback(() => {
    const resetted = { ...DEFAULT_SEARCH_PARAMS };
    setParamsState(resetted);
    updateUrl(resetted);
  }, [updateUrl]);

  // 페이지 이동
  const goToPage = useCallback(
    (page: number) => {
      setParams({ page });
    },
    [setParams],
  );

  // 다음 페이지
  const nextPage = useCallback(() => {
    const pagination = data?.pagination || DEFAULT_RESPONSE.pagination;
    if (pagination.hasNext) {
      goToPage(pagination.page + 1);
    }
  }, [data?.pagination, goToPage]);

  // 이전 페이지
  const prevPage = useCallback(() => {
    const pagination = data?.pagination || DEFAULT_RESPONSE.pagination;
    if (pagination.hasPrev) {
      goToPage(pagination.page - 1);
    }
  }, [data?.pagination, goToPage]);

  // 검색 실행
  const search = useCallback(
    (keyword?: string) => {
      if (keyword !== undefined) {
        setKeyword(keyword);
      } else {
        refetch();
      }
    },
    [setKeyword, refetch],
  );

  return {
    // 데이터
    results: data?.results || DEFAULT_RESPONSE.results,
    pagination: data?.pagination || DEFAULT_RESPONSE.pagination,
    meta: data?.meta || DEFAULT_RESPONSE.meta,

    // 상태
    isLoading,
    isFetching,
    isError,
    error: error as Error | null,

    // 검색 파라미터
    params,
    setKeyword,
    setCategory,
    setRegion,
    setSortBy,
    setParams,
    resetParams,

    // 페이지네이션
    goToPage,
    nextPage,
    prevPage,

    // 액션
    search,
    refetch,
  };
}
