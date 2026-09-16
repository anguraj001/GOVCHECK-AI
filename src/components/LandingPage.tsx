import React from 'react';
import { 
  ShieldCheck, 
  FileCheck2, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  Search, 
  UploadCloud, 
  Scale, 
  Sliders,
  CheckCircle,
  HelpCircle,
  Clock,
  Languages
} from 'lucide-react';
import { Language, GovService } from '../types';
import { translations } from '../translations';

interface LandingPageProps {
  language: Language;
  onStartVerification: () => void;
  onExploreServices: () => void;
  onSelectService: (service: GovService) => void;
  services: GovService[];
  onLoadDemoScenario?: (scenarioId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  language,
  onStartVerification,
  onExploreServices,
  onSelectService,
  services,
  onLoadDemoScenario,
}) => {
  const t = translations[language];

  const workflowSteps = [
    {
      step: '01',
      titleEn: 'Select Service',
      titleTa: 'சேவை தேர்வு',
      descEn: 'Choose from Income, Community, Residence, or Scholarship services.',
      descTa: 'வருமானம், சாதி, இருப்பிடம் அல்லது கல்வி உதவித்தொகை சேவையை தேர்வு செய்க.',
      icon: <Layers className="w-5 h-5 text-blue-600" />,
    },
    {
      step: '02',
      titleEn: 'Fill Details',
      titleTa: 'விவரங்கள் பூர்த்தி',
      descEn: 'Complete the dynamic form with instant client-side format validation.',
      descTa: 'தானியங்கி படிவத்தில் தேவையான விவரங்களை பூர்த்தி செய்க.',
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
    },
    {
      step: '03',
      titleEn: 'Upload Documents',
      titleTa: 'ஆவண பதிவேற்றம்',
      descEn: 'Attach PDF/JPG proofs. AI OCR extracts details and tests image readability.',
      descTa: 'சான்று ஆவணங்களை பதிவேற்றுக. AI மூலம் தகவல்கள் பெறப்படும்.',
      icon: <UploadCloud className="w-5 h-5 text-purple-600" />,
    },
    {
      step: '04',
      titleEn: 'Verify & Assess',
      titleTa: 'சரிபார் & மதிப்பிடு',
      descEn: 'Deterministic rule engine & cross-document matcher calculate risk (0-100).',
      descTa: 'ஆவண ஒற்றுமை மற்றும் தகுதி விதிகள் சரிபார்க்கப்படும்.',
      icon: <Scale className="w-5 h-5 text-amber-600" />,
    },
    {
      step: '05',
      titleEn: 'Correction Center',
      titleTa: 'திருத்தும் மையம்',
      descEn: 'Fix flagged mismatches, replace blurry scans, and re-verify instantly.',
      descTa: 'கண்டறியப்பட்ட பிழைகளை சரிசெய்து மீண்டும் சரிபார்க்கவும்.',
      icon: <Sliders className="w-5 h-5 text-rose-600" />,
    },
    {
      step: '06',
      titleEn: 'Ready for Review',
      titleTa: 'சமர்ப்பிக்க தயார்',
      descEn: 'Download official PDF report and submit on the government portal with confidence.',
      descTa: 'PDF அறிக்கையை பதிவிறக்கம் செய்து அரசு தளத்தில் சமர்ப்பிக்கலாம்.',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
    },
  ];

  const features = [
    {
      titleEn: 'Multimodal Document Intelligence',
      titleTa: 'ஆவண நுண்ணறிவு & OCR',
      descEn: 'Automatic text extraction, scan quality assessment, and blur detection across Aadhaar, Ration Cards, and Salary Slips.',
      descTa: 'ஆவணங்களில் உள்ள தகவல்கள் மற்றும் தெளிவின்மையை தானாக கண்டறியும் வசதி.',
      icon: <FileCheck2 className="w-6 h-6 text-blue-600" />,
    },
    {
      titleEn: 'Cross-Document Consistency',
      titleTa: 'ஆவண தகவல் ஒற்றுமை ஆய்வு',
      descEn: 'Fuzzy similarity algorithm detects slight spelling variations, date format differences, and locality address mismatches.',
      descTa: 'பெயர் மற்றும் முகவரி எழுத்துப் பிழைகளை முன்கூட்டியே எச்சரிக்கிறது.',
      icon: <Scale className="w-6 h-6 text-indigo-600" />,
    },
    {
      titleEn: 'Configurable Rule Engine',
      titleTa: 'தகுதி விதி சரிபார்ப்பு',
      descEn: 'Rigorous deterministic evaluation of income thresholds, minimum academic percentages, and required formats.',
      descTa: 'அரசு வருமான வரம்பு மற்றும் மதிப்பெண் விதிகளை துல்லியமாக சரிபார்க்கிறது.',
      icon: <Sliders className="w-6 h-6 text-emerald-600" />,
    },
    {
      titleEn: 'Explainable Rejection-Risk Scoring',
      titleTa: 'வெளிப்படையான அபாய மதிப்பீடு',
      descEn: 'Transparent 0–100 score broken down into 4 objective pillars: Completeness, Consistency, Fields, and Rules.',
      descTa: '4 தூண்கள் கொண்ட தெளிவான 0-100 அபாய மதிப்பீட்டு விவரம்.',
      icon: <ShieldCheck className="w-6 h-6 text-amber-600" />,
    },
    {
      titleEn: 'Tamil + English Bilingual Support',
      titleTa: 'தமிழ் + ஆங்கில இருமொழி தளம்',
      descEn: 'Complete bilingual UI and an AI assistant that understands Tamil, Tanglish, and English queries seamlessly.',
      descTa: 'தமிழ், ஆங்கிலம் மற்றும் தங்க்லீஷ் வினாக்களுக்கு பதிலளிக்கும் AI.',
      icon: <Languages className="w-6 h-6 text-cyan-600" />,
    },
    {
      titleEn: 'Verification PDF Reports',
      titleTa: 'பதிவிறக்கக்கூடிய PDF அறிக்கை',
      descEn: 'Generate comprehensive, printable pre-submission reports with itemized checklists and clear citizen recommendations.',
      descTa: 'முழுமையான சரிபார்ப்பு சுருக்கத்துடன் கூடிய அதிகாரப்பூர்வ PDF அறிக்கை.',
      icon: <FileText className="w-6 h-6 text-rose-600" />,
    },
  ];

  return (
    <div className="space-y-16 py-6 sm:py-10">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-blue-50/70 via-white to-white border border-blue-100 rounded-3xl p-6 sm:p-12 shadow-xs">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.app.secondaryTagline}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {t.hero.title}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              {t.hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                id="btn-hero-start"
                onClick={onStartVerification}
                className="px-6 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span>{t.hero.startVerification}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                id="btn-hero-explore"
                onClick={onExploreServices}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm border border-gray-300 shadow-xs transition-all flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-gray-500" />
                <span>{t.hero.exploreServices}</span>
              </button>
            </div>

            {/* Civic-Tech Disclaimer Box */}
            <div className="mt-8 p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-left text-xs text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">
                  {language === 'ta' ? 'அறிவிப்பு:' : 'Independent Civic-Tech Pre-Verification Layer:'}
                </span>
                <p className="leading-relaxed text-amber-800">
                  {t.app.disclaimer}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Quick Interactive Demo Scenarios */}
      {onLoadDemoScenario && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <span className="text-blue-400 font-bold text-xs uppercase tracking-wider block mb-1">
                    {language === 'ta' ? 'முன்மாதிரி காட்சிகள்' : 'Pre-Engineered Test Scenarios'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold">
                    {language === 'ta' ? 'உடனடி மாதிரி சோதனைகள்' : 'Experience GOVCHECK AI in 1-Click'}
                  </h2>
                </div>
                <p className="text-xs text-gray-400 max-w-sm">
                  {language === 'ta' 
                    ? 'பல்வேறு நிஜ உலக ஆவண முரண்பாடுகளை உடனடியாக சோதித்துப் பாருங்கள்.' 
                    : 'Explore how GOVCHECK AI detects missing documents, name differences, and rule limits.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Scenario 1 */}
                <div 
                  id="card-scenario-clean"
                  onClick={() => onLoadDemoScenario('app-demo-clean')}
                  className="bg-gray-800/90 border border-gray-700 hover:border-emerald-500 rounded-2xl p-4.5 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group"
                >
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700 mb-2.5">
                      LOW RISK • 4/100
                    </span>
                    <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                      {t.dashboard.scenario1}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 leading-snug">
                      Income Certificate with all 3 documents verified and matching particulars.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-700/60 flex items-center justify-between text-xs text-emerald-400 font-semibold">
                    <span>Inspect Pre-Check</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Scenario 2 */}
                <div 
                  id="card-scenario-missing"
                  onClick={() => onLoadDemoScenario('app-demo-missing-doc')}
                  className="bg-gray-800/90 border border-gray-700 hover:border-amber-500 rounded-2xl p-4.5 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group"
                >
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900/60 text-amber-300 border border-amber-700 mb-2.5">
                      MEDIUM RISK • 35/100
                    </span>
                    <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                      {t.dashboard.scenario2}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 leading-snug">
                      Missing mandatory Income Proof document required for revenue validation.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-700/60 flex items-center justify-between text-xs text-amber-400 font-semibold">
                    <span>Fix in Correction Center</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Scenario 3 */}
                <div 
                  id="card-scenario-name"
                  onClick={() => onLoadDemoScenario('app-demo-name-mismatch')}
                  className="bg-gray-800/90 border border-gray-700 hover:border-amber-500 rounded-2xl p-4.5 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group"
                >
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900/60 text-amber-300 border border-amber-700 mb-2.5">
                      MEDIUM RISK • 38/100
                    </span>
                    <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                      {t.dashboard.scenario3}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 leading-snug">
                      Discrepancy: "Abishek Vasanthan P" on form vs "Abishek Vasanth P" on ID.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-700/60 flex items-center justify-between text-xs text-amber-400 font-semibold">
                    <span>Align Name</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Scenario 4 */}
                <div 
                  id="card-scenario-multi"
                  onClick={() => onLoadDemoScenario('app-demo-multi-issue')}
                  className="bg-gray-800/90 border border-gray-700 hover:border-red-500 rounded-2xl p-4.5 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group"
                >
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/60 text-red-300 border border-red-700 mb-2.5">
                      HIGH RISK • 72/100
                    </span>
                    <h4 className="font-bold text-sm text-white group-hover:text-red-400 transition-colors">
                      {t.dashboard.scenario4}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 leading-snug">
                      Low academic marks (54% vs 60%), income limit exceeded, and blurry scan.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-700/60 flex items-center justify-between text-xs text-red-400 font-semibold">
                    <span>Full Workflow Test</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6-Step Workflow Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            {language === 'ta' ? 'முழுமையான பணிப்பாய்வு' : 'End-to-End Verification Pipeline'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
            {language === 'ta' ? 'எவ்வாறு செயல்படுகிறது?' : 'How GOVCHECK AI Works'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflowSteps.map((step, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs hover:shadow-md transition-shadow relative"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="text-xs font-extrabold text-gray-400">
                  {step.step}
                </span>
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-1.5">
                {language === 'ta' ? step.titleTa : step.titleEn}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {language === 'ta' ? step.descTa : step.descEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-50 rounded-3xl p-8 sm:p-12 border border-gray-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              {language === 'ta' ? 'முக்கிய தொழில்நுட்ப சிறப்பம்சங்கள்' : 'Core Technological Innovation'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              {language === 'ta' ? 'அறிவார்ந்த முன்-சரிபார்ப்பு அடுக்கு' : 'Intelligent Pre-Submission Verification'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  {feat.icon}
                </div>
                <h3 className="font-bold text-sm text-gray-900">
                  {language === 'ta' ? feat.titleTa : feat.titleEn}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {language === 'ta' ? feat.descTa : feat.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Services Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
              {language === 'ta' ? 'ஆதரிக்கப்படும் சேவைகள்' : 'Available Services'}
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900">
              {language === 'ta' ? 'முன்-சரிபார்ப்பிற்கு கிடைக்கும் அரசு சேவைகள்' : 'Explore Configured Government Services'}
            </h2>
          </div>
          <button
            onClick={onExploreServices}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 hover:underline"
          >
            <span>{language === 'ta' ? 'அனைத்தையும் காண்க' : 'View All Services'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.slice(0, 4).map((service) => (
            <div 
              key={service.id}
              className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-700 mb-2">
                  <span>{service.code}</span>
                  <span className="text-gray-400">{service.version}</span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 line-clamp-1">
                  {language === 'ta' ? service.nameTa : service.nameEn}
                </h3>
                <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                  {language === 'ta' ? service.descriptionTa : service.descriptionEn}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <span>{service.documents.length} Required Documents</span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                <button
                  id={`btn-service-start-${service.id}`}
                  onClick={() => onSelectService(service)}
                  className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>{language === 'ta' ? 'சரிபார்ப்பைத் தொடங்கு' : 'Start Verification'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
