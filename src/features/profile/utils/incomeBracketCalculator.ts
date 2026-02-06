/**
 * 소득 구간 계산 유틸리티
 */

import { IncomeBracket } from '../types';
import { MEDIAN_INCOME_2026, INCOME_INCREMENT_PER_PERSON } from '../constants/incomeOptions';

/**
 * 가구원 수에 따른 기준 중위소득 조회 (월 기준)
 */
export const getMonthlyMedianIncome = (householdSize: number): number => {
  if (householdSize <= 0) return 0;
  
  // 10인 이하는 테이블에서 조회
  if (householdSize <= 10) {
    return MEDIAN_INCOME_2026[householdSize] || 0;
  }
  
  // 10인 초과는 증가분 적용
  const base = MEDIAN_INCOME_2026[10];
  const extraPersons = householdSize - 10;
  return base + INCOME_INCREMENT_PER_PERSON * extraPersons;
};

/**
 * 가구원 수에 따른 기준 중위소득 조회 (연 기준)
 */
export const getAnnualMedianIncome = (householdSize: number): number => {
  return getMonthlyMedianIncome(householdSize) * 12;
};

/**
 * 소득 구간 계산
 * @param annualIncome 연간 소득 (원)
 * @param householdSize 가구원 수
 * @returns 소득 구간
 */
export const calculateIncomeBracket = (
  annualIncome: number,
  householdSize: number
): IncomeBracket => {
  if (annualIncome < 0 || householdSize <= 0) {
    return IncomeBracket.BELOW_50;
  }

  const annualMedian = getAnnualMedianIncome(householdSize);
  
  if (annualMedian === 0) {
    return IncomeBracket.BELOW_50;
  }

  const ratio = annualIncome / annualMedian;

  if (ratio <= 0.5) {
    return IncomeBracket.BELOW_50;
  } else if (ratio <= 0.75) {
    return IncomeBracket.BELOW_75;
  } else if (ratio <= 1.0) {
    return IncomeBracket.BELOW_100;
  } else if (ratio <= 1.5) {
    return IncomeBracket.BELOW_150;
  } else {
    return IncomeBracket.ABOVE_150;
  }
};

/**
 * 소득 비율 계산 (기준 중위소득 대비)
 * @param annualIncome 연간 소득 (원)
 * @param householdSize 가구원 수
 * @returns 비율 (0~∞, 1 = 100%)
 */
export const calculateIncomeRatio = (
  annualIncome: number,
  householdSize: number
): number => {
  const annualMedian = getAnnualMedianIncome(householdSize);
  
  if (annualMedian === 0) return 0;
  
  return annualIncome / annualMedian;
};

/**
 * 소득 비율을 퍼센트 문자열로 변환
 */
export const formatIncomeRatioPercent = (
  annualIncome: number,
  householdSize: number
): string => {
  const ratio = calculateIncomeRatio(annualIncome, householdSize);
  return `${(ratio * 100).toFixed(1)}%`;
};

/**
 * 특정 소득 구간의 소득 범위 계산
 * @param bracket 소득 구간
 * @param householdSize 가구원 수
 * @returns { min, max } 범위 (연간, 원)
 */
export const getBracketRange = (
  bracket: IncomeBracket,
  householdSize: number
): { min: number; max: number } => {
  const annualMedian = getAnnualMedianIncome(householdSize);

  switch (bracket) {
    case IncomeBracket.BELOW_50:
      return { min: 0, max: annualMedian * 0.5 };
    case IncomeBracket.BELOW_75:
      return { min: annualMedian * 0.5, max: annualMedian * 0.75 };
    case IncomeBracket.BELOW_100:
      return { min: annualMedian * 0.75, max: annualMedian };
    case IncomeBracket.BELOW_150:
      return { min: annualMedian, max: annualMedian * 1.5 };
    case IncomeBracket.ABOVE_150:
      return { min: annualMedian * 1.5, max: Infinity };
    default:
      return { min: 0, max: 0 };
  }
};
