import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Layers, 
  Activity, 
  FileText, 
  Sliders, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Lock,
  RefreshCw,
  BarChart3,
  ListOrdered,
  Eye
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { GovService, Language, AdminAnalytics, AuditLog, ServiceRule } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';

interface AdminDashboardProps {
  services: GovService[];
  language: Language;
  onRefreshServices: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  services,
  language,
  onRefreshServices,
}) => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'SERVICES' | 'LOGS'>('ANALYTICS');
  const [loading, setLoading] = useState(false);
  const [editingService, setEditingService] = useState<GovService | null>(null);
  const [isNewServiceModal, setIsNewServiceModal] = useState(false);
  const t = translations[language];

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [anRes, logsRes] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAdminAuditLogs(),
      ]);
      setAnalytics(anRes.analytics);
      setAuditLogs(logsRes.logs);
    } catch (err: any) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const riskPieData = analytics ? [
    { name: 'Low Risk', value: analytics.riskDistribution.low },
    { name: 'Medium Risk', value: analytics.riskDistribution.medium },
    { name: 'High Risk', value: analytics.riskDistribution.high },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/40">
              Admin & Governance Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.admin.title}
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/80 max-w-xl">
            {t.admin.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAdminData}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'ANALYTICS' ? 'bg-purple-700 text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Risk Charts</span>
        </button>

        <button
          onClick={() => setActiveTab('SERVICES')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'SERVICES' ? 'bg-purple-700 text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Service Rule Configurator ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'LOGS' ? 'bg-purple-700 text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Analytics */}
      {activeTab === 'ANALYTICS' && analytics && (
        <div className="space-y-8">
          
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Users</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">{analytics.totalUsers}</span>
              <span className="text-[11px] text-gray-400 mt-1 block">Registered citizens & staff</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Applications</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-700">{analytics.totalApplications}</span>
              <span className="text-[11px] text-gray-400 mt-1 block">Processed through engine</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Corrections Performed</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">{analytics.correctionsPerformed}</span>
              <span className="text-[11px] text-gray-400 mt-1 block">Pre-submission fixes</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Ready for Review Rate</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {analytics.totalApplications > 0 ? Math.round((analytics.riskDistribution.low / analytics.totalApplications) * 100) : 100}%
              </span>
              <span className="text-[11px] text-gray-400 mt-1 block">Low rejection risk</span>
            </div>
          </div>

          {/* Visual Recharts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Applications by Service */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <h3 className="font-extrabold text-sm text-gray-900 mb-4">
                Applications by Government Service
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.applicationsByService}>
                    <XAxis dataKey="serviceCode" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Rejection Risk Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 mb-4">
                  Rejection Risk Distribution
                </h3>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {riskPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex items-center justify-around text-xs font-bold pt-4 border-t border-gray-100">
                <span className="text-emerald-600">Low Risk: {analytics.riskDistribution.low}</span>
                <span className="text-amber-600">Medium: {analytics.riskDistribution.medium}</span>
                <span className="text-red-600">High: {analytics.riskDistribution.high}</span>
              </div>
            </div>

          </div>

          {/* Top Flagged Issues Table */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
            <h3 className="font-extrabold text-sm text-gray-900 mb-4">
              Most Frequent Pre-Submission Issues Detected
            </h3>
            <div className="space-y-3">
              {analytics.topIssues.map((iss, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                  <span className="font-bold text-gray-800">{iss.issue}</span>
                  <span className="px-3 py-1 rounded-full font-extrabold bg-blue-100 text-blue-800">
                    {iss.count} occurrences
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Service Configurator */}
      {activeTab === 'SERVICES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-gray-900">
              Government Service Rule & Checklist Registry
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((svc) => (
              <div key={svc.id} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold px-2.5 py-0.5 rounded bg-purple-100 text-purple-800 text-xs">
                      {svc.code}
                    </span>
                    <span className="text-xs text-gray-400">v{svc.version}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-gray-900">{svc.nameEn}</h4>
                  <p className="text-xs text-gray-500 mt-1">{svc.nameTa}</p>
                </div>

                {/* Rules List */}
                <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
                  <span className="font-bold text-gray-700 block">Configured Rules ({svc.rules.length}):</span>
                  {svc.rules.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-xl text-[11px]">
                      <span className="font-medium text-gray-800">{r.nameEn}</span>
                      <span className="text-gray-500 font-mono font-bold">{r.operator} {r.targetValue ?? ''}</span>
                    </div>
                  ))}
                </div>

                {/* Documents List */}
                <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
                  <span className="font-bold text-gray-700 block">Required Proofs ({svc.documents.length}):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {svc.documents.map((d) => (
                      <span key={d.id} className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded-md text-[10px] font-semibold">
                        {d.titleEn}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === 'LOGS' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h3 className="font-extrabold text-base text-gray-900">
              System Activity & Verification Audit Trail
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Chronological log of all user registrations, document analyses, and rule evaluations
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Entity</th>
                  <th className="px-5 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-3.5 font-mono text-gray-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        log.userRole === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {log.userRole}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {log.entityType} ({log.entityId.slice(0, 12)})
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-[11px] font-mono">
                      {log.metadata ? JSON.stringify(log.metadata) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
