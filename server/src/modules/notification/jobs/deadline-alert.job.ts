/**
 * 마감 임박 알림 Job
 * 복지 프로그램 마감 D-7, D-3, D-1 알림 발송
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Pool } from 'pg';
import { NotificationService } from '../notification.service';
import { TemplateService } from '../services/template.service';
import {
  NotificationType,
  NotificationPriority,
} from '../constants/notification.constants';

/**
 * 마감 임박 복지 프로그램 정보
 */
interface DeadlineProgram {
  id: string;
  name: string;
  deadline: Date;
  category: string;
  daysLeft: number;
}

/**
 * 알림 대상 사용자 정보
 */
interface NotificationTarget {
  userId: string;
  programId: string;
}

@Injectable()
export class DeadlineAlertJob {
  private readonly logger = new Logger(DeadlineAlertJob.name);

  // 마감 알림 발송 기준 일수
  private readonly ALERT_DAYS = [7, 3, 1];

  constructor(
    private readonly pool: Pool,
    private readonly notificationService: NotificationService,
    private readonly templateService: TemplateService,
  ) {}

  /**
   * 매일 오전 9시에 실행
   * Cron: 0 0 9 * * * (매일 09:00)
   */
  @Cron('0 0 9 * * *')
  async handleDeadlineAlert(): Promise<void> {
    this.logger.log('Starting deadline alert job...');

    try {
      for (const days of this.ALERT_DAYS) {
        await this.processDeadlineAlerts(days);
      }

      this.logger.log('Deadline alert job completed successfully');
    } catch (error) {
      this.logger.error(`Deadline alert job failed: ${error.message}`, error.stack);
    }
  }

  /**
   * 특정 일수 마감 임박 알림 처리
   */
  private async processDeadlineAlerts(daysLeft: number): Promise<void> {
    this.logger.debug(`Processing deadline alerts for D-${daysLeft}`);

    // 마감 임박 프로그램 조회
    const programs = await this.getDeadlinePrograms(daysLeft);
    this.logger.debug(`Found ${programs.length} programs with D-${daysLeft} deadline`);

    if (programs.length === 0) {
      return;
    }

    // 각 프로그램별 대상 사용자 조회 및 알림 발송
    for (const program of programs) {
      await this.sendProgramDeadlineAlerts(program);
    }
  }

  /**
   * 특정 일수 후 마감되는 프로그램 조회
   */
  private async getDeadlinePrograms(daysLeft: number): Promise<DeadlineProgram[]> {
    // 마감일이 오늘 기준 daysLeft일 후인 프로그램 조회
    const query = `
      SELECT 
        id, 
        name, 
        deadline, 
        category,
        EXTRACT(DAY FROM deadline - CURRENT_DATE)::int as days_left
      FROM welfare_program
      WHERE 
        is_active = true 
        AND deleted_at IS NULL
        AND deadline IS NOT NULL
        AND DATE(deadline) = CURRENT_DATE + INTERVAL '${daysLeft} days'
    `;

    try {
      const result = await this.pool.query(query);
      return result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        deadline: new Date(row.deadline),
        category: row.category,
        daysLeft: row.days_left,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch deadline programs: ${error.message}`);
      return [];
    }
  }

  /**
   * 프로그램 마감 임박 알림 발송
   */
  private async sendProgramDeadlineAlerts(program: DeadlineProgram): Promise<void> {
    this.logger.debug(
      `Sending deadline alerts for program: ${program.name} (D-${program.daysLeft})`,
    );

    // 해당 프로그램을 북마크한 사용자 또는 관심 사용자 조회
    const targetUsers = await this.getTargetUsers(program.id);
    this.logger.debug(`Found ${targetUsers.length} target users for program ${program.name}`);

    if (targetUsers.length === 0) {
      return;
    }

    // 템플릿 렌더링
    const context = this.templateService.createContextFromMetadata(
      {
        programId: program.id,
        programName: program.name,
        deadline: program.deadline,
        category: program.category,
      },
      {
        daysLeft: program.daysLeft,
      },
    );

    // 대량 알림 발송
    const userIds = targetUsers.map((t) => t.userId);

    try {
      const sentCount = await this.notificationService.sendBulkNotification({
        userIds,
        type: NotificationType.DEADLINE_ALERT,
        title: `마감 임박: ${program.name}`,
        message: `${program.name} 신청 마감이 ${program.daysLeft}일 남았습니다!`,
        linkUrl: `/welfare/${program.id}`,
        metadata: {
          programId: program.id,
          programName: program.name,
          deadline: program.deadline,
          category: program.category,
        },
        priority:
          program.daysLeft <= 1 ? NotificationPriority.HIGH : NotificationPriority.NORMAL,
      });

      this.logger.log(
        `Sent ${sentCount} deadline alerts for program ${program.name} (D-${program.daysLeft})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send deadline alerts for program ${program.name}: ${error.message}`,
      );
    }
  }

  /**
   * 알림 대상 사용자 조회
   * - 해당 프로그램을 북마크한 사용자
   * - 추천 목록에 있는 사용자
   */
  private async getTargetUsers(programId: string): Promise<NotificationTarget[]> {
    // 북마크한 사용자 조회
    const bookmarkQuery = `
      SELECT DISTINCT user_id
      FROM recommendation
      WHERE welfare_program_id = $1 AND bookmarked_at IS NOT NULL
    `;

    // 추천받은 사용자 조회 (최근 30일)
    const recommendationQuery = `
      SELECT DISTINCT user_id
      FROM recommendation
      WHERE welfare_program_id = $1 
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    `;

    try {
      const [bookmarkResult, recommendationResult] = await Promise.all([
        this.pool.query(bookmarkQuery, [programId]),
        this.pool.query(recommendationQuery, [programId]),
      ]);

      // 중복 제거
      const userIdSet = new Set<string>();
      bookmarkResult.rows.forEach((row) => userIdSet.add(row.user_id));
      recommendationResult.rows.forEach((row) => userIdSet.add(row.user_id));

      return Array.from(userIdSet).map((userId) => ({
        userId,
        programId,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch target users: ${error.message}`);
      return [];
    }
  }

  /**
   * 수동 실행 (관리자용)
   * @param daysLeft 마감까지 남은 일수
   */
  async runManually(daysLeft?: number): Promise<void> {
    this.logger.log(`Running manual deadline alert job${daysLeft ? ` for D-${daysLeft}` : ''}`);

    if (daysLeft !== undefined) {
      await this.processDeadlineAlerts(daysLeft);
    } else {
      for (const days of this.ALERT_DAYS) {
        await this.processDeadlineAlerts(days);
      }
    }
  }
}
