/**
 * FavoritesSearch 컴포넌트
 * 즐겨찾기 검색 입력 UI
 */

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

/**
 * FavoritesSearch Props
 */
export interface FavoritesSearchProps {
  /** 현재 검색어 */
  value: string;
  /** 검색어 변경 핸들러 */
  onChange: (value: string) => void;
  /** placeholder 텍스트 */
  placeholder?: string;
  /** 디바운스 딜레이 (ms) */
  debounceMs?: number;
}

/**
 * 검색 입력 컴포넌트
 *
 * @example
 * ```tsx
 * <FavoritesSearch
 *   value={search}
 *   onChange={(value) => setParams({ search: value })}
 *   placeholder="저장된 복지 검색..."
 * />
 * ```
 */
export const FavoritesSearch = memo<FavoritesSearchProps>(function FavoritesSearch({
  value,
  onChange,
  placeholder = '저장된 복지 검색...',
  debounceMs = 300,
}) {
  // 로컬 입력 상태 (디바운스용)
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 외부 값이 변경되면 로컬 값도 업데이트
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // 입력 변경 핸들러 (디바운스 적용)
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      // 기존 타이머 취소
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // 디바운스된 변경 콜백
      debounceRef.current = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
    },
    [onChange, debounceMs],
  );

  // 검색어 초기화
  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');

    // 기존 타이머 취소
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, [onChange]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* 검색 아이콘 */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

      {/* 입력 필드 */}
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="
          w-full pl-9 pr-9 py-2.5 text-sm
          border border-gray-200 rounded-lg
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-shadow
        "
        aria-label="검색"
      />

      {/* 초기화 버튼 */}
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="
            absolute right-2 top-1/2 -translate-y-1/2
            p-1 rounded-full hover:bg-gray-100 transition-colors
          "
          aria-label="검색어 지우기"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
});
