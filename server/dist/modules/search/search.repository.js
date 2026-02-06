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
var SearchRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchRepository = void 0;
const common_1 = require("@nestjs/common");
const search_query_dto_1 = require("./dto/search-query.dto");
const search_response_dto_1 = require("./dto/search-response.dto");
let SearchRepository = SearchRepository_1 = class SearchRepository {
    constructor() {
        this.logger = new common_1.Logger(SearchRepository_1.name);
        this.welfarePrograms = [];
        this.initializeSampleData();
    }
    async searchPrograms(params, userId) {
        this.logger.debug(`Searching programs with params: ${JSON.stringify(params)}`);
        const startTime = Date.now();
        let filtered = [...this.welfarePrograms];
        if (params.keyword) {
            const keyword = params.keyword.toLowerCase();
            filtered = filtered.filter((p) => p.name.toLowerCase().includes(keyword) ||
                p.summary.toLowerCase().includes(keyword) ||
                p.managing_organization.toLowerCase().includes(keyword));
        }
        if (params.category) {
            filtered = filtered.filter((p) => p.category === params.category);
        }
        if (params.region) {
            filtered = filtered.filter((p) => {
                const regions = p.eligibility_criteria?.region || [];
                return (regions.includes(params.region) ||
                    regions.includes('00') ||
                    regions.length === 0);
            });
        }
        filtered = filtered.map((p) => ({
            ...p,
            relevance_score: this.calculateRelevanceScore(p, params.keyword),
        }));
        filtered = this.sortPrograms(filtered, params.sortBy, params.sortOrder);
        const totalCount = filtered.length;
        const offset = (params.page - 1) * params.limit;
        const paginated = filtered.slice(offset, offset + params.limit);
        const programs = paginated.map((row) => this.toWelfareProgramDto(row, userId));
        const searchTime = Date.now() - startTime;
        this.logger.debug(`Search completed in ${searchTime}ms, found ${totalCount} results`);
        return {
            programs,
            totalCount,
        };
    }
    async countByCategory() {
        this.logger.debug('Counting programs by category');
        const counts = new Map();
        for (const category of search_query_dto_1.WELFARE_CATEGORIES) {
            const count = this.welfarePrograms.filter((p) => p.category === category).length;
            counts.set(category, count);
        }
        return Array.from(counts.entries()).map(([category, count]) => ({
            category,
            count,
        }));
    }
    async findSuggestions(keyword, limit = 10) {
        if (!keyword || keyword.length < 2) {
            return [];
        }
        const lowerKeyword = keyword.toLowerCase();
        const suggestions = new Set();
        for (const program of this.welfarePrograms) {
            if (suggestions.size >= limit)
                break;
            if (program.name.toLowerCase().includes(lowerKeyword)) {
                suggestions.add(program.name);
            }
        }
        return Array.from(suggestions).slice(0, limit);
    }
    async incrementViewCount(programId) {
        const program = this.welfarePrograms.find((p) => p.id === programId);
        if (program) {
            program.view_count += 1;
        }
    }
    calculateRelevanceScore(program, keyword) {
        if (!keyword)
            return 1.0;
        const lowerKeyword = keyword.toLowerCase();
        let score = 0;
        if (program.name.toLowerCase().includes(lowerKeyword)) {
            score += 0.5;
            if (program.name.toLowerCase().startsWith(lowerKeyword)) {
                score += 0.2;
            }
        }
        if (program.summary.toLowerCase().includes(lowerKeyword)) {
            score += 0.2;
        }
        if (program.managing_organization.toLowerCase().includes(lowerKeyword)) {
            score += 0.1;
        }
        return Math.min(score, 1.0);
    }
    sortPrograms(programs, sortBy, sortOrder) {
        const multiplier = sortOrder === 'asc' ? 1 : -1;
        return programs.sort((a, b) => {
            switch (sortBy) {
                case 'relevance':
                    return ((b.relevance_score || 0) - (a.relevance_score || 0)) * multiplier;
                case 'deadline':
                    if (!a.application_end_date && !b.application_end_date)
                        return 0;
                    if (!a.application_end_date)
                        return 1;
                    if (!b.application_end_date)
                        return -1;
                    return ((new Date(a.application_end_date).getTime() -
                        new Date(b.application_end_date).getTime()) *
                        multiplier);
                case 'latest':
                    return ((new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) *
                        multiplier);
                case 'popular':
                    return (b.view_count - a.view_count) * multiplier;
                default:
                    return 0;
            }
        });
    }
    toWelfareProgramDto(row, userId) {
        const regionCode = row.eligibility_criteria?.region?.[0] || '00';
        return {
            id: row.id,
            name: row.name,
            summary: row.summary,
            description: row.description,
            category: row.category,
            categoryLabel: search_response_dto_1.CATEGORY_LABELS[row.category] || '기타',
            organization: row.managing_organization,
            regionCode,
            regionName: (0, search_response_dto_1.getRegionName)(regionCode),
            eligibility: {
                ageRange: row.eligibility_criteria?.ageRange,
                incomeLevel: row.eligibility_criteria?.incomeLevel,
                targetGroups: row.eligibility_criteria?.targetGroups,
                region: row.eligibility_criteria?.region,
                conditions: row.eligibility_criteria?.conditions,
            },
            benefits: row.benefits,
            benefitAmount: row.benefit_amount,
            deadline: row.application_end_date
                ? row.application_end_date.toISOString().split('T')[0]
                : null,
            dDay: (0, search_response_dto_1.calculateDDay)(row.application_end_date),
            applicationUrl: row.source_url,
            viewCount: row.view_count,
            createdAt: row.created_at.toISOString(),
            isBookmarked: false,
            relevanceScore: row.relevance_score || 0,
        };
    }
    initializeSampleData() {
        const now = new Date();
        this.welfarePrograms = [
            {
                id: 'WF-2026-001',
                name: '청년 주거 지원금',
                summary: '만 19~34세 청년 대상 월세 지원 프로그램입니다.',
                description: '주거비 부담 경감을 위해 청년에게 월세를 지원하는 사업입니다. 최대 12개월간 지원됩니다.',
                category: 'housing',
                managing_organization: '국토교통부',
                eligibility_criteria: {
                    ageRange: { min: 19, max: 34 },
                    incomeLevel: '중위소득 150% 이하',
                    targetGroups: ['청년'],
                    region: ['11'],
                },
                benefits: '월 최대 20만원, 최대 12개월 지원',
                benefit_amount: '월 최대 20만원',
                application_end_date: new Date(now.getTime() + 55 * 24 * 60 * 60 * 1000),
                source_url: 'https://www.myhome.go.kr',
                view_count: 1234,
                created_at: new Date('2026-01-15'),
            },
            {
                id: 'WF-2026-002',
                name: '청년 취업 성공 패키지',
                summary: '청년 취업 지원 서비스로 직업훈련과 취업알선을 제공합니다.',
                description: '청년 취업 성공 패키지는 취업 의지가 있는 청년에게 직업훈련, 취업알선 등을 제공하는 종합 취업 지원 서비스입니다.',
                category: 'employment',
                managing_organization: '고용노동부',
                eligibility_criteria: {
                    ageRange: { min: 18, max: 34 },
                    incomeLevel: '중위소득 60% 이하',
                    targetGroups: ['청년', '구직자'],
                    region: ['00'],
                },
                benefits: '직업훈련, 취업알선, 취업성공수당 최대 150만원',
                benefit_amount: '최대 150만원',
                application_end_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
                source_url: 'https://www.work.go.kr',
                view_count: 2567,
                created_at: new Date('2026-01-20'),
            },
            {
                id: 'WF-2026-003',
                name: '노인 돌봄 기본 서비스',
                summary: '65세 이상 어르신 대상 가정방문 돌봄 서비스입니다.',
                description: '일상생활 영위가 어려운 노인에게 가정을 방문하여 안전확인, 생활교육, 서비스연계 등을 제공합니다.',
                category: 'healthcare',
                managing_organization: '보건복지부',
                eligibility_criteria: {
                    ageRange: { min: 65 },
                    targetGroups: ['노인'],
                    region: ['00'],
                },
                benefits: '주 1회 가정방문 돌봄 서비스 제공',
                application_end_date: null,
                source_url: 'https://www.bokjiro.go.kr',
                view_count: 890,
                created_at: new Date('2026-01-10'),
            },
            {
                id: 'WF-2026-004',
                name: '아이돌봄 서비스',
                summary: '맞벌이 가정 자녀 돌봄 지원 서비스입니다.',
                description: '부모의 맞벌이 등으로 양육공백이 발생한 가정에 아이돌보미가 직접 방문하여 돌봄 서비스를 제공합니다.',
                category: 'childcare',
                managing_organization: '여성가족부',
                eligibility_criteria: {
                    targetGroups: ['영유아', '아동'],
                    incomeLevel: '맞벌이 가정',
                    region: ['00'],
                },
                benefits: '시간당 돌봄 서비스 (정부 지원금 적용)',
                application_end_date: null,
                source_url: 'https://www.idolbom.go.kr',
                view_count: 1456,
                created_at: new Date('2026-01-05'),
            },
            {
                id: 'WF-2026-005',
                name: '국가장학금 1유형',
                summary: '소득 연계 대학 등록금 지원 장학금입니다.',
                description: '대학생의 등록금 부담 경감을 위해 소득 수준에 따라 차등 지원하는 국가장학금입니다.',
                category: 'education',
                managing_organization: '한국장학재단',
                eligibility_criteria: {
                    targetGroups: ['대학생'],
                    incomeLevel: '기준 중위소득 200% 이하',
                    region: ['00'],
                },
                benefits: '연간 최대 700만원 등록금 지원',
                benefit_amount: '연간 최대 700만원',
                application_end_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
                source_url: 'https://www.kosaf.go.kr',
                view_count: 3456,
                created_at: new Date('2026-02-01'),
            },
            {
                id: 'WF-2026-006',
                name: '청년 문화누리카드',
                summary: '문화·예술 활동 지원을 위한 카드형 바우처입니다.',
                description: '청년의 문화·예술 활동 지원을 위해 연간 10만원 상당의 문화누리카드를 지원합니다.',
                category: 'culture',
                managing_organization: '문화체육관광부',
                eligibility_criteria: {
                    ageRange: { min: 19, max: 34 },
                    incomeLevel: '기준 중위소득 80% 이하',
                    targetGroups: ['청년'],
                    region: ['00'],
                },
                benefits: '연간 10만원 문화바우처 지급',
                benefit_amount: '연간 10만원',
                application_end_date: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
                source_url: 'https://www.munhwa.or.kr',
                view_count: 678,
                created_at: new Date('2026-01-25'),
            },
            {
                id: 'WF-2026-007',
                name: '저소득층 에너지 바우처',
                summary: '취약계층 냉난방비 지원 바우처입니다.',
                description: '에너지 취약계층의 냉난방비 부담 경감을 위해 에너지 바우처를 지원합니다.',
                category: 'safety',
                managing_organization: '산업통상자원부',
                eligibility_criteria: {
                    incomeLevel: '기준 중위소득 40% 이하',
                    targetGroups: ['저소득층', '노인', '장애인'],
                    region: ['00'],
                },
                benefits: '하절기·동절기 에너지 바우처 지급',
                benefit_amount: '연간 최대 69만원',
                application_end_date: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
                source_url: 'https://www.energyb.or.kr',
                view_count: 567,
                created_at: new Date('2026-01-18'),
            },
            {
                id: 'WF-2026-008',
                name: '신혼부부 전세자금 대출',
                summary: '신혼부부 전세자금 저금리 대출 지원입니다.',
                description: '무주택 신혼부부의 주거안정을 위해 전세자금을 저금리로 대출해 드립니다.',
                category: 'housing',
                managing_organization: '국토교통부',
                eligibility_criteria: {
                    targetGroups: ['신혼부부'],
                    incomeLevel: '부부합산 연소득 7천만원 이하',
                    region: ['00'],
                },
                benefits: '최대 2억원, 연 1.5~2.5% 금리',
                benefit_amount: '최대 2억원',
                application_end_date: null,
                source_url: 'https://www.myhome.go.kr',
                view_count: 2345,
                created_at: new Date('2026-01-12'),
            },
            {
                id: 'WF-2026-009',
                name: '경기도 청년 기본소득',
                summary: '경기도 거주 청년 대상 분기별 기본소득 지급입니다.',
                description: '경기도에 거주하는 만 24세 청년에게 분기별 25만원의 지역화폐를 지급합니다.',
                category: 'other',
                managing_organization: '경기도청',
                eligibility_criteria: {
                    ageRange: { min: 24, max: 24 },
                    targetGroups: ['청년'],
                    region: ['41'],
                    conditions: ['경기도 3년 이상 거주'],
                },
                benefits: '분기별 25만원 지역화폐 지급 (연간 100만원)',
                benefit_amount: '연간 100만원',
                application_end_date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
                source_url: 'https://www.gg.go.kr',
                view_count: 4567,
                created_at: new Date('2026-01-28'),
            },
            {
                id: 'WF-2026-010',
                name: '장애인 활동지원 서비스',
                summary: '장애인의 자립생활 지원을 위한 활동보조 서비스입니다.',
                description: '장애인의 일상생활 및 사회활동 지원을 위해 활동보조인이 서비스를 제공합니다.',
                category: 'healthcare',
                managing_organization: '보건복지부',
                eligibility_criteria: {
                    targetGroups: ['장애인'],
                    conditions: ['6세 이상 65세 미만', '장애등급 1~3급'],
                    region: ['00'],
                },
                benefits: '월 최대 409시간 활동보조 서비스',
                application_end_date: null,
                source_url: 'https://www.bokjiro.go.kr',
                view_count: 1123,
                created_at: new Date('2026-01-08'),
            },
        ];
        this.logger.log(`Initialized ${this.welfarePrograms.length} sample welfare programs`);
    }
};
exports.SearchRepository = SearchRepository;
exports.SearchRepository = SearchRepository = SearchRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SearchRepository);
//# sourceMappingURL=search.repository.js.map