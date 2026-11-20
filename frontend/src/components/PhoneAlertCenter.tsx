import React, { useState, useEffect } from 'react';
import { Language, Scheme } from '../types/scheme';
import { GOV_SCHEMES } from '../data/schemes';
import {
  PhoneAlertSubscription,
  SentPhoneAlertMessage,
  loadPhoneAlertSubscription,
  savePhoneAlertSubscription,
  loadPhoneAlertInbox,
  normalizeIndianPhoneNumber,
  dispatchSchemeAlertToPhone,
  getActiveLoggedInUser,
  hasUserAlreadyReceivedOneTimeAlert,
} from '../utils/phoneAlertService';
import {
  Smartphone,
  BellRing,
  CheckCircle2,
  Bot,
  ShieldCheck,
  AlertCircle,
  BookOpen,
  Lock,
  X,
} from 'lucide-react';

interface PhoneAlertCenterProps {
  currentLang: Language;
  schemes?: Scheme[];
  compact?: boolean;
  isAdminMode?: boolean;
  onOpenSchemeModal?: (scheme: Scheme) => void;
}

export const PhoneAlertCenter: React.FC<PhoneAlertCenterProps> = ({
  currentLang,
  schemes = GOV_SCHEMES,
  compact = false,
  isAdminMode = false,
  onOpenSchemeModal,
}) => {
  const [subscription, setSubscription] = useState<PhoneAlertSubscription>(() =>
    loadPhoneAlertSubscription()
  );
  const [phoneInput, setPhoneInput] = useState<string>(() => subscription.phoneNumber || '');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [inbox, setInbox] = useState<SentPhoneAlertMessage[]>(() => loadPhoneAlertInbox());
  const [activeToast, setActiveToast] = useState<SentPhoneAlertMessage | null>(null);
  const [authInfo, setAuthInfo] = useState(() => getActiveLoggedInUser());

  // Admin-only broadcast controls (hidden from regular users)
  const [adminSelectedSchemeId, setAdminSelectedSchemeId] = useState<string>(
    () => schemes[0]?.id || 'pm-kisan'
  );
  const [isAdminDispatching, setIsAdminDispatching] = useState(false);

  useEffect(() => {
    const refreshAuthAndInbox = (event?: Event) => {
      setAuthInfo(getActiveLoggedInUser());
      const refreshedSub = loadPhoneAlertSubscription();
      setSubscription(refreshedSub);
      if (refreshedSub.phoneNumber && !phoneInput) {
        setPhoneInput(refreshedSub.phoneNumber);
      }
      setInbox(loadPhoneAlertInbox());
      if (event && 'detail' in event) {
        const customEvent = event as CustomEvent<SentPhoneAlertMessage>;
        if (customEvent.detail) {
          setActiveToast(customEvent.detail);
        }
      }
    };

    window.addEventListener('janshayak:phone-alert-sent', refreshAuthAndInbox);
    window.addEventListener('janshayak:auth-changed', refreshAuthAndInbox);
    return () => {
      window.removeEventListener('janshayak:phone-alert-sent', refreshAuthAndInbox);
      window.removeEventListener('janshayak:auth-changed', refreshAuthAndInbox);
    };
  }, [phoneInput]);

  const handleOpenInWebsiteScheme = (schemeId?: string) => {
    const found =
      schemes.find((s) => s.id === schemeId) ||
      GOV_SCHEMES.find((s) => s.id === schemeId) ||
      schemes[0] ||
      GOV_SCHEMES[0];
    if (!found) return;

    if (onOpenSchemeModal) {
      onOpenSchemeModal(found);
      return;
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('janshayak:open-inwebsite-scheme', { detail: found }));
    }
  };

  // Citizen registers their phone number -> Armed ONLY for logged-in user, triggers ONLY ONCE when a new scheme arrives
  const handleSaveSubscription = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const currentAuth = getActiveLoggedInUser();
    setAuthInfo(currentAuth);

    if (!currentAuth.isLoggedIn || !currentAuth.userId) {
      setStatusMessage({
        type: 'error',
        text:
          currentLang === 'pa'
            ? '🔒 ਨਵੀਂ ਸਕੀਮ ਦਾ SMS ਅਲਰਟ ਸਿਰਫ਼ ਸਾਡੀ ਵੈੱਬਸਾਈਟ ਵਿੱਚ ਲੌਗਇਨ (Login) ਕੀਤੇ ਯੂਜ਼ਰ ਨੂੰ ਹੀ ਜਾਂਦਾ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਪਹਿਲਾਂ ਵੈੱਬਸਾਈਟ ਵਿੱਚ Login ਕਰੋ।'
            : currentLang === 'hi'
              ? '🔒 नई योजना का SMS अलर्ट केवल हमारी वेबसाइट में लॉगिन (Login) किए गए यूज़र को ही भेजा जाता है। कृपया पहले वेबसाइट में Login करें।'
              : '🔒 New Scheme SMS alerts are only sent to users logged into our website. Please log in to your website account first.',
      });
      return;
    }

    const norm = normalizeIndianPhoneNumber(phoneInput);
    if (!norm.isValid) {
      setStatusMessage({
        type: 'error',
        text:
          currentLang === 'pa'
            ? norm.errorPa || 'ਸਹੀ 10-ਅੰਕਾਂ ਦਾ ਫ਼ੋਨ ਨੰਬਰ ਭਰੋ'
            : currentLang === 'hi'
              ? norm.errorHi || 'सही 10-अंकीय मोबाइल नंबर दर्ज करें'
              : norm.errorEn || 'Enter a valid 10-digit phone number',
      });
      return;
    }

    const updated: PhoneAlertSubscription = {
      ...subscription,
      phoneNumber: norm.digits10,
      enabled: true,
      notifyDeadlines: false,
      notifyNewSchemes: true,
      notifyTrackerUpdates: false,
      preferredLang: currentLang,
      loggedInUserId: currentAuth.userId,
      loggedInUserEmail: currentAuth.email || undefined,
      updatedAt: new Date().toISOString(),
    };
    setSubscription(updated);
    savePhoneAlertSubscription(updated);

    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } catch {
      // ignore
    }

    setStatusMessage({
      type: 'success',
      text:
        currentLang === 'pa'
          ? `✅ ਲੌਗਇਨ ਯੂਜ਼ਰ (${currentAuth.email || 'Active Account'}) ਲਈ ਫ਼ੋਨ ਨੰਬਰ (${norm.display}) ਸੇਵ ਹੋ ਗਿਆ ਹੈ! ਹੁਣ ਜਦੋਂ ਵੀ ਸਾਡੀ ਵੈੱਬਸਾਈਟ ਵਿੱਚ ਕੋਈ ਨਵੀਂ ਸਕੀਮ (New Scheme) ਆਵੇਗੀ, ਤਾਂ ਸਿਰਫ਼ 1 ਵਾਰ (One-Time Only) ਤੁਹਾਨੂੰ ਪੂਰੀ ਜਾਣਕਾਰੀ ਵਾਲਾ ਮੈਸੇਜ ਆਵੇਗਾ — Google ਤੇ ਜਾਣ ਦੀ ਲੋੜ ਨਹੀਂ ਪਵੇਗੀ।`
          : currentLang === 'hi'
            ? `✅ लॉगिन यूज़र (${currentAuth.email || 'Active Account'}) के लिए नंबर (${norm.display}) सेव हो गया है! जब भी हमारी वेबसाइट पर कोई नई योजना आएगी, तो केवल 1 बार (One-Time Only) आपको पूरी जानकारी वाला SMS आएगा।`
            : `✅ Phone (${norm.display}) linked to your logged-in account! You will receive strictly 1 message (One-Time Only) when a new scheme arrives on our website, with 100% scheme details inside our website (no Google needed).`,
    });
  };

  // Admin-only broadcast trigger for a New Scheme (only sends once to logged-in user)
  const handleAdminBroadcastNewSchemeSms = async () => {
    const currentAuth = getActiveLoggedInUser();
    const effectiveUserId = currentAuth.userId || (isAdminMode ? 'admin-authenticated-user' : null);
    if (!effectiveUserId) {
      setStatusMessage({
        type: 'error',
        text: '🔒 No logged-in website user found. SMS alerts only go to users logged into the website.',
      });
      return;
    }

    const targetPhone = phoneInput || subscription.phoneNumber || '9876543210';
    const norm = normalizeIndianPhoneNumber(targetPhone);
    if (!norm.isValid) return;

    const targetScheme = schemes.find((s) => s.id === adminSelectedSchemeId) || schemes[0] || GOV_SCHEMES[0];
    setIsAdminDispatching(true);
    const res = await dispatchSchemeAlertToPhone({
      phoneNumber: norm.digits10,
      scheme: targetScheme,
      alertType: 'new_scheme',
      language: currentLang,
      triggeredBy: 'Admin Broadcast',
      loggedInUserId: effectiveUserId,
      loggedInUserEmail: currentAuth.email,
    });
    setIsAdminDispatching(false);

    if (!res.ok && res.error) {
      setStatusMessage({ type: 'error', text: res.error });
    } else if (res.ok && res.message) {
      setStatusMessage({
        type: 'success',
        text:
          currentLang === 'pa'
            ? `📲 ਨਵੀਂ ਸਕੀਮ (${res.message.schemeTitle}) ਦਾ 1-ਵਾਰ ਵਾਲਾ ਅਲਰਟ ਲੌਗਇਨ ਯੂਜ਼ਰ ਨੂੰ ਭੇਜ ਦਿੱਤਾ ਗਿਆ ਹੈ!`
            : `📲 1-Time New Scheme Alert (${res.message.schemeTitle}) dispatched to logged-in user!`,
      });
    }
  };

  const alreadyDeliveredOnce =
    authInfo.userId && schemes[0]
      ? hasUserAlreadyReceivedOneTimeAlert(authInfo.userId, schemes[0].id) || Boolean(subscription.oneTimeAlertDelivered)
      : Boolean(subscription.oneTimeAlertDelivered);

  return (
    <div
      data-testid="phone-scheme-alert-center"
      className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 p-4 sm:p-6 text-white shadow-lg space-y-4"
    >
      {/* Live Auto-Dispatched 1-Time New Scheme SMS Toast */}
      {activeToast && (
        <div
          data-testid="phone-sms-live-toast"
          className="rounded-2xl border-2 border-emerald-400 bg-slate-950/95 p-4 shadow-2xl space-y-3 animate-in fade-in"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-black">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">
                    {currentLang === 'pa'
                      ? `🆕 ਨਵੀਂ ਸਕੀਮ 1-ਵਾਰ SMS ਅਲਰਟ • ${activeToast.formattedPhone}`
                      : currentLang === 'hi'
                        ? `🆕 नई योजना 1-बार SMS अलर्ट • ${activeToast.formattedPhone}`
                        : `🆕 1-Time New Scheme SMS Alert • ${activeToast.formattedPhone}`}
                  </span>
                  <span className="rounded-md bg-amber-400 text-slate-950 px-2 py-0.5 text-[10px] font-black font-mono">
                    {activeToast.aiSmsCode}
                  </span>
                  <span className="rounded-md bg-teal-500/30 border border-teal-400/40 text-teal-200 px-2 py-0.5 text-[10px] font-extrabold">
                    1-Time Only (1 ਵਾਰ)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {activeToast.sentAt} • {activeToast.triggeredBy} • {activeToast.deliveryStatus}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
              aria-label="Close SMS preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <pre className="whitespace-pre-wrap rounded-xl bg-slate-900/90 border border-slate-700 p-3 text-xs font-sans text-emerald-100 leading-relaxed">
            {activeToast.smsBody}
          </pre>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-[11px] font-bold text-amber-300">
              {currentLang === 'pa'
                ? '🌐 Google ਤੇ ਜਾਣ ਦੀ ਲੋੜ ਨਹੀਂ — ਪੂਰੀ ਸਕੀਮ ਸਾਡੀ ਵੈੱਬਸਾਈਟ ਵਿੱਚ ਹੀ ਖੋਲ੍ਹੋ:'
                : currentLang === 'hi'
                  ? '🌐 Google पर जाने की ज़रूरत नहीं — पूरी योजना हमारी वेबसाइट में ही खोलें:'
                  : '🌐 No need to visit Google — Open complete scheme encyclopedia inside our website:'}
            </span>
            <button
              type="button"
              data-testid="open-inwebsite-scheme-from-sms-btn"
              onClick={() => {
                handleOpenInWebsiteScheme(activeToast.schemeId);
                setActiveToast(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-2 shadow-sm transition cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>
                {currentLang === 'pa'
                  ? '📖 ਸਾਡੀ ਵੈੱਬਸਾਈਟ ਵਿੱਚ ਪੂਰੀ ਸਕੀਮ ਦੇਖੋ'
                  : currentLang === 'hi'
                    ? '📖 हमारी वेबसाइट में पूरी योजना देखें'
                    : '📖 Open Full Scheme Inside Website'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex flex-wrap items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-extrabold text-emerald-300">
            <Bot className="h-3.5 w-3.5" />
            <span>
              {currentLang === 'pa'
                ? 'ਸਿਰਫ਼ ਲੌਗਇਨ ਯੂਜ਼ਰ ਲਈ • ਨਵੀਂ ਸਕੀਮ ਆਉਣ ਤੇ ਸਿਰਫ਼ 1 ਵਾਰ (1-Time) ਮੈਸੇਜ'
                : currentLang === 'hi'
                  ? 'केवल लॉगिन यूज़र के लिए • नई योजना आने पर केवल 1 बार (1-Time) संदेश'
                  : 'Logged-In Users Only • Strictly 1-Time SMS When a New Scheme Arrives'}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            {currentLang === 'pa'
              ? 'ਨਵੀਂ ਸਕੀਮ ਆਉਣ ਤੇ ਸਿਰਫ਼ 1 ਵਾਰ ਮੈਸੇਜ — ਅਤੇ ਸਕੀਮ ਦੀ ਸਾਰੀ ਜਾਣਕਾਰੀ ਸਾਡੀ ਵੈੱਬਸਾਈਟ ਵਿੱਚ (Google ਦੀ ਲੋੜ ਨਹੀਂ)'
              : currentLang === 'hi'
                ? 'नई योजना आने पर केवल 1 बार संदेश — और योजना की पूरी जानकारी हमारी वेबसाइट में (Google की ज़रूरत नहीं)'
                : '1-Time SMS Only When a New Scheme Arrives — 100% Scheme Details Inside Our Website (No Google Needed)'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            {currentLang === 'pa'
              ? 'ਜਿਸ ਯੂਜ਼ਰ ਨੇ ਸਾਡੀ ਵੈੱਬਸਾਈਟ ਵਿੱਚ Login ਕੀਤਾ ਹੈ, ਉਸ ਨੂੰ ਸਿਰਫ਼ ਉਦੋਂ ਹੀ 1 ਵਾਰ ਮੈਸੇਜ ਜਾਂਦਾ ਹੈ ਜਦੋਂ ਵੈੱਬਸਾਈਟ ਵਿੱਚ ਕੋਈ ਨਵੀਂ ਸਕੀਮ ਆਉਂਦੀ ਹੈ। ਸਕੀਮਾਂ ਬਾਰੇ ਪਤਾ ਕਰਨ ਲਈ Google ਤੇ ਜਾਣ ਦੀ ਲੋੜ ਨਹੀਂ — ਯੋਗਤਾ, ਕਾਗਜ਼ਾਤ, ਫਾਰਮ ਅਤੇ ਅਪਲਾਈ ਕਰਨ ਦਾ ਪੂਰਾ ਤਰੀਕਾ ਸਾਡੀ ਵੈੱਬਸਾਈਟ ਵਿੱਚ ਹੀ ਮੌਜੂਦ ਹੈ।'
              : currentLang === 'hi'
                ? 'जिस यूज़र ने हमारी वेबसाइट में Login किया है, उसे केवल तभी 1 बार संदेश जाता है जब वेबसाइट पर कोई नई योजना आती है। योजनाओं के बारे में जानने के लिए Google पर जाने की आवश्यकता नहीं है — सब कुछ हमारी वेबसाइट में ही उपलब्ध है।'
                : 'Only users logged into our website receive an alert—and strictly ONCE when a new scheme is added to the website. Everything about every scheme (eligibility, documents, steps, and form guide) lives right inside our website so you never need Google.'}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span
            data-testid="phone-alert-login-status-badge"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold border ${
              authInfo.isLoggedIn
                ? 'bg-emerald-400/20 border-emerald-300/40 text-emerald-200'
                : 'bg-amber-400/20 border-amber-300/40 text-amber-200'
            }`}
          >
            {authInfo.isLoggedIn ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                <span>
                  {currentLang === 'pa'
                    ? `ਲੌਗਇਨ ਐਕਟਿਵ (${authInfo.email || 'Logged In'}) • 1-Time SMS Ready`
                    : `Website Login Active (${authInfo.email || 'Logged In'})`}
                </span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-amber-300" />
                <span>
                  {currentLang === 'pa'
                    ? 'ਵੈੱਬਸਾਈਟ ਲੌਗਇਨ ਲਾਜ਼ਮੀ ਹੈ (Login Required)'
                    : 'Website Login Required for SMS Alert'}
                </span>
              </>
            )}
          </span>

          {subscription.enabled && subscription.phoneNumber && (
            <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/40 px-3.5 py-1.5 text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                {alreadyDeliveredOnce
                  ? currentLang === 'pa'
                    ? '1-ਵਾਰ ਮੈਸੇਜ ਭੇਜਿਆ ਜਾ ਚੁੱਕਾ ਹੈ (1-Time Sent ✓)'
                    : '1-Time New Scheme SMS Delivered ✓'
                  : currentLang === 'pa'
                    ? 'ਨਵੀਂ ਸਕੀਮ ਲਈ ਰਜਿਸਟਰਡ (1-Time Armed)'
                    : 'Armed for Next New Scheme (1-Time)'}
              </div>
              <div className="text-sm font-mono font-black text-white">
                +91 {subscription.phoneNumber}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Citizen Phone Registration Form */}
      <form
        onSubmit={handleSaveSubscription}
        className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 items-end"
      >
        <div className="sm:col-span-7">
          <label
            htmlFor="citizen-alert-phone-input"
            className="block text-[11px] font-bold text-emerald-200 mb-1"
          >
            {currentLang === 'pa'
              ? 'ਲੌਗਇਨ ਯੂਜ਼ਰ ਮੋਬਾਈਲ ਨੰਬਰ (ਨਵੀਂ ਸਕੀਮ ਆਉਣ ਤੇ ਸਿਰਫ਼ 1 ਵਾਰ ਮੈਸੇਜ ਲਈ):'
              : currentLang === 'hi'
                ? 'लॉगिन यूज़र मोबाइल नंबर (नई योजना आने पर केवल 1 बार SMS हेतु):'
                : 'Logged-In User Mobile Number (For 1-Time New Scheme Alert Only):'}
          </label>
          <div className="flex items-center rounded-xl bg-white text-slate-900 border-2 border-emerald-400/60 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-400">
            <span className="bg-slate-100 px-3 py-2.5 text-xs font-extrabold text-slate-700 border-r border-slate-200">
              +91
            </span>
            <input
              id="citizen-alert-phone-input"
              data-testid="citizen-alert-phone-input"
              type="tel"
              inputMode="numeric"
              maxLength={12}
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="9876543210"
              className="w-full px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="sm:col-span-5">
          <button
            type="submit"
            data-testid="activate-phone-alerts-btn"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 px-4 py-2.5 text-xs sm:text-sm font-black text-slate-950 shadow-md transition cursor-pointer"
          >
            <BellRing className="h-4 w-4" />
            <span>
              {currentLang === 'pa'
                ? 'ਨਵੀਂ ਸਕੀਮ 1-Time ਅਲਰਟ ਚਾਲੂ ਕਰੋ'
                : currentLang === 'hi'
                  ? 'नई योजना 1-Time अलर्ट चालू करें'
                  : 'Enable 1-Time New Scheme Alert'}
            </span>
          </button>
        </div>
      </form>

      {/* Admin-Only Broadcast Controls (Only shown inside Admin Console, strictly sends 1-time New Scheme alert to logged-in user) */}
      {isAdminMode && (
        <div
          data-testid="admin-only-sms-broadcast-panel"
          className="rounded-xl bg-slate-950/80 border border-amber-400/40 p-3.5 space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>Admin &amp; AI 1-Time New Scheme SMS Dispatcher (Logged-In Users Only)</span>
            </span>
            <span className="text-[11px] text-emerald-300 font-semibold">
              1 Message Limit Enforced • All Details In-Website
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            <div className="sm:col-span-8">
              <label className="block text-[10px] font-bold text-slate-300 mb-1">
                Select Newly Added Scheme to Notify Logged-In User (Sent Strictly Once):
              </label>
              <select
                value={adminSelectedSchemeId}
                onChange={(e) => setAdminSelectedSchemeId(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-2 text-xs font-bold text-white"
              >
                {schemes.slice(0, 30).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.titleEn} ({s.benefitAmountText})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <button
                type="button"
                data-testid="admin-dispatch-sms-btn"
                disabled={isAdminDispatching}
                onClick={() => void handleAdminBroadcastNewSchemeSms()}
                className="w-full rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3 py-2 transition cursor-pointer"
              >
                {isAdminDispatching ? 'Sending 1-Time Alert...' : '📲 Send 1-Time New Scheme SMS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Feedback */}
      {statusMessage && (
        <div
          data-testid="phone-alert-status-banner"
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/25 border border-emerald-400/50 text-emerald-100'
              : 'bg-rose-500/25 border border-rose-400/50 text-rose-100'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-300 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 1-Time Delivered New Scheme Alert Inbox with Direct In-Website Guide Button (No Google Needed) */}
      {!compact && inbox.length > 0 && (
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center justify-between">
            <span>
              {currentLang === 'pa'
                ? '🆕 ਲੌਗਇਨ ਯੂਜ਼ਰ ਨੂੰ ਭੇਜਿਆ ਗਿਆ 1-ਵਾਰ (One-Time) ਨਵੀਂ ਸਕੀਮ ਅਲਰਟ — ਪੂਰੀ ਜਾਣਕਾਰੀ ਵੈੱਬਸਾਈਟ ਵਿੱਚ:'
                : currentLang === 'hi'
                  ? '🆕 लॉगिन यूज़र को भेजा गया 1-बार (One-Time) नई योजना अलर्ट — पूरी जानकारी वेबसाइट में:'
                  : '🆕 1-Time New Scheme Alert Delivered to Logged-In User — Complete Guide Inside Website:'}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {inbox.slice(0, 1).map((msg) => (
              <div
                key={msg.id}
                className="rounded-xl bg-white/10 border border-white/15 p-3.5 text-xs space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>{msg.formattedPhone}</span>
                    <span className="rounded bg-teal-500/30 border border-teal-400/40 px-1.5 py-0.5 text-[10px] text-teal-200">
                      1-Time Alert ✓
                    </span>
                  </span>
                  <span className="rounded bg-amber-400/20 border border-amber-300/40 px-1.5 py-0.5 text-[10px] font-mono text-amber-200">
                    {msg.aiSmsCode || 'JAN-AI'}
                  </span>
                </div>
                <p className="text-xs text-white font-bold">{msg.schemeTitle}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-slate-300">
                    {currentLang === 'pa'
                      ? '🌐 Google ਤੇ ਜਾਣ ਦੀ ਲੋੜ ਨਹੀਂ — ਸਭ ਕੁਝ ਸਾਡੀ ਵੈੱਬਸਾਈਟ ਵਿੱਚ ਹੈ'
                      : '🌐 No Google needed — 100% details inside our website'}
                  </span>
                  <button
                    type="button"
                    data-testid="inbox-open-inwebsite-scheme-btn"
                    onClick={() => handleOpenInWebsiteScheme(msg.schemeId)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] px-3 py-1.5 transition cursor-pointer"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>
                      {currentLang === 'pa'
                        ? '📖 ਸਾਡੀ ਵੈੱਬਸਾਈਟ ਵਿੱਚ ਪੂਰੀ ਜਾਣਕਾਰੀ ਖੋਲ੍ਹੋ'
                        : currentLang === 'hi'
                          ? '📖 हमारी वेबसाइट में पूरी जानकारी खोलें'
                          : '📖 View Complete Scheme Inside Website'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
