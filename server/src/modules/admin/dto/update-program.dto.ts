/**
 * 프로그램 수정 DTO
 * 복지 프로그램 수정 요청 데이터 검증
 */

import {
  CreateProgramDto,
  ProgramCategory,
  TargetGroup,
  EligibilityCriteria,
  ApplicationMethod,
  ContactInfo,
  VALID_CATEGORIES,
  VALID_TARGET_GROUPS,
} from './create-program.dto';

/** 프로그램 수정 DTO */
export interface UpdateProgramDto extends Partial<CreateProgramDto> {
  /** Optimistic Locking용 버전 번호 (필수) */
  version: number;
}

/** 프로그램 수정 DTO 유효성 검사 */
export function validateUpdateProgramDto(data: unknown): UpdateProgramDto {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request body');
  }

  const dto = data as Record<string, unknown>;

  // 버전 필수 검증 (Optimistic Locking)
  if (typeof dto.version !== 'number' || dto.version < 1) {
    throw new Error('버전 정보가 필요합니다.');
  }

  const result: UpdateProgramDto = {
    version: dto.version,
  };

  // 선택적 필드 검증
  if (dto.name !== undefined) {
    if (typeof dto.name !== 'string' || dto.name.trim().length < 2) {
      throw new Error('프로그램명은 최소 2자 이상이어야 합니다.');
    }
    result.name = dto.name.trim();
  }

  if (dto.description !== undefined) {
    if (typeof dto.description !== 'string' || dto.description.trim().length < 10) {
      throw new Error('상세 설명은 최소 10자 이상이어야 합니다.');
    }
    result.description = dto.description.trim();
  }

  if (dto.summary !== undefined) {
    if (typeof dto.summary !== 'string' || dto.summary.trim().length < 5) {
      throw new Error('요약 설명은 최소 5자 이상이어야 합니다.');
    }
    result.summary = dto.summary.trim();
  }

  if (dto.category !== undefined) {
    if (!VALID_CATEGORIES.includes(dto.category as ProgramCategory)) {
      throw new Error(`유효하지 않은 카테고리입니다. 유효한 값: ${VALID_CATEGORIES.join(', ')}`);
    }
    result.category = dto.category as ProgramCategory;
  }

  if (dto.targetGroups !== undefined) {
    if (!Array.isArray(dto.targetGroups) || dto.targetGroups.length === 0) {
      throw new Error('최소 하나의 대상 그룹을 선택해야 합니다.');
    }
    for (const group of dto.targetGroups) {
      if (!VALID_TARGET_GROUPS.includes(group as TargetGroup)) {
        throw new Error(`유효하지 않은 대상 그룹입니다: ${group}`);
      }
    }
    result.targetGroups = dto.targetGroups as TargetGroup[];
  }

  if (dto.eligibilityCriteria !== undefined) {
    if (typeof dto.eligibilityCriteria !== 'object') {
      throw new Error('자격 조건은 객체 형태여야 합니다.');
    }
    result.eligibilityCriteria = dto.eligibilityCriteria as EligibilityCriteria;
  }

  if (dto.applicationMethod !== undefined) {
    if (typeof dto.applicationMethod !== 'object') {
      throw new Error('신청 방법은 객체 형태여야 합니다.');
    }
    result.applicationMethod = dto.applicationMethod as ApplicationMethod;
  }

  if (dto.requiredDocuments !== undefined) {
    result.requiredDocuments = dto.requiredDocuments as string[];
  }

  if (dto.contactInfo !== undefined) {
    result.contactInfo = dto.contactInfo as ContactInfo | null;
  }

  if (dto.managingOrganization !== undefined) {
    if (typeof dto.managingOrganization !== 'string') {
      throw new Error('관리 기관은 문자열이어야 합니다.');
    }
    result.managingOrganization = dto.managingOrganization.trim();
  }

  if (dto.benefits !== undefined) {
    if (typeof dto.benefits !== 'string') {
      throw new Error('혜택은 문자열이어야 합니다.');
    }
    result.benefits = dto.benefits.trim();
  }

  if (dto.benefitAmount !== undefined) {
    result.benefitAmount = dto.benefitAmount as string | null;
  }

  if (dto.applicationStartDate !== undefined) {
    result.applicationStartDate = dto.applicationStartDate as string | null;
  }

  if (dto.applicationEndDate !== undefined) {
    result.applicationEndDate = dto.applicationEndDate as string | null;
  }

  if (dto.isAlwaysOpen !== undefined) {
    result.isAlwaysOpen = dto.isAlwaysOpen as boolean;
  }

  if (dto.sourceUrl !== undefined) {
    result.sourceUrl = dto.sourceUrl as string | null;
  }

  if (dto.tags !== undefined) {
    result.tags = dto.tags as string[];
  }

  if (dto.isActive !== undefined) {
    result.isActive = dto.isActive as boolean;
  }

  return result;
}
