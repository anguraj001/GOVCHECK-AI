import React, { useState } from 'react';
import { 
  CheckCircle2, 
  FileText, 
  UploadCloud, 
  Scale, 
  Sliders, 
  Award, 
  ArrowLeft,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { GovService, Application, Language, RiskAssessment, VerificationIssue } from '../../types';
import { translations } from '../../translations';
import { api } from '../../services/api';
import { DynamicFormStep } from './DynamicFormStep';
import { DocumentUploadStep } from './DocumentUploadStep';
import { RiskAssessmentView } from './RiskAssessmentView';
import { CorrectionCenter } from './CorrectionCenter';
import { ReadinessReportView } from './ReadinessReportView';

interface WizardContainerProps {
  service: GovService;
  application: Application;
  language: Language;
  onApplicationUpdate: (app: Application) => void;
  onExit: () => void;
}

export const WizardContainer: React.FC<WizardContainerProps> = ({
  service,
  application,
  language,
  onApplicationUpdate,
  onExit,
}) => {
  // Wizard steps: 'FORM' | 'UPLOAD' | 'VERIFYING' | 'ASSESSMENT' | 'CORRECTION' | 'REPORT'
  const [currentStep, setCurrentStep] = useState<'FORM' | 'UPLOAD' | 'VERIFYING' | 'ASSESSMENT' | 'CORRECTION' | 'REPORT'>(
    application.currentAssessment ? 'ASSESSMENT' : 'FORM'
  );
  const [verifyingStage, setVerifyingStage] = useState<string>('Initializing verification engine...');
  const t = translations[language];

  const handleRunVerification = async () => {
    setCurrentStep('VERIFYING');
    setVerifyingStage('1/4: Analyzing document completeness & mandatory checklists...');

    setTimeout(() => {
      setVerifyingStage('2/4: Running cross-document fuzzy name & address consistency checks...');
    }, 400);

    setTimeout(() => {
      setVerifyingStage('3/4: Evaluating statutory criteria & service income/mark rules...');
    }, 800);

    try {
      const result = await api.verifyApplication(application.id);
      onApplicationUpdate(result.application);
      setTimeout(() => {
        setCurrentStep('ASSESSMENT');
      }, 1200);
    } catch (err: any) {
      alert('Verification error: ' + err.message);
      setCurrentStep('UPLOAD');
    }
  };

  const stepsList = [
    { key: 'FORM', labelEn: 'Application Form', labelTa: 'விண்ணப்பப் படிவம்' },
    { key: 'UPLOAD', labelEn: 'Document Upload', labelTa: 'ஆவண பதிவேற்றம்' },
    { key: 'ASSESSMENT', labelEn: 'Risk Analysis', labelTa: 'அபாய பகுப்பாய்வு' },
    { key: 'CORRECTION', labelEn: 'Correction Center', labelTa: 'திருத்தும் மையம்' },
    { key: 'REPORT', labelEn: 'Readiness Report', labelTa: 'தயார் அறிக்கை' },
  ];

  const getStepIndex = (stepKey: string) => {
    switch (stepKey) {
      case 'FORM': return 0;
      case 'UPLOAD': return 1;
      case 'VERIFYING':
      case 'ASSESSMENT': return 2;
      case 'CORRECTION': return 3;
      case 'REPORT': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            title="Exit to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800">
                {service.code}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {application.applicationNumber}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-gray-900">
              {language === 'ta' ? service.nameTa : service.nameEn}
            </h1>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          {application.currentAssessment && (
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
              application.currentAssessment.level === 'LOW' 
                ? 'bg-emerald-100 text-emerald-800'
                : application.currentAssessment.level === 'MEDIUM'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {application.currentAssessment.level} RISK ({application.currentAssessment.score}/100)
            </span>
          )}
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="hidden sm:grid grid-cols-5 gap-2 text-center text-xs font-bold">
        {stepsList.map((st, idx) => (
          <div
            key={st.key}
            onClick={() => {
              // Allow navigation to past or completed steps
              if (idx <= currentIndex && currentStep !== 'VERIFYING') {
                setCurrentStep(st.key as any);
              }
            }}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              idx === currentIndex
                ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                : idx < currentIndex
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-gray-50 text-gray-400 border-gray-200'
            }`}
          >
            <span className="block text-[10px] opacity-75">Step 0{idx + 1}</span>
            <span className="truncate block mt-0.5">
              {language === 'ta' ? st.labelTa : st.labelEn}
            </span>
          </div>
        ))}
      </div>

      {/* Main Wizard Content Area */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
        
        {/* Step 1: Form */}
        {currentStep === 'FORM' && (
          <DynamicFormStep
            service={service}
            formData={application.dynamicFormData || {}}
            language={language}
            onFormDataChange={async (updatedData) => {
              const { application: updatedApp } = await api.updateApplication(application.id, updatedData);
              onApplicationUpdate(updatedApp);
            }}
            onNext={() => setCurrentStep('UPLOAD')}
            onBack={onExit}
          />
        )}

        {/* Step 2: Document Upload */}
        {currentStep === 'UPLOAD' && (
          <DocumentUploadStep
            service={service}
            application={application}
            language={language}
            onApplicationUpdate={onApplicationUpdate}
            onNext={handleRunVerification}
            onBack={() => setCurrentStep('FORM')}
          />
        )}

        {/* Step 3: Verification Engine Running Animation */}
        {currentStep === 'VERIFYING' && (
          <div className="py-16 text-center space-y-6 max-w-md mx-auto">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full border-4 border-blue-100 border-t-blue-700 animate-spin" />
              <Sparkles className="w-8 h-8 text-blue-600 absolute inset-0 m-auto animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-lg text-gray-900">
                Evaluating Pre-Submission Rules
              </h3>
              <p className="text-xs text-blue-700 font-semibold animate-pulse">
                {verifyingStage}
              </p>
              <p className="text-xs text-gray-400">
                Performing cross-document fuzzy matching and deterministic statutory validation...
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Risk Assessment View */}
        {currentStep === 'ASSESSMENT' && application.currentAssessment && (
          <RiskAssessmentView
            assessment={application.currentAssessment}
            issues={application.currentIssues || []}
            application={application}
            service={service}
            language={language}
            onOpenCorrectionCenter={() => setCurrentStep('CORRECTION')}
            onViewReadinessReport={() => setCurrentStep('REPORT')}
            onReverify={handleRunVerification}
          />
        )}

        {/* Step 5: Correction Center */}
        {currentStep === 'CORRECTION' && (
          <CorrectionCenter
            application={application}
            service={service}
            language={language}
            onApplicationUpdate={onApplicationUpdate}
            onViewReadinessReport={() => setCurrentStep('REPORT')}
          />
        )}

        {/* Step 6: Readiness Report View */}
        {currentStep === 'REPORT' && (
          <ReadinessReportView
            application={application}
            service={service}
            language={language}
            onBackToCorrection={() => setCurrentStep('CORRECTION')}
            onBackToDashboard={onExit}
          />
        )}

      </div>

    </div>
  );
};
