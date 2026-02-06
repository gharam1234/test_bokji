/**
 * 컴포넌트 - 매칭 이유 목록
 */

import React from 'react';
import { MatchReason, MatchReasonType } from '../../types';

interface MatchReasonsListProps {
  reasons: MatchReason[];
  maxItems?: number;
}

const REASON_ICONS: Record<MatchReasonType, string> = {
  [MatchReasonType.AGE]: '🎂',
  [MatchReasonType.INCOME]: '💵',
  [MatchReasonType.REGION]: '📍',
  [MatchReasonType.HOUSEHOLD]: '👨‍👩‍👧‍👦',
  [MatchReasonType.SPECIAL_CONDITION]: '⭐',
};

export function MatchReasonsList({ reasons, maxItems = 3 }: MatchReasonsListProps) {
  const displayReasons = reasons.slice(0, maxItems);
  const remainingCount = reasons.length - maxItems;
  
  return (
    <div className="space-y-1">
      {displayReasons.map((reason, index) => (
        <div 
          key={index}
          className="flex items-center gap-2 text-sm text-gray-600"
        >
          <span>{REASON_ICONS[reason.type] || '✓'}</span>
          <span>{reason.description}</span>
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="text-xs text-gray-400">
          +{remainingCount}개 조건 더 보기
        </div>
      )}
    </div>
  );
}
