/**
 * 추천 서비스
 * 복지 추천 비즈니스 로직 처리
 */

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { RecommendationRepository } from './recommendation.repository';
import { MatchingEngineService } from './services/matching-engine.service';
import { CacheService } from './services/cache.service';
import { ProfileService } from '../profile/profile.service';
import {
  WelfareCategory,
  CATEGORY_LABELS,
  WelfareProgram,
} from './entities/welfare-program.entity';
import {
  Recommendation,
  SortOption,
} from './entities/recommendation.entity';
import { RecommendationAction } from './entities/recommendation-history.entity';
import {
  GetRecommendationsDto,
  normalizeGetRecommendationsDto,
} from './dto/get-recommendations.dto';
import {
  RecommendationListResponseDto,
  RecommendationItemDto,
  CategoryCountDto,
  createCategoryCount,
} from './dto/recommendation-response.dto';
import {
  WelfareDetailResponseDto,
  RelatedProgramDto,
  toWelfareProgramDetailDto,
} from './dto/welfare-detail.dto';
import {
  RefreshResponseDto,
  ViewRecordResponseDto,
} from './dto/refresh-response.dto';
import { UserProfileForMatching } from './interfaces/match-result.interface';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    private readonly repo: RecommendationRepository,
    private readonly matchingEngine: MatchingEngineService,
    private readonly cacheService: CacheService,
    @Inject(forwardRef(() => ProfileService))
    private readonly profileService: ProfileService,
  ) {}

  // ==================== 추천 목록 ====================

  /**
   * 추천 복지 목록 조회
   */
  async getRecommendations(
    userId: string,
    dto: GetRecommendationsDto,
  ): Promise<RecommendationListResponseDto> {
    this.logger.log(`Getting recommendations for user: ${userId}`);
    
    const options = normalizeGetRecommendationsDto(dto);
    
    // 캐시 키 생성 (옵션 포함)
    const cacheKey = `${userId}:${options.category || 'all'}:${options.sortBy}:${options.page}:${options.limit}`;
    
    // 캐시 조회
    const cachedResult = await this.cacheService.getRecommendations<RecommendationListResponseDto>(cacheKey);
    if (cachedResult) {
      this.logger.debug(`Cache hit for recommendations: ${cacheKey}`);
      return cachedResult;
    }

    // 추천 결과 조회
    const { recommendations, totalCount } = await this.repo.findRecommendationsByUserId(
      userId,
      options,
    );

    // 카테고리별 개수 조회
    const categoryCounts = await this.repo.countRecommendationsByCategory(userId);
    const categories: CategoryCountDto[] = [];
    
    for (const [category, count] of categoryCounts.entries()) {
      categories.push(createCategoryCount(category, count));
    }

    // 정렬: 개수 내림차순
    categories.sort((a, b) => b.count - a.count);

    // DTO 변환
    const items: RecommendationItemDto[] = recommendations.map(rec => 
      this.toRecommendationItemDto(rec),
    );

    const hasMore = (options.page * options.limit) < totalCount;

    const response: RecommendationListResponseDto = {
      recommendations: items,
      totalCount,
      categories,
      page: options.page,
      limit: options.limit,
      hasMore,
    };
    
    // 캐시 저장
    await this.cacheService.setRecommendations(cacheKey, response);
    
    return response;
  }

  /**
   * 추천 결과 새로고침
   * 프로필 변경 시 호출하여 추천 결과 재계산
   */
  async refreshRecommendations(userId: string): Promise<RefreshResponseDto> {
    this.logger.log(`Refreshing recommendations for user: ${userId}`);

    // 사용자 프로필 조회 (실제 구현 시 ProfileService 연동)
    const profile = await this.getUserProfileForMatching(userId);

    if (!profile) {
      throw new NotFoundException('사용자 프로필이 없습니다. 먼저 프로필을 등록해주세요.');
    }

    // 기존 추천 삭제
    await this.repo.deleteRecommendationsByUserId(userId);

    // 활성 복지 프로그램 조회
    const programs = await this.repo.findAllActivePrograms();

    // 매칭 실행
    const matchResults = this.matchingEngine.runMatchingForUser(profile, programs);

    // 추천 결과 저장
    for (const result of matchResults) {
      await this.repo.upsertRecommendation(result);
      
      // 이력 저장
      await this.repo.saveHistory({
        userId,
        programId: result.programId,
        matchScore: result.matchScore,
        action: RecommendationAction.GENERATED,
      });
    }

    // 캐시 무효화
    await this.invalidateCache(userId);
    
    return {
      success: true,
      updatedCount: matchResults.length,
      message: `추천 목록이 갱신되었습니다. ${matchResults.length}개의 복지 혜택이 추천됩니다.`,
    };
  }
  
  /**
   * 캐시 무효화
   */
  async invalidateCache(userId: string): Promise<void> {
    await this.cacheService.deleteByPattern(`recommendations:user:${userId}:*`);
    this.logger.debug(`Cache invalidated for user: ${userId}`);
  }

  // ==================== 복지 상세 ====================

  /**
   * 복지 프로그램 상세 조회
   */
  async getWelfareDetail(
    programId: string,
    userId: string,
  ): Promise<WelfareDetailResponseDto> {
    this.logger.log(`Getting welfare detail: ${programId} for user: ${userId}`);

    // 복지 프로그램 조회
    const program = await this.repo.findProgramById(programId);
    
    if (!program) {
      throw new NotFoundException('복지 프로그램을 찾을 수 없습니다.');
    }

    // 조회수 증가
    await this.repo.incrementProgramViewCount(programId);

    // 사용자의 해당 프로그램 추천 정보 조회
    const recommendation = await this.repo.findRecommendationByUserAndProgram(
      userId,
      programId,
    );

    // 관련 복지 프로그램 조회 (같은 카테고리)
    const relatedPrograms = await this.getRelatedPrograms(
      userId,
      programId,
      program.category,
    );

    return {
      program: toWelfareProgramDetailDto(program),
      matchScore: recommendation?.matchScore || 0,
      matchReasons: recommendation?.matchReasons || [],
      isBookmarked: recommendation?.isBookmarked || false,
      relatedPrograms,
    };
  }

  /**
   * 관련 복지 프로그램 조회
   */
  private async getRelatedPrograms(
    userId: string,
    excludeProgramId: string,
    category: WelfareCategory,
  ): Promise<RelatedProgramDto[]> {
    const { recommendations } = await this.repo.findRecommendationsByUserId(userId, {
      category,
      sortBy: SortOption.MATCH_SCORE,
      limit: 5,
    });

    return recommendations
      .filter(rec => rec.programId !== excludeProgramId && rec.program)
      .slice(0, 4)
      .map(rec => ({
        id: rec.programId,
        name: rec.program!.name,
        category: rec.program!.category,
        categoryLabel: CATEGORY_LABELS[rec.program!.category],
        matchScore: rec.matchScore,
      }));
  }

  // ==================== 조회 기록 ====================

  /**
   * 추천 조회 기록 저장
   */
  async recordView(
    recommendationId: string,
    userId: string,
  ): Promise<ViewRecordResponseDto> {
    this.logger.log(`Recording view: ${recommendationId} for user: ${userId}`);

    const viewedAt = await this.repo.updateViewedAt(recommendationId);

    return {
      success: true,
      viewedAt: viewedAt.toISOString(),
    };
  }

  // ==================== 북마크 ====================

  /**
   * 북마크 토글
   */
  async toggleBookmark(userId: string, programId: string): Promise<boolean> {
    this.logger.log(`Toggling bookmark: ${programId} for user: ${userId}`);

    const isBookmarked = await this.repo.toggleBookmark(userId, programId);

    // 이력 저장
    if (isBookmarked) {
      const rec = await this.repo.findRecommendationByUserAndProgram(userId, programId);
      if (rec) {
        await this.repo.saveHistory({
          userId,
          programId,
          matchScore: rec.matchScore,
          action: RecommendationAction.BOOKMARKED,
        });
      }
    }

    return isBookmarked;
  }

  // ==================== 헬퍼 ====================

  /**
   * 추천을 아이템 DTO로 변환
   */
  private toRecommendationItemDto(rec: Recommendation): RecommendationItemDto {
    const program = rec.program;
    
    return {
      id: rec.id,
      programId: rec.programId,
      name: program?.name || '',
      summary: program?.summary || '',
      category: program?.category || WelfareCategory.OTHER,
      categoryLabel: program ? CATEGORY_LABELS[program.category] : '',
      matchScore: rec.matchScore,
      matchReasons: rec.matchReasons,
      benefits: program?.benefits || '',
      benefitAmount: program?.benefitAmount || null,
      deadline: program?.applicationEndDate?.toISOString() || null,
      isBookmarked: rec.isBookmarked,
      tags: program?.tags || [],
    };
  }

  /**
   * 사용자 프로필 조회 (매칭용)
   * ProfileService 연동으로 실제 프로필 데이터 사용
   */
  private async getUserProfileForMatching(
    userId: string,
  ): Promise<UserProfileForMatching | null> {
    try {
      // ProfileService를 통해 실제 프로필 조회
      const profileData = await this.profileService.getProfileForMatching(userId);
      
      if (!profileData) {
        this.logger.warn(`Profile not found for user: ${userId}`);
        return null;
      }

      return {
        userId: profileData.userId,
        age: profileData.age,
        incomeLevel: profileData.incomeLevel,
        sido: profileData.sido,
        sigungu: profileData.sigungu,
        householdType: profileData.householdType,
        householdSize: profileData.householdSize,
        specialConditions: profileData.specialConditions,
      };
    } catch (error) {
      this.logger.error(`Failed to get profile for matching: ${error.message}`);
      return null;
    }
  }
}
