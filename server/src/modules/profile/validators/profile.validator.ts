/**
 * 프로필 유효성 검증기
 */

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

/**
 * 한글/영문 이름 검증
 */
@ValidatorConstraint({ name: 'isValidName', async: false })
export class IsValidNameConstraint implements ValidatorConstraintInterface {
  validate(name: string, _args: ValidationArguments): boolean {
    if (!name) return false;
    // 한글 또는 영문만 허용 (공백 포함)
    const nameRegex = /^[가-힣a-zA-Z\s]+$/;
    return nameRegex.test(name) && name.length >= 2 && name.length <= 50;
  }

  defaultMessage(_args: ValidationArguments): string {
    return '이름은 2~50자의 한글 또는 영문이어야 합니다';
  }
}

export function IsValidName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidNameConstraint,
    });
  };
}

/**
 * 전화번호 형식 검증
 */
@ValidatorConstraint({ name: 'isValidPhone', async: false })
export class IsValidPhoneConstraint implements ValidatorConstraintInterface {
  validate(phone: string, _args: ValidationArguments): boolean {
    if (!phone) return false;
    // 하이픈 제거 후 검증
    const digits = phone.replace(/[^0-9]/g, '');
    // 010-XXXX-XXXX 형식
    const phoneRegex = /^01[0-9]\d{7,8}$/;
    return phoneRegex.test(digits);
  }

  defaultMessage(_args: ValidationArguments): string {
    return '올바른 전화번호 형식이 아닙니다';
  }
}

export function IsValidPhone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPhoneConstraint,
    });
  };
}

/**
 * 생년월일 검증 (미래 날짜 불가, 150세 이하)
 */
@ValidatorConstraint({ name: 'isValidBirthDate', async: false })
export class IsValidBirthDateConstraint implements ValidatorConstraintInterface {
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
    return '올바른 생년월일을 입력해주세요';
  }
}

export function IsValidBirthDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidBirthDateConstraint,
    });
  };
}

/**
 * 우편번호 검증 (5자리 숫자)
 */
@ValidatorConstraint({ name: 'isValidZipCode', async: false })
export class IsValidZipCodeConstraint implements ValidatorConstraintInterface {
  validate(zipCode: string, _args: ValidationArguments): boolean {
    if (!zipCode) return false;
    const zipRegex = /^\d{5}$/;
    return zipRegex.test(zipCode);
  }

  defaultMessage(_args: ValidationArguments): string {
    return '올바른 우편번호 형식이 아닙니다 (5자리 숫자)';
  }
}

export function IsValidZipCode(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidZipCodeConstraint,
    });
  };
}

/**
 * 연간 소득 검증 (0 이상, 100억 이하)
 */
@ValidatorConstraint({ name: 'isValidAnnualIncome', async: false })
export class IsValidAnnualIncomeConstraint implements ValidatorConstraintInterface {
  validate(income: number, _args: ValidationArguments): boolean {
    if (income === undefined || income === null) return false;
    return income >= 0 && income <= 10_000_000_000; // 100억
  }

  defaultMessage(_args: ValidationArguments): string {
    return '연간 소득은 0원 이상 100억원 이하여야 합니다';
  }
}

export function IsValidAnnualIncome(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidAnnualIncomeConstraint,
    });
  };
}

/**
 * 가구원 수 검증 (1 이상 20 이하)
 */
@ValidatorConstraint({ name: 'isValidHouseholdSize', async: false })
export class IsValidHouseholdSizeConstraint implements ValidatorConstraintInterface {
  validate(size: number, _args: ValidationArguments): boolean {
    if (size === undefined || size === null) return false;
    return Number.isInteger(size) && size >= 1 && size <= 20;
  }

  defaultMessage(_args: ValidationArguments): string {
    return '가구원 수는 1명 이상 20명 이하여야 합니다';
  }
}

export function IsValidHouseholdSize(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidHouseholdSizeConstraint,
    });
  };
}
