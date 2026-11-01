import { Category, CitizenProfile, Gender, Occupation, Scheme, SchemeLevel, UserRole } from '../types/scheme';

export interface AdminSchemeKnowledgeState {
  customSchemes: Scheme[];
  editedSchemes: Record<string, Scheme>;
  deletedSchemeIds: string[];
}

export interface AdminSchemeFormInput {
  id?: string;
  titleEn: string;
  titlePa?: string;
  titleHi?: string;
  level: SchemeLevel;
  departmentEn: string;
  departmentPa?: string;
  departmentHi?: string;
  benefitAmountText: string;
  benefitType: Scheme['benefitType'];
  descriptionEn: string;
  descriptionPa?: string;
  descriptionHi?: string;
  minAge?: number;
  maxAge?: number;
  maxIncome?: number;
  targetGenders?: Gender[];
  eligibleCategories?: Category[];
  eligibleOccupations?: Occupation[];
  requiresPunjabDomicile?: boolean;
  applicationDeadline?: string;
  deadlineType?: Scheme['deadlineType'];
  officialPortalUrl: string;
  officialPortalName?: string;
  categoryTags?: string[];
  requiredDocumentsText?: string;
  applicationStepText?: string;
  youtubeVideoId?: string;
  youtubeVideoTitle?: string;
}

export interface AiKnowledgeSchemeSummary {
  id: string;
  nameEn: string;
  namePa: string;
  nameHi: string;
  level: string;
  department: string;
  benefits: string;
  benefitType: string;
  description: string;
  eligibility: {
    minAge?: number;
    maxAge?: number;
    maxIncome?: number;
    occupations?: string[];
    categories?: string[];
    gender: string;
    requiresPunjabDomicile: boolean;
  };
  documents: string[];
  portal: string;
  sourceCitation: string;
}

export const INITIAL_ADMIN_KNOWLEDGE_STATE: AdminSchemeKnowledgeState = {
  customSchemes: [],
  editedSchemes: {},
  deletedSchemeIds: [],
};

export function isAdminProfile(profile: Pick<CitizenProfile, 'role'> | null | undefined): boolean {
  return profile?.role === 'Admin';
}

export function designateProfileRole(profile: CitizenProfile, role: UserRole): CitizenProfile {
  return {
    ...profile,
    role,
  };
}

export function assertAdminRole(role?: UserRole): void {
  if (role !== 'Admin') {
    throw new Error('Admin role is required in the user profile state to modify AI knowledge base schemes.');
  }
}

export function createSchemeFromAdminInput(input: AdminSchemeFormInput, existingScheme?: Scheme): Scheme {
  const titleEn = input.titleEn.trim();
  if (!titleEn) {
    throw new Error('Scheme title (English) is required.');
  }

  const benefitAmountText = input.benefitAmountText.trim();
  if (!benefitAmountText) {
    throw new Error('Benefit amount / entitlement text is required.');
  }

  const officialPortalUrl = input.officialPortalUrl.trim();
  if (!officialPortalUrl || !/^https?:\/\//i.test(officialPortalUrl)) {
    throw new Error('A valid http:// or https:// official portal URL is required.');
  }

  const departmentEn = input.departmentEn.trim() || 'Department of Social Justice & Citizen Welfare, Punjab';
  const descriptionEn =
    input.descriptionEn.trim() ||
    `Verified government welfare scheme providing ${benefitAmountText} under ${departmentEn}.`;

  const slug = titleEn
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 36) || 'custom-scheme';

  const id = existingScheme?.id || input.id?.trim() || `admin-${slug}-${Date.now().toString().slice(-5)}`;

  const docLines = (input.requiredDocumentsText ?? '')
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const requiredDocuments =
    docLines.length > 0
      ? docLines.map((docName) => ({
          nameEn: docName,
          namePa: docName,
          nameHi: docName,
          issuingAuthority: 'Punjab Sewa Kendra / UIDAI',
          availableOnDigiLocker: true,
        }))
      : existingScheme?.requiredDocuments && existingScheme.requiredDocuments.length > 0
      ? existingScheme.requiredDocuments
      : [
          {
            nameEn: 'Aadhaar Card linked with Mobile',
            namePa: 'ਮੋਬਾਈਲ ਨਾਲ ਲਿੰਕ ਆਧਾਰ ਕਾਰਡ',
            nameHi: 'मोबाइल से लिंक आधार कार्ड',
            issuingAuthority: 'UIDAI',
            availableOnDigiLocker: true,
          },
          {
            nameEn: 'Punjab Residence / Domicile Certificate',
            namePa: 'ਪੰਜਾਬ ਰਿਹਾਇਸ਼ ਸਰਟੀਫਿਕੇਟ',
            nameHi: 'पंजाब निवास प्रमाण पत्र',
            issuingAuthority: 'Punjab Sewa Kendra',
            availableOnDigiLocker: true,
          },
          {
            nameEn: 'Active Bank Passbook (NPCI mapped)',
            namePa: 'ਬੈਂਕ ਪਾਸਬੁੱਕ (NPCI ਮੈਪਡ)',
            nameHi: 'बैंक पासबुक (NPCI मैप्ड)',
            issuingAuthority: 'Nationalized Bank',
            availableOnDigiLocker: false,
          },
        ];

  const stepLines = (input.applicationStepText ?? '')
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const applicationSteps =
    stepLines.length > 0
      ? stepLines.map((stepDesc, idx) => ({
          stepNumber: idx + 1,
          titleEn: idx === 0 ? 'Online Portal / Sewa Kendra Registration' : `Step ${idx + 1}`,
          titlePa: idx === 0 ? 'ਆਨਲਾਈਨ ਪੋਰਟਲ / ਸੇਵਾ ਕੇਂਦਰ ਰਜਿਸਟ੍ਰੇਸ਼ਨ' : `ਕਦਮ ${idx + 1}`,
          titleHi: idx === 0 ? 'ऑनलाइन पोर्टल / सेवा केंद्र पंजीकरण' : `चरण ${idx + 1}`,
          descriptionEn: stepDesc,
          descriptionPa: stepDesc,
          descriptionHi: stepDesc,
        }))
      : existingScheme?.applicationSteps && existingScheme.applicationSteps.length > 0
      ? existingScheme.applicationSteps
      : [
          {
            stepNumber: 1,
            titleEn: 'Apply on Official Portal or Nearest Sewa Kendra',
            titlePa: 'ਅਧਿਕਾਰਤ ਪੋਰਟਲ ਜਾਂ ਨੇੜਲੇ ਸੇਵਾ ਕੇਂਦਰ ਰਾਹੀਂ ਅਪਲਾਈ ਕਰੋ',
            titleHi: 'आधिकारिक पोर्टल या नजदीकी सेवा केंद्र पर आवेदन करें',
            descriptionEn: `Visit ${officialPortalUrl} or your district Sewa Kendra with Aadhaar and required documents.`,
            descriptionPa: `ਆਧਾਰ ਅਤੇ ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼ਾਂ ਨਾਲ ${officialPortalUrl} ਜਾਂ ਸੇਵਾ ਕੇਂਦਰ ਵਿਖੇ ਅਪਲਾਈ ਕਰੋ।`,
            descriptionHi: `आधार और आवश्यक दस्तावेजों के साथ ${officialPortalUrl} या सेवा केंद्र पर आवेदन करें।`,
          },
        ];

  const rawTags =
    input.categoryTags && input.categoryTags.length > 0
      ? input.categoryTags
      : existingScheme?.categoryTags && existingScheme.categoryTags.length > 0
      ? existingScheme.categoryTags
      : [input.benefitType, input.level === 'Punjab State' ? 'Punjab' : 'Central'];

  const categoryTags = Array.from(new Set([...rawTags, 'AI Knowledge Base']));

  return {
    id,
    titleEn,
    titlePa: input.titlePa?.trim() || existingScheme?.titlePa || `${titleEn} (ਪੰਜਾਬੀ)`,
    titleHi: input.titleHi?.trim() || existingScheme?.titleHi || `${titleEn} (हिन्दी)`,
    level: input.level,
    departmentEn,
    departmentPa: input.departmentPa?.trim() || existingScheme?.departmentPa || departmentEn,
    departmentHi: input.departmentHi?.trim() || existingScheme?.departmentHi || departmentEn,
    categoryTags,
    descriptionEn,
    descriptionPa: input.descriptionPa?.trim() || existingScheme?.descriptionPa || descriptionEn,
    descriptionHi: input.descriptionHi?.trim() || existingScheme?.descriptionHi || descriptionEn,
    benefitAmountText,
    benefitType: input.benefitType,
    ...(input.minAge !== undefined && Number.isFinite(input.minAge) ? { minAge: Number(input.minAge) } : {}),
    ...(input.maxAge !== undefined && Number.isFinite(input.maxAge) ? { maxAge: Number(input.maxAge) } : {}),
    ...(input.maxIncome !== undefined && Number.isFinite(input.maxIncome) && Number(input.maxIncome) > 0
      ? { maxIncome: Number(input.maxIncome) }
      : {}),
    ...(input.targetGenders && input.targetGenders.length > 0 ? { targetGenders: input.targetGenders } : {}),
    ...(input.eligibleCategories && input.eligibleCategories.length > 0
      ? { eligibleCategories: input.eligibleCategories }
      : {}),
    ...(input.eligibleOccupations && input.eligibleOccupations.length > 0
      ? { eligibleOccupations: input.eligibleOccupations }
      : {}),
    requiresPunjabDomicile: input.requiresPunjabDomicile ?? existingScheme?.requiresPunjabDomicile ?? true,
    applicationDeadline:
      input.applicationDeadline?.trim() || existingScheme?.applicationDeadline || 'Open on Official Portal (2026-27)',
    deadlineType: input.deadlineType || existingScheme?.deadlineType || 'Ongoing',
    officialPortalUrl,
    officialPortalName:
      input.officialPortalName?.trim() ||
      existingScheme?.officialPortalName ||
      `${titleEn} Official Portal`,
    ...(input.youtubeVideoId?.trim() || existingScheme?.youtubeVideoId
      ? { youtubeVideoId: input.youtubeVideoId?.trim() || existingScheme?.youtubeVideoId }
      : {}),
    ...(input.youtubeVideoTitle?.trim() || existingScheme?.youtubeVideoTitle
      ? { youtubeVideoTitle: input.youtubeVideoTitle?.trim() || existingScheme?.youtubeVideoTitle }
      : {}),
    requiredDocuments,
    applicationSteps,
    sourceCitation: existingScheme?.sourceCitation || 'Admin Knowledge Base · Verified Gazette Entry 2026',
    verifiedDate: 'November 2026',
  };
}

export function addAdminScheme(
  state: AdminSchemeKnowledgeState,
  input: AdminSchemeFormInput,
  role?: UserRole
): { nextState: AdminSchemeKnowledgeState; createdScheme: Scheme } {
  assertAdminRole(role);
  const createdScheme = createSchemeFromAdminInput(input);
  const nextState: AdminSchemeKnowledgeState = {
    customSchemes: [createdScheme, ...state.customSchemes.filter((s) => s.id !== createdScheme.id)],
    editedSchemes: {
      ...state.editedSchemes,
      [createdScheme.id]: createdScheme,
    },
    deletedSchemeIds: state.deletedSchemeIds.filter((id) => id !== createdScheme.id),
  };
  return { nextState, createdScheme };
}

export function updateAdminScheme(
  state: AdminSchemeKnowledgeState,
  existingScheme: Scheme,
  input: AdminSchemeFormInput,
  role?: UserRole
): { nextState: AdminSchemeKnowledgeState; updatedScheme: Scheme } {
  assertAdminRole(role);
  const updatedScheme = createSchemeFromAdminInput({ ...input, id: existingScheme.id }, existingScheme);
  const isCustom = state.customSchemes.some((s) => s.id === existingScheme.id);
  const nextState: AdminSchemeKnowledgeState = {
    customSchemes: isCustom
      ? state.customSchemes.map((s) => (s.id === existingScheme.id ? updatedScheme : s))
      : state.customSchemes,
    editedSchemes: {
      ...state.editedSchemes,
      [existingScheme.id]: updatedScheme,
    },
    deletedSchemeIds: state.deletedSchemeIds.filter((id) => id !== existingScheme.id),
  };
  return { nextState, updatedScheme };
}

export function deleteAdminScheme(
  state: AdminSchemeKnowledgeState,
  schemeId: string,
  role?: UserRole
): AdminSchemeKnowledgeState {
  assertAdminRole(role);
  const trimmedId = schemeId.trim();
  if (!trimmedId) {
    throw new Error('Scheme ID is required to delete a scheme.');
  }
  const nextEdited = { ...state.editedSchemes };
  delete nextEdited[trimmedId];

  return {
    customSchemes: state.customSchemes.filter((s) => s.id !== trimmedId),
    editedSchemes: nextEdited,
    deletedSchemeIds: Array.from(new Set([...state.deletedSchemeIds, trimmedId])),
  };
}

export function restoreDeletedSchemes(
  state: AdminSchemeKnowledgeState,
  role?: UserRole
): AdminSchemeKnowledgeState {
  assertAdminRole(role);
  return {
    ...state,
    deletedSchemeIds: [],
  };
}

export function computeActiveSchemes(
  baseSchemes: Scheme[],
  aiAddedSchemes: Scheme[],
  state: AdminSchemeKnowledgeState
): Scheme[] {
  const deletedSet = new Set(state.deletedSchemeIds);
  const seenIds = new Set<string>();
  const combined: Scheme[] = [];

  for (const scheme of [...state.customSchemes, ...aiAddedSchemes, ...baseSchemes]) {
    if (!scheme || !scheme.id || deletedSet.has(scheme.id) || seenIds.has(scheme.id)) {
      continue;
    }
    seenIds.add(scheme.id);
    const finalScheme = state.editedSchemes[scheme.id] ?? scheme;
    combined.push(finalScheme);
  }

  return combined;
}

export function buildAiKnowledgeSummary(schemes: Scheme[]): AiKnowledgeSchemeSummary[] {
  return schemes.map((s) => ({
    id: s.id,
    nameEn: s.titleEn,
    namePa: s.titlePa,
    nameHi: s.titleHi,
    level: s.level,
    department: s.departmentEn,
    benefits: s.benefitAmountText,
    benefitType: s.benefitType,
    description: s.descriptionEn,
    eligibility: {
      ...(s.minAge !== undefined ? { minAge: s.minAge } : {}),
      ...(s.maxAge !== undefined ? { maxAge: s.maxAge } : {}),
      ...(s.maxIncome !== undefined ? { maxIncome: s.maxIncome } : {}),
      ...(s.eligibleOccupations ? { occupations: s.eligibleOccupations } : {}),
      ...(s.eligibleCategories ? { categories: s.eligibleCategories } : {}),
      gender: s.targetGenders && s.targetGenders.length > 0 ? s.targetGenders.join(', ') : 'All',
      requiresPunjabDomicile: Boolean(s.requiresPunjabDomicile),
    },
    documents: s.requiredDocuments.map((d) => d.nameEn),
    portal: s.officialPortalUrl,
    sourceCitation: s.sourceCitation,
  }));
}
