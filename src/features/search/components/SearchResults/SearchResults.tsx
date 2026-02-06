/**
 * SearchResults 컴포넌트
 * 검색 결과 목록 컨테이너
 */

import React from 'react';
import type { WelfareProgram } from '../../types';
import { SearchResultCard, SearchResultCardSkeleton } from '../SearchResultCard';
import { EmptySearchResults } from '../EmptySearchResults';

interface SearchResultsProps {
  results: WelfareProgram[];
  keyword: string;
  totalCount: number;
  isLoading: boolean;
  onBookmarkToggle?: (programId: string) => void;
  onCardClick?: (program: WelfareProgram) => void;
  onResetFilters?: () => void;
}

export function SearchResults({
  results,
  keyword,
  totalCount,
  isLoading,
  onBookmarkToggle,
  onCardClick,
  onResetFilters,
}: SearchResultsProps) {
  // 로딩 중
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <SearchResultCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // 결과 없음
  if (results.length === 0) {
    return (
      <EmptySearchResults
        keyword={keyword}
        onResetFilters={onResetFilters}
      />
    );
  }

  // 결과 목록
  return (
    <div className="space-y-4">
      {results.map((program) => (
        <SearchResultCard
          key={program.id}
          program={program}
          keyword={keyword}
          onBookmarkToggle={onBookmarkToggle}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}

export default SearchResults;
