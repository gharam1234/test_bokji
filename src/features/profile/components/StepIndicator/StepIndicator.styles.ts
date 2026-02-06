/**
 * StepIndicator 스타일
 */

export const stepIndicatorStyles = {
  container: 'flex items-center justify-center mb-8',
  stepList: 'flex items-center space-x-2 md:space-x-4',
  stepWrapper: 'flex items-center',
  step: `
    flex items-center justify-center w-8 h-8 md:w-10 md:h-10 
    rounded-full text-sm font-medium transition-all duration-200
  `,
  stepActive: 'bg-blue-600 text-white',
  stepCompleted: 'bg-green-500 text-white',
  stepPending: 'bg-gray-200 text-gray-500',
  stepLabel: 'hidden md:block ml-2 text-sm font-medium',
  stepLabelActive: 'text-blue-600',
  stepLabelCompleted: 'text-green-600',
  stepLabelPending: 'text-gray-400',
  connector: 'w-8 md:w-12 h-0.5 mx-1 md:mx-2',
  connectorCompleted: 'bg-green-500',
  connectorPending: 'bg-gray-200',
};
