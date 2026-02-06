/**
 * CleanupJob 테스트
 */

import { Test, TestingModule } from '@nestjs/testing';
import { CleanupJob } from '../cleanup.job';
import { NotificationRepository } from '../../notification.repository';

describe('CleanupJob', () => {
  let job: CleanupJob;
  let repository: jest.Mocked<NotificationRepository>;

  beforeEach(async () => {
    const mockRepository = {
      deleteOldNotifications: jest.fn().mockResolvedValue(10),
      pool: {
        query: jest.fn().mockResolvedValue({ rowCount: 5 }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CleanupJob,
        { provide: NotificationRepository, useValue: mockRepository },
      ],
    }).compile();

    job = module.get<CleanupJob>(CleanupJob);
    repository = module.get(NotificationRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleCleanup', () => {
    it('오래된 알림을 삭제해야 한다', async () => {
      const result = await job.handleCleanup();

      expect(result.deletedNotifications).toBe(10);
      expect(repository.deleteOldNotifications).toHaveBeenCalled();
    });

    it('오래된 발송 로그를 삭제해야 한다', async () => {
      const result = await job.handleCleanup();

      expect(result.deletedLogs).toBe(5);
      expect(repository['pool'].query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM notification_log'),
      );
    });

    it('처리 완료된 예약 알림을 삭제해야 한다', async () => {
      const result = await job.handleCleanup();

      expect(result.deletedScheduled).toBe(5);
      expect(repository['pool'].query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM scheduled_notification'),
      );
    });

    it('실행 시간을 기록해야 한다', async () => {
      const beforeTime = new Date();
      const result = await job.handleCleanup();
      const afterTime = new Date();

      expect(result.executedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(result.executedAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('모든 삭제 작업 결과를 반환해야 한다', async () => {
      repository.deleteOldNotifications.mockResolvedValue(15);
      repository['pool'].query
        .mockResolvedValueOnce({ rowCount: 20 })
        .mockResolvedValueOnce({ rowCount: 8 });

      const result = await job.handleCleanup();

      expect(result).toEqual({
        deletedNotifications: 15,
        deletedLogs: 20,
        deletedScheduled: 8,
        executedAt: expect.any(Date),
      });
    });
  });

  describe('runManually', () => {
    it('수동으로 정리 작업을 실행할 수 있어야 한다', async () => {
      const result = await job.runManually();

      expect(result.deletedNotifications).toBe(10);
      expect(repository.deleteOldNotifications).toHaveBeenCalled();
    });
  });

  describe('cleanupUserNotifications', () => {
    it('특정 사용자의 오래된 알림을 삭제해야 한다', async () => {
      repository['pool'].query.mockResolvedValue({ rowCount: 3 });

      const count = await job.cleanupUserNotifications('user-1', 30);

      expect(count).toBe(3);
      expect(repository['pool'].query).toHaveBeenCalledWith(
        expect.stringContaining('user_id = $1'),
        ['user-1'],
      );
    });

    it('기본 보관 기간을 사용해야 한다', async () => {
      repository['pool'].query.mockResolvedValue({ rowCount: 5 });

      await job.cleanupUserNotifications('user-1');

      expect(repository['pool'].query).toHaveBeenCalledWith(
        expect.stringContaining('30 days'),
        ['user-1'],
      );
    });
  });

  describe('getCleanupStats', () => {
    it('정리 대상 통계를 반환해야 한다', async () => {
      repository['pool'].query
        .mockResolvedValueOnce({ rows: [{ count: '100' }] }) // total
        .mockResolvedValueOnce({ rows: [{ count: '20' }] }) // old notifications
        .mockResolvedValueOnce({ rows: [{ count: '50' }] }) // old logs
        .mockResolvedValueOnce({ rows: [{ count: '10' }] }); // processed scheduled

      const stats = await job.getCleanupStats();

      expect(stats).toEqual({
        totalNotifications: 100,
        oldNotifications: 20,
        oldLogs: 50,
        processedScheduled: 10,
      });
    });

    it('쿼리 실패 시 0을 반환해야 한다', async () => {
      repository['pool'].query.mockRejectedValue(new Error('DB 오류'));

      const stats = await job.getCleanupStats();

      expect(stats).toEqual({
        totalNotifications: 0,
        oldNotifications: 0,
        oldLogs: 0,
        processedScheduled: 0,
      });
    });
  });

  describe('에러 처리', () => {
    it('알림 삭제 실패 시 0을 반환해야 한다', async () => {
      repository.deleteOldNotifications.mockRejectedValue(new Error('삭제 실패'));

      const result = await job.handleCleanup();

      // 알림 삭제가 실패해도 다른 작업은 계속
      expect(result.deletedLogs).toBe(5);
    });

    it('로그 삭제 실패 시 0을 반환해야 한다', async () => {
      repository['pool'].query
        .mockRejectedValueOnce(new Error('로그 삭제 실패'))
        .mockResolvedValueOnce({ rowCount: 5 });

      const result = await job.handleCleanup();

      expect(result.deletedLogs).toBe(0);
      expect(result.deletedScheduled).toBe(5);
    });
  });
});
