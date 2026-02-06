/**
 * 알림 목록 훅
 * 알림 목록 조회 및 관리 기능
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotifications,
  deleteSingleNotification,
  deleteAllNotifications,
} from '../api/notificationApi';
import {
  NotificationItem,
  GetNotificationsParams,
  NotificationType,
} from '../types/notification.types';
import { DEFAULT_PAGE_SIZE } from '../constants/notification.constants';

/**
 * 알림 목록 훅 옵션
 */
export interface UseNotificationsOptions {
  /** 알림 유형 필터 */
  type?: NotificationType;
  /** 읽음 상태 필터 */
  isRead?: boolean;
  /** 페이지당 개수 */
  limit?: number;
  /** 자동 새로고침 활성화 */
  autoRefresh?: boolean;
  /** 새로고침 간격 (밀리초) */
  refreshInterval?: number;
}

/**
 * 알림 목록 훅 반환 타입
 */
export interface UseNotificationsReturn {
  /** 알림 목록 */
  notifications: NotificationItem[];
  /** 전체 개수 */
  totalCount: number;
  /** 읽지 않은 개수 */
  unreadCount: number;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 */
  error: Error | null;
  /** 다음 페이지 존재 여부 */
  hasMore: boolean;
  /** 다음 페이지 로드 중 여부 */
  isFetchingNextPage: boolean;
  /** 다음 페이지 로드 */
  fetchNextPage: () => void;
  /** 목록 새로고침 */
  refresh: () => void;
  /** 읽음 처리 */
  markAsRead: (notificationIds: string[]) => Promise<void>;
  /** 전체 읽음 처리 */
  markAllAsRead: () => Promise<void>;
  /** 삭제 */
  deleteNotification: (notificationId: string) => Promise<void>;
  /** 전체 삭제 */
  deleteAllNotifications: () => Promise<void>;
}

/**
 * 알림 목록 쿼리 키
 */
export const notificationsQueryKey = (params?: GetNotificationsParams) =>
  ['notifications', params] as const;

/**
 * 알림 목록 훅
 */
export function useNotifications(
  options: UseNotificationsOptions = {},
): UseNotificationsReturn {
  const queryClient = useQueryClient();
  const { type, isRead, limit = DEFAULT_PAGE_SIZE, autoRefresh = false, refreshInterval = 60000 } = options;

  // 무한 스크롤 쿼리
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage: fetchNext,
    refetch,
  } = useInfiniteQuery({
    queryKey: notificationsQueryKey({ type, isRead }),
    queryFn: async ({ pageParam = 1 }) => {
      return getNotifications({ type, isRead, page: pageParam, limit });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // 데이터 병합
  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;
  const unreadCount = data?.pages[0]?.unreadCount ?? 0;

  // 읽음 처리 뮤테이션
  const markAsReadMutation = useMutation({
    mutationFn: (notificationIds: string[]) => markAsRead({ notificationIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  // 전체 읽음 처리 뮤테이션
  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  // 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: (notificationId: string) => deleteSingleNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  // 전체 삭제 뮤테이션
  const deleteAllMutation = useMutation({
    mutationFn: () => deleteAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  // 핸들러
  const handleMarkAsRead = useCallback(
    async (notificationIds: string[]) => {
      await markAsReadMutation.mutateAsync(notificationIds);
    },
    [markAsReadMutation],
  );

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsReadMutation.mutateAsync();
  }, [markAllAsReadMutation]);

  const handleDelete = useCallback(
    async (notificationId: string) => {
      await deleteMutation.mutateAsync(notificationId);
    },
    [deleteMutation],
  );

  const handleDeleteAll = useCallback(async () => {
    await deleteAllMutation.mutateAsync();
  }, [deleteAllMutation]);

  const handleFetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNext();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNext]);

  return {
    notifications,
    totalCount,
    unreadCount,
    isLoading,
    error: error as Error | null,
    hasMore: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage: handleFetchNextPage,
    refresh: refetch,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
    deleteAllNotifications: handleDeleteAll,
  };
}
