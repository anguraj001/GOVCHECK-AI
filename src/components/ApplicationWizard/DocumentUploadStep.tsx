import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Eye, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { GovService, Application, Language, UploadedDocument } from '../../types';
import { translations } from '../../translations';
import { api } from '../../services/api';

interface DocumentUploadStepProps {
  service: GovService;
  application: Application;
  language: Language;
  onApplicationUpdate: (app: Application) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
  service,
  application,
  language,
  onApplicationUpdate,
  onNext,
  onBack,
}) => {
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const t = translations[language];

  const uploadedDocs = application.uploadedDocuments || [];
  const uploadedTypeMap = new Map<string, UploadedDocument>(uploadedDocs.map((d) => [d.docTypeKey, d]));

  const handleFileUpload = async (docTypeKey: string, file: File) => {
    setErrorMessage('');
    setUploadingSlot(docTypeKey);

    try {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit.');
      }

      // Read file as base64 Data URL
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const fileDataUrl = await base64Promise;

      const { application: updatedApp } = await api.uploadDocument(application.id, {
        docTypeKey,
        fileName: file.name,
        fileType: file.type || 'application/pdf',
        fileSize: file.size,
        fileDataUrl,
      });

      onApplicationUpdate(updatedApp);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload and analyze document.');
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleSampleUpload = async (docTypeKey: string, sampleType: 'valid' | 'blurry' | 'mismatch') => {
    setErrorMessage('');
    setUploadingSlot(docTypeKey);

    let fileName = `sample_${docTypeKey}.pdf`;
    if (sampleType === 'blurry') fileName = `sample_blurry_${docTypeKey}.jpg`;
    if (sampleType === 'mismatch') fileName = `sample_name_mismatch_${docTypeKey}.pdf`;

    try {
      const { application: updatedApp } = await api.uploadDocument(application.id, {
        docTypeKey,
        fileName,
        fileType: sampleType === 'blurry' ? 'image/jpeg' : 'application/pdf',
        fileSize: 185000,
      });

      onApplicationUpdate(updatedApp);
    } catch (err: any) {
      setErrorMessage(err.message || 'Sample load failed');
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const { application: updatedApp } = await api.deleteDocument(application.id, docId);
      onApplicationUpdate(updatedApp);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove document');
    }
  };

  const requiredSlots = service.documents.filter((d) => d.isRequired);
  const allRequiredUploaded = requiredSlots.every((s) => uploadedTypeMap.has(s.docTypeKey));

  return (
    <div className="space-y-6">
      
      {/* Step Header */}
      <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-blue-900">
              {language === 'ta' ? 'ஆவண பதிவேற்றம் மற்றும் சரிபார்ப்பு' : 'Mandatory Document Upload & Multimodal OCR'}
            </h3>
            <p className="text-xs text-blue-800/80 mt-0.5">
              {language === 'ta'
                ? 'ஒவ்வொரு தேவைக்கும் தொடர்புடைய ஆவணங்களை பதிவேற்றவும் அல்லது உடனடி மாதிரி சோதனையைப் பயன்படுத்தவும்.'
                : 'Attach clear PDFs or JPG scans for each requirement. Multimodal OCR will extract parameters and assess readability.'}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white rounded-xl border border-blue-200 text-xs font-bold text-blue-800">
          <span>{uploadedDocs.length} / {service.documents.length} Uploaded</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
          {errorMessage}
        </div>
      )}

      {/* Document Slot List */}
      <div className="space-y-4">
        {service.documents.map((docSlot) => {
          const uploaded = uploadedTypeMap.get(docSlot.docTypeKey);
          const isSlotLoading = uploadingSlot === docSlot.docTypeKey;

          return (
            <div
              key={docSlot.id}
              className={`p-5 rounded-2xl border transition-all ${
                uploaded
                  ? 'bg-white border-emerald-200 shadow-xs'
                  : docSlot.isRequired
                  ? 'bg-white border-gray-300'
                  : 'bg-gray-50/60 border-gray-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Left Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-gray-900">
                      {language === 'ta' ? docSlot.titleTa : docSlot.titleEn}
                    </h4>
                    {docSlot.isRequired ? (
                      <span className="px-2 py-0.2 rounded text-[10px] font-extrabold bg-red-100 text-red-800">
                        MANDATORY
                      </span>
                    ) : (
                      <span className="px-2 py-0.2 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                        OPTIONAL
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {language === 'ta' ? docSlot.descriptionTa : docSlot.descriptionEn}
                  </p>
                  <span className="text-[10px] text-gray-400 block">
                    Supported: {docSlot.allowedFormats.join(', ').toUpperCase()} • Max: {docSlot.maxSizeMb}MB
                  </span>
                </div>

                {/* Right Upload Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {uploaded ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(uploaded.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      
                      {/* Real File Input */}
                      <label className="cursor-pointer px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 shadow-2xs transition-colors flex items-center gap-1.5">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(docSlot.docTypeKey, e.target.files[0]);
                            }
                          }}
                        />
                      </label>

                      {/* Instant Sample Loaders */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isSlotLoading}
                          onClick={() => handleSampleUpload(docSlot.docTypeKey, 'valid')}
                          className="px-2.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold rounded-xl transition-colors flex items-center gap-1"
                          title="Load valid sample document"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Sample Proof</span>
                        </button>
                        <button
                          type="button"
                          disabled={isSlotLoading}
                          onClick={() => handleSampleUpload(docSlot.docTypeKey, 'blurry')}
                          className="px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold rounded-xl border border-amber-200 transition-colors"
                          title="Load blurry scan to test quality detection"
                        >
                          Blur Test
                        </button>
                      </div>

                    </div>
                  )}
                </div>

              </div>

              {/* Uploaded File Details & AI Extraction Preview */}
              {uploaded && (
                <div className="mt-4 pt-3 border-t border-gray-100 bg-gray-50/80 rounded-xl p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium text-gray-800">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold">{uploaded.fileName}</span>
                      <span className="text-[10px] text-gray-400">({(uploaded.fileSize / 1024).toFixed(0)} KB)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        OCR Confidence: {Math.round((uploaded.extractions?.confidence || 0.92) * 100)}%
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        uploaded.extractions?.readability === 'poor' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        Readability: {uploaded.extractions?.readability?.toUpperCase() || 'GOOD'}
                      </span>
                    </div>
                  </div>

                  {/* Extracted Fields Pill Summary */}
                  {uploaded.extractions?.extractedFields && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] font-bold text-gray-500">Extracted Values:</span>
                      {Object.entries(uploaded.extractions.extractedFields).map(([k, v]) => (
                        <span key={k} className="px-2 py-0.5 bg-white border border-gray-200 rounded-md text-[11px] text-gray-700">
                          <strong className="text-gray-500">{k}:</strong> {String(v)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quality Warnings */}
                  {uploaded.extractions?.qualityIssues && uploaded.extractions.qualityIssues.length > 0 && (
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{uploaded.extractions.qualityIssues.join('; ')}</span>
                    </div>
                  )}
                </div>
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
          <span>{language === 'ta' ? 'படிவத்திற்கு திரும்பு' : 'Back to Form'}</span>
        </button>

        <button
          id="btn-wizard-upload-next"
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
        >
          <span>{language === 'ta' ? 'சரிபார்ப்பை தொடங்கு' : 'Run Pre-Submission Verification'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
