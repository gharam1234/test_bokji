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
var MockController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockController = void 0;
const common_1 = require("@nestjs/common");
let MockController = MockController_1 = class MockController {
    constructor() {
        this.logger = new common_1.Logger(MockController_1.name);
    }
    getFavorites(page, limit) {
        this.logger.log('GET /api/favorites (Mock)');
        const currentPage = parseInt(page || '1', 10);
        const pageLimit = parseInt(limit || '20', 10);
        return {
            favorites: [],
            pagination: {
                page: currentPage,
                limit: pageLimit,
                totalCount: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
            },
            meta: {
                categories: [],
                upcomingDeadlines: 0,
            },
        };
    }
    getAnalyticsSummary(period) {
        this.logger.log(`GET /api/analytics/summary (Mock) - period: ${period}`);
        return {
            period: period || 'month',
            totalViews: 0,
            totalSearches: 0,
            totalFavorites: 0,
            recommendationCount: 0,
            topCategories: [],
            recentActivity: [],
        };
    }
    getActivity() {
        this.logger.log('GET /api/analytics/activity (Mock)');
        return {
            items: [],
            total: 0,
        };
    }
    getProfile() {
        this.logger.log('GET /api/profile (Mock)');
        return {
            id: 'mock-user',
            name: '테스트 사용자',
            completionRate: 0,
        };
    }
    getRecommendations() {
        this.logger.log('GET /api/recommendations (Mock)');
        return {
            items: [],
            total: 0,
        };
    }
    getNotifications() {
        this.logger.log('GET /api/notifications (Mock)');
        return {
            notifications: [],
            totalCount: 0,
            unreadCount: 0,
            page: 1,
            limit: 20,
        };
    }
    getUnreadCount() {
        return { count: 0 };
    }
    getWelfareDetail(id) {
        this.logger.log(`GET /api/welfare-programs/${id} (Mock)`);
        const samplePrograms = {
            'WF-2026-001': {
                id: 'WF-2026-001',
                name: '청년 주거 지원금',
                summary: '만 19~34세 청년 대상 월세 지원 프로그램입니다.',
                description: '주거비 부담 경감을 위해 청년에게 월세를 지원하는 사업입니다. 최대 12개월간 지원됩니다.',
                category: 'housing',
                categoryLabel: '주거·금융',
                organization: '국토교통부',
                eligibility: {
                    ageRange: { min: 19, max: 34 },
                    incomeLevel: '중위소득 150% 이하',
                    targetGroups: ['청년'],
                    conditions: ['무주택자', '1인 가구 또는 부모와 별도 거주'],
                },
                benefits: '월 최대 20만원, 최대 12개월 지원',
                benefitAmount: '월 최대 20만원',
                deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                applicationMethods: [
                    { type: 'online', name: '온라인 신청', url: 'https://www.myhome.go.kr' },
                    { type: 'visit', name: '주민센터 방문' },
                ],
                requiredDocuments: ['신분증', '주민등록등본', '소득증빙서류', '임대차계약서'],
                contactInfo: {
                    phone: '1600-0777',
                    website: 'https://www.myhome.go.kr',
                },
            },
            'WF-2026-002': {
                id: 'WF-2026-002',
                name: '청년 취업 성공 패키지',
                summary: '청년 취업 지원 서비스로 직업훈련과 취업알선을 제공합니다.',
                description: '청년 취업 성공 패키지는 취업 의지가 있는 청년에게 직업훈련, 취업알선 등을 제공하는 종합 취업 지원 서비스입니다.',
                category: 'employment',
                categoryLabel: '취업·창업',
                organization: '고용노동부',
                eligibility: {
                    ageRange: { min: 18, max: 34 },
                    incomeLevel: '중위소득 60% 이하',
                    targetGroups: ['청년', '구직자'],
                    conditions: ['취업 의지가 있는 미취업자'],
                },
                benefits: '직업훈련, 취업알선, 취업성공수당 최대 150만원',
                benefitAmount: '최대 150만원',
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                applicationMethods: [
                    { type: 'online', name: '워크넷', url: 'https://www.work.go.kr' },
                    { type: 'visit', name: '고용센터 방문' },
                ],
                requiredDocuments: ['신분증', '구직등록확인서', '소득증빙서류'],
                contactInfo: {
                    phone: '1350',
                    website: 'https://www.work.go.kr',
                },
            },
        };
        const program = samplePrograms[id];
        if (program) {
            return {
                program,
                relatedPrograms: [],
                isBookmarked: false,
            };
        }
        return {
            program: {
                id,
                name: '복지 프로그램',
                summary: '복지 프로그램 상세 정보입니다.',
                description: '이 복지 프로그램에 대한 상세 설명입니다.',
                category: 'other',
                categoryLabel: '기타',
                organization: '정부기관',
                eligibility: {
                    conditions: [],
                },
                benefits: '지원 내용을 확인하세요.',
                applicationMethods: [],
                requiredDocuments: [],
                contactInfo: {},
            },
            relatedPrograms: [],
            isBookmarked: false,
        };
    }
    toggleBookmark(programId) {
        this.logger.log(`POST /api/recommendations/${programId}/bookmark (Mock)`);
        return {
            success: true,
            isBookmarked: true,
            message: '북마크가 추가되었습니다.',
        };
    }
};
exports.MockController = MockController;
__decorate([
    (0, common_1.Get)('favorites'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MockController.prototype, "getFavorites", null);
__decorate([
    (0, common_1.Get)('analytics/summary'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MockController.prototype, "getAnalyticsSummary", null);
__decorate([
    (0, common_1.Get)('analytics/activity'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MockController.prototype, "getActivity", null);
__decorate([
    (0, common_1.Get)('profile'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MockController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('recommendations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MockController.prototype, "getRecommendations", null);
__decorate([
    (0, common_1.Get)('notifications'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MockController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)('notifications/unread-count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MockController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)('welfare-programs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MockController.prototype, "getWelfareDetail", null);
__decorate([
    (0, common_1.Post)('recommendations/:programId/bookmark'),
    __param(0, (0, common_1.Param)('programId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MockController.prototype, "toggleBookmark", null);
exports.MockController = MockController = MockController_1 = __decorate([
    (0, common_1.Controller)('api')
], MockController);
//# sourceMappingURL=mock.controller.js.map