/**
 * 새로고침 응답 DTO
 */

/** 추천 새로고침 응답 */
export interface RefreshResponseDto {
  success: boolean;
  updatedCount: number;
  message: string;
}

/** 조회 기록 응답 */
export interface ViewRecordResponseDto {
  success: boolean;
  viewedAt: string;
}
