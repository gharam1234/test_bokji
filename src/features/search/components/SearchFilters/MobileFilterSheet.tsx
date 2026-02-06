/**
 * MobileFilterSheet 컴포넌트
 * 모바일 필터 바텀시트
 */

import React, { useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';
import type { SearchFilters, WelfareCategory, SearchSortOption } from '../../types';
import { WELFARE_CATEGORIES, CATEGORY_LIST } from '../../constants/categories';
import { SIDO_LIST } from '../../constants/regions';
import { SORT_OPTIONS, SORT_OPTION_LIST } from '../../constants/sortOptions';

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onCategoryChange: (category: WelfareCategory | 'all') => void;
  onRegionChange: (region: string) => void;
  onSortChange: (sortBy: SearchSortOption) => void;
  onReset: () => void;
  resultCount: number;
}

export function MobileFilterSheet({
  isOpen,
  onClose,
  filters,
  onCategoryChange,
  onRegionChange,
  onSortChange,
  onReset,
  resultCount,
}: MobileFilterSheetProps) {
  // 바텀시트 열릴 때 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 바텀시트 */}
      <div
        className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl z-50 md:hidden
                   max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="필터"
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">필터</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="h-4 w-4" />
              초기화
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 필터 내용 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* 카테고리 */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">카테고리</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onCategoryChange('all')}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors
                           ${
                             filters.category === 'all'
                               ? 'bg-blue-600 text-white border-blue-600'
                               : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                           }`}
              >
                전체
              </button>
              {CATEGORY_LIST.map((category) => (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors
                             ${
                               filters.category === category
                                 ? 'bg-blue-600 text-white border-blue-600'
                                 : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                             }`}
                >
                  {WELFARE_CATEGORIES[category].label}
                </button>
              ))}
            </div>
          </div>

          {/* 지역 */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">지역</h3>
            <select
              value={filters.region}
              onChange={(e) => onRegionChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전국</option>
              {SIDO_LIST.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          {/* 정렬 */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">정렬</h3>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTION_LIST.map((option) => (
                <button
                  key={option}
                  onClick={() => onSortChange(option)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors
                             ${
                               filters.sortBy === option
                                 ? 'bg-blue-600 text-white border-blue-600'
                                 : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                             }`}
                >
                  {SORT_OPTIONS[option].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t border-gray-200 safe-area-inset-bottom">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium
                       hover:bg-blue-700 transition-colors"
          >
            {resultCount.toLocaleString()}건의 결과 보기
          </button>
        </div>
      </div>
    </>
  );
}

export default MobileFilterSheet;
