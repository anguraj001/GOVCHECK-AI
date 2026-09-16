import { 
  User, 
  GovService, 
  Application, 
  AuditLog, 
  AppNotification, 
  AdminAnalytics,
  VerificationIssue,
  RiskAssessment,
  VerificationRun
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('govcheck_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async register(data: { name: string; email: string; mobile: string; password: string; preferredLanguage: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json() as Promise<{ user: User; token: string }>;
  },

  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json() as Promise<{ user: User; token: string }>;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json() as Promise<{ user: User }>;
  },

  // Services
  async getServices() {
    const res = await fetch(`${API_BASE}/services`);
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json() as Promise<{ services: GovService[] }>;
  },

  async getService(id: string) {
    const res = await fetch(`${API_BASE}/services/${id}`);
    if (!res.ok) throw new Error('Service not found');
    return res.json() as Promise<{ service: GovService }>;
  },

  async createService(serviceData: Partial<GovService>) {
    const res = await fetch(`${API_BASE}/admin/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(serviceData),
    });
    if (!res.ok) throw new Error('Failed to create service');
    return res.json() as Promise<{ service: GovService }>;
  },

  async updateService(id: string, updates: Partial<GovService>) {
    const res = await fetch(`${API_BASE}/admin/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update service');
    return res.json() as Promise<{ service: GovService }>;
  },

  // Applications
  async getApplications() {
    const res = await fetch(`${API_BASE}/applications`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json() as Promise<{ applications: Application[] }>;
  },

  async getApplication(id: string) {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Application not found');
    return res.json() as Promise<{ application: Application }>;
  },

  async createApplication(serviceId: string, dynamicFormData?: Record<string, any>) {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ serviceId, dynamicFormData }),
    });
    if (!res.ok) throw new Error('Failed to create application');
    return res.json() as Promise<{ application: Application }>;
  },

  async updateApplication(id: string, dynamicFormData?: Record<string, any>, status?: string) {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ dynamicFormData, status }),
    });
    if (!res.ok) throw new Error('Failed to update application');
    return res.json() as Promise<{ application: Application }>;
  },

  async deleteApplication(id: string) {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to delete application');
    return res.json() as Promise<{ success: boolean }>;
  },

  // Document Upload & Analysis
  async uploadDocument(applicationId: string, docData: {
    docTypeKey: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileDataUrl?: string;
  }) {
    const res = await fetch(`${API_BASE}/applications/${applicationId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(docData),
    });
    if (!res.ok) throw new Error('Failed to upload and analyze document');
    return res.json() as Promise<{ application: Application; document: any }>;
  },

  async deleteDocument(applicationId: string, docId: string) {
    const res = await fetch(`${API_BASE}/applications/${applicationId}/documents/${docId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to delete document');
    return res.json() as Promise<{ application: Application }>;
  },

  // Verification & Re-verification
  async verifyApplication(applicationId: string) {
    const res = await fetch(`${API_BASE}/applications/${applicationId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Verification failed');
    return res.json() as Promise<{
      application: Application;
      assessment: RiskAssessment;
      issues: VerificationIssue[];
      verificationRun: VerificationRun;
    }>;
  },

  async correctIssue(applicationId: string, correctionData: {
    issueId: string;
    actionType: 'FIELD_EDIT' | 'DOC_REPLACE' | 'DOC_UPLOAD' | 'USER_CONFIRM';
    updatedFieldKey?: string;
    updatedFieldValue?: any;
  }) {
    const res = await fetch(`${API_BASE}/applications/${applicationId}/correct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(correctionData),
    });
    if (!res.ok) throw new Error('Correction failed');
    return res.json() as Promise<{ application: Application }>;
  },

  // AI Assistant Chat
  async sendChatMessage(message: string, language: 'en' | 'ta', applicationId?: string) {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ message, language, applicationId }),
    });
    if (!res.ok) throw new Error('Assistant communication failed');
    return res.json() as Promise<{ text: string; suggestedActions?: string[] }>;
  },

  // Admin
  async getAdminAnalytics() {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json() as Promise<{ analytics: AdminAnalytics }>;
  },

  async getAdminAuditLogs() {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json() as Promise<{ logs: AuditLog[] }>;
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) return { notifications: [] };
    return res.json() as Promise<{ notifications: AppNotification[] }>;
  },

  async markNotificationRead(id: string) {
    await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
  },
};
