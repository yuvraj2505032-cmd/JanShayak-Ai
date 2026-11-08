import type { CitizenProfile, Language, Scheme } from '../types/scheme';
import { evaluateAllSchemes, evaluateSchemeEligibility } from './schemeEngine';

const OFFLINE_CACHE_KEYS = {
  recentlyViewed: 'janshayak_recently_viewed_offline_v1',
  documentChecklists: 'janshayak_document_checklists_v1',
};

export function readJsonSafe<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

export function writeJsonSafe<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota issues in restricted browser contexts
  }
}

export function getOfflineRecentlyViewed(): string[] {
  return readJsonSafe<string[]>(OFFLINE_CACHE_KEYS.recentlyViewed, []);
}

export function setOfflineRecentlyViewed(ids: string[]): void {
  writeJsonSafe(OFFLINE_CACHE_KEYS.recentlyViewed, ids.slice(0, 12));
}

export function getOfflineDocumentChecklist(schemeId: string): Record<number, boolean> {
  const parsed = readJsonSafe<Record<string, Record<number, boolean>>>(OFFLINE_CACHE_KEYS.documentChecklists, {});
  return parsed[schemeId] ?? {};
}

export function setOfflineDocumentChecklist(schemeId: string, checklist: Record<number, boolean>): void {
  const all = readJsonSafe<Record<string, Record<number, boolean>>>(OFFLINE_CACHE_KEYS.documentChecklists, {});
  all[schemeId] = checklist;
  writeJsonSafe(OFFLINE_CACHE_KEYS.documentChecklists, all);
}

export function clearOfflineCache(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  Object.values(OFFLINE_CACHE_KEYS).forEach((key) => window.localStorage.removeItem(key));
}

export interface OfflineChatResult {
  reply: string;
  recommendedSchemeIds: string[];
  isAiGrounded: boolean;
}

const STOPWORDS = new Set([
  'what', 'which', 'where', 'when', 'who', 'whom', 'whose', 'why', 'how',
  'can', 'could', 'would', 'should', 'will', 'shall', 'may', 'might',
  'are', 'is', 'was', 'were', 'been', 'being', 'have', 'has', 'had',
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'these', 'those',
  'available', 'scheme', 'schemes', 'punjab', 'central', 'government', 'govt',
  'india', 'apply', 'online', 'application', 'process', 'rule', 'rules',
  'tell', 'about', 'get', 'under', 'conditions', 'eligibility', 'documents',
  'small', 'land', 'lakh', 'thousand', 'units', 'free', 'card', 'yojana',
]);

/**
 * Generates an accurate offline chat reply in English, Punjabi, or Hindi
 * using the local government schemes database and citizen profile eligibility engine.
 */
export function generateOfflineChatReply(
  query: string,
  languageCode: string,
  profile: CitizenProfile,
  schemes: Scheme[]
): OfflineChatResult {
  const langPrefix = String(languageCode || 'en').toLowerCase().split(/[-_]/)[0];
  const q = query.trim().toLowerCase();
  const words = q
    .replace(/[?.,!;:()"']/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));

  const isFarmerQuery = /farmer|kisan|crop|agriculture|ਕਿਸਾਨ|ਖੇਤੀ|किसान|कृषि/.test(q);
  const isStudentQuery = /student|scholar|matric|college|school|education|ਵਿਦਿਆਰਥੀ|ਵਜ਼ੀਫਾ|छात्र|छात्रवृत्ति/.test(q);
  const isWomenQuery = /women|woman|girl|ashirwad|shagun|marriage|widow|ujjwala|sukanya|ਔਰਤ|ਸ਼ਗਨ|ਵਿਆਹ|ਧੀ|महिला|विवाह|बेटी/.test(q);
  const isPensionQuery = /pension|old age|senior|ਬੁਢਾਪਾ|ਪੈਨਸ਼ਨ|ਬਜ਼ੁਰਗ|पेंशन|वृद्ध/.test(q);
  const isHealthQuery = /health|medical|hospital|sehat|ayushman|bima|treatment|ਸਿਹਤ|ਇਲਾਜ|ਬੀਮਾ|स्वास्थ्य|इलाज/.test(q);
  const isElectricityQuery = /electricity|bijli|300|power|ਬਿਜਲੀ|ਯੂਨਿਟ|बिजली/.test(q);
  const isHousingQuery = /house|housing|awas|home|ਮਕਾਨ|ਘਰ|आवास|मकान/.test(q);
  const isLoanQuery = /loan|mudra|business|svanidhi|vishwakarma|ਕਰਜ਼ਾ|ਕਾਰੋਬਾਰ|ऋण|लोन/.test(q);

  let matched = schemes.filter((s) => {
    const tagsLower = s.categoryTags.map((t) => t.toLowerCase()).join(' ');
    if (isFarmerQuery && (s.id.includes('kisan') || s.id.includes('crop') || s.id.includes('dsr') || tagsLower.includes('agriculture') || s.eligibleOccupations?.includes('Farmer'))) {
      return true;
    }
    if (isStudentQuery && (s.id.includes('matric') || s.benefitType === 'Scholarship' || tagsLower.includes('education') || tagsLower.includes('student'))) {
      return true;
    }
    if (isWomenQuery && (s.id.includes('ashirwad') || s.id.includes('widow') || s.id.includes('ujjwala') || s.id.includes('sukanya') || s.id.includes('mahila') || tagsLower.includes('women'))) {
      return true;
    }
    if (isPensionQuery && (s.id.includes('pension') || s.benefitType === 'Pension')) {
      return true;
    }
    if (isHealthQuery && (s.id.includes('sehat') || s.id.includes('ayushman') || tagsLower.includes('health'))) {
      return true;
    }
    if (isElectricityQuery && s.id.includes('electricity')) {
      return true;
    }
    if (isHousingQuery && (s.id.includes('awas') || tagsLower.includes('housing'))) {
      return true;
    }
    if (isLoanQuery && (s.id.includes('mudra') || s.id.includes('svanidhi') || s.id.includes('vishwakarma') || s.benefitType === 'Loan/Credit')) {
      return true;
    }
    return false;
  });

  if (matched.length === 0 && words.length > 0) {
    matched = schemes.filter((s) => {
      const text = `${s.titleEn} ${s.titlePa} ${s.titleHi} ${s.benefitAmountText} ${s.departmentEn} ${s.categoryTags.join(' ')}`.toLowerCase();
      return words.some((word) => text.includes(word));
    });
  }

  // If no specific keyword matched, recommend top schemes matching the citizen's active profile
  if (matched.length === 0) {
    const evaluations = evaluateAllSchemes(profile, schemes);
    matched = evaluations
      .filter((e) => e.isEligible || e.isPotentialMatch)
      .slice(0, 3)
      .map((e) => e.scheme);
  } else {
    matched = matched.slice(0, 3);
  }

  if (matched.length === 0) {
    matched = schemes.slice(0, 3);
  }

  const recommendedSchemeIds = matched.map((s) => s.id);

  if (langPrefix === 'pa') {
    const body = matched
      .map(
        (s, idx) =>
          `${idx + 1}. ${s.titlePa} (${s.level}):\n` +
          `• ਲਾਭ: ${s.benefitAmountText}\n` +
          `• ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼: ${s.requiredDocuments.slice(0, 3).map((d) => d.namePa || d.nameEn).join(', ')}\n` +
          `• ਅਧਿਕਾਰਤ ਪੋਰਟਲ: ${s.officialPortalUrl}`
      )
      .join('\n\n');

    return {
      reply:
        `📶 ਆਫ਼ਲਾਈਨ ਮੋਡ (Offline AI ਸਹਾਇਕ): ਤੁਹਾਡੇ ਪ੍ਰੋਫਾਈਲ (${profile.occupation}, ਉਮਰ ${profile.age}) ਅਤੇ ਸਵਾਲ ਅਨੁਸਾਰ ਪ੍ਰਮਾਣਿਤ ਸਰਕਾਰੀ ਸਕੀਮਾਂ:\n\n` +
        body +
        `\n\n🔒 ਸੁਰੱਖਿਆ ਸੂਚਨਾ: ਸਾਰੀਆਂ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਲਈ ਅਰਜ਼ੀ ਬਿਲਕੁਲ ਮੁਫ਼ਤ ਹੈ। ਨੇੜਲੇ ਪੰਜਾਬ ਸੇਵਾ ਕੇਂਦਰ ਜਾਓ ਜਾਂ ਟੋਲ-ਫ੍ਰੀ ਹੈਲਪਲਾਈਨ 1100 'ਤੇ ਕਾਲ ਕਰੋ।`,
      recommendedSchemeIds,
      isAiGrounded: true,
    };
  }

  if (langPrefix === 'hi') {
    const body = matched
      .map(
        (s, idx) =>
          `${idx + 1}. ${s.titleHi} (${s.level}):\n` +
          `• प्रमुख लाभ: ${s.benefitAmountText}\n` +
          `• आवश्यक दस्तावेज़: ${s.requiredDocuments.slice(0, 3).map((d) => d.nameHi || d.nameEn).join(', ')}\n` +
          `• आधिकारिक पोर्टल: ${s.officialPortalUrl}`
      )
      .join('\n\n');

    return {
      reply:
        `📶 ऑफ़लाइन मोड (Offline AI सहायक): आपकी प्रोफ़ाइल (${profile.occupation}, आयु ${profile.age}) और प्रश्न के अनुसार प्रमुख सरकारी योजनाएं:\n\n` +
        body +
        `\n\n🔒 सुरक्षा सूचना: सभी सरकारी योजनाएं 100% निःशुल्क हैं। नजदीकी सेवा केंद्र जाएं या हेल्पलाइन 1100 पर कॉल करें।`,
      recommendedSchemeIds,
      isAiGrounded: true,
    };
  }

  const body = matched
    .map(
      (s, idx) =>
        `${idx + 1}. ${s.titleEn} (${s.level}):\n` +
        `• Benefit: ${s.benefitAmountText}\n` +
        `• Key Documents: ${s.requiredDocuments.slice(0, 3).map((d) => d.nameEn).join(', ')}\n` +
        `• Official Portal: ${s.officialPortalUrl}`
    )
    .join('\n\n');

  return {
    reply:
      `📶 Offline Mode (Local Scheme Engine): Based on your question and profile (${profile.occupation}, Age ${profile.age}, ${profile.district}), here are the top verified government schemes:\n\n` +
      body +
      `\n\n🔒 Citizen Fraud Shield: All official government scheme applications are 100% free of charge. Visit your nearest Punjab Sewa Kendra or call Helpline 1100.`,
    recommendedSchemeIds,
    isAiGrounded: true,
  };
}

/**
 * Generates structured offline per-scheme eligibility advice when internet/API is unavailable.
 */
export function generateOfflineSchemeAdvice(
  scheme: Scheme,
  profile: CitizenProfile,
  language: Language
): string {
  const evaluation = evaluateSchemeEligibility(profile, scheme);
  const verdictEn = evaluation.isEligible
    ? `Confirmed Eligible (${evaluation.matchPercentage}% Match)`
    : evaluation.isPotentialMatch
    ? `High Potential Match (${evaluation.matchPercentage}% Match)`
    : `Currently Not Eligible (${evaluation.matchPercentage}% Match)`;

  const reasons = [...evaluation.matchedReasons, ...evaluation.failedReasons];
  const docsEn = scheme.requiredDocuments.map((d) => `• ${d.nameEn} (${d.issuingAuthority})`).join('\n');
  const docsPa = scheme.requiredDocuments.map((d) => `• ${d.namePa || d.nameEn} (${d.issuingAuthority})`).join('\n');
  const docsHi = scheme.requiredDocuments.map((d) => `• ${d.nameHi || d.nameEn} (${d.issuingAuthority})`).join('\n');

  if (language === 'pa') {
    return (
      `📶 [ਆਫ਼ਲਾਈਨ AI ਮੁਲਾਂਕਣ — ${scheme.titlePa}]\n\n` +
      `1. ਯੋਗਤਾ ਨਤੀਜਾ (Eligibility Verdict):\n` +
      `${evaluation.isEligible ? '✅ ਪੂਰੀ ਤਰ੍ਹਾਂ ਯੋਗ' : evaluation.isPotentialMatch ? '⚠️ ਸੰਭਾਵੀ ਮੈਚ' : '❌ ਸ਼ਰਤਾਂ ਪੂਰੀਆਂ ਨਹੀਂ'} (${evaluation.matchPercentage}% ਮੈਚ)\n` +
      `${reasons.map((r) => `• ${r}`).join('\n')}\n\n` +
      `2. ਮਿਲਣਯੋਗ ਲਾਭ (Benefit Entitlement):\n` +
      `• ${scheme.benefitAmountText} (${scheme.benefitType})\n\n` +
      `3. ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼ (Required Documents):\n${docsPa}\n\n` +
      `4. ਅਰਜ਼ੀ ਦੇਣ ਦਾ ਤਰੀਕਾ (Next Steps):\n` +
      `• ਆਪਣੇ ਜ਼ਿਲ੍ਹੇ (${profile.district}) ਦੇ ਨੇੜਲੇ ਪੰਜਾਬ ਸੇਵਾ ਕੇਂਦਰ ਜਾਓ ਜਾਂ ਅਧਿਕਾਰਤ ਪੋਰਟਲ (${scheme.officialPortalUrl}) 'ਤੇ ਆਨਲਾਈਨ ਅਪਲਾਈ ਕਰੋ।\n\n` +
      `5. ਸੁਰੱਖਿਆ ਸਲਾਹ: ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਬਿਲਕੁਲ ਮੁਫ਼ਤ ਹਨ। ਟੋਲ-ਫ੍ਰੀ ਹੈਲਪਲਾਈਨ: 1100.`
    );
  }

  if (language === 'hi') {
    return (
      `📶 [ऑफ़लाइन AI मूल्यांकन — ${scheme.titleHi}]\n\n` +
      `1. पात्रता निर्णय (Eligibility Verdict):\n` +
      `${evaluation.isEligible ? '✅ पूर्णतः पात्र' : evaluation.isPotentialMatch ? '⚠️ संभावित मैच' : '❌ अपात्र'} (${evaluation.matchPercentage}% मैच)\n` +
      `${reasons.map((r) => `• ${r}`).join('\n')}\n\n` +
      `2. लाभ पात्रता (Benefit Entitlement):\n` +
      `• ${scheme.benefitAmountText} (${scheme.benefitType})\n\n` +
      `3. आवश्यक दस्तावेज़ (Documents Checklist):\n${docsHi}\n\n` +
      `4. आवेदन प्रक्रिया (Actionable Next Steps):\n` +
      `• अपने जिले (${profile.district}) के सेवा केंद्र जाएं या आधिकारिक पोर्टल (${scheme.officialPortalUrl}) पर निःशुल्क आवेदन करें।\n\n` +
      `5. सुरक्षा सलाह: किसी भी एजेंट को पैसे या OTP न दें। हेल्पलाइन: 1100.`
    );
  }

  return (
    `📶 [Offline AI Eligibility Evaluation — ${scheme.titleEn}]\n\n` +
    `1. Eligibility Verdict:\n` +
    `• Status: ${verdictEn}\n` +
    `${reasons.map((r) => `• ${r}`).join('\n')}\n\n` +
    `2. Exact Benefit Entitlement:\n` +
    `• ${scheme.benefitAmountText} (${scheme.benefitType} under ${scheme.departmentEn})\n\n` +
    `3. Critical Documents Checklist:\n${docsEn}\n\n` +
    `4. Actionable Next Steps:\n` +
    `• Apply online via ${scheme.officialPortalName} (${scheme.officialPortalUrl}) or visit your nearest Punjab Sewa Kendra in ${profile.district}.\n\n` +
    `5. Zero-Fraud Advisory:\n` +
    `• All official scheme applications are 100% free. Call Punjab Helpline 1100 or Cyber Helpline 1930 for assistance.`
  );
}

/**
 * Generates a comprehensive offline profile welfare roadmap when internet/API is unavailable.
 */
export function generateOfflineProfileRoadmap(
  profile: CitizenProfile,
  schemes: Scheme[],
  language: Language
): string {
  const evaluations = evaluateAllSchemes(profile, schemes);
  const topMatches = evaluations.filter((e) => e.isEligible || e.isPotentialMatch).slice(0, 4);
  const selected = topMatches.length > 0 ? topMatches.map((e) => e.scheme) : schemes.slice(0, 4);

  if (language === 'pa') {
    return (
      `📶 [ਆਫ਼ਲਾਈਨ ਸਰਕਾਰੀ ਭਲਾਈ ਰੋਡਮੈਪ — ${profile.occupation}, ਉਮਰ ${profile.age}, ${profile.district}]\n\n` +
      `1. ਸਭ ਤੋਂ ਮਹੱਤਵਪੂਰਨ ਸਕੀਮਾਂ (Top Priority Schemes):\n` +
      selected.map((s, i) => `   ${i + 1}. ${s.titlePa} — ${s.benefitAmountText} (${s.officialPortalUrl})`).join('\n') +
      `\n\n2. ਦਸਤਾਵੇਜ਼ ਤਿਆਰੀ ਰਣਨੀਤੀ (Document Preparation):\n` +
      `   • ਆਧਾਰ ਕਾਰਡ ਨਾਲ ਮੋਬਾਈਲ ਨੰਬਰ ਅਤੇ ਬੈਂਕ ਖਾਤਾ (NPCI DBT) ਲਿੰਕ ਰੱਖੋ।\n` +
      `   • ਪੰਜਾਬ ਰਿਹਾਇਸ਼ ਸਰਟੀਫਿਕੇਟ ਅਤੇ ਆਮਦਨ/ਜਾਤੀ ਸਰਟੀਫਿਕੇਟ ਸੇਵਾ ਕੇਂਦਰ ਤੋਂ ਤਿਆਰ ਰੱਖੋ।\n\n` +
      `3. ਪਰਿਵਾਰਕ ਲਾਭ ਸੁਝਾਅ (Family Multiplier Tips):\n` +
      `   • ਪਰਿਵਾਰ ਦੇ ਬਜ਼ੁਰਗਾਂ ਲਈ ਬੁਢਾਪਾ ਪੈਨਸ਼ਨ ਅਤੇ ਪੂਰੇ ਪਰਿਵਾਰ ਲਈ ਸਰਬਤ ਸਿਹਤ ਬੀਮਾ ਯੋਜਨਾ (₹5 ਲੱਖ ਇਲਾਜ) ਦੀ ਜਾਂਚ ਜ਼ਰੂਰ ਕਰੋ।\n\n` +
      `4. ਨਾਗਰਿਕ ਸੁਰੱਖਿਆ: ਅਰਜ਼ੀ ਦੇਣ ਲਈ ਕਿਸੇ ਵਿਚੋਲੇ ਨੂੰ ਪੈਸੇ ਨਾ ਦਿਓ। ਮੁਫ਼ਤ ਮਦਦ ਲਈ 1100 'ਤੇ ਕਾਲ ਕਰੋ।`
    );
  }

  if (language === 'hi') {
    return (
      `📶 [ऑफ़लाइन सरकारी कल्याण रोडमैप — ${profile.occupation}, आयु ${profile.age}, ${profile.district}]\n\n` +
      `1. शीर्ष प्राथमिकता वाली योजनाएं (Top Priority Schemes):\n` +
      selected.map((s, i) => `   ${i + 1}. ${s.titleHi} — ${s.benefitAmountText} (${s.officialPortalUrl})`).join('\n') +
      `\n\n2. दस्तावेज़ रणनीति (Document Preparation Strategy):\n` +
      `   • आधार कार्ड से मोबाइल और बैंक खाता (NPCI DBT) लिंक रखें।\n` +
      `   • पंजाब निवास प्रमाण पत्र और आय/जाति प्रमाण पत्र सेवा केंद्र से अपडेट रखें।\n\n` +
      `3. पारिवारिक लाभ सुझाव (Family Multiplier Tips):\n` +
      `   • परिवार के सदस्यों के लिए आयुष्मान भारत सरबत सेहत बीमा (₹5 लाख स्वास्थ्य कवर) और छात्रवृत्ति योजनाओं की जांच करें।\n\n` +
      `4. सुरक्षा सलाह: सभी सरकारी आवेदन निःशुल्क हैं। टोल-फ्री हेल्पलाइन: 1100.`
    );
  }

  return (
    `📶 [Offline Citizen Welfare Roadmap — ${profile.occupation}, Age ${profile.age}, ${profile.district}]\n\n` +
    `1. Top Priority Schemes to Apply Immediately:\n` +
    selected.map((s, i) => `   ${i + 1}. ${s.titleEn} — ${s.benefitAmountText} (${s.officialPortalUrl})`).join('\n') +
    `\n\n2. Strategic Document Preparation:\n` +
    `   • Keep Aadhaar linked with an active mobile number and NPCI-seeded Bank Account for Direct Benefit Transfer (DBT).\n` +
    `   • Obtain verified Punjab Domicile, Income (₹${profile.annualIncome.toLocaleString('en-IN')}/yr), and Category (${profile.category}) certificates via DigiLocker or ${profile.district} Sewa Kendra.\n\n` +
    `3. Family Benefit Multiplier Tips:\n` +
    `   • Use the "Family Benefit Finder" tab (works 100% offline) to combine student scholarships, farmer subsidies, and senior citizen pensions for your household.\n\n` +
    `4. Zero-Fraud Reminder:\n` +
    `   • Never pay middlemen or share OTPs. Dial Punjab Citizen Helpline 1100 for free guidance.`
  );
}
