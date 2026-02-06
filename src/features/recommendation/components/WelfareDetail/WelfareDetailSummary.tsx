/**
 * 컴포넌트 - 복지 상세 요약
 */

import React from 'react';
import { WelfareProgram } from '../../types';
import { formatDeadline, isDeadlineSoon } from '../../utils';

interface WelfareDetailSummaryProps {
  program: WelfareProgram;
}

export function WelfareDetailSummary({ program }: WelfareDetailSummaryProps) {
  const rawDeadline =
    program.applicationDeadline ||
    program.deadline ||
    program.applicationEndDate ||
    null;
  const deadline = program.isAlwaysOpen ? null : rawDeadline;
  const isSoon = isDeadlineSoon(deadline);
  
  return (
    <div className="bg-white px-4 py-6">
      {/* 요약 */}
      <div className="mb-6">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">요약</h2>
        <p className="text-gray-700 leading-relaxed">
          {program.summary}
        </p>
      </div>
      
      {/* 주요 정보 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 지원 금액 */}
        {program.benefitAmount && (
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="text-sm text-blue-600">지원 금액</div>
            <div className="mt-1 text-lg font-bold text-blue-900">
              {program.benefitAmount}
            </div>
          </div>
        )}
        
        {/* 신청 기간 */}
        <div className={`rounded-lg p-4 ${isSoon ? 'bg-red-50' : 'bg-gray-50'}`}>
          <div className={`text-sm ${isSoon ? 'text-red-600' : 'text-gray-600'}`}>
            신청 마감
          </div>
          <div className={`mt-1 text-lg font-bold ${isSoon ? 'text-red-900' : 'text-gray-900'}`}>
            {formatDeadline(deadline)}
          </div>
        </div>
      </div>
    </div>
  );
}
