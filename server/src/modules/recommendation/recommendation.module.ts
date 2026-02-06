/**
 * 추천 모듈
 * 복지 추천 기능 모듈 정의
 */

import { Module, forwardRef } from '@nestjs/common';
import { RecommendationController } from './recommendation.controller';
import { WelfareProgramController } from './controllers/welfare-program.controller';
import { RecommendationService } from './recommendation.service';
import { RecommendationRepository } from './recommendation.repository';
import { MatchingEngineService } from './services/matching-engine.service';
import { CacheService } from './services/cache.service';
import { ProfileModule } from '../profile/profile.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => ProfileModule),
    AuthModule,
  ],
  controllers: [
    RecommendationController,
    WelfareProgramController,
  ],
  providers: [
    RecommendationService,
    RecommendationRepository,
    MatchingEngineService,
    CacheService,
  ],
  exports: [
    RecommendationService,
  ],
})
export class RecommendationModule {}
