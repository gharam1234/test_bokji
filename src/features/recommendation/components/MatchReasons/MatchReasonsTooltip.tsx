/**
 * 컴포넌트 - 매칭 이유 툴팁
 */

import React, { useState } from 'react';
import { MatchReason, MatchReasonType } from '../../types';

interface MatchReasonsTooltipProps {
  reasons: MatchReason[];
  children: React.ReactNode;
}

const REASON_ICONS: Record<MatchReasonType, string> = {
  [MatchReasonType.AGE]: '🎂',
  [MatchReasonType.INCOME]: '💵',
  [MatchReasonType.REGION]: '📍',
  [MatchReasonType.HOUSEHOLD]: '👨‍👩‍👧‍👦',
  [MatchReasonType.SPECIAL_CONDITION]: '⭐',
};

export function MatchReasonsTooltip({ reasons, children }: MatchReasonsTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        {children}
      </div>
      
      {isOpen && reasons.length > 0 && (
        <div className="absolute z-50 mt-2 w-64 rounded-lg bg-white p-3 shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="mb-2 text-xs font-medium text-gray-500">
            추천 이유
          </div>
          <div className="space-y-2">
            {reasons.map((reason, index) => (
              <div 
                key={index}
                className="flex items-start gap-2 text-sm"
              >
                <span className="mt-0.5">
                  {REASON_ICONS[reason.type] || '✓'}
                </span>
                <div>
                  <div className="font-medium text-gray-800">
                    {reason.description}
                  </div>
                  {reason.detail && (
                    <div className="text-xs text-gray-500">
                      {reason.detail}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
