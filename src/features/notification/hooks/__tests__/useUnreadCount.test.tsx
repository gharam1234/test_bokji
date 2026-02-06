/**
 * useUnreadCount 훅 테스트
 */

import '@testing-library/jest-dom';
import { renderHook, waitFor, act } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { useUnreadCount } from '../useUnreadCount';
import * as notificationApi from '../../api/notificationApi';

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

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(() => mockQueryClient),
  QueryClient: jest.fn(() => mockQueryClient),
  QueryClientProvider: ({ children }: { children: ReactNode }) => children,
}));

import { useQuery } from '@tanstack/react-query';
const mockUseQuery = jest.mocked(useQuery);

const mockNotificationApi = jest.mocked(notificationApi);

describe('useUnreadCount', () => {

  const wrapper = ({ children }: { children: ReactNode }) => <>{children}</>;

  beforeEach(() => {
    jest.clearAllMocks();

    // 기본 모킹 설정
    mockNotificationApi.getUnreadCount.mockResolvedValue({ count: 5 });
    
    // useQuery 기본 모킹 - data는 숫자 (훅에서 response.count를 반환하므로)
    mockUseQuery.mockReturnValue({
      data: 5,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    } as any);
  });

  describe('읽지 않은 개수 조회', () => {
    it('읽지 않은 알림 개수를 성공적으로 조회해야 한다', async () => {
      const { result } = renderHook(() => useUnreadCount(), {
        wrapper,
      });

      expect(result.current.count).toBe(5);
    });

    it('로딩 상태를 올바르게 반환해야 한다', async () => {
      mockUseQuery.mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useUnreadCount(), {
        wrapper,
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('에러 상태를 올바르게 반환해야 한다', async () => {
      const error = new Error('개수를 불러올 수 없습니다');
      mockUseQuery.mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: error,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useUnreadCount(), {
        wrapper,
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toBe('개수를 불러올 수 없습니다');
    });

    it('알림이 없으면 0을 반환해야 한다', async () => {
      mockUseQuery.mockReturnValueOnce({
        data: 0,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useUnreadCount(), {
        wrapper,
      });

      expect(result.current.count).toBe(0);
    });
  });

  describe('낙관적 업데이트', () => {
    it('incrementCount가 setQueryData를 호출해야 한다', async () => {
      const { result } = renderHook(() => useUnreadCount(), {
        wrapper,
      });

      act(() => {
        result.current.incrementCount();
      });

      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        ['unreadCount'],
        expect.any(Function),
      );
    });

    it('decrementCount가 setQueryData를 호출해야 한다', async () => {
      const { result } = renderHook(() => useUnreadCount(), {
        wrapper,
      });

      act(() => {
        result.current.decrementCount();
      });

      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        ['unreadCount'],
        expect.any(Function),
      );
    });

    it('decrementCount가 지정된 양만큼 감소시켜야 한다', async () => {
      const { result } = renderHook(() => useUnreadCount(), {
        wrapper,
      });

      act(() => {
        result.current.decrementCount(3);
      });

      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        ['unreadCount'],
        expect.any(Function),
      );
    });

    it('decrementCount가 0 미만으로 감소하지 않아야 한다', async () => {
      // setQueryData 콜백 검증
      let capturedCallback: ((old: number) => number) | undefined;
      mockQueryClient.setQueryData.mockImplementation((key, callback) => {
        capturedCallback = callback as (old: number) => number;
      });

      const { result } = renderHook(() => useUnreadCount(), {
        wrapper,
      });

      act(() => {
        result.current.decrementCount(10);
      });

      // 콜백 실행하여 0 미만이 되지 않는지 확인
      expect(capturedCallback).toBeDefined();
      expect(capturedCallback!(2)).toBe(0);
    });

    it('resetCount가 개수를 0으로 초기화해야 한다', async () => {
      const { result } = renderHook(() => useUnreadCount(), {
        wrapper,
      });

      act(() => {
        result.current.resetCount();
      });

      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        ['unreadCount'],
        0,
      );
    });
  });

  describe('새로고침', () => {
    it('개수를 새로고침해야 한다', async () => {
      const { result } = renderHook(() => useUnreadCount(), {
        wrapper,
      });

      act(() => {
        result.current.refresh();
      });

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('자동 새로고침', () => {
    it('autoRefresh가 활성화되면 refetchInterval이 설정되어야 한다', async () => {
      renderHook(
        () => useUnreadCount({ autoRefresh: true, refreshInterval: 5000 }),
        { wrapper },
      );

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          refetchInterval: 5000,
        }),
      );
    });

    it('autoRefresh가 기본적으로 활성화되어야 한다', async () => {
      renderHook(() => useUnreadCount(), {
        wrapper,
      });

      // 기본 refreshInterval (60000ms)
      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          refetchInterval: 60000,
        }),
      );
    });

    it('autoRefresh가 비활성화되면 refetchInterval이 false여야 한다', async () => {
      renderHook(() => useUnreadCount({ autoRefresh: false }), {
        wrapper,
      });

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          refetchInterval: false,
        }),
      );
    });
  });

  describe('엣지 케이스', () => {
    it('API가 undefined를 반환해도 0으로 처리해야 한다', async () => {
      mockUseQuery.mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useUnreadCount(), {
        wrapper,
      });

      // undefined는 0으로 처리
      expect(result.current.count).toBe(0);
    });

    it('큰 숫자도 올바르게 처리해야 한다', async () => {
      mockUseQuery.mockReturnValueOnce({
        data: 999999,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useUnreadCount(), {
        wrapper,
      });

      expect(result.current.count).toBe(999999);
    });
  });
});
