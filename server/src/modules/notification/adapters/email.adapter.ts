/**
 * 이메일 알림 어댑터 (SendGrid)
 * SendGrid를 통한 이메일 알림 발송
 */

import { Injectable, Logger } from '@nestjs/common';
import { IEmailNotificationAdapter } from '../interfaces/dispatcher.interface';
import { Notification } from '../entities/notification.entity';
import { TemplateService } from '../services/template.service';
import { NotificationChannel } from '../constants/notification.constants';
import { Pool } from 'pg';

/**
 * 이메일 발송 옵션
 */
interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

/**
 * 이메일 발송 결과
 */
interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class EmailAdapter implements IEmailNotificationAdapter {
  private readonly logger = new Logger(EmailAdapter.name);

  // SendGrid 클라이언트 (실제 연동 시 주입)
  private sendgridClient: any = null;
  private isInitialized = false;

  // 발신자 정보
  private fromEmail: string = 'noreply@welfare-platform.com';
  private fromName: string = '복지 플랫폼';

  constructor(
    private readonly pool: Pool,
    private readonly templateService: TemplateService,
  ) {}

  /**
   * SendGrid 초기화
   */
  async initialize(apiKey?: string): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const key = apiKey || process.env.SENDGRID_API_KEY;

      if (!key) {
        this.logger.warn('SendGrid API key not configured');
        return;
      }

      // SendGrid 동적 로드
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(key);
      // this.sendgridClient = sgMail;
      // this.isInitialized = true;

      this.logger.log('Email adapter initialized (SendGrid stub mode)');
    } catch (error) {
      this.logger.error(`Failed to initialize SendGrid: ${error.message}`);
    }
  }

  /**
   * 발신자 정보 설정
   */
  setFromAddress(email: string, name?: string): void {
    this.fromEmail = email;
    if (name) {
      this.fromName = name;
    }
  }

  /**
   * 단일 사용자에게 이메일 발송
   */
  async send(userId: string, notification: Notification): Promise<boolean> {
    if (!this.isSendGridConfigured()) {
      this.logger.debug('SendGrid not configured, skipping email notification');
      return false;
    }

    try {
      // 사용자 이메일 조회
      const userEmail = await this.getUserEmail(userId);

      if (!userEmail) {
        this.logger.debug(`No email found for user ${userId}`);
        return false;
      }

      // 템플릿 렌더링
      const rendered = await this.templateService.renderTemplate(
        notification.type,
        NotificationChannel.EMAIL,
        this.templateService.createContextFromMetadata(notification.metadata, {
          userName: await this.getUserName(userId),
        }),
      );

      // 이메일 발송
      const result = await this.sendEmail({
        to: userEmail,
        subject: rendered.title,
        html: this.buildEmailHtml(rendered.title, rendered.message, notification.linkUrl),
        text: rendered.message,
      });

      return result.success;
    } catch (error) {
      this.logger.error(`Failed to send email to user ${userId}: ${error.message}`);
      return false;
    }
  }

  /**
   * 여러 사용자에게 이메일 발송
   */
  async sendBulk(
    userIds: string[],
    notification: Notification,
  ): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const userId of userIds) {
      try {
        const success = await this.send(userId, {
          ...notification,
          userId,
        });
        results.set(userId, success);
      } catch (error) {
        this.logger.error(`Failed to send bulk email to user ${userId}: ${error.message}`);
        results.set(userId, false);
      }
    }

    return results;
  }

  /**
   * 이메일 요약 발송 (다이제스트)
   */
  async sendDigest(userId: string, notifications: Notification[]): Promise<boolean> {
    if (!this.isSendGridConfigured()) {
      this.logger.debug('SendGrid not configured, skipping digest email');
      return false;
    }

    if (notifications.length === 0) {
      return false;
    }

    try {
      const userEmail = await this.getUserEmail(userId);
      const userName = await this.getUserName(userId);

      if (!userEmail) {
        this.logger.debug(`No email found for user ${userId}`);
        return false;
      }

      // 요약 이메일 생성
      const digestHtml = this.buildDigestHtml(notifications, userName);

      const result = await this.sendEmail({
        to: userEmail,
        subject: `📬 복지 알림 요약 (${notifications.length}건)`,
        html: digestHtml,
        text: notifications.map((n) => `- ${n.title}: ${n.message}`).join('\n'),
      });

      return result.success;
    } catch (error) {
      this.logger.error(`Failed to send digest email to user ${userId}: ${error.message}`);
      return false;
    }
  }

  // ==================== Private 메서드 ====================

  /**
   * SendGrid 설정 여부 확인
   */
  private isSendGridConfigured(): boolean {
    // 실제 구현 시: return this.isInitialized && this.sendgridClient !== null;
    return false; // 현재는 stub 모드
  }

  /**
   * 이메일 발송
   */
  private async sendEmail(options: EmailOptions): Promise<EmailSendResult> {
    if (!this.sendgridClient) {
      return { success: false, error: 'SendGrid not configured' };
    }

    try {
      const msg = {
        to: options.to,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      // const response = await this.sendgridClient.send(msg);
      // this.logger.debug(`Email sent to ${options.to}`);
      // return { success: true, messageId: response[0]?.headers['x-message-id'] };

      return { success: true };
    } catch (error: any) {
      this.logger.error(`SendGrid error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 사용자 이메일 조회
   */
  private async getUserEmail(userId: string): Promise<string | null> {
    const query = `SELECT email FROM user_profile WHERE id = $1`;

    try {
      const result = await this.pool.query(query, [userId]);
      return result.rows[0]?.email || null;
    } catch (error) {
      this.logger.error(`Failed to get user email: ${error.message}`);
      return null;
    }
  }

  /**
   * 사용자 이름 조회
   */
  private async getUserName(userId: string): Promise<string> {
    const query = `SELECT name FROM user_profile WHERE id = $1`;

    try {
      const result = await this.pool.query(query, [userId]);
      return result.rows[0]?.name || '회원';
    } catch (error) {
      this.logger.error(`Failed to get user name: ${error.message}`);
      return '회원';
    }
  }

  /**
   * 이메일 HTML 빌드
   */
  private buildEmailHtml(title: string, message: string, linkUrl?: string): string {
    const linkHtml = linkUrl
      ? `<p style="margin-top: 20px;">
           <a href="${process.env.APP_URL || 'http://localhost:3000'}${linkUrl}" 
              style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
             자세히 보기
           </a>
         </p>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h1 style="color: #2c3e50; margin-bottom: 20px;">${title}</h1>
          <p style="font-size: 16px; white-space: pre-line;">${message}</p>
          ${linkHtml}
        </div>
        <footer style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
          <p>본 메일은 복지 플랫폼에서 발송되었습니다.</p>
          <p>알림 설정은 <a href="${process.env.APP_URL || 'http://localhost:3000'}/settings/notifications">여기</a>에서 변경할 수 있습니다.</p>
        </footer>
      </body>
      </html>
    `;
  }

  /**
   * 다이제스트 이메일 HTML 빌드
   */
  private buildDigestHtml(notifications: Notification[], userName: string): string {
    const notificationListHtml = notifications
      .map(
        (n) => `
        <li style="margin-bottom: 15px; padding: 15px; background-color: #fff; border-radius: 8px; border: 1px solid #eee;">
          <strong style="color: #2c3e50;">${n.title}</strong>
          <p style="margin: 5px 0; color: #666;">${n.message}</p>
          <small style="color: #888;">${new Date(n.createdAt).toLocaleString('ko-KR')}</small>
        </li>
      `,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>복지 알림 요약</title>
      </head>
      <body style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h1 style="color: #2c3e50; margin-bottom: 10px;">📬 복지 알림 요약</h1>
          <p style="color: #666; margin-bottom: 20px;">안녕하세요, ${userName}님! 최근 ${notifications.length}개의 알림이 있습니다.</p>
          <ul style="list-style: none; padding: 0;">
            ${notificationListHtml}
          </ul>
          <p style="margin-top: 20px;">
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/notifications" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              전체 알림 보기
            </a>
          </p>
        </div>
        <footer style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
          <p>본 메일은 복지 플랫폼에서 발송되었습니다.</p>
          <p>알림 설정은 <a href="${process.env.APP_URL || 'http://localhost:3000'}/settings/notifications">여기</a>에서 변경할 수 있습니다.</p>
        </footer>
      </body>
      </html>
    `;
  }
}
