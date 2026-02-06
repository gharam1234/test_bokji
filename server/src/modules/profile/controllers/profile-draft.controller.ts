/**
 * 프로필 임시 저장 컨트롤러
 * 임시 저장 관련 API 처리
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { SaveDraftDto, ProfileDraftResponseDto } from './dto/profile-draft.dto';

// 임시 사용자 ID
const TEMP_USER_ID = 'temp-user-id-12345';

@Controller('api/profile/draft')
export class ProfileDraftController {
  private readonly logger = new Logger(ProfileDraftController.name);

  constructor(private readonly profileService: ProfileService) {}

  /**
   * GET /api/profile/draft
   * 임시 저장 데이터 조회
   */
  @Get()
  async getDraft(
    // @CurrentUser() userId: string,
  ): Promise<ProfileDraftResponseDto | null> {
    const userId = TEMP_USER_ID;
    this.logger.log(`GET /api/profile/draft`);
    return this.profileService.getDraft(userId);
  }

  /**
   * POST /api/profile/draft
   * 임시 저장
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async saveDraft(
    @Body() dto: SaveDraftDto,
    // @CurrentUser() userId: string,
  ): Promise<{ success: boolean; savedAt: string }> {
    const userId = TEMP_USER_ID;
    this.logger.log(`POST /api/profile/draft`);
    return this.profileService.saveDraft(userId, dto);
  }

  /**
   * DELETE /api/profile/draft
   * 임시 저장 삭제
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  async deleteDraft(
    // @CurrentUser() userId: string,
  ): Promise<{ success: boolean }> {
    const userId = TEMP_USER_ID;
    this.logger.log(`DELETE /api/profile/draft`);
    return this.profileService.deleteDraft(userId);
  }
}
