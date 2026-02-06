/**
 * 활동 로그 DTO
 * 활동 기록 요청 및 응답 형식
 */

import { IsEnum, IsUUID, IsOptional, IsString, IsObject } from 'class-validator';
import { ActivityType } from '../entities/user-activity-log.entity';

/** 활동 로그 생성 요청 DTO */
export class CreateActivityLogDto {
  @IsEnum(ActivityType)
  activityType: ActivityType;

  @IsUUID()
  @IsOptional()
  targetId?: string;

  @IsString()
  @IsOptional()
  targetCategory?: string;

  @IsObject()
  @IsOptional()
  metadata?: {
    searchQuery?: string;
    filters?: Record<string, string>;
    source?: 'search' | 'recommendation' | 'direct';
    sessionId?: string;
  };
}

/** 활동 로그 응답 DTO */
export class ActivityLogResponseDto {
  id: string;
  userId: string;
  activityType: ActivityType;
  targetId: string | null;
  targetCategory: string | null;
  metadata: Record<string, any>;
  createdAt: Date;
}

/** 활동 로그 목록 조회 요청 파라미터 */
export class ActivityLogQueryDto {
  @IsEnum(ActivityType)
  @IsOptional()
  activityType?: ActivityType;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsOptional()
  limit?: number = 100;

  @IsOptional()
  offset?: number = 0;
}
