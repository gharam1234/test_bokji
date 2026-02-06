/**
 * SearchSort 컴포넌트
 * 정렬 드롭다운
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, ArrowUpDown } from 'lucide-react';
import type { SearchSortOption } from '../../types';
import { SORT_OPTIONS, SORT_OPTION_LIST, getSortOptionLabel } from '../../constants/sortOptions';

interface SearchSortProps {
  value: SearchSortOption;
  onChange: (sortBy: SearchSortOption) => void;
}

export function SearchSort({ value, onChange }: SearchSortProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (sortBy: SearchSortOption) => {
    onChange(sortBy);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg 
                   text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <ArrowUpDown className="h-4 w-4" />
        <span>{getSortOptionLabel(value)}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 
                     rounded-lg shadow-lg z-50 py-1"
          role="listbox"
        >
          {SORT_OPTION_LIST.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`flex items-center justify-between w-full px-3 py-2 text-sm
                         hover:bg-gray-50 ${value === option ? 'text-blue-600' : 'text-gray-700'}`}
              role="option"
              aria-selected={value === option}
            >
              {SORT_OPTIONS[option].label}
              {value === option && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchSort;
