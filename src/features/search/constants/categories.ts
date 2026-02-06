/**
 * 카테고리 상수 정의
 */

import type { WelfareCategory } from '../types';

/**
 * 카테고리 정보
 */
export interface CategoryInfo {
  label: string;
  icon: string;
  color: string;
}

/**
 * 복지 카테고리 정보 맵
 */
export const WELFARE_CATEGORIES: Record<WelfareCategory, CategoryInfo> = {
  employment: { label: '취업·창업', icon: 'Briefcase', color: '#3B82F6' },
  housing: { label: '주거·금융', icon: 'Home', color: '#10B981' },
  education: { label: '교육', icon: 'GraduationCap', color: '#8B5CF6' },
  healthcare: { label: '건강·의료', icon: 'Heart', color: '#EF4444' },
  childcare: { label: '임신·육아', icon: 'Baby', color: '#F59E0B' },
  culture: { label: '문화·생활', icon: 'Sparkles', color: '#EC4899' },
  safety: { label: '안전·환경', icon: 'ShieldCheck', color: '#06B6D4' },
  other: { label: '기타', icon: 'MoreHorizontal', color: '#6B7280' },
};

/**
 * 카테고리 목록 (순서 유지)
 */
export const CATEGORY_LIST: WelfareCategory[] = [
  'employment',
  'housing',
  'education',
  'healthcare',
  'childcare',
  'culture',
  'safety',
  'other',
];

/**
 * 카테고리 라벨 조회
 */
export function getCategoryLabel(category: WelfareCategory | 'all'): string {
  if (category === 'all') return '전체';
  return WELFARE_CATEGORIES[category]?.label || '기타';
}

/**
 * 카테고리 색상 조회
 */
export function getCategoryColor(category: WelfareCategory): string {
  return WELFARE_CATEGORIES[category]?.color || '#6B7280';
}
