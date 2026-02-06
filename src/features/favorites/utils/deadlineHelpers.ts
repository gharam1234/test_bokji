/**
 * 마감일 관련 유틸리티 함수
 * 마감일 계산, 포맷팅, 상태 판별 등
 */

import { differenceInDays, format, parseISO, isValid, isBefore } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 마감일까지 남은 일수 계산
 * @param deadline ISO 날짜 문자열
 * @returns 남은 일수 (음수면 마감됨)
 */
export function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;

  const deadlineDate = parseISO(deadline);
  if (!isValid(deadlineDate)) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return differenceInDays(deadlineDate, today);
}

/**
 * 마감 임박 여부 확인 (7일 이내)
 * @param deadline ISO 날짜 문자열
 * @param days 기준 일수 (기본: 7)
 */
export function isDeadlineNear(
  deadline: string | null,
  days: number = 7,
): boolean {
  const daysUntil = getDaysUntilDeadline(deadline);
  if (daysUntil === null) return false;
  return daysUntil >= 0 && daysUntil <= days;
}

/**
 * 마감 여부 확인
 * @param deadline ISO 날짜 문자열
 */
export function isDeadlinePassed(deadline: string | null): boolean {
  if (!deadline) return false;

  const deadlineDate = parseISO(deadline);
  if (!isValid(deadlineDate)) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return isBefore(deadlineDate, today);
}

/**
 * D-Day 텍스트 생성
 * @param deadline ISO 날짜 문자열
 * @returns "D-7", "D-Day", "마감" 등의 텍스트
 */
export function getDeadlineText(deadline: string | null): string {
  const daysUntil = getDaysUntilDeadline(deadline);

  if (daysUntil === null) return '상시';
  if (daysUntil < 0) return '마감';
  if (daysUntil === 0) return 'D-Day';

  return `D-${daysUntil}`;
}

/**
 * 마감일 포맷팅 (긴 형식)
 * @param deadline ISO 날짜 문자열
 * @returns "2026년 2월 28일" 형식
 */
export function formatDeadlineLong(deadline: string | null): string {
  if (!deadline) return '상시 모집';

  const date = parseISO(deadline);
  if (!isValid(date)) return '상시 모집';

  return format(date, 'yyyy년 M월 d일', { locale: ko });
}

/**
 * 마감일 포맷팅 (짧은 형식)
 * @param deadline ISO 날짜 문자열
 * @returns "2/28" 형식
 */
export function formatDeadlineShort(deadline: string | null): string {
  if (!deadline) return '-';

  const date = parseISO(deadline);
  if (!isValid(date)) return '-';

  return format(date, 'M/d', { locale: ko });
}

/**
 * 마감일 상태에 따른 색상 클래스
 * @param deadline ISO 날짜 문자열
 */
export function getDeadlineColorClass(deadline: string | null): string {
  const daysUntil = getDaysUntilDeadline(deadline);

  if (daysUntil === null) return 'text-gray-500';
  if (daysUntil < 0) return 'text-gray-400';
  if (daysUntil <= 3) return 'text-red-600';
  if (daysUntil <= 7) return 'text-orange-500';

  return 'text-gray-600';
}

/**
 * 마감일 상태에 따른 배경 색상 클래스
 * @param deadline ISO 날짜 문자열
 */
export function getDeadlineBgClass(deadline: string | null): string {
  const daysUntil = getDaysUntilDeadline(deadline);

  if (daysUntil === null) return 'bg-gray-100';
  if (daysUntil < 0) return 'bg-gray-100';
  if (daysUntil <= 3) return 'bg-red-50';
  if (daysUntil <= 7) return 'bg-orange-50';

  return 'bg-gray-100';
}

/**
 * 저장일 포맷팅
 * @param bookmarkedAt ISO 날짜/시간 문자열
 * @returns "2월 1일 저장" 형식
 */
export function formatBookmarkedAt(bookmarkedAt: string): string {
  const date = parseISO(bookmarkedAt);
  if (!isValid(date)) return '';

  return format(date, 'M월 d일 저장', { locale: ko });
}

/**
 * 저장일 상대 시간 포맷팅
 * @param bookmarkedAt ISO 날짜/시간 문자열
 * @returns "3일 전", "1주 전" 등
 */
export function formatBookmarkedAtRelative(bookmarkedAt: string): string {
  const date = parseISO(bookmarkedAt);
  if (!isValid(date)) return '';

  const now = new Date();
  const diffInDays = differenceInDays(now, date);

  if (diffInDays === 0) return '오늘';
  if (diffInDays === 1) return '어제';
  if (diffInDays < 7) return `${diffInDays}일 전`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}주 전`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}개월 전`;

  return `${Math.floor(diffInDays / 365)}년 전`;
}
