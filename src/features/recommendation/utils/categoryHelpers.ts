/**
 * 유틸리티 - 카테고리 헬퍼
 */

import { WelfareCategory } from '../types';
import { CATEGORY_COLORS } from '../constants';

/**
 * 카테고리 색상 클래스 반환
 */
export function getCategoryColor(category: WelfareCategory): string {
  return CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-800';
}

/**
 * 카테고리 배경 색상 반환 (차트용)
 */
export function getCategoryBgColor(category: WelfareCategory): string {
  const colorMap: Record<WelfareCategory, string> = {
    [WelfareCategory.LIVING]: '#FEE2E2',
    [WelfareCategory.HOUSING]: '#DBEAFE',
    [WelfareCategory.EDUCATION]: '#D1FAE5',
    [WelfareCategory.EMPLOYMENT]: '#FEF3C7',
    [WelfareCategory.MEDICAL]: '#FCE7F3',
    [WelfareCategory.CHILDCARE]: '#E0E7FF',
    [WelfareCategory.DISABILITY]: '#E5E7EB',
    [WelfareCategory.ELDERLY]: '#F3E8FF',
  };
  return colorMap[category] || '#F3F4F6';
}

/**
 * 카테고리별 아이콘 이모지 반환
 */
export function getCategoryIcon(category: WelfareCategory): string {
  const iconMap: Record<WelfareCategory, string> = {
    [WelfareCategory.LIVING]: '💰',
    [WelfareCategory.HOUSING]: '🏠',
    [WelfareCategory.EDUCATION]: '📚',
    [WelfareCategory.EMPLOYMENT]: '💼',
    [WelfareCategory.MEDICAL]: '🏥',
    [WelfareCategory.CHILDCARE]: '👶',
    [WelfareCategory.DISABILITY]: '♿',
    [WelfareCategory.ELDERLY]: '👴',
  };
  return iconMap[category] || '📋';
}

/**
 * 카테고리 배열을 정렬된 문자열로 변환
 */
export function formatCategories(categories: WelfareCategory[]): string {
  return categories.map(cat => WelfareCategory[cat]).join(', ');
}
