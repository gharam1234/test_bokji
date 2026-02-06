/**
 * NotificationToast 컴포넌트
 * 새 알림 수신 시 표시되는 토스트 알림
 */

import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { NotificationItem as NotificationItemType, NotificationType } from '../../types/notification.types';
import { NOTIFICATION_TYPE_COLORS } from '../../constants/notification.constants';

/**
 * NotificationToast Props
 */
export interface NotificationToastProps {
  /** 알림 데이터 */
  notification: NotificationItemType;
  /** 닫기 핸들러 */
  onClose: () => void;
  /** 클릭 핸들러 */
  onClick?: (notification: NotificationItemType) => void;
  /** 자동 닫기 시간 (밀리초, 0이면 자동 닫기 안함) */
  duration?: number;
}

/**
 * NotificationToast 컴포넌트
 */
export function NotificationToast({
  notification,
  onClose,
  onClick,
  duration = 5000,
}: NotificationToastProps): React.ReactElement {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // 진입 애니메이션
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // 자동 닫기
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleClick = () => {
    onClick?.(notification);
    handleClose();
  };

  const colorClass = NOTIFICATION_TYPE_COLORS[notification.type];

  return (
    <div
      className={clsx(
        'fixed top-4 right-4 z-50',
        'w-96 max-w-[calc(100vw-2rem)]',
        'transform transition-all duration-300 ease-out',
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
      )}
    >
      <div
        className={clsx(
          'bg-white rounded-lg shadow-lg border border-gray-200',
          'overflow-hidden cursor-pointer',
          'hover:shadow-xl transition-shadow',
        )}
        onClick={handleClick}
        role="alert"
      >
        {/* 색상 바 */}
        <div className={clsx('h-1', colorClass.split(' ')[1])} />

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* 아이콘 */}
            <div
              className={clsx(
                'flex-shrink-0 w-8 h-8 rounded-full',
                'flex items-center justify-center',
                colorClass,
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>

            {/* 내용 */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {notification.title}
              </h4>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {notification.message}
              </p>
            </div>

            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className={clsx(
                'flex-shrink-0 p-1 rounded-full',
                'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
                'focus:outline-none focus:ring-2 focus:ring-gray-400',
              )}
              aria-label="알림 닫기"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 진행 바 */}
        {duration > 0 && (
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-blue-500 transition-all ease-linear"
              style={{
                width: isVisible ? '0%' : '100%',
                transitionDuration: `${duration}ms`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationToast;
