/**
 * 유틸리티 - 마감일 헬퍼
 */

/**
 * 마감일까지 남은 일수 계산
 */
export function getDaysUntilDeadline(deadline: string | null | undefined): number | null {
  if (!deadline) return null;
  
  const deadlineDate = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * 마감일 텍스트 생성
 */
export function formatDeadline(deadline: string | null | undefined): string {
  if (!deadline) return '상시';
  
  const daysLeft = getDaysUntilDeadline(deadline);
  
  if (daysLeft === null) return '상시';
  if (daysLeft < 0) return '마감됨';
  if (daysLeft === 0) return '오늘 마감';
  if (daysLeft === 1) return '내일 마감';
  if (daysLeft <= 7) return `${daysLeft}일 남음`;
  if (daysLeft <= 30) return `${Math.ceil(daysLeft / 7)}주 남음`;
  
  const date = new Date(deadline);
  return `~${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * 마감 임박 여부 확인
 */
export function isDeadlineSoon(deadline: string | null | undefined): boolean {
  const daysLeft = getDaysUntilDeadline(deadline);
  return daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
}

/**
 * 마감됨 여부 확인
 */
export function isExpired(deadline: string | null | undefined): boolean {
  const daysLeft = getDaysUntilDeadline(deadline);
  return daysLeft !== null && daysLeft < 0;
}
