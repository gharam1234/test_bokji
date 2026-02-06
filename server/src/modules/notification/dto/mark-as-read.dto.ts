/**
 * 알림 읽음 처리 DTO
 */

/**
 * 알림 읽음 처리 요청 DTO
 */
export interface MarkAsReadDto {
  /** 읽음 처리할 알림 ID 배열 (빈 배열이면 전체 읽음 처리) */
  notificationIds: string[];
}

/**
 * 알림 읽음 처리 응답 DTO
 */
export interface MarkAsReadResponseDto {
  /** 성공 여부 */
  success: boolean;
  /** 업데이트된 개수 */
  updatedCount: number;
}

/**
 * 단일 알림 읽음 처리 응답 DTO
 */
export interface MarkSingleAsReadResponseDto {
  /** 성공 여부 */
  success: boolean;
  /** 읽은 시각 */
  readAt: Date;
}
