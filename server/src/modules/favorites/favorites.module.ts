/**
 * 즐겨찾기 모듈
 * NestJS 모듈 정의 - 컨트롤러, 서비스, 리포지토리 등록
 */

import { Module } from '@nestjs/common';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { FavoritesRepository } from './favorites.repository';
import { AuthModule } from '../auth/auth.module';

/**
 * 즐겨찾기 모듈
 * 즐겨찾기 관련 기능을 캡슐화
 */
@Module({
  imports: [
    AuthModule, // 인증 가드 사용을 위해 import
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService, FavoritesRepository],
  exports: [FavoritesService], // 다른 모듈에서 서비스 사용 가능
})
export class FavoritesModule {}
