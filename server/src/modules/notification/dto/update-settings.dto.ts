/**
 * 알림 설정 업데이트 DTO
 */

import { EmailDigestFrequency } from '../constants/notification.constants';
import { NotificationSetting } from '../entities/notification-setting.entity';

/**
 * 알림 설정 업데이트 요청 DTO
 */
export interface UpdateSettingsDto {
  /** 인앱 알림 활성화 */
  inAppEnabled?: boolean;
  /** 푸시 알림 활성화 */
  pushEnabled?: boolean;
  /** 이메일 알림 활성화 */
  emailEnabled?: boolean;
  /** 새 복지 알림 수신 */
  newWelfareEnabled?: boolean;
  /** 마감 임박 알림 수신 */
  deadlineAlertEnabled?: boolean;
  /** 추천 알림 수신 */
  recommendationEnabled?: boolean;
  /** 방해금지 시간 활성화 */
  quietHoursEnabled?: boolean;
  /** 방해금지 시작 시간 (HH:mm 형식) */
  quietHoursStart?: string;
  /** 방해금지 종료 시간 (HH:mm 형식) */
  quietHoursEnd?: string;
  /** 이메일 수신 빈도 */
  emailDigestFrequency?: EmailDigestFrequency;
}

/**
 * 알림 설정 조회 응답 DTO
 */
export interface GetSettingsResponseDto {
  /** 알림 설정 */
  settings: NotificationSetting;
}

/**
 * 알림 설정 업데이트 응답 DTO
 */
export interface UpdateSettingsResponseDto {
  /** 성공 여부 */
  success: boolean;
  /** 업데이트된 설정 */
  settings: NotificationSetting;
}
