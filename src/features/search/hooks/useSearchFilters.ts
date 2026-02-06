/**
 * useSearchFilters Hook
 * 검색 필터 옵션 관리
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFilterOptions, searchQueryKeys } from '../api/searchApi';
import type { CategoryOption, RegionOption, WelfareCategory } from '../types';
import { WELFARE_CATEGORIES, getCategoryLabel } from '../constants/categories';
import { SIDO_LIST, getRegionName } from '../constants/regions';

/**
 * useSearchFilters 반환 타입
 */
export interface UseSearchFiltersReturn {
  // 필터 옵션
  categories: CategoryOption[];
  regions: RegionOption[];

  // 상태
  isLoading: boolean;
  isError: boolean;

  // 유틸리티
  getCategoryLabel: (value: WelfareCategory | 'all') => string;
  getRegionName: (code: string) => string;
  getSigunguList: (sidoCode: string) => RegionOption[];
}

/**
 * useSearchFilters Hook
 */
export function useSearchFilters(): UseSearchFiltersReturn {
  // 필터 옵션 조회
  const { data, isLoading, isError } = useQuery({
    queryKey: searchQueryKeys.filters(),
    queryFn: getFilterOptions,
    staleTime: 1000 * 60 * 30, // 30분
    gcTime: 1000 * 60 * 60, // 1시간
  });

  // 카테고리 옵션 (API 데이터 또는 기본값)
  const categories = useMemo<CategoryOption[]>(() => {
    if (data?.categories?.length) {
      return data.categories;
    }
    
    // 기본 카테고리 목록
    return Object.entries(WELFARE_CATEGORIES).map(([key, info]) => ({
      value: key as WelfareCategory,
      label: info.label,
      count: 0,
    }));
  }, [data?.categories]);

  // 지역 옵션 (API 데이터 또는 기본값)
  const regions = useMemo<RegionOption[]>(() => {
    if (data?.regions?.length) {
      return data.regions;
    }
    return SIDO_LIST;
  }, [data?.regions]);

  // 시군구 목록 조회
  const getSigunguList = (sidoCode: string): RegionOption[] => {
    return regions.filter(
      (r) => r.type === 'sigungu' && r.parentCode === sidoCode,
    );
  };

  return {
    categories,
    regions,
    isLoading,
    isError,
    getCategoryLabel,
    getRegionName,
    getSigunguList,
  };
}
