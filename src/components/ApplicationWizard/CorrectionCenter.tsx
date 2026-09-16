import React, { useState } from 'react';
import { 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  FileText, 
  Edit3, 
  UploadCloud, 
  Check, 
  X,
  Sparkles,
  TrendingDown,
  Info
} from 'lucide-react';
import { Application, GovService, Language, VerificationIssue } from '../../types';
import { translations } from '../../translations';
import { api } from '../../services/api';

interface CorrectionCenterProps {
  application: Application;
  service: GovService;
  language: Language;
  onApplicationUpdate: (app: Application) => void;
  onViewReadinessReport: () => void;
}

export const CorrectionCenter: React.FC<CorrectionCenterProps> = ({
  application,
  service,
  language,
  onApplicationUpdate,
  onViewReadinessReport,
}) => {
  const [activeEditingIssueId, setActiveEditingIssueId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<any>('');
  const [reverifying, setReverifying] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');
  const t = translations[language];

  const issues = application.currentIssues || [];

  const filteredIssues = issues.filter((issue) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'CRITICAL') return issue.severity === 'critical';
    if (activeTab === 'WARNING') return issue.severity === 'warning' || issue.severity === 'info';
    return true;
  });

  const handleStartFieldEdit = (issue: VerificationIssue) => {
    setActiveEditingIssueId(issue.id);
    if (issue.fieldKey) {
      setEditingValue(application.dynamicFormData[issue.fieldKey] ?? '');
    } else {
      setEditingValue('');
    }
  };

  const handleSaveFieldCorrection = async (issue: VerificationIssue) => {
    try {
      const { application: updatedApp } = await api.correctIssue(application.id, {
        issueId: issue.id,
        actionType: 'FIELD_EDIT',
        updatedFieldKey: issue.fieldKey,
        updatedFieldValue: editingValue,
      });

      setActiveEditingIssueId(null);
      onApplicationUpdate(updatedApp);
      setSuccessNotice(`Field updated successfully. Re-run verification to recalculate your risk score.`);
    } catch (err: any) {
      alert('Failed to save correction: ' + err.message);
    }
  };

  const handleConfirmUserValue = async (issue: VerificationIssue) => {
    try {
      const { application: updatedApp } = await api.correctIssue(application.id, {
        issueId: issue.id,
        actionType: 'USER_CONFIRM',
      });
      onApplicationUpdate(updatedApp);
      setSuccessNotice('Warning acknowledged.');
    } catch (err: any) {
      alert('Failed to confirm value: ' + err.message);
    }
  };

  const handleReverifyNow = async () => {
    setReverifying(true);
    setSuccessNotice('');
    try {
      const result = await api.verifyApplication(application.id);
      onApplicationUpdate(result.application);
      setSuccessNotice(
        `Re-Verification Complete! Risk score updated to ${result.assessment.score}/100 (${result.assessment.level}).`
      );
    } catch (err: any) {
      alert('Re-verification failed: ' + err.message);
    } finally {
      setReverifying(false);
    }
  };

  const currentScore = application.currentAssessment?.score || 0;
  const currentLevel = application.currentAssessment?.level || 'LOW';

  // Improvement Delta calculation from first run if available
  const firstRun = application.verificationRuns[application.verificationRuns.length - 1];
  const initialScore = firstRun ? firstRun.riskAssessment.score : currentScore;
  const scoreDelta = initialScore - currentScore;

  return (
    <div className="space-y-6">
      
      {/* Correction Center Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/40">
                Interactive Resolution Hub
              </span>
              <span className="text-xs text-gray-300">
                Run #{application.verificationRuns.length || 1}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              {language === 'ta' ? 'விண்ணப்ப திருத்தும் மையம்' : 'Correction & Resolution Center'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              {language === 'ta'
                ? 'கண்டறியப்பட்ட முரண்பாடுகளை உடனடியாக திருத்தி, உங்கள் விண்ணப்பத்தின் அபாய நிலையை குறைக்கவும்.'
                : 'Resolve flagged cross-document mismatches, upload missing attachments, and re-verify for a lower rejection risk.'}
            </p>
          </div>

          {/* Right Action: Re-run Verification */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              id="btn-reverify-now"
              type="button"
              disabled={reverifying}
              onClick={handleReverifyNow}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${reverifying ? 'animate-spin' : ''}`} />
              <span>{reverifying ? 'Re-Verifying Rules...' : 'Re-Run Verification'}</span>
            </button>

            {currentLevel === 'LOW' && (
              <button
                id="btn-correction-ready-report"
                type="button"
                onClick={onViewReadinessReport}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Go to Final Report</span>
              </button>
            )}
          </div>
        </div>

        {/* Delta Improvement Pill */}
        {scoreDelta > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700/60 flex items-center gap-2 text-xs text-emerald-300 font-semibold">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <span>
              Risk reduced by {scoreDelta} points! (From {initialScore} down to {currentScore}/100)
            </span>
          </div>
        )}
      </div>

      {/* Success Notification Alert */}
      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice('')} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Severity Filter Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'ALL' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Items ({issues.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CRITICAL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Critical ({issues.filter((i) => i.severity === 'critical').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('WARNING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'WARNING' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Warnings ({issues.filter((i) => i.severity === 'warning' || i.severity === 'info').length})
          </button>
        </div>

        <span className="text-xs text-gray-400 font-medium hidden sm:inline">
          Click "Fix Field Now" to resolve in-place
        </span>
      </div>

      {/* Issues List */}
      {filteredIssues.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h4 className="font-extrabold text-base text-gray-900">
            {language === 'ta' ? 'அனைத்து சிக்கல்களும் தீர்க்கப்பட்டன!' : 'No Outstanding Issues Flagged!'}
          </h4>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {language === 'ta'
              ? 'உங்கள் விண்ணப்பம் அனைத்து அடிப்படை தகுதி விதிகள் மற்றும் ஆவணத் தேவைகளையும் பூர்த்தி செய்கிறது.'
              : 'All mandatory documents and statutory rule requirements comply with the pre-submission configuration.'}
          </p>
          <button
            onClick={onViewReadinessReport}
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
          >
            <span>{language === 'ta' ? 'இறுதி அறிக்கையை காண்க' : 'Proceed to Final Readiness Report'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIssues.map((issue) => {
            const isEditing = activeEditingIssueId === issue.id;
            const isResolved = issue.status === 'RESOLVED' || issue.status === 'CONFIRMED_BY_USER';

            return (
              <div
                key={issue.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isResolved
                    ? 'bg-gray-50/60 border-gray-200 opacity-60'
                    : issue.severity === 'critical'
                    ? 'bg-white border-red-200 shadow-xs'
                    : 'bg-white border-amber-200 shadow-xs'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Issue Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        issue.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {issue.severity}
                      </span>
                      <h4 className="font-extrabold text-sm text-gray-900">
                        {language === 'ta' ? issue.whatTa : issue.whatEn}
                      </h4>
                    </div>

                    <span className="text-[11px] text-gray-400 font-mono">
                      Source: {issue.source}
                    </span>
                  </div>

                  {/* Structured WHAT, WHY, ACTION Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
                    <div>
                      <span className="font-bold text-gray-700 block mb-0.5">
                        💡 {language === 'ta' ? 'ஏன் முக்கியம்?' : 'Why It Matters:'}
                      </span>
                      <p className="text-gray-600 leading-relaxed">
                        {language === 'ta' ? issue.whyTa : issue.whyEn}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-gray-700 block mb-0.5">
                        🛠️ {language === 'ta' ? 'பரிந்துரைக்கப்பட்ட நடவடிக்கை:' : 'Recommended Action:'}
                      </span>
                      <p className="text-gray-600 leading-relaxed">
                        {language === 'ta' ? issue.actionTa : issue.actionEn}
                      </p>
                    </div>
                  </div>

                  {/* In-Place Interactive Edit Mode */}
                  {isEditing ? (
                    <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-3 animate-in fade-in duration-150">
                      <label className="block text-xs font-bold text-blue-900">
                        Update Form Field ({issue.fieldKey}):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          placeholder="Enter corrected value..."
                          className="flex-1 text-xs border border-blue-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-600 outline-hidden font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveFieldCorrection(issue)}
                          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveEditingIssueId(null)}
                          className="p-2 text-gray-500 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Action Toolbar */
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[11px] text-gray-500">
                        {issue.status === 'RESOLVED' && <span className="text-emerald-600 font-bold">✓ Resolved</span>}
                        {issue.status === 'CONFIRMED_BY_USER' && <span className="text-blue-600 font-bold">✓ Acknowledged</span>}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {issue.fieldKey && (
                          <button
                            type="button"
                            onClick={() => handleStartFieldEdit(issue)}
                            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 shadow-2xs transition-colors flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Fix Field Now</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleConfirmUserValue(issue)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-xl transition-colors"
                        >
                          Acknowledge & Keep
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
