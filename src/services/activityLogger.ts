/**
 * Activity Logger Service
 * 사용자 활동 로그를 서버에 전송하는 클라이언트 서비스
 */

import { ActivityType, ActivityMetadata } from '../features/analytics/types';

// API 기본 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * 활동 로그 생성 요청 타입
 */
interface LogActivityRequest {
  activityType: ActivityType;
  targetId?: string;
  targetCategory?: string;
  metadata?: ActivityMetadata;
}

/**
 * 활동 로그 서비스 클래스
 * 싱글톤 패턴으로 구현
 */
class ActivityLoggerService {
  private static instance: ActivityLoggerService;
  private queue: LogActivityRequest[] = [];
  private isProcessing: boolean = false;
  private batchSize: number = 10;
  private flushInterval: number = 5000; // 5초
  private flushTimer: NodeJS.Timeout | null = null;
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.startFlushTimer();

    // 페이지 언로드시 남은 로그 전송
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush(true);
      });
    }
  }

  /**
   * 싱글톤 인스턴스 가져오기
   */
  public static getInstance(): ActivityLoggerService {
    if (!ActivityLoggerService.instance) {
      ActivityLoggerService.instance = new ActivityLoggerService();
    }
    return ActivityLoggerService.instance;
  }

  /**
   * 세션 ID 생성
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 주기적 flush 타이머 시작
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * 검색 활동 로그
   */
  public logSearch(query: string, filters?: Record<string, string>): void {
    this.log({
      activityType: ActivityType.SEARCH,
      metadata: {
        searchQuery: query,
        filters,
        sessionId: this.sessionId,
      },
    });
  }

  /**
   * 복지 상세 조회 활동 로그
   */
  public logView(
    programId: string,
    category: string,
    source?: 'search' | 'recommendation' | 'direct',
  ): void {
    this.log({
      activityType: ActivityType.VIEW,
      targetId: programId,
      targetCategory: category,
      metadata: {
        source: source || 'direct',
        sessionId: this.sessionId,
      },
    });
  }

  /**
   * 즐겨찾기 추가 활동 로그
   */
  public logBookmark(programId: string, category: string): void {
    this.log({
      activityType: ActivityType.BOOKMARK,
      targetId: programId,
      targetCategory: category,
      metadata: {
        sessionId: this.sessionId,
      },
    });
  }

  /**
   * 즐겨찾기 제거 활동 로그
   */
  public logUnbookmark(programId: string, category: string): void {
    this.log({
      activityType: ActivityType.UNBOOKMARK,
      targetId: programId,
      targetCategory: category,
      metadata: {
        sessionId: this.sessionId,
      },
    });
  }

  /**
   * 추천 목록 조회 활동 로그
   */
  public logRecommendationView(): void {
    this.log({
      activityType: ActivityType.RECOMMENDATION_VIEW,
      metadata: {
        sessionId: this.sessionId,
      },
    });
  }

  /**
   * 추천 복지 클릭 활동 로그
   */
  public logRecommendationClick(programId: string, category: string): void {
    this.log({
      activityType: ActivityType.RECOMMENDATION_CLICK,
      targetId: programId,
      targetCategory: category,
      metadata: {
        source: 'recommendation',
        sessionId: this.sessionId,
      },
    });
  }

  /**
   * 일반 활동 로그 (큐에 추가)
   */
  private log(request: LogActivityRequest): void {
    this.queue.push(request);

    // 배치 크기에 도달하면 즉시 flush
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * 큐에 있는 로그 전송
   */
  public async flush(sync: boolean = false): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    // 현재 큐 복사 후 비우기
    const logs = [...this.queue];
    this.queue = [];

    try {
      if (sync && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        // 동기 전송 (페이지 언로드시)
        const blob = new Blob([JSON.stringify({ logs })], {
          type: 'application/json',
        });
        navigator.sendBeacon(`${API_BASE_URL}/analytics/logs/batch`, blob);
      } else {
        // 비동기 전송
        await this.sendLogs(logs);
      }
    } catch (error) {
      // 실패한 로그는 다시 큐에 추가 (재시도)
      console.error('Failed to send activity logs:', error);
      this.queue = [...logs, ...this.queue];
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 로그 배치 전송
   */
  private async sendLogs(logs: LogActivityRequest[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/analytics/logs/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ logs }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send logs: ${response.status}`);
    }
  }

  /**
   * 현재 큐 크기 확인
   */
  public getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * 세션 ID 가져오기
   */
  public getSessionId(): string {
    return this.sessionId;
  }
}

// 싱글톤 인스턴스 내보내기
export const activityLogger = ActivityLoggerService.getInstance();

// 편의 함수 내보내기
export const logSearch = activityLogger.logSearch.bind(activityLogger);
export const logView = activityLogger.logView.bind(activityLogger);
export const logBookmark = activityLogger.logBookmark.bind(activityLogger);
export const logUnbookmark = activityLogger.logUnbookmark.bind(activityLogger);
export const logRecommendationView = activityLogger.logRecommendationView.bind(activityLogger);
export const logRecommendationClick = activityLogger.logRecommendationClick.bind(activityLogger);

export default activityLogger;
