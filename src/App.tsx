import React, { useState, useEffect } from 'react';
import { 
  User, 
  Language, 
  GovService, 
  Application, 
  AppNotification 
} from './types';
import { translations } from './translations';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { CitizenDashboard } from './components/CitizenDashboard';
import { ServiceBrowser } from './components/ServiceBrowser';
import { ServiceDetailsModal } from './components/ServiceDetailsModal';
import { AuthModal } from './components/AuthModal';
import { WizardContainer } from './components/ApplicationWizard/WizardContainer';
import { AIAssistantChat } from './components/AIAssistantChat';
import { AdminDashboard } from './components/AdminDashboard';
import { StaticPages } from './components/StaticPages';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [currentView, setCurrentView] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [services, setServices] = useState<GovService[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedServiceModal, setSelectedServiceModal] = useState<GovService | null>(null);
  const [activeWizardApp, setActiveWizardApp] = useState<Application | null>(null);
  const [activeWizardService, setActiveWizardService] = useState<GovService | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial Data & Auth Hydration
  useEffect(() => {
    async function init() {
      try {
        const servRes = await api.getServices();
        setServices(servRes.services);

        const token = localStorage.getItem('govcheck_token');
        if (token) {
          try {
            const meRes = await api.getMe();
            setUser(meRes.user);
            setLanguage(meRes.user.preferredLanguage || 'en');
            const [appsRes, notifsRes] = await Promise.all([
              api.getApplications(),
              api.getNotifications(),
            ]);
            setApplications(appsRes.applications);
            setNotifications(notifsRes.notifications);
            setCurrentView('dashboard');
          } catch {
            localStorage.removeItem('govcheck_token');
          }
        }
      } catch (err) {
        console.error('Initial loading error:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const refreshApplications = async () => {
    try {
      const { applications: apps } = await api.getApplications();
      setApplications(apps);
    } catch (err) {
      console.error('Failed to refresh applications:', err);
    }
  };

  const refreshServices = async () => {
    try {
      const { services: s } = await api.getServices();
      setServices(s);
    } catch (err) {
      console.error('Failed to refresh services:', err);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = async (authUser: User, token: string) => {
    setUser(authUser);
    setLanguage(authUser.preferredLanguage || 'en');
    setAuthModalOpen(false);
    const [appsRes, notifsRes] = await Promise.all([
      api.getApplications(),
      api.getNotifications(),
    ]);
    setApplications(appsRes.applications);
    setNotifications(notifsRes.notifications);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('govcheck_token');
    setUser(null);
    setApplications([]);
    setNotifications([]);
    setActiveWizardApp(null);
    setCurrentView('home');
  };

  // Launch Service Wizard
  const handleStartService = async (service: GovService) => {
    if (!user) {
      handleOpenAuth('login');
      return;
    }
    try {
      const { application: newApp } = await api.createApplication(service.id, {});
      setActiveWizardApp(newApp);
      setActiveWizardService(service);
      setCurrentView('wizard');
      await refreshApplications();
    } catch (err: any) {
      alert('Failed to initialize application: ' + err.message);
    }
  };

  const handleOpenExistingApplication = (app: Application) => {
    const service = services.find((s) => s.id === app.serviceId);
    if (service) {
      setActiveWizardApp(app);
      setActiveWizardService(service);
      setCurrentView('wizard');
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    try {
      await api.deleteApplication(appId);
      await refreshApplications();
      if (activeWizardApp?.id === appId) {
        setActiveWizardApp(null);
        setCurrentView('dashboard');
      }
    } catch (err: any) {
      alert('Failed to delete application: ' + err.message);
    }
  };

  // 1-Click Interactive Demo Scenario Loader
  const handleLoadDemoScenario = async (scenarioId: string) => {
    // If not logged in, perform automatic citizen demo login
    let currentUser = user;
    if (!currentUser) {
      try {
        const { user: demoUser, token } = await api.login({
          email: 'citizen@example.com',
          password: 'password123',
        });
        localStorage.setItem('govcheck_token', token);
        setUser(demoUser);
        currentUser = demoUser;
        const [appsRes, notifsRes] = await Promise.all([
          api.getApplications(),
          api.getNotifications(),
        ]);
        setApplications(appsRes.applications);
        setNotifications(notifsRes.notifications);
      } catch (err) {
        console.error('Demo login error:', err);
      }
    }

    try {
      const { application } = await api.getApplication(scenarioId);
      const service = services.find((s) => s.id === application.serviceId) || services[0];
      setActiveWizardApp(application);
      setActiveWizardService(service);
      setCurrentView('wizard');
    } catch (err) {
      // If scenario not found, open wizard with first service
      if (services.length > 0) {
        handleStartService(services[0]);
      }
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    api.markNotificationRead(notif.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    if (notif.linkTo) {
      const targetApp = applications.find((a) => a.id === notif.linkTo);
      if (targetApp) {
        handleOpenExistingApplication(targetApp);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        language={language}
        onLanguageChange={setLanguage}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'dashboard' && !user) {
            handleOpenAuth('login');
          } else {
            setCurrentView(view);
          }
        }}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Initializing GOVCHECK AI Engine...
            </p>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <LandingPage
                language={language}
                onStartVerification={() => {
                  if (user) {
                    setCurrentView('services');
                  } else {
                    handleOpenAuth('login');
                  }
                }}
                onExploreServices={() => setCurrentView('services')}
                onSelectService={handleStartService}
                services={services}
                onLoadDemoScenario={handleLoadDemoScenario}
              />
            )}

            {currentView === 'dashboard' && user && (
              <CitizenDashboard
                user={user}
                applications={applications}
                services={services}
                language={language}
                onStartNewVerification={() => setCurrentView('services')}
                onOpenApplication={handleOpenExistingApplication}
                onDeleteApplication={handleDeleteApplication}
                onOpenAssistant={() => setCurrentView('assistant')}
                onLoadScenario={handleLoadDemoScenario}
              />
            )}

            {currentView === 'services' && (
              <ServiceBrowser
                services={services}
                language={language}
                onSelectService={handleStartService}
                onViewServiceDetails={(svc) => setSelectedServiceModal(svc)}
              />
            )}

            {currentView === 'wizard' && activeWizardApp && activeWizardService && (
              <WizardContainer
                service={activeWizardService}
                application={activeWizardApp}
                language={language}
                onApplicationUpdate={(updatedApp) => {
                  setActiveWizardApp(updatedApp);
                  refreshApplications();
                }}
                onExit={() => setCurrentView(user ? 'dashboard' : 'home')}
              />
            )}

            {currentView === 'assistant' && (
              <AIAssistantChat
                language={language}
                applicationContext={activeWizardApp}
                serviceContext={activeWizardService}
              />
            )}

            {currentView === 'admin' && user?.role === 'admin' && (
              <AdminDashboard
                services={services}
                language={language}
                onRefreshServices={refreshServices}
              />
            )}

            {(currentView === 'how-it-works' || currentView === 'faq' || currentView === 'about') && (
              <StaticPages
                page={currentView as any}
                language={language}
                onNavigate={setCurrentView}
                onStartVerification={() => {
                  if (user) setCurrentView('services');
                  else handleOpenAuth('login');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Service Details Modal */}
      <ServiceDetailsModal
        service={selectedServiceModal}
        language={language}
        onClose={() => setSelectedServiceModal(null)}
        onStartService={handleStartService}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authInitialMode}
        language={language}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Global Civic-Tech Footer */}
      <Footer language={language} onNavigate={setCurrentView} />

    </div>
  );
}
