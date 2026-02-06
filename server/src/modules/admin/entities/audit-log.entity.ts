/**
 * 감사 로그 엔티티
 * 관리자 데이터 변경 이력 추적
 */

/** 감사 로그 액션 타입 */
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';

/** 감사 로그 엔티티 타입 */
export type AuditEntityType = 'welfare_program' | 'admin_user';

/** 변경 내역 */
export interface AuditChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

/** 감사 로그 엔티티 */
export interface AuditLogEntity {
  /** 로그 ID (UUID) */
  id: string;

  /** 작업 수행 관리자 ID */
  adminId: string;

  /** 수행된 액션 */
  action: AuditAction;

  /** 대상 엔티티 타입 */
  entityType: AuditEntityType;

  /** 대상 엔티티 ID */
  entityId: string;

  /** 변경 전 데이터 */
  oldValue: Record<string, unknown> | null;

  /** 변경 후 데이터 */
  newValue: Record<string, unknown> | null;

  /** 변경된 필드 목록 */
  changes: AuditChange[] | null;

  /** 요청 IP 주소 */
  ipAddress: string | null;

  /** 요청 User-Agent */
  userAgent: string | null;

  /** 생성 시간 */
  createdAt: Date;
}

/** DB 레코드 → 엔티티 변환 */
export function toAuditLogEntity(row: Record<string, unknown>): AuditLogEntity {
  return {
    id: row.id as string,
    adminId: row.admin_id as string,
    action: row.action as AuditAction,
    entityType: row.entity_type as AuditEntityType,
    entityId: row.entity_id as string,
    oldValue: row.old_value as Record<string, unknown> | null,
    newValue: row.new_value as Record<string, unknown> | null,
    changes: row.changes as AuditChange[] | null,
    ipAddress: row.ip_address as string | null,
    userAgent: row.user_agent as string | null,
    createdAt: new Date(row.created_at as string),
  };
}

/** 감사 로그 생성 데이터 */
export interface CreateAuditLogData {
  adminId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  changes?: AuditChange[] | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/** 감사 로그 응답 (관리자 정보 포함) */
export interface AuditLogWithAdmin extends AuditLogEntity {
  adminName?: string;
  adminEmail?: string;
  entityName?: string;
}
