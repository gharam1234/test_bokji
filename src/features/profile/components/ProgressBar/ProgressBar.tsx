/**
 * ProgressBar 컴포넌트
 * 프로필 완성도 진행 바
 */

import React from 'react';
import { progressBarStyles as styles } from './ProgressBar.styles';

interface ProgressBarProps {
  /** 완성도 (0-100) */
  percentage: number;
  /** 라벨 표시 여부 */
  showLabel?: boolean;
  /** 라벨 텍스트 */
  label?: string;
  /** 퍼센트 표시 여부 */
  showPercentage?: boolean;
  /** 색상 (auto: 완성도에 따라 자동) */
  color?: 'auto' | 'blue' | 'green' | 'yellow' | 'red';
  /** 높이 */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 프로필 완성도를 시각적으로 표시하는 프로그레스 바
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  showLabel = true,
  label = '프로필 완성도',
  showPercentage = true,
  color = 'auto',
  size = 'md',
}) => {
  // 퍼센트 값 정규화 (0-100)
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));

  // 색상 결정
  const getTrackColor = () => {
    if (color !== 'auto') {
      const colorMap = {
        blue: styles.trackBlue,
        green: styles.trackGreen,
        yellow: styles.trackYellow,
        red: styles.trackRed,
      };
      return colorMap[color];
    }

    // 자동 색상: 완성도에 따라
    if (normalizedPercentage >= 100) return styles.trackGreen;
    if (normalizedPercentage >= 75) return styles.trackBlue;
    if (normalizedPercentage >= 50) return styles.trackYellow;
    return styles.trackRed;
  };

  // 높이 결정
  const getHeight = () => {
    switch (size) {
      case 'sm':
        return 'h-1.5';
      case 'lg':
        return 'h-4';
      default:
        return 'h-2.5';
    }
  };

  return (
    <div className={styles.container}>
      {/* 라벨 행 */}
      {(showLabel || showPercentage) && (
        <div className={styles.labelRow}>
          {showLabel && <span className={styles.label}>{label}</span>}
          {showPercentage && (
            <span className={styles.percentage}>{normalizedPercentage}%</span>
          )}
        </div>
      )}

      {/* 진행 바 */}
      <div
        className={`${styles.trackWrapper} ${getHeight()}`}
        role="progressbar"
        aria-valuenow={normalizedPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${normalizedPercentage}%`}
      >
        <div
          className={`${styles.track} ${getTrackColor()}`}
          style={{ width: `${normalizedPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
