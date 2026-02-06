/**
 * FavoritesFilter 컴포넌트
 * 카테고리 필터 UI
 */

import React, { memo, useMemo } from 'react';
import type { FavoriteCategory, CategoryCount } from '../../types';
import { ALL_CATEGORIES, getCategoryLabel } from '../../constants';
import { CategoryChip } from './CategoryChip';

/**
 * FavoritesFilter Props
 */
export interface FavoritesFilterProps {
  /** 현재 선택된 카테고리 */
  selectedCategory: FavoriteCategory | 'all';
  /** 카테고리 변경 핸들러 */
  onCategoryChange: (category: FavoriteCategory | 'all') => void;
  /** 카테고리별 개수 데이터 */
  categoryCounts?: CategoryCount[];
  /** 총 개수 */
  totalCount?: number;
}

/**
 * 카테고리 필터 컴포넌트
 *
 * @example
 * ```tsx
 * <FavoritesFilter
 *   selectedCategory={selectedCategory}
 *   onCategoryChange={setSelectedCategory}
 *   categoryCounts={meta?.categories}
 *   totalCount={pagination?.totalCount}
 * />
 * ```
 */
export const FavoritesFilter = memo<FavoritesFilterProps>(function FavoritesFilter({
  selectedCategory,
  onCategoryChange,
  categoryCounts = [],
  totalCount = 0,
}) {
  // 카테고리별 개수 매핑
  const countMap = useMemo(() => {
    const map = new Map<FavoriteCategory, number>();
    categoryCounts.forEach(({ category, count }) => {
      map.set(category, count);
    });
    return map;
  }, [categoryCounts]);

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
      <div className="flex items-center gap-2">
        {/* 전체 */}
        <CategoryChip
          category="all"
          label="전체"
          count={totalCount}
          isSelected={selectedCategory === 'all'}
          onClick={() => onCategoryChange('all')}
        />

        {/* 개별 카테고리 */}
        {ALL_CATEGORIES.map((category) => {
          const count = countMap.get(category) || 0;
          // 개수가 0인 카테고리도 표시할지 여부 (현재는 표시)
          return (
            <CategoryChip
              key={category}
              category={category}
              label={getCategoryLabel(category)}
              count={count}
              isSelected={selectedCategory === category}
              onClick={() => onCategoryChange(category)}
            />
          );
        })}
      </div>
    </div>
  );
});
