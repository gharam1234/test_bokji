/**
 * 프로필 단계별 저장 컨트롤러
 * 단계별 프로필 입력 API 처리
 */

import {
  Controller,
  Put,
  Body,
  Logger,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import {
  BasicInfoDto,
  IncomeDto,
  AddressDto,
  HouseholdDto,
} from './dto/create-profile.dto';
import { ProfileSuccessResponseDto } from './dto/profile-response.dto';

// 임시 사용자 ID
const TEMP_USER_ID = 'temp-user-id-12345';

@Controller('api/profile')
export class ProfileStepController {
  private readonly logger = new Logger(ProfileStepController.name);

  constructor(private readonly profileService: ProfileService) {}

  /**
   * PUT /api/profile/basic-info
   * 기본 정보 저장
   */
  @Put('basic-info')
  async saveBasicInfo(
    @Body() dto: BasicInfoDto,
    // @CurrentUser() userId: string,
  ): Promise<ProfileSuccessResponseDto> {
    const userId = TEMP_USER_ID;
    this.logger.log(`PUT /api/profile/basic-info`);
    return this.profileService.saveBasicInfo(userId, dto);
  }

  /**
   * PUT /api/profile/income
   * 소득 정보 저장
   */
  @Put('income')
  async saveIncome(
    @Body() dto: IncomeDto,
    // @CurrentUser() userId: string,
  ): Promise<ProfileSuccessResponseDto> {
    const userId = TEMP_USER_ID;
    this.logger.log(`PUT /api/profile/income`);
    return this.profileService.saveIncome(userId, dto);
  }

  /**
   * PUT /api/profile/address
   * 주소 정보 저장
   */
  @Put('address')
  async saveAddress(
    @Body() dto: AddressDto,
    // @CurrentUser() userId: string,
  ): Promise<ProfileSuccessResponseDto> {
    const userId = TEMP_USER_ID;
    this.logger.log(`PUT /api/profile/address`);
    return this.profileService.saveAddress(userId, dto);
  }

  /**
   * PUT /api/profile/household
   * 가구원 정보 저장
   */
  @Put('household')
  async saveHousehold(
    @Body() dto: HouseholdDto,
    // @CurrentUser() userId: string,
  ): Promise<ProfileSuccessResponseDto> {
    const userId = TEMP_USER_ID;
    this.logger.log(`PUT /api/profile/household`);
    return this.profileService.saveHousehold(userId, dto);
  }
}
