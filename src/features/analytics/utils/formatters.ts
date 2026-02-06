/**
 * 포맷터 유틸리티
 * 숫자, 퍼센트 등 값 포맷팅 함수
 */

/**
 * 숫자를 한국어 형식으로 포맷팅 (천 단위 콤마)
 * @param value 숫자
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('ko-KR');
}

/**
 * 퍼센트 포맷팅
 * @param value 값 (0-100)
 * @param decimals 소수점 자릿수
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * 변화율 포맷팅 (+ 또는 - 기호 포함)
 * @param value 변화율 (퍼센트)
 * @param decimals 소수점 자릿수
 */
export function formatChangeRate(value: number, decimals: number = 1): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * 큰 숫자 축약 (1K, 1M 등)
 * @param value 숫자
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * 순위 포맷팅 (1st, 2nd, 3rd, 4th...)
 * @param rank 순위
 * @param locale 로케일 (ko: 한국어)
 */
export function formatRank(rank: number, locale: 'ko' | 'en' = 'ko'): string {
  if (locale === 'ko') {
    return `${rank}위`;
  }

  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = rank % 100;
  return rank + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

/**
 * 시간 포맷팅 (분, 시간, 일)
 * @param minutes 분
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}분`;
  }
  if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  }
  const days = Math.floor(minutes / 1440);
  return `${days}일`;
}

/**
 * 바이트 포맷팅
 * @param bytes 바이트
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 날짜 포맷팅 (YYYY년 MM월 DD일)
 * @param date Date 객체
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * 짧은 날짜 포맷팅 (MM/DD)
 * @param date Date 객체
 */
export function formatShortDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

/**
 * 날짜 문자열 포맷팅
 * @param dateString YYYY-MM-DD 형식 문자열
 */
export function formatDateString(dateString: string): string {
  const date = new Date(dateString);
  return formatDate(date);
}
