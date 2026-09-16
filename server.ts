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

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'GOVCHECK AI Core Engine',
      version: '2.4.0',
      timestamp: new Date().toISOString(),
      aiStatus: process.env.GEMINI_API_KEY ? 'active' : 'fallback-mode',
    });
  });

  // --- 1. Authentication Endpoints ---
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

  app.get('/api/auth/me', authenticate, (req, res) => {
    const userPayload = (req as any).user;
    const user = db.findUserById(userPayload.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { passwordHash, ...userClean } = user;
    res.json({ user: userClean });
  });

  // --- 2. Government Services Endpoints ---
  app.get('/api/services', (req, res) => {
    const services = db.getAllServices();
    res.json({ services });
  });

  app.get('/api/services/:id', (req, res) => {
    const service = db.getServiceById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json({ service });
  });

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

  // --- 3. Applications Endpoints ---
  app.get('/api/applications', authenticate, (req, res) => {
    const user = (req as any).user;
    if (user.role === 'admin') {
      return res.json({ applications: db.applications });
    }
    const applications = db.getApplicationsByCitizen(user.id);
    res.json({ applications });
  });

  app.get('/api/applications/:id', authenticate, (req, res) => {
    const user = (req as any).user;
    const app = db.getApplicationById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });
    if (user.role !== 'admin' && app.citizenId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json({ application: app });
  });

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

  // --- 4. Document Upload and AI Analysis ---
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

  // --- 5. Verification & Re-Verification Engine ---
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

  // --- 6. Correction Actions ---
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

  // --- 7. AI Assistant Chat ---
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

  // --- 8. Admin Analytics & Audit Logs ---
  app.get('/api/admin/analytics', authenticate, requireAdmin, (req, res) => {
    const analytics = db.getAdminAnalytics();
    res.json({ analytics });
  });

  app.get('/api/admin/audit-logs', authenticate, requireAdmin, (req, res) => {
    const logs = db.getAuditLogs(100);
    res.json({ logs });
  });

  // --- 9. Notifications ---
  app.get('/api/notifications', authenticate, (req, res) => {
    const user = (req as any).user;
    const notifs = db.getNotifications(user.id);
    res.json({ notifications: notifs });
  });

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
