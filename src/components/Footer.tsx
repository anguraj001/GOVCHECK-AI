import React from 'react';
import { ShieldCheck, AlertTriangle, HeartHandshake, FileText, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface FooterProps {
  language: Language;
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onNavigate }) => {
  const t = translations[language];

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                GOVCHECK<span className="text-blue-400">.AI</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              {t.app.missionSubtitle}
            </p>
            <div className="p-3.5 bg-gray-800/80 rounded-xl border border-gray-700/80 text-xs text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <p className="leading-snug">
                {t.app.disclaimer}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {language === 'ta' ? 'விரைவு இணைப்புகள்' : 'Platform Navigation'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors"
                >
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('services')}
                  className="hover:text-white transition-colors"
                >
                  {t.nav.services}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-white transition-colors"
                >
                  {t.nav.howItWorks}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('faq')}
                  className="hover:text-white transition-colors"
                >
                  {t.nav.faq}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors"
                >
                  {t.nav.about}
                </button>
              </li>
            </ul>
          </div>

          {/* Pillars */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {language === 'ta' ? 'சரிபார்ப்பு தூண்கள்' : 'Core Verification Pillars'}
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Multimodal OCR & Completeness</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cross-Document Consistency Engine</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Configured Rule & Eligibility Checker</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Explainable Risk Assessment (0-100)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Downloadable Verification PDF Report</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} GOVCHECK AI. Pre-Submission Verification & Risk Analysis System.</p>
          <div className="flex items-center gap-4">
            <span>Independent Civic-Tech Initiative</span>
            <span>•</span>
            <span>English / தமிழ் Supported</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
