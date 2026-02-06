/**
 * SelectionCheckbox 컴포넌트
 * 전체 선택 체크박스
 */

import React, { memo, useCallback } from 'react';

/**
 * SelectionCheckbox Props
 */
export interface SelectionCheckboxProps {
  /** 전체 선택 여부 */
  isAllSelected: boolean;
  /** 부분 선택 여부 (일부만 선택됨) */
  isPartialSelected: boolean;
  /** 변경 핸들러 */
  onChange: (checked: boolean) => void;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 전체 선택 체크박스 컴포넌트
 */
export const SelectionCheckbox = memo<SelectionCheckboxProps>(
  function SelectionCheckbox({
    isAllSelected,
    isPartialSelected,
    onChange,
    disabled = false,
  }) {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked);
      },
      [onChange],
    );

    return (
      <label className="flex items-center cursor-pointer select-none">
        <div className="relative">
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={(el) => {
              if (el) {
                el.indeterminate = isPartialSelected && !isAllSelected;
              }
            }}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
          />
          <div
            className={`
              w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${
                isAllSelected || isPartialSelected
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-white border-gray-300 hover:border-blue-400'
              }
            `}
          >
            {isAllSelected && (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {isPartialSelected && !isAllSelected && (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M20 12H4"
                />
              </svg>
            )}
          </div>
        </div>
        <span className="ml-2 text-sm font-medium text-gray-700">
          전체 선택
        </span>
      </label>
    );
  },
);
