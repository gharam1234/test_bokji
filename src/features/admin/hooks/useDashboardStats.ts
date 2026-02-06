/**
 * 대시보드 통계 훅
 * 통계 데이터 조회
 */

import { useQuery } from '@tanstack/react-query';
import type { DashboardStats } from '../types';
import { getDashboardStats, getProgramStats } from '../api/statsApi';

/**
 * 대시보드 통계 훅
 */
export function useDashboardStats() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'stats', 'overview'],
    queryFn: getDashboardStats,
    staleTime: 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
  });

  return {
    stats: data ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * 프로그램 통계 훅
 */
export function useProgramStats() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'stats', 'programs'],
    queryFn: getProgramStats,
    staleTime: 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
  });

  return {
    stats: data ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
