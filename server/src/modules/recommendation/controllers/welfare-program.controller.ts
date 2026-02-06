/**
 * 복지 프로그램 컨트롤러
 * 복지 프로그램 상세 조회 API
 */

import {
  Controller,
  Get,
  Param,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { RecommendationService } from '../recommendation.service';
import { WelfareDetailResponseDto } from '../dto/welfare-detail.dto';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

@Controller('api/welfare-programs')
@UseGuards(AuthGuard)
export class WelfareProgramController {
  private readonly logger = new Logger(WelfareProgramController.name);

  constructor(private readonly recommendationService: RecommendationService) {}

  /**
   * GET /api/welfare-programs/:id
   * 복지 프로그램 상세 조회
   */
  @Get(':id')
  async getWelfareDetail(
    @Param('id') programId: string,
    @CurrentUser('userId') userId?: string,
  ): Promise<WelfareDetailResponseDto> {
    this.logger.log(`GET /api/welfare-programs/${programId} - user: ${userId}`);

    return this.recommendationService.getWelfareDetail(programId, userId!);
  }
}
