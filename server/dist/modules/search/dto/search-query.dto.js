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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchQueryDto = exports.SEARCH_SORT_OPTIONS = exports.WELFARE_CATEGORIES = void 0;
exports.normalizeSearchQueryDto = normalizeSearchQueryDto;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
exports.WELFARE_CATEGORIES = [
    'employment',
    'housing',
    'education',
    'healthcare',
    'childcare',
    'culture',
    'safety',
    'other',
];
exports.SEARCH_SORT_OPTIONS = [
    'relevance',
    'deadline',
    'latest',
    'popular',
];
class SearchQueryDto {
}
exports.SearchQueryDto = SearchQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "keyword", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "region", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "sortOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SearchQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], SearchQueryDto.prototype, "limit", void 0);
function normalizeSearchQueryDto(dto) {
    return {
        keyword: dto.keyword || '',
        category: dto.category && exports.WELFARE_CATEGORIES.includes(dto.category) ? dto.category : null,
        region: dto.region || null,
        sortBy: dto.sortBy && exports.SEARCH_SORT_OPTIONS.includes(dto.sortBy) ? dto.sortBy : 'relevance',
        sortOrder: dto.sortOrder === 'asc' ? 'asc' : 'desc',
        page: dto.page && dto.page > 0 ? dto.page : 1,
        limit: dto.limit && dto.limit > 0 ? Math.min(dto.limit, 100) : 20,
    };
}
//# sourceMappingURL=search-query.dto.js.map