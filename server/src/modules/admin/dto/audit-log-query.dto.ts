/**
 * 감사 로그 조회 쿼리 DTO
 * 감사 로그 목록 조회 시 필터, 페이지네이션 파라미터
 */

import { AuditAction, AuditEntityType } from '../entities/audit-log.entity';

/** 감사 로그 조회 쿼리 DTO */
export interface AuditLogQueryDto {
  /** 페이지 번호 (1부터 시작) */
  page: number;

  /** 페이지당 항목 수 */
  limit: number;

  /** 관리자 ID 필터 */
  adminId?: string;

  /** 엔티티 타입 필터 */
  entityType?: AuditEntityType;

  /** 엔티티 ID 필터 */
  entityId?: string;

  /** 액션 필터 */
  action?: AuditAction;

  /** 시작 날짜 */
  startDate?: string;

  /** 종료 날짜 */
  endDate?: string;
}

/** 기본 쿼리 값 */
export const DEFAULT_AUDIT_LOG_QUERY: AuditLogQueryDto = {
  page: 1,
  limit: 20,
};

/** 유효한 액션 목록 */
const VALID_ACTIONS: AuditAction[] = ['CREATE', 'UPDATE', 'DELETE', 'RESTORE'];

/** 유효한 엔티티 타입 목록 */
const VALID_ENTITY_TYPES: AuditEntityType[] = ['welfare_program', 'admin_user'];

/** 감사 로그 조회 쿼리 DTO 파싱 */
export function parseAuditLogQueryDto(query: Record<string, unknown>): AuditLogQueryDto {
  const result: AuditLogQueryDto = { ...DEFAULT_AUDIT_LOG_QUERY };

  // 페이지 번호
  if (query.page !== undefined) {
    const page = parseInt(query.page as string, 10);
    if (!isNaN(page) && page >= 1) {
      result.page = page;
    }
  }

  // 페이지당 항목 수 (최소 1, 최대 100)
  if (query.limit !== undefined) {
    const limit = parseInt(query.limit as string, 10);
    if (!isNaN(limit) && limit >= 1 && limit <= 100) {
      result.limit = limit;
    }
  }

  // 관리자 ID 필터
  if (query.adminId && typeof query.adminId === 'string') {
    result.adminId = query.adminId;
  }

  // 엔티티 타입 필터
  if (query.entityType && VALID_ENTITY_TYPES.includes(query.entityType as AuditEntityType)) {
    result.entityType = query.entityType as AuditEntityType;
  }

  // 엔티티 ID 필터
  if (query.entityId && typeof query.entityId === 'string') {
    result.entityId = query.entityId;
  }

  // 액션 필터
  if (query.action && VALID_ACTIONS.includes(query.action as AuditAction)) {
    result.action = query.action as AuditAction;
  }

  // 시작 날짜
  if (query.startDate && typeof query.startDate === 'string') {
    const date = new Date(query.startDate);
    if (!isNaN(date.getTime())) {
      result.startDate = query.startDate;
    }
  }

  // 종료 날짜
  if (query.endDate && typeof query.endDate === 'string') {
    const date = new Date(query.endDate);
    if (!isNaN(date.getTime())) {
      result.endDate = query.endDate;
    }
  }

  return result;
}
