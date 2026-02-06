import { WelfareCategory, SearchSortOption } from './search-query.dto';
export interface EligibilityInfoDto {
    ageRange?: {
        min?: number;
        max?: number;
    };
    incomeLevel?: string;
    targetGroups?: string[];
    region?: string[];
    conditions?: string[];
}
export interface BenefitInfoDto {
    type: 'cash' | 'service' | 'voucher' | 'mixed';
    amount?: string;
    description: string;
}
export interface WelfareProgramDto {
    id: string;
    name: string;
    summary: string;
    description: string;
    category: WelfareCategory;
    categoryLabel: string;
    organization: string;
    regionCode: string;
    regionName: string;
    eligibility: EligibilityInfoDto;
    benefits: string;
    benefitAmount?: string;
    deadline: string | null;
    dDay: number | null;
    applicationUrl: string | null;
    viewCount: number;
    createdAt: string;
    isBookmarked: boolean;
    relevanceScore: number;
}
export interface PaginationDto {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface RegionInfoDto {
    code: string;
    name: string;
    type: 'sido' | 'sigungu' | 'all';
}
export interface AppliedFiltersDto {
    category?: WelfareCategory;
    categoryLabel?: string;
    region?: RegionInfoDto;
    sortBy: SearchSortOption;
    sortOrder: 'asc' | 'desc';
}
export interface SearchMetaDto {
    keyword: string;
    appliedFilters: AppliedFiltersDto;
    searchTime: number;
}
export interface SearchResponseDto {
    results: WelfareProgramDto[];
    pagination: PaginationDto;
    meta: SearchMetaDto;
}
export interface CategoryOptionDto {
    value: WelfareCategory;
    label: string;
    count: number;
}
export interface RegionOptionDto {
    code: string;
    name: string;
    type: 'sido' | 'sigungu';
    parentCode?: string;
}
export interface FilterOptionsResponseDto {
    categories: CategoryOptionDto[];
    regions: RegionOptionDto[];
}
export interface SuggestionDto {
    text: string;
    type: 'program' | 'category' | 'organization';
    highlightRanges?: [number, number][];
}
export interface SuggestionsResponseDto {
    suggestions: SuggestionDto[];
}
export declare const CATEGORY_LABELS: Record<WelfareCategory, string>;
export declare const SIDO_NAMES: Record<string, string>;
export declare function calculateDDay(deadline: Date | string | null): number | null;
export declare function getRegionName(code: string): string;
export declare function createPagination(page: number, limit: number, totalCount: number): PaginationDto;
