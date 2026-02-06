/**
 * 관리자 감사 로그 컨트롤러
 * 감사 로그 조회 API
 */

import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AdminAuditService, PaginatedAuditLogs } from '../services/admin-audit.service';
import { AuditLogWithAdmin } from '../entities/audit-log.entity';
import { AdminAuthGuard } from '../guards/admin-auth.guard';

@Controller('api/admin/audit-logs')
@UseGuards(AdminAuthGuard)
export class AdminAuditController {
  private readonly logger = new Logger(AdminAuditController.name);

  constructor(private readonly auditService: AdminAuditService) {}

  /**
   * 감사 로그 목록 조회
   * GET /api/admin/audit-logs
   */
  @Get()
  async findAll(@Query() query: Record<string, unknown>): Promise<PaginatedAuditLogs> {
    return this.auditService.findAll(query);
  }

  /**
   * 특정 엔티티의 감사 로그 조회
   * GET /api/admin/audit-logs/entity/:type/:id
   */
  @Get('entity/:type/:id')
  async findByEntity(
    @Param('type') entityType: string,
    @Param('id') entityId: string
  ): Promise<AuditLogWithAdmin[]> {
    return this.auditService.findByEntity(entityType, entityId);
  }

  /**
   * 최근 감사 로그 조회 (대시보드용)
   * GET /api/admin/audit-logs/recent
   */
  @Get('recent')
  async findRecent(@Query('limit') limit?: string): Promise<AuditLogWithAdmin[]> {
    const limitNum = parseInt(limit || '10', 10);
    return this.auditService.findRecent(Math.min(limitNum, 50));
  }
}
