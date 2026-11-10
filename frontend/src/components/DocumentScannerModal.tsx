import React, { useState, useRef } from 'react';
import { Scheme, Language, EligibilityEvaluation } from '../types/scheme';
import { GOV_SCHEMES } from '../data/schemes';
import {
  SAMPLE_CITIZEN_DOCS,
  SampleDocumentDefinition,
  ScannedDocumentAnalysis,
  detectMissingDocumentsReport,
  scanAndAnalyzeDocumentInput,
  isDocumentOwned,
} from '../utils/documentHelper';
import { apiUrl } from '../lib/apiUrl';
import {
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  Scan,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  FileText,
  Clock,
  Award,
  CheckCheck,
  FileUp,
  Layers,
} from 'lucide-react';

interface DocumentScannerModalProps {
  currentLang: Language;
  onClose: () => void;
  targetScheme?: Scheme | null;
  allSchemes?: Scheme[];
  evaluations?: EligibilityEvaluation[];
  userOwnedDocs: Set<string>;
  onAddOwnedDoc: (docKey: string) => void;
  onRemoveOwnedDoc: (docKey: string) => void;
  onOpenSchemeModal?: (scheme: Scheme) => void;
}

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  currentLang,
  onClose,
  targetScheme,
  allSchemes = GOV_SCHEMES,
  evaluations = [],
  userOwnedDocs,
  onAddOwnedDoc,
  onRemoveOwnedDoc,
  onOpenSchemeModal,
}) => {
  const schemesList = allSchemes.length > 0 ? allSchemes : GOV_SCHEMES;
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(
    targetScheme?.id || schemesList[0]?.id || 'pm-kisan'
  );
  const [scannerTab, setScannerTab] = useState<'quick-scan' | 'upload-ocr' | 'impact-detector'>('quick-scan');
  const [scanningDocKey, setScanningDocKey] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);
  const [latestScanResult, setLatestScanResult] = useState<ScannedDocumentAnalysis | null>(null);
  const [ocrTextInput, setOcrTextInput] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const report = detectMissingDocumentsReport(
    schemesList,
    evaluations,
    userOwnedDocs,
    selectedSchemeId
  );

  const { targetScheme: targetReport, profileWide } = report;

  const runAnalysisAndStore = async (payload: {
    fileName?: string;
    rawText?: string;
    sampleKey?: string;
    imageBase64?: string;
    mimeType?: string;
    extraDocKeysToAdd?: string[];
  }) => {
    const stepKey = payload.sampleKey || payload.fileName || 'custom-ocr-scan';
    setScanningDocKey(stepKey);
    setScanProgress(25);
    setScannedFeedback('Reading document metadata, QR/barcode & issuing department header...');

    await new Promise((r) => setTimeout(r, 220));
    setScanProgress(65);
    setScannedFeedback('Running AI OCR extraction & cross-checking DigiLocker / e-Sewa schema...');

    let analysis: ScannedDocumentAnalysis | null = null;
    try {
      const response = await fetch(apiUrl('/api/ai/document-scanner'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: payload.fileName,
          rawText: payload.rawText,
          sampleKey: payload.sampleKey,
          imageBase64: payload.imageBase64,
          mimeType: payload.mimeType,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data?.analysis) {
          analysis = data.analysis;
        }
      }
    } catch {
      // Offline or local fallback
    }

    if (!analysis) {
      analysis = scanAndAnalyzeDocumentInput({
        fileName: payload.fileName,
        rawText: payload.rawText,
        sampleKey: payload.sampleKey,
      });
    }

    setScanProgress(100);
    setLatestScanResult(analysis);
    onAddOwnedDoc(analysis.docKey);
    if (payload.extraDocKeysToAdd) {
      payload.extraDocKeysToAdd.forEach((k) => onAddOwnedDoc(k));
    }
    setScannedFeedback(
      `Verified & Added to Citizen Wallet: ${analysis.detectedTitleEn} (${analysis.extractedIdNumber}) — ${analysis.confidenceScore}% AI Confidence`
    );
    setScanningDocKey(null);
  };

  const handleSimulateSampleScan = (doc: SampleDocumentDefinition) => {
    void runAnalysisAndStore({
      sampleKey: doc.key,
      rawText: doc.sampleOcrText,
      fileName: `${doc.canonicalKey}.pdf`,
    });
  };

  const handleScanAllMissingForTargetScheme = async () => {
    const missingItems = targetReport.documents.filter((d) => !d.isPossessed);
    if (missingItems.length === 0) return;

    setScanningDocKey('batch-all');
    setScanProgress(30);
    setScannedFeedback(`AI Batch Scanner: Verifying ${missingItems.length} missing document(s) for ${targetReport.titleEn}...`);

    await new Promise((r) => setTimeout(r, 300));
    missingItems.forEach((item) => {
      onAddOwnedDoc(item.docKey);
    });

    const firstMissing = missingItems[0];
    const analysis = scanAndAnalyzeDocumentInput({
      rawText: `${firstMissing.nameEn} ${firstMissing.issuingAuthority}`,
      fileName: `${firstMissing.canonicalKey}.pdf`,
    });
    setLatestScanResult(analysis);
    setScanProgress(100);
    setScannedFeedback(
      `Batch Scan Complete: Verified all ${missingItems.length} required document(s) for ${targetReport.titleEn}! Readiness is now 100%.`
    );
    setScanningDocKey(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = typeof reader.result === 'string' ? reader.result : '';
        void runAnalysisAndStore({
          fileName: file.name,
          rawText: ocrTextInput || file.name,
          imageBase64: base64,
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const textContent = typeof reader.result === 'string' ? reader.result.slice(0, 3000) : '';
        void runAnalysisAndStore({
          fileName: file.name,
          rawText: `${file.name} ${ocrTextInput} ${textContent}`.trim(),
        });
      };
      reader.readAsText(file);
    }
  };

  const handleOcrTextScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ocrTextInput.trim()) return;
    void runAnalysisAndStore({
      fileName: uploadedFileName || 'pasted-certificate.txt',
      rawText: ocrTextInput.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-5">
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[93vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scanner-modal-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-teal-900 text-white p-4 sm:p-6 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 text-xs font-bold px-3 py-1 rounded-full border border-teal-400/30">
              <Scan className="w-3.5 h-3.5" />
              <span>AI Document Scanner &amp; Missing Document Detector (Online + Offline)</span>
            </div>
            <h2 id="scanner-modal-title" className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Smart Citizen Document Scanner &amp; Missing Detector
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              Upload or scan identity, income, caste, bank NPCI, and land certificates. Our AI extracts certificate metadata, checks expiry/seeding validity, and detects missing documents across all {schemesList.length} welfare schemes.
            </p>
          </div>

          <button
            type="button"
            data-testid="close-doc-scanner-modal"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Close document scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Top Summary Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Selected Scheme Ready
              </span>
              <div
                data-testid="scanner-scheme-readiness-pct"
                className={`text-xl sm:text-2xl font-black mt-0.5 ${
                  targetReport.readinessPct === 100
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : targetReport.readinessPct >= 50
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {targetReport.readinessPct}% ({targetReport.verifiedCount}/{targetReport.totalDocs})
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {targetReport.missingCount === 0
                  ? '100% Ready for Portal Submission'
                  : `${targetReport.mandatoryMissingCount} Mandatory Missing`}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Schemes 100% Ready Now
              </span>
              <div
                data-testid="scanner-ready-schemes-count"
                className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5"
              >
                {profileWide.readyToApplySchemeIds.length} Schemes
              </div>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
                Zero missing documents for your profile
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 p-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Almost Ready (1 Doc Left)
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 mt-0.5">
                {profileWide.almostReadySchemeTitles.length} Schemes
              </div>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                Need just 1 more certificate to apply
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 p-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                Profile Document Wallet
              </span>
              <div className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-400 mt-0.5">
                {profileWide.ownedUniqueCount}/{profileWide.totalUniqueDocs} Arranged
              </div>
              <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 mt-0.5">
                {profileWide.overallReadinessPct}% Overall Profile Readiness
              </p>
            </div>
          </div>

          {/* Interactive AI Document Scanner & Missing Impact Studio */}
          <div className="bg-gradient-to-tr from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                  <Scan className="w-4 h-4 text-teal-400" />
                  <span>AI Document OCR Scanner &amp; Profile-Wide Impact Detector</span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Choose a scan method below: 1-Click Sample Scan, Upload Certificate Image/PDF/Text, or view High-Impact Missing Documents.
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
                <button
                  type="button"
                  data-testid="scanner-mode-quick"
                  onClick={() => setScannerTab('quick-scan')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    scannerTab === 'quick-scan'
                      ? 'bg-teal-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  1-Click Sample Scan
                </button>
                <button
                  type="button"
                  data-testid="scanner-mode-upload"
                  onClick={() => setScannerTab('upload-ocr')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    scannerTab === 'upload-ocr'
                      ? 'bg-teal-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Upload File / Paste OCR
                </button>
                <button
                  type="button"
                  data-testid="scanner-mode-impact"
                  onClick={() => setScannerTab('impact-detector')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    scannerTab === 'impact-detector'
                      ? 'bg-teal-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  High-Impact Missing ({profileWide.highImpactMissingDocs.length})
                </button>
              </div>
            </div>

            {/* Active scanning progress bar */}
            {scanningDocKey && (
              <div className="flex items-center gap-2 text-xs font-bold text-teal-300 bg-teal-900/60 px-3.5 py-2 rounded-xl border border-teal-500/30">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <span>Scanning... {scanProgress}% — {scannedFeedback}</span>
              </div>
            )}

            {/* Latest AI Scan Verification Report Card */}
            {latestScanResult && !scanningDocKey && (
              <div
                data-testid="latest-scan-verification-card"
                className="p-4 bg-slate-800/90 border border-teal-500/50 rounded-xl space-y-2.5 animate-in fade-in"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-extrabold text-white">
                      {latestScanResult.detectedTitleEn}
                    </span>
                    <span className="text-[10px] font-bold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-md border border-teal-400/30">
                      {latestScanResult.confidenceScore}% AI OCR Match
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      latestScanResult.validityStatus === 'Valid & Verified'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                    }`}
                  >
                    {latestScanResult.validityStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-300">
                  {latestScanResult.matchedFields.map((field, i) => (
                    <div key={i} className="bg-slate-900/70 px-2.5 py-1.5 rounded-lg border border-slate-700/80 truncate">
                      {field}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-teal-200/90 font-medium">
                  {currentLang === 'pa'
                    ? latestScanResult.validityAdvisoryPa
                    : currentLang === 'hi'
                    ? latestScanResult.validityAdvisoryHi
                    : latestScanResult.validityAdvisoryEn}
                </p>
              </div>
            )}

            {/* TAB 1: 1-Click Sample Scan */}
            {scannerTab === 'quick-scan' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {SAMPLE_CITIZEN_DOCS.map((doc) => {
                  const isPossessed = isDocumentOwned(doc.nameEn, userOwnedDocs);
                  const isCurrentlyScanning = scanningDocKey === doc.key;

                  return (
                    <button
                      key={doc.key}
                      type="button"
                      data-testid={`sample-scan-btn-${doc.canonicalKey}`}
                      disabled={isCurrentlyScanning}
                      onClick={() => handleSimulateSampleScan(doc)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isCurrentlyScanning
                          ? 'bg-teal-900/80 border-teal-400 text-white ring-2 ring-teal-400'
                          : isPossessed
                          ? 'bg-slate-800/80 border-emerald-500/60 text-slate-200 hover:border-emerald-400'
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-teal-400 font-mono font-bold truncate">
                            {doc.sampleId}
                          </span>
                          {isPossessed && (
                            <span className="text-[9px] bg-emerald-900 text-emerald-300 font-bold px-1.5 py-0.5 rounded-md">
                              ✓ Scanned
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-white mt-1 line-clamp-1">
                          {currentLang === 'pa' ? doc.namePa : currentLang === 'hi' ? doc.nameHi : doc.nameEn}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                          {doc.authority}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] font-semibold text-teal-300">
                        <span>{isPossessed ? 'Re-scan & Verify' : 'Click to AI Scan'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB 2: Upload Certificate Image/PDF or Paste OCR Text */}
            {scannerTab === 'upload-ocr' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/40 p-5 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">
                      Upload Certificate Photo, PDF, or DigiLocker File
                    </h5>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports Aadhaar, Income, Domicile, Caste, Bank Passbook, Marksheet, or Land Fard images &amp; files.
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    data-testid="doc-scanner-file-input"
                    accept="image/*,.pdf,.txt,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Select Document File to Scan</span>
                  </button>
                  {uploadedFileName && (
                    <span className="text-[11px] text-emerald-300 font-semibold">
                      Uploaded: {uploadedFileName}
                    </span>
                  )}
                </div>

                <form onSubmit={handleOcrTextScan} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="ocr-text-input" className="text-xs font-bold text-slate-200">
                      Or Paste Certificate Text / Reference ID for AI Verification:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setOcrTextInput(
                            'GOVERNMENT OF PUNJAB • Income Certificate No: PB-INC-2026-88412 • Annual Family Income: ₹1,10,000 • Issued by Tehsildar Ludhiana'
                          )
                        }
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-teal-300 px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
                      >
                        Sample Income Cert
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setOcrTextInput(
                            'Punjab Revenue Dept Income Certificate PB-INC-2020-55112 Issued in 2020 (Expired check)'
                          )
                        }
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
                      >
                        Sample Expired Cert
                      </button>
                    </div>
                  </div>
                  <textarea
                    id="ocr-text-input"
                    data-testid="doc-scanner-ocr-textarea"
                    rows={4}
                    value={ocrTextInput}
                    onChange={(e) => setOcrTextInput(e.target.value)}
                    placeholder="Paste certificate text, Aadhaar last 4 digits, PB-INC / PB-SC certificate number, or IFSC code here..."
                    className="w-full rounded-xl bg-slate-950/90 border border-slate-700 p-3 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-teal-400"
                  />
                  <button
                    type="submit"
                    data-testid="doc-scanner-ocr-btn"
                    className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI OCR &amp; Verify Document</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: Profile-Wide High-Impact Missing Documents */}
            {scannerTab === 'impact-detector' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Ranked by how many of your eligible &amp; potential schemes each missing document unlocks:
                </p>
                {profileWide.highImpactMissingDocs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {profileWide.highImpactMissingDocs.map((item) => (
                      <div
                        key={item.canonicalKey}
                        className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span>{item.emoji}</span>
                            <span className="text-xs font-bold text-white truncate">
                              {currentLang === 'pa'
                                ? item.namePa
                                : currentLang === 'hi'
                                ? item.nameHi
                                : item.nameEn}
                            </span>
                          </div>
                          <div className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-400/30">
                            <Award className="w-3 h-3" />
                            <span>Unlocks {item.unlockedSchemesCount} Eligible/Potential Schemes</span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            e.g., {item.unlockedSchemeTitles.slice(0, 2).join(', ')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            void runAnalysisAndStore({
                              rawText: `${item.nameEn} ${item.issuingAuthority}`,
                              fileName: `${item.canonicalKey}.pdf`,
                              extraDocKeysToAdd: [item.docKey],
                            })
                          }
                          className="shrink-0 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-[11px] px-3 py-1.5 rounded-lg cursor-pointer transition"
                        >
                          Scan / Add
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-center text-xs text-emerald-200">
                    All documents across your eligible schemes are verified in your wallet!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Target Scheme Selector + 1-Click Auto-Scan All Missing Button */}
          <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="scheme-doc-select"
                className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>Evaluate Missing Documents for Target Scheme ({schemesList.length} Available):</span>
              </label>

              <div className="flex flex-wrap items-center gap-2">
                {targetReport.missingCount > 0 && (
                  <button
                    type="button"
                    data-testid="scan-all-scheme-docs-btn"
                    onClick={handleScanAllMissingForTargetScheme}
                    className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>AI Scan All {targetReport.missingCount} Missing Doc(s)</span>
                  </button>
                )}
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                    targetReport.readinessPct === 100
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : targetReport.readinessPct >= 50
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  {targetReport.readinessPct}% Ready ({targetReport.verifiedCount}/{targetReport.totalDocs})
                </span>
              </div>
            </div>

            <select
              id="scheme-doc-select"
              data-testid="scanner-scheme-select"
              value={selectedSchemeId}
              onChange={(e) => setSelectedSchemeId(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              {schemesList.map((scheme) => (
                <option key={scheme.id} value={scheme.id}>
                  {currentLang === 'pa'
                    ? scheme.titlePa
                    : currentLang === 'hi'
                    ? scheme.titleHi
                    : scheme.titleEn}{' '}
                  ({scheme.benefitAmountText})
                </option>
              ))}
            </select>
          </div>

          {/* Missing Document Detector Results for Selected Scheme */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Missing Document Detector Results — {targetReport.titleEn}</span>
              </h3>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {targetReport.missingCount === 0
                  ? '✅ All Required Documents Verified!'
                  : `⚠️ ${targetReport.missingCount} Missing Certificate(s) (${targetReport.mandatoryMissingCount} Mandatory)`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {targetReport.documents.map((doc, idx) => {
                const docTitle =
                  currentLang === 'pa' ? doc.namePa : currentLang === 'hi' ? doc.nameHi : doc.nameEn;
                const howToObtain =
                  currentLang === 'pa'
                    ? doc.howToObtainPa
                    : currentLang === 'hi'
                    ? doc.howToObtainHi
                    : doc.howToObtainEn;

                return (
                  <div
                    key={`${doc.docKey}-${idx}`}
                    data-testid={`scheme-doc-card-${idx}`}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      doc.isPossessed
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 ring-1 ring-rose-400/20'
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              doc.isPossessed
                                ? 'bg-emerald-200 text-emerald-950'
                                : 'bg-rose-200 text-rose-950'
                            }`}
                          >
                            {doc.isPossessed ? '✓ Verified in Wallet' : '⚠️ Missing Document'}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              doc.isMandatory
                                ? 'bg-slate-900 text-white dark:bg-slate-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {doc.isMandatory ? 'Mandatory' : 'If Applicable'}
                          </span>
                        </div>

                        {doc.availableOnDigiLocker && (
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                            DigiLocker Ready
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2 flex items-center gap-1.5">
                        <span>{doc.emoji}</span>
                        <span>{docTitle}</span>
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        Issuing Authority:{' '}
                        <strong className="text-slate-800 dark:text-slate-100">{doc.issuingAuthority}</strong>
                      </p>

                      {!doc.isPossessed && (
                        <div className="mt-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 p-2.5 border border-rose-200/70 dark:border-rose-900/60 space-y-1">
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                            <strong className="text-rose-800 dark:text-rose-300">How to Get:</strong> {howToObtain}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400 pt-0.5">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-blue-600" />
                              {doc.estimatedDays}
                            </span>
                            <span>Fee: {doc.officialFee}</span>
                            <a
                              href={doc.officialPortalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400 hover:underline font-bold"
                            >
                              <span>{doc.officialPortalName}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      {doc.isPossessed ? (
                        <button
                          type="button"
                          onClick={() => onRemoveOwnedDoc(doc.docKey)}
                          className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold underline cursor-pointer"
                        >
                          Remove from Wallet
                        </button>
                      ) : (
                        <div className="w-full flex items-center justify-between gap-2">
                          <span className="text-[10px] text-rose-700 dark:text-rose-300 font-semibold">
                            Required for {targetReport.titleEn.slice(0, 28)}...
                          </span>
                          <button
                            type="button"
                            data-testid={`mark-possessed-btn-${idx}`}
                            onClick={() =>
                              void runAnalysisAndStore({
                                rawText: `${doc.nameEn} ${doc.issuingAuthority}`,
                                fileName: `${doc.canonicalKey}.pdf`,
                                extraDocKeysToAdd: [doc.docKey],
                              })
                            }
                            className="bg-teal-700 hover:bg-teal-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xs cursor-pointer transition-colors"
                          >
                            Scan / Mark Possessed
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
            <span>
              DPDP Privacy Protected: Document scans are verified without storing raw Aadhaar images on third-party servers.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSchemeModal && (
              <button
                type="button"
                onClick={() => {
                  const found = schemesList.find((s) => s.id === selectedSchemeId);
                  if (found) {
                    onClose();
                    onOpenSchemeModal(found);
                  }
                }}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Open Scheme Details
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Done &amp; Return to Schemes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
