/**
 * 캐시 서비스
 * Redis를 사용한 추천 결과 캐싱 관리
 */

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { CACHE_KEYS, CACHE_TTL } from '../constants/cache-keys.constant';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: RedisClientType | null = null;
  private isConnected = false;

  constructor() {
    this.initializeClient();
  }

  /**
   * Redis 클라이언트 초기화
   */
  private async initializeClient(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.client = createClient({
        url: redisUrl,
      });

      this.client.on('error', (err) => {
        this.logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        this.logger.log('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        this.logger.warn('Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      this.logger.error('Failed to initialize Redis client:', error);
      this.isConnected = false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    }
  }

  /**
   * Redis 연결 상태 확인
   */
  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  // ==================== 추천 결과 캐시 ====================

  /**
   * 사용자 추천 결과 캐시 저장
   */
  async setRecommendations(
    userId: string,
    data: unknown,
    ttlSeconds: number = CACHE_TTL.RECOMMENDATIONS,
  ): Promise<void> {
    if (!this.isReady()) {
      this.logger.warn('Redis not ready, skipping cache set');
      return;
    }

    try {
      const key = `${CACHE_KEYS.RECOMMENDATIONS}:${userId}`;
      await this.client!.setEx(key, ttlSeconds, JSON.stringify(data));
      this.logger.debug(`Cached recommendations for user: ${userId}`);
    } catch (error) {
      this.logger.error('Failed to set recommendations cache:', error);
    }
  }

  /**
   * 사용자 추천 결과 캐시 조회
   */
  async getRecommendations<T>(userId: string): Promise<T | null> {
    if (!this.isReady()) {
      return null;
    }

    try {
      const key = `${CACHE_KEYS.RECOMMENDATIONS}:${userId}`;
      const data = await this.client!.get(key);
      
      if (data) {
        this.logger.debug(`Cache hit for recommendations: ${userId}`);
        return JSON.parse(data) as T;
      }
      
      this.logger.debug(`Cache miss for recommendations: ${userId}`);
      return null;
    } catch (error) {
      this.logger.error('Failed to get recommendations cache:', error);
      return null;
    }
  }

  /**
   * 사용자 추천 결과 캐시 삭제
   */
  async invalidateRecommendations(userId: string): Promise<void> {
    if (!this.isReady()) {
      return;
    }

    try {
      const key = `${CACHE_KEYS.RECOMMENDATIONS}:${userId}`;
      await this.client!.del(key);
      this.logger.debug(`Invalidated recommendations cache for user: ${userId}`);
    } catch (error) {
      this.logger.error('Failed to invalidate recommendations cache:', error);
    }
  }

  // ==================== 복지 프로그램 캐시 ====================

  /**
   * 복지 프로그램 상세 캐시 저장
   */
  async setWelfareProgram(
    programId: string,
    data: unknown,
    ttlSeconds: number = CACHE_TTL.WELFARE_PROGRAM,
  ): Promise<void> {
    if (!this.isReady()) {
      return;
    }

    try {
      const key = `${CACHE_KEYS.WELFARE_PROGRAM}:${programId}`;
      await this.client!.setEx(key, ttlSeconds, JSON.stringify(data));
      this.logger.debug(`Cached welfare program: ${programId}`);
    } catch (error) {
      this.logger.error('Failed to set welfare program cache:', error);
    }
  }

  /**
   * 복지 프로그램 상세 캐시 조회
   */
  async getWelfareProgram<T>(programId: string): Promise<T | null> {
    if (!this.isReady()) {
      return null;
    }

    try {
      const key = `${CACHE_KEYS.WELFARE_PROGRAM}:${programId}`;
      const data = await this.client!.get(key);
      
      if (data) {
        this.logger.debug(`Cache hit for welfare program: ${programId}`);
        return JSON.parse(data) as T;
      }
      
      return null;
    } catch (error) {
      this.logger.error('Failed to get welfare program cache:', error);
      return null;
    }
  }

  // ==================== 요청 제한 (Rate Limiting) ====================

  /**
   * 요청 제한 체크 및 기록
   * @returns true: 요청 허용, false: 요청 제한됨
   */
  async checkRateLimit(
    userId: string,
    action: string,
    windowSeconds: number = 60,
    maxRequests: number = 1,
  ): Promise<{ allowed: boolean; remainingTime: number }> {
    if (!this.isReady()) {
      // Redis 미연결 시 허용
      return { allowed: true, remainingTime: 0 };
    }

    try {
      const key = `${CACHE_KEYS.RATE_LIMIT}:${action}:${userId}`;
      const exists = await this.client!.exists(key);

      if (exists) {
        const ttl = await this.client!.ttl(key);
        return { allowed: false, remainingTime: ttl > 0 ? ttl : 0 };
      }

      // 요청 기록
      await this.client!.setEx(key, windowSeconds, '1');
      return { allowed: true, remainingTime: 0 };
    } catch (error) {
      this.logger.error('Failed to check rate limit:', error);
      return { allowed: true, remainingTime: 0 };
    }
  }

  // ==================== 유틸리티 ====================

  /**
   * 패턴으로 키 삭제
   */
  async deleteByPattern(pattern: string): Promise<number> {
    if (!this.isReady()) {
      return 0;
    }

    try {
      const keys = await this.client!.keys(pattern);
      if (keys.length > 0) {
        await this.client!.del(keys);
        this.logger.debug(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
      }
      return keys.length;
    } catch (error) {
      this.logger.error('Failed to delete by pattern:', error);
      return 0;
    }
  }

  /**
   * 모든 추천 캐시 삭제 (관리자용)
   */
  async clearAllRecommendationCaches(): Promise<number> {
    return this.deleteByPattern(`${CACHE_KEYS.RECOMMENDATIONS}:*`);
  }
}
