/**
 * 소득 구간 계산 서비스
 * 기준 중위소득 대비 소득 구간 자동 분류
 */

import { Injectable, Logger } from '@nestjs/common';
import { IncomeBracket } from '../entities/user-profile.entity';

// 2026년 기준 중위소득 (단위: 원/연간)
// 실제 운영시에는 DB 또는 설정 파일에서 관리
const MEDIAN_INCOME_2026: Record<number, number> = {
  1: 26_195_484,   // 1인 가구
  2: 43_563_288,   // 2인 가구
  3: 55_889_532,   // 3인 가구
  4: 68_065_944,   // 4인 가구
  5: 79_794_252,   // 5인 가구
  6: 91_108_056,   // 6인 가구
  7: 102_186_504,  // 7인 가구
};

// 7인 초과 시 1인당 추가 금액
const ADDITIONAL_PER_PERSON = 11_078_448;

@Injectable()
export class IncomeBracketService {
  private readonly logger = new Logger(IncomeBracketService.name);

  /**
   * 가구원 수에 따른 기준 중위소득 조회
   * @param householdSize 가구원 수
   * @returns 연간 기준 중위소득
   */
  getMedianIncome(householdSize: number): number {
    if (householdSize <= 0) {
      householdSize = 1;
    }

    if (householdSize <= 7) {
      return MEDIAN_INCOME_2026[householdSize];
    }

    // 7인 초과: 7인 가구 + 추가 인원 * 추가 금액
    const extraMembers = householdSize - 7;
    return MEDIAN_INCOME_2026[7] + (extraMembers * ADDITIONAL_PER_PERSON);
  }

  /**
   * 소득 구간 계산
   * @param annualIncome 연간 소득
   * @param householdSize 가구원 수
   * @returns 소득 구간
   */
  calculateBracket(annualIncome: number, householdSize: number): IncomeBracket {
    const medianIncome = this.getMedianIncome(householdSize);
    const ratio = annualIncome / medianIncome;

    this.logger.debug(
      `Income bracket calculation: income=${annualIncome}, median=${medianIncome}, ratio=${(ratio * 100).toFixed(1)}%`
    );

    if (ratio <= 0.5) {
      return IncomeBracket.BELOW_50;
    } else if (ratio <= 0.75) {
      return IncomeBracket.BELOW_75;
    } else if (ratio <= 1.0) {
      return IncomeBracket.BELOW_100;
    } else if (ratio <= 1.5) {
      return IncomeBracket.BELOW_150;
    } else {
      return IncomeBracket.ABOVE_150;
    }
  }

  /**
   * 소득 구간에 해당하는 소득 범위 조회
   * @param bracket 소득 구간
   * @param householdSize 가구원 수
   * @returns 소득 범위 { min, max }
   */
  getBracketRange(
    bracket: IncomeBracket,
    householdSize: number,
  ): { min: number; max: number } {
    const medianIncome = this.getMedianIncome(householdSize);

    const ranges: Record<IncomeBracket, { min: number; max: number }> = {
      [IncomeBracket.BELOW_50]: { min: 0, max: medianIncome * 0.5 },
      [IncomeBracket.BELOW_75]: { min: medianIncome * 0.5, max: medianIncome * 0.75 },
      [IncomeBracket.BELOW_100]: { min: medianIncome * 0.75, max: medianIncome },
      [IncomeBracket.BELOW_150]: { min: medianIncome, max: medianIncome * 1.5 },
      [IncomeBracket.ABOVE_150]: { min: medianIncome * 1.5, max: Number.MAX_SAFE_INTEGER },
    };

    return ranges[bracket];
  }

  /**
   * 소득 구간 라벨 조회
   * @param bracket 소득 구간
   * @returns 라벨 문자열
   */
  getBracketLabel(bracket: IncomeBracket): string {
    const labels: Record<IncomeBracket, string> = {
      [IncomeBracket.BELOW_50]: '중위소득 50% 이하',
      [IncomeBracket.BELOW_75]: '중위소득 50~75%',
      [IncomeBracket.BELOW_100]: '중위소득 75~100%',
      [IncomeBracket.BELOW_150]: '중위소득 100~150%',
      [IncomeBracket.ABOVE_150]: '중위소득 150% 초과',
    };

    return labels[bracket];
  }

  /**
   * 월 소득 계산
   * @param annualIncome 연간 소득
   * @returns 월 소득
   */
  calculateMonthlyIncome(annualIncome: number): number {
    return Math.round(annualIncome / 12);
  }
}
