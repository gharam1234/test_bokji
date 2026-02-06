/**
 * 가구원 DTO
 * 가구원 관련 요청/응답 데이터 검증
 */

import {
  IsString,
  IsEnum,
  IsBoolean,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Gender } from '../entities/user-profile.entity';
import { FamilyRelation } from '../entities/household-member.entity';

// ==================== 가구원 생성 DTO ====================

export class CreateHouseholdMemberDto {
  @IsEnum(FamilyRelation, { message: '가구원 관계를 선택해주세요' })
  relation: FamilyRelation;

  @IsString()
  @MinLength(2, { message: '이름은 2자 이상이어야 합니다' })
  @MaxLength(50, { message: '이름은 50자 이하여야 합니다' })
  name: string;

  @IsDateString({}, { message: '올바른 날짜 형식이 아닙니다' })
  birthDate: string;

  @IsEnum(Gender, { message: '성별을 선택해주세요' })
  gender: Gender;

  @IsBoolean()
  hasDisability: boolean;

  @IsBoolean()
  hasIncome: boolean;
}

// ==================== 가구원 수정 DTO ====================

export class UpdateHouseholdMemberDto {
  @IsEnum(FamilyRelation, { message: '가구원 관계를 선택해주세요' })
  relation?: FamilyRelation;

  @IsString()
  @MinLength(2, { message: '이름은 2자 이상이어야 합니다' })
  @MaxLength(50, { message: '이름은 50자 이하여야 합니다' })
  name?: string;

  @IsDateString({}, { message: '올바른 날짜 형식이 아닙니다' })
  birthDate?: string;

  @IsEnum(Gender, { message: '성별을 선택해주세요' })
  gender?: Gender;

  @IsBoolean()
  hasDisability?: boolean;

  @IsBoolean()
  hasIncome?: boolean;
}
