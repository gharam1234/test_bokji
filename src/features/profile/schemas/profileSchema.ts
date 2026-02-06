/**
 * 프로필 유효성 검증 스키마 (Zod)
 */

import { z } from 'zod';
import { Gender, IncomeType, FamilyRelation, ProfileStep } from '../types';

// ==================== 기본 정보 스키마 ====================

export const basicInfoSchema = z.object({
  name: z
    .string()
    .min(2, '이름은 2자 이상이어야 합니다')
    .max(50, '이름은 50자 이하여야 합니다')
    .regex(/^[가-힣a-zA-Z\s]+$/, '이름은 한글 또는 영문만 입력 가능합니다'),

  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)')
    .refine((date) => {
      const birth = new Date(date);
      const now = new Date();
      const age = now.getFullYear() - birth.getFullYear();
      return age >= 0 && age <= 150;
    }, '올바른 생년월일을 입력해주세요'),

  gender: z.nativeEnum(Gender, {
    errorMap: () => ({ message: '성별을 선택해주세요' }),
  }),

  phone: z
    .string()
    .regex(/^01[0-9]-?\d{3,4}-?\d{4}$/, '올바른 전화번호 형식이 아닙니다'),

  email: z
    .string()
    .email('올바른 이메일 형식이 아닙니다')
    .optional()
    .or(z.literal('')),
});

// ==================== 소득 정보 스키마 ====================

export const incomeSchema = z.object({
  type: z.nativeEnum(IncomeType, {
    errorMap: () => ({ message: '소득 유형을 선택해주세요' }),
  }),

  annualAmount: z
    .number({ invalid_type_error: '숫자를 입력해주세요' })
    .min(0, '소득은 0 이상이어야 합니다')
    .max(10000000000, '올바른 소득 금액을 입력해주세요'),
});

// ==================== 주소 정보 스키마 ====================

export const addressSchema = z.object({
  zipCode: z
    .string()
    .regex(/^\d{5}$/, '올바른 우편번호 형식이 아닙니다'),

  sido: z
    .string()
    .min(1, '시/도를 선택해주세요'),

  sigungu: z
    .string()
    .min(1, '시/군/구를 선택해주세요'),

  roadAddress: z
    .string()
    .min(1, '도로명 주소를 입력해주세요'),

  jibunAddress: z.string().optional(),

  detail: z
    .string()
    .min(1, '상세 주소를 입력해주세요')
    .max(200, '상세 주소는 200자 이하여야 합니다'),

  buildingName: z.string().optional(),
});

// ==================== 가구원 정보 스키마 ====================

export const householdMemberSchema = z.object({
  relation: z.nativeEnum(FamilyRelation, {
    errorMap: () => ({ message: '관계를 선택해주세요' }),
  }),

  name: z
    .string()
    .min(2, '이름은 2자 이상이어야 합니다')
    .max(50, '이름은 50자 이하여야 합니다'),

  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다'),

  gender: z.nativeEnum(Gender, {
    errorMap: () => ({ message: '성별을 선택해주세요' }),
  }),

  hasDisability: z.boolean(),

  hasIncome: z.boolean(),
});

export const householdSchema = z.object({
  size: z
    .number({ invalid_type_error: '숫자를 입력해주세요' })
    .min(1, '가구원 수는 1명 이상이어야 합니다')
    .max(20, '가구원 수는 20명 이하여야 합니다'),

  members: z
    .array(householdMemberSchema)
    .max(19, '가구원은 최대 19명까지 등록 가능합니다'),
});

// ==================== 전체 프로필 스키마 ====================

export const profileFormSchema = z.object({
  basicInfo: basicInfoSchema,
  income: incomeSchema,
  address: addressSchema,
  household: householdSchema,
});

// ==================== 임시 저장 스키마 ====================

export const draftFormDataSchema = z.object({
  basicInfo: basicInfoSchema.partial().optional(),
  income: incomeSchema.partial().optional(),
  address: addressSchema.partial().optional(),
  household: householdSchema.partial().optional(),
});

export const saveDraftSchema = z.object({
  currentStep: z.nativeEnum(ProfileStep),
  formData: draftFormDataSchema,
});

// ==================== 타입 추론 ====================

export type BasicInfoSchemaType = z.infer<typeof basicInfoSchema>;
export type IncomeSchemaType = z.infer<typeof incomeSchema>;
export type AddressSchemaType = z.infer<typeof addressSchema>;
export type HouseholdMemberSchemaType = z.infer<typeof householdMemberSchema>;
export type HouseholdSchemaType = z.infer<typeof householdSchema>;
export type ProfileFormSchemaType = z.infer<typeof profileFormSchema>;
