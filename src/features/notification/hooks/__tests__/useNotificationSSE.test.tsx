/**
 * useNotificationSSE 훅 테스트
 */

import '@testing-library/jest-dom';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useNotificationSSE } from '../useNotificationSSE';
import { NotificationType } from '../../types/notification.types';
import * as sseClientModule from '../../api/sseClient';

// SSE 클라이언트 모킹
jest.mock('../../api/sseClient');

const mockSSEClient = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  getState: jest.fn().mockReturnValue('disconnected'),
  isConnected: jest.fn().mockReturnValue(false),
};

const mockCreateSSEClient = jest.mocked(sseClientModule.createSSEClient);

describe('useNotificationSSE', () => {
  let queryClient: QueryClient;
  let capturedOnNotification: ((data: any) => void) | undefined;
  let capturedOnStateChange: ((state: any) => void) | undefined;

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    jest.clearAllMocks();

    // SSE 클라이언트 생성 모킹
    mockCreateSSEClient.mockImplementation((options) => {
      capturedOnNotification = options?.onNotification;
      capturedOnStateChange = options?.onStateChange;
      return mockSSEClient as any;
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('초기 상태', () => {
    it('초기 연결 상태가 disconnected여야 한다', () => {
      const { result } = renderHook(() => useNotificationSSE({ enabled: false }), {
        wrapper: createWrapper(),
      });

      expect(result.current.connectionState).toBe('disconnected');
      expect(result.current.isConnected).toBe(false);
    });

    it('lastNotification이 null이어야 한다', () => {
      const { result } = renderHook(() => useNotificationSSE({ enabled: false }), {
        wrapper: createWrapper(),
      });

      expect(result.current.lastNotification).toBeNull();
    });
  });

  describe('자동 연결', () => {
    it('enabled가 true면 자동으로 연결해야 한다', async () => {
      renderHook(() => useNotificationSSE({ enabled: true }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockSSEClient.connect).toHaveBeenCalled();
      });
    });

    it('enabled가 false면 자동 연결하지 않아야 한다', () => {
      renderHook(() => useNotificationSSE({ enabled: false }), {
        wrapper: createWrapper(),
      });

      expect(mockSSEClient.connect).not.toHaveBeenCalled();
    });

    it('기본값으로 enabled가 true여야 한다', async () => {
      renderHook(() => useNotificationSSE(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockSSEClient.connect).toHaveBeenCalled();
      });
    });
  });

  describe('수동 연결/연결 해제', () => {
    it('connect 호출 시 SSE 연결을 시작해야 한다', () => {
      const { result } = renderHook(() => useNotificationSSE({ enabled: false }), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.connect();
      });

      expect(mockSSEClient.connect).toHaveBeenCalled();
    });

    it('disconnect 호출 시 SSE 연결을 종료해야 한다', async () => {
      const { result } = renderHook(() => useNotificationSSE({ enabled: true }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockSSEClient.connect).toHaveBeenCalled();
      });

      act(() => {
        result.current.disconnect();
      });

      expect(mockSSEClient.disconnect).toHaveBeenCalled();
    });
  });

  describe('알림 수신', () => {
    it('새 알림 수신 시 lastNotification을 업데이트해야 한다', async () => {
      const { result } = renderHook(() => useNotificationSSE({ enabled: true }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(capturedOnNotification).toBeDefined();
      });

      const mockNotification = {
        id: 'notif-1',
        type: NotificationType.NEW_WELFARE,
        title: '새 알림',
        message: '테스트 메시지',
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      act(() => {
        capturedOnNotification!(mockNotification);
      });

      expect(result.current.lastNotification).toEqual(mockNotification);
    });

    it('새 알림 수신 시 onNotification 콜백을 호출해야 한다', async () => {
      const onNotification = jest.fn();

      renderHook(() => useNotificationSSE({ enabled: true, onNotification }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(capturedOnNotification).toBeDefined();
      });

      const mockNotification = {
        id: 'notif-1',
        type: NotificationType.NEW_WELFARE,
        title: '새 알림',
        message: '테스트 메시지',
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      act(() => {
        capturedOnNotification!(mockNotification);
      });

      expect(onNotification).toHaveBeenCalledWith(mockNotification);
    });

    it('새 알림 수신 시 읽지 않은 개수를 증가시켜야 한다', async () => {
      // 초기 읽지 않은 개수 설정
      queryClient.setQueryData(['unreadCount'], 5);

      renderHook(() => useNotificationSSE({ enabled: true }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(capturedOnNotification).toBeDefined();
      });

      act(() => {
        capturedOnNotification!({
          id: 'notif-1',
          type: NotificationType.NEW_WELFARE,
          title: '새 알림',
          message: '테스트',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      });

      const unreadCount = queryClient.getQueryData(['unreadCount']);
      expect(unreadCount).toBe(6);
    });

    it('null 알림은 무시해야 한다', async () => {
      const onNotification = jest.fn();

      const { result } = renderHook(
        () => useNotificationSSE({ enabled: true, onNotification }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(capturedOnNotification).toBeDefined();
      });

      act(() => {
        capturedOnNotification!(null);
      });

      expect(result.current.lastNotification).toBeNull();
      expect(onNotification).not.toHaveBeenCalled();
    });
  });

  describe('연결 상태 변경', () => {
    it('연결 상태 변경 시 connectionState를 업데이트해야 한다', async () => {
      const { result } = renderHook(() => useNotificationSSE({ enabled: true }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(capturedOnStateChange).toBeDefined();
      });

      act(() => {
        capturedOnStateChange!('connecting');
      });

      expect(result.current.connectionState).toBe('connecting');

      act(() => {
        capturedOnStateChange!('connected');
      });

      expect(result.current.connectionState).toBe('connected');
    });

    it('연결 상태 변경 시 onStateChange 콜백을 호출해야 한다', async () => {
      const onStateChange = jest.fn();

      renderHook(() => useNotificationSSE({ enabled: true, onStateChange }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(capturedOnStateChange).toBeDefined();
      });

      act(() => {
        capturedOnStateChange!('connected');
      });

      expect(onStateChange).toHaveBeenCalledWith('connected');
    });
  });

  describe('컴포넌트 언마운트', () => {
    it('언마운트 시 연결을 종료해야 한다', async () => {
      const { unmount } = renderHook(() => useNotificationSSE({ enabled: true }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockSSEClient.connect).toHaveBeenCalled();
      });

      unmount();

      expect(mockSSEClient.disconnect).toHaveBeenCalled();
    });
  });

  describe('isConnected', () => {
    it('connected 상태일 때 true를 반환해야 한다', async () => {
      const { result } = renderHook(() => useNotificationSSE({ enabled: true }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(capturedOnStateChange).toBeDefined();
      });

      act(() => {
        capturedOnStateChange!('connected');
      });

      expect(result.current.isConnected).toBe(true);
    });

    it('disconnected 상태일 때 false를 반환해야 한다', () => {
      const { result } = renderHook(() => useNotificationSSE({ enabled: false }), {
        wrapper: createWrapper(),
      });

      expect(result.current.isConnected).toBe(false);
    });
  });
});
