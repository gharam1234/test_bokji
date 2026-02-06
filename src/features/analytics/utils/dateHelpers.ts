/**
 * 날짜 헬퍼 유틸리티
 * 기간 계산 및 날짜 포맷팅 함수
 */

import { PeriodFilter, PeriodType } from '../types';

/**
 * 기간 필터를 날짜 범위로 변환
 * @param period 기간 필터
 * @param customStart 커스텀 시작일
 * @param customEnd 커스텀 종료일
 */
export function getPeriodDateRange(
  period: PeriodFilter,
  customStart?: Date,
  customEnd?: Date,
): { start: Date; end: Date } {
  if (customStart && customEnd) {
    return { start: customStart, end: customEnd };
  }

  const now = new Date();
  const end = now;
  let start: Date;

  switch (period) {
    case 'week':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { start, end };
}

/**
 * 날짜를 YYYY-MM-DD 형식 문자열로 변환
 * @param date Date 객체
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 문자열을 Date 객체로 변환
 * @param dateString YYYY-MM-DD 형식 문자열
 */
export function parseStringToDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * 기간 레이블 생성
 * @param period 기간 필터
 * @param startDate 시작일
 * @param endDate 종료일
 */
export function getPeriodLabel(
  period: PeriodFilter,
  startDate?: Date,
  endDate?: Date,
): string {
  const now = new Date();

  switch (period) {
    case 'week':
      return '최근 7일';
    case 'month':
      const month = startDate ? startDate.getMonth() + 1 : now.getMonth() + 1;
      const year = startDate ? startDate.getFullYear() : now.getFullYear();
      return `${year}년 ${month}월`;
    case 'quarter':
      const q = startDate
        ? Math.floor(startDate.getMonth() / 3) + 1
        : Math.floor(now.getMonth() / 3) + 1;
      const qYear = startDate ? startDate.getFullYear() : now.getFullYear();
      return `${qYear}년 ${q}분기`;
    case 'year':
      const y = startDate ? startDate.getFullYear() : now.getFullYear();
      return `${y}년`;
    default:
      return '기간';
  }
}

/**
 * PeriodFilter를 PeriodType으로 변환
 * @param filter PeriodFilter
 */
export function filterToPeriodType(filter: PeriodFilter): PeriodType {
  const mapping: Record<PeriodFilter, PeriodType> = {
    week: PeriodType.WEEKLY,
    month: PeriodType.MONTHLY,
    quarter: PeriodType.MONTHLY,
    year: PeriodType.YEARLY,
  };
  return mapping[filter];
}

/**
 * 두 날짜 사이의 일수 계산
 * @param start 시작일
 * @param end 종료일
 */
export function getDaysBetween(start: Date, end: Date): number {
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 날짜 범위 내 모든 날짜 배열 생성
 * @param start 시작일
 * @param end 종료일
 */
export function getDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * 상대적 날짜 표시 (오늘, 어제, N일 전)
 * @param date 날짜
 */
export function getRelativeDateString(date: Date): string {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
  return `${Math.floor(diffDays / 365)}년 전`;
}
