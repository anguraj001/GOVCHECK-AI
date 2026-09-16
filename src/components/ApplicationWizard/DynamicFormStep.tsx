import React, { useState } from 'react';
import { GovService, Language } from '../../types';
import { translations } from '../../translations';
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface DynamicFormStepProps {
  service: GovService;
  formData: Record<string, any>;
  onFormDataChange: (data: Record<string, any>) => void;
  language: Language;
  onNext: () => void;
  onBack: () => void;
}

export const DynamicFormStep: React.FC<DynamicFormStepProps> = ({
  service,
  formData,
  onFormDataChange,
  language,
  onNext,
  onBack,
}) => {
  const [localData, setLocalData] = useState<Record<string, any>>({ ...formData });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const t = translations[language];

  const handleFieldChange = (key: string, value: any) => {
    const updated = { ...localData, [key]: value };
    setLocalData(updated);
    onFormDataChange(updated);

    // Clear error for this field
    if (errors[key]) {
      const copy = { ...errors };
      delete copy[key];
      setErrors(copy);
    }
  };

  const validateAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    service.fields.forEach((field) => {
      if (field.isRequired) {
        const val = localData[field.fieldKey];
        if (val === undefined || val === null || String(val).trim() === '') {
          newErrors[field.fieldKey] = `${language === 'ta' ? field.labelTa : field.labelEn} is required.`;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={validateAndProceed} className="space-y-6">
      
      {/* Form Introduction Header */}
      <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-blue-900">
            {language === 'ta' ? 'விண்ணப்ப படிவ விவரங்கள்' : 'Application Parameters & Information'}
          </h3>
          <p className="text-xs text-blue-800/80 mt-0.5">
            {language === 'ta'
              ? 'கீழே உள்ள புலங்களை துல்லியமாக நிரப்பவும். இது ஆவணங்களுடன் ஒப்பீடு செய்யப்படும்.'
              : 'Fill in the service fields below. The cross-document engine will compare these against your uploaded proofs.'}
          </p>
        </div>
      </div>

      {/* Dynamic Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {service.fields.map((field) => {
          const fieldError = errors[field.fieldKey];
          const val = localData[field.fieldKey] ?? '';

          return (
            <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {language === 'ta' ? field.labelTa : field.labelEn}
                {field.isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === 'select' ? (
                <select
                  id={`field-${field.fieldKey}`}
                  value={val}
                  onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
                  className={`w-full text-xs border rounded-xl px-3 py-2.5 outline-hidden transition-colors ${
                    fieldError ? 'border-red-500 bg-red-50/30' : 'border-gray-300 focus:border-blue-600 bg-white'
                  }`}
                >
                  <option value="">{language === 'ta' ? '-- தேர்ந்தெடுக்கவும் --' : '-- Select Option --'}</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {language === 'ta' ? opt.labelTa : opt.labelEn}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={`field-${field.fieldKey}`}
                  rows={3}
                  value={val}
                  onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
                  placeholder={language === 'ta' ? field.placeholderTa : field.placeholderEn}
                  className={`w-full text-xs border rounded-xl px-3 py-2.5 outline-hidden transition-colors ${
                    fieldError ? 'border-red-500 bg-red-50/30' : 'border-gray-300 focus:border-blue-600 bg-white'
                  }`}
                />
              ) : (
                <input
                  id={`field-${field.fieldKey}`}
                  type={field.type === 'number' ? 'number' : (field.type === 'date' ? 'date' : 'text')}
                  value={val}
                  onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
                  placeholder={language === 'ta' ? field.placeholderTa : field.placeholderEn}
                  className={`w-full text-xs border rounded-xl px-3 py-2.5 outline-hidden transition-colors ${
                    fieldError ? 'border-red-500 bg-red-50/30' : 'border-gray-300 focus:border-blue-600 bg-white'
                  }`}
                />
              )}

              {fieldError ? (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{fieldError}</span>
                </p>
              ) : (
                field.helpTextEn && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    {language === 'ta' ? field.helpTextTa : field.helpTextEn}
                  </p>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'ta' ? 'பின்செல்' : 'Back'}</span>
        </button>

        <button
          id="btn-wizard-form-next"
          type="submit"
          className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
        >
          <span>{language === 'ta' ? 'அடுத்து: ஆவண பதிவேற்றம்' : 'Proceed to Document Upload'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </form>
  );
};
