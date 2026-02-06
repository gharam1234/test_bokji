/**
 * SearchResultCard 스켈레톤 컴포넌트
 */

import React from 'react';

export function SearchResultCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-2">
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
      </div>

      {/* 제목 */}
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />

      {/* 요약 */}
      <div className="space-y-1.5 mb-3">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
      </div>

      {/* 메타 정보 */}
      <div className="flex gap-3 mb-3">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </div>

      {/* 푸터 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="h-5 w-24 bg-gray-200 rounded" />
        <div className="h-5 w-16 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default SearchResultCardSkeleton;
