/**
 * 매칭 엔진 서비스
 * 사용자 프로필과 복지 프로그램의 자격 조건을 매칭하여 점수 계산
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  WelfareProgram,
  EligibilityCriteria,
  IncomeLevel,
  HouseholdType,
} from '../entities/welfare-program.entity';
import {
  MatchReason,
  MatchReasonType,
  Recommendation,
} from '../entities/recommendation.entity';
import { MatchResult, UserProfileForMatching } from '../interfaces/match-result.interface';
import { MATCH_WEIGHTS, MIN_MATCH_SCORE } from '../constants/match-weights.constant';

@Injectable()
export class MatchingEngineService {
  private readonly logger = new Logger(MatchingEngineService.name);

  /**
   * 전체 복지 프로그램 매칭 실행
   * @param profile 사용자 프로필
   * @param programs 복지 프로그램 목록
   * @returns 자격 충족하는 추천 결과 목록
   */
  runMatchingForUser(
    profile: UserProfileForMatching,
    programs: WelfareProgram[],
  ): Omit<Recommendation, 'id' | 'createdAt' | 'updatedAt'>[] {
    this.logger.debug(`Running matching for user: ${profile.userId}`);
    
    const results: Omit<Recommendation, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    for (const program of programs) {
      const matchResult = this.calculateMatchScore(profile, program.eligibilityCriteria);

      // 최소 점수 이상만 추천
      if (matchResult.isEligible && matchResult.score >= MIN_MATCH_SCORE) {
        results.push({
          userId: profile.userId,
          programId: program.id,
          matchScore: matchResult.score,
          matchReasons: matchResult.matchReasons,
          isBookmarked: false,
          viewedAt: null,
        });
      }
    }

    // 점수 내림차순 정렬
    results.sort((a, b) => b.matchScore - a.matchScore);

    this.logger.debug(`Matching completed: ${results.length} programs matched`);
    return results;
  }

  /**
   * 매칭 점수 계산
   * @param profile 사용자 프로필
   * @param criteria 자격 조건
   * @returns 매칭 결과
   */
  calculateMatchScore(
    profile: UserProfileForMatching,
    criteria: EligibilityCriteria,
  ): MatchResult {
    const matchedConditions: string[] = [];
    const unmatchedConditions: string[] = [];
    const matchReasons: MatchReason[] = [];
    
    let totalWeight = 0;
    let earnedWeight = 0;
    let bonusScore = 0;

    // 1. 나이 조건 체크
    const ageResult = this.checkAgeCondition(profile.age, criteria);
    totalWeight += MATCH_WEIGHTS.AGE;
    if (ageResult.matched) {
      earnedWeight += MATCH_WEIGHTS.AGE;
      matchedConditions.push('age');
      if (ageResult.reason) {
        matchReasons.push(ageResult.reason);
      }
    } else if (!ageResult.noCondition) {
      unmatchedConditions.push('age');
      // 나이 미충족 시 자격 없음
      return {
        isEligible: false,
        score: 0,
        matchedConditions,
        unmatchedConditions,
        bonusScore: 0,
        matchReasons: [],
      };
    }

    // 2. 소득 조건 체크
    const incomeResult = this.checkIncomeCondition(profile.incomeLevel, criteria);
    totalWeight += MATCH_WEIGHTS.INCOME;
    if (incomeResult.matched) {
      earnedWeight += MATCH_WEIGHTS.INCOME;
      matchedConditions.push('income');
      if (incomeResult.reason) {
        matchReasons.push(incomeResult.reason);
      }
    } else if (!incomeResult.noCondition) {
      unmatchedConditions.push('income');
      // 소득 미충족 시 자격 없음
      return {
        isEligible: false,
        score: 0,
        matchedConditions,
        unmatchedConditions,
        bonusScore: 0,
        matchReasons: [],
      };
    }

    // 3. 지역 조건 체크
    const regionResult = this.checkRegionCondition(
      profile.sido,
      profile.sigungu,
      criteria,
    );
    totalWeight += MATCH_WEIGHTS.REGION;
    if (regionResult.matched) {
      earnedWeight += MATCH_WEIGHTS.REGION;
      matchedConditions.push('region');
      if (regionResult.reason) {
        matchReasons.push(regionResult.reason);
      }
    } else if (!regionResult.noCondition) {
      unmatchedConditions.push('region');
      // 지역 미충족 시 자격 없음
      return {
        isEligible: false,
        score: 0,
        matchedConditions,
        unmatchedConditions,
        bonusScore: 0,
        matchReasons: [],
      };
    }

    // 4. 가구 유형 조건 체크
    const householdResult = this.checkHouseholdCondition(
      profile.householdType,
      criteria,
    );
    totalWeight += MATCH_WEIGHTS.HOUSEHOLD;
    if (householdResult.matched) {
      earnedWeight += MATCH_WEIGHTS.HOUSEHOLD;
      matchedConditions.push('household');
      if (householdResult.reason) {
        matchReasons.push(householdResult.reason);
      }
    } else if (!householdResult.noCondition) {
      unmatchedConditions.push('household');
      // 가구유형 미충족 시 자격 없음
      return {
        isEligible: false,
        score: 0,
        matchedConditions,
        unmatchedConditions,
        bonusScore: 0,
        matchReasons: [],
      };
    }

    // 5. 특수 조건 체크
    const specialResult = this.checkSpecialConditions(
      profile.specialConditions,
      criteria,
    );
    totalWeight += MATCH_WEIGHTS.SPECIAL_BASE;
    
    if (specialResult.allRequiredMet) {
      earnedWeight += MATCH_WEIGHTS.SPECIAL_BASE;
      matchedConditions.push(...specialResult.matchedKeys);
      matchReasons.push(...specialResult.reasons);
      bonusScore = specialResult.bonusScore;
    } else {
      // 필수 특수조건 미충족
      return {
        isEligible: false,
        score: 0,
        matchedConditions,
        unmatchedConditions: [...unmatchedConditions, ...specialResult.unmatchedKeys],
        bonusScore: 0,
        matchReasons: [],
      };
    }

    // 최종 점수 계산 (0-100)
    const baseScore = Math.round((earnedWeight / totalWeight) * 100);
    const finalScore = Math.min(100, baseScore + bonusScore);

    return {
      isEligible: true,
      score: finalScore,
      matchedConditions,
      unmatchedConditions,
      bonusScore,
      matchReasons,
    };
  }

  /**
   * 나이 조건 체크
   */
  private checkAgeCondition(
    age: number,
    criteria: EligibilityCriteria,
  ): { matched: boolean; noCondition: boolean; reason?: MatchReason } {
    const { ageMin, ageMax } = criteria;

    // 조건 없음
    if (ageMin === null && ageMax === null) {
      return { matched: true, noCondition: true };
    }
    if (ageMin === undefined && ageMax === undefined) {
      return { matched: true, noCondition: true };
    }

    // 조건 체크
    const meetsMin = ageMin === null || ageMin === undefined || age >= ageMin;
    const meetsMax = ageMax === null || ageMax === undefined || age <= ageMax;
    const matched = meetsMin && meetsMax;

    let label = '';
    if (ageMin && ageMax) {
      label = `만 ${ageMin}~${ageMax}세 대상`;
    } else if (ageMin) {
      label = `만 ${ageMin}세 이상 대상`;
    } else if (ageMax) {
      label = `만 ${ageMax}세 이하 대상`;
    }

    return {
      matched,
      noCondition: false,
      reason: matched ? {
        type: MatchReasonType.AGE,
        label,
        weight: MATCH_WEIGHTS.AGE,
      } : undefined,
    };
  }

  /**
   * 소득 조건 체크
   */
  private checkIncomeCondition(
    incomeLevel: number,
    criteria: EligibilityCriteria,
  ): { matched: boolean; noCondition: boolean; reason?: MatchReason } {
    const { incomeLevels } = criteria;

    // 조건 없음 (빈 배열 = 소득 무관)
    if (!incomeLevels || incomeLevels.length === 0) {
      return { matched: true, noCondition: true };
    }

    const matched = incomeLevels.includes(incomeLevel as IncomeLevel);
    
    // 소득 조건 라벨 생성
    const maxLevel = Math.max(...incomeLevels);
    let label = '';
    if (maxLevel <= 3) {
      label = '중위소득 50% 이하 해당';
    } else if (maxLevel <= 5) {
      label = '중위소득 100% 이하 해당';
    } else {
      label = '소득 기준 충족';
    }

    return {
      matched,
      noCondition: false,
      reason: matched ? {
        type: MatchReasonType.INCOME,
        label,
        weight: MATCH_WEIGHTS.INCOME,
      } : undefined,
    };
  }

  /**
   * 지역 조건 체크
   */
  private checkRegionCondition(
    sido: string,
    sigungu: string,
    criteria: EligibilityCriteria,
  ): { matched: boolean; noCondition: boolean; reason?: MatchReason } {
    const { regions } = criteria;

    // 조건 없음 (빈 배열 = 전국)
    if (!regions || regions.length === 0) {
      return {
        matched: true,
        noCondition: true,
        reason: {
          type: MatchReasonType.REGION,
          label: '전국 대상 복지',
          weight: MATCH_WEIGHTS.REGION,
        },
      };
    }

    // 지역 코드 매칭
    const matched = regions.some(region => {
      if (region.sigungu) {
        return region.sido === sido && region.sigungu === sigungu;
      }
      return region.sido === sido;
    });

    return {
      matched,
      noCondition: false,
      reason: matched ? {
        type: MatchReasonType.REGION,
        label: `${sido} 거주자 대상`,
        weight: MATCH_WEIGHTS.REGION,
      } : undefined,
    };
  }

  /**
   * 가구 유형 조건 체크
   */
  private checkHouseholdCondition(
    householdType: string,
    criteria: EligibilityCriteria,
  ): { matched: boolean; noCondition: boolean; reason?: MatchReason } {
    const { householdTypes } = criteria;

    // 조건 없음 (빈 배열 = 제한 없음)
    if (!householdTypes || householdTypes.length === 0) {
      return { matched: true, noCondition: true };
    }

    const matched = householdTypes.includes(householdType as HouseholdType);

    const labelMap: Record<string, string> = {
      single: '1인가구',
      single_parent: '한부모가구',
      multi_child: '다자녀가구',
    };

    return {
      matched,
      noCondition: false,
      reason: matched ? {
        type: MatchReasonType.HOUSEHOLD,
        label: `${labelMap[householdType] || '해당 가구유형'} 대상`,
        weight: MATCH_WEIGHTS.HOUSEHOLD,
      } : undefined,
    };
  }

  /**
   * 특수 조건 체크
   */
  private checkSpecialConditions(
    userConditions: Record<string, boolean | string | number>,
    criteria: EligibilityCriteria,
  ): {
    allRequiredMet: boolean;
    matchedKeys: string[];
    unmatchedKeys: string[];
    reasons: MatchReason[];
    bonusScore: number;
  } {
    const { specialConditions } = criteria;

    if (!specialConditions || specialConditions.length === 0) {
      return {
        allRequiredMet: true,
        matchedKeys: [],
        unmatchedKeys: [],
        reasons: [],
        bonusScore: 0,
      };
    }

    const matchedKeys: string[] = [];
    const unmatchedKeys: string[] = [];
    const reasons: MatchReason[] = [];
    let bonusScore = 0;
    let allRequiredMet = true;

    for (const condition of specialConditions) {
      const userValue = userConditions[condition.key];
      const matched = userValue === condition.value;

      if (matched) {
        matchedKeys.push(condition.key);
        reasons.push({
          type: MatchReasonType.SPECIAL,
          label: condition.label,
          weight: condition.bonusScore || 5,
        });
        if (condition.bonusScore) {
          bonusScore += condition.bonusScore;
        }
      } else {
        if (condition.isRequired) {
          allRequiredMet = false;
          unmatchedKeys.push(condition.key);
        }
      }
    }

    return {
      allRequiredMet,
      matchedKeys,
      unmatchedKeys,
      reasons,
      bonusScore,
    };
  }
}
