/**
 * FCM 토큰 등록 DTO
 */

import { DeviceType } from '../constants/notification.constants';

/**
 * FCM 토큰 등록 요청 DTO
 */
export interface RegisterFcmTokenDto {
  /** FCM 토큰 문자열 */
  token: string;
  /** 디바이스 유형 */
  deviceType: DeviceType;
}

/**
 * FCM 토큰 삭제 요청 DTO
 */
export interface DeleteFcmTokenDto {
  /** FCM 토큰 문자열 */
  token: string;
}

/**
 * FCM 토큰 응답 DTO
 */
export interface FcmTokenResponseDto {
  /** 성공 여부 */
  success: boolean;
}
