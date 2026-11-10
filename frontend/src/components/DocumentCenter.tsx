import React, { useState, useRef } from 'react';
import { EligibilityEvaluation, Language, Scheme } from '../types/scheme';
import { TRANSLATIONS } from '../data/translations';
import { aggregateMissingDocuments } from '../utils/schemeEngine';
import {
  SAMPLE_CITIZEN_DOCS,
  ScannedDocumentAnalysis,
  detectMissingDocumentsReport,
  getDocumentMeta,
  isDocumentOwned,
  scanAndAnalyzeDocumentInput,
} from '../utils/documentHelper';
import { apiUrl } from '../lib/apiUrl';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  FolderOpen,
  Scan,
  UploadCloud,
  Clock,
  Award,
  CheckCheck,
  Search,
  RefreshCw,
} from 'lucide-react';

interface DocumentCenterProps {
  currentLang: Language;
  evaluations: EligibilityEvaluation[];
  allSchemes?: Scheme[];
  userOwnedDocs: Set<string>;
  onToggleDoc: (docKey: string) => void;
  onAddOwnedDoc?: (docKey: string) => void;
  onOpenScanner?: (scheme?: Scheme) => void;
  onOpenSchemeModal?: (scheme: Scheme) => void;
}

export const DocumentCenter: React.FC<DocumentCenterProps> = ({
  currentLang,
  evaluations,
  allSchemes = [],
  userOwnedDocs,
  onToggleDoc,
  onAddOwnedDoc,
  onOpenScanner,
  onOpenSchemeModal,
}) => {
  const t = TRANSLATIONS[currentLang];
  const { allDocs, ownedDocs, missingDocs, readinessPercentage } = aggregateMissingDocuments(
    evaluations,
    userOwnedDocs
  );

  const schemesList =
    allSchemes.length > 0 ? allSchemes : evaluations.map((e) => e.scheme);
  const report = detectMissingDocumentsReport(schemesList, evaluations, userOwnedDocs);

  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [quickOcrInput, setQuickOcrInput] = useState('');
  const [isScanningInline, setIsScanningInline] = useState(false);
  const [inlineScanResult, setInlineScanResult] = useState<ScannedDocumentAnalysis | null>(null);
  const inlineFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleInlineScan = async (payload: {
    fileName?: string;
    rawText?: string;
    sampleKey?: string;
    imageBase64?: string;
    mimeType?: string;
  }) => {
    setIsScanningInline(true);
    let analysis: ScannedDocumentAnalysis | null = null;
    try {
      const res = await fetch(apiUrl('/api/ai/document-scanner'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.analysis) analysis = data.analysis;
      }
    } catch {
      // Offline fallback
    }
    if (!analysis) {
      analysis = scanAndAnalyzeDocumentInput(payload);
    }
    setInlineScanResult(analysis);
    if (onAddOwnedDoc) {
      onAddOwnedDoc(analysis.docKey);
    } else if (!isDocumentOwned(analysis.detectedTitleEn, userOwnedDocs)) {
      onToggleDoc(analysis.docKey);
    }
    setIsScanningInline(false);
  };

  const handleInlineFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        void handleInlineScan({
          fileName: file.name,
          rawText: file.name,
          imageBase64: typeof reader.result === 'string' ? reader.result : '',
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    } else {
      void handleInlineScan({
        fileName: file.name,
        rawText: `${file.name} ${quickOcrInput}`,
      });
    }
  };

  const filterDocItem = (doc: { nameEn: string; namePa: string; nameHi: string; availableOnDigiLocker: boolean }) => {
    const meta = getDocumentMeta(doc.nameEn);
    if (categoryFilter === 'DIGILOCKER' && !doc.availableOnDigiLocker) return false;
    if (categoryFilter === 'MANDATORY' && !meta.isMandatory) return false;
    if (docSearchQuery.trim()) {
      const q = docSearchQuery.toLowerCase().trim();
      const text = `${doc.nameEn} ${doc.namePa} ${doc.nameHi} ${meta.category}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  };

  const filteredMissingDocs = missingDocs.filter(filterDocItem);
  const filteredOwnedDocs = ownedDocs.filter(filterDocItem);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-teal-900 text-white rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 text-xs font-bold px-3 py-1 rounded-full border border-teal-400/30">
              <Scan className="w-3.5 h-3.5" />
              <span>AI Document Scanner &amp; Missing Document Detection Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {t.docTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {t.docSubtitle}
            </p>
          </div>

          {/* Readiness Meter Card */}
          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/15 flex items-center gap-4">
            <div>
              <span className="text-[10px] text-teal-300 uppercase font-semibold">Readiness Score</span>
              <div data-testid="doc-center-readiness-pct" className="text-2xl font-black text-white">
                {readinessPercentage}% Ready
              </div>
              <div className="text-[11px] text-slate-300">
                {ownedDocs.length} of {allDocs.length} documents arranged
              </div>
            </div>

            <div className="w-12 h-12 rounded-full border-4 border-teal-400/40 border-t-emerald-400 flex items-center justify-center font-bold text-xs text-emerald-300">
              {readinessPercentage}%
            </div>
          </div>
        </div>

        {/* Helpful links & Scanner Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-300">Official Verification Portals:</span>
            <a
              href="https://digilocker.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-teal-200 px-3 py-1 rounded-lg transition-colors font-medium"
            >
              <span>DigiLocker India</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://connect.punjab.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-teal-200 px-3 py-1 rounded-lg transition-colors font-medium"
            >
              <span>Connect Punjab (e-Sewa)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://jamabandi.punjab.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-teal-200 px-3 py-1 rounded-lg transition-colors font-medium"
            >
              <span>Punjab Jamabandi Land Records</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {onOpenScanner && (
            <button
              type="button"
              data-testid="open-full-scanner-modal-btn"
              onClick={() => onOpenScanner()}
              className="inline-flex items-center gap-1.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-extrabold px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open Full-Screen AI Document Scanner</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline AI Document OCR & Quick-Scan Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Scan className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>Quick AI Document OCR Scanner &amp; Auto-Verifier</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload a certificate photo/PDF, paste certificate text, or click any sample document badge below to scan and auto-detect missing requirements.
            </p>
          </div>
          {isScanningInline && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              AI Analyzing Document...
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            ref={inlineFileInputRef}
            type="file"
            accept="image/*,.pdf,.txt"
            onChange={handleInlineFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inlineFileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition shrink-0"
          >
            <UploadCloud className="w-4 h-4 text-teal-400" />
            <span>Upload Document / Image</span>
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              data-testid="inline-ocr-input"
              value={quickOcrInput}
              onChange={(e) => setQuickOcrInput(e.target.value)}
              placeholder="Or type/paste certificate name or ID (e.g., Income Certificate PB-INC-2026-44129, Caste Certificate, Bank Passbook)..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            type="button"
            data-testid="inline-ocr-scan-btn"
            onClick={() => {
              if (!quickOcrInput.trim()) return;
              void handleInlineScan({ rawText: quickOcrInput.trim() });
              setQuickOcrInput('');
            }}
            className="inline-flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Scan &amp; Verify</span>
          </button>
        </div>

        {/* 1-Click Sample Scan Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">
            1-Click AI Scan Sample:
          </span>
          {SAMPLE_CITIZEN_DOCS.slice(0, 7).map((sample) => {
            const owned = isDocumentOwned(sample.nameEn, userOwnedDocs);
            return (
              <button
                key={sample.key}
                type="button"
                data-testid={`doc-center-sample-${sample.canonicalKey}`}
                onClick={() =>
                  void handleInlineScan({
                    sampleKey: sample.key,
                    rawText: sample.sampleOcrText,
                    fileName: `${sample.canonicalKey}.pdf`,
                  })
                }
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  owned
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                }`}
              >
                {owned ? '✓ ' : '+ Scan '}
                {sample.nameEn.split(' (')[0]}
              </button>
            );
          })}
        </div>

        {inlineScanResult && (
          <div
            data-testid="inline-scan-result-banner"
            className="rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-800 p-3 flex flex-wrap items-center justify-between gap-2 text-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
              <div>
                <strong className="text-slate-900 dark:text-white">
                  AI Verified: {inlineScanResult.detectedTitleEn}
                </strong>{' '}
                <span className="text-slate-600 dark:text-slate-300">
                  ({inlineScanResult.extractedIdNumber} • {inlineScanResult.issuingAuthority})
                </span>
                <p className="text-[11px] text-teal-800 dark:text-teal-300 mt-0.5">
                  {inlineScanResult.validityAdvisoryEn}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold bg-teal-700 text-white px-2.5 py-1 rounded-full">
              {inlineScanResult.confidenceScore}% Confidence
            </span>
          </div>
        )}
      </div>

      {/* Scheme Unlock Readiness Callout Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/25 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-extrabold text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Schemes 100% Document-Ready to Apply ({report.profileWide.readyToApplySchemeTitles.length})
              </span>
            </h3>
            <span className="text-[10px] font-bold bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-md">
              Zero Missing Docs
            </span>
          </div>
          {report.profileWide.readyToApplySchemeTitles.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {report.profileWide.readyToApplySchemeTitles.slice(0, 6).map((title, i) => {
                const schemeId = report.profileWide.readyToApplySchemeIds[i];
                const schemeObj = schemesList.find((s) => s.id === schemeId);
                return (
                  <button
                    key={schemeId || i}
                    type="button"
                    onClick={() => schemeObj && onOpenSchemeModal?.(schemeObj)}
                    className="text-[11px] font-semibold bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition cursor-pointer text-left truncate max-w-full"
                  >
                    ✓ {title}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
              Scan or tick your Aadhaar, Income, and Bank Passbook documents below to unlock 100% ready schemes!
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/25 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-extrabold text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>
                Almost Ready — Missing Only 1 Document ({report.profileWide.almostReadySchemeTitles.length})
              </span>
            </h3>
            <span className="text-[10px] font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded-md">
              High Priority
            </span>
          </div>
          {report.profileWide.almostReadySchemeTitles.length > 0 ? (
            <div className="space-y-1.5 pt-1 max-h-28 overflow-y-auto">
              {report.profileWide.almostReadySchemeTitles.slice(0, 4).map((item) => (
                <div
                  key={item.schemeId}
                  className="text-[11px] bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {item.titleEn}
                  </span>
                  <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-300 shrink-0">
                    Needs: {item.missingDocName.split(' (')[0]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
              No schemes are currently waiting on a single document.
            </p>
          )}
        </div>
      </div>

      {/* Search & Filter Controls for Document Checklist */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={docSearchQuery}
            onChange={(e) => setDocSearchQuery(e.target.value)}
            placeholder="Search required documents by name, category, or issuing authority..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { id: 'ALL', label: `All (${allDocs.length})` },
            { id: 'MANDATORY', label: 'Mandatory Only' },
            { id: 'DIGILOCKER', label: 'DigiLocker Ready' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Documents: Missing vs Owned */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Missing Documents Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-rose-200 dark:border-rose-900">
            <h3 className="font-bold text-sm text-rose-900 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>
                {t.docsMissing} ({filteredMissingDocs.length})
              </span>
            </h3>
            <span className="text-[11px] text-rose-700 dark:text-rose-300 font-semibold bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
              Action Required
            </span>
          </div>

          {filteredMissingDocs.length > 0 ? (
            <div className="space-y-2.5">
              {filteredMissingDocs.map((doc) => {
                const docTitle =
                  currentLang === 'pa' ? doc.namePa : currentLang === 'hi' ? doc.nameHi : doc.nameEn;
                const docKey = doc.nameEn.toLowerCase().trim();
                const meta = getDocumentMeta(doc.nameEn);
                const howToGet =
                  currentLang === 'pa'
                    ? meta.howToObtainPa
                    : currentLang === 'hi'
                    ? meta.howToObtainHi
                    : meta.howToObtainEn;

                return (
                  <div
                    key={doc.nameEn}
                    className="p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl border border-rose-200/80 dark:border-rose-900/60 shadow-xs transition-all space-y-2.5 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => onToggleDoc(docKey)}
                          aria-label={`Mark ${docTitle} as owned`}
                          className="mt-1 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{meta.emoji}</span>
                            <span>{docTitle}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Issuing Authority:{' '}
                            <strong className="text-slate-700 dark:text-slate-200">{doc.issuingAuthority}</strong>
                          </div>
                          <div className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 mt-1">
                            Unlocks {doc.requiredBySchemes.length} Scheme(s):{' '}
                            {doc.requiredBySchemes.slice(0, 2).join(', ')}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1">
                        {doc.availableOnDigiLocker && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            On DigiLocker
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onToggleDoc(docKey)}
                          className="text-[10px] font-bold text-white bg-teal-700 hover:bg-teal-800 px-2.5 py-1 rounded-md cursor-pointer transition"
                        >
                          Mark as Have
                        </button>
                      </div>
                    </div>

                    <div className="pl-6 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="line-clamp-1 max-w-md">{howToGet}</span>
                      <div className="flex items-center gap-2 shrink-0 font-semibold">
                        <span className="inline-flex items-center gap-0.5 text-slate-600 dark:text-slate-300">
                          <Clock className="w-3 h-3 text-blue-600" />
                          {meta.estimatedDays}
                        </span>
                        <a
                          href={meta.officialPortalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-blue-700 dark:text-blue-400 hover:underline font-bold"
                        >
                          <span>{meta.officialPortalName}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800 dark:text-white">
                All required documents are marked as owned!
              </p>
              <p className="text-[11px] mt-0.5 text-slate-400">
                You are 100% ready to apply on official portals.
              </p>
            </div>
          )}
        </div>

        {/* Owned Documents Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-900">
            <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {t.docsOwned} ({filteredOwnedDocs.length})
              </span>
            </h3>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
              Verified &amp; Ready
            </span>
          </div>

          {filteredOwnedDocs.length > 0 ? (
            <div className="space-y-2.5">
              {filteredOwnedDocs.map((doc) => {
                const docTitle =
                  currentLang === 'pa' ? doc.namePa : currentLang === 'hi' ? doc.nameHi : doc.nameEn;
                const docKey = doc.nameEn.toLowerCase().trim();
                const meta = getDocumentMeta(doc.nameEn);

                return (
                  <div
                    key={doc.nameEn}
                    onClick={() => onToggleDoc(docKey)}
                    className="p-3.5 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70 rounded-xl border border-emerald-200 dark:border-emerald-900/60 shadow-xs cursor-pointer transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => {}}
                        aria-label={`Remove ${docTitle} from owned`}
                        className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-800 flex items-center gap-1.5">
                          <span>{meta.emoji}</span>
                          <span>{docTitle}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Issuing Authority:{' '}
                          <strong className="text-slate-700 dark:text-slate-200">{doc.issuingAuthority}</strong>
                        </div>
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                          Covers {doc.requiredBySchemes.length} eligible scheme(s)
                        </div>
                      </div>
                    </div>

                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0">
                      ✓ Arranged
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p>
                Tick the documents on the left or scan them above to see your readiness score climb!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
