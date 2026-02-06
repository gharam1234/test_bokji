/**
 * 검색 컨트롤러
 * 복지 검색 API 엔드포인트 처리
 */

import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SearchService } from './search.service';
import {
  SearchQueryDto,
  WelfareCategory,
  SearchSortOption,
  SortOrder,
} from './dto/search-query.dto';
import {
  SearchResponseDto,
  FilterOptionsResponseDto,
  SuggestionsResponseDto,
} from './dto/search-response.dto';

@Controller('api/search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private readonly searchService: SearchService) {}

  /**
   * GET /api/search
   * 복지 프로그램 검색
   * 
   * @param keyword - 검색어
   * @param category - 카테고리 필터
   * @param region - 지역 코드 필터
   * @param sortBy - 정렬 기준
   * @param sortOrder - 정렬 순서
   * @param page - 페이지 번호
   * @param limit - 페이지 크기
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async search(
    @Query('keyword') keyword?: string,
    @Query('category') category?: WelfareCategory,
    @Query('region') region?: string,
    @Query('sortBy') sortBy?: SearchSortOption,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<SearchResponseDto> {
    this.logger.log(`GET /api/search - keyword: ${keyword}, category: ${category}`);

    const dto: SearchQueryDto = {
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

  /**
   * GET /api/search/filters
   * 필터 옵션 조회
   */
  @Get('filters')
  @HttpCode(HttpStatus.OK)
  async getFilterOptions(): Promise<FilterOptionsResponseDto> {
    this.logger.log('GET /api/search/filters');

    return this.searchService.getFilterOptions();
  }

  /**
   * GET /api/search/suggestions
   * 검색어 자동완성
   * 
   * @param keyword - 검색어
   */
  @Get('suggestions')
  @HttpCode(HttpStatus.OK)
  async getSuggestions(
    @Query('keyword') keyword: string,
  ): Promise<SuggestionsResponseDto> {
    this.logger.log(`GET /api/search/suggestions - keyword: ${keyword}`);

    return this.searchService.getSuggestions(keyword);
  }

  /**
   * GET /api/search/programs/:id/view
   * 프로그램 조회수 증가 (조회 시 호출)
   */
  @Get('programs/:id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  async incrementViewCount(@Param('id') id: string): Promise<void> {
    this.logger.log(`GET /api/search/programs/${id}/view`);

    await this.searchService.incrementViewCount(id);
  }
}
