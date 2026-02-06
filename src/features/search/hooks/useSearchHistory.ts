/**
 * useSearchHistory Hook
 * 검색 기록 관리 (로컬 스토리지)
 */

import { useState, useCallback, useEffect } from 'react';
import type { SearchHistoryItem } from '../types';

const STORAGE_KEY = 'welfare-search-history';
const MAX_HISTORY_ITEMS = 10;

/**
 * useSearchHistory 반환 타입
 */
export interface UseSearchHistoryReturn {
  // 데이터
  history: SearchHistoryItem[];

  // 액션
  addToHistory: (keyword: string) => void;
  removeFromHistory: (keyword: string) => void;
  clearHistory: () => void;
}

/**
 * 로컬 스토리지에서 히스토리 로드
 */
function loadHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load search history:', error);
  }
  return [];
}

/**
 * 로컬 스토리지에 히스토리 저장
 */
function saveHistory(history: SearchHistoryItem[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
}

/**
 * useSearchHistory Hook
 */
export function useSearchHistory(): UseSearchHistoryReturn {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // 초기 로드
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // 검색어 추가
  const addToHistory = useCallback((keyword: string) => {
    if (!keyword.trim()) return;

    setHistory((prev) => {
      // 중복 제거
      const filtered = prev.filter(
        (item) => item.keyword.toLowerCase() !== keyword.toLowerCase(),
      );

      // 새 항목 추가
      const newItem: SearchHistoryItem = {
        keyword: keyword.trim(),
        timestamp: Date.now(),
      };

      // 최대 개수 제한
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

      // 저장
      saveHistory(updated);

      return updated;
    });
  }, []);

  // 검색어 삭제
  const removeFromHistory = useCallback((keyword: string) => {
    setHistory((prev) => {
      const updated = prev.filter(
        (item) => item.keyword.toLowerCase() !== keyword.toLowerCase(),
      );
      saveHistory(updated);
      return updated;
    });
  }, []);

  // 히스토리 전체 삭제
  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}
