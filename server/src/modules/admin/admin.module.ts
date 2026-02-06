/**
 * 관리자 모듈
 * 관리자 대시보드 관련 기능 모듈
 */

import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';

// Controllers
import { AdminAuthController } from './controllers/admin-auth.controller';
import { AdminProgramController } from './controllers/admin-program.controller';
import { AdminAuditController } from './controllers/admin-audit.controller';
import { AdminStatsController } from './controllers/admin-stats.controller';

// Services
import { AdminAuthService } from './services/admin-auth.service';
import { AdminProgramService } from './services/admin-program.service';
import { AdminAuditService } from './services/admin-audit.service';
import { AdminStatsService } from './services/admin-stats.service';

// Guards
import { AdminAuthGuard } from './guards/admin-auth.guard';

/** 데이터베이스 풀 Provider */
const DatabasePoolProvider = {
  provide: Pool,
  useFactory: () => {
    return new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/welfare',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  },
};

@Global()
@Module({
  providers: [
    DatabasePoolProvider,
    AdminAuthService,
    AdminProgramService,
    AdminAuditService,
    AdminStatsService,
    AdminAuthGuard,
  ],
  controllers: [
    AdminAuthController,
    AdminProgramController,
    AdminAuditController,
    AdminStatsController,
  ],
  exports: [
    AdminAuthGuard,
    AdminAuditService,
  ],
})
export class AdminModule {}
