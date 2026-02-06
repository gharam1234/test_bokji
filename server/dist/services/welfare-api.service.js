"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WelfareApiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelfareApiService = void 0;
const common_1 = require("@nestjs/common");
const fast_xml_parser_1 = require("fast-xml-parser");
const API_BASE_URL = 'https://apis.data.go.kr/B554287/NationalWelfareInformationsV001';
const API_KEY = process.env.DATA_GO_KR_API_KEY || '';
const xmlParser = new fast_xml_parser_1.XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
});
let WelfareApiService = WelfareApiService_1 = class WelfareApiService {
    constructor() {
        this.logger = new common_1.Logger(WelfareApiService_1.name);
    }
    async searchWelfarePrograms(params) {
        const { keyword, lifeArray, intrsThemArray, page = 1, pageSize = 10 } = params;
        try {
            const queryParams = new URLSearchParams({
                serviceKey: API_KEY,
                pageNo: String(page),
                numOfRows: String(pageSize),
            });
            if (keyword) {
                queryParams.append('searchWrd', keyword);
            }
            if (lifeArray) {
                queryParams.append('lifeArray', lifeArray);
            }
            if (intrsThemArray) {
                queryParams.append('intrsThemArray', intrsThemArray);
            }
            const url = `${API_BASE_URL}/NationalWelfarelistV001?${queryParams.toString()}`;
            this.logger.log(`Fetching welfare list: ${url}`);
            const response = await fetch(url);
            const xmlText = await response.text();
            const parsed = xmlParser.parse(xmlText);
            this.logger.debug('API Response:', JSON.stringify(parsed, null, 2));
            const responseBody = parsed?.response?.body;
            if (!responseBody) {
                this.logger.warn('Empty response body');
                return { programs: [], totalCount: 0, currentPage: page, pageSize };
            }
            const totalCount = parseInt(responseBody.totalCount || '0', 10);
            const items = responseBody.servList?.servList;
            let programs = [];
            if (items) {
                programs = Array.isArray(items) ? items : [items];
            }
            return {
                programs,
                totalCount,
                currentPage: page,
                pageSize,
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch welfare programs:', error);
            throw error;
        }
    }
    async getWelfareDetail(servId) {
        try {
            const queryParams = new URLSearchParams({
                serviceKey: API_KEY,
                servId,
            });
            const url = `${API_BASE_URL}/NationalWelfaredetailedV001?${queryParams.toString()}`;
            this.logger.log(`Fetching welfare detail: ${url}`);
            const response = await fetch(url);
            const xmlText = await response.text();
            const parsed = xmlParser.parse(xmlText);
            this.logger.debug('API Response:', JSON.stringify(parsed, null, 2));
            const welfareInfo = parsed?.response?.body?.welfareInfo;
            if (!welfareInfo) {
                this.logger.warn(`Welfare detail not found for servId: ${servId}`);
                return null;
            }
            return {
                servId: welfareInfo.servId || servId,
                servNm: welfareInfo.servNm || '',
                servDgst: welfareInfo.servDgst || '',
                jurOrgNm: welfareInfo.jurOrgNm || '',
                trgterIndvdlNm: welfareInfo.trgterIndvdlNm || '',
                slctCritNm: welfareInfo.slctCritNm || '',
                alwServCn: welfareInfo.alwServCn || '',
                aplyMtdNm: welfareInfo.aplyMtdNm || '',
                aplyUrlAddr: welfareInfo.aplyUrlAddr || '',
                inqPlCtadrList: welfareInfo.inqPlCtadrList?.inqPlCtadr
                    ? (Array.isArray(welfareInfo.inqPlCtadrList.inqPlCtadr)
                        ? welfareInfo.inqPlCtadrList.inqPlCtadr
                        : [welfareInfo.inqPlCtadrList.inqPlCtadr])
                    : [],
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch welfare detail:', error);
            throw error;
        }
    }
};
exports.WelfareApiService = WelfareApiService;
exports.WelfareApiService = WelfareApiService = WelfareApiService_1 = __decorate([
    (0, common_1.Injectable)()
], WelfareApiService);
//# sourceMappingURL=welfare-api.service.js.map