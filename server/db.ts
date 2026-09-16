import { 
  User, 
  GovService, 
  Application, 
  AuditLog, 
  AppNotification, 
  AdminAnalytics,
  ServiceField,
  ServiceDocumentConfig,
  ServiceRule
} from '../src/types';
import { hashPassword } from './auth';

// In-memory persistent state storage
class Database {
  users: (User & { passwordHash: string })[] = [];
  services: GovService[] = [];
  applications: Application[] = [];
  auditLogs: AuditLog[] = [];
  notifications: AppNotification[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    // 1. Seed Users
    this.users = [
      {
        id: 'usr-admin-1',
        name: 'GovCheck Administrator',
        email: 'admin@govcheck.ai',
        mobile: '+91 98765 43210',
        role: 'admin',
        preferredLanguage: 'en',
        passwordHash: hashPassword('admin123'),
        createdAt: '2026-01-10T10:00:00.000Z',
      },
      {
        id: 'usr-citizen-1',
        name: 'Abishek Vasanth P',
        email: 'citizen@example.com',
        mobile: '+91 98450 12345',
        role: 'citizen',
        preferredLanguage: 'en',
        passwordHash: hashPassword('password123'),
        createdAt: '2026-02-15T14:30:00.000Z',
      },
      {
        id: 'usr-citizen-2',
        name: 'Kavitha Ramasamy',
        email: 'kavitha@example.com',
        mobile: '+91 94441 56789',
        role: 'citizen',
        preferredLanguage: 'ta',
        passwordHash: hashPassword('password123'),
        createdAt: '2026-03-01T09:15:00.000Z',
      },
    ];

    // 2. Seed Pre-Configured Services with dynamic fields, documents, and rules
    const incomeCertFields: ServiceField[] = [
      {
        id: 'fld-inc-1',
        serviceId: 'srv-income-cert',
        fieldKey: 'applicantName',
        labelEn: 'Applicant Full Name (As in Aadhaar)',
        labelTa: 'விண்ணப்பதாரர் முழுப் பெயர் (ஆதார் படி)',
        fieldType: 'text',
        isRequired: true,
        helpTextEn: 'Enter name exactly as printed on Government photo ID',
        helpTextTa: 'அரசு புகைப்பட அடையாள அட்டையில் உள்ளவாறு உள்ளிடவும்',
        placeholderEn: 'e.g. Abishek Vasanth P',
        placeholderTa: 'எ.கா. அபிஷேக் வசந்த் பி',
        categoryGroup: 'Personal Details',
        sortOrder: 1,
      },
      {
        id: 'fld-inc-2',
        serviceId: 'srv-income-cert',
        fieldKey: 'fatherOrSpouseName',
        labelEn: 'Father / Guardian / Spouse Name',
        labelTa: 'தந்தை / பாதுகாவலர் / கணவர் பெயர்',
        fieldType: 'text',
        isRequired: true,
        placeholderEn: 'e.g. Periyasamy K',
        placeholderTa: 'எ.கா. பெரியசாமி கே',
        categoryGroup: 'Personal Details',
        sortOrder: 2,
      },
      {
        id: 'fld-inc-3',
        serviceId: 'srv-income-cert',
        fieldKey: 'dob',
        labelEn: 'Date of Birth',
        labelTa: 'பிறந்த தேதி',
        fieldType: 'date',
        isRequired: true,
        categoryGroup: 'Personal Details',
        sortOrder: 3,
      },
      {
        id: 'fld-inc-4',
        serviceId: 'srv-income-cert',
        fieldKey: 'aadhaarNumber',
        labelEn: 'Aadhaar Number (12 Digits)',
        labelTa: 'ஆதார் எண் (12 இலக்கங்கள்)',
        fieldType: 'text',
        isRequired: true,
        validationRegex: '^\\d{4}\\s?\\d{4}\\s?\\d{4}$',
        placeholderEn: '1234 5678 9012',
        placeholderTa: '1234 5678 9012',
        categoryGroup: 'Identity & Address',
        sortOrder: 4,
      },
      {
        id: 'fld-inc-5',
        serviceId: 'srv-income-cert',
        fieldKey: 'annualFamilyIncome',
        labelEn: 'Total Annual Family Income (INR)',
        labelTa: 'மொத்த குடும்ப ஆண்டு வருமானம் (ரூ.)',
        fieldType: 'number',
        isRequired: true,
        helpTextEn: 'Include income from all earning members across agriculture, salary, business',
        helpTextTa: 'அனைத்து வருமான ஆதாரங்களையும் சேர்த்து உள்ளிடவும்',
        placeholderEn: 'e.g. 120000',
        placeholderTa: 'எ.கா. 120000',
        categoryGroup: 'Income Details',
        sortOrder: 5,
      },
      {
        id: 'fld-inc-6',
        serviceId: 'srv-income-cert',
        fieldKey: 'incomeSource',
        labelEn: 'Primary Source of Income',
        labelTa: 'முக்கிய வருமான ஆதாரம்',
        fieldType: 'dropdown',
        isRequired: true,
        options: ['Salaried (Private)', 'Government Employee', 'Agriculture / Daily Wages', 'Business / Self-Employed', 'Pension / Others'],
        categoryGroup: 'Income Details',
        sortOrder: 6,
      },
      {
        id: 'fld-inc-7',
        serviceId: 'srv-income-cert',
        fieldKey: 'residentialAddress',
        labelEn: 'Permanent Residential Address',
        labelTa: 'நிரந்தர குடியிருப்பு முகவரி',
        fieldType: 'address',
        isRequired: true,
        placeholderEn: 'Door No, Street Name, Village/Town, Taluk, District, PIN Code',
        placeholderTa: 'கதவு எண், தெரு, கிராமம்/நகரம், வட்டம், மாவட்டம், அஞ்சல் குறியீடு',
        categoryGroup: 'Identity & Address',
        sortOrder: 7,
      },
      {
        id: 'fld-inc-8',
        serviceId: 'srv-income-cert',
        fieldKey: 'rationCardNumber',
        labelEn: 'Ration / Smart Card Number',
        labelTa: 'குடும்ப அட்டை எண்',
        fieldType: 'text',
        isRequired: false,
        placeholderEn: 'e.g. 33/01/W/1234567',
        placeholderTa: 'எ.கா. 33/01/W/1234567',
        categoryGroup: 'Identity & Address',
        sortOrder: 8,
      },
    ];

    const incomeCertDocs: ServiceDocumentConfig[] = [
      {
        id: 'doc-inc-1',
        serviceId: 'srv-income-cert',
        docTypeKey: 'identity_proof',
        titleEn: 'Identity Proof (Aadhaar / Voter ID)',
        titleTa: 'அடையாளச் சான்று (ஆதார் / வாக்காளர் அட்டை)',
        descriptionEn: 'Clear copy showing applicant full name, DOB, and photo',
        descriptionTa: 'விண்ணப்பதாரரின் பெயர், பிறந்த தேதி மற்றும் புகைப்படம் தெளிவாக இருக்க வேண்டும்',
        isRequired: true,
        allowedFormats: ['PDF', 'JPG', 'JPEG', 'PNG'],
        maxSizeBytes: 5 * 1024 * 1024,
      },
      {
        id: 'doc-inc-2',
        serviceId: 'srv-income-cert',
        docTypeKey: 'address_proof',
        titleEn: 'Address Proof (Ration Card / EB Bill / Gas Bill)',
        titleTa: 'முகவரிச் சான்று (குடும்ப அட்டை / மின்கட்டண ரசீது)',
        descriptionEn: 'Document validating the current permanent residence matching the application address',
        descriptionTa: 'விண்ணப்ப முகவரியுடன் பொருந்தக்கூடிய செல்லுபடியாகும் முகவரி ஆவணம்',
        isRequired: true,
        allowedFormats: ['PDF', 'JPG', 'JPEG', 'PNG'],
        maxSizeBytes: 5 * 1024 * 1024,
      },
      {
        id: 'doc-inc-3',
        serviceId: 'srv-income-cert',
        docTypeKey: 'income_proof',
        titleEn: 'Income Proof (Salary Slip / IT Return / VAO Report / Employer Letter)',
        titleTa: 'வருமானச் சான்று (ஊதியச் சீட்டு / கிராம நிர்வாக அலுவலர் அறிக்கை)',
        descriptionEn: 'Recent salary slip (last 3 months), Form 16, or VAO inquiry certificate',
        descriptionTa: 'சமீபத்திய ஊதியச் சீட்டு அல்லது கிராம நிர்வாக அலுவலர் வருமான அறிக்கை',
        isRequired: true,
        allowedFormats: ['PDF', 'JPG', 'JPEG', 'PNG'],
        maxSizeBytes: 5 * 1024 * 1024,
      },
      {
        id: 'doc-inc-4',
        serviceId: 'srv-income-cert',
        docTypeKey: 'self_declaration',
        titleEn: 'Self-Declaration Form',
        titleTa: 'சுய அறிவிப்பு படிவம்',
        descriptionEn: 'Signed self-declaration of annual family income and assets',
        descriptionTa: 'கையொப்பமிடப்பட்ட குடும்ப வருமான சுய அறிவிப்பு படிவம்',
        isRequired: false,
        allowedFormats: ['PDF', 'JPG', 'JPEG', 'PNG'],
        maxSizeBytes: 5 * 1024 * 1024,
      },
    ];

    const incomeCertRules: ServiceRule[] = [
      {
        id: 'rul-inc-1',
        serviceId: 'srv-income-cert',
        ruleCode: 'RULE_INCOME_POSITIVE',
        nameEn: 'Annual Income Positive Value Check',
        nameTa: 'வருமானம் பூஜ்ஜியத்திற்கு மேல் இருத்தல்',
        fieldKey: 'annualFamilyIncome',
        operator: 'greater_than',
        targetValue: 0,
        severity: 'critical',
        explanationEn: 'Annual income must be greater than zero for valid certificate generation.',
        explanationTa: 'சான்றிதழ் பெறுவதற்கு ஆண்டு வருமானம் 0-க்கு மேல் குறிப்பிடப்பட வேண்டும்.',
        actionEn: 'Enter a valid positive total family annual income.',
        actionTa: 'சரியான ஆண்டு வருமானத்தை உள்ளிடவும்.',
        isActive: true,
      },
      {
        id: 'rul-inc-2',
        serviceId: 'srv-income-cert',
        ruleCode: 'RULE_AADHAAR_FORMAT',
        nameEn: 'Aadhaar 12-Digit Format Check',
        nameTa: 'ஆதார் 12 இலக்க வடிவம்',
        fieldKey: 'aadhaarNumber',
        operator: 'aadhaar_valid',
        targetValue: true,
        severity: 'critical',
        explanationEn: 'Aadhaar number must contain 12 numeric digits.',
        explanationTa: 'ஆதார் எண் 12 இலக்கங்களை கொண்டிருக்க வேண்டும்.',
        actionEn: 'Provide a valid 12-digit Aadhaar number.',
        actionTa: 'சரியான 12 இலக்க ஆதார் எண்ணை உள்ளிடவும்.',
        isActive: true,
      },
      {
        id: 'rul-inc-3',
        serviceId: 'srv-income-cert',
        ruleCode: 'RULE_SUBSIDY_LIMIT_WARNING',
        nameEn: 'Low Income Subsidy Upper Threshold Advisory',
        nameTa: 'அரசு மானிய வருமான வரம்பு ஆலோசனை',
        fieldKey: 'annualFamilyIncome',
        operator: 'lte',
        targetValue: 250000,
        severity: 'info',
        explanationEn: 'Applications with annual income over INR 2,50,000 may not qualify for low-income welfare scheme subsidies.',
        explanationTa: 'ரூ. 2,50,000-க்கு மேல் உள்ள வருமானம் சில அரசு மானியங்களுக்கு பொருந்தாமல் போகலாம்.',
        actionEn: 'Verify if your declared income accurately reflects your household tax bracket.',
        actionTa: 'உங்கள் வருமானத்தை மீண்டும் சரிபார்த்துக் கொள்ளவும்.',
        isActive: true,
      },
    ];

    // Community Certificate Service
    const communityCertFields: ServiceField[] = [
      {
        id: 'fld-comm-1',
        serviceId: 'srv-community-cert',
        fieldKey: 'applicantName',
        labelEn: 'Applicant Full Name',
        labelTa: 'விண்ணப்பதாரர் முழுப் பெயர்',
        fieldType: 'text',
        isRequired: true,
        placeholderEn: 'e.g. Priya Sundaram',
        placeholderTa: 'எ.கா. பிரியா சுந்தரம்',
        categoryGroup: 'Personal Details',
        sortOrder: 1,
      },
      {
        id: 'fld-comm-2',
        serviceId: 'srv-community-cert',
        fieldKey: 'fatherName',
        labelEn: "Father's Full Name",
        labelTa: 'தந்தை பெயர்',
        fieldType: 'text',
        isRequired: true,
        placeholderEn: 'e.g. Sundaram M',
        placeholderTa: 'எ.கா. சுந்தரம் எம்',
        categoryGroup: 'Personal Details',
        sortOrder: 2,
      },
      {
        id: 'fld-comm-3',
        serviceId: 'srv-community-cert',
        fieldKey: 'motherName',
        labelEn: "Mother's Full Name",
        labelTa: 'தாய் பெயர்',
        fieldType: 'text',
        isRequired: true,
        placeholderEn: 'e.g. Lakshmi Sundaram',
        placeholderTa: 'எ.கா. லட்சுமி சுந்தரம்',
        categoryGroup: 'Personal Details',
        sortOrder: 3,
      },
      {
        id: 'fld-comm-4',
        serviceId: 'srv-community-cert',
        fieldKey: 'dob',
        labelEn: 'Date of Birth',
        labelTa: 'பிறந்த தேதி',
        fieldType: 'date',
        isRequired: true,
        categoryGroup: 'Personal Details',
        sortOrder: 4,
      },
      {
        id: 'fld-comm-5',
        serviceId: 'srv-community-cert',
        fieldKey: 'communityCategory',
        labelEn: 'Community Category',
        labelTa: 'சமூகப் பிரிவு',
        fieldType: 'dropdown',
        isRequired: true,
        options: ['Scheduled Caste (SC)', 'Scheduled Tribe (ST)', 'Most Backward Class (MBC)', 'Backward Class (BC)', 'Backward Class Muslim (BCM)', 'Other / Open Category (OC)'],
        categoryGroup: 'Community Details',
        sortOrder: 5,
      },
      {
        id: 'fld-comm-6',
        serviceId: 'srv-community-cert',
        fieldKey: 'casteSubCaste',
        labelEn: 'Specific Sub-Caste Name',
        labelTa: 'உட்பிரிவு பெயர்',
        fieldType: 'text',
        isRequired: true,
        placeholderEn: 'e.g. Vaniyar / Nadar / Pallar',
        placeholderTa: 'உட்பிரிவு பெயரை உள்ளிடவும்',
        categoryGroup: 'Community Details',
        sortOrder: 6,
      },
      {
        id: 'fld-comm-7',
        serviceId: 'srv-community-cert',
        fieldKey: 'schoolTcNumber',
        labelEn: 'School / College TC or Admission Number',
        labelTa: 'பள்ளி/கல்லூரி மாற்றுச் சான்றிதழ் எண்',
        fieldType: 'text',
        isRequired: true,
        placeholderEn: 'e.g. TC/2024/8891',
        placeholderTa: 'எ.கா. TC/2024/8891',
        categoryGroup: 'Educational Evidence',
        sortOrder: 7,
      },
    ];

    const communityCertDocs: ServiceDocumentConfig[] = [
      {
        id: 'doc-comm-1',
        serviceId: 'srv-community-cert',
        docTypeKey: 'identity_proof',
        titleEn: 'Identity Proof (Aadhaar / Birth Certificate)',
        titleTa: 'அடையாளச் சான்று (ஆதார் / பிறப்புச் சான்றிதழ்)',
        descriptionEn: 'Applicant identity document verifying name and date of birth',
        descriptionTa: 'விண்ணப்பதாரர் பெயர் மற்றும் பிறந்த தேதி சரிபார்க்கும் ஆவணம்',
        isRequired: true,
        allowedFormats: ['PDF', 'JPG', 'JPEG', 'PNG'],
        maxSizeBytes: 5 * 1024 * 1024,
      },
      {
        id: 'doc-comm-2',
        serviceId: 'srv-community-cert',
        docTypeKey: 'parent_community_cert',
        titleEn: "Parent's Community Certificate / School TC",
        titleTa: 'பெற்றோரின் சாதிச் சான்றிதழ் / பள்ளி மாற்றுச் சான்றிதழ்',
        descriptionEn: "Father's or mother's official community certificate proving family lineage",
        descriptionTa: 'தந்தை அல்லது தாயின் அரசு சாதிச் சான்றிதழ்',
        isRequired: true,
        allowedFormats: ['PDF', 'JPG', 'JPEG', 'PNG'],
        maxSizeBytes: 5 * 1024 * 1024,
      },
      {
        id: 'doc-comm-3',
        serviceId: 'srv-community-cert',
        docTypeKey: 'applicant_school_tc',
        titleEn: "Applicant School Transfer Certificate (TC)",
        titleTa: 'விண்ணப்பதாரரின் பள்ளி மாற்றுச் சான்றிதழ்',
        descriptionEn: 'School TC showing applicant community entry and date of birth',
        descriptionTa: 'பள்ளி மாற்றுச் சான்றிதழில் சாதி மற்றும் பிறந்த தேதி பதிவு',
        isRequired: true,
        allowedFormats: ['PDF', 'JPG', 'JPEG', 'PNG'],
        maxSizeBytes: 5 * 1024 * 1024,
      },
    ];

    const communityCertRules: ServiceRule[] = [
      {
        id: 'rul-comm-1',
        serviceId: 'srv-community-cert',
        ruleCode: 'RULE_COMMUNITY_CATEGORY_REQUIRED',
        nameEn: 'Community Category Selection Validation',
        nameTa: 'சமூகப் பிரிவு தேர்வு சரிபார்ப்பு',
        fieldKey: 'communityCategory',
        operator: 'exists',
        targetValue: true,
        severity: 'critical',
        explanationEn: 'A valid community category must be selected.',
        explanationTa: 'சரியான சமூகப் பிரிவு தேர்ந்தெடுக்கப்பட வேண்டும்.',
        actionEn: 'Select your community category from the dropdown.',
        actionTa: 'பட்டியலில் இருந்து சமூகப் பிரிவைத் தேர்ந்தெடுக்கவும்.',
        isActive: true,
      },
    ];

    // Residence / Domicile Certificate Service
    const residenceCertFields: ServiceField[] = [
      {
        id: 'fld-res-1',
        serviceId: 'srv-residence-cert',
        fieldKey: 'applicantName',
        labelEn: 'Applicant Full Name',
        labelTa: 'விண்ணப்பதாரர் முழுப் பெயர்',
        fieldType: 'text',
        isRequired: true,
        placeholderEn: 'e.g. Abishek Vasanth P',
        placeholderTa: 'எ.கா. அபிஷேக் வசந்த் பி',
        categoryGroup: 'Personal Details',
        sortOrder: 1,
      },
      {
        id: 'fld-res-2',
        serviceId: 'srv-residence-cert',
        fieldKey: 'yearsOfResidence',
        labelEn: 'Continuous Years of Residence at Current Address',
        labelTa: 'தற்போதைய முகவரியில் வசிக்கும் ஆண்டுகள்',
        fieldType: 'number',
        isRequired: true,
        placeholderEn: 'e.g. 7',
        placeholderTa: 'எ.கா. 7',
        categoryGroup: 'Residence Details',
        sortOrder: 2,
      },
      {
        id: 'fld-res-3',
        serviceId: 'srv-residence-cert',
        fieldKey: 'residentialAddress',
        labelEn: 'Full Permanent Address',
        labelTa: 'முழு நிரந்தர முகவரி',
        fieldType: 'address',
        isRequired: true,
        placeholderEn: 'Flat/Door No, Street, Ward/Village, City, District, PIN',
        placeholderTa: 'கதவு எண், தெரு, கிராமம்/வட்டம், மாவட்டம், அஞ்சல் குறியீடு',
        categoryGroup: 'Residence Details',
        sortOrder: 3,
      },
      {
        id: 'fld-res-4',
        serviceId: 'srv-residence-cert',
        fieldKey: 'propertyOrRentalType',
        labelEn: 'Residence Ownership Type',
        labelTa: 'குடியிருப்பு உரிமை வகை',
        fieldType: 'dropdown',
        isRequired: true,
        options: ['Own House / Ancestral Property', 'Rented / Leased Accommodation', 'Government Quarters'],
        categoryGroup: 'Residence Details',
        sortOrder: 4,
      },
    ];

    const residenceCertDocs: ServiceDocumentConfig[] = [
      {
        id: 'doc-res-1',
        serviceId: 'srv-residence-cert',
        docTypeKey: 'identity_proof',
        titleEn: 'Aadhaar / Voter ID Card',
        titleTa: 'ஆதார் / வாக்காளர் அடையாள அட்டை',
        descriptionEn: 'Identity proof with applicant photograph',
        descriptionTa: 'விண்ணப்பதாரர் புகைப்பட அடையாள அட்டை',
        isRequired: true,
        allowedFormats: ['PDF', 'JPG', 'JPEG', 'PNG'],
        maxSizeBytes: 5 * 1024 * 1024,
      },
      {
        id: 'doc-res-2',
        serviceId: 'srv-residence-cert',
        docTypeKey: 'address_proof',
        titleEn: 'Ration Card / Smart Card / Utility Bill',
        titleTa: 'குடும்ப அட்டை / மின் கட்டண ரசீது',
        descriptionEn: 'Document reflecting the continuous residence address',
        descriptionTa: 'தொடர் வசிப்பிட முகவரியை காட்டும் ஆவணம்',
        isRequired: true,
        allowedFormats: ['PDF', 'JPG', 'JPEG', 'PNG'],
        maxSizeBytes: 5 * 1024 * 1024,
      },
      {
        id: 'doc-res-3',
        serviceId: 'srv-residence-cert',
        docTypeKey: 'property_tax_receipt',
        titleEn: 'Property Tax Receipt / Registered Rental Agreement',
        titleTa: 'சொத்துவரி ரசீது / வாடகை ஒப்பந்தம்',
        descriptionEn: 'Proof of occupancy for the declared period of residence',
        descriptionTa: 'குடியிருப்புக்கான சொத்துவரி ரசீது அல்லது வாடகை ஒப்பந்தம்',
        isRequired: true,
        allowedFormats: ['PDF', 'JPG', 'JPEG', 'PNG'],
        maxSizeBytes: 5 * 1024 * 1024,
      },
    ];

    const residenceCertRules: ServiceRule[] = [
      {
        id: 'rul-res-1',
        serviceId: 'srv-residence-cert',
        ruleCode: 'RULE_MIN_RESIDENCE_YEARS',
        nameEn: 'Minimum 5 Years Residence Threshold Check',
        nameTa: 'குறைந்தபட்சம் 5 ஆண்டுகள் வசிப்பிட சரிபார்ப்பு',
        fieldKey: 'yearsOfResidence',
        operator: 'gte',
        targetValue: 5,
        severity: 'warning',
        explanationEn: 'State residence certificates typically require continuous local stay of at least 5 years for educational and job quotas.',
        explanationTa: 'மாநில குடியிருப்புச் சான்றிதழுக்கு வழக்கமாக குறைந்தது 5 ஆண்டுகள் தொடர் வசிப்பிடம் தேவை.',
        actionEn: 'Ensure you have valid historical address proof if continuous stay is under 5 years.',
        actionTa: '5 ஆண்டுகளுக்கு குறைவான வசிப்பிடம் எனில் உரிய ஆதாரங்களை இணைக்கவும்.',
        isActive: true,
      },
    ];

    // Student Scholarship Application Service
    const scholarshipFields: ServiceField[] = [
      {
        id: 'fld-sch-1',
        serviceId: 'srv-student-scholarship',
        fieldKey: 'applicantName',
        labelEn: 'Student Full Name',
        labelTa: 'மாணவர் முழுப் பெயர்',
        fieldType: 'text',
        isRequired: true,
        placeholderEn: 'e.g. Abishek Vasanth P',
        placeholderTa: 'எ.கா. அபிஷேக் வசந்த் பி',
        categoryGroup: 'Academic Details',
        sortOrder: 1,
      },
      {
        id: 'fld-sch-2',
        serviceId: 'srv-student-scholarship',
        fieldKey: 'institutionName',
        labelEn: 'College / University / School Name',
        labelTa: 'கல்லூரி / பல்கலைக்கழகம் / பள்ளி பெயர்',
        fieldType: 'text',
        isRequired: true,
        placeholderEn: 'e.g. College of Engineering Guindy, Anna University',
        placeholderTa: 'எ.கா. அண்ணா பல்கலைக்கழகம்',
        categoryGroup: 'Academic Details',
        sortOrder: 2,
      },
      {
        id: 'fld-sch-3',
        serviceId: 'srv-student-scholarship',
        fieldKey: 'currentYearOfStudy',
        labelEn: 'Current Year of Study',
        labelTa: 'தற்போதைய கல்வி ஆண்டு',
        fieldType: 'dropdown',
        isRequired: true,
        options: ['1st Year (Fresher)', '2nd Year', '3rd Year', '4th Year', 'Postgraduate 1st Year', 'Postgraduate 2nd Year'],
        categoryGroup: 'Academic Details',
        sortOrder: 3,
      },
      {
        id: 'fld-sch-4',
        serviceId: 'srv-student-scholarship',
        fieldKey: 'previousMarksPercentage',
        labelEn: 'Previous Academic Year Percentage / Aggregate GPA (%)',
        labelTa: 'முந்தைய ஆண்டின் மதிப்பெண் சதவீதம் (%)',
        fieldType: 'number',
        isRequired: true,
        placeholderEn: 'e.g. 78.5',
        placeholderTa: 'எ.கா. 78.5',
        categoryGroup: 'Academic Details',
        sortOrder: 4,
      },
      {
        id: 'fld-sch-5',
        serviceId: 'srv-student-scholarship',
        fieldKey: 'annualFamilyIncome',
        labelEn: 'Annual Family Income (INR)',
        labelTa: 'குடும்ப ஆண்டு வருமானம் (ரூ.)',
        fieldType: 'number',
        isRequired: true,
        placeholderEn: 'e.g. 150000',
        placeholderTa: 'எ.கா. 150000',
        categoryGroup: 'Financial & Bank',
        sortOrder: 5,
      },
      {
        id: 'fld-sch-6',
        serviceId: 'srv-student-scholarship',
        fieldKey: 'bankAccountNumber',
        labelEn: 'Student Bank Account Number (Active Savings)',
        labelTa: 'மாணவர் வங்கி கணக்கு எண்',
        fieldType: 'text',
        isRequired: true,
        placeholderEn: 'e.g. 10023456789',
        placeholderTa: 'எ.கா. 10023456789',
        categoryGroup: 'Financial & Bank',
        sortOrder: 6,
      },
      {
        id: 'fld-sch-7',
        serviceId: 'srv-student-scholarship',
        fieldKey: 'bankIfscCode',
        labelEn: 'Bank Branch IFSC Code',
        labelTa: 'வங்கி IFSC குறியீடு',
        fieldType: 'text',
        isRequired: true,
        validationRegex: '^[A-Z]{4}0[A-Z0-9]{6}$',
        placeholderEn: 'e.g. SBIN0001234',
        placeholderTa: 'எ.கா. SBIN0001234',
        categoryGroup: 'Financial & Bank',
        sortOrder: 7,
      },
    ];

    const scholarshipDocs: ServiceDocumentConfig[] = [
      {
        id: 'doc-sch-1',
        serviceId: 'srv-student-scholarship',
        docTypeKey: 'student_id_card',
        titleEn: 'College / School Identity Card & Bonafide Certificate',
        titleTa: 'கல்லூரி / பள்ளி அடையாள அட்டை மற்றும் கல்விச் சான்றிதழ்',
        descriptionEn: 'Current year enrollment bonafide signed by Head of Institution',
        descriptionTa: 'நடப்பு கல்வி ஆண்டு சேர்க்கை சான்றிதழ்',
        isRequired: true,
        allowedFormats: ['PDF', 'JPG', 'JPEG', 'PNG'],
        maxSizeBytes: 5 * 1024 * 1024,
      },
      {
        id: 'doc-sch-2',
        serviceId: 'srv-student-scholarship',
        docTypeKey: 'marksheet_proof',
        titleEn: 'Previous Year Marksheet / Grade Transcript',
        titleTa: 'முந்தைய கல்வி ஆண்டு மதிப்பெண் சான்றிதழ்',
        descriptionEn: 'Official semester / board marksheet showing percentage and cleared subjects',
        descriptionTa: 'அதிகாரப்பூர்வ மதிப்பெண் பட்டியல்',
        isRequired: true,
        allowedFormats: ['PDF', 'JPG', 'JPEG', 'PNG'],
        maxSizeBytes: 5 * 1024 * 1024,
      },
      {
        id: 'doc-sch-3',
        serviceId: 'srv-student-scholarship',
        docTypeKey: 'income_proof',
        titleEn: 'Family Income Certificate',
        titleTa: 'குடும்ப வருமானச் சான்றிதழ்',
        descriptionEn: 'Competent revenue authority issued income certificate (valid within 1 year)',
        descriptionTa: 'வட்டாட்சியர் வழங்கிய வருமானச் சான்றிதழ்',
        isRequired: true,
        allowedFormats: ['PDF', 'JPG', 'JPEG', 'PNG'],
        maxSizeBytes: 5 * 1024 * 1024,
      },
      {
        id: 'doc-sch-4',
        serviceId: 'srv-student-scholarship',
        docTypeKey: 'bank_passbook',
        titleEn: 'Bank Passbook First Page / Cancelled Cheque',
        titleTa: 'வங்கி கணக்கு புத்தக முதல் பக்கம்',
        descriptionEn: 'Clear copy displaying student name, account number, and IFSC code',
        descriptionTa: 'மாணவர் பெயர், கணக்கு எண் மற்றும் IFSC குறியீடு தெரியும் பக்கம்',
        isRequired: true,
        allowedFormats: ['PDF', 'JPG', 'JPEG', 'PNG'],
        maxSizeBytes: 5 * 1024 * 1024,
      },
    ];

    const scholarshipRules: ServiceRule[] = [
      {
        id: 'rul-sch-1',
        serviceId: 'srv-student-scholarship',
        ruleCode: 'RULE_MIN_MARKS_THRESHOLD',
        nameEn: 'Minimum Academic Marks (60%) Eligibility Check',
        nameTa: 'குறைந்தபட்சம் 60% மதிப்பெண் தகுதி சரிபார்ப்பு',
        fieldKey: 'previousMarksPercentage',
        operator: 'gte',
        targetValue: 60,
        severity: 'critical',
        explanationEn: 'Merit-cum-means scholarships require a minimum of 60% marks in the preceding academic qualifying examination.',
        explanationTa: 'கல்வி உதவித்தொகை பெற முந்தைய தேர்வில் குறைந்தபட்சம் 60% மதிப்பெண் பெற்றிருக்க வேண்டும்.',
        actionEn: 'Verify your percentage against the official transcript.',
        actionTa: 'மதிப்பெண் சதவீதத்தை சான்றிதழுடன் சரிபார்க்கவும்.',
        isActive: true,
      },
      {
        id: 'rul-sch-2',
        serviceId: 'srv-student-scholarship',
        ruleCode: 'RULE_SCHOLARSHIP_INCOME_CEILING',
        nameEn: 'Income Ceiling Limit Check (Max INR 2,50,000)',
        nameTa: 'அதிகபட்ச வருமான வரம்பு சரிபார்ப்பு (ரூ. 2,50,000)',
        fieldKey: 'annualFamilyIncome',
        operator: 'lte',
        targetValue: 250000,
        severity: 'critical',
        explanationEn: 'Family income must not exceed INR 2,50,000 per annum for government scholarship eligibility.',
        explanationTa: 'அரசு உதவித்தொகை பெற ஆண்டு குடும்ப வருமானம் ரூ. 2,50,000-க்கு மிகாமல் இருக்க வேண்டும்.',
        actionEn: 'Ensure declared income matches the uploaded revenue income certificate.',
        actionTa: 'வருமான சான்றிதழில் உள்ள தொகையை உள்ளிடவும்.',
        isActive: true,
      },
      {
        id: 'rul-sch-3',
        serviceId: 'srv-student-scholarship',
        ruleCode: 'RULE_IFSC_CODE_FORMAT',
        nameEn: 'Bank IFSC 11-Character Format Check',
        nameTa: 'வங்கி IFSC குறியீடு வடிவம்',
        fieldKey: 'bankIfscCode',
        operator: 'regex_match',
        targetValue: '^[A-Z]{4}0[A-Z0-9]{6}$',
        severity: 'critical',
        explanationEn: 'Bank IFSC code must be 11 characters starting with 4 alphabets, 5th character 0, followed by 6 alphanumeric characters.',
        explanationTa: 'IFSC குறியீடு 11 எழுத்துக்களைக் கொண்டிருக்க வேண்டும்.',
        actionEn: 'Check bank passbook first page for correct IFSC code.',
        actionTa: 'வங்கி கணக்கு புத்தகத்தில் உள்ள IFSC குறியீட்டை சரிபார்க்கவும்.',
        isActive: true,
      },
    ];

    this.services = [
      {
        id: 'srv-income-cert',
        code: 'REV-INC-01',
        nameEn: 'Income Certificate',
        nameTa: 'வருமானச் சான்றிதழ்',
        descriptionEn: 'Official revenue document certifying annual family income from all legal sources, required for scholarships, welfare subsidies, and reservation benefits.',
        descriptionTa: 'குடும்பத்தின் மொத்த ஆண்டு வருமானத்தை உறுதிப்படுத்தும் வருவாய்த் துறை சான்றிதழ்.',
        category: 'Certificates',
        requiredDocCount: 3,
        basicEligibilitySummaryEn: 'Resident citizens with identifiable revenue sources and valid local address proof.',
        basicEligibilitySummaryTa: 'செல்லுபடியாகும் முகவரி மற்றும் வருமான ஆதாரம் கொண்ட குடிமக்கள்.',
        whoMayApplyEn: 'Any head of family or applicant seeking admission, fee concession, or government subsidy.',
        whoMayApplyTa: 'கல்வி கட்டணச் சலுகை அல்லது அரசு உதவி பெற விரும்பும் குடிமக்கள்.',
        requiredInfoEn: 'Applicant Aadhaar, Family members income details, Ration card number, Permanent address.',
        requiredInfoTa: 'ஆதார் எண், குடும்ப வருமான விவரங்கள், ரேஷன் அட்டை எண், நிரந்தர முகவரி.',
        generalNotesEn: 'Ensure family income from all sources is declared. Misrepresentation may result in inquiry rejection.',
        generalNotesTa: 'அனைத்து வருமான ஆதாரங்களையும் முறையாக தெரிவிக்கவும்.',
        disclaimerEn: 'Configured demo service criteria. Final issuance authority belongs to Taluk Revenue Department.',
        disclaimerTa: 'மாதிரி சேவை கட்டமைப்பு. இறுதி ஒப்புதல் வட்டாட்சியர் அலுவலகத்திற்கு உட்பட்டது.',
        version: 'v2.4',
        active: true,
        lastUpdated: '2026-02-10T11:00:00.000Z',
        fields: incomeCertFields,
        documents: incomeCertDocs,
        rules: incomeCertRules,
      },
      {
        id: 'srv-community-cert',
        code: 'REV-COMM-02',
        nameEn: 'Community Certificate',
        nameTa: 'சாதிச் சான்றிதழ்',
        descriptionEn: 'Statutory certificate verifying the constitutional category (SC/ST/MBC/BC/BCM) and sub-caste for educational admissions and job reservations.',
        descriptionTa: 'கல்வி மற்றும் அரசு பணிகளுக்கான இடஒதுக்கீடு பெற சமூகப் பிரிவை உறுதிப்படுத்தும் சான்றிதழ்.',
        category: 'Certificates',
        requiredDocCount: 3,
        basicEligibilitySummaryEn: 'Permanent residents with verifiable parental caste records or school transfer certificates.',
        basicEligibilitySummaryTa: 'பெற்றோர் சாதிச் சான்றிதழ் அல்லது பள்ளி மாற்றுச் சான்றிதழ் உள்ளவர்கள்.',
        whoMayApplyEn: 'Students and citizens belonging to recognised community schedules in the state.',
        whoMayApplyTa: 'அரசு அட்டவணையில் உள்ள சமூகத்தைச் சார்ந்த குடிமக்கள் மற்றும் மாணவர்கள்.',
        requiredInfoEn: "Applicant full name, Father's and Mother's name, Sub-caste, School TC number.",
        requiredInfoTa: 'பெயர், தந்தை/தாய் பெயர், சாதி உட்பிரிவு, பள்ளி மாற்றுச் சான்றிதழ் எண்.',
        generalNotesEn: "Sub-caste spelling must strictly match the state gazette list.",
        generalNotesTa: 'சாதிப் பிரிவு அரசு கெசட் பட்டியலுடன் பொருந்த வேண்டும்.',
        disclaimerEn: 'Configured demo service criteria. Official community classification subject to Tehsildar verification.',
        disclaimerTa: 'மாதிரி சேவை கட்டமைப்பு. இறுதி ஒப்புதல் வட்டாட்சியருக்கு உட்பட்டது.',
        version: 'v2.1',
        active: true,
        lastUpdated: '2026-01-20T08:30:00.000Z',
        fields: communityCertFields,
        documents: communityCertDocs,
        rules: communityCertRules,
      },
      {
        id: 'srv-residence-cert',
        code: 'REV-RES-03',
        nameEn: 'Residence / Domicile Certificate',
        nameTa: 'இருப்பிடச் சான்றிதழ்',
        descriptionEn: 'Certificate proving continuous residential domicile in the state/district for official educational, employment, and electoral purposes.',
        descriptionTa: 'மாநிலத்தில் குறிப்பிட்ட பகுதியில் வசிப்பதை உறுதிப்படுத்தும் சான்றிதழ்.',
        category: 'Revenue',
        requiredDocCount: 3,
        basicEligibilitySummaryEn: 'Residents residing at the declared address continuously for at least 5 years.',
        basicEligibilitySummaryTa: 'குறிப்பிட்ட முகவரியில் 5 ஆண்டுகளுக்கு மேல் வசிப்பவர்கள்.',
        whoMayApplyEn: 'Citizens requiring proof of domicile for state examinations, housing allotments, and welfare schemes.',
        whoMayApplyTa: 'மாநிலத் தேர்வுகள் மற்றும் நலத்திட்டங்களுக்கு இருப்பிடச் சான்று தேவைப்படும் குடிமக்கள்.',
        requiredInfoEn: 'Continuous years of stay, Full residential address, Property tax or Rental documentation.',
        requiredInfoTa: 'வசிப்பிட ஆண்டுகள், முழு முகவரி, சொத்துவரி அல்லது வாடகை ஆவணங்கள்.',
        generalNotesEn: 'Electricity bills must be in applicant or parent name.',
        generalNotesTa: 'மின்கட்டண ரசீது விண்ணப்பதாரர் அல்லது பெற்றோர் பெயரில் இருக்க வேண்டும்.',
        disclaimerEn: 'Configured demo criteria. Local Revenue Inspector field inquiry is mandatory for official certificate.',
        disclaimerTa: 'மாதிரி கட்டமைப்பு. அரசு ஆய்வாளர் நேரடி விசாரணைக்கு உட்பட்டது.',
        version: 'v1.8',
        active: true,
        lastUpdated: '2026-02-01T15:00:00.000Z',
        fields: residenceCertFields,
        documents: residenceCertDocs,
        rules: residenceCertRules,
      },
      {
        id: 'srv-student-scholarship',
        code: 'EDU-SCH-04',
        nameEn: 'Post-Matric Student Scholarship',
        nameTa: 'மாணவர் கல்வி உதவித்தொகை',
        descriptionEn: 'Direct financial benefit transfer scheme for students pursuing higher education in accredited colleges and universities.',
        descriptionTa: 'உயர் கல்வி பயிலும் மாணவர்களுக்கான அரசு கல்வி உதவித்தொகை திட்டம்.',
        category: 'Education',
        requiredDocCount: 4,
        basicEligibilitySummaryEn: 'Regular full-time students with >= 60% marks and family income <= INR 2,50,000.',
        basicEligibilitySummaryTa: '60% மேல் மதிப்பெண் மற்றும் ரூ. 2.5 லட்சத்திற்குள் வருமானம் கொண்ட மாணவர்கள்.',
        whoMayApplyEn: 'Enrolled diploma, undergraduate, and postgraduate students in recognized institutions.',
        whoMayApplyTa: 'அங்கீகரிக்கப்பட்ட கல்லூரிகளில் பயிலும் மாணவர்கள்.',
        requiredInfoEn: 'College bonafide, Previous exam marks %, Bank account & IFSC code, Annual income.',
        requiredInfoTa: 'கல்லூரி சேர்க்கை சான்று, மதிப்பெண் %, வங்கி கணக்கு மற்றும் IFSC, குடும்ப வருமானம்.',
        generalNotesEn: 'Bank account must be Aadhaar-seeded for direct benefit transfer (DBT).',
        generalNotesTa: 'வங்கி கணக்கு ஆதாருடன் இணைக்கப்பட்டிருக்க வேண்டும்.',
        disclaimerEn: 'Configured demo criteria. State Scholarship Portal rules apply upon official portal submission.',
        disclaimerTa: 'மாதிரி கட்டமைப்பு. அரசு உதவித்தொகை இணையதள விதிகளுக்கு உட்பட்டது.',
        version: 'v3.0',
        active: true,
        lastUpdated: '2026-02-14T10:00:00.000Z',
        fields: scholarshipFields,
        documents: scholarshipDocs,
        rules: scholarshipRules,
      },
    ];

    // 3. Seed Demo Applications for test scenarios
    this.seedDemoApplications();
  }

  private seedDemoApplications() {
    // Scenario 1: Clean Application (LOW RISK - Ready for review)
    const app1: Application = {
      id: 'app-demo-clean',
      citizenId: 'usr-citizen-1',
      citizenName: 'Abishek Vasanth P',
      citizenEmail: 'citizen@example.com',
      serviceId: 'srv-income-cert',
      serviceCode: 'REV-INC-01',
      serviceNameEn: 'Income Certificate',
      serviceNameTa: 'வருமானச் சான்றிதழ்',
      serviceVersion: 'v2.4',
      applicationNumber: 'GC-2026-8801',
      status: 'READY_FOR_REVIEW',
      dynamicFormData: {
        applicantName: 'Abishek Vasanth P',
        fatherOrSpouseName: 'Periyasamy K',
        dob: '1998-05-14',
        aadhaarNumber: '9845 1234 5678',
        annualFamilyIncome: 140000,
        incomeSource: 'Salaried (Private)',
        residentialAddress: 'No. 45, Bharathiyar Street, Anna Nagar, Chennai, Tamil Nadu 600040',
        rationCardNumber: '33/02/W/0987123',
      },
      uploadedDocuments: [
        {
          id: 'doc-up-101',
          applicationId: 'app-demo-clean',
          docTypeKey: 'identity_proof',
          fileName: 'aadhaar_card_abishek.pdf',
          fileType: 'application/pdf',
          fileSize: 420000,
          status: 'ANALYZED',
          uploadedAt: '2026-08-10T11:00:00.000Z',
          extractions: {
            documentType: 'identity_proof',
            confidence: 0.96,
            readability: 'good',
            extractedFields: {
              name: 'Abishek Vasanth P',
              dob: '14/05/1998',
              docNumber: '9845 1234 5678',
              address: 'No. 45, Bharathiyar Street, Anna Nagar, Chennai 600040',
            },
            warnings: [],
          },
        },
        {
          id: 'doc-up-102',
          applicationId: 'app-demo-clean',
          docTypeKey: 'address_proof',
          fileName: 'ration_card_smart.jpg',
          fileType: 'image/jpeg',
          fileSize: 650000,
          status: 'ANALYZED',
          uploadedAt: '2026-08-10T11:02:00.000Z',
          extractions: {
            documentType: 'address_proof',
            confidence: 0.94,
            readability: 'good',
            extractedFields: {
              headName: 'Periyasamy K',
              memberNames: 'Abishek Vasanth P, Malathi P',
              cardNo: '33/02/W/0987123',
              address: 'No. 45, Bharathiyar Street, Anna Nagar, Chennai 600040',
            },
            warnings: [],
          },
        },
        {
          id: 'doc-up-103',
          applicationId: 'app-demo-clean',
          docTypeKey: 'income_proof',
          fileName: 'salary_slip_recent.pdf',
          fileType: 'application/pdf',
          fileSize: 310000,
          status: 'ANALYZED',
          uploadedAt: '2026-08-10T11:05:00.000Z',
          extractions: {
            documentType: 'income_proof',
            confidence: 0.92,
            readability: 'good',
            extractedFields: {
              employeeName: 'Abishek Vasanth P',
              monthlySalary: 11666,
              annualGross: 140000,
              employer: 'Alpha Tech Solutions Pvt Ltd',
            },
            warnings: [],
          },
        },
      ],
      currentAssessment: {
        score: 4,
        level: 'LOW',
        breakdown: {
          documentCompleteness: 0,
          informationConsistency: 2,
          requiredFields: 0,
          configuredRules: 2,
        },
        completenessStatus: 'PASS',
        consistencyStatus: 'PASS',
        ruleCheckStatus: 'PASS',
        qualityStatus: 'PASS',
        summaryEn: 'Excellent application readiness. All 3 required documents are present, high scan readability, and consistent personal particulars across application and identity records.',
        summaryTa: 'சிறந்த விண்ணப்பத் தயாரிப்பு. தேவையான அனைத்து ஆவணங்களும் உள்ளன, தெளிவான ஆவணத் தரம் மற்றும் பெயர்கள் சரியாகப் பொருந்துகின்றன.',
        recommendedActions: [
          'Review final PDF report summary.',
          'Proceed to the official government e-Sevai / Revenue portal for final authorized submission.',
        ],
      },
      currentIssues: [],
      verificationRuns: [
        {
          id: 'run-101',
          applicationId: 'app-demo-clean',
          runNumber: 1,
          triggerType: 'INITIAL',
          runAt: '2026-08-10T11:10:00.000Z',
          riskAssessment: {
            score: 4,
            level: 'LOW',
            breakdown: {
              documentCompleteness: 0,
              informationConsistency: 2,
              requiredFields: 0,
              configuredRules: 2,
            },
            completenessStatus: 'PASS',
            consistencyStatus: 'PASS',
            ruleCheckStatus: 'PASS',
            qualityStatus: 'PASS',
            summaryEn: 'All required documents verified with high consistency.',
            summaryTa: 'அனைத்து ஆவணங்களும் சரிபார்க்கப்பட்டன.',
            recommendedActions: ['Proceed to official submission.'],
          },
          issues: [],
        },
      ],
      createdAt: '2026-08-10T10:45:00.000Z',
      updatedAt: '2026-08-10T11:10:00.000Z',
      lastVerifiedAt: '2026-08-10T11:10:00.000Z',
    };

    // Scenario 2: Missing Document Scenario (Income Proof Missing)
    const app2: Application = {
      id: 'app-demo-missing-doc',
      citizenId: 'usr-citizen-1',
      citizenName: 'Abishek Vasanth P',
      citizenEmail: 'citizen@example.com',
      serviceId: 'srv-income-cert',
      serviceCode: 'REV-INC-01',
      serviceNameEn: 'Income Certificate',
      serviceNameTa: 'வருமானச் சான்றிதழ்',
      serviceVersion: 'v2.4',
      applicationNumber: 'GC-2026-8802',
      status: 'CORRECTION_REQUIRED',
      dynamicFormData: {
        applicantName: 'Abishek Vasanth P',
        fatherOrSpouseName: 'Periyasamy K',
        dob: '1998-05-14',
        aadhaarNumber: '9845 1234 5678',
        annualFamilyIncome: 180000,
        incomeSource: 'Salaried (Private)',
        residentialAddress: 'No. 45, Bharathiyar Street, Anna Nagar, Chennai 600040',
      },
      uploadedDocuments: [
        {
          id: 'doc-up-201',
          applicationId: 'app-demo-missing-doc',
          docTypeKey: 'identity_proof',
          fileName: 'aadhaar_card.pdf',
          fileType: 'application/pdf',
          fileSize: 420000,
          status: 'ANALYZED',
          uploadedAt: '2026-08-12T09:00:00.000Z',
          extractions: {
            documentType: 'identity_proof',
            confidence: 0.95,
            readability: 'good',
            extractedFields: {
              name: 'Abishek Vasanth P',
              dob: '14/05/1998',
            },
            warnings: [],
          },
        },
        {
          id: 'doc-up-202',
          applicationId: 'app-demo-missing-doc',
          docTypeKey: 'address_proof',
          fileName: 'eb_bill_current.jpg',
          fileType: 'image/jpeg',
          fileSize: 520000,
          status: 'ANALYZED',
          uploadedAt: '2026-08-12T09:02:00.000Z',
          extractions: {
            documentType: 'address_proof',
            confidence: 0.90,
            readability: 'good',
            extractedFields: {
              consumerName: 'Periyasamy K',
              address: 'No. 45, Bharathiyar Street, Anna Nagar, Chennai 600040',
            },
            warnings: [],
          },
        },
      ],
      currentAssessment: {
        score: 35,
        level: 'MEDIUM',
        breakdown: {
          documentCompleteness: 30,
          informationConsistency: 2,
          requiredFields: 0,
          configuredRules: 3,
        },
        completenessStatus: 'FAIL',
        consistencyStatus: 'PASS',
        ruleCheckStatus: 'PASS',
        qualityStatus: 'PASS',
        summaryEn: 'Missing mandatory Income Proof document. Revenue authorities cannot verify your declared annual income of INR 1,80,000 without supporting salary slip, Form 16, or VAO certificate.',
        summaryTa: 'கட்டாய வருமானச் சான்று விடுபட்டுள்ளது. உங்கள் வருமானத்திற்கான ஆதரவு ஆவணத்தை பதிவேற்றவும்.',
        recommendedActions: [
          'Upload recent salary slip, IT returns, or Village VAO income inquiry report.',
          'Re-run verification engine to recalculate risk score.',
        ],
      },
      currentIssues: [
        {
          id: 'iss-201',
          issueType: 'MISSING_DOC',
          severity: 'critical',
          whatEn: 'Mandatory Income Proof Document is Missing',
          whatTa: 'கட்டாய வருமானச் சான்று விடுபட்டுள்ளது',
          whyEn: 'Service configuration specifies that an Income Proof (Salary slip, IT return, or VAO report) is required to substantiate declared earnings.',
          whyTa: 'வருமானச் சான்றிதழ் பெற வருமானத்திற்கான ஆதார ஆவணம் கட்டாயமாகும்.',
          actionEn: 'Upload a valid income document under the Income Proof checklist slot in Correction Center.',
          actionTa: 'வருமானச் சான்று பகுதியில் ஆவணத்தை பதிவேற்றவும்.',
          source: 'Service Document Checklist: Income Proof',
          docTypeKey: 'income_proof',
          status: 'OPEN',
        },
      ],
      verificationRuns: [],
      createdAt: '2026-08-12T08:50:00.000Z',
      updatedAt: '2026-08-12T09:05:00.000Z',
      lastVerifiedAt: '2026-08-12T09:05:00.000Z',
    };

    // Scenario 3: Name Mismatch Scenario (Abishek Vasanth P vs Abishek Vasanthan)
    const app3: Application = {
      id: 'app-demo-name-mismatch',
      citizenId: 'usr-citizen-1',
      citizenName: 'Abishek Vasanth P',
      citizenEmail: 'citizen@example.com',
      serviceId: 'srv-student-scholarship',
      serviceCode: 'EDU-SCH-04',
      serviceNameEn: 'Post-Matric Student Scholarship',
      serviceNameTa: 'மாணவர் கல்வி உதவித்தொகை',
      serviceVersion: 'v3.0',
      applicationNumber: 'GC-2026-8803',
      status: 'CORRECTION_REQUIRED',
      dynamicFormData: {
        applicantName: 'Abishek Vasanthan P',
        institutionName: 'College of Engineering Guindy',
        currentYearOfStudy: '3rd Year',
        previousMarksPercentage: 82.4,
        annualFamilyIncome: 120000,
        bankAccountNumber: '10045678901',
        bankIfscCode: 'SBIN0001234',
      },
      uploadedDocuments: [
        {
          id: 'doc-up-301',
          applicationId: 'app-demo-name-mismatch',
          docTypeKey: 'student_id_card',
          fileName: 'college_id.jpg',
          fileType: 'image/jpeg',
          fileSize: 380000,
          status: 'ANALYZED',
          uploadedAt: '2026-08-14T10:00:00.000Z',
          extractions: {
            documentType: 'student_id_card',
            confidence: 0.94,
            readability: 'good',
            extractedFields: {
              studentName: 'Abishek Vasanth P',
              rollNo: '2022103045',
              institution: 'College of Engineering Guindy',
            },
            warnings: [],
          },
        },
        {
          id: 'doc-up-302',
          applicationId: 'app-demo-name-mismatch',
          docTypeKey: 'marksheet_proof',
          fileName: 'sem4_marksheet.pdf',
          fileType: 'application/pdf',
          fileSize: 510000,
          status: 'ANALYZED',
          uploadedAt: '2026-08-14T10:02:00.000Z',
          extractions: {
            documentType: 'marksheet_proof',
            confidence: 0.91,
            readability: 'good',
            extractedFields: {
              name: 'Abishek Vasanth P',
              percentage: 82.4,
              result: 'FIRST CLASS WITH DISTINCTION',
            },
            warnings: [],
          },
        },
        {
          id: 'doc-up-303',
          applicationId: 'app-demo-name-mismatch',
          docTypeKey: 'income_proof',
          fileName: 'income_certificate_signed.pdf',
          fileType: 'application/pdf',
          fileSize: 450000,
          status: 'ANALYZED',
          uploadedAt: '2026-08-14T10:04:00.000Z',
          extractions: {
            documentType: 'income_proof',
            confidence: 0.93,
            readability: 'good',
            extractedFields: {
              applicantName: 'Abishek Vasanth P',
              annualIncome: 120000,
            },
            warnings: [],
          },
        },
        {
          id: 'doc-up-304',
          applicationId: 'app-demo-name-mismatch',
          docTypeKey: 'bank_passbook',
          fileName: 'sbi_passbook.jpg',
          fileType: 'image/jpeg',
          fileSize: 620000,
          status: 'ANALYZED',
          uploadedAt: '2026-08-14T10:06:00.000Z',
          extractions: {
            documentType: 'bank_passbook',
            confidence: 0.89,
            readability: 'good',
            extractedFields: {
              accountHolder: 'Abishek Vasanthan',
              accountNo: '10045678901',
              ifsc: 'SBIN0001234',
            },
            warnings: [],
          },
        },
      ],
      currentAssessment: {
        score: 38,
        level: 'MEDIUM',
        breakdown: {
          documentCompleteness: 0,
          informationConsistency: 22,
          requiredFields: 0,
          configuredRules: 16,
        },
        completenessStatus: 'PASS',
        consistencyStatus: 'WARNING',
        ruleCheckStatus: 'PASS',
        qualityStatus: 'PASS',
        summaryEn: 'Potential Name Mismatch Detected across application and uploaded academic ID documents ("Abishek Vasanthan P" vs "Abishek Vasanth P"). Government Direct Benefit Transfer (DBT) requires strict name correspondence.',
        summaryTa: 'விண்ணப்பத்திற்கும் ஆவணங்களுக்கும் இடையே பெயரில் சிறு முரண்பாடு உள்ளது ("Abishek Vasanthan P" vs "Abishek Vasanth P"). இதனை சரிபார்க்கவும்.',
        recommendedActions: [
          'Verify student name spelling against College ID and Bank Passbook.',
          'Edit applicant name in form or provide name gazette / affidavit if variation is official.',
        ],
      },
      currentIssues: [
        {
          id: 'iss-301',
          issueType: 'NAME_MISMATCH',
          severity: 'warning',
          whatEn: 'Potential Name Spelling Discrepancy',
          whatTa: 'பெயர் எழுத்துப் பிழை அல்லது முரண்பாடு',
          whyEn: 'Application form states "Abishek Vasanthan P", while uploaded College ID & Marksheet record "Abishek Vasanth P". DBT scholarship transfers may fail at bank verification.',
          whyTa: 'விண்ணப்பத்தில் உள்ள பெயரும் கல்லூரி அடையாள அட்டையில் உள்ள பெயரும் சிறிதளவு வேறுபடுகிறது.',
          actionEn: 'Align your application name with your official college marksheet and identity card.',
          actionTa: 'மதிப்பெண் சான்றிதழில் உள்ளவாறு பெயரை திருத்தவும்.',
          source: 'Form (Abishek Vasanthan P) vs College ID (Abishek Vasanth P)',
          fieldKey: 'applicantName',
          docTypeKey: 'student_id_card',
          status: 'OPEN',
        },
      ],
      verificationRuns: [],
      createdAt: '2026-08-14T09:40:00.000Z',
      updatedAt: '2026-08-14T10:10:00.000Z',
      lastVerifiedAt: '2026-08-14T10:10:00.000Z',
    };

    // Scenario 4: High Risk Multiple Issues Scenario
    const app4: Application = {
      id: 'app-demo-multi-issue',
      citizenId: 'usr-citizen-1',
      citizenName: 'Abishek Vasanth P',
      citizenEmail: 'citizen@example.com',
      serviceId: 'srv-student-scholarship',
      serviceCode: 'EDU-SCH-04',
      serviceNameEn: 'Post-Matric Student Scholarship',
      serviceNameTa: 'மாணவர் கல்வி உதவித்தொகை',
      serviceVersion: 'v3.0',
      applicationNumber: 'GC-2026-8804',
      status: 'CORRECTION_REQUIRED',
      dynamicFormData: {
        applicantName: 'Abishek Vasanth',
        institutionName: 'Anna University',
        currentYearOfStudy: '2nd Year',
        previousMarksPercentage: 54.0, // Fails 60% rule
        annualFamilyIncome: 320000, // Fails 2,50,000 ceiling rule
        bankAccountNumber: '9901234',
        bankIfscCode: 'INVALID_IFSC_1', // Fails IFSC regex
      },
      uploadedDocuments: [
        {
          id: 'doc-up-401',
          applicationId: 'app-demo-multi-issue',
          docTypeKey: 'student_id_card',
          fileName: 'blurry_id.jpg',
          fileType: 'image/jpeg',
          fileSize: 180000,
          status: 'ANALYZED',
          uploadedAt: '2026-08-16T14:00:00.000Z',
          extractions: {
            documentType: 'student_id_card',
            confidence: 0.65,
            readability: 'poor',
            extractedFields: {
              studentName: 'Abishek Vasanth',
            },
            warnings: ['Image blur detected on institutional seal and roll number.'],
            qualityIssues: ['Low resolution / motion blur', 'Institutional stamp partially obscured'],
          },
        },
      ],
      currentAssessment: {
        score: 72,
        level: 'HIGH',
        breakdown: {
          documentCompleteness: 22,
          informationConsistency: 15,
          requiredFields: 10,
          configuredRules: 25,
        },
        completenessStatus: 'FAIL',
        consistencyStatus: 'WARNING',
        ruleCheckStatus: 'FAIL',
        qualityStatus: 'FAIL',
        summaryEn: 'Significant application discrepancies detected. Academic percentage (54%) is below minimum eligibility (60%), income exceeds scholarship ceiling, IFSC format is invalid, and 3 required documents are missing.',
        summaryTa: 'முக்கிய விதி மற்றும் ஆவண முரண்பாடுகள் கண்டறியப்பட்டன. மதிப்பெண் தகுதி (60% கீழ் உள்ளது), வருமான வரம்பு மற்றும் ஆவணங்கள் விடுபட்டுள்ளன.',
        recommendedActions: [
          'Review minimum eligibility criteria (60% marks and income under INR 2,50,000).',
          'Upload clear, unblurred copies of College Bonafide, Marksheet, and Income Certificate.',
          'Provide a valid 11-character bank IFSC code.',
        ],
      },
      currentIssues: [
        {
          id: 'iss-401',
          issueType: 'RULE_VIOLATION',
          severity: 'critical',
          whatEn: 'Academic Marks Below Minimum 60% Requirement',
          whatTa: 'மதிப்பெண் குறைந்தபட்ச 60% தகுதிக்கு குறைவாக உள்ளது',
          whyEn: 'Scheme guidelines require >= 60% aggregate marks in the preceding qualifying examination.',
          whyTa: 'திட்ட விதிகளின்படி முந்தைய தேர்வில் 60% மதிப்பெண் கட்டாயம்.',
          actionEn: 'Verify if your CGPA conversion was calculated accurately.',
          actionTa: 'மதிப்பெண் சதவீதத்தை மீண்டும் சரிபார்க்கவும்.',
          source: 'Rule Engine: RULE_MIN_MARKS_THRESHOLD (Entered: 54%)',
          fieldKey: 'previousMarksPercentage',
          status: 'OPEN',
        },
        {
          id: 'iss-402',
          issueType: 'RULE_VIOLATION',
          severity: 'critical',
          whatEn: 'Annual Income Exceeds Eligibility Ceiling (INR 2,50,000)',
          whatTa: 'வருமானம் உதவித்தொகை உச்சவரம்பை (ரூ. 2.5 லட்சம்) தாண்டியுள்ளது',
          whyEn: 'Configured criteria limits family income to INR 2,50,000 per annum for government fee reimbursement.',
          whyTa: 'அரசு உதவித்தொகை பெற ஆண்டு வருமானம் ரூ. 2,50,000-க்குள் இருக்க வேண்டும்.',
          actionEn: 'Ensure declared income matches the authorized Tehsildar revenue certificate.',
          actionTa: 'வருமானச் சான்றிதழில் உள்ள உண்மையான வருமானத்தை உள்ளிடவும்.',
          source: 'Rule Engine: RULE_SCHOLARSHIP_INCOME_CEILING (Entered: INR 3,20,000)',
          fieldKey: 'annualFamilyIncome',
          status: 'OPEN',
        },
        {
          id: 'iss-403',
          issueType: 'MISSING_DOC',
          severity: 'critical',
          whatEn: 'Missing Marksheet & Income Proof Documents',
          whatTa: 'மதிப்பெண் மற்றும் வருமானச் சான்றுகள் விடுபட்டுள்ளன',
          whyEn: 'Required verification documents have not been uploaded yet.',
          whyTa: 'தேவையான சான்றுகள் இன்னும் பதிவேற்றப்படவில்லை.',
          actionEn: 'Upload required documents in the Correction Center.',
          actionTa: 'திருத்தும் மையத்தில் ஆவணங்களை பதிவேற்றவும்.',
          source: 'Document Checklist',
          docTypeKey: 'marksheet_proof',
          status: 'OPEN',
        },
        {
          id: 'iss-404',
          issueType: 'QUALITY_ISSUE',
          severity: 'warning',
          whatEn: 'Poor Document Scan Readability (Blur Detected)',
          whatTa: 'ஆவணத் தரம் குறைவாக உள்ளது (தெளிவின்மை)',
          whyEn: 'The uploaded College ID image is blurry, preventing reliable text and stamp verification.',
          whyTa: 'பதிவேற்றிய ஆவணம் மங்கலாக உள்ளது.',
          actionEn: 'Upload a higher resolution, well-lit scan or photograph.',
          actionTa: 'தெளிவான புகைப்படத்தை மீண்டும் பதிவேற்றவும்.',
          source: 'College ID Document Analyzer',
          docTypeKey: 'student_id_card',
          status: 'OPEN',
        },
      ],
      verificationRuns: [],
      createdAt: '2026-08-16T13:30:00.000Z',
      updatedAt: '2026-08-16T14:15:00.000Z',
      lastVerifiedAt: '2026-08-16T14:15:00.000Z',
    };

    this.applications = [app1, app2, app3, app4];

    // Seed sample audit logs
    this.auditLogs = [
      {
        id: 'aud-001',
        userId: 'usr-citizen-1',
        userRole: 'citizen',
        action: 'VERIFICATION_COMPLETED',
        entityType: 'Application',
        entityId: 'app-demo-clean',
        metadata: { serviceCode: 'REV-INC-01', riskLevel: 'LOW', score: 4 },
        timestamp: '2026-08-10T11:10:00.000Z',
      },
      {
        id: 'aud-002',
        userId: 'usr-admin-1',
        userRole: 'admin',
        action: 'SERVICE_RULE_UPDATED',
        entityType: 'Service',
        entityId: 'srv-income-cert',
        metadata: { version: 'v2.4', rule: 'RULE_SUBSIDY_LIMIT_WARNING' },
        timestamp: '2026-08-11T16:00:00.000Z',
      },
      {
        id: 'aud-003',
        userId: 'usr-citizen-1',
        userRole: 'citizen',
        action: 'VERIFICATION_COMPLETED',
        entityType: 'Application',
        entityId: 'app-demo-name-mismatch',
        metadata: { serviceCode: 'EDU-SCH-04', riskLevel: 'MEDIUM', score: 38 },
        timestamp: '2026-08-14T10:10:00.000Z',
      },
    ];

    // Seed sample notifications
    this.notifications = [
      {
        id: 'notif-001',
        userId: 'usr-citizen-1',
        titleEn: 'Pre-Verification Ready: Income Certificate',
        titleTa: 'முன்-சரிபார்ப்பு தயார்: வருமானச் சான்றிதழ்',
        messageEn: 'Your application GC-2026-8801 has passed all pre-checks with LOW risk. You can now download the PDF report.',
        messageTa: 'உங்கள் விண்ணப்பம் GC-2026-8801 குறைந்த அபாயத்துடன் சரிபார்க்கப்பட்டது.',
        type: 'success',
        isRead: false,
        createdAt: '2026-08-10T11:11:00.000Z',
        linkTo: 'app-demo-clean',
      },
      {
        id: 'notif-002',
        userId: 'usr-citizen-1',
        titleEn: 'Correction Required: Student Scholarship',
        titleTa: 'திருத்தம் தேவை: மாணவர் கல்வி உதவித்தொகை',
        messageEn: 'Potential Name Mismatch detected on application GC-2026-8803. Please review in the Correction Center.',
        messageTa: 'விண்ணப்பம் GC-2026-8803 இல் பெயர் முரண்பாடு உள்ளது. திருத்தும் மையத்தில் சரிசெய்யவும்.',
        type: 'warning',
        isRead: false,
        createdAt: '2026-08-14T10:11:00.000Z',
        linkTo: 'app-demo-name-mismatch',
      },
    ];
  }

  // --- User Methods ---
  findUserByEmail(email: string) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string) {
    return this.users.find(u => u.id === id);
  }

  createUser(userData: Omit<User, 'id' | 'createdAt'> & { password: string }) {
    const newUser: User & { passwordHash: string } = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      role: userData.role || 'citizen',
      preferredLanguage: userData.preferredLanguage || 'en',
      passwordHash: hashPassword(userData.password),
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // --- Service Methods ---
  getAllServices() {
    return this.services;
  }

  getServiceById(id: string) {
    return this.services.find(s => s.id === id || s.code.toLowerCase() === id.toLowerCase());
  }

  createService(serviceData: Partial<GovService>) {
    const newService: GovService = {
      id: `srv-${Date.now()}`,
      code: serviceData.code || `SRV-${Date.now().toString().slice(-4)}`,
      nameEn: serviceData.nameEn || 'New Government Service',
      nameTa: serviceData.nameTa || 'புதிய அரசு சேவை',
      descriptionEn: serviceData.descriptionEn || '',
      descriptionTa: serviceData.descriptionTa || '',
      category: serviceData.category || 'Certificates',
      requiredDocCount: serviceData.documents ? serviceData.documents.filter(d => d.isRequired).length : 2,
      basicEligibilitySummaryEn: serviceData.basicEligibilitySummaryEn || '',
      basicEligibilitySummaryTa: serviceData.basicEligibilitySummaryTa || '',
      whoMayApplyEn: serviceData.whoMayApplyEn || '',
      whoMayApplyTa: serviceData.whoMayApplyTa || '',
      requiredInfoEn: serviceData.requiredInfoEn || '',
      requiredInfoTa: serviceData.requiredInfoTa || '',
      generalNotesEn: serviceData.generalNotesEn || '',
      generalNotesTa: serviceData.generalNotesTa || '',
      disclaimerEn: serviceData.disclaimerEn || 'Configured service criteria.',
      disclaimerTa: serviceData.disclaimerTa || 'மாதிரி சேவை கட்டமைப்பு.',
      version: 'v1.0',
      active: true,
      lastUpdated: new Date().toISOString(),
      fields: serviceData.fields || [],
      documents: serviceData.documents || [],
      rules: serviceData.rules || [],
    };
    this.services.push(newService);
    return newService;
  }

  updateService(id: string, updates: Partial<GovService>) {
    const idx = this.services.findIndex(s => s.id === id);
    if (idx === -1) return null;
    const current = this.services[idx];
    const updated: GovService = {
      ...current,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    this.services[idx] = updated;
    return updated;
  }

  // --- Application Methods ---
  getApplicationsByCitizen(citizenId: string) {
    return this.applications.filter(a => a.citizenId === citizenId);
  }

  getApplicationById(id: string) {
    return this.applications.find(a => a.id === id);
  }

  createApplication(appData: {
    citizenId: string;
    citizenName: string;
    citizenEmail: string;
    serviceId: string;
    dynamicFormData?: Record<string, any>;
  }) {
    const service = this.getServiceById(appData.serviceId);
    if (!service) throw new Error('Service not found');

    const appNumber = `GC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp: Application = {
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      citizenId: appData.citizenId,
      citizenName: appData.citizenName,
      citizenEmail: appData.citizenEmail,
      serviceId: service.id,
      serviceCode: service.code,
      serviceNameEn: service.nameEn,
      serviceNameTa: service.nameTa,
      serviceVersion: service.version,
      applicationNumber: appNumber,
      status: 'IN_PROGRESS',
      dynamicFormData: appData.dynamicFormData || {},
      uploadedDocuments: [],
      verificationRuns: [],
      currentIssues: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.applications.unshift(newApp);
    return newApp;
  }

  updateApplication(id: string, updates: Partial<Application>) {
    const idx = this.applications.findIndex(a => a.id === id);
    if (idx === -1) return null;
    const current = this.applications[idx];
    const updated: Application = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.applications[idx] = updated;
    return updated;
  }

  deleteApplication(id: string, citizenId?: string) {
    const idx = this.applications.findIndex(a => a.id === id && (!citizenId || a.citizenId === citizenId));
    if (idx === -1) return false;
    this.applications.splice(idx, 1);
    return true;
  }

  // --- Audit & Notifications ---
  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const entry: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ...log,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
    return entry;
  }

  getAuditLogs(limit = 100) {
    return this.auditLogs.slice(0, limit);
  }

  addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ...notif,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  getNotifications(userId: string) {
    return this.notifications.filter(n => n.userId === userId);
  }

  markNotificationRead(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.isRead = true;
  }

  // --- Admin Analytics ---
  getAdminAnalytics(): AdminAnalytics {
    const totalUsers = this.users.length;
    const totalApplications = this.applications.length;
    const completedVerifications = this.applications.filter(a => a.status === 'READY_FOR_REVIEW' || a.status === 'VERIFIED').length;
    const correctionsRequired = this.applications.filter(a => a.status === 'CORRECTION_REQUIRED').length;
    const readyForReview = this.applications.filter(a => a.status === 'READY_FOR_REVIEW').length;

    const riskDistribution = {
      low: this.applications.filter(a => a.currentAssessment?.level === 'LOW').length,
      medium: this.applications.filter(a => a.currentAssessment?.level === 'MEDIUM').length,
      high: this.applications.filter(a => a.currentAssessment?.level === 'HIGH').length,
    };

    const serviceCounts: Record<string, number> = {};
    this.applications.forEach(a => {
      serviceCounts[a.serviceNameEn] = (serviceCounts[a.serviceNameEn] || 0) + 1;
    });

    const applicationsByService = Object.entries(serviceCounts).map(([serviceName, count]) => ({
      serviceName,
      count,
    }));

    const issueCounts: Record<string, number> = {
      'Missing Document': 0,
      'Name Mismatch': 0,
      'Address Discrepancy': 0,
      'Eligibility Rule': 0,
      'Document Quality': 0,
      'Date Mismatch': 0,
    };

    this.applications.forEach(app => {
      app.currentIssues.forEach(issue => {
        if (issue.issueType === 'MISSING_DOC') issueCounts['Missing Document']++;
        else if (issue.issueType === 'NAME_MISMATCH') issueCounts['Name Mismatch']++;
        else if (issue.issueType === 'ADDRESS_MISMATCH') issueCounts['Address Discrepancy']++;
        else if (issue.issueType === 'RULE_VIOLATION') issueCounts['Eligibility Rule']++;
        else if (issue.issueType === 'QUALITY_ISSUE') issueCounts['Document Quality']++;
        else if (issue.issueType === 'DOB_MISMATCH') issueCounts['Date Mismatch']++;
      });
    });

    const issueCategories = Object.entries(issueCounts).map(([category, count]) => ({
      category,
      count,
    }));

    // Generate recent trend timeline
    const verificationTrends = [
      { date: 'Aug 10', verifications: 12, issuesFound: 8 },
      { date: 'Aug 11', verifications: 18, issuesFound: 11 },
      { date: 'Aug 12', verifications: 15, issuesFound: 7 },
      { date: 'Aug 13', verifications: 24, issuesFound: 14 },
      { date: 'Aug 14', verifications: 28, issuesFound: 16 },
      { date: 'Aug 15', verifications: 20, issuesFound: 10 },
      { date: 'Aug 16', verifications: 35, issuesFound: 19 },
      { date: 'Aug 17', verifications: 42, issuesFound: 22 },
      { date: 'Aug 18', verifications: 38, issuesFound: 17 },
    ];

    return {
      totalUsers,
      totalApplications,
      completedVerifications,
      correctionsRequired,
      readyForReview,
      riskDistribution,
      applicationsByService,
      issueCategories,
      verificationTrends,
    };
  }
}

export const db = new Database();
