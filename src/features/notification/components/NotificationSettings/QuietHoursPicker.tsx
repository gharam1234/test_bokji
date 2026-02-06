/**
 * QuietHoursPicker 컴포넌트
 * 방해금지 시간 설정
 */

import React from 'react';
import { clsx } from 'clsx';

/**
 * QuietHoursPicker Props
 */
export interface QuietHoursPickerProps {
  /** 시작 시간 (HH:mm) */
  startTime: string;
  /** 종료 시간 (HH:mm) */
  endTime: string;
  /** 시작 시간 변경 핸들러 */
  onStartTimeChange: (time: string) => void;
  /** 종료 시간 변경 핸들러 */
  onEndTimeChange: (time: string) => void;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * QuietHoursPicker 컴포넌트
 */
export function QuietHoursPicker({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  disabled = false,
}: QuietHoursPickerProps): React.ReactElement {
  return (
    <div className={clsx('flex items-center gap-4 mt-4', disabled && 'opacity-50')}>
      {/* 시작 시간 */}
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-700 mb-1">시작 시간</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => onStartTimeChange(e.target.value)}
          disabled={disabled}
          className={clsx(
            'w-full px-3 py-2',
            'border border-gray-300 rounded-md shadow-sm',
            'text-sm text-gray-900',
            'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
          )}
        />
      </div>

      {/* 화살표 */}
      <div className="flex items-center pt-5">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>

      {/* 종료 시간 */}
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-700 mb-1">종료 시간</label>
        <input
          type="time"
          value={endTime}
          onChange={(e) => onEndTimeChange(e.target.value)}
          disabled={disabled}
          className={clsx(
            'w-full px-3 py-2',
            'border border-gray-300 rounded-md shadow-sm',
            'text-sm text-gray-900',
            'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
          )}
        />
      </div>
    </div>
  );
}

export default QuietHoursPicker;
