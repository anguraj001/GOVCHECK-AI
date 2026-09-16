import React from 'react';
import { X, FileText, Sliders, CheckCircle, AlertTriangle, ShieldCheck, ArrowRight, BookOpen } from 'lucide-react';
import { GovService, Language } from '../types';
import { translations } from '../translations';

interface ServiceDetailsModalProps {
  service: GovService | null;
  language: Language;
  onClose: () => void;
  onStartService: (service: GovService) => void;
}

export const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  service,
  language,
  onClose,
  onStartService,
}) => {
  if (!service) return null;
  const t = translations[language];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          id="btn-service-modal-close"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex items-center gap-2 text-xs font-extrabold text-blue-700 mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200">{service.code}</span>
            <span>v{service.version}</span>
            <span>•</span>
            <span className="text-gray-500">{service.category}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            {language === 'ta' ? service.nameTa : service.nameEn}
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            {language === 'ta' ? service.descriptionTa : service.descriptionEn}
          </p>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto space-y-6 pr-1">
          
          {/* Section: Mandatory Documents */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5 mb-3">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Mandatory & Supporting Document Checklist</span>
            </h4>
            <div className="space-y-2.5">
              {service.documents.map((doc) => (
                <div key={doc.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                      <span>{language === 'ta' ? doc.titleTa : doc.titleEn}</span>
                      {doc.isRequired && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-100 text-red-800 font-extrabold">
                          MANDATORY
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 mt-0.5">
                      {language === 'ta' ? doc.descriptionTa : doc.descriptionEn}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      Accepted Formats: {doc.allowedFormats.join(', ').toUpperCase()} • Max Size: {doc.maxSizeMb} MB
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Configured Rules & Eligibility Criteria */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5 mb-3">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Automated Rules & Statutory Criteria Evaluated</span>
            </h4>
            <div className="space-y-2">
              {service.rules.map((rule) => (
                <div key={rule.id} className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs">
                  <div className="flex items-center justify-between font-bold text-indigo-950 mb-1">
                    <span>{language === 'ta' ? rule.nameTa : rule.nameEn}</span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      rule.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {rule.severity}
                    </span>
                  </div>
                  <p className="text-indigo-900/80 text-[11px] leading-relaxed">
                    {language === 'ta' ? rule.explanationTa : rule.explanationEn}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Civic Notice */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Pre-Submission Notice:</strong> GOVCHECK AI evaluates documents against published statutory rules. Final verification and certificate issuance remain under the sole jurisdiction of authorized revenue officers.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            id="btn-modal-start-verification"
            onClick={() => {
              onClose();
              onStartService(service);
            }}
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <span>Proceed to Pre-Submission Check</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
