/**
 * FavoritesPage 컴포넌트
 * 즐겨찾기 메인 페이지
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart2,
  CheckSquare,
  ListFilter,
} from 'lucide-react';

// Hooks
import { useFavorites, useBulkActions } from '../hooks';

// Components
import { FavoritesList } from '../components/FavoritesList';
import { FavoritesFilter } from '../components/FavoritesFilter';
import { FavoritesSort } from '../components/FavoritesSort';
import { FavoritesSearch } from '../components/FavoritesSearch';
import { BulkActions } from '../components/BulkActions';
import { DeadlineAlert } from '../components/DeadlineAlert';
import { EmptyFavorites } from '../components/EmptyFavorites';

// Types
import type { Favorite, FavoriteCategory, FavoriteSortOption, SortOrder } from '../types';
import { DEFAULT_SORT, getDefaultSortOrder } from '../constants';

/**
 * Pagination 컴포넌트
 */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages = useMemo(() => {
    const result: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }
    } else {
      result.push(1);
      
      if (currentPage > 3) {
        result.push('ellipsis');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        result.push('ellipsis');
      }
      
      result.push(totalPages);
    }
    
    return result;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        이전
      </button>
      
      {pages.map((page, index) => (
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`
              w-8 h-8 text-sm rounded-lg
              ${currentPage === page
                ? 'bg-blue-600 text-white font-medium'
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            {page}
          </button>
        )
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        다음
      </button>
    </div>
  );
};

/**
 * 즐겨찾기 메인 페이지
 */
export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();

  // 필터 상태
  const [selectedCategory, setSelectedCategory] = useState<FavoriteCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<FavoriteSortOption>(DEFAULT_SORT.sortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(DEFAULT_SORT.sortOrder);
  const [search, setSearch] = useState('');
  const [showDeadlineOnly, setShowDeadlineOnly] = useState(false);

  // 즐겨찾기 데이터
  const {
    favorites,
    pagination,
    meta,
    isLoading,
    isFetching,
    params,
    setParams,
    goToPage,
    removeFavorite,
    isRemoving,
  } = useFavorites({
    initialParams: {
      sortBy: DEFAULT_SORT.sortBy,
      sortOrder: DEFAULT_SORT.sortOrder,
    },
  });

  // 일괄 작업
  const {
    selectedIds,
    selectedCount,
    isAllSelected,
    isSelectionMode,
    toggleSelect,
    selectAll,
    clearSelection,
    enterSelectionMode,
    exitSelectionMode,
    bulkRemove,
    isBulkRemoving,
  } = useBulkActions();

  // 카테고리 변경
  const handleCategoryChange = useCallback(
    (category: FavoriteCategory | 'all') => {
      setSelectedCategory(category);
      setParams({
        category: category === 'all' ? undefined : category,
      });
    },
    [setParams],
  );

  // 정렬 변경
  const handleSortChange = useCallback(
    (newSortBy: FavoriteSortOption, newSortOrder: SortOrder) => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
      setParams({
        sortBy: newSortBy,
        sortOrder: newSortOrder,
      });
    },
    [setParams],
  );

  // 검색어 변경
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      setParams({ search: value || undefined });
    },
    [setParams],
  );

  // 마감 임박 필터
  const handleViewDeadlineOnly = useCallback(() => {
    setShowDeadlineOnly(true);
    setParams({ deadlineWithin: 7 });
  }, [setParams]);

  // 카드 클릭 (상세 보기)
  const handleCardClick = useCallback(
    (favorite: Favorite) => {
      navigate(`/welfare/${favorite.programId}`);
    },
    [navigate],
  );

  // 추천 페이지로 이동
  const handleGoToRecommendations = useCallback(() => {
    navigate('/recommendations');
  }, [navigate]);

  // 전체 선택 핸들러
  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        selectAll(favorites.map((f) => f.id));
      } else {
        clearSelection();
      }
    },
    [selectAll, clearSelection, favorites],
  );

  // 뒤로 가기
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // 현재 필터된 총 개수
  const totalCount = pagination?.totalCount ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-14 px-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="뒤로 가기"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              내 즐겨찾기
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* 선택 모드 토글 */}
            {!isSelectionMode && favorites.length > 0 && (
              <button
                onClick={enterSelectionMode}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="선택 모드"
              >
                <CheckSquare className="w-5 h-5 text-gray-600" />
              </button>
            )}

            {/* 통계 버튼 (추후 구현) */}
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="통계"
            >
              <BarChart2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-4">
        {/* 선택 모드 헤더 */}
        {isSelectionMode && (
          <div className="mb-4">
            <BulkActions
              selectedCount={selectedCount}
              totalCount={favorites.length}
              isAllSelected={isAllSelected}
              onSelectAll={handleSelectAll}
              onClearSelection={exitSelectionMode}
              onBulkDelete={bulkRemove}
              isDeleting={isBulkRemoving}
            />
          </div>
        )}

        {/* 검색창 */}
        {!isSelectionMode && (
          <div className="mb-4">
            <FavoritesSearch
              value={search}
              onChange={handleSearchChange}
              placeholder="저장된 복지 검색..."
            />
          </div>
        )}

        {/* 마감 임박 알림 */}
        {!isSelectionMode && meta && meta.upcomingDeadlines > 0 && !showDeadlineOnly && (
          <div className="mb-4">
            <DeadlineAlert
              count={meta.upcomingDeadlines}
              onViewDetails={handleViewDeadlineOnly}
            />
          </div>
        )}

        {/* 카테고리 필터 */}
        {!isSelectionMode && (
          <div className="mb-4">
            <FavoritesFilter
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              categoryCounts={meta?.categories}
              totalCount={totalCount}
            />
          </div>
        )}

        {/* 목록 헤더 */}
        {!isSelectionMode && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ListFilter className="w-4 h-4" />
              <span>{totalCount}건</span>
              {isFetching && !isLoading && (
                <span className="text-blue-500">(갱신중...)</span>
              )}
            </div>

            <FavoritesSort
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />
          </div>
        )}

        {/* 즐겨찾기 목록 */}
        <FavoritesList
          favorites={favorites}
          isLoading={isLoading}
          isSelectionMode={isSelectionMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onCardClick={handleCardClick}
          onRemove={removeFavorite}
        />

        {/* 페이지네이션 */}
        {pagination && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={goToPage}
          />
        )}

        {/* 빈 상태 (검색/필터 결과 없음) - 이미 FavoritesList에서 처리 */}
      </main>
    </div>
  );
};

export default FavoritesPage;
