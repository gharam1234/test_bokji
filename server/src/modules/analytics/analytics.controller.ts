/**
 * Analytics Controller
 * 분석 API 엔드포인트 처리
 */

import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import {
  SummaryQueryDto,
  TrendQueryDto,
  AnalyticsSummaryResponseDto,
  ActivityTrendResponseDto,
  RecommendationStatsDto,
  CategoryCountDto,
  UserInsightDto,
} from './dto/analytics-summary.dto';
import { PDFReportQueryDto } from './dto/pdf-report.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('api/analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /api/analytics/summary
   * 전체 분석 요약 데이터 조회
   */
  @Get('summary')
  async getSummary(
    @Query() query: SummaryQueryDto,
    @CurrentUser('userId') userId?: string,
  ): Promise<AnalyticsSummaryResponseDto> {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.analyticsService.getSummary(
      userId!,
      query.period || 'month',
      startDate,
      endDate,
    );
  }

  /**
   * GET /api/analytics/category-distribution
   * 카테고리별 분포 조회
   */
  @Get('category-distribution')
  async getCategoryDistribution(
    @Query() query: SummaryQueryDto,
    @CurrentUser('userId') userId?: string,
  ): Promise<CategoryCountDto[]> {
    const { start, end } = this.getPeriodDates(
      query.period || 'month',
      query.startDate,
      query.endDate,
    );

    return this.analyticsService.getCategoryDistribution(userId!, start, end);
  }

  /**
   * GET /api/analytics/activity-trend
   * 활동 트렌드 조회
   */
  @Get('activity-trend')
  async getActivityTrend(
    @Query() query: TrendQueryDto,
    @CurrentUser('userId') userId?: string,
  ): Promise<ActivityTrendResponseDto> {
    return this.analyticsService.getActivityTrendDetail(
      userId!,
      query.period || 'month',
      query.granularity,
    );
  }

  /**
   * GET /api/analytics/recommendation-stats
   * 추천 통계 조회
   */
  @Get('recommendation-stats')
  async getRecommendationStats(
    @Query() query: SummaryQueryDto,
    @CurrentUser('userId') userId?: string,
  ): Promise<RecommendationStatsDto> {
    const { start, end } = this.getPeriodDates(
      query.period || 'month',
      query.startDate,
      query.endDate,
    );

    return this.analyticsService.getRecommendationStats(userId!, start, end);
  }

  /**
   * GET /api/analytics/favorites-summary
   * 즐겨찾기 요약 조회
   */
  @Get('favorites-summary')
  async getFavoritesSummary(
    @Query() query: SummaryQueryDto,
    @CurrentUser('userId') userId?: string,
  ) {
    const { start, end } = this.getPeriodDates(
      query.period || 'month',
      query.startDate,
      query.endDate,
    );

    return this.analyticsService.getFavoritesSummary(userId!, start, end);
  }

  /**
   * GET /api/analytics/insights
   * 개인화 인사이트 목록 조회
   */
  @Get('insights')
  async getInsights(
    @Query('limit') limit?: number,
    @CurrentUser('userId') userId?: string,
  ): Promise<UserInsightDto[]> {
    return this.analyticsService.getInsights(userId!, limit);
  }

  /**
   * PATCH /api/analytics/insights/:id/read
   * 인사이트 읽음 처리
   */
  @Patch('insights/:id/read')
  async markInsightAsRead(
    @Param('id') insightId: string,
    @CurrentUser('userId') userId?: string,
  ): Promise<void> {
    await this.analyticsService.markInsightAsRead(userId!, insightId);
  }

  /**
   * GET /api/analytics/report/pdf
   * PDF 리포트 다운로드
   */
  @Get('report/pdf')
  async downloadPDFReport(
    @Query() query: PDFReportQueryDto,
    @Res() res: Response,
    @CurrentUser('userId') userId?: string,
  ): Promise<void> {
    const { buffer, filename } = await this.analyticsService.generatePDFReport(
      userId!,
      {
        period: query.period || 'month',
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        includeInsights: query.includeInsights ?? true,
        includeCharts: query.includeCharts ?? true,
        language: query.language || 'ko',
      },
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.status(HttpStatus.OK).send(buffer);
  }

  /**
   * 헬퍼: 기간 문자열을 날짜 범위로 변환
   */
  private getPeriodDates(
    period: 'week' | 'month' | 'quarter' | 'year',
    startDateStr?: string,
    endDateStr?: string,
  ): { start: Date; end: Date } {
    if (startDateStr && endDateStr) {
      return {
        start: new Date(startDateStr),
        end: new Date(endDateStr),
      };
    }

    const now = new Date();

    switch (period) {
      case 'week':
        return {
          start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: now,
        };
      case 'month':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        };
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        return {
          start: new Date(now.getFullYear(), quarter * 3, 1),
          end: new Date(now.getFullYear(), quarter * 3 + 3, 0),
        };
      case 'year':
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: new Date(now.getFullYear(), 11, 31),
        };
      default:
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        };
    }
  }
}
