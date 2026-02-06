/**
 * useIncomeBracket 훅
 * 소득 구간 계산 및 표시
 */

import { useMemo } from 'react';
import { IncomeBracket, INCOME_BRACKET_LABELS } from '../types';

// 2026년 기준 중위소득 (연간, 원)
const MEDIAN_INCOME_2026: Record<number, number> = {
  1: 26_195_484,
  2: 43_563_288,
  3: 55_889_532,
  4: 68_065_944,
  5: 79_794_252,
  6: 91_108_056,
  7: 102_186_504,
};

const ADDITIONAL_PER_PERSON = 11_078_448;

/** useIncomeBracket 옵션 */
export interface UseIncomeBracketOptions {
  /** 연간 소득 */
  annualIncome: number;
  /** 가구원 수 */
  householdSize: number;
}

/** useIncomeBracket 반환 타입 */
export interface UseIncomeBracketReturn {
  /** 소득 구간 */
  bracket: IncomeBracket;
  /** 소득 구간 라벨 */
  bracketLabel: string;
  /** 기준 중위소득 */
  medianIncome: number;
  /** 중위소득 대비 비율 (%) */
  ratio: number;
  /** 월 소득 */
  monthlyIncome: number;
  /** 구간별 소득 범위 */
  bracketRange: { min: number; max: number };
}

/**
 * 가구원 수에 따른 기준 중위소득 계산
 */
function getMedianIncome(householdSize: number): number {
  if (householdSize <= 0) householdSize = 1;

  if (householdSize <= 7) {
    return MEDIAN_INCOME_2026[householdSize];
  }

  const extraMembers = householdSize - 7;
  return MEDIAN_INCOME_2026[7] + extraMembers * ADDITIONAL_PER_PERSON;
}

/**
 * 소득 구간 계산
 */
function calculateBracket(annualIncome: number, medianIncome: number): IncomeBracket {
  const ratio = annualIncome / medianIncome;

  if (ratio <= 0.5) return IncomeBracket.BELOW_50;
  if (ratio <= 0.75) return IncomeBracket.BELOW_75;
  if (ratio <= 1.0) return IncomeBracket.BELOW_100;
  if (ratio <= 1.5) return IncomeBracket.BELOW_150;
  return IncomeBracket.ABOVE_150;
}

/**
 * 소득 구간 범위 계산
 */
function getBracketRange(bracket: IncomeBracket, medianIncome: number): { min: number; max: number } {
  const ranges: Record<IncomeBracket, { min: number; max: number }> = {
    [IncomeBracket.BELOW_50]: { min: 0, max: medianIncome * 0.5 },
    [IncomeBracket.BELOW_75]: { min: medianIncome * 0.5, max: medianIncome * 0.75 },
    [IncomeBracket.BELOW_100]: { min: medianIncome * 0.75, max: medianIncome },
    [IncomeBracket.BELOW_150]: { min: medianIncome, max: medianIncome * 1.5 },
    [IncomeBracket.ABOVE_150]: { min: medianIncome * 1.5, max: Number.MAX_SAFE_INTEGER },
  };

  return ranges[bracket];
}

/**
 * 소득 구간을 계산하고 관련 정보를 제공하는 커스텀 훅
 */
export function useIncomeBracket(options: UseIncomeBracketOptions): UseIncomeBracketReturn {
  const { annualIncome, householdSize } = options;

  return useMemo(() => {
    const medianIncome = getMedianIncome(householdSize);
    const bracket = calculateBracket(annualIncome, medianIncome);
    const ratio = (annualIncome / medianIncome) * 100;
    const monthlyIncome = Math.round(annualIncome / 12);
    const bracketRange = getBracketRange(bracket, medianIncome);

    return {
      bracket,
      bracketLabel: INCOME_BRACKET_LABELS[bracket],
      medianIncome,
      ratio: Math.round(ratio * 10) / 10, // 소수점 1자리
      monthlyIncome,
      bracketRange,
    };
  }, [annualIncome, householdSize]);
}

/**
 * 소득을 포맷팅하여 표시
 */
export function formatIncome(amount: number): string {
  if (amount >= 100000000) {
    const billions = Math.floor(amount / 100000000);
    const millions = Math.floor((amount % 100000000) / 10000);
    if (millions > 0) {
      return `${billions}억 ${millions.toLocaleString()}만원`;
    }
    return `${billions}억원`;
  }

  if (amount >= 10000) {
    const millions = Math.floor(amount / 10000);
    return `${millions.toLocaleString()}만원`;
  }

  return `${amount.toLocaleString()}원`;
}
