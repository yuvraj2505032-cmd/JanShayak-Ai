import { EligibilityEvaluation, Language, Scheme } from '../types/scheme';

export const MAX_COMPARISON_SCHEMES = 4;

export interface ToggleComparisonResult {
  nextIds: string[];
  added: boolean;
  limitReached: boolean;
}

export function toggleSchemeInComparison(
  currentIds: string[],
  schemeId: string,
  maxSchemes: number = MAX_COMPARISON_SCHEMES
): ToggleComparisonResult {
  const normalizedId = schemeId.trim();
  if (!normalizedId) {
    return { nextIds: currentIds, added: false, limitReached: false };
  }

  if (currentIds.includes(normalizedId)) {
    return {
      nextIds: currentIds.filter((id) => id !== normalizedId),
      added: false,
      limitReached: false,
    };
  }

  if (currentIds.length >= maxSchemes) {
    return {
      nextIds: currentIds,
      added: false,
      limitReached: true,
    };
  }

  return {
    nextIds: [...currentIds, normalizedId],
    added: true,
    limitReached: false,
  };
}

export interface SchemeComparisonColumn {
  scheme: Scheme;
  schemeId: string;
  title: string;
  department: string;
  level: string;
  benefitAmountText: string;
  benefitType: string;
  matchPercentage: number;
  isEligible: boolean;
  isPotentialMatch: boolean;
  statusLabel: string;
  ageRequirementText: string;
  incomeRequirementText: string;
  categoryRequirementText: string;
  genderRequirementText: string;
  occupationRequirementText: string;
  specialConditionsList: string[];
  matchedReasons: string[];
  failedReasons: string[];
  requiredDocumentsCount: number;
  requiredDocumentsNames: string[];
  applicationDeadline: string;
  officialPortalUrl: string;
}

export function formatAgeRequirement(scheme: Scheme, lang: Language = 'en'): string {
  const hasMin = typeof scheme.minAge === 'number' && scheme.minAge > 0;
  const hasMax = typeof scheme.maxAge === 'number' && scheme.maxAge < 120;

  if (hasMin && hasMax) {
    return lang === 'pa'
      ? `${scheme.minAge} ਤੋਂ ${scheme.maxAge} ਸਾਲ`
      : lang === 'hi'
        ? `${scheme.minAge} से ${scheme.maxAge} वर्ष`
        : `${scheme.minAge} – ${scheme.maxAge} Years`;
  }
  if (hasMin) {
    return lang === 'pa'
      ? `${scheme.minAge}+ ਸਾਲ`
      : lang === 'hi'
        ? `${scheme.minAge}+ वर्ष`
        : `${scheme.minAge}+ Years`;
  }
  if (hasMax) {
    return lang === 'pa'
      ? `${scheme.maxAge} ਸਾਲ ਤੱਕ`
      : lang === 'hi'
        ? `${scheme.maxAge} वर्ष तक`
        : `Up to ${scheme.maxAge} Years`;
  }
  return lang === 'pa'
    ? 'ਕੋਈ ਉਮਰ ਸੀਮਾ ਨਹੀਂ (ਸਾਰੇ ਉਮਰ ਵਰਗ)'
    : lang === 'hi'
      ? 'कोई आयु सीमा नहीं (सभी आयु वर्ग)'
      : 'All Ages (No Age Limit)';
}

export function formatIncomeRequirement(scheme: Scheme, lang: Language = 'en'): string {
  if (typeof scheme.maxIncome === 'number' && scheme.maxIncome > 0) {
    const formatted = scheme.maxIncome.toLocaleString('en-IN');
    return lang === 'pa'
      ? `₹${formatted} / ਸਾਲ ਤੱਕ`
      : lang === 'hi'
        ? `₹${formatted} / वर्ष तक`
        : `Up to ₹${formatted} / year`;
  }
  return lang === 'pa'
    ? 'ਕੋਈ ਆਮਦਨ ਸੀਮਾ ਨਹੀਂ'
    : lang === 'hi'
      ? 'कोई आय सीमा नहीं'
      : 'No Income Cap';
}

export function formatCategoryRequirement(scheme: Scheme, lang: Language = 'en'): string {
  if (!scheme.eligibleCategories || scheme.eligibleCategories.length === 0 || scheme.eligibleCategories.length >= 4) {
    return lang === 'pa' ? 'ਸਾਰੀਆਂ ਸ਼੍ਰੇਣੀਆਂ (General, SC, OBC, EWS)' : lang === 'hi' ? 'सभी श्रेणियां (General, SC, OBC, EWS)' : 'All Categories (General, SC, OBC, EWS)';
  }
  return scheme.eligibleCategories.join(', ');
}

export function formatGenderRequirement(scheme: Scheme, lang: Language = 'en'): string {
  if (!scheme.targetGenders || scheme.targetGenders.length === 0 || scheme.targetGenders.includes('All')) {
    return lang === 'pa' ? 'ਸਾਰੇ ਲਿੰਗ (ਮਰਦ / ਔਰਤਾਂ / ਹੋਰ)' : lang === 'hi' ? 'सभी लिंग (पुरुष / महिला / अन्य)' : 'All Genders';
  }
  if (scheme.targetGenders.includes('Female') && !scheme.targetGenders.includes('Male')) {
    return lang === 'pa' ? 'ਸਿਰਫ਼ ਔਰਤਾਂ ਅਤੇ ਕੁੜੀਆਂ (Female Only)' : lang === 'hi' ? 'केवल महिलाएं और बालिकाएं (Female Only)' : 'Women & Girls Only (Female)';
  }
  return scheme.targetGenders.join(', ');
}

export function formatOccupationRequirement(scheme: Scheme, lang: Language = 'en'): string {
  if (!scheme.eligibleOccupations || scheme.eligibleOccupations.length === 0) {
    return lang === 'pa' ? 'ਸਾਰੇ ਕਿੱਤੇ ਯੋਗ ਹਨ' : lang === 'hi' ? 'सभी व्यवसाय पात्र हैं' : 'All Occupations Eligible';
  }
  return scheme.eligibleOccupations.join(', ');
}

export function extractSpecialConditions(scheme: Scheme, lang: Language = 'en'): string[] {
  const conditions: string[] = [];

  if (scheme.requiresPunjabDomicile) {
    conditions.push(
      lang === 'pa'
        ? `${scheme.state || 'ਪੰਜਾਬ'} ਦਾ ਪੱਕਾ ਨਿਵਾਸੀ (Domicile)`
        : lang === 'hi'
          ? `${scheme.state || 'पंजाब'} का स्थायी निवासी (Domicile)`
          : `${scheme.state || 'Punjab'} Domicile Required`
    );
  }
  if (scheme.requiresStudentStatus) {
    conditions.push(
      lang === 'pa'
        ? 'ਸਕੂਲ/ਕਾਲਜ ਵਿੱਚ ਦਾਖਲ ਵਿਦਿਆਰਥੀ'
        : lang === 'hi'
          ? 'स्कूल/कॉलेज में नामांकित छात्र'
          : 'Enrolled Student Status Required'
    );
  }
  if (typeof scheme.maxLandholdingAcres === 'number') {
    conditions.push(
      lang === 'pa'
        ? `ਜ਼ਮੀਨ ≤ ${scheme.maxLandholdingAcres} ਏਕੜ`
        : lang === 'hi'
          ? `भूमि ≤ ${scheme.maxLandholdingAcres} एकड़`
          : `Landholding ≤ ${scheme.maxLandholdingAcres} Acres`
    );
  }
  if (scheme.requiresDisability) {
    conditions.push(
      lang === 'pa'
        ? 'ਦਿਵਿਆਂਗਤਾ ਸਰਟੀਫਿਕੇਟ (UDID) ਜ਼ਰੂਰੀ'
        : lang === 'hi'
          ? 'दिव्यांगता प्रमाणपत्र (UDID) आवश्यक'
          : 'Disability Certificate (UDID) Required'
    );
  }
  if (scheme.requiresWidow) {
    conditions.push(
      lang === 'pa'
        ? 'ਵਿਧਵਾ / ਬੇਸਹਾਰਾ ਔਰਤ ਸ਼੍ਰੇਣੀ'
        : lang === 'hi'
          ? 'विधवा / निराश्रित महिला श्रेणी'
          : 'Widow / Destitute Status Required'
    );
  }

  if (conditions.length === 0) {
    conditions.push(
      lang === 'pa'
        ? 'ਕੋਈ ਵਾਧੂ ਵਿਸ਼ੇਸ਼ ਸ਼ਰਤ ਨਹੀਂ'
        : lang === 'hi'
          ? 'कोई अतिरिक्त विशेष शर्त नहीं'
          : 'Standard Citizen Verification'
    );
  }

  return conditions;
}

export function buildSchemeComparisonMatrix(
  schemes: Scheme[],
  evaluationMap?: Map<string, EligibilityEvaluation>,
  lang: Language = 'en'
): SchemeComparisonColumn[] {
  return schemes.map((scheme) => {
    const evaluation = evaluationMap?.get(scheme.id);
    const isEligible = Boolean(evaluation?.isEligible);
    const isPotentialMatch = Boolean(evaluation?.isPotentialMatch);
    const matchPercentage = evaluation?.matchPercentage ?? 75;

    const statusLabel = isEligible
      ? lang === 'pa'
        ? 'ਪੂਰੀ ਤਰ੍ਹਾਂ ਯੋਗ (Eligible)'
        : lang === 'hi'
          ? 'पूर्णतः पात्र (Eligible)'
          : 'Eligible Match'
      : isPotentialMatch
        ? lang === 'pa'
          ? 'ਸੰਭਾਵੀ ਯੋਗ (Potential)'
          : lang === 'hi'
            ? 'संभावित पात्र (Potential)'
            : 'Potential Match'
        : lang === 'pa'
          ? 'ਸ਼ਰਤਾਂ ਚੈੱਕ ਕਰੋ'
          : lang === 'hi'
            ? 'पात्रता जांचें'
            : 'Check Criteria';

    const title = lang === 'pa' ? scheme.titlePa : lang === 'hi' ? scheme.titleHi : scheme.titleEn;
    const department = lang === 'pa' ? scheme.departmentPa : lang === 'hi' ? scheme.departmentHi : scheme.departmentEn;
    const requiredDocumentsNames = (scheme.requiredDocuments || []).map((doc) =>
      lang === 'pa' ? doc.namePa : lang === 'hi' ? doc.nameHi : doc.nameEn
    );

    return {
      scheme,
      schemeId: scheme.id,
      title,
      department,
      level: scheme.level,
      benefitAmountText: scheme.benefitAmountText,
      benefitType: scheme.benefitType,
      matchPercentage,
      isEligible,
      isPotentialMatch,
      statusLabel,
      ageRequirementText: formatAgeRequirement(scheme, lang),
      incomeRequirementText: formatIncomeRequirement(scheme, lang),
      categoryRequirementText: formatCategoryRequirement(scheme, lang),
      genderRequirementText: formatGenderRequirement(scheme, lang),
      occupationRequirementText: formatOccupationRequirement(scheme, lang),
      specialConditionsList: extractSpecialConditions(scheme, lang),
      matchedReasons: evaluation?.matchedReasons ?? [],
      failedReasons: evaluation?.failedReasons ?? [],
      requiredDocumentsCount: requiredDocumentsNames.length,
      requiredDocumentsNames,
      applicationDeadline: scheme.applicationDeadline,
      officialPortalUrl: scheme.officialPortalUrl,
    };
  });
}
