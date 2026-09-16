import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { Language, User } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  language: Language;
  onAuthSuccess: (user: User, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  language,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLang, setPreferredLang] = useState<Language>(language);

  const t = translations[language];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { user, token } = await api.login({ email, password });
        localStorage.setItem('govcheck_token', token);
        onAuthSuccess(user, token);
        onClose();
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        const { user, token } = await api.register({
          name,
          email,
          mobile,
          password,
          preferredLanguage: preferredLang,
        });
        localStorage.setItem('govcheck_token', token);
        onAuthSuccess(user, token);
        onClose();
      } else if (mode === 'forgot') {
        setSuccessMessage('If an account matches this email, instructions have been dispatched.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'citizen' | 'admin') => {
    setLoading(true);
    setErrorMessage('');
    try {
      const creds = role === 'admin' 
        ? { email: 'admin@govcheck.ai', password: 'admin123' }
        : { email: 'citizen@example.com', password: 'password123' };
      
      const { user, token } = await api.login(creds);
      localStorage.setItem('govcheck_token', token);
      onAuthSuccess(user, token);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          id="btn-auth-close"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-700 mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900">
            {mode === 'login' && (language === 'ta' ? 'உள்நுழைக' : 'Sign in to GOVCHECK AI')}
            {mode === 'register' && (language === 'ta' ? 'புதிய கணக்கு பதிவு' : 'Create Citizen Account')}
            {mode === 'forgot' && (language === 'ta' ? 'கடவுச்சொல் மீட்பு' : 'Reset Password')}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {mode === 'login' && (language === 'ta' ? 'விண்ணப்பங்களை சரிபார்க்க உங்கள் கணக்கில் நுழையவும்' : 'Verify and analyze your government applications')}
            {mode === 'register' && (language === 'ta' ? 'முன்-சரிபார்ப்பை உடனடியாக தொடங்குக' : 'Start instant pre-submission verification')}
          </p>
        </div>

        {/* 1-Click Demo Buttons */}
        {mode === 'login' && (
          <div className="mb-5 p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/80">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-2">
              ⚡ Quick Demo 1-Click Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-demo-citizen"
                type="button"
                onClick={() => handleDemoLogin('citizen')}
                className="px-2.5 py-2 text-xs font-bold text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Citizen Demo
              </button>
              <button
                id="btn-demo-admin"
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="px-2.5 py-2 text-xs font-bold text-purple-700 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Admin Console
              </button>
            </div>
          </div>
        )}

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium">
            {successMessage}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === 'ta' ? 'முழுப் பெயர்' : 'Full Legal Name'}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    id="input-reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Abishek Vasanth P"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === 'ta' ? 'கைபேசி எண்' : 'Mobile Number'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    id="input-reg-mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {language === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                id="input-auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700">
                  {language === 'ta' ? 'கடவுச்சொல்' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-blue-700 hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  id="input-auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === 'ta' ? 'கடவுச்சொல் உறுதிப்படுத்தல்' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    id="input-reg-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === 'ta' ? 'விருப்பமான மொழி' : 'Preferred Language'}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="prefLang"
                      checked={preferredLang === 'en'}
                      onChange={() => setPreferredLang('en')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    English
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="prefLang"
                      checked={preferredLang === 'ta'}
                      onChange={() => setPreferredLang('ta')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    தமிழ் (Tamil)
                  </label>
                </div>
              </div>
            </>
          )}

          <button
            id="btn-auth-submit"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' && (language === 'ta' ? 'உள்நுழைக' : 'Sign In')}
                {mode === 'register' && (language === 'ta' ? 'கணக்கை உருவாக்கு' : 'Create Account')}
                {mode === 'forgot' && (language === 'ta' ? 'அனுப்புக' : 'Send Reset Link')}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-6 text-center text-xs text-gray-500 border-t border-gray-100 pt-4">
          {mode === 'login' && (
            <p>
              {language === 'ta' ? 'கணக்கு இல்லையா?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-blue-700 hover:underline"
              >
                {language === 'ta' ? 'இங்கே பதிவு செய்க' : 'Register now'}
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p>
              {language === 'ta' ? 'ஏற்கனவே கணக்கு உள்ளதா?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-blue-700 hover:underline"
              >
                {language === 'ta' ? 'உள்நுழைக' : 'Sign in'}
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="font-bold text-blue-700 hover:underline"
            >
              Back to Sign In
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
