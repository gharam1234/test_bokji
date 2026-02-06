/**
 * SearchBar 컴포넌트
 * 검색어 입력 바
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = '복지 프로그램을 검색하세요...',
  autoFocus = false,
  className = '',
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // 외부 value 변경 시 동기화
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 자동 포커스
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // 입력 변경 핸들러
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      onChange(newValue);
    },
    [onChange],
  );

  // 폼 제출 핸들러
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch(inputValue);
    },
    [inputValue, onSearch],
  );

  // 초기화 핸들러
  const handleClear = useCallback(() => {
    setInputValue('');
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  // 키보드 핸들러
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        handleClear();
      }
    },
    [handleClear],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center ${className}`}
    >
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     text-gray-900 placeholder-gray-500"
          aria-label="검색어 입력"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 
                       text-gray-400 hover:text-gray-600 rounded-full
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="검색어 지우기"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="ml-2 px-4 py-3 bg-blue-600 text-white rounded-lg
                   hover:bg-blue-700 focus:outline-none focus:ring-2 
                   focus:ring-blue-500 focus:ring-offset-2
                   transition-colors font-medium"
        aria-label="검색"
      >
        검색
      </button>
    </form>
  );
}

export default SearchBar;
