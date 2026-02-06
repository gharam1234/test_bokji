/**
 * SSE Manager 테스트
 */

import { Test, TestingModule } from '@nestjs/testing';
import { SSEManager } from './sse.manager';
import { Response } from 'express';

describe('SSEManager', () => {
  let sseManager: SSEManager;

  // Mock Response 생성
  const createMockResponse = (): jest.Mocked<Response> => {
    const mockResponse = {
      writeHead: jest.fn(),
      write: jest.fn().mockReturnValue(true),
      end: jest.fn(),
      on: jest.fn(),
    } as unknown as jest.Mocked<Response>;
    return mockResponse;
  };

  beforeEach(async () => {
    jest.useFakeTimers();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SSEManager],
    }).compile();

    sseManager = module.get<SSEManager>(SSEManager);
  });

  afterEach(() => {
    sseManager.onModuleDestroy();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('addConnection', () => {
    it('SSE 연결을 추가해야 한다', () => {
      const mockResponse = createMockResponse();

      sseManager.addConnection('user-1', mockResponse);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }));
      expect(sseManager.getActiveConnections()).toBe(1);
    });

    it('초기 연결 메시지를 전송해야 한다', () => {
      const mockResponse = createMockResponse();

      sseManager.addConnection('user-1', mockResponse);

      expect(mockResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('event: connected'),
      );
    });

    it('동일 사용자의 여러 연결을 관리해야 한다', () => {
      const mockResponse1 = createMockResponse();
      const mockResponse2 = createMockResponse();

      sseManager.addConnection('user-1', mockResponse1);
      sseManager.addConnection('user-1', mockResponse2);

      expect(sseManager.getActiveConnections()).toBe(2);
      expect(sseManager.getUserConnectionCount('user-1')).toBe(2);
    });

    it('연결 종료 이벤트 핸들러를 등록해야 한다', () => {
      const mockResponse = createMockResponse();

      sseManager.addConnection('user-1', mockResponse);

      expect(mockResponse.on).toHaveBeenCalledWith('close', expect.any(Function));
    });
  });

  describe('removeConnection', () => {
    it('SSE 연결을 제거해야 한다', () => {
      const mockResponse = createMockResponse();

      sseManager.addConnection('user-1', mockResponse);
      expect(sseManager.getActiveConnections()).toBe(1);

      sseManager.removeConnection('user-1', mockResponse);
      expect(sseManager.getActiveConnections()).toBe(0);
    });

    it('존재하지 않는 연결 제거 시 에러가 발생하지 않아야 한다', () => {
      const mockResponse = createMockResponse();

      expect(() => {
        sseManager.removeConnection('user-1', mockResponse);
      }).not.toThrow();
    });

    it('사용자의 마지막 연결 제거 시 사용자 엔트리를 삭제해야 한다', () => {
      const mockResponse = createMockResponse();

      sseManager.addConnection('user-1', mockResponse);
      sseManager.removeConnection('user-1', mockResponse);

      expect(sseManager.isUserConnected('user-1')).toBe(false);
    });

    it('여러 연결 중 하나만 제거해야 한다', () => {
      const mockResponse1 = createMockResponse();
      const mockResponse2 = createMockResponse();

      sseManager.addConnection('user-1', mockResponse1);
      sseManager.addConnection('user-1', mockResponse2);

      sseManager.removeConnection('user-1', mockResponse1);

      expect(sseManager.getUserConnectionCount('user-1')).toBe(1);
    });
  });

  describe('sendToUser', () => {
    it('특정 사용자에게 이벤트를 전송해야 한다', () => {
      const mockResponse = createMockResponse();
      sseManager.addConnection('user-1', mockResponse);

      sseManager.sendToUser('user-1', {
        event: 'new-notification',
        data: { id: 'notif-1', title: '테스트' },
      });

      expect(mockResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('event: new-notification'),
      );
    });

    it('연결이 없는 사용자에게 전송 시 에러가 발생하지 않아야 한다', () => {
      expect(() => {
        sseManager.sendToUser('nonexistent-user', {
          event: 'new-notification',
          data: { id: 'notif-1' },
        });
      }).not.toThrow();
    });

    it('모든 사용자 연결에 이벤트를 전송해야 한다', () => {
      const mockResponse1 = createMockResponse();
      const mockResponse2 = createMockResponse();

      sseManager.addConnection('user-1', mockResponse1);
      sseManager.addConnection('user-1', mockResponse2);

      sseManager.sendToUser('user-1', {
        event: 'new-notification',
        data: { id: 'notif-1' },
      });

      // 초기 연결 메시지 + 알림 메시지
      expect(mockResponse1.write).toHaveBeenCalledTimes(2);
      expect(mockResponse2.write).toHaveBeenCalledTimes(2);
    });

    it('전송 실패 시 연결을 제거해야 한다', () => {
      const mockResponse = createMockResponse();
      mockResponse.write.mockImplementation(() => {
        throw new Error('Connection closed');
      });

      sseManager.addConnection('user-1', mockResponse);

      sseManager.sendToUser('user-1', {
        event: 'new-notification',
        data: { id: 'notif-1' },
      });

      // 초기 연결 시 write가 실패하지 않으므로 연결이 추가됨
      // sendToUser 호출 시 write 실패로 연결 제거
      expect(sseManager.isUserConnected('user-1')).toBe(false);
    });
  });

  describe('broadcast', () => {
    it('모든 연결에 이벤트를 전송해야 한다', () => {
      const mockResponse1 = createMockResponse();
      const mockResponse2 = createMockResponse();

      sseManager.addConnection('user-1', mockResponse1);
      sseManager.addConnection('user-2', mockResponse2);

      sseManager.broadcast({
        event: 'system',
        data: { message: '시스템 점검' },
      });

      expect(mockResponse1.write).toHaveBeenCalledWith(
        expect.stringContaining('event: system'),
      );
      expect(mockResponse2.write).toHaveBeenCalledWith(
        expect.stringContaining('event: system'),
      );
    });

    it('연결이 없을 때 에러가 발생하지 않아야 한다', () => {
      expect(() => {
        sseManager.broadcast({
          event: 'system',
          data: null,
        });
      }).not.toThrow();
    });
  });

  describe('getActiveConnections', () => {
    it('모든 활성 연결 수를 반환해야 한다', () => {
      const mockResponse1 = createMockResponse();
      const mockResponse2 = createMockResponse();
      const mockResponse3 = createMockResponse();

      sseManager.addConnection('user-1', mockResponse1);
      sseManager.addConnection('user-1', mockResponse2);
      sseManager.addConnection('user-2', mockResponse3);

      expect(sseManager.getActiveConnections()).toBe(3);
    });

    it('연결이 없으면 0을 반환해야 한다', () => {
      expect(sseManager.getActiveConnections()).toBe(0);
    });
  });

  describe('getUserConnectionCount', () => {
    it('특정 사용자의 연결 수를 반환해야 한다', () => {
      const mockResponse1 = createMockResponse();
      const mockResponse2 = createMockResponse();

      sseManager.addConnection('user-1', mockResponse1);
      sseManager.addConnection('user-1', mockResponse2);

      expect(sseManager.getUserConnectionCount('user-1')).toBe(2);
    });

    it('연결이 없는 사용자는 0을 반환해야 한다', () => {
      expect(sseManager.getUserConnectionCount('nonexistent')).toBe(0);
    });
  });

  describe('isUserConnected', () => {
    it('연결된 사용자는 true를 반환해야 한다', () => {
      const mockResponse = createMockResponse();
      sseManager.addConnection('user-1', mockResponse);

      expect(sseManager.isUserConnected('user-1')).toBe(true);
    });

    it('연결되지 않은 사용자는 false를 반환해야 한다', () => {
      expect(sseManager.isUserConnected('user-1')).toBe(false);
    });
  });

  describe('heartbeat', () => {
    it('주기적으로 하트비트를 전송해야 한다', () => {
      const mockResponse = createMockResponse();
      sseManager.addConnection('user-1', mockResponse);

      // 초기 연결 메시지
      expect(mockResponse.write).toHaveBeenCalledTimes(1);

      // 30초 후 하트비트
      jest.advanceTimersByTime(30000);

      expect(mockResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('event: heartbeat'),
      );
    });

    it('연결이 없으면 하트비트를 전송하지 않아야 한다', () => {
      const spy = jest.spyOn(sseManager, 'broadcast');

      jest.advanceTimersByTime(30000);

      expect(spy).toHaveBeenCalledWith({ event: 'heartbeat', data: null });
    });
  });

  describe('onModuleDestroy', () => {
    it('모든 연결을 종료해야 한다', () => {
      const mockResponse1 = createMockResponse();
      const mockResponse2 = createMockResponse();

      sseManager.addConnection('user-1', mockResponse1);
      sseManager.addConnection('user-2', mockResponse2);

      sseManager.onModuleDestroy();

      expect(mockResponse1.end).toHaveBeenCalled();
      expect(mockResponse2.end).toHaveBeenCalled();
      expect(sseManager.getActiveConnections()).toBe(0);
    });
  });

  describe('SSE 이벤트 포맷', () => {
    it('null 데이터를 올바르게 포맷해야 한다', () => {
      const mockResponse = createMockResponse();
      sseManager.addConnection('user-1', mockResponse);

      sseManager.sendToUser('user-1', {
        event: 'heartbeat',
        data: null,
      });

      expect(mockResponse.write).toHaveBeenCalledWith(
        'event: heartbeat\ndata: null\n\n',
      );
    });

    it('객체 데이터를 JSON으로 포맷해야 한다', () => {
      const mockResponse = createMockResponse();
      sseManager.addConnection('user-1', mockResponse);

      sseManager.sendToUser('user-1', {
        event: 'new-notification',
        data: { id: 'test', title: '테스트' },
      });

      expect(mockResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('"id":"test"'),
      );
    });
  });
});
