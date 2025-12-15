import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { useRecruitment } from '../../contexts/RecruitmentContext';
import StatusBadge from '../../components/recruitment/StatusBadge';
import { VerticalStepIndicator } from '../../components/recruitment/StepIndicator';

// Step Components
import Step1TOR from './steps/Step1TOR';
import Step2Requisition from './steps/Step2Requisition';
import Step4Vacancy from './steps/Step4Vacancy';
import Step5Applications from './steps/Step5Applications';
import Step6Committee from './steps/Step6Committee';
import Step7Longlisting from './steps/Step7Longlisting';
import Step8Shortlisting from './steps/Step8Shortlisting';
import Step9WrittenTest from './steps/Step9WrittenTest';
import Step10Interview from './steps/Step10Interview';
import Step11Report from './steps/Step11Report';
import Step12Offer from './steps/Step12Offer';
import Step13Sanction from './steps/Step13Sanction';
import Step14BackgroundCheck from './steps/Step14BackgroundCheck';
import Step15Contract from './steps/Step15Contract';

const RecruitmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentRecruitment,
    loading,
    error,
    getRecruitmentById,
    advanceStep,
    RECRUITMENT_STEPS,
  } = useRecruitment();

  const [activeStep, setActiveStep] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load recruitment data
  useEffect(() => {
    if (id) {
      getRecruitmentById(parseInt(id));
    }
  }, [id, getRecruitmentById]);

  // Set active step when recruitment loads
  useEffect(() => {
    if (currentRecruitment) {
      setActiveStep(currentRecruitment.currentStep);
    }
  }, [currentRecruitment]);

  const handleStepClick = (step) => {
    if (step <= currentRecruitment?.currentStep) {
      setActiveStep(step);
    }
  };

  const handleAdvanceStep = async () => {
    try {
      await advanceStep(parseInt(id));
    } catch (err) {
      console.error('Failed to advance step:', err);
    }
  };

  const renderStepContent = () => {
    if (!currentRecruitment) return null;

    const stepProps = {
      recruitment: currentRecruitment,
      onAdvance: handleAdvanceStep,
      isCurrentStep: activeStep === currentRecruitment.currentStep,
    };

    switch (activeStep) {
      case 1:
        return <Step1TOR {...stepProps} />;
      case 2:
      case 3:
        return <Step2Requisition {...stepProps} />;
      case 4:
        return <Step4Vacancy {...stepProps} />;
      case 5:
        return <Step5Applications {...stepProps} />;
      case 6:
        return <Step6Committee {...stepProps} />;
      case 7:
        return <Step7Longlisting {...stepProps} />;
      case 8:
        return <Step8Shortlisting {...stepProps} />;
      case 9:
        return <Step9WrittenTest {...stepProps} />;
      case 10:
        return <Step10Interview {...stepProps} />;
      case 11:
        return <Step11Report {...stepProps} />;
      case 12:
        return <Step12Offer {...stepProps} />;
      case 13:
        return <Step13Sanction {...stepProps} />;
      case 14:
        return <Step14BackgroundCheck {...stepProps} />;
      case 15:
        return <Step15Contract {...stepProps} />;
      default:
        return <Step1TOR {...stepProps} />;
    }
  };

  if (loading && !currentRecruitment) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading recruitment...</p>
        </div>
      </div>
    );
  }

  if (error && !currentRecruitment) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-300">
                Error Loading Recruitment
              </h3>
              <p className="mt-1 text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/recruitment')}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  if (!currentRecruitment) {
    return null;
  }

  const currentStepInfo = RECRUITMENT_STEPS.find(s => s.step === activeStep);

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-72' : 'w-0'
        } transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0`}
      >
        <div className="w-72 p-4 h-full overflow-y-auto">
          {/* Recruitment Info */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/recruitment')}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to List
            </button>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Recruitment Code</p>
              <p className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                {currentRecruitment.recruitmentCode}
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">
                {currentRecruitment.positionTitle || 'Position Not Set'}
              </p>
              <div className="mt-2">
                <StatusBadge status={currentRecruitment.status} size="xs" />
              </div>
            </div>
          </div>

          {/* Step Navigator */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Recruitment Steps
            </h3>
            <VerticalStepIndicator
              steps={RECRUITMENT_STEPS}
              currentStep={currentRecruitment.currentStep}
              onStepClick={handleStepClick}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Step {activeStep}: {currentStepInfo?.name}
                </h1>
                {activeStep < currentRecruitment.currentStep && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Completed - Viewing history
                  </p>
                )}
                {activeStep === currentRecruitment.currentStep && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Current step - In progress
                  </p>
                )}
              </div>
            </div>

            {/* Step Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                disabled={activeStep === 1}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {activeStep} / 15
              </span>
              <button
                onClick={() => setActiveStep(Math.min(currentRecruitment.currentStep, activeStep + 1))}
                disabled={activeStep >= currentRecruitment.currentStep}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default RecruitmentDetail;
