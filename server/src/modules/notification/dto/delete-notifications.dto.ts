/**
 * 알림 삭제 DTO
 */

/**
 * 알림 삭제 요청 DTO
 */
export interface DeleteNotificationsDto {
  /** 삭제할 알림 ID 배열 (빈 배열이면 전체 삭제) */
  notificationIds: string[];
}

/**
 * 알림 삭제 응답 DTO
 */
export interface DeleteNotificationsResponseDto {
  /** 성공 여부 */
  success: boolean;
  /** 삭제된 개수 */
  deletedCount: number;
}
