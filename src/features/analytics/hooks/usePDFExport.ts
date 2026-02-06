/**
 * usePDFExport 훅
 * PDF 리포트 다운로드 기능
 */

import { useState, useCallback } from 'react';
import { analyticsApi } from '../api';
import { PeriodFilter } from '../types';

/** usePDFExport 옵션 */
export interface UsePDFExportOptions {
  /** 조회 기간 */
  period?: PeriodFilter;
  /** 인사이트 포함 여부 */
  includeInsights?: boolean;
  /** 차트 포함 여부 */
  includeCharts?: boolean;
  /** 언어 */
  language?: 'ko' | 'en';
}

/** usePDFExport 반환 타입 */
export interface UsePDFExportReturn {
  /** PDF 다운로드 함수 */
  downloadPDF: () => Promise<void>;
  /** 생성 중 여부 */
  isGenerating: boolean;
  /** 진행률 (0-100) */
  progress: number;
  /** 에러 객체 */
  error: Error | null;
  /** 에러 초기화 */
  clearError: () => void;
}

/**
 * PDF 리포트 다운로드 훅
 *
 * @example
 * ```tsx
 * const { downloadPDF, isGenerating, progress, error } = usePDFExport({
 *   period: 'month',
 *   includeCharts: true,
 * });
 *
 * return (
 *   <button onClick={downloadPDF} disabled={isGenerating}>
 *     {isGenerating ? `생성 중... ${progress}%` : 'PDF 다운로드'}
 *   </button>
 * );
 * ```
 */
export function usePDFExport(
  options: UsePDFExportOptions = {},
): UsePDFExportReturn {
  const {
    period = 'month',
    includeInsights = true,
    includeCharts = true,
    language = 'ko',
  } = options;

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);

  /**
   * PDF 다운로드 실행
   */
  const downloadPDF = useCallback(async () => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);

    try {
      // 진행률 시뮬레이션 (실제 구현시 서버에서 진행률 받아야 함)
      setProgress(10);

      // API 호출 준비
      setProgress(30);

      // PDF 다운로드
      await analyticsApi.downloadAndSavePDF({
        period,
        includeInsights,
        includeCharts,
        language,
      });

      setProgress(100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'PDF 생성 실패';
      setError(new Error(errorMessage));
      console.error('PDF export error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [period, includeInsights, includeCharts, language]);

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    downloadPDF,
    isGenerating,
    progress,
    error,
    clearError,
  };
}

export default usePDFExport;
