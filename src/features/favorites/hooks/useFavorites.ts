/**
 * useFavorites Hook
 * 즐겨찾기 목록 조회 및 삭제 기능
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFavorites,
  removeFavorite,
  favoritesQueryKeys,
} from '../api/favoritesApi';
import type {
  GetFavoritesParams,
  GetFavoritesResponse,
  Favorite,
  PaginationInfo,
  FavoritesMeta,
} from '../types';

/**
 * useFavorites Hook 옵션
 */
export interface UseFavoritesOptions {
  /** 초기 조회 파라미터 */
  initialParams?: GetFavoritesParams;
  /** 자동 조회 활성화 여부 */
  enabled?: boolean;
}

/**
 * useFavorites Hook 반환 타입
 */
export interface UseFavoritesReturn {
  // 데이터
  /** 즐겨찾기 목록 */
  favorites: Favorite[];
  /** 페이지네이션 정보 */
  pagination: PaginationInfo | null;
  /** 메타 정보 (카테고리별 개수, 마감 임박 수) */
  meta: FavoritesMeta | null;

  // 상태
  /** 초기 로딩 중 여부 */
  isLoading: boolean;
  /** 데이터 갱신 중 여부 (백그라운드 refetch 포함) */
  isFetching: boolean;
  /** 에러 발생 여부 */
  isError: boolean;
  /** 에러 객체 */
  error: Error | null;

  // 조회 파라미터
  /** 현재 조회 파라미터 */
  params: GetFavoritesParams;
  /** 조회 파라미터 업데이트 */
  setParams: (params: Partial<GetFavoritesParams>) => void;
  /** 조회 파라미터 리셋 */
  resetParams: () => void;

  // 페이지네이션
  /** 특정 페이지로 이동 */
  goToPage: (page: number) => void;
  /** 다음 페이지로 이동 */
  nextPage: () => void;
  /** 이전 페이지로 이동 */
  prevPage: () => void;

  // 액션
  /** 데이터 새로고침 */
  refetch: () => void;
  /** 개별 즐겨찾기 삭제 */
  removeFavorite: (id: string) => Promise<void>;
  /** 삭제 진행 중 여부 */
  isRemoving: boolean;
}

/**
 * 기본 조회 파라미터
 */
const DEFAULT_PARAMS: GetFavoritesParams = {
  page: 1,
  limit: 20,
  sortBy: 'bookmarkedAt',
  sortOrder: 'desc',
};

/**
 * 즐겨찾기 조회 및 관리 Hook
 *
 * @example
 * ```tsx
 * const {
 *   favorites,
 *   isLoading,
 *   setParams,
 *   removeFavorite,
 * } = useFavorites();
 *
 * // 카테고리 필터 적용
 * setParams({ category: 'housing' });
 *
 * // 즐겨찾기 삭제
 * await removeFavorite('fav-123');
 * ```
 */
export function useFavorites(
  options: UseFavoritesOptions = {},
): UseFavoritesReturn {
  const { initialParams = {}, enabled = true } = options;

  const queryClient = useQueryClient();

  // 조회 파라미터 상태
  const [params, setParamsState] = useState<GetFavoritesParams>({
    ...DEFAULT_PARAMS,
    ...initialParams,
  });

  // 즐겨찾기 목록 조회 쿼리
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<GetFavoritesResponse, Error>({
    queryKey: favoritesQueryKeys.list(params),
    queryFn: () => getFavorites(params),
    enabled,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30, // 30분
  });

  // 개별 삭제 뮤테이션
  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: favoritesQueryKeys.lists(),
      });
      // 통계 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: favoritesQueryKeys.stats(),
      });
    },
  });

  // 파라미터 업데이트
  const setParams = useCallback((newParams: Partial<GetFavoritesParams>) => {
    setParamsState((prev) => {
      const updated = { ...prev, ...newParams };
      // 필터 변경 시 페이지 리셋 (페이지만 변경하는 경우 제외)
      if (!('page' in newParams)) {
        updated.page = 1;
      }
      return updated;
    });
  }, []);

  // 파라미터 리셋
  const resetParams = useCallback(() => {
    setParamsState({ ...DEFAULT_PARAMS, ...initialParams });
  }, [initialParams]);

  // 페이지 이동
  const goToPage = useCallback((page: number) => {
    setParamsState((prev) => ({ ...prev, page }));
  }, []);

  const nextPage = useCallback(() => {
    if (data?.pagination.hasNext) {
      setParamsState((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
    }
  }, [data?.pagination.hasNext]);

  const prevPage = useCallback(() => {
    if (data?.pagination.hasPrev) {
      setParamsState((prev) => ({
        ...prev,
        page: Math.max(1, (prev.page || 1) - 1),
      }));
    }
  }, [data?.pagination.hasPrev]);

  // 개별 삭제
  const handleRemoveFavorite = useCallback(
    async (id: string) => {
      await removeMutation.mutateAsync(id);
    },
    [removeMutation],
  );

  // 메모이제이션된 반환값
  const favorites = useMemo(() => data?.favorites || [], [data?.favorites]);
  const pagination = useMemo(() => data?.pagination || null, [data?.pagination]);
  const meta = useMemo(() => data?.meta || null, [data?.meta]);

  return {
    // 데이터
    favorites,
    pagination,
    meta,

    // 상태
    isLoading,
    isFetching,
    isError,
    error: error || null,

    // 조회 파라미터
    params,
    setParams,
    resetParams,

    // 페이지네이션
    goToPage,
    nextPage,
    prevPage,

    // 액션
    refetch,
    removeFavorite: handleRemoveFavorite,
    isRemoving: removeMutation.isPending,
  };
}
