/**
 * 컴포넌트 - 복지 상세 헤더
 */

import React from 'react';
import { WelfareProgram, WelfareCategory, CATEGORY_LABELS } from '../../types';
import { getCategoryColor } from '../../utils';

interface WelfareDetailHeaderProps {
  program: WelfareProgram;
  onBack?: () => void;
  onShare?: () => void;
}

export function WelfareDetailHeader({ 
  program, 
  onBack,
  onShare 
}: WelfareDetailHeaderProps) {
  const categories: WelfareCategory[] =
    program.categories && program.categories.length > 0
      ? program.categories
      : program.category
        ? [program.category]
        : [];
  const organizationName =
    program.organizationName ||
    program.organization ||
    program.managingOrganization;

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-6">
      {/* 네비게이션 */}
      <div className="mb-4 flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>뒤로</span>
          </button>
        )}
        
        {onShare && (
          <button
            onClick={onShare}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        )}
      </div>
      
      {/* 카테고리 */}
      {categories.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {categories.map((category) => {
            const label =
              categories.length === 1 && program.categoryLabel
                ? program.categoryLabel
                : CATEGORY_LABELS[category] || category;
            return (
              <span
                key={category}
                className={`rounded-full px-3 py-1 text-sm font-medium ${getCategoryColor(category)}`}
              >
                {label}
              </span>
            );
          })}
        </div>
      )}
      
      {/* 제목 */}
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        {program.name}
      </h1>
      
      {/* 기관명 */}
      {organizationName && (
        <p className="text-sm text-gray-500">
          {organizationName}
        </p>
      )}
    </div>
  );
}
