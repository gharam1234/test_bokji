/**
 * 추천 결과 엔티티
 * 사용자별 복지 추천 결과 데이터 구조
 */

import { WelfareProgram } from './welfare-program.entity';

// ==================== Enums ====================

/** 매칭 이유 유형 */
export enum MatchReasonType {
  AGE = 'age',
  INCOME = 'income',
  REGION = 'region',
  HOUSEHOLD = 'household',
  SPECIAL = 'special',
}

/** 매칭 이유 유형 라벨 */
export const MATCH_REASON_TYPE_LABELS: Record<MatchReasonType, string> = {
  [MatchReasonType.AGE]: '연령',
  [MatchReasonType.INCOME]: '소득',
  [MatchReasonType.REGION]: '지역',
  [MatchReasonType.HOUSEHOLD]: '가구',
  [MatchReasonType.SPECIAL]: '특수조건',
};

/** 정렬 옵션 */
export enum SortOption {
  MATCH_SCORE = 'match_score',          // 매칭률순
  LATEST = 'latest',                    // 최신순
  DEADLINE = 'deadline',                // 마감임박순
  POPULARITY = 'popularity',            // 인기순
}

/** 정렬 옵션 라벨 */
export const SORT_OPTION_LABELS: Record<SortOption, string> = {
  [SortOption.MATCH_SCORE]: '매칭률순',
  [SortOption.LATEST]: '최신순',
  [SortOption.DEADLINE]: '마감임박순',
  [SortOption.POPULARITY]: '인기순',
};

// ==================== Interfaces ====================

/** 매칭 이유 */
export interface MatchReason {
  type: MatchReasonType;
  label: string;                        // 사용자에게 표시할 텍스트
  weight: number;                       // 가중치
}

/** 추천 결과 엔티티 */
export interface Recommendation {
  id: string;
  userId: string;
  programId: string;
  program?: WelfareProgram;             // JOIN 시 포함
  matchScore: number;                   // 매칭률 (0-100)
  matchReasons: MatchReason[];          // 추천 이유
  isBookmarked: boolean;
  viewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** DB 로우 타입 */
export interface RecommendationRow {
  id: string;
  user_id: string;
  program_id: string;
  match_score: number;
  match_reasons: MatchReason[];
  is_bookmarked: boolean;
  viewed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * DB 로우를 엔티티로 변환
 */
export function toRecommendation(row: RecommendationRow): Recommendation {
  return {
    id: row.id,
    userId: row.user_id,
    programId: row.program_id,
    matchScore: row.match_score,
    matchReasons: row.match_reasons,
    isBookmarked: row.is_bookmarked,
    viewedAt: row.viewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
