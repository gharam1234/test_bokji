/**
 * notificationApi 테스트
 */

import '@testing-library/jest-dom';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markSingleAsRead,
  markAllAsRead,
  deleteNotifications,
  deleteSingleNotification,
  deleteAllNotifications,
  getSettings,
  updateSettings,
  registerFcmToken,
  deleteFcmToken,
} from '../notificationApi';
import {
  NotificationType,
  EmailDigestFrequency,
  DeviceType,
} from '../../types/notification.types';

// fetch 모킹
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe('notificationApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const mockResponse = (data: any, status = 200) => {
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
    });
  };

  const mockNotification = {
    id: 'notif-1',
    type: NotificationType.NEW_WELFARE,
    title: '테스트 알림',
    message: '테스트 내용',
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  describe('getNotifications', () => {
    it('기본 파라미터로 알림 목록을 조회해야 한다', async () => {
      const mockData = {
        notifications: [mockNotification],
        totalCount: 1,
        unreadCount: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      };
      mockFetch.mockResolvedValueOnce(mockResponse(mockData));

      const result = await getNotifications();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          credentials: 'include',
        }),
      );
      expect(result).toEqual(mockData);
    });

    it('타입 필터로 알림 목록을 조회해야 한다', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ notifications: [] }));

      await getNotifications({ type: NotificationType.NEW_WELFARE });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('type=new_welfare'),
        expect.any(Object),
      );
    });

    it('읽음 상태 필터로 알림 목록을 조회해야 한다', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ notifications: [] }));

      await getNotifications({ isRead: false });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('isRead=false'),
        expect.any(Object),
      );
    });

    it('페이지네이션 파라미터를 전달해야 한다', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ notifications: [] }));

      await getNotifications({ page: 2, limit: 10 });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('page=2');
      expect(url).toContain('limit=10');
    });

    it('에러 응답을 처리해야 한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: '서버 오류' }),
      });

      await expect(getNotifications()).rejects.toThrow('서버 오류');
    });

    it('에러 메시지가 없으면 기본 메시지를 사용해야 한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      await expect(getNotifications()).rejects.toThrow('API Error: 500');
    });
  });

  describe('getUnreadCount', () => {
    it('읽지 않은 알림 개수를 조회해야 한다', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ count: 5 }));

      const result = await getUnreadCount();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications/unread-count'),
        expect.any(Object),
      );
      expect(result).toEqual({ count: 5 });
    });
  });

  describe('markAsRead', () => {
    it('여러 알림을 읽음 처리해야 한다', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ success: true, updatedCount: 2 }),
      );

      const result = await markAsRead({ notificationIds: ['notif-1', 'notif-2'] });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications/read'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ notificationIds: ['notif-1', 'notif-2'] }),
        }),
      );
      expect(result).toEqual({ success: true, updatedCount: 2 });
    });
  });

  describe('markSingleAsRead', () => {
    it('단일 알림을 읽음 처리해야 한다', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ success: true, readAt: '2026-02-05T10:00:00Z' }),
      );

      const result = await markSingleAsRead('notif-1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications/notif-1/read'),
        expect.objectContaining({ method: 'PATCH' }),
      );
      expect(result).toEqual({ success: true, readAt: '2026-02-05T10:00:00Z' });
    });
  });

  describe('markAllAsRead', () => {
    it('모든 알림을 읽음 처리해야 한다', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ success: true, updatedCount: 10 }),
      );

      const result = await markAllAsRead();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications/read'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ notificationIds: [] }),
        }),
      );
      expect(result).toEqual({ success: true, updatedCount: 10 });
    });
  });

  describe('deleteNotifications', () => {
    it('여러 알림을 삭제해야 한다', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ success: true, deletedCount: 2 }),
      );

      const result = await deleteNotifications({
        notificationIds: ['notif-1', 'notif-2'],
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications'),
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ notificationIds: ['notif-1', 'notif-2'] }),
        }),
      );
      expect(result).toEqual({ success: true, deletedCount: 2 });
    });
  });

  describe('deleteSingleNotification', () => {
    it('단일 알림을 삭제해야 한다', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ success: true, deletedCount: 1 }),
      );

      const result = await deleteSingleNotification('notif-1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications/notif-1'),
        expect.objectContaining({ method: 'DELETE' }),
      );
      expect(result).toEqual({ success: true, deletedCount: 1 });
    });
  });

  describe('deleteAllNotifications', () => {
    it('모든 알림을 삭제해야 한다', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ success: true, deletedCount: 50 }),
      );

      const result = await deleteAllNotifications();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications'),
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ notificationIds: [] }),
        }),
      );
      expect(result).toEqual({ success: true, deletedCount: 50 });
    });
  });

  describe('getSettings', () => {
    it('알림 설정을 조회해야 한다', async () => {
      const mockSettings = {
        id: 'setting-1',
        userId: 'user-1',
        inAppEnabled: true,
        pushEnabled: true,
        emailEnabled: true,
        newWelfareEnabled: true,
        deadlineAlertEnabled: true,
        recommendationEnabled: true,
        quietHoursEnabled: false,
        emailDigestFrequency: EmailDigestFrequency.DAILY,
      };
      mockFetch.mockResolvedValueOnce(mockResponse({ settings: mockSettings }));

      const result = await getSettings();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications/settings'),
        expect.any(Object),
      );
      expect(result.settings).toEqual(mockSettings);
    });
  });

  describe('updateSettings', () => {
    it('알림 설정을 업데이트해야 한다', async () => {
      const updateRequest = {
        pushEnabled: false,
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      };
      mockFetch.mockResolvedValueOnce(
        mockResponse({ success: true, settings: { ...updateRequest } }),
      );

      const result = await updateSettings(updateRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications/settings'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateRequest),
        }),
      );
      expect(result.success).toBe(true);
    });

    it('방해금지 시간을 설정해야 한다', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));

      await updateSettings({
        quietHoursEnabled: true,
        quietHoursStart: '23:00',
        quietHoursEnd: '07:00',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            quietHoursEnabled: true,
            quietHoursStart: '23:00',
            quietHoursEnd: '07:00',
          }),
        }),
      );
    });
  });

  describe('registerFcmToken', () => {
    it('FCM 토큰을 등록해야 한다', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));

      const result = await registerFcmToken({
        token: 'fcm-token-123',
        deviceType: DeviceType.WEB,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications/fcm-token'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            token: 'fcm-token-123',
            deviceType: DeviceType.WEB,
          }),
        }),
      );
      expect(result.success).toBe(true);
    });

    it('다양한 디바이스 타입을 처리해야 한다', async () => {
      mockFetch.mockResolvedValue(mockResponse({ success: true }));

      await registerFcmToken({ token: 'token', deviceType: DeviceType.ANDROID });
      expect(mockFetch).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"deviceType":"android"'),
        }),
      );

      await registerFcmToken({ token: 'token', deviceType: DeviceType.IOS });
      expect(mockFetch).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"deviceType":"ios"'),
        }),
      );
    });
  });

  describe('deleteFcmToken', () => {
    it('FCM 토큰을 삭제해야 한다', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));

      const result = await deleteFcmToken({ token: 'fcm-token-123' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications/fcm-token'),
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ token: 'fcm-token-123' }),
        }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe('에러 처리', () => {
    it('401 에러를 처리해야 한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: '인증이 필요합니다' }),
      });

      await expect(getNotifications()).rejects.toThrow('인증이 필요합니다');
    });

    it('404 에러를 처리해야 한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: '알림을 찾을 수 없습니다' }),
      });

      await expect(markSingleAsRead('invalid-id')).rejects.toThrow(
        '알림을 찾을 수 없습니다',
      );
    });

    it('네트워크 에러를 처리해야 한다', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'));

      await expect(getNotifications()).rejects.toThrow('Network Error');
    });

    it('JSON 파싱 에러를 처리해야 한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(getNotifications()).rejects.toThrow('API Error: 500');
    });
  });

  describe('204 No Content 응답', () => {
    it('204 응답을 빈 객체로 처리해야 한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: () => Promise.resolve({}),
      });

      const result = await markSingleAsRead('notif-1');

      expect(result).toEqual({});
    });
  });
});
