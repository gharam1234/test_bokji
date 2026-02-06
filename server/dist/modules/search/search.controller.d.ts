import { SearchService } from './search.service';
import { WelfareCategory, SearchSortOption, SortOrder } from './dto/search-query.dto';
import { SearchResponseDto, FilterOptionsResponseDto, SuggestionsResponseDto } from './dto/search-response.dto';
export declare class SearchController {
    private readonly searchService;
    private readonly logger;
    constructor(searchService: SearchService);
    search(keyword?: string, category?: WelfareCategory, region?: string, sortBy?: SearchSortOption, sortOrder?: SortOrder, page?: string, limit?: string): Promise<SearchResponseDto>;
    getFilterOptions(): Promise<FilterOptionsResponseDto>;
    getSuggestions(keyword: string): Promise<SuggestionsResponseDto>;
    incrementViewCount(id: string): Promise<void>;
}
