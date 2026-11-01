import { EligibilityEvaluation, Language, Occupation, Scheme } from '../types/scheme';
import { getSchemeEra } from '../data/officialPortals';

export type TargetGroupFilter = 'all' | 'women' | 'students' | 'farmers' | 'business';
export type AgeBracketFilter = 'all' | 'under18' | '18to25' | '26to45' | '46to59' | '60plus';
export type EducationLevelFilter = 'all' | 'enrolled' | 'skill' | 'general';
export type LevelFilter = 'all' | 'Punjab State' | 'Central Government';
export type SchemeEraFilter = 'all' | 'new' | 'purani' | 'ai-added';

export interface AdvancedSearchFilters {
  query: string;
  category: string;
  level: LevelFilter;
  ageBracket: AgeBracketFilter;
  maxIncome: number | null; // null means any income
  educationLevel: EducationLevelFilter;
  occupation: Occupation | 'All';
  targetGroup: TargetGroupFilter;
  schemeEra?: SchemeEraFilter;
}

export const DEFAULT_ADVANCED_FILTERS: AdvancedSearchFilters = {
  query: '',
  category: 'all',
  level: 'all',
  ageBracket: 'all',
  maxIncome: null,
  educationLevel: 'all',
  occupation: 'All',
  targetGroup: 'all',
  schemeEra: 'all',
};

export function isAiAutoAddedScheme(scheme: Scheme): boolean {
  return (
    scheme.id.startsWith('ai-') ||
    (scheme.categoryTags || []).some(
      (t) =>
        t.toLowerCase().includes('ai admin') ||
        t.toLowerCase().includes('new scheme 2026') ||
        t.toLowerCase().includes('classic scheme (purani)')
    )
  );
}

export interface OfficialGovAnnouncement {
  id: string;
  badgeEn: string;
  badgePa: string;
  badgeHi: string;
  titleEn: string;
  titlePa: string;
  titleHi: string;
  departmentEn: string;
  officialUrl: string;
  schemeId?: string;
  isUrgent?: boolean;
}

export const OFFICIAL_GOV_ANNOUNCEMENTS: OfficialGovAnnouncement[] = [
  {
    id: 'ann-dr-ambedkar-portal',
    badgeEn: 'Verified Portal Open',
    badgePa: 'ਪ੍ਰਮਾਣਿਤ ਪੋਰਟਲ ਖੁੱਲ੍ਹਾ',
    badgeHi: 'सत्यापित पोर्टल खुला',
    titleEn: 'Dr. Ambedkar Scholarship Portal (scholarships.punjab.gov.in) active for 2025-26 academic session.',
    titlePa: 'ਡਾ. ਅੰਬੇਡਕਰ ਵਜ਼ੀਫਾ ਪੋਰਟਲ (scholarships.punjab.gov.in) 2025-26 ਸੈਸ਼ਨ ਲਈ ਖੁੱਲ੍ਹਾ ਹੈ।',
    titleHi: 'डॉ. अंबेडकर छात्रवृत्ति पोर्टल (scholarships.punjab.gov.in) 2025-26 सत्र के लिए सक्रिय है।',
    departmentEn: 'Dept. of Social Justice & Minorities, Govt of Punjab',
    officialUrl: 'https://scholarships.punjab.gov.in/',
    schemeId: 'post-matric-sc',
    isUrgent: true,
  },
  {
    id: 'ann-pm-kisan-ekyc',
    badgeEn: 'Mandatory e-KYC',
    badgePa: 'ਜ਼ਰੂਰੀ ਈ-ਕੇਵਾਈਸੀ',
    badgeHi: 'अनिवार्य ई-केवाईसी',
    titleEn: 'PM-KISAN 19th Installment: Complete Aadhaar OTP or Biometric e-KYC on pmkisan.gov.in.',
    titlePa: 'PM-KISAN ਕਿਸ਼ਤ ਲਈ pmkisan.gov.in ਉੱਤੇ ਆਧਾਰ e-KYC ਪੂਰੀ ਕਰੋ।',
    titleHi: 'PM-KISAN किस्त के लिए pmkisan.gov.in पर आधार e-KYC पूरी करें।',
    departmentEn: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
    officialUrl: 'https://pmkisan.gov.in/',
    schemeId: 'pm-kisan',
    isUrgent: true,
  },
  {
    id: 'ann-esewa-punjab',
    badgeEn: 'Digital Sewa Kendra',
    badgePa: 'ਡਿਜੀਟਲ ਸੇਵਾ ਕੇਂਦਰ',
    badgeHi: 'डिजिटल सेवा केंद्र',
    titleEn: 'Track Ashirwad Scheme, Old Age Pension & Income Certificates online at esewa.punjab.gov.in.',
    titlePa: 'ਅਸ਼ੀਰਵਾਦ ਸਕੀਮ, ਬੁਢਾਪਾ ਪੈਨਸ਼ਨ ਅਤੇ ਆਮਦਨ ਸਰਟੀਫਿਕੇਟ esewa.punjab.gov.in ਉੱਤੇ ਟ੍ਰੈਕ ਕਰੋ।',
    titleHi: 'आशीर्वाद योजना, वृद्धावस्था पेंशन और आय प्रमाणपत्र esewa.punjab.gov.in पर ट्रैक करें।',
    departmentEn: 'Dept. of Governance Reforms, Govt of Punjab',
    officialUrl: 'https://esewa.punjab.gov.in/',
    schemeId: 'punjab-ashirwad',
    isUrgent: false,
  },
];

const NATURAL_LANGUAGE_SYNONYMS: Record<string, string[]> = {
  women: ['woman', 'female', 'girl', 'daughter', 'mother', 'widow', 'maternity', 'ashirwad', 'mahila', 'bus', 'pregnant', 'kanya', 'shagun', 'lakhpati', 'didi', 'stree'],
  students: ['student', 'scholarship', 'college', 'school', 'education', 'degree', 'matric', 'fellowship', 'ugc', 'aicte', 'coaching', 'hostel', 'laptop', 'vidyarthi', 'study'],
  farmers: ['farmer', 'agriculture', 'kisan', 'crop', 'tractor', 'tubewell', 'irrigation', 'seed', 'mandi', 'fasal', 'bima', 'soil', 'dairy', 'poultry', 'fisheries', 'krishi'],
  business: ['business', 'loan', 'mudra', 'vishwakarma', 'startup', 'msme', 'entrepreneur', 'shop', 'vendor', 'svanidhi', 'artisan', 'self-employed', 'udyam', 'credit', 'rozgar'],
  health: ['health', 'hospital', 'medical', 'treatment', 'insurance', 'sarbat', 'sehat', 'ayushman', 'surgery', 'medicine', 'doctor', 'tb', 'pregnancy'],
  pension: ['pension', 'senior', 'old age', 'elderly', 'disability', 'widow', 'budhapa', 'atal'],
};

export function isSchemeForWomen(scheme: Scheme): boolean {
  if (
    scheme.targetGenders &&
    scheme.targetGenders.includes('Female') &&
    !scheme.targetGenders.includes('Male') &&
    !scheme.targetGenders.includes('All')
  ) {
    return true;
  }
  if (scheme.requiresWidow) return true;
  const text = `${scheme.id} ${scheme.titleEn} ${scheme.descriptionEn} ${(scheme.categoryTags || []).join(' ')}`.toLowerCase();
  return (
    text.includes('women') ||
    text.includes('woman') ||
    text.includes('girl') ||
    text.includes('maternity') ||
    text.includes('widow') ||
    text.includes('ashirwad') ||
    text.includes('matru') ||
    text.includes('sukanya') ||
    text.includes('mahila') ||
    text.includes('free bus travel')
  );
}

export function isSchemeForStudents(scheme: Scheme): boolean {
  if (scheme.requiresStudentStatus || scheme.benefitType === 'Scholarship') return true;
  if (scheme.eligibleOccupations?.includes('Student')) return true;
  const text = `${scheme.id} ${scheme.titleEn} ${scheme.descriptionEn} ${(scheme.categoryTags || []).join(' ')}`.toLowerCase();
  return (
    text.includes('student') ||
    text.includes('scholarship') ||
    text.includes('matric') ||
    text.includes('fellowship') ||
    text.includes('coaching') ||
    text.includes('education') ||
    text.includes('college') ||
    text.includes('school')
  );
}

export function isSchemeForFarmers(scheme: Scheme): boolean {
  if (scheme.eligibleOccupations?.includes('Farmer') || scheme.eligibleOccupations?.includes('Agricultural Labourer')) {
    return true;
  }
  const text = `${scheme.id} ${scheme.titleEn} ${scheme.descriptionEn} ${(scheme.categoryTags || []).join(' ')}`.toLowerCase();
  return (
    text.includes('farmer') ||
    text.includes('kisan') ||
    text.includes('crop') ||
    text.includes('agriculture') ||
    text.includes('irrigation') ||
    text.includes('fasal') ||
    text.includes('tractor') ||
    text.includes('dairy') ||
    text.includes('livestock')
  );
}

export function isSchemeForBusiness(scheme: Scheme): boolean {
  if (
    scheme.benefitType === 'Loan/Credit' ||
    scheme.eligibleOccupations?.includes('Self-Employed') ||
    scheme.eligibleOccupations?.includes('Self-Employed/Shopkeeper') ||
    scheme.eligibleOccupations?.includes('Artisan/Craftsperson')
  ) {
    return true;
  }
  const text = `${scheme.id} ${scheme.titleEn} ${scheme.descriptionEn} ${(scheme.categoryTags || []).join(' ')}`.toLowerCase();
  return (
    text.includes('mudra') ||
    text.includes('vishwakarma') ||
    text.includes('business') ||
    text.includes('entrepreneur') ||
    text.includes('vendor') ||
    text.includes('svanidhi') ||
    text.includes('startup') ||
    text.includes('artisan') ||
    text.includes('self-employed') ||
    text.includes('loan') ||
    text.includes('karobar')
  );
}

export function matchesAgeBracket(scheme: Scheme, ageBracket: AgeBracketFilter): boolean {
  if (ageBracket === 'all') return true;
  const min = scheme.minAge ?? 0;
  const max = scheme.maxAge ?? 120;

  switch (ageBracket) {
    case 'under18':
      return min <= 17;
    case '18to25':
      return min <= 25 && max >= 18;
    case '26to45':
      return min <= 45 && max >= 26;
    case '46to59':
      return min <= 59 && max >= 46;
    case '60plus':
      return max >= 60 || min >= 58;
    default:
      return true;
  }
}

export function matchesEducationLevel(scheme: Scheme, educationLevel: EducationLevelFilter): boolean {
  if (educationLevel === 'all') return true;
  const text = `${scheme.id} ${scheme.titleEn} ${scheme.descriptionEn} ${(scheme.categoryTags || []).join(' ')}`.toLowerCase();
  if (educationLevel === 'enrolled') {
    return isSchemeForStudents(scheme);
  }
  if (educationLevel === 'skill') {
    return (
      text.includes('skill') ||
      text.includes('vishwakarma') ||
      text.includes('training') ||
      text.includes('coaching') ||
      text.includes('kamai') ||
      text.includes('apprentice') ||
      text.includes('rozgar') ||
      text.includes('artisan')
    );
  }
  if (educationLevel === 'general') {
    return !scheme.requiresStudentStatus;
  }
  return true;
}

export function matchesCategoryFilter(scheme: Scheme, category: string, savedSchemeIds: string[]): boolean {
  if (!category || category === 'all') return true;
  if (category === 'Saved' || category === 'saved') {
    return savedSchemeIds.includes(scheme.id);
  }
  if (category === 'Students') return isSchemeForStudents(scheme);
  if (category === 'Women') return isSchemeForWomen(scheme);
  if (category === 'Farmers') return isSchemeForFarmers(scheme);
  if (category === 'Business Owners') return isSchemeForBusiness(scheme);

  const categoryText = [
    ...(scheme.categoryTags || []),
    scheme.titleEn,
    scheme.descriptionEn,
    scheme.benefitAmountText,
    scheme.benefitType,
    scheme.departmentEn,
    ...(scheme.eligibleOccupations ?? []),
  ]
    .join(' ')
    .toLowerCase();

  if (category === 'Agriculture') {
    return /farm|agri|crop|kisan|dairy|livestock|seed|irrigat/.test(categoryText);
  }
  if (category === 'Health') {
    return /health|medical|hospital|treatment|medicine|care|insurance/.test(categoryText);
  }
  if (category === 'Education') {
    return /education|student|scholarship|school|college|learning|tuition|girl child/.test(categoryText);
  }
  if (category === 'Finance') {
    const financeText = [(scheme.categoryTags || []).join(' '), scheme.benefitType, scheme.benefitAmountText]
      .join(' ')
      .toLowerCase();
    return (
      scheme.benefitType !== 'Health Cover' &&
      /finance|loan|credit|pension|subsidy|financial|saving|direct cash transfer|cash transfer|allowance|wage/.test(
        financeText
      )
    );
  }

  return (scheme.categoryTags || []).some((tag) => tag.toLowerCase().includes(category.toLowerCase()));
}

export function matchesNaturalLanguageQuery(scheme: Scheme, rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;

  const searchableText = [
    scheme.id,
    scheme.titleEn,
    scheme.titlePa,
    scheme.titleHi,
    scheme.descriptionEn,
    scheme.descriptionPa,
    scheme.descriptionHi,
    scheme.departmentEn,
    scheme.departmentPa,
    scheme.departmentHi,
    scheme.benefitAmountText,
    scheme.benefitType,
    scheme.level,
    ...(scheme.categoryTags || []),
    ...(scheme.requiredDocuments || []).map((d) => `${d.nameEn} ${d.namePa} ${d.nameHi}`),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // Direct substring match
  if (searchableText.includes(q)) return true;

  // Tokenized natural language match (ignore common stop words)
  const stopWords = new Set([
    'what', 'which', 'how', 'can', 'for', 'the', 'and', 'in', 'to', 'of', 'is', 'are', 'with',
    'scheme', 'schemes', 'yojana', 'punjab', 'government', 'govt', 'apply', 'get', 'me', 'my', 'i', 'am', 'a', 'an',
  ]);

  const tokens = q
    .replace(/[?.,!]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 2 && !stopWords.has(token));

  if (tokens.length === 0) return true;

  // Expand tokens with domain synonyms
  return tokens.some((token) => {
    if (searchableText.includes(token)) return true;
    for (const [concept, synonyms] of Object.entries(NATURAL_LANGUAGE_SYNONYMS)) {
      if (token === concept || synonyms.includes(token)) {
        if (concept === 'women' && isSchemeForWomen(scheme)) return true;
        if (concept === 'students' && isSchemeForStudents(scheme)) return true;
        if (concept === 'farmers' && isSchemeForFarmers(scheme)) return true;
        if (concept === 'business' && isSchemeForBusiness(scheme)) return true;
        if (synonyms.some((syn) => searchableText.includes(syn))) return true;
      }
    }
    return false;
  });
}

export function filterSchemesAdvanced(
  evaluations: EligibilityEvaluation[],
  filters: AdvancedSearchFilters,
  savedSchemeIds: string[] = []
): EligibilityEvaluation[] {
  return evaluations
    .filter((evaluation) => {
      const { scheme } = evaluation;

      // 1. Category or special tab filter
      if (!matchesCategoryFilter(scheme, filters.category, savedSchemeIds)) return false;

      // 2. Target group pill filter
      if (filters.targetGroup === 'women' && !isSchemeForWomen(scheme)) return false;
      if (filters.targetGroup === 'students' && !isSchemeForStudents(scheme)) return false;
      if (filters.targetGroup === 'farmers' && !isSchemeForFarmers(scheme)) return false;
      if (filters.targetGroup === 'business' && !isSchemeForBusiness(scheme)) return false;

      // 3. Level (State vs Central) filter
      if (filters.level !== 'all' && scheme.level !== filters.level) return false;

      // 4. Occupation filter
      if (filters.occupation !== 'All') {
        if (filters.occupation === 'Student') {
          if (!isSchemeForStudents(scheme)) return false;
        } else if (filters.occupation === 'Farmer') {
          if (!isSchemeForFarmers(scheme)) return false;
        } else if (filters.occupation === 'Self-Employed') {
          if (
            !isSchemeForBusiness(scheme) &&
            scheme.eligibleOccupations &&
            !scheme.eligibleOccupations.includes('Self-Employed')
          ) {
            return false;
          }
        } else if (scheme.eligibleOccupations && scheme.eligibleOccupations.length > 0) {
          if (!scheme.eligibleOccupations.includes(filters.occupation)) return false;
        }
      }

      // 5. Age bracket filter
      if (!matchesAgeBracket(scheme, filters.ageBracket)) return false;

      // 6. Income filter (citizen annual income; include schemes with no income cap or maxIncome >= filters.maxIncome)
      if (filters.maxIncome !== null && filters.maxIncome > 0) {
        if (typeof scheme.maxIncome === 'number' && scheme.maxIncome < filters.maxIncome) {
          return false;
        }
      }

      // 7. Education level filter
      if (!matchesEducationLevel(scheme, filters.educationLevel)) return false;

      // 8. Scheme Era filter (New 2025-26 vs Purani/Classic vs AI Auto-Added)
      const eraFilter = filters.schemeEra ?? 'all';
      if (eraFilter === 'new' && getSchemeEra(scheme) !== 'new') return false;
      if (eraFilter === 'purani' && getSchemeEra(scheme) !== 'purani') return false;
      if (eraFilter === 'ai-added' && !isAiAutoAddedScheme(scheme)) return false;

      // 9. Natural language & keyword query
      if (!matchesNaturalLanguageQuery(scheme, filters.query)) return false;

      return true;
    })
    .sort((a, b) => {
      const aScore = a.isEligible ? 2 : a.isPotentialMatch ? 1 : 0;
      const bScore = b.isEligible ? 2 : b.isPotentialMatch ? 1 : 0;
      if (bScore !== aScore) return bScore - aScore;
      return b.matchPercentage - a.matchPercentage;
    });
}

export function countActiveAdvancedFilters(filters: AdvancedSearchFilters): number {
  let count = 0;
  if (filters.query.trim()) count++;
  if (filters.category !== 'all') count++;
  if (filters.level !== 'all') count++;
  if (filters.ageBracket !== 'all') count++;
  if (filters.maxIncome !== null) count++;
  if (filters.educationLevel !== 'all') count++;
  if (filters.occupation !== 'All') count++;
  if (filters.targetGroup !== 'all') count++;
  if (filters.schemeEra && filters.schemeEra !== 'all') count++;
  return count;
}

export function getSmartSearchSuggestions(query: string, lang: Language = 'en'): string[] {
  const defaultSuggestions: Record<Language, string[]> = {
    en: [
      'Post-Matric Scholarship for SC/OBC Students',
      'Schemes for Women & Girl Child in Punjab',
      'PM-KISAN & Farmer Crop Subsidies',
      'Business & Mudra Loans for Self-Employed',
      '₹5 Lakh Sarbat Sehat Health Card',
      'Old Age & Widow Pension Rules',
    ],
    pa: [
      'SC/OBC ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਪੋਸਟ-ਮੈਟ੍ਰਿਕ ਵਜ਼ੀਫਾ',
      'ਔਰਤਾਂ ਅਤੇ ਧੀਆਂ ਲਈ ਪੰਜਾਬ ਸਰਕਾਰ ਦੀਆਂ ਸਕੀਮਾਂ',
      'ਕਿਸਾਨਾਂ ਲਈ PM-KISAN ਅਤੇ ਖੇਤੀ ਸਬਸਿਡੀ',
      'ਕਾਰੋਬਾਰ ਲਈ ਮੁਦਰਾ ਅਤੇ ਵਿਸ਼ਵਕਰਮਾ ਲੋਨ',
      '5 ਲੱਖ ਸਰਬਤ ਸਿਹਤ ਬੀਮਾ ਕਾਰਡ',
      'ਬੁਢਾਪਾ ਅਤੇ ਵਿਧਵਾ ਪੈਨਸ਼ਨ ਨਿਯਮ',
    ],
    hi: [
      'SC/OBC छात्रों के लिए पोस्ट-मैट्रिक छात्रवृत्ति',
      'पंजाब में महिलाओं और बेटियों के लिए योजनाएं',
      'किसानों के लिए PM-KISAN और कृषि सब्सिडी',
      'व्यवसाय और स्वरोजगार के लिए मुद्रा लोन',
      '₹5 लाख सरबत सेहत बीमा कार्ड',
      'वृद्धावस्था और विधवा पेंशन नियम',
    ],
  };

  const baseList = defaultSuggestions[lang] || defaultSuggestions.en;
  const q = query.trim().toLowerCase();
  if (!q) return baseList;

  const dynamicMatches = baseList.filter((item) => item.toLowerCase().includes(q));
  if (dynamicMatches.length > 0) return dynamicMatches;

  return baseList.slice(0, 4);
}

export function recordRecentlyViewedScheme(
  currentIds: string[],
  schemeId: string,
  maxItems = 6
): string[] {
  if (!schemeId || !schemeId.trim()) return currentIds;
  const normalized = schemeId.trim();
  const deduplicated = [normalized, ...currentIds.filter((id) => id !== normalized)];
  return deduplicated.slice(0, Math.max(1, maxItems));
}

export function getTopRecommendedSchemes(
  evaluations: EligibilityEvaluation[],
  limit = 3
): EligibilityEvaluation[] {
  return [...evaluations]
    .sort((a, b) => {
      if (a.isEligible && !b.isEligible) return -1;
      if (!a.isEligible && b.isEligible) return 1;
      return b.matchPercentage - a.matchPercentage;
    })
    .slice(0, Math.max(1, limit));
}
