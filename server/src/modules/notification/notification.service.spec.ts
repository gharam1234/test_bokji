import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { SSEManager } from './managers/sse.manager';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from './entities/notification.entity';

describe('NotificationService', () => {
  let service: NotificationService;
  let repository: jest.Mocked<NotificationRepository>;
  let sseManager: jest.Mocked<SSEManager>;

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

  const mockSettings = {
    id: 'setting-1',
    userId: 'user-1',
    channel: NotificationChannel.IN_APP,
    notificationType: NotificationType.WELFARE_NEW,
    isEnabled: true,
    quietHoursStart: null,
    quietHoursEnd: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      countUnread: jest.fn(),
      create: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      getSettings: jest.fn(),
      getSettingByType: jest.fn(),
      upsertSetting: jest.fn(),
      getTemplate: jest.fn(),
      createLog: jest.fn(),
      saveFcmToken: jest.fn(),
      getFcmTokens: jest.fn(),
      deleteFcmToken: jest.fn(),
      createScheduledNotification: jest.fn(),
      getScheduledNotifications: jest.fn(),
      updateScheduledNotification: jest.fn(),
      deleteScheduledNotification: jest.fn(),
    };

    const mockSSEManager = {
      addClient: jest.fn(),
      removeClient: jest.fn(),
      sendToUser: jest.fn(),
      broadcast: jest.fn(),
      getClientCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: NotificationRepository, useValue: mockRepository },
        { provide: SSEManager, useValue: mockSSEManager },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    repository = module.get(NotificationRepository);
    sseManager = module.get(SSEManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('사용자의 알림 목록을 조회해야 한다', async () => {
      const mockResult = {
        items: [mockNotification],
        total: 1,
        hasMore: false,
      };
      repository.findByUserId.mockResolvedValue(mockResult);

      const result = await service.getNotifications('user-1', {
        limit: 20,
        offset: 0,
      });

      expect(repository.findByUserId).toHaveBeenCalledWith('user-1', {
        limit: 20,
        offset: 0,
      });
      expect(result).toEqual(mockResult);
    });

    it('타입 필터가 적용되어야 한다', async () => {
      const mockResult = {
        items: [mockNotification],
        total: 1,
        hasMore: false,
      };
      repository.findByUserId.mockResolvedValue(mockResult);

      await service.getNotifications('user-1', {
        type: NotificationType.WELFARE_NEW,
        limit: 20,
        offset: 0,
      });

      expect(repository.findByUserId).toHaveBeenCalledWith('user-1', {
        type: NotificationType.WELFARE_NEW,
        limit: 20,
        offset: 0,
      });
    });
  });

  describe('getUnreadCount', () => {
    it('읽지 않은 알림 수를 반환해야 한다', async () => {
      repository.countUnread.mockResolvedValue(5);

      const result = await service.getUnreadCount('user-1');

      expect(repository.countUnread).toHaveBeenCalledWith('user-1');
      expect(result).toBe(5);
    });
  });

  describe('createNotification', () => {
    it('알림을 생성하고 SSE로 전송해야 한다', async () => {
      repository.getSettingByType.mockResolvedValue(mockSettings);
      repository.create.mockResolvedValue(mockNotification);

      const result = await service.createNotification({
        userId: 'user-1',
        type: NotificationType.WELFARE_NEW,
        title: '새로운 복지 정보',
        body: '맞춤형 복지 정보가 등록되었습니다.',
      });

      expect(repository.create).toHaveBeenCalled();
      expect(sseManager.sendToUser).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ type: 'notification' })
      );
      expect(result).toEqual(mockNotification);
    });

    it('알림이 비활성화되어 있으면 생성하지 않아야 한다', async () => {
      repository.getSettingByType.mockResolvedValue({
        ...mockSettings,
        isEnabled: false,
      });

      const result = await service.createNotification({
        userId: 'user-1',
        type: NotificationType.WELFARE_NEW,
        title: '새로운 복지 정보',
        body: '맞춤형 복지 정보가 등록되었습니다.',
      });

      expect(repository.create).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('markAsRead', () => {
    it('알림을 읽음으로 표시해야 한다', async () => {
      repository.findById.mockResolvedValue(mockNotification);
      repository.markAsRead.mockResolvedValue({ ...mockNotification, isRead: true });

      const result = await service.markAsRead('user-1', 'notif-1');

      expect(repository.markAsRead).toHaveBeenCalledWith('notif-1');
      expect(result?.isRead).toBe(true);
    });

    it('존재하지 않는 알림이면 null을 반환해야 한다', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.markAsRead('user-1', 'notif-invalid');

      expect(repository.markAsRead).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('다른 사용자의 알림은 읽음 처리하지 않아야 한다', async () => {
      repository.findById.mockResolvedValue({
        ...mockNotification,
        userId: 'other-user',
      });

      const result = await service.markAsRead('user-1', 'notif-1');

      expect(repository.markAsRead).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('markAllAsRead', () => {
    it('모든 알림을 읽음으로 표시해야 한다', async () => {
      repository.markAllAsRead.mockResolvedValue(10);

      const result = await service.markAllAsRead('user-1');

      expect(repository.markAllAsRead).toHaveBeenCalledWith('user-1');
      expect(result).toBe(10);
    });
  });

  describe('deleteNotifications', () => {
    it('단일 알림을 삭제해야 한다', async () => {
      repository.findById.mockResolvedValue(mockNotification);
      repository.delete.mockResolvedValue(true);

      const result = await service.deleteNotifications('user-1', ['notif-1']);

      expect(repository.delete).toHaveBeenCalledWith('notif-1');
      expect(result).toBe(1);
    });

    it('여러 알림을 삭제해야 한다', async () => {
      repository.findById
        .mockResolvedValueOnce(mockNotification)
        .mockResolvedValueOnce({ ...mockNotification, id: 'notif-2' });
      repository.delete.mockResolvedValue(true);

      const result = await service.deleteNotifications('user-1', ['notif-1', 'notif-2']);

      expect(repository.delete).toHaveBeenCalledTimes(2);
      expect(result).toBe(2);
    });
  });

  describe('getSettings', () => {
    it('사용자의 알림 설정을 조회해야 한다', async () => {
      const mockSettingsList = [mockSettings];
      repository.getSettings.mockResolvedValue(mockSettingsList);

      const result = await service.getSettings('user-1');

      expect(repository.getSettings).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockSettingsList);
    });
  });

  describe('updateSettings', () => {
    it('알림 설정을 업데이트해야 한다', async () => {
      repository.upsertSetting.mockResolvedValue({
        ...mockSettings,
        isEnabled: false,
      });

      const result = await service.updateSettings('user-1', {
        channel: NotificationChannel.IN_APP,
        notificationType: NotificationType.WELFARE_NEW,
        isEnabled: false,
      });

      expect(repository.upsertSetting).toHaveBeenCalled();
      expect(result.isEnabled).toBe(false);
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
      repository.saveFcmToken.mockResolvedValue(mockToken);

      const result = await service.registerFcmToken('user-1', {
        token: 'fcm-token-123',
        deviceType: 'web',
        deviceId: 'device-1',
      });

      expect(repository.saveFcmToken).toHaveBeenCalled();
      expect(result).toEqual(mockToken);
    });
  });
});
