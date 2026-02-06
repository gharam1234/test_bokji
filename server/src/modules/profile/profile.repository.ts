/**
 * 프로필 레포지토리
 * 프로필 관련 데이터베이스 작업 처리
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserProfile, ProfileStep } from './entities/user-profile.entity';
import { HouseholdMember } from './entities/household-member.entity';
import { ProfileDraft } from './entities/profile-draft.entity';

@Injectable()
export class ProfileRepository {
  private readonly logger = new Logger(ProfileRepository.name);

  constructor(
    @InjectRepository(UserProfile)
    private readonly profileRepo: Repository<UserProfile>,
    @InjectRepository(HouseholdMember)
    private readonly householdRepo: Repository<HouseholdMember>,
    @InjectRepository(ProfileDraft)
    private readonly draftRepo: Repository<ProfileDraft>,
    private readonly dataSource: DataSource,
  ) {}

  // ==================== 프로필 CRUD ====================

  /**
   * 프로필 생성
   */
  async createProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const profile = this.profileRepo.create(data);
    return this.profileRepo.save(profile);
  }

  /**
   * 사용자 ID로 프로필 조회
   */
  async findByUserId(userId: string): Promise<UserProfile | null> {
    return this.profileRepo.findOne({
      where: { userId },
      relations: ['householdMembers'],
    });
  }

  /**
   * 프로필 ID로 조회
   */
  async findById(id: string): Promise<UserProfile | null> {
    return this.profileRepo.findOne({
      where: { id },
      relations: ['householdMembers'],
    });
  }

  /**
   * 프로필 수정
   */
  async updateProfile(
    userId: string,
    data: Partial<UserProfile>,
  ): Promise<UserProfile | null> {
    await this.profileRepo.update({ userId }, data);
    return this.findByUserId(userId);
  }

  /**
   * 프로필 삭제
   */
  async deleteProfile(userId: string): Promise<boolean> {
    const result = await this.profileRepo.delete({ userId });
    return result.affected !== 0;
  }

  /**
   * 프로필 존재 여부 확인
   */
  async existsByUserId(userId: string): Promise<boolean> {
    const count = await this.profileRepo.count({ where: { userId } });
    return count > 0;
  }

  // ==================== 가구원 CRUD ====================

  /**
   * 가구원 추가
   */
  async createHouseholdMember(data: Partial<HouseholdMember>): Promise<HouseholdMember> {
    const member = this.householdRepo.create(data);
    return this.householdRepo.save(member);
  }

  /**
   * 프로필의 가구원 목록 조회
   */
  async findHouseholdMembers(profileId: string): Promise<HouseholdMember[]> {
    return this.householdRepo.find({
      where: { profileId },
      order: { displayOrder: 'ASC' },
    });
  }

  /**
   * 가구원 수정
   */
  async updateHouseholdMember(
    id: string,
    data: Partial<HouseholdMember>,
  ): Promise<HouseholdMember | null> {
    await this.householdRepo.update({ id }, data);
    return this.householdRepo.findOne({ where: { id } });
  }

  /**
   * 가구원 삭제
   */
  async deleteHouseholdMember(id: string): Promise<boolean> {
    const result = await this.householdRepo.delete({ id });
    return result.affected !== 0;
  }

  /**
   * 프로필의 모든 가구원 삭제
   */
  async deleteAllHouseholdMembers(profileId: string): Promise<void> {
    await this.householdRepo.delete({ profileId });
  }

  /**
   * 가구원 일괄 저장 (트랜잭션)
   */
  async saveHouseholdMembers(
    profileId: string,
    members: Partial<HouseholdMember>[],
  ): Promise<HouseholdMember[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 기존 가구원 삭제
      await queryRunner.manager.delete(HouseholdMember, { profileId });

      // 새 가구원 저장
      const savedMembers: HouseholdMember[] = [];
      for (let i = 0; i < members.length; i++) {
        const member = queryRunner.manager.create(HouseholdMember, {
          ...members[i],
          profileId,
          displayOrder: i,
        });
        const saved = await queryRunner.manager.save(member);
        savedMembers.push(saved);
      }

      await queryRunner.commitTransaction();
      return savedMembers;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to save household members: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== 임시 저장 CRUD ====================

  /**
   * 임시 저장 조회
   */
  async findDraft(userId: string): Promise<ProfileDraft | null> {
    return this.draftRepo.findOne({ where: { userId } });
  }

  /**
   * 임시 저장 (upsert)
   */
  async saveDraft(
    userId: string,
    currentStep: ProfileStep,
    formData: Record<string, any>,
  ): Promise<ProfileDraft> {
    const existing = await this.findDraft(userId);

    if (existing) {
      existing.currentStep = currentStep;
      existing.formData = formData;
      existing.savedAt = new Date();
      return this.draftRepo.save(existing);
    }

    const draft = this.draftRepo.create({
      userId,
      currentStep,
      formData,
    });
    return this.draftRepo.save(draft);
  }

  /**
   * 임시 저장 삭제
   */
  async deleteDraft(userId: string): Promise<boolean> {
    const result = await this.draftRepo.delete({ userId });
    return result.affected !== 0;
  }

  // ==================== 통계 쿼리 ====================

  /**
   * 지역별 프로필 수 조회
   */
  async countByRegion(): Promise<{ sido: string; count: number }[]> {
    return this.profileRepo
      .createQueryBuilder('profile')
      .select('profile.sido', 'sido')
      .addSelect('COUNT(*)', 'count')
      .groupBy('profile.sido')
      .getRawMany();
  }

  /**
   * 소득 구간별 프로필 수 조회
   */
  async countByIncomeBracket(): Promise<{ bracket: string; count: number }[]> {
    return this.profileRepo
      .createQueryBuilder('profile')
      .select('profile.income_bracket', 'bracket')
      .addSelect('COUNT(*)', 'count')
      .groupBy('profile.income_bracket')
      .getRawMany();
  }
}
