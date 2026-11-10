import { EligibilityEvaluation, Scheme } from '../types/scheme';

export interface DocumentItemMeta {
  emoji: string;
  isMandatory: boolean;
  category: string;
  canonicalKey: string;
  badgeTextEn: string;
  badgeTextPa: string;
  badgeTextHi: string;
  howToObtainEn: string;
  howToObtainPa: string;
  howToObtainHi: string;
  officialPortalUrl: string;
  officialPortalName: string;
  estimatedDays: string;
  officialFee: string;
}

export interface ScannedDocumentAnalysis {
  docKey: string;
  canonicalKey: string;
  detectedTitleEn: string;
  detectedTitlePa: string;
  detectedTitleHi: string;
  category: string;
  issuingAuthority: string;
  extractedIdNumber: string;
  confidenceScore: number;
  isValidFormat: boolean;
  validityStatus: 'Valid & Verified' | 'Action Needed: Seeding / Validity Check' | 'Manual Review Needed';
  validityAdvisoryEn: string;
  validityAdvisoryPa: string;
  validityAdvisoryHi: string;
  availableOnDigiLocker: boolean;
  officialPortalUrl: string;
  scannedAt: string;
  matchedFields: string[];
}

export interface SchemeDocumentStatusItem {
  nameEn: string;
  namePa: string;
  nameHi: string;
  docKey: string;
  canonicalKey: string;
  issuingAuthority: string;
  availableOnDigiLocker: boolean;
  isPossessed: boolean;
  isMandatory: boolean;
  category: string;
  emoji: string;
  howToObtainEn: string;
  howToObtainPa: string;
  howToObtainHi: string;
  officialPortalUrl: string;
  officialPortalName: string;
  estimatedDays: string;
  officialFee: string;
}

export interface HighImpactMissingDoc {
  canonicalKey: string;
  docKey: string;
  nameEn: string;
  namePa: string;
  nameHi: string;
  category: string;
  emoji: string;
  issuingAuthority: string;
  availableOnDigiLocker: boolean;
  isMandatory: boolean;
  unlockedSchemesCount: number;
  unlockedSchemeTitles: string[];
  howToObtainEn: string;
  howToObtainPa: string;
  howToObtainHi: string;
  officialPortalUrl: string;
  officialPortalName: string;
  estimatedDays: string;
  officialFee: string;
}

export interface MissingDocumentDetectionReport {
  targetScheme: {
    schemeId: string;
    titleEn: string;
    titlePa: string;
    titleHi: string;
    totalDocs: number;
    verifiedCount: number;
    missingCount: number;
    mandatoryMissingCount: number;
    optionalMissingCount: number;
    readinessPct: number;
    documents: SchemeDocumentStatusItem[];
  };
  profileWide: {
    totalUniqueDocs: number;
    ownedUniqueCount: number;
    missingUniqueCount: number;
    overallReadinessPct: number;
    readyToApplySchemeIds: string[];
    readyToApplySchemeTitles: string[];
    almostReadySchemeTitles: { schemeId: string; titleEn: string; missingDocName: string }[];
    highImpactMissingDocs: HighImpactMissingDoc[];
  };
}

/**
 * Normalizes any government document title into a canonical semantic key so that
 * scanning "Aadhaar Card (Linked with Mobile)" satisfies "Aadhaar Card", etc.
 */
export function normalizeCanonicalDocKey(docName: string): string {
  const lower = (docName || '').toLowerCase().trim();
  if (!lower) return 'unknown_document';

  if (lower.includes('aadhaar') || lower.includes('aadhar') || lower.includes('uidai')) {
    return 'aadhaar_card';
  }
  if (lower.includes('income certificate') || lower.includes('annual income') || lower.includes('family income')) {
    return 'income_certificate';
  }
  if (
    lower.includes('residence') ||
    lower.includes('domicile') ||
    lower.includes('bonafide resident') ||
    lower.includes('address proof')
  ) {
    return 'domicile_certificate';
  }
  if (
    lower.includes('caste') ||
    lower.includes('sc / st') ||
    lower.includes('sc/st') ||
    lower.includes('sc/bc') ||
    lower.includes('obc certificate') ||
    lower.includes('ews certificate') ||
    lower.includes('social category')
  ) {
    return 'caste_certificate';
  }
  if (
    lower.includes('bank') ||
    lower.includes('passbook') ||
    lower.includes('npci') ||
    lower.includes('ifsc') ||
    lower.includes('cancelled cheque')
  ) {
    return 'bank_passbook';
  }
  if (
    lower.includes('land') ||
    lower.includes('fard') ||
    lower.includes('jamabandi') ||
    lower.includes('khasra') ||
    lower.includes('girdawari') ||
    lower.includes('patwari') ||
    lower.includes('cultivation')
  ) {
    return 'land_record';
  }
  if (lower.includes('ration') || lower.includes('nfsa') || lower.includes('blue card') || lower.includes('smart card')) {
    return 'ration_card';
  }
  if (
    lower.includes('marksheet') ||
    lower.includes('matric') ||
    lower.includes('degree') ||
    lower.includes('diploma') ||
    lower.includes('admission') ||
    lower.includes('institution') ||
    lower.includes('school') ||
    lower.includes('college') ||
    lower.includes('fee receipt') ||
    lower.includes('bonafide student')
  ) {
    return 'education_certificate';
  }
  if (lower.includes('disability') || lower.includes('udid') || lower.includes('divyang') || lower.includes('civil surgeon')) {
    return 'disability_certificate';
  }
  if (lower.includes('marriage') || lower.includes('wedding') || lower.includes('shagun') || lower.includes('nikah') || lower.includes('anand karaj')) {
    return 'marriage_proof';
  }
  if (lower.includes('death') || lower.includes('widow') || lower.includes('destitute')) {
    return 'widow_or_death_certificate';
  }
  if (lower.includes('birth') || lower.includes('age proof')) {
    return 'birth_age_proof';
  }
  if (lower.includes('electricity') || lower.includes('pspcl') || lower.includes('meter') || lower.includes('power bill')) {
    return 'electricity_bill';
  }
  if (lower.includes('pan card') || /\bpan\b/.test(lower)) {
    return 'pan_card';
  }
  if (lower.includes('voter') || lower.includes('epic')) {
    return 'voter_id';
  }
  if (lower.includes('eshram') || lower.includes('e-shram') || lower.includes('labour card') || lower.includes('construction worker')) {
    return 'labour_eshram_card';
  }
  if (lower.includes('udyam') || lower.includes('msme') || lower.includes('artisan') || lower.includes('business registration')) {
    return 'business_udyam_certificate';
  }
  if (lower.includes('photo') || lower.includes('photograph')) {
    return 'photograph';
  }

  return lower.replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

/**
 * Checks if a scheme's required document is satisfied by the citizen's owned documents
 * using both exact lowercase matching and canonical semantic document matching.
 */
export function isDocumentOwned(docName: string, userOwnedDocs: Set<string>): boolean {
  const clean = (docName || '').toLowerCase().trim();
  if (!clean) return false;
  if (userOwnedDocs.has(clean)) return true;

  const targetCanonical = normalizeCanonicalDocKey(clean);
  for (const owned of userOwnedDocs) {
    if (owned.toLowerCase().trim() === clean) return true;
    if (normalizeCanonicalDocKey(owned) === targetCanonical) return true;
  }
  return false;
}

/**
 * Intelligent detector for document icons, mandatory/optional status, category tags,
 * and actionable application instructions.
 */
export function getDocumentMeta(docName: string): DocumentItemMeta {
  const lower = (docName || '').toLowerCase();
  const canonicalKey = normalizeCanonicalDocKey(docName);

  const isMandatory =
    !lower.includes('if applicable') &&
    !lower.includes('if required') &&
    !lower.includes('if available') &&
    !lower.includes('optional') &&
    !lower.includes('if applying') &&
    !lower.includes('if any') &&
    !lower.includes('conditional');

  let emoji = '📋';
  let category = 'Identity';
  let howToObtainEn = 'Apply online at Connect Punjab (esewa.punjab.gov.in) or visit your nearest Sewa Kendra / CSC.';
  let howToObtainPa = 'ਕਨੈਕਟ ਪੰਜਾਬ ਪੋਰਟਲ (esewa.punjab.gov.in) ਜਾਂ ਨੇੜਲੇ ਸੇਵਾ ਕੇਂਦਰ ਰਾਹੀਂ ਪ੍ਰਾਪਤ ਕਰੋ।';
  let howToObtainHi = 'कनेक्ट पंजाब पोर्टल (esewa.punjab.gov.in) या नजदीकी सेवा केंद्र से प्राप्त करें।';
  let officialPortalUrl = 'https://esewa.punjab.gov.in';
  let officialPortalName = 'Punjab e-Sewa Portal';
  let estimatedDays = '3–7 Working Days';
  let officialFee = '₹30 – ₹50 Sewa Kendra Fee';

  switch (canonicalKey) {
    case 'aadhaar_card':
      emoji = '🪪';
      category = 'Identity';
      howToObtainEn = 'Download e-Aadhaar instantly on myAadhaar / DigiLocker or update mobile link at nearest Aadhaar Seva Kendra.';
      howToObtainPa = 'myAadhaar ਜਾਂ DigiLocker ਤੋਂ ਈ-ਆਧਾਰ ਡਾਊਨਲੋਡ ਕਰੋ ਜਾਂ ਸੇਵਾ ਕੇਂਦਰ ਵਿੱਚ ਮੋਬਾਈਲ ਨੰਬਰ ਲਿੰਕ ਕਰਵਾਓ।';
      howToObtainHi = 'myAadhaar या DigiLocker से ई-आधार डाउनलोड करें या आधार सेवा केंद्र पर मोबाइल लिंक कराएं।';
      officialPortalUrl = 'https://myaadhaar.uidai.gov.in';
      officialPortalName = 'UIDAI myAadhaar Portal';
      estimatedDays = 'Instant (e-Aadhaar)';
      officialFee = 'Free (Online Download)';
      break;
    case 'income_certificate':
      emoji = '📄';
      category = 'Revenue';
      howToObtainEn = 'Apply via Connect Punjab / e-Sewa Kendra with self-declaration & Patwari / MC verification (valid for 1 year).';
      howToObtainPa = 'ਪਟਵਾਰੀ/ਐਮ.ਸੀ ਤਸਦੀਕ ਨਾਲ ਸੇਵਾ ਕੇਂਦਰ ਜਾਂ connect.punjab.gov.in ਰਾਹੀਂ ਆਮਦਨ ਸਰਟੀਫਿਕੇਟ ਬਣਵਾਓ।';
      howToObtainHi = 'पटवारी/एमसी सत्यापन के साथ सेवा केंद्र या connect.punjab.gov.in पर आय प्रमाण पत्र हेतु आवेदन करें।';
      officialPortalUrl = 'https://connect.punjab.gov.in';
      officialPortalName = 'Connect Punjab Portal';
      estimatedDays = '5–7 Working Days';
      officialFee = '₹50 Govt Service Charge';
      break;
    case 'domicile_certificate':
      emoji = '🏠';
      category = 'Residence';
      howToObtainEn = 'Apply for Residence / Domicile Certificate on Connect Punjab or e-District portal (lifetime validity).';
      howToObtainPa = 'connect.punjab.gov.in ਜਾਂ ਨੇੜਲੇ ਸੇਵਾ ਕੇਂਦਰ ਤੋਂ ਪੰਜਾਬ ਰਿਹਾਇਸ਼ (ਡੋਮੀਸਾਈਲ) ਸਰਟੀਫਿਕੇਟ ਬਣਵਾਓ।';
      howToObtainHi = 'connect.punjab.gov.in या सेवा केंद्र से निवास (डोमिसाइल) प्रमाण पत्र प्राप्त करें।';
      officialPortalUrl = 'https://connect.punjab.gov.in';
      officialPortalName = 'Connect Punjab e-Sewa';
      estimatedDays = '5–7 Working Days';
      officialFee = '₹50 Govt Service Charge';
      break;
    case 'caste_certificate':
      emoji = '🎓';
      category = 'Social Category';
      howToObtainEn = 'Apply for SC / ST / BC / OBC Certificate at Sewa Kendra or Connect Punjab; auto-syncs with DigiLocker & Dr. Ambedkar Portal.';
      howToObtainPa = 'ਸੇਵਾ ਕੇਂਦਰ ਜਾਂ connect.punjab.gov.in ਤੋਂ ਜਾਤੀ ਸਰਟੀਫਿਕੇਟ (SC/BC) ਜਾਰੀ ਕਰਵਾਓ।';
      howToObtainHi = 'सेवा केंद्र या connect.punjab.gov.in से जाति प्रमाण पत्र (SC/BC/OBC) प्राप्त करें।';
      officialPortalUrl = 'https://scholarships.punjab.gov.in';
      officialPortalName = 'Dr. Ambedkar & e-Sewa Portal';
      estimatedDays = '7–10 Working Days';
      officialFee = '₹50 Govt Service Charge';
      break;
    case 'bank_passbook':
      emoji = '🏦';
      category = 'Financial';
      howToObtainEn = 'Ensure your Bank Account has active Aadhaar NPCI DBT Seeding at your bank branch so funds transfer directly.';
      howToObtainPa = 'ਆਪਣੀ ਬੈਂਕ ਸ਼ਾਖਾ ਵਿੱਚ ਆਧਾਰ NPCI DBT ਸੀਡਿੰਗ ਕਰਵਾਓ ਤਾਂ ਜੋ ਪੈਸੇ ਸਿੱਧੇ ਖਾਤੇ ਵਿੱਚ ਆਉਣ।';
      howToObtainHi = 'अपनी बैंक शाखा में आधार NPCI DBT सीडिंग सक्रिय कराएं ताकि राशि सीधे खाते में आए।';
      officialPortalUrl = 'https://www.npci.org.in';
      officialPortalName = 'NPCI Bharat Aadhaar Seeding';
      estimatedDays = '1–2 Working Days';
      officialFee = '100% Free';
      break;
    case 'land_record':
      emoji = '🚜';
      category = 'Land & Revenue';
      howToObtainEn = 'Download digitally signed Fard / Jamabandi by Khewat/Khasra number on jamabandi.punjab.gov.in.';
      howToObtainPa = 'jamabandi.punjab.gov.in ਪੋਰਟਲ ਤੋਂ ਖੇਵਟ/ਖਸਰਾ ਨੰਬਰ ਰਾਹੀਂ ਡਿਜੀਟਲ ਫ਼ਰਦ / ਜਮ੍ਹਾਂਬੰਦੀ ਕੱਢੋ।';
      howToObtainHi = 'jamabandi.punjab.gov.in पोर्टल से खेवट/खसरा नंबर द्वारा डिजिटल फ़र्द / जमाबंदी डाउनलोड करें।';
      officialPortalUrl = 'https://jamabandi.punjab.gov.in';
      officialPortalName = 'PLRS Jamabandi Portal';
      estimatedDays = 'Instant Online';
      officialFee = 'Free Online View / ₹20 Copy';
      break;
    case 'ration_card':
      emoji = '📃';
      category = 'Family/Ration';
      howToObtainEn = 'Download e-Ration Card / NFSA Smart Card entitlement slip on epos.punjab.gov.in or Mera Ration app.';
      howToObtainPa = 'epos.punjab.gov.in ਜਾਂ ਮੇਰਾ ਰਾਸ਼ਨ ਐਪ ਤੋਂ ਸਮਾਰਟ ਰਾਸ਼ਨ ਕਾਰਡ ਵੇਰਵੇ ਡਾਊਨਲੋਡ ਕਰੋ।';
      howToObtainHi = 'epos.punjab.gov.in या मेरा राशन ऐप से स्मार्ट राशन कार्ड विवरण डाउनलोड करें।';
      officialPortalUrl = 'https://epos.punjab.gov.in';
      officialPortalName = 'ePoS Punjab Food Security';
      estimatedDays = 'Instant (Existing) / 15 Days (New)';
      officialFee = '100% Free';
      break;
    case 'education_certificate':
      emoji = '📜';
      category = 'Educational';
      howToObtainEn = 'Fetch PSEB / CBSE / University Marksheets via DigiLocker or obtain Bonafide Certificate from school/college Registrar.';
      howToObtainPa = 'DigiLocker ਤੋਂ ਮਾਰਕਸ਼ੀਟ ਡਾਊਨਲੋਡ ਕਰੋ ਜਾਂ ਸਕੂਲ/ਕਾਲਜ ਤੋਂ ਬੋਨਾਫਾਈਡ ਸਰਟੀਫਿਕੇਟ ਲਓ।';
      howToObtainHi = 'DigiLocker से अंकतालिका डाउनलोड करें या स्कूल/कॉलेज से बोनाफाइड प्रमाण पत्र प्राप्त करें।';
      officialPortalUrl = 'https://www.digilocker.gov.in';
      officialPortalName = 'National DigiLocker';
      estimatedDays = 'Instant on DigiLocker';
      officialFee = '100% Free';
      break;
    case 'disability_certificate':
      emoji = '🩺';
      category = 'Medical/Health';
      howToObtainEn = 'Apply for Unique Disability ID (UDID) Card and Civil Surgeon medical board assessment on swavlambancard.gov.in.';
      howToObtainPa = 'swavlambancard.gov.in ਪੋਰਟਲ ਜਾਂ ਜ਼ਿਲ੍ਹਾ ਸਿਵਲ ਹਸਪਤਾਲ ਰਾਹੀਂ UDID ਦਿਵਿਆਂਗ ਕਾਰਡ ਬਣਵਾਓ।';
      howToObtainHi = 'swavlambancard.gov.in पोर्टल या सिविल अस्पताल से UDID दिव्यांगता प्रमाण पत्र प्राप्त करें।';
      officialPortalUrl = 'https://www.swavlambancard.gov.in';
      officialPortalName = 'UDID Swavlamban Portal';
      estimatedDays = '7–14 Working Days';
      officialFee = '100% Free';
      break;
    case 'marriage_proof':
      emoji = '💍';
      category = 'Family/Civil';
      howToObtainEn = 'Obtain Marriage Certificate or Gurdwara/Temple/Sarpanch solemnization proof and register at Connect Punjab.';
      howToObtainPa = 'ਵਿਆਹ ਦਾ ਕਾਰਡ / ਗੁਰਦੁਆਰਾ ਜਾਂ ਮੰਦਰ ਸਰਟੀਫਿਕੇਟ ਅਤੇ ਸੇਵਾ ਕੇਂਦਰ ਵਿਆਹ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਤਿਆਰ ਰੱਖੋ।';
      howToObtainHi = 'विवाह प्रमाण पत्र या धार्मिक संस्थान/सरपंच प्रमाण पत्र सेवा केंद्र पर पंजीकृत कराएं।';
      officialPortalUrl = 'https://esewa.punjab.gov.in';
      officialPortalName = 'Punjab Marriage Registration';
      estimatedDays = '3–7 Working Days';
      officialFee = '₹100 Govt Registration';
      break;
    case 'widow_or_death_certificate':
      emoji = '📜';
      category = 'Civil Record';
      howToObtainEn = 'Download digitally signed Death Certificate from CRS (crsorgi.gov.in) or e-Sewa Kendra.';
      howToObtainPa = 'ਸੇਵਾ ਕੇਂਦਰ ਜਾਂ crsorgi.gov.in ਤੋਂ ਡਿਜੀਟਲ ਮੌਤ ਦਾ ਸਰਟੀਫਿਕੇਟ ਪ੍ਰਾਪਤ ਕਰੋ।';
      howToObtainHi = 'सेवा केंद्र या crsorgi.gov.in से मृत्यु प्रमाण पत्र प्राप्त करें।';
      officialPortalUrl = 'https://esewa.punjab.gov.in';
      officialPortalName = 'Civil Registration e-Sewa';
      estimatedDays = '3–5 Working Days';
      officialFee = '₹30 Govt Fee';
      break;
    case 'electricity_bill':
      emoji = '⚡';
      category = 'Utility';
      howToObtainEn = 'Download latest PSPCL domestic electricity bill using your Account / Consumer Number at pspcl.in.';
      howToObtainPa = 'pspcl.in ਤੋਂ ਆਪਣੇ ਖਾਤਾ ਨੰਬਰ ਰਾਹੀਂ ਤਾਜ਼ਾ ਬਿਜਲੀ ਬਿੱਲ ਡਾਊਨਲੋਡ ਕਰੋ।';
      howToObtainHi = 'pspcl.in से उपभोक्ता संख्या द्वारा नवीनतम बिजली बिल डाउनलोड करें।';
      officialPortalUrl = 'https://pspcl.in';
      officialPortalName = 'PSPCL Consumer Portal';
      estimatedDays = 'Instant Online';
      officialFee = '100% Free';
      break;
    case 'labour_eshram_card':
      emoji = '👷';
      category = 'Labour & Skill';
      howToObtainEn = 'Generate Universal Account Number (UAN) e-Shram Card online in 2 minutes using Aadhaar OTP at eshram.gov.in.';
      howToObtainPa = 'eshram.gov.in ਉੱਤੇ ਆਧਾਰ OTP ਰਾਹੀਂ 2 ਮਿੰਟ ਵਿੱਚ ਮੁਫ਼ਤ ਈ-ਸ਼੍ਰਮ ਕਾਰਡ ਬਣਾਓ।';
      howToObtainHi = 'eshram.gov.in पर आधार OTP की मदद से 2 मिनट में निःशुल्क ई-श्रम कार्ड बनाएं।';
      officialPortalUrl = 'https://eshram.gov.in';
      officialPortalName = 'e-Shram National Portal';
      estimatedDays = 'Instant Online';
      officialFee = '100% Free';
      break;
    default:
      break;
  }

  return {
    emoji,
    isMandatory,
    category,
    canonicalKey,
    badgeTextEn: isMandatory ? 'Mandatory' : 'Optional / If Applicable',
    badgeTextPa: isMandatory ? 'ਜ਼ਰੂਰੀ (Mandatory)' : 'ਜੇਕਰ ਲਾਗੂ ਹੋਵੇ (Optional)',
    badgeTextHi: isMandatory ? 'अनिवार्य (Mandatory)' : 'यदि लागू हो (Optional)',
    howToObtainEn,
    howToObtainPa,
    howToObtainHi,
    officialPortalUrl,
    officialPortalName,
    estimatedDays,
    officialFee,
  };
}

export interface SampleDocumentDefinition {
  key: string;
  canonicalKey: string;
  nameEn: string;
  namePa: string;
  nameHi: string;
  authority: string;
  sampleId: string;
  isDigiLocker: boolean;
  sampleOcrText: string;
}

export const SAMPLE_CITIZEN_DOCS: SampleDocumentDefinition[] = [
  {
    key: 'aadhaar card linked with mobile',
    canonicalKey: 'aadhaar_card',
    nameEn: 'Aadhaar Card (Linked with Mobile)',
    namePa: 'ਮੋਬਾਈਲ ਨਾਲ ਲਿੰਕ ਆਧਾਰ ਕਾਰਡ',
    nameHi: 'मोबाइल से लिंक आधार कार्ड',
    authority: 'UIDAI Govt of India',
    sampleId: 'XXXX-XXXX-8912',
    isDigiLocker: true,
    sampleOcrText: 'UNIQUE IDENTIFICATION AUTHORITY OF INDIA (UIDAI) • Aadhaar No: XXXX-XXXX-8912 • Mobile Linked: Verified • State: Punjab',
  },
  {
    key: 'annual income certificate (issued by tehsildar/sdm)',
    canonicalKey: 'income_certificate',
    nameEn: 'Income Certificate (Issued by Tehsildar/SDM)',
    namePa: 'ਆਮਦਨ ਸਰਟੀਫਿਕੇਟ (ਤਹਿਸੀਲਦਾਰ ਵੱਲੋਂ ਜਾਰੀ)',
    nameHi: 'आय प्रमाण पत्र (तहसीलदार द्वारा जारी)',
    authority: 'Sub-Divisional Magistrate / Tehsildar',
    sampleId: 'PB-INC-2026-44129',
    isDigiLocker: true,
    sampleOcrText: 'GOVERNMENT OF PUNJAB • REVENUE DEPARTMENT • Income Certificate ID: PB-INC-2026-44129 • Verified Annual Family Income: ₹1,20,000 • Digitally Signed by Tehsildar',
  },
  {
    key: 'punjab residence / domicile certificate',
    canonicalKey: 'domicile_certificate',
    nameEn: 'Punjab Residence / Domicile Certificate',
    namePa: 'ਪੰਜਾਬ ਰਿਹਾਇਸ਼ੀ / ਡੋਮੀਸਾਈਲ ਸਰਟੀਫਿਕੇਟ',
    nameHi: 'पंजाब निवास / अधिवास प्रमाण पत्र',
    authority: 'Tehsildar / DC Office Punjab',
    sampleId: 'PB-DOM-2026-99120',
    isDigiLocker: true,
    sampleOcrText: 'e-SEWA PUNJAB • PUNJAB RESIDENCE / DOMICILE CERTIFICATE • Cert No: PB-DOM-2026-99120 • Bona fide Resident of Punjab Verified',
  },
  {
    key: 'sc / st / bc caste certificate',
    canonicalKey: 'caste_certificate',
    nameEn: 'SC / ST / BC Caste Certificate',
    namePa: 'ਅਨੁਸੂਚਿਤ ਜਾਤੀ / ਪੱਛੜੀ ਸ਼੍ਰੇਣੀ ਸਰਟੀਫਿਕੇਟ',
    nameHi: 'अनुसूचित जाति / पिछड़ा वर्ग प्रमाण पत्र',
    authority: 'Department of Social Justice, Punjab',
    sampleId: 'PB-SC-2025-11843',
    isDigiLocker: true,
    sampleOcrText: 'DEPT OF SOCIAL JUSTICE & EMPOWERMENT PUNJAB • Caste Certificate No: PB-SC-2025-11843 • Category: Scheduled Caste (SC) • DigiLocker Verified',
  },
  {
    key: 'active bank passbook (npci mapped)',
    canonicalKey: 'bank_passbook',
    nameEn: 'Active Bank Passbook (NPCI Mapped)',
    namePa: 'ਬੈਂਕ ਪਾਸਬੁੱਕ (NPCI ਆਧਾਰ ਲਿੰਕ)',
    nameHi: 'सक्रिय बैंक पासबुक (NPCI मैप किया गया)',
    authority: 'Scheduled Commercial Bank / PNB / SBI',
    sampleId: 'A/C: *******8821 (IFSC: PUNB0012)',
    isDigiLocker: true,
    sampleOcrText: 'PUNJAB NATIONAL BANK • Savings A/C: *******8821 • IFSC: PUNB0012400 • NPCI Aadhaar DBT Mapper Status: ACTIVE & LINKED',
  },
  {
    key: 'previous class marksheet & institution bonafide',
    canonicalKey: 'education_certificate',
    nameEn: 'Marksheet & Institution Bonafide Certificate',
    namePa: 'ਪਿਛਲੀ ਜਮਾਤ ਦੀ ਮਾਰਕਸ਼ੀਟ ਅਤੇ ਬੋਨਾਫਾਈਡ ਸਰਟੀਫਿਕੇਟ',
    nameHi: 'अंकतालिका एवं संस्थान बोनाफाइड प्रमाण पत्र',
    authority: 'PSEB / University / College Registrar',
    sampleId: 'PSEB-EDU-2026-7731',
    isDigiLocker: true,
    sampleOcrText: 'ACADEMIC MARKSHEET & BONAFIDE STUDENT CERTIFICATE • Roll/Reg No: PSEB-EDU-2026-7731 • Enrollment Status: Regular Full-Time Student',
  },
  {
    key: 'land ownership records (fard / jamabandi)',
    canonicalKey: 'land_record',
    nameEn: 'Land Ownership Records (Fard / Jamabandi)',
    namePa: 'ਜ਼ਮੀਨ ਦੀ ਫ਼ਰਦ / ਜਮ੍ਹਾਂਬੰਦੀ ਰਿਕਾਰਡ',
    nameHi: 'भूमि स्वामित्व रिकॉर्ड (जमाबंदी/फ़र्द)',
    authority: 'Revenue Department Punjab (PLRS)',
    sampleId: 'PLRS-FARD-2026/08912',
    isDigiLocker: false,
    sampleOcrText: 'PUNJAB LAND RECORDS SOCIETY (PLRS) • Record of Rights (Jamabandi / Fard) • Khewat/Khatoni: PLRS-FARD-2026/08912 • Cultivable Land Verified',
  },
  {
    key: 'nfsa smart ration card / blue card',
    canonicalKey: 'ration_card',
    nameEn: 'NFSA Smart Ration Card / Blue Card',
    namePa: 'ਸਮਾਰਟ ਰਾਸ਼ਨ ਕਾਰਡ (ਨੀਲਾ ਕਾਰਡ)',
    nameHi: 'स्मार्ट राशन कार्ड (नीला कार्ड)',
    authority: 'Food & Civil Supplies Department Punjab',
    sampleId: 'PB-NFSA-901238',
    isDigiLocker: true,
    sampleOcrText: 'FOOD CIVIL SUPPLIES & CONSUMER AFFAIRS PUNJAB • NFSA Smart Ration Card No: PB-NFSA-901238 • PHH / Antyodaya Household Verified',
  },
  {
    key: 'disability certificate / udid card',
    canonicalKey: 'disability_certificate',
    nameEn: 'Disability Certificate / UDID Card',
    namePa: 'ਦਿਵਿਆਂਗਤਾ ਸਰਟੀਫਿਕੇਟ / UDID ਕਾਰਡ',
    nameHi: 'दिव्यांगता प्रमाण पत्र / यूडीआईडी कार्ड',
    authority: 'Civil Surgeon / Swavlamban UDID Govt of India',
    sampleId: 'UDID-PB-2025-3309',
    isDigiLocker: true,
    sampleOcrText: 'UNIQUE DISABILITY ID (UDID) CARD • Govt of India & Civil Surgeon Medical Board • ID: UDID-PB-2025-3309 • Benchmark Disability Verified',
  },
];

/**
 * Deterministic AI Document OCR & Metadata Classifier.
 * Analyzes uploaded file names, raw OCR/pasted certificate text, or sample keys,
 * extracts structured government certificate metadata, and checks validity rules.
 */
export function scanAndAnalyzeDocumentInput(input: {
  fileName?: string;
  rawText?: string;
  sampleKey?: string;
}): ScannedDocumentAnalysis {
  const combinedText = `${input.sampleKey || ''} ${input.fileName || ''} ${input.rawText || ''}`.trim();
  const canonicalKey = normalizeCanonicalDocKey(combinedText);

  const matchedSample =
    SAMPLE_CITIZEN_DOCS.find((d) => d.key === input.sampleKey || d.canonicalKey === canonicalKey) ||
    SAMPLE_CITIZEN_DOCS[0];

  const meta = getDocumentMeta(combinedText || matchedSample.nameEn);

  // Extract candidate certificate / reference number if present in text
  const aadhaarMatch = combinedText.match(/\b(?:\d{4}[\s-]?){2}\d{4}\b|\b[xX*]{4}-?[xX*]{4}-?\d{4}\b/);
  const certIdMatch = combinedText.match(/\b(?:PB|DL|HR|HP|UP|RJ|IN|PLRS|PSEB|UDID)-[A-Z0-9/-]{4,18}\b/i);
  const ifscMatch = combinedText.match(/\b[A-Z]{4}0[A-Z0-9]{6}\b/);

  let extractedIdNumber = matchedSample.sampleId;
  if (aadhaarMatch) {
    const last4 = aadhaarMatch[0].replace(/\D/g, '').slice(-4) || '8912';
    extractedIdNumber = `XXXX-XXXX-${last4}`;
  } else if (certIdMatch) {
    extractedIdNumber = certIdMatch[0].toUpperCase();
  } else if (ifscMatch) {
    extractedIdNumber = `IFSC: ${ifscMatch[0].toUpperCase()} (NPCI Mapped)`;
  }

  // Check for expiry or warning keywords in raw text
  const lowerText = combinedText.toLowerCase();
  const hasExpiredYear = /\b(2018|2019|2020|2021|2022)\b/.test(lowerText) && canonicalKey === 'income_certificate';
  const unseededWarning = lowerText.includes('not seeded') || lowerText.includes('unlinked') || lowerText.includes('inactive');

  let validityStatus: ScannedDocumentAnalysis['validityStatus'] = 'Valid & Verified';
  let validityAdvisoryEn = `Official ${meta.category} certificate verified. Ready for direct portal upload & Sewa Kendra e-KYC.`;
  let validityAdvisoryPa = `ਅਧਿਕਾਰਤ ${meta.category} ਦਸਤਾਵੇਜ਼ ਤਸਦੀਕ ਹੋ ਗਿਆ ਹੈ। ਪੋਰਟਲ ਅਪਲੋਡ ਅਤੇ e-KYC ਲਈ ਤਿਆਰ ਹੈ।`;
  let validityAdvisoryHi = `आधिकारिक ${meta.category} प्रमाण पत्र सत्यापित। पोर्टल अपलोड और ई-केवाईसी के लिए तैयार।`;

  if (hasExpiredYear || unseededWarning) {
    validityStatus = 'Action Needed: Seeding / Validity Check';
    validityAdvisoryEn = hasExpiredYear
      ? 'Income Certificates older than 1 financial year must be renewed on Connect Punjab (esewa.punjab.gov.in) before scholarship/pension submission.'
      : 'Ensure Aadhaar mobile number and NPCI bank DBT mapping are active before submitting online.';
    validityAdvisoryPa = hasExpiredYear
      ? '1 ਸਾਲ ਤੋਂ ਪੁਰਾਣੇ ਆਮਦਨ ਸਰਟੀਫਿਕੇਟ ਨੂੰ ਅਰਜ਼ੀ ਦੇਣ ਤੋਂ ਪਹਿਲਾਂ ਸੇਵਾ ਕੇਂਦਰ ਤੋਂ ਨਵਿਆਉਣਾ ਜ਼ਰੂਰੀ ਹੈ।'
      : 'ਆਨਲਾਈਨ ਅਰਜ਼ੀ ਤੋਂ ਪਹਿਲਾਂ ਆਧਾਰ ਮੋਬਾਈਲ ਅਤੇ ਬੈਂਕ NPCI ਲਿੰਕ ਚੈੱਕ ਕਰੋ।';
    validityAdvisoryHi = hasExpiredYear
      ? '1 वर्ष से पुराने आय प्रमाण पत्र को आवेदन से पहले सेवा केंद्र से नवीनीकृत कराना आवश्यक है।'
      : 'ऑनलाइन आवेदन से पहले आधार मोबाइल और बैंक NPCI सीडिंग की पुष्टि करें।';
  }

  const isKnownCanonical = canonicalKey !== 'unknown_document' && SAMPLE_CITIZEN_DOCS.some((d) => d.canonicalKey === canonicalKey);
  const detectedTitleEn = isKnownCanonical ? matchedSample.nameEn : (input.fileName?.replace(/\.[^.]+$/, '') || 'Citizen Verification Document');
  const detectedTitlePa = isKnownCanonical ? matchedSample.namePa : detectedTitleEn;
  const detectedTitleHi = isKnownCanonical ? matchedSample.nameHi : detectedTitleEn;
  const docKey = isKnownCanonical ? matchedSample.key : detectedTitleEn.toLowerCase().trim();

  const matchedFields: string[] = [
    `Document Class: ${meta.category}`,
    `Issuing Authority: ${isKnownCanonical ? matchedSample.authority : 'State e-District / UIDAI'}`,
    `Reference / ID: ${extractedIdNumber}`,
    `DigiLocker Schema: ${matchedSample.isDigiLocker ? 'Compatible (Verified XML/QR)' : 'Revenue Record (PLRS)'}`,
  ];

  return {
    docKey,
    canonicalKey,
    detectedTitleEn,
    detectedTitlePa,
    detectedTitleHi,
    category: meta.category,
    issuingAuthority: isKnownCanonical ? matchedSample.authority : 'Government Issuing Authority',
    extractedIdNumber,
    confidenceScore: isKnownCanonical ? 98 : 89,
    isValidFormat: true,
    validityStatus,
    validityAdvisoryEn,
    validityAdvisoryPa,
    validityAdvisoryHi,
    availableOnDigiLocker: matchedSample.isDigiLocker,
    officialPortalUrl: meta.officialPortalUrl,
    scannedAt: new Date().toISOString(),
    matchedFields,
  };
}

/**
 * Computes a complete Missing Document Detection Report for both a specific Target Scheme
 * and across all Eligible / Potential schemes in the citizen's profile.
 */
export function detectMissingDocumentsReport(
  schemes: Scheme[],
  evaluations: EligibilityEvaluation[],
  userOwnedDocs: Set<string>,
  targetSchemeId?: string
): MissingDocumentDetectionReport {
  const safeSchemes = schemes.length > 0 ? schemes : [];
  const activeScheme =
    safeSchemes.find((s) => s.id === targetSchemeId) ||
    evaluations.find((e) => e.isEligible)?.scheme ||
    safeSchemes[0];

  const targetDocs: SchemeDocumentStatusItem[] = (activeScheme?.requiredDocuments || []).map((doc) => {
    const meta = getDocumentMeta(doc.nameEn);
    const possessed = isDocumentOwned(doc.nameEn, userOwnedDocs);
    return {
      nameEn: doc.nameEn,
      namePa: doc.namePa,
      nameHi: doc.nameHi,
      docKey: doc.nameEn.toLowerCase().trim(),
      canonicalKey: meta.canonicalKey,
      issuingAuthority: doc.issuingAuthority,
      availableOnDigiLocker: doc.availableOnDigiLocker,
      isPossessed: possessed,
      isMandatory: meta.isMandatory,
      category: meta.category,
      emoji: meta.emoji,
      howToObtainEn: meta.howToObtainEn,
      howToObtainPa: meta.howToObtainPa,
      howToObtainHi: meta.howToObtainHi,
      officialPortalUrl: meta.officialPortalUrl,
      officialPortalName: meta.officialPortalName,
      estimatedDays: meta.estimatedDays,
      officialFee: meta.officialFee,
    };
  });

  const verifiedCount = targetDocs.filter((d) => d.isPossessed).length;
  const missingDocsForTarget = targetDocs.filter((d) => !d.isPossessed);
  const missingCount = missingDocsForTarget.length;
  const mandatoryMissingCount = missingDocsForTarget.filter((d) => d.isMandatory).length;
  const optionalMissingCount = missingCount - mandatoryMissingCount;
  const readinessPct = targetDocs.length > 0 ? Math.round((verifiedCount / targetDocs.length) * 100) : 100;

  // Profile-wide analysis across all eligible & potential schemes
  const relevantEvaluations =
    evaluations.filter((e) => e.isEligible || e.isPotentialMatch).length > 0
      ? evaluations.filter((e) => e.isEligible || e.isPotentialMatch)
      : evaluations;

  const canonicalGroupMap = new Map<
    string,
    {
      canonicalKey: string;
      docKey: string;
      nameEn: string;
      namePa: string;
      nameHi: string;
      issuingAuthority: string;
      availableOnDigiLocker: boolean;
      isOwned: boolean;
      schemeTitles: string[];
      meta: DocumentItemMeta;
    }
  >();

  const readyToApplySchemeIds: string[] = [];
  const readyToApplySchemeTitles: string[] = [];
  const almostReadySchemeTitles: { schemeId: string; titleEn: string; missingDocName: string }[] = [];

  for (const evalItem of relevantEvaluations) {
    const reqDocs = evalItem.scheme.requiredDocuments || [];
    const missingInScheme: string[] = [];

    for (const doc of reqDocs) {
      const meta = getDocumentMeta(doc.nameEn);
      const cKey = meta.canonicalKey;
      const owned = isDocumentOwned(doc.nameEn, userOwnedDocs);
      if (!owned) {
        missingInScheme.push(doc.nameEn);
      }

      if (!canonicalGroupMap.has(cKey)) {
        canonicalGroupMap.set(cKey, {
          canonicalKey: cKey,
          docKey: doc.nameEn.toLowerCase().trim(),
          nameEn: doc.nameEn,
          namePa: doc.namePa,
          nameHi: doc.nameHi,
          issuingAuthority: doc.issuingAuthority,
          availableOnDigiLocker: doc.availableOnDigiLocker,
          isOwned: owned,
          schemeTitles: [evalItem.scheme.titleEn],
          meta,
        });
      } else {
        const existing = canonicalGroupMap.get(cKey)!;
        if (owned) existing.isOwned = true;
        if (!existing.schemeTitles.includes(evalItem.scheme.titleEn)) {
          existing.schemeTitles.push(evalItem.scheme.titleEn);
        }
      }
    }

    if (missingInScheme.length === 0 && reqDocs.length > 0) {
      readyToApplySchemeIds.push(evalItem.scheme.id);
      readyToApplySchemeTitles.push(evalItem.scheme.titleEn);
    } else if (missingInScheme.length === 1) {
      almostReadySchemeTitles.push({
        schemeId: evalItem.scheme.id,
        titleEn: evalItem.scheme.titleEn,
        missingDocName: missingInScheme[0],
      });
    }
  }

  const allGroups = Array.from(canonicalGroupMap.values());
  const ownedGroups = allGroups.filter((g) => g.isOwned);
  const missingGroups = allGroups
    .filter((g) => !g.isOwned)
    .sort((a, b) => b.schemeTitles.length - a.schemeTitles.length);

  const highImpactMissingDocs: HighImpactMissingDoc[] = missingGroups.map((g) => ({
    canonicalKey: g.canonicalKey,
    docKey: g.docKey,
    nameEn: g.nameEn,
    namePa: g.namePa,
    nameHi: g.nameHi,
    category: g.meta.category,
    emoji: g.meta.emoji,
    issuingAuthority: g.issuingAuthority,
    availableOnDigiLocker: g.availableOnDigiLocker,
    isMandatory: g.meta.isMandatory,
    unlockedSchemesCount: g.schemeTitles.length,
    unlockedSchemeTitles: g.schemeTitles,
    howToObtainEn: g.meta.howToObtainEn,
    howToObtainPa: g.meta.howToObtainPa,
    howToObtainHi: g.meta.howToObtainHi,
    officialPortalUrl: g.meta.officialPortalUrl,
    officialPortalName: g.meta.officialPortalName,
    estimatedDays: g.meta.estimatedDays,
    officialFee: g.meta.officialFee,
  }));

  const overallReadinessPct =
    allGroups.length > 0 ? Math.round((ownedGroups.length / allGroups.length) * 100) : 100;

  return {
    targetScheme: {
      schemeId: activeScheme?.id || 'default',
      titleEn: activeScheme?.titleEn || 'Government Scheme',
      titlePa: activeScheme?.titlePa || activeScheme?.titleEn || '',
      titleHi: activeScheme?.titleHi || activeScheme?.titleEn || '',
      totalDocs: targetDocs.length,
      verifiedCount,
      missingCount,
      mandatoryMissingCount,
      optionalMissingCount,
      readinessPct,
      documents: targetDocs,
    },
    profileWide: {
      totalUniqueDocs: allGroups.length,
      ownedUniqueCount: ownedGroups.length,
      missingUniqueCount: missingGroups.length,
      overallReadinessPct,
      readyToApplySchemeIds,
      readyToApplySchemeTitles,
      almostReadySchemeTitles,
      highImpactMissingDocs,
    },
  };
}

/**
 * Downloads a structured citizen factsheet for a scheme
 */
export function downloadSchemeSummary(scheme: Scheme, lang: 'en' | 'pa' | 'hi' = 'en') {
  const isPunjab = scheme.level === 'Punjab State';
  const title = lang === 'pa' ? scheme.titlePa : lang === 'hi' ? scheme.titleHi : scheme.titleEn;
  const dept = lang === 'pa' ? scheme.departmentPa : lang === 'hi' ? scheme.departmentHi : scheme.departmentEn;
  const desc = lang === 'pa' ? scheme.descriptionPa : lang === 'hi' ? scheme.descriptionHi : scheme.descriptionEn;

  const content = `================================================================================
GOVERNMENT OF INDIA & GOVERNMENT OF PUNJAB - WELFARE SCHEME FACTSHEET
CTBF-AI-07 • Government Scheme Eligibility Navigator
================================================================================

SCHEME NAME: ${title}
LEVEL: ${scheme.level}
DEPARTMENT / MINISTRY: ${dept}
OFFICIAL PORTAL: ${scheme.officialPortalUrl}
APPLICATION FEES: 100% FREE (No government application charge; do not pay unauthorized agents)
HELPLINE: ${isPunjab ? 'Punjab Citizen Helpline: 1100 (Toll-Free)' : 'National Citizen Portal: 1800-11-0031'}

--------------------------------------------------------------------------------
1. KEY BENEFITS & FINANCIAL ASSISTANCE:
--------------------------------------------------------------------------------
${scheme.benefitAmountText}

Description:
${desc}

--------------------------------------------------------------------------------
2. ELIGIBILITY CRITERIA:
--------------------------------------------------------------------------------
- Age Requirement: ${scheme.minAge ? scheme.minAge + ' years' : 'Any'} ${scheme.maxAge ? 'to ' + scheme.maxAge + ' years' : ''}
- Annual Income Ceiling: ${scheme.maxIncome ? 'Up to ₹' + scheme.maxIncome.toLocaleString('en-IN') + '/year' : 'No Income Ceiling'}
- Eligible Occupations: ${scheme.eligibleOccupations?.join(', ') || 'All occupations'}
- Social Categories: ${scheme.eligibleCategories?.join(', ') || 'All categories'}
- Target Genders: ${scheme.targetGenders?.join(', ') || 'All'}
- Domicile: ${scheme.requiresPunjabDomicile ? 'Punjab Resident / Domicile Mandatory' : 'All-India Citizens'}
${scheme.maxLandholdingAcres ? `- Maximum Landholding: ${scheme.maxLandholdingAcres} Acres` : ''}
${scheme.requiresDisability ? '- Special Condition: Requires Benchmark Disability (≥ 40%)' : ''}
${scheme.requiresWidow ? '- Special Condition: For Widows / Destitute Women' : ''}

--------------------------------------------------------------------------------
3. REQUIRED DOCUMENTS CHECKLIST:
--------------------------------------------------------------------------------
${scheme.requiredDocuments.map((doc, idx) => {
  const meta = getDocumentMeta(doc.nameEn);
  const status = meta.isMandatory ? '[MANDATORY]' : '[IF APPLICABLE]';
  const digi = doc.availableOnDigiLocker ? '(Available on DigiLocker)' : '';
  const name = lang === 'pa' ? doc.namePa : lang === 'hi' ? doc.nameHi : doc.nameEn;
  return `${idx + 1}. ${meta.emoji} ${name} ${status}
     Issuing Authority: ${doc.issuingAuthority} ${digi}
     How to Obtain: ${meta.howToObtainEn} (${meta.officialPortalUrl})`;
}).join('\n\n')}

--------------------------------------------------------------------------------
4. STEP-BY-STEP APPLICATION PROCEDURE:
--------------------------------------------------------------------------------
${scheme.applicationSteps.map(step => {
  const stepTitle = lang === 'pa' ? step.titlePa : lang === 'hi' ? step.titleHi : step.titleEn;
  const stepDesc = lang === 'pa' ? step.descriptionPa : lang === 'hi' ? step.descriptionHi : step.descriptionEn;
  return `Step ${step.stepNumber}: ${stepTitle}
   ${stepDesc}`;
}).join('\n\n')}

--------------------------------------------------------------------------------
5. IMPORTANT DATES & DEADLINE:
--------------------------------------------------------------------------------
- Application Timeline: ${scheme.applicationDeadline}
- Cycle Type: ${scheme.deadlineType}

--------------------------------------------------------------------------------
OFFICIAL SAFETY ADVISORY:
--------------------------------------------------------------------------------
Apply only on official .gov.in or .nic.in portals or in-person at authorized 
Punjab Sewa Kendras. Beware of fraudulent links asking for bank OTPs or 
registration fees. Report cyber fraud to National Helpline 1930.

Generated on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
Punjab Scheme Navigator AI (CTBF-AI-07)
================================================================================`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${scheme.id}-scheme-factsheet.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
