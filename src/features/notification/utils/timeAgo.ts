/**
 * 시간 포맷팅 유틸리티
 * 상대 시간 표시 (예: "3분 전", "2시간 전")
 */

/**
 * 날짜를 상대 시간 문자열로 변환
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  // 1분 미만
  if (diffInSeconds < 60) {
    return '방금 전';
  }

  // 1시간 미만
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }

  // 24시간 미만
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }

  // 7일 미만
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  }

  // 30일 미만
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInDays < 30) {
    return `${diffInWeeks}주 전`;
  }

  // 12개월 미만
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}개월 전`;
  }

  // 1년 이상
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}년 전`;
}

/**
 * 날짜를 "오늘", "어제", 또는 날짜 형식으로 변환
 */
export function formatDateLabel(date: Date | string): string {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;

  // 오늘
  if (isSameDay(now, target)) {
    return '오늘';
  }

  // 어제
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(yesterday, target)) {
    return '어제';
  }

  // 날짜 형식
  return formatDate(target);
}

/**
 * 두 날짜가 같은 날인지 확인
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 주어진 날짜가 오늘인지 확인
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return isSameDay(today, date);
}

/**
 * 주어진 날짜가 어제인지 확인
 */
export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(yesterday, date);
}

/**
 * 날짜를 "YYYY년 M월 D일" 형식으로 포맷
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 올해인 경우 년도 생략
  const now = new Date();
  if (year === now.getFullYear()) {
    return `${month}월 ${day}일`;
  }

  return `${year}년 ${month}월 ${day}일`;
}

/**
 * 시간을 "HH:mm" 형식으로 포맷
 */
export function formatTime(date: Date | string): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  const hours = target.getHours().toString().padStart(2, '0');
  const minutes = target.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
