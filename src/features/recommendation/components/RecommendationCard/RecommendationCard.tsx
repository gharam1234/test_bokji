/**
 * 컴포넌트 - 추천 카드
 */

import React from 'react';
import { Recommendation, WelfareCategory } from '../../types';
import { MatchScoreBadge } from '../MatchScoreBadge';
import { MatchReasonsList } from '../MatchReasons';
import { formatDeadline, isDeadlineSoon, getCategoryColor } from '../../utils';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onBookmarkToggle?: (programId: string) => void;
  onClick?: (programId: string) => void;
}

export function RecommendationCard({ 
  recommendation, 
  onBookmarkToggle,
  onClick 
}: RecommendationCardProps) {
  const { welfareProgram, matchScore, matchReasons, isBookmarked } = recommendation;
  const deadline = welfareProgram.applicationDeadline;
  const isSoon = isDeadlineSoon(deadline);
  
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmarkToggle?.(welfareProgram.id);
  };
  
  return (
    <div 
      onClick={() => onClick?.(welfareProgram.id)}
      className="
        relative cursor-pointer rounded-xl border border-gray-200 bg-white p-4
        shadow-sm transition-all duration-200
        hover:border-blue-300 hover:shadow-md
      "
    >
      {/* 상단: 카테고리 & 북마크 */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex flex-wrap gap-1.5">
          {welfareProgram.categories.slice(0, 2).map((category) => (
            <span
              key={category}
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(category)}`}
            >
              {WelfareCategory[category]}
            </span>
          ))}
          {welfareProgram.categories.length > 2 && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              +{welfareProgram.categories.length - 2}
            </span>
          )}
        </div>
        
        <button
          onClick={handleBookmarkClick}
          className={`
            rounded-full p-1.5 transition-colors duration-200
            ${isBookmarked 
              ? 'text-yellow-500 hover:text-yellow-600' 
              : 'text-gray-300 hover:text-gray-400'
            }
          `}
          aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
        >
          <svg 
            className="h-5 w-5" 
            fill={isBookmarked ? 'currentColor' : 'none'} 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
            />
          </svg>
        </button>
      </div>
      
      {/* 제목 */}
      <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
        {welfareProgram.name}
      </h3>
      
      {/* 요약 */}
      <p className="mb-3 text-sm text-gray-600 line-clamp-2">
        {welfareProgram.summary}
      </p>
      
      {/* 매칭 점수 & 마감일 */}
      <div className="mb-3 flex items-center justify-between">
        <MatchScoreBadge score={matchScore} size="sm" />
        
        {deadline && (
          <span className={`text-sm font-medium ${isSoon ? 'text-red-500' : 'text-gray-500'}`}>
            {isSoon && '🔥 '}{formatDeadline(deadline)}
          </span>
        )}
      </div>
      
      {/* 매칭 이유 */}
      <div className="border-t border-gray-100 pt-3">
        <MatchReasonsList reasons={matchReasons} maxItems={2} />
      </div>
      
      {/* 기관 정보 */}
      <div className="mt-3 text-xs text-gray-400">
        {welfareProgram.organizationName}
      </div>
    </div>
  );
}
