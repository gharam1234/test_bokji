import { NormalizedSearchParams, WelfareCategory } from './dto/search-query.dto';
import { WelfareProgramDto } from './dto/search-response.dto';
export interface SearchResult {
    programs: WelfareProgramDto[];
    totalCount: number;
}
export interface CategoryCount {
    category: WelfareCategory;
    count: number;
}
export declare class SearchRepository {
    private readonly logger;
    private welfarePrograms;
    constructor();
    searchPrograms(params: NormalizedSearchParams, userId?: string): Promise<SearchResult>;
    countByCategory(): Promise<CategoryCount[]>;
    findSuggestions(keyword: string, limit?: number): Promise<string[]>;
    incrementViewCount(programId: string): Promise<void>;
    private calculateRelevanceScore;
    private sortPrograms;
    private toWelfareProgramDto;
    private initializeSampleData;
}
