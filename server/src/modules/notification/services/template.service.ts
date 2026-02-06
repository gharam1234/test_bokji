/**
 * 알림 템플릿 서비스
 * Handlebars 기반 템플릿 렌더링 처리
 */

import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from '../notification.repository';
import { NotificationTemplate } from '../entities/notification-template.entity';
import { NotificationType, NotificationChannel } from '../constants/notification.constants';
import { NotificationMetadata } from '../entities/notification.entity';

/**
 * 템플릿 변수 컨텍스트
 */
export interface TemplateContext {
  /** 사용자 이름 */
  userName?: string;
  /** 프로그램 ID */
  programId?: string;
  /** 프로그램 이름 */
  programName?: string;
  /** 프로그램 요약 */
  programSummary?: string;
  /** 마감일 */
  deadline?: string;
  /** 남은 일수 */
  daysLeft?: number;
  /** 매칭 점수 */
  matchScore?: number;
  /** 카테고리 */
  category?: string;
  /** 추천 개수 */
  count?: number;
  /** 추천 목록 */
  recommendationList?: string;
  /** 추가 데이터 */
  [key: string]: any;
}

/**
 * 렌더링된 알림 내용
 */
export interface RenderedNotification {
  title: string;
  message: string;
}

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  // 템플릿 캐시 (메모리 캐싱)
  private templateCache: Map<string, NotificationTemplate> = new Map();
  private cacheExpiresAt: Date | null = null;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5분

  constructor(private readonly repository: NotificationRepository) {}

  /**
   * 템플릿 렌더링
   * @param type 알림 유형
   * @param channel 알림 채널
   * @param context 템플릿 변수 컨텍스트
   */
  async renderTemplate(
    type: NotificationType,
    channel: NotificationChannel,
    context: TemplateContext,
  ): Promise<RenderedNotification> {
    // 템플릿 조회
    const template = await this.getTemplate(type, channel);

    if (!template) {
      this.logger.warn(`Template not found for type=${type}, channel=${channel}`);
      // 기본 메시지 반환
      return {
        title: this.getDefaultTitle(type),
        message: this.getDefaultMessage(type, context),
      };
    }

    // 템플릿 렌더링
    const title = this.renderString(template.titleTemplate, context);
    const message = this.renderString(template.messageTemplate, context);

    return { title, message };
  }

  /**
   * 템플릿 조회 (캐시 적용)
   */
  async getTemplate(
    type: NotificationType,
    channel: NotificationChannel,
  ): Promise<NotificationTemplate | null> {
    const cacheKey = `${type}:${channel}`;

    // 캐시 유효성 확인
    if (this.cacheExpiresAt && new Date() < this.cacheExpiresAt) {
      const cached = this.templateCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // DB에서 조회
    const template = await this.repository.findTemplate(type, channel);

    if (template) {
      // 캐시 업데이트
      this.templateCache.set(cacheKey, template);
      if (!this.cacheExpiresAt || new Date() >= this.cacheExpiresAt) {
        this.cacheExpiresAt = new Date(Date.now() + this.CACHE_TTL_MS);
      }
    }

    return template;
  }

  /**
   * 유형별 모든 채널 템플릿 조회
   */
  async getTemplatesByType(type: NotificationType): Promise<NotificationTemplate[]> {
    return this.repository.findTemplatesByType(type);
  }

  /**
   * 캐시 무효화
   */
  invalidateCache(): void {
    this.templateCache.clear();
    this.cacheExpiresAt = null;
    this.logger.debug('Template cache invalidated');
  }

  /**
   * Handlebars 스타일 문자열 렌더링
   * {{variable}} 형식의 변수를 context 값으로 치환
   */
  private renderString(template: string, context: TemplateContext): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = context[key];
      if (value === undefined || value === null) {
        return '';
      }
      return String(value);
    });
  }

  /**
   * 기본 제목 반환
   */
  private getDefaultTitle(type: NotificationType): string {
    switch (type) {
      case NotificationType.NEW_WELFARE:
        return '새로운 복지 혜택 안내';
      case NotificationType.DEADLINE_ALERT:
        return '마감 임박 알림';
      case NotificationType.PROFILE_MATCH:
        return '맞춤 복지 추천';
      case NotificationType.RECOMMENDATION:
        return '복지 추천 알림';
      case NotificationType.SYSTEM:
        return '시스템 알림';
      default:
        return '알림';
    }
  }

  /**
   * 기본 메시지 반환
   */
  private getDefaultMessage(type: NotificationType, context: TemplateContext): string {
    const { programName, daysLeft, matchScore, count } = context;

    switch (type) {
      case NotificationType.NEW_WELFARE:
        return programName
          ? `${programName} 혜택이 새로 등록되었습니다.`
          : '새로운 복지 혜택이 등록되었습니다.';
      case NotificationType.DEADLINE_ALERT:
        return programName && daysLeft !== undefined
          ? `${programName} 신청 마감이 ${daysLeft}일 남았습니다!`
          : '복지 혜택 신청 마감이 임박했습니다.';
      case NotificationType.PROFILE_MATCH:
        return matchScore !== undefined
          ? `회원님의 프로필과 ${matchScore}% 일치하는 복지 혜택을 발견했습니다.`
          : '회원님에게 맞는 복지 혜택을 발견했습니다.';
      case NotificationType.RECOMMENDATION:
        return count !== undefined
          ? `${count}개의 맞춤 복지 혜택을 추천합니다.`
          : '맞춤 복지 혜택을 확인해보세요.';
      case NotificationType.SYSTEM:
        return '시스템 공지사항이 있습니다.';
      default:
        return '새로운 알림이 있습니다.';
    }
  }

  /**
   * 메타데이터로부터 템플릿 컨텍스트 생성
   */
  createContextFromMetadata(
    metadata: NotificationMetadata | undefined,
    additionalContext?: Partial<TemplateContext>,
  ): TemplateContext {
    return {
      programId: metadata?.programId,
      programName: metadata?.programName,
      matchScore: metadata?.matchScore,
      deadline: metadata?.deadline ? new Date(metadata.deadline).toLocaleDateString('ko-KR') : undefined,
      category: metadata?.category,
      ...additionalContext,
    };
  }

  /**
   * 마감일로부터 남은 일수 계산
   */
  calculateDaysLeft(deadline: Date | string): number {
    const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }
}
