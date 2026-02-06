/**
 * 추천 컨트롤러
 * 복지 추천 API 엔드포인트 처리
 */

import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import {
  GetRecommendationsDto,
} from './dto/get-recommendations.dto';
import {
  RecommendationListResponseDto,
} from './dto/recommendation-response.dto';
import {
  WelfareDetailResponseDto,
} from './dto/welfare-detail.dto';
import {
  RefreshResponseDto,
  ViewRecordResponseDto,
} from './dto/refresh-response.dto';
import { WelfareCategory, SortOption } from './entities';
import { RateLimit, RateLimitInterceptor } from './interceptors';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('api/recommendations')
@UseInterceptors(RateLimitInterceptor)
@UseGuards(AuthGuard)
export class RecommendationController {
  private readonly logger = new Logger(RecommendationController.name);

  constructor(private readonly recommendationService: RecommendationService) {}

  /**
   * GET /api/recommendations
   * 추천 복지 목록 조회
   */
  @Get()
  async getRecommendations(
    @Query('category') category?: WelfareCategory,
    @Query('sortBy') sortBy?: SortOption,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser('userId') userId?: string,
  ): Promise<RecommendationListResponseDto> {
    this.logger.log(`GET /api/recommendations - user: ${userId}`);

    const dto: GetRecommendationsDto = {
      category,
      sortBy,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    return this.recommendationService.getRecommendations(userId!, dto);
  }

  /**
   * POST /api/recommendations/refresh
   * 추천 결과 새로고침
   * Rate Limit: 1분에 1회
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ action: 'refresh', windowSeconds: 60, maxRequests: 1 })
  async refreshRecommendations(
    @CurrentUser('userId') userId?: string,
  ): Promise<RefreshResponseDto> {
    this.logger.log(`POST /api/recommendations/refresh - user: ${userId}`);

    return this.recommendationService.refreshRecommendations(userId!);
  }

  /**
   * POST /api/recommendations/:id/view
   * 추천 조회 기록
   */
  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  async recordView(
    @Param('id') recommendationId: string,
    @CurrentUser('userId') userId?: string,
  ): Promise<ViewRecordResponseDto> {
    this.logger.log(`POST /api/recommendations/${recommendationId}/view - user: ${userId}`);

    return this.recommendationService.recordView(recommendationId, userId!);
  }

  /**
   * POST /api/recommendations/:programId/bookmark
   * 북마크 토글
   */
  @Post(':programId/bookmark')
  @HttpCode(HttpStatus.OK)
  async toggleBookmark(
    @Param('programId') programId: string,
    @CurrentUser('userId') userId?: string,
  ): Promise<{ isBookmarked: boolean }> {
    this.logger.log(`POST /api/recommendations/${programId}/bookmark - user: ${userId}`);

    const isBookmarked = await this.recommendationService.toggleBookmark(userId!, programId);
    return { isBookmarked };
  }
}
