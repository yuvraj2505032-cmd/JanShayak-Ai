import { Scheme } from '../types/scheme';

export type DeadlineUrgency = 'critical' | 'urgent' | 'upcoming';

export interface UpcomingSchemeDeadline {
  scheme: Scheme;
  deadlineDateIso: string; // YYYY-MM-DD
  formattedDateEn: string;
  formattedDatePa: string;
  formattedDateHi: string;
  daysRemaining: number;
  urgency: DeadlineUrgency;
  milestoneLabelEn: string;
  milestoneLabelPa: string;
  milestoneLabelHi: string;
}

interface SchemeDeadlineMilestone {
  targetDateIso: string; // YYYY-MM-DD anchored in Nov/Dec 2026
  fallbackOffsetDays: number; // Used if referenceDate is outside Oct-Dec 2026
  milestoneLabelEn: string;
  milestoneLabelPa: string;
  milestoneLabelHi: string;
}

const MONTH_NAMES_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const MONTH_NAMES_PA = [
  'ਜਨਵਰੀ', 'ਫਰਵਰੀ', 'ਮਾਰਚ', 'ਅਪ੍ਰੈਲ', 'ਮਈ', 'ਜੂਨ',
  'ਜੁਲਾਈ', 'ਅਗਸਤ', 'ਸਤੰਬਰ', 'ਅਕਤੂਬਰ', 'ਨਵੰਬਰ', 'ਦਸੰਬਰ'
];

const MONTH_NAMES_HI = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
];

const MONTH_LOOKUP: Record<string, number> = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11
};

/**
 * Curated schedule of upcoming application / verification cutoffs for Punjab & Central schemes.
 * Dates are anchored around the November 2026 session window, with fallbackOffsetDays for arbitrary reference dates.
 */
export const SCHEME_DEADLINE_MILESTONES: Record<string, SchemeDeadlineMilestone> = {
  'punjab-crm-machinery': {
    targetDateIso: '2026-11-08',
    fallbackOffsetDays: 7,
    milestoneLabelEn: 'Super Seeder & CRM Machinery Rabi Subsidy Draw Cut-off',
    milestoneLabelPa: 'ਸੁਪਰ ਸੀਡਰ ਅਤੇ ਖੇਤੀ ਮਸ਼ੀਨਰੀ ਸਬਸਿਡੀ ਡਰਾਅ ਆਖਰੀ ਮਿਤੀ',
    milestoneLabelHi: 'सुपर सीडर एवं कृषि मशीनरी सब्सिडी ड्रा अंतिम तिथि'
  },
  'aicte-pragati-saksham-scholarship': {
    targetDateIso: '2026-11-12',
    fallbackOffsetDays: 11,
    milestoneLabelEn: 'AICTE Pragati & Saksham ₹50,000 Technical Scholarship Cut-off',
    milestoneLabelPa: 'AICTE ਪ੍ਰਗਤੀ ਅਤੇ ਸਕਸ਼ਮ ₹50,000 ਤਕਨੀਕੀ ਵਜ਼ੀਫ਼ਾ ਆਖਰੀ ਮਿਤੀ',
    milestoneLabelHi: 'एआईसीटीई प्रगति एवं सक्षम ₹50,000 छात्रवृत्ति अंतिम तिथि'
  },
  'punjab-ashirwad': {
    targetDateIso: '2026-11-14',
    fallbackOffsetDays: 13,
    milestoneLabelEn: 'Ashirwad (Shagun) ₹51,000 Marriage Grant 30-Day Window',
    milestoneLabelPa: 'ਅਸ਼ੀਰਵਾਦ (ਸ਼ਗਨ) ₹51,000 ਸਹਾਇਤਾ 30-ਦਿਨਾਂ ਦੀ ਸਮਾਂ ਸੀਮਾ',
    milestoneLabelHi: 'आशीर्वाद (शगुन) ₹51,000 विवाह सहायता 30-दिवसीय विंडो'
  },
  'punjab-mera-kaam-mera-maan': {
    targetDateIso: '2026-11-16',
    fallbackOffsetDays: 15,
    milestoneLabelEn: 'Skill Batch 4 Enrollment & ₹2,500/Mo Allowance Cut-off',
    milestoneLabelPa: 'ਹੁਨਰ ਸਿਖਲਾਈ ਬੈਚ 4 ਅਤੇ ₹2,500/ਮਹੀਨਾ ਭੱਤਾ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਆਖਰੀ ਮਿਤੀ',
    milestoneLabelHi: 'कौशल प्रशिक्षण बैच 4 एवं ₹2,500/माह भत्ता पंजीकरण अंतिम तिथि'
  },
  'nmmss-scholarship': {
    targetDateIso: '2026-11-18',
    fallbackOffsetDays: 17,
    milestoneLabelEn: 'SCERT Punjab NMMSS Class 8 Merit Exam Registration Cut-off',
    milestoneLabelPa: 'SCERT ਪੰਜਾਬ NMMSS ਵਜ਼ੀਫ਼ਾ ਪ੍ਰੀਖਿਆ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਆਖਰੀ ਮਿਤੀ',
    milestoneLabelHi: 'एससीईआरटी पंजाब एनएमएमएसएस छात्रवृत्ति परीक्षा पंजीकरण अंतिम तिथि'
  },
  'pm-kisan': {
    targetDateIso: '2026-11-20',
    fallbackOffsetDays: 19,
    milestoneLabelEn: '19th Installment Biometric e-KYC & Land Seeding Cut-off',
    milestoneLabelPa: '19ਵੀਂ ਕਿਸ਼ਤ ਆਧਾਰ ਈ-ਕੇਵਾਈਸੀ ਅਤੇ ਜ਼ਮੀਨ ਸੀਡਿੰਗ ਆਖਰੀ ਮਿਤੀ',
    milestoneLabelHi: '19वीं किस्त बायोमेट्रिक ई-केवाईसी एवं भूमि सीडिंग अंतिम तिथि'
  },
  'post-matric-obc': {
    targetDateIso: '2026-11-22',
    fallbackOffsetDays: 21,
    milestoneLabelEn: 'OBC/EWS Freeship Card & Institutional Verification Cut-off',
    milestoneLabelPa: 'OBC/EWS ਫ੍ਰੀਸ਼ਿਪ ਕਾਰਡ ਅਤੇ ਕਾਲਜ ਵੈਰੀਫਿਕੇਸ਼ਨ ਆਖਰੀ ਮਿਤੀ',
    milestoneLabelHi: 'ओबीसी/ईडब्ल्यूएस फ्रीशिप कार्ड एवं संस्थान सत्यापन अंतिम तिथि'
  },
  'pm-usp-college-scholarship': {
    targetDateIso: '2026-11-25',
    fallbackOffsetDays: 24,
    milestoneLabelEn: 'National Scholarship Portal (NSP) OTR & Fresh Application Cut-off',
    milestoneLabelPa: 'ਨੈਸ਼ਨਲ ਸਕਾਲਰਸ਼ਿਪ ਪੋਰਟਲ (NSP) OTR ਅਤੇ ਨਵੀਂ ਅਰਜ਼ੀ ਆਖਰੀ ਮਿਤੀ',
    milestoneLabelHi: 'राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) ओटीआर एवं आवेदन अंतिम तिथि'
  },
  'dr-hargobind-khurana-scholarship': {
    targetDateIso: '2026-11-28',
    fallbackOffsetDays: 27,
    milestoneLabelEn: 'e-Punjab ₹30,000/Yr Merit Scholarship Principal Verification Cut-off',
    milestoneLabelPa: 'ਈ-ਪੰਜਾਬ ₹30,000/ਸਾਲ ਮੈਰਿਟ ਵਜ਼ੀਫ਼ਾ ਪ੍ਰਿੰਸੀਪਲ ਤਸਦੀਕ ਆਖਰੀ ਮਿਤੀ',
    milestoneLabelHi: 'ई-पंजाब ₹30,000/वर्ष मेधावी छात्रवृत्ति सत्यापन अंतिम तिथि'
  },
  'pm-fasal-bima-yojana': {
    targetDateIso: '2026-11-29',
    fallbackOffsetDays: 28,
    milestoneLabelEn: 'Rabi Wheat & Mustard Crop Insurance Enrolment Cut-off',
    milestoneLabelPa: 'ਹਾੜ੍ਹੀ ਕਣਕ ਅਤੇ ਸਰ੍ਹੋਂ ਫ਼ਸਲ ਬੀਮਾ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਆਖਰੀ ਮਿਤੀ',
    milestoneLabelHi: 'रबी गेहूं एवं सरसों फसल बीमा नामांकन अंतिम तिथि'
  },
  'post-matric-sc': {
    targetDateIso: '2026-11-30',
    fallbackOffsetDays: 29,
    milestoneLabelEn: 'Dr. Ambedkar Portal Academic Session 2026-27 Final Submission',
    milestoneLabelPa: 'ਡਾ. ਅੰਬੇਡਕਰ ਪੋਰਟਲ ਅਕਾਦਮਿਕ ਸੈਸ਼ਨ 2026-27 ਅੰਤਿਮ ਮਿਤੀ',
    milestoneLabelHi: 'डॉ. अम्बेडकर पोर्टल शैक्षणिक सत्र 2026-27 अंतिम तिथि'
  },
  'inspire-scholarship-he': {
    targetDateIso: '2026-11-24',
    fallbackOffsetDays: 23,
    milestoneLabelEn: 'DST INSPIRE ₹80,000/Yr Science Scholarship Portal Cut-off',
    milestoneLabelPa: 'DST INSPIRE ₹80,000/ਸਾਲ ਸਾਇੰਸ ਸਕਾਲਰਸ਼ਿਪ ਆਖਰੀ ਮਿਤੀ',
    milestoneLabelHi: 'डीएसटी इंस्पायर ₹80,000/वर्ष विज्ञान छात्रवृत्ति अंतिम तिथि'
  },
  'pm-yasasvi-obc-ebc-scholarship': {
    targetDateIso: '2026-11-26',
    fallbackOffsetDays: 25,
    milestoneLabelEn: 'PM-YASASVI NSP Portal Application & Verification Cut-off',
    milestoneLabelPa: 'ਪੀ.ਐਮ-ਯਸ਼ਸਵੀ ਸਕਾਲਰਸ਼ਿਪ ਪੋਰਟਲ ਅਪਲਾਈ ਕਰਨ ਦੀ ਆਖਰੀ ਮਿਤੀ',
    milestoneLabelHi: 'पीएम-यशस्वी छात्रवृत्ति पोर्टल आवेदन अंतिम तिथि'
  },
  'begum-hazrat-mahal-scholarship': {
    targetDateIso: '2026-11-21',
    fallbackOffsetDays: 20,
    milestoneLabelEn: 'Maulana Azad National Girl Student Scholarship Cut-off',
    milestoneLabelPa: 'ਬੇਗਮ ਹਜ਼ਰਤ ਮਹਿਲ ਵਿਦਿਆਰਥਣ ਵਜ਼ੀਫ਼ਾ ਆਖਰੀ ਮਿਤੀ',
    milestoneLabelHi: 'बेगम हजरत महल छात्रा छात्रवृत्ति अंतिम तिथि'
  },
  'punjab-solar-pump-pm-kusum': {
    targetDateIso: '2026-11-19',
    fallbackOffsetDays: 18,
    milestoneLabelEn: 'PEDA Solar Agriculture Pump 60%–80% Subsidy Booking Cut-off',
    milestoneLabelPa: 'PEDA ਸੋਲਰ ਖੇਤੀ ਪੰਪ 60%–80% ਸਬਸਿਡੀ ਬੁਕਿੰਗ ਆਖਰੀ ਮਿਤੀ',
    milestoneLabelHi: 'पेडा सोलर कृषि पंप 60%–80% सब्सिडी बुकिंग अंतिम तिथि'
  },
  'punjab-old-age-pension': {
    targetDateIso: '2026-12-31',
    fallbackOffsetDays: 60,
    milestoneLabelEn: 'Annual Digital Life Certificate (Jeevan Pramaan) Submission',
    milestoneLabelPa: 'ਸਾਲਾਨਾ ਜੀਵਨ ਪ੍ਰਮਾਣ ਪੱਤਰ ਜਮ੍ਹਾਂ ਕਰਵਾਉਣ ਦੀ ਆਖਰੀ ਮਿਤੀ',
    milestoneLabelHi: 'वार्षिक जीवन प्रमाण पत्र (जीवन प्रमाण) जमा करने की अंतिम तिथि'
  }
};

function toUtcMidnightMs(year: number, monthIndex: number, day: number): number {
  return Date.UTC(year, monthIndex, day);
}

function normalizeDateToUtcMidnightMs(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function formatIsoDate(utcMidnightMs: number): string {
  const d = new Date(utcMidnightMs);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatHumanDates(utcMidnightMs: number): {
  formattedDateEn: string;
  formattedDatePa: string;
  formattedDateHi: string;
} {
  const d = new Date(utcMidnightMs);
  const year = d.getUTCFullYear();
  const monthIdx = d.getUTCMonth();
  const day = d.getUTCDate();
  return {
    formattedDateEn: `${day} ${MONTH_NAMES_EN[monthIdx]} ${year}`,
    formattedDatePa: `${day} ${MONTH_NAMES_PA[monthIdx]} ${year}`,
    formattedDateHi: `${day} ${MONTH_NAMES_HI[monthIdx]} ${year}`
  };
}

/**
 * Attempts to parse an explicit date from a raw `applicationDeadline` string.
 * Supports:
 * - ISO `YYYY-MM-DD` (e.g. `2026-11-20`)
 * - `DD Month YYYY` or `DDth Month YYYY` (e.g. `20 November 2026`, `31st December 2026`)
 * - `Month DD, YYYY` (e.g. `November 20, 2026`)
 */
export function parseExplicitDeadlineString(text: string): number | null {
  if (!text) return null;

  // 1. YYYY-MM-DD
  const isoMatch = text.match(/\b(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const monthIndex = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);
    return toUtcMidnightMs(year, monthIndex, day);
  }

  // 2. DD Month YYYY (e.g., "20 November 2026" or "30th Nov 2026")
  const dmyMatch = text.match(
    /\b([0-2]?\d|3[01])(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*[,.\s]+(20\d{2})\b/i
  );
  if (dmyMatch) {
    const day = Number(dmyMatch[1]);
    const monthIndex = MONTH_LOOKUP[dmyMatch[2].toLowerCase()];
    const year = Number(dmyMatch[3]);
    if (monthIndex !== undefined) {
      return toUtcMidnightMs(year, monthIndex, day);
    }
  }

  // 3. Month DD, YYYY (e.g., "November 20, 2026")
  const mdyMatch = text.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+([0-2]?\d|3[01])(?:st|nd|rd|th)?[,.\s]+(20\d{2})\b/i
  );
  if (mdyMatch) {
    const monthIndex = MONTH_LOOKUP[mdyMatch[1].toLowerCase()];
    const day = Number(mdyMatch[2]);
    const year = Number(mdyMatch[3]);
    if (monthIndex !== undefined) {
      return toUtcMidnightMs(year, monthIndex, day);
    }
  }

  return null;
}

export function classifyDeadlineUrgency(daysRemaining: number): DeadlineUrgency {
  if (daysRemaining <= 7) return 'critical';
  if (daysRemaining <= 15) return 'urgent';
  return 'upcoming';
}

/**
 * Resolves the upcoming deadline date and milestone labels for a given scheme relative to `referenceDate`.
 */
export function resolveSchemeDeadline(
  scheme: Scheme,
  referenceDate: Date = new Date()
): {
  deadlineUtcMs: number;
  milestoneLabelEn: string;
  milestoneLabelPa: string;
  milestoneLabelHi: string;
} | null {
  const refUtcMs = normalizeDateToUtcMidnightMs(referenceDate);
  const explicitMs = parseExplicitDeadlineString(scheme.applicationDeadline);
  const milestone = SCHEME_DEADLINE_MILESTONES[scheme.id];

  if (explicitMs !== null) {
    return {
      deadlineUtcMs: explicitMs,
      milestoneLabelEn: milestone?.milestoneLabelEn || scheme.applicationDeadline,
      milestoneLabelPa: milestone?.milestoneLabelPa || scheme.applicationDeadline,
      milestoneLabelHi: milestone?.milestoneLabelHi || scheme.applicationDeadline
    };
  }

  if (milestone) {
    const catalogMs = parseExplicitDeadlineString(milestone.targetDateIso);
    const refYear = referenceDate.getUTCFullYear();
    const refMonth = referenceDate.getUTCMonth();
    // Use the exact catalog date during Oct-Dec 2026; otherwise offset from referenceDate
    const useCatalogIso = catalogMs !== null && refYear === 2026 && refMonth >= 9 && refMonth <= 11;
    const deadlineUtcMs = useCatalogIso
      ? catalogMs
      : refUtcMs + milestone.fallbackOffsetDays * 86_400_000;

    return {
      deadlineUtcMs,
      milestoneLabelEn: milestone.milestoneLabelEn,
      milestoneLabelPa: milestone.milestoneLabelPa,
      milestoneLabelHi: milestone.milestoneLabelHi
    };
  }

  return null;
}

/**
 * Returns all saved schemes that have an upcoming application deadline within the next `windowDays` (default 30 days)
 * from `referenceDate` (`0 <= daysRemaining <= windowDays`), sorted ascending by `daysRemaining` (most urgent first).
 */
export function getUpcomingSavedSchemeDeadlines(
  schemes: Scheme[],
  savedSchemeIds: Set<string> | string[],
  referenceDate: Date = new Date(),
  windowDays = 30
): UpcomingSchemeDeadline[] {
  const savedSet = savedSchemeIds instanceof Set ? savedSchemeIds : new Set(savedSchemeIds);
  if (savedSet.size === 0) return [];

  const refUtcMs = normalizeDateToUtcMidnightMs(referenceDate);
  const results: UpcomingSchemeDeadline[] = [];

  for (const scheme of schemes) {
    if (!savedSet.has(scheme.id)) continue;

    const resolved = resolveSchemeDeadline(scheme, referenceDate);
    if (!resolved) continue;

    const diffDays = Math.round((resolved.deadlineUtcMs - refUtcMs) / 86_400_000);
    if (diffDays < 0 || diffDays > windowDays) continue;

    const { formattedDateEn, formattedDatePa, formattedDateHi } = formatHumanDates(resolved.deadlineUtcMs);

    results.push({
      scheme,
      deadlineDateIso: formatIsoDate(resolved.deadlineUtcMs),
      formattedDateEn,
      formattedDatePa,
      formattedDateHi,
      daysRemaining: diffDays,
      urgency: classifyDeadlineUrgency(diffDays),
      milestoneLabelEn: resolved.milestoneLabelEn,
      milestoneLabelPa: resolved.milestoneLabelPa,
      milestoneLabelHi: resolved.milestoneLabelHi
    });
  }

  return results.sort((a, b) => {
    if (a.daysRemaining !== b.daysRemaining) {
      return a.daysRemaining - b.daysRemaining;
    }
    return a.scheme.titleEn.localeCompare(b.scheme.titleEn);
  });
}

/**
 * Returns unsaved schemes that have upcoming deadlines within `windowDays` so users can quickly bookmark them.
 */
export function getUnsavedUpcomingSchemeDeadlines(
  schemes: Scheme[],
  savedSchemeIds: Set<string> | string[],
  referenceDate: Date = new Date(),
  windowDays = 30
): UpcomingSchemeDeadline[] {
  const savedSet = savedSchemeIds instanceof Set ? savedSchemeIds : new Set(savedSchemeIds);
  const unsavedIds = schemes.filter(s => !savedSet.has(s.id)).map(s => s.id);
  return getUpcomingSavedSchemeDeadlines(schemes, unsavedIds, referenceDate, windowDays);
}
