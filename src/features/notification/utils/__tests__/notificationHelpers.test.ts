import '@testing-library/jest-dom';
import {
  groupNotificationsByDate,
  filterNotificationsByType,
  filterUnreadNotifications,
  sortNotificationsByDate,
  getNotificationSummary,
} from '../notificationHelpers';
import { NotificationType, NotificationPriority } from '../../types/notification.types';

describe('notificationHelpers', () => {
  const createMockNotification = (overrides = {}) => ({
    id: 'notif-1',
    type: NotificationType.WELFARE_NEW,
    title: '테스트 알림',
    message: '테스트 내용입니다.',
    isRead: false,
    priority: NotificationPriority.NORMAL,
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  describe('groupNotificationsByDate', () => {
    it('날짜별로 알림을 그룹화해야 한다', () => {
      const today = new Date();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const notifications = [
        createMockNotification({ id: '1', createdAt: today.toISOString() }),
        createMockNotification({ id: '2', createdAt: today.toISOString() }),
        createMockNotification({ id: '3', createdAt: yesterday.toISOString() }),
      ];

      const result = groupNotificationsByDate(notifications);

      // Map을 반환하므로 size로 확인
      expect(result.size).toBe(2);
      // 오늘 날짜 키로 그룹 확인
      const todayKey = today.toISOString().split('T')[0];
      const yesterdayKey = yesterday.toISOString().split('T')[0];
      expect(result.get(todayKey)).toHaveLength(2);
      expect(result.get(yesterdayKey)).toHaveLength(1);
    });

    it('빈 배열을 처리해야 한다', () => {
      const result = groupNotificationsByDate([]);
      expect(result.size).toBe(0);
    });
  });

  describe('filterNotificationsByType', () => {
    it('타입별로 필터링해야 한다', () => {
      const notifications = [
        createMockNotification({ id: '1', type: NotificationType.WELFARE_NEW }),
        createMockNotification({ id: '2', type: NotificationType.RECOMMENDATION }),
        createMockNotification({ id: '3', type: NotificationType.WELFARE_NEW }),
      ];

      const result = filterNotificationsByType(notifications, NotificationType.WELFARE_NEW);

      expect(result).toHaveLength(2);
      expect(result.every((n) => n.type === NotificationType.WELFARE_NEW)).toBe(true);
    });

    it('단일 타입으로 필터링해야 한다', () => {
      const notifications = [
        createMockNotification({ id: '1', type: NotificationType.WELFARE_NEW }),
        createMockNotification({ id: '2', type: NotificationType.RECOMMENDATION }),
        createMockNotification({ id: '3', type: NotificationType.SYSTEM }),
      ];

      const result = filterNotificationsByType(notifications, NotificationType.RECOMMENDATION);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(NotificationType.RECOMMENDATION);
    });
  });

  describe('filterUnreadNotifications', () => {
    it('읽지 않은 알림만 필터링해야 한다', () => {
      const notifications = [
        createMockNotification({ id: '1', isRead: false }),
        createMockNotification({ id: '2', isRead: true }),
        createMockNotification({ id: '3', isRead: false }),
      ];

      const result = filterUnreadNotifications(notifications);

      expect(result).toHaveLength(2);
      expect(result.every((n) => !n.isRead)).toBe(true);
    });
  });

  describe('sortNotificationsByDate', () => {
    it('최신순으로 정렬해야 한다 (기본값)', () => {
      const old = new Date('2024-01-01').toISOString();
      const recent = new Date('2024-01-15').toISOString();

      const notifications = [
        createMockNotification({ id: '1', createdAt: old }),
        createMockNotification({ id: '2', createdAt: recent }),
      ];

      const result = sortNotificationsByDate(notifications);

      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('1');
    });

    it('오래된순으로 정렬해야 한다', () => {
      const old = new Date('2024-01-01').toISOString();
      const recent = new Date('2024-01-15').toISOString();

      const notifications = [
        createMockNotification({ id: '1', createdAt: old }),
        createMockNotification({ id: '2', createdAt: recent }),
      ];

      const result = sortNotificationsByDate(notifications, 'asc');

      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });
  });

  describe('getNotificationSummary', () => {
    it('알림 요약 문자열을 반환해야 한다', () => {
      const result = getNotificationSummary(2, 5);
      expect(result).toBe('2개의 읽지 않은 알림');
    });

    it('읽지 않은 알림이 없으면 전체 개수만 표시해야 한다', () => {
      const result = getNotificationSummary(0, 5);
      expect(result).toBe('5개의 알림');
    });

    it('알림이 없으면 안내 메시지를 표시해야 한다', () => {
      const result = getNotificationSummary(0, 0);
      expect(result).toBe('알림이 없습니다');
    });
  });
});
