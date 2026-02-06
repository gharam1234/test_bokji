import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { SSEManager } from './managers/sse.manager';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from './entities/notification.entity';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: jest.Mocked<NotificationService>;

  const mockUser = { id: 'user-1' };

  const mockNotification = {
    id: 'notif-1',
    userId: 'user-1',
    type: NotificationType.WELFARE_NEW,
    title: '새로운 복지 정보',
    body: '맞춤형 복지 정보가 등록되었습니다.',
    channel: NotificationChannel.IN_APP,
    priority: NotificationPriority.NORMAL,
    isRead: false,
    actionUrl: '/welfare/123',
    metadata: {},
    createdAt: new Date(),
    readAt: null,
    expiredAt: null,
  };

  beforeEach(async () => {
    const mockService = {
      getNotifications: jest.fn(),
      getNotificationById: jest.fn(),
      getUnreadCount: jest.fn(),
      createNotification: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      deleteNotifications: jest.fn(),
      getSettings: jest.fn(),
      updateSettings: jest.fn(),
      registerFcmToken: jest.fn(),
      unregisterFcmToken: jest.fn(),
    };

    const mockSSEManager = {
      addClient: jest.fn(),
      removeClient: jest.fn(),
      sendToUser: jest.fn(),
      broadcast: jest.fn(),
      getClientCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        { provide: NotificationService, useValue: mockService },
        { provide: SSEManager, useValue: mockSSEManager },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    service = module.get(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('사용자의 알림 목록을 반환해야 한다', async () => {
      const mockResult = {
        items: [mockNotification],
        total: 1,
        hasMore: false,
      };
      service.getNotifications.mockResolvedValue(mockResult);

      const result = await controller.getNotifications(mockUser, {
        limit: 20,
        offset: 0,
      });

      expect(service.getNotifications).toHaveBeenCalledWith('user-1', {
        limit: 20,
        offset: 0,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('getNotificationById', () => {
    it('알림 상세 정보를 반환해야 한다', async () => {
      service.getNotificationById.mockResolvedValue(mockNotification);

      const result = await controller.getNotificationById(mockUser, 'notif-1');

      expect(service.getNotificationById).toHaveBeenCalledWith('user-1', 'notif-1');
      expect(result).toEqual(mockNotification);
    });
  });

  describe('getUnreadCount', () => {
    it('읽지 않은 알림 수를 반환해야 한다', async () => {
      service.getUnreadCount.mockResolvedValue(5);

      const result = await controller.getUnreadCount(mockUser);

      expect(service.getUnreadCount).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ count: 5 });
    });
  });

  describe('markAsRead', () => {
    it('알림을 읽음으로 표시해야 한다', async () => {
      service.markAsRead.mockResolvedValue({ ...mockNotification, isRead: true });

      const result = await controller.markAsRead(mockUser, {
        notificationIds: ['notif-1'],
      });

      expect(service.markAsRead).toHaveBeenCalledWith('user-1', 'notif-1');
      expect(result).toEqual({ success: true, count: 1 });
    });

    it('여러 알림을 읽음으로 표시해야 한다', async () => {
      service.markAsRead
        .mockResolvedValueOnce({ ...mockNotification, isRead: true })
        .mockResolvedValueOnce({ ...mockNotification, id: 'notif-2', isRead: true });

      const result = await controller.markAsRead(mockUser, {
        notificationIds: ['notif-1', 'notif-2'],
      });

      expect(service.markAsRead).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ success: true, count: 2 });
    });
  });

  describe('markAllAsRead', () => {
    it('모든 알림을 읽음으로 표시해야 한다', async () => {
      service.markAllAsRead.mockResolvedValue(10);

      const result = await controller.markAllAsRead(mockUser);

      expect(service.markAllAsRead).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ success: true, count: 10 });
    });
  });

  describe('deleteNotifications', () => {
    it('알림을 삭제해야 한다', async () => {
      service.deleteNotifications.mockResolvedValue(1);

      const result = await controller.deleteNotifications(mockUser, {
        notificationIds: ['notif-1'],
      });

      expect(service.deleteNotifications).toHaveBeenCalledWith('user-1', ['notif-1']);
      expect(result).toEqual({ success: true, count: 1 });
    });
  });

  describe('getSettings', () => {
    it('알림 설정을 반환해야 한다', async () => {
      const mockSettings = [
        {
          id: 'setting-1',
          userId: 'user-1',
          channel: NotificationChannel.IN_APP,
          notificationType: NotificationType.WELFARE_NEW,
          isEnabled: true,
          quietHoursStart: null,
          quietHoursEnd: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      service.getSettings.mockResolvedValue(mockSettings);

      const result = await controller.getSettings(mockUser);

      expect(service.getSettings).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockSettings);
    });
  });

  describe('updateSettings', () => {
    it('알림 설정을 업데이트해야 한다', async () => {
      const updatedSetting = {
        id: 'setting-1',
        userId: 'user-1',
        channel: NotificationChannel.IN_APP,
        notificationType: NotificationType.WELFARE_NEW,
        isEnabled: false,
        quietHoursStart: null,
        quietHoursEnd: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      service.updateSettings.mockResolvedValue(updatedSetting);

      const result = await controller.updateSettings(mockUser, {
        channel: NotificationChannel.IN_APP,
        notificationType: NotificationType.WELFARE_NEW,
        isEnabled: false,
      });

      expect(service.updateSettings).toHaveBeenCalledWith('user-1', {
        channel: NotificationChannel.IN_APP,
        notificationType: NotificationType.WELFARE_NEW,
        isEnabled: false,
      });
      expect(result).toEqual(updatedSetting);
    });
  });

  describe('registerFcmToken', () => {
    it('FCM 토큰을 등록해야 한다', async () => {
      const mockToken = {
        id: 'token-1',
        userId: 'user-1',
        token: 'fcm-token-123',
        deviceType: 'web',
        deviceId: 'device-1',
        createdAt: new Date(),
        lastUsedAt: new Date(),
      };
      service.registerFcmToken.mockResolvedValue(mockToken);

      const result = await controller.registerFcmToken(mockUser, {
        token: 'fcm-token-123',
        deviceType: 'web',
        deviceId: 'device-1',
      });

      expect(service.registerFcmToken).toHaveBeenCalledWith('user-1', {
        token: 'fcm-token-123',
        deviceType: 'web',
        deviceId: 'device-1',
      });
      expect(result).toEqual(mockToken);
    });
  });

  describe('unregisterFcmToken', () => {
    it('FCM 토큰을 삭제해야 한다', async () => {
      service.unregisterFcmToken.mockResolvedValue(undefined);

      const result = await controller.unregisterFcmToken(mockUser, 'fcm-token-123');

      expect(service.unregisterFcmToken).toHaveBeenCalledWith('user-1', 'fcm-token-123');
      expect(result).toEqual({ success: true });
    });
  });
});
