/**
 * 프로그램 목록 훅
 * 프로그램 목록 조회, 필터링, 페이지네이션
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { WelfareProgram, ProgramListParams, PaginationMeta } from '../types';
import { getPrograms } from '../api/programApi';

/** 기본 파라미터 */
const DEFAULT_PARAMS: ProgramListParams = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  includeDeleted: false,
};

/** usePrograms 옵션 */
export interface UseProgramsOptions {
  initialParams?: Partial<ProgramListParams>;
  enabled?: boolean;
}

/** usePrograms 반환 타입 */
export interface UseProgramsReturn {
  programs: WelfareProgram[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  params: ProgramListParams;
  setParams: (params: Partial<ProgramListParams>) => void;
  resetParams: () => void;
  refetch: () => void;
}

/**
 * 프로그램 목록 훅
 */
export function usePrograms(options: UseProgramsOptions = {}): UseProgramsReturn {
  const { initialParams = {}, enabled = true } = options;
  
  const [params, setParamsState] = useState<ProgramListParams>({
    ...DEFAULT_PARAMS,
    ...initialParams,
  });

  // 쿼리 키 생성 (파라미터 변경 시 자동 재조회)
  const queryKey = useMemo(
    () => ['admin', 'programs', params],
    [params]
  );

  // 프로그램 목록 조회
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn: () => getPrograms(params),
    enabled,
    staleTime: 30 * 1000, // 30초
    gcTime: 5 * 60 * 1000, // 5분 (이전 cacheTime)
  });

  /**
   * 파라미터 업데이트
   */
  const setParams = useCallback((newParams: Partial<ProgramListParams>) => {
    setParamsState((prev) => {
      // 필터 변경 시 페이지 초기화
      const shouldResetPage =
        newParams.search !== undefined ||
        newParams.category !== undefined ||
        newParams.targetGroup !== undefined ||
        newParams.isActive !== undefined ||
        newParams.includeDeleted !== undefined;

      return {
        ...prev,
        ...newParams,
        page: shouldResetPage ? 1 : newParams.page ?? prev.page,
      };
    });
  }, []);

  /**
   * 파라미터 초기화
   */
  const resetParams = useCallback(() => {
    setParamsState({ ...DEFAULT_PARAMS, ...initialParams });
  }, [initialParams]);

  return {
    programs: data?.data ?? [],
    meta: data?.meta ?? null,
    isLoading,
    isFetching,
    error: error as Error | null,
    params,
    setParams,
    resetParams,
    refetch,
  };
}
