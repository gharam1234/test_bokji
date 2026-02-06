/**
 * SSE (Server-Sent Events) 관리자
 * 실시간 알림을 위한 SSE 연결 관리
 */

import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ISSEManager, SSENotificationEvent } from '../interfaces/dispatcher.interface';
import { SSE_HEARTBEAT_INTERVAL } from '../constants/notification.constants';

/**
 * SSE 연결 정보
 */
interface SSEConnection {
  response: Response;
  userId: string;
  connectedAt: Date;
}

@Injectable()
export class SSEManager implements ISSEManager {
  private readonly logger = new Logger(SSEManager.name);
  
  /** 사용자별 SSE 연결 목록 */
  private connections: Map<string, Set<Response>> = new Map();
  
  /** 하트비트 인터벌 */
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    // 하트비트 시작
    this.startHeartbeat();
  }

  /**
   * SSE 연결 추가
   */
  addConnection(userId: string, response: Response): void {
    // SSE 헤더 설정
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no', // Nginx 버퍼링 비활성화
    });

    // 초기 연결 메시지
    response.write(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`);

    // 연결 저장
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(response);

    this.logger.log(`SSE connection added for user ${userId}. Total connections: ${this.getActiveConnections()}`);

    // 연결 종료 시 정리
    response.on('close', () => {
      this.removeConnection(userId, response);
    });
  }

  /**
   * SSE 연결 제거
   */
  removeConnection(userId: string, response: Response): void {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(response);
      if (userConnections.size === 0) {
        this.connections.delete(userId);
      }
    }

    this.logger.log(`SSE connection removed for user ${userId}. Total connections: ${this.getActiveConnections()}`);
  }

  /**
   * 특정 사용자에게 이벤트 전송
   */
  sendToUser(userId: string, event: SSENotificationEvent): void {
    const userConnections = this.connections.get(userId);
    if (!userConnections || userConnections.size === 0) {
      this.logger.debug(`No active connections for user ${userId}`);
      return;
    }

    const eventData = this.formatSSEEvent(event);

    userConnections.forEach((response) => {
      try {
        response.write(eventData);
      } catch (error) {
        this.logger.error(`Failed to send event to user ${userId}:`, error);
        this.removeConnection(userId, response);
      }
    });

    this.logger.debug(`Sent event to user ${userId}: ${event.event}`);
  }

  /**
   * 모든 연결에 이벤트 전송 (브로드캐스트)
   */
  broadcast(event: SSENotificationEvent): void {
    const eventData = this.formatSSEEvent(event);

    this.connections.forEach((userConnections, userId) => {
      userConnections.forEach((response) => {
        try {
          response.write(eventData);
        } catch (error) {
          this.logger.error(`Failed to broadcast to user ${userId}:`, error);
          this.removeConnection(userId, response);
        }
      });
    });

    this.logger.debug(`Broadcast event: ${event.event} to ${this.getActiveConnections()} connections`);
  }

  /**
   * 활성 연결 수 조회
   */
  getActiveConnections(): number {
    let total = 0;
    this.connections.forEach((userConnections) => {
      total += userConnections.size;
    });
    return total;
  }

  /**
   * 특정 사용자의 활성 연결 수 조회
   */
  getUserConnectionCount(userId: string): number {
    return this.connections.get(userId)?.size || 0;
  }

  /**
   * 사용자가 연결되어 있는지 확인
   */
  isUserConnected(userId: string): boolean {
    const userConnections = this.connections.get(userId);
    return userConnections !== undefined && userConnections.size > 0;
  }

  /**
   * SSE 이벤트 포맷팅
   */
  private formatSSEEvent(event: SSENotificationEvent): string {
    const data = event.data !== null ? JSON.stringify(event.data) : 'null';
    return `event: ${event.event}\ndata: ${data}\n\n`;
  }

  /**
   * 하트비트 시작
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, SSE_HEARTBEAT_INTERVAL);
  }

  /**
   * 하트비트 전송
   */
  private sendHeartbeat(): void {
    if (this.getActiveConnections() === 0) {
      return;
    }

    this.broadcast({
      event: 'heartbeat',
      data: null,
    });
  }

  /**
   * 리소스 정리
   */
  onModuleDestroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // 모든 연결 종료
    this.connections.forEach((userConnections) => {
      userConnections.forEach((response) => {
        try {
          response.end();
        } catch (error) {
          // 무시
        }
      });
    });

    this.connections.clear();
  }
}
