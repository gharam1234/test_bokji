/**
 * 컴포넌트 - 관련 복지 프로그램
 */

import React from 'react';
import { WelfareCategory, CATEGORY_LABELS } from '../../types';
import { MatchScoreBadge } from '../MatchScoreBadge';
import { getCategoryColor } from '../../utils';

/** 관련 프로그램 데이터 */
export interface RelatedProgram {
  id: string;
  name: string;
  category: WelfareCategory;
  matchScore: number;
}

interface RelatedProgramsProps {
  programs: RelatedProgram[];
  onProgramClick?: (programId: string) => void;
  maxItems?: number;
}

export function RelatedPrograms({ 
  programs, 
  onProgramClick,
  maxItems = 5 
}: RelatedProgramsProps) {
  if (!programs || programs.length === 0) {
    return null;
  }

  const displayPrograms = programs.slice(0, maxItems);

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        관련 복지 서비스
      </h2>
      
      <div className="space-y-3">
        {displayPrograms.map((program) => (
          <div
            key={program.id}
            onClick={() => onProgramClick?.(program.id)}
            className="
              flex cursor-pointer items-center justify-between rounded-lg border border-gray-200
              bg-white p-3 transition-all duration-200
              hover:border-blue-300 hover:shadow-sm
            "
          >
            <div className="flex-1 min-w-0">
              {/* 카테고리 */}
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium mb-1 ${getCategoryColor(program.category)}`}
              >
                {CATEGORY_LABELS[program.category]}
              </span>
              
              {/* 프로그램명 */}
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {program.name}
              </h3>
            </div>
            
            {/* 매칭 점수 */}
            <div className="ml-3 flex-shrink-0">
              <MatchScoreBadge score={program.matchScore} size="sm" showLabel={false} />
            </div>
          </div>
        ))}
      </div>
      
      {programs.length > maxItems && (
        <p className="mt-3 text-center text-sm text-gray-500">
          +{programs.length - maxItems}개 더 있음
        </p>
      )}
    </div>
  );
}
