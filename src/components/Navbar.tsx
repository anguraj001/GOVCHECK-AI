import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Globe, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  ShieldAlert, 
  Menu, 
  X,
  FileCheck,
  Sparkles,
  LayoutDashboard,
  Layers,
  HelpCircle,
  Info
} from 'lucide-react';
import { User, Language, AppNotification } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  user: User | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
  notifications: AppNotification[];
  onNotificationClick: (notif: AppNotification) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  language,
  onLanguageChange,
  onOpenAuth,
  onLogout,
  currentView,
  onNavigate,
  notifications,
  onNotificationClick,
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[language];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            id="nav-brand-logo"
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => onNavigate(user ? 'dashboard' : 'home')}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-gray-900">
                  GOVCHECK<span className="text-blue-700">.AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Pre-Check
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium hidden sm:block">
                {t.app.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {!user ? (
              <>
                <button 
                  id="nav-link-home"
                  onClick={() => onNavigate('home')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'home' ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  {t.nav.home}
                </button>
                <button 
                  id="nav-link-services"
                  onClick={() => onNavigate('services')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'services' ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  {t.nav.services}
                </button>
                <button 
                  id="nav-link-how-it-works"
                  onClick={() => onNavigate('how-it-works')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'how-it-works' ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  {t.nav.howItWorks}
                </button>
                <button 
                  id="nav-link-faq"
                  onClick={() => onNavigate('faq')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'faq' ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  {t.nav.faq}
                </button>
                <button 
                  id="nav-link-about"
                  onClick={() => onNavigate('about')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'about' ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  {t.nav.about}
                </button>
              </>
            ) : (
              <>
                <button 
                  id="nav-link-dashboard"
                  onClick={() => onNavigate('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t.nav.dashboard}
                </button>
                <button 
                  id="nav-link-services-user"
                  onClick={() => onNavigate('services')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'services' ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  <Layers className="w-4 h-4" />
                  {t.nav.services}
                </button>
                <button 
                  id="nav-link-assistant"
                  onClick={() => onNavigate('assistant')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'assistant' ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {t.nav.aiAssistant}
                </button>
                {user.role === 'admin' && (
                  <button 
                    id="nav-link-admin"
                    onClick={() => onNavigate('admin')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'admin' ? 'text-purple-700 bg-purple-50' : 'text-purple-600 hover:text-purple-900 hover:bg-purple-50'}`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    {t.nav.adminPanel}
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Right Action Toolbar */}
          <div className="flex items-center gap-2.5">
            
            {/* Language Switcher */}
            <div className="flex items-center border border-gray-300 rounded-lg p-0.5 bg-gray-50 text-xs font-semibold">
              <button
                id="btn-lang-en"
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 rounded transition-all ${language === 'en' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'}`}
              >
                EN
              </button>
              <button
                id="btn-lang-ta"
                type="button"
                onClick={() => onLanguageChange('ta')}
                className={`px-2 py-1 rounded transition-all ${language === 'ta' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'}`}
              >
                தமிழ்
              </button>
            </div>

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative">
                <button
                  id="btn-notifications-bell"
                  type="button"
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative focus:outline-hidden"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider text-gray-700">Notifications</span>
                      <span className="text-xs text-gray-500">{notifications.length} updates</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-xs text-gray-500 text-center">No notifications yet.</p>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id}
                            onClick={() => {
                              onNotificationClick(n);
                              setShowNotifMenu(false);
                            }}
                            className={`p-3 text-xs cursor-pointer hover:bg-blue-50 transition-colors ${!n.isRead ? 'bg-blue-50/50 font-medium' : ''}`}
                          >
                            <p className="font-bold text-gray-900">
                              {language === 'ta' ? n.titleTa : n.titleEn}
                            </p>
                            <p className="text-gray-600 mt-0.5">
                              {language === 'ta' ? n.messageTa : n.messageEn}
                            </p>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User State / Sign In buttons */}
            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  id="btn-nav-login"
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-gray-700 hover:text-blue-700 hover:bg-gray-100 transition-colors"
                >
                  {t.nav.login}
                </button>
                <button
                  id="btn-nav-register"
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 shadow-xs transition-colors"
                >
                  {t.nav.register}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-1">
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[130px]">
                    {user.name}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-1.5 rounded ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {user.role}
                  </span>
                </div>
                <button
                  id="btn-nav-logout"
                  onClick={onLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t.nav.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {!user ? (
            <>
              <button 
                onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {t.nav.home}
              </button>
              <button 
                onClick={() => { onNavigate('services'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {t.nav.services}
              </button>
              <button 
                onClick={() => { onNavigate('how-it-works'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {t.nav.howItWorks}
              </button>
              <button 
                onClick={() => { onNavigate('faq'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {t.nav.faq}
              </button>
              <button 
                onClick={() => { onNavigate('about'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {t.nav.about}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {t.nav.dashboard}
              </button>
              <button 
                onClick={() => { onNavigate('services'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {t.nav.services}
              </button>
              <button 
                onClick={() => { onNavigate('assistant'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {t.nav.aiAssistant}
              </button>
              {user.role === 'admin' && (
                <button 
                  onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-purple-700 hover:bg-purple-50"
                >
                  {t.nav.adminPanel}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
};
