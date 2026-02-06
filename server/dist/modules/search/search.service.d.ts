import { SearchRepository } from './search.repository';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResponseDto, FilterOptionsResponseDto, SuggestionsResponseDto } from './dto/search-response.dto';
export declare class SearchService {
    private readonly repo;
    private readonly logger;
    constructor(repo: SearchRepository);
    search(dto: SearchQueryDto, userId?: string): Promise<SearchResponseDto>;
    getFilterOptions(): Promise<FilterOptionsResponseDto>;
    getSuggestions(keyword: string): Promise<SuggestionsResponseDto>;
    incrementViewCount(programId: string): Promise<void>;
    private buildAppliedFilters;
    private findHighlightRanges;
}
