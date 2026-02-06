/**
 * SSE 알림 연결 훅
 * 실시간 알림 수신을 위한 SSE 연결 관리
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SSEClient, SSEConnectionState, createSSEClient } from '../api/sseClient';
import { NotificationItem } from '../types/notification.types';
import { notificationsQueryKey } from './useNotifications';
import { unreadCountQueryKey } from './useUnreadCount';

/**
 * SSE 훅 옵션
 */
export interface UseNotificationSSEOptions {
  /** 활성화 여부 */
  enabled?: boolean;
  /** 새 알림 수신 콜백 */
  onNotification?: (notification: NotificationItem) => void;
  /** 연결 상태 변경 콜백 */
  onStateChange?: (state: SSEConnectionState) => void;
}

/**
 * SSE 훅 반환 타입
 */
export interface UseNotificationSSEReturn {
  /** 연결 상태 */
  connectionState: SSEConnectionState;
  /** 연결 여부 */
  isConnected: boolean;
  /** 연결 시작 */
  connect: () => void;
  /** 연결 종료 */
  disconnect: () => void;
  /** 최근 알림 */
  lastNotification: NotificationItem | null;
}

/**
 * SSE 알림 연결 훅
 */
export function useNotificationSSE(
  options: UseNotificationSSEOptions = {},
): UseNotificationSSEReturn {
  const { enabled = true, onNotification, onStateChange } = options;
  const queryClient = useQueryClient();

  const [connectionState, setConnectionState] = useState<SSEConnectionState>('disconnected');
  const [lastNotification, setLastNotification] = useState<NotificationItem | null>(null);

  const clientRef = useRef<SSEClient | null>(null);

  // 새 알림 수신 핸들러
  const handleNotification = useCallback(
    (notification: NotificationItem | null) => {
      if (notification) {
        setLastNotification(notification);

        // 알림 목록 캐시 업데이트
        queryClient.invalidateQueries({ queryKey: ['notifications'] });

        // 읽지 않은 개수 증가
        queryClient.setQueryData<number>(unreadCountQueryKey, (old) => (old ?? 0) + 1);

        // 콜백 호출
        onNotification?.(notification);
      }
    },
    [queryClient, onNotification],
  );

  // 연결 상태 변경 핸들러
  const handleStateChange = useCallback(
    (state: SSEConnectionState) => {
      setConnectionState(state);
      onStateChange?.(state);
    },
    [onStateChange],
  );

  // 연결 시작
  const connect = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = createSSEClient({
        onNotification: handleNotification,
        onStateChange: handleStateChange,
        autoReconnect: true,
      });
    }
    clientRef.current.connect();
  }, [handleNotification, handleStateChange]);

  // 연결 종료
  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
    }
  }, []);

  // 활성화 상태에 따른 연결 관리
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    connect,
    disconnect,
    lastNotification,
  };
}
