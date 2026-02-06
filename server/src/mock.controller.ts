/**
 * Mock 컨트롤러
 * 아직 구현되지 않은 API에 대한 임시 응답 제공
 */

import { Controller, Get, Query, Param, Post, Logger } from '@nestjs/common';

@Controller('api')
export class MockController {
  private readonly logger = new Logger(MockController.name);

  /**
   * GET /api/favorites
   * 즐겨찾기 목록 (Mock)
   */
  @Get('favorites')
  getFavorites(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    this.logger.log('GET /api/favorites (Mock)');
    const currentPage = parseInt(page || '1', 10);
    const pageLimit = parseInt(limit || '20', 10);
    
    return {
      favorites: [],
      pagination: {
        page: currentPage,
        limit: pageLimit,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
      meta: {
        categories: [],
        upcomingDeadlines: 0,
      },
    };
  }

  /**
   * GET /api/analytics/summary
   * 분석 요약 (Mock)
   */
  @Get('analytics/summary')
  getAnalyticsSummary(@Query('period') period?: string) {
    this.logger.log(`GET /api/analytics/summary (Mock) - period: ${period}`);
    return {
      period: period || 'month',
      totalViews: 0,
      totalSearches: 0,
      totalFavorites: 0,
      recommendationCount: 0,
      topCategories: [],
      recentActivity: [],
    };
  }

  /**
   * GET /api/analytics/activity
   * 활동 내역 (Mock)
   */
  @Get('analytics/activity')
  getActivity() {
    this.logger.log('GET /api/analytics/activity (Mock)');
    return {
      items: [],
      total: 0,
    };
  }

  /**
   * GET /api/profile
   * 프로필 정보 (Mock)
   */
  @Get('profile')
  getProfile() {
    this.logger.log('GET /api/profile (Mock)');
    return {
      id: 'mock-user',
      name: '테스트 사용자',
      completionRate: 0,
    };
  }

  /**
   * GET /api/recommendations
   * 추천 목록 (Mock)
   */
  @Get('recommendations')
  getRecommendations() {
    this.logger.log('GET /api/recommendations (Mock)');
    return {
      items: [],
      total: 0,
    };
  }

  /**
   * GET /api/notifications
   * 알림 목록 (Mock)
   */
  @Get('notifications')
  getNotifications() {
    this.logger.log('GET /api/notifications (Mock)');
    return {
      notifications: [],
      totalCount: 0,
      unreadCount: 0,
      page: 1,
      limit: 20,
    };
  }

  /**
   * GET /api/notifications/unread-count
   * 읽지 않은 알림 수 (Mock)
   */
  @Get('notifications/unread-count')
  getUnreadCount() {
    return { count: 0 };
  }

  /**
   * GET /api/welfare-programs/:id
   * 복지 프로그램 상세 (Mock - 검색 샘플 데이터 활용)
   */
  @Get('welfare-programs/:id')
  getWelfareDetail(@Param('id') id: string) {
    this.logger.log(`GET /api/welfare-programs/${id} (Mock)`);
    
    // 샘플 상세 데이터
    const samplePrograms: Record<string, any> = {
      'WF-2026-001': {
        id: 'WF-2026-001',
        name: '청년 주거 지원금',
        summary: '만 19~34세 청년 대상 월세 지원 프로그램입니다.',
        description: '주거비 부담 경감을 위해 청년에게 월세를 지원하는 사업입니다. 최대 12개월간 지원됩니다.',
        category: 'housing',
        categoryLabel: '주거·금융',
        organization: '국토교통부',
        eligibility: {
          ageRange: { min: 19, max: 34 },
          incomeLevel: '중위소득 150% 이하',
          targetGroups: ['청년'],
          conditions: ['무주택자', '1인 가구 또는 부모와 별도 거주'],
        },
        benefits: '월 최대 20만원, 최대 12개월 지원',
        benefitAmount: '월 최대 20만원',
        deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        applicationMethods: [
          { type: 'online', name: '온라인 신청', url: 'https://www.myhome.go.kr' },
          { type: 'visit', name: '주민센터 방문' },
        ],
        requiredDocuments: ['신분증', '주민등록등본', '소득증빙서류', '임대차계약서'],
        contactInfo: {
          phone: '1600-0777',
          website: 'https://www.myhome.go.kr',
        },
      },
      'WF-2026-002': {
        id: 'WF-2026-002',
        name: '청년 취업 성공 패키지',
        summary: '청년 취업 지원 서비스로 직업훈련과 취업알선을 제공합니다.',
        description: '청년 취업 성공 패키지는 취업 의지가 있는 청년에게 직업훈련, 취업알선 등을 제공하는 종합 취업 지원 서비스입니다.',
        category: 'employment',
        categoryLabel: '취업·창업',
        organization: '고용노동부',
        eligibility: {
          ageRange: { min: 18, max: 34 },
          incomeLevel: '중위소득 60% 이하',
          targetGroups: ['청년', '구직자'],
          conditions: ['취업 의지가 있는 미취업자'],
        },
        benefits: '직업훈련, 취업알선, 취업성공수당 최대 150만원',
        benefitAmount: '최대 150만원',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        applicationMethods: [
          { type: 'online', name: '워크넷', url: 'https://www.work.go.kr' },
          { type: 'visit', name: '고용센터 방문' },
        ],
        requiredDocuments: ['신분증', '구직등록확인서', '소득증빙서류'],
        contactInfo: {
          phone: '1350',
          website: 'https://www.work.go.kr',
        },
      },
    };

    const program = samplePrograms[id];
    
    if (program) {
      return {
        program,
        relatedPrograms: [],
        isBookmarked: false,
      };
    }
    
    // 기본 응답 (ID에 해당하는 프로그램이 없을 때)
    return {
      program: {
        id,
        name: '복지 프로그램',
        summary: '복지 프로그램 상세 정보입니다.',
        description: '이 복지 프로그램에 대한 상세 설명입니다.',
        category: 'other',
        categoryLabel: '기타',
        organization: '정부기관',
        eligibility: {
          conditions: [],
        },
        benefits: '지원 내용을 확인하세요.',
        applicationMethods: [],
        requiredDocuments: [],
        contactInfo: {},
      },
      relatedPrograms: [],
      isBookmarked: false,
    };
  }

  /**
   * POST /api/recommendations/:programId/bookmark
   * 북마크 토글 (Mock)
   */
  @Post('recommendations/:programId/bookmark')
  toggleBookmark(@Param('programId') programId: string) {
    this.logger.log(`POST /api/recommendations/${programId}/bookmark (Mock)`);
    return {
      success: true,
      isBookmarked: true,
      message: '북마크가 추가되었습니다.',
    };
  }
}
