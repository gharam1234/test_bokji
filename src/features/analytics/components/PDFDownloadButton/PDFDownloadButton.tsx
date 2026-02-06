/**
 * PDFDownloadButton 컴포넌트
 * PDF 리포트 다운로드 버튼
 */

import React from 'react';
import { usePDFExport } from '../../hooks';
import { PeriodFilter } from '../../types';

export interface PDFDownloadButtonProps {
  /** 기간 */
  period?: PeriodFilter;
  /** 인사이트 포함 여부 */
  includeInsights?: boolean;
  /** 차트 포함 여부 */
  includeCharts?: boolean;
  /** 버튼 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 버튼 변형 */
  variant?: 'primary' | 'secondary' | 'outline';
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 클래스명 */
  className?: string;
}

/** 크기별 스타일 */
const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

/** 변형별 스타일 */
const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100',
};

/**
 * PDF 다운로드 버튼 컴포넌트
 */
export const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
  period = 'month',
  includeInsights = true,
  includeCharts = true,
  size = 'md',
  variant = 'primary',
  disabled = false,
  className = '',
}) => {
  const { downloadPDF, isGenerating, progress, error } = usePDFExport({
    period,
    includeInsights,
    includeCharts,
  });

  const handleClick = async () => {
    if (!isGenerating && !disabled) {
      await downloadPDF();
    }
  };

  const isDisabled = disabled || isGenerating;

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center gap-2
          font-medium rounded-lg transition-all
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
      >
        {isGenerating ? (
          <>
            <LoadingSpinner />
            <span>생성 중... {progress}%</span>
          </>
        ) : (
          <>
            <PDFIcon />
            <span>PDF 리포트 다운로드</span>
          </>
        )}
      </button>

      {/* 에러 메시지 */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

/**
 * PDF 아이콘
 */
const PDFIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

/**
 * 로딩 스피너
 */
const LoadingSpinner: React.FC = () => (
  <svg
    className="animate-spin w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default PDFDownloadButton;
