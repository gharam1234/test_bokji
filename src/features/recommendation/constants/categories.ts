/**
 * 상수 - 카테고리
 */

import { WelfareCategory } from '../types';

/** 카테고리 목록 */
export const CATEGORIES = [
  { value: WelfareCategory.LIVING_SUPPORT, label: '생활지원', icon: '💰' },
  { value: WelfareCategory.HOUSING, label: '주거', icon: '🏠' },
  { value: WelfareCategory.EDUCATION, label: '교육', icon: '📚' },
  { value: WelfareCategory.MEDICAL, label: '의료', icon: '🏥' },
  { value: WelfareCategory.EMPLOYMENT, label: '고용', icon: '💼' },
  { value: WelfareCategory.CHILDCARE, label: '보육/돌봄', icon: '👶' },
  { value: WelfareCategory.OTHER, label: '기타', icon: '📋' },
] as const;

/** 카테고리 컬러 */
export const CATEGORY_COLORS: Record<WelfareCategory, string> = {
  [WelfareCategory.LIVING_SUPPORT]: 'bg-green-100 text-green-800',
  [WelfareCategory.HOUSING]: 'bg-blue-100 text-blue-800',
  [WelfareCategory.EDUCATION]: 'bg-purple-100 text-purple-800',
  [WelfareCategory.MEDICAL]: 'bg-red-100 text-red-800',
  [WelfareCategory.EMPLOYMENT]: 'bg-yellow-100 text-yellow-800',
  [WelfareCategory.CHILDCARE]: 'bg-pink-100 text-pink-800',
  [WelfareCategory.OTHER]: 'bg-gray-100 text-gray-800',
};
