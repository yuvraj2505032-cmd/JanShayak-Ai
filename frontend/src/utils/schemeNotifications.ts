import { ApplicationTrackerItem, Language, Scheme } from '../types/scheme';
import {
  getUpcomingSavedSchemeDeadlines,
  UpcomingSchemeDeadline,
} from './deadlineAlerts';

export type SchemeNotificationType = 'deadline_approaching' | 'status_change';
export type SchemeNotificationUrgency = 'critical' | 'urgent' | 'upcoming' | 'info' | 'success';

export interface SchemeNotificationItem {
  id: string;
  schemeId: string;
  type: SchemeNotificationType;
  urgency: SchemeNotificationUrgency;
  titleEn: string;
  titlePa: string;
  titleHi: string;
  messageEn: string;
  messagePa: string;
  messageHi: string;
  benefitAmountText?: string;
  daysRemaining?: number;
  deadlineDateFormattedEn?: string;
  deadlineDateFormattedPa?: string;
  deadlineDateFormattedHi?: string;
  previousStatus?: ApplicationTrackerItem['status'];
  newStatus?: ApplicationTrackerItem['status'];
  createdAt: string;
  read: boolean;
}

export function formatTrackerStatusLabel(
  status: ApplicationTrackerItem['status'],
  lang: Language
): string {
  switch (status) {
    case 'Documents Assembled':
      return lang === 'pa'
        ? 'ਦਸਤਾਵੇਜ਼ ਤਿਆਰ (Documents Ready)'
        : lang === 'hi'
          ? 'दस्तावेज़ तैयार (Documents Ready)'
          : 'Documents Ready';
    case 'Form Submitted':
      return lang === 'pa'
        ? 'ਅਪਲਾਈ ਕੀਤਾ (Applied)'
        : lang === 'hi'
          ? 'आवेदन जमा (Applied)'
          : 'Applied (Form Submitted)';
    case 'Approved':
      return lang === 'pa'
        ? 'ਮਨਜ਼ੂਰ ਹੋਇਆ (Approved)'
        : lang === 'hi'
          ? 'स्वीकृत (Approved)'
          : 'Approved';
    case 'Disbursed':
      return lang === 'pa'
        ? 'ਪੈਸੇ ਖਾਤੇ ਵਿੱਚ ਆਏ (DBT Disbursed)'
        : lang === 'hi'
          ? 'राशि खाते में प्राप्त (DBT Disbursed)'
          : 'DBT Disbursed';
    case 'Discovered':
    default:
      return lang === 'pa'
        ? 'ਚੁਣਿਆ ਗਿਆ (Discovered)'
        : lang === 'hi'
          ? 'चयनित (Discovered)'
          : 'Discovered';
  }
}

/**
 * Generates notifications for all saved schemes that have an application deadline approaching within `windowDays` (default 30 days).
 */
export function buildSavedSchemeDeadlineNotifications(
  schemes: Scheme[],
  savedSchemeIds: Set<string> | string[],
  referenceDate: Date = new Date(),
  windowDays = 30
): SchemeNotificationItem[] {
  const upcomingDeadlines: UpcomingSchemeDeadline[] = getUpcomingSavedSchemeDeadlines(
    schemes,
    savedSchemeIds,
    referenceDate,
    windowDays
  );

  return upcomingDeadlines.map((item) => {
    const days = item.daysRemaining;
    const daysTextEn =
      days === 0
        ? 'Closes Today!'
        : days === 1
          ? '1 Day Left'
          : `${days} Days Left`;
    const daysTextPa =
      days === 0
        ? 'ਅੱਜ ਆਖਰੀ ਦਿਨ!'
        : days === 1
          ? '1 ਦਿਨ ਬਾਕੀ'
          : `${days} ਦਿਨ ਬਾਕੀ`;
    const daysTextHi =
      days === 0
        ? 'आज अंतिम दिन!'
        : days === 1
          ? '1 दिन शेष'
          : `${days} दिन शेष`;

    return {
      id: `notif-deadline-${item.scheme.id}-${item.deadlineDateIso}`,
      schemeId: item.scheme.id,
      type: 'deadline_approaching',
      urgency: item.urgency,
      titleEn: `Deadline Approaching (${daysTextEn}): ${item.scheme.titleEn}`,
      titlePa: `ਆਖਰੀ ਮਿਤੀ ਨੇੜੇ (${daysTextPa}): ${item.scheme.titlePa || item.scheme.titleEn}`,
      titleHi: `अंतिम तिथि नजदीक (${daysTextHi}): ${item.scheme.titleHi || item.scheme.titleEn}`,
      messageEn: `${item.milestoneLabelEn} — Submit before ${item.formattedDateEn} to claim ${item.scheme.benefitAmountText}.`,
      messagePa: `${item.milestoneLabelPa} — ${item.formattedDatePa} ਤੋਂ ਪਹਿਲਾਂ ਅਰਜ਼ੀ ਪੂਰੀ ਕਰੋ (${item.scheme.benefitAmountText})।`,
      messageHi: `${item.milestoneLabelHi} — ${item.formattedDateHi} से पहले आवेदन पूरा करें (${item.scheme.benefitAmountText})।`,
      benefitAmountText: item.scheme.benefitAmountText,
      daysRemaining: days,
      deadlineDateFormattedEn: item.formattedDateEn,
      deadlineDateFormattedPa: item.formattedDatePa,
      deadlineDateFormattedHi: item.formattedDateHi,
      createdAt: item.formattedDateEn,
      read: false,
    };
  });
}

/**
 * Creates a notification item when a saved or tracked scheme's application status changes.
 */
export function createStatusChangeNotification(params: {
  schemeId: string;
  schemeTitleEn: string;
  schemeTitlePa?: string;
  schemeTitleHi?: string;
  benefitAmountText?: string;
  previousStatus?: ApplicationTrackerItem['status'];
  newStatus: ApplicationTrackerItem['status'];
  createdAt?: string;
  id?: string;
}): SchemeNotificationItem {
  const titlePa = params.schemeTitlePa || params.schemeTitleEn;
  const titleHi = params.schemeTitleHi || params.schemeTitleEn;

  const newStageEn = formatTrackerStatusLabel(params.newStatus, 'en');
  const newStagePa = formatTrackerStatusLabel(params.newStatus, 'pa');
  const newStageHi = formatTrackerStatusLabel(params.newStatus, 'hi');

  const prevStageEn = params.previousStatus
    ? formatTrackerStatusLabel(params.previousStatus, 'en')
    : null;
  const prevStagePa = params.previousStatus
    ? formatTrackerStatusLabel(params.previousStatus, 'pa')
    : null;
  const prevStageHi = params.previousStatus
    ? formatTrackerStatusLabel(params.previousStatus, 'hi')
    : null;

  const urgency: SchemeNotificationUrgency =
    params.newStatus === 'Approved' || params.newStatus === 'Disbursed'
      ? 'success'
      : 'info';

  const transitionEn = prevStageEn
    ? `Status changed from "${prevStageEn}" to "${newStageEn}".`
    : `Application tracking status updated to "${newStageEn}".`;
  const transitionPa = prevStagePa
    ? `ਸਥਿਤੀ "${prevStagePa}" ਤੋਂ ਬਦਲ ਕੇ "${newStagePa}" ਹੋ ਗਈ ਹੈ।`
    : `ਅਰਜ਼ੀ ਦੀ ਸਥਿਤੀ "${newStagePa}" ਵਜੋਂ ਅਪਡੇਟ ਹੋ ਗਈ ਹੈ।`;
  const transitionHi = prevStageHi
    ? `स्थिति "${prevStageHi}" से बदलकर "${newStageHi}" हो गई है।`
    : `आवेदन की स्थिति "${newStageHi}" पर अपडेट हो गई है।`;

  const nextActionEn =
    params.newStatus === 'Discovered'
      ? 'Next step: Assemble required documents in Document Checklist.'
      : params.newStatus === 'Documents Assembled'
        ? 'Next step: Submit your application on the official .gov.in portal or Sewa Kendra.'
        : params.newStatus === 'Form Submitted'
          ? 'Keep your application reference number saved for verification.'
          : params.newStatus === 'Approved'
            ? 'Your application is approved! Ensure Aadhaar-bank NPCI seeding is active for DBT.'
            : 'Direct Benefit Transfer (DBT) has been disbursed to your linked bank account.';

  const nextActionPa =
    params.newStatus === 'Discovered'
      ? 'ਅਗਲਾ ਕਦਮ: ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼ ਤਿਆਰ ਕਰੋ।'
      : params.newStatus === 'Documents Assembled'
        ? 'ਅਗਲਾ ਕਦਮ: ਅਧਿਕਾਰਤ ਪੋਰਟਲ ਜਾਂ ਸੇਵਾ ਕੇਂਦਰ ਰਾਹੀਂ ਫਾਰਮ ਜਮ੍ਹਾਂ ਕਰੋ।'
        : params.newStatus === 'Form Submitted'
          ? 'ਆਪਣਾ ਅਰਜ਼ੀ ਰੈਫਰੈਂਸ ਨੰਬਰ ਸੰਭਾਲ ਕੇ ਰੱਖੋ।'
          : params.newStatus === 'Approved'
            ? 'ਤੁਹਾਡੀ ਅਰਜ਼ੀ ਮਨਜ਼ੂਰ ਹੋ ਗਈ ਹੈ! DBT ਲਈ ਬੈਂਕ ਖਾਤਾ ਆਧਾਰ ਨਾਲ ਲਿੰਕ ਰੱਖੋ।'
            : 'ਲਾਭ ਰਾਸ਼ੀ (DBT) ਤੁਹਾਡੇ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਭੇਜ ਦਿੱਤੀ ਗਈ ਹੈ।';

  const nextActionHi =
    params.newStatus === 'Discovered'
      ? 'अगला कदम: आवश्यक दस्तावेज़ तैयार करें।'
      : params.newStatus === 'Documents Assembled'
        ? 'अगला कदम: आधिकारिक पोर्टल या सेवा केंद्र पर फॉर्म जमा करें।'
        : params.newStatus === 'Form Submitted'
          ? 'अपना आवेदन संदर्भ नंबर सुरक्षित रखें।'
          : params.newStatus === 'Approved'
            ? 'आपका आवेदन स्वीकृत हो गया है! डीबीटी के लिए बैंक खाता आधार से लिंक रखें।'
            : 'लाभ राशि (DBT) आपके बैंक खाते में भेज दी गई है।';

  return {
    id: params.id || `notif-status-${params.schemeId}-${params.newStatus.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    schemeId: params.schemeId,
    type: 'status_change',
    urgency,
    titleEn: `Status Updated (${newStageEn}): ${params.schemeTitleEn}`,
    titlePa: `ਸਥਿਤੀ ਅਪਡੇਟ (${newStagePa}): ${titlePa}`,
    titleHi: `स्थिति अपडेट (${newStageHi}): ${titleHi}`,
    messageEn: `${transitionEn} ${nextActionEn}`,
    messagePa: `${transitionPa} ${nextActionPa}`,
    messageHi: `${transitionHi} ${nextActionHi}`,
    benefitAmountText: params.benefitAmountText,
    previousStatus: params.previousStatus,
    newStatus: params.newStatus,
    createdAt:
      params.createdAt ||
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
  };
}

/**
 * Merges saved scheme deadline notifications and status-change notifications,
 * applying read and dismissed state and sorting unread/critical alerts first.
 */
export function mergeAndSortNotifications(
  deadlineNotifications: SchemeNotificationItem[],
  statusNotifications: SchemeNotificationItem[],
  readIds: Set<string> | string[] = [],
  dismissedIds: Set<string> | string[] = []
): SchemeNotificationItem[] {
  const readSet = readIds instanceof Set ? readIds : new Set(readIds);
  const dismissedSet =
    dismissedIds instanceof Set ? dismissedIds : new Set(dismissedIds);

  const combined = [...statusNotifications, ...deadlineNotifications]
    .filter((item) => !dismissedSet.has(item.id))
    .map((item) => ({
      ...item,
      read: item.read || readSet.has(item.id),
    }));

  const urgencyWeight: Record<SchemeNotificationUrgency, number> = {
    critical: 5,
    success: 4,
    urgent: 3,
    info: 2,
    upcoming: 1,
  };

  return combined.sort((a, b) => {
    if (a.read !== b.read) {
      return a.read ? 1 : -1;
    }
    const weightDiff = urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
    if (weightDiff !== 0) return weightDiff;
    if (typeof a.daysRemaining === 'number' && typeof b.daysRemaining === 'number') {
      return a.daysRemaining - b.daysRemaining;
    }
    return 0;
  });
}

export function countUnreadNotifications(
  notifications: SchemeNotificationItem[]
): {
  total: number;
  unread: number;
  deadlineCount: number;
  statusChangeCount: number;
  criticalCount: number;
} {
  let unread = 0;
  let deadlineCount = 0;
  let statusChangeCount = 0;
  let criticalCount = 0;

  for (const n of notifications) {
    if (!n.read) unread++;
    if (n.type === 'deadline_approaching') deadlineCount++;
    if (n.type === 'status_change') statusChangeCount++;
    if (!n.read && (n.urgency === 'critical' || n.urgency === 'urgent')) {
      criticalCount++;
    }
  }

  return {
    total: notifications.length,
    unread,
    deadlineCount,
    statusChangeCount,
    criticalCount,
  };
}
