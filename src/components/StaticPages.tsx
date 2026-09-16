import React from 'react';
import { 
  ShieldCheck, 
  HelpCircle, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Scale, 
  Sliders, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface StaticPagesProps {
  page: 'how-it-works' | 'faq' | 'about';
  language: Language;
  onNavigate: (view: string) => void;
  onStartVerification: () => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({
  page,
  language,
  onNavigate,
  onStartVerification,
}) => {
  const t = translations[language];

  if (page === 'how-it-works') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            {language === 'ta' ? 'செயல்முறை விளக்கம்' : 'Verification Architecture'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {language === 'ta' ? 'GOVCHECK AI எவ்வாறு செயல்படுகிறது?' : 'How GOVCHECK AI Works'}
          </h1>
          <p className="text-sm text-gray-600">
            {language === 'ta'
              ? 'அரசு விண்ணப்பங்கள் நிராகரிக்கப்படுவதற்கான பொதுவான காரணங்களை முன்கூட்டியே கண்டறிந்து சரிசெய்யும் தொழில்நுட்பம்.'
              : 'Our multi-layer verification engine inspects documents, cross-checks parameters, and evaluates statutory rules to prevent application delays.'}
          </p>
        </div>

        {/* 4 Pillars Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-extrabold text-base text-gray-900">Multimodal OCR & Completeness</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              When documents are uploaded, multimodal AI extracts identity numbers, names, and financial figures while inspecting resolution, blur, and contrast.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-extrabold text-base text-gray-900">Cross-Document Consistency</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Fuzzy string matching algorithms analyze variations in applicant spelling, initials placement (e.g. "Abishek Vasanth P" vs "P. Abishek Vasanthan"), and residential address tokens.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-extrabold text-base text-gray-900">Deterministic Statutory Rules</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Checks service-specific rules such as annual income ceilings, educational percentage cutoffs, and 12-digit Aadhaar validity.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="font-extrabold text-base text-gray-900">Interactive Correction Center</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Provides step-by-step plain-language explanations in Tamil and English with in-place resolution and live risk recalculation.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-6">
          <button
            onClick={onStartVerification}
            className="px-6 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <span>{t.hero.startVerification}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (page === 'faq') {
    const faqs = [
      {
        qEn: 'Is GOVCHECK AI an official government portal?',
        qTa: 'GOVCHECK AI அதிகாரப்பூர்வ அரசு தளமா?',
        aEn: 'No. GOVCHECK AI is an independent civic-tech pre-submission verification tool. It assists citizens in identifying and correcting discrepancies prior to submitting on the state or central e-district portals.',
        aTa: 'இல்லை. இது அரசு தளங்களில் விண்ணப்பிப்பதற்கு முன் ஆவணப் பிழைகளை சரிபார்க்க உதவும் ஒரு சுயாதீன உதவித் தளமாகும்.',
      },
      {
        qEn: 'Why do minor name spelling differences matter?',
        qTa: 'பெயரில் சிறிய எழுத்துப் பிழைகள் ஏன் முக்கியம்?',
        aEn: 'Government revenue verification algorithms and manual officers cross-verify submitted applications with identity databases (like Aadhaar or Ration Card). Inconsistencies frequently cause application rejection or delayed inquiries.',
        aTa: 'அரசு அலுவலர்கள் ஆவணங்களுடன் ஒப்பிடும் போது பெயரில் மாறுபாடு இருந்தால் விண்ணப்பம் நிராகரிக்கப்படலாம்.',
      },
      {
        qEn: 'How is the 0-100 rejection risk score calculated?',
        qTa: '0-100 அபாய மதிப்பீடு எவ்வாறு கணக்கிடப்படுகிறது?',
        aEn: 'The score evaluates 4 objective pillars: Document Completeness (max 30 pts), Information Consistency (max 25 pts), Required Fields (max 20 pts), and Rule Criteria (max 25 pts). Scores between 0-20 represent LOW risk.',
        aTa: 'ஆவண முழுமை (30), தகவல் ஒற்றுமை (25), கட்டாய புலங்கள் (20) மற்றும் விதிகள் (25) என 4 தூண்கள் மூலம் கணக்கிடப்படுகிறது.',
      },
      {
        qEn: 'What languages does the AI assistant support?',
        qTa: 'AI உதவியாளர் எந்தெந்த மொழிகளை ஆதரிக்கிறது?',
        aEn: 'The assistant fluently supports English, தமிழ் (Tamil script), and Tanglish (Tamil written in English alphabets).',
        aTa: 'ஆங்கிலம், தமிழ் மற்றும் Tanglish ஆகியவற்றை முழுமையாக ஆதரிக்கிறது.',
      },
    ];

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            {language === 'ta' ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'Help & Guidance'}
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {language === 'ta' ? 'அடிக்கடி கேட்கப்படும் வினாக்கள்' : 'Frequently Asked Questions'}
          </h1>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-2">
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
                <span>{language === 'ta' ? faq.qTa : faq.qEn}</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-6">
                {language === 'ta' ? faq.aTa : faq.aEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // About Page
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
          {language === 'ta' ? 'எங்களைப் பற்றி' : 'Civic-Tech Mission'}
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {language === 'ta' ? 'GOVCHECK AI பற்றி' : 'About GOVCHECK AI'}
        </h1>
        <p className="text-sm text-gray-600">
          {language === 'ta'
            ? 'அரசு சேவைகளை எளிதாகவும் பிழையின்றியும் மக்கள் பெறுவதற்கான டிஜிட்டல் முயற்சி.'
            : 'Bridging the digital divide by empowering citizens with pre-submission verification intelligence.'}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xs space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <p>
          Every year, millions of citizen applications for critical certificates (income, community, residence, scholarships) are rejected or delayed due to preventable administrative defects: blurry document uploads, minor spelling discrepancies, missing attachments, or eligibility misunderstandings.
        </p>
        <p>
          <strong>GOVCHECK AI</strong> acts as a proactive pre-submission sandbox. Citizens can upload documents, evaluate them against statutory rule engines, fix flagged mismatches, and download verification reports before submitting to official state e-district portals.
        </p>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block mb-1">Independent Civic Disclaimer:</strong>
            GOVCHECK AI is an independent software tool for pre-submission verification and risk assessment. It is not an official government approval, rejection, certificate, or statutory decision.
          </div>
        </div>
      </div>
    </div>
  );
};
