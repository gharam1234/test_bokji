/**
 * 공공데이터포털 복지서비스 API 연동
 * 한국사회보장정보원_중앙부처복지서비스
 */

import { Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';

// API 기본 정보
const API_BASE_URL = 'https://apis.data.go.kr/B554287/NationalWelfareInformationsV001';
const API_KEY = process.env.DATA_GO_KR_API_KEY || '';

// XML 파서 설정
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

/**
 * 복지서비스 목록 아이템 타입
 */
export interface WelfareListItem {
  servId: string;           // 서비스 ID
  servNm: string;           // 서비스명
  servDgst: string;         // 서비스 요약
  jurOrgNm: string;         // 소관부처명
  trgterIndvdlNm: string;   // 지원대상
  lifeNmArray: string;      // 생애주기
  intrsThemaNmArray: string; // 관심주제
  srvPvsnNm: string;        // 서비스 제공 유형
}

/**
 * 복지서비스 상세 타입
 */
export interface WelfareDetail {
  servId: string;
  servNm: string;
  servDgst: string;
  jurOrgNm: string;
  trgterIndvdlNm: string;
  slctCritNm: string;       // 선정기준
  alwServCn: string;        // 급여서비스 내용
  aplyMtdNm: string;        // 신청방법
  aplyUrlAddr: string;      // 신청 URL
  inqPlCtadrList: any[];    // 문의처 목록
}

/**
 * 검색 결과 타입
 */
export interface WelfareSearchResult {
  programs: WelfareListItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

@Injectable()
export class WelfareApiService {
  private readonly logger = new Logger(WelfareApiService.name);

  /**
   * 복지서비스 목록 조회
   */
  async searchWelfarePrograms(params: {
    keyword?: string;
    lifeArray?: string;      // 생애주기 (001:영유아, 002:아동, 003:청소년, 004:청년, 005:중장년, 006:노년)
    intrsThemArray?: string; // 관심주제
    page?: number;
    pageSize?: number;
  }): Promise<WelfareSearchResult> {
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

      // 응답 파싱
      const responseBody = parsed?.response?.body;
      if (!responseBody) {
        this.logger.warn('Empty response body');
        return { programs: [], totalCount: 0, currentPage: page, pageSize };
      }

      const totalCount = parseInt(responseBody.totalCount || '0', 10);
      const items = responseBody.servList?.servList;

      // 단일 아이템인 경우 배열로 변환
      let programs: WelfareListItem[] = [];
      if (items) {
        programs = Array.isArray(items) ? items : [items];
      }

      return {
        programs,
        totalCount,
        currentPage: page,
        pageSize,
      };
    } catch (error) {
      this.logger.error('Failed to fetch welfare programs:', error);
      throw error;
    }
  }

  /**
   * 복지서비스 상세 조회
   */
  async getWelfareDetail(servId: string): Promise<WelfareDetail | null> {
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

      // 응답 파싱
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
    } catch (error) {
      this.logger.error('Failed to fetch welfare detail:', error);
      throw error;
    }
  }
}
