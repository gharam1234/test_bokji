/**
 * CategoryChip 컴포넌트
 * 카테고리 필터 칩
 */

import React, { memo } from 'react';
import {
  Briefcase,
  Home,
  GraduationCap,
  Heart,
  Baby,
  Sparkles,
  ShieldCheck,
  MoreHorizontal,
  LayoutGrid,
} from 'lucide-react';
import type { FavoriteCategory } from '../../types';
import { getCategoryColor, getCategoryBgColor } from '../../constants';

/**
 * CategoryChip Props
 */
export interface CategoryChipProps {
  /** 카테고리 ('all' | FavoriteCategory) */
  category: 'all' | FavoriteCategory;
  /** 라벨 */
  label: string;
  /** 개수 (선택적) */
  count?: number;
  /** 선택 여부 */
  isSelected?: boolean;
  /** 클릭 핸들러 */
  onClick?: () => void;
}

/**
 * 카테고리별 아이콘
 */
const CategoryIcons: Record<'all' | FavoriteCategory, React.FC<{ className?: string }>> = {
  all: LayoutGrid,
  employment: Briefcase,
  housing: Home,
  education: GraduationCap,
  healthcare: Heart,
  childcare: Baby,
  culture: Sparkles,
  safety: ShieldCheck,
  other: MoreHorizontal,
};

/**
 * 카테고리 칩 컴포넌트
 */
export const CategoryChip = memo<CategoryChipProps>(function CategoryChip({
  category,
  label,
  count,
  isSelected = false,
  onClick,
}) {
  const Icon = CategoryIcons[category] || MoreHorizontal;

  // 전체 카테고리인 경우
  if (category === 'all') {
    return (
      <button
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
          transition-colors whitespace-nowrap
          ${isSelected
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
        `}
        onClick={onClick}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
        {count !== undefined && (
          <span className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
            {count}
          </span>
        )}
      </button>
    );
  }

  // 개별 카테고리
  const color = getCategoryColor(category);
  const bgColor = getCategoryBgColor(category);

  return (
    <button
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all whitespace-nowrap border-2
        ${isSelected
          ? 'border-current'
          : 'border-transparent hover:border-gray-200'
        }
      `}
      style={{
        backgroundColor: isSelected ? color : bgColor,
        color: isSelected ? 'white' : color,
      }}
      onClick={onClick}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {count !== undefined && (
        <span
          className="text-xs"
          style={{ opacity: isSelected ? 0.8 : 0.7 }}
        >
          {count}
        </span>
      )}
    </button>
  );
});
