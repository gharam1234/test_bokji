/**
 * EmptyFavorites 컴포넌트
 * 즐겨찾기가 없을 때 표시되는 빈 상태 UI
 */

import React, { memo } from 'react';
import { FolderOpen, ArrowRight } from 'lucide-react';

/**
 * EmptyFavorites Props
 */
export interface EmptyFavoritesProps {
  /** 검색/필터 결과가 없는 경우 */
  isFilteredEmpty?: boolean;
  /** 추천 페이지로 이동 핸들러 */
  onGoToRecommendations?: () => void;
}

/**
 * 즐겨찾기 빈 상태 컴포넌트
 *
 * @example
 * ```tsx
 * <EmptyFavorites
 *   onGoToRecommendations={() => navigate('/recommendations')}
 * />
 * ```
 */
export const EmptyFavorites = memo<EmptyFavoritesProps>(function EmptyFavorites({
  isFilteredEmpty = false,
  onGoToRecommendations,
}) {
  if (isFilteredEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FolderOpen className="w-8 h-8 text-gray-400" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          검색 결과가 없습니다
        </h3>

        <p className="text-sm text-gray-500 text-center max-w-xs">
          다른 검색어나 필터 조건으로 다시 시도해보세요
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <FolderOpen className="w-10 h-10 text-blue-500" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        저장된 복지가 없습니다
      </h3>

      <p className="text-sm text-gray-500 text-center max-w-xs mb-6">
        맞춤 추천에서 관심있는 복지를 저장해보세요.
        <br />
        나중에 쉽게 다시 확인할 수 있어요.
      </p>

      {onGoToRecommendations && (
        <button
          className="
            flex items-center gap-2 px-5 py-2.5 
            bg-blue-600 text-white text-sm font-medium rounded-lg
            hover:bg-blue-700 transition-colors
          "
          onClick={onGoToRecommendations}
        >
          맞춤 추천 보러가기
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});
