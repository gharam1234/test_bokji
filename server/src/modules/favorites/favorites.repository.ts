/**
 * 즐겨찾기 리포지토리
 * 즐겨찾기 데이터 액세스 로직
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  GetFavoritesDto,
  FavoriteCategory,
  FavoriteSortOption,
  SortOrder,
} from './dto/get-favorites.dto';
import {
  FavoriteDto,
  CategoryCountDto,
  MatchReasonDto,
  getCategoryLabel,
} from './dto/favorites-response.dto';

/**
 * 데이터베이스 로우 타입
 */
interface FavoriteRow {
  id: string;
  user_id: string;
  program_id: string;
  program_name: string;
  program_summary: string;
  category: string;
  match_score: number;
  match_reasons: MatchReasonDto[];
  deadline: string | null;
  is_bookmarked: boolean;
  bookmarked_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * 즐겨찾기 리포지토리
 * 북마크된 추천 데이터 조회 및 관리
 */
@Injectable()
export class FavoritesRepository {
  private readonly logger = new Logger(FavoritesRepository.name);

  // 메모리 저장소 (실제 구현 시 DB 연결로 대체)
  // recommendation 테이블 데이터를 시뮬레이션
  private recommendations: Map<string, FavoriteRow> = new Map();

  constructor() {
    // 샘플 데이터 초기화 (개발용)
    this.initializeSampleData();
  }

  /**
   * 사용자의 즐겨찾기 목록 조회
   */
  async findByUserId(
    userId: string,
    params: GetFavoritesDto,
  ): Promise<{ data: FavoriteDto[]; total: number }> {
    this.logger.debug(`Finding favorites for user: ${userId}`);

    const {
      category,
      sortBy = FavoriteSortOption.BOOKMARKED_AT,
      sortOrder = SortOrder.DESC,
      search,
      page = 1,
      limit = 20,
      deadlineWithin,
    } = params;

    // 실제 구현 시 SQL 쿼리:
    // const query = `
    //   SELECT r.*, wp.name as program_name, wp.summary as program_summary,
    //          wp.category, wp.deadline
    //   FROM recommendation r
    //   JOIN welfare_program wp ON r.program_id = wp.id
    //   WHERE r.user_id = $1
    //     AND r.is_bookmarked = TRUE
    //     ${category ? 'AND wp.category = $2' : ''}
    //     ${search ? 'AND wp.name ILIKE $3' : ''}
    //     ${deadlineWithin ? 'AND wp.deadline <= NOW() + INTERVAL $4 days' : ''}
    //   ORDER BY ${this.getSortColumn(sortBy)} ${sortOrder}
    //   LIMIT $limit OFFSET $offset
    // `;

    // 메모리 데이터 필터링 (개발용)
    let favorites = Array.from(this.recommendations.values())
      .filter((r) => r.user_id === userId && r.is_bookmarked);

    // 카테고리 필터
    if (category) {
      favorites = favorites.filter((r) => r.category === category);
    }

    // 검색어 필터
    if (search) {
      const searchLower = search.toLowerCase();
      favorites = favorites.filter((r) =>
        r.program_name.toLowerCase().includes(searchLower),
      );
    }

    // 마감일 필터
    if (deadlineWithin) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + deadlineWithin);
      favorites = favorites.filter((r) => {
        if (!r.deadline) return false;
        return new Date(r.deadline) <= cutoffDate;
      });
    }

    const total = favorites.length;

    // 정렬
    favorites = this.sortFavorites(favorites, sortBy, sortOrder);

    // 페이지네이션
    const offset = (page - 1) * limit;
    favorites = favorites.slice(offset, offset + limit);

    // DTO 변환
    const data = favorites.map((row) => this.toFavoriteDto(row));

    return { data, total };
  }

  /**
   * 카테고리별 즐겨찾기 개수 조회
   */
  async countByCategory(userId: string): Promise<CategoryCountDto[]> {
    this.logger.debug(`Counting favorites by category for user: ${userId}`);

    // 실제 구현 시 SQL 쿼리:
    // const query = `
    //   SELECT wp.category, COUNT(*) as count
    //   FROM recommendation r
    //   JOIN welfare_program wp ON r.program_id = wp.id
    //   WHERE r.user_id = $1 AND r.is_bookmarked = TRUE
    //   GROUP BY wp.category
    // `;

    const favorites = Array.from(this.recommendations.values())
      .filter((r) => r.user_id === userId && r.is_bookmarked);

    const countMap = new Map<FavoriteCategory, number>();

    favorites.forEach((r) => {
      const category = r.category as FavoriteCategory;
      countMap.set(category, (countMap.get(category) || 0) + 1);
    });

    const result: CategoryCountDto[] = [];
    countMap.forEach((count, category) => {
      result.push({
        category,
        count,
        label: getCategoryLabel(category),
      });
    });

    return result;
  }

  /**
   * N일 이내 마감 즐겨찾기 개수 조회
   */
  async countUpcomingDeadlines(userId: string, days: number): Promise<number> {
    this.logger.debug(
      `Counting upcoming deadlines within ${days} days for user: ${userId}`,
    );

    // 실제 구현 시 SQL 쿼리:
    // const query = `
    //   SELECT COUNT(*)
    //   FROM recommendation r
    //   JOIN welfare_program wp ON r.program_id = wp.id
    //   WHERE r.user_id = $1
    //     AND r.is_bookmarked = TRUE
    //     AND wp.deadline IS NOT NULL
    //     AND wp.deadline <= NOW() + INTERVAL '${days} days'
    //     AND wp.deadline >= NOW()
    // `;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    const now = new Date();

    return Array.from(this.recommendations.values())
      .filter((r) => {
        if (r.user_id !== userId || !r.is_bookmarked || !r.deadline) {
          return false;
        }
        const deadline = new Date(r.deadline);
        return deadline >= now && deadline <= cutoffDate;
      })
      .length;
  }

  /**
   * 총 즐겨찾기 수 및 평균 매칭 점수 조회
   */
  async getStats(
    userId: string,
  ): Promise<{ total: number; averageMatchScore: number }> {
    this.logger.debug(`Getting favorites stats for user: ${userId}`);

    const favorites = Array.from(this.recommendations.values())
      .filter((r) => r.user_id === userId && r.is_bookmarked);

    const total = favorites.length;
    const averageMatchScore =
      total > 0
        ? favorites.reduce((sum, r) => sum + r.match_score, 0) / total
        : 0;

    return { total, averageMatchScore: Math.round(averageMatchScore * 10) / 10 };
  }

  /**
   * 북마크 상태 업데이트 (단일)
   */
  async updateBookmarkStatus(
    id: string,
    userId: string,
    isBookmarked: boolean,
  ): Promise<boolean> {
    this.logger.debug(`Updating bookmark status for id: ${id}`);

    // 실제 구현 시 SQL 쿼리:
    // const query = `
    //   UPDATE recommendation
    //   SET is_bookmarked = $1, bookmarked_at = ${isBookmarked ? 'CURRENT_TIMESTAMP' : 'NULL'}
    //   WHERE id = $2 AND user_id = $3
    //   RETURNING id
    // `;

    const recommendation = this.recommendations.get(id);
    if (!recommendation || recommendation.user_id !== userId) {
      return false;
    }

    recommendation.is_bookmarked = isBookmarked;
    recommendation.bookmarked_at = isBookmarked
      ? new Date().toISOString()
      : '';

    return true;
  }

  /**
   * 북마크 상태 일괄 업데이트
   */
  async bulkUpdateBookmarkStatus(
    ids: string[],
    userId: string,
    isBookmarked: boolean,
  ): Promise<{ successIds: string[]; failedIds: string[] }> {
    this.logger.debug(`Bulk updating bookmark status for ${ids.length} items`);

    // 실제 구현 시 SQL 쿼리:
    // const query = `
    //   UPDATE recommendation
    //   SET is_bookmarked = $1, bookmarked_at = ${isBookmarked ? 'CURRENT_TIMESTAMP' : 'NULL'}
    //   WHERE id = ANY($2) AND user_id = $3
    //   RETURNING id
    // `;

    const successIds: string[] = [];
    const failedIds: string[] = [];

    for (const id of ids) {
      const recommendation = this.recommendations.get(id);
      if (recommendation && recommendation.user_id === userId) {
        recommendation.is_bookmarked = isBookmarked;
        recommendation.bookmarked_at = isBookmarked
          ? new Date().toISOString()
          : '';
        successIds.push(id);
      } else {
        failedIds.push(id);
      }
    }

    return { successIds, failedIds };
  }

  /**
   * 즐겨찾기 존재 여부 확인
   */
  async exists(id: string, userId: string): Promise<boolean> {
    const recommendation = this.recommendations.get(id);
    return !!(
      recommendation &&
      recommendation.user_id === userId &&
      recommendation.is_bookmarked
    );
  }

  // ==================== Private Methods ====================

  /**
   * 정렬 적용
   */
  private sortFavorites(
    favorites: FavoriteRow[],
    sortBy: FavoriteSortOption,
    sortOrder: SortOrder,
  ): FavoriteRow[] {
    const multiplier = sortOrder === SortOrder.ASC ? 1 : -1;

    return favorites.sort((a, b) => {
      switch (sortBy) {
        case FavoriteSortOption.BOOKMARKED_AT:
          return (
            multiplier *
            (new Date(a.bookmarked_at).getTime() -
              new Date(b.bookmarked_at).getTime())
          );

        case FavoriteSortOption.DEADLINE:
          // null은 항상 마지막으로
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return (
            multiplier *
            (new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
          );

        case FavoriteSortOption.MATCH_SCORE:
          return multiplier * (a.match_score - b.match_score);

        case FavoriteSortOption.PROGRAM_NAME:
          return multiplier * a.program_name.localeCompare(b.program_name, 'ko');

        default:
          return 0;
      }
    });
  }

  /**
   * Row를 DTO로 변환
   */
  private toFavoriteDto(row: FavoriteRow): FavoriteDto {
    const daysUntilDeadline = row.deadline
      ? this.calculateDaysUntil(row.deadline)
      : null;

    return {
      id: row.id,
      programId: row.program_id,
      programName: row.program_name,
      programSummary: row.program_summary,
      category: row.category as FavoriteCategory,
      matchScore: row.match_score,
      matchReasons: row.match_reasons || [],
      deadline: row.deadline,
      bookmarkedAt: row.bookmarked_at,
      daysUntilDeadline,
      isDeadlineNear: daysUntilDeadline !== null && daysUntilDeadline <= 7,
    };
  }

  /**
   * 마감일까지 남은 일수 계산
   */
  private calculateDaysUntil(deadline: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 샘플 데이터 초기화 (개발용)
   */
  private initializeSampleData(): void {
    const sampleUserId = 'sample-user-id';
    const sampleData: FavoriteRow[] = [
      {
        id: 'fav-001',
        user_id: sampleUserId,
        program_id: 'prog-001',
        program_name: '청년 주거 지원금',
        program_summary: '만 19~34세 청년 대상 월세 지원 프로그램입니다.',
        category: FavoriteCategory.HOUSING,
        match_score: 92,
        match_reasons: [
          { field: 'age', description: '연령 조건 충족', impact: 'high' },
          { field: 'income', description: '소득 기준 충족', impact: 'medium' },
        ],
        deadline: '2026-02-28',
        is_bookmarked: true,
        bookmarked_at: '2026-02-01T10:30:00Z',
        created_at: '2026-01-15T09:00:00Z',
        updated_at: '2026-02-01T10:30:00Z',
      },
      {
        id: 'fav-002',
        user_id: sampleUserId,
        program_id: 'prog-002',
        program_name: '청년 취업 성공 패키지',
        program_summary: '취업 지원 서비스 및 수당 지급 프로그램입니다.',
        category: FavoriteCategory.EMPLOYMENT,
        match_score: 88,
        match_reasons: [
          { field: 'age', description: '연령 조건 충족', impact: 'high' },
          { field: 'employment', description: '취업 상태 적합', impact: 'high' },
        ],
        deadline: '2026-02-10',
        is_bookmarked: true,
        bookmarked_at: '2026-02-02T14:20:00Z',
        created_at: '2026-01-20T11:00:00Z',
        updated_at: '2026-02-02T14:20:00Z',
      },
      {
        id: 'fav-003',
        user_id: sampleUserId,
        program_id: 'prog-003',
        program_name: '국민건강보험 건강검진',
        program_summary: '무료 건강검진 서비스를 제공합니다.',
        category: FavoriteCategory.HEALTHCARE,
        match_score: 100,
        match_reasons: [
          { field: 'insurance', description: '건강보험 가입자', impact: 'high' },
        ],
        deadline: '2026-12-31',
        is_bookmarked: true,
        bookmarked_at: '2026-01-25T09:15:00Z',
        created_at: '2026-01-10T08:00:00Z',
        updated_at: '2026-01-25T09:15:00Z',
      },
      {
        id: 'fav-004',
        user_id: sampleUserId,
        program_id: 'prog-004',
        program_name: '평생교육 바우처',
        program_summary: '성인 학습자를 위한 교육비 지원입니다.',
        category: FavoriteCategory.EDUCATION,
        match_score: 75,
        match_reasons: [
          { field: 'age', description: '연령 조건 충족', impact: 'medium' },
        ],
        deadline: null,
        is_bookmarked: true,
        bookmarked_at: '2026-01-30T16:45:00Z',
        created_at: '2026-01-05T10:00:00Z',
        updated_at: '2026-01-30T16:45:00Z',
      },
      {
        id: 'fav-005',
        user_id: sampleUserId,
        program_id: 'prog-005',
        program_name: '문화누리카드',
        program_summary: '문화, 여행, 체육 활동 지원 카드입니다.',
        category: FavoriteCategory.CULTURE,
        match_score: 85,
        match_reasons: [
          { field: 'income', description: '소득 기준 충족', impact: 'high' },
        ],
        deadline: '2026-02-05',
        is_bookmarked: true,
        bookmarked_at: '2026-02-01T11:00:00Z',
        created_at: '2026-01-12T14:00:00Z',
        updated_at: '2026-02-01T11:00:00Z',
      },
    ];

    sampleData.forEach((item) => {
      this.recommendations.set(item.id, item);
    });

    this.logger.log(`Initialized ${sampleData.length} sample favorites`);
  }
}
