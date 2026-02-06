/**
 * 관리자 통계 컨트롤러
 * 대시보드 통계 API
 */

import {
  Controller,
  Get,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AdminStatsService, DashboardStats, ProgramStats } from '../services/admin-stats.service';
import { AdminAuthGuard } from '../guards/admin-auth.guard';

@Controller('api/admin/stats')
@UseGuards(AdminAuthGuard)
export class AdminStatsController {
  private readonly logger = new Logger(AdminStatsController.name);

  constructor(private readonly statsService: AdminStatsService) {}

  /**
   * 대시보드 통계 개요 조회
   * GET /api/admin/stats/overview
   */
  @Get('overview')
  async getOverview(): Promise<DashboardStats> {
    return this.statsService.getOverview();
  }

  /**
   * 프로그램 상세 통계 조회
   * GET /api/admin/stats/programs
   */
  @Get('programs')
  async getProgramStats(): Promise<ProgramStats> {
    return this.statsService.getProgramStats();
  }
}
