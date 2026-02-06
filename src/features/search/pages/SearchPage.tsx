/**
 * SearchPage 컴포넌트
 * 복지 검색 메인 페이지
 */

import React, { useState, useCallback } from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useSearch } from '../hooks/useSearch';
import { useSearchFilters } from '../hooks/useSearchFilters';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useSearchUrl } from '../hooks/useSearchUrl';

import { SearchBar } from '../components/SearchBar';
import { SearchFilters, FilterChips, MobileFilterSheet } from '../components/SearchFilters';
import { SearchResults, SearchResultsHeader } from '../components/SearchResults';
import { SearchSort } from '../components/SearchSort';
import { SearchPagination } from '../components/SearchPagination';
import { RecentSearches } from '../components/RecentSearches';

import type { WelfareProgram, SearchFilters as SearchFiltersType } from '../types';
import { paramsToFilters } from '../utils/urlHelpers';

export function SearchPage() {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  // Hooks
  const {
    results,
    pagination,
    meta,
    isLoading,
    isFetching,
    params,
    setKeyword,
    setCategory,
    setRegion,
    setSortBy,
    resetParams,
    goToPage,
  } = useSearch({ syncWithUrl: true });

  const { getCategoryLabel, getRegionName } = useSearchFilters();
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();
  const { copyShareUrl } = useSearchUrl();

  // 필터 상태 변환
  const filters: SearchFiltersType = paramsToFilters(params);

  // 뒤로 가기
  const handleBack = () => {
    navigate(-1);
  };

  // 검색 실행
  const handleSearch = useCallback(
    (keyword: string) => {
      setKeyword(keyword);
      if (keyword.trim()) {
        addToHistory(keyword);
      }
      setShowRecentSearches(false);
    },
    [setKeyword, addToHistory],
  );

  // 입력 변경
  const handleInputChange = useCallback(
    (value: string) => {
      setShowRecentSearches(value.length === 0 && history.length > 0);
    },
    [history.length],
  );

  // 최근 검색어 선택
  const handleSelectRecentSearch = useCallback(
    (keyword: string) => {
      handleSearch(keyword);
    },
    [handleSearch],
  );

  // 필터 초기화
  const handleResetFilters = useCallback(() => {
    resetParams();
  }, [resetParams]);

  // 필터 초기화 (개별)
  const handleRemoveCategory = useCallback(() => {
    setCategory('all');
  }, [setCategory]);

  const handleRemoveRegion = useCallback(() => {
    setRegion('all');
  }, [setRegion]);

  // 공유
  const handleShare = async () => {
    const success = await copyShareUrl();
    if (success) {
      // TODO: Toast 알림 표시
      alert('검색 URL이 복사되었습니다.');
    }
  };

  // 카드 클릭
  const handleCardClick = useCallback(
    (program: WelfareProgram) => {
      navigate(`/welfare/${program.id}`);
    },
    [navigate],
  );

  // 북마크 토글
  const handleBookmarkToggle = useCallback((programId: string) => {
    // TODO: 북마크 API 호출
    console.log('Toggle bookmark:', programId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4">
          {/* 상단 바 */}
          <div className="flex items-center justify-between h-14">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
              aria-label="뒤로 가기"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">복지 검색</h1>
            <button
              onClick={handleShare}
              className="p-2 -mr-2 text-gray-600 hover:text-gray-900"
              aria-label="공유"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {/* 검색바 */}
          <div className="pb-3">
            <SearchBar
              value={params.keyword || ''}
              onChange={handleInputChange}
              onSearch={handleSearch}
              autoFocus
            />
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-3xl mx-auto px-4 py-4">
        {/* 최근 검색어 (검색어 비어있고 결과 없을 때) */}
        {showRecentSearches && !params.keyword && (
          <div className="mb-4">
            <RecentSearches
              history={history}
              onSelect={handleSelectRecentSearch}
              onRemove={removeFromHistory}
              onClearAll={clearHistory}
            />
          </div>
        )}

        {/* 필터 & 정렬 바 */}
        <div className="flex items-center justify-between mb-4">
          <SearchFilters
            filters={filters}
            onCategoryChange={setCategory}
            onRegionChange={setRegion}
            onOpenMobileFilter={() => setIsFilterOpen(true)}
          />
          <div className="hidden md:block">
            <SearchSort value={filters.sortBy} onChange={setSortBy} />
          </div>
        </div>

        {/* 적용된 필터 칩 */}
        <div className="mb-4">
          <FilterChips
            filters={filters}
            onRemoveCategory={handleRemoveCategory}
            onRemoveRegion={handleRemoveRegion}
            onResetAll={handleResetFilters}
          />
        </div>

        {/* 결과 헤더 */}
        <SearchResultsHeader
          totalCount={pagination.totalCount}
          searchTime={meta.searchTime}
        />

        {/* 검색 결과 */}
        <SearchResults
          results={results}
          keyword={params.keyword || ''}
          totalCount={pagination.totalCount}
          isLoading={isLoading || isFetching}
          onBookmarkToggle={handleBookmarkToggle}
          onCardClick={handleCardClick}
          onResetFilters={handleResetFilters}
        />

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 mb-4">
            <SearchPagination
              pagination={pagination}
              onPageChange={goToPage}
            />
          </div>
        )}
      </main>

      {/* 모바일 필터 바텀시트 */}
      <MobileFilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onCategoryChange={setCategory}
        onRegionChange={setRegion}
        onSortChange={setSortBy}
        onReset={handleResetFilters}
        resultCount={pagination.totalCount}
      />
    </div>
  );
}

export default SearchPage;
