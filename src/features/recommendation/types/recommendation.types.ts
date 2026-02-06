/**
 * 복지 추천 타입 정의
 * 추천 관련 TypeScript 타입
 */

// ==================== Enums ====================

/** 복지 카테고리 */
export enum WelfareCategory {
  LIVING_SUPPORT = 'living_support',   // 생활지원
  HOUSING = 'housing',                  // 주거
  EDUCATION = 'education',              // 교육
  MEDICAL = 'medical',                  // 의료
  EMPLOYMENT = 'employment',            // 고용
  CHILDCARE = 'childcare',              // 보육/돌봄
  OTHER = 'other',                      // 기타
}

/** 카테고리 라벨 */
export const CATEGORY_LABELS: Record<WelfareCategory, string> = {
  [WelfareCategory.LIVING_SUPPORT]: '생활지원',
  [WelfareCategory.HOUSING]: '주거',
  [WelfareCategory.EDUCATION]: '교육',
  [WelfareCategory.MEDICAL]: '의료',
  [WelfareCategory.EMPLOYMENT]: '고용',
  [WelfareCategory.CHILDCARE]: '보육/돌봄',
  [WelfareCategory.OTHER]: '기타',
};

/** 카테고리 아이콘 */
export const CATEGORY_ICONS: Record<WelfareCategory, string> = {
  [WelfareCategory.LIVING_SUPPORT]: '💰',
  [WelfareCategory.HOUSING]: '🏠',
  [WelfareCategory.EDUCATION]: '📚',
  [WelfareCategory.MEDICAL]: '🏥',
  [WelfareCategory.EMPLOYMENT]: '💼',
  [WelfareCategory.CHILDCARE]: '👶',
  [WelfareCategory.OTHER]: '📋',
};

/** 매칭 이유 유형 */
export enum MatchReasonType {
  AGE = 'age',
  INCOME = 'income',
  REGION = 'region',
  HOUSEHOLD = 'household',
  SPECIAL = 'special',
}

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
  label: string;
  weight: number;
}

/** 추천 아이템 (목록용) */
export interface RecommendationItem {
  id: string;
  programId: string;
  name: string;
  summary: string;
  category: WelfareCategory;
  categoryLabel: string;
  matchScore: number;
  matchReasons: MatchReason[];
  benefits: string;
  benefitAmount?: string | null;
  deadline?: string | null;
  isBookmarked: boolean;
  tags: string[];
}

/** 카테고리별 개수 */
export interface CategoryCount {
  category: WelfareCategory;
  label: string;
  count: number;
}
