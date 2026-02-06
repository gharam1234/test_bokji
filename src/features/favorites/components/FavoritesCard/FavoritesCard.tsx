/**
 * FavoritesCard 컴포넌트
 * 즐겨찾기 아이템 카드
 */

import React, { memo, useCallback } from 'react';
import {
  Star,
  Calendar,
  ChevronRight,
  Briefcase,
  Home,
  GraduationCap,
  Heart,
  Baby,
  Sparkles,
  ShieldCheck,
  MoreHorizontal,
  AlertTriangle,
} from 'lucide-react';
import type { Favorite, FavoriteCategory } from '../../types';
import { getCategoryLabel, getCategoryColor, getCategoryBgColor } from '../../constants';
import {
  getDeadlineText,
  getDeadlineColorClass,
  getDeadlineBgClass,
  formatBookmarkedAtRelative,
} from '../../utils';

/**
 * FavoritesCard Props
 */
export interface FavoritesCardProps {
  /** 즐겨찾기 데이터 */
  favorite: Favorite;
  /** 선택 모드 여부 */
  isSelectionMode?: boolean;
  /** 선택 여부 */
  isSelected?: boolean;
  /** 선택 토글 핸들러 */
  onToggleSelect?: (id: string) => void;
  /** 카드 클릭 핸들러 (상세 보기) */
  onClick?: (favorite: Favorite) => void;
  /** 삭제 핸들러 */
  onRemove?: (id: string) => void;
}

/**
 * 카테고리별 아이콘 컴포넌트
 */
const CategoryIcons: Record<FavoriteCategory, React.FC<{ className?: string }>> = {
  employment: Briefcase,
  housing: Home,
  education: GraduationCap,
  healthcare: Heart,
  childcare: Baby,
  culture: Sparkles,
  safety: ShieldCheck,
  other: MoreHorizontal,
};

/**
 * 즐겨찾기 카드 컴포넌트
 *
 * @example
 * ```tsx
 * <FavoritesCard
 *   favorite={favoriteItem}
 *   isSelectionMode={false}
 *   onClick={(fav) => navigate(`/welfare/${fav.programId}`)}
 *   onRemove={(id) => removeFavorite(id)}
 * />
 * ```
 */
export const FavoritesCard = memo<FavoritesCardProps>(function FavoritesCard({
  favorite,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
  onClick,
  onRemove,
}) {
  const {
    id,
    programName,
    programSummary,
    category,
    matchScore,
    deadline,
    bookmarkedAt,
    isDeadlineNear,
  } = favorite;

  // 카테고리 아이콘 컴포넌트
  const CategoryIcon = CategoryIcons[category] || MoreHorizontal;
  const categoryColor = getCategoryColor(category);
  const categoryBgColor = getCategoryBgColor(category);
  const categoryLabel = getCategoryLabel(category);

  // 마감일 관련
  const deadlineText = getDeadlineText(deadline);
  const deadlineColorClass = getDeadlineColorClass(deadline);
  const deadlineBgClass = getDeadlineBgClass(deadline);

  // 저장일 텍스트
  const bookmarkedAtText = formatBookmarkedAtRelative(bookmarkedAt);

  // 카드 클릭 핸들러
  const handleCardClick = useCallback(() => {
    if (isSelectionMode && onToggleSelect) {
      onToggleSelect(id);
    } else if (onClick) {
      onClick(favorite);
    }
  }, [isSelectionMode, onToggleSelect, onClick, id, favorite]);

  // 체크박스 클릭 핸들러 (이벤트 버블링 방지)
  const handleCheckboxClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onToggleSelect) {
        onToggleSelect(id);
      }
    },
    [onToggleSelect, id],
  );

  // 삭제 버튼 클릭 핸들러
  const handleRemoveClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onRemove) {
        onRemove(id);
      }
    },
    [onRemove, id],
  );

  return (
    <div
      className={`
        relative bg-white rounded-xl border transition-all duration-200 cursor-pointer
        hover:shadow-md hover:border-gray-300
        ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200'}
      `}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
    >
      {/* 선택 체크박스 (선택 모드일 때만) */}
      {isSelectionMode && (
        <div
          className="absolute top-3 left-3 z-10"
          onClick={handleCheckboxClick}
        >
          <div
            className={`
              w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
              ${isSelected
                ? 'bg-blue-500 border-blue-500'
                : 'bg-white border-gray-300 hover:border-blue-400'
              }
            `}
          >
            {isSelected && (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>
      )}

      <div className={`p-4 ${isSelectionMode ? 'pl-10' : ''}`}>
        {/* 상단: 카테고리 & 매칭률 */}
        <div className="flex items-center justify-between mb-3">
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: categoryBgColor, color: categoryColor }}
          >
            <CategoryIcon className="w-3.5 h-3.5" />
            <span>{categoryLabel}</span>
          </div>

          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-semibold">{matchScore}%</span>
          </div>
        </div>

        {/* 프로그램명 */}
        <h3 className="text-base font-semibold text-gray-900 mb-1.5 line-clamp-1">
          {programName}
        </h3>

        {/* 프로그램 요약 */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {programSummary}
        </p>

        {/* 하단: 마감일 & 저장일 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 마감일 */}
            <div
              className={`
                flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium
                ${deadlineBgClass} ${deadlineColorClass}
              `}
            >
              {isDeadlineNear && (
                <AlertTriangle className="w-3 h-3" />
              )}
              <Calendar className="w-3 h-3" />
              <span>{deadlineText}</span>
            </div>

            {/* 저장일 */}
            <span className="text-xs text-gray-400">{bookmarkedAtText}</span>
          </div>

          {/* 상세보기 버튼 */}
          {!isSelectionMode && (
            <button
              className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
              onClick={handleCardClick}
            >
              상세보기
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

/**
 * FavoritesCard 스켈레톤 컴포넌트
 */
export const FavoritesCardSkeleton: React.FC = memo(function FavoritesCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      {/* 상단 */}
      <div className="flex items-center justify-between mb-3">
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
        <div className="h-5 w-12 bg-gray-200 rounded" />
      </div>

      {/* 제목 */}
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />

      {/* 설명 */}
      <div className="space-y-1.5 mb-3">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
      </div>

      {/* 하단 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-14 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
        <div className="h-4 w-14 bg-gray-200 rounded" />
      </div>
    </div>
  );
});
