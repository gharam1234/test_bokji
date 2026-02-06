/**
 * NotificationList 컴포넌트
 * 알림 센터 페이지의 알림 목록
 */

import React, { useRef, useCallback } from 'react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useNotifications, UseNotificationsOptions } from '../../hooks/useNotifications';
import { NotificationItem } from '../NotificationItem';
import { EmptyNotification } from '../EmptyNotification';
import { NotificationItem as NotificationItemType } from '../../types/notification.types';

/**
 * NotificationList Props
 */
export interface NotificationListProps {
  /** 필터 옵션 */
  options?: UseNotificationsOptions;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * NotificationList 컴포넌트
 */
export function NotificationList({
  options,
  className,
}: NotificationListProps): React.ReactElement {
  const navigate = useNavigate();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    notifications,
    totalCount,
    unreadCount,
    isLoading,
    error,
    hasMore,
    isFetchingNextPage,
    fetchNextPage,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications(options);

  // 무한 스크롤 - 마지막 요소 감지
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchNextPage();
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoading, isFetchingNextPage, hasMore, fetchNextPage],
  );

  // 알림 클릭 핸들러
  const handleNotificationClick = (notification: NotificationItemType) => {
    if (notification.linkUrl) {
      navigate(notification.linkUrl);
    }
  };

  // 읽음 처리 핸들러
  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead([notificationId]);
  };

  // 전체 읽음 처리
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // 전체 삭제
  const handleDeleteAll = async () => {
    if (window.confirm('모든 알림을 삭제하시겠습니까?')) {
      await deleteAllNotifications();
    }
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">알림을 불러오는 중 오류가 발생했습니다.</p>
        <p className="mt-2 text-sm text-gray-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div className={clsx('bg-white rounded-lg shadow', className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">알림</h2>
          <span className="text-sm text-gray-500">
            총 {totalCount}개 {unreadCount > 0 && `(읽지 않음 ${unreadCount}개)`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              모두 읽음 처리
            </button>
          )}
          {totalCount > 0 && (
            <button
              type="button"
              onClick={handleDeleteAll}
              className="text-sm text-red-600 hover:text-red-800 hover:underline"
            >
              모두 삭제
            </button>
          )}
        </div>
      </div>

      {/* 알림 목록 */}
      <div className="divide-y divide-gray-100">
        {isLoading && notifications.length === 0 ? (
          // 초기 로딩 스켈레톤
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : notifications.length > 0 ? (
          <>
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                ref={index === notifications.length - 1 ? lastElementRef : null}
                className="group"
              >
                <NotificationItem
                  notification={notification}
                  onClick={handleNotificationClick}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={deleteNotification}
                />
              </div>
            ))}

            {/* 다음 페이지 로딩 */}
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        ) : (
          <EmptyNotification
            title="알림이 없습니다"
            description="새로운 복지 혜택이나 마감 임박 정보가 있으면 알려드릴게요."
          />
        )}
      </div>
    </div>
  );
}

export default NotificationList;
