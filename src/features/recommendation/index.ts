/**
 * Recommendation Feature - Public API
 * 
 * 복지 추천 기능의 외부 노출 인터페이스
 */

// Pages
export { RecommendationPage, WelfareDetailPage } from './pages';

// Components (외부에서 재사용 가능한 것만)
export { 
  MatchScoreBadge,
  RecommendationCard,
  CategoryFilter,
} from './components';

// Hooks
export { 
  useRecommendations,
  useWelfareDetail,
  useBookmark,
} from './hooks';

// Types
export type {
  Recommendation,
  MatchReason,
  WelfareProgram,
  EligibilityCriteria,
  ApplicationMethod,
  RequiredDocument,
  ContactInfo,
} from './types';

export {
  WelfareCategory,
  MatchReasonType,
  SortOption,
} from './types';

// API
export { recommendationApi } from './api';
