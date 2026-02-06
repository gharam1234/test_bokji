/**
 * 관리자 프로그램 서비스
 * 복지 프로그램 CRUD 비즈니스 로직
 */

import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { CreateProgramDto } from '../dto/create-program.dto';
import { UpdateProgramDto } from '../dto/update-program.dto';
import { ProgramQueryDto, parseProgramQueryDto, getSortColumn } from '../dto/program-query.dto';
import { AdminAuditService } from './admin-audit.service';

/** 복지 프로그램 엔티티 */
export interface WelfareProgramEntity {
  id: string;
  name: string;
  description: string;
  summary: string;
  category: string;
  targetGroups: string[];
  eligibilityCriteria: Record<string, unknown>;
  applicationMethod: Record<string, unknown>;
  requiredDocuments: string[];
  contactInfo: Record<string, unknown> | null;
  managingOrganization: string;
  benefits: string;
  benefitAmount: string | null;
  applicationStartDate: string | null;
  applicationEndDate: string | null;
  isAlwaysOpen: boolean;
  sourceUrl: string | null;
  tags: string[];
  viewCount: number;
  bookmarkCount: number;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
}

/** DB 레코드 → 엔티티 변환 */
function toWelfareProgramEntity(row: Record<string, unknown>): WelfareProgramEntity {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    summary: row.summary as string,
    category: row.category as string,
    targetGroups: row.target_groups as string[],
    eligibilityCriteria: row.eligibility_criteria as Record<string, unknown>,
    applicationMethod: row.application_method as Record<string, unknown>,
    requiredDocuments: (row.required_documents as string[]) || [],
    contactInfo: row.contact_info as Record<string, unknown> | null,
    managingOrganization: row.managing_organization as string,
    benefits: row.benefits as string,
    benefitAmount: row.benefit_amount as string | null,
    applicationStartDate: row.application_start_date
      ? new Date(row.application_start_date as string).toISOString().split('T')[0]
      : null,
    applicationEndDate: row.application_end_date
      ? new Date(row.application_end_date as string).toISOString().split('T')[0]
      : null,
    isAlwaysOpen: row.is_always_open as boolean,
    sourceUrl: row.source_url as string | null,
    tags: (row.tags as string[]) || [],
    viewCount: row.view_count as number,
    bookmarkCount: row.bookmark_count as number,
    isActive: row.is_active as boolean,
    version: (row.version as number) || 1,
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
    createdBy: row.created_by as string | null,
    updatedBy: row.updated_by as string | null,
    deletedAt: row.deleted_at ? new Date(row.deleted_at as string).toISOString() : null,
    deletedBy: row.deleted_by as string | null,
  };
}

/** 페이지네이션 응답 */
export interface PaginatedPrograms {
  data: WelfareProgramEntity[];
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
export class AdminProgramService {
  private readonly logger = new Logger(AdminProgramService.name);

  constructor(
    private readonly pool: Pool,
    private readonly auditService: AdminAuditService
  ) {}

  /**
   * 프로그램 목록 조회
   */
  async findAll(query: Record<string, unknown>): Promise<PaginatedPrograms> {
    const dto = parseProgramQueryDto(query);
    const { page, limit, search, category, targetGroup, isActive, includeDeleted, sortBy, sortOrder } = dto;
    const offset = (page - 1) * limit;

    // WHERE 절 구성
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    // 소프트 삭제 필터
    if (!includeDeleted) {
      conditions.push('deleted_at IS NULL');
    }

    // 검색어 필터
    if (search) {
      conditions.push(`(name ILIKE $${paramIndex} OR summary ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // 카테고리 필터
    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(category);
    }

    // 대상 그룹 필터
    if (targetGroup) {
      conditions.push(`$${paramIndex++} = ANY(target_groups)`);
      params.push(targetGroup);
    }

    // 활성 상태 필터
    if (isActive !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`);
      params.push(isActive);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortColumn = getSortColumn(sortBy);
    const orderClause = `ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}`;

    // 총 개수 조회
    const countResult = await this.pool.query(
      `SELECT COUNT(*) as total FROM welfare_program ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // 데이터 조회
    const dataResult = await this.pool.query(
      `SELECT * FROM welfare_program 
       ${whereClause}
       ${orderClause}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset]
    );

    const data = dataResult.rows.map(toWelfareProgramEntity);
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
   * 프로그램 상세 조회
   */
  async findById(id: string, includeDeleted: boolean = false): Promise<WelfareProgramEntity> {
    const whereClause = includeDeleted ? '' : 'AND deleted_at IS NULL';
    
    const result = await this.pool.query(
      `SELECT * FROM welfare_program WHERE id = $1 ${whereClause}`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('프로그램을 찾을 수 없습니다.');
    }

    return toWelfareProgramEntity(result.rows[0]);
  }

  /**
   * 프로그램 생성
   */
  async create(
    dto: CreateProgramDto,
    adminId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<WelfareProgramEntity> {
    const result = await this.pool.query(
      `INSERT INTO welfare_program (
        name, description, summary, category, target_groups,
        eligibility_criteria, application_method, required_documents,
        contact_info, managing_organization, benefits, benefit_amount,
        application_start_date, application_end_date, is_always_open,
        source_url, tags, is_active, created_by, version
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 1
      ) RETURNING *`,
      [
        dto.name,
        dto.description,
        dto.summary,
        dto.category,
        dto.targetGroups,
        JSON.stringify(dto.eligibilityCriteria),
        JSON.stringify(dto.applicationMethod),
        JSON.stringify(dto.requiredDocuments || []),
        dto.contactInfo ? JSON.stringify(dto.contactInfo) : null,
        dto.managingOrganization,
        dto.benefits,
        dto.benefitAmount || null,
        dto.applicationStartDate || null,
        dto.applicationEndDate || null,
        dto.isAlwaysOpen ?? false,
        dto.sourceUrl || null,
        dto.tags || [],
        dto.isActive ?? true,
        adminId,
      ]
    );

    const program = toWelfareProgramEntity(result.rows[0]);

    // 감사 로그 기록
    await this.auditService.createLog({
      adminId,
      action: 'CREATE',
      entityType: 'welfare_program',
      entityId: program.id,
      newValue: program as unknown as Record<string, unknown>,
      ipAddress,
      userAgent,
    });

    this.logger.log(`Program created: ${program.id} by admin ${adminId}`);

    return program;
  }

  /**
   * 프로그램 수정
   */
  async update(
    id: string,
    dto: UpdateProgramDto,
    adminId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<WelfareProgramEntity> {
    // 기존 데이터 조회
    const existing = await this.findById(id);

    // Optimistic Locking 검증
    if (existing.version !== dto.version) {
      throw new ConflictException(
        '다른 관리자가 이미 수정했습니다. 페이지를 새로고침하고 다시 시도해주세요.'
      );
    }

    // 업데이트할 필드 구성
    const updates: string[] = ['updated_by = $1', 'version = version + 1'];
    const params: unknown[] = [adminId];
    let paramIndex = 2;

    if (dto.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(dto.name);
    }
    if (dto.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(dto.description);
    }
    if (dto.summary !== undefined) {
      updates.push(`summary = $${paramIndex++}`);
      params.push(dto.summary);
    }
    if (dto.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      params.push(dto.category);
    }
    if (dto.targetGroups !== undefined) {
      updates.push(`target_groups = $${paramIndex++}`);
      params.push(dto.targetGroups);
    }
    if (dto.eligibilityCriteria !== undefined) {
      updates.push(`eligibility_criteria = $${paramIndex++}`);
      params.push(JSON.stringify(dto.eligibilityCriteria));
    }
    if (dto.applicationMethod !== undefined) {
      updates.push(`application_method = $${paramIndex++}`);
      params.push(JSON.stringify(dto.applicationMethod));
    }
    if (dto.requiredDocuments !== undefined) {
      updates.push(`required_documents = $${paramIndex++}`);
      params.push(JSON.stringify(dto.requiredDocuments));
    }
    if (dto.contactInfo !== undefined) {
      updates.push(`contact_info = $${paramIndex++}`);
      params.push(dto.contactInfo ? JSON.stringify(dto.contactInfo) : null);
    }
    if (dto.managingOrganization !== undefined) {
      updates.push(`managing_organization = $${paramIndex++}`);
      params.push(dto.managingOrganization);
    }
    if (dto.benefits !== undefined) {
      updates.push(`benefits = $${paramIndex++}`);
      params.push(dto.benefits);
    }
    if (dto.benefitAmount !== undefined) {
      updates.push(`benefit_amount = $${paramIndex++}`);
      params.push(dto.benefitAmount);
    }
    if (dto.applicationStartDate !== undefined) {
      updates.push(`application_start_date = $${paramIndex++}`);
      params.push(dto.applicationStartDate);
    }
    if (dto.applicationEndDate !== undefined) {
      updates.push(`application_end_date = $${paramIndex++}`);
      params.push(dto.applicationEndDate);
    }
    if (dto.isAlwaysOpen !== undefined) {
      updates.push(`is_always_open = $${paramIndex++}`);
      params.push(dto.isAlwaysOpen);
    }
    if (dto.sourceUrl !== undefined) {
      updates.push(`source_url = $${paramIndex++}`);
      params.push(dto.sourceUrl);
    }
    if (dto.tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      params.push(dto.tags);
    }
    if (dto.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      params.push(dto.isActive);
    }

    params.push(id);

    const result = await this.pool.query(
      `UPDATE welfare_program 
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND deleted_at IS NULL
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('프로그램을 찾을 수 없습니다.');
    }

    const program = toWelfareProgramEntity(result.rows[0]);

    // 변경 내역 계산
    const changes = this.auditService.calculateChanges(
      existing as unknown as Record<string, unknown>,
      program as unknown as Record<string, unknown>
    );

    // 감사 로그 기록
    await this.auditService.createLog({
      adminId,
      action: 'UPDATE',
      entityType: 'welfare_program',
      entityId: program.id,
      oldValue: existing as unknown as Record<string, unknown>,
      newValue: program as unknown as Record<string, unknown>,
      changes,
      ipAddress,
      userAgent,
    });

    this.logger.log(`Program updated: ${program.id} by admin ${adminId}`);

    return program;
  }

  /**
   * 프로그램 삭제 (소프트 삭제)
   */
  async delete(
    id: string,
    adminId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    // 기존 데이터 조회
    const existing = await this.findById(id);

    const result = await this.pool.query(
      `UPDATE welfare_program 
       SET deleted_at = CURRENT_TIMESTAMP, deleted_by = $1
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING id`,
      [adminId, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('프로그램을 찾을 수 없습니다.');
    }

    // 감사 로그 기록
    await this.auditService.createLog({
      adminId,
      action: 'DELETE',
      entityType: 'welfare_program',
      entityId: id,
      oldValue: existing as unknown as Record<string, unknown>,
      ipAddress,
      userAgent,
    });

    this.logger.log(`Program deleted: ${id} by admin ${adminId}`);
  }

  /**
   * 프로그램 복구
   */
  async restore(
    id: string,
    adminId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<WelfareProgramEntity> {
    // 삭제된 데이터 조회
    const existing = await this.findById(id, true);

    if (!existing.deletedAt) {
      throw new BadRequestException('삭제되지 않은 프로그램입니다.');
    }

    const result = await this.pool.query(
      `UPDATE welfare_program 
       SET deleted_at = NULL, deleted_by = NULL, updated_by = $1, version = version + 1
       WHERE id = $2
       RETURNING *`,
      [adminId, id]
    );

    const program = toWelfareProgramEntity(result.rows[0]);

    // 감사 로그 기록
    await this.auditService.createLog({
      adminId,
      action: 'RESTORE',
      entityType: 'welfare_program',
      entityId: id,
      oldValue: existing as unknown as Record<string, unknown>,
      newValue: program as unknown as Record<string, unknown>,
      ipAddress,
      userAgent,
    });

    this.logger.log(`Program restored: ${id} by admin ${adminId}`);

    return program;
  }
}
