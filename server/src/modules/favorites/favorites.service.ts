/**
 * 즐겨찾기 서비스
 * 즐겨찾기 비즈니스 로직 처리
 */

import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FavoritesRepository } from './favorites.repository';
import { GetFavoritesDto } from './dto/get-favorites.dto';
import {
  GetFavoritesResponseDto,
  FavoritesStatsResponseDto,
  CategoryCountDto,
} from './dto/favorites-response.dto';
import { BulkDeleteResult } from './dto/bulk-delete.dto';

/**
 * 즐겨찾기 서비스
 * 즐겨찾기 조회, 삭제, 통계 등 비즈니스 로직
 */
@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);

  constructor(private readonly favoritesRepository: FavoritesRepository) {}

  /**
   * 즐겨찾기 목록 조회
   * 페이지네이션, 필터링, 정렬 적용
   */
  async getFavorites(
    userId: string,
    params: GetFavoritesDto,
  ): Promise<GetFavoritesResponseDto> {
    this.logger.log(`Getting favorites for user: ${userId}`);

    const { page = 1, limit = 20 } = params;

    // 즐겨찾기 목록 조회
    const { data: favorites, total } =
      await this.favoritesRepository.findByUserId(userId, params);

    // 카테고리별 개수 조회
    const categories = await this.favoritesRepository.countByCategory(userId);

    // 7일 이내 마감 개수 조회
    const upcomingDeadlines =
      await this.favoritesRepository.countUpcomingDeadlines(userId, 7);

    // 페이지네이션 정보 계산
    const totalPages = Math.ceil(total / limit);

    return {
      favorites,
      pagination: {
        page,
        limit,
        totalCount: total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      meta: {
        categories,
        upcomingDeadlines,
      },
    };
  }

  /**
   * 즐겨찾기 통계 조회
   */
  async getStats(userId: string): Promise<FavoritesStatsResponseDto> {
    this.logger.log(`Getting favorites stats for user: ${userId}`);

    // 총 개수 및 평균 매칭 점수
    const { total, averageMatchScore } =
      await this.favoritesRepository.getStats(userId);

    // 카테고리별 개수
    const byCategory = await this.favoritesRepository.countByCategory(userId);

    // 마감 임박 통계
    const within7Days =
      await this.favoritesRepository.countUpcomingDeadlines(userId, 7);
    const within30Days =
      await this.favoritesRepository.countUpcomingDeadlines(userId, 30);

    return {
      total,
      byCategory,
      upcomingDeadlines: {
        within7Days,
        within30Days,
      },
      averageMatchScore,
    };
  }

  /**
   * 즐겨찾기 해제 (개별)
   * 북마크 상태를 false로 변경
   */
  async removeFavorite(userId: string, favoriteId: string): Promise<void> {
    this.logger.log(`Removing favorite: ${favoriteId} for user: ${userId}`);

    // 존재 여부 확인
    const exists = await this.favoritesRepository.exists(favoriteId, userId);
    if (!exists) {
      throw new NotFoundException('즐겨찾기를 찾을 수 없습니다.');
    }

    // 북마크 해제
    const success = await this.favoritesRepository.updateBookmarkStatus(
      favoriteId,
      userId,
      false,
    );

    if (!success) {
      throw new NotFoundException('즐겨찾기를 찾을 수 없습니다.');
    }

    this.logger.log(`Successfully removed favorite: ${favoriteId}`);
  }

  /**
   * 즐겨찾기 일괄 해제
   * 여러 북마크 상태를 한 번에 false로 변경
   */
  async bulkRemoveFavorites(
    userId: string,
    ids: string[],
  ): Promise<BulkDeleteResult> {
    this.logger.log(
      `Bulk removing ${ids.length} favorites for user: ${userId}`,
    );

    const { successIds, failedIds } =
      await this.favoritesRepository.bulkUpdateBookmarkStatus(
        ids,
        userId,
        false,
      );

    this.logger.log(
      `Bulk remove completed: ${successIds.length} success, ${failedIds.length} failed`,
    );

    return {
      deletedCount: successIds.length,
      failedIds,
    };
  }
}
