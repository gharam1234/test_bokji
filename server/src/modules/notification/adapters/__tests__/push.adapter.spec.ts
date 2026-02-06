/**
 * PushAdapter 테스트
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PushAdapter } from '../push.adapter';
import { NotificationRepository } from '../../notification.repository';
import { NotificationType } from '../../constants/notification.constants';
import { Notification } from '../../entities/notification.entity';

describe('PushAdapter', () => {
  let adapter: PushAdapter;
  let repository: jest.Mocked<NotificationRepository>;

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

  const mockFcmTokens = [
    {
      id: 'token-1',
      userId: 'user-1',
      token: 'fcm-token-abc123',
      deviceType: 'web',
      isActive: true,
      lastUsedAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: 'token-2',
      userId: 'user-1',
      token: 'fcm-token-def456',
      deviceType: 'android',
      isActive: true,
      lastUsedAt: new Date(),
      createdAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const mockRepository = {
      findActiveFcmTokens: jest.fn().mockResolvedValue(mockFcmTokens),
      upsertFcmToken: jest.fn().mockResolvedValue({ id: 'token-1' }),
      deleteFcmToken: jest.fn().mockResolvedValue(undefined),
      deactivateFcmToken: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushAdapter,
        { provide: NotificationRepository, useValue: mockRepository },
      ],
    }).compile();

    adapter = module.get<PushAdapter>(PushAdapter);
    repository = module.get(NotificationRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('send', () => {
    it('Firebase 미설정 시 false를 반환해야 한다', async () => {
      const result = await adapter.send('user-1', mockNotification);

      expect(result).toBe(false);
    });

    it('FCM 토큰이 없으면 false를 반환해야 한다', async () => {
      repository.findActiveFcmTokens.mockResolvedValue([]);

      const result = await adapter.send('user-1', mockNotification);

      expect(result).toBe(false);
    });
  });

  describe('sendBulk', () => {
    it('여러 사용자에게 발송 결과를 반환해야 한다', async () => {
      const userIds = ['user-1', 'user-2'];

      const results = await adapter.sendBulk(userIds, mockNotification);

      expect(results.size).toBe(2);
      expect(results.get('user-1')).toBe(false); // Firebase 미설정
      expect(results.get('user-2')).toBe(false);
    });
  });

  describe('registerToken', () => {
    it('FCM 토큰을 등록해야 한다', async () => {
      await adapter.registerToken('user-1', 'new-fcm-token', 'web');

      expect(repository.upsertFcmToken).toHaveBeenCalledWith({
        userId: 'user-1',
        token: 'new-fcm-token',
        deviceType: 'web',
      });
    });

    it('다양한 디바이스 타입을 지원해야 한다', async () => {
      await adapter.registerToken('user-1', 'token1', 'android');
      await adapter.registerToken('user-1', 'token2', 'ios');
      await adapter.registerToken('user-1', 'token3', 'web');

      expect(repository.upsertFcmToken).toHaveBeenCalledTimes(3);
    });
  });

  describe('removeToken', () => {
    it('FCM 토큰을 삭제해야 한다', async () => {
      await adapter.removeToken('fcm-token-abc123');

      expect(repository.deleteFcmToken).toHaveBeenCalledWith('fcm-token-abc123');
    });
  });

  describe('deactivateToken', () => {
    it('FCM 토큰을 비활성화해야 한다', async () => {
      await adapter.deactivateToken('fcm-token-abc123');

      expect(repository.deactivateFcmToken).toHaveBeenCalledWith('fcm-token-abc123');
    });
  });

  describe('initialize', () => {
    it('초기화 호출 시 예외를 던지지 않아야 한다', async () => {
      await expect(adapter.initialize()).resolves.not.toThrow();
    });
  });
});
