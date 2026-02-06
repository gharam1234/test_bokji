/**
 * 일괄 삭제 요청 DTO
 * DELETE /api/favorites/bulk 요청 본문
 */

import {
  IsArray,
  IsUUID,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

/**
 * 일괄 삭제 요청 DTO
 */
export class BulkDeleteDto {
  /**
   * 삭제할 즐겨찾기 ID 배열
   * @minItems 1
   * @maxItems 100
   */
  @IsArray({ message: 'ids는 배열이어야 합니다.' })
  @ArrayMinSize(1, { message: '최소 1개 이상의 ID가 필요합니다.' })
  @ArrayMaxSize(100, { message: '한 번에 최대 100개까지 삭제할 수 있습니다.' })
  @IsUUID('4', { each: true, message: '유효하지 않은 ID 형식입니다.' })
  ids: string[];
}

/**
 * 일괄 삭제 결과
 */
export interface BulkDeleteResult {
  /** 삭제된 개수 */
  deletedCount: number;
  /** 삭제 실패한 ID 목록 */
  failedIds: string[];
}
