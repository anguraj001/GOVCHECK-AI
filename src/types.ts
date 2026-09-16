export type UserRole = 'citizen' | 'admin';
export type Language = 'en' | 'ta';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  preferredLanguage: Language;
  createdAt: string;
}

export type FieldType = 'text' | 'number' | 'date' | 'dropdown' | 'radio' | 'checkbox' | 'address';

export interface ServiceField {
  id: string;
  serviceId: string;
  fieldKey: string;
  labelEn: string;
  labelTa: string;
  fieldType: FieldType;
  isRequired: boolean;
  options?: string[];
  validationRegex?: string;
  helpTextEn?: string;
  helpTextTa?: string;
  placeholderEn?: string;
  placeholderTa?: string;
  categoryGroup?: string;
  sortOrder: number;
}

export interface ServiceDocumentConfig {
  id: string;
  serviceId: string;
  docTypeKey: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  isRequired: boolean;
  allowedFormats: string[];
  maxSizeBytes?: number;
  maxSizeMb?: number;
  guidanceNotesEn?: string;
  guidanceNotesTa?: string;
}

export type RuleOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'greater_than' 
  | 'less_than' 
  | 'gte' 
  | 'lte' 
  | 'contains' 
  | 'exists' 
  | 'date_before' 
  | 'date_after' 
  | 'age_gte' 
  | 'age_lte' 
  | 'max_income'
  | 'aadhaar_valid'
  | 'regex_match';

export type IssueSeverity = 'critical' | 'warning' | 'info';

export interface ServiceRule {
  id: string;
  serviceId: string;
  ruleCode: string;
  nameEn: string;
  nameTa: string;
  fieldKey: string;
  operator: RuleOperator;
  targetValue: any;
  severity: IssueSeverity;
  explanationEn: string;
  explanationTa: string;
  actionEn: string;
  actionTa: string;
  isActive: boolean;
}

export interface GovService {
  id: string;
  code: string;
  nameEn: string;
  nameTa: string;
  descriptionEn: string;
  descriptionTa: string;
  category: 'Certificates' | 'Revenue' | 'Education' | 'Social Welfare' | 'Identity';
  requiredDocCount: number;
  basicEligibilitySummaryEn: string;
  basicEligibilitySummaryTa: string;
  whoMayApplyEn: string;
  whoMayApplyTa: string;
  requiredInfoEn: string;
  requiredInfoTa: string;
  generalNotesEn: string;
  generalNotesTa: string;
  disclaimerEn: string;
  disclaimerTa: string;
  version: string;
  active: boolean;
  lastUpdated: string;
  fields: ServiceField[];
  documents: ServiceDocumentConfig[];
  rules: ServiceRule[];
}

export type ApplicationStatus = 
  | 'DRAFT' 
  | 'IN_PROGRESS' 
  | 'ANALYZING' 
  | 'CORRECTION_REQUIRED' 
  | 'READY_FOR_REVIEW' 
  | 'VERIFIED' 
  | 'ARCHIVED' 
  | 'ERROR';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type CheckStatus = 'PASS' | 'WARNING' | 'FAIL';

export interface UploadedDocument {
  id: string;
  applicationId: string;
  docTypeKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileDataUrl?: string; // base64 representation
  status: 'UPLOADED' | 'PROCESSING' | 'ANALYZED' | 'FAILED';
  uploadedAt: string;
  extractions?: DocumentExtraction;
}

export interface DocumentExtraction {
  id?: string;
  documentId?: string;
  documentType: string;
  confidence: number;
  readability: 'good' | 'fair' | 'poor';
  extractedFields: Record<string, string | number | null>;
  warnings: string[];
  recommendations?: string[];
  rawText?: string;
  qualityIssues?: string[];
}

export type IssueType = 
  | 'MISSING_DOC' 
  | 'NAME_MISMATCH' 
  | 'DOB_MISMATCH' 
  | 'ADDRESS_MISMATCH' 
  | 'QUALITY_ISSUE' 
  | 'RULE_VIOLATION' 
  | 'INCOMPLETE_FIELD' 
  | 'OTHER';

export interface VerificationIssue {
  id: string;
  issueType: IssueType;
  severity: IssueSeverity;
  whatEn: string;
  whatTa: string;
  whyEn: string;
  whyTa: string;
  actionEn: string;
  actionTa: string;
  source: string;
  fieldKey?: string;
  docTypeKey?: string;
  status: 'OPEN' | 'RESOLVED' | 'CONFIRMED_BY_USER';
  resolvedAt?: string;
}

export interface RiskAssessment {
  score: number; // 0 - 100
  level: RiskLevel;
  breakdown: {
    documentCompleteness: number; // max 30
    informationConsistency: number; // max 25
    requiredFields: number; // max 20
    configuredRules: number; // max 25
  };
  completenessStatus: CheckStatus;
  consistencyStatus: CheckStatus;
  ruleCheckStatus: CheckStatus;
  qualityStatus: CheckStatus;
  summaryEn: string;
  summaryTa: string;
  recommendedActions: string[];
}

export interface VerificationRun {
  id: string;
  applicationId: string;
  runNumber: number;
  triggerType: 'INITIAL' | 'RE_VERIFICATION';
  runAt: string;
  riskAssessment: RiskAssessment;
  issues: VerificationIssue[];
}

export interface Application {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenEmail: string;
  serviceId: string;
  serviceCode: string;
  serviceNameEn: string;
  serviceNameTa: string;
  serviceVersion: string;
  applicationNumber: string;
  status: ApplicationStatus;
  dynamicFormData: Record<string, any>;
  uploadedDocuments: UploadedDocument[];
  verificationRuns: VerificationRun[];
  currentAssessment?: RiskAssessment;
  currentIssues: VerificationIssue[];
  createdAt: string;
  updatedAt: string;
  lastVerifiedAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  titleEn: string;
  titleTa: string;
  messageEn: string;
  messageTa: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  isRead: boolean;
  createdAt: string;
  linkTo?: string;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalApplications: number;
  completedVerifications: number;
  correctionsRequired: number;
  readyForReview: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  applicationsByService: {
    serviceName: string;
    count: number;
  }[];
  issueCategories: {
    category: string;
    count: number;
  }[];
  verificationTrends: {
    date: string;
    verifications: number;
    issuesFound: number;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  contextInfo?: {
    applicationId?: string;
    serviceName?: string;
    riskLevel?: RiskLevel;
  };
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
}
