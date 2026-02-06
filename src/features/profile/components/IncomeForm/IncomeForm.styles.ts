/**
 * IncomeForm 스타일
 */

export const incomeFormStyles = {
  container: 'space-y-6',
  title: 'text-xl font-semibold text-gray-900 mb-2',
  description: 'text-gray-600 mb-6',
  formGroup: 'space-y-4',
  field: 'flex flex-col',
  label: 'block text-sm font-medium text-gray-700 mb-1',
  required: 'text-red-500 ml-1',
  select: `
    w-full px-4 py-2.5 border border-gray-300 rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    bg-white transition-colors duration-200
  `,
  inputWrapper: 'relative',
  input: `
    w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    transition-colors duration-200
  `,
  inputError: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  inputSuffix: 'absolute right-4 top-1/2 -translate-y-1/2 text-gray-500',
  errorText: 'text-sm text-red-500 mt-1',
  helpText: 'text-sm text-gray-500 mt-1',
  bracketCard: `
    mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg
  `,
  bracketTitle: 'text-sm font-medium text-blue-800 mb-2',
  bracketValue: 'text-lg font-semibold text-blue-900',
  bracketDescription: 'text-sm text-blue-700 mt-1',
};
