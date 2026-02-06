/**
 * NotificationDropdown 컴포넌트
 * 벨 아이콘 클릭 시 나타나는 드롭다운 알림 목록
 */

import React from 'react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem } from '../NotificationItem';
import { EmptyNotification } from '../EmptyNotification';
import { NotificationItem as NotificationItemType } from '../../types/notification.types';

/**
 * NotificationDropdown Props
 */
export interface NotificationDropdownProps {
  /** 닫기 핸들러 */
  onClose?: () => void;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * NotificationDropdown 컴포넌트
 */
export function NotificationDropdown({
  onClose,
  className,
}: NotificationDropdownProps): React.ReactElement {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({ limit: 5 });

  // 알림 클릭 핸들러
  const handleNotificationClick = (notification: NotificationItemType) => {
    if (notification.linkUrl) {
      navigate(notification.linkUrl);
    }
    onClose?.();
  };

  // 읽음 처리 핸들러
  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead([notificationId]);
  };

  // 전체 읽음 처리
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // 알림 센터로 이동
  const handleViewAll = () => {
    navigate('/notifications');
    onClose?.();
  };

  // 설정 페이지로 이동
  const handleSettings = () => {
    navigate('/notifications/settings');
    onClose?.();
  };

  return (
    <div
      className={clsx(
        'absolute right-0 top-full mt-2',
        'w-96 max-h-[480px]',
        'bg-white rounded-lg shadow-lg',
        'border border-gray-200',
        'overflow-hidden',
        'z-50',
        className,
      )}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900">알림</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
              {unreadCount}개
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              모두 읽음
            </button>
          )}
          <button
            type="button"
            onClick={handleSettings}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            aria-label="알림 설정"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 알림 목록 */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
                onMarkAsRead={handleMarkAsRead}
                onDelete={deleteNotification}
                compact
              />
            ))}
          </div>
        ) : (
          <EmptyNotification
            title="알림이 없습니다"
            description="새로운 알림이 도착하면 여기에 표시됩니다."
            compact
          />
        )}
      </div>

      {/* 푸터 */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <button
          type="button"
          onClick={handleViewAll}
          className="w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          모든 알림 보기
        </button>
      </div>
    </div>
  );
}

export default NotificationDropdown;
