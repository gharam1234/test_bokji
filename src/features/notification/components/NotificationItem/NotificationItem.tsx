/**
 * NotificationItem 컴포넌트
 * 개별 알림 항목 표시
 */

import React from 'react';
import { clsx } from 'clsx';
import { NotificationItem as NotificationItemType, NotificationType, NotificationPriority } from '../../types/notification.types';
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_COLORS,
} from '../../constants/notification.constants';
import { formatTimeAgo } from '../../utils/timeAgo';

/**
 * NotificationItem Props
 */
export interface NotificationItemProps {
  /** 알림 데이터 */
  notification: NotificationItemType;
  /** 클릭 핸들러 */
  onClick?: (notification: NotificationItemType) => void;
  /** 삭제 핸들러 */
  onDelete?: (notificationId: string) => void;
  /** 읽음 처리 핸들러 */
  onMarkAsRead?: (notificationId: string) => void;
  /** 추가 클래스명 */
  className?: string;
  /** 컴팩트 모드 */
  compact?: boolean;
}

/**
 * 알림 유형별 아이콘 렌더링
 */
function getNotificationIcon(type: NotificationType): React.ReactNode {
  const iconClass = 'w-5 h-5';

  switch (type) {
    case NotificationType.NEW_WELFARE:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    case NotificationType.DEADLINE_ALERT:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case NotificationType.PROFILE_MATCH:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case NotificationType.RECOMMENDATION:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case NotificationType.SYSTEM:
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      );
  }
}

/**
 * NotificationItem 컴포넌트
 */
export function NotificationItem({
  notification,
  onClick,
  onDelete,
  onMarkAsRead,
  className,
  compact = false,
}: NotificationItemProps): React.ReactElement {
  const { id, type, title, message, isRead, createdAt, metadata, priority } = notification;

  const isHighPriority = priority === NotificationPriority.HIGH || priority === NotificationPriority.URGENT;

  const handleClick = () => {
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(id);
    }
    onClick?.(notification);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  const colorClass = NOTIFICATION_TYPE_COLORS[type];

  return (
    <div
      className={clsx(
        'relative flex gap-3 p-4 cursor-pointer',
        'border-b border-gray-100 last:border-b-0',
        'hover:bg-gray-50 transition-colors duration-150',
        !isRead && 'bg-blue-50/50',
        className,
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* 읽지 않음 표시 */}
      {!isRead && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
      )}

      {/* 높은 우선순위 표시 */}
      {isHighPriority && (
        <div className="absolute right-2 top-2 text-red-500 text-xs font-bold">!</div>
      )}

      {/* 아이콘 */}
      <div
        className={clsx(
          'flex-shrink-0 w-10 h-10 rounded-full',
          'flex items-center justify-center',
          colorClass,
        )}
      >
        {getNotificationIcon(type)}
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        {/* 유형 레이블 */}
        <div className="flex items-center gap-2 mb-0.5">
          <span className={clsx('text-xs font-medium', colorClass.split(' ')[0])}>
            {NOTIFICATION_TYPE_LABELS[type]}
          </span>
          <span className="text-xs text-gray-400">
            {formatTimeAgo(new Date(createdAt))}
          </span>
        </div>

        {/* 제목 */}
        <h4
          className={clsx(
            'text-sm font-medium text-gray-900 truncate',
            !isRead && 'font-semibold',
          )}
        >
          {title}
        </h4>

        {/* 본문 */}
        {!compact && (
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{message}</p>
        )}

        {/* 메타데이터 */}
        {!compact && metadata?.programName && (
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-0.5 bg-gray-100 rounded">
              {metadata.programName}
            </span>
            {metadata.matchScore && (
              <span className="text-green-600">
                {metadata.matchScore}% 일치
              </span>
            )}
            {metadata.daysLeft !== undefined && (
              <span className="text-orange-600">
                D-{metadata.daysLeft}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 읽음 표시 버튼 */}
      {!isRead && onMarkAsRead && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead(id);
          }}
          className={clsx(
            'flex-shrink-0 p-1 rounded-full',
            'text-gray-400 hover:text-gray-600 hover:bg-gray-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'opacity-0 group-hover:opacity-100 transition-opacity',
          )}
          aria-label="읽음 표시"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      )}

      {/* 삭제 버튼 */}
      {onDelete && (
        <button
          type="button"
          onClick={handleDelete}
          className={clsx(
            'flex-shrink-0 p-1 rounded-full',
            'text-gray-400 hover:text-gray-600 hover:bg-gray-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'opacity-0 group-hover:opacity-100 transition-opacity',
          )}
          aria-label="알림 삭제"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default NotificationItem;
