/**
 * 소득 관련 옵션 및 상수 정의
 */

import { IncomeType, IncomeBracket } from '../types';

/** 소득 유형 옵션 */
export const INCOME_TYPE_OPTIONS = [
  { value: IncomeType.EMPLOYMENT, label: '근로소득', description: '급여, 상여금 등' },
  { value: IncomeType.BUSINESS, label: '사업소득', description: '자영업, 프리랜서 등' },
  { value: IncomeType.PROPERTY, label: '재산소득', description: '임대료, 이자, 배당금 등' },
  { value: IncomeType.PENSION, label: '연금소득', description: '국민연금, 퇴직연금 등' },
  { value: IncomeType.OTHER, label: '기타소득', description: '일시적 소득 등' },
  { value: IncomeType.NONE, label: '소득 없음', description: '무소득' },
] as const;

/** 소득 구간 옵션 */
export const INCOME_BRACKET_OPTIONS = [
  { value: IncomeBracket.BELOW_50, label: '중위소득 50% 이하', color: '#22c55e' },
  { value: IncomeBracket.BELOW_75, label: '중위소득 50~75%', color: '#84cc16' },
  { value: IncomeBracket.BELOW_100, label: '중위소득 75~100%', color: '#eab308' },
  { value: IncomeBracket.BELOW_150, label: '중위소득 100~150%', color: '#f97316' },
  { value: IncomeBracket.ABOVE_150, label: '중위소득 150% 초과', color: '#ef4444' },
] as const;

/**
 * 2026년 기준 중위소득 (월 기준, 단위: 원)
 * 보건복지부 고시 기준
 */
export const MEDIAN_INCOME_2026: Record<number, number> = {
  1: 2392013,  // 1인 가구
  2: 3932658,  // 2인 가구
  3: 5025353,  // 3인 가구
  4: 6097773,  // 4인 가구
  5: 7108192,  // 5인 가구
  6: 8064805,  // 6인 가구
  7: 8988428,  // 7인 가구
  8: 9912051,  // 8인 가구
  9: 10835674, // 9인 가구
  10: 11759297, // 10인 가구
};

/** 가구원 수별 증가 금액 (10인 초과 시) */
export const INCOME_INCREMENT_PER_PERSON = 923623;

/** 소득 입력 최대값 */
export const MAX_ANNUAL_INCOME = 10_000_000_000; // 100억

/** 소득 입력 단위 */
export const INCOME_INPUT_STEP = 10_000; // 1만원

/** 소득 구간별 혜택 안내 */
export const BRACKET_BENEFITS: Record<IncomeBracket, string[]> = {
  [IncomeBracket.BELOW_50]: [
    '기초생활보장 수급 가능',
    '의료비 지원 대상',
    '교육비 지원 대상',
    '주거비 지원 대상',
  ],
  [IncomeBracket.BELOW_75]: [
    '차상위계층 지원 대상',
    '의료비 일부 지원',
    '교육비 지원 대상',
  ],
  [IncomeBracket.BELOW_100]: [
    '일부 복지 서비스 대상',
    '교육비 일부 지원',
  ],
  [IncomeBracket.BELOW_150]: [
    '일부 지원 프로그램 대상',
  ],
  [IncomeBracket.ABOVE_150]: [
    '일반 복지 서비스 이용 가능',
  ],
};
