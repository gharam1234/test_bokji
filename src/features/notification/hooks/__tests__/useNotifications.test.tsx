/**
 * useNotifications 훅 테스트
 */

import '@testing-library/jest-dom';
import { renderHook, waitFor, act } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { useNotifications } from '../useNotifications';
import * as notificationApi from '../../api/notificationApi';
import { NotificationType, NotificationPriority } from '../../types/notification.types';

// API 모킹
jest.mock('../../api/notificationApi');

// React Query 모킹
const mockQueryClient = {
  invalidateQueries: jest.fn(),
  setQueryData: jest.fn(),
  getQueryData: jest.fn(),
  clear: jest.fn(),
};

const mockRefetch = jest.fn();
const mockFetchNextPage = jest.fn();
const mockMutate = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useInfiniteQuery: jest.fn(),
  useMutation: jest.fn(() => ({
    mutate: mockMutate,
    mutateAsync: jest.fn(),
    isLoading: false,
  })),
  useQueryClient: jest.fn(() => mockQueryClient),
  QueryClient: jest.fn(() => mockQueryClient),
  QueryClientProvider: ({ children }: { children: ReactNode }) => children,
}));

import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
const mockUseQuery = jest.mocked(useQuery);
const mockUseMutation = jest.mocked(useMutation);
const mockUseInfiniteQuery = jest.mocked(useInfiniteQuery);

const mockNotificationApi = jest.mocked(notificationApi);

// createWrapper 함수 정의
const createWrapper = () => {
  return ({ children }: { children: ReactNode }) => <>{children}</>;
};

describe('useNotifications', () => {

  const createMockNotification = (overrides = {}) => ({
    id: 'notif-1',
    type: NotificationType.NEW_WELFARE,
    title: '테스트 알림',
    message: '테스트 내용입니다.',
    isRead: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  const mockNotificationsResponse = {
    notifications: [
      createMockNotification({ id: 'notif-1' }),
      createMockNotification({ id: 'notif-2', isRead: true }),
    ],
    totalCount: 10,
    unreadCount: 5,
    page: 1,
    limit: 20,
    hasMore: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // 기본 모킹 설정
    mockNotificationApi.getNotifications.mockResolvedValue(mockNotificationsResponse);
    mockNotificationApi.markAsRead.mockResolvedValue({ success: true, updatedCount: 1 });
    mockNotificationApi.markAllAsRead.mockResolvedValue({ success: true, updatedCount: 5 });
    mockNotificationApi.deleteSingleNotification.mockResolvedValue({
      success: true,
      deletedCount: 1,
    });
    mockNotificationApi.deleteAllNotifications.mockResolvedValue({
      success: true,
      deletedCount: 10,
    });

    // useInfiniteQuery 기본 모킹
    mockUseInfiniteQuery.mockReturnValue({
      data: {
        pages: [mockNotificationsResponse],
        pageParams: [1],
      },
      isLoading: false,
      error: null,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
    } as any);

    // useQuery 기본 모킹
    mockUseQuery.mockReturnValue({
      data: mockNotificationsResponse,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    } as any);

    // useMutation 기본 모킹
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      mutateAsync: jest.fn(),
      isLoading: false,
    } as any);
  });

  afterEach(() => {
    mockQueryClient.clear();
  });

  describe('알림 목록 조회', () => {
    it('알림 목록을 성공적으로 조회해야 한다', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.totalCount).toBe(10);
      expect(result.current.unreadCount).toBe(5);
    });

    it('타입 필터를 적용해야 한다', async () => {
      const { result } = renderHook(
        () => useNotifications({ type: NotificationType.NEW_WELFARE }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // useInfiniteQuery가 올바른 queryKey로 호출되는지 확인
      expect(mockUseInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['notifications', expect.objectContaining({ type: NotificationType.NEW_WELFARE })],
        }),
      );
    });

    it('읽음 상태 필터를 적용해야 한다', async () => {
      const { result } = renderHook(() => useNotifications({ isRead: false }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // useInfiniteQuery가 올바른 queryKey로 호출되는지 확인
      expect(mockUseInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['notifications', expect.objectContaining({ isRead: false })],
        }),
      );
    });

    it('로딩 상태를 올바르게 반환해야 한다', async () => {
      // 로딩 상태로 모킹
      mockUseInfiniteQuery.mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('에러 상태를 올바르게 반환해야 한다', async () => {
      const error = new Error('API 오류');
      
      // useInfiniteQuery를 에러 상태로 모킹
      mockUseInfiniteQuery.mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: error,
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error?.message).toBe('API 오류');
    });
  });

  describe('무한 스크롤', () => {
    it('다음 페이지를 로드해야 한다', async () => {
      const firstPageResponse = {
        ...mockNotificationsResponse,
        hasMore: true,
        page: 1,
      };

      const secondPageResponse = {
        notifications: [createMockNotification({ id: 'notif-3' })],
        totalCount: 10,
        unreadCount: 5,
        page: 2,
        limit: 20,
        hasMore: false,
      };

      // 첫 번째 페이지 로드 시 hasNextPage: true로 모킹
      mockUseInfiniteQuery.mockReturnValueOnce({
        data: {
          pages: [firstPageResponse],
          pageParams: [1],
        },
        isLoading: false,
        error: null,
        hasNextPage: true,
        isFetchingNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      } as any);

      const { result, rerender } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasMore).toBe(true);

      // 두 번째 페이지 로드 후 상태로 모킹
      mockUseInfiniteQuery.mockReturnValueOnce({
        data: {
          pages: [firstPageResponse, secondPageResponse],
          pageParams: [1, 2],
        },
        isLoading: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      } as any);

      await act(async () => {
        result.current.fetchNextPage();
        rerender();
      });

      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(3);
      });
    });

    it('hasMore가 false면 fetchNextPage를 호출해도 무시해야 한다', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      expect(result.current.hasMore).toBe(false);

      await act(async () => {
        result.current.fetchNextPage();
      });

      // hasMore가 false이므로 fetchNextPage가 호출되지 않아야 함
      expect(mockFetchNextPage).not.toHaveBeenCalled();
    });
  });

  describe('읽음 처리', () => {
    it('단일 알림 읽음 처리를 해야 한다', async () => {
      const mockMarkAsReadMutateAsync = jest.fn().mockResolvedValue({ success: true });
      mockUseMutation.mockImplementation((options: any) => {
        if (options?.mutationFn?.toString().includes('markAsRead') ||
            options?.onSuccess?.toString().includes('markAsRead')) {
          return { mutateAsync: mockMarkAsReadMutateAsync, isLoading: false } as any;
        }
        return { mutateAsync: jest.fn(), isLoading: false } as any;
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.markAsRead(['notif-1']);
      });

      expect(mockMarkAsReadMutateAsync).toHaveBeenCalledWith(['notif-1']);
    });

    it('여러 알림 읽음 처리를 해야 한다', async () => {
      const mockMarkAsReadMutateAsync = jest.fn().mockResolvedValue({ success: true });
      mockUseMutation.mockImplementation(() => ({
        mutateAsync: mockMarkAsReadMutateAsync,
        isLoading: false,
      } as any));

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.markAsRead(['notif-1', 'notif-2']);
      });

      expect(mockMarkAsReadMutateAsync).toHaveBeenCalledWith(['notif-1', 'notif-2']);
    });

    it('모든 알림 읽음 처리를 해야 한다', async () => {
      const mockMarkAllAsReadMutateAsync = jest.fn().mockResolvedValue({ success: true });
      mockUseMutation.mockImplementation(() => ({
        mutateAsync: mockMarkAllAsReadMutateAsync,
        isLoading: false,
      } as any));

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.markAllAsRead();
      });

      expect(mockMarkAllAsReadMutateAsync).toHaveBeenCalled();
    });
  });

  describe('삭제 처리', () => {
    it('단일 알림 삭제를 해야 한다', async () => {
      const mockDeleteMutateAsync = jest.fn().mockResolvedValue({ success: true });
      mockUseMutation.mockImplementation(() => ({
        mutateAsync: mockDeleteMutateAsync,
        isLoading: false,
      } as any));

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.deleteNotification('notif-1');
      });

      expect(mockDeleteMutateAsync).toHaveBeenCalledWith('notif-1');
    });

    it('모든 알림 삭제를 해야 한다', async () => {
      const mockDeleteAllMutateAsync = jest.fn().mockResolvedValue({ success: true });
      mockUseMutation.mockImplementation(() => ({
        mutateAsync: mockDeleteAllMutateAsync,
        isLoading: false,
      } as any));

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.deleteAllNotifications();
      });

      expect(mockDeleteAllMutateAsync).toHaveBeenCalled();
    });
  });

  describe('새로고침', () => {
    it('목록을 새로고침해야 한다', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.refresh();
      });

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('자동 새로고침', () => {
    it('autoRefresh가 활성화되면 refetchInterval이 설정되어야 한다', async () => {
      renderHook(
        () => useNotifications({ autoRefresh: true, refreshInterval: 5000 }),
        { wrapper: createWrapper() },
      );

      // useInfiniteQuery가 refetchInterval 옵션과 함께 호출되었는지 확인
      expect(mockUseInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          refetchInterval: 5000,
        }),
      );
    });

    it('autoRefresh가 비활성화되면 refetchInterval이 설정되지 않아야 한다', async () => {
      renderHook(
        () => useNotifications({ autoRefresh: false }),
        { wrapper: createWrapper() },
      );

      // refetchInterval이 false나 undefined여야 함
      expect(mockUseInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          refetchInterval: false,
        }),
      );
    });
  });
});
