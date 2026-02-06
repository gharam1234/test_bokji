/**
 * 복지 상세 응답 DTO
 */

import {
  WelfareProgram,
  WelfareCategory,
  CATEGORY_LABELS,
  ApplicationMethod,
  RequiredDocument,
  ContactInfo,
} from '../entities/welfare-program.entity';
import { MatchReason } from '../entities/recommendation.entity';

/** 관련 복지 프로그램 */
export interface RelatedProgramDto {
  id: string;
  name: string;
  category: WelfareCategory;
  categoryLabel: string;
  matchScore: number;
}

/** 복지 프로그램 상세 DTO */
export interface WelfareProgramDetailDto {
  id: string;
  name: string;
  description: string;
  summary: string;
  category: WelfareCategory;
  categoryLabel: string;
  targetGroups: string[];
  applicationMethod: ApplicationMethod;
  requiredDocuments: RequiredDocument[];
  contactInfo: ContactInfo | null;
  benefits: string;
  benefitAmount?: string | null;
  applicationStartDate?: string | null;
  applicationEndDate?: string | null;
  isAlwaysOpen: boolean;
  managingOrganization: string;
  sourceUrl?: string | null;
  tags: string[];
}

/** 복지 상세 응답 */
export interface WelfareDetailResponseDto {
  program: WelfareProgramDetailDto;
  matchScore: number;
  matchReasons: MatchReason[];
  isBookmarked: boolean;
  relatedPrograms: RelatedProgramDto[];
}

/**
 * WelfareProgram을 상세 DTO로 변환
 */
export function toWelfareProgramDetailDto(
  program: WelfareProgram,
): WelfareProgramDetailDto {
  return {
    id: program.id,
    name: program.name,
    description: program.description,
    summary: program.summary,
    category: program.category,
    categoryLabel: CATEGORY_LABELS[program.category],
    targetGroups: program.targetGroups,
    applicationMethod: program.applicationMethod,
    requiredDocuments: program.requiredDocuments,
    contactInfo: program.contactInfo,
    benefits: program.benefits,
    benefitAmount: program.benefitAmount,
    applicationStartDate: program.applicationStartDate?.toISOString() || null,
    applicationEndDate: program.applicationEndDate?.toISOString() || null,
    isAlwaysOpen: program.isAlwaysOpen,
    managingOrganization: program.managingOrganization,
    sourceUrl: program.sourceUrl,
    tags: program.tags,
  };
}
