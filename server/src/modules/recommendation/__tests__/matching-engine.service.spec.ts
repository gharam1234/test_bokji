/**
 * 매칭 엔진 서비스 단위 테스트
 */

import { MatchingEngineService } from '../services/matching-engine.service';
import {
  WelfareProgram,
  WelfareCategory,
  TargetGroup,
  IncomeLevel,
  HouseholdType,
  EligibilityCriteria,
} from '../entities/welfare-program.entity';
import { MatchReasonType } from '../entities/recommendation.entity';
import { UserProfileForMatching } from '../interfaces/match-result.interface';

describe('MatchingEngineService', () => {
  let service: MatchingEngineService;

  beforeEach(() => {
    service = new MatchingEngineService();
  });

  // ==================== 헬퍼 함수 ====================
  
  const createMockProfile = (overrides: Partial<UserProfileForMatching> = {}): UserProfileForMatching => ({
    userId: 'test-user-id',
    age: 28,
    incomeLevel: IncomeLevel.LEVEL_5,
    region: { sido: '서울특별시', sigungu: '강남구' },
    householdType: HouseholdType.SINGLE,
    specialConditions: {},
    ...overrides,
  });

  const createMockProgram = (
    id: string,
    criteria: Partial<EligibilityCriteria> = {},
  ): WelfareProgram => ({
    id,
    name: `테스트 복지 프로그램 ${id}`,
    description: '테스트용 복지 프로그램입니다.',
    summary: '테스트 요약',
    category: WelfareCategory.LIVING_SUPPORT,
    targetGroups: [TargetGroup.GENERAL],
    eligibilityCriteria: {
      minAge: null,
      maxAge: null,
      incomeLevels: [],
      regions: [],
      householdTypes: [],
      specialConditions: [],
      ...criteria,
    },
    applicationMethod: { online: { url: 'https://test.com', siteName: '테스트' } },
    requiredDocuments: [],
    contactInfo: { phone: '1234-5678' },
    benefits: '테스트 혜택',
    benefitAmount: '월 10만원',
    applicationStartDate: null,
    applicationEndDate: null,
    isAlwaysOpen: true,
    managingOrganization: '테스트 기관',
    sourceUrl: null,
    tags: [],
    viewCount: 0,
    bookmarkCount: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // ==================== 나이 조건 테스트 ====================

  describe('나이 조건 매칭', () => {
    it('청년 월세 지원 - 적격 (25세, 19-34세 대상)', () => {
      const profile = createMockProfile({ age: 25 });
      const program = createMockProgram('youth-housing', {
        minAge: 19,
        maxAge: 34,
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(30);
      expect(result.matchedConditions).toContain('age');
    });

    it('청년 월세 지원 - 나이 초과 (40세)', () => {
      const profile = createMockProfile({ age: 40 });
      const program = createMockProgram('youth-housing', {
        minAge: 19,
        maxAge: 34,
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(false);
      expect(result.score).toBe(0);
      expect(result.unmatchedConditions).toContain('age');
    });

    it('노인 기초연금 - 적격 (70세, 65세 이상 대상)', () => {
      const profile = createMockProfile({ age: 70 });
      const program = createMockProgram('senior-pension', {
        minAge: 65,
        maxAge: null,
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(true);
      expect(result.matchedConditions).toContain('age');
    });

    it('노인 기초연금 - 나이 미달 (60세)', () => {
      const profile = createMockProfile({ age: 60 });
      const program = createMockProgram('senior-pension', {
        minAge: 65,
        maxAge: null,
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(false);
    });

    it('나이 조건 없음 - 모든 연령 통과', () => {
      const profile = createMockProfile({ age: 45 });
      const program = createMockProgram('all-ages', {
        minAge: null,
        maxAge: null,
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(true);
    });
  });

  // ==================== 소득 조건 테스트 ====================

  describe('소득 조건 매칭', () => {
    it('저소득층 지원 - 적격 (2분위, 1-3분위 대상)', () => {
      const profile = createMockProfile({ incomeLevel: IncomeLevel.LEVEL_2 });
      const program = createMockProgram('low-income-support', {
        incomeLevels: [IncomeLevel.LEVEL_1, IncomeLevel.LEVEL_2, IncomeLevel.LEVEL_3],
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(true);
      expect(result.matchedConditions).toContain('income');
    });

    it('저소득층 지원 - 소득 초과 (5분위)', () => {
      const profile = createMockProfile({ incomeLevel: IncomeLevel.LEVEL_5 });
      const program = createMockProgram('low-income-support', {
        incomeLevels: [IncomeLevel.LEVEL_1, IncomeLevel.LEVEL_2, IncomeLevel.LEVEL_3],
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(false);
      expect(result.unmatchedConditions).toContain('income');
    });

    it('소득 조건 없음 - 모든 소득 통과', () => {
      const profile = createMockProfile({ incomeLevel: IncomeLevel.LEVEL_8 });
      const program = createMockProgram('all-income', {
        incomeLevels: [],
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(true);
    });

    it('소득 무관 (ALL) - 모든 소득 통과', () => {
      const profile = createMockProfile({ incomeLevel: IncomeLevel.LEVEL_7 });
      const program = createMockProgram('income-all', {
        incomeLevels: [IncomeLevel.ALL],
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(true);
    });
  });

  // ==================== 지역 조건 테스트 ====================

  describe('지역 조건 매칭', () => {
    it('서울 지역 복지 - 적격 (서울 거주)', () => {
      const profile = createMockProfile({
        region: { sido: '서울특별시', sigungu: '강남구' },
      });
      const program = createMockProgram('seoul-welfare', {
        regions: [{ sido: '서울특별시', sigungu: null }],
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(true);
      expect(result.matchedConditions).toContain('region');
    });

    it('서울 지역 복지 - 타 지역 (부산 거주)', () => {
      const profile = createMockProfile({
        region: { sido: '부산광역시', sigungu: '해운대구' },
      });
      const program = createMockProgram('seoul-welfare', {
        regions: [{ sido: '서울특별시', sigungu: null }],
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(false);
      expect(result.unmatchedConditions).toContain('region');
    });

    it('강남구 한정 복지 - 적격 (강남구 거주)', () => {
      const profile = createMockProfile({
        region: { sido: '서울특별시', sigungu: '강남구' },
      });
      const program = createMockProgram('gangnam-welfare', {
        regions: [{ sido: '서울특별시', sigungu: '강남구' }],
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(true);
    });

    it('강남구 한정 복지 - 서초구 거주 (미적격)', () => {
      const profile = createMockProfile({
        region: { sido: '서울특별시', sigungu: '서초구' },
      });
      const program = createMockProgram('gangnam-welfare', {
        regions: [{ sido: '서울특별시', sigungu: '강남구' }],
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(false);
    });

    it('전국 복지 (지역 조건 없음) - 모든 지역 통과', () => {
      const profile = createMockProfile({
        region: { sido: '제주특별자치도', sigungu: '제주시' },
      });
      const program = createMockProgram('nationwide', {
        regions: [],
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(true);
    });
  });

  // ==================== 가구 유형 조건 테스트 ====================

  describe('가구 유형 조건 매칭', () => {
    it('1인가구 지원 - 적격', () => {
      const profile = createMockProfile({ householdType: HouseholdType.SINGLE });
      const program = createMockProgram('single-support', {
        householdTypes: [HouseholdType.SINGLE],
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(true);
      expect(result.matchedConditions).toContain('household');
    });

    it('다자녀 지원 - 자녀 2명 (미적격)', () => {
      const profile = createMockProfile({ householdType: HouseholdType.NUCLEAR });
      const program = createMockProgram('multi-child-support', {
        householdTypes: [HouseholdType.MULTI_CHILD],
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(false);
      expect(result.unmatchedConditions).toContain('household');
    });

    it('다자녀 지원 - 자녀 3명 이상 (적격)', () => {
      const profile = createMockProfile({ householdType: HouseholdType.MULTI_CHILD });
      const program = createMockProgram('multi-child-support', {
        householdTypes: [HouseholdType.MULTI_CHILD],
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(true);
      expect(result.matchedConditions).toContain('household');
    });

    it('한부모 지원 - 적격', () => {
      const profile = createMockProfile({ householdType: HouseholdType.SINGLE_PARENT });
      const program = createMockProgram('single-parent-support', {
        householdTypes: [HouseholdType.SINGLE_PARENT],
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(true);
    });

    it('가구 유형 조건 없음 - 모든 가구 통과', () => {
      const profile = createMockProfile({ householdType: HouseholdType.EXTENDED });
      const program = createMockProgram('all-household', {
        householdTypes: [],
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(true);
    });
  });

  // ==================== 복합 조건 테스트 ====================

  describe('복합 조건 매칭', () => {
    it('청년 저소득 1인가구 - 모든 조건 충족', () => {
      const profile = createMockProfile({
        age: 28,
        incomeLevel: IncomeLevel.LEVEL_3,
        householdType: HouseholdType.SINGLE,
        region: { sido: '서울특별시', sigungu: '강남구' },
      });
      const program = createMockProgram('youth-low-income-single', {
        minAge: 19,
        maxAge: 34,
        incomeLevels: [IncomeLevel.LEVEL_1, IncomeLevel.LEVEL_2, IncomeLevel.LEVEL_3],
        householdTypes: [HouseholdType.SINGLE],
        regions: [{ sido: '서울특별시', sigungu: null }],
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.matchedConditions).toContain('age');
      expect(result.matchedConditions).toContain('income');
      expect(result.matchedConditions).toContain('household');
      expect(result.matchedConditions).toContain('region');
    });

    it('청년 저소득 1인가구 - 나이만 미충족', () => {
      const profile = createMockProfile({
        age: 40,
        incomeLevel: IncomeLevel.LEVEL_3,
        householdType: HouseholdType.SINGLE,
        region: { sido: '서울특별시', sigungu: '강남구' },
      });
      const program = createMockProgram('youth-low-income-single', {
        minAge: 19,
        maxAge: 34,
        incomeLevels: [IncomeLevel.LEVEL_1, IncomeLevel.LEVEL_2, IncomeLevel.LEVEL_3],
        householdTypes: [HouseholdType.SINGLE],
        regions: [{ sido: '서울특별시', sigungu: null }],
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.isEligible).toBe(false);
      expect(result.unmatchedConditions).toContain('age');
    });
  });

  // ==================== 매칭 이유 생성 테스트 ====================

  describe('매칭 이유 생성', () => {
    it('나이 매칭 이유 포함', () => {
      const profile = createMockProfile({ age: 28 });
      const program = createMockProgram('youth', {
        minAge: 19,
        maxAge: 34,
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.matchReasons.some(r => r.type === MatchReasonType.AGE)).toBe(true);
    });

    it('소득 매칭 이유 포함', () => {
      const profile = createMockProfile({ incomeLevel: IncomeLevel.LEVEL_3 });
      const program = createMockProgram('low-income', {
        incomeLevels: [IncomeLevel.LEVEL_1, IncomeLevel.LEVEL_2, IncomeLevel.LEVEL_3],
      });

      const result = service.calculateMatchScore(profile, program.eligibilityCriteria);

      expect(result.matchReasons.some(r => r.type === MatchReasonType.INCOME)).toBe(true);
    });
  });

  // ==================== 전체 매칭 실행 테스트 ====================

  describe('전체 매칭 실행 (runMatchingForUser)', () => {
    it('적격 프로그램만 결과에 포함', () => {
      const profile = createMockProfile({ age: 28, incomeLevel: IncomeLevel.LEVEL_3 });
      const programs = [
        createMockProgram('eligible', { minAge: 19, maxAge: 34 }),
        createMockProgram('not-eligible-age', { minAge: 65, maxAge: null }),
        createMockProgram('not-eligible-income', {
          incomeLevels: [IncomeLevel.LEVEL_1],
        }),
      ];

      const results = service.runMatchingForUser(profile, programs);

      expect(results.length).toBe(1);
      expect(results[0].programId).toBe('eligible');
    });

    it('결과가 점수 내림차순 정렬', () => {
      const profile = createMockProfile({ age: 28 });
      const programs = [
        createMockProgram('program-a', { minAge: 19, maxAge: 34 }),
        createMockProgram('program-b', { minAge: null, maxAge: null }),
      ];

      const results = service.runMatchingForUser(profile, programs);

      expect(results.length).toBe(2);
      expect(results[0].matchScore).toBeGreaterThanOrEqual(results[1].matchScore);
    });

    it('빈 프로그램 목록 - 빈 결과 반환', () => {
      const profile = createMockProfile();
      const programs: WelfareProgram[] = [];

      const results = service.runMatchingForUser(profile, programs);

      expect(results).toEqual([]);
    });
  });
});
