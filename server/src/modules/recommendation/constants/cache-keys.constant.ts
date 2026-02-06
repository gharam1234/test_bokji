/**
 * 캐시 키 상수
 */

/** 캐시 키 프리픽스 */
export const CACHE_KEYS = {
  /** 사용자 추천 결과 캐시 */
  USER_RECOMMENDATIONS: 'recommendations:user:',
  RECOMMENDATIONS: 'recommendations:user',
  
  /** 복지 프로그램 캐시 */
  WELFARE_PROGRAM: 'welfare:program',
  
  /** 복지 프로그램 목록 캐시 */
  WELFARE_PROGRAMS_ACTIVE: 'welfare:programs:active',
  
  /** 카테고리별 개수 캐시 */
  CATEGORY_COUNTS: 'recommendations:categories:',
  
  /** 요청 제한 */
  RATE_LIMIT: 'ratelimit',
} as const;

/** 캐시 TTL (초) */
export const CACHE_TTL = {
  /** 사용자 추천 결과: 1시간 */
  USER_RECOMMENDATIONS: 3600,
  RECOMMENDATIONS: 3600,
  
  /** 복지 프로그램: 24시간 */
  WELFARE_PROGRAM: 86400,
  
  /** 복지 프로그램 목록: 1시간 */
  WELFARE_PROGRAMS_ACTIVE: 3600,
  
  /** 카테고리별 개수: 1시간 */
  CATEGORY_COUNTS: 3600,
  
  /** 요청 제한 윈도우: 60초 */
  RATE_LIMIT_WINDOW: 60,
} as const;

