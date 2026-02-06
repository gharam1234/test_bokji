/**
 * 컴포넌트 - 빈 상태
 */

import React from 'react';

interface EmptyRecommendationProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyRecommendation({ 
  title = '추천 복지 서비스가 없습니다',
  description = '프로필을 업데이트하시면 맞춤형 복지 서비스를 추천받으실 수 있습니다.',
  actionLabel = '프로필 설정하기',
  onAction 
}: EmptyRecommendationProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
      <div className="mb-4 text-5xl">📋</div>
      
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        {title}
      </h3>
      
      <p className="mb-6 max-w-sm text-sm text-gray-500">
        {description}
      </p>
      
      {onAction && (
        <button
          onClick={onAction}
          className="
            rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white
            transition-colors duration-200
            hover:bg-blue-700
          "
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
