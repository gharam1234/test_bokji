/**
 * PeriodFilter 컴포넌트
 * 기간 선택 필터
 */

import React from 'react';
import { PeriodFilter as PeriodFilterType } from '../../types';
import { PERIOD_OPTIONS, getPeriodOption } from '../../constants';

export interface PeriodFilterProps {
  /** 현재 선택된 기간 */
  value: PeriodFilterType;
  /** 기간 변경 핸들러 */
  onChange: (period: PeriodFilterType) => void;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 스타일 변형 */
  variant?: 'button' | 'select';
}

/**
 * 기간 선택 필터 컴포넌트
 */
export const PeriodFilter: React.FC<PeriodFilterProps> = ({
  value,
  onChange,
  disabled = false,
  variant = 'button',
}) => {
  if (variant === 'select') {
    return (
      <SelectVariant value={value} onChange={onChange} disabled={disabled} />
    );
  }

  return (
    <ButtonVariant value={value} onChange={onChange} disabled={disabled} />
  );
};

/**
 * 버튼 스타일 변형
 */
const ButtonVariant: React.FC<PeriodFilterProps> = ({
  value,
  onChange,
  disabled,
}) => (
  <div className="inline-flex rounded-lg bg-gray-100 p-1">
    {PERIOD_OPTIONS.map((option) => (
      <button
        key={option.value}
        type="button"
        className={`
          px-3 py-1.5 text-sm font-medium rounded-md transition-all
          ${
            value === option.value
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={() => !disabled && onChange(option.value)}
        disabled={disabled}
        title={option.description}
      >
        {option.shortLabel}
      </button>
    ))}
  </div>
);

/**
 * 셀렉트 스타일 변형
 */
const SelectVariant: React.FC<PeriodFilterProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const selectedOption = getPeriodOption(value);

  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as PeriodFilterType)}
        disabled={disabled}
        className={`
          appearance-none bg-white border border-gray-300 rounded-lg
          px-4 py-2 pr-8 text-sm font-medium text-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
        `}
      >
        {PERIOD_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {/* 화살표 아이콘 */}
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};

export default PeriodFilter;
