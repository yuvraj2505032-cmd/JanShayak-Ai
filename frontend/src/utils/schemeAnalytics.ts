import type { Scheme, EligibilityEvaluation } from '../types/scheme';

export interface CategoryAnalyticsRow {
  key: string;
  labelEn: string;
  labelPa: string;
  labelHi: string;
  color: string;
  description: string;
  totalCount: number;
  eligibleCount: number;
  potentialCount: number;
  ineligibleCount: number;
  shareOfTotalPercent: number;
  shareOfEligiblePercent: number;
  schemes: Scheme[];
  eligibleSchemes: Scheme[];
  potentialSchemes: Scheme[];
}

export interface EligibilityStatusSlice {
  id: 'eligible' | 'potential' | 'ineligible';
  labelEn: string;
  labelPa: string;
  labelHi: string;
  count: number;
  percentage: number;
  color: string;
}

export interface LevelAnalyticsRow {
  levelKey: string;
  labelEn: string;
  labelPa: string;
  labelHi: string;
  totalCount: number;
  eligibleCount: number;
  potentialCount: number;
  ineligibleCount: number;
  fill: string;
}

export interface SchemeAnalyticsSummary {
  totalSchemes: number;
  eligibleCount: number;
  potentialCount: number;
  ineligibleCount: number;
  eligibilityRatePercent: number;
  actionableRatePercent: number;
  dominantCategory: CategoryAnalyticsRow | null;
  topEligibleCategory: CategoryAnalyticsRow | null;
  eligibilityStatusDistribution: EligibilityStatusSlice[];
  categoryDistribution: CategoryAnalyticsRow[];
  levelDistribution: LevelAnalyticsRow[];
}

const CATEGORY_METADATA: Array<{
  key: string;
  labelEn: string;
  labelPa: string;
  labelHi: string;
  color: string;
  description: string;
}> = [
  {
    key: 'Education',
    labelEn: 'Education & Scholarships',
    labelPa: 'ਸਿੱਖਿਆ ਅਤੇ ਵਜ਼ੀਫ਼ੇ',
    labelHi: 'शिक्षा एवं छात्रवृत्तियाँ',
    color: '#2563eb', // blue-600
    description: 'Tuition waivers, post-matric scholarships, laptop grants, and youth academic stipends.',
  },
  {
    key: 'Agriculture',
    labelEn: 'Agriculture & Farming',
    labelPa: 'ਖੇਤੀਬਾੜੀ ਅਤੇ ਕਿਸਾਨੀ',
    labelHi: 'कृषि एवं किसानी',
    color: '#0d9488', // teal-600
    description: 'Direct income support, crop insurance, machinery subsidies, and solar pump grants.',
  },
  {
    key: 'Women & Family',
    labelEn: 'Women & Family Welfare',
    labelPa: 'ਮਹਿਲਾ ਅਤੇ ਪਰਿਵਾਰ ਭਲਾਈ',
    labelHi: 'महिला एवं परिवार कल्याण',
    color: '#db2777', // pink-600
    description: 'Monthly women honor grants, marriage assistance, girl child savings, and maternal aid.',
  },
  {
    key: 'Health',
    labelEn: 'Health & Medical Care',
    labelPa: 'ਸਿਹਤ ਅਤੇ ਇਲਾਜ',
    labelHi: 'स्वास्थ्य एवं चिकित्सा',
    color: '#0891b2', // cyan-600
    description: 'Cashless hospital coverage up to ₹5–₹25 Lakh, maternity care, and critical illness relief.',
  },
  {
    key: 'Employment',
    labelEn: 'Employment & Enterprise',
    labelPa: 'ਰੋਜ਼ਗਾਰ ਅਤੇ ਕਾਰੋਬਾਰ',
    labelHi: 'रोजगार एवं उद्योग',
    color: '#16a34a', // green-600
    description: 'Collateral-free MSME loans, artisan toolkits, skill stipends, and startup subsidies.',
  },
  {
    key: 'Social Security',
    labelEn: 'Social Security & Pensions',
    labelPa: 'ਸਮਾਜਿਕ ਸੁਰੱਖਿਆ ਅਤੇ ਪੈਨਸ਼ਨਾਂ',
    labelHi: 'सामाजिक सुरक्षा एवं पेंशन',
    color: '#d97706', // amber-600
    description: 'Monthly DBT pensions for senior citizens, widows, persons with disabilities, and workers.',
  },
  {
    key: 'Housing',
    labelEn: 'Housing & Utilities',
    labelPa: 'ਰਿਹਾਇਸ਼ ਅਤੇ ਬੁਨਿਆਦੀ ਸਹੂਲਤਾਂ',
    labelHi: 'आवास एवं मूलभूत सुविधाएं',
    color: '#7c3aed', // violet-600
    description: 'Pucca house construction grants, rooftop solar subsidies, free ration, and electricity relief.',
  },
];

export function classifySchemeCategoryKey(scheme: Scheme): string {
  const title = scheme.titleEn.toLowerCase();
  const primaryTag = (scheme.categoryTags[0] ?? '').toLowerCase();
  const allTags = scheme.categoryTags.join(' ').toLowerCase();
  const dept = scheme.departmentEn.toLowerCase();

  // 1. Check explicit primary title keywords first
  if (
    title.includes('sehat') ||
    title.includes('arogyasri') ||
    title.includes('chiranjeevi') ||
    title.includes('ayushman') ||
    title.includes('health') ||
    title.includes('medical') ||
    title.includes('hospital') ||
    title.includes('cancer') ||
    title.includes('sanjeewani')
  ) {
    return 'Health';
  }
  if (
    title.includes('awas') ||
    title.includes('housing') ||
    title.includes('surya ghar') ||
    title.includes('rooftop solar') ||
    title.includes('ration') ||
    title.includes('electricity') ||
    title.includes('bijli') ||
    title.includes('ujjwala') ||
    title.includes('gruha jyothi')
  ) {
    return 'Housing';
  }
  if (
    title.includes('pension') ||
    title.includes('old age') ||
    title.includes('disability') ||
    title.includes('widow') ||
    title.includes('shram yogi') ||
    title.includes('e-shram')
  ) {
    return 'Social Security';
  }
  if (
    title.includes('kisan') ||
    title.includes('krishi') ||
    title.includes('krushak') ||
    title.includes('rythu') ||
    title.includes('kalia') ||
    title.includes('fasal') ||
    title.includes('crop') ||
    title.includes('seed') ||
    title.includes('bagwani') ||
    title.includes('farmer')
  ) {
    return 'Agriculture';
  }
  if (
    title.includes('ashirwad') ||
    title.includes('shagun') ||
    title.includes('ladli') ||
    title.includes('ladki') ||
    title.includes('maiya') ||
    title.includes('mahila') ||
    title.includes('maavaan') ||
    title.includes('gruha lakshmi') ||
    title.includes('subhadra') ||
    title.includes('mahtari') ||
    title.includes('orunodoi') ||
    title.includes('aama') ||
    title.includes('kanyashree') ||
    title.includes('magalir') ||
    title.includes('sukanya') ||
    title.includes('matru') ||
    title.includes('women') ||
    title.includes('girl')
  ) {
    return 'Women & Family';
  }
  if (
    title.includes('mudra') ||
    title.includes('vishwakarma') ||
    title.includes('rozgar') ||
    title.includes('kaam') ||
    title.includes('startup') ||
    title.includes('udyam') ||
    title.includes('entrepreneur') ||
    title.includes('bana kaih') ||
    title.includes('business') ||
    title.includes('artisan') ||
    title.includes('micro finance')
  ) {
    return 'Employment';
  }
  if (
    title.includes('scholarship') ||
    title.includes('matric') ||
    title.includes('student') ||
    title.includes('vidya') ||
    title.includes('pragati') ||
    title.includes('fellowship') ||
    title.includes('internship') ||
    title.includes('education') ||
    title.includes('coaching')
  ) {
    return 'Education';
  }

  // 2. Fallback to primary categoryTag
  if (primaryTag.includes('health')) return 'Health';
  if (primaryTag.includes('housing')) return 'Housing';
  if (primaryTag.includes('pension') || primaryTag.includes('senior')) return 'Social Security';
  if (primaryTag.includes('farmer') || primaryTag.includes('agri')) return 'Agriculture';
  if (primaryTag.includes('women') || primaryTag.includes('girl')) return 'Women & Family';
  if (primaryTag.includes('loan') || primaryTag.includes('job') || primaryTag.includes('skill') || primaryTag.includes('business')) {
    return 'Employment';
  }
  if (primaryTag.includes('student') || primaryTag.includes('education') || primaryTag.includes('scholarship')) {
    return 'Education';
  }

  // 3. Secondary tag & department fallback
  const combined = `${allTags} ${dept}`;
  if (combined.includes('farmer') || combined.includes('agri')) return 'Agriculture';
  if (combined.includes('health')) return 'Health';
  if (combined.includes('women')) return 'Women & Family';
  if (combined.includes('pension')) return 'Social Security';
  if (combined.includes('housing')) return 'Housing';
  if (combined.includes('student') || combined.includes('education')) return 'Education';

  return 'Employment';
}

export function computeAnalyticsSummary(
  schemes: Scheme[],
  evaluations: EligibilityEvaluation[]
): SchemeAnalyticsSummary {
  const evalMap = new Map<string, EligibilityEvaluation>();
  for (const ev of evaluations) {
    evalMap.set(ev.schemeId, ev);
  }

  const totalSchemes = schemes.length;
  let eligibleCount = 0;
  let potentialCount = 0;
  let ineligibleCount = 0;

  const categoryBuckets = new Map<
    string,
    {
      schemes: Scheme[];
      eligibleSchemes: Scheme[];
      potentialSchemes: Scheme[];
      ineligibleCount: number;
    }
  >();

  for (const meta of CATEGORY_METADATA) {
    categoryBuckets.set(meta.key, {
      schemes: [],
      eligibleSchemes: [],
      potentialSchemes: [],
      ineligibleCount: 0,
    });
  }

  let centralTotal = 0,
    centralEligible = 0,
    centralPotential = 0;
  let punjabTotal = 0,
    punjabEligible = 0,
    punjabPotential = 0;
  let otherStatesTotal = 0,
    otherStatesEligible = 0,
    otherStatesPotential = 0;

  for (const scheme of schemes) {
    const ev = evalMap.get(scheme.id);
    const isEligible = Boolean(ev?.isEligible);
    const isPotential = Boolean(!isEligible && ev?.isPotentialMatch);

    if (isEligible) eligibleCount++;
    else if (isPotential) potentialCount++;
    else ineligibleCount++;

    const catKey = classifySchemeCategoryKey(scheme);
    const bucket = categoryBuckets.get(catKey) ?? categoryBuckets.get('Employment')!;
    bucket.schemes.push(scheme);
    if (isEligible) bucket.eligibleSchemes.push(scheme);
    else if (isPotential) bucket.potentialSchemes.push(scheme);
    else bucket.ineligibleCount++;

    if (scheme.level === 'Central Government') {
      centralTotal++;
      if (isEligible) centralEligible++;
      else if (isPotential) centralPotential++;
    } else if (scheme.level === 'Punjab State' || scheme.state === 'Punjab') {
      punjabTotal++;
      if (isEligible) punjabEligible++;
      else if (isPotential) punjabPotential++;
    } else {
      otherStatesTotal++;
      if (isEligible) otherStatesEligible++;
      else if (isPotential) otherStatesPotential++;
    }
  }

  const categoryDistribution: CategoryAnalyticsRow[] = CATEGORY_METADATA.map((meta) => {
    const bucket = categoryBuckets.get(meta.key)!;
    const totalCount = bucket.schemes.length;
    const catEligible = bucket.eligibleSchemes.length;
    const catPotential = bucket.potentialSchemes.length;
    return {
      key: meta.key,
      labelEn: meta.labelEn,
      labelPa: meta.labelPa,
      labelHi: meta.labelHi,
      color: meta.color,
      description: meta.description,
      totalCount,
      eligibleCount: catEligible,
      potentialCount: catPotential,
      ineligibleCount: bucket.ineligibleCount,
      shareOfTotalPercent: totalSchemes > 0 ? Math.round((totalCount / totalSchemes) * 100) : 0,
      shareOfEligiblePercent: eligibleCount > 0 ? Math.round((catEligible / eligibleCount) * 100) : 0,
      schemes: bucket.schemes,
      eligibleSchemes: bucket.eligibleSchemes,
      potentialSchemes: bucket.potentialSchemes,
    };
  }).sort((a, b) => b.totalCount - a.totalCount || b.eligibleCount - a.eligibleCount);

  const dominantCategory =
    categoryDistribution.length > 0 ? categoryDistribution[0] : null;

  const sortedByEligible = [...categoryDistribution].sort(
    (a, b) => b.eligibleCount - a.eligibleCount || b.potentialCount - a.potentialCount
  );
  const topEligibleCategory = sortedByEligible.length > 0 ? sortedByEligible[0] : null;

  const eligibilityRatePercent =
    totalSchemes > 0 ? Math.round((eligibleCount / totalSchemes) * 100) : 0;
  const actionableRatePercent =
    totalSchemes > 0 ? Math.round(((eligibleCount + potentialCount) / totalSchemes) * 100) : 0;

  const eligibilityStatusDistribution: EligibilityStatusSlice[] = [
    {
      id: 'eligible',
      labelEn: 'Confirmed Eligible',
      labelPa: 'ਪੂਰੀ ਤਰ੍ਹਾਂ ਯੋਗ',
      labelHi: 'पूर्णतः पात्र',
      count: eligibleCount,
      percentage: totalSchemes > 0 ? Math.round((eligibleCount / totalSchemes) * 100) : 0,
      color: '#16a34a', // green-600
    },
    {
      id: 'potential',
      labelEn: 'Potential Match',
      labelPa: 'ਸੰਭਾਵੀ ਮੈਚ',
      labelHi: 'संभावित मिलान',
      count: potentialCount,
      percentage: totalSchemes > 0 ? Math.round((potentialCount / totalSchemes) * 100) : 0,
      color: '#2563eb', // blue-600
    },
    {
      id: 'ineligible',
      labelEn: 'Not Eligible',
      labelPa: 'ਅਯੋਗ',
      labelHi: 'अपात्र',
      count: ineligibleCount,
      percentage: totalSchemes > 0 ? Math.round((ineligibleCount / totalSchemes) * 100) : 0,
      color: '#94a3b8', // slate-400
    },
  ];

  const levelDistribution: LevelAnalyticsRow[] = [
    {
      levelKey: 'Central Government',
      labelEn: 'Central Govt',
      labelPa: 'ਕੇਂਦਰ ਸਰਕਾਰ',
      labelHi: 'केंद्र सरकार',
      totalCount: centralTotal,
      eligibleCount: centralEligible,
      potentialCount: centralPotential,
      ineligibleCount: Math.max(0, centralTotal - centralEligible - centralPotential),
      fill: '#0d9488',
    },
    {
      levelKey: 'Punjab State',
      labelEn: 'Punjab State',
      labelPa: 'ਪੰਜਾਬ ਸਰਕਾਰ',
      labelHi: 'पंजाब सरकार',
      totalCount: punjabTotal,
      eligibleCount: punjabEligible,
      potentialCount: punjabPotential,
      ineligibleCount: Math.max(0, punjabTotal - punjabEligible - punjabPotential),
      fill: '#2563eb',
    },
    {
      levelKey: 'All-India States & UTs',
      labelEn: 'Other States/UTs',
      labelPa: 'ਹੋਰ ਰਾਜ / ਯੂ.ਟੀ.',
      labelHi: 'अन्य राज्य / यूटी',
      totalCount: otherStatesTotal,
      eligibleCount: otherStatesEligible,
      potentialCount: otherStatesPotential,
      ineligibleCount: Math.max(0, otherStatesTotal - otherStatesEligible - otherStatesPotential),
      fill: '#7c3aed',
    },
  ].filter((row) => row.totalCount > 0);

  return {
    totalSchemes,
    eligibleCount,
    potentialCount,
    ineligibleCount,
    eligibilityRatePercent,
    actionableRatePercent,
    dominantCategory,
    topEligibleCategory,
    eligibilityStatusDistribution,
    categoryDistribution,
    levelDistribution,
  };
}
