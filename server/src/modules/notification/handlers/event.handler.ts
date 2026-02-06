/**
 * 알림 이벤트 핸들러
 * 복지 관련 이벤트를 수신하여 알림 발송 처리
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from '../notification.service';
import { SchedulerService } from '../services/scheduler.service';
import { TemplateService } from '../services/template.service';
import {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
} from '../constants/notification.constants';
import { Pool } from 'pg';

// ==================== 이벤트 타입 ====================

/**
 * 새 복지 프로그램 등록 이벤트
 */
export interface NewWelfareProgramEvent {
  type: 'NEW_WELFARE_PROGRAM';
  programId: string;
  programName: string;
  category: string;
  targetGroups?: string[];
  createdAt: Date;
}

/**
 * 복지 프로그램 마감 임박 이벤트
 */
export interface WelfareDeadlineEvent {
  type: 'WELFARE_DEADLINE';
  programId: string;
  programName: string;
  deadline: Date;
  daysLeft: number;
}

/**
 * 프로필 업데이트 이벤트
 */
export interface ProfileUpdatedEvent {
  type: 'PROFILE_UPDATED';
  userId: string;
  updatedFields: string[];
}

/**
 * 추천 생성 이벤트
 */
export interface RecommendationCreatedEvent {
  type: 'RECOMMENDATION_CREATED';
  userId: string;
  recommendations: Array<{
    programId: string;
    programName: string;
    matchScore: number;
  }>;
}

/**
 * 복지 프로그램 북마크 이벤트
 */
export interface WelfareBookmarkedEvent {
  type: 'WELFARE_BOOKMARKED';
  userId: string;
  programId: string;
  programName: string;
}

// ==================== 이벤트 핸들러 인터페이스 ====================

export interface INotificationEventHandler {
  handleNewWelfareProgram(event: NewWelfareProgramEvent): Promise<void>;
  handleWelfareDeadline(event: WelfareDeadlineEvent): Promise<void>;
  handleProfileUpdated(event: ProfileUpdatedEvent): Promise<void>;
}

// ==================== 이벤트 핸들러 구현 ====================

@Injectable()
export class EventHandler implements INotificationEventHandler {
  private readonly logger = new Logger(EventHandler.name);

  constructor(
    private readonly pool: Pool,
    private readonly notificationService: NotificationService,
    private readonly schedulerService: SchedulerService,
    private readonly templateService: TemplateService,
  ) {}

  /**
   * 새 복지 프로그램 등록 이벤트 처리
   */
  @OnEvent('welfare.created')
  async handleNewWelfareProgram(event: NewWelfareProgramEvent): Promise<void> {
    this.logger.log(`Handling new welfare program event: ${event.programName}`);

    try {
      // 대상 사용자 조회 (프로필 매칭 기반)
      const targetUserIds = await this.findMatchingUsers(event);

      if (targetUserIds.length === 0) {
        this.logger.debug('No matching users found for new welfare notification');
        return;
      }

      // 알림 발송 예약 (즉시 발송 대신 스케줄러 활용)
      await this.schedulerService.scheduleNewWelfareNotification(event.programId);

      this.logger.log(
        `Scheduled new welfare notification for ${event.programName} to ${targetUserIds.length} users`,
      );
    } catch (error) {
      this.logger.error(`Failed to handle new welfare program event: ${error.message}`);
    }
  }

  /**
   * 복지 프로그램 마감 임박 이벤트 처리
   */
  @OnEvent('welfare.deadline')
  async handleWelfareDeadline(event: WelfareDeadlineEvent): Promise<void> {
    this.logger.log(
      `Handling welfare deadline event: ${event.programName} (D-${event.daysLeft})`,
    );

    try {
      // 해당 프로그램에 관심있는 사용자 조회
      const targetUserIds = await this.findInterestedUsers(event.programId);

      if (targetUserIds.length === 0) {
        this.logger.debug('No interested users found for deadline notification');
        return;
      }

      // 마감 알림 발송
      await this.notificationService.sendBulkNotification({
        userIds: targetUserIds,
        type: NotificationType.DEADLINE_ALERT,
        title: `마감 임박: ${event.programName}`,
        message: `${event.programName} 신청 마감이 ${event.daysLeft}일 남았습니다!`,
        linkUrl: `/welfare/${event.programId}`,
        metadata: {
          programId: event.programId,
          programName: event.programName,
          deadline: event.deadline,
        },
        priority:
          event.daysLeft <= 1 ? NotificationPriority.HIGH : NotificationPriority.NORMAL,
      });

      this.logger.log(
        `Sent deadline alert for ${event.programName} to ${targetUserIds.length} users`,
      );
    } catch (error) {
      this.logger.error(`Failed to handle welfare deadline event: ${error.message}`);
    }
  }

  /**
   * 프로필 업데이트 이벤트 처리
   * 프로필 변경 시 새로운 매칭 복지 확인
   */
  @OnEvent('profile.updated')
  async handleProfileUpdated(event: ProfileUpdatedEvent): Promise<void> {
    this.logger.log(`Handling profile updated event for user: ${event.userId}`);

    try {
      // 프로필 업데이트로 인한 새로운 매칭 복지가 있는지 확인
      const newMatches = await this.findNewMatchesAfterProfileUpdate(
        event.userId,
        event.updatedFields,
      );

      if (newMatches.length === 0) {
        this.logger.debug('No new matches found after profile update');
        return;
      }

      // 새로운 매칭 알림 발송
      await this.notificationService.sendNotification({
        userId: event.userId,
        type: NotificationType.PROFILE_MATCH,
        title: '맞춤 복지 추천',
        message: `프로필 업데이트로 ${newMatches.length}개의 새로운 복지 혜택이 발견되었습니다.`,
        linkUrl: '/recommendations',
        metadata: {
          count: newMatches.length,
          matchScore: newMatches[0]?.matchScore || 0,
        },
      });

      this.logger.log(`Sent profile match notification to user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Failed to handle profile updated event: ${error.message}`);
    }
  }

  /**
   * 추천 생성 이벤트 처리
   */
  @OnEvent('recommendation.created')
  async handleRecommendationCreated(event: RecommendationCreatedEvent): Promise<void> {
    this.logger.log(`Handling recommendation created event for user: ${event.userId}`);

    try {
      if (event.recommendations.length === 0) {
        return;
      }

      const topRecommendation = event.recommendations[0];

      await this.notificationService.sendNotification({
        userId: event.userId,
        type: NotificationType.RECOMMENDATION,
        title: '맞춤 복지 추천',
        message:
          event.recommendations.length > 1
            ? `${topRecommendation.programName} 외 ${event.recommendations.length - 1}개의 맞춤 복지가 추천되었습니다.`
            : `${topRecommendation.programName} 복지가 추천되었습니다.`,
        linkUrl: '/recommendations',
        metadata: {
          programId: topRecommendation.programId,
          programName: topRecommendation.programName,
          matchScore: topRecommendation.matchScore,
          count: event.recommendations.length,
        },
      });

      this.logger.log(`Sent recommendation notification to user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Failed to handle recommendation created event: ${error.message}`);
    }
  }

  /**
   * 복지 프로그램 북마크 이벤트 처리
   * 북마크한 프로그램의 마감 알림 구독
   */
  @OnEvent('welfare.bookmarked')
  async handleWelfareBookmarked(event: WelfareBookmarkedEvent): Promise<void> {
    this.logger.log(
      `User ${event.userId} bookmarked welfare program: ${event.programName}`,
    );
    // 북마크 시 별도 알림 없음 (마감 알림은 DeadlineAlertJob에서 처리)
  }

  // ==================== Private 헬퍼 메서드 ====================

  /**
   * 새 복지 프로그램과 매칭되는 사용자 조회
   */
  private async findMatchingUsers(event: NewWelfareProgramEvent): Promise<string[]> {
    // 해당 카테고리에 관심있거나 프로필이 매칭되는 사용자 조회
    const query = `
      SELECT DISTINCT ns.user_id
      FROM notification_setting ns
      WHERE ns.new_welfare_enabled = true AND ns.in_app_enabled = true
      LIMIT 1000
    `;

    try {
      const result = await this.pool.query(query);
      return result.rows.map((row) => row.user_id);
    } catch (error) {
      this.logger.error(`Failed to find matching users: ${error.message}`);
      return [];
    }
  }

  /**
   * 복지 프로그램에 관심있는 사용자 조회 (북마크, 추천 기반)
   */
  private async findInterestedUsers(programId: string): Promise<string[]> {
    const query = `
      SELECT DISTINCT r.user_id
      FROM recommendation r
      INNER JOIN notification_setting ns ON r.user_id = ns.user_id
      WHERE r.welfare_program_id = $1 
        AND ns.deadline_alert_enabled = true
        AND ns.in_app_enabled = true
        AND (r.bookmarked_at IS NOT NULL OR r.created_at >= CURRENT_DATE - INTERVAL '30 days')
    `;

    try {
      const result = await this.pool.query(query, [programId]);
      return result.rows.map((row) => row.user_id);
    } catch (error) {
      this.logger.error(`Failed to find interested users: ${error.message}`);
      return [];
    }
  }

  /**
   * 프로필 업데이트 후 새로운 매칭 복지 조회
   */
  private async findNewMatchesAfterProfileUpdate(
    userId: string,
    updatedFields: string[],
  ): Promise<Array<{ programId: string; programName: string; matchScore: number }>> {
    // 실제 구현 시 Recommendation 모듈과 연동하여 새로운 매칭 계산
    // 현재는 간단한 쿼리로 대체
    const query = `
      SELECT 
        wp.id as program_id, 
        wp.name as program_name,
        80 as match_score
      FROM welfare_program wp
      WHERE wp.is_active = true 
        AND wp.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM recommendation r 
          WHERE r.welfare_program_id = wp.id AND r.user_id = $1
        )
      LIMIT 5
    `;

    try {
      const result = await this.pool.query(query, [userId]);
      return result.rows.map((row) => ({
        programId: row.program_id,
        programName: row.program_name,
        matchScore: row.match_score,
      }));
    } catch (error) {
      this.logger.error(`Failed to find new matches: ${error.message}`);
      return [];
    }
  }
}
