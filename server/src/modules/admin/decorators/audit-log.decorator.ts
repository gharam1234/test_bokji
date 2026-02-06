/**
 * 감사 로그 데코레이터
 * 자동 감사 로그 기록을 위한 메타데이터 설정
 */

import { SetMetadata } from '@nestjs/common';
import { AuditAction, AuditEntityType } from '../entities/audit-log.entity';

/** 감사 로그 메타데이터 키 */
export const AUDIT_LOG_KEY = 'audit_log';

/** 감사 로그 메타데이터 */
export interface AuditLogMetadata {
  action: AuditAction;
  entityType: AuditEntityType;
  /** 엔티티 ID를 추출할 파라미터 이름 (기본: 'id') */
  entityIdParam?: string;
}

/**
 * 감사 로그 데코레이터
 * 컨트롤러 메서드에 적용하여 자동으로 감사 로그 기록
 * 
 * @example
 * @AuditLog({ action: 'CREATE', entityType: 'welfare_program' })
 * @Post()
 * create(@Body() dto: CreateProgramDto) { ... }
 */
export const AuditLog = (metadata: AuditLogMetadata) =>
  SetMetadata(AUDIT_LOG_KEY, metadata);
