/**
 * DeadlineAlert 컴포넌트
 * 마감 임박 알림 배너
 */

import React, { memo } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';

/**
 * DeadlineAlert Props
 */
export interface DeadlineAlertProps {
  /** 마감 임박 개수 */
  count: number;
  /** 상세 보기 클릭 핸들러 */
  onViewDetails?: () => void;
}

/**
 * 마감 임박 알림 배너 컴포넌트
 *
 * @example
 * ```tsx
 * <DeadlineAlert
 *   count={5}
 *   onViewDetails={() => setParams({ deadlineWithin: 7 })}
 * />
 * ```
 */
export const DeadlineAlert = memo<DeadlineAlertProps>(function DeadlineAlert({
  count,
  onViewDetails,
}) {
  // 마감 임박 항목이 없으면 표시하지 않음
  if (count === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-orange-800">
            마감 임박 <span className="text-orange-600">{count}건</span>
          </p>
          <p className="text-xs text-orange-600">
            7일 이내 마감되는 복지가 있어요
          </p>
        </div>
      </div>

      {onViewDetails && (
        <button
          type="button"
          onClick={onViewDetails}
          className="
            flex items-center gap-0.5 text-sm font-medium text-orange-700
            hover:text-orange-800 transition-colors
          "
        >
          자세히 보기
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});
