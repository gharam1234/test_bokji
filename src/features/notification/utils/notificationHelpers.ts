/**
 * 알림 헬퍼 유틸리티
 */

import { NotificationItem, NotificationType } from '../types/notification.types';

/**
 * 알림 목록을 날짜별로 그룹화
 */
export function groupNotificationsByDate(
  notifications: NotificationItem[],
): Map<string, NotificationItem[]> {
  const groups = new Map<string, NotificationItem[]>();

  notifications.forEach((notification) => {
    const date = new Date(notification.createdAt);
    const dateKey = getDateKey(date);

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(notification);
  });

  return groups;
}

/**
 * 날짜 키 생성 (YYYY-MM-DD)
 */
function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 알림 유형별로 필터링
 */
export function filterNotificationsByType(
  notifications: NotificationItem[],
  type: NotificationType,
): NotificationItem[] {
  return notifications.filter((n) => n.type === type);
}

/**
 * 읽지 않은 알림만 필터링
 */
export function filterUnreadNotifications(
  notifications: NotificationItem[],
): NotificationItem[] {
  return notifications.filter((n) => !n.isRead);
}

/**
 * 알림 정렬 (최신순)
 */
export function sortNotificationsByDate(
  notifications: NotificationItem[],
  order: 'asc' | 'desc' = 'desc',
): NotificationItem[] {
  return [...notifications].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}

/**
 * 알림 URL 생성
 */
export function getNotificationUrl(notification: NotificationItem): string | null {
  if (notification.linkUrl) {
    return notification.linkUrl;
  }

  // 메타데이터 기반 URL 생성
  if (notification.metadata?.programId) {
    return `/welfare/${notification.metadata.programId}`;
  }

  return null;
}

/**
 * 알림 요약 텍스트 생성
 */
export function getNotificationSummary(
  unreadCount: number,
  totalCount: number,
): string {
  if (totalCount === 0) {
    return '알림이 없습니다';
  }

  if (unreadCount === 0) {
    return `${totalCount}개의 알림`;
  }

  return `${unreadCount}개의 읽지 않은 알림`;
}
