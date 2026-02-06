/**
 * 컴포넌트 - 매칭 점수 뱃지
 */

import React from 'react';
import { getMatchScoreColor, getMatchScoreLabel } from '../../utils';

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function MatchScoreBadge({ 
  score, 
  size = 'md',
  showLabel = true 
}: MatchScoreBadgeProps) {
  const colorClass = getMatchScoreColor(score);
  const label = getMatchScoreLabel(score);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  
  return (
    <div 
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${colorClass}
        ${sizeClasses[size]}
      `}
    >
      <span className="font-bold">{score}%</span>
      {showLabel && <span className="opacity-90">· {label}</span>}
    </div>
  );
}
