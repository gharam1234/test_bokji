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
var PublicWelfareController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicWelfareController = void 0;
const common_1 = require("@nestjs/common");
const fast_xml_parser_1 = require("fast-xml-parser");
const API_BASE_URL = 'https://apis.data.go.kr/B554287/NationalWelfareInformationsV001';
const LOCAL_API_BASE_URL = 'https://apis.data.go.kr/B554287/LocalGovernmentWelfareInformations';
const API_KEY = process.env.DATA_GO_KR_API_KEY || '';
const xmlParser = new fast_xml_parser_1.XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
});
const LIFE_CYCLE_MAP = {
    'infant': '001',
    'child': '002',
    'youth': '003',
    'young_adult': '004',
    'middle_age': '005',
    'senior': '006',
};
const CATEGORY_LABELS = {
    'employment': '취업·창업',
    'housing': '주거·금융',
    'education': '교육',
    'healthcare': '건강·의료',
    'childcare': '임신·육아',
    'culture': '문화·생활',
    'safety': '안전·환경',
    'other': '기타',
};
let PublicWelfareController = PublicWelfareController_1 = class PublicWelfareController {
    constructor() {
        this.logger = new common_1.Logger(PublicWelfareController_1.name);
    }
    async search(keyword, lifeCycle, page, limit) {
        const pageNum = parseInt(page || '1', 10);
        const pageSize = parseInt(limit || '20', 10);
        this.logger.log(`GET /api/public-welfare/search - keyword: ${keyword}, lifeCycle: ${lifeCycle}`);
        try {
            const encodedApiKey = encodeURIComponent(API_KEY);
            const centralSearchKeyCodes = keyword ? ['001', '002', '003'] : ['001'];
            const localSearchKeyCodes = keyword ? ['001', '002', '003'] : [undefined];
            const fetchCentralByCode = async (code) => {
                let url = `${API_BASE_URL}/NationalWelfarelistV001?serviceKey=${encodedApiKey}&srchKeyCode=${code}&pageNo=${pageNum}&numOfRows=${pageSize}`;
                if (keyword) {
                    url += `&searchWrd=${encodeURIComponent(keyword)}`;
                }
                if (lifeCycle && LIFE_CYCLE_MAP[lifeCycle]) {
                    url += `&lifeArray=${LIFE_CYCLE_MAP[lifeCycle]}`;
                }
                this.logger.log(`Fetching: ${url.replace(encodedApiKey, 'API_KEY_HIDDEN')}`);
                const response = await fetch(url);
                const xmlText = await response.text();
                this.logger.log(`Response status: ${response.status}`);
                this.logger.log(`Raw response (first 500 chars): ${xmlText.substring(0, 500)}`);
                const parsed = xmlParser.parse(xmlText);
                const wantedList = parsed?.wantedList;
                if (!wantedList || wantedList.resultCode !== 0) {
                    this.logger.warn(`API Error (${code}): ${wantedList?.resultMessage || 'Unknown error'}`);
                    return { items: [], totalCount: 0 };
                }
                const totalCount = parseInt(wantedList.totalCount || '0', 10);
                const items = wantedList.servList;
                const rawItems = items ? (Array.isArray(items) ? items : [items]) : [];
                return { items: rawItems, totalCount };
            };
            const fetchLocalByCode = async (code) => {
                let url = `${LOCAL_API_BASE_URL}/LcgvWelfarelist?serviceKey=${encodedApiKey}&pageNo=${pageNum}&numOfRows=${pageSize}`;
                if (code) {
                    url += `&srchKeyCode=${code}`;
                }
                if (keyword) {
                    url += `&searchWrd=${encodeURIComponent(keyword)}`;
                }
                if (lifeCycle && LIFE_CYCLE_MAP[lifeCycle]) {
                    url += `&lifeArray=${LIFE_CYCLE_MAP[lifeCycle]}`;
                }
                this.logger.log(`Fetching local: ${url.replace(encodedApiKey, 'API_KEY_HIDDEN')}`);
                const response = await fetch(url);
                const xmlText = await response.text();
                this.logger.log(`Local response status: ${response.status}`);
                this.logger.log(`Local raw response (first 500 chars): ${xmlText.substring(0, 500)}`);
                const parsed = xmlParser.parse(xmlText);
                const wantedList = parsed?.wantedList;
                if (wantedList) {
                    if (wantedList.resultCode !== 0 && wantedList.resultCode !== '0') {
                        this.logger.warn(`Local API Error (${code || 'all'}): ${wantedList?.resultMessage || 'Unknown error'}`);
                        return { items: [], totalCount: 0 };
                    }
                    const totalCount = parseInt(wantedList.totalCount || '0', 10);
                    const items = wantedList.servList;
                    const rawItems = items ? (Array.isArray(items) ? items : [items]) : [];
                    return { items: rawItems, totalCount };
                }
                const responseBody = parsed?.response?.body;
                if (!responseBody) {
                    this.logger.warn('Local API Error: Invalid response structure');
                    return { items: [], totalCount: 0 };
                }
                const totalCount = parseInt(responseBody.totalCount || '0', 10);
                const items = responseBody.items?.item;
                const rawItems = items ? (Array.isArray(items) ? items : [items]) : [];
                return { items: rawItems, totalCount };
            };
            const [centralSettled, localSettled] = await Promise.all([
                Promise.allSettled(centralSearchKeyCodes.map((code) => fetchCentralByCode(code))),
                Promise.allSettled(localSearchKeyCodes.map((code) => fetchLocalByCode(code))),
            ]);
            const centralResponses = centralSettled
                .filter((result) => result.status === 'fulfilled')
                .map((result) => result.value);
            const localResponses = localSettled
                .filter((result) => result.status === 'fulfilled')
                .map((result) => result.value);
            const totalCount = centralResponses.reduce((sum, current) => sum + current.totalCount, 0) +
                localResponses.reduce((sum, current) => sum + current.totalCount, 0);
            const deduped = new Map();
            centralResponses.forEach((response) => {
                response.items.forEach((item) => {
                    if (!deduped.has(item.servId)) {
                        deduped.set(item.servId, { ...item, __source: 'central' });
                    }
                });
            });
            localResponses.forEach((response) => {
                response.items.forEach((item) => {
                    const localId = `LG-${item.servId}`;
                    if (!deduped.has(localId)) {
                        deduped.set(localId, { ...item, __source: 'local', __id: localId });
                    }
                });
            });
            const rawPrograms = Array.from(deduped.values());
            const pagedPrograms = rawPrograms.slice(0, pageSize);
            const programs = pagedPrograms.map((item) => {
                if (item.__source === 'local') {
                    const regionName = [item.ctpvNm, item.sggNm].filter(Boolean).join(' ');
                    return {
                        id: item.__id || `LG-${item.servId}`,
                        name: item.servNm || '',
                        summary: item.servDgst || item.sprtTrgtCn || '',
                        description: item.servDgst || item.alwServCn || '',
                        category: this.mapCategory(item.intrsThemaNmArray || item.intrsThemaArray),
                        categoryLabel: item.intrsThemaNmArray || item.intrsThemaArray || '기타',
                        organization: item.bizChrDeptNm || item.ctpvNm || '',
                        organizationDept: item.bizChrDeptNm || '',
                        regionCode: item.ctpvNm || '',
                        regionName: regionName || '전국',
                        eligibility: {
                            targetGroups: item.trgterIndvdlNmArray
                                ? String(item.trgterIndvdlNmArray).split(',')
                                : [],
                            lifeCycle: item.lifeNmArray ? String(item.lifeNmArray).split(',') : [],
                            conditions: item.slctCritCn ? [item.slctCritCn] : [],
                        },
                        benefits: item.alwServCn || item.servDgst || '',
                        supportCycle: item.sprtCycNm || '',
                        supportType: item.srvPvsnNm || '',
                        contactPhone: '',
                        detailUrl: item.servDtlLink || '',
                        onlineApplicationAvailable: Boolean(item.servDtlLink || item.aplyMtdNm),
                        deadline: null,
                        dDay: null,
                        applicationUrl: item.servDtlLink || null,
                        viewCount: parseInt(item.inqNum || '0', 10),
                        createdAt: item.lastModYmd || new Date().toISOString(),
                        isBookmarked: false,
                        relevanceScore: 0.8,
                    };
                }
                return {
                    id: item.servId,
                    name: item.servNm || '',
                    summary: item.servDgst || '',
                    description: item.servDgst || '',
                    category: this.mapCategory(item.intrsThemaArray),
                    categoryLabel: item.intrsThemaArray || '기타',
                    organization: item.jurOrgNm || '',
                    organizationDept: item.jurMnofNm || '',
                    regionCode: '00',
                    regionName: '전국',
                    eligibility: {
                        targetGroups: item.trgterIndvdlArray ? item.trgterIndvdlArray.split(',') : [],
                        lifeCycle: item.lifeArray ? item.lifeArray.split(',') : [],
                        conditions: [],
                    },
                    benefits: item.servDgst || '',
                    supportCycle: item.sprtCycNm || '',
                    supportType: item.srvPvsnNm || '',
                    contactPhone: item.rprsCtadr || '',
                    detailUrl: item.servDtlLink || '',
                    onlineApplicationAvailable: item.onapPsbltYn === 'Y',
                    deadline: null,
                    dDay: null,
                    applicationUrl: item.servDtlLink || null,
                    viewCount: parseInt(item.inqNum || '0', 10),
                    createdAt: item.svcfrstRegTs || new Date().toISOString(),
                    isBookmarked: false,
                    relevanceScore: 0.8,
                };
            });
            return {
                programs,
                pagination: {
                    totalCount,
                    page: pageNum,
                    limit: pageSize,
                    totalPages: Math.ceil(totalCount / pageSize),
                },
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch from public API:', error);
            return {
                programs: [],
                pagination: {
                    totalCount: 0,
                    page: pageNum,
                    limit: pageSize,
                    totalPages: 0,
                },
                error: 'API 호출 실패',
            };
        }
    }
    async getDetail(servId) {
        this.logger.log(`GET /api/public-welfare/${servId}`);
        try {
            const encodedApiKey = encodeURIComponent(API_KEY);
            const isLocal = servId.startsWith('LG-');
            const rawId = isLocal ? servId.replace(/^LG-/, '') : servId;
            const url = isLocal
                ? `${LOCAL_API_BASE_URL}/LcgvWelfaredetailed?serviceKey=${encodedApiKey}&servId=${rawId}`
                : `${API_BASE_URL}/NationalWelfaredetailedV001?serviceKey=${encodedApiKey}&servId=${rawId}`;
            this.logger.log(`Fetching detail: ${url.replace(encodedApiKey, 'API_KEY_HIDDEN')}`);
            const response = await fetch(url);
            const xmlText = await response.text();
            const parsed = xmlParser.parse(xmlText);
            let welfareInfo = parsed?.wantedDtl ||
                parsed?.response?.body?.welfareInfo ||
                parsed?.welfareInfo;
            if (!welfareInfo && !isLocal) {
                const localUrl = `${LOCAL_API_BASE_URL}/LcgvWelfaredetailed?serviceKey=${encodedApiKey}&servId=${rawId}`;
                this.logger.log(`Fetching local detail fallback: ${localUrl.replace(encodedApiKey, 'API_KEY_HIDDEN')}`);
                const localResponse = await fetch(localUrl);
                const localXml = await localResponse.text();
                const localParsed = xmlParser.parse(localXml);
                welfareInfo = localParsed?.wantedDtl || localParsed?.response?.body?.welfareInfo;
            }
            if (!welfareInfo) {
                return { program: null, error: '복지서비스를 찾을 수 없습니다.' };
            }
            const toArray = (value) => {
                if (!value)
                    return [];
                return Array.isArray(value) ? value : [value];
            };
            const contactItems = toArray(welfareInfo.inqplCtadrList || welfareInfo.inqPlCtadrList);
            const contacts = contactItems.map((item) => ({
                name: item.servSeDetailNm || item.wlfareInfoOutlNm || '',
                phone: item.servSeDetailLink || item.wlfareInfoOuttTelno || '',
            }));
            const homepageItems = toArray(welfareInfo.inqplHmpgReldList || welfareInfo.inqPlHmpgReldList);
            const homepage = homepageItems.find((item) => item.servSeDetailLink)?.servSeDetailLink;
            const documentItems = toArray(welfareInfo.basfrmList || welfareInfo.basFrmList);
            const requiredDocuments = documentItems
                .map((item) => item.servSeDetailNm)
                .filter(Boolean);
            const summary = welfareInfo.wlfareInfoOutlCn ||
                welfareInfo.servDgst ||
                '';
            const isLocalDetail = Boolean(isLocal || welfareInfo.ctpvNm || welfareInfo.bizChrDeptNm);
            const localRegionName = [welfareInfo.ctpvNm, welfareInfo.sggNm].filter(Boolean).join(' ');
            const deadline = this.formatDate(welfareInfo.enfcEndYmd);
            return {
                program: {
                    id: (isLocalDetail ? `LG-${welfareInfo.servId || rawId}` : welfareInfo.servId) || servId,
                    name: welfareInfo.servNm || '',
                    summary,
                    description: welfareInfo.alwServCn || summary,
                    category: this.mapCategory(welfareInfo.intrsThemaNmArray || welfareInfo.intrsThemaArray),
                    categoryLabel: welfareInfo.intrsThemaNmArray ||
                        welfareInfo.intrsThemaArray ||
                        '기타',
                    organization: welfareInfo.jurOrgNm ||
                        welfareInfo.jurMnofNm ||
                        welfareInfo.bizChrDeptNm ||
                        welfareInfo.ctpvNm ||
                        '',
                    organizationName: welfareInfo.jurOrgNm ||
                        welfareInfo.jurMnofNm ||
                        welfareInfo.bizChrDeptNm ||
                        welfareInfo.ctpvNm ||
                        '',
                    eligibility: {
                        targetGroups: welfareInfo.trgterIndvdlArray
                            ? String(welfareInfo.trgterIndvdlArray).split(',')
                            : welfareInfo.trgterIndvdlNm
                                ? [welfareInfo.trgterIndvdlNm]
                                : welfareInfo.trgterIndvdlNmArray
                                    ? String(welfareInfo.trgterIndvdlNmArray).split(',')
                                    : [],
                        conditions: welfareInfo.slctCritCn
                            ? [welfareInfo.slctCritCn]
                            : welfareInfo.slctCritNm
                                ? [welfareInfo.slctCritNm]
                                : [],
                        incomeLevel: welfareInfo.slctCritCn || welfareInfo.slctCritNm || '',
                        region: isLocalDetail && localRegionName ? [localRegionName] : [],
                    },
                    benefits: welfareInfo.alwServCn || summary,
                    applicationMethods: welfareInfo.aplyMtdNm
                        ? [
                            {
                                type: welfareInfo.aplyUrlAddr ? 'online' : 'visit',
                                name: welfareInfo.aplyMtdNm,
                                url: welfareInfo.aplyUrlAddr || null,
                            },
                        ]
                        : [],
                    requiredDocuments: requiredDocuments.length > 0
                        ? requiredDocuments
                        : welfareInfo.aplyDcmtCn
                            ? [welfareInfo.aplyDcmtCn]
                            : [],
                    contactInfo: {
                        phone: contacts[0]?.phone || welfareInfo.rprsCtadr || '',
                        website: welfareInfo.aplyUrlAddr || homepage || '',
                    },
                    contacts,
                    deadline,
                    applicationUrl: welfareInfo.aplyUrlAddr || homepage || welfareInfo.servDtlLink || null,
                },
                relatedPrograms: [],
                isBookmarked: false,
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch detail from public API:', error);
            return { program: null, error: 'API 호출 실패' };
        }
    }
    mapCategory(themaArray) {
        if (!themaArray)
            return 'other';
        const lower = themaArray.toLowerCase();
        if (lower.includes('취업') || lower.includes('창업') || lower.includes('고용') || lower.includes('일자리'))
            return 'employment';
        if (lower.includes('주거') || lower.includes('금융') || lower.includes('대출') || lower.includes('서민금융'))
            return 'housing';
        if (lower.includes('교육') || lower.includes('학자금'))
            return 'education';
        if (lower.includes('건강') || lower.includes('의료') || lower.includes('보건') || lower.includes('신체건강') || lower.includes('정신건강'))
            return 'healthcare';
        if (lower.includes('임신') ||
            lower.includes('육아') ||
            lower.includes('출산') ||
            lower.includes('보육') ||
            lower.includes('돌봄') ||
            lower.includes('입양') ||
            lower.includes('위탁'))
            return 'childcare';
        if (lower.includes('문화') || lower.includes('생활') || lower.includes('여가'))
            return 'culture';
        if (lower.includes('안전') || lower.includes('환경') || lower.includes('법률') || lower.includes('위기'))
            return 'safety';
        return 'other';
    }
    formatDate(value) {
        if (!value)
            return null;
        const digits = String(value).replace(/\D/g, '');
        if (digits.length === 8) {
            return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
        }
        return value;
    }
};
exports.PublicWelfareController = PublicWelfareController;
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('keyword')),
    __param(1, (0, common_1.Query)('lifeCycle')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PublicWelfareController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicWelfareController.prototype, "getDetail", null);
exports.PublicWelfareController = PublicWelfareController = PublicWelfareController_1 = __decorate([
    (0, common_1.Controller)('api/public-welfare')
], PublicWelfareController);
//# sourceMappingURL=public-welfare.controller.js.map