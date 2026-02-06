/**
 * 검색 서비스
 * 복지 프로그램 검색 비즈니스 로직
 */

import { Injectable, Logger } from '@nestjs/common';
import { SearchRepository } from './search.repository';
import {
  SearchQueryDto,
  NormalizedSearchParams,
  normalizeSearchQueryDto,
  WELFARE_CATEGORIES,
} from './dto/search-query.dto';
import {
  SearchResponseDto,
  FilterOptionsResponseDto,
  SuggestionsResponseDto,
  CategoryOptionDto,
  RegionOptionDto,
  AppliedFiltersDto,
  CATEGORY_LABELS,
  SIDO_NAMES,
  createPagination,
} from './dto/search-response.dto';

/**
 * 시도 목록
 */
const SIDO_LIST: RegionOptionDto[] = [
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

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly repo: SearchRepository) {}

  // ==================== 검색 ====================

  /**
   * 복지 프로그램 검색
   */
  async search(dto: SearchQueryDto, userId?: string): Promise<SearchResponseDto> {
    const startTime = Date.now();
    const params = normalizeSearchQueryDto(dto);

    this.logger.log(`Searching with params: ${JSON.stringify(params)}`);

    // 검색 실행
    const { programs, totalCount } = await this.repo.searchPrograms(params, userId);

    // 페이지네이션 정보
    const pagination = createPagination(params.page, params.limit, totalCount);

    // 적용된 필터 정보
    const appliedFilters = this.buildAppliedFilters(params);

    // 검색 시간 계산
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

  // ==================== 필터 옵션 ====================

  /**
   * 필터 옵션 조회
   */
  async getFilterOptions(): Promise<FilterOptionsResponseDto> {
    this.logger.debug('Getting filter options');

    // 카테고리별 개수 조회
    const categoryCounts = await this.repo.countByCategory();

    // 카테고리 옵션 생성
    const categories: CategoryOptionDto[] = WELFARE_CATEGORIES.map((category) => {
      const countInfo = categoryCounts.find((c) => c.category === category);
      return {
        value: category,
        label: CATEGORY_LABELS[category],
        count: countInfo?.count || 0,
      };
    }).filter((c) => c.count > 0);

    // 정렬: 개수 내림차순
    categories.sort((a, b) => b.count - a.count);

    return {
      categories,
      regions: SIDO_LIST,
    };
  }

  // ==================== 자동완성 ====================

  /**
   * 검색어 자동완성
   */
  async getSuggestions(keyword: string): Promise<SuggestionsResponseDto> {
    if (!keyword || keyword.length < 2) {
      return { suggestions: [] };
    }

    this.logger.debug(`Getting suggestions for: ${keyword}`);

    const programNames = await this.repo.findSuggestions(keyword, 10);

    const suggestions = programNames.map((text) => ({
      text,
      type: 'program' as const,
      highlightRanges: this.findHighlightRanges(text, keyword),
    }));

    return { suggestions };
  }

  // ==================== 유틸리티 ====================

  /**
   * 조회수 증가
   */
  async incrementViewCount(programId: string): Promise<void> {
    await this.repo.incrementViewCount(programId);
  }

  /**
   * 적용된 필터 정보 생성
   */
  private buildAppliedFilters(params: NormalizedSearchParams): AppliedFiltersDto {
    const filters: AppliedFiltersDto = {
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    };

    if (params.category) {
      filters.category = params.category;
      filters.categoryLabel = CATEGORY_LABELS[params.category];
    }

    if (params.region) {
      const regionName = SIDO_NAMES[params.region] || SIDO_NAMES[params.region.substring(0, 2)];
      filters.region = {
        code: params.region,
        name: regionName || '전국',
        type: params.region.length === 2 ? 'sido' : 'sigungu',
      };
    }

    return filters;
  }

  /**
   * 하이라이트 범위 찾기
   */
  private findHighlightRanges(
    text: string,
    keyword: string,
  ): [number, number][] {
    const ranges: [number, number][] = [];
    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();

    let startIndex = 0;
    while (true) {
      const index = lowerText.indexOf(lowerKeyword, startIndex);
      if (index === -1) break;

      ranges.push([index, index + keyword.length]);
      startIndex = index + keyword.length;
    }

    return ranges;
  }
}
