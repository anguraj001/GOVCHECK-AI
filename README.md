# GOVCHECK AI: Government Application Pre-Submission Verification & Rejection-Risk Analysis System

> **A mission-critical pre-submission screening and rejection-risk mitigation platform designed to detect errors, cross-verify document consistency, evaluate eligibility rules, and guide citizens to correct issues before applying on official government e-portals.**

---

## 1. Executive Summary & Core Mission

Government e-governance portals (such as e-Sevai, MeeSeva, and DigiLocker services) process millions of citizen applications annually for vital revenue, educational, and welfare certificates. However, **between 30% and 45% of first-time applications face rejection, delays, or administrative query notices** due to preventable issues:
- **Clerical Name Discrepancies**: Spelling differences or initial order variations (e.g., initial placed in front vs. rear) across Aadhaar, Ration Card, or Marksheets.
- **Missing Mandatory Enclosures**: Missing supporting certificates required by specific departmental gazettes.
- **Illegible or Blurred Scans**: Low-resolution camera captures failing officer legibility criteria.
- **Exceeded Statutory Thresholds**: Incomes exceeding income certificate limits (e.g. ₹3,00,000 ceiling), age limit violations, or invalid format entries.

**GOVCHECK AI** acts as a citizen-facing safety buffer. Before an application is transmitted to an irreversible government portal, GOVCHECK AI executes deterministic rule evaluations, AI-assisted multimodal document OCR extractions, and generates an actionable **Rejection-Risk Assessment (0–100 Score)** with step-by-step resolution guidance in English and Tamil.

---

## 2. System Architecture & Tech Stack

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT TIER                                        |
|  React 19 SPA • Tailwind CSS v4 • Lucide Icons • Recharts • jsPDF • Framer Motion    |
|  - Root ErrorBoundary & ApplicationWizard ErrorBoundary Subtree Isolation             |
|  - Real-Time Bilingual Toggle (English / தமிழ்)                                        |
+------------------------------------------+--------------------------------------------+
                                           | HTTP / REST (Bearer HMAC Tokens)
+------------------------------------------v--------------------------------------------+
|                                    SERVER TIER                                        |
|  Express 4.21 • TypeScript 5.8 • Node.js (tsx dev runtime / esbuild CJS bundle)       |
|  - Cryptographic Auth: Bcrypt (10 rounds) + HMAC-SHA256 Stateless Tokens              |
|  - Multimodal AI: Google Gemini 2.5 Flash with Smart Heuristic Resiliency Fallback    |
|  - Deterministic Rule Engine: 4-Pillar Scoring, Fuzzy Token Overlap & Levenshtein    |
|  - In-Memory Relational State Store: Users, Services, Applications, Audit, Alerts    |
+---------------------------------------------------------------------------------------+
```

---

## 3. Database Schema & Relational Data Model

GOVCHECK AI employs a modular, relational data model structured into 5 core collections with embedded schemas for fields, documents, rules, audit trails, and verification runs.

### 3.1 Entity-Relationship (ER) Overview

```
 [User] (1) <----------------------- (N) [Application] (1) <------- (N) [VerificationRun]
   |                                           |
   |                                           | (1)
   |                                           v
   | (1)                                      (N) [UploadedDocument]
   |                                           |
   v                                           | (1)
  (N) [AuditLog]                               v
                                              (N) [VerificationIssue]

 [GovService] (1) <----------------- (N) [Application]
   |
   +--- (Embedded 1:N) ---> [ServiceField]
   +--- (Embedded 1:N) ---> [ServiceDocumentConfig]
   +--- (Embedded 1:N) ---> [ServiceRule]
```

### 3.2 Detailed Entity Definitions

#### 1. `users`
Tracks citizen applicants and departmental administrators.
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `VARCHAR` | Primary Key (e.g., `usr-citizen-1`, `usr-admin-1`) |
| `name` | `VARCHAR` | Full legal name of user |
| `email` | `VARCHAR` | Unique index, case-insensitive login identifier |
| `mobile` | `VARCHAR` | Contact number for notifications |
| `role` | `'citizen' \| 'admin'` | Access control role |
| `preferredLanguage`| `'en' \| 'ta'` | Active UI and report localization preference |
| `passwordHash` | `VARCHAR` | Bcrypt hash with 10 salt rounds |
| `createdAt` | `ISO 8601` | Timestamp of user creation |

#### 2. `services`
Catalog of government certificate and licensing workflows.
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `VARCHAR` | Primary Key (e.g., `srv-income-cert`, `srv-first-grad`) |
| `code` | `VARCHAR` | Unique alphanumeric code (e.g., `REV-INC-01`) |
| `nameEn` / `nameTa` | `VARCHAR` | Bilingual service title |
| `departmentEn` / `Ta`| `VARCHAR` | Issuing government ministry / department |
| `category` | `VARCHAR` | `certificates`, `welfare`, `licenses`, `revenue` |
| `estimatedProcessingDays`| `INTEGER` | SLA days for completion |
| `version` | `INTEGER` | Optimistic locking and rule versioning |
| `fields` | `ServiceField[]` | Dynamic form field configuration (embedded) |
| `documents` | `ServiceDocumentConfig[]`| Document enclosure requirements (embedded) |
| `rules` | `ServiceRule[]` | Declarative eligibility business rules (embedded) |

#### 3. `fields` (Embedded within `services`)
| Property | Type | Description |
|---|---|---|
| `id` | `VARCHAR` | Field ID (e.g., `fld-inc-1`) |
| `fieldKey` | `VARCHAR` | Form key (e.g., `applicantName`, `annualIncome`, `aadhaarNumber`) |
| `labelEn` / `labelTa`| `VARCHAR` | Bilingual input label |
| `fieldType` | `ENUM` | `text`, `number`, `date`, `select`, `textarea`, `checkbox` |
| `isRequired` | `BOOLEAN` | If mandatory, triggers `INCOMPLETE_FIELD` penalty when blank |
| `options` | `Array<{value, labelEn, labelTa}>` | Key-value options for select dropdowns |
| `validationRegex` | `VARCHAR` | Client & server regex format constraint |

#### 4. `documents` (Embedded within `services`)
| Property | Type | Description |
|---|---|---|
| `id` | `VARCHAR` | Enclosure ID |
| `docTypeKey` | `VARCHAR` | Normalized key (e.g., `AADHAAR_CARD`, `SALARY_SLIP_OR_ITR`) |
| `titleEn` / `titleTa`| `VARCHAR` | Bilingual document label |
| `allowedFormats` | `VARCHAR[]` | Allowed MIME types (`application/pdf`, `image/jpeg`, `image/png`) |
| `maxSizeBytes` | `INTEGER` | Upload size limit (default 5MB) |
| `isRequired` | `BOOLEAN` | Mandatory upload indicator (triggers `MISSING_DOC` if absent) |
| `requiredFieldsToExtract` | `VARCHAR[]` | Fields targeted for OCR extraction (e.g. `['name', 'uid', 'income']`) |

#### 5. `rules` (Embedded within `services`)
| Property | Type | Description |
|---|---|---|
| `id` | `VARCHAR` | Rule ID |
| `ruleCode` | `VARCHAR` | Business code (e.g., `RULE_INCOME_CEILING`) |
| `operator` | `ENUM` | `exists`, `equals`, `not_equals`, `greater_than`, `less_than`, `gte`, `lte`, `contains`, `aadhaar_valid`, `regex_match` |
| `fieldKey` | `VARCHAR` | Field inspected by this rule |
| `targetValue` | `ANY` | Comparison threshold or regex pattern |
| `severity` | `'critical' \| 'warning' \| 'info'` | Penalty weight: critical (+15 pts), warning (+8 pts), info (+4 pts) |
| `explanationEn`/`Ta` | `TEXT` | Regulatory explanation citing relevant rules |
| `actionEn`/`Ta` | `TEXT` | Prescribed corrective step |

#### 6. `applications`
Live citizen draft or verified pre-submission package.
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `VARCHAR` | Primary Key (`app-<timestamp>-<hash>`) |
| `applicationNumber`| `VARCHAR` | Human-readable token (e.g., `GC-2026-4821`) |
| `citizenId` | `VARCHAR` | Foreign Key -> `users.id` |
| `serviceId` | `VARCHAR` | Foreign Key -> `services.id` |
| `status` | `ENUM` | `DRAFT`, `IN_PROGRESS`, `VERIFYING`, `CORRECTION_REQUIRED`, `READY_FOR_REVIEW`, `SUBMITTED` |
| `dynamicFormData` | `JSON` | Key-value dictionary of citizen entries |
| `uploadedDocuments`| `UploadedDocument[]` | Embedded list of uploaded documents and extracted fields |
| `currentAssessment`| `RiskAssessment` | Most recent calculated rejection risk assessment |
| `currentIssues` | `VerificationIssue[]` | Active list of unresolved or confirmed issues |
| `verificationRuns` | `VerificationRun[]` | Immutable historical run history with score deltas |

#### 7. `auditLogs`
Immutable ledger for compliance and operational tracking.
| Column | Type | Description |
|---|---|---|
| `id` | `VARCHAR` | Primary Key (`aud-...`) |
| `timestamp` | `ISO 8601` | Precise creation time |
| `userId` / `userRole`| `VARCHAR` | Actor identification |
| `action` | `VARCHAR` | `USER_LOGIN`, `DOCUMENT_UPLOADED`, `VERIFICATION_COMPLETED`, etc. |
| `entityType` / `entityId` | `VARCHAR` | Target entity (`Application`, `Document`, `Service`) |
| `metadata` | `JSON` | Contextual parameters (scores, confidence levels, IP) |

---

## 4. Complete REST API Endpoint Reference Catalog

All private endpoints require the standard Bearer header:
```http
Authorization: Bearer <token>
```

### 4.1 Quick Endpoint Reference Table

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | Public | System status, version, and AI availability probe |
| `POST`| `/api/auth/register` | Public | Register new citizen account |
| `POST`| `/api/auth/login` | Public | Login with email and password |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |
| `GET` | `/api/services` | Public | List all available government services |
| `GET` | `/api/services/:id` | Public | Get complete service details, fields, and rules |
| `POST`| `/api/admin/services` | Admin | Create a new government service configuration |
| `PUT` | `/api/admin/services/:id` | Admin | Update service schema, rules, or document specs |
| `GET` | `/api/applications` | Authenticated | List citizen's applications (or all if admin) |
| `GET` | `/api/applications/:id` | Authenticated | Retrieve single application with verification state |
| `POST`| `/api/applications` | Authenticated | Create a new application draft |
| `PUT` | `/api/applications/:id` | Authenticated | Update form data or application status |
| `DELETE`| `/api/applications/:id` | Authenticated | Delete application draft |
| `POST`| `/api/applications/:id/documents`| Authenticated | Upload document & run multimodal OCR analysis |
| `DELETE`| `/api/applications/:id/documents/:docId`| Authenticated| Remove an uploaded document |
| `POST`| `/api/applications/:id/verify` | Authenticated | Execute 4-pillar rule engine & rejection scoring |
| `POST`| `/api/applications/:id/correct`| Authenticated | Apply fix from Correction Center |
| `POST`| `/api/assistant/chat` | Authenticated | Bilingual AI chat for service & rule guidance |
| `GET` | `/api/admin/analytics` | Admin | Aggregate dashboard metrics and risk breakdown |
| `GET` | `/api/admin/audit-logs` | Admin | Retrieve recent compliance audit trail |
| `GET` | `/api/notifications` | Authenticated | Retrieve citizen notifications |
| `POST`| `/api/notifications/:id/read` | Authenticated | Mark notification as read |

---

### 4.2 Endpoint Details & Request / Response Specifications

#### `POST /api/auth/register`
Creates a citizen account with salted password hashing.

**Request Body:**
```json
{
  "name": "Abishek Vasanth",
  "email": "abishek@example.com",
  "mobile": "+91 98765 43210",
  "password": "SecurePassword123",
  "preferredLanguage": "en"
}
```

**Success Response (200 OK):**
```json
{
  "user": {
    "id": "usr-17418293021",
    "name": "Abishek Vasanth",
    "email": "abishek@example.com",
    "mobile": "+91 98765 43210",
    "role": "citizen",
    "preferredLanguage": "en",
    "createdAt": "2026-10-14T21:30:00.000Z"
  },
  "token": "eyJpZCI6...a6f1b8c..."
}
```

---

#### `POST /api/auth/login`
Validates credentials and returns an HMAC-SHA256 signed bearer token.

**Request Body:**
```json
{
  "email": "citizen@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "user": {
    "id": "usr-citizen-1",
    "name": "Abishek Vasanth P",
    "email": "citizen@example.com",
    "role": "citizen"
  },
  "token": "eyJpZCI6...7e4a3..."
}
```

---

#### `POST /api/applications/:id/documents`
Uploads a document in base64 format and triggers Gemini multimodal OCR field extraction.

**Request Body:**
```json
{
  "docTypeKey": "AADHAAR_CARD",
  "fileName": "my_aadhaar_card.pdf",
  "fileType": "application/pdf",
  "fileSize": 245000,
  "fileDataUrl": "data:application/pdf;base64,JVBERi0xLjQK..."
}
```

**Success Response (200 OK):**
```json
{
  "application": { "...": "updated Application object" },
  "document": {
    "id": "doc-up-1741829400-3fa",
    "applicationId": "app-1234",
    "docTypeKey": "AADHAAR_CARD",
    "fileName": "my_aadhaar_card.pdf",
    "status": "ANALYZED",
    "uploadedAt": "2026-10-14T21:31:00.000Z",
    "extractions": {
      "extractedFields": {
        "name": "Abishek Vasanth P",
        "dob": "1994-08-15",
        "uid": "XXXX-XXXX-9012",
        "address": "45 Gandhi Road, Chennai 600028"
      },
      "confidence": 0.94,
      "readability": "good",
      "documentTypeDetected": "AADHAAR_CARD",
      "qualityIssues": []
    }
  }
}
```

---

#### `POST /api/applications/:id/verify`
Executes the comprehensive 4-pillar rule engine against form data and uploaded documents.

**Success Response (200 OK):**
```json
{
  "assessment": {
    "score": 12,
    "level": "LOW",
    "breakdown": {
      "documentCompleteness": 0,
      "requiredFields": 0,
      "informationConsistency": 0,
      "configuredRules": 12
    },
    "completenessStatus": "PASS",
    "consistencyStatus": "PASS",
    "ruleCheckStatus": "WARNING",
    "qualityStatus": "PASS",
    "summaryEn": "Pre-verification successful with LOW rejection risk...",
    "recommendedActions": [
      "Review the generated Pre-Submission Report.",
      "Proceed with confidence to the official government e-portal."
    ]
  },
  "issues": [],
  "verificationRun": {
    "id": "run-1741829500",
    "runNumber": 1,
    "triggerType": "INITIAL",
    "runAt": "2026-10-14T21:32:00.000Z"
  }
}
```

---

#### `POST /api/applications/:id/correct`
Applies an in-place correction from the Correction Center (e.g., synchronizing a name spelling or confirming a non-standard initial format).

**Request Body:**
```json
{
  "issueId": "iss-name-doc-123",
  "actionType": "RESOLVE",
  "updatedFieldKey": "applicantName",
  "updatedFieldValue": "Abishek Vasanth P"
}
```

---

## 5. Granular Technical Documentation on Unit Testing

### 5.1 Testing Architecture & Principles

The testing framework in GOVCHECK AI is built on the native **Node.js Test Runner (`node:test`)** and **Strict Assertions (`node:assert/strict`)**, orchestrated with `tsx --test`.

Key architectural principles:
1. **Deterministic Execution**: The verification rule engine, fuzzy string normalization, and risk calculations are pure functions that do not depend on external network calls or non-deterministic mocks.
2. **Boundary Precision**: Every score boundary (Score 0, 20/21 boundary, 50/51 boundary, 100 cap) is covered with explicit boundary condition assertions.
3. **Typographic & Cultural Sensitivity**: Name matching tests verify South Indian and Indian naming conventions (initial-first vs initial-last, spacing, honorific stripping).
4. **Cryptographic Integrity**: Hashing and signature tests verify resistance to payload tampering and malformed Bearer headers.

### 5.2 Test Suites Breakdown

| Test Suite | File Location | Tests | Coverage Focus |
|---|---|---|---|
| **Text Normalization** | `tests/ruleEngine.test.ts` | 3 | Trimming, punctuation removal, case normalization, whitespace collapsing |
| **Similarity Metrics** | `tests/ruleEngine.test.ts` | 5 | Exact matches, token overlap ratio, Levenshtein distance, inverted initial ordering, phonetic typos |
| **Rule Operators** | `tests/ruleEngine.test.ts` | 4 | `exists`, numeric comparisons (`lte`, `gte`, `greater_than`), Aadhaar 12-digit format, regex matching |
| **Full Verification Pipeline** | `tests/ruleEngine.test.ts` | 4 | Clean application (Score 0, LOW), missing mandatory document (+30, FAIL), name mismatch (+12), combined violations exceeding threshold (Score >= 51, HIGH) |
| **Password Cryptography** | `tests/auth.test.ts` | 3 | Bcrypt salt generation, format validation (`$2a$10`), positive and negative match verification |
| **Token Cryptography** | `tests/auth.test.ts` | 4 | Base64 serialization, HMAC-SHA256 signature verification, tamper rejection, malformed header handling |

### 5.3 Executing Unit Tests

To run the complete test suite:
```bash
npm test
```

Sample Test Runner Output:
```
> react-example@0.0.0 test
> tsx --test tests/**/*.test.ts

✔ GOVCHECK AI - Authentication & Token Cryptography Unit Tests (585ms)
  ✔ hashPassword() & comparePassword() (582ms)
  ✔ generateToken() & verifyToken() (2ms)
✔ GOVCHECK AI - Rule Engine & Text Similarity Unit Tests (12ms)
  ✔ normalizeText() (2ms)
  ✔ calculateSimilarity() (4ms)
  ✔ evaluateRule() (1ms)
  ✔ runFullVerification() End-to-End Simulation (3ms)

# tests 23
# suites 8
# pass 23
# fail 0
# duration_ms 1358ms
```

To run a single test suite in isolation:
```bash
npx tsx --test tests/ruleEngine.test.ts
```

### 5.4 How to Add New Test Cases

When configuring new services or adding new business rules (e.g., verifying driving license formats or agricultural land patta numbers):
1. Open `tests/ruleEngine.test.ts`.
2. Add a subtest under `evaluateRule()` using the declarative `ServiceRule` interface.
3. Assert both valid inputs and intentionally flawed inputs (boundary testing).
4. Run `npm test` to verify passing assertions.

---

## 6. Granular Technical Documentation on Error Boundaries

### 6.1 Architectural Purpose & Isolation Strategy

Modern React 19 SPAs can crash entirely to a blank white screen if an unhandled JavaScript exception occurs during rendering, lifecycle hooks, or child event processing (e.g., during PDF compilation or complex document canvas rendering).

GOVCHECK AI implements a **Two-Tier Error Boundary Architecture**:

```
+-------------------------------------------------------------------------+
| [RootApplication ErrorBoundary] (src/main.tsx)                          |
| - Catches unhandled top-level crashes                                   |
| - Preserves localStorage draft state                                    |
| - Offers global Reload / Reset recovery                                 |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   | [ApplicationWizard ErrorBoundary] (src/App.tsx)                 |   |
|   | - Isolates wizard steps (Form, Upload, Verification, Report)    |   |
|   | - If document OCR or PDF rendering throws:                      |   |
|   |   * Main Navbar and Citizen Dashboard remain interactive        |   |
|   |   * Citizen draft data is preserved                             |   |
|   |   * User can retry the step or return safely to Dashboard       |   |
|   +-----------------------------------------------------------------+   |
+-------------------------------------------------------------------------+
```

### 6.2 Component Lifecycle Implementation

The `ErrorBoundary` component (`src/components/ErrorBoundary.tsx`) implements the standard React error-handling lifecycle:

1. **`static getDerivedStateFromError(error: Error)`**:
   - Executes during the "render" phase.
   - Synchronously updates state: `{ hasError: true, error }`.
   - Prevents unrendered DOM nodes from breaking the browser rendering engine.

2. **`componentDidCatch(error: Error, errorInfo: React.ErrorInfo)`**:
   - Executes during the "commit" phase.
   - Stores `errorInfo.componentStack` for diagnostic inspection.
   - Emits structured logs with boundary tags: `[ErrorBoundary:ApplicationWizard] Caught unhandled React error: ...`.
   - Dispatches to external error telemetry services (e.g., Sentry, GCP Cloud Logging) if the optional `onError` callback prop is supplied.

3. **`handleReset()`**:
   - Resets the internal state: `{ hasError: false, error: null, errorInfo: null, showDetails: false }`.
   - Re-mounts the child subtree to re-attempt rendering without requiring a full page refresh.

### 6.3 Features of the Error Boundary UI

- **Bilingual Accessibility**: Renders fallback instructions in English or Tamil depending on the citizen's active session language.
- **Data Protection Notice**: Reassures the citizen that their pre-submission application data and uploaded documents have not been lost.
- **One-Click Recovery Actions**:
  - `Retry Operation`: Resets the error boundary and re-executes component mounting.
  - `Return Home / Dashboard`: Safely navigates the user back to the application dashboard.
- **Collapsible Technical Diagnostics Panel**:
  - Clickable accordion designed for developers, reviewers, and support engineers.
  - Displays error name, error message, JavaScript call stack, and React component stack trace.

---

## 7. Bilingual Engine (English & Tamil)

GOVCHECK AI provides native support for both English and Tamil (`ta`), meeting the compliance requirements of State Government e-governance systems.

- **Schema-Level Bilingualism**: Every service, form field label, document title, and rule explanation is stored with parallel `*En` and `*Ta` attributes in the database.
- **Instant Switching**: Changing languages updates the UI dynamically across navigation, form wizards, risk breakdowns, correction action recommendations, and AI Assistant messages.
- **Bilingual PDF Reports**: Pre-Submission Verification Reports generated via jsPDF format critical titles, application numbers, status badges, and action recommendations in both languages.

---

## 8. Development & Production Operations

### 8.1 Setup and Installation

```bash
# Install dependencies
npm install

# Run automated unit test suite
npm test

# Run TypeScript linter
npm run lint

# Start full-stack development server (Express backend + Vite HMR)
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### 8.2 Building for Production

```bash
# Compiles Vite client bundle to /dist and bundles server.ts via esbuild
npm run build

# Start production server
npm start
```

### 8.3 Environment Variables

Configured in `.env` (refer to `.env.example`):
```env
# Optional: Google Gemini API key for live multimodal document OCR & chat
GEMINI_API_KEY=your_gemini_api_key_here

# Secret used to sign stateless HMAC-SHA256 session tokens
SESSION_SECRET=your_production_secret_key_here
```

*Note: If `GEMINI_API_KEY` is omitted, GOVCHECK AI automatically engages its high-precision heuristic fallback engine, ensuring complete functionality without breaking.*
