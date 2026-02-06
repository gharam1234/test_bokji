/**
 * SSE 클라이언트 테스트
 */

import '@testing-library/jest-dom';
import {
  SSEClient,
  createSSEClient,
  getSSEClient,
  resetSSEClient,
  SSEConnectionState,
} from '../sseClient';
import { NotificationType } from '../../types/notification.types';

// EventSource 모킹
class MockEventSource {
  static instances: MockEventSource[] = [];
  
  url: string;
  readyState: number = 0;
  onopen: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  
  private listeners: Map<string, ((event: MessageEvent) => void)[]> = new Map();

  constructor(url: string, _options?: EventSourceInit) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  removeEventListener(type: string, listener: (event: MessageEvent) => void): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  dispatchEvent(event: Event): boolean {
    return true;
  }

  close(): void {
    this.readyState = 2;
  }

  // 테스트용 헬퍼 메서드
  simulateOpen(): void {
    this.readyState = 1;
    if (this.onopen) {
      this.onopen(new Event('open'));
    }
    const listeners = this.listeners.get('connected');
    if (listeners) {
      listeners.forEach((listener) =>
        listener(new MessageEvent('connected', { data: 'connected' })),
      );
    }
  }

  simulateError(): void {
    this.readyState = 2;
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }

  simulateMessage(type: string, data: any): void {
    const event = new MessageEvent(type, {
      data: typeof data === 'string' ? data : JSON.stringify(data),
    });
    
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }
  }

  static clearInstances(): void {
    MockEventSource.instances = [];
  }

  static getLastInstance(): MockEventSource | undefined {
    return MockEventSource.instances[MockEventSource.instances.length - 1];
  }
}

// 전역 EventSource 모킹
(global as any).EventSource = MockEventSource;

// 콘솔 출력 모킹
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('SSEClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockEventSource.clearInstances();
    resetSSEClient();
    // 테스트 중 콘솔 출력 억제
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    resetSSEClient();
    // 콘솔 복원
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('connect', () => {
    it('SSE 연결을 시작해야 한다', () => {
      const client = new SSEClient();
      client.connect();

      expect(MockEventSource.getLastInstance()).toBeDefined();
      expect(MockEventSource.getLastInstance()?.url).toContain('/stream');
    });

    it('연결 성공 시 connected 상태가 되어야 한다', () => {
      const onStateChange = jest.fn();
      const client = new SSEClient({ onStateChange });

      client.connect();
      MockEventSource.getLastInstance()?.simulateOpen();

      expect(client.getState()).toBe('connected');
      expect(client.isConnected()).toBe(true);
      expect(onStateChange).toHaveBeenCalledWith('connected');
    });

    it('연결 전 상태는 connecting이어야 한다', () => {
      const onStateChange = jest.fn();
      const client = new SSEClient({ onStateChange });

      client.connect();

      expect(onStateChange).toHaveBeenCalledWith('connecting');
    });

    it('이미 연결된 상태에서 connect 호출 시 기존 연결을 닫아야 한다', () => {
      const client = new SSEClient();

      client.connect();
      const firstInstance = MockEventSource.getLastInstance();

      client.connect();
      const secondInstance = MockEventSource.getLastInstance();

      expect(firstInstance?.readyState).toBe(2); // CLOSED
      expect(secondInstance).not.toBe(firstInstance);
    });
  });

  describe('disconnect', () => {
    it('SSE 연결을 종료해야 한다', () => {
      const client = new SSEClient();

      client.connect();
      const instance = MockEventSource.getLastInstance();

      client.disconnect();

      expect(instance?.readyState).toBe(2);
      expect(client.getState()).toBe('disconnected');
    });

    it('연결되지 않은 상태에서 disconnect 호출해도 에러가 발생하지 않아야 한다', () => {
      const client = new SSEClient();

      expect(() => client.disconnect()).not.toThrow();
    });

    it('재연결 타이머를 취소해야 한다', () => {
      jest.useFakeTimers();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const client = new SSEClient({ autoReconnect: true, reconnectInterval: 1000 });

      client.connect();
      MockEventSource.getLastInstance()?.simulateError();

      client.disconnect();

      // 재연결이 발생하지 않아야 함
      jest.advanceTimersByTime(10000);
      expect(MockEventSource.instances.length).toBe(1);

      consoleErrorSpy.mockRestore();
      consoleLogSpy.mockRestore();
      jest.useRealTimers();
    });
  });

  describe('이벤트 수신', () => {
    it('새 알림 이벤트를 수신해야 한다', () => {
      const onNotification = jest.fn();
      const client = new SSEClient({ onNotification });

      client.connect();
      MockEventSource.getLastInstance()?.simulateOpen();

      const mockNotification = {
        id: 'notif-1',
        type: NotificationType.NEW_WELFARE,
        title: '새 알림',
        message: '테스트 메시지',
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      MockEventSource.getLastInstance()?.simulateMessage(
        'new-notification',
        mockNotification,
      );

      expect(onNotification).toHaveBeenCalledWith(mockNotification);
    });

    it('하트비트 이벤트를 수신해야 한다', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
      const client = new SSEClient();

      client.connect();
      MockEventSource.getLastInstance()?.simulateOpen();

      MockEventSource.getLastInstance()?.simulateMessage('heartbeat', null);

      expect(consoleSpy).toHaveBeenCalledWith('SSE heartbeat received');
      consoleSpy.mockRestore();
    });

    it('잘못된 JSON 데이터를 안전하게 처리해야 한다', () => {
      const onNotification = jest.fn();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const client = new SSEClient({ onNotification });

      client.connect();
      MockEventSource.getLastInstance()?.simulateOpen();

      // 직접 listeners를 호출하여 잘못된 JSON 전달
      const instance = MockEventSource.getLastInstance();
      const listeners = (instance as any).listeners.get('new-notification');
      if (listeners) {
        listeners.forEach((listener: any) =>
          listener(new MessageEvent('new-notification', { data: 'invalid json' })),
        );
      }

      expect(onNotification).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('에러 처리', () => {
    let consoleErrorSpy: jest.SpyInstance;
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('연결 에러 시 error 상태가 되어야 한다', () => {
      const onError = jest.fn();
      const client = new SSEClient({ onError, autoReconnect: false });

      client.connect();
      MockEventSource.getLastInstance()?.simulateError();

      expect(client.getState()).toBe('error');
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('에러 메시지가 올바라야 한다', () => {
      const onError = jest.fn();
      const client = new SSEClient({ onError, autoReconnect: false });

      client.connect();
      MockEventSource.getLastInstance()?.simulateError();

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'SSE connection error' }),
      );
    });
  });

  describe('자동 재연결', () => {
    let consoleErrorSpy: jest.SpyInstance;
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.useFakeTimers();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.useRealTimers();
      consoleErrorSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('autoReconnect가 활성화되면 에러 시 재연결해야 한다', () => {
      const client = new SSEClient({
        autoReconnect: true,
        reconnectInterval: 1000,
      });

      client.connect();
      expect(MockEventSource.instances.length).toBe(1);

      MockEventSource.getLastInstance()?.simulateError();

      // 재연결 대기
      jest.advanceTimersByTime(1000);

      expect(MockEventSource.instances.length).toBe(2);
    });

    it('재연결 시도 횟수에 따라 지연 시간이 증가해야 한다', () => {
      const client = new SSEClient({
        autoReconnect: true,
        reconnectInterval: 1000,
      });

      client.connect();
      expect(MockEventSource.instances.length).toBe(1);
      
      // 첫 번째 에러 후 재연결 스케줄 (1000ms * 1 = 1000ms)
      MockEventSource.getLastInstance()?.simulateError();
      jest.advanceTimersByTime(999);
      expect(MockEventSource.instances.length).toBe(1); // 아직 재연결 안됨
      jest.advanceTimersByTime(1);
      expect(MockEventSource.instances.length).toBe(2); // 재연결됨
      
      // 두 번째 에러 후 재연결 스케줄 (1000ms * 2 = 2000ms)
      MockEventSource.getLastInstance()?.simulateError();
      jest.advanceTimersByTime(1999);
      expect(MockEventSource.instances.length).toBe(2); // 아직 재연결 안됨
      jest.advanceTimersByTime(1);
      expect(MockEventSource.instances.length).toBe(3); // 재연결됨
    });

    it('최대 재연결 시도 횟수를 초과하면 재연결을 중단해야 한다', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const client = new SSEClient({
        autoReconnect: true,
        reconnectInterval: 100,
      });

      client.connect();
      const initialCount = MockEventSource.instances.length;

      // 최대 10번 재연결 시도
      for (let i = 0; i < 15; i++) {
        MockEventSource.getLastInstance()?.simulateError();
        jest.advanceTimersByTime(10000);
      }

      // 최대 재연결 횟수(10) + 초기 연결(1)을 초과하지 않아야 함
      expect(MockEventSource.instances.length).toBeLessThanOrEqual(initialCount + 10);
      expect(consoleSpy).toHaveBeenCalledWith('Max reconnect attempts reached');
      consoleSpy.mockRestore();
    });

    it('연결 성공 시 재연결 시도 횟수가 초기화되어야 한다', () => {
      const client = new SSEClient({
        autoReconnect: true,
        reconnectInterval: 1000,
      });

      client.connect();
      MockEventSource.getLastInstance()?.simulateError();

      jest.advanceTimersByTime(1000);
      MockEventSource.getLastInstance()?.simulateOpen();

      // 재연결 횟수 초기화됨
      MockEventSource.getLastInstance()?.simulateError();

      // 다시 1000ms 후 재연결 (초기화되었으므로)
      jest.advanceTimersByTime(1000);
      expect(MockEventSource.instances.length).toBe(3);
    });

    it('autoReconnect가 비활성화되면 재연결하지 않아야 한다', () => {
      const client = new SSEClient({
        autoReconnect: false,
      });

      client.connect();
      MockEventSource.getLastInstance()?.simulateError();

      jest.advanceTimersByTime(10000);

      expect(MockEventSource.instances.length).toBe(1);
    });
  });

  describe('상태 확인', () => {
    it('getState가 현재 상태를 반환해야 한다', () => {
      const client = new SSEClient();

      expect(client.getState()).toBe('disconnected');

      client.connect();
      expect(client.getState()).toBe('connecting');

      MockEventSource.getLastInstance()?.simulateOpen();
      expect(client.getState()).toBe('connected');

      client.disconnect();
      expect(client.getState()).toBe('disconnected');
    });

    it('isConnected가 연결 여부를 반환해야 한다', () => {
      const client = new SSEClient();

      expect(client.isConnected()).toBe(false);

      client.connect();
      expect(client.isConnected()).toBe(false);

      MockEventSource.getLastInstance()?.simulateOpen();
      expect(client.isConnected()).toBe(true);

      client.disconnect();
      expect(client.isConnected()).toBe(false);
    });
  });
});

describe('createSSEClient', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('새 SSEClient 인스턴스를 생성해야 한다', () => {
    const client = createSSEClient();
    expect(client).toBeInstanceOf(SSEClient);
  });

  it('옵션을 전달할 수 있어야 한다', () => {
    const onNotification = jest.fn();
    const client = createSSEClient({ onNotification });

    client.connect();
    MockEventSource.getLastInstance()?.simulateOpen();

    MockEventSource.getLastInstance()?.simulateMessage('new-notification', {
      id: 'test',
    });

    expect(onNotification).toHaveBeenCalled();
  });
});

describe('getSSEClient (싱글톤)', () => {
  beforeEach(() => {
    resetSSEClient();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('동일한 인스턴스를 반환해야 한다', () => {
    const client1 = getSSEClient();
    const client2 = getSSEClient();

    expect(client1).toBe(client2);
  });

  it('첫 호출 시 새 인스턴스를 생성해야 한다', () => {
    const client = getSSEClient();
    expect(client).toBeInstanceOf(SSEClient);
  });
});

describe('resetSSEClient', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('싱글톤 인스턴스를 초기화해야 한다', () => {
    const client1 = getSSEClient();
    resetSSEClient();
    const client2 = getSSEClient();

    expect(client1).not.toBe(client2);
  });

  it('연결을 종료해야 한다', () => {
    const client = getSSEClient();
    client.connect();
    MockEventSource.getLastInstance()?.simulateOpen();

    expect(client.isConnected()).toBe(true);

    resetSSEClient();

    expect(MockEventSource.getLastInstance()?.readyState).toBe(2);
  });
});
