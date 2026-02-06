export type WelfareCategory = 'employment' | 'housing' | 'education' | 'healthcare' | 'childcare' | 'culture' | 'safety' | 'other';
export declare const WELFARE_CATEGORIES: WelfareCategory[];
export type SearchSortOption = 'relevance' | 'deadline' | 'latest' | 'popular';
export declare const SEARCH_SORT_OPTIONS: SearchSortOption[];
export type SortOrder = 'asc' | 'desc';
export declare class SearchQueryDto {
    keyword?: string;
    category?: WelfareCategory;
    region?: string;
    sortBy?: SearchSortOption;
    sortOrder?: SortOrder;
    page?: number;
    limit?: number;
}
export interface NormalizedSearchParams {
    keyword: string;
    category: WelfareCategory | null;
    region: string | null;
    sortBy: SearchSortOption;
    sortOrder: SortOrder;
    page: number;
    limit: number;
}
export declare function normalizeSearchQueryDto(dto: SearchQueryDto): NormalizedSearchParams;
