/**
 * RegionFilter 컴포넌트
 * 지역 필터 드롭다운
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, MapPin } from 'lucide-react';
import { SIDO_LIST, getRegionName } from '../../constants/regions';

interface RegionFilterProps {
  value: string;
  onChange: (region: string) => void;
}

export function RegionFilter({ value, onChange }: RegionFilterProps) {
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

  const handleSelect = (region: string) => {
    onChange(region);
    setIsOpen(false);
  };

  const selectedLabel = value === 'all' ? '전국' : getRegionName(value);

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
        <MapPin className="h-4 w-4" />
        <span className="font-medium">{selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 
                     rounded-lg shadow-lg z-50 py-1 max-h-80 overflow-y-auto"
          role="listbox"
        >
          <button
            onClick={() => handleSelect('all')}
            className={`flex items-center justify-between w-full px-3 py-2 text-sm
                       hover:bg-gray-50 ${value === 'all' ? 'text-blue-600' : 'text-gray-700'}`}
            role="option"
            aria-selected={value === 'all'}
          >
            전국
            {value === 'all' && <Check className="h-4 w-4" />}
          </button>

          <div className="border-t border-gray-100 my-1" />

          {SIDO_LIST.map((region) => (
            <button
              key={region.code}
              onClick={() => handleSelect(region.code)}
              className={`flex items-center justify-between w-full px-3 py-2 text-sm
                         hover:bg-gray-50 ${value === region.code ? 'text-blue-600' : 'text-gray-700'}`}
              role="option"
              aria-selected={value === region.code}
            >
              {region.name}
              {value === region.code && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default RegionFilter;
