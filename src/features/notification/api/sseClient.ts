/**
 * SSE 클라이언트
 * Server-Sent Events를 통한 실시간 알림 수신
 */

import { NotificationItem, SSEEventType } from '../types/notification.types';
import { API_BASE_URL, SSE_RECONNECT_INTERVAL } from '../constants/notification.constants';

/**
 * SSE 이벤트 핸들러 타입
 */
export type SSEEventHandler = (data: NotificationItem | null) => void;

/**
 * SSE 연결 상태
 */
export type SSEConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * SSE 상태 변경 핸들러
 */
export type SSEStateChangeHandler = (state: SSEConnectionState) => void;

/**
 * SSE 클라이언트 옵션
 */
export interface SSEClientOptions {
  /** 새 알림 수신 핸들러 */
  onNotification?: SSEEventHandler;
  /** 연결 상태 변경 핸들러 */
  onStateChange?: SSEStateChangeHandler;
  /** 에러 핸들러 */
  onError?: (error: Error) => void;
  /** 자동 재연결 여부 */
  autoReconnect?: boolean;
  /** 재연결 간격 (밀리초) */
  reconnectInterval?: number;
}

/**
 * SSE 클라이언트 클래스
 */
export class SSEClient {
  private eventSource: EventSource | null = null;
  private options: SSEClientOptions;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private state: SSEConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;

  constructor(options: SSEClientOptions = {}) {
    this.options = {
      autoReconnect: true,
      reconnectInterval: SSE_RECONNECT_INTERVAL,
      ...options,
    };
  }

  /**
   * SSE 연결 시작
   */
  connect(): void {
    if (this.eventSource) {
      this.closeConnection();
    }

    this.setState('connecting');

    const url = `${API_BASE_URL}/stream`;
    
    try {
      this.eventSource = new EventSource(url, { withCredentials: true });
      this.setupEventListeners();
    } catch (error) {
      this.setState('error');
      this.options.onError?.(error as Error);
      this.scheduleReconnect();
    }
  }

  /**
   * SSE 연결 종료 (내부용 - reconnectAttempts 유지)
   */
  private closeConnection(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * SSE 연결 종료
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.closeConnection();

    this.setState('disconnected');
    this.reconnectAttempts = 0;
  }

  /**
   * 연결 상태 조회
   */
  getState(): SSEConnectionState {
    return this.state;
  }

  /**
   * 연결 여부 확인
   */
  isConnected(): boolean {
    return this.state === 'connected';
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    if (!this.eventSource) return;

    // 연결 성공
    this.eventSource.addEventListener('connected', (event) => {
      this.setState('connected');
      this.reconnectAttempts = 0;
      console.log('SSE connected:', event.data);
    });

    // 새 알림 수신
    this.eventSource.addEventListener('new-notification', (event) => {
      try {
        const data = JSON.parse(event.data) as NotificationItem;
        this.options.onNotification?.(data);
      } catch (error) {
        console.error('Failed to parse notification data:', error);
      }
    });

    // 하트비트
    this.eventSource.addEventListener('heartbeat', () => {
      // 연결 유지 확인
      console.debug('SSE heartbeat received');
    });

    // 연결 열림
    this.eventSource.onopen = () => {
      this.setState('connected');
      this.reconnectAttempts = 0;
    };

    // 에러 처리
    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      this.setState('error');
      this.options.onError?.(new Error('SSE connection error'));

      // 자동 재연결
      if (this.options.autoReconnect) {
        this.scheduleReconnect();
      }
    };
  }

  /**
   * 재연결 예약
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      this.setState('disconnected');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.options.reconnectInterval! * Math.min(this.reconnectAttempts, 5);

    console.log(`Scheduling SSE reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  /**
   * 상태 변경
   */
  private setState(state: SSEConnectionState): void {
    if (this.state !== state) {
      this.state = state;
      this.options.onStateChange?.(state);
    }
  }
}

/**
 * 기본 SSE 클라이언트 인스턴스 생성 함수
 */
export function createSSEClient(options?: SSEClientOptions): SSEClient {
  return new SSEClient(options);
}

/**
 * 단일 SSE 클라이언트 인스턴스 (싱글톤)
 */
let sseClientInstance: SSEClient | null = null;

/**
 * 싱글톤 SSE 클라이언트 가져오기
 */
export function getSSEClient(options?: SSEClientOptions): SSEClient {
  if (!sseClientInstance) {
    sseClientInstance = new SSEClient(options);
  }
  return sseClientInstance;
}

/**
 * 싱글톤 SSE 클라이언트 초기화
 */
export function resetSSEClient(): void {
  if (sseClientInstance) {
    sseClientInstance.disconnect();
    sseClientInstance = null;
  }
}
