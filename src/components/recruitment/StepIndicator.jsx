import { Check, Circle, Lock } from 'lucide-react';

const StepIndicator = ({ steps, currentStep, onStepClick, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isComplete = currentStep > stepNumber;
        const isCurrent = currentStep === stepNumber;
        const isLocked = currentStep < stepNumber;

        return (
          <button
            key={stepNumber}
            onClick={() => !isLocked && onStepClick?.(stepNumber)}
            disabled={isLocked}
            className={`
              flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
              transition-colors duration-200
              ${isComplete ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : ''}
              ${isCurrent ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 ring-2 ring-blue-500' : ''}
              ${isLocked ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}
            `}
            title={step.name}
          >
            <span className="flex-shrink-0">
              {isComplete ? (
                <Check className="w-3 h-3" />
              ) : isCurrent ? (
                <Circle className="w-3 h-3 fill-current" />
              ) : (
                <Lock className="w-3 h-3" />
              )}
            </span>
            <span className="hidden sm:inline">{stepNumber}</span>
          </button>
        );
      })}
    </div>
  );
};

// Vertical step indicator for sidebar
export const VerticalStepIndicator = ({ steps, currentStep, onStepClick, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isComplete = currentStep > stepNumber;
        const isCurrent = currentStep === stepNumber;
        const isLocked = currentStep < stepNumber;

        return (
          <button
            key={stepNumber}
            onClick={() => !isLocked && onStepClick?.(stepNumber)}
            disabled={isLocked}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
              transition-colors duration-200 text-left
              ${isComplete ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : ''}
              ${isCurrent ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 ring-2 ring-blue-500' : ''}
              ${isLocked ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'}
            `}
          >
            <span className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
              ${isComplete ? 'bg-green-500 text-white' : ''}
              ${isCurrent ? 'bg-blue-500 text-white' : ''}
              ${isLocked ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400' : ''}
            `}>
              {isComplete ? <Check className="w-4 h-4" /> : stepNumber}
            </span>
            <span className="flex-1 truncate">{step.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default StepIndicator;
