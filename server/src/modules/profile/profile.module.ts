/**
 * 프로필 모듈
 * 프로필 관련 컴포넌트 등록
 */

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { UserProfile } from './entities/user-profile.entity';
import { HouseholdMember } from './entities/household-member.entity';
import { ProfileDraft } from './entities/profile-draft.entity';

// Controllers
import { ProfileController } from './profile.controller';
import { ProfileStepController } from './controllers/profile-step.controller';
import { ProfileDraftController } from './controllers/profile-draft.controller';
import { HouseholdMemberController } from './controllers/household-member.controller';

// Services
import { ProfileService } from './profile.service';
import { EncryptionService } from './services/encryption.service';
import { IncomeBracketService } from './services/income-bracket.service';
import { CompletionService } from './services/completion.service';

// Repository
import { ProfileRepository } from './profile.repository';

// Auth
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProfile,
      HouseholdMember,
      ProfileDraft,
    ]),
    AuthModule,
  ],
  controllers: [
    ProfileController,
    ProfileStepController,
    ProfileDraftController,
    HouseholdMemberController,
  ],
  providers: [
    ProfileService,
    ProfileRepository,
    EncryptionService,
    IncomeBracketService,
    CompletionService,
  ],
  exports: [
    ProfileService,
    EncryptionService,
    IncomeBracketService,
  ],
})
export class ProfileModule {}
