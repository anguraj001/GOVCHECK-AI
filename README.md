# GOVCHECK AI

## AI-Based Government Application Pre-Submission Verification & Risk Analysis System

GOVCHECK AI is an AI-assisted web application designed to help citizens identify potential issues in government certificate applications before official submission.

The platform analyses applicant information and uploaded documents, identifies possible inconsistencies, and provides correction guidance.

> Note: GOVCHECK AI provides preliminary assistance only. It does not replace official government verification, approval, or rejection.

## Problem Statement

Applicants applying for government certificates may face difficulties in identifying missing documents, incomplete information, or inconsistencies between application details and supporting documents.

These issues may result in additional correction work and make the application process more difficult.

GOVCHECK AI addresses this gap by providing an intelligent pre-verification layer before official submission.

## Proposed Solution

GOVCHECK AI allows citizens to:

1. Select a government service
2. Enter applicant details
3. Upload supporting documents
4. Perform AI-assisted pre-verification
5. Identify possible issues
6. Understand why an issue was detected
7. Receive correction guidance
8. Re-run verification
9. Generate a pre-submission readiness report

## Key Features

### Document Verification
- Mandatory document checklist
- Document completeness checking
- Multimodal document inspection
- OCR-based information extraction
- Scan readability assessment
- Blur and contrast issue detection

### AI-Assisted Verification
The system analyses:
- Applicant information
- Uploaded documents
- Information consistency
- Required fields
- Configured service rules

### Four-Pillar Verification Engine

| Verification Pillar | Maximum Score |
|---|---:|
| Document Completeness | 30 |
| Information Consistency | 25 |
| Required Fields | 20 |
| Configured Rule Evaluation | 25 |
| Total | 100 |

## Correction Center

The Correction Center provides structured guidance using three sections:

### WHAT
Identifies the detected issue.

### WHY
Explains why the issue requires attention.

### ACTION
Provides guidance on what the applicant should review or correct.

Users can then re-run the verification after making corrections.

## Readiness Report

GOVCHECK AI generates a preliminary pre-submission report containing:

- Verification results
- Detected issues
- Verified parameters
- Risk indicators
- Correction guidance
- Pre-submission information

The report can also be exported as a PDF.

## Multilingual Support

The interface supports:

- English
- Tamil
- Tanglish

This helps improve accessibility and understanding for different users.

## System Workflow

Citizen
↓
Select Government Service
↓
Enter Applicant Details
↓
Upload Supporting Documents
↓
Document OCR & Inspection
↓
Data Preprocessing
↓
Four-Pillar Verification Engine
↓
Issue / Risk Identification
↓
Correction Center
↓
Re-run Verification
↓
Readiness Report
↓
Pre-Submission Guidance

## AI & Technical Components

### Optical Character Recognition (OCR)
Extracts relevant information from uploaded documents for preliminary analysis.

### Information Consistency Analysis
Compares important information across application fields and supporting documents.

Examples include:
- Name
- Date of Birth
- Address
- Other relevant applicant details

### Fuzzy Matching
Helps identify minor spelling and formatting variations.

### Rule Engine
Evaluates configured service-specific requirements.

### Risk Assessment
Combines verification results to highlight potential issues before submission.

## Application Modules

- Landing Page
- Authentication
- Service Browser
- Service Details
- Citizen Dashboard
- Application Wizard
- Dynamic Form
- Document Upload
- Risk Assessment
- Correction Center
- Readiness Report
- AI Assistant
- Admin Dashboard
- Rule Registry

## Responsible AI

GOVCHECK AI is designed only as a preliminary assistance system.

The system does not:

- Approve applications
- Reject applications
- Replace authorised government officials
- Claim official government verification

The final decision remains with the authorised government department.

## Privacy & Security

Sensitive applicant information should not be exposed publicly.

API keys and other environment secrets should never be committed to the repository.

Use environment variables for private credentials and keep them excluded through `.gitignore`.

## Technology Stack

- Frontend: React
- Language: TypeScript
- Backend: Node.js
- AI: Gemini
- Build Tool: Vite
- PDF Generation: jsPDF
- Charts: Recharts
- Database: Application database layer
- Authentication: Application authentication module

## Project Structure

GOVCHECK-AI/
├── assets/
├── server/
├── src/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── server.ts
├── tsconfig.json
└── vite.config.ts

## Project Objectives

- Help applicants identify potential document issues before submission
- Detect possible inconsistencies in applicant information
- Provide understandable correction guidance
- Improve the pre-application experience
- Provide a preliminary readiness indication
- Use AI responsibly as an assistance layer

## Future Enhancements

- Additional government certificate services
- Improved document analysis
- Voice-based assistance
- Expanded Tamil language support
- Mobile application
- Advanced document validation models
- Integration with authorised government APIs where officially permitted

## Project Context

This project was developed as part of Project Better Tomorrow – Pathway A: Continuation Track.

The project builds upon the problem identified during the previous AI Immersion task.

The development process follows:

Existing Problem
↓
AI-Assisted Ideation
↓
Prototype
↓
User Testing
↓
Feedback
↓
Improvement
↓
Validation

## Developer

Anguraj

Second-Year Biotechnology Student

Rathinam Technical Campus

## Disclaimer

GOVCHECK AI provides preliminary, AI-assisted guidance only.

It should not be considered an official government verification, approval, rejection decision, or legal determination.

Users should follow the official requirements and instructions of the relevant government department.
