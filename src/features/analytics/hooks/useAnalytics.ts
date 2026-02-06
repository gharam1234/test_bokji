/**
 * useAnalytics 훅
 * 분석 데이터 조회 및 상태 관리
 */

import { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../api';
import {
  AnalyticsSummaryResponse,
  PeriodInfo,
  PeriodFilter,
} from '../types';

/** useAnalytics 옵션 */
export interface UseAnalyticsOptions {
  /** 조회 기간 (기본: month) */
  period?: PeriodFilter;
  /** 자동 새로고침 여부 */
  autoRefresh?: boolean;
  /** 새로고침 간격 (ms) */
  refreshInterval?: number;
  /** 컴포넌트 마운트시 자동 fetch 여부 */
  fetchOnMount?: boolean;
}

/** useAnalytics 반환 타입 */
export interface UseAnalyticsReturn {
  /** 분석 요약 데이터 */
  summary: AnalyticsSummaryResponse | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 객체 */
  error: Error | null;
  /** 데이터 다시 가져오기 */
  refetch: () => Promise<void>;
  /** 기간 변경 */
  changePeriod: (period: PeriodFilter) => void;
  /** 현재 기간 정보 */
  currentPeriod: PeriodInfo | null;
}

/**
 * 분석 데이터를 조회하고 관리하는 커스텀 훅
 *
 * @example
 * ```tsx
 * const { summary, isLoading, error, changePeriod } = useAnalytics({
 *   period: 'month',
 *   autoRefresh: true,
 *   refreshInterval: 60000,
 * });
 * ```
 */
export function useAnalytics(
  options: UseAnalyticsOptions = {},
): UseAnalyticsReturn {
  const {
    period: initialPeriod = 'month',
    autoRefresh = false,
    refreshInterval = 60000,
    fetchOnMount = true,
  } = options;

  // 상태
  const [summary, setSummary] = useState<AnalyticsSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [period, setPeriod] = useState<PeriodFilter>(initialPeriod);

  /**
   * 데이터 가져오기
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await analyticsApi.getSummary({ period });
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('데이터 로드 실패'));
      console.error('Analytics fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  /**
   * 데이터 다시 가져오기
   */
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  /**
   * 기간 변경
   */
  const changePeriod = useCallback((newPeriod: PeriodFilter) => {
    setPeriod(newPeriod);
  }, []);

  // 마운트시 데이터 로드
  useEffect(() => {
    if (fetchOnMount) {
      fetchData();
    }
  }, [fetchData, fetchOnMount]);

  // 기간 변경시 데이터 다시 로드
  useEffect(() => {
    if (!fetchOnMount) return;
    fetchData();
  }, [period]); // eslint-disable-line react-hooks/exhaustive-deps

  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    summary,
    isLoading,
    error,
    refetch,
    changePeriod,
    currentPeriod: summary?.period || null,
  };
}

export default useAnalytics;
