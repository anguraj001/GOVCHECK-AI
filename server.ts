import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { verifyToken, generateToken, comparePassword } from './server/auth';
import { runFullVerification } from './server/ruleEngine';
import { analyzeUploadedDocument, generateAIChatResponse } from './server/gemini';
import { UserRole } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON parsing with 20MB limit for document uploads
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Security Headers (allow framing for AI Studio preview environment)
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Auth Middleware
  const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const userPayload = verifyToken(authHeader);
    if (!userPayload) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or missing token' });
    }
    (req as any).user = userPayload;
    next();
  };

  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin privilege required' });
    }
    next();
  };

  // --- API Routes ---

  // =========================================================================
  // SYSTEM HEALTH & DIAGNOSTICS ENDPOINTS
  // =========================================================================

  /**
   * GET /api/health
   * Public health-check probe returning engine version, server timestamp, and AI status.
   *
   * @returns { status: 'ok', service: string, version: string, timestamp: string, aiStatus: 'active' | 'fallback-mode' }
   */
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'GOVCHECK AI Core Engine',
      version: '2.4.0',
      timestamp: new Date().toISOString(),
      aiStatus: process.env.GEMINI_API_KEY ? 'active' : 'fallback-mode',
    });
  });

  // =========================================================================
  // 1. AUTHENTICATION & IDENTITY ENDPOINTS
  // =========================================================================

  /**
   * POST /api/auth/register
   * Registers a new citizen user account with bcrypt salted password hashing.
   *
   * @param req.body.name - Full name of the applicant.
   * @param req.body.email - Unique email address.
   * @param req.body.mobile - Mobile phone number.
   * @param req.body.password - Plain-text password (hashed with bcrypt 10 rounds).
   * @param req.body.preferredLanguage - 'en' | 'ta' (defaults to 'en').
   * @returns { user: User, token: string }
   */
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, mobile, password, preferredLanguage } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }

      const existing = db.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const newUser = db.createUser({
        name,
        email,
        mobile: mobile || '',
        role: 'citizen',
        preferredLanguage: preferredLanguage || 'en',
        password,
      });

      db.addAuditLog({
        userId: newUser.id,
        userRole: newUser.role,
        action: 'USER_REGISTERED',
        entityType: 'User',
        entityId: newUser.id,
        metadata: { email: newUser.email },
      });

      const token = generateToken(newUser);
      const { passwordHash, ...userClean } = newUser;
      res.json({ user: userClean, token });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Registration failed' });
    }
  });

  /**
   * POST /api/auth/login
   * Authenticates user credentials and issues an HMAC-SHA256 signed bearer token.
   *
   * @param req.body.email - Registered email address.
   * @param req.body.password - Plain-text password to verify against bcrypt hash.
   * @returns { user: User, token: string }
   */
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = db.findUserByEmail(email);
      if (!user || !comparePassword(password, user.passwordHash)) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = generateToken(user);
      const { passwordHash, ...userClean } = user;

      db.addAuditLog({
        userId: user.id,
        userRole: user.role,
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: user.id,
        metadata: { email: user.email },
      });

      res.json({ user: userClean, token });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Login failed' });
    }
  });

  /**
   * GET /api/auth/me
   * Retrieves profile information for the currently authenticated bearer token.
   * Header required: `Authorization: Bearer <token>`
   *
   * @returns { user: User }
   */
  app.get('/api/auth/me', authenticate, (req, res) => {
    const userPayload = (req as any).user;
    const user = db.findUserById(userPayload.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { passwordHash, ...userClean } = user;
    res.json({ user: userClean });
  });

  // =========================================================================
  // 2. GOVERNMENT SERVICES CONFIGURATION ENDPOINTS
  // =========================================================================

  /**
   * GET /api/services
   * Public catalog of all available pre-configured government services.
   *
   * @returns { services: GovService[] }
   */
  app.get('/api/services', (req, res) => {
    const services = db.getAllServices();
    res.json({ services });
  });

  /**
   * GET /api/services/:id
   * Retrieves full service specification including dynamic fields, document requirements, and rules.
   *
   * @param req.params.id - Service identifier (e.g. "srv-income-cert")
   * @returns { service: GovService }
   */
  app.get('/api/services/:id', (req, res) => {
    const service = db.getServiceById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json({ service });
  });

  /**
   * POST /api/admin/services
   * Administrative endpoint to create a new government service configuration.
   * Header required: `Authorization: Bearer <admin-token>`
   *
   * @param req.body - Complete GovService definition object.
   * @returns { service: GovService }
   */
  app.post('/api/admin/services', authenticate, requireAdmin, (req, res) => {
    try {
      const newService = db.createService(req.body);
      db.addAuditLog({
        userId: (req as any).user.id,
        userRole: 'admin',
        action: 'SERVICE_CREATED',
        entityType: 'Service',
        entityId: newService.id,
        metadata: { code: newService.code, name: newService.nameEn },
      });
      res.json({ service: newService });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create service' });
    }
  });

  /**
   * PUT /api/admin/services/:id
   * Administrative endpoint to update fields, rules, or document configurations of a service.
   * Header required: `Authorization: Bearer <admin-token>`
   *
   * @param req.params.id - Service identifier.
   * @param req.body - Partial<GovService> containing fields/documents/rules to update.
   * @returns { service: GovService }
   */
  app.put('/api/admin/services/:id', authenticate, requireAdmin, (req, res) => {
    try {
      const updated = db.updateService(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Service not found' });
      db.addAuditLog({
        userId: (req as any).user.id,
        userRole: 'admin',
        action: 'SERVICE_UPDATED',
        entityType: 'Service',
        entityId: updated.id,
        metadata: { code: updated.code, version: updated.version },
      });
      res.json({ service: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update service' });
    }
  });

  // =========================================================================
  // 3. CITIZEN APPLICATION DRAFT & SUBMISSION ENDPOINTS
  // =========================================================================

  /**
   * GET /api/applications
   * Lists applications belonging to the authenticated citizen (or all applications if admin).
   * Header required: `Authorization: Bearer <token>`
   *
   * @returns { applications: Application[] }
   */
  app.get('/api/applications', authenticate, (req, res) => {
    const user = (req as any).user;
    if (user.role === 'admin') {
      return res.json({ applications: db.applications });
    }
    const applications = db.getApplicationsByCitizen(user.id);
    res.json({ applications });
  });

  /**
   * GET /api/applications/:id
   * Retrieves full details, documents, and verification issues for an application.
   * Header required: `Authorization: Bearer <token>`
   *
   * @param req.params.id - Application identifier.
   * @returns { application: Application }
   */
  app.get('/api/applications/:id', authenticate, (req, res) => {
    const user = (req as any).user;
    const app = db.getApplicationById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });
    if (user.role !== 'admin' && app.citizenId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json({ application: app });
  });

  /**
   * POST /api/applications
   * Creates a new draft application instance linked to a specific service.
   * Header required: `Authorization: Bearer <token>`
   *
   * @param req.body.serviceId - Target GovService identifier.
   * @param req.body.dynamicFormData - Initial form input data dictionary.
   * @returns { application: Application }
   */
  app.post('/api/applications', authenticate, (req, res) => {
    try {
      const user = (req as any).user;
      const { serviceId, dynamicFormData } = req.body;
      if (!serviceId) return res.status(400).json({ error: 'serviceId is required' });

      const newApp = db.createApplication({
        citizenId: user.id,
        citizenName: user.name,
        citizenEmail: user.email,
        serviceId,
        dynamicFormData,
      });

      db.addAuditLog({
        userId: user.id,
        userRole: user.role,
        action: 'APPLICATION_CREATED',
        entityType: 'Application',
        entityId: newApp.id,
        metadata: { applicationNumber: newApp.applicationNumber, serviceCode: newApp.serviceCode },
      });

      res.json({ application: newApp });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create application' });
    }
  });

  /**
   * PUT /api/applications/:id
   * Updates citizen form field entries or application status.
   * Header required: `Authorization: Bearer <token>`
   *
   * @param req.params.id - Application identifier.
   * @param req.body.dynamicFormData - Updated field key-value pairs.
   * @param req.body.status - Optional updated status code.
   * @returns { application: Application }
   */
  app.put('/api/applications/:id', authenticate, (req, res) => {
    try {
      const user = (req as any).user;
      const app = db.getApplicationById(req.params.id);
      if (!app) return res.status(404).json({ error: 'Application not found' });
      if (user.role !== 'admin' && app.citizenId !== user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const updated = db.updateApplication(req.params.id, {
        dynamicFormData: req.body.dynamicFormData !== undefined ? req.body.dynamicFormData : app.dynamicFormData,
        status: req.body.status || app.status,
      });

      res.json({ application: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update application' });
    }
  });

  /**
   * DELETE /api/applications/:id
   * Removes an application draft and all associated uploads.
   * Header required: `Authorization: Bearer <token>`
   *
   * @param req.params.id - Application identifier.
   * @returns { success: true }
   */
  app.delete('/api/applications/:id', authenticate, (req, res) => {
    const user = (req as any).user;
    const success = db.deleteApplication(req.params.id, user.role === 'admin' ? undefined : user.id);
    if (!success) return res.status(404).json({ error: 'Application not found' });

    db.addAuditLog({
      userId: user.id,
      userRole: user.role,
      action: 'APPLICATION_DELETED',
      entityType: 'Application',
      entityId: req.params.id,
    });

    res.json({ success: true });
  });

  // =========================================================================
  // 4. DOCUMENT UPLOAD & MULTIMODAL AI ANALYSIS ENDPOINTS
  // =========================================================================

  /**
   * POST /api/applications/:id/documents
   * Uploads an official supporting document and triggers Gemini multimodal OCR & field extraction.
   * Header required: `Authorization: Bearer <token>`
   *
   * @param req.params.id - Application identifier.
   * @param req.body.docTypeKey - Identifier matching service.documents (e.g. "AADHAAR_CARD").
   * @param req.body.fileName - Original file name.
   * @param req.body.fileType - MIME type (e.g. "application/pdf", "image/jpeg").
   * @param req.body.fileSize - Size in bytes.
   * @param req.body.fileDataUrl - Base64 Data URL representation of the document.
   * @returns { application: Application, document: UploadedDocument }
   */
  app.post('/api/applications/:id/documents', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const app = db.getApplicationById(req.params.id);
      if (!app) return res.status(404).json({ error: 'Application not found' });
      if (user.role !== 'admin' && app.citizenId !== user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { docTypeKey, fileName, fileType, fileSize, fileDataUrl } = req.body;
      if (!docTypeKey || !fileName) {
        return res.status(400).json({ error: 'docTypeKey and fileName are required' });
      }

      // Analyze document via Gemini multimodal AI or Smart Heuristic
      const extractions = await analyzeUploadedDocument(docTypeKey, fileName, fileType, fileDataUrl);

      // Remove existing doc for this slot if present (replace logic)
      const existingDocs = app.uploadedDocuments.filter(d => d.docTypeKey !== docTypeKey);

      const newDoc = {
        id: `doc-up-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        applicationId: app.id,
        docTypeKey,
        fileName,
        fileType: fileType || 'application/pdf',
        fileSize: fileSize || 250000,
        fileDataUrl,
        status: 'ANALYZED' as const,
        uploadedAt: new Date().toISOString(),
        extractions,
      };

      const updatedDocs = [...existingDocs, newDoc];
      const updatedApp = db.updateApplication(app.id, {
        uploadedDocuments: updatedDocs,
        status: 'IN_PROGRESS',
      });

      db.addAuditLog({
        userId: user.id,
        userRole: user.role,
        action: 'DOCUMENT_UPLOADED',
        entityType: 'Document',
        entityId: newDoc.id,
        metadata: { docTypeKey, fileName, confidence: extractions.confidence },
      });

      res.json({ application: updatedApp, document: newDoc });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Document upload/analysis failed' });
    }
  });

  /**
   * DELETE /api/applications/:id/documents/:docId
   * Removes an uploaded supporting document from the application.
   * Header required: `Authorization: Bearer <token>`
   *
   * @param req.params.id - Application identifier.
   * @param req.params.docId - Document identifier.
   * @returns { application: Application }
   */
  app.delete('/api/applications/:id/documents/:docId', authenticate, (req, res) => {
    const user = (req as any).user;
    const app = db.getApplicationById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });
    if (user.role !== 'admin' && app.citizenId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedDocs = app.uploadedDocuments.filter(d => d.id !== req.params.docId);
    const updatedApp = db.updateApplication(app.id, { uploadedDocuments: updatedDocs });
    res.json({ application: updatedApp });
  });

  // =========================================================================
  // 5. DETERMINISTIC REJECTION-RISK VERIFICATION & AUDIT RUNS
  // =========================================================================

  /**
   * POST /api/applications/:id/verify
   * Executes the 4-pillar rule engine against form data and uploaded documents.
   * Calculates a 0-100 Rejection-Risk score, logs an immutable verification run,
   * generates itemized issues, and dispatches a citizen notification.
   * Header required: `Authorization: Bearer <token>`
   *
   * @param req.params.id - Application identifier.
   * @returns { application: Application, assessment: RiskAssessment, issues: VerificationIssue[], verificationRun: VerificationRun }
   */
  app.post('/api/applications/:id/verify', authenticate, (req, res) => {
    try {
      const user = (req as any).user;
      const app = db.getApplicationById(req.params.id);
      if (!app) return res.status(404).json({ error: 'Application not found' });
      if (user.role !== 'admin' && app.citizenId !== user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const service = db.getServiceById(app.serviceId);
      if (!service) return res.status(404).json({ error: 'Associated service not found' });

      // Run verification engine
      const { assessment, issues } = runFullVerification(service, app);

      const runNumber = app.verificationRuns.length + 1;
      const verificationRun = {
        id: `run-${Date.now()}`,
        applicationId: app.id,
        runNumber,
        triggerType: (runNumber === 1 ? 'INITIAL' : 'RE_VERIFICATION') as 'INITIAL' | 'RE_VERIFICATION',
        runAt: new Date().toISOString(),
        riskAssessment: assessment,
        issues,
      };

      const newStatus = assessment.level === 'LOW' ? 'READY_FOR_REVIEW' : 'CORRECTION_REQUIRED';

      const updatedApp = db.updateApplication(app.id, {
        status: newStatus,
        currentAssessment: assessment,
        currentIssues: issues,
        verificationRuns: [verificationRun, ...app.verificationRuns],
        lastVerifiedAt: new Date().toISOString(),
      });

      db.addAuditLog({
        userId: user.id,
        userRole: user.role,
        action: 'VERIFICATION_COMPLETED',
        entityType: 'Application',
        entityId: app.id,
        metadata: {
          runNumber,
          riskLevel: assessment.level,
          score: assessment.score,
          issueCount: issues.length,
        },
      });

      // Send notification
      db.addNotification({
        userId: app.citizenId,
        titleEn: `Verification Result: ${service.nameEn}`,
        titleTa: `சரிபார்ப்பு முடிவு: ${service.nameTa}`,
        messageEn: `Application ${app.applicationNumber} pre-verification completed with ${assessment.level} rejection risk.`,
        messageTa: `விண்ணப்பம் ${app.applicationNumber} முன்-சரிபார்ப்பு ${assessment.level} அபாய நிலையுடன் முடிந்தது.`,
        type: assessment.level === 'LOW' ? 'success' : (assessment.level === 'MEDIUM' ? 'warning' : 'alert'),
        linkTo: app.id,
      });

      res.json({
        application: updatedApp,
        assessment,
        issues,
        verificationRun,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Verification failed' });
    }
  });

  // =========================================================================
  // 6. GUIDED CITIZEN CORRECTION ACTIONS
  // =========================================================================

  /**
   * POST /api/applications/:id/correct
   * Applies guided fixes from the Correction Center to resolve identified discrepancies.
   * Header required: `Authorization: Bearer <token>`
   *
   * @param req.params.id - Application identifier.
   * @param req.body.issueId - Identifier of the issue being addressed.
   * @param req.body.actionType - 'RESOLVE' | 'USER_CONFIRM'.
   * @param req.body.updatedFieldKey - Form field modified.
   * @param req.body.updatedFieldValue - New value assigned to field.
   * @returns { application: Application }
   */
  app.post('/api/applications/:id/correct', authenticate, (req, res) => {
    try {
      const user = (req as any).user;
      const app = db.getApplicationById(req.params.id);
      if (!app) return res.status(404).json({ error: 'Application not found' });
      if (user.role !== 'admin' && app.citizenId !== user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { issueId, actionType, updatedFieldKey, updatedFieldValue } = req.body;

      let updatedFormData = { ...app.dynamicFormData };
      if (updatedFieldKey) {
        updatedFormData[updatedFieldKey] = updatedFieldValue;
      }

      // Mark issue as resolved / confirmed
      const updatedIssues = app.currentIssues.map(issue => {
        if (issue.id === issueId) {
          return {
            ...issue,
            status: (actionType === 'USER_CONFIRM' ? 'CONFIRMED_BY_USER' : 'RESOLVED') as 'CONFIRMED_BY_USER' | 'RESOLVED',
            resolvedAt: new Date().toISOString(),
          };
        }
        return issue;
      });

      const updatedApp = db.updateApplication(app.id, {
        dynamicFormData: updatedFormData,
        currentIssues: updatedIssues,
      });

      db.addAuditLog({
        userId: user.id,
        userRole: user.role,
        action: 'CORRECTION_PERFORMED',
        entityType: 'Application',
        entityId: app.id,
        metadata: { issueId, actionType, updatedFieldKey },
      });

      res.json({ application: updatedApp });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Correction action failed' });
    }
  });

  // =========================================================================
  // 7. BILINGUAL AI ASSISTANT CHAT
  // =========================================================================

  /**
   * POST /api/assistant/chat
   * Context-aware conversational AI assistant powered by Gemini 2.5 Flash.
   * Provides guidance on rules, required certificates, and document upload specs.
   * Header required: `Authorization: Bearer <token>`
   *
   * @param req.body.message - User prompt or question.
   * @param req.body.language - 'en' | 'ta'.
   * @param req.body.applicationId - Optional contextual application id.
   * @returns { replyEn: string, replyTa: string, actionSuggestion?: string }
   */
  app.post('/api/assistant/chat', authenticate, async (req, res) => {
    try {
      const { message, language, applicationId } = req.body;
      if (!message) return res.status(400).json({ error: 'Message is required' });

      let app: any = null;
      let service: any = null;
      if (applicationId) {
        app = db.getApplicationById(applicationId);
        if (app) {
          service = db.getServiceById(app.serviceId);
        }
      }

      const reply = await generateAIChatResponse(message, language || 'en', app, service);
      res.json(reply);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Assistant error' });
    }
  });

  // =========================================================================
  // 8. ADMINISTRATIVE METRICS & COMPLIANCE AUDIT LOGS
  // =========================================================================

  /**
   * GET /api/admin/analytics
   * Aggregates verification statistics, risk distribution, service volumes, and issue frequencies.
   * Header required: `Authorization: Bearer <admin-token>`
   *
   * @returns { analytics: AdminAnalytics }
   */
  app.get('/api/admin/analytics', authenticate, requireAdmin, (req, res) => {
    const analytics = db.getAdminAnalytics();
    res.json({ analytics });
  });

  /**
   * GET /api/admin/audit-logs
   * Retrieves immutable audit trail entries with user attribution and metadata.
   * Header required: `Authorization: Bearer <admin-token>`
   *
   * @returns { logs: AuditLog[] }
   */
  app.get('/api/admin/audit-logs', authenticate, requireAdmin, (req, res) => {
    const logs = db.getAuditLogs(100);
    res.json({ logs });
  });

  // =========================================================================
  // 9. REAL-TIME CITIZEN NOTIFICATIONS
  // =========================================================================

  /**
   * GET /api/notifications
   * Retrieves unread and historical notifications for the current authenticated citizen.
   * Header required: `Authorization: Bearer <token>`
   *
   * @returns { notifications: AppNotification[] }
   */
  app.get('/api/notifications', authenticate, (req, res) => {
    const user = (req as any).user;
    const notifs = db.getNotifications(user.id);
    res.json({ notifications: notifs });
  });

  /**
   * POST /api/notifications/:id/read
   * Marks a specific notification as acknowledged/read.
   * Header required: `Authorization: Bearer <token>`
   *
   * @param req.params.id - Notification identifier.
   * @returns { success: true }
   */
  app.post('/api/notifications/:id/read', authenticate, (req, res) => {
    db.markNotificationRead(req.params.id);
    res.json({ success: true });
  });

  // --- Vite Middleware for Development / Static file serving for Production ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GOVCHECK AI Core Server running on port ${PORT}`);
  });
}

startServer();
