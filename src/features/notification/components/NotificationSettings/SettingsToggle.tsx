/**
 * SettingsToggle 컴포넌트
 * 알림 설정 토글 스위치
 */

import React from 'react';
import { clsx } from 'clsx';

/**
 * SettingsToggle Props
 */
export interface SettingsToggleProps {
  /** 레이블 */
  label: string;
  /** 설명 */
  description?: string;
  /** 체크 상태 */
  checked: boolean;
  /** 변경 핸들러 */
  onChange: (checked: boolean) => void;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * SettingsToggle 컴포넌트
 */
export function SettingsToggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: SettingsToggleProps): React.ReactElement {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div
      className={clsx(
        'flex items-center justify-between py-3',
        'border-b border-gray-100 last:border-b-0',
        disabled && 'opacity-50',
      )}
    >
      <div className="flex-1 mr-4">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        {description && (
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        )}
      </div>

      {/* 토글 스위치 */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleToggle}
        disabled={disabled}
        className={clsx(
          'relative inline-flex h-6 w-11 flex-shrink-0',
          'cursor-pointer rounded-full border-2 border-transparent',
          'transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          checked ? 'bg-blue-600' : 'bg-gray-200',
          disabled && 'cursor-not-allowed',
        )}
      >
        <span
          aria-hidden="true"
          className={clsx(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow',
            'transform ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  );
}

export default SettingsToggle;
