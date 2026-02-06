/**
 * 데이터 포맷터 유틸리티
 */

import { formatDistanceToNow, format, parseISO, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { AuditAction } from '../types';

/**
 * 상대 시간 포맷 (예: "5분 전")
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return formatDistanceToNow(date, { addSuffix: true, locale: ko });
  } catch {
    return dateString;
  }
}

/**
 * 날짜 포맷 (예: "2024-01-15")
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return format(date, 'yyyy-MM-dd');
  } catch {
    return dateString;
  }
}

/**
 * 날짜/시간 포맷 (예: "2024-01-15 14:30")
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return format(date, 'yyyy-MM-dd HH:mm');
  } catch {
    return dateString;
  }
}

/**
 * 감사 로그 액션 라벨
 */
export function getActionLabel(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    CREATE: '생성',
    UPDATE: '수정',
    DELETE: '삭제',
    RESTORE: '복구',
  };
  return labels[action] || action;
}

/**
 * 감사 로그 액션 색상 클래스
 */
export function getActionColorClass(action: AuditAction): string {
  const colors: Record<AuditAction, string> = {
    CREATE: 'bg-green-100 text-green-800',
    UPDATE: 'bg-blue-100 text-blue-800',
    DELETE: 'bg-red-100 text-red-800',
    RESTORE: 'bg-yellow-100 text-yellow-800',
  };
  return colors[action] || 'bg-gray-100 text-gray-800';
}

/**
 * 숫자 포맷 (천 단위 구분)
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

/**
 * 퍼센트 포맷
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * 파일 크기 포맷
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * 텍스트 자르기 (말줄임표)
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * 활성 상태 라벨
 */
export function getActiveStatusLabel(isActive: boolean): string {
  return isActive ? '활성' : '비활성';
}

/**
 * 활성 상태 색상 클래스
 */
export function getActiveStatusColorClass(isActive: boolean): string {
  return isActive
    ? 'bg-green-100 text-green-800'
    : 'bg-gray-100 text-gray-800';
}
