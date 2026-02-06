/**
 * SearchResultCard 컴포넌트
 * 검색 결과 카드
 */

import React from 'react';
import { Calendar, MapPin, Building2, Eye, Bookmark, ExternalLink } from 'lucide-react';
import type { WelfareProgram } from '../../types';
import { formatDDay, getDDayClassName, formatViewCount } from '../../utils/searchHelpers';
import { getCategoryColor } from '../../constants/categories';

interface SearchResultCardProps {
  program: WelfareProgram;
  keyword?: string;
  onBookmarkToggle?: (programId: string) => void;
  onCardClick?: (program: WelfareProgram) => void;
}

export function SearchResultCard({
  program,
  keyword,
  onBookmarkToggle,
  onCardClick,
}: SearchResultCardProps) {
  // 키워드 하이라이트
  const highlightText = (text: string) => {
    if (!keyword) return text;
    
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const handleCardClick = () => {
    onCardClick?.(program);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmarkToggle?.(program.id);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const categoryColor = getCategoryColor(program.category);

  return (
    <article
      onClick={handleCardClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md 
                 transition-shadow cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
    >
      {/* 헤더: 카테고리 + 북마크 */}
      <div className="flex items-start justify-between mb-2">
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
        >
          {program.categoryLabel}
        </span>
        <button
          onClick={handleBookmarkClick}
          className={`p-1.5 rounded-full transition-colors ${
            program.isBookmarked
              ? 'text-yellow-500 bg-yellow-50'
              : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
          }`}
          aria-label={program.isBookmarked ? '북마크 해제' : '북마크 추가'}
        >
          <Bookmark
            className="h-5 w-5"
            fill={program.isBookmarked ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* 제목 */}
      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
        {highlightText(program.name)}
      </h3>

      {/* 요약 */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {highlightText(program.summary)}
      </p>

      {/* 메타 정보 */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <Building2 className="h-3.5 w-3.5" />
          {program.organization}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {program.regionName}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          {formatViewCount(program.viewCount)}
        </span>
      </div>

      {/* 푸터: 마감일 + 링크 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className={`text-sm font-medium ${getDDayClassName(program.dDay)}`}>
            {formatDDay(program.dDay)}
          </span>
          {program.deadline && (
            <span className="text-xs text-gray-400">
              ({program.deadline})
            </span>
          )}
        </div>

        {program.applicationUrl && (
          <a
            href={program.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            신청하기
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}

export default SearchResultCard;
