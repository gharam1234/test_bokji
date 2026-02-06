/**
 * ProfileView 스타일
 */

export const profileViewStyles = {
  container: 'max-w-2xl mx-auto',
  header: 'flex items-center justify-between mb-8',
  title: 'text-2xl font-bold text-gray-900',
  editButton: `
    inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg
    hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    transition-colors duration-200
  `,
  section: 'bg-white shadow-sm rounded-xl overflow-hidden mb-6',
  sectionHeader: 'px-6 py-4 bg-gray-50 border-b border-gray-200',
  sectionTitle: 'text-lg font-semibold text-gray-900',
  sectionContent: 'p-6',
  grid: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  field: 'flex flex-col',
  label: 'text-sm font-medium text-gray-500 mb-1',
  value: 'text-gray-900',
  valueLarge: 'text-lg font-semibold text-gray-900',
  badge: `
    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
    bg-blue-100 text-blue-800
  `,
  badgeGreen: 'bg-green-100 text-green-800',
  badgeYellow: 'bg-yellow-100 text-yellow-800',
  memberCard: `
    p-4 bg-gray-50 rounded-lg flex items-center justify-between
  `,
  memberInfo: 'flex-1',
  memberName: 'font-medium text-gray-900',
  memberDetails: 'text-sm text-gray-500 mt-1',
  memberBadge: `
    inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
    bg-gray-200 text-gray-700 mr-2
  `,
  completionSection: 'p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-xl mb-6',
  completionTitle: 'text-lg font-semibold text-gray-900 mb-4',
  completionBar: 'w-full bg-gray-200 rounded-full h-3 mb-2',
  completionFill: 'bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500',
  completionText: 'text-sm text-gray-600 text-right',
  infoBox: 'mt-4 p-4 bg-white/50 rounded-lg',
  infoText: 'text-sm text-gray-600',
  emptyState: 'py-12 text-center text-gray-500',
  emptyIcon: 'w-16 h-16 mx-auto text-gray-300 mb-4',
  emptyTitle: 'text-xl font-medium text-gray-900 mb-2',
  emptyDescription: 'text-gray-500 mb-6',
  createButton: `
    inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg
    hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    transition-colors duration-200
  `,
  maskedValue: 'font-mono tracking-wider',
};
