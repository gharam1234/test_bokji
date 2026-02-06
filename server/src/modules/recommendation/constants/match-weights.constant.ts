/**
 * 매칭 가중치 상수
 * 매칭 점수 계산에 사용되는 가중치 정의
 */

/** 기본 매칭 가중치 */
export const MATCH_WEIGHTS = {
  /** 나이 조건 충족 가중치 */
  AGE: 25,
  
  /** 소득 조건 충족 가중치 */
  INCOME: 25,
  
  /** 지역 조건 충족 가중치 */
  REGION: 20,
  
  /** 가구 유형 조건 충족 가중치 */
  HOUSEHOLD: 15,
  
  /** 특수 조건 기본 가중치 */
  SPECIAL_BASE: 15,
} as const;

/** 조건 미지정시 기본 점수 (해당 조건이 없으면 자동 충족) */
export const DEFAULT_SCORE_IF_NO_CONDITION = 100;

/** 최소 매칭 점수 (이 점수 이상만 추천 목록에 포함) */
export const MIN_MATCH_SCORE = 50;

/** 최대 추천 개수 (캐싱 시) */
export const MAX_RECOMMENDATIONS = 100;
