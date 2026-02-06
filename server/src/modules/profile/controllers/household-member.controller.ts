/**
 * 가구원 관리 컨트롤러
 * 개별 가구원 CRUD API 처리
 */

import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { EncryptionService } from './services/encryption.service';
import {
  CreateHouseholdMemberDto,
  UpdateHouseholdMemberDto,
} from './dto/household-member.dto';
import { HouseholdMemberResponseDto } from './dto/profile-response.dto';
import { RELATION_LABELS } from './entities/household-member.entity';

// 임시 사용자 ID
const TEMP_USER_ID = 'temp-user-id-12345';

@Controller('api/profile/household/member')
export class HouseholdMemberController {
  private readonly logger = new Logger(HouseholdMemberController.name);

  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * POST /api/profile/household/member
   * 가구원 추가
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addMember(
    @Body() dto: CreateHouseholdMemberDto,
    // @CurrentUser() userId: string,
  ): Promise<HouseholdMemberResponseDto> {
    const userId = TEMP_USER_ID;
    this.logger.log(`POST /api/profile/household/member`);

    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('프로필을 찾을 수 없습니다.');
    }

    // 현재 가구원 수 확인
    const existingMembers = await this.profileRepo.findHouseholdMembers(profile.id);
    const displayOrder = existingMembers.length;

    const member = await this.profileRepo.createHouseholdMember({
      profileId: profile.id,
      relation: dto.relation,
      nameEncrypted: this.encryptionService.encrypt(dto.name),
      birthDate: new Date(dto.birthDate),
      gender: dto.gender,
      hasDisability: dto.hasDisability,
      hasIncome: dto.hasIncome,
      displayOrder,
    });

    return this.toMemberResponse(member, dto.name);
  }

  /**
   * PUT /api/profile/household/member/:id
   * 가구원 수정
   */
  @Put(':id')
  async updateMember(
    @Param('id') memberId: string,
    @Body() dto: UpdateHouseholdMemberDto,
    // @CurrentUser() userId: string,
  ): Promise<HouseholdMemberResponseDto> {
    const userId = TEMP_USER_ID;
    this.logger.log(`PUT /api/profile/household/member/${memberId}`);

    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('프로필을 찾을 수 없습니다.');
    }

    const updateData: any = {};
    if (dto.relation) updateData.relation = dto.relation;
    if (dto.name) updateData.nameEncrypted = this.encryptionService.encrypt(dto.name);
    if (dto.birthDate) updateData.birthDate = new Date(dto.birthDate);
    if (dto.gender) updateData.gender = dto.gender;
    if (dto.hasDisability !== undefined) updateData.hasDisability = dto.hasDisability;
    if (dto.hasIncome !== undefined) updateData.hasIncome = dto.hasIncome;

    const member = await this.profileRepo.updateHouseholdMember(memberId, updateData);
    if (!member) {
      throw new NotFoundException('가구원을 찾을 수 없습니다.');
    }

    const name = dto.name || this.encryptionService.decrypt(member.nameEncrypted);
    return this.toMemberResponse(member, name);
  }

  /**
   * DELETE /api/profile/household/member/:id
   * 가구원 삭제
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteMember(
    @Param('id') memberId: string,
    // @CurrentUser() userId: string,
  ): Promise<{ success: boolean }> {
    const userId = TEMP_USER_ID;
    this.logger.log(`DELETE /api/profile/household/member/${memberId}`);

    const deleted = await this.profileRepo.deleteHouseholdMember(memberId);
    if (!deleted) {
      throw new NotFoundException('가구원을 찾을 수 없습니다.');
    }

    return { success: true };
  }

  /**
   * 가구원 응답 DTO 변환
   */
  private toMemberResponse(member: any, name: string): HouseholdMemberResponseDto {
    const birthDate = new Date(member.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // 이름 마스킹
    let maskedName = name;
    if (name.length <= 1) {
      maskedName = name;
    } else if (name.length === 2) {
      maskedName = name[0] + '*';
    } else {
      maskedName = name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
    }

    return {
      id: member.id,
      relation: member.relation,
      relationLabel: RELATION_LABELS[member.relation],
      name: maskedName,
      age,
      gender: member.gender,
      hasDisability: member.hasDisability,
      hasIncome: member.hasIncome,
    };
  }
}
