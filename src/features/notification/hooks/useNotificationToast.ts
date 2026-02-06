/**
 * 알림 토스트 훅
 * 새 알림 수신 시 토스트 표시 기능
 */

import { useState, useCallback, useEffect } from 'react';
import { NotificationItem } from '../types/notification.types';
import { TOAST_DURATION } from '../constants/notification.constants';

/**
 * 토스트 항목
 */
export interface ToastItem {
  /** 고유 ID */
  id: string;
  /** 알림 데이터 */
  notification: NotificationItem;
  /** 표시 시작 시간 */
  createdAt: number;
}

/**
 * 알림 토스트 훅 옵션
 */
export interface UseNotificationToastOptions {
  /** 최대 토스트 개수 */
  maxToasts?: number;
  /** 토스트 표시 시간 (밀리초) */
  duration?: number;
}

/**
 * 알림 토스트 훅 반환 타입
 */
export interface UseNotificationToastReturn {
  /** 현재 표시중인 토스트 목록 */
  toasts: ToastItem[];
  /** 토스트 추가 */
  showToast: (notification: NotificationItem) => void;
  /** 토스트 제거 */
  removeToast: (id: string) => void;
  /** 모든 토스트 제거 */
  clearToasts: () => void;
}

/**
 * 알림 토스트 훅
 */
export function useNotificationToast(
  options: UseNotificationToastOptions = {},
): UseNotificationToastReturn {
  const { maxToasts = 3, duration = TOAST_DURATION } = options;
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // 토스트 추가
  const showToast = useCallback(
    (notification: NotificationItem) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastItem = {
        id,
        notification,
        createdAt: Date.now(),
      };

      setToasts((prev) => {
        // 최대 개수 초과 시 오래된 것 제거
        const newToasts = [newToast, ...prev];
        if (newToasts.length > maxToasts) {
          return newToasts.slice(0, maxToasts);
        }
        return newToasts;
      });

      // 자동 제거 타이머
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [maxToasts, duration],
  );

  // 토스트 제거
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // 모든 토스트 제거
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
    clearToasts,
  };
}
