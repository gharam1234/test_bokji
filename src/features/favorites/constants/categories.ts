/**
 * 카테고리 설정
 * 즐겨찾기 카테고리 상수 및 설정
 */

import type { FavoriteCategory } from '../types';

/**
 * 카테고리 설정 타입
 */
export interface CategoryConfig {
  /** 카테고리 라벨 */
  label: string;
  /** 아이콘 이름 (lucide-react) */
  icon: string;
  /** 테마 색상 */
  color: string;
  /** 배경 색상 (연한 버전) */
  bgColor: string;
}

/**
 * 카테고리별 설정
 */
export const CATEGORY_CONFIG: Record<FavoriteCategory, CategoryConfig> = {
  employment: {
    label: '취업·창업',
    icon: 'briefcase',
    color: '#3B82F6', // blue-500
    bgColor: '#EFF6FF', // blue-50
  },
  housing: {
    label: '주거·금융',
    icon: 'home',
    color: '#10B981', // emerald-500
    bgColor: '#ECFDF5', // emerald-50
  },
  education: {
    label: '교육',
    icon: 'graduation-cap',
    color: '#8B5CF6', // violet-500
    bgColor: '#F5F3FF', // violet-50
  },
  healthcare: {
    label: '건강·의료',
    icon: 'heart',
    color: '#EF4444', // red-500
    bgColor: '#FEF2F2', // red-50
  },
  childcare: {
    label: '임신·육아',
    icon: 'baby',
    color: '#F59E0B', // amber-500
    bgColor: '#FFFBEB', // amber-50
  },
  culture: {
    label: '문화·생활',
    icon: 'sparkles',
    color: '#EC4899', // pink-500
    bgColor: '#FDF2F8', // pink-50
  },
  safety: {
    label: '안전·환경',
    icon: 'shield-check',
    color: '#06B6D4', // cyan-500
    bgColor: '#ECFEFF', // cyan-50
  },
  other: {
    label: '기타',
    icon: 'more-horizontal',
    color: '#6B7280', // gray-500
    bgColor: '#F9FAFB', // gray-50
  },
};

/**
 * 전체 카테고리 목록
 */
export const ALL_CATEGORIES: FavoriteCategory[] = [
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
export function getCategoryLabel(category: FavoriteCategory): string {
  return CATEGORY_CONFIG[category]?.label || '기타';
}

/**
 * 카테고리 색상 조회
 */
export function getCategoryColor(category: FavoriteCategory): string {
  return CATEGORY_CONFIG[category]?.color || '#6B7280';
}

/**
 * 카테고리 배경 색상 조회
 */
export function getCategoryBgColor(category: FavoriteCategory): string {
  return CATEGORY_CONFIG[category]?.bgColor || '#F9FAFB';
}

/**
 * 카테고리 아이콘 조회
 */
export function getCategoryIcon(category: FavoriteCategory): string {
  return CATEGORY_CONFIG[category]?.icon || 'more-horizontal';
}
