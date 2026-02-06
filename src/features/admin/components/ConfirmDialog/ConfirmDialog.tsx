/**
 * 확인 다이얼로그 컴포넌트
 */

import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * 확인 다이얼로그 컴포넌트
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, isLoading, onCancel]);

  // 바깥 클릭으로 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: '⚠️',
      iconBg: 'bg-red-100',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    },
    warning: {
      icon: '⚡',
      iconBg: 'bg-yellow-100',
      button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    },
    info: {
      icon: 'ℹ️',
      iconBg: 'bg-blue-100',
      button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      {/* 백드롭 */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* 다이얼로그 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={dialogRef}
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all"
        >
          {/* 아이콘 */}
          <div className={`mx-auto w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}>
            <span className="text-2xl">{styles.icon}</span>
          </div>

          {/* 제목 */}
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            {title}
          </h3>

          {/* 메시지 */}
          <p className="text-gray-600 text-center mb-6">{message}</p>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 ${styles.button}`}
            >
              {isLoading ? '처리 중...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
