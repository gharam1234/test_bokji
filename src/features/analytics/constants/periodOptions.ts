/**
 * 기간 선택 옵션 상수
 */

import { PeriodFilter } from '../types';

/** 기간 선택 옵션 */
export interface PeriodOption {
  /** 값 */
  value: PeriodFilter;
  /** 표시 라벨 */
  label: string;
  /** 짧은 라벨 */
  shortLabel: string;
  /** 설명 */
  description: string;
}

/** 기간 선택 옵션 목록 */
export const PERIOD_OPTIONS: PeriodOption[] = [
  {
    value: 'week',
    label: '최근 7일',
    shortLabel: '7일',
    description: '지난 7일간의 활동',
  },
  {
    value: 'month',
    label: '이번 달',
    shortLabel: '1개월',
    description: '이번 달 전체 활동',
  },
  {
    value: 'quarter',
    label: '이번 분기',
    shortLabel: '3개월',
    description: '이번 분기 전체 활동',
  },
  {
    value: 'year',
    label: '올해',
    shortLabel: '1년',
    description: '올해 전체 활동',
  },
];

/**
 * 기간 값으로 옵션 찾기
 * @param value 기간 값
 * @returns 기간 옵션 또는 기본값 (month)
 */
export function getPeriodOption(value: PeriodFilter): PeriodOption {
  return PERIOD_OPTIONS.find((opt) => opt.value === value) || PERIOD_OPTIONS[1];
}

/**
 * 기본 기간 값
 */
export const DEFAULT_PERIOD: PeriodFilter = 'month';

export default PERIOD_OPTIONS;
