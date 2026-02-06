/**
 * 추천 리포지토리
 * 추천 관련 데이터 액세스 로직
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  WelfareProgram,
  WelfareProgramRow,
  toWelfareProgram,
  WelfareCategory,
} from './entities/welfare-program.entity';
import {
  Recommendation,
  RecommendationRow,
  toRecommendation,
  MatchReason,
  SortOption,
} from './entities/recommendation.entity';
import {
  RecommendationHistory,
  RecommendationHistoryRow,
  toRecommendationHistory,
  RecommendationAction,
} from './entities/recommendation-history.entity';

// 실제 구현 시 데이터베이스 연결 모듈 사용
// import { DatabaseService } from '../../database/database.service';

/**
 * 추천 리포지토리
 * 복지 프로그램 및 추천 결과 데이터 액세스
 */
@Injectable()
export class RecommendationRepository {
  private readonly logger = new Logger(RecommendationRepository.name);

  // 메모리 저장소 (실제 구현 시 DB 연결로 대체)
  private welfarePrograms: Map<string, WelfareProgram> = new Map();
  private recommendations: Map<string, Recommendation> = new Map();
  private recommendationHistory: RecommendationHistory[] = [];

  constructor(
    // private readonly db: DatabaseService
  ) {
    // 샘플 데이터 초기화 (개발용)
    this.initializeSampleData();
  }

  // ==================== 복지 프로그램 ====================

  /**
   * 활성화된 모든 복지 프로그램 조회
   */
  async findAllActivePrograms(): Promise<WelfareProgram[]> {
    this.logger.debug('Finding all active welfare programs');
    
    // 실제 구현:
    // const query = `
    //   SELECT * FROM welfare_program
    //   WHERE is_active = true
    //   ORDER BY created_at DESC
    // `;
    // const rows = await this.db.query<WelfareProgramRow>(query);
    // return rows.map(toWelfareProgram);

    return Array.from(this.welfarePrograms.values())
      .filter(p => p.isActive);
  }

  /**
   * ID로 복지 프로그램 조회
   */
  async findProgramById(id: string): Promise<WelfareProgram | null> {
    this.logger.debug(`Finding welfare program by id: ${id}`);
    
    // 실제 구현:
    // const query = `SELECT * FROM welfare_program WHERE id = $1`;
    // const rows = await this.db.query<WelfareProgramRow>(query, [id]);
    // return rows.length > 0 ? toWelfareProgram(rows[0]) : null;

    return this.welfarePrograms.get(id) || null;
  }

  /**
   * 복지 프로그램 조회수 증가
   */
  async incrementProgramViewCount(id: string): Promise<void> {
    // 실제 구현:
    // const query = `
    //   UPDATE welfare_program
    //   SET view_count = view_count + 1
    //   WHERE id = $1
    // `;
    // await this.db.query(query, [id]);

    const program = this.welfarePrograms.get(id);
    if (program) {
      program.viewCount += 1;
    }
  }

  /**
   * 카테고리별 프로그램 조회
   */
  async findProgramsByCategory(
    category: WelfareCategory,
  ): Promise<WelfareProgram[]> {
    return Array.from(this.welfarePrograms.values())
      .filter(p => p.isActive && p.category === category);
  }

  // ==================== 추천 결과 ====================

  /**
   * 사용자의 추천 결과 조회
   */
  async findRecommendationsByUserId(
    userId: string,
    options: {
      category?: WelfareCategory;
      sortBy?: SortOption;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<{ recommendations: Recommendation[]; totalCount: number }> {
    const { category, sortBy = SortOption.MATCH_SCORE, page = 1, limit = 20 } = options;
    
    this.logger.debug(`Finding recommendations for user: ${userId}, options: ${JSON.stringify(options)}`);

    // 실제 구현:
    // let query = `
    //   SELECT r.*, wp.*
    //   FROM recommendation r
    //   JOIN welfare_program wp ON r.program_id = wp.id
    //   WHERE r.user_id = $1 AND wp.is_active = true
    // `;
    // const params: any[] = [userId];
    // 
    // if (category) {
    //   query += ` AND wp.category = $${params.length + 1}`;
    //   params.push(category);
    // }
    // 
    // // 정렬
    // switch (sortBy) {
    //   case SortOption.MATCH_SCORE:
    //     query += ` ORDER BY r.match_score DESC`;
    //     break;
    //   case SortOption.LATEST:
    //     query += ` ORDER BY wp.created_at DESC`;
    //     break;
    //   case SortOption.DEADLINE:
    //     query += ` ORDER BY wp.application_end_date ASC NULLS LAST`;
    //     break;
    //   case SortOption.POPULARITY:
    //     query += ` ORDER BY wp.view_count DESC`;
    //     break;
    // }
    // 
    // query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    // params.push(limit, (page - 1) * limit);

    let filtered = Array.from(this.recommendations.values())
      .filter(r => r.userId === userId);

    // 카테고리 필터
    if (category) {
      filtered = filtered.filter(r => {
        const program = this.welfarePrograms.get(r.programId);
        return program?.category === category;
      });
    }

    const totalCount = filtered.length;

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case SortOption.MATCH_SCORE:
          return b.matchScore - a.matchScore;
        case SortOption.LATEST:
          return b.createdAt.getTime() - a.createdAt.getTime();
        case SortOption.POPULARITY:
          const progA = this.welfarePrograms.get(a.programId);
          const progB = this.welfarePrograms.get(b.programId);
          return (progB?.viewCount || 0) - (progA?.viewCount || 0);
        default:
          return b.matchScore - a.matchScore;
      }
    });

    // 페이지네이션
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    // 프로그램 정보 조인
    const withPrograms = paged.map(r => ({
      ...r,
      program: this.welfarePrograms.get(r.programId),
    }));

    return { recommendations: withPrograms, totalCount };
  }

  /**
   * 사용자의 특정 프로그램 추천 조회
   */
  async findRecommendationByUserAndProgram(
    userId: string,
    programId: string,
  ): Promise<Recommendation | null> {
    // 실제 구현:
    // const query = `
    //   SELECT * FROM recommendation
    //   WHERE user_id = $1 AND program_id = $2
    // `;
    // const rows = await this.db.query<RecommendationRow>(query, [userId, programId]);
    // return rows.length > 0 ? toRecommendation(rows[0]) : null;

    return Array.from(this.recommendations.values())
      .find(r => r.userId === userId && r.programId === programId) || null;
  }

  /**
   * 추천 결과 저장/업데이트 (Upsert)
   */
  async upsertRecommendation(
    data: Omit<Recommendation, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Recommendation> {
    // 실제 구현:
    // const query = `
    //   INSERT INTO recommendation (user_id, program_id, match_score, match_reasons, is_bookmarked)
    //   VALUES ($1, $2, $3, $4, $5)
    //   ON CONFLICT (user_id, program_id)
    //   DO UPDATE SET match_score = $3, match_reasons = $4, updated_at = NOW()
    //   RETURNING *
    // `;

    const existing = await this.findRecommendationByUserAndProgram(
      data.userId,
      data.programId,
    );

    if (existing) {
      const updated = {
        ...existing,
        matchScore: data.matchScore,
        matchReasons: data.matchReasons,
        updatedAt: new Date(),
      };
      this.recommendations.set(existing.id, updated);
      return updated;
    }

    const newRec: Recommendation = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: data.userId,
      programId: data.programId,
      matchScore: data.matchScore,
      matchReasons: data.matchReasons,
      isBookmarked: data.isBookmarked || false,
      viewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.recommendations.set(newRec.id, newRec);
    return newRec;
  }

  /**
   * 사용자의 모든 추천 삭제
   */
  async deleteRecommendationsByUserId(userId: string): Promise<number> {
    // 실제 구현:
    // const query = `DELETE FROM recommendation WHERE user_id = $1`;
    // const result = await this.db.query(query, [userId]);
    // return result.rowCount;

    let count = 0;
    for (const [id, rec] of this.recommendations.entries()) {
      if (rec.userId === userId) {
        this.recommendations.delete(id);
        count++;
      }
    }
    return count;
  }

  /**
   * 추천 조회 시간 업데이트
   */
  async updateViewedAt(recommendationId: string): Promise<Date> {
    const viewedAt = new Date();
    
    // 실제 구현:
    // const query = `
    //   UPDATE recommendation
    //   SET viewed_at = $1, updated_at = NOW()
    //   WHERE id = $2
    //   RETURNING viewed_at
    // `;

    const rec = this.recommendations.get(recommendationId);
    if (rec) {
      rec.viewedAt = viewedAt;
      rec.updatedAt = viewedAt;
    }

    return viewedAt;
  }

  /**
   * 북마크 토글
   */
  async toggleBookmark(
    userId: string,
    programId: string,
  ): Promise<boolean> {
    const rec = await this.findRecommendationByUserAndProgram(userId, programId);
    if (rec) {
      rec.isBookmarked = !rec.isBookmarked;
      return rec.isBookmarked;
    }
    return false;
  }

  /**
   * 카테고리별 추천 개수 조회
   */
  async countRecommendationsByCategory(
    userId: string,
  ): Promise<Map<WelfareCategory, number>> {
    // 실제 구현:
    // const query = `
    //   SELECT wp.category, COUNT(*) as count
    //   FROM recommendation r
    //   JOIN welfare_program wp ON r.program_id = wp.id
    //   WHERE r.user_id = $1 AND wp.is_active = true
    //   GROUP BY wp.category
    // `;

    const counts = new Map<WelfareCategory, number>();
    
    for (const rec of this.recommendations.values()) {
      if (rec.userId === userId) {
        const program = this.welfarePrograms.get(rec.programId);
        if (program && program.isActive) {
          const current = counts.get(program.category) || 0;
          counts.set(program.category, current + 1);
        }
      }
    }

    return counts;
  }

  // ==================== 추천 이력 ====================

  /**
   * 추천 이력 저장
   */
  async saveHistory(
    data: Omit<RecommendationHistory, 'id' | 'createdAt'>,
  ): Promise<RecommendationHistory> {
    // 실제 구현:
    // const query = `
    //   INSERT INTO recommendation_history (user_id, program_id, match_score, action)
    //   VALUES ($1, $2, $3, $4)
    //   RETURNING *
    // `;

    const history: RecommendationHistory = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: data.userId,
      programId: data.programId,
      matchScore: data.matchScore,
      action: data.action,
      createdAt: new Date(),
    };

    this.recommendationHistory.push(history);
    return history;
  }

  // ==================== 샘플 데이터 ====================

  /**
   * 샘플 데이터 초기화 (개발용)
   */
  private initializeSampleData(): void {
    // 샘플 복지 프로그램
    const samplePrograms: WelfareProgram[] = [
      {
        id: 'wp-001',
        name: '청년 월세 지원',
        description: '청년의 주거비 부담을 완화하기 위해 월세를 지원하는 사업입니다.',
        summary: '청년의 주거비 부담 완화를 위한 월세 지원',
        category: WelfareCategory.HOUSING,
        targetGroups: ['youth', 'low_income'],
        eligibilityCriteria: {
          ageMin: 19,
          ageMax: 34,
          incomeLevels: [1, 2, 3, 4, 5],
          regions: [],
          householdTypes: ['single'],
          specialConditions: [],
        },
        applicationMethod: {
          online: { url: 'https://www.myhome.go.kr', siteName: '마이홈 포털' },
          offline: { location: '주민센터', address: '거주지 관할 주민센터' },
        },
        requiredDocuments: [
          { name: '주민등록등본', isRequired: true },
          { name: '소득증명서', isRequired: true },
          { name: '임대차계약서', isRequired: true },
        ],
        contactInfo: { phone: '1600-1004', website: 'https://www.myhome.go.kr' },
        benefits: '월 최대 20만원 지원 (최대 12개월)',
        benefitAmount: '월 20만원',
        applicationStartDate: null,
        applicationEndDate: new Date('2026-12-31'),
        isAlwaysOpen: false,
        managingOrganization: '국토교통부',
        sourceUrl: null,
        tags: ['청년', '주거', '월세'],
        viewCount: 1250,
        bookmarkCount: 320,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'wp-002',
        name: '기초연금',
        description: '만 65세 이상 어르신 중 소득인정액이 선정기준액 이하인 분들께 매월 기초연금을 지급합니다.',
        summary: '65세 이상 어르신 대상 기초연금 지급',
        category: WelfareCategory.LIVING_SUPPORT,
        targetGroups: ['senior', 'low_income'],
        eligibilityCriteria: {
          ageMin: 65,
          ageMax: null,
          incomeLevels: [1, 2, 3, 4],
          regions: [],
          householdTypes: [],
          specialConditions: [],
        },
        applicationMethod: {
          online: { url: 'https://www.bokjiro.go.kr', siteName: '복지로' },
          offline: { location: '국민연금공단', address: '가까운 국민연금공단 지사' },
        },
        requiredDocuments: [
          { name: '신분증', isRequired: true },
          { name: '통장 사본', isRequired: true },
        ],
        contactInfo: { phone: '1355', website: 'https://www.bokjiro.go.kr' },
        benefits: '월 최대 334,810원 지급',
        benefitAmount: '월 최대 33만원',
        applicationStartDate: null,
        applicationEndDate: null,
        isAlwaysOpen: true,
        managingOrganization: '보건복지부',
        sourceUrl: null,
        tags: ['노인', '연금', '기초생활'],
        viewCount: 2500,
        bookmarkCount: 580,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'wp-003',
        name: '국민취업지원제도',
        description: '취업을 원하는 사람에게 취업지원 서비스와 생활안정을 위한 구직촉진수당을 지원합니다.',
        summary: '구직자 대상 취업지원 및 수당 지급',
        category: WelfareCategory.EMPLOYMENT,
        targetGroups: ['youth', 'middle_aged', 'low_income'],
        eligibilityCriteria: {
          ageMin: 15,
          ageMax: 69,
          incomeLevels: [1, 2, 3, 4, 5, 6],
          regions: [],
          householdTypes: [],
          specialConditions: [
            { key: 'is_unemployed', label: '실업/미취업 상태', value: true, isRequired: true },
          ],
        },
        applicationMethod: {
          online: { url: 'https://www.work.go.kr', siteName: '워크넷' },
          offline: { location: '고용센터', address: '가까운 고용센터' },
        },
        requiredDocuments: [
          { name: '신분증', isRequired: true },
          { name: '소득증명서', isRequired: true },
        ],
        contactInfo: { phone: '1350', website: 'https://www.work.go.kr' },
        benefits: '구직촉진수당 월 50만원 (최대 6개월)',
        benefitAmount: '월 50만원',
        applicationStartDate: null,
        applicationEndDate: null,
        isAlwaysOpen: true,
        managingOrganization: '고용노동부',
        sourceUrl: null,
        tags: ['취업', '구직', '청년'],
        viewCount: 1800,
        bookmarkCount: 420,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'wp-004',
        name: '한부모가족 복지급여',
        description: '저소득 한부모가족의 생활 안정과 자녀 양육을 위해 아동양육비를 지원합니다.',
        summary: '저소득 한부모가족 대상 양육비 지원',
        category: WelfareCategory.CHILDCARE,
        targetGroups: ['single_parent', 'low_income'],
        eligibilityCriteria: {
          ageMin: null,
          ageMax: null,
          incomeLevels: [1, 2, 3, 4],
          regions: [],
          householdTypes: ['single_parent'],
          specialConditions: [],
        },
        applicationMethod: {
          online: { url: 'https://www.bokjiro.go.kr', siteName: '복지로' },
          offline: { location: '주민센터', address: '거주지 관할 주민센터' },
        },
        requiredDocuments: [
          { name: '신청서', isRequired: true },
          { name: '소득재산 신고서', isRequired: true },
          { name: '한부모가족 증명서류', isRequired: true },
        ],
        contactInfo: { phone: '129', website: 'https://www.bokjiro.go.kr' },
        benefits: '아동양육비 월 20만원, 추가 아동양육비 월 5만원 등',
        benefitAmount: '월 20만원~',
        applicationStartDate: null,
        applicationEndDate: null,
        isAlwaysOpen: true,
        managingOrganization: '여성가족부',
        sourceUrl: null,
        tags: ['한부모', '양육비', '아동'],
        viewCount: 980,
        bookmarkCount: 245,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'wp-005',
        name: '교육급여',
        description: '기초생활수급자 및 차상위 가구의 초·중·고등학생에게 교육활동지원비를 지원합니다.',
        summary: '저소득층 학생 대상 교육비 지원',
        category: WelfareCategory.EDUCATION,
        targetGroups: ['child', 'low_income'],
        eligibilityCriteria: {
          ageMin: 6,
          ageMax: 18,
          incomeLevels: [1, 2, 3],
          regions: [],
          householdTypes: [],
          specialConditions: [
            { key: 'is_student', label: '초/중/고 재학생', value: true, isRequired: true },
          ],
        },
        applicationMethod: {
          online: { url: 'https://www.bokjiro.go.kr', siteName: '복지로' },
          offline: { location: '주민센터', address: '거주지 관할 주민센터' },
        },
        requiredDocuments: [
          { name: '신청서', isRequired: true },
          { name: '재학증명서', isRequired: true },
        ],
        contactInfo: { phone: '129', website: 'https://www.bokjiro.go.kr' },
        benefits: '교육활동지원비 연 461,000원~654,000원',
        benefitAmount: '연 46만원~65만원',
        applicationStartDate: null,
        applicationEndDate: null,
        isAlwaysOpen: true,
        managingOrganization: '교육부',
        sourceUrl: null,
        tags: ['교육', '학생', '교육비'],
        viewCount: 1200,
        bookmarkCount: 310,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // 메모리에 저장
    samplePrograms.forEach(p => this.welfarePrograms.set(p.id, p));

    this.logger.log(`Initialized ${samplePrograms.length} sample welfare programs`);
  }
}
