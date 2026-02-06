/**
 * 알림 컨트롤러
 * 알림 관련 REST API 엔드포인트
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  HttpCode,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { NotificationService } from './notification.service';
import { SSEManager } from './managers/sse.manager';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';
import { DeleteNotificationsDto } from './dto/delete-notifications.dto';
import { RegisterFcmTokenDto, DeleteFcmTokenDto } from './dto/register-fcm-token.dto';
import { NotificationType, DeviceType } from './constants/notification.constants';

@Controller('api/notifications')
@UseGuards(AuthGuard)
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly sseManager: SSEManager,
  ) {}

  // ==================== 알림 목록 ====================

  /**
   * 알림 목록 조회
   * GET /api/notifications
   */
  @Get()
  async getNotifications(
    @CurrentUser('userId') userId: string,
    @Query('type') type?: NotificationType,
    @Query('isRead') isRead?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const options: GetNotificationsDto = {
      type,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    return this.notificationService.getNotifications(userId, options);
  }

  /**
   * 읽지 않은 알림 개수 조회
   * GET /api/notifications/unread-count
   */
  @Get('unread-count')
  async getUnreadCount(@CurrentUser('userId') userId: string) {
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  // ==================== 알림 읽음 처리 ====================

  /**
   * 알림 읽음 처리 (복수)
   * PATCH /api/notifications/read
   */
  @Patch('read')
  async markAsRead(
    @CurrentUser('userId') userId: string,
    @Body() body: MarkAsReadDto,
  ) {
    const updatedCount = await this.notificationService.markAsRead(
      userId,
      body.notificationIds || [],
    );
    return { success: true, updatedCount };
  }

  /**
   * 단일 알림 읽음 처리
   * PATCH /api/notifications/:id/read
   */
  @Patch(':id/read')
  async markSingleAsRead(
    @CurrentUser('userId') userId: string,
    @Param('id') notificationId: string,
  ) {
    const notification = await this.notificationService.getNotificationById(
      notificationId,
      userId,
    );

    if (!notification) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }

    await this.notificationService.markAsRead(userId, [notificationId]);
    return { success: true, readAt: new Date() };
  }

  // ==================== 알림 삭제 ====================

  /**
   * 알림 삭제 (복수)
   * DELETE /api/notifications
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  async deleteNotifications(
    @CurrentUser('userId') userId: string,
    @Body() body: DeleteNotificationsDto,
  ) {
    const deletedCount = await this.notificationService.deleteNotifications(
      userId,
      body.notificationIds || [],
    );
    return { success: true, deletedCount };
  }

  /**
   * 단일 알림 삭제
   * DELETE /api/notifications/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteSingleNotification(
    @CurrentUser('userId') userId: string,
    @Param('id') notificationId: string,
  ) {
    const notification = await this.notificationService.getNotificationById(
      notificationId,
      userId,
    );

    if (!notification) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }

    await this.notificationService.deleteNotifications(userId, [notificationId]);
    return { success: true };
  }

  // ==================== 알림 설정 ====================

  /**
   * 알림 설정 조회
   * GET /api/notifications/settings
   */
  @Get('settings')
  async getSettings(@CurrentUser('userId') userId: string) {
    const settings = await this.notificationService.getSettings(userId);
    return { settings };
  }

  /**
   * 알림 설정 업데이트
   * PATCH /api/notifications/settings
   */
  @Patch('settings')
  async updateSettings(
    @CurrentUser('userId') userId: string,
    @Body() body: UpdateSettingsDto,
  ) {
    try {
      const settings = await this.notificationService.updateSettings(userId, body);
      return { success: true, settings };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid quiet hours')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  // ==================== FCM 토큰 ====================

  /**
   * FCM 토큰 등록
   * POST /api/notifications/fcm-token
   */
  @Post('fcm-token')
  async registerFcmToken(
    @CurrentUser('userId') userId: string,
    @Body() body: RegisterFcmTokenDto,
  ) {
    if (!body.token || !body.deviceType) {
      throw new BadRequestException('토큰과 디바이스 유형은 필수입니다.');
    }

    if (!Object.values(DeviceType).includes(body.deviceType)) {
      throw new BadRequestException('유효하지 않은 디바이스 유형입니다.');
    }

    await this.notificationService.registerFcmToken(userId, body.token, body.deviceType);
    return { success: true };
  }

  /**
   * FCM 토큰 삭제
   * DELETE /api/notifications/fcm-token
   */
  @Delete('fcm-token')
  @HttpCode(HttpStatus.OK)
  async deleteFcmToken(
    @CurrentUser('userId') userId: string,
    @Body() body: DeleteFcmTokenDto,
  ) {
    if (!body.token) {
      throw new BadRequestException('토큰은 필수입니다.');
    }

    await this.notificationService.removeFcmToken(body.token);
    return { success: true };
  }

  // ==================== SSE 스트림 ====================

  /**
   * 실시간 알림 스트림 (SSE)
   * GET /api/notifications/stream
   */
  @Get('stream')
  async stream(
    @CurrentUser('userId') userId: string,
    @Res() res: Response,
  ) {
    this.logger.log(`SSE stream requested by user ${userId}`);
    this.sseManager.addConnection(userId, res);
  }
}
