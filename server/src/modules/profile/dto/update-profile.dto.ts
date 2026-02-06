/**
 * 프로필 수정 DTO
 * 프로필 수정 요청 데이터 검증
 */

import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateProfileDto,
  BasicInfoDto,
  IncomeDto,
  AddressDto,
  HouseholdDto,
} from './create-profile.dto';

// ==================== 전체 수정 DTO ====================

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}

// ==================== 부분 수정 DTO (단계별 저장) ====================

export class UpdateBasicInfoDto {
  @ValidateNested()
  @Type(() => BasicInfoDto)
  basicInfo: BasicInfoDto;
}

export class UpdateIncomeDto {
  @ValidateNested()
  @Type(() => IncomeDto)
  income: IncomeDto;
}

export class UpdateAddressDto {
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

export class UpdateHouseholdDto {
  @ValidateNested()
  @Type(() => HouseholdDto)
  household: HouseholdDto;
}

// ==================== 개별 가구원 수정 DTO ====================

export class UpdateHouseholdMemberDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => BasicInfoDto)
  basicInfo?: Partial<BasicInfoDto>;
}
