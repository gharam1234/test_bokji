/**
 * 컴포넌트 - 추천 목록 스켈레톤
 */

import React from 'react';

export function RecommendationCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4">
      {/* 카테고리 */}
      <div className="mb-3 flex gap-2">
        <div className="h-5 w-16 rounded-full bg-gray-200" />
        <div className="h-5 w-14 rounded-full bg-gray-200" />
      </div>
      
      {/* 제목 */}
      <div className="mb-2 h-6 w-3/4 rounded bg-gray-200" />
      
      {/* 요약 */}
      <div className="mb-3 space-y-2">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-2/3 rounded bg-gray-200" />
      </div>
      
      {/* 매칭 점수 */}
      <div className="mb-3 flex justify-between">
        <div className="h-6 w-24 rounded-full bg-gray-200" />
        <div className="h-5 w-16 rounded bg-gray-200" />
      </div>
      
      {/* 매칭 이유 */}
      <div className="border-t border-gray-100 pt-3 space-y-2">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
      </div>
    </div>
  );
}

interface RecommendationListSkeletonProps {
  count?: number;
}

export function RecommendationListSkeleton({ count = 4 }: RecommendationListSkeletonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <RecommendationCardSkeleton key={index} />
      ))}
    </div>
  );
}
