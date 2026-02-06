/**
 * EmptyNotification 컴포넌트
 * 알림이 없을 때 표시되는 빈 상태 UI
 */

import React from 'react';
import { clsx } from 'clsx';

/**
 * EmptyNotification Props
 */
export interface EmptyNotificationProps {
  /** 제목 */
  title?: string;
  /** 설명 */
  description?: string;
  /** 추가 클래스명 */
  className?: string;
  /** 컴팩트 모드 */
  compact?: boolean;
  /** 액션 버튼 라벨 */
  actionLabel?: string;
  /** 액션 버튼 클릭 핸들러 */
  onAction?: () => void;
}

/**
 * EmptyNotification 컴포넌트
 */
export function EmptyNotification({
  title = '알림이 없습니다',
  description = '새로운 알림이 도착하면 여기에 표시됩니다.',
  className,
  compact = false,
  actionLabel,
  onAction,
}: EmptyNotificationProps): React.ReactElement {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8 px-4' : 'py-16 px-8',
        className,
      )}
    >
      {/* 아이콘 */}
      <div
        className={clsx(
          'flex items-center justify-center rounded-full bg-gray-100',
          compact ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-4',
        )}
      >
        <svg
          className={clsx('text-gray-400', compact ? 'w-6 h-6' : 'w-8 h-8')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </div>

      {/* 텍스트 */}
      <h3
        className={clsx(
          'font-medium text-gray-900',
          compact ? 'text-sm' : 'text-base',
        )}
      >
        {title}
      </h3>
      <p
        className={clsx(
          'text-gray-500 mt-1',
          compact ? 'text-xs' : 'text-sm',
        )}
      >
        {description}
      </p>

      {/* 액션 버튼 */}
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className={clsx(
            'mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          )}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyNotification;
