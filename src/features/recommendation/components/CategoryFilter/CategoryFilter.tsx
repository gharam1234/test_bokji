/**
 * 컴포넌트 - 카테고리 필터
 */

import React from 'react';
import { WelfareCategory } from '../../types';
import { CATEGORIES } from '../../constants';

interface CategoryFilterProps {
  selectedCategory: WelfareCategory | null;
  onChange: (category: WelfareCategory | null) => void;
}

export function CategoryFilter({ selectedCategory, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`
          flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium
          transition-colors duration-200
          ${selectedCategory === null
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
      >
        <span>📋</span>
        <span>전체</span>
      </button>
      
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`
            flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium
            transition-colors duration-200
            ${selectedCategory === cat.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          <span>{cat.icon}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
