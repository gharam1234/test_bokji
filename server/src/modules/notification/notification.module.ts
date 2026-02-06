/**
 * 알림 모듈
 * 알림 관련 컴포넌트 등록
 */

import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { SSEManager } from './managers/sse.manager';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    SSEManager,
    // Pool 제공 (실제 환경에서는 DatabaseModule에서 제공)
    {
      provide: 'PG_POOL',
      useFactory: () => {
        // 실제 환경에서는 설정에 따라 Pool 생성
        const { Pool } = require('pg');
        return new Pool({
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          database: process.env.DB_NAME || 'welfare_db',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
        });
      },
    },
  ],
  exports: [NotificationService, SSEManager],
})
export class NotificationModule {}
