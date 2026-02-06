/**
 * AddressForm 스타일
 */

export const addressFormStyles = {
  container: 'space-y-6',
  title: 'text-xl font-semibold text-gray-900 mb-2',
  description: 'text-gray-600 mb-6',
  formGroup: 'space-y-4',
  fieldRow: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  field: 'flex flex-col',
  label: 'block text-sm font-medium text-gray-700 mb-1',
  required: 'text-red-500 ml-1',
  inputWrapper: 'flex gap-2',
  input: `
    w-full px-4 py-2.5 border border-gray-300 rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    transition-colors duration-200
    disabled:bg-gray-100 disabled:cursor-not-allowed
  `,
  inputReadonly: 'bg-gray-50',
  inputError: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  searchButton: `
    px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg
    hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    transition-colors duration-200
    whitespace-nowrap
  `,
  errorText: 'text-sm text-red-500 mt-1',
  helpText: 'text-sm text-gray-500 mt-1',
  addressDisplay: `
    p-4 bg-gray-50 border border-gray-200 rounded-lg
  `,
  addressLabel: 'text-xs text-gray-500 mb-1',
  addressValue: 'text-gray-900',
};
