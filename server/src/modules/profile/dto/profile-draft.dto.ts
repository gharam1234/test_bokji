/**
 * 프로필 임시 저장 DTO
 */

import { IsEnum, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProfileStep } from '../entities/user-profile.entity';
import {
  BasicInfoDto,
  IncomeDto,
  AddressDto,
  HouseholdDto,
} from './create-profile.dto';

// ==================== 임시 저장 폼 데이터 ====================

export class DraftFormDataDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => BasicInfoDto)
  basicInfo?: Partial<BasicInfoDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => IncomeDto)
  income?: Partial<IncomeDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: Partial<AddressDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => HouseholdDto)
  household?: Partial<HouseholdDto>;
}

// ==================== 임시 저장 요청 DTO ====================

export class SaveDraftDto {
  @IsEnum(ProfileStep, { message: '올바른 단계를 선택해주세요' })
  currentStep: ProfileStep;

  @IsObject()
  @ValidateNested()
  @Type(() => DraftFormDataDto)
  formData: DraftFormDataDto;
}

// ==================== 임시 저장 응답 DTO ====================

export class ProfileDraftResponseDto {
  /** 현재 입력 단계 */
  currentStep: ProfileStep;
  
  /** 저장된 폼 데이터 */
  formData: DraftFormDataDto;
  
  /** 저장 시간 */
  savedAt: string;
}
