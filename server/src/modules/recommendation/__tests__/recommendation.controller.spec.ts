/**
 * 추천 컨트롤러 통합 테스트
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { RecommendationController } from '../recommendation.controller';
import { RecommendationService } from '../recommendation.service';
import { RecommendationRepository } from '../recommendation.repository';
import { MatchingEngineService } from '../services/matching-engine.service';
import { CacheService } from '../services/cache.service';
import { RateLimitInterceptor } from '../interceptors/rate-limit.interceptor';
import { Reflector } from '@nestjs/core';
import { WelfareCategory, SortOption } from '../entities';

describe('RecommendationController (Integration)', () => {
  let app: INestApplication;
  let recommendationService: RecommendationService;
  let cacheService: CacheService;

  const mockCacheService = {
    getRecommendations: jest.fn().mockResolvedValue(null),
    setRecommendations: jest.fn().mockResolvedValue(undefined),
    invalidateRecommendations: jest.fn().mockResolvedValue(undefined),
    deleteByPattern: jest.fn().mockResolvedValue(0),
    checkRateLimit: jest.fn().mockResolvedValue({ allowed: true, remainingTime: 0 }),
    isReady: jest.fn().mockReturnValue(true),
  };

  const mockRecommendationService = {
    getRecommendations: jest.fn(),
    refreshRecommendations: jest.fn(),
    recordView: jest.fn(),
    toggleBookmark: jest.fn(),
    getWelfareDetail: jest.fn(),
    invalidateCache: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [RecommendationController],
      providers: [
        {
          provide: RecommendationService,
          useValue: mockRecommendationService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        Reflector,
        RateLimitInterceptor,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    recommendationService = moduleFixture.get<RecommendationService>(RecommendationService);
    cacheService = moduleFixture.get<CacheService>(CacheService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  // ==================== GET /api/recommendations ====================

  describe('GET /api/recommendations', () => {
    const mockResponse = {
      recommendations: [
        {
          id: 'rec-1',
          programId: 'prog-1',
          name: '청년 월세 지원',
          summary: '청년 주거비 지원',
          category: WelfareCategory.HOUSING,
          categoryLabel: '주거',
          matchScore: 95,
          matchReasons: [{ type: 'age', label: '청년 대상', weight: 30 }],
          benefits: '월 최대 20만원',
          benefitAmount: '월 20만원',
          deadline: null,
          isBookmarked: false,
          tags: ['청년', '주거'],
        },
      ],
      totalCount: 1,
      categories: [{ category: WelfareCategory.HOUSING, label: '주거', count: 1 }],
      page: 1,
      limit: 20,
      hasMore: false,
    };

    it('추천 목록 조회 성공', async () => {
      mockRecommendationService.getRecommendations.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/api/recommendations')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(mockResponse);
      expect(mockRecommendationService.getRecommendations).toHaveBeenCalled();
    });

    it('카테고리 필터 적용', async () => {
      mockRecommendationService.getRecommendations.mockResolvedValue(mockResponse);

      await request(app.getHttpServer())
        .get('/api/recommendations')
        .query({ category: WelfareCategory.HOUSING })
        .expect(HttpStatus.OK);

      expect(mockRecommendationService.getRecommendations).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ category: WelfareCategory.HOUSING }),
      );
    });

    it('정렬 옵션 적용', async () => {
      mockRecommendationService.getRecommendations.mockResolvedValue(mockResponse);

      await request(app.getHttpServer())
        .get('/api/recommendations')
        .query({ sortBy: SortOption.DEADLINE })
        .expect(HttpStatus.OK);

      expect(mockRecommendationService.getRecommendations).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ sortBy: SortOption.DEADLINE }),
      );
    });

    it('페이지네이션 적용', async () => {
      mockRecommendationService.getRecommendations.mockResolvedValue({
        ...mockResponse,
        page: 2,
        hasMore: true,
      });

      await request(app.getHttpServer())
        .get('/api/recommendations')
        .query({ page: '2', limit: '10' })
        .expect(HttpStatus.OK);

      expect(mockRecommendationService.getRecommendations).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ page: 2, limit: 10 }),
      );
    });
  });

  // ==================== POST /api/recommendations/refresh ====================

  describe('POST /api/recommendations/refresh', () => {
    const mockRefreshResponse = {
      success: true,
      updatedCount: 15,
      message: '추천 목록이 갱신되었습니다. 15개의 복지 혜택이 추천됩니다.',
    };

    it('추천 새로고침 성공', async () => {
      mockRecommendationService.refreshRecommendations.mockResolvedValue(mockRefreshResponse);

      const response = await request(app.getHttpServer())
        .post('/api/recommendations/refresh')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(mockRefreshResponse);
      expect(mockRecommendationService.refreshRecommendations).toHaveBeenCalled();
    });

    it('요청 제한 (429) - 1분 내 재요청', async () => {
      mockCacheService.checkRateLimit.mockResolvedValue({
        allowed: false,
        remainingTime: 45,
      });

      const response = await request(app.getHttpServer())
        .post('/api/recommendations/refresh')
        .expect(HttpStatus.TOO_MANY_REQUESTS);

      expect(response.body.retryAfter).toBe(45);
      expect(response.body.message).toContain('45초');
    });
  });

  // ==================== POST /api/recommendations/:id/view ====================

  describe('POST /api/recommendations/:id/view', () => {
    it('조회 기록 성공', async () => {
      const mockViewResponse = {
        success: true,
        viewedAt: new Date().toISOString(),
      };
      mockRecommendationService.recordView.mockResolvedValue(mockViewResponse);

      const response = await request(app.getHttpServer())
        .post('/api/recommendations/rec-123/view')
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(mockRecommendationService.recordView).toHaveBeenCalledWith('rec-123', expect.any(String));
    });
  });

  // ==================== POST /api/recommendations/:programId/bookmark ====================

  describe('POST /api/recommendations/:programId/bookmark', () => {
    it('북마크 추가 성공', async () => {
      mockRecommendationService.toggleBookmark.mockResolvedValue(true);

      const response = await request(app.getHttpServer())
        .post('/api/recommendations/prog-123/bookmark')
        .expect(HttpStatus.OK);

      expect(response.body.isBookmarked).toBe(true);
    });

    it('북마크 해제 성공', async () => {
      mockRecommendationService.toggleBookmark.mockResolvedValue(false);

      const response = await request(app.getHttpServer())
        .post('/api/recommendations/prog-123/bookmark')
        .expect(HttpStatus.OK);

      expect(response.body.isBookmarked).toBe(false);
    });
  });
});

// ==================== 서비스 통합 테스트 ====================

describe('RecommendationService (Integration)', () => {
  let service: RecommendationService;
  let repository: RecommendationRepository;
  let matchingEngine: MatchingEngineService;
  let cacheService: CacheService;

  const mockRepository = {
    findRecommendationsByUserId: jest.fn(),
    countRecommendationsByCategory: jest.fn(),
    findProgramById: jest.fn(),
    findAllActivePrograms: jest.fn(),
    upsertRecommendation: jest.fn(),
    deleteRecommendationsByUserId: jest.fn(),
    saveHistory: jest.fn(),
    incrementProgramViewCount: jest.fn(),
    findRecommendationByUserAndProgram: jest.fn(),
    updateRecommendation: jest.fn(),
  };

  const mockMatchingEngine = {
    runMatchingForUser: jest.fn(),
    calculateMatchScore: jest.fn(),
  };

  const mockCacheService = {
    getRecommendations: jest.fn().mockResolvedValue(null),
    setRecommendations: jest.fn().mockResolvedValue(undefined),
    deleteByPattern: jest.fn().mockResolvedValue(0),
    isReady: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationService,
        { provide: RecommendationRepository, useValue: mockRepository },
        { provide: MatchingEngineService, useValue: mockMatchingEngine },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<RecommendationService>(RecommendationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecommendations', () => {
    it('캐시 미스 시 DB에서 조회 후 캐시 저장', async () => {
      mockCacheService.getRecommendations.mockResolvedValue(null);
      mockRepository.findRecommendationsByUserId.mockResolvedValue({
        recommendations: [],
        totalCount: 0,
      });
      mockRepository.countRecommendationsByCategory.mockResolvedValue(new Map());

      await service.getRecommendations('user-123', {});

      expect(mockCacheService.getRecommendations).toHaveBeenCalled();
      expect(mockRepository.findRecommendationsByUserId).toHaveBeenCalled();
      expect(mockCacheService.setRecommendations).toHaveBeenCalled();
    });

    it('캐시 히트 시 DB 조회 안함', async () => {
      const cachedResponse = {
        recommendations: [],
        totalCount: 0,
        categories: [],
        page: 1,
        limit: 20,
        hasMore: false,
      };
      mockCacheService.getRecommendations.mockResolvedValue(cachedResponse);

      const result = await service.getRecommendations('user-123', {});

      expect(result).toEqual(cachedResponse);
      expect(mockRepository.findRecommendationsByUserId).not.toHaveBeenCalled();
    });
  });

  describe('refreshRecommendations', () => {
    it('기존 추천 삭제 후 새로 생성', async () => {
      mockRepository.deleteRecommendationsByUserId.mockResolvedValue(undefined);
      mockRepository.findAllActivePrograms.mockResolvedValue([]);
      mockMatchingEngine.runMatchingForUser.mockReturnValue([]);

      await service.refreshRecommendations('user-123');

      expect(mockRepository.deleteRecommendationsByUserId).toHaveBeenCalledWith('user-123');
      expect(mockMatchingEngine.runMatchingForUser).toHaveBeenCalled();
      expect(mockCacheService.deleteByPattern).toHaveBeenCalled();
    });
  });
});
