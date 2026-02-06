/**
 * 감사 로그 서비스
 * 관리자 데이터 변경 이력 기록 및 조회
 */

import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import {
  AuditLogEntity,
  AuditLogWithAdmin,
  CreateAuditLogData,
  toAuditLogEntity,
  AuditChange,
} from '../entities/audit-log.entity';
import { AuditLogQueryDto, parseAuditLogQueryDto } from '../dto/audit-log-query.dto';

/** 페이지네이션 응답 */
export interface PaginatedAuditLogs {
  data: AuditLogWithAdmin[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable()
export class AdminAuditService {
  private readonly logger = new Logger(AdminAuditService.name);

  constructor(private readonly pool: Pool) {}

  /**
   * 감사 로그 생성
   */
  async createLog(data: CreateAuditLogData): Promise<AuditLogEntity> {
    const result = await this.pool.query(
      `INSERT INTO audit_log 
       (admin_id, action, entity_type, entity_id, old_value, new_value, changes, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.adminId,
        data.action,
        data.entityType,
        data.entityId,
        data.oldValue ? JSON.stringify(data.oldValue) : null,
        data.newValue ? JSON.stringify(data.newValue) : null,
        data.changes ? JSON.stringify(data.changes) : null,
        data.ipAddress ?? null,
        data.userAgent ?? null,
      ]
    );

    this.logger.log(
      `Audit log created: ${data.action} ${data.entityType} ${data.entityId} by ${data.adminId}`
    );

    return toAuditLogEntity(result.rows[0]);
  }

  /**
   * 감사 로그 목록 조회
   */
  async findAll(query: Record<string, unknown>): Promise<PaginatedAuditLogs> {
    const dto = parseAuditLogQueryDto(query);
    const { page, limit, adminId, entityType, entityId, action, startDate, endDate } = dto;
    const offset = (page - 1) * limit;

    // WHERE 절 구성
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (adminId) {
      conditions.push(`al.admin_id = $${paramIndex++}`);
      params.push(adminId);
    }

    if (entityType) {
      conditions.push(`al.entity_type = $${paramIndex++}`);
      params.push(entityType);
    }

    if (entityId) {
      conditions.push(`al.entity_id = $${paramIndex++}`);
      params.push(entityId);
    }

    if (action) {
      conditions.push(`al.action = $${paramIndex++}`);
      params.push(action);
    }

    if (startDate) {
      conditions.push(`al.created_at >= $${paramIndex++}`);
      params.push(startDate);
    }

    if (endDate) {
      conditions.push(`al.created_at <= $${paramIndex++}`);
      params.push(endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 총 개수 조회
    const countResult = await this.pool.query(
      `SELECT COUNT(*) as total FROM audit_log al ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // 데이터 조회 (관리자 정보 JOIN)
    const dataResult = await this.pool.query(
      `SELECT 
         al.*,
         au.name as admin_name,
         au.email as admin_email
       FROM audit_log al
       LEFT JOIN admin_user au ON al.admin_id = au.id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset]
    );

    const data: AuditLogWithAdmin[] = dataResult.rows.map((row) => ({
      ...toAuditLogEntity(row),
      adminName: row.admin_name,
      adminEmail: row.admin_email,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * 특정 엔티티의 감사 로그 조회
   */
  async findByEntity(entityType: string, entityId: string): Promise<AuditLogWithAdmin[]> {
    const result = await this.pool.query(
      `SELECT 
         al.*,
         au.name as admin_name,
         au.email as admin_email
       FROM audit_log al
       LEFT JOIN admin_user au ON al.admin_id = au.id
       WHERE al.entity_type = $1 AND al.entity_id = $2
       ORDER BY al.created_at DESC
       LIMIT 100`,
      [entityType, entityId]
    );

    return result.rows.map((row) => ({
      ...toAuditLogEntity(row),
      adminName: row.admin_name,
      adminEmail: row.admin_email,
    }));
  }

  /**
   * 최근 감사 로그 조회 (대시보드용)
   */
  async findRecent(limit: number = 10): Promise<AuditLogWithAdmin[]> {
    const result = await this.pool.query(
      `SELECT 
         al.*,
         au.name as admin_name,
         au.email as admin_email,
         CASE 
           WHEN al.entity_type = 'welfare_program' THEN (
             SELECT name FROM welfare_program WHERE id::text = al.entity_id LIMIT 1
           )
           ELSE NULL
         END as entity_name
       FROM audit_log al
       LEFT JOIN admin_user au ON al.admin_id = au.id
       ORDER BY al.created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows.map((row) => ({
      ...toAuditLogEntity(row),
      adminName: row.admin_name,
      adminEmail: row.admin_email,
      entityName: row.entity_name,
    }));
  }

  /**
   * 변경 사항 계산 유틸리티
   */
  calculateChanges(
    oldValue: Record<string, unknown> | null,
    newValue: Record<string, unknown> | null
  ): AuditChange[] | null {
    if (!oldValue || !newValue) return null;

    const changes: AuditChange[] = [];
    const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);

    for (const key of allKeys) {
      const oldVal = oldValue[key];
      const newVal = newValue[key];

      // JSON 직렬화하여 비교
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          field: key,
          oldValue: oldVal,
          newValue: newVal,
        });
      }
    }

    return changes.length > 0 ? changes : null;
  }
}
