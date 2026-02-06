/**
 * 즐겨찾기 컨트롤러
 * 즐겨찾기 API 엔드포인트 처리
 */

import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import {
  GetFavoritesDto,
  FavoriteCategory,
  FavoriteSortOption,
  SortOrder,
} from './dto/get-favorites.dto';
import { BulkDeleteDto, BulkDeleteResult } from './dto/bulk-delete.dto';
import {
  GetFavoritesResponseDto,
  FavoritesStatsResponseDto,
} from './dto/favorites-response.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

/**
 * 즐겨찾기 컨트롤러
 * @route /api/favorites
 */
@Controller('api/favorites')
@UseGuards(AuthGuard)
export class FavoritesController {
  private readonly logger = new Logger(FavoritesController.name);

  constructor(private readonly favoritesService: FavoritesService) {}

  /**
   * GET /api/favorites
   * 즐겨찾기 목록 조회
   *
   * @query category - 카테고리 필터
   * @query sortBy - 정렬 기준 (기본: bookmarkedAt)
   * @query sortOrder - 정렬 순서 (기본: desc)
   * @query search - 검색어
   * @query page - 페이지 번호 (기본: 1)
   * @query limit - 페이지 크기 (기본: 20, 최대: 100)
   * @query deadlineWithin - N일 이내 마감 필터
   */
  @Get()
  async getFavorites(
    @Query('category') category?: FavoriteCategory,
    @Query('sortBy') sortBy?: FavoriteSortOption,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('deadlineWithin') deadlineWithin?: string,
    @CurrentUser('userId') userId?: string,
  ): Promise<GetFavoritesResponseDto> {
    this.logger.log(`GET /api/favorites - user: ${userId}`);

    const dto: GetFavoritesDto = {
      category,
      sortBy,
      sortOrder,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      deadlineWithin: deadlineWithin ? parseInt(deadlineWithin, 10) : undefined,
    };

    return this.favoritesService.getFavorites(userId!, dto);
  }

  /**
   * GET /api/favorites/stats
   * 즐겨찾기 통계 조회
   */
  @Get('stats')
  async getStats(
    @CurrentUser('userId') userId?: string,
  ): Promise<FavoritesStatsResponseDto> {
    this.logger.log(`GET /api/favorites/stats - user: ${userId}`);

    return this.favoritesService.getStats(userId!);
  }

  /**
   * DELETE /api/favorites/bulk
   * 즐겨찾기 일괄 해제
   *
   * @body ids - 삭제할 즐겨찾기 ID 배열
   * @returns 삭제 결과 (삭제된 개수, 실패한 ID 목록)
   */
  @Delete('bulk')
  @HttpCode(HttpStatus.OK)
  async bulkRemoveFavorites(
    @Body() dto: BulkDeleteDto,
    @CurrentUser('userId') userId?: string,
  ): Promise<BulkDeleteResult> {
    this.logger.log(
      `DELETE /api/favorites/bulk - user: ${userId}, count: ${dto.ids.length}`,
    );

    return this.favoritesService.bulkRemoveFavorites(userId!, dto.ids);
  }

  /**
   * DELETE /api/favorites/:id
   * 개별 즐겨찾기 해제
   *
   * @param id - 즐겨찾기 ID (UUID)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFavorite(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId?: string,
  ): Promise<void> {
    this.logger.log(`DELETE /api/favorites/${id} - user: ${userId}`);

    return this.favoritesService.removeFavorite(userId!, id);
  }
}
