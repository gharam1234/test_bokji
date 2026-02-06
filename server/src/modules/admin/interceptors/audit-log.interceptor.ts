/**
 * 감사 로그 인터셉터
 * 데코레이터 기반 자동 감사 로그 기록
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AdminAuditService } from '../services/admin-audit.service';
import { AUDIT_LOG_KEY, AuditLogMetadata } from '../decorators/audit-log.decorator';
import { AuditAction, AuditEntityType } from '../entities/audit-log.entity';

/** Request에 관리자 정보 확장 */
interface RequestWithAdmin extends Request {
  admin?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * 감사 로그 인터셉터
 *
 * @AuditLog 데코레이터가 적용된 컨트롤러 메서드의 결과를 가로채
 * 자동으로 감사 로그를 기록합니다.
 *
 * @example
 * // 컨트롤러에서 사용
 * @AuditLog({ action: 'CREATE', entityType: 'welfare_program' })
 * @Post()
 * create(@Body() dto: CreateProgramDto) {
 *   return this.programService.create(dto);
 * }
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AdminAuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // 데코레이터 메타데이터 확인
    const metadata = this.reflector.get<AuditLogMetadata>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    // @AuditLog 데코레이터가 없으면 그냥 통과
    if (!metadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<RequestWithAdmin>();
    const admin = request.admin;

    // 관리자 정보가 없으면 로그 생략 (인증 실패 등)
    if (!admin) {
      this.logger.warn('AuditLogInterceptor: admin not found in request');
      return next.handle();
    }

    const { action, entityType, entityIdParam = 'id' } = metadata;

    // 요청에서 엔티티 ID 추출
    const entityId = this.extractEntityId(request, entityIdParam, action);

    // 요청 정보 추출
    const ipAddress = this.extractIpAddress(request);
    const userAgent = request.headers['user-agent'] || null;

    // UPDATE/DELETE 작업의 경우 이전 데이터를 저장해둠
    // (실제 이전 값은 서비스 레이어에서 조회해야 하므로 response 기반으로 처리)
    const requestBody = request.body;

    return next.handle().pipe(
      tap({
        next: async (response: unknown) => {
          try {
            await this.logAuditEvent({
              adminId: admin.id,
              action,
              entityType,
              entityId: this.resolveEntityId(entityId, response, action),
              oldValue: this.extractOldValue(response, action),
              newValue: this.extractNewValue(response, requestBody, action),
              ipAddress,
              userAgent,
            });
          } catch (error) {
            // 감사 로그 실패가 메인 로직에 영향주지 않도록
            this.logger.error('Failed to create audit log', error);
          }
        },
        error: (error) => {
          // 에러 발생 시에도 시도 로그 (선택적)
          this.logger.debug(`Request failed, skipping audit log: ${error.message}`);
        },
      }),
    );
  }

  /**
   * 요청에서 엔티티 ID 추출
   */
  private extractEntityId(
    request: RequestWithAdmin,
    paramName: string,
    action: AuditAction,
  ): string | null {
    // URL 파라미터에서 먼저 확인 (UPDATE, DELETE, RESTORE)
    if (request.params[paramName]) {
      return request.params[paramName];
    }

    // CREATE의 경우 응답에서 ID를 가져와야 함
    if (action === 'CREATE') {
      return null; // 응답에서 추출
    }

    // body에서 확인 (일부 케이스)
    if (request.body && request.body[paramName]) {
      return request.body[paramName];
    }

    return null;
  }

  /**
   * 응답에서 엔티티 ID 최종 결정
   */
  private resolveEntityId(
    extractedId: string | null,
    response: unknown,
    action: AuditAction,
  ): string {
    // 이미 ID가 있으면 사용
    if (extractedId) {
      return extractedId;
    }

    // CREATE의 경우 응답에서 ID 추출
    if (action === 'CREATE' && response && typeof response === 'object') {
      const responseObj = response as Record<string, unknown>;
      if (responseObj.id) {
        return String(responseObj.id);
      }
    }

    return 'unknown';
  }

  /**
   * 이전 값 추출 (UPDATE, DELETE 시)
   */
  private extractOldValue(
    response: unknown,
    action: AuditAction,
  ): Record<string, unknown> | null {
    // 응답에 oldValue가 포함된 경우 (서비스에서 제공)
    if (response && typeof response === 'object') {
      const responseObj = response as Record<string, unknown>;
      if (responseObj._oldValue) {
        const oldValue = responseObj._oldValue as Record<string, unknown>;
        return oldValue;
      }
    }

    // DELETE의 경우 응답 자체가 삭제된 엔티티
    if (action === 'DELETE' && response && typeof response === 'object') {
      return response as Record<string, unknown>;
    }

    return null;
  }

  /**
   * 새 값 추출 (CREATE, UPDATE 시)
   */
  private extractNewValue(
    response: unknown,
    requestBody: unknown,
    action: AuditAction,
  ): Record<string, unknown> | null {
    // CREATE, UPDATE: 응답이 새 엔티티
    if ((action === 'CREATE' || action === 'UPDATE' || action === 'RESTORE') && response) {
      if (typeof response === 'object') {
        const responseObj = { ...(response as Record<string, unknown>) };
        // 내부 메타데이터 제거
        delete responseObj._oldValue;
        return responseObj;
      }
    }

    return null;
  }

  /**
   * IP 주소 추출
   */
  private extractIpAddress(request: Request): string | null {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    }
    return request.socket?.remoteAddress || null;
  }

  /**
   * 감사 로그 이벤트 기록
   */
  private async logAuditEvent(data: {
    adminId: string;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    oldValue: Record<string, unknown> | null;
    newValue: Record<string, unknown> | null;
    ipAddress: string | null;
    userAgent: string | null;
  }): Promise<void> {
    const changes = this.auditService.calculateChanges(data.oldValue, data.newValue);

    await this.auditService.createLog({
      adminId: data.adminId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      oldValue: data.oldValue,
      newValue: data.newValue,
      changes,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    this.logger.log(
      `Audit log recorded: ${data.action} ${data.entityType} ${data.entityId} by admin ${data.adminId}`,
    );
  }
}
