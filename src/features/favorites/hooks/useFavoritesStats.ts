/**
 * useFavoritesStats Hook
 * 즐겨찾기 통계 조회
 */

import { useQuery } from '@tanstack/react-query';
import { getFavoritesStats, favoritesQueryKeys } from '../api/favoritesApi';
import type { FavoritesStatsResponse, CategoryCount } from '../types';

/**
 * useFavoritesStats Hook 옵션
 */
export interface UseFavoritesStatsOptions {
  /** 자동 조회 활성화 여부 */
  enabled?: boolean;
}

/**
 * useFavoritesStats Hook 반환 타입
 */
export interface UseFavoritesStatsReturn {
  // 데이터
  /** 총 즐겨찾기 수 */
  total: number;
  /** 카테고리별 개수 */
  byCategory: CategoryCount[];
  /** 7일 이내 마감 수 */
  upcomingWithin7Days: number;
  /** 30일 이내 마감 수 */
  upcomingWithin30Days: number;
  /** 평균 매칭 점수 */
  averageMatchScore: number;

  // 상태
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 에러 발생 여부 */
  isError: boolean;
  /** 에러 객체 */
  error: Error | null;

  // 액션
  /** 데이터 새로고침 */
  refetch: () => void;
}

/**
 * 즐겨찾기 통계 조회 Hook
 *
 * @example
 * ```tsx
 * const {
 *   total,
 *   byCategory,
 *   upcomingWithin7Days,
 *   averageMatchScore,
 *   isLoading,
 * } = useFavoritesStats();
 *
 * // 통계 표시
 * console.log(`총 ${total}개의 즐겨찾기`);
 * console.log(`${upcomingWithin7Days}개 마감 임박`);
 * ```
 */
export function useFavoritesStats(
  options: UseFavoritesStatsOptions = {},
): UseFavoritesStatsReturn {
  const { enabled = true } = options;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<FavoritesStatsResponse, Error>({
    queryKey: favoritesQueryKeys.stats(),
    queryFn: getFavoritesStats,
    enabled,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30, // 30분
  });

  return {
    // 데이터
    total: data?.total ?? 0,
    byCategory: data?.byCategory ?? [],
    upcomingWithin7Days: data?.upcomingDeadlines?.within7Days ?? 0,
    upcomingWithin30Days: data?.upcomingDeadlines?.within30Days ?? 0,
    averageMatchScore: data?.averageMatchScore ?? 0,

    // 상태
    isLoading,
    isError,
    error: error || null,

    // 액션
    refetch,
  };
}
