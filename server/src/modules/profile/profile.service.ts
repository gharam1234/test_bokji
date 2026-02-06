/**
 * 프로필 서비스
 * 프로필 관련 비즈니스 로직 처리
 */

import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { EncryptionService } from './services/encryption.service';
import { IncomeBracketService } from './services/income-bracket.service';
import { CompletionService } from './services/completion.service';
import {
  UserProfile,
  Gender,
  IncomeType,
  IncomeBracket,
  ProfileStep,
} from './entities/user-profile.entity';
import { HouseholdMember, FamilyRelation, RELATION_LABELS } from './entities/household-member.entity';
import {
  CreateProfileDto,
  BasicInfoDto,
  IncomeDto,
  AddressDto,
  HouseholdDto,
} from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  ProfileResponseDto,
  ProfileCompletionResponseDto,
  ProfileSuccessResponseDto,
  INCOME_BRACKET_LABELS,
} from './dto/profile-response.dto';
import { ProfileDraftResponseDto, SaveDraftDto } from './dto/profile-draft.dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly encryptionService: EncryptionService,
    private readonly incomeBracketService: IncomeBracketService,
    private readonly completionService: CompletionService,
  ) {}

  // ==================== 프로필 생성 ====================

  /**
   * 프로필 생성
   */
  async createProfile(userId: string, dto: CreateProfileDto): Promise<ProfileResponseDto> {
    this.logger.log(`Creating profile for user: ${userId}`);

    // 이미 프로필이 존재하는지 확인
    const existing = await this.profileRepo.existsByUserId(userId);
    if (existing) {
      throw new ConflictException('이미 프로필이 존재합니다.');
    }

    // 소득 구간 계산
    const incomeBracket = this.incomeBracketService.calculateBracket(
      dto.income.annualAmount,
      dto.household.size,
    );

    // 프로필 데이터 준비
    const profileData: Partial<UserProfile> = {
      userId,
      // 기본 정보 (암호화)
      nameEncrypted: this.encryptionService.encrypt(dto.basicInfo.name),
      nameHash: this.encryptionService.hash(dto.basicInfo.name),
      birthDate: new Date(dto.basicInfo.birthDate),
      gender: dto.basicInfo.gender,
      phoneEncrypted: this.encryptionService.encrypt(dto.basicInfo.phone),
      phoneHash: this.encryptionService.hash(dto.basicInfo.phone),
      email: dto.basicInfo.email || null,
      // 주소 정보
      zipCode: dto.address.zipCode,
      sido: dto.address.sido,
      sigungu: dto.address.sigungu,
      roadAddress: dto.address.roadAddress,
      jibunAddress: dto.address.jibunAddress || null,
      detailEncrypted: this.encryptionService.encrypt(dto.address.detail),
      buildingName: dto.address.buildingName || null,
      // 소득 정보
      incomeType: dto.income.type,
      annualAmountEncrypted: this.encryptionService.encryptNumber(dto.income.annualAmount),
      incomeBracket,
      // 가구 정보
      householdSize: dto.household.size,
      // 메타 정보
      completionRate: 100,
      currentStep: ProfileStep.COMPLETE,
      isComplete: true,
    };

    // 프로필 저장
    const profile = await this.profileRepo.createProfile(profileData);

    // 가구원 저장
    if (dto.household.members.length > 0) {
      const householdMembers = dto.household.members.map((member, index) => ({
        profileId: profile.id,
        relation: member.relation,
        nameEncrypted: this.encryptionService.encrypt(member.name),
        birthDate: new Date(member.birthDate),
        gender: member.gender,
        hasDisability: member.hasDisability,
        hasIncome: member.hasIncome,
        displayOrder: index,
      }));

      await this.profileRepo.saveHouseholdMembers(profile.id, householdMembers);
    }

    // 임시 저장 데이터 삭제
    await this.profileRepo.deleteDraft(userId);

    return this.getProfile(userId);
  }

  // ==================== 프로필 조회 ====================

  /**
   * 프로필 조회
   */
  async getProfile(userId: string, isOwner: boolean = true): Promise<ProfileResponseDto> {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('프로필을 찾을 수 없습니다.');
    }

    const householdMembers = await this.profileRepo.findHouseholdMembers(profile.id);
    return this.toProfileResponse(profile, householdMembers, isOwner);
  }

  /**
   * 프로필 엔티티를 응답 DTO로 변환
   */
  private toProfileResponse(
    profile: UserProfile,
    householdMembers: HouseholdMember[],
    isOwner: boolean,
  ): ProfileResponseDto {
    const name = this.encryptionService.decrypt(profile.nameEncrypted);
    const phone = this.encryptionService.decrypt(profile.phoneEncrypted);
    const detail = this.encryptionService.decrypt(profile.detailEncrypted);
    const age = this.calculateAge(profile.birthDate);

    return {
      id: profile.id,
      basicInfo: {
        name: this.maskName(name),
        nameFull: isOwner ? name : undefined,
        birthDate: profile.birthDate.toISOString().split('T')[0],
        age,
        gender: profile.gender,
        phone: this.maskPhone(phone),
        phoneFull: isOwner ? phone : undefined,
        email: profile.email || undefined,
      },
      income: {
        type: profile.incomeType,
        bracket: profile.incomeBracket,
        bracketLabel: INCOME_BRACKET_LABELS[profile.incomeBracket],
      },
      address: {
        zipCode: profile.zipCode,
        sido: profile.sido,
        sigungu: profile.sigungu,
        roadAddress: profile.roadAddress,
        detail: isOwner ? detail : undefined,
        buildingName: profile.buildingName || undefined,
      },
      household: {
        size: profile.householdSize,
        members: householdMembers.map((member) => ({
          id: member.id,
          relation: member.relation,
          relationLabel: RELATION_LABELS[member.relation],
          name: this.maskName(this.encryptionService.decrypt(member.nameEncrypted)),
          age: this.calculateAge(member.birthDate),
          gender: member.gender,
          hasDisability: member.hasDisability,
          hasIncome: member.hasIncome,
        })),
      },
      meta: {
        completionRate: profile.completionRate,
        currentStep: profile.currentStep,
        isComplete: profile.isComplete,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
      },
    };
  }

  // ==================== 프로필 수정 ====================

  /**
   * 프로필 전체 수정
   */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<ProfileResponseDto> {
    this.logger.log(`Updating profile for user: ${userId}`);

    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('프로필을 찾을 수 없습니다.');
    }

    const updateData: Partial<UserProfile> = {};

    // 기본 정보 업데이트
    if (dto.basicInfo) {
      if (dto.basicInfo.name) {
        updateData.nameEncrypted = this.encryptionService.encrypt(dto.basicInfo.name);
        updateData.nameHash = this.encryptionService.hash(dto.basicInfo.name);
      }
      if (dto.basicInfo.birthDate) {
        updateData.birthDate = new Date(dto.basicInfo.birthDate);
      }
      if (dto.basicInfo.gender) {
        updateData.gender = dto.basicInfo.gender;
      }
      if (dto.basicInfo.phone) {
        updateData.phoneEncrypted = this.encryptionService.encrypt(dto.basicInfo.phone);
        updateData.phoneHash = this.encryptionService.hash(dto.basicInfo.phone);
      }
      if (dto.basicInfo.email !== undefined) {
        updateData.email = dto.basicInfo.email || null;
      }
    }

    // 소득 정보 업데이트
    if (dto.income) {
      if (dto.income.type) {
        updateData.incomeType = dto.income.type;
      }
      if (dto.income.annualAmount !== undefined) {
        updateData.annualAmountEncrypted = this.encryptionService.encryptNumber(dto.income.annualAmount);
        // 소득 구간 재계산
        const householdSize = dto.household?.size || profile.householdSize;
        updateData.incomeBracket = this.incomeBracketService.calculateBracket(
          dto.income.annualAmount,
          householdSize,
        );
      }
    }

    // 주소 정보 업데이트
    if (dto.address) {
      if (dto.address.zipCode) updateData.zipCode = dto.address.zipCode;
      if (dto.address.sido) updateData.sido = dto.address.sido;
      if (dto.address.sigungu) updateData.sigungu = dto.address.sigungu;
      if (dto.address.roadAddress) updateData.roadAddress = dto.address.roadAddress;
      if (dto.address.jibunAddress !== undefined) updateData.jibunAddress = dto.address.jibunAddress || null;
      if (dto.address.detail) updateData.detailEncrypted = this.encryptionService.encrypt(dto.address.detail);
      if (dto.address.buildingName !== undefined) updateData.buildingName = dto.address.buildingName || null;
    }

    // 가구 정보 업데이트
    if (dto.household) {
      if (dto.household.size) updateData.householdSize = dto.household.size;

      // 가구원 업데이트
      if (dto.household.members) {
        const householdMembers = dto.household.members.map((member, index) => ({
          profileId: profile.id,
          relation: member.relation,
          nameEncrypted: this.encryptionService.encrypt(member.name),
          birthDate: new Date(member.birthDate),
          gender: member.gender,
          hasDisability: member.hasDisability,
          hasIncome: member.hasIncome,
          displayOrder: index,
        }));

        await this.profileRepo.saveHouseholdMembers(profile.id, householdMembers);
      }
    }

    // 완성도 재계산
    const householdMembers = await this.profileRepo.findHouseholdMembers(profile.id);
    const completion = this.completionService.calculateCompletion(
      { ...profile, ...updateData },
      householdMembers,
    );
    updateData.completionRate = completion.overall;
    updateData.isComplete = completion.overall === 100;

    await this.profileRepo.updateProfile(userId, updateData);
    return this.getProfile(userId);
  }

  // ==================== 단계별 저장 ====================

  /**
   * 기본 정보 저장
   */
  async saveBasicInfo(userId: string, dto: BasicInfoDto): Promise<ProfileSuccessResponseDto> {
    this.logger.log(`Saving basic info for user: ${userId}`);

    const profile = await this.profileRepo.findByUserId(userId);

    const data: Partial<UserProfile> = {
      nameEncrypted: this.encryptionService.encrypt(dto.name),
      nameHash: this.encryptionService.hash(dto.name),
      birthDate: new Date(dto.birthDate),
      gender: dto.gender,
      phoneEncrypted: this.encryptionService.encrypt(dto.phone),
      phoneHash: this.encryptionService.hash(dto.phone),
      email: dto.email || null,
      currentStep: ProfileStep.INCOME,
    };

    if (profile) {
      await this.profileRepo.updateProfile(userId, data);
    } else {
      await this.profileRepo.createProfile({
        userId,
        ...data,
        // 기본값 설정
        zipCode: '',
        sido: '',
        sigungu: '',
        roadAddress: '',
        detailEncrypted: this.encryptionService.encrypt(''),
        incomeType: IncomeType.NONE,
        annualAmountEncrypted: this.encryptionService.encryptNumber(0),
        incomeBracket: IncomeBracket.BELOW_50,
        householdSize: 1,
      });
    }

    return {
      success: true,
      nextStep: ProfileStep.INCOME,
    };
  }

  /**
   * 소득 정보 저장
   */
  async saveIncome(userId: string, dto: IncomeDto): Promise<ProfileSuccessResponseDto> {
    this.logger.log(`Saving income info for user: ${userId}`);

    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('기본 정보를 먼저 입력해주세요.');
    }

    const incomeBracket = this.incomeBracketService.calculateBracket(
      dto.annualAmount,
      profile.householdSize,
    );

    await this.profileRepo.updateProfile(userId, {
      incomeType: dto.type,
      annualAmountEncrypted: this.encryptionService.encryptNumber(dto.annualAmount),
      incomeBracket,
      currentStep: ProfileStep.ADDRESS,
    });

    return {
      success: true,
      nextStep: ProfileStep.ADDRESS,
      bracket: incomeBracket,
    };
  }

  /**
   * 주소 정보 저장
   */
  async saveAddress(userId: string, dto: AddressDto): Promise<ProfileSuccessResponseDto> {
    this.logger.log(`Saving address info for user: ${userId}`);

    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('기본 정보를 먼저 입력해주세요.');
    }

    await this.profileRepo.updateProfile(userId, {
      zipCode: dto.zipCode,
      sido: dto.sido,
      sigungu: dto.sigungu,
      roadAddress: dto.roadAddress,
      jibunAddress: dto.jibunAddress || null,
      detailEncrypted: this.encryptionService.encrypt(dto.detail),
      buildingName: dto.buildingName || null,
      currentStep: ProfileStep.HOUSEHOLD,
    });

    return {
      success: true,
      nextStep: ProfileStep.HOUSEHOLD,
    };
  }

  /**
   * 가구원 정보 저장
   */
  async saveHousehold(userId: string, dto: HouseholdDto): Promise<ProfileSuccessResponseDto> {
    this.logger.log(`Saving household info for user: ${userId}`);

    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('기본 정보를 먼저 입력해주세요.');
    }

    // 소득 구간 재계산 (가구원 수 변경 시)
    const annualAmount = this.encryptionService.decryptNumber(profile.annualAmountEncrypted);
    const incomeBracket = this.incomeBracketService.calculateBracket(annualAmount, dto.size);

    await this.profileRepo.updateProfile(userId, {
      householdSize: dto.size,
      incomeBracket,
      currentStep: ProfileStep.COMPLETE,
      isComplete: true,
      completionRate: 100,
    });

    // 가구원 저장
    if (dto.members.length > 0) {
      const householdMembers = dto.members.map((member, index) => ({
        profileId: profile.id,
        relation: member.relation,
        nameEncrypted: this.encryptionService.encrypt(member.name),
        birthDate: new Date(member.birthDate),
        gender: member.gender,
        hasDisability: member.hasDisability,
        hasIncome: member.hasIncome,
        displayOrder: index,
      }));

      await this.profileRepo.saveHouseholdMembers(profile.id, householdMembers);
    } else {
      await this.profileRepo.deleteAllHouseholdMembers(profile.id);
    }

    // 임시 저장 삭제
    await this.profileRepo.deleteDraft(userId);

    return {
      success: true,
      isComplete: true,
    };
  }

  // ==================== 프로필 삭제 ====================

  /**
   * 프로필 삭제
   */
  async deleteProfile(userId: string): Promise<{ success: boolean }> {
    this.logger.log(`Deleting profile for user: ${userId}`);

    const deleted = await this.profileRepo.deleteProfile(userId);
    if (!deleted) {
      throw new NotFoundException('프로필을 찾을 수 없습니다.');
    }

    // 임시 저장도 삭제
    await this.profileRepo.deleteDraft(userId);

    return { success: true };
  }

  // ==================== 완성도 조회 ====================

  /**
   * 프로필 완성도 조회
   */
  async getCompletion(userId: string): Promise<ProfileCompletionResponseDto> {
    const profile = await this.profileRepo.findByUserId(userId);
    const householdMembers = profile
      ? await this.profileRepo.findHouseholdMembers(profile.id)
      : [];

    return this.completionService.calculateCompletion(profile, householdMembers);
  }

  // ==================== 임시 저장 ====================

  /**
   * 임시 저장 조회
   */
  async getDraft(userId: string): Promise<ProfileDraftResponseDto | null> {
    const draft = await this.profileRepo.findDraft(userId);
    if (!draft) {
      return null;
    }

    return {
      currentStep: draft.currentStep,
      formData: draft.formData,
      savedAt: draft.savedAt.toISOString(),
    };
  }

  /**
   * 임시 저장
   */
  async saveDraft(userId: string, dto: SaveDraftDto): Promise<{ success: boolean; savedAt: string }> {
    const draft = await this.profileRepo.saveDraft(
      userId,
      dto.currentStep,
      dto.formData,
    );

    return {
      success: true,
      savedAt: draft.savedAt.toISOString(),
    };
  }

  /**
   * 임시 저장 삭제
   */
  async deleteDraft(userId: string): Promise<{ success: boolean }> {
    await this.profileRepo.deleteDraft(userId);
    return { success: true };
  }

  // ==================== 헬퍼 함수 ====================

  /**
   * 나이 계산
   */
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * 이름 마스킹 (예: 홍길동 → 홍*동)
   */
  private maskName(name: string): string {
    if (name.length <= 1) return name;
    if (name.length === 2) return name[0] + '*';

    const first = name[0];
    const last = name[name.length - 1];
    const middle = '*'.repeat(name.length - 2);

    return first + middle + last;
  }

  /**
   * 전화번호 마스킹 (예: 010-1234-5678 → 010-****-5678)
   */
  private maskPhone(phone: string): string {
    const cleaned = phone.replace(/-/g, '');
    if (cleaned.length < 10) return phone;

    const start = cleaned.slice(0, 3);
    const end = cleaned.slice(-4);

    return `${start}-****-${end}`;
  }

  // ==================== 매칭용 프로필 조회 ====================

  /**
   * 추천 매칭용 프로필 조회
   * RecommendationService에서 호출하여 매칭 엔진에 전달
   */
  async getProfileForMatching(userId: string): Promise<ProfileForMatchingDto | null> {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      return null;
    }

    // 가구원 정보 조회
    const householdMembers = await this.profileRepo.findHouseholdMembers(profile.id);
    
    // 나이 계산
    const age = this.calculateAge(profile.birthDate);

    // 소득 레벨 계산 (1-8 범위로 변환)
    const incomeLevel = this.getIncomeLevelFromBracket(profile.incomeBracket);

    // 가구 유형 결정
    const householdType = this.determineHouseholdType(householdMembers);

    // 특수 조건 수집
    const specialConditions = this.collectSpecialConditions(profile, householdMembers);

    return {
      userId,
      age,
      incomeLevel,
      sido: profile.sido,
      sigungu: profile.sigungu,
      householdType,
      householdSize: profile.householdSize,
      specialConditions,
    };
  }

  /**
   * 소득 구간을 레벨(1-8)로 변환
   */
  private getIncomeLevelFromBracket(bracket: IncomeBracket): number {
    const bracketToLevel: Record<IncomeBracket, number> = {
      [IncomeBracket.BELOW_50]: 2,    // 50% 이하 → 레벨 2
      [IncomeBracket.BELOW_75]: 3,    // 50-75% → 레벨 3
      [IncomeBracket.BELOW_100]: 4,   // 75-100% → 레벨 4
      [IncomeBracket.BELOW_150]: 6,   // 100-150% → 레벨 6
      [IncomeBracket.ABOVE_150]: 8,   // 150% 초과 → 레벨 8
    };
    return bracketToLevel[bracket] || 5;
  }

  /**
   * 가구 유형 결정
   */
  private determineHouseholdType(members: HouseholdMember[]): string {
    if (members.length === 0) {
      return 'single';
    }

    const hasSpouse = members.some(m => m.relation === FamilyRelation.SPOUSE);
    const hasChild = members.some(m => m.relation === FamilyRelation.CHILD);
    const hasParent = members.some(m => m.relation === FamilyRelation.PARENT);

    if (hasSpouse && hasChild) {
      return 'nuclear_family';
    }
    if (hasSpouse && !hasChild) {
      return 'married_couple';
    }
    if (!hasSpouse && hasChild) {
      return 'single_parent';
    }
    if (hasParent) {
      return 'extended_family';
    }

    return 'other';
  }

  /**
   * 특수 조건 수집
   */
  private collectSpecialConditions(
    profile: UserProfile,
    members: HouseholdMember[],
  ): Record<string, boolean | string | number> {
    const conditions: Record<string, boolean | string | number> = {};

    // 가구원 중 장애인 여부
    const hasDisabledMember = members.some(m => m.hasDisability);
    conditions.has_disabled_member = hasDisabledMember;

    // 소득 없음 여부
    conditions.is_unemployed = profile.incomeType === IncomeType.NONE;

    // 저소득 가구 여부
    conditions.is_low_income = [IncomeBracket.BELOW_50, IncomeBracket.BELOW_75].includes(profile.incomeBracket);

    // 가구원 중 노인 (65세 이상) 여부
    const hasElderly = members.some(m => this.calculateAge(m.birthDate) >= 65);
    conditions.has_elderly_member = hasElderly;

    // 미성년 자녀 여부
    const hasMinorChild = members.some(
      m => m.relation === FamilyRelation.CHILD && this.calculateAge(m.birthDate) < 18
    );
    conditions.has_minor_child = hasMinorChild;

    return conditions;
  }
}

/** 매칭용 프로필 DTO */
export interface ProfileForMatchingDto {
  userId: string;
  age: number;
  incomeLevel: number;
  sido: string;
  sigungu: string;
  householdType: string;
  householdSize: number;
  specialConditions: Record<string, boolean | string | number>;
}
