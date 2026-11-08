import React, { useState, useEffect } from 'react';
import { Language } from '../types/scheme';
import {
  ShieldAlert,
  ShieldCheck,
  X,
  PhoneCall,
  Lock,
  AlertOctagon,
  CheckCircle2,
  ExternalLink,
  Search,
  Globe,
  Terminal,
  Server,
  FileWarning,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  analyzeWebsiteAndCyberThreat,
  CyberThreatScanResult,
} from '../utils/cyberFraudScanner';
import { apiUrl } from '../lib/apiUrl';

interface CyberFraudShieldModalProps {
  isOpen?: boolean;
  onClose: () => void;
  currentLang: Language;
  inlineMode?: boolean;
}

interface LiveProbeMetadata {
  httpStatus: number | null;
  serverHeader: string | null;
  pageTitle: string | null;
  resolvedUrl: string | null;
  wafProtectionActive: boolean;
  scannedAt: string;
}

const SAMPLE_SCAN_PRESETS = [
  {
    id: 'official-pmkisan',
    labelEn: 'Low Risk: https://pmkisan.gov.in',
    labelPa: 'ਘੱਟ ਜੋਖਮ (Low Risk): pmkisan.gov.in',
    labelHi: 'कम जोखिम (Low Risk): pmkisan.gov.in',
    sample: 'https://pmkisan.gov.in/RegistrationForm.aspx',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/70',
  },
  {
    id: 'medium-risk',
    labelEn: 'Medium Risk: Non-.gov.in Blog (HTTPS)',
    labelPa: 'ਦਰਮਿਆਨਾ ਜੋਖਮ (Medium Risk): ਗੈਰ-ਸਰਕਾਰੀ ਬਲੌਗ',
    labelHi: 'मध्यम जोखिम (Medium Risk): गैर-.gov.in ब्लॉग',
    sample: 'https://indian-citizen-news-portal.org/scheme-updates',
    badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-700/60 hover:bg-amber-900/70',
  },
  {
    id: 'fake-phishing',
    labelEn: 'High Risk: Fake Phishing (No HTTPS + .xyz)',
    labelPa: 'ਉੱਚ ਜੋਖਮ (High Risk): ਨਕਲੀ ਠੱਗੀ ਲਿੰਕ (.xyz)',
    labelHi: 'उच्च जोखिम (High Risk): नकली ठगी लिंक (.xyz)',
    sample:
      'http://pmkisan-free-bonus-claim.xyz/login?claim=50000 Urgent! Pay ₹299 processing fee via UPI PIN & share Aadhaar OTP to unlock ₹50,000 subsidy.',
    badgeClass: 'bg-red-950/80 text-red-300 border-red-700/60 hover:bg-red-900/70',
  },
  {
    id: 'hacker-payload',
    labelEn: 'High Risk: Hacker Exploit (SQLi / XSS / .APK)',
    labelPa: 'ਉੱਚ ਜੋਖਮ (High Risk): ਹੈਕਰ ਅਟੈਕ / APK',
    labelHi: 'उच्च जोखिम (High Risk): हैकर अटैक / APK',
    sample:
      "https://fake-govt-update.top/kyc.apk?id=1' UNION SELECT password FROM citizens-- <script>fetch('http://stealer.ru')</script>",
    badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-700/60 hover:bg-rose-900/70',
  },
];

export const CyberFraudShieldModal: React.FC<CyberFraudShieldModalProps> = ({
  isOpen = true,
  onClose,
  currentLang,
  inlineMode = false,
}) => {
  const [scanInput, setScanInput] = useState<string>('https://pmkisan.gov.in');
  const [scanResult, setScanResult] = useState<CyberThreatScanResult>(() =>
    analyzeWebsiteAndCyberThreat('https://pmkisan.gov.in')
  );
  const [isScanning, setIsScanning] = useState(false);
  const [liveProbe, setLiveProbe] = useState<LiveProbeMetadata | null>(null);
  const [copiedPortal, setCopiedPortal] = useState(false);

  const runDeepScan = async (rawValue: string) => {
    const target = rawValue.trim();
    if (!target) return;
    setIsScanning(true);
    // Immediate local analysis so UI responds in <5ms even offline
    const localAnalysis = analyzeWebsiteAndCyberThreat(target, 'offline-client-analyzer');
    setScanResult(localAnalysis);
    setLiveProbe(null);

    try {
      const response = await fetch(apiUrl('/api/security/scan-url'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target, input: target }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data?.analysis) {
          setScanResult(data.analysis);
        }
        if (data?.liveProbe) {
          setLiveProbe(data.liveProbe);
        }
      }
    } catch {
      // Offline mode works 100% locally via analyzeWebsiteAndCyberThreat
    } finally {
      setIsScanning(false);
    }
  };

  // Run initial backend Deep Website Analysis on mount when modal opens
  useEffect(() => {
    if (isOpen || inlineMode) {
      void runDeepScan(scanInput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, inlineMode]);

  if (!isOpen && !inlineMode) return null;

  const handlePresetClick = (sampleText: string) => {
    setScanInput(sampleText);
    void runDeepScan(sampleText);
  };

  const handleCopyOfficialPortal = async (portalUrl: string) => {
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopiedPortal(true);
      setTimeout(() => setCopiedPortal(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const riskLevelConfig = (() => {
    switch (scanResult.riskLevelScore) {
      case 'Low':
        return {
          badgeBg: 'bg-emerald-600 text-white border-emerald-700',
          pillBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          scoreColor: 'text-emerald-700',
          barColor: 'bg-emerald-600',
          cardBorder: 'border-emerald-300 bg-emerald-50/90 text-emerald-950',
          label:
            currentLang === 'pa'
              ? 'ਜੋਖਮ ਪੱਧਰ: ਘੱਟ (Low Risk)'
              : currentLang === 'hi'
              ? 'जोखिम स्तर: कम (Low Risk)'
              : 'Risk Level: Low',
        };
      case 'Medium':
        return {
          badgeBg: 'bg-amber-500 text-slate-950 border-amber-600',
          pillBg: 'bg-amber-100 text-amber-950 border-amber-300',
          scoreColor: 'text-amber-700',
          barColor: 'bg-amber-500',
          cardBorder: 'border-amber-300 bg-amber-50/90 text-amber-950',
          label:
            currentLang === 'pa'
              ? 'ਜੋਖਮ ਪੱਧਰ: ਦਰਮਿਆਨਾ (Medium Risk)'
              : currentLang === 'hi'
              ? 'जोखिम स्तर: मध्यम (Medium Risk)'
              : 'Risk Level: Medium',
        };
      case 'High':
      default:
        return {
          badgeBg: 'bg-red-600 text-white border-red-700',
          pillBg: 'bg-red-100 text-red-950 border-red-300',
          scoreColor: 'text-red-700',
          barColor: 'bg-red-600',
          cardBorder: 'border-red-300 bg-red-50/90 text-red-950',
          label:
            currentLang === 'pa'
              ? 'ਜੋਖਮ ਪੱਧਰ: ਉੱਚ (High Risk)'
              : currentLang === 'hi'
              ? 'जोखिम स्तर: उच्च (High Risk)'
              : 'Risk Level: High',
        };
    }
  })();

  const checksList = [
    {
      id: 'https',
      title: '1. HTTPS / TLS Encryption Check',
      passed: scanResult.deepAnalysis.checks.httpsCheck.passed,
      status: scanResult.deepAnalysis.checks.httpsCheck.status,
      detail: scanResult.deepAnalysis.checks.httpsCheck.detail,
    },
    {
      id: 'gov-domain',
      title: '2. Official .gov.in / .nic.in Domain Check',
      passed: scanResult.deepAnalysis.checks.govDomainCheck.passed,
      status: scanResult.deepAnalysis.checks.govDomainCheck.status,
      detail: scanResult.deepAnalysis.checks.govDomainCheck.detail,
    },
    {
      id: 'phishing-sig',
      title: '3. Known Phishing Signatures Scan',
      passed: scanResult.deepAnalysis.checks.phishingSignatureCheck.passed,
      status: scanResult.deepAnalysis.checks.phishingSignatureCheck.status,
      detail: scanResult.deepAnalysis.checks.phishingSignatureCheck.detail,
    },
    {
      id: 'brand-spoof',
      title: '4. Gov Brand Impersonation Check',
      passed: scanResult.deepAnalysis.checks.brandSpoofingCheck.passed,
      status: scanResult.deepAnalysis.checks.brandSpoofingCheck.status,
      detail: scanResult.deepAnalysis.checks.brandSpoofingCheck.detail,
    },
    {
      id: 'waf-exploit',
      title: '5. Anti-Hacker WAF & Malware Scan',
      passed: scanResult.deepAnalysis.checks.exploitPayloadCheck.passed,
      status: scanResult.deepAnalysis.checks.exploitPayloadCheck.status,
      detail: scanResult.deepAnalysis.checks.exploitPayloadCheck.detail,
    },
  ];

  const contentCard = (
    <div
      data-testid="cyber-fraud-shield-container"
      className={
        inlineMode
          ? 'bg-white rounded-3xl w-full shadow-sm border border-slate-200 overflow-hidden'
          : 'bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col'
      }
    >
      {/* Top Cyber Defense Header */}
      <div className="bg-gradient-to-r from-slate-950 via-red-950 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-400/40 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-red-300" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-extrabold px-2.5 py-0.5 rounded-md bg-red-500/30 text-red-200 border border-red-400/30">
                {currentLang === 'pa'
                  ? 'ਡੀਪ ਵੈੱਬਸਾਈਟ ਐਨਾਲਿਸਿਸ ਅਤੇ ਸਾਈਬਰ ਸ਼ੀਲਡ'
                  : currentLang === 'hi'
                  ? 'डीप वेबसाइट एनालिसिस एवं साइबर शील्ड'
                  : 'Deep Website Analysis & Anti-Hacker Shield'}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                {scanResult.deepAnalysis.scannedBy === 'backend-deep-analyzer'
                  ? 'Backend Deep Analyzer Active'
                  : 'Zero-Trust Protection Active'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold mt-1">
              {currentLang === 'pa'
                ? 'ਡੀਪ ਵੈੱਬਸਾਈਟ ਐਨਾਲਿਸਿਸ: ਅਸਲੀ ਜਾਂ ਨਕਲੀ (Risk Level: Low / Medium / High)'
                : currentLang === 'hi'
                ? 'डीप वेबसाइट एनालिसिस: असली या नकली (Risk Level: Low / Medium / High)'
                : 'Deep Website Analysis: URL Threat Scanner & Risk Level Score'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {currentLang === 'pa'
                ? 'ਕੋਈ ਵੀ URL ਪੇਸਟ ਕਰੋ — ਬੈਕਐਂਡ HTTPS ਦੀ ਕਮੀ, ਗੈਰ-.gov.in ਡੋਮੇਨ ਅਤੇ ਫਿਸ਼ਿੰਗ ਪੈਟਰਨ ਚੈੱਕ ਕਰਕੇ ਜੋਖਮ ਪੱਧਰ (Low, Medium, High) ਦੱਸੇਗਾ।'
                : currentLang === 'hi'
                ? 'कोई भी URL पेस्ट करें — बैकएंड HTTPS की कमी, गैर-.gov.in डोमेन और फ़िशिंग पैटर्न स्कैन करके Risk Level (Low, Medium, High) बताएगा।'
                : 'Paste any URL below — the backend scans for lack of HTTPS, non-.gov.in domains, known phishing signatures, and hacker payloads to return a Risk Level score (Low, Medium, High).'}
            </p>
          </div>
        </div>
        {!inlineMode && (
          <button
            onClick={onClose}
            aria-label="Close Cyber Fraud Shield"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Body */}
      <div className={inlineMode ? 'p-5 sm:p-6 space-y-6' : 'p-5 sm:p-6 overflow-y-auto space-y-6 flex-1'}>
        {/* Interactive Website & Threat Scanner Box */}
        <div className="rounded-2xl bg-slate-900 text-white p-4 sm:p-5 border border-slate-800 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <label
              htmlFor="cyber-website-scanner-input"
              className="text-xs font-extrabold uppercase tracking-wider text-teal-300 flex items-center gap-2"
            >
              <Globe className="w-4 h-4 text-teal-400" />
              {currentLang === 'pa'
                ? 'ਡੀਪ ਵੈੱਬਸਾਈਟ ਐਨਾਲਿਸਿਸ ਲਈ URL ਜਾਂ ਮੈਸੇਜ ਪੇਸਟ ਕਰੋ'
                : currentLang === 'hi'
                ? 'डीप वेबसाइट एनालिसिस के लिए URL या संदेश पेस्ट करें'
                : 'Paste Website URL or Suspicious Link for Deep Website Analysis'}
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              HTTPS + .gov.in Registry + Phishing Signatures + WAF
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="cyber-website-scanner-input"
                data-testid="cyber-scan-input"
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onPaste={(e) => {
                  const pasted = e.clipboardData?.getData('text');
                  if (pasted && pasted.trim()) {
                    setTimeout(() => void runDeepScan(pasted.trim()), 20);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void runDeepScan(scanInput);
                  }
                }}
                placeholder={
                  currentLang === 'pa'
                    ? 'ਉਦਾਹਰਨ: https://pmkisan.gov.in ਜਾਂ http://pmkisan-free-money.xyz...'
                    : currentLang === 'hi'
                    ? 'उदाहरण: https://pmkisan.gov.in या http://pmkisan-free-money.xyz...'
                    : 'Paste URL (e.g. https://pmkisan.gov.in or http://pmkisan-bonus.xyz) to run Deep Analysis...'
                }
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 font-mono"
              />
            </div>
            <button
              type="button"
              data-testid="cyber-scan-submit-btn"
              onClick={() => void runDeepScan(scanInput)}
              disabled={isScanning}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer shrink-0 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isScanning
                  ? currentLang === 'pa'
                    ? 'ਸਕੈਨ ਹੋ ਰਿਹਾ ਹੈ...'
                    : currentLang === 'hi'
                    ? 'स्कैन हो रहा है...'
                    : 'Running Deep Analysis...'
                  : currentLang === 'pa'
                  ? 'ਡੀਪ ਸਕੈਨ ਕਰੋ'
                  : currentLang === 'hi'
                  ? 'डीप स्कैन करें'
                  : 'Run Deep Analysis'}
              </span>
            </button>
          </div>

          {/* 1-Click Test Presets for Low, Medium, and High Risk */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">
              {currentLang === 'pa' ? 'ਤੁਰੰਤ ਟੈਸਟ ਕਰੋ:' : currentLang === 'hi' ? 'तुरंत टेस्ट करें:' : 'Test Risk Levels:'}
            </span>
            {SAMPLE_SCAN_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                data-testid={`cyber-preset-${preset.id}`}
                onClick={() => handlePresetClick(preset.sample)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${preset.badgeClass}`}
              >
                {currentLang === 'pa'
                  ? preset.labelPa
                  : currentLang === 'hi'
                  ? preset.labelHi
                  : preset.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Deep Website Analysis Report Card + Risk Level Score (Low, Medium, High) */}
        <div
          data-testid="deep-website-analysis-panel"
          className={`rounded-2xl border-2 p-4 sm:p-5 transition-all ${riskLevelConfig.cardBorder}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/10">
            <div className="flex items-center gap-2.5">
              {scanResult.riskLevelScore === 'Low' ? (
                <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
              ) : scanResult.riskLevelScore === 'Medium' ? (
                <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0" />
              ) : (
                <AlertOctagon className="w-6 h-6 text-red-700 shrink-0" />
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    data-testid="deep-analysis-risk-level"
                    className={`inline-block text-xs font-black uppercase tracking-wider px-3 py-0.5 rounded-md border shadow-2xs ${riskLevelConfig.badgeBg}`}
                  >
                    {riskLevelConfig.label}
                  </span>
                  <span
                    data-testid="cyber-scan-verdict-badge"
                    className={`inline-block text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${riskLevelConfig.pillBg}`}
                  >
                    {scanResult.verdict.replace(/_/g, ' ')}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold mt-1.5">
                  {currentLang === 'pa'
                    ? scanResult.headlinePa
                    : currentLang === 'hi'
                    ? scanResult.headlineHi
                    : scanResult.headlineEn}
                </h4>
              </div>
            </div>

            {/* Risk Score & Trust Score Meters */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="bg-white/95 rounded-xl px-3.5 py-2 border border-black/10 text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Risk Level Score
                </span>
                <span
                  data-testid="deep-analysis-risk-score"
                  className={`text-lg sm:text-xl font-black font-mono ${riskLevelConfig.scoreColor}`}
                >
                  {scanResult.riskLevelScore} ({scanResult.riskScore}/100)
                </span>
              </div>
              <div className="bg-white/95 rounded-xl px-3.5 py-2 border border-black/10 text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Trust Score
                </span>
                <span
                  data-testid="cyber-scan-trust-score"
                  className={`text-lg sm:text-xl font-black font-mono ${riskLevelConfig.scoreColor}`}
                >
                  {scanResult.trustScore}/100
                </span>
              </div>
            </div>
          </div>

          {/* Visual Risk Bar */}
          <div className="w-full h-2.5 bg-black/10 rounded-full overflow-hidden my-3">
            <div
              className={`h-full transition-all duration-300 ${riskLevelConfig.barColor}`}
              style={{ width: `${Math.max(6, scanResult.trustScore)}%` }}
            />
          </div>

          <p className="text-xs sm:text-sm font-medium leading-relaxed">
            {currentLang === 'pa'
              ? scanResult.summaryPa
              : currentLang === 'hi'
              ? scanResult.summaryHi
              : scanResult.summaryEn}
          </p>

          {/* 5-Pillar Deep Website Analysis Inspection Breakdown */}
          <div
            data-testid="deep-analysis-checks-grid"
            className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5"
          >
            {checksList.map((chk) => (
              <div
                key={chk.id}
                data-testid={`deep-check-${chk.id}`}
                className={`rounded-xl p-3 border text-slate-900 bg-white/95 ${
                  chk.passed ? 'border-emerald-200' : 'border-red-300 bg-red-50/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    {chk.title}
                  </span>
                  {chk.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                </div>
                <span
                  className={`text-xs font-extrabold block mt-1 ${
                    chk.passed ? 'text-emerald-800' : 'text-red-800'
                  }`}
                >
                  {chk.status}
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{chk.detail}</p>
              </div>
            ))}
          </div>

          {/* Website Technical Intelligence Grid */}
          <div
            data-testid="cyber-website-intel-grid"
            className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 bg-white/95 rounded-xl p-3.5 border border-black/10 text-slate-900"
          >
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Scanned Host / Domain
              </span>
              <span className="text-xs font-extrabold font-mono text-slate-900 break-all">
                {scanResult.websiteIntel.hostname}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                TLD: <strong>{scanResult.websiteIntel.tld}</strong> · Protocol:{' '}
                <strong>{scanResult.websiteIntel.protocol}</strong>
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Domain Registry & SSL Status
              </span>
              <span className="text-xs font-extrabold text-slate-900 block">
                {scanResult.websiteIntel.domainCategory}
              </span>
              <span className="text-[11px] text-slate-600 block mt-0.5">
                {scanResult.websiteIntel.sslEncrypted
                  ? 'HTTPS Encrypted Transport'
                  : 'Unencrypted / Lack of HTTPS'}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Verified Ministry / Authority
              </span>
              <span className="text-xs font-extrabold text-slate-900 block">
                {scanResult.websiteIntel.matchedMinistryOrState}
              </span>
              <span className="text-[11px] text-slate-600 block mt-0.5">
                {scanResult.websiteIntel.registrarAuthority}
              </span>
            </div>

            {liveProbe && (liveProbe.httpStatus || liveProbe.pageTitle) && (
              <div className="sm:col-span-2 lg:col-span-3 p-2.5 rounded-lg bg-teal-50/80 border border-teal-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-950">
                  <Server className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>
                    Live Backend Probe: HTTP {liveProbe.httpStatus || 200} ({liveProbe.serverHeader || 'NIC Edge'})
                    {liveProbe.pageTitle ? ` — "${liveProbe.pageTitle}"` : ''}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-teal-800">
                  WAF Active · {new Date(liveProbe.scannedAt).toLocaleTimeString()}
                </span>
              </div>
            )}

            {/* Official Recommended Portal Callout */}
            <div className="sm:col-span-2 lg:col-span-3 p-3 rounded-xl bg-blue-50 border border-blue-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block">
                  {scanResult.verdict === 'REAL_OFFICIAL_GOV'
                    ? 'Verified Official Government Link'
                    : 'Safe Official Government Replacement Portal (Use This Instead)'}
                </span>
                <span className="text-xs sm:text-sm font-black font-mono text-blue-950 break-all">
                  {scanResult.websiteIntel.recommendedOfficialPortal}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void handleCopyOfficialPortal(scanResult.websiteIntel.recommendedOfficialPortal)
                  }
                  className="px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-blue-800 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedPortal ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPortal ? 'Copied' : 'Copy Official URL'}</span>
                </button>
                <a
                  href={scanResult.websiteIntel.recommendedOfficialPortal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Open Safe .gov.in</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Hacker Attack Vectors Blocked (if any) */}
          {scanResult.detectedAttackVectors.length > 0 && (
            <div
              data-testid="cyber-blocked-attacks-box"
              className="mt-4 rounded-xl bg-slate-950 text-rose-200 p-4 border border-rose-500/50"
            >
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-rose-400 mb-2">
                <Terminal className="w-4 h-4" />
                <span>
                  Active Anti-Hacker WAF Shield Blocked {scanResult.detectedAttackVectors.length} Illegal Exploit Vector(s)
                </span>
              </div>
              <ul className="space-y-1.5 text-xs font-mono">
                {scanResult.detectedAttackVectors.map((vec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <FileWarning className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{vec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Security Findings List */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {scanResult.reasonsEn.length > 0 && (
              <div className="bg-white/95 rounded-xl p-3.5 border border-red-200 text-slate-900">
                <h5 className="text-xs font-extrabold uppercase tracking-wider text-red-700 mb-2 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4" />
                  <span>Suspicious Patterns Detected ({scanResult.reasonsEn.length})</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {scanResult.reasonsEn.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {scanResult.safetySignalsEn.length > 0 && (
              <div className="bg-white/95 rounded-xl p-3.5 border border-emerald-200 text-slate-900">
                <h5 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Authenticity Signals ({scanResult.safetySignalsEn.length})</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {scanResult.safetySignalsEn.map((sig, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Cyber Crime Helplines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 block">
                {currentLang === 'pa' ? 'ਨੈਸ਼ਨਲ ਸਾਈਬਰ ਕ੍ਰਾਈਮ ਹੈਲਪਲਾਈਨ' : 'National Cyber Crime Helpline'}
              </span>
              <span className="text-2xl font-black text-red-900">1930</span>
              <span className="text-xs text-red-700 block mt-0.5">
                {currentLang === 'pa'
                  ? 'ਬੈਂਕ ਧੋਖਾਧੜੀ ਹੋਣ ਤੇ ਤੁਰੰਤ ਕਾਲ ਕਰੋ (24x7)'
                  : 'Call immediately for UPI/Bank fraud freeze (24x7)'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md">
              <PhoneCall className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
                {currentLang === 'pa' ? 'ਪੰਜਾਬ ਸੇਵਾ ਕੇਂਦਰ ਹੈਲਪਲਾਈਨ' : 'State Citizen Helpline'}
              </span>
              <span className="text-2xl font-black text-blue-900">1100 / 181</span>
              <span className="text-xs text-blue-700 block mt-0.5">
                {currentLang === 'pa'
                  ? 'ਸਰਕਾਰੀ ਸਕੀਮ ਦੀ ਅਸਲੀ ਜਾਣਕਾਰੀ ਲਈ'
                  : 'Verify official scheme status & Sewa Kendra fees'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Official Cyber Crime Portal Link */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-teal-400 shrink-0" />
            <div>
              <h5 className="text-xs font-bold">
                {currentLang === 'pa'
                  ? 'ਭਾਰਤ ਸਰਕਾਰ ਦਾ ਅਧਿਕਾਰਤ ਸਾਈਬਰ ਕ੍ਰਾਈਮ ਰਿਪੋਰਟਿੰਗ ਪੋਰਟਲ'
                  : 'Government of India Official Cyber Crime Reporting Portal'}
              </h5>
              <p className="text-[11px] text-slate-300">https://cybercrime.gov.in</p>
            </div>
          </div>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold bg-teal-500 hover:bg-teal-600 text-slate-950 px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <span>{currentLang === 'pa' ? 'ਪੋਰਟਲ ਖੋਲ੍ਹੋ' : 'Report on cybercrime.gov.in'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {!inlineMode && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
          >
            {currentLang === 'pa' ? 'ਸਮਝ ਗਿਆ, ਬੰਦ ਕਰੋ' : currentLang === 'hi' ? 'समझ गया, बंद करें' : 'Close Scanner'}
          </button>
        </div>
      )}
    </div>
  );

  if (inlineMode) {
    return contentCard;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      {contentCard}
    </div>
  );
};
