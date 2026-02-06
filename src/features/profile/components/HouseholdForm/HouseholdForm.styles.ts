/**
 * HouseholdForm 스타일
 */

export const householdFormStyles = {
  container: 'space-y-6',
  title: 'text-xl font-semibold text-gray-900 mb-2',
  description: 'text-gray-600 mb-6',
  formGroup: 'space-y-4',
  field: 'flex flex-col',
  label: 'block text-sm font-medium text-gray-700 mb-1',
  required: 'text-red-500 ml-1',
  input: `
    w-full px-4 py-2.5 border border-gray-300 rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    transition-colors duration-200
  `,
  select: `
    w-full px-4 py-2.5 border border-gray-300 rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    bg-white transition-colors duration-200
  `,
  inputError: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  errorText: 'text-sm text-red-500 mt-1',
  helpText: 'text-sm text-gray-500 mt-1',
  
  // 가구원 목록
  memberSection: 'mt-6',
  memberHeader: 'flex items-center justify-between mb-4',
  memberTitle: 'text-lg font-medium text-gray-900',
  addButton: `
    inline-flex items-center px-4 py-2 bg-blue-600 text-white 
    font-medium rounded-lg hover:bg-blue-700 
    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    transition-colors duration-200
  `,
  memberList: 'space-y-3',
  memberCard: `
    p-4 bg-white border border-gray-200 rounded-lg
    flex items-center justify-between
  `,
  memberInfo: 'flex-1',
  memberName: 'font-medium text-gray-900',
  memberDetails: 'text-sm text-gray-500 mt-1',
  memberBadge: `
    inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
    bg-gray-100 text-gray-600 mr-2
  `,
  memberActions: 'flex gap-2 ml-4',
  editButton: `
    p-2 text-gray-400 hover:text-blue-600 
    rounded-lg hover:bg-blue-50 transition-colors
  `,
  deleteButton: `
    p-2 text-gray-400 hover:text-red-600 
    rounded-lg hover:bg-red-50 transition-colors
  `,
  emptyState: `
    py-8 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200
  `,
  
  // 모달
  modal: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50',
  modalContent: 'bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-auto',
  modalHeader: 'flex items-center justify-between p-4 border-b',
  modalTitle: 'text-lg font-semibold text-gray-900',
  modalCloseButton: 'p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100',
  modalBody: 'p-4 space-y-4',
  modalFooter: 'flex justify-end gap-2 p-4 border-t bg-gray-50',
  cancelButton: `
    px-4 py-2 text-gray-700 font-medium rounded-lg
    hover:bg-gray-100 transition-colors
  `,
  submitButton: `
    px-4 py-2 bg-blue-600 text-white font-medium rounded-lg
    hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    transition-colors duration-200
  `,
  fieldRow: 'grid grid-cols-2 gap-4',
  checkboxLabel: 'flex items-center gap-2 cursor-pointer',
  checkbox: 'w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500',
};
