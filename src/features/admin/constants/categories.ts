/**
 * 프로그램 카테고리 상수
 */

import type { ProgramCategory } from '../types';

/** 카테고리 정보 */
export interface CategoryInfo {
  value: ProgramCategory;
  label: string;
  description: string;
  icon: string;
}

/** 카테고리 목록 */
export const CATEGORIES: CategoryInfo[] = [
  {
    value: 'employment',
    label: '고용·일자리',
    description: '취업 지원, 직업 훈련, 창업 지원 등',
    icon: '💼',
  },
  {
    value: 'housing',
    label: '주거',
    description: '주택 구입, 전세 자금, 월세 지원 등',
    icon: '🏠',
  },
  {
    value: 'education',
    label: '교육',
    description: '학자금 지원, 교육비 지원, 장학금 등',
    icon: '📚',
  },
  {
    value: 'healthcare',
    label: '건강·의료',
    description: '의료비 지원, 건강검진, 심리상담 등',
    icon: '🏥',
  },
  {
    value: 'childcare',
    label: '보육·돌봄',
    description: '어린이집, 육아 지원, 돌봄 서비스 등',
    icon: '👶',
  },
  {
    value: 'welfare',
    label: '생활지원',
    description: '생계비 지원, 긴급 복지, 기초 생활 등',
    icon: '🤝',
  },
  {
    value: 'culture',
    label: '문화·여가',
    description: '문화 바우처, 여행 지원, 체육 활동 등',
    icon: '🎨',
  },
  {
    value: 'other',
    label: '기타',
    description: '기타 복지 프로그램',
    icon: '📋',
  },
];

/** 카테고리 맵 (빠른 조회용) */
export const CATEGORY_MAP = new Map<ProgramCategory, CategoryInfo>(
  CATEGORIES.map((cat) => [cat.value, cat])
);

/** 카테고리 라벨 가져오기 */
export function getCategoryLabel(category: ProgramCategory): string {
  return CATEGORY_MAP.get(category)?.label ?? category;
}

/** 카테고리 아이콘 가져오기 */
export function getCategoryIcon(category: ProgramCategory): string {
  return CATEGORY_MAP.get(category)?.icon ?? '📋';
}
