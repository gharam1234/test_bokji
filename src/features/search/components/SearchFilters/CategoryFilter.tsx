/**
 * CategoryFilter 컴포넌트
 * 카테고리 필터 드롭다운
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { WelfareCategory } from '../../types';
import { WELFARE_CATEGORIES, CATEGORY_LIST, getCategoryLabel } from '../../constants/categories';

interface CategoryFilterProps {
  value: WelfareCategory | 'all';
  onChange: (category: WelfareCategory | 'all') => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
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

  const handleSelect = (category: WelfareCategory | 'all') => {
    onChange(category);
    setIsOpen(false);
  };

  const selectedLabel = getCategoryLabel(value);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm
                   transition-colors ${
                     value !== 'all'
                       ? 'border-blue-500 bg-blue-50 text-blue-700'
                       : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                   }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="font-medium">{selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 
                     rounded-lg shadow-lg z-50 py-1"
          role="listbox"
        >
          <button
            onClick={() => handleSelect('all')}
            className={`flex items-center justify-between w-full px-3 py-2 text-sm
                       hover:bg-gray-50 ${value === 'all' ? 'text-blue-600' : 'text-gray-700'}`}
            role="option"
            aria-selected={value === 'all'}
          >
            전체
            {value === 'all' && <Check className="h-4 w-4" />}
          </button>

          <div className="border-t border-gray-100 my-1" />

          {CATEGORY_LIST.map((category) => (
            <button
              key={category}
              onClick={() => handleSelect(category)}
              className={`flex items-center justify-between w-full px-3 py-2 text-sm
                         hover:bg-gray-50 ${value === category ? 'text-blue-600' : 'text-gray-700'}`}
              role="option"
              aria-selected={value === category}
            >
              <span className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: WELFARE_CATEGORIES[category].color }}
                />
                {WELFARE_CATEGORIES[category].label}
              </span>
              {value === category && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryFilter;
