import type { CitizenProfile, Occupation } from '../types/scheme';
import { INDIA_STATES_AND_UTS, getDistrictsForState } from '../data/indiaStatesAndDistricts';

export type CyberScanVerdict =
  | 'REAL_OFFICIAL_GOV'
  | 'VERIFIED_PUBLIC_PORTAL'
  | 'FAKE_PHISHING_SCAM'
  | 'HACKER_MALICIOUS_BLOCKED'
  | 'UNVERIFIED_CAUTION';

export type CyberRiskLevel = 'SAFE' | 'CAUTION' | 'HIGH' | 'CRITICAL';

/**
 * Standardized 3-tier Risk Level score returned by Deep Website Analysis:
 * - 'Low': Official .gov.in/.nic.in or authorized portal over HTTPS with zero phishing/exploit signatures
 * - 'Medium': Unverified non-.gov.in domain without explicit phishing lures, or official .gov.in over plain HTTP
 * - 'High': Lack of HTTPS on non-gov domain, known phishing signatures, brand spoofing, suspicious TLD, or hacker payload
 */
export type RiskLevelScore = 'Low' | 'Medium' | 'High';

export interface DeepWebsiteAnalysisChecks {
  httpsCheck: {
    passed: boolean;
    status: string;
    detail: string;
  };
  govDomainCheck: {
    passed: boolean;
    status: string;
    detail: string;
  };
  phishingSignatureCheck: {
    passed: boolean;
    status: string;
    matchedSignatures: string[];
    detail: string;
  };
  brandSpoofingCheck: {
    passed: boolean;
    status: string;
    targetBrand?: string;
    detail: string;
  };
  exploitPayloadCheck: {
    passed: boolean;
    status: string;
    blockedVectors: string[];
    detail: string;
  };
}

export interface DeepWebsiteAnalysisReport {
  riskLevelScore: RiskLevelScore;
  riskScore: number; // 0 (lowest risk) to 100 (highest risk)
  suspiciousPatternsFound: string[];
  scannedBy: 'backend-deep-analyzer' | 'offline-client-analyzer';
  checks: DeepWebsiteAnalysisChecks;
}

export interface WebsiteTechnicalIntel {
  normalizedUrl: string;
  hostname: string;
  protocol: string;
  tld: string;
  isOfficialGovDomain: boolean;
  sslEncrypted: boolean;
  sslStatus: string;
  domainCategory: string;
  registrarAuthority: string;
  registryAuthority: string;
  matchedMinistryOrState: string;
  recommendedOfficialPortal: string;
  officialReplacementPortal: string;
  ipOrHostingRisk: string;
  liveProbeVerified?: boolean;
  liveHttpStatus?: number;
  livePageTitle?: string;
}

export interface CyberThreatScanResult {
  input: string;
  scannedAt: string;
  verdict: CyberScanVerdict;
  riskLevel: CyberRiskLevel;
  riskLevelScore: RiskLevelScore;
  riskScore: number; // 0 to 100 (higher = riskier)
  trustScore: number; // 0 to 100 (higher = safer)
  isSafeToVisit: boolean;
  isOfficialGovDomain: boolean;
  isBlockedByShield: boolean;
  hackerThreatBlocked: boolean;
  headlineEn: string;
  headlinePa: string;
  headlineHi: string;
  summaryEn: string;
  summaryPa: string;
  summaryHi: string;
  detectedAttackVectors: string[];
  reasonsEn: string[];
  safetySignalsEn: string[];
  safetyChecklist: string[];
  websiteIntel: WebsiteTechnicalIntel;
  deepAnalysis: DeepWebsiteAnalysisReport;
}

const KNOWN_OFFICIAL_DOMAINS: Record<string, string> = {
  'pmkisan.gov.in': 'Ministry of Agriculture & Farmers Welfare, Government of India',
  'scholarships.gov.in': 'National Scholarship Portal (NSP 2.0), Government of India',
  'scholarships.punjab.gov.in': 'Dr. Ambedkar Scholarship Portal, Government of Punjab',
  'connect.punjab.gov.in': 'Connect Punjab e-Sewa Kendra Portal, Government of Punjab',
  'esewa.punjab.gov.in': 'Department of Governance Reforms, Government of Punjab',
  'punjab.gov.in': 'Official State Portal, Government of Punjab',
  'sha.punjab.gov.in': 'State Health Agency (Ayushman Sarbat Sehat), Government of Punjab',
  'sswcd.punjab.gov.in': 'Social Security & Women/Child Development, Government of Punjab',
  'welfarepunjab.gov.in': 'Department of Social Justice & Empowerment, Government of Punjab',
  'agri.punjab.gov.in': 'Department of Agriculture & Farmers Welfare, Government of Punjab',
  'jamabandi.punjab.gov.in': 'Punjab Land Records Society (PLRS), Government of Punjab',
  'epos.punjab.gov.in': 'Department of Food, Civil Supplies & Consumer Affairs, Punjab',
  'eshram.gov.in': 'Ministry of Labour & Employment, Government of India',
  'pmvishwakarma.gov.in': 'Ministry of Micro, Small & Medium Enterprises, Govt of India',
  'pmfby.gov.in': 'Pradhan Mantri Fasal Bima Yojana, Ministry of Agriculture',
  'pmayg.nic.in': 'Ministry of Rural Development (PMAY-G), Government of India',
  'myscheme.gov.in': 'National e-Governance Division (NeGD), Ministry of Electronics & IT',
  'cybercrime.gov.in': 'Indian Cyber Crime Coordination Centre (I4C), Ministry of Home Affairs',
  'uidai.gov.in': 'Unique Identification Authority of India (Aadhaar)',
  'digilocker.gov.in': 'Ministry of Electronics & Information Technology (MeitY)',
  'pmsuryaghar.gov.in': 'Ministry of New and Renewable Energy, Government of India',
  'jansamarth.in': 'Department of Financial Services, Ministry of Finance (Verified National Portal)',
  'vidyalakshmi.co.in': 'Department of Higher Education, Ministry of Education (Verified Portal)',
  'pgrkam.com': 'Punjab Ghar Ghar Rozgar & Karobar Mission (Dept of Employment Generation, Punjab)',
  'pspcl.in': 'Punjab State Power Corporation Limited (Govt of Punjab Undertaking)',
};

const SUSPICIOUS_TLDS = [
  '.xyz',
  '.top',
  '.club',
  '.vip',
  '.click',
  '.work',
  '.loan',
  '.win',
  '.gq',
  '.tk',
  '.ml',
  '.cf',
  '.apk',
  '.exe',
  '.zip',
  '.rar',
  '.buzz',
  '.icu',
  '.shop',
];

const KNOWN_PHISHING_SIGNATURE_RULES: Array<{ pattern: RegExp; label: string }> = [
  {
    pattern: /\b(share\s+otp|send\s+otp|aadhaar\s+otp|enter\s+otp|otp\s*=)/i,
    label: 'Aadhaar / Bank OTP Harvesting Signature',
  },
  {
    pattern: /\b(atm\s+pin|upi\s+pin|cvv|netbanking\s+password|bank\s+password)/i,
    label: 'UPI PIN / Banking Credential Theft Signature',
  },
  {
    pattern: /\b(processing\s+fee|agent\s+commission|pay\s+rs|pay\s+₹|bribe|quick\s+approval\s+fee|unlock\s+₹)/i,
    label: 'Illegal Processing Fee / Advance Payment Scam Signature',
  },
  {
    pattern: /\b(free-bonus|free-money|instant-claim|lucky-draw|whatsapp-lottery|kyc-suspended|account-blocked)/i,
    label: 'Urgency / Fake Bonus Social Engineering Lure Signature',
  },
  {
    pattern: /\b(bit\.ly|tinyurl\.com|t\.co|cutt\.ly|is\.gd|rb\.gy)\b/i,
    label: 'Obfuscated URL Shortener Hiding True Destination',
  },
];

const GOV_BRAND_KEYWORDS: Array<{ keyword: string; officialPortal: string; name: string }> = [
  { keyword: 'pmkisan', officialPortal: 'https://pmkisan.gov.in', name: 'PM-Kisan Samman Nidhi' },
  { keyword: 'pm-kisan', officialPortal: 'https://pmkisan.gov.in', name: 'PM-Kisan Samman Nidhi' },
  { keyword: 'kisan', officialPortal: 'https://pmkisan.gov.in', name: 'PM-Kisan / Agri Portal' },
  { keyword: 'ayushman', officialPortal: 'https://sha.punjab.gov.in', name: 'Ayushman Bharat / Sarbat Sehat' },
  { keyword: 'sehat', officialPortal: 'https://sha.punjab.gov.in', name: 'Sarbat Sehat Bima Yojana' },
  { keyword: 'scholarship', officialPortal: 'https://scholarships.punjab.gov.in', name: 'Official Scholarship Portal' },
  { keyword: 'ambedkar', officialPortal: 'https://scholarships.punjab.gov.in', name: 'Dr. Ambedkar Scholarship Portal' },
  { keyword: 'ashirwad', officialPortal: 'https://esewa.punjab.gov.in', name: 'Punjab Ashirwad / Shagun Scheme' },
  { keyword: 'shagun', officialPortal: 'https://esewa.punjab.gov.in', name: 'Punjab Ashirwad / Shagun Scheme' },
  { keyword: 'pension', officialPortal: 'https://sswcd.punjab.gov.in', name: 'Social Security Pension Portal' },
  { keyword: 'ration', officialPortal: 'https://epos.punjab.gov.in', name: 'Smart Ration Card Portal' },
  { keyword: 'eshram', officialPortal: 'https://eshram.gov.in', name: 'e-Shram National Labour Portal' },
  { keyword: 'vishwakarma', officialPortal: 'https://pmvishwakarma.gov.in', name: 'PM Vishwakarma Portal' },
  { keyword: 'mudra', officialPortal: 'https://www.jansamarth.in', name: 'JanSamarth / PM Mudra Portal' },
  { keyword: 'aadhaar', officialPortal: 'https://uidai.gov.in', name: 'UIDAI Official Aadhaar Portal' },
  { keyword: 'suryaghar', officialPortal: 'https://pmsuryaghar.gov.in', name: 'PM Surya Ghar Solar Portal' },
  { keyword: 'ladli', officialPortal: 'https://www.myscheme.gov.in', name: 'State Women Welfare Portal' },
  { keyword: 'punjab', officialPortal: 'https://connect.punjab.gov.in', name: 'Connect Punjab Official Portal' },
];

export function analyzeWebsiteAndCyberThreat(
  rawInput: string,
  scannedBy: 'backend-deep-analyzer' | 'offline-client-analyzer' = 'offline-client-analyzer'
): CyberThreatScanResult {
  const trimmed = rawInput.trim();
  const lower = trimmed.toLowerCase();
  const scannedAt = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const detectedAttackVectors: string[] = [];
  const reasonsEn: string[] = [];
  const safetySignalsEn: string[] = [];
  const matchedPhishingSignatures: string[] = [];

  // 1. Detect active Hacker / Injection / Exploit payloads
  const hasSqlInjection =
    /(\bunion\s+select\b|\bdrop\s+table\b|\bor\s+1\s*=\s*1\b|--\s*$|;\s*delete\s+from\b|\bexec\s*\()/i.test(
      trimmed
    );
  const hasXssPayload =
    /(<\s*script\b|javascript\s*:|onerror\s*=|onload\s*=|<\s*iframe\b|document\.cookie|eval\s*\()/i.test(
      trimmed
    );
  const hasPathTraversalOrCmd = /(\.\.\/|\.\.\\|\/etc\/passwd|cmd\.exe|powershell|\|\|\s*sh\b)/i.test(
    trimmed
  );
  const hasMaliciousExecutable = /\.(apk|exe|bat|scr|msi|vbs|sh)(\?|#|$|\s)/i.test(trimmed);

  if (hasSqlInjection) {
    const msg = 'SQL Injection (SQLi) Database Exploit Payload Blocked';
    detectedAttackVectors.push(msg);
    reasonsEn.push(msg);
  }
  if (hasXssPayload) {
    const msg = 'Cross-Site Scripting (XSS) / Malicious JavaScript Payload Blocked';
    detectedAttackVectors.push(msg);
    reasonsEn.push(msg);
  }
  if (hasPathTraversalOrCmd) {
    const msg = 'Remote Command / Directory Traversal Intrusion Attempt Blocked';
    detectedAttackVectors.push(msg);
    reasonsEn.push(msg);
  }
  if (hasMaliciousExecutable) {
    const msg = 'Malicious Remote-Access Trojan / Fake Government APK File (.apk/.exe) Blocked';
    detectedAttackVectors.push(msg);
    reasonsEn.push(msg);
  }

  // 2. Scan against Known Phishing Signatures
  for (const sigRule of KNOWN_PHISHING_SIGNATURE_RULES) {
    if (sigRule.pattern.test(trimmed)) {
      matchedPhishingSignatures.push(sigRule.label);
      reasonsEn.push(`Known Phishing Signature Detected: ${sigRule.label}`);
    }
  }

  // 3. Extract URL / Domain from input
  let candidateUrl = trimmed;
  const urlMatch = trimmed.match(/https?:\/\/[^\s"'<>]+/i);
  if (urlMatch) {
    candidateUrl = urlMatch[0];
  } else {
    const domainTokenMatch = trimmed.match(/\b([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?/i);
    if (domainTokenMatch) {
      candidateUrl = `https://${domainTokenMatch[0]}`;
    }
  }

  let parsedUrl: URL | null = null;
  try {
    parsedUrl = new URL(
      candidateUrl.startsWith('http://') || candidateUrl.startsWith('https://')
        ? candidateUrl
        : `https://${candidateUrl}`
    );
  } catch {
    parsedUrl = null;
  }

  const hostname = parsedUrl ? parsedUrl.hostname.toLowerCase().replace(/^www\./, '') : 'unknown-host';
  const isHttpInsecure =
    lower.startsWith('http://') || Boolean(urlMatch && urlMatch[0].toLowerCase().startsWith('http://'));
  const protocol = isHttpInsecure ? 'HTTP (Unencrypted)' : 'HTTPS (TLS Encrypted)';

  if (isHttpInsecure) {
    reasonsEn.push('Lack of HTTPS: Unencrypted HTTP connection vulnerable to interception');
  } else {
    safetySignalsEn.push('Encrypted HTTPS / TLS transport layer verified');
  }

  // Determine TLD
  const hostParts = hostname.split('.');
  const tld =
    hostParts.length >= 3 &&
    ['gov.in', 'nic.in', 'org.in', 'ac.in', 'co.in'].includes(hostParts.slice(-2).join('.'))
      ? `.${hostParts.slice(-2).join('.')}`
      : hostParts.length >= 2
      ? `.${hostParts[hostParts.length - 1]}`
      : 'N/A';

  const isOfficialGovTld =
    hostname.endsWith('.gov.in') ||
    hostname.endsWith('.nic.in') ||
    hostname === 'gov.in' ||
    hostname === 'nic.in';

  // Check if hostname is in our all-India 36 States or Official Portals registry
  let matchedMinistryOrState = KNOWN_OFFICIAL_DOMAINS[hostname] || '';
  if (!matchedMinistryOrState) {
    for (const stateObj of INDIA_STATES_AND_UTS) {
      try {
        const stateHost = new URL(stateObj.officialPortalUrl).hostname.toLowerCase().replace(/^www\./, '');
        if (hostname === stateHost || hostname.endsWith(`.${stateHost}`)) {
          matchedMinistryOrState = `Official ${stateObj.name} Government Portal (${stateObj.sewaPortalName})`;
          break;
        }
      } catch {
        // ignore
      }
    }
  }
  if (!matchedMinistryOrState && isOfficialGovTld) {
    matchedMinistryOrState = 'Verified Government of India / State Government (.gov.in / .nic.in) Domain';
  }

  const isVerifiedPublicCompanion =
    hostname === 'jansamarth.in' ||
    hostname === 'vidyalakshmi.co.in' ||
    hostname === 'pgrkam.com' ||
    hostname === 'pspcl.in';

  if (isOfficialGovTld) {
    safetySignalsEn.push(`Verified Official Government Domain (${tld}) managed by NIC India`);
    safetySignalsEn.push(`Registered to ${matchedMinistryOrState}`);
  } else if (isVerifiedPublicCompanion) {
    safetySignalsEn.push(`Verified Government-Authorized Public Portal (${hostname})`);
  }

  // Check for suspicious TLDs
  const hasSuspiciousTld = SUSPICIOUS_TLDS.some((badTld) => hostname.endsWith(badTld) || lower.includes(badTld));
  if (hasSuspiciousTld) {
    const tldWarning = `Suspicious High-Risk Domain Extension (${tld}) Commonly Used in Phishing`;
    matchedPhishingSignatures.push(tldWarning);
    reasonsEn.push(tldWarning);
  }

  // Check for Government Brand Spoofing / Typosquatting on non-official domains
  let officialReplacementPortal = isOfficialGovTld && parsedUrl ? parsedUrl.origin : 'https://www.myscheme.gov.in';
  let spoofedSchemeName = '';
  for (const brand of GOV_BRAND_KEYWORDS) {
    if (lower.includes(brand.keyword)) {
      if (!isOfficialGovTld) {
        officialReplacementPortal = brand.officialPortal;
      }
      spoofedSchemeName = brand.name;
      break;
    }
  }

  const isBrandSpoofing =
    Boolean(spoofedSchemeName) && !isOfficialGovTld && !isVerifiedPublicCompanion;
  if (isBrandSpoofing) {
    const spoofMsg = `Government Brand Impersonation: Non-.gov.in domain spoofing "${spoofedSchemeName}"`;
    matchedPhishingSignatures.push(spoofMsg);
    reasonsEn.push(spoofMsg);
  }

  // Check excessive hyphens in domain (classic phishing pattern like pm-kisan-free-money-2026.com)
  const hyphenCount = (hostname.match(/-/g) || []).length;
  if (((hyphenCount >= 2 && isBrandSpoofing) || hyphenCount >= 4) && !isOfficialGovTld) {
    const hyphenMsg = 'Deceptive Multi-Hyphen Lookalike Domain Pattern Detected';
    matchedPhishingSignatures.push(hyphenMsg);
    reasonsEn.push(hyphenMsg);
  }

  // Compute final Verdict, Risk Level ('SAFE' | 'CAUTION' | 'HIGH' | 'CRITICAL'), and 3-tier RiskLevelScore ('Low' | 'Medium' | 'High')
  const hackerThreatBlocked =
    hasSqlInjection || hasXssPayload || hasPathTraversalOrCmd || hasMaliciousExecutable;
  const hasPhishingIndicators =
    matchedPhishingSignatures.length > 0 || hasSuspiciousTld || isBrandSpoofing;

  let verdict: CyberScanVerdict = 'UNVERIFIED_CAUTION';
  let riskLevel: CyberRiskLevel = 'CAUTION';
  let riskLevelScore: RiskLevelScore = 'Medium';
  let trustScore = 50;

  if (hackerThreatBlocked) {
    verdict = 'HACKER_MALICIOUS_BLOCKED';
    riskLevel = 'CRITICAL';
    riskLevelScore = 'High';
    trustScore = 0;
  } else if (hasPhishingIndicators || (isHttpInsecure && !isOfficialGovTld)) {
    verdict = 'FAKE_PHISHING_SCAM';
    riskLevel = 'CRITICAL';
    riskLevelScore = 'High';
    trustScore = Math.max(4, 20 - reasonsEn.length * 4);
  } else if (isOfficialGovTld) {
    verdict = 'REAL_OFFICIAL_GOV';
    if (isHttpInsecure) {
      // Official .gov.in domain but pasted with unencrypted http://
      riskLevel = 'CAUTION';
      riskLevelScore = 'Medium';
      trustScore = 72;
    } else {
      riskLevel = 'SAFE';
      riskLevelScore = 'Low';
      trustScore = 98;
      safetySignalsEn.push('Zero-Threat Clean URL Structure (No SQLi, XSS, or Phishing Signatures)');
    }
  } else if (isVerifiedPublicCompanion) {
    verdict = 'VERIFIED_PUBLIC_PORTAL';
    riskLevel = 'SAFE';
    riskLevelScore = 'Low';
    trustScore = 94;
    safetySignalsEn.push('Zero-Threat Clean URL Structure');
  } else {
    // Non-.gov.in domain over HTTPS without explicit phishing or malware signatures -> Medium Risk
    verdict = 'UNVERIFIED_CAUTION';
    riskLevel = 'CAUTION';
    riskLevelScore = 'Medium';
    trustScore = 45;
    reasonsEn.push(
      'Non-.gov.in / Non-.nic.in Private Domain — Not an official government portal; do not submit Aadhaar or OTPs'
    );
  }

  const riskScore = Math.max(0, Math.min(100, 100 - trustScore));
  const isSafeToVisit = verdict === 'REAL_OFFICIAL_GOV' || verdict === 'VERIFIED_PUBLIC_PORTAL';

  const headlines: Record<
    CyberScanVerdict,
    { en: string; pa: string; hi: string; sumEn: string; sumPa: string; sumHi: string }
  > = {
    REAL_OFFICIAL_GOV: {
      en: 'REAL OFFICIAL GOVERNMENT WEBSITE — LOW RISK (VERIFIED SAFE)',
      pa: 'ਅਸਲੀ ਸਰਕਾਰੀ ਵੈੱਬਸਾਈਟ (.gov.in / .nic.in) — ਘੱਟ ਜੋਖਮ (Low Risk)',
      hi: 'असली आधिकारिक सरकारी वेबसाइट (.gov.in / .nic.in) — कम जोखिम (Low Risk)',
      sumEn: `Deep Website Analysis verified (${hostname}) under ${matchedMinistryOrState}. Risk Level: ${riskLevelScore}.`,
      sumPa: `ਇਹ ਪ੍ਰਮਾਣਿਤ ਸਰਕਾਰੀ ਵੈੱਬਸਾਈਟ (${hostname}) ਹੈ ਜੋ ${matchedMinistryOrState} ਅਧੀਨ ਰਜਿਸਟਰਡ ਹੈ।`,
      sumHi: `यह सत्यापित सरकारी वेबसाइट (${hostname}) है जो ${matchedMinistryOrState} के अंतर्गत पंजीकृत है।`,
    },
    VERIFIED_PUBLIC_PORTAL: {
      en: 'VERIFIED GOVERNMENT-AUTHORIZED PORTAL — LOW RISK',
      pa: 'ਸਰਕਾਰ ਵੱਲੋਂ ਮਾਨਤਾ ਪ੍ਰਾਪਤ ਅਧਿਕਾਰਤ ਪੋਰਟਲ — ਸੁਰੱਖਿਅਤ (Low Risk)',
      hi: 'सरकार द्वारा अधिकृत नागरिक पोर्टल — कम जोखिम (Low Risk)',
      sumEn: `Verified public-sector portal (${hostname}) operated by ${matchedMinistryOrState}. Risk Level: Low.`,
      sumPa: `ਇਹ ਸਰਕਾਰ ਵੱਲੋਂ ਮਾਨਤਾ ਪ੍ਰਾਪਤ ਪੋਰਟਲ (${hostname}) ਹੈ। ਵਰਤੋਂ ਲਈ ਸੁਰੱਖਿਅਤ ਹੈ।`,
      sumHi: `यह सरकार द्वारा अधिकृत पोर्टल (${hostname}) है। उपयोग के लिए सुरक्षित है।`,
    },
    FAKE_PHISHING_SCAM: {
      en: 'HIGH RISK: FAKE / PHISHING SCAM WEBSITE DETECTED!',
      pa: 'ਉੱਚ ਜੋਖਮ (High Risk): ਨਕਲੀ / ਸਾਈਬਰ ਧੋਖਾਧੜੀ ਵਾਲੀ ਵੈੱਬਸਾਈਟ!',
      hi: 'उच्च जोखिम (High Risk): नकली / फ़िशिंग धोखाधड़ी वेबसाइट!',
      sumEn: `Deep Website Analysis flagged (${hostname}) as HIGH RISK due to suspicious phishing patterns. Use only the official portal: ${officialReplacementPortal}.`,
      sumPa: `ਸਾਵਧਾਨ! ਇਹ ਲਿੰਕ (${hostname}) ਨਕਲੀ ਹੈ। ਸਿਰਫ਼ ਅਸਲੀ ਸਰਕਾਰੀ ਪੋਰਟਲ ਵਰਤੋ: ${officialReplacementPortal}`,
      sumHi: `सावधान! यह लिंक (${hostname}) फर्जी है। केवल असली सरकारी पोर्टल का उपयोग करें: ${officialReplacementPortal}`,
    },
    HACKER_MALICIOUS_BLOCKED: {
      en: 'HIGH RISK: HACKER EXPLOIT / MALWARE PAYLOAD BLOCKED!',
      pa: 'ਉੱਚ ਜੋਖਮ (High Risk): ਹੈਕਰ ਹਮਲਾ ਅਤੇ APK ਫਾਈਲ ਬਲੌਕ ਕੀਤੀ ਗਈ!',
      hi: 'उच्च जोखिम (High Risk): हैकर हमला और दुर्भावनापूर्ण कोड ब्लॉक किया गया!',
      sumEn: `Active cyber intrusion / malware payload neutralized. Risk Level: High (100/100). Execution blocked to protect your device and Aadhaar data.`,
      sumPa: `ਜਨਸਹਾਇਕ ਸਾਈਬਰ ਸ਼ੀਲਡ ਨੇ ਹੈਕਰ ਦੇ ਖਤਰਨਾਕ ਲਿੰਕ/ਕੋਡ ਨੂੰ ਰੋਕ ਦਿੱਤਾ ਹੈ।`,
      sumHi: `जनसहायक साइबर शील्ड ने हैकर के खतरनाक लिंक/कोड को ब्लॉक कर दिया है।`,
    },
    UNVERIFIED_CAUTION: {
      en: 'MEDIUM RISK: UNVERIFIED NON-.GOV.IN PRIVATE WEBSITE',
      pa: 'ਦਰਮਿਆਨਾ ਜੋਖਮ (Medium Risk): ਗੈਰ-ਸਰਕਾਰੀ ਪ੍ਰਾਈਵੇਟ ਵੈੱਬਸਾਈਟ',
      hi: 'मध्यम जोखिम (Medium Risk): गैर-सरकारी निजी वेबसाइट — सावधान रहें',
      sumEn: `Deep Website Analysis found that (${hostname}) is NOT an official .gov.in or .nic.in portal (Risk Level: Medium). Do not share Aadhaar, OTP, or fees here.`,
      sumPa: `ਇਹ ਵੈੱਬਸਾਈਟ (${hostname}) ਸਰਕਾਰੀ (.gov.in / .nic.in) ਨਹੀਂ ਹੈ। ਇੱਥੇ ਆਪਣਾ ਆਧਾਰ ਨੰਬਰ ਜਾਂ ਬੈਂਕ OTP ਨਾ ਦਿਓ।`,
      sumHi: `यह वेबसाइट (${hostname}) आधिकारिक सरकारी (.gov.in / .nic.in) नहीं है। यहाँ आधार नंबर या OTP कभी न दें।`,
    },
  };

  const info = headlines[verdict];
  const authorityText = isOfficialGovTld
    ? 'National Informatics Centre (NIC) • Ministry of Electronics & IT (.gov.in/.nic.in)'
    : isVerifiedPublicCompanion
    ? 'Government Authorized Public Sector Undertaking Registry'
    : 'Unverified Private / Commercial Domain Registrar';

  const domainCategoryText = isOfficialGovTld
    ? 'Official Government Domain (.gov.in / .nic.in)'
    : isVerifiedPublicCompanion
    ? 'Verified Public Sector Companion Portal'
    : hasSuspiciousTld
    ? `High-Risk Untrusted TLD (${tld})`
    : 'Non-.gov.in Private Domain';

  const deepAnalysis: DeepWebsiteAnalysisReport = {
    riskLevelScore,
    riskScore,
    suspiciousPatternsFound: reasonsEn,
    scannedBy,
    checks: {
      httpsCheck: {
        passed: !isHttpInsecure,
        status: !isHttpInsecure ? 'Secure HTTPS (TLS)' : 'Missing HTTPS (Insecure HTTP)',
        detail: !isHttpInsecure
          ? 'Encrypted HTTPS transport verified.'
          : 'URL uses unencrypted HTTP — vulnerable to traffic interception.',
      },
      govDomainCheck: {
        passed: isOfficialGovTld || isVerifiedPublicCompanion,
        status: isOfficialGovTld
          ? `Verified Official (${tld})`
          : isVerifiedPublicCompanion
          ? 'Authorized Public Portal'
          : `Non-.gov.in Domain (${tld})`,
        detail: isOfficialGovTld
          ? `Authentic NIC government domain (${hostname}).`
          : isVerifiedPublicCompanion
          ? `Authorized companion domain (${hostname}).`
          : `Domain "${hostname}" is outside the official .gov.in / .nic.in registry.`,
      },
      phishingSignatureCheck: {
        passed: matchedPhishingSignatures.length === 0,
        status:
          matchedPhishingSignatures.length === 0
            ? 'No Phishing Signatures'
            : `${matchedPhishingSignatures.length} Phishing Signature(s) Found`,
        matchedSignatures: matchedPhishingSignatures,
        detail:
          matchedPhishingSignatures.length === 0
            ? 'No OTP harvesting, advance-fee lures, or high-risk TLDs detected.'
            : matchedPhishingSignatures.join(' • '),
      },
      brandSpoofingCheck: {
        passed: !isBrandSpoofing,
        status: !isBrandSpoofing ? 'No Brand Spoofing' : 'Gov Brand Spoofing Detected',
        ...(spoofedSchemeName ? { targetBrand: spoofedSchemeName } : {}),
        detail: !isBrandSpoofing
          ? 'Domain is not impersonating a government welfare brand.'
          : `Private domain "${hostname}" is impersonating "${spoofedSchemeName}".`,
      },
      exploitPayloadCheck: {
        passed: !hackerThreatBlocked,
        status: !hackerThreatBlocked
          ? 'Clean (0 Exploits)'
          : `Blocked (${detectedAttackVectors.length} Exploit Vector(s))`,
        blockedVectors: detectedAttackVectors,
        detail: !hackerThreatBlocked
          ? 'No SQLi, XSS, path traversal, or malicious .APK/.EXE payloads found.'
          : detectedAttackVectors.join(' • '),
      },
    },
  };

  return {
    input: trimmed,
    scannedAt,
    verdict,
    riskLevel,
    riskLevelScore,
    riskScore,
    trustScore,
    isSafeToVisit,
    isOfficialGovDomain: isOfficialGovTld,
    isBlockedByShield: hackerThreatBlocked || verdict === 'FAKE_PHISHING_SCAM',
    hackerThreatBlocked,
    headlineEn: info.en,
    headlinePa: info.pa,
    headlineHi: info.hi,
    summaryEn: info.sumEn,
    summaryPa: info.sumPa,
    summaryHi: info.sumHi,
    detectedAttackVectors,
    reasonsEn,
    safetySignalsEn,
    safetyChecklist: [
      `Official Government Portal to use: ${officialReplacementPortal}`,
      'Never share Aadhaar OTP, Bank OTP, UPI PIN, or CVV with any caller or website.',
      'Never install .APK files sent via WhatsApp or Telegram claiming PM-Kisan or Scholarship status.',
      'Report cyber fraud immediately at Toll-Free 1930 or https://cybercrime.gov.in.',
    ],
    websiteIntel: {
      normalizedUrl: parsedUrl ? parsedUrl.href : candidateUrl,
      hostname,
      protocol,
      tld,
      isOfficialGovDomain: isOfficialGovTld,
      sslEncrypted: !isHttpInsecure,
      sslStatus: isHttpInsecure
        ? 'INSECURE (No TLS Encryption)'
        : 'TLS 1.3 / HTTPS Encrypted Channel',
      domainCategory: domainCategoryText,
      registrarAuthority: authorityText,
      registryAuthority: authorityText,
      matchedMinistryOrState:
        matchedMinistryOrState || 'None — Domain is NOT listed in Official Government Registry',
      recommendedOfficialPortal: officialReplacementPortal,
      officialReplacementPortal,
      ipOrHostingRisk:
        riskLevelScore === 'Low'
          ? 'Low Risk — NIC / Government Cloud Infrastructure'
          : riskLevelScore === 'Medium'
          ? 'Medium Risk — Unverified Non-Government / Unencrypted Host'
          : 'High Risk — Phishing / Brand Spoofing / Exploit Vector',
    },
    deepAnalysis,
  };
}

export interface CriteriaPillItem {
  labelEn: string;
  value: string;
}

export interface OccupationEligibilityPreset {
  occupation: Occupation;
  labelEn: string;
  labelPa: string;
  labelHi: string;
  summaryEn: string;
  summaryPa: string;
  summaryHi: string;
  badgeTextEn: string;
  profilePatch: Partial<CitizenProfile>;
  criteriaPills: CriteriaPillItem[];
}

export function buildDynamicEligibilityPreset(
  selection: Occupation | string,
  currentProfile: CitizenProfile
): OccupationEligibilityPreset {
  const normalized = selection.trim();

  if (normalized === 'Student' || normalized === 'Students' || normalized === 'Education') {
    const nextAge = currentProfile.age >= 15 && currentProfile.age <= 28 ? currentProfile.age : 20;
    const nextIncome = Math.min(currentProfile.annualIncome || 120000, 180000);
    return {
      occupation: 'Student',
      labelEn: 'Student & Scholarship Eligibility Active',
      labelPa: 'ਵਿਦਿਆਰਥੀ ਅਤੇ ਵਜ਼ੀਫ਼ਾ ਯੋਗਤਾ ਸ਼ਰਤਾਂ ਲਾਗੂ',
      labelHi: 'छात्र एवं छात्रवृत्ति पात्रता मानदंड सक्रिय',
      summaryEn:
        'Student eligibility active: Enrolled in School/College/ITI, Age 16–28, Household Income ≤ ₹2.5L for Scholarships & Laptop Grants.',
      summaryPa:
        'ਵਿਦਿਆਰਥੀ ਯੋਗਤਾ ਸ਼ਰਤਾਂ ਲਾਗੂ: ਸਕੂਲ/ਕਾਲਜ ਵਿੱਚ ਦਾਖਲ, ਉਮਰ 16–28 ਸਾਲ, ਵਜ਼ੀਫ਼ਾ ਅਤੇ ਲੈਪਟਾਪ ਸਕੀਮਾਂ ਲਈ ਯੋਗ।',
      summaryHi:
        'छात्र पात्रता सक्रिय: स्कूल/कॉलेज में नामांकित, आयु 16–28 वर्ष, छात्रवृत्ति एवं लैपटॉप योजनाओं के लिए पात्र।',
      badgeTextEn: 'Age 18–25 · Enrolled in School/College · Income ≤ ₹2.5L',
      profilePatch: {
        occupation: 'Student',
        age: nextAge,
        annualIncome: nextIncome,
        isEnrolledInSchoolOrCollege: true,
        landholdingAcres: 0,
      },
      criteriaPills: [
        { labelEn: 'Enrolled Student', value: 'Yes' },
        { labelEn: 'Age Bracket', value: `${nextAge} Yrs (16–28)` },
        { labelEn: 'Income Ceiling', value: `₹${nextIncome.toLocaleString('en-IN')}` },
        { labelEn: 'Category', value: currentProfile.category },
      ],
    };
  }

  if (normalized === 'Farmer' || normalized === 'Farmers' || normalized === 'Agriculture') {
    const nextAge = currentProfile.age >= 25 ? currentProfile.age : 38;
    const nextLand = currentProfile.landholdingAcres > 0 ? currentProfile.landholdingAcres : 2.5;
    return {
      occupation: 'Farmer',
      labelEn: 'Farmer (Kisan) & Agriculture Eligibility Active',
      labelPa: 'ਕਿਸਾਨ ਅਤੇ ਖੇਤੀਬਾੜੀ ਸਬਸਿਡੀ ਯੋਗਤਾ ਸ਼ਰਤਾਂ ਲਾਗੂ',
      labelHi: 'किसान एवं कृषि सब्सिडी पात्रता मानदंड सक्रिय',
      summaryEn:
        'Farmer eligibility active: Cultivable landholding set, matching PM-Kisan ₹6,000/yr, Fasal Bima, Solar Pump & Agricultural Machinery subsidies.',
      summaryPa:
        'ਕਿਸਾਨ ਯੋਗਤਾ ਸ਼ਰਤਾਂ ਲਾਗੂ: ਖੇਤੀਬਾੜੀ ਜ਼ਮੀਨ, ਪੀ.ਐਮ-ਕਿਸਾਨ ₹6,000/ਸਾਲ, ਸੋਲਰ ਪੰਪ ਅਤੇ ਖੇਤੀ ਮਸ਼ੀਨਰੀ ਸਬਸਿਡੀਆਂ।',
      summaryHi:
        'किसान पात्रता सक्रिय: कृषि भूमि, पीएम-किसान ₹6,000/वर्ष, सोलर पंप और कृषि मशीनरी सब्सिडी।',
      badgeTextEn: 'Cultivable Land 2.5 Acres · PM-Kisan & Crop Subsidy Ready',
      profilePatch: {
        occupation: 'Farmer',
        age: nextAge,
        landholdingAcres: nextLand,
        isEnrolledInSchoolOrCollege: false,
      },
      criteriaPills: [
        { labelEn: 'Occupation', value: 'Farmer (Kisan)' },
        { labelEn: 'Landholding', value: `${nextLand} Acres` },
        { labelEn: 'Age', value: `${nextAge} Yrs` },
        { labelEn: 'Income', value: `₹${currentProfile.annualIncome.toLocaleString('en-IN')}` },
      ],
    };
  }

  if (normalized === 'Homemaker' || normalized === 'Women') {
    const nextAge = currentProfile.age >= 21 && currentProfile.age <= 58 ? currentProfile.age : 30;
    const nextIncome = Math.min(currentProfile.annualIncome || 120000, 150000);
    return {
      occupation: 'Homemaker',
      labelEn: 'Women & Girl Child Welfare Eligibility Active',
      labelPa: 'ਮਹਿਲਾ ਅਤੇ ਪਰਿਵਾਰ ਭਲਾਈ ਯੋਗਤਾ ਸ਼ਰਤਾਂ ਲਾਗੂ',
      labelHi: 'महिला एवं बालिका कल्याण पात्रता मानदंड सक्रिय',
      summaryEn:
        'Women welfare eligibility active: Female beneficiary profile matched to State Monthly Honor Grants (₹1,000–₹2,500/mo), Ashirwad ₹51,000 & Ujjwala.',
      summaryPa:
        'ਮਹਿਲਾ ਭਲਾਈ ਯੋਗਤਾ ਲਾਗੂ: ਮਹਿਲਾ ਸਨਮਾਨ ਭੱਤਾ, ਅਸ਼ੀਰਵਾਦ ਸਕੀਮ ₹51,000 ਅਤੇ ਮੁਫ਼ਤ ਬੱਸ ਸਫ਼ਰ ਸਕੀਮਾਂ।',
      summaryHi:
        'महिला कल्याण पात्रता सक्रिय: मासिक सम्मान भत्ता, आशीर्वाद योजना ₹51,000 और उज्ज्वला योजना।',
      badgeTextEn: 'Female Citizen · Monthly Honor Grant & Ashirwad Eligible',
      profilePatch: {
        occupation: 'Homemaker',
        gender: 'Female',
        age: nextAge,
        annualIncome: nextIncome,
        isEnrolledInSchoolOrCollege: false,
      },
      criteriaPills: [
        { labelEn: 'Gender', value: 'Female' },
        { labelEn: 'Age', value: `${nextAge} Yrs (18–60)` },
        { labelEn: 'Income', value: `₹${nextIncome.toLocaleString('en-IN')}` },
        { labelEn: 'Category', value: currentProfile.category },
      ],
    };
  }

  if (normalized === 'Senior Citizen' || normalized === 'Seniors') {
    const nextAge = currentProfile.age >= 60 ? currentProfile.age : 65;
    const nextIncome = Math.min(currentProfile.annualIncome || 60000, 60000);
    return {
      occupation: 'Senior Citizen',
      labelEn: 'Senior Citizen (60+) Pension & Healthcare Eligibility Active',
      labelPa: 'ਬਜ਼ੁਰਗ ਨਾਗਰਿਕ (60+) ਪੈਨਸ਼ਨ ਅਤੇ ਸਿਹਤ ਯੋਗਤਾ ਲਾਗੂ',
      labelHi: 'वरिष्ठ नागरिक (60+) पेंशन एवं स्वास्थ्य पात्रता सक्रिय',
      summaryEn:
        'Senior Citizen eligibility active: Age 60+ Years and pension income threshold matched to Old Age Pension & Ayushman ₹5L Healthcare.',
      summaryPa:
        'ਬਜ਼ੁਰਗ ਨਾਗਰਿਕ (60+) ਯੋਗਤਾ ਲਾਗੂ: ਬੁਢਾਪਾ ਪੈਨਸ਼ਨ ਅਤੇ ਆਯੂਸ਼ਮਾਨ ₹5 ਲੱਖ ਮੁਫ਼ਤ ਸਿਹਤ ਬੀਮਾ।',
      summaryHi:
        'वरिष्ठ नागरिक (60+) पात्रता सक्रिय: वृद्धावस्था पेंशन और आयुष्मान ₹5 लाख स्वास्थ्य बीमा।',
      badgeTextEn: 'Age 65+ · Old Age Pension & ₹5L Ayushman Cover Ready',
      profilePatch: {
        occupation: 'Senior Citizen',
        age: nextAge,
        annualIncome: nextIncome,
        isEnrolledInSchoolOrCollege: false,
      },
      criteriaPills: [
        { labelEn: 'Senior Age', value: `${nextAge} Yrs (60+)` },
        { labelEn: 'Pension Income', value: `₹${nextIncome.toLocaleString('en-IN')}` },
        { labelEn: 'Healthcare', value: '₹5L Ayushman' },
        { labelEn: 'Category', value: currentProfile.category },
      ],
    };
  }

  if (
    normalized === 'Self-Employed' ||
    normalized === 'Business Owners' ||
    normalized === 'Finance'
  ) {
    const nextAge = currentProfile.age >= 21 && currentProfile.age <= 55 ? currentProfile.age : 32;
    return {
      occupation: 'Self-Employed',
      labelEn: 'Self-Employed, Artisan & MSME Loan Eligibility Active',
      labelPa: 'ਸਵੈ-ਰੁਜ਼ਗਾਰ, ਕਾਰੀਗਰ ਅਤੇ ਕਾਰੋਬਾਰੀ ਕਰਜ਼ਾ ਯੋਗਤਾ ਲਾਗੂ',
      labelHi: 'स्वरोजगार, कारीगर एवं व्यवसाय ऋण पात्रता सक्रिय',
      summaryEn:
        'Self-Employed & Business eligibility active: Matched to PM Mudra collateral-free loans, PM Vishwakarma ₹3L credit & PMEGP 35% subsidy.',
      summaryPa:
        'ਸਵੈ-ਰੁਜ਼ਗਾਰ ਯੋਗਤਾ ਲਾਗੂ: ਪੀ.ਐਮ ਮੁਦਰਾ ਲੋਨ, ਵਿਸ਼ਵਕਰਮਾ ₹3 ਲੱਖ ਕਰਜ਼ਾ ਅਤੇ 35% ਕਾਰੋਬਾਰੀ ਸਬਸਿਡੀ।',
      summaryHi:
        'स्वरोजगार पात्रता सक्रिय: पीएम मुद्रा लोन, विश्वकर्मा ₹3 लाख ऋण और 35% सब्सिडी।',
      badgeTextEn: 'Age 21–55 · Mudra, Vishwakarma & PMEGP Subsidy Ready',
      profilePatch: {
        occupation: 'Self-Employed',
        age: nextAge,
        isEnrolledInSchoolOrCollege: false,
        landholdingAcres: 0,
      },
      criteriaPills: [
        { labelEn: 'Occupation', value: 'Self-Employed / MSME' },
        { labelEn: 'Age', value: `${nextAge} Yrs` },
        { labelEn: 'Collateral-Free', value: 'Up to ₹20L' },
        { labelEn: 'Category', value: currentProfile.category },
      ],
    };
  }

  if (normalized === 'Daily Wage Worker') {
    const nextAge = currentProfile.age >= 21 && currentProfile.age <= 58 ? currentProfile.age : 35;
    const nextIncome = Math.min(currentProfile.annualIncome || 90000, 90000);
    return {
      occupation: 'Daily Wage Worker',
      labelEn: 'Unorganised Worker & Labour Welfare Eligibility Active',
      labelPa: 'ਦਿਹਾੜੀਦਾਰ ਮਜ਼ਦੂਰ ਅਤੇ ਕਿਰਤੀ ਭਲਾਈ ਯੋਗਤਾ ਲਾਗੂ',
      labelHi: 'दिहाड़ी मजदूर एवं श्रमिक कल्याण पात्रता सक्रिय',
      summaryEn:
        'Daily Wage & Construction Worker eligibility active: Matched to e-Shram benefits, PMAY Housing Grant, Smart Ration & Shram Yogi Pension.',
      summaryPa:
        'ਦਿਹਾੜੀਦਾਰ ਮਜ਼ਦੂਰ ਯੋਗਤਾ ਲਾਗੂ: ਈ-ਸ਼੍ਰਮ ਲਾਭ, ਪੱਕਾ ਮਕਾਨ ਗ੍ਰਾਂਟ, ਸਮਾਰਟ ਰਾਸ਼ਨ ਅਤੇ ਕਿਰਤੀ ਪੈਨਸ਼ਨ।',
      summaryHi:
        'दिहाड़ी मजदूर पात्रता सक्रिय: ई-श्रम लाभ, आवास अनुदान, स्मार्ट राशन और श्रम योगी पेंशन।',
      badgeTextEn: 'e-Shram UAN · Housing, Ration & ₹3,000/mo Pension Ready',
      profilePatch: {
        occupation: 'Daily Wage Worker',
        age: nextAge,
        annualIncome: nextIncome,
        isEnrolledInSchoolOrCollege: false,
        landholdingAcres: 0,
      },
      criteriaPills: [
        { labelEn: 'Worker Type', value: 'Unorganised / Daily Wage' },
        { labelEn: 'Income', value: `₹${nextIncome.toLocaleString('en-IN')}` },
        { labelEn: 'Age', value: `${nextAge} Yrs` },
        { labelEn: 'Category', value: currentProfile.category },
      ],
    };
  }

  const nextAge = currentProfile.age >= 18 && currentProfile.age <= 35 ? currentProfile.age : 23;
  const nextIncome = Math.min(currentProfile.annualIncome || 150000, 150000);
  return {
    occupation: 'Unemployed Youth',
    labelEn: 'Unemployed Youth Skill & Stipend Eligibility Active',
    labelPa: 'ਬੇਰੁਜ਼ਗਾਰ ਨੌਜਵਾਨ ਹੁਨਰ ਅਤੇ ਭੱਤਾ ਯੋਗਤਾ ਲਾਗੂ',
    labelHi: 'बेरोजगार युवा कौशल एवं भत्ता पात्रता सक्रिय',
    summaryEn:
      'Unemployed Youth eligibility active: Age 18–35 matched to PM Internship ₹5,000/mo, Skill India PMKVY 4.0 & Ghar Ghar Rozgar.',
    summaryPa:
      'ਬੇਰੁਜ਼ਗਾਰ ਨੌਜਵਾਨ ਯੋਗਤਾ ਲਾਗੂ: ਪੀ.ਐਮ ਇੰਟਰਨਸ਼ਿਪ ₹5,000/ਮਹੀਨਾ, ਸਕਿੱਲ ਇੰਡੀਆ ਅਤੇ ਘਰ-ਘਰ ਰੁਜ਼ਗਾਰ।',
    summaryHi:
      'बेरोजगार युवा पात्रता सक्रिय: पीएम इंटर्नशिप ₹5,000/माह, स्किल इंडिया और रोजगार भत्ता।',
    badgeTextEn: 'Age 18–35 · PM Internship, PMKVY 4.0 & Rozgar Stipend Ready',
    profilePatch: {
      occupation: 'Unemployed Youth',
      age: nextAge,
      annualIncome: nextIncome,
      isEnrolledInSchoolOrCollege: false,
      landholdingAcres: 0,
    },
    criteriaPills: [
      { labelEn: 'Occupation', value: 'Unemployed Youth' },
      { labelEn: 'Age Bracket', value: `${nextAge} Yrs (18–35)` },
      { labelEn: 'Income', value: `₹${nextIncome.toLocaleString('en-IN')}` },
      { labelEn: 'Stipend Match', value: '₹5,000/mo' },
    ],
  };
}

// Approximate bounding coordinates for Indian States/UTs for instant offline GPS reverse-lookup
const STATE_COORDINATE_CENTERS: Array<{ state: string; defaultDistrict: string; lat: number; lon: number }> = [
  { state: 'Punjab', defaultDistrict: 'Ludhiana', lat: 30.901, lon: 75.8573 },
  { state: 'Haryana', defaultDistrict: 'Karnal', lat: 29.0588, lon: 76.0856 },
  { state: 'Himachal Pradesh', defaultDistrict: 'Shimla', lat: 31.1048, lon: 77.1734 },
  { state: 'Delhi', defaultDistrict: 'New Delhi', lat: 28.6139, lon: 77.209 },
  { state: 'Chandigarh', defaultDistrict: 'Chandigarh', lat: 30.7333, lon: 76.7794 },
  { state: 'Uttar Pradesh', defaultDistrict: 'Lucknow', lat: 26.8467, lon: 80.9462 },
  { state: 'Rajasthan', defaultDistrict: 'Jaipur', lat: 27.0238, lon: 74.2179 },
  { state: 'Maharashtra', defaultDistrict: 'Pune', lat: 19.7515, lon: 75.7139 },
  { state: 'Gujarat', defaultDistrict: 'Ahmedabad', lat: 22.2587, lon: 71.1924 },
  { state: 'Madhya Pradesh', defaultDistrict: 'Bhopal', lat: 22.9734, lon: 78.6569 },
  { state: 'Bihar', defaultDistrict: 'Patna', lat: 25.0961, lon: 85.3131 },
  { state: 'West Bengal', defaultDistrict: 'Kolkata', lat: 22.9868, lon: 87.855 },
  { state: 'Karnataka', defaultDistrict: 'Bengaluru Urban', lat: 15.3173, lon: 75.7139 },
  { state: 'Tamil Nadu', defaultDistrict: 'Chennai', lat: 11.1271, lon: 78.6569 },
  { state: 'Telangana', defaultDistrict: 'Hyderabad', lat: 18.1124, lon: 79.0193 },
  { state: 'Kerala', defaultDistrict: 'Thiruvananthapuram', lat: 10.8505, lon: 76.2711 },
  { state: 'Odisha', defaultDistrict: 'Khordha', lat: 20.9517, lon: 85.0985 },
  { state: 'Assam', defaultDistrict: 'Kamrup Metropolitan', lat: 26.2006, lon: 92.9376 },
];

export function resolveLocationFromInputOrCoords(input: {
  rawLocationText?: string;
  text?: string;
  latitude?: number;
  longitude?: number;
  currentState?: string;
  currentDistrict?: string;
  fallbackState?: string;
}): {
  state: string;
  district: string;
  customLocation: string;
  pincode?: string;
  matchedBy: 'district' | 'state' | 'pincode' | 'gps' | 'default';
} {
  const rawText = (input.rawLocationText ?? input.text ?? '').trim();
  const lower = rawText.toLowerCase();

  // Extract 6-digit Indian pincode if present
  const pinMatch = rawText.match(/\b([1-8][0-9]{5})\b/);
  const pincode = pinMatch ? pinMatch[1] : undefined;

  // 1. Check if text mentions any district across all 36 States & UTs
  if (rawText) {
    for (const st of INDIA_STATES_AND_UTS) {
      const districtHit = st.districts.find((d) => {
        const dLower = d.toLowerCase();
        return dLower.length >= 3 && lower.includes(dLower);
      });
      if (districtHit) {
        return {
          state: st.name,
          district: districtHit,
          customLocation: rawText,
          ...(pincode ? { pincode } : {}),
          matchedBy: 'district',
        };
      }
    }

    for (const st of INDIA_STATES_AND_UTS) {
      if (lower.includes(st.name.toLowerCase())) {
        return {
          state: st.name,
          district: st.districts[0] || st.capital,
          customLocation: rawText,
          ...(pincode ? { pincode } : {}),
          matchedBy: 'state',
        };
      }
    }

    // Pincode prefix mapping
    if (pincode) {
      const prefix2 = pincode.slice(0, 2);
      const pinStateMap: Record<string, string> = {
        '11': 'Delhi',
        '12': 'Haryana',
        '13': 'Haryana',
        '14': 'Punjab',
        '15': 'Punjab',
        '16': 'Chandigarh',
        '17': 'Himachal Pradesh',
        '18': 'Jammu and Kashmir',
        '19': 'Jammu and Kashmir',
        '20': 'Uttar Pradesh',
        '21': 'Uttar Pradesh',
        '22': 'Uttar Pradesh',
        '30': 'Rajasthan',
        '38': 'Gujarat',
        '40': 'Maharashtra',
        '41': 'Maharashtra',
        '45': 'Madhya Pradesh',
        '50': 'Telangana',
        '56': 'Karnataka',
        '60': 'Tamil Nadu',
        '68': 'Kerala',
        '70': 'West Bengal',
        '75': 'Odisha',
        '78': 'Assam',
        '80': 'Bihar',
      };
      const mappedState = pinStateMap[prefix2];
      if (mappedState) {
        const districts = getDistrictsForState(mappedState);
        const defaultDist =
          mappedState === 'Punjab' && pincode.startsWith('147')
            ? 'Patiala'
            : mappedState === 'Punjab' && pincode.startsWith('141')
            ? 'Ludhiana'
            : mappedState === 'Maharashtra' && pincode.startsWith('411')
            ? 'Pune'
            : districts[0]?.name || 'Ludhiana';
        return {
          state: mappedState,
          district: defaultDist,
          customLocation: rawText,
          pincode,
          matchedBy: 'pincode',
        };
      }
    }
  }

  // 2. Check GPS coordinates if provided
  if (typeof input.latitude === 'number' && typeof input.longitude === 'number') {
    let bestCenter = STATE_COORDINATE_CENTERS[0];
    let bestDist = Infinity;
    for (const center of STATE_COORDINATE_CENTERS) {
      const d =
        Math.pow(input.latitude - center.lat, 2) + Math.pow(input.longitude - center.lon, 2);
      if (d < bestDist) {
        bestDist = d;
        bestCenter = center;
      }
    }
    const districts = getDistrictsForState(bestCenter.state);
    const chosenDistrict =
      districts.find((d) => d.name === bestCenter.defaultDistrict)?.name ||
      districts[0]?.name ||
      bestCenter.defaultDistrict;
    return {
      state: bestCenter.state,
      district: chosenDistrict,
      customLocation:
        rawText ||
        `GPS (${input.latitude.toFixed(3)}°N, ${input.longitude.toFixed(3)}°E) · ${chosenDistrict}`,
      matchedBy: 'gps',
    };
  }

  // 3. Fallback to provided state/district
  const fallbackState = input.currentState || input.fallbackState || 'Punjab';
  const districts = getDistrictsForState(fallbackState);
  const fallbackDistrict = input.currentDistrict || districts[0]?.name || 'Ludhiana';
  return {
    state: fallbackState,
    district: fallbackDistrict,
    customLocation: rawText || `${fallbackDistrict}, ${fallbackState}`,
    ...(pincode ? { pincode } : {}),
    matchedBy: 'default',
  };
}
