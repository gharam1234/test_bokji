/**
 * 유틸리티 - 점수 헬퍼
 */

/**
 * 매칭 점수에 따른 색상 클래스 반환
 */
export function getMatchScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600 bg-green-100';
  if (score >= 70) return 'text-blue-600 bg-blue-100';
  if (score >= 50) return 'text-yellow-600 bg-yellow-100';
  return 'text-gray-600 bg-gray-100';
}

/**
 * 매칭 점수에 따른 라벨 반환
 */
export function getMatchScoreLabel(score: number): string {
  if (score >= 90) return '최적 매칭';
  if (score >= 70) return '높은 매칭';
  if (score >= 50) return '보통 매칭';
  return '낮은 매칭';
}

/**
 * 매칭 점수 포맷팅
 */
export function formatMatchScore(score: number): string {
  return `${score}%`;
}
