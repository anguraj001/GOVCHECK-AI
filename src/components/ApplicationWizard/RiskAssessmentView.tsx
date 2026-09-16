import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Scale, 
  Sliders, 
  ArrowRight, 
  Download, 
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import { RiskAssessment, VerificationIssue, Language, Application, GovService } from '../../types';
import { translations } from '../../translations';
import { generateApplicationPDF } from '../../lib/pdfGenerator';

interface RiskAssessmentViewProps {
  assessment: RiskAssessment;
  issues: VerificationIssue[];
  application: Application;
  service?: GovService;
  language: Language;
  onOpenCorrectionCenter: () => void;
  onViewReadinessReport: () => void;
  onReverify: () => void;
}

export const RiskAssessmentView: React.FC<RiskAssessmentViewProps> = ({
  assessment,
  issues,
  application,
  service,
  language,
  onOpenCorrectionCenter,
  onViewReadinessReport,
  onReverify,
}) => {
  const t = translations[language];
  const { score, level, breakdown } = assessment;

  const getDialColor = (lvl: string) => {
    if (lvl === 'LOW') return { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', bgLight: 'bg-emerald-50' };
    if (lvl === 'MEDIUM') return { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200', bgLight: 'bg-amber-50' };
    return { bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-200', bgLight: 'bg-red-50' };
  };

  const dial = getDialColor(level);

  return (
    <div className="space-y-8">
      
      {/* Top Banner: Score & Risk Level */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${dial.border} ${dial.bgLight} transition-all`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Score Dial & Level */}
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 rounded-full bg-white border-4 border-gray-100 shadow-sm flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400">Risk Score</span>
              <span className={`text-3xl font-extrabold ${dial.text}`}>
                {score}
              </span>
              <span className="text-[10px] text-gray-400">/ 100</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-white ${dial.bg}`}>
                  {level} REJECTION RISK
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {issues.length} {issues.length === 1 ? 'issue' : 'issues'} flagged
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                {level === 'LOW' && (language === 'ta' ? 'விண்ணப்பம் சமர்ப்பிக்க தகுதியானது' : 'Application Pre-Submission Ready')}
                {level === 'MEDIUM' && (language === 'ta' ? 'கவனிக்கப்பட வேண்டிய எச்சரிக்கைகள் உள்ளன' : 'Review & Minor Corrections Advised')}
                {level === 'HIGH' && (language === 'ta' ? 'முக்கிய ஆவணப் பிழைகள் கண்டறியப்பட்டன' : 'Critical Issues Detected Before Submission')}
              </h2>
              <p className="text-xs text-gray-600 max-w-xl leading-relaxed">
                {language === 'ta' ? assessment.summaryTa : assessment.summaryEn}
              </p>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
            {issues.length > 0 ? (
              <button
                id="btn-goto-correction-center"
                onClick={onOpenCorrectionCenter}
                className="px-5 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                <span>{language === 'ta' ? 'திருத்தும் மையத்திற்கு செல்க' : 'Open Correction Center'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-goto-readiness-report"
                onClick={onViewReadinessReport}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'ta' ? 'முழு அறிக்கையை காண்க' : 'View Readiness Report'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              id="btn-pdf-download-risk-view"
              onClick={() => generateApplicationPDF(application, service)}
              className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl border border-gray-300 shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-gray-500" />
              <span>{language === 'ta' ? 'PDF அறிக்கை பதிவிறக்கு' : 'Download PDF Report'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 4 Objective Verification Pillars Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-base text-gray-900">
            {language === 'ta' ? '4 தூண்கள் அடிப்படையிலான சரிபார்ப்பு விவரம்' : 'Transparent 4-Pillar Verification Breakdown'}
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            Objective mathematical scoring criteria
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Pillar 1: Document Completeness */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Completeness
              </span>
              <span className={`font-extrabold px-2 py-0.5 rounded text-[10px] ${
                breakdown.documentCompleteness === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {breakdown.documentCompleteness === 0 ? 'PASS' : `+${breakdown.documentCompleteness} pts`}
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full ${breakdown.documentCompleteness === 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, (breakdown.documentCompleteness / 30) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-500 leading-snug">
              Checks mandatory uploads (ID, proof of income/address) against service catalog.
            </p>
          </div>

          {/* Pillar 2: Cross-Document Consistency */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-indigo-600" />
                Consistency
              </span>
              <span className={`font-extrabold px-2 py-0.5 rounded text-[10px] ${
                breakdown.informationConsistency === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {breakdown.informationConsistency === 0 ? 'PASS' : `+${breakdown.informationConsistency} pts`}
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full ${breakdown.informationConsistency === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, (breakdown.informationConsistency / 25) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-500 leading-snug">
              Fuzzy name similarity, address matching, and scan clarity across files.
            </p>
          </div>

          {/* Pillar 3: Required Fields */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Required Fields
              </span>
              <span className={`font-extrabold px-2 py-0.5 rounded text-[10px] ${
                breakdown.requiredFields === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {breakdown.requiredFields === 0 ? 'PASS' : `+${breakdown.requiredFields} pts`}
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full ${breakdown.requiredFields === 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, (breakdown.requiredFields / 20) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-500 leading-snug">
              Ensures all mandatory statutory inputs (Aadhaar, DOB, Taluk) are present.
            </p>
          </div>

          {/* Pillar 4: Rule Engine */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-purple-600" />
                Rule Checks
              </span>
              <span className={`font-extrabold px-2 py-0.5 rounded text-[10px] ${
                breakdown.configuredRules === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {breakdown.configuredRules === 0 ? 'PASS' : `+${breakdown.configuredRules} pts`}
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full ${breakdown.configuredRules === 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, (breakdown.configuredRules / 25) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-500 leading-snug">
              Statutory ceiling criteria: annual income limits, qualifying cutoffs, age limits.
            </p>
          </div>

        </div>
      </div>

      {/* Flagged Issues List Preview */}
      {issues.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-gray-900">
              {language === 'ta' ? 'கண்டறியப்பட்ட முரண்பாடுகள் மற்றும் திருத்தங்கள்' : 'Detected Discrepancies & Recommendations'}
            </h3>
            <span className="text-xs text-blue-700 font-bold cursor-pointer hover:underline" onClick={onOpenCorrectionCenter}>
              View in Correction Center →
            </span>
          </div>

          <div className="space-y-3">
            {issues.map((issue) => (
              <div 
                key={issue.id}
                className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  issue.severity === 'critical' ? 'bg-red-50/50 border-red-200' : 'bg-amber-50/50 border-amber-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.2 text-[10px] font-extrabold rounded uppercase ${
                      issue.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {issue.severity}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                      {language === 'ta' ? issue.whatTa : issue.whatEn}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600">
                    <strong>Why:</strong> {language === 'ta' ? issue.whyTa : issue.whyEn}
                  </p>
                  <p className="text-xs text-gray-700">
                    <strong>Action:</strong> {language === 'ta' ? issue.actionTa : issue.actionEn}
                  </p>
                </div>

                <button
                  onClick={onOpenCorrectionCenter}
                  className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold text-xs rounded-xl shadow-2xs transition-colors shrink-0 flex items-center justify-center gap-1"
                >
                  <span>Fix Issue</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
