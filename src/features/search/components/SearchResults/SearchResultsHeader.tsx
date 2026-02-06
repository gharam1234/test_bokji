/**
 * SearchResultsHeader 컴포넌트
 * 검색 결과 헤더 (개수, 정렬)
 */

import React from 'react';
import { List, LayoutGrid } from 'lucide-react';

interface SearchResultsHeaderProps {
  totalCount: number;
  searchTime?: number;
  viewMode?: 'list' | 'grid';
  onViewModeChange?: (mode: 'list' | 'grid') => void;
}

export function SearchResultsHeader({
  totalCount,
  searchTime,
  viewMode = 'list',
  onViewModeChange,
}: SearchResultsHeaderProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-900">
          총 <strong className="font-semibold">{totalCount.toLocaleString()}</strong>건
        </span>
        {searchTime !== undefined && (
          <span className="text-xs text-gray-400">
            ({searchTime}ms)
          </span>
        )}
      </div>

      {onViewModeChange && (
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5">
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded ${
              viewMode === 'list'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label="목록 보기"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded ${
              viewMode === 'grid'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label="그리드 보기"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchResultsHeader;
