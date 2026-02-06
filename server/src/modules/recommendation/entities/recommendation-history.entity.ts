/**
 * 추천 이력 엔티티
 * 추천 관련 사용자 행동 기록
 */

// ==================== Enums ====================

/** 추천 액션 유형 */
export enum RecommendationAction {
  GENERATED = 'generated',     // 추천 생성됨
  VIEWED = 'viewed',           // 조회함
  BOOKMARKED = 'bookmarked',   // 북마크함
  APPLIED = 'applied',         // 신청함
}

// ==================== Interfaces ====================

/** 추천 이력 엔티티 */
export interface RecommendationHistory {
  id: string;
  userId: string;
  programId: string;
  matchScore: number;
  action: RecommendationAction;
  createdAt: Date;
}

/** DB 로우 타입 */
export interface RecommendationHistoryRow {
  id: string;
  user_id: string;
  program_id: string;
  match_score: number;
  action: string;
  created_at: Date;
}

/**
 * DB 로우를 엔티티로 변환
 */
export function toRecommendationHistory(
  row: RecommendationHistoryRow,
): RecommendationHistory {
  return {
    id: row.id,
    userId: row.user_id,
    programId: row.program_id,
    matchScore: row.match_score,
    action: row.action as RecommendationAction,
    createdAt: row.created_at,
  };
}
