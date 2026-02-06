/**
 * 가구원 유효성 검증기
 */

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { FamilyRelation } from '../entities/household-member.entity';

/**
 * 가구원 관계 검증
 */
@ValidatorConstraint({ name: 'isValidRelation', async: false })
export class IsValidRelationConstraint implements ValidatorConstraintInterface {
  validate(relation: string, _args: ValidationArguments): boolean {
    if (!relation) return false;
    return Object.values(FamilyRelation).includes(relation as FamilyRelation);
  }

  defaultMessage(_args: ValidationArguments): string {
    return '올바른 가구원 관계를 선택해주세요';
  }
}

export function IsValidRelation(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidRelationConstraint,
    });
  };
}

/**
 * 가구원 목록 검증 (본인 제외, 최대 19명)
 */
@ValidatorConstraint({ name: 'isValidMembersList', async: false })
export class IsValidMembersListConstraint implements ValidatorConstraintInterface {
  validate(members: any[], args: ValidationArguments): boolean {
    if (!Array.isArray(members)) return true; // 빈 배열 허용

    // 최대 19명 (본인 제외)
    if (members.length > 19) return false;

    // 본인 관계는 포함 불가
    const hasSelf = members.some((m) => m.relation === FamilyRelation.SELF);
    if (hasSelf) return false;

    // 가구원 수와 일치 검증
    const obj = args.object as any;
    if (obj.size !== undefined) {
      // 가구원 수 - 1(본인) 보다 많을 수 없음
      if (members.length > obj.size - 1) return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const members = args.value as any[];
    if (members.some((m) => m.relation === FamilyRelation.SELF)) {
      return '가구원 목록에 본인은 포함할 수 없습니다';
    }
    return '가구원 목록이 올바르지 않습니다';
  }
}

export function IsValidMembersList(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidMembersListConstraint,
    });
  };
}

/**
 * 가구원 나이 검증 (0세 이상 150세 이하)
 */
@ValidatorConstraint({ name: 'isValidMemberAge', async: false })
export class IsValidMemberAgeConstraint implements ValidatorConstraintInterface {
  validate(birthDate: string | Date, _args: ValidationArguments): boolean {
    if (!birthDate) return false;

    const date = new Date(birthDate);
    if (isNaN(date.getTime())) return false;

    const now = new Date();
    // 미래 날짜 불가
    if (date > now) return false;

    // 150세 이하
    const age = now.getFullYear() - date.getFullYear();
    if (age > 150 || age < 0) return false;

    return true;
  }

  defaultMessage(_args: ValidationArguments): string {
    return '가구원의 생년월일이 올바르지 않습니다';
  }
}

export function IsValidMemberAge(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidMemberAgeConstraint,
    });
  };
}

/**
 * 배우자 중복 검증 (최대 1명)
 */
export function validateSpouseCount(members: any[]): boolean {
  if (!Array.isArray(members)) return true;

  const spouseCount = members.filter(
    (m) => m.relation === FamilyRelation.SPOUSE
  ).length;

  return spouseCount <= 1;
}

/**
 * 가구원 전체 검증
 */
export function validateHouseholdMembers(
  members: any[],
  householdSize: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(members)) {
    return { valid: true, errors: [] };
  }

  // 최대 인원 검증
  if (members.length > 19) {
    errors.push('가구원은 본인 포함 최대 20명까지 등록 가능합니다');
  }

  // 가구원 수와 일치 검증
  if (householdSize && members.length > householdSize - 1) {
    errors.push(`가구원 수(${householdSize})보다 많은 가구원을 등록할 수 없습니다`);
  }

  // 본인 포함 불가
  if (members.some((m) => m.relation === FamilyRelation.SELF)) {
    errors.push('가구원 목록에 본인은 포함할 수 없습니다');
  }

  // 배우자 중복 검증
  if (!validateSpouseCount(members)) {
    errors.push('배우자는 1명만 등록할 수 있습니다');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
