/**
 * 컴포넌트 - 추천 목록
 */

import React from 'react';
import { Recommendation, WelfareCategory, SortOption } from '../../types';
import { RecommendationCard } from '../RecommendationCard';
import { CategoryFilter } from '../CategoryFilter';
import { SortDropdown } from '../SortDropdown';
import { RecommendationListSkeleton } from '../Skeleton';
import { EmptyRecommendation } from '../EmptyRecommendation';

interface RecommendationListProps {
  recommendations: Recommendation[];
  isLoading: boolean;
  selectedCategory: WelfareCategory | null;
  sortOption: SortOption;
  onCategoryChange: (category: WelfareCategory | null) => void;
  onSortChange: (sort: SortOption) => void;
  onBookmarkToggle: (programId: string) => void;
  onCardClick: (programId: string) => void;
  onRefresh?: () => void;
  onEmptyAction?: () => void;
}

export function RecommendationList({
  recommendations,
  isLoading,
  selectedCategory,
  sortOption,
  onCategoryChange,
  onSortChange,
  onBookmarkToggle,
  onCardClick,
  onRefresh,
  onEmptyAction,
}: RecommendationListProps) {
  return (
    <div className="space-y-6">
      {/* 필터 & 정렬 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            맞춤 복지 추천
          </h2>
          
          <div className="flex items-center gap-2">
            <SortDropdown value={sortOption} onChange={onSortChange} />
            
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="
                  rounded-lg border border-gray-300 bg-white p-2
                  text-gray-600 transition-colors duration-200
                  hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50
                "
                aria-label="새로고침"
              >
                <svg 
                  className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        <CategoryFilter
          selectedCategory={selectedCategory}
          onChange={onCategoryChange}
        />
      </div>
      
      {/* 결과 카운트 */}
      {!isLoading && recommendations.length > 0 && (
        <div className="text-sm text-gray-500">
          총 <span className="font-medium text-gray-900">{recommendations.length}</span>개의 추천 복지 서비스
        </div>
      )}
      
      {/* 로딩 상태 */}
      {isLoading && <RecommendationListSkeleton count={4} />}
      
      {/* 빈 상태 */}
      {!isLoading && recommendations.length === 0 && (
        <EmptyRecommendation
          title={selectedCategory ? '해당 카테고리의 추천이 없습니다' : '추천 복지 서비스가 없습니다'}
          description={
            selectedCategory 
              ? '다른 카테고리를 선택하거나 전체 보기를 눌러주세요.' 
              : '프로필을 업데이트하시면 맞춤형 복지 서비스를 추천받으실 수 있습니다.'
          }
          actionLabel={selectedCategory ? '전체 보기' : '프로필 설정하기'}
          onAction={selectedCategory ? () => onCategoryChange(null) : onEmptyAction}
        />
      )}
      
      {/* 추천 목록 */}
      {!isLoading && recommendations.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {recommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onBookmarkToggle={onBookmarkToggle}
              onClick={onCardClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
