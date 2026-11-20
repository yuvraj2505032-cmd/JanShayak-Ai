import { Language, Scheme } from '../types/scheme';

export interface PhoneAlertSubscription {
  phoneNumber: string; // normalized 10-digit Indian mobile number, e.g. "9876543210"
  countryCode: string; // "+91"
  enabled: boolean;
  notifyDeadlines: boolean;
  notifyNewSchemes: boolean;
  notifyTrackerUpdates: boolean;
  preferredLang: Language;
  subscribedSchemeIds: string[];
  loggedInUserId?: string;
  loggedInUserEmail?: string;
  notifiedNewSchemeIds?: string[];
  oneTimeAlertDelivered?: boolean;
  updatedAt: string;
}

export interface SentPhoneAlertMessage {
  id: string;
  phoneNumber: string;
  formattedPhone: string;
  userId?: string;
  userEmail?: string;
  schemeId?: string;
  schemeTitle: string;
  alertType: 'deadline' | 'new_scheme' | 'tracker_status' | 'scheme_guide' | 'family_bundle';
  triggeredBy: 'AI Autonomous Engine' | 'Admin Broadcast' | 'AI Tracker Monitor';
  aiSmsCode: string;
  smsBody: string;
  inWebsiteUrl: string;
  whatsappUrl: string;
  smsDeviceUri: string;
  sentAt: string;
  deliveryStatus: 'Delivered Once (1-Time Only)' | 'Delivered to Phone' | 'Queued Offline';
}

const PHONE_SUB_STORAGE_KEY = 'janshayak_phone_alert_subscription_v1';
const PHONE_INBOX_STORAGE_KEY = 'janshayak_phone_alert_inbox_v1';
const ACTIVE_LOGGED_IN_USER_KEY = 'janshayak_active_logged_in_user_v1';
const ONE_TIME_SCHEME_LOCK_KEY = 'janshayak_one_time_scheme_alert_locks_v1';

// In-memory lock so concurrent calls never send more than 1 message
const inMemoryOneTimeLocks = new Set<string>();
let currentLoggedInUserMemory: { id: string; email: string } | null = null;

/**
 * Syncs the currently logged-in website user (from Supabase Auth or Local Account)
 * so scheme alerts are ONLY ever dispatched to users logged into our website.
 */
export function syncActiveLoggedInUser(user: { id: string; email: string } | null): void {
  currentLoggedInUserMemory = user;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (user && user.id) {
        window.localStorage.setItem(ACTIVE_LOGGED_IN_USER_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(ACTIVE_LOGGED_IN_USER_KEY);
      }
    }
  } catch {
    // ignore storage errors
  }
}

/**
 * Checks whether a user is currently logged into our website.
 */
export function getActiveLoggedInUser(): { isLoggedIn: boolean; userId: string | null; email: string | null } {
  if (currentLoggedInUserMemory && currentLoggedInUserMemory.id) {
    return {
      isLoggedIn: true,
      userId: currentLoggedInUserMemory.id,
      email: currentLoggedInUserMemory.email || null,
    };
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const syncedRaw = window.localStorage.getItem(ACTIVE_LOGGED_IN_USER_KEY);
      if (syncedRaw) {
        const parsed = JSON.parse(syncedRaw);
        if (parsed && typeof parsed.id === 'string' && parsed.id.trim()) {
          return {
            isLoggedIn: true,
            userId: parsed.id.trim(),
            email: typeof parsed.email === 'string' ? parsed.email : null,
          };
        }
      }
      // Also check localAuth session key ('janshayak_local_session')
      const localSessionId = window.localStorage.getItem('janshayak_local_session');
      if (localSessionId && localSessionId.trim()) {
        return {
          isLoggedIn: true,
          userId: `local-${localSessionId.trim()}`,
          email: null,
        };
      }
    }
  } catch {
    // ignore
  }
  return { isLoggedIn: false, userId: null, email: null };
}

function readOneTimeLocks(): Record<string, boolean> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(ONE_TIME_SCHEME_LOCK_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    }
  } catch {
    // ignore
  }
  return {};
}

function writeOneTimeLock(lockKey: string): void {
  inMemoryOneTimeLocks.add(lockKey);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const current = readOneTimeLocks();
      current[lockKey] = true;
      window.localStorage.setItem(ONE_TIME_SCHEME_LOCK_KEY, JSON.stringify(current));
    }
  } catch {
    // ignore
  }
}

/**
 * Checks if the logged-in user has ALREADY received the 1-time alert message.
 * Rule: "bas jedo new scheme aave oodo hi ek bar message jave ... schme alert vich bas user nu 1 bar message jana chihada"
 */
export function hasUserAlreadyReceivedOneTimeAlert(userId: string, schemeId: string): boolean {
  const userOnceKey = `user_once:${userId}`;
  const schemeKey = `user_scheme:${userId}:${schemeId}`;
  if (inMemoryOneTimeLocks.has(userOnceKey) || inMemoryOneTimeLocks.has(schemeKey)) {
    return true;
  }
  const locks = readOneTimeLocks();
  return Boolean(locks[userOnceKey] || locks[schemeKey]);
}

export function markOneTimeAlertDelivered(userId: string, schemeId: string): void {
  writeOneTimeLock(`user_once:${userId}`);
  writeOneTimeLock(`user_scheme:${userId}:${schemeId}`);
}

export function resetOneTimeAlertLockForUser(userId?: string): void {
  inMemoryOneTimeLocks.clear();
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (!userId) {
        window.localStorage.removeItem(ONE_TIME_SCHEME_LOCK_KEY);
      } else {
        const locks = readOneTimeLocks();
        delete locks[`user_once:${userId}`];
        window.localStorage.setItem(ONE_TIME_SCHEME_LOCK_KEY, JSON.stringify(locks));
      }
    }
  } catch {
    // ignore
  }
}

/**
 * Validates and normalizes an Indian mobile phone number.
 * Accepts inputs like "9876543210", "+91 98765-43210", "09876543210".
 */
export function normalizeIndianPhoneNumber(rawInput: string): {
  isValid: boolean;
  digits10: string;
  e164: string;
  display: string;
  errorEn?: string;
  errorPa?: string;
  errorHi?: string;
} {
  const digitsOnly = String(rawInput || '').replace(/\D/g, '');
  let cleaned = digitsOnly;

  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }

  const isValid = /^[6-9]\d{9}$/.test(cleaned);
  if (!isValid) {
    return {
      isValid: false,
      digits10: cleaned.slice(0, 10),
      e164: '',
      display: rawInput,
      errorEn: 'Please enter a valid 10-digit mobile number (starting with 6, 7, 8, or 9).',
      errorPa: 'ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ 10-ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ ਭਰੋ (6, 7, 8 ਜਾਂ 9 ਨਾਲ ਸ਼ੁਰੂ ਹੋਣ ਵਾਲਾ)।',
      errorHi: 'कृपया सही 10-अंकीय मोबाइल नंबर दर्ज करें (6, 7, 8 या 9 से शुरू होने वाला)।',
    };
  }

  return {
    isValid: true,
    digits10: cleaned,
    e164: `+91${cleaned}`,
    display: `+91 ${cleaned.slice(0, 5)}-${cleaned.slice(5)}`,
  };
}

export function generateAiAdminSmsCode(seed?: string): string {
  const numeric = seed
    ? Array.from(seed).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 900000, 100000)
    : Math.floor(100000 + Math.random() * 900000);
  const sixDigits = String(Math.abs(numeric) % 900000 + 100000).slice(0, 6);
  return `JAN-AI-${sixDigits}`;
}

/**
 * Builds a complete, self-contained scheme alert message in Punjabi, Hindi, or English
 * containing full eligibility, documents, and steps so the user NEVER has to go to Google
 * ("user nu google te jana di load na peve schmes bare pta krna nu sab sadi website vich hove").
 */
export function buildSchemePhoneAlertText(params: {
  scheme: Pick<
    Scheme,
    | 'id'
    | 'titleEn'
    | 'titlePa'
    | 'titleHi'
    | 'benefitAmountText'
    | 'applicationDeadline'
    | 'officialPortalUrl'
  > &
    Partial<Pick<Scheme, 'descriptionEn' | 'descriptionPa' | 'descriptionHi' | 'minAge' | 'maxAge' | 'maxIncome' | 'requiredDocuments' | 'applicationSteps'>>;
  alertType: SentPhoneAlertMessage['alertType'];
  language: Language;
  daysLeft?: number;
  trackerStageLabel?: string;
  aiSmsCode?: string;
  triggeredBy?: SentPhoneAlertMessage['triggeredBy'];
}): string {
  const { scheme, alertType, language, daysLeft, trackerStageLabel } = params;
  const smsCode = params.aiSmsCode || generateAiAdminSmsCode(scheme.id);
  const title =
    language === 'pa'
      ? scheme.titlePa || scheme.titleEn
      : language === 'hi'
        ? scheme.titleHi || scheme.titleEn
        : scheme.titleEn;

  const docsSummary = Array.isArray(scheme.requiredDocuments) && scheme.requiredDocuments.length > 0
    ? scheme.requiredDocuments
        .slice(0, 3)
        .map((d) => (language === 'pa' ? d.namePa || d.nameEn : language === 'hi' ? d.nameHi || d.nameEn : d.nameEn))
        .join(', ')
    : language === 'pa'
      ? 'ਆਧਾਰ ਕਾਰਡ, ਬੈਂਕ ਪਾਸਬੁੱਕ (NPCI ਲਿੰਕ), ਰਿਹਾਇਸ਼ ਸਰਟੀਫਿਕੇਟ'
      : language === 'hi'
        ? 'आधार कार्ड, बैंक पासबुक (NPCI लिंक), निवास प्रमाण पत्र'
        : 'Aadhaar Card, Bank Passbook (NPCI linked), Residence Certificate';

  const eligibilitySummary =
    language === 'pa'
      ? `ਉਮਰ: ${scheme.minAge ?? 18}-${scheme.maxAge ?? 65} ਸਾਲ • ਸਲਾਨਾ ਆਮਦਨ ਸੀਮਾ: ₹${(scheme.maxIncome ?? 300000).toLocaleString('en-IN')}`
      : language === 'hi'
        ? `आयु: ${scheme.minAge ?? 18}-${scheme.maxAge ?? 65} वर्ष • वार्षिक आय सीमा: ₹${(scheme.maxIncome ?? 300000).toLocaleString('en-IN')}`
        : `Age: ${scheme.minAge ?? 18}-${scheme.maxAge ?? 65} yrs • Max Income: ₹${(scheme.maxIncome ?? 300000).toLocaleString('en-IN')}`;

  if (alertType === 'tracker_status') {
    const stage = trackerStageLabel || 'Updated';
    if (language === 'pa') {
      return `📲 [Janshayak AI ਅਰਜ਼ੀ ਅਪਡੇਟ • ${smsCode}]\nਸਕੀਮ: ${title}\nਸਥਿਤੀ: ${stage}\nਲਾਭ: ${scheme.benefitAmountText}\nਪੂਰੀ ਜਾਣਕਾਰੀ ਸਾਡੀ ਵੈੱਬਸਾਈਟ ਦੇ ਅੰਦਰ ਹੀ ਮੌਜੂਦ ਹੈ (ਹੈਲਪਲਾਈਨ: 1100)`;
    }
    if (language === 'hi') {
      return `📲 [Janshayak AI आवेदन अपडेट • ${smsCode}]\nयोजना: ${title}\nस्थिति: ${stage}\nलाभ: ${scheme.benefitAmountText}\nपूरी जानकारी हमारी वेबसाइट के अंदर ही उपलब्ध है (हेल्पलाइन: 1100)`;
    }
    return `📲 [Janshayak AI Application Tracker • ${smsCode}]\nScheme: ${title}\nProgress: ${stage}\nBenefit: ${scheme.benefitAmountText}\nFull details available inside our Janshayak website (Helpline: 1100)`;
  }

  // Primary 1-Time New Scheme Alert ("bas jedo new scheme aave oodo hi ek bar message jave")
  if (alertType === 'new_scheme') {
    if (language === 'pa') {
      return (
        `🆕 [ਨਵੀਂ ਸਕੀਮ ਅਲਰਟ (1-Time Alert) • ਕੋਡ: ${smsCode}]\n` +
        `ਸਕੀਮ: ${title}\n` +
        `💰 ਲਾਭ: ${scheme.benefitAmountText}\n` +
        `✅ ਯੋਗਤਾ: ${eligibilitySummary}\n` +
        `📄 ਲੋੜੀਂਦੇ ਕਾਗਜ਼: ${docsSummary}\n` +
        `📅 ਆਖਰੀ ਮਿਤੀ: ${scheme.applicationDeadline}\n` +
        `🌐 Google 'ਤੇ ਜਾਣ ਦੀ ਲੋੜ ਨਹੀਂ — ਇਸ ਸਕੀਮ ਦੀ A-to-Z ਪੂਰੀ ਜਾਣਕਾਰੀ, ਫਾਰਮ ਗਾਈਡ ਅਤੇ ਅਪਲਾਈ ਕਰਨ ਦੇ ਕਦਮ ਸਾਡੀ Janshayak ਵੈੱਬਸਾਈਟ ਦੇ ਅੰਦਰ ਹੀ ਖੋਲ੍ਹੋ! (ਮੁਫ਼ਤ ਹੈਲਪਲਾਈਨ: 1100)`
      );
    }
    if (language === 'hi') {
      return (
        `🆕 [नई सरकारी योजना अलर्ट (1-Time Alert) • कोड: ${smsCode}]\n` +
        `योजना: ${title}\n` +
        `💰 लाभ: ${scheme.benefitAmountText}\n` +
        `✅ पात्रता: ${eligibilitySummary}\n` +
        `📄 आवश्यक दस्तावेज़: ${docsSummary}\n` +
        `📅 अंतिम तिथि: ${scheme.applicationDeadline}\n` +
        `🌐 Google पर जाने की आवश्यकता नहीं — इस योजना की पूरी जानकारी, फॉर्म गाइड और आवेदन प्रक्रिया हमारी Janshayak वेबसाइट के अंदर ही उपलब्ध है! (हेल्पलाइन: 1100)`
      );
    }
    return (
      `🆕 [New Scheme 1-Time Alert • Code: ${smsCode}]\n` +
      `Scheme: ${title}\n` +
      `💰 Benefit: ${scheme.benefitAmountText}\n` +
      `✅ Eligibility: ${eligibilitySummary}\n` +
      `📄 Required Docs: ${docsSummary}\n` +
      `📅 Deadline: ${scheme.applicationDeadline}\n` +
      `🌐 No need to go to Google — 100% complete scheme details, form guide, and application steps are available right inside our Janshayak website! (Helpline: 1100)`
    );
  }

  const daysNotePa = typeof daysLeft === 'number' ? ` (${daysLeft} ਦਿਨ ਬਾਕੀ)` : '';
  const daysNoteHi = typeof daysLeft === 'number' ? ` (${daysLeft} दिन शेष)` : '';
  const daysNoteEn = typeof daysLeft === 'number' ? ` (${daysLeft} Days Left)` : '';

  if (language === 'pa') {
    return `🚨 [AI/Admin ਸਕੀਮ ਅਲਰਟ • ਕੋਡ: ${smsCode}]${daysNotePa}\nਸਕੀਮ: ${title}\nਲਾਭ: ${scheme.benefitAmountText}\nਲੋੜੀਂਦੇ ਕਾਗਜ਼: ${docsSummary}\nਪੂਰੀ ਗਾਈਡ ਸਾਡੀ ਵੈੱਬਸਾਈਟ ਵਿੱਚ ਮੌਜੂਦ ਹੈ (ਹੈਲਪਲਾਈਨ: 1100)`;
  }
  if (language === 'hi') {
    return `🚨 [AI/Admin योजना अलर्ट • कोड: ${smsCode}]${daysNoteHi}\nयोजना: ${title}\nलाभ: ${scheme.benefitAmountText}\nदस्तावेज़: ${docsSummary}\nपूरी गाइड हमारी वेबसाइट में उपलब्ध है (हेल्पलाइन: 1100)`;
  }
  return `🚨 [AI/Admin Scheme Alert • Code: ${smsCode}]${daysNoteEn}\nScheme: ${title}\nBenefit: ${scheme.benefitAmountText}\nRequired Docs: ${docsSummary}\nComplete guide available inside our website (Helpline: 1100)`;
}

export function loadPhoneAlertSubscription(): PhoneAlertSubscription {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(PHONE_SUB_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.phoneNumber === 'string') {
          return {
            phoneNumber: parsed.phoneNumber,
            countryCode: '+91',
            enabled: Boolean(parsed.enabled),
            notifyDeadlines: false,
            notifyNewSchemes: true,
            notifyTrackerUpdates: false,
            preferredLang: parsed.preferredLang === 'pa' || parsed.preferredLang === 'hi' ? parsed.preferredLang : 'en',
            subscribedSchemeIds: Array.isArray(parsed.subscribedSchemeIds) ? parsed.subscribedSchemeIds : [],
            loggedInUserId: typeof parsed.loggedInUserId === 'string' ? parsed.loggedInUserId : undefined,
            loggedInUserEmail: typeof parsed.loggedInUserEmail === 'string' ? parsed.loggedInUserEmail : undefined,
            notifiedNewSchemeIds: Array.isArray(parsed.notifiedNewSchemeIds) ? parsed.notifiedNewSchemeIds : [],
            oneTimeAlertDelivered: Boolean(parsed.oneTimeAlertDelivered),
            updatedAt: parsed.updatedAt || new Date().toISOString(),
          };
        }
      }
    }
  } catch {
    // ignore storage errors
  }
  return {
    phoneNumber: '',
    countryCode: '+91',
    enabled: false,
    notifyDeadlines: false,
    notifyNewSchemes: true,
    notifyTrackerUpdates: false,
    preferredLang: 'pa',
    subscribedSchemeIds: [],
    notifiedNewSchemeIds: [],
    oneTimeAlertDelivered: false,
    updatedAt: new Date().toISOString(),
  };
}

export function savePhoneAlertSubscription(sub: PhoneAlertSubscription): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(PHONE_SUB_STORAGE_KEY, JSON.stringify(sub));
    }
  } catch {
    // ignore storage errors
  }
}

export function loadPhoneAlertInbox(): SentPhoneAlertMessage[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(PHONE_INBOX_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

export function recordSentPhoneAlert(msg: SentPhoneAlertMessage): SentPhoneAlertMessage[] {
  const existing = loadPhoneAlertInbox();
  // Deduplicate by schemeId + phoneNumber so inbox never has duplicate messages for the same scheme
  const filtered = existing.filter(
    (item) => !(item.schemeId === msg.schemeId && item.phoneNumber === msg.phoneNumber)
  );
  const updated = [msg, ...filtered].slice(0, 10);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(PHONE_INBOX_STORAGE_KEY, JSON.stringify(updated));
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('janshayak:phone-alert-sent', { detail: msg }));
    }
  } catch {
    // ignore
  }
  return updated;
}

/**
 * Dispatches a scheme alert SMS ONLY when:
 * 1. It is a NEW scheme arriving on the website (`alertType === 'new_scheme'`).
 * 2. The user has LOGGED IN to our website (`isLoggedIn === true`).
 * 3. The user has NOT already received their 1-time alert (`1 bar message jana chihada`).
 */
export async function dispatchSchemeAlertToPhone(params: {
  phoneNumber: string;
  scheme: Pick<
    Scheme,
    | 'id'
    | 'titleEn'
    | 'titlePa'
    | 'titleHi'
    | 'benefitAmountText'
    | 'applicationDeadline'
    | 'officialPortalUrl'
  > &
    Partial<Pick<Scheme, 'descriptionEn' | 'descriptionPa' | 'descriptionHi' | 'minAge' | 'maxAge' | 'maxIncome' | 'requiredDocuments' | 'applicationSteps'>>;
  alertType: SentPhoneAlertMessage['alertType'];
  language: Language;
  daysLeft?: number;
  trackerStageLabel?: string;
  triggeredBy?: SentPhoneAlertMessage['triggeredBy'];
  loggedInUserId?: string | null;
  loggedInUserEmail?: string | null;
}): Promise<{ ok: boolean; message?: SentPhoneAlertMessage; error?: string; skippedReason?: string }> {
  // RULE 1: Only send message when a NEW scheme arrives on the website
  if (params.alertType !== 'new_scheme') {
    return {
      ok: false,
      skippedReason: 'only_new_scheme_allowed',
      error:
        params.language === 'pa'
          ? 'ਮੈਸੇਜ ਸਿਰਫ਼ ਉਦੋਂ ਹੀ ਜਾਂਦਾ ਹੈ ਜਦੋਂ ਵੈੱਬਸਾਈਟ ਵਿੱਚ ਕੋਈ ਨਵੀਂ ਸਕੀਮ (New Scheme) ਆਉਂਦੀ ਹੈ।'
          : params.language === 'hi'
            ? 'संदेश केवल तभी भेजा जाता है जब वेबसाइट पर कोई नई योजना (New Scheme) आती है।'
            : 'SMS alert is only dispatched when a new scheme arrives on the website.',
    };
  }

  // RULE 2: Only send to a user who has LOGGED IN to our website
  const activeAuth = getActiveLoggedInUser();
  const effectiveUserId = params.loggedInUserId || activeAuth.userId;
  const effectiveUserEmail = params.loggedInUserEmail || activeAuth.email;

  if (!effectiveUserId) {
    return {
      ok: false,
      skippedReason: 'login_required',
      error:
        params.language === 'pa'
          ? '🔒 ਸਕੀਮ ਅਲਰਟ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਸਾਡੀ ਵੈੱਬਸਾਈਟ ਵਿੱਚ ਲੌਗਇਨ (Login) ਹੋਣਾ ਲਾਜ਼ਮੀ ਹੈ। ਸਿਰਫ਼ ਲੌਗਇਨ ਕੀਤੇ ਯੂਜ਼ਰ ਨੂੰ ਹੀ ਨਵੀਂ ਸਕੀਮ ਦਾ ਮੈਸੇਜ ਜਾਂਦਾ ਹੈ।'
          : params.language === 'hi'
            ? '🔒 योजना अलर्ट प्राप्त करने के लिए हमारी वेबसाइट में लॉगिन (Login) होना आवश्यक है।'
            : '🔒 You must be logged into our website to receive the 1-time New Scheme SMS alert.',
    };
  }

  // RULE 3: Strictly 1 time only ("te schme alert vich bas user nu 1 bar message jana chihada")
  if (hasUserAlreadyReceivedOneTimeAlert(effectiveUserId, params.scheme.id)) {
    return {
      ok: false,
      skippedReason: 'already_sent_once',
      error:
        params.language === 'pa'
          ? '✅ ਤੁਹਾਨੂੰ ਨਵੀਂ ਸਕੀਮ ਦਾ 1 ਵਾਰ (One-Time) ਅਲਰਟ ਮੈਸੇਜ ਪਹਿਲਾਂ ਹੀ ਭੇਜਿਆ ਜਾ ਚੁੱਕਾ ਹੈ (ਦੁਬਾਰਾ ਮੈਸੇਜ ਨਹੀਂ ਭੇਜਿਆ ਜਾਵੇਗਾ)।'
          : params.language === 'hi'
            ? '✅ आपको नई योजना का 1 बार (One-Time) अलर्ट संदेश पहले ही भेजा जा चुका है।'
            : '✅ Your 1-time New Scheme SMS alert has already been delivered once (no duplicate messages).',
    };
  }

  const norm = normalizeIndianPhoneNumber(params.phoneNumber);
  if (!norm.isValid) {
    return {
      ok: false,
      error:
        params.language === 'pa'
          ? norm.errorPa
          : params.language === 'hi'
            ? norm.errorHi
            : norm.errorEn,
    };
  }

  // Immediately lock so no second message can ever be sent
  markOneTimeAlertDelivered(effectiveUserId, params.scheme.id);

  // Also persist on the subscription object
  const sub = loadPhoneAlertSubscription();
  const nextNotified = Array.from(new Set([...(sub.notifiedNewSchemeIds || []), params.scheme.id]));
  savePhoneAlertSubscription({
    ...sub,
    phoneNumber: norm.digits10,
    loggedInUserId: effectiveUserId,
    loggedInUserEmail: effectiveUserEmail || sub.loggedInUserEmail,
    notifiedNewSchemeIds: nextNotified,
    oneTimeAlertDelivered: true,
    updatedAt: new Date().toISOString(),
  });

  const triggeredBy = params.triggeredBy || 'AI Autonomous Engine';
  const aiSmsCode = generateAiAdminSmsCode(`${params.scheme.id}-${effectiveUserId}`);

  const smsBody = buildSchemePhoneAlertText({
    scheme: params.scheme,
    alertType: 'new_scheme',
    language: params.language,
    daysLeft: params.daysLeft,
    trackerStageLabel: params.trackerStageLabel,
    aiSmsCode,
    triggeredBy,
  });

  const inWebsiteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?scheme=${encodeURIComponent(params.scheme.id)}`
      : `/?scheme=${encodeURIComponent(params.scheme.id)}`;
  const whatsappUrl = `https://wa.me/91${norm.digits10}?text=${encodeURIComponent(smsBody)}`;
  const smsDeviceUri = `sms:+91${norm.digits10}?body=${encodeURIComponent(smsBody)}`;
  const schemeTitle =
    params.language === 'pa'
      ? params.scheme.titlePa || params.scheme.titleEn
      : params.language === 'hi'
        ? params.scheme.titleHi || params.scheme.titleEn
        : params.scheme.titleEn;

  let deliveryStatus: SentPhoneAlertMessage['deliveryStatus'] = 'Delivered Once (1-Time Only)';

  try {
    const res = await fetch('/api/alerts/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: norm.digits10,
        e164: norm.e164,
        userId: effectiveUserId,
        schemeId: params.scheme.id,
        schemeTitle,
        alertType: 'new_scheme',
        triggeredBy,
        aiSmsCode,
        language: params.language,
        smsBody,
        oneTimeOnly: true,
      }),
    });
    if (!res.ok) {
      deliveryStatus = 'Queued Offline';
    }
  } catch {
    deliveryStatus = 'Queued Offline';
  }

  const sentMsg: SentPhoneAlertMessage = {
    id: `sms-once-${params.scheme.id}-${Date.now()}`,
    phoneNumber: norm.digits10,
    formattedPhone: norm.display,
    userId: effectiveUserId,
    userEmail: effectiveUserEmail || undefined,
    schemeId: params.scheme.id,
    schemeTitle,
    alertType: 'new_scheme',
    triggeredBy,
    aiSmsCode,
    smsBody,
    inWebsiteUrl,
    whatsappUrl,
    smsDeviceUri,
    sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    deliveryStatus,
  };

  recordSentPhoneAlert(sentMsg);

  try {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`🆕 1-Time New Scheme Alert (${aiSmsCode}) → ${norm.display}`, {
        body: smsBody,
        icon: '/janshayak-ai-logo.svg',
      });
    }
  } catch {
    // ignore
  }

  return { ok: true, message: sentMsg };
}
