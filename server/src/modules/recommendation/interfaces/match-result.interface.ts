/**
 * 매칭 결과 인터페이스
 * 매칭 엔진에서 사용하는 인터페이스 정의
 */

import { MatchReason } from '../entities/recommendation.entity';

/** 매칭 결과 */
export interface MatchResult {
  /** 자격 충족 여부 */
  isEligible: boolean;
  
  /** 매칭 점수 (0-100) */
  score: number;
  
  /** 충족 조건 목록 */
  matchedConditions: string[];
  
  /** 미충족 조건 목록 */
  unmatchedConditions: string[];
  
  /** 가점 */
  bonusScore: number;
  
  /** 매칭 이유 */
  matchReasons: MatchReason[];
}

/** 사용자 프로필 (매칭용 간소화 버전) */
export interface UserProfileForMatching {
  userId: string;
  age: number;
  incomeLevel: number;               // 1-8
  sido: string;                      // 시/도
  sigungu: string;                   // 시/군/구
  householdType: string;             // 가구 유형
  householdSize: number;             // 가구원 수
  specialConditions: Record<string, boolean | string | number>;  // 특수 조건
}
