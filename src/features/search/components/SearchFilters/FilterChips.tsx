/**
 * FilterChips 컴포넌트
 * 적용된 필터 칩 표시
 */

import React from 'react';
import { X } from 'lucide-react';
import type { SearchFilters, WelfareCategory } from '../../types';
import { getCategoryLabel } from '../../constants/categories';
import { getRegionName } from '../../constants/regions';

interface FilterChipsProps {
  filters: SearchFilters;
  onRemoveCategory: () => void;
  onRemoveRegion: () => void;
  onResetAll: () => void;
}

export function FilterChips({
  filters,
  onRemoveCategory,
  onRemoveRegion,
  onResetAll,
}: FilterChipsProps) {
  const hasFilters = filters.category !== 'all' || filters.region !== 'all';

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-500">적용된 필터:</span>

      {filters.category !== 'all' && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 
                        text-blue-800 text-sm rounded-full">
          {getCategoryLabel(filters.category)}
          <button
            onClick={onRemoveCategory}
            className="hover:bg-blue-200 rounded-full p-0.5"
            aria-label="카테고리 필터 제거"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}

      {filters.region !== 'all' && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 
                        text-green-800 text-sm rounded-full">
          {getRegionName(filters.region)}
          <button
            onClick={onRemoveRegion}
            className="hover:bg-green-200 rounded-full p-0.5"
            aria-label="지역 필터 제거"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}

      <button
        onClick={onResetAll}
        className="text-sm text-gray-500 hover:text-gray-700 underline"
      >
        전체 해제
      </button>
    </div>
  );
}

export default FilterChips;
