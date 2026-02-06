/**
 * EmptySearchResults 컴포넌트
 * 검색 결과 없음 UI
 */

import React from 'react';
import { Search, RefreshCw, List } from 'lucide-react';

interface EmptySearchResultsProps {
  keyword: string;
  onResetFilters?: () => void;
  onShowAll?: () => void;
}

const POPULAR_KEYWORDS = ['청년 주거', '육아 지원', '노인 복지', '장애인', '교육'];

export function EmptySearchResults({
  keyword,
  onResetFilters,
  onShowAll,
}: EmptySearchResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* 아이콘 */}
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-gray-400" />
      </div>

      {/* 메시지 */}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {keyword ? (
          <>
            '<span className="text-blue-600">{keyword}</span>'에 대한
            <br />
            검색 결과가 없습니다
          </>
        ) : (
          '검색 결과가 없습니다'
        )}
      </h3>

      {/* 안내 문구 */}
      <p className="text-sm text-gray-500 mb-6">
        다른 검색어를 입력하거나 필터 조건을 변경해보세요
      </p>

      {/* 액션 버튼 */}
      <div className="flex flex-wrap gap-3 justify-center">
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 
                       rounded-lg text-sm font-medium text-gray-700
                       hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            필터 초기화
          </button>
        )}
        {onShowAll && (
          <button
            onClick={onShowAll}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 
                       rounded-lg text-sm font-medium text-white
                       hover:bg-blue-700 transition-colors"
          >
            <List className="h-4 w-4" />
            전체 복지 보기
          </button>
        )}
      </div>

      {/* 인기 검색어 */}
      <div className="mt-8 pt-6 border-t border-gray-100 w-full max-w-md">
        <p className="text-sm text-gray-500 mb-3">📌 인기 검색어</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {POPULAR_KEYWORDS.map((term) => (
            <span
              key={term}
              className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700
                         hover:bg-gray-200 cursor-pointer transition-colors"
            >
              {term}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmptySearchResults;
