/**
 * FavoritesList 컴포넌트
 * 즐겨찾기 목록 컨테이너
 */

import React, { memo } from 'react';
import type { Favorite } from '../../types';
import { FavoritesCard, FavoritesCardSkeleton } from '../FavoritesCard';
import { EmptyFavorites } from '../EmptyFavorites';

/**
 * FavoritesList Props
 */
export interface FavoritesListProps {
  /** 즐겨찾기 목록 */
  favorites: Favorite[];
  /** 로딩 중 여부 */
  isLoading?: boolean;
  /** 선택 모드 여부 */
  isSelectionMode?: boolean;
  /** 선택된 ID Set */
  selectedIds?: Set<string>;
  /** 선택 토글 핸들러 */
  onToggleSelect?: (id: string) => void;
  /** 카드 클릭 핸들러 */
  onCardClick?: (favorite: Favorite) => void;
  /** 삭제 핸들러 */
  onRemove?: (id: string) => void;
  /** 스켈레톤 개수 (로딩 시) */
  skeletonCount?: number;
}

/**
 * 즐겨찾기 목록 컴포넌트
 *
 * @example
 * ```tsx
 * <FavoritesList
 *   favorites={favorites}
 *   isLoading={isLoading}
 *   isSelectionMode={isSelectionMode}
 *   selectedIds={selectedIds}
 *   onToggleSelect={toggleSelect}
 *   onCardClick={(fav) => navigate(`/welfare/${fav.programId}`)}
 *   onRemove={removeFavorite}
 * />
 * ```
 */
export const FavoritesList = memo<FavoritesListProps>(function FavoritesList({
  favorites,
  isLoading = false,
  isSelectionMode = false,
  selectedIds = new Set(),
  onToggleSelect,
  onCardClick,
  onRemove,
  skeletonCount = 6,
}) {
  // 로딩 상태
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <FavoritesCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // 빈 상태
  if (favorites.length === 0) {
    return <EmptyFavorites />;
  }

  // 목록 렌더링
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((favorite) => (
        <FavoritesCard
          key={favorite.id}
          favorite={favorite}
          isSelectionMode={isSelectionMode}
          isSelected={selectedIds.has(favorite.id)}
          onToggleSelect={onToggleSelect}
          onClick={onCardClick}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
});
