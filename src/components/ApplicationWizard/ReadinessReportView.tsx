import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  FileText, 
  ExternalLink, 
  AlertTriangle, 
  ArrowLeft, 
  Sparkles,
  Sliders,
  CheckCircle
} from 'lucide-react';
import { Application, GovService, Language } from '../../types';
import { translations } from '../../translations';
import { generateApplicationPDF } from '../../lib/pdfGenerator';

interface ReadinessReportViewProps {
  application: Application;
  service: GovService;
  language: Language;
  onBackToCorrection: () => void;
  onBackToDashboard: () => void;
}

export const ReadinessReportView: React.FC<ReadinessReportViewProps> = ({
  application,
  service,
  language,
  onBackToCorrection,
  onBackToDashboard,
}) => {
  const t = translations[language];
  const assessment = application.currentAssessment;
  const riskLevel = assessment?.level || 'LOW';
  const riskScore = assessment?.score || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Official Certificate Card */}
      <div className="bg-white rounded-3xl border-2 border-blue-100 shadow-xl overflow-hidden p-6 sm:p-10 relative">
        
        {/* Certificate Header Banner */}
        <div className="border-b border-gray-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-gray-900">
                GOVCHECK<span className="text-blue-700">.AI</span>
              </span>
              <p className="text-xs text-gray-500 font-medium">
                Official Pre-Submission Verification & Risk Assessment Summary
              </p>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-gray-200 sm:pl-6">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Report Reference</span>
            <span className="font-mono font-extrabold text-blue-700 text-sm">{application.applicationNumber}</span>
            <span className="text-[11px] text-gray-500 block">{new Date().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Readiness Verdict Box */}
        <div className="my-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-800 block">
                Verification Status
              </span>
              <h3 className="font-extrabold text-lg text-emerald-950">
                {language === 'ta' ? 'விண்ணப்பம் முன்-சரிபார்ப்பில் தேர்ச்சி பெற்றது' : 'Pre-Submission Verification Successful'}
              </h3>
              <p className="text-xs text-emerald-800/80 mt-0.5">
                Potential Rejection Risk: <strong>{riskLevel} ({riskScore}/100)</strong>
              </p>
            </div>
          </div>

          <button
            id="btn-download-pdf-report"
            type="button"
            onClick={() => generateApplicationPDF(application, service)}
            className="px-5 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Verification Report</span>
          </button>
        </div>

        {/* Application Details Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-gray-50 p-5 rounded-2xl border border-gray-200">
          <div>
            <span className="text-gray-400 font-bold block mb-0.5">Applicant Legal Name</span>
            <span className="font-bold text-gray-900 text-sm">{application.citizenName}</span>
          </div>
          <div>
            <span className="text-gray-400 font-bold block mb-0.5">Service Requested</span>
            <span className="font-bold text-gray-900 text-sm">
              {language === 'ta' ? service.nameTa : service.nameEn} ({service.code})
            </span>
          </div>
          <div>
            <span className="text-gray-400 font-bold block mb-0.5">Configuration Version</span>
            <span className="font-medium text-gray-700">v{service.version}</span>
          </div>
          <div>
            <span className="text-gray-400 font-bold block mb-0.5">Uploaded Documents Verified</span>
            <span className="font-medium text-gray-700">{application.uploadedDocuments.length} files attached</span>
          </div>
        </div>

        {/* Verified Parameters Checklist */}
        <div className="mt-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
            Verified Statutory Compliance Parameters
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All mandatory documents uploaded and classified</span>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Applicant name consistent across proofs</span>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Permanent address matches residency proof</span>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Service income and rule thresholds satisfied</span>
            </div>
          </div>
        </div>

        {/* Next Steps: How to Submit on Official Portal */}
        <div className="mt-8 p-5 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs text-blue-950 space-y-2">
          <h4 className="font-bold text-sm text-blue-900 flex items-center gap-1.5">
            <ExternalLink className="w-4 h-4 text-blue-700" />
            <span>Next Steps: Official Government Portal Submission</span>
          </h4>
          <p className="text-blue-900/80 leading-relaxed">
            1. Keep the verified documents and your downloaded <strong>GOVCHECK Report</strong> ready for reference.<br />
            2. Visit the official government e-portal (e.g., TN e-Sevai or National Citizen Services).<br />
            3. Fill in the identical particulars and upload the verified clean document copies to minimize administrative rejection.
          </p>
        </div>

        {/* Mandatory Civic Disclaimer */}
        <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Mandatory Independent Civic-Tech Disclaimer:</strong> GOVCHECK AI is an independent pre-submission verification and rejection-risk analysis system. It is NOT an official government approval, rejection, certificate, or statutory decision. Final verification and certificate issuance remain under the sole jurisdiction of authorized revenue officers.
          </p>
        </div>

      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToCorrection}
          className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
        >
          <Sliders className="w-4 h-4 text-gray-500" />
          <span>Back to Correction Center</span>
        </button>

        <button
          type="button"
          onClick={onBackToDashboard}
          className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          Return to My Applications Dashboard
        </button>
      </div>

    </div>
  );
};
