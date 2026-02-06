/**
 * 페이지 - 복지 추천 목록
 */

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecommendations } from '../hooks';
import { RecommendationList } from '../components';
import { WelfareCategory, SortOption } from '../types';

export function RecommendationPage() {
  const navigate = useNavigate();
  
  const {
    recommendations,
    isLoading,
    error,
    category,
    sortOption,
    setCategory,
    setSortOption,
    toggleBookmark,
    refresh,
  } = useRecommendations();
  
  const handleCategoryChange = useCallback((newCategory: WelfareCategory | null) => {
    setCategory(newCategory);
  }, [setCategory]);
  
  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortOption(newSort);
  }, [setSortOption]);
  
  const handleCardClick = useCallback((programId: string) => {
    navigate(`/welfare/${programId}`);
  }, [navigate]);
  
  const handleBookmarkToggle = useCallback((programId: string) => {
    toggleBookmark(programId);
  }, [toggleBookmark]);
  
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);
  
  const handleEmptyAction = useCallback(() => {
    navigate('/profile');
  }, [navigate]);
  
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">😢</div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            오류가 발생했습니다
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            {error.message || '추천 목록을 불러오는 데 실패했습니다.'}
          </p>
          <button
            onClick={handleRefresh}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900">
          나의 맞춤 복지
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          내 상황에 맞는 복지 서비스를 확인하세요
        </p>
      </header>
      
      {/* 컨텐츠 */}
      <main className="px-4 py-6">
        <RecommendationList
          recommendations={recommendations}
          isLoading={isLoading}
          selectedCategory={category}
          sortOption={sortOption}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          onBookmarkToggle={handleBookmarkToggle}
          onCardClick={handleCardClick}
          onRefresh={handleRefresh}
          onEmptyAction={handleEmptyAction}
        />
      </main>
    </div>
  );
}
