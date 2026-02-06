/**
 * FavoritesSort 컴포넌트
 * 정렬 드롭다운 UI
 */

import React, { memo, useState, useRef, useCallback, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { FavoriteSortOption, SortOrder } from '../../types';
import { SORT_OPTION_LIST, getSortOptionLabel, getDefaultSortOrder } from '../../constants';

/**
 * FavoritesSort Props
 */
export interface FavoritesSortProps {
  /** 현재 정렬 옵션 */
  sortBy: FavoriteSortOption;
  /** 현재 정렬 순서 */
  sortOrder: SortOrder;
  /** 정렬 변경 핸들러 */
  onSortChange: (sortBy: FavoriteSortOption, sortOrder: SortOrder) => void;
}

/**
 * 정렬 드롭다운 컴포넌트
 *
 * @example
 * ```tsx
 * <FavoritesSort
 *   sortBy={sortBy}
 *   sortOrder={sortOrder}
 *   onSortChange={(newSortBy, newSortOrder) => {
 *     setParams({ sortBy: newSortBy, sortOrder: newSortOrder });
 *   }}
 * />
 * ```
 */
export const FavoritesSort = memo<FavoritesSortProps>(function FavoritesSort({
  sortBy,
  sortOrder,
  onSortChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 정렬 옵션 선택
  const handleSelectOption = useCallback(
    (option: FavoriteSortOption) => {
      const newOrder = getDefaultSortOrder(option);
      onSortChange(option, newOrder);
      setIsOpen(false);
    },
    [onSortChange],
  );

  // 토글 드롭다운
  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const currentLabel = getSortOptionLabel(sortBy);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 트리거 버튼 */}
      <button
        type="button"
        className={`
          flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
          border border-gray-200 rounded-lg bg-white
          hover:border-gray-300 hover:bg-gray-50 transition-colors
          ${isOpen ? 'border-gray-400 bg-gray-50' : ''}
        `}
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-gray-700">{currentLabel}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div
          className="
            absolute right-0 top-full mt-1 z-20
            min-w-[140px] py-1 bg-white rounded-lg shadow-lg border border-gray-200
          "
          role="listbox"
        >
          {SORT_OPTION_LIST.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`
                w-full flex items-center justify-between px-3 py-2 text-sm
                hover:bg-gray-50 transition-colors
                ${sortBy === value ? 'text-blue-600 font-medium' : 'text-gray-700'}
              `}
              onClick={() => handleSelectOption(value)}
              role="option"
              aria-selected={sortBy === value}
            >
              <span>{label}</span>
              {sortBy === value && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
