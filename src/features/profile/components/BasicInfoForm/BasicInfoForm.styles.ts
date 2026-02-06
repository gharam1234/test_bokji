/**
 * BasicInfoForm 스타일
 */

export const basicInfoFormStyles = {
  container: 'space-y-6',
  title: 'text-xl font-semibold text-gray-900 mb-2',
  description: 'text-gray-600 mb-6',
  formGroup: 'space-y-4',
  fieldRow: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  field: 'flex flex-col',
  label: 'block text-sm font-medium text-gray-700 mb-1',
  required: 'text-red-500 ml-1',
  input: `
    w-full px-4 py-2.5 border border-gray-300 rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    transition-colors duration-200
    disabled:bg-gray-100 disabled:cursor-not-allowed
  `,
  inputError: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  select: `
    w-full px-4 py-2.5 border border-gray-300 rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    bg-white transition-colors duration-200
  `,
  errorText: 'text-sm text-red-500 mt-1',
  helpText: 'text-sm text-gray-500 mt-1',
};
