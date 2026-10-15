import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  normalizeText, 
  calculateSimilarity, 
  evaluateRule, 
  runFullVerification 
} from '../server/ruleEngine';
import { GovService, Application, ServiceRule } from '../src/types';

describe('GOVCHECK AI - Rule Engine & Text Similarity Unit Tests', () => {
  describe('normalizeText()', () => {
    it('should return empty string for null, undefined, or empty values', () => {
      assert.equal(normalizeText(null), '');
      assert.equal(normalizeText(undefined), '');
      assert.equal(normalizeText(''), '');
      assert.equal(normalizeText('   '), '');
    });

    it('should trim and lowercase standard text', () => {
      assert.equal(normalizeText('  Tamil Nadu Government  '), 'tamil nadu government');
    });

    it('should strip punctuation and collapse whitespace', () => {
      assert.equal(
        normalizeText('P., Abishek - Vasanth (Gov. ID: #1234)'),
        'p abishek vasanth gov id 1234'
      );
    });
  });

  describe('calculateSimilarity()', () => {
    it('should return 1.0 for exact matches (case and punctuation insensitive)', () => {
      assert.equal(calculateSimilarity('Abishek Vasanth', 'abishek vasanth'), 1.0);
      assert.equal(calculateSimilarity('P. Abishek Vasanth', 'P Abishek Vasanth.'), 1.0);
    });

    it('should return 0.0 when either input is empty or null', () => {
      assert.equal(calculateSimilarity('', 'Abishek'), 0.0);
      assert.equal(calculateSimilarity('Abishek', ''), 0.0);
    });

    it('should score high similarity for name token inversions (e.g., initial at start vs end)', () => {
      const score = calculateSimilarity('Abishek Vasanth P', 'P Abishek Vasanth');
      // Token overlap should recognize identical words regardless of ordering
      assert.ok(score >= 0.85, `Expected score >= 0.85, got ${score}`);
    });

    it('should tolerate minor single-character spelling variations via Levenshtein distance', () => {
      const score = calculateSimilarity('Abhishek', 'Abishek');
      assert.ok(score >= 0.80, `Expected score >= 0.80, got ${score}`);
    });

    it('should return low similarity for completely distinct names', () => {
      const score = calculateSimilarity('Abishek Vasanth', 'Kavitha Ramasamy');
      assert.ok(score < 0.40, `Expected score < 0.40, got ${score}`);
    });
  });

  describe('evaluateRule()', () => {
    it('should evaluate "exists" operator correctly', () => {
      const rule: ServiceRule = {
        id: 'r1',
        serviceId: 's1',
        ruleCode: 'R_EXISTS',
        nameEn: 'Exists Check',
        nameTa: 'இருப்பு சோதனை',
        fieldKey: 'testField',
        operator: 'exists',
        targetValue: null,
        severity: 'critical',
        explanationEn: '',
        explanationTa: '',
        actionEn: '',
        actionTa: '',
        isActive: true,
      };

      assert.equal(evaluateRule(rule, { testField: 'Hello' }).pass, true);
      assert.equal(evaluateRule(rule, { testField: 0 }).pass, true);
      assert.equal(evaluateRule(rule, { testField: '' }).pass, false);
      assert.equal(evaluateRule(rule, { testField: null }).pass, false);
      assert.equal(evaluateRule(rule, {}).pass, false);
    });

    it('should evaluate "numeric comparison" operators (lte, gte, greater_than, less_than)', () => {
      const makeRule = (operator: any, target: any): ServiceRule => ({
        id: 'r-num',
        serviceId: 's1',
        ruleCode: 'R_NUM',
        nameEn: 'Num Check',
        nameTa: 'எண் சோதனை',
        fieldKey: 'income',
        operator,
        targetValue: target,
        severity: 'critical',
        explanationEn: '',
        explanationTa: '',
        actionEn: '',
        actionTa: '',
        isActive: true,
      });

      assert.equal(evaluateRule(makeRule('lte', 300000), { income: 250000 }).pass, true);
      assert.equal(evaluateRule(makeRule('lte', 300000), { income: 300000 }).pass, true);
      assert.equal(evaluateRule(makeRule('lte', 300000), { income: 350000 }).pass, false);

      assert.equal(evaluateRule(makeRule('greater_than', 18), { income: 21 }).pass, true);
      assert.equal(evaluateRule(makeRule('greater_than', 18), { income: 18 }).pass, false);
    });

    it('should validate 12-digit Aadhaar numbers and strip whitespace', () => {
      const aadhaarRule: ServiceRule = {
        id: 'r-aadh',
        serviceId: 's1',
        ruleCode: 'R_AADHAAR',
        nameEn: 'Aadhaar Validation',
        nameTa: 'ஆதார் சரிபார்ப்பு',
        fieldKey: 'aadhaarNumber',
        operator: 'aadhaar_valid',
        targetValue: null,
        severity: 'critical',
        explanationEn: '',
        explanationTa: '',
        actionEn: '',
        actionTa: '',
        isActive: true,
      };

      assert.equal(evaluateRule(aadhaarRule, { aadhaarNumber: '123456789012' }).pass, true);
      assert.equal(evaluateRule(aadhaarRule, { aadhaarNumber: '1234 5678 9012' }).pass, true);
      assert.equal(evaluateRule(aadhaarRule, { aadhaarNumber: '12345678901' }).pass, false); // 11 digits
      assert.equal(evaluateRule(aadhaarRule, { aadhaarNumber: '1234567890123' }).pass, false); // 13 digits
      assert.equal(evaluateRule(aadhaarRule, { aadhaarNumber: '1234ABCD9012' }).pass, false); // letters
    });

    it('should evaluate "contains" and "regex_match" operators', () => {
      const containsRule: ServiceRule = {
        id: 'r-cnt',
        serviceId: 's1',
        ruleCode: 'R_CNT',
        nameEn: 'Contains Check',
        nameTa: 'உள்ளடக்கிய சோதனை',
        fieldKey: 'email',
        operator: 'contains',
        targetValue: '@gov.in',
        severity: 'warning',
        explanationEn: '',
        explanationTa: '',
        actionEn: '',
        actionTa: '',
        isActive: true,
      };
      assert.equal(evaluateRule(containsRule, { email: 'officer@gov.in' }).pass, true);
      assert.equal(evaluateRule(containsRule, { email: 'citizen@gmail.com' }).pass, false);

      const regexRule: ServiceRule = {
        id: 'r-rgx',
        serviceId: 's1',
        ruleCode: 'R_RGX',
        nameEn: 'PIN Code Regex',
        nameTa: 'அஞ்சல் குறியீடு',
        fieldKey: 'pincode',
        operator: 'regex_match',
        targetValue: '^[1-9][0-9]{5}$',
        severity: 'critical',
        explanationEn: '',
        explanationTa: '',
        actionEn: '',
        actionTa: '',
        isActive: true,
      };
      assert.equal(evaluateRule(regexRule, { pincode: '600001' }).pass, true);
      assert.equal(evaluateRule(regexRule, { pincode: '000123' }).pass, false);
      assert.equal(evaluateRule(regexRule, { pincode: 'ABC123' }).pass, false);
    });
  });

  describe('runFullVerification() End-to-End Simulation', () => {
    const mockService: GovService = {
      id: 'srv-test-1',
      code: 'TEST-SVC',
      nameEn: 'Standard Test Certificate',
      nameTa: 'சோதனை சான்றிதழ்',
      descriptionEn: 'Service for automated unit testing',
      descriptionTa: 'சோதனைக்கான சேவை',
      category: 'Certificates',
      requiredDocCount: 1,
      basicEligibilitySummaryEn: 'Test eligibility',
      basicEligibilitySummaryTa: 'சோதனை தகுதி',
      whoMayApplyEn: 'Citizens',
      whoMayApplyTa: 'குடிமக்கள்',
      requiredInfoEn: 'Basic information',
      requiredInfoTa: 'அடிப்படை தகவல்',
      generalNotesEn: '',
      generalNotesTa: '',
      disclaimerEn: '',
      disclaimerTa: '',
      version: '1.0',
      active: true,
      lastUpdated: '2026-03-01T00:00:00.000Z',
      fields: [
        {
          id: 'f1',
          serviceId: 'srv-test-1',
          fieldKey: 'applicantName',
          labelEn: 'Full Name',
          labelTa: 'முழு பெயர்',
          fieldType: 'text',
          isRequired: true,
          sortOrder: 1,
        },
        {
          id: 'f2',
          serviceId: 'srv-test-1',
          fieldKey: 'annualIncome',
          labelEn: 'Annual Income',
          labelTa: 'ஆண்டு வருமானம்',
          fieldType: 'number',
          isRequired: true,
          sortOrder: 2,
        },
      ],
      documents: [
        {
          id: 'd1',
          serviceId: 'srv-test-1',
          docTypeKey: 'AADHAAR_CARD',
          titleEn: 'Aadhaar Card',
          titleTa: 'ஆதார் அட்டை',
          descriptionEn: 'Identity Proof',
          descriptionTa: 'அடையாளச் சான்று',
          allowedFormats: ['application/pdf', 'image/jpeg'],
          maxSizeBytes: 5242880,
          isRequired: true,
        },
      ],
      rules: [
        {
          id: 'r-inc',
          serviceId: 'srv-test-1',
          ruleCode: 'INCOME_CAP',
          nameEn: 'Annual Income Ceiling',
          nameTa: 'வருமான உச்சவரம்பு',
          fieldKey: 'annualIncome',
          operator: 'lte',
          targetValue: 300000,
          severity: 'critical',
          explanationEn: 'Annual family income must not exceed INR 3,00,000.',
          explanationTa: 'ஆண்டு வருமானம் 3 லட்சத்திற்குள் இருக்க வேண்டும்.',
          actionEn: 'Update annual income or verify subsidy category.',
          actionTa: 'வருமானத்தை சரிபார்க்கவும்.',
          isActive: true,
        },
      ],
    };

    it('should produce LOW risk assessment (Score 0) when all fields, docs, and rules pass', () => {
      const perfectApp: Application = {
        id: 'app-perf-1',
        applicationNumber: 'APP-TEST-001',
        citizenId: 'usr-1',
        citizenName: 'Abishek Vasanth',
        citizenEmail: 'test@example.com',
        serviceId: 'srv-test-1',
        serviceCode: 'TEST-SVC',
        serviceNameEn: 'Standard Test Certificate',
        serviceNameTa: 'சோதனை சான்றிதழ்',
        serviceVersion: '1.0',
        status: 'IN_PROGRESS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dynamicFormData: {
          applicantName: 'Abishek Vasanth',
          annualIncome: 180000,
        },
        uploadedDocuments: [
          {
            id: 'doc-1',
            applicationId: 'app-perf-1',
            docTypeKey: 'AADHAAR_CARD',
            fileName: 'aadhaar.pdf',
            fileType: 'application/pdf',
            fileSize: 120000,
            status: 'ANALYZED',
            uploadedAt: new Date().toISOString(),
            extractions: {
              documentType: 'AADHAAR_CARD',
              extractedFields: {
                name: 'Abishek Vasanth',
                uid: '1234-5678-9012',
              },
              confidence: 0.95,
              readability: 'good',
              warnings: [],
              qualityIssues: [],
            },
          },
        ],
        verificationRuns: [],
        currentIssues: [],
      };

      const result = runFullVerification(mockService, perfectApp);
      assert.equal(result.assessment.score, 0);
      assert.equal(result.assessment.level, 'LOW');
      assert.equal(result.issues.length, 0);
      assert.equal(result.assessment.completenessStatus, 'PASS');
      assert.equal(result.assessment.ruleCheckStatus, 'PASS');
    });

    it('should flag MISSING_DOC and elevate risk when mandatory document is missing', () => {
      const missingDocApp: Application = {
        id: 'app-miss-1',
        applicationNumber: 'APP-TEST-002',
        citizenId: 'usr-1',
        citizenName: 'Abishek Vasanth',
        citizenEmail: 'test@example.com',
        serviceId: 'srv-test-1',
        serviceCode: 'TEST-SVC',
        serviceNameEn: 'Standard Test Certificate',
        serviceNameTa: 'சோதனை சான்றிதழ்',
        serviceVersion: '1.0',
        status: 'IN_PROGRESS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dynamicFormData: {
          applicantName: 'Abishek Vasanth',
          annualIncome: 180000,
        },
        uploadedDocuments: [], // No docs uploaded
        verificationRuns: [],
        currentIssues: [],
      };

      const result = runFullVerification(mockService, missingDocApp);
      assert.ok(result.assessment.score >= 30, 'Score should reflect document missing penalty');
      assert.equal(result.assessment.completenessStatus, 'FAIL');
      const docIssue = result.issues.find(i => i.issueType === 'MISSING_DOC');
      assert.ok(docIssue, 'Must contain a MISSING_DOC issue');
      assert.equal(docIssue?.docTypeKey, 'AADHAAR_CARD');
    });

    it('should flag NAME_MISMATCH when extracted name differs from form input', () => {
      const mismatchApp: Application = {
        id: 'app-mis-1',
        applicationNumber: 'APP-TEST-003',
        citizenId: 'usr-1',
        citizenName: 'Kavitha Ramasamy',
        citizenEmail: 'test@example.com',
        serviceId: 'srv-test-1',
        serviceCode: 'TEST-SVC',
        serviceNameEn: 'Standard Test Certificate',
        serviceNameTa: 'சோதனை சான்றிதழ்',
        serviceVersion: '1.0',
        status: 'IN_PROGRESS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dynamicFormData: {
          applicantName: 'Kavitha Ramasamy',
          annualIncome: 150000,
        },
        uploadedDocuments: [
          {
            id: 'doc-mismatch',
            applicationId: 'app-mis-1',
            docTypeKey: 'AADHAAR_CARD',
            fileName: 'brother_aadhaar.pdf',
            fileType: 'application/pdf',
            fileSize: 120000,
            status: 'ANALYZED',
            uploadedAt: new Date().toISOString(),
            extractions: {
              documentType: 'AADHAAR_CARD',
              extractedFields: {
                name: 'Ramasamy Natarajan', // Mismatching name
              },
              confidence: 0.90,
              readability: 'good',
              warnings: [],
              qualityIssues: [],
            },
          },
        ],
        verificationRuns: [],
        currentIssues: [],
      };

      const result = runFullVerification(mockService, mismatchApp);
      const nameIssue = result.issues.find(i => i.issueType === 'NAME_MISMATCH');
      assert.ok(nameIssue, 'Must detect name discrepancy');
      assert.ok(result.assessment.breakdown.informationConsistency > 0);
    });

    it('should flag RULE_VIOLATION when income exceeds ceiling and calculate HIGH risk', () => {
      const highIncomeApp: Application = {
        id: 'app-high-1',
        applicationNumber: 'APP-TEST-004',
        citizenId: 'usr-1',
        citizenName: 'Abishek Vasanth',
        citizenEmail: 'test@example.com',
        serviceId: 'srv-test-1',
        serviceCode: 'TEST-SVC',
        serviceNameEn: 'Standard Test Certificate',
        serviceNameTa: 'சோதனை சான்றிதழ்',
        serviceVersion: '1.0',
        status: 'IN_PROGRESS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dynamicFormData: {
          applicantName: '', // Missing field
          annualIncome: 500000, // Exceeds 300,000 threshold
        },
        uploadedDocuments: [], // Missing doc
        verificationRuns: [],
        currentIssues: [],
      };

      const result = runFullVerification(mockService, highIncomeApp);
      assert.ok(result.assessment.score >= 51, `Expected HIGH risk score >= 51, got ${result.assessment.score}`);
      assert.equal(result.assessment.level, 'HIGH');
      assert.ok(result.issues.some(i => i.issueType === 'RULE_VIOLATION'));
      assert.ok(result.issues.some(i => i.issueType === 'INCOMPLETE_FIELD'));
      assert.ok(result.issues.some(i => i.issueType === 'MISSING_DOC'));
    });
  });
});
