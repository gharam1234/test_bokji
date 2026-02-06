"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const search_repository_1 = require("./search.repository");
const search_query_dto_1 = require("./dto/search-query.dto");
const search_response_dto_1 = require("./dto/search-response.dto");
const SIDO_LIST = [
    { code: '11', name: '서울특별시', type: 'sido' },
    { code: '26', name: '부산광역시', type: 'sido' },
    { code: '27', name: '대구광역시', type: 'sido' },
    { code: '28', name: '인천광역시', type: 'sido' },
    { code: '29', name: '광주광역시', type: 'sido' },
    { code: '30', name: '대전광역시', type: 'sido' },
    { code: '31', name: '울산광역시', type: 'sido' },
    { code: '36', name: '세종특별자치시', type: 'sido' },
    { code: '41', name: '경기도', type: 'sido' },
    { code: '42', name: '강원도', type: 'sido' },
    { code: '43', name: '충청북도', type: 'sido' },
    { code: '44', name: '충청남도', type: 'sido' },
    { code: '45', name: '전라북도', type: 'sido' },
    { code: '46', name: '전라남도', type: 'sido' },
    { code: '47', name: '경상북도', type: 'sido' },
    { code: '48', name: '경상남도', type: 'sido' },
    { code: '50', name: '제주특별자치도', type: 'sido' },
];
let SearchService = SearchService_1 = class SearchService {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(SearchService_1.name);
    }
    async search(dto, userId) {
        const startTime = Date.now();
        const params = (0, search_query_dto_1.normalizeSearchQueryDto)(dto);
        this.logger.log(`Searching with params: ${JSON.stringify(params)}`);
        const { programs, totalCount } = await this.repo.searchPrograms(params, userId);
        const pagination = (0, search_response_dto_1.createPagination)(params.page, params.limit, totalCount);
        const appliedFilters = this.buildAppliedFilters(params);
        const searchTime = Date.now() - startTime;
        this.logger.log(`Search completed: ${totalCount} results in ${searchTime}ms`);
        return {
            results: programs,
            pagination,
            meta: {
                keyword: params.keyword,
                appliedFilters,
                searchTime,
            },
        };
    }
    async getFilterOptions() {
        this.logger.debug('Getting filter options');
        const categoryCounts = await this.repo.countByCategory();
        const categories = search_query_dto_1.WELFARE_CATEGORIES.map((category) => {
            const countInfo = categoryCounts.find((c) => c.category === category);
            return {
                value: category,
                label: search_response_dto_1.CATEGORY_LABELS[category],
                count: countInfo?.count || 0,
            };
        }).filter((c) => c.count > 0);
        categories.sort((a, b) => b.count - a.count);
        return {
            categories,
            regions: SIDO_LIST,
        };
    }
    async getSuggestions(keyword) {
        if (!keyword || keyword.length < 2) {
            return { suggestions: [] };
        }
        this.logger.debug(`Getting suggestions for: ${keyword}`);
        const programNames = await this.repo.findSuggestions(keyword, 10);
        const suggestions = programNames.map((text) => ({
            text,
            type: 'program',
            highlightRanges: this.findHighlightRanges(text, keyword),
        }));
        return { suggestions };
    }
    async incrementViewCount(programId) {
        await this.repo.incrementViewCount(programId);
    }
    buildAppliedFilters(params) {
        const filters = {
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
        };
        if (params.category) {
            filters.category = params.category;
            filters.categoryLabel = search_response_dto_1.CATEGORY_LABELS[params.category];
        }
        if (params.region) {
            const regionName = search_response_dto_1.SIDO_NAMES[params.region] || search_response_dto_1.SIDO_NAMES[params.region.substring(0, 2)];
            filters.region = {
                code: params.region,
                name: regionName || '전국',
                type: params.region.length === 2 ? 'sido' : 'sigungu',
            };
        }
        return filters;
    }
    findHighlightRanges(text, keyword) {
        const ranges = [];
        const lowerText = text.toLowerCase();
        const lowerKeyword = keyword.toLowerCase();
        let startIndex = 0;
        while (true) {
            const index = lowerText.indexOf(lowerKeyword, startIndex);
            if (index === -1)
                break;
            ranges.push([index, index + keyword.length]);
            startIndex = index + keyword.length;
        }
        return ranges;
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = SearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [search_repository_1.SearchRepository])
], SearchService);
//# sourceMappingURL=search.service.js.map