/**
 * 서버 진입점
 * NestJS 애플리케이션 부트스트랩
 */

import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule);
  
  // CORS 설정 (프론트엔드 연동용)
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  logger.log(`🚀 Server is running on http://localhost:${port}`);
}

bootstrap();
