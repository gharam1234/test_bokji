/**
 * DispatcherService 테스트
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DispatcherService } from '../dispatcher.service';
import { NotificationRepository } from '../../notification.repository';
import { SSEManager } from '../../managers/sse.manager';
import { NotificationChannel, NotificationStatus, NotificationType } from '../../constants/notification.constants';
import { Notification } from '../../entities/notification.entity';

describe('DispatcherService', () => {
  let service: DispatcherService;
  let repository: jest.Mocked<NotificationRepository>;
  let sseManager: jest.Mocked<SSEManager>;

  const mockNotification: Notification = {
    id: 'notif-1',
    userId: 'user-1',
    type: NotificationType.NEW_WELFARE,
    title: '새로운 복지 혜택',
    message: '맞춤형 복지 정보가 등록되었습니다.',
    linkUrl: '/welfare/123',
    metadata: { programId: 'prog-1' },
    isRead: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      createLog: jest.fn().mockResolvedValue({ id: 'log-1' }),
      findActiveFcmTokens: jest.fn().mockResolvedValue([]),
    };

    const mockSSEManager = {
      sendToUser: jest.fn(),
      broadcast: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatcherService,
        { provide: NotificationRepository, useValue: mockRepository },
        { provide: SSEManager, useValue: mockSSEManager },
      ],
    }).compile();

    service = module.get<DispatcherService>(DispatcherService);
    repository = module.get(NotificationRepository);
    sseManager = module.get(SSEManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('dispatch', () => {
    it('여러 채널로 알림을 발송해야 한다', async () => {
      const channels = [NotificationChannel.IN_APP];

      await service.dispatch(mockNotification, channels);

      expect(sseManager.sendToUser).toHaveBeenCalledWith(
        mockNotification.userId,
        expect.objectContaining({
          event: 'new-notification',
        }),
      );
    });

    it('빈 채널 배열이면 아무것도 발송하지 않아야 한다', async () => {
      await service.dispatch(mockNotification, []);

      expect(sseManager.sendToUser).not.toHaveBeenCalled();
    });
  });

  describe('dispatchToChannel', () => {
    it('IN_APP 채널로 발송 시 SSE를 통해 전송해야 한다', async () => {
      const result = await service.dispatchToChannel(
        mockNotification,
        NotificationChannel.IN_APP,
      );

      expect(result).toBe(true);
      expect(sseManager.sendToUser).toHaveBeenCalledWith(
        mockNotification.userId,
        expect.objectContaining({
          event: 'new-notification',
          data: expect.objectContaining({
            id: mockNotification.id,
            title: mockNotification.title,
          }),
        }),
      );
    });

    it('PUSH 채널은 어댑터 미등록 시 false를 반환해야 한다', async () => {
      const result = await service.dispatchToChannel(
        mockNotification,
        NotificationChannel.PUSH,
      );

      expect(result).toBe(false);
    });

    it('EMAIL 채널은 어댑터 미등록 시 false를 반환해야 한다', async () => {
      const result = await service.dispatchToChannel(
        mockNotification,
        NotificationChannel.EMAIL,
      );

      expect(result).toBe(false);
    });

    it('발송 후 로그를 기록해야 한다', async () => {
      await service.dispatchToChannel(mockNotification, NotificationChannel.IN_APP);

      expect(repository.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          notificationId: mockNotification.id,
          channel: NotificationChannel.IN_APP,
          status: NotificationStatus.SENT,
        }),
      );
    });

    it('발송 실패 시 실패 로그를 기록해야 한다', async () => {
      sseManager.sendToUser.mockImplementation(() => {
        throw new Error('SSE 전송 실패');
      });

      const result = await service.dispatchToChannel(
        mockNotification,
        NotificationChannel.IN_APP,
      );

      expect(result).toBe(false);
      expect(repository.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          status: NotificationStatus.FAILED,
        }),
      );
    });
  });

  describe('broadcastToUsers', () => {
    it('여러 사용자에게 알림을 발송해야 한다', async () => {
      const userIds = ['user-1', 'user-2', 'user-3'];
      const notificationData = {
        type: NotificationType.NEW_WELFARE,
        title: '새로운 복지',
        message: '복지 안내',
      };

      const results = await service.broadcastToUsers(
        userIds,
        notificationData as any,
        [NotificationChannel.IN_APP],
      );

      expect(results.size).toBe(3);
      expect(sseManager.sendToUser).toHaveBeenCalledTimes(3);
    });

    it('각 사용자별 발송 결과를 반환해야 한다', async () => {
      const userIds = ['user-1', 'user-2'];

      const results = await service.broadcastToUsers(
        userIds,
        { type: NotificationType.SYSTEM, title: '공지', message: '내용' } as any,
        [NotificationChannel.IN_APP],
      );

      expect(results.get('user-1')).toBe(true);
      expect(results.get('user-2')).toBe(true);
    });
  });

  describe('registerAdapter', () => {
    it('푸시 어댑터를 등록할 수 있어야 한다', () => {
      const mockPushAdapter = {
        send: jest.fn().mockResolvedValue(true),
        sendBulk: jest.fn(),
        registerToken: jest.fn(),
        removeToken: jest.fn(),
      };

      expect(() => {
        service.registerPushAdapter(mockPushAdapter);
      }).not.toThrow();
    });

    it('이메일 어댑터를 등록할 수 있어야 한다', () => {
      const mockEmailAdapter = {
        send: jest.fn().mockResolvedValue(true),
        sendBulk: jest.fn(),
        sendDigest: jest.fn(),
      };

      expect(() => {
        service.registerEmailAdapter(mockEmailAdapter);
      }).not.toThrow();
    });
  });
});
