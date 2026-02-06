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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SearchController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const search_service_1 = require("./search.service");
let SearchController = SearchController_1 = class SearchController {
    constructor(searchService) {
        this.searchService = searchService;
        this.logger = new common_1.Logger(SearchController_1.name);
    }
    async search(keyword, category, region, sortBy, sortOrder, page, limit) {
        this.logger.log(`GET /api/search - keyword: ${keyword}, category: ${category}`);
        const dto = {
            keyword,
            category,
            region,
            sortBy,
            sortOrder,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        };
        return this.searchService.search(dto);
    }
    async getFilterOptions() {
        this.logger.log('GET /api/search/filters');
        return this.searchService.getFilterOptions();
    }
    async getSuggestions(keyword) {
        this.logger.log(`GET /api/search/suggestions - keyword: ${keyword}`);
        return this.searchService.getSuggestions(keyword);
    }
    async incrementViewCount(id) {
        this.logger.log(`GET /api/search/programs/${id}/view`);
        await this.searchService.incrementViewCount(id);
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)('keyword')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('region')),
    __param(3, (0, common_1.Query)('sortBy')),
    __param(4, (0, common_1.Query)('sortOrder')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('filters'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "getFilterOptions", null);
__decorate([
    (0, common_1.Get)('suggestions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "getSuggestions", null);
__decorate([
    (0, common_1.Get)('programs/:id/view'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "incrementViewCount", null);
exports.SearchController = SearchController = SearchController_1 = __decorate([
    (0, common_1.Controller)('api/search'),
    __metadata("design:paramtypes", [search_service_1.SearchService])
], SearchController);
//# sourceMappingURL=search.controller.js.map