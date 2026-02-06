/**
 * 프로필 생성 DTO
 * 프로필 생성 요청 데이터 검증
 */

import {
  IsString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, IncomeType } from '../entities/user-profile.entity';
import { FamilyRelation } from '../entities/household-member.entity';

// ==================== 기본 정보 DTO ====================

export class BasicInfoDto {
  @IsString()
  @MinLength(2, { message: '이름은 2자 이상이어야 합니다' })
  @MaxLength(50, { message: '이름은 50자 이하여야 합니다' })
  @Matches(/^[가-힣a-zA-Z\s]+$/, { message: '이름은 한글 또는 영문만 입력 가능합니다' })
  name: string;

  @IsDateString()
  birthDate: string;

  @IsEnum(Gender, { message: '성별을 선택해주세요' })
  gender: Gender;

  @IsString()
  @Matches(/^01[0-9]-?\d{3,4}-?\d{4}$/, { message: '올바른 전화번호 형식이 아닙니다' })
  phone: string;

  @IsOptional()
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다' })
  email?: string;
}

// ==================== 소득 정보 DTO ====================

export class IncomeDto {
  @IsEnum(IncomeType, { message: '소득 유형을 선택해주세요' })
  type: IncomeType;

  @IsNumber()
  @Min(0, { message: '소득은 0 이상이어야 합니다' })
  @Max(10000000000, { message: '올바른 소득 금액을 입력해주세요' })
  annualAmount: number;
}

// ==================== 주소 정보 DTO ====================

export class AddressDto {
  @IsString()
  @Matches(/^\d{5}$/, { message: '올바른 우편번호 형식이 아닙니다' })
  zipCode: string;

  @IsString()
  @MinLength(1, { message: '시/도를 선택해주세요' })
  sido: string;

  @IsString()
  @MinLength(1, { message: '시/군/구를 선택해주세요' })
  sigungu: string;

  @IsString()
  @MinLength(1, { message: '도로명 주소를 입력해주세요' })
  roadAddress: string;

  @IsOptional()
  @IsString()
  jibunAddress?: string;

  @IsString()
  @MinLength(1, { message: '상세 주소를 입력해주세요' })
  @MaxLength(200, { message: '상세 주소는 200자 이하여야 합니다' })
  detail: string;

  @IsOptional()
  @IsString()
  buildingName?: string;
}

// ==================== 가구원 정보 DTO ====================

export class HouseholdMemberInputDto {
  @IsEnum(FamilyRelation, { message: '가구원 관계를 선택해주세요' })
  relation: FamilyRelation;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsDateString()
  birthDate: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsBoolean()
  hasDisability: boolean;

  @IsBoolean()
  hasIncome: boolean;
}

export class HouseholdDto {
  @IsNumber()
  @Min(1)
  @Max(20)
  size: number;

  @IsArray()
  @ArrayMaxSize(19)
  @ValidateNested({ each: true })
  @Type(() => HouseholdMemberInputDto)
  members: HouseholdMemberInputDto[];
}

// ==================== 전체 프로필 생성 DTO ====================

export class CreateProfileDto {
  @ValidateNested()
  @Type(() => BasicInfoDto)
  basicInfo: BasicInfoDto;

  @ValidateNested()
  @Type(() => IncomeDto)
  income: IncomeDto;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ValidateNested()
  @Type(() => HouseholdDto)
  household: HouseholdDto;
}
