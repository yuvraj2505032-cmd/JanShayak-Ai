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
  updatedAt: string;
}

export interface SentPhoneAlertMessage {
  id: string;
  phoneNumber: string;
  formattedPhone: string;
  schemeId?: string;
  schemeTitle: string;
  alertType: 'deadline' | 'new_scheme' | 'tracker_status' | 'scheme_guide' | 'family_bundle';
  triggeredBy: 'AI Autonomous Engine' | 'Admin Broadcast' | 'AI Tracker Monitor';
  aiSmsCode: string;
  smsBody: string;
  whatsappUrl: string;
  smsDeviceUri: string;
  sentAt: string;
  deliveryStatus: 'Delivered to Phone' | 'Queued Offline';
}

const PHONE_SUB_STORAGE_KEY = 'janshayak_phone_alert_subscription_v1';
const PHONE_INBOX_STORAGE_KEY = 'janshayak_phone_alert_inbox_v1';

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
 * Builds a concise, verified SMS/WhatsApp alert message in Punjabi, Hindi, or English,
 * automatically signed with an AI/Admin SMS verification code.
 */
export function buildSchemePhoneAlertText(params: {
  scheme: Pick<Scheme, 'id' | 'titleEn' | 'titlePa' | 'titleHi' | 'benefitAmountText' | 'applicationDeadline' | 'officialPortalUrl'>;
  alertType: SentPhoneAlertMessage['alertType'];
  language: Language;
  daysLeft?: number;
  trackerStageLabel?: string;
  aiSmsCode?: string;
  triggeredBy?: SentPhoneAlertMessage['triggeredBy'];
}): string {
  const { scheme, alertType, language, daysLeft, trackerStageLabel } = params;
  const smsCode = params.aiSmsCode || generateAiAdminSmsCode(scheme.id);
  const senderTag = params.triggeredBy === 'Admin Broadcast' ? 'Admin Broadcast' : 'AI Auto-Dispatch';
  const title =
    language === 'pa'
      ? scheme.titlePa || scheme.titleEn
      : language === 'hi'
        ? scheme.titleHi || scheme.titleEn
        : scheme.titleEn;

  if (alertType === 'tracker_status') {
    const stage = trackerStageLabel || 'Updated';
    if (language === 'pa') {
      return `📲 [Janshayak AI ਅਰਜ਼ੀ ਅਪਡੇਟ • ${smsCode}]\nਸਕੀਮ: ${title}\nਸਥਿਤੀ: ${stage}\nਲਾਭ: ${scheme.benefitAmountText}\nਪੋਰਟਲ: ${scheme.officialPortalUrl}\n(${senderTag} • ਮੁਫ਼ਤ ਹੈਲਪਲਾਈਨ: 1100)`;
    }
    if (language === 'hi') {
      return `📲 [Janshayak AI आवेदन अपडेट • ${smsCode}]\nयोजना: ${title}\nस्थिति: ${stage}\nलाभ: ${scheme.benefitAmountText}\nपोर्टल: ${scheme.officialPortalUrl}\n(${senderTag} • निःशुल्क हेल्पलाइन: 1100)`;
    }
    return `📲 [Janshayak AI Application Tracker • ${smsCode}]\nScheme: ${title}\nProgress: ${stage}\nBenefit: ${scheme.benefitAmountText}\nOfficial Portal: ${scheme.officialPortalUrl}\n(${senderTag} • Free Helpline: 1100)`;
  }

  if (alertType === 'new_scheme') {
    if (language === 'pa') {
      return `🆕 [AI/Admin ਨਵੀਂ ਸਕੀਮ ਅਲਰਟ • ਕੋਡ: ${smsCode}]\nਸਕੀਮ: ${title}\nਲਾਭ: ${scheme.benefitAmountText}\nਆਖਰੀ ਮਿਤੀ: ${scheme.applicationDeadline}\nਅਧਿਕਾਰਤ ਲਿੰਕ: ${scheme.officialPortalUrl}\nਇਹ ਮੈਸੇਜ Janshayak AI/Admin ਵੱਲੋਂ ਆਪਣੇ ਆਪ ਭੇਜਿਆ ਗਿਆ ਹੈ (ਹੈਲਪਲਾਈਨ 1100)।`;
    }
    if (language === 'hi') {
      return `🆕 [AI/Admin नई सरकारी योजना अलर्ट • कोड: ${smsCode}]\nयोजना: ${title}\nलाभ: ${scheme.benefitAmountText}\nअंतिम तिथि: ${scheme.applicationDeadline}\nआधिकारिक लिंक: ${scheme.officialPortalUrl}\nयह संदेश Janshayak AI/Admin द्वारा स्वतः भेजा गया है (हेल्पलाइन 1100)।`;
    }
    return `🆕 [AI/Admin New Scheme Alert • Code: ${smsCode}]\nScheme: ${title}\nBenefit: ${scheme.benefitAmountText}\nDeadline: ${scheme.applicationDeadline}\nOfficial Link: ${scheme.officialPortalUrl}\nAuto-dispatched by Janshayak AI/Admin (Helpline 1100).`;
  }

  if (alertType === 'scheme_guide' || alertType === 'family_bundle') {
    if (language === 'pa') {
      return `📋 [Janshayak AI ਸੇਵਾ ਕੇਂਦਰ ਗਾਈਡ • ਕੋਡ: ${smsCode}]\nਸਕੀਮ: ${title}\nਲਾਭ: ${scheme.benefitAmountText}\nਅਧਿਕਾਰਤ ਪੋਰਟਲ: ${scheme.officialPortalUrl}\nਜ਼ਰੂਰੀ: ਆਧਾਰ ਕਾਰਡ, ਬੈਂਕ ਪਾਸਬੁੱਕ ਅਤੇ ਰਿਹਾਇਸ਼ ਸਰਟੀਫਿਕੇਟ ਨਾਲ ਨੇੜਲੇ ਸੇਵਾ ਕੇਂਦਰ ਜਾਓ (ਹੈਲਪਲਾਈਨ 1100)।`;
    }
    if (language === 'hi') {
      return `📋 [Janshayak AI सेवा केंद्र गाइड • कोड: ${smsCode}]\nयोजना: ${title}\nलाभ: ${scheme.benefitAmountText}\nआधिकारिक पोर्टल: ${scheme.officialPortalUrl}\nआवश्यक: आधार कार्ड, बैंक पासबुक व निवास प्रमाण पत्र के साथ सेवा केंद्र जाएं (हेल्पलाइन 1100)।`;
    }
    return `📋 [Janshayak AI Sewa Kendra Guide • Code: ${smsCode}]\nScheme: ${title}\nBenefit: ${scheme.benefitAmountText}\nOfficial Portal: ${scheme.officialPortalUrl}\nBring Aadhaar, Bank Passbook & Domicile to nearest Sewa Kendra (Helpline 1100).`;
  }

  // Default: 'deadline'
  const daysNotePa = typeof daysLeft === 'number' ? ` (${daysLeft} ਦਿਨ ਬਾਕੀ)` : '';
  const daysNoteHi = typeof daysLeft === 'number' ? ` (${daysLeft} दिन शेष)` : '';
  const daysNoteEn = typeof daysLeft === 'number' ? ` (${daysLeft} Days Left)` : '';

  if (language === 'pa') {
    return `🚨 [AI/Admin ਡੈੱਡਲਾਈਨ ਅਲਰਟ • ਕੋਡ: ${smsCode}]${daysNotePa}\nਸਕੀਮ: ${title}\nਲਾਭ: ${scheme.benefitAmountText}\nਆਖਰੀ ਮਿਤੀ: ${scheme.applicationDeadline}\nਅਪਲਾਈ ਲਿੰਕ: ${scheme.officialPortalUrl}\nਸੇਵਾ ਕੇਂਦਰ ਹੈਲਪਲਾਈਨ: 1100`;
  }
  if (language === 'hi') {
    return `🚨 [AI/Admin अंतिम तिथि अलर्ट • कोड: ${smsCode}]${daysNoteHi}\nयोजना: ${title}\nलाभ: ${scheme.benefitAmountText}\nअंतिम तिथि: ${scheme.applicationDeadline}\nआवेदन लिंक: ${scheme.officialPortalUrl}\nहेल्पलाइन: 1100`;
  }
  return `🚨 [AI/Admin Deadline Alert • Code: ${smsCode}]${daysNoteEn}\nScheme: ${title}\nBenefit: ${scheme.benefitAmountText}\nCutoff: ${scheme.applicationDeadline}\nApply Online: ${scheme.officialPortalUrl}\nHelpline: 1100`;
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
            notifyDeadlines: parsed.notifyDeadlines !== false,
            notifyNewSchemes: parsed.notifyNewSchemes !== false,
            notifyTrackerUpdates: parsed.notifyTrackerUpdates !== false,
            preferredLang: parsed.preferredLang === 'pa' || parsed.preferredLang === 'hi' ? parsed.preferredLang : 'en',
            subscribedSchemeIds: Array.isArray(parsed.subscribedSchemeIds) ? parsed.subscribedSchemeIds : [],
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
    notifyDeadlines: true,
    notifyNewSchemes: true,
    notifyTrackerUpdates: true,
    preferredLang: 'pa',
    subscribedSchemeIds: ['pm-kisan', 'punjab-post-matric-sc', 'punjab-old-age-pension'],
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
  const updated = [msg, ...existing].slice(0, 25);
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

export async function dispatchSchemeAlertToPhone(params: {
  phoneNumber: string;
  scheme: Pick<Scheme, 'id' | 'titleEn' | 'titlePa' | 'titleHi' | 'benefitAmountText' | 'applicationDeadline' | 'officialPortalUrl'>;
  alertType: SentPhoneAlertMessage['alertType'];
  language: Language;
  daysLeft?: number;
  trackerStageLabel?: string;
  triggeredBy?: SentPhoneAlertMessage['triggeredBy'];
}): Promise<{ ok: boolean; message?: SentPhoneAlertMessage; error?: string }> {
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

  const triggeredBy = params.triggeredBy || 'AI Autonomous Engine';
  const aiSmsCode = generateAiAdminSmsCode(`${params.scheme.id}-${Date.now()}`);

  const smsBody = buildSchemePhoneAlertText({
    scheme: params.scheme,
    alertType: params.alertType,
    language: params.language,
    daysLeft: params.daysLeft,
    trackerStageLabel: params.trackerStageLabel,
    aiSmsCode,
    triggeredBy,
  });

  const whatsappUrl = `https://wa.me/91${norm.digits10}?text=${encodeURIComponent(smsBody)}`;
  const smsDeviceUri = `sms:+91${norm.digits10}?body=${encodeURIComponent(smsBody)}`;
  const schemeTitle =
    params.language === 'pa'
      ? params.scheme.titlePa || params.scheme.titleEn
      : params.language === 'hi'
        ? params.scheme.titleHi || params.scheme.titleEn
        : params.scheme.titleEn;

  let deliveryStatus: SentPhoneAlertMessage['deliveryStatus'] = 'Delivered to Phone';

  try {
    const res = await fetch('/api/alerts/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: norm.digits10,
        e164: norm.e164,
        schemeId: params.scheme.id,
        schemeTitle,
        alertType: params.alertType,
        triggeredBy,
        aiSmsCode,
        language: params.language,
        smsBody,
      }),
    });
    if (!res.ok) {
      deliveryStatus = 'Queued Offline';
    }
  } catch {
    deliveryStatus = 'Queued Offline';
  }

  const sentMsg: SentPhoneAlertMessage = {
    id: `sms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    phoneNumber: norm.digits10,
    formattedPhone: norm.display,
    schemeId: params.scheme.id,
    schemeTitle,
    alertType: params.alertType,
    triggeredBy,
    aiSmsCode,
    smsBody,
    whatsappUrl,
    smsDeviceUri,
    sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    deliveryStatus,
  };

  recordSentPhoneAlert(sentMsg);

  // Trigger browser Notification if permission already granted
  try {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`📱 ${triggeredBy} (${aiSmsCode}) → ${norm.display}`, {
        body: smsBody,
        icon: '/janshayak-ai-logo.svg',
      });
    }
  } catch {
    // ignore
  }

  return { ok: true, message: sentMsg };
}

