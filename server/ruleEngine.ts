import { 
  GovService, 
  Application, 
  VerificationIssue, 
  RiskAssessment, 
  CheckStatus,
  ServiceRule
} from '../src/types';

// String normalization & fuzzy similarity helper
export function normalizeText(str?: string | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function calculateSimilarity(s1: string, s2: string): number {
  const norm1 = normalizeText(s1);
  const norm2 = normalizeText(s2);
  if (norm1 === norm2) return 1.0;
  if (!norm1 || !norm2) return 0.0;

  // Token overlap ratio (e.g. "Abishek Vasanth P" vs "P. Abishek Vasanth")
  const tokens1 = new Set(norm1.split(' '));
  const tokens2 = new Set(norm2.split(' '));
  let intersection = 0;
  tokens1.forEach(t => {
    if (tokens2.has(t)) intersection++;
  });
  const tokenScore = (2 * intersection) / (tokens1.size + tokens2.size);

  // Levenshtein distance on normalized strings
  const len1 = norm1.length;
  const len2 = norm2.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = norm1[i - 1] === norm2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  const editDistance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  const levScore = (maxLen - editDistance) / maxLen;

  return Math.max(tokenScore, levScore);
}

export function evaluateRule(rule: ServiceRule, formData: Record<string, any>): { pass: boolean; actualValue: any } {
  const value = formData[rule.fieldKey];

  switch (rule.operator) {
    case 'exists':
      return { pass: value !== undefined && value !== null && value !== '', actualValue: value };
    case 'equals':
      return { pass: String(value) === String(rule.targetValue), actualValue: value };
    case 'not_equals':
      return { pass: String(value) !== String(rule.targetValue), actualValue: value };
    case 'greater_than':
      return { pass: Number(value) > Number(rule.targetValue), actualValue: value };
    case 'less_than':
      return { pass: Number(value) < Number(rule.targetValue), actualValue: value };
    case 'gte':
      return { pass: Number(value) >= Number(rule.targetValue), actualValue: value };
    case 'lte':
      return { pass: Number(value) <= Number(rule.targetValue), actualValue: value };
    case 'contains':
      return { pass: String(value || '').toLowerCase().includes(String(rule.targetValue).toLowerCase()), actualValue: value };
    case 'aadhaar_valid': {
      const str = String(value || '').replace(/\s+/g, '');
      const pass = /^\d{12}$/.test(str);
      return { pass, actualValue: value };
    }
    case 'regex_match': {
      try {
        const regex = new RegExp(rule.targetValue);
        const pass = regex.test(String(value || ''));
        return { pass, actualValue: value };
      } catch {
        return { pass: true, actualValue: value };
      }
    }
    default:
      return { pass: true, actualValue: value };
  }
}

export function runFullVerification(service: GovService, application: Application): {
  assessment: RiskAssessment;
  issues: VerificationIssue[];
} {
  const issues: VerificationIssue[] = [];
  const formData = application.dynamicFormData || {};
  const uploadedDocs = application.uploadedDocuments || [];

  // --- 1. Document Completeness Check (Max 30 pts) ---
  let completenessScore = 0;
  const requiredDocs = service.documents.filter(d => d.isRequired);
  const uploadedTypeKeys = new Set(uploadedDocs.map(d => d.docTypeKey));

  requiredDocs.forEach(reqDoc => {
    if (!uploadedTypeKeys.has(reqDoc.docTypeKey)) {
      completenessScore += Math.round(30 / Math.max(requiredDocs.length, 1));
      issues.push({
        id: `iss-comp-${reqDoc.docTypeKey}-${Date.now()}`,
        issueType: 'MISSING_DOC',
        severity: 'critical',
        whatEn: `Missing Mandatory Document: ${reqDoc.titleEn}`,
        whatTa: `கட்டாய ஆவணம் விடுபட்டுள்ளது: ${reqDoc.titleTa}`,
        whyEn: `The service configuration requires "${reqDoc.titleEn}" (${reqDoc.descriptionEn}) before an official inquiry can proceed.`,
        whyTa: `அரசு விதிமுறைகளின்படி "${reqDoc.titleTa}" சமர்ப்பிக்கப்படுவது கட்டாயமாகும்.`,
        actionEn: `Upload a valid copy of your ${reqDoc.titleEn} in PDF, JPG, or PNG format.`,
        actionTa: `${reqDoc.titleTa} ஆவணத்தை உடனடியாக பதிவேற்றவும்.`,
        source: `Document Checklist: ${reqDoc.titleEn}`,
        docTypeKey: reqDoc.docTypeKey,
        status: 'OPEN',
      });
    }
  });
  completenessScore = Math.min(30, completenessScore);

  // --- 2. Required Form Fields Check (Max 20 pts) ---
  let requiredFieldsScore = 0;
  const requiredFields = service.fields.filter(f => f.isRequired);
  let missingFieldCount = 0;

  requiredFields.forEach(field => {
    const val = formData[field.fieldKey];
    if (val === undefined || val === null || String(val).trim() === '') {
      missingFieldCount++;
      issues.push({
        id: `iss-fld-${field.fieldKey}-${Date.now()}`,
        issueType: 'INCOMPLETE_FIELD',
        severity: 'critical',
        whatEn: `Incomplete Required Field: ${field.labelEn}`,
        whatTa: `பூர்த்தி செய்யப்படாத புலம்: ${field.labelTa}`,
        whyEn: `Government application forms require "${field.labelEn}" to process the submission without administrative rejections.`,
        whyTa: `விண்ணப்பத்தை பரிசீலிக்க "${field.labelTa}" தகவல் கட்டாயம் தேவை.`,
        actionEn: `Fill in the "${field.labelEn}" field in the application form.`,
        actionTa: `படிவத்தில் "${field.labelTa}" விவரத்தை உள்ளிடவும்.`,
        source: `Application Field: ${field.labelEn}`,
        fieldKey: field.fieldKey,
        status: 'OPEN',
      });
    }
  });

  if (requiredFields.length > 0 && missingFieldCount > 0) {
    requiredFieldsScore = Math.min(20, Math.round((missingFieldCount / requiredFields.length) * 20));
  }

  // --- 3. Cross-Document Consistency Check (Max 25 pts) ---
  let consistencyScore = 0;
  const applicantName = String(formData.applicantName || '');
  const residentialAddress = String(formData.residentialAddress || '');

  uploadedDocs.forEach(doc => {
    if (doc.extractions && doc.extractions.extractedFields) {
      const extracted = doc.extractions.extractedFields;

      // Name consistency check
      const docName = String(extracted.name || extracted.studentName || extracted.applicantName || extracted.employeeName || extracted.accountHolder || '');
      if (applicantName && docName) {
        const similarity = calculateSimilarity(applicantName, docName);
        if (similarity < 0.80) {
          consistencyScore += 12;
          issues.push({
            id: `iss-name-${doc.id}`,
            issueType: 'NAME_MISMATCH',
            severity: similarity < 0.60 ? 'critical' : 'warning',
            whatEn: `Potential Name Discrepancy Detected`,
            whatTa: `பெயர் முரண்பாடு கண்டறியப்பட்டது`,
            whyEn: `Application form records "${applicantName}", but uploaded ${doc.docTypeKey} extracts "${docName}" (Similarity: ${Math.round(similarity * 100)}%). Government portals often flag differences between application entries and ID documents.`,
            whyTa: `விண்ணப்பத்தில் "${applicantName}" என்றும், ஆவணத்தில் "${docName}" என்றும் உள்ளது.`,
            actionEn: `Verify spelling in the application or upload a document that matches your legal name.`,
            actionTa: `ஆவணத்தில் உள்ளவாறு விண்ணப்பப் பெயரை திருத்தவும் அல்லது சரியான ஆவணத்தை பதிவேற்றவும்.`,
            source: `Form (${applicantName}) vs ${doc.fileName} (${docName})`,
            fieldKey: 'applicantName',
            docTypeKey: doc.docTypeKey,
            status: 'OPEN',
          });
        }
      }

      // Address consistency check (if both provided)
      const docAddress = String(extracted.address || '');
      if (residentialAddress && docAddress) {
        const similarity = calculateSimilarity(residentialAddress, docAddress);
        if (similarity < 0.65) {
          consistencyScore += 10;
          issues.push({
            id: `iss-addr-${doc.id}`,
            issueType: 'ADDRESS_MISMATCH',
            severity: 'warning',
            whatEn: `Potential Address Mismatch Detected`,
            whatTa: `முகவரி முரண்பாடு கண்டறியப்பட்டது`,
            whyEn: `Application address differs from the address extracted in uploaded ${doc.docTypeKey}. Revenue inquiries cross-verify street and locality.`,
            whyTa: `விண்ணப்ப முகவரியும் ஆவண முகவரியும் வேறுபடுகின்றன.`,
            actionEn: `Verify your permanent residential address against the uploaded utility bill / ID.`,
            actionTa: `முகவரியை ஆவணத்துடன் சரிபார்த்து திருத்தவும்.`,
            source: `Form vs ${doc.fileName}`,
            fieldKey: 'residentialAddress',
            docTypeKey: doc.docTypeKey,
            status: 'OPEN',
          });
        }
      }

      // Document Quality Issues Check
      if (doc.extractions.readability === 'poor' || (doc.extractions.qualityIssues && doc.extractions.qualityIssues.length > 0)) {
        consistencyScore += 5;
        issues.push({
          id: `iss-qual-${doc.id}`,
          issueType: 'QUALITY_ISSUE',
          severity: 'warning',
          whatEn: `Low Document Scan Quality / Readability Warning (${doc.fileName})`,
          whatTa: `ஆவணத் தரம் குறைவாக உள்ளது (${doc.fileName})`,
          whyEn: `The uploaded document contains blur or low resolution, which may hinder manual officer inspection or automated verification.`,
          whyTa: `ஆவணம் மங்கலாக உள்ளதால் அரசு அலுவலர்களால் சரிபார்க்க கடினமாக இருக்கலாம்.`,
          actionEn: `Re-upload a sharp, well-illuminated photo or official digital PDF.`,
          actionTa: `தெளிவான புகைப்படத்தை மீண்டும் பதிவேற்றவும்.`,
          source: `Document Quality Check: ${doc.fileName}`,
          docTypeKey: doc.docTypeKey,
          status: 'OPEN',
        });
      }
    }
  });
  consistencyScore = Math.min(25, consistencyScore);

  // --- 4. Configured Rule / Eligibility Check (Max 25 pts) ---
  let ruleScore = 0;
  const activeRules = service.rules.filter(r => r.isActive);

  activeRules.forEach(rule => {
    const { pass, actualValue } = evaluateRule(rule, formData);
    if (!pass) {
      const penalty = rule.severity === 'critical' ? 15 : (rule.severity === 'warning' ? 8 : 4);
      ruleScore += penalty;
      issues.push({
        id: `iss-rule-${rule.id}-${Date.now()}`,
        issueType: 'RULE_VIOLATION',
        severity: rule.severity,
        whatEn: rule.nameEn,
        whatTa: rule.nameTa,
        whyEn: `${rule.explanationEn} (Current value: ${actualValue === undefined ? 'Not provided' : actualValue})`,
        whyTa: `${rule.explanationTa} (தற்போதைய மதிப்பு: ${actualValue === undefined ? 'வழங்கப்படவில்லை' : actualValue})`,
        actionEn: rule.actionEn,
        actionTa: rule.actionTa,
        source: `Configured Rule: ${rule.ruleCode}`,
        fieldKey: rule.fieldKey,
        status: 'OPEN',
      });
    }
  });
  ruleScore = Math.min(25, ruleScore);

  // --- Calculate Total 0-100 Risk Score ---
  const totalScore = Math.min(100, completenessScore + requiredFieldsScore + consistencyScore + ruleScore);

  let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (totalScore >= 51) {
    level = 'HIGH';
  } else if (totalScore >= 21) {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }

  const completenessStatus: CheckStatus = completenessScore === 0 ? 'PASS' : (completenessScore < 20 ? 'WARNING' : 'FAIL');
  const consistencyStatus: CheckStatus = consistencyScore === 0 ? 'PASS' : (consistencyScore < 15 ? 'WARNING' : 'FAIL');
  const ruleCheckStatus: CheckStatus = ruleScore === 0 ? 'PASS' : (ruleScore < 15 ? 'WARNING' : 'FAIL');
  const qualityStatus: CheckStatus = issues.some(i => i.issueType === 'QUALITY_ISSUE') ? 'WARNING' : 'PASS';

  let summaryEn = '';
  let summaryTa = '';
  const recommendedActions: string[] = [];

  if (level === 'LOW') {
    summaryEn = 'Pre-verification successful with LOW rejection risk. All mandatory documents and core eligibility parameters meet configured service guidelines.';
    summaryTa = 'குறைந்த அபாயத்துடன் முன்-சரிபார்ப்பு நிறைவடைந்தது. அனைத்து ஆவணங்களும் விதிகளும் சரியாக உள்ளன.';
    recommendedActions.push('Review the generated Pre-Submission Report.');
    recommendedActions.push('Proceed with confidence to the official government e-portal.');
  } else if (level === 'MEDIUM') {
    summaryEn = 'Potential application discrepancies detected. While most fields are valid, warnings regarding document completeness, name alignment, or eligibility thresholds require citizen attention.';
    summaryTa = 'விண்ணப்பத்தில் சில எச்சரிக்கைகள் கண்டறியப்பட்டன. திருத்தும் மையத்தில் சரிசெய்து மீண்டும் சரிபார்க்கவும்.';
    recommendedActions.push('Visit the Correction Center to inspect highlighted warnings.');
    recommendedActions.push('Re-run verification after making corrections.');
  } else {
    summaryEn = 'Significant application issues detected. Missing critical documents or failure to meet fundamental criteria increases the risk of delay or rejection by government authorities.';
    summaryTa = 'முக்கிய முரண்பாடுகள் கண்டறியப்பட்டுள்ளன. சமர்ப்பிக்கும் முன் திருத்தங்களை கட்டாயம் மேற்கொள்ளவும்.';
    recommendedActions.push('Resolve all critical checklist items in the Correction Center.');
    recommendedActions.push('Upload required supporting documents.');
    recommendedActions.push('Re-verify application before official portal submission.');
  }

  const assessment: RiskAssessment = {
    score: totalScore,
    level,
    breakdown: {
      documentCompleteness: completenessScore,
      informationConsistency: consistencyScore,
      requiredFields: requiredFieldsScore,
      configuredRules: ruleScore,
    },
    completenessStatus,
    consistencyStatus,
    ruleCheckStatus,
    qualityStatus,
    summaryEn,
    summaryTa,
    recommendedActions,
  };

  return { assessment, issues };
}
