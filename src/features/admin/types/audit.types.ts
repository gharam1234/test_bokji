/**
 * 감사 로그 관련 타입 정의
 */

/** 감사 로그 액션 */
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';

/** 엔티티 타입 */
export type EntityType = 'welfare_program' | 'admin_user';

/** 변경 내역 */
export interface AuditChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

/** 감사 로그 */
export interface AuditLog {
  id: string;
  adminId: string;
  adminName?: string;
  adminEmail?: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  entityName?: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  changes: AuditChange[] | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

/** 감사 로그 조회 파라미터 */
export interface AuditLogParams {
  page?: number;
  limit?: number;
  adminId?: string;
  entityType?: EntityType;
  entityId?: string;
  action?: AuditAction;
  startDate?: string;
  endDate?: string;
}
