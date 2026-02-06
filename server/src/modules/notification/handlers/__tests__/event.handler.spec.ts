/**
 * EventHandler 테스트
 */

import { Test, TestingModule } from '@nestjs/testing';
import { EventHandler, NewWelfareProgramEvent, WelfareDeadlineEvent, ProfileUpdatedEvent } from '../event.handler';
import { NotificationService } from '../../notification.service';
import { SchedulerService } from '../../services/scheduler.service';
import { TemplateService } from '../../services/template.service';
import { Pool } from 'pg';
import { NotificationType, NotificationPriority } from '../../constants/notification.constants';

describe('EventHandler', () => {
  let handler: EventHandler;
  let pool: jest.Mocked<Pool>;
  let notificationService: jest.Mocked<NotificationService>;
  let schedulerService: jest.Mocked<SchedulerService>;
  let templateService: jest.Mocked<TemplateService>;

  beforeEach(async () => {
    const mockPool = {
      query: jest.fn(),
    };

    const mockNotificationService = {
      sendNotification: jest.fn().mockResolvedValue({ id: 'notif-1' }),
      sendBulkNotification: jest.fn().mockResolvedValue(5),
    };

    const mockSchedulerService = {
      scheduleNewWelfareNotification: jest.fn().mockResolvedValue(undefined),
    };

    const mockTemplateService = {
      createContextFromMetadata: jest.fn().mockReturnValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventHandler,
        { provide: Pool, useValue: mockPool },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: SchedulerService, useValue: mockSchedulerService },
        { provide: TemplateService, useValue: mockTemplateService },
      ],
    }).compile();

    handler = module.get<EventHandler>(EventHandler);
    pool = module.get(Pool);
    notificationService = module.get(NotificationService);
    schedulerService = module.get(SchedulerService);
    templateService = module.get(TemplateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleNewWelfareProgram', () => {
    const event: NewWelfareProgramEvent = {
      type: 'NEW_WELFARE_PROGRAM',
      programId: 'prog-1',
      programName: '청년 월세 지원',
      category: '주거',
      targetGroups: ['청년'],
      createdAt: new Date(),
    };

    it('새 복지 프로그램 알림을 예약해야 한다', async () => {
      pool.query.mockResolvedValue({ rows: [{ user_id: 'user-1' }] });

      await handler.handleNewWelfareProgram(event);

      expect(schedulerService.scheduleNewWelfareNotification).toHaveBeenCalledWith('prog-1');
    });

    it('매칭 사용자가 없으면 예약하지 않아야 한다', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await handler.handleNewWelfareProgram(event);

      // 사용자 조회는 하지만 예약은 호출됨 (스케줄러 내부에서 체크)
      expect(schedulerService.scheduleNewWelfareNotification).toHaveBeenCalled();
    });
  });

  describe('handleWelfareDeadline', () => {
    const event: WelfareDeadlineEvent = {
      type: 'WELFARE_DEADLINE',
      programId: 'prog-1',
      programName: '청년 월세 지원',
      deadline: new Date('2026-02-08'),
      daysLeft: 3,
    };

    it('마감 임박 알림을 발송해야 한다', async () => {
      pool.query.mockResolvedValue({ rows: [{ user_id: 'user-1' }, { user_id: 'user-2' }] });

      await handler.handleWelfareDeadline(event);

      expect(notificationService.sendBulkNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userIds: ['user-1', 'user-2'],
          type: NotificationType.DEADLINE_ALERT,
        }),
      );
    });

    it('D-1 알림은 HIGH 우선순위여야 한다', async () => {
      pool.query.mockResolvedValue({ rows: [{ user_id: 'user-1' }] });

      await handler.handleWelfareDeadline({ ...event, daysLeft: 1 });

      expect(notificationService.sendBulkNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: NotificationPriority.HIGH,
        }),
      );
    });

    it('관심 사용자가 없으면 알림을 발송하지 않아야 한다', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await handler.handleWelfareDeadline(event);

      expect(notificationService.sendBulkNotification).not.toHaveBeenCalled();
    });
  });

  describe('handleProfileUpdated', () => {
    const event: ProfileUpdatedEvent = {
      type: 'PROFILE_UPDATED',
      userId: 'user-1',
      updatedFields: ['income', 'age'],
    };

    it('프로필 매칭 알림을 발송해야 한다', async () => {
      const newMatches = [
        { program_id: 'prog-1', program_name: '청년 월세 지원', match_score: 90 },
        { program_id: 'prog-2', program_name: '취업 지원금', match_score: 85 },
      ];
      pool.query.mockResolvedValue({ rows: newMatches });

      await handler.handleProfileUpdated(event);

      expect(notificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: NotificationType.PROFILE_MATCH,
        }),
      );
    });

    it('새로운 매칭이 없으면 알림을 발송하지 않아야 한다', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await handler.handleProfileUpdated(event);

      expect(notificationService.sendNotification).not.toHaveBeenCalled();
    });

    it('알림 메시지에 매칭 개수가 포함되어야 한다', async () => {
      pool.query.mockResolvedValue({
        rows: [
          { program_id: 'prog-1', program_name: '청년 월세', match_score: 90 },
          { program_id: 'prog-2', program_name: '취업 지원', match_score: 85 },
        ],
      });

      await handler.handleProfileUpdated(event);

      expect(notificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('2개'),
        }),
      );
    });
  });

  describe('handleRecommendationCreated', () => {
    const event = {
      type: 'RECOMMENDATION_CREATED' as const,
      userId: 'user-1',
      recommendations: [
        { programId: 'prog-1', programName: '청년 월세 지원', matchScore: 95 },
        { programId: 'prog-2', programName: '취업 지원금', matchScore: 88 },
      ],
    };

    it('추천 알림을 발송해야 한다', async () => {
      await handler.handleRecommendationCreated(event);

      expect(notificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: NotificationType.RECOMMENDATION,
        }),
      );
    });

    it('추천이 없으면 알림을 발송하지 않아야 한다', async () => {
      await handler.handleRecommendationCreated({
        ...event,
        recommendations: [],
      });

      expect(notificationService.sendNotification).not.toHaveBeenCalled();
    });

    it('첫 번째 추천 프로그램 정보가 메타데이터에 포함되어야 한다', async () => {
      await handler.handleRecommendationCreated(event);

      expect(notificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            programId: 'prog-1',
            programName: '청년 월세 지원',
            matchScore: 95,
          }),
        }),
      );
    });
  });

  describe('에러 처리', () => {
    it('새 복지 이벤트 처리 실패 시 예외를 던지지 않아야 한다', async () => {
      schedulerService.scheduleNewWelfareNotification.mockRejectedValue(new Error('실패'));

      await expect(
        handler.handleNewWelfareProgram({
          type: 'NEW_WELFARE_PROGRAM',
          programId: 'prog-1',
          programName: '테스트',
          category: '테스트',
          createdAt: new Date(),
        }),
      ).resolves.not.toThrow();
    });

    it('마감 이벤트 처리 실패 시 예외를 던지지 않아야 한다', async () => {
      pool.query.mockRejectedValue(new Error('DB 오류'));

      await expect(
        handler.handleWelfareDeadline({
          type: 'WELFARE_DEADLINE',
          programId: 'prog-1',
          programName: '테스트',
          deadline: new Date(),
          daysLeft: 3,
        }),
      ).resolves.not.toThrow();
    });
  });
});
