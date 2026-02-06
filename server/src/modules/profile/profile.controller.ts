/**
 * 프로필 컨트롤러
 * 프로필 API 엔드포인트 처리
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  ProfileResponseDto,
  ProfileCompletionResponseDto,
} from './dto/profile-response.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('api/profile')
@UseGuards(AuthGuard)
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);

  constructor(private readonly profileService: ProfileService) {}

  /**
   * POST /api/profile
   * 프로필 생성
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProfile(
    @Body() dto: CreateProfileDto,
    @CurrentUser('userId') userId?: string,
  ): Promise<ProfileResponseDto> {
    this.logger.log(`POST /api/profile - Creating profile for user: ${userId}`);
    return this.profileService.createProfile(userId!, dto);
  }

  /**
   * GET /api/profile
   * 내 프로필 조회
   */
  @Get()
  async getMyProfile(
    @CurrentUser('userId') userId?: string,
  ): Promise<ProfileResponseDto> {
    this.logger.log(`GET /api/profile - Getting profile for user: ${userId}`);
    return this.profileService.getProfile(userId!, true);
  }

  /**
   * GET /api/profile/:userId
   * 특정 사용자 프로필 조회 (관리자용)
   */
  @Get(':userId')
  async getProfileByUserId(
    @Param('userId') targetUserId: string,
    @CurrentUser('userId') userId?: string,
  ): Promise<ProfileResponseDto> {
    this.logger.log(`GET /api/profile/${targetUserId}`);
    
    // 본인 조회인지 확인
    const isOwner = userId === targetUserId;
    return this.profileService.getProfile(targetUserId, isOwner);
  }

  /**
   * PUT /api/profile
   * 프로필 전체 수정
   */
  @Put()
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser('userId') userId?: string,
  ): Promise<ProfileResponseDto> {
    this.logger.log(`PUT /api/profile - Updating profile for user: ${userId}`);
    return this.profileService.updateProfile(userId!, dto);
  }

  /**
   * PATCH /api/profile
   * 프로필 부분 수정
   */
  @Patch()
  async patchProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser('userId') userId?: string,
  ): Promise<ProfileResponseDto> {
    this.logger.log(`PATCH /api/profile - Patching profile for user: ${userId}`);
    return this.profileService.updateProfile(userId!, dto);
  }

  /**
   * DELETE /api/profile
   * 프로필 삭제
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  async deleteProfile(
    @CurrentUser('userId') userId?: string,
  ): Promise<{ success: boolean }> {
    this.logger.log(`DELETE /api/profile - Deleting profile for user: ${userId}`);
    return this.profileService.deleteProfile(userId!);
  }

  /**
   * GET /api/profile/completion
   * 프로필 완성도 조회
   */
  @Get('completion')
  async getCompletion(
    @CurrentUser('userId') userId?: string,
  ): Promise<ProfileCompletionResponseDto> {
    this.logger.log(`GET /api/profile/completion`);
    return this.profileService.getCompletion(userId!);
  }
}
