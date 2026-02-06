/**
 * ProfileForm 스타일
 */

export const profileFormStyles = {
  container: 'max-w-2xl mx-auto',
  header: 'mb-8',
  title: 'text-2xl font-bold text-gray-900',
  stepSection: 'mb-8',
  formContent: 'bg-white shadow-sm rounded-xl p-6 mb-6',
  navigation: 'flex justify-between items-center mt-8',
  prevButton: `
    inline-flex items-center px-4 py-2.5 text-gray-700 font-medium rounded-lg
    border border-gray-300 hover:bg-gray-50
    focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
    transition-colors duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  nextButton: `
    inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg
    hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    transition-colors duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  submitButton: `
    inline-flex items-center px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg
    hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2
    transition-colors duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  autoSaveIndicator: `
    flex items-center gap-2 text-sm text-gray-500
  `,
  savingText: 'text-blue-500',
  savedText: 'text-green-500',
  errorText: 'text-red-500',
  loadingOverlay: `
    fixed inset-0 bg-white/80 flex items-center justify-center z-50
  `,
  spinner: 'w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin',
};
