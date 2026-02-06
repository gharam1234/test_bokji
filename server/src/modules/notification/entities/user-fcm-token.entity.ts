/**
 * FCM 토큰 엔티티
 * 사용자 푸시 알림 토큰 관리
 */

import { DeviceType } from '../constants/notification.constants';

/**
 * FCM 토큰 엔티티 인터페이스
 */
export interface UserFcmToken {
  /** 토큰 레코드 고유 ID */
  id: string;
  /** 사용자 ID */
  userId: string;
  /** FCM 토큰 문자열 */
  token: string;
  /** 디바이스 유형 */
  deviceType: DeviceType;
  /** 활성화 여부 */
  isActive: boolean;
  /** 마지막 사용 시각 */
  lastUsedAt: Date;
  /** 생성 시각 */
  createdAt: Date;
}

/**
 * FCM 토큰 생성/업데이트 데이터
 */
export interface UpsertFcmTokenData {
  userId: string;
  token: string;
  deviceType: DeviceType;
}

/**
 * DB 로우를 엔티티로 변환
 */
export function mapRowToUserFcmToken(row: any): UserFcmToken {
  return {
    id: row.id,
    userId: row.user_id,
    token: row.token,
    deviceType: row.device_type as DeviceType,
    isActive: row.is_active,
    lastUsedAt: new Date(row.last_used_at),
    createdAt: new Date(row.created_at),
  };
}
