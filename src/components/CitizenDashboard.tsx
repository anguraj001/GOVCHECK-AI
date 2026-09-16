import React, { useState } from 'react';
import { 
  PlusCircle, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Download, 
  Trash2, 
  Sparkles, 
  Eye, 
  RefreshCw,
  Search,
  Filter,
  FileText
} from 'lucide-react';
import { User, Application, Language, GovService } from '../types';
import { translations } from '../translations';
import { generateApplicationPDF } from '../lib/pdfGenerator';

interface CitizenDashboardProps {
  user: User;
  applications: Application[];
  services: GovService[];
  language: Language;
  onStartNewVerification: () => void;
  onOpenApplication: (app: Application) => void;
  onDeleteApplication: (appId: string) => void;
  onOpenAssistant: () => void;
  onLoadScenario: (scenarioId: string) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  user,
  applications,
  services,
  language,
  onStartNewVerification,
  onOpenApplication,
  onDeleteApplication,
  onOpenAssistant,
  onLoadScenario,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const t = translations[language];

  // Calculated Stats
  const activeCount = applications.filter(a => a.status === 'IN_PROGRESS' || a.status === 'DRAFT').length;
  const verifiedCount = applications.filter(a => a.status === 'READY_FOR_REVIEW' || a.status === 'VERIFIED').length;
  const correctionCount = applications.filter(a => a.status === 'CORRECTION_REQUIRED').length;
  const readyCount = applications.filter(a => a.currentAssessment?.level === 'LOW').length;

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.serviceNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.serviceNameTa.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'CORRECTION') return matchesSearch && app.status === 'CORRECTION_REQUIRED';
    if (statusFilter === 'READY') return matchesSearch && (app.status === 'READY_FOR_REVIEW' || app.status === 'VERIFIED');
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY_FOR_REVIEW':
      case 'VERIFIED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3" /> Ready for Review</span>;
      case 'CORRECTION_REQUIRED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800"><AlertTriangle className="w-3 h-3" /> Correction Needed</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800"><Clock className="w-3 h-3" /> In Progress</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getRiskBadge = (level?: string, score?: number) => {
    if (!level) return <span className="text-xs text-gray-400">Not Verified</span>;
    if (level === 'LOW') {
      return <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">LOW ({score ?? 4}/100)</span>;
    }
    if (level === 'MEDIUM') {
      return <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">MEDIUM ({score ?? 35}/100)</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">HIGH ({score ?? 72}/100)</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/60 border border-blue-400/30 text-xs font-semibold">
            <span>Citizen Pre-Submission Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.dashboard.welcome}, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            {language === 'ta' 
              ? 'அரசு சேவை விண்ணப்பங்களை சமர்ப்பிக்கும் முன் ஆவணப் பிழைகள் மற்றும் முரண்பாடுகளை கண்டறிந்து சரிபாருங்கள்.'
              : 'Detect missing documents, inconsistencies, and rule eligibility violations before submitting to official government portals.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-dashboard-start-new"
            onClick={onStartNewVerification}
            className="px-4 py-2.5 bg-white text-blue-800 font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.dashboard.startNew}</span>
          </button>
          <button
            id="btn-dashboard-ai-assistant"
            onClick={onOpenAssistant}
            className="px-4 py-2.5 bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl border border-blue-400/40 shadow-xs transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t.nav.aiAssistant}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t.dashboard.activeApplications}</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{activeCount}</div>
          <span className="text-[11px] text-gray-400 mt-1 block">In draft or document gathering</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t.dashboard.completedVerifications}</span>
            <FileCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{verifiedCount}</div>
          <span className="text-[11px] text-gray-400 mt-1 block">Pre-submission analyses done</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t.dashboard.correctionsRequired}</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{correctionCount}</div>
          <span className="text-[11px] text-gray-400 mt-1 block">Mismatches / missing files to fix</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t.dashboard.readyForReview}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{readyCount}</div>
          <span className="text-[11px] text-gray-400 mt-1 block">Ready for official portal submission</span>
        </div>

      </div>

      {/* Demo Scenario Quick-Launcher Bar */}
      <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            {t.dashboard.demoScenarios}
          </span>
          <span className="text-[11px] text-gray-500">
            Click any test scenario to inspect verification findings & Correction Center
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            id="btn-dash-scenario-clean"
            type="button"
            onClick={() => onLoadScenario('app-demo-clean')}
            className="p-3 bg-white hover:bg-emerald-50 text-left border border-gray-200 hover:border-emerald-400 rounded-xl transition-all shadow-2xs group"
          >
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 inline-block mb-1">
              LOW RISK • 4/100
            </span>
            <p className="text-xs font-bold text-gray-800 group-hover:text-emerald-700">
              {t.dashboard.scenario1}
            </p>
          </button>

          <button
            id="btn-dash-scenario-missing"
            type="button"
            onClick={() => onLoadScenario('app-demo-missing-doc')}
            className="p-3 bg-white hover:bg-amber-50 text-left border border-gray-200 hover:border-amber-400 rounded-xl transition-all shadow-2xs group"
          >
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 inline-block mb-1">
              MEDIUM RISK • 35/100
            </span>
            <p className="text-xs font-bold text-gray-800 group-hover:text-amber-700">
              {t.dashboard.scenario2}
            </p>
          </button>

          <button
            id="btn-dash-scenario-name"
            type="button"
            onClick={() => onLoadScenario('app-demo-name-mismatch')}
            className="p-3 bg-white hover:bg-amber-50 text-left border border-gray-200 hover:border-amber-400 rounded-xl transition-all shadow-2xs group"
          >
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 inline-block mb-1">
              MEDIUM RISK • 38/100
            </span>
            <p className="text-xs font-bold text-gray-800 group-hover:text-amber-700">
              {t.dashboard.scenario3}
            </p>
          </button>

          <button
            id="btn-dash-scenario-multi"
            type="button"
            onClick={() => onLoadScenario('app-demo-multi-issue')}
            className="p-3 bg-white hover:bg-red-50 text-left border border-gray-200 hover:border-red-400 rounded-xl transition-all shadow-2xs group"
          >
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-red-100 text-red-800 inline-block mb-1">
              HIGH RISK • 72/100
            </span>
            <p className="text-xs font-bold text-gray-800 group-hover:text-red-700">
              {t.dashboard.scenario4}
            </p>
          </button>
        </div>
      </div>

      {/* Recent Applications Section */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">
              {t.dashboard.recentApplications}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {applications.length} applications tracked in your workspace
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                id="input-dashboard-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applications..."
                className="pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-hidden w-48 sm:w-60"
              />
            </div>

            {/* Filter */}
            <select
              id="select-dashboard-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 font-medium text-gray-700 outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="CORRECTION">Correction Needed</option>
              <option value="READY">Ready for Review</option>
            </select>
          </div>
        </div>

        {/* Applications List / Table */}
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <FileText className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-medium text-gray-700">{t.dashboard.noApplications}</p>
            <button
              onClick={onStartNewVerification}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              {t.dashboard.startNew}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">{t.dashboard.tableHeaders.appId}</th>
                  <th className="px-5 py-3.5">{t.dashboard.tableHeaders.service}</th>
                  <th className="px-5 py-3.5">{t.dashboard.tableHeaders.status}</th>
                  <th className="px-5 py-3.5">{t.dashboard.tableHeaders.risk}</th>
                  <th className="px-5 py-3.5">{t.dashboard.tableHeaders.lastUpdated}</th>
                  <th className="px-5 py-3.5 text-right">{t.dashboard.tableHeaders.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/70 transition-colors">
                    
                    <td className="px-5 py-4 font-mono font-bold text-blue-700">
                      {app.applicationNumber}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900">
                        {language === 'ta' ? app.serviceNameTa : app.serviceNameEn}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {app.serviceCode} • {app.serviceVersion}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {getStatusBadge(app.status)}
                    </td>

                    <td className="px-5 py-4">
                      {getRiskBadge(app.currentAssessment?.level, app.currentAssessment?.score)}
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {new Date(app.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        <button
                          id={`btn-open-app-${app.id}`}
                          onClick={() => onOpenApplication(app)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors flex items-center gap-1"
                          title="Open Verification Wizard / Correction Center"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Open</span>
                        </button>

                        <button
                          id={`btn-pdf-app-${app.id}`}
                          onClick={() => generateApplicationPDF(app)}
                          className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Download Pre-Submission PDF Report"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          id={`btn-delete-app-${app.id}`}
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this application record?')) {
                              onDeleteApplication(app.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
