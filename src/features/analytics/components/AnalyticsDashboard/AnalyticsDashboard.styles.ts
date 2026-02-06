/**
 * AnalyticsDashboard 스타일
 * 대시보드 관련 스타일 정의
 */

export const dashboardStyles = {
  // 컨테이너
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',

  // 헤더
  header: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6',
  title: 'text-2xl font-bold text-gray-900 flex items-center gap-2',
  subtitle: 'text-gray-500 mt-1',

  // 그리드
  gridTwoCols: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
  gridFourCols: 'grid grid-cols-2 md:grid-cols-4 gap-4',

  // 카드
  card: 'bg-white rounded-lg shadow-sm border border-gray-200 p-4',
  cardHeader: 'mb-4',
  cardTitle: 'text-lg font-semibold text-gray-900',

  // 섹션
  section: 'space-y-6',
  sectionDivider: 'pt-4 border-t border-gray-200',

  // 버튼
  buttonPrimary: 'bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg',
  buttonSecondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg',
};

export default dashboardStyles;
