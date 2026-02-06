/**
 * 읽지 않은 알림 개수 훅
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { getUnreadCount } from '../api/notificationApi';

/**
 * 읽지 않은 개수 쿼리 키
 */
export const unreadCountQueryKey = ['unreadCount'] as const;

/**
 * 읽지 않은 알림 개수 훅 옵션
 */
export interface UseUnreadCountOptions {
  /** 자동 새로고침 활성화 */
  autoRefresh?: boolean;
  /** 새로고침 간격 (밀리초) */
  refreshInterval?: number;
}

/**
 * 읽지 않은 알림 개수 훅 반환 타입
 */
export interface UseUnreadCountReturn {
  /** 읽지 않은 개수 */
  count: number;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 */
  error: Error | null;
  /** 새로고침 */
  refresh: () => void;
  /** 개수 증가 (낙관적 업데이트) */
  incrementCount: () => void;
  /** 개수 감소 (낙관적 업데이트) */
  decrementCount: (amount?: number) => void;
  /** 개수 초기화 (낙관적 업데이트) */
  resetCount: () => void;
}

/**
 * 읽지 않은 알림 개수 훅
 */
export function useUnreadCount(
  options: UseUnreadCountOptions = {},
): UseUnreadCountReturn {
  const queryClient = useQueryClient();
  const { autoRefresh = true, refreshInterval = 60000 } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: unreadCountQueryKey,
    queryFn: async () => {
      const response = await getUnreadCount();
      return response.count;
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 30000, // 30초 동안 데이터 유지
  });

  // 낙관적 업데이트 - 개수 증가
  const incrementCount = useCallback(() => {
    queryClient.setQueryData<number>(unreadCountQueryKey, (old) => (old ?? 0) + 1);
  }, [queryClient]);

  // 낙관적 업데이트 - 개수 감소
  const decrementCount = useCallback(
    (amount = 1) => {
      queryClient.setQueryData<number>(unreadCountQueryKey, (old) =>
        Math.max((old ?? 0) - amount, 0),
      );
    },
    [queryClient],
  );

  // 낙관적 업데이트 - 개수 초기화
  const resetCount = useCallback(() => {
    queryClient.setQueryData<number>(unreadCountQueryKey, 0);
  }, [queryClient]);

  return {
    count: data ?? 0,
    isLoading,
    error: error as Error | null,
    refresh: refetch,
    incrementCount,
    decrementCount,
    resetCount,
  };
}
