/**
 * 차트 헬퍼 유틸리티
 * 차트 데이터 변환 및 포맷팅 함수
 */

import { CategoryCount, TrendDataPoint, FunnelStep, ProgramCount } from '../types';

/**
 * 퍼센트 값 포맷팅
 * @param value 값
 * @param decimals 소수점 자릿수
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * 숫자 값 포맷팅 (천 단위 콤마)
 * @param value 값
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('ko-KR');
}

/**
 * 차트 데이터에서 최대값 찾기
 * @param data 데이터 배열
 * @param key 값 키
 */
export function findMaxValue<T>(data: T[], key: keyof T): number {
  if (data.length === 0) return 0;
  return Math.max(...data.map((item) => Number(item[key]) || 0));
}

/**
 * 차트 데이터에서 합계 계산
 * @param data 데이터 배열
 * @param key 값 키
 */
export function calculateSum<T>(data: T[], key: keyof T): number {
  return data.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
}

/**
 * 카테고리 데이터를 퍼센트 포함하여 계산
 * @param data 카테고리 카운트 배열
 */
export function calculateCategoryPercentages(
  data: Omit<CategoryCount, 'percentage'>[],
): CategoryCount[] {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return data.map((item) => ({
    ...item,
    percentage: total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0,
  }));
}

/**
 * 트렌드 데이터에서 피크 찾기
 * @param data 트렌드 데이터
 */
export function findPeakTrend(
  data: TrendDataPoint[],
): { date: string; total: number } | null {
  if (data.length === 0) return null;

  let peak = { date: '', total: 0 };

  for (const point of data) {
    const total = point.searches + point.views + point.bookmarks;
    if (total > peak.total) {
      peak = { date: point.date, total };
    }
  }

  return peak;
}

/**
 * 트렌드 데이터 평균 계산
 * @param data 트렌드 데이터
 */
export function calculateTrendAverage(data: TrendDataPoint[]): {
  searches: number;
  views: number;
  bookmarks: number;
} {
  if (data.length === 0) {
    return { searches: 0, views: 0, bookmarks: 0 };
  }

  const totals = data.reduce(
    (acc, point) => ({
      searches: acc.searches + point.searches,
      views: acc.views + point.views,
      bookmarks: acc.bookmarks + point.bookmarks,
    }),
    { searches: 0, views: 0, bookmarks: 0 },
  );

  return {
    searches: Math.round(totals.searches / data.length),
    views: Math.round(totals.views / data.length),
    bookmarks: Math.round(totals.bookmarks / data.length),
  };
}

/**
 * 퍼널 전환율 계산
 * @param steps 퍼널 단계 배열
 * @param fromIndex 시작 인덱스
 * @param toIndex 종료 인덱스
 */
export function calculateFunnelConversion(
  steps: FunnelStep[],
  fromIndex: number,
  toIndex: number,
): number {
  if (fromIndex < 0 || toIndex >= steps.length || fromIndex >= toIndex) {
    return 0;
  }

  const fromValue = steps[fromIndex].count;
  const toValue = steps[toIndex].count;

  if (fromValue === 0) return 0;
  return Math.round((toValue / fromValue) * 1000) / 10;
}

/**
 * 프로그램 데이터 정렬
 * @param data 프로그램 배열
 * @param order 정렬 순서
 */
export function sortPrograms(
  data: ProgramCount[],
  order: 'asc' | 'desc' = 'desc',
): ProgramCount[] {
  return [...data].sort((a, b) =>
    order === 'desc'
      ? b.viewCount - a.viewCount
      : a.viewCount - b.viewCount,
  );
}
