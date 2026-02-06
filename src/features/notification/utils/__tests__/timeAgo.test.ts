import '@testing-library/jest-dom';
import {
  formatTimeAgo,
  formatDateLabel,
  isToday,
  isYesterday,
  isSameDay,
} from '../timeAgo';

describe('timeAgo utils', () => {
  describe('formatTimeAgo', () => {
    it('방금 전 (1분 미만)을 표시해야 한다', () => {
      const now = new Date();
      const result = formatTimeAgo(now);
      expect(result).toBe('방금 전');
    });

    it('N분 전을 표시해야 한다', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000);
      const result = formatTimeAgo(date);
      expect(result).toBe('5분 전');
    });

    it('N시간 전을 표시해야 한다', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const result = formatTimeAgo(date);
      expect(result).toBe('3시간 전');
    });

    it('N일 전을 표시해야 한다', () => {
      const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const result = formatTimeAgo(date);
      expect(result).toBe('2일 전');
    });

    it('N주 전을 표시해야 한다', () => {
      const date = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const result = formatTimeAgo(date);
      expect(result).toBe('2주 전');
    });

    it('N개월 전을 표시해야 한다', () => {
      const date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const result = formatTimeAgo(date);
      expect(result).toBe('2개월 전');
    });

    it('N년 전을 표시해야 한다', () => {
      const date = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);
      const result = formatTimeAgo(date);
      expect(result).toBe('1년 전');
    });

    it('문자열 날짜를 처리해야 한다', () => {
      const dateString = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const result = formatTimeAgo(dateString);
      expect(result).toBe('10분 전');
    });
  });

  describe('formatDateLabel', () => {
    it('오늘을 표시해야 한다', () => {
      const today = new Date();
      const result = formatDateLabel(today);
      expect(result).toBe('오늘');
    });

    it('어제를 표시해야 한다', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = formatDateLabel(yesterday);
      expect(result).toBe('어제');
    });

    it('날짜를 포맷해야 한다', () => {
      const date = new Date('2024-01-15');
      const result = formatDateLabel(date);
      expect(result).toBe('2024년 1월 15일');
    });
  });

  describe('isToday', () => {
    it('오늘 날짜면 true를 반환해야 한다', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('어제 날짜면 false를 반환해야 한다', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('isYesterday', () => {
    it('어제 날짜면 true를 반환해야 한다', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isYesterday(yesterday)).toBe(true);
    });

    it('오늘 날짜면 false를 반환해야 한다', () => {
      const today = new Date();
      expect(isYesterday(today)).toBe(false);
    });
  });

  describe('isSameDay', () => {
    it('같은 날이면 true를 반환해야 한다', () => {
      const date1 = new Date('2024-01-15T10:00:00');
      const date2 = new Date('2024-01-15T18:00:00');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('다른 날이면 false를 반환해야 한다', () => {
      const date1 = new Date('2024-01-15T10:00:00');
      const date2 = new Date('2024-01-16T10:00:00');
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });
});
