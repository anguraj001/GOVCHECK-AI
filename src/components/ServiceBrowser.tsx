import React, { useState } from 'react';
import { 
  Search, 
  Layers, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Info, 
  Sliders, 
  ShieldCheck, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { GovService, Language } from '../types';
import { translations } from '../translations';

interface ServiceBrowserProps {
  services: GovService[];
  language: Language;
  onSelectService: (service: GovService) => void;
  onViewServiceDetails: (service: GovService) => void;
}

export const ServiceBrowser: React.FC<ServiceBrowserProps> = ({
  services,
  language,
  onSelectService,
  onViewServiceDetails,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const t = translations[language];

  const categories = [
    { id: 'ALL', labelEn: 'All Services', labelTa: 'அனைத்து சேவைகள்' },
    { id: 'Certificates', labelEn: 'Revenue Certificates', labelTa: 'வருவாய்த் துறை சான்றிதழ்கள்' },
    { id: 'Education', labelEn: 'Scholarships & Higher Ed', labelTa: 'கல்வி உதவித்தொகை' },
    { id: 'Welfare', labelEn: 'Social Welfare & Grants', labelTa: 'சமூக நலன் & மானியங்கள்' },
  ];

  const filteredServices = services.filter((s) => {
    const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
    const matchesSearch = 
      s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameTa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Catalog Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
          {language === 'ta' ? 'அரசு சேவைகள் பட்டியல்' : 'Official Pre-Verification Catalog'}
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {language === 'ta' ? 'கிடைக்கும் அரசு சேவைகள்' : 'Explore Configured Government Services'}
        </h1>
        <p className="text-sm text-gray-600">
          {language === 'ta'
            ? 'ஒவ்வொரு சேவைக்கும் தேவையான ஆவணங்கள், தகுதி விதிகள் மற்றும் படிவ விவரங்களை முன்கூட்டியே சரிபார்க்கவும்.'
            : 'Select a service to inspect documentary requirements, eligibility rules, and run end-to-end pre-submission verification.'}
        </p>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {language === 'ta' ? cat.labelTa : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            id="input-services-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ta' ? 'சேவையைத் தேடுக...' : 'Search by service name or code...'}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-hidden"
          />
        </div>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div>
              
              {/* Card Meta Top */}
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  {service.code}
                </span>
                <div className="flex items-center gap-1 text-gray-400 text-[11px]">
                  <span>v{service.version}</span>
                  <span>•</span>
                  <span>{service.category}</span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="font-extrabold text-base text-gray-900 mb-2">
                {language === 'ta' ? service.nameTa : service.nameEn}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">
                {language === 'ta' ? service.descriptionTa : service.descriptionEn}
              </p>

              {/* Requirement Summary Badges */}
              <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Required Documents:
                  </span>
                  <span className="font-bold text-gray-900">{service.documents.length} files</span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    Configured Rules:
                  </span>
                  <span className="font-bold text-gray-900">{service.rules.length} rules</span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Form Fields:
                  </span>
                  <span className="font-bold text-gray-900">{service.fields.length} parameters</span>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2.5">
              <button
                id={`btn-service-view-${service.id}`}
                onClick={() => onViewServiceDetails(service)}
                className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'விவரங்கள்' : 'Requirements'}</span>
              </button>

              <button
                id={`btn-service-start-${service.id}`}
                onClick={() => onSelectService(service)}
                className="flex-1 py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1"
              >
                <span>{language === 'ta' ? 'சரிபார்க்க' : 'Start Check'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
