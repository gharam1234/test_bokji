/**
 * DeadlineAlertJob 테스트
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DeadlineAlertJob } from '../deadline-alert.job';
import { NotificationService } from '../../notification.service';
import { TemplateService } from '../../services/template.service';
import { Pool } from 'pg';
import { NotificationType, NotificationPriority } from '../../constants/notification.constants';

describe('DeadlineAlertJob', () => {
  let job: DeadlineAlertJob;
  let pool: jest.Mocked<Pool>;
  let notificationService: jest.Mocked<NotificationService>;
  let templateService: jest.Mocked<TemplateService>;

  const mockDeadlinePrograms = [
    {
      id: 'prog-1',
      name: '청년 월세 지원',
      deadline: new Date('2026-02-12'),
      category: '주거',
      days_left: 7,
    },
    {
      id: 'prog-2',
      name: '취업 지원금',
      deadline: new Date('2026-02-08'),
      category: '고용',
      days_left: 3,
    },
  ];

  const mockTargetUsers = [
    { user_id: 'user-1' },
    { user_id: 'user-2' },
  ];

  beforeEach(async () => {
    const mockPool = {
      query: jest.fn(),
    };

    const mockNotificationService = {
      sendBulkNotification: jest.fn().mockResolvedValue(2),
    };

    const mockTemplateService = {
      createContextFromMetadata: jest.fn().mockReturnValue({
        programId: 'prog-1',
        programName: '청년 월세 지원',
        daysLeft: 7,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeadlineAlertJob,
        { provide: Pool, useValue: mockPool },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: TemplateService, useValue: mockTemplateService },
      ],
    }).compile();

    job = module.get<DeadlineAlertJob>(DeadlineAlertJob);
    pool = module.get(Pool);
    notificationService = module.get(NotificationService);
    templateService = module.get(TemplateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleDeadlineAlert', () => {
    it('D-7, D-3, D-1 마감 알림을 처리해야 한다', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // D-7
        .mockResolvedValueOnce({ rows: [] }) // D-3
        .mockResolvedValueOnce({ rows: [] }); // D-1

      await job.handleDeadlineAlert();

      // 3번의 마감 일수에 대해 쿼리 실행
      expect(pool.query).toHaveBeenCalledTimes(3);
    });

    it('마감 프로그램이 있으면 알림을 발송해야 한다', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [mockDeadlinePrograms[0]] }) // D-7 프로그램
        .mockResolvedValueOnce({ rows: mockTargetUsers }) // 북마크 사용자
        .mockResolvedValueOnce({ rows: [] }) // 추천 사용자
        .mockResolvedValueOnce({ rows: [] }) // D-3
        .mockResolvedValueOnce({ rows: [] }); // D-1

      await job.handleDeadlineAlert();

      expect(notificationService.sendBulkNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userIds: ['user-1', 'user-2'],
          type: NotificationType.DEADLINE_ALERT,
        }),
      );
    });

    it('대상 사용자가 없으면 알림을 발송하지 않아야 한다', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [mockDeadlinePrograms[0]] })
        .mockResolvedValueOnce({ rows: [] }) // 북마크 사용자 없음
        .mockResolvedValueOnce({ rows: [] }) // 추천 사용자 없음
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      await job.handleDeadlineAlert();

      expect(notificationService.sendBulkNotification).not.toHaveBeenCalled();
    });
  });

  describe('runManually', () => {
    it('특정 일수에 대해 수동 실행할 수 있어야 한다', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [mockDeadlinePrograms[1]] })
        .mockResolvedValueOnce({ rows: mockTargetUsers })
        .mockResolvedValueOnce({ rows: [] });

      await job.runManually(3);

      expect(notificationService.sendBulkNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.DEADLINE_ALERT,
        }),
      );
    });

    it('일수 미지정 시 모든 마감 알림을 처리해야 한다', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await job.runManually();

      expect(pool.query).toHaveBeenCalledTimes(3);
    });
  });

  describe('알림 우선순위', () => {
    it('D-1 알림은 HIGH 우선순위여야 한다', async () => {
      const d1Program = { ...mockDeadlinePrograms[0], days_left: 1 };
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // D-7
        .mockResolvedValueOnce({ rows: [] }) // D-3
        .mockResolvedValueOnce({ rows: [d1Program] }) // D-1
        .mockResolvedValueOnce({ rows: mockTargetUsers })
        .mockResolvedValueOnce({ rows: [] });

      await job.handleDeadlineAlert();

      expect(notificationService.sendBulkNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: NotificationPriority.HIGH,
        }),
      );
    });

    it('D-7 알림은 NORMAL 우선순위여야 한다', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [mockDeadlinePrograms[0]] }) // D-7
        .mockResolvedValueOnce({ rows: mockTargetUsers })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] }) // D-3
        .mockResolvedValueOnce({ rows: [] }); // D-1

      await job.handleDeadlineAlert();

      expect(notificationService.sendBulkNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: NotificationPriority.NORMAL,
        }),
      );
    });
  });

  describe('에러 처리', () => {
    it('쿼리 실패 시 빈 배열을 반환해야 한다', async () => {
      pool.query.mockRejectedValue(new Error('DB 연결 실패'));

      // 에러가 발생해도 예외를 던지지 않아야 함
      await expect(job.handleDeadlineAlert()).resolves.not.toThrow();
    });

    it('알림 발송 실패 시 다음 프로그램을 계속 처리해야 한다', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: mockDeadlinePrograms }) // 2개 프로그램
        .mockResolvedValueOnce({ rows: mockTargetUsers })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: mockTargetUsers })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      notificationService.sendBulkNotification
        .mockRejectedValueOnce(new Error('발송 실패'))
        .mockResolvedValueOnce(2);

      await job.handleDeadlineAlert();

      expect(notificationService.sendBulkNotification).toHaveBeenCalledTimes(2);
    });
  });
});
