/**
 * RecentSearches 컴포넌트
 * 최근 검색어 목록
 */

import React from 'react';
import { Clock, X, Trash2 } from 'lucide-react';
import type { SearchHistoryItem } from '../../types';

interface RecentSearchesProps {
  history: SearchHistoryItem[];
  onSelect: (keyword: string) => void;
  onRemove: (keyword: string) => void;
  onClearAll: () => void;
}

export function RecentSearches({
  history,
  onSelect,
  onRemove,
  onClearAll,
}: RecentSearchesProps) {
  if (history.length === 0) return null;

  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return '방금 전';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    return `${Math.floor(diff / 86400000)}일 전`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          최근 검색어
        </h3>
        <button
          onClick={onClearAll}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" />
          전체 삭제
        </button>
      </div>

      {/* 검색어 목록 */}
      <ul className="space-y-1">
        {history.map((item) => (
          <li
            key={item.keyword}
            className="flex items-center justify-between group"
          >
            <button
              onClick={() => onSelect(item.keyword)}
              className="flex-1 flex items-center gap-2 py-2 px-2 -ml-2 rounded-lg
                         text-left text-sm text-gray-700 hover:bg-gray-50
                         transition-colors"
            >
              <span className="flex-1 truncate">{item.keyword}</span>
              <span className="text-xs text-gray-400">
                {formatTime(item.timestamp)}
              </span>
            </button>
            <button
              onClick={() => onRemove(item.keyword)}
              className="p-1.5 text-gray-400 hover:text-gray-600 
                         opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`${item.keyword} 삭제`}
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RecentSearches;
