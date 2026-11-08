import { ApplicationTrackerItem, Category, CitizenProfile, Gender, Occupation } from '../types/scheme';
import { Json, supabase } from './supabase';

const TRACKER_STATUSES = new Set<ApplicationTrackerItem['status']>([
  'Discovered',
  'Documents Assembled',
  'Form Submitted',
  'Approved',
  'Disbursed'
]);
const PROFILE_GENDERS = new Set<Gender>(['All', 'Male', 'Female', 'Transgender']);
const PROFILE_CATEGORIES = new Set<Category>(['General', 'SC', 'ST', 'OBC/BC', 'EWS']);
const PROFILE_OCCUPATIONS = new Set<Occupation>([
  'Farmer',
  'Agricultural Labourer',
  'Student',
  'Unemployed Youth',
  'Artisan/Craftsperson',
  'Self-Employed',
  'Self-Employed/Shopkeeper',
  'Daily Wage Worker',
  'Homemaker',
  'Senior Citizen',
  'Private Employee',
  'Government Employee'
]);

function isProfileGender(value: unknown): value is Gender {
  return typeof value === 'string' && PROFILE_GENDERS.has(value as Gender);
}

function isProfileCategory(value: unknown): value is Category {
  return typeof value === 'string' && PROFILE_CATEGORIES.has(value as Category);
}

function isProfileOccupation(value: unknown): value is Occupation {
  return typeof value === 'string' && PROFILE_OCCUPATIONS.has(value as Occupation);
}

export function parseCitizenProfile(value: unknown): CitizenProfile {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Citizen profile in Supabase has an invalid format.');
  }
  const profile = value as Record<string, unknown>;
  if (
    (profile.username !== undefined && typeof profile.username !== 'string') ||
    (profile.role !== undefined && profile.role !== 'Citizen' && profile.role !== 'Admin') ||
    typeof profile.age !== 'number' ||
    !Number.isFinite(profile.age) ||
    !isProfileGender(profile.gender) ||
    !isProfileOccupation(profile.occupation) ||
    typeof profile.annualIncome !== 'number' ||
    !Number.isFinite(profile.annualIncome) ||
    !isProfileCategory(profile.category) ||
    typeof profile.district !== 'string' ||
    typeof profile.isPunjabDomicile !== 'boolean' ||
    typeof profile.landholdingAcres !== 'number' ||
    !Number.isFinite(profile.landholdingAcres) ||
    typeof profile.hasDisability !== 'boolean' ||
    typeof profile.isWidowOrDestitute !== 'boolean' ||
    typeof profile.isEnrolledInSchoolOrCollege !== 'boolean'
  ) {
    throw new Error('Citizen profile in Supabase has invalid fields.');
  }
  return {
    username: typeof profile.username === 'string' ? profile.username : '',
    ...(profile.role === 'Admin' || profile.role === 'Citizen' ? { role: profile.role } : {}),
    ...(typeof profile.state === 'string' && profile.state.trim() ? { state: profile.state.trim() } : {}),
    ...(typeof profile.customLocation === 'string' && profile.customLocation.trim()
      ? { customLocation: profile.customLocation.trim() }
      : {}),
    ...(typeof profile.pincode === 'string' && profile.pincode.trim()
      ? { pincode: profile.pincode.trim() }
      : {}),
    age: profile.age,
    gender: profile.gender,
    occupation: profile.occupation,
    annualIncome: profile.annualIncome,
    category: profile.category,
    district: profile.district,
    isPunjabDomicile: profile.isPunjabDomicile,
    landholdingAcres: profile.landholdingAcres,
    hasDisability: profile.hasDisability,
    isWidowOrDestitute: profile.isWidowOrDestitute,
    isEnrolledInSchoolOrCollege: profile.isEnrolledInSchoolOrCollege
  };
}

function isTrackerStatus(value: unknown): value is ApplicationTrackerItem['status'] {
  return typeof value === 'string' && TRACKER_STATUSES.has(value as ApplicationTrackerItem['status']);
}

export function parseSavedSchemeIds(value: unknown): Set<string> {
  if (!Array.isArray(value) || !value.every((item): item is string => typeof item === 'string')) {
    throw new Error('Saved schemes in Supabase have an invalid format.');
  }
  return new Set(value);
}

export function parseTrackedItems(value: unknown): ApplicationTrackerItem[] {
  if (!Array.isArray(value)) {
    throw new Error('Application tracker data in Supabase has an invalid format.');
  }

  return value.map((item: unknown) => {
    if (!item || typeof item !== 'object') {
      throw new Error('An application tracker item in Supabase is invalid.');
    }

    const candidate = item as Record<string, unknown>;
    if (
      typeof candidate.id !== 'string' ||
      typeof candidate.schemeId !== 'string' ||
      typeof candidate.schemeTitle !== 'string' ||
      typeof candidate.dateStarted !== 'string' ||
      !isTrackerStatus(candidate.status) ||
      (candidate.applicationRefNumber !== undefined && typeof candidate.applicationRefNumber !== 'string') ||
      (candidate.notes !== undefined && typeof candidate.notes !== 'string')
    ) {
      throw new Error('An application tracker item in Supabase has invalid fields.');
    }

    return {
      id: candidate.id,
      schemeId: candidate.schemeId,
      schemeTitle: candidate.schemeTitle,
      dateStarted: candidate.dateStarted,
      status: candidate.status,
      ...(typeof candidate.applicationRefNumber === 'string'
        ? { applicationRefNumber: candidate.applicationRefNumber }
        : {}),
      ...(typeof candidate.notes === 'string' ? { notes: candidate.notes } : {})
    };
  });
}

export interface ExtraCitizenSyncData {
  ownedDocs?: Set<string>;
  preferredLanguage?: 'en' | 'pa' | 'hi';
  googleLinkedEmail?: string | null;
}

export async function loadCitizenCloudData(userId: string) {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('citizen_app_data')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    // Fallback to Supabase user_metadata if table is not created yet
    const { data: userData } = await supabase.auth.getUser();
    const meta = userData?.user?.user_metadata?.janshayak_cloud_backup as Record<string, unknown> | undefined;
    if (meta) {
      return {
        savedSchemeIds: Array.isArray(meta.saved_scheme_ids) ? parseSavedSchemeIds(meta.saved_scheme_ids) : new Set<string>(),
        trackedItems: Array.isArray(meta.tracked_items) ? parseTrackedItems(meta.tracked_items) : [],
        profile: meta.profile ? parseCitizenProfile(meta.profile) : null,
        ownedDocs: Array.isArray(meta.owned_docs) ? new Set<string>(meta.owned_docs.filter((d): d is string => typeof d === 'string')) : undefined,
        preferredLanguage: (meta.preferred_language === 'pa' || meta.preferred_language === 'hi' || meta.preferred_language === 'en') ? meta.preferred_language : undefined,
        googleLinkedEmail: typeof meta.google_linked_email === 'string' ? meta.google_linked_email : null,
        hasCloudRecord: true
      };
    }
    throw new Error(`Could not load cloud data: ${error.message}`);
  }

  if (!data) {
    return {
      savedSchemeIds: new Set<string>(),
      trackedItems: [],
      profile: null,
      ownedDocs: undefined,
      preferredLanguage: undefined,
      googleLinkedEmail: null,
      hasCloudRecord: false
    };
  }

  const rawRow = data as Record<string, unknown>;
  const rawProfile = (data.profile && typeof data.profile === 'object' && !Array.isArray(data.profile))
    ? (data.profile as Record<string, unknown>)
    : null;

  const ownedDocsSource = Array.isArray(rawRow.owned_docs)
    ? rawRow.owned_docs
    : (rawProfile && Array.isArray(rawProfile._ownedDocs) ? rawProfile._ownedDocs : undefined);
  const ownedDocs = Array.isArray(ownedDocsSource)
    ? new Set<string>(ownedDocsSource.filter((item): item is string => typeof item === 'string'))
    : undefined;

  const langSource = typeof rawRow.preferred_language === 'string'
    ? rawRow.preferred_language
    : (rawProfile && typeof rawProfile._preferredLanguage === 'string' ? rawProfile._preferredLanguage : undefined);
  const preferredLanguage: 'en' | 'pa' | 'hi' | undefined =
    langSource === 'pa' || langSource === 'hi' || langSource === 'en' ? langSource : undefined;

  const googleEmailSource = typeof rawRow.google_linked_email === 'string'
    ? rawRow.google_linked_email
    : (rawProfile && typeof rawProfile._googleLinkedEmail === 'string' ? rawProfile._googleLinkedEmail : null);

  return {
    savedSchemeIds: parseSavedSchemeIds(data.saved_scheme_ids),
    trackedItems: parseTrackedItems(data.tracked_items),
    profile: data.profile === null ? null : parseCitizenProfile(data.profile),
    ownedDocs,
    preferredLanguage,
    googleLinkedEmail: googleEmailSource,
    hasCloudRecord: true
  };
}

export async function saveCitizenCloudData(
  userId: string,
  savedSchemeIds: Set<string>,
  trackedItems: ApplicationTrackerItem[],
  profile: CitizenProfile,
  extra?: ExtraCitizenSyncData
) {
  if (!supabase) throw new Error('Supabase is not configured.');

  const cloudTrackedItems: Json[] = trackedItems.map((item) => {
    const row: { [key: string]: Json | undefined } = {
      id: item.id,
      schemeId: item.schemeId,
      schemeTitle: item.schemeTitle,
      dateStarted: item.dateStarted,
      status: item.status,
      applicationRefNumber: item.applicationRefNumber,
      notes: item.notes
    };
    return row;
  });

  const ownedDocsArray = extra?.ownedDocs ? Array.from(extra.ownedDocs) : undefined;
  const profilePayload: { [key: string]: Json | undefined } = {
    username: profile.username,
    role: profile.role ?? 'Citizen',
    age: profile.age,
    gender: profile.gender,
    occupation: profile.occupation,
    annualIncome: profile.annualIncome,
    category: profile.category,
    district: profile.district,
    isPunjabDomicile: profile.isPunjabDomicile,
    landholdingAcres: profile.landholdingAcres,
    hasDisability: profile.hasDisability,
    isWidowOrDestitute: profile.isWidowOrDestitute,
    isEnrolledInSchoolOrCollege: profile.isEnrolledInSchoolOrCollege,
    ...(ownedDocsArray ? { _ownedDocs: ownedDocsArray } : {}),
    ...(extra?.preferredLanguage ? { _preferredLanguage: extra.preferredLanguage } : {}),
    ...(extra?.googleLinkedEmail !== undefined ? { _googleLinkedEmail: extra.googleLinkedEmail } : {})
  };

  const basePayload = {
    user_id: userId,
    saved_scheme_ids: Array.from(savedSchemeIds),
    tracked_items: cloudTrackedItems,
    profile: profilePayload,
    updated_at: new Date().toISOString()
  };

  // Attempt full upsert with extended columns first; fall back to base columns if schema only has core columns
  const { error: fullError } = await supabase.from('citizen_app_data').upsert({
    ...basePayload,
    ...(ownedDocsArray ? { owned_docs: ownedDocsArray } : {}),
    ...(extra?.preferredLanguage ? { preferred_language: extra.preferredLanguage } : {}),
    ...(extra?.googleLinkedEmail !== undefined ? { google_linked_email: extra.googleLinkedEmail } : {})
  }, { onConflict: 'user_id' });

  if (fullError) {
    const { error: fallbackError } = await supabase
      .from('citizen_app_data')
      .upsert(basePayload, { onConflict: 'user_id' });

    if (fallbackError) {
      // Final resilient fallback: store inside Supabase user_metadata so user never loses cloud data
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          janshayak_cloud_backup: {
            ...basePayload,
            owned_docs: ownedDocsArray ?? [],
            preferred_language: extra?.preferredLanguage ?? 'en',
            google_linked_email: extra?.googleLinkedEmail ?? null
          }
        }
      });
      if (metaError) {
        throw new Error(`Could not sync cloud data: ${fallbackError.message}`);
      }
    }
  }
}
