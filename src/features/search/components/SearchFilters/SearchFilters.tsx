/**
 * SearchFilters 컴포넌트
 * 필터 컨테이너 (카테고리, 지역)
 */

import React from 'react';
import { Filter } from 'lucide-react';
import type { WelfareCategory, SearchFilters as SearchFiltersType } from '../../types';
import { CategoryFilter } from './CategoryFilter';
import { RegionFilter } from './RegionFilter';
import { countAppliedFilters } from '../../utils/searchHelpers';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onCategoryChange: (category: WelfareCategory | 'all') => void;
  onRegionChange: (region: string) => void;
  onOpenMobileFilter?: () => void;
  showMobileButton?: boolean;
}

export function SearchFilters({
  filters,
  onCategoryChange,
  onRegionChange,
  onOpenMobileFilter,
  showMobileButton = true,
}: SearchFiltersProps) {
  const appliedCount = countAppliedFilters(filters);

  return (
    <div className="flex items-center gap-3">
      {/* 데스크톱 필터 */}
      <div className="hidden md:flex items-center gap-3">
        <CategoryFilter
          value={filters.category}
          onChange={onCategoryChange}
        />
        <RegionFilter
          value={filters.region}
          onChange={onRegionChange}
        />
      </div>

      {/* 모바일 필터 버튼 */}
      {showMobileButton && (
        <button
          onClick={onOpenMobileFilter}
          className="md:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 
                     rounded-lg text-sm font-medium text-gray-700
                     hover:bg-gray-50 transition-colors"
        >
          <Filter className="h-4 w-4" />
          필터
          {appliedCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 
                           bg-blue-600 text-white text-xs rounded-full">
              {appliedCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}

export default SearchFilters;
