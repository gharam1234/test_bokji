/**
 * 관리자 프로그램 컨트롤러
 * 복지 프로그램 CRUD API
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminProgramService, PaginatedPrograms, WelfareProgramEntity } from '../services/admin-program.service';
import { CreateProgramDto, validateCreateProgramDto } from '../dto/create-program.dto';
import { UpdateProgramDto, validateUpdateProgramDto } from '../dto/update-program.dto';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { CurrentAdmin, AdminId } from '../decorators/admin.decorator';
import { AdminUserPublic } from '../entities/admin-user.entity';

@Controller('api/admin/programs')
@UseGuards(AdminAuthGuard)
export class AdminProgramController {
  private readonly logger = new Logger(AdminProgramController.name);

  constructor(private readonly programService: AdminProgramService) {}

  /**
   * 프로그램 목록 조회
   * GET /api/admin/programs
   */
  @Get()
  async findAll(@Query() query: Record<string, unknown>): Promise<PaginatedPrograms> {
    return this.programService.findAll(query);
  }

  /**
   * 프로그램 상세 조회
   * GET /api/admin/programs/:id
   */
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Query('includeDeleted') includeDeleted?: string
  ): Promise<WelfareProgramEntity> {
    return this.programService.findById(id, includeDeleted === 'true');
  }

  /**
   * 프로그램 생성
   * POST /api/admin/programs
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() body: unknown,
    @AdminId() adminId: string,
    @Req() request: Request
  ): Promise<WelfareProgramEntity> {
    const dto = validateCreateProgramDto(body);
    const ipAddress = this.extractIpAddress(request);
    const userAgent = request.headers['user-agent'];

    this.logger.log(`Creating program: ${dto.name}`);

    return this.programService.create(dto, adminId, ipAddress, userAgent);
  }

  /**
   * 프로그램 수정
   * PUT /api/admin/programs/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: unknown,
    @AdminId() adminId: string,
    @Req() request: Request
  ): Promise<WelfareProgramEntity> {
    const dto = validateUpdateProgramDto(body);
    const ipAddress = this.extractIpAddress(request);
    const userAgent = request.headers['user-agent'];

    this.logger.log(`Updating program: ${id}`);

    return this.programService.update(id, dto, adminId, ipAddress, userAgent);
  }

  /**
   * 프로그램 삭제 (소프트 삭제)
   * DELETE /api/admin/programs/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id') id: string,
    @AdminId() adminId: string,
    @Req() request: Request
  ): Promise<{ message: string }> {
    const ipAddress = this.extractIpAddress(request);
    const userAgent = request.headers['user-agent'];

    this.logger.log(`Deleting program: ${id}`);

    await this.programService.delete(id, adminId, ipAddress, userAgent);
    return { message: 'Program deleted successfully' };
  }

  /**
   * 프로그램 복구
   * POST /api/admin/programs/:id/restore
   */
  @Post(':id/restore')
  async restore(
    @Param('id') id: string,
    @AdminId() adminId: string,
    @Req() request: Request
  ): Promise<WelfareProgramEntity> {
    const ipAddress = this.extractIpAddress(request);
    const userAgent = request.headers['user-agent'];

    this.logger.log(`Restoring program: ${id}`);

    return this.programService.restore(id, adminId, ipAddress, userAgent);
  }

  /** IP 주소 추출 */
  private extractIpAddress(request: Request): string | undefined {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      request.socket.remoteAddress ||
      undefined
    );
  }
}
