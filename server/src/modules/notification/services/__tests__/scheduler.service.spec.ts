/**
 * SchedulerService 테스트
 */

import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from '../scheduler.service';
import { NotificationRepository } from '../../notification.repository';
import { NotificationService } from '../../notification.service';
import {
  NotificationType,
  NotificationPriority,
  ScheduledNotificationStatus,
} from '../../constants/notification.constants';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let repository: jest.Mocked<NotificationRepository>;
  let notificationService: jest.Mocked<NotificationService>;

  const mockScheduledNotification = {
    id: 'scheduled-1',
    userId: 'user-1',
    userIds: null,
    type: NotificationType.NEW_WELFARE,
    title: '새로운 복지 혜택',
    message: '맞춤형 복지 정보가 등록되었습니다.',
    linkUrl: '/welfare/123',
    metadata: { programId: 'prog-1' },
    priority: NotificationPriority.NORMAL,
    scheduledAt: new Date(Date.now() - 1000), // 과거 시간
    status: ScheduledNotificationStatus.PENDING,
    processedAt: null,
    createdAt: new Date(),
  };

  const mockBulkScheduledNotification = {
    ...mockScheduledNotification,
    id: 'scheduled-2',
    userId: null,
    userIds: ['user-1', 'user-2', 'user-3'],
  };

  beforeEach(async () => {
    const mockRepository = {
      findPendingScheduledNotifications: jest.fn(),
      updateScheduledNotificationStatus: jest.fn(),
      createScheduledNotification: jest.fn(),
      pool: {
        query: jest.fn(),
      },
    };

    const mockNotificationService = {
      sendNotification: jest.fn().mockResolvedValue({ id: 'notif-1' }),
      sendBulkNotification: jest.fn().mockResolvedValue(3),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        { provide: NotificationRepository, useValue: mockRepository },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
    repository = module.get(NotificationRepository);
    notificationService = module.get(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processScheduledNotifications', () => {
    it('대기중인 예약 알림을 처리해야 한다', async () => {
      repository.findPendingScheduledNotifications.mockResolvedValue([mockScheduledNotification]);

      const count = await service.processScheduledNotifications();

      expect(count).toBe(1);
      expect(notificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: NotificationType.NEW_WELFARE,
          title: '새로운 복지 혜택',
        }),
      );
    });

    it('처리 후 상태를 PROCESSED로 업데이트해야 한다', async () => {
      repository.findPendingScheduledNotifications.mockResolvedValue([mockScheduledNotification]);

      await service.processScheduledNotifications();

      expect(repository.updateScheduledNotificationStatus).toHaveBeenCalledWith(
        'scheduled-1',
        ScheduledNotificationStatus.PROCESSED,
      );
    });

    it('대량 발송 예약 알림을 처리해야 한다', async () => {
      repository.findPendingScheduledNotifications.mockResolvedValue([mockBulkScheduledNotification]);

      const count = await service.processScheduledNotifications();

      expect(count).toBe(1);
      expect(notificationService.sendBulkNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userIds: ['user-1', 'user-2', 'user-3'],
        }),
      );
    });

    it('대기중인 알림이 없으면 0을 반환해야 한다', async () => {
      repository.findPendingScheduledNotifications.mockResolvedValue([]);

      const count = await service.processScheduledNotifications();

      expect(count).toBe(0);
      expect(notificationService.sendNotification).not.toHaveBeenCalled();
    });

    it('발송 실패해도 다음 알림을 계속 처리해야 한다', async () => {
      const scheduled1 = { ...mockScheduledNotification, id: 'scheduled-1' };
      const scheduled2 = { ...mockScheduledNotification, id: 'scheduled-2', userId: 'user-2' };

      repository.findPendingScheduledNotifications.mockResolvedValue([scheduled1, scheduled2]);
      notificationService.sendNotification
        .mockRejectedValueOnce(new Error('발송 실패'))
        .mockResolvedValueOnce({ id: 'notif-2' });

      const count = await service.processScheduledNotifications();

      expect(count).toBe(1); // 두 번째만 성공
      expect(notificationService.sendNotification).toHaveBeenCalledTimes(2);
    });
  });

  describe('scheduleNewWelfareNotification', () => {
    it('새 복지 알림을 예약해야 한다', async () => {
      const programResult = {
        rows: [{ id: 'prog-1', name: '청년 월세 지원', category: '주거', summary: '요약' }],
      };
      const userResult = {
        rows: [{ user_id: 'user-1' }, { user_id: 'user-2' }],
      };

      repository['pool'].query
        .mockResolvedValueOnce(programResult)
        .mockResolvedValueOnce(userResult);
      repository.createScheduledNotification.mockResolvedValue({ id: 'scheduled-1' });

      await service.scheduleNewWelfareNotification('prog-1');

      expect(repository.createScheduledNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userIds: ['user-1', 'user-2'],
          type: NotificationType.NEW_WELFARE,
        }),
      );
    });

    it('프로그램이 없으면 예약하지 않아야 한다', async () => {
      repository['pool'].query.mockResolvedValue({ rows: [] });

      await service.scheduleNewWelfareNotification('nonexistent');

      expect(repository.createScheduledNotification).not.toHaveBeenCalled();
    });

    it('대상 사용자가 없으면 예약하지 않아야 한다', async () => {
      repository['pool'].query
        .mockResolvedValueOnce({ rows: [{ id: 'prog-1', name: '테스트' }] })
        .mockResolvedValueOnce({ rows: [] });

      await service.scheduleNewWelfareNotification('prog-1');

      expect(repository.createScheduledNotification).not.toHaveBeenCalled();
    });
  });

  describe('cancelScheduledNotification', () => {
    it('예약 알림을 취소해야 한다', async () => {
      await service.cancelScheduledNotification('scheduled-1');

      expect(repository.updateScheduledNotificationStatus).toHaveBeenCalledWith(
        'scheduled-1',
        ScheduledNotificationStatus.CANCELLED,
      );
    });
  });

  describe('runManually', () => {
    it('수동 실행 시 예약 알림을 처리해야 한다', async () => {
      repository.findPendingScheduledNotifications.mockResolvedValue([mockScheduledNotification]);

      const count = await service.runManually();

      expect(count).toBe(1);
      expect(repository.findPendingScheduledNotifications).toHaveBeenCalled();
    });
  });
});
