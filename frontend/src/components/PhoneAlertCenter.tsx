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
} from '../utils/phoneAlertService';
import {
  Smartphone,
  BellRing,
  CheckCircle2,
  Bot,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';

interface PhoneAlertCenterProps {
  currentLang: Language;
  schemes?: Scheme[];
  compact?: boolean;
  isAdminMode?: boolean;
}

export const PhoneAlertCenter: React.FC<PhoneAlertCenterProps> = ({
  currentLang,
  schemes = GOV_SCHEMES,
  compact = false,
  isAdminMode = false,
}) => {
  const [subscription, setSubscription] = useState<PhoneAlertSubscription>(() =>
    loadPhoneAlertSubscription()
  );
  const [phoneInput, setPhoneInput] = useState<string>(() => subscription.phoneNumber || '');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [inbox, setInbox] = useState<SentPhoneAlertMessage[]>(() => loadPhoneAlertInbox());
  const [activeToast, setActiveToast] = useState<SentPhoneAlertMessage | null>(null);

  // Admin-only broadcast controls (hidden from regular users)
  const [adminSelectedSchemeId, setAdminSelectedSchemeId] = useState<string>(
    () => schemes[0]?.id || 'pm-kisan'
  );
  const [adminAlertType, setAdminAlertType] = useState<SentPhoneAlertMessage['alertType']>('new_scheme');
  const [isAdminDispatching, setIsAdminDispatching] = useState(false);

  useEffect(() => {
    const handleSent = (event: Event) => {
      const customEvent = event as CustomEvent<SentPhoneAlertMessage>;
      const refreshedSub = loadPhoneAlertSubscription();
      setSubscription(refreshedSub);
      if (refreshedSub.phoneNumber && !phoneInput) {
        setPhoneInput(refreshedSub.phoneNumber);
      }
      setInbox(loadPhoneAlertInbox());
      if (customEvent.detail) {
        setActiveToast(customEvent.detail);
      }
    };
    window.addEventListener('janshayak:phone-alert-sent', handleSent);
    return () => window.removeEventListener('janshayak:phone-alert-sent', handleSent);
  }, [phoneInput]);

  // Citizen registers their phone number -> AI Autonomous Engine automatically sends the verification & scheme SMS code!
  const handleSaveSubscription = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      preferredLang: currentLang,
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

    // AI Autonomous Engine automatically dispatches the initial SMS Code & Scheme Alert (User does not manually send it)
    const topScheme = schemes[0] || GOV_SCHEMES[0];
    const autoResult = await dispatchSchemeAlertToPhone({
      phoneNumber: norm.digits10,
      scheme: topScheme,
      alertType: 'new_scheme',
      language: currentLang,
      triggeredBy: 'AI Autonomous Engine',
    });

    const generatedCode = autoResult.message?.aiSmsCode || 'JAN-AI-ACTIVE';
    setStatusMessage({
      type: 'success',
      text:
        currentLang === 'pa'
          ? `🤖 ਤੁਹਾਡਾ ਨੰਬਰ (${norm.display}) ਰਜਿਸਟਰ ਹੋ ਗਿਆ ਹੈ! Janshayak AI ਅਤੇ Admin ਵੱਲੋਂ ਆਟੋਮੈਟਿਕ SMS ਕੋਡ (${generatedCode}) ਅਤੇ ਸਕੀਮ ਅਲਰਟ ਭੇਜ ਦਿੱਤਾ ਗਿਆ ਹੈ।`
          : currentLang === 'hi'
            ? `🤖 आपका नंबर (${norm.display}) पंजीकृत हो गया है! Janshayak AI और Admin द्वारा स्वतः SMS कोड (${generatedCode}) और योजना अलर्ट भेज दिया गया है।`
            : `🤖 Phone (${norm.display}) registered! Janshayak AI & Admin automatically dispatched SMS Code (${generatedCode}) and scheme alert.`,
    });
  };

  // Admin-only broadcast trigger (only rendered when isAdminMode === true)
  const handleAdminBroadcastSms = async () => {
    const targetPhone = phoneInput || subscription.phoneNumber || '9876543210';
    const norm = normalizeIndianPhoneNumber(targetPhone);
    if (!norm.isValid) return;

    const targetScheme = schemes.find((s) => s.id === adminSelectedSchemeId) || schemes[0] || GOV_SCHEMES[0];
    setIsAdminDispatching(true);
    await dispatchSchemeAlertToPhone({
      phoneNumber: norm.digits10,
      scheme: targetScheme,
      alertType: adminAlertType,
      language: currentLang,
      daysLeft: 10,
      triggeredBy: 'Admin Broadcast',
    });
    setIsAdminDispatching(false);
  };

  return (
    <div
      data-testid="phone-scheme-alert-center"
      className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 p-4 sm:p-6 text-white shadow-lg space-y-4"
    >
      {/* Live Auto-Dispatched AI / Admin SMS Toast */}
      {activeToast && (
        <div
          data-testid="phone-sms-live-toast"
          className="rounded-2xl border-2 border-emerald-400 bg-slate-950/95 p-4 shadow-2xl space-y-2.5 animate-in fade-in"
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
                      ? `🤖 AI / Admin ਵੱਲੋਂ ਆਟੋਮੈਟਿਕ SMS ਆਇਆ • ${activeToast.formattedPhone}`
                      : currentLang === 'hi'
                        ? `🤖 AI / Admin द्वारा स्वतः SMS प्राप्त • ${activeToast.formattedPhone}`
                        : `🤖 Auto-Dispatched by ${activeToast.triggeredBy} • ${activeToast.formattedPhone}`}
                  </span>
                  <span className="rounded-md bg-amber-400 text-slate-950 px-2 py-0.5 text-[10px] font-black font-mono">
                    {activeToast.aiSmsCode}
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
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-extrabold text-emerald-300">
            <Bot className="h-3.5 w-3.5" />
            <span>
              {currentLang === 'pa'
                ? 'AI ਅਤੇ Admin ਆਟੋਮੈਟਿਕ SMS ਸਿਸਟਮ (ਯੂਜ਼ਰ ਨੂੰ ਆਪ ਮੈਸੇਜ ਭੇਜਣ ਦੀ ਲੋੜ ਨਹੀਂ)'
                : currentLang === 'hi'
                  ? 'AI व Admin स्वचालित SMS सिस्टम (यूज़र को स्वयं भेजने की आवश्यकता नहीं)'
                  : 'AI & Admin Automatic SMS Dispatch (No Manual User Action Required)'}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            {currentLang === 'pa'
              ? 'ਸਿਰਫ਼ ਆਪਣਾ ਫ਼ੋਨ ਨੰਬਰ ਦਰਜ ਕਰੋ — SMS ਕੋਡ ਅਤੇ ਸਕੀਮ ਅਲਰਟ AI ਤੇ Admin ਆਪਣੇ ਆਪ ਭੇਜਣਗੇ'
              : currentLang === 'hi'
                ? 'केवल अपना फ़ोन नंबर दर्ज करें — SMS कोड और योजना अलर्ट AI व Admin स्वतः भेजेंगे'
                : 'Register Your Phone Number — AI & Admin Automatically Send SMS Codes & Scheme Alerts'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            {currentLang === 'pa'
              ? 'ਮੈਸੇਜ ਅਤੇ ਅਲਰਟ ਕੋਡ ਭੇਜਣ ਦਾ ਪੂਰਾ ਕੰਟਰੋਲ Janshayak AI ਅਤੇ Admin ਕੋਲ ਹੈ। ਜਦੋਂ ਵੀ ਕੋਈ ਨਵੀਂ ਸਕੀਮ ਜੁੜੇਗੀ, ਆਖਰੀ ਮਿਤੀ ਨੇੜੇ ਆਵੇਗੀ ਜਾਂ ਤੁਹਾਡੀ ਅਰਜ਼ੀ ਅੱਗੇ ਵਧੇਗੀ, AI ਆਪਣੇ ਆਪ ਤੁਹਾਡੇ ਫ਼ੋਨ ਤੇ ਮੈਸੇਜ ਭੇਜੇਗਾ।'
              : currentLang === 'hi'
                ? 'संदेश और अलर्ट कोड भेजने का पूरा नियंत्रण Janshayak AI और Admin के पास है। नई योजना जुड़ने या अंतिम तिथि निकट आने पर AI स्वतः आपके फ़ोन पर SMS भेजेगा।'
                : 'SMS codes and scheme notifications are 100% managed and auto-dispatched by Janshayak AI and the Admin Portal whenever new schemes, deadlines, or tracker milestones occur.'}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-300/40 px-3 py-1 text-[11px] font-extrabold text-amber-200">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
            <span>
              {currentLang === 'pa'
                ? 'AI + Admin ਕੰਟਰੋਲ ਐਕਟਿਵ'
                : currentLang === 'hi'
                  ? 'AI + Admin नियंत्रण सक्रिय'
                  : 'AI + Admin Controlled'}
            </span>
          </span>

          {subscription.enabled && subscription.phoneNumber && (
            <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/40 px-3.5 py-1.5 text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                {currentLang === 'pa' ? 'ਰਜਿਸਟਰਡ ਨੰਬਰ (Auto-SMS ON)' : 'Registered Auto-SMS Number'}
              </div>
              <div className="text-sm font-mono font-black text-white">
                +91 {subscription.phoneNumber}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Citizen Phone Registration Form (User only saves phone number; AI & Admin handle all SMS sending) */}
      <form
        onSubmit={(e) => void handleSaveSubscription(e)}
        className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 items-end"
      >
        <div className="sm:col-span-7">
          <label
            htmlFor="citizen-alert-phone-input"
            className="block text-[11px] font-bold text-emerald-200 mb-1"
          >
            {currentLang === 'pa'
              ? 'ਆਪਣਾ 10-ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ (AI ਆਟੋ-SMS ਲਈ):'
              : currentLang === 'hi'
                ? 'अपना 10-अंकीय मोबाइल नंबर दर्ज करें (AI ऑटो-SMS हेतु):'
                : 'Enter Your 10-Digit Mobile Number (For AI & Admin Auto-SMS):'}
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
                ? 'ਨੰਬਰ ਰਜਿਸਟਰ ਕਰੋ (AI ਆਪਣੇ ਆਪ SMS ਭੇਜੇਗਾ)'
                : currentLang === 'hi'
                  ? 'नंबर रजिस्टर करें (AI स्वतः SMS भेजेगा)'
                  : 'Register Number for AI Auto-SMS'}
            </span>
          </button>
        </div>
      </form>

      {/* Admin-Only Broadcast Controls (Only shown inside Admin Console / Admin Mode, NEVER to regular users) */}
      {isAdminMode && (
        <div
          data-testid="admin-only-sms-broadcast-panel"
          className="rounded-xl bg-slate-950/80 border border-amber-400/40 p-3.5 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>Admin &amp; AI Official SMS Broadcast Control</span>
            </span>
            <span className="text-[11px] text-emerald-300 font-semibold">
              Authorized Admin / AI Dispatcher Only
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            <div className="sm:col-span-5">
              <label className="block text-[10px] font-bold text-slate-300 mb-1">
                Target Scheme for Official Broadcast:
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
              <label className="block text-[10px] font-bold text-slate-300 mb-1">
                Official Alert Type:
              </label>
              <select
                value={adminAlertType}
                onChange={(e) => setAdminAlertType(e.target.value as SentPhoneAlertMessage['alertType'])}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-2 text-xs font-bold text-white"
              >
                <option value="new_scheme">🆕 New Scheme Alert + AI Code</option>
                <option value="deadline">🚨 30-Day Deadline Alert + AI Code</option>
                <option value="scheme_guide">📋 Sewa Kendra Document Guide</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <button
                type="button"
                data-testid="admin-dispatch-sms-btn"
                disabled={isAdminDispatching}
                onClick={() => void handleAdminBroadcastSms()}
                className="w-full rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3 py-2 transition cursor-pointer"
              >
                {isAdminDispatching ? 'Broadcasting...' : '📲 Admin Push SMS'}
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

      {/* Recent AI & Admin Auto-Dispatched SMS Inbox */}
      {!compact && inbox.length > 0 && (
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center justify-between">
            <span>
              {currentLang === 'pa'
                ? `🤖 AI ਅਤੇ Admin ਵੱਲੋਂ ਤੁਹਾਡੇ ਫ਼ੋਨ ਤੇ ਭੇਜੇ ਗਏ ਆਟੋਮੈਟਿਕ SMS (${inbox.length})`
                : currentLang === 'hi'
                  ? `🤖 AI और Admin द्वारा आपके फ़ोन पर भेजे गए स्वचालित SMS (${inbox.length})`
                  : `🤖 Auto-Dispatched SMS Alerts by AI & Admin (${inbox.length})`}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {inbox.slice(0, 2).map((msg) => (
              <div
                key={msg.id}
                className="rounded-xl bg-white/10 border border-white/15 p-3 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2 font-bold text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>{msg.formattedPhone}</span>
                  </span>
                  <span className="rounded bg-amber-400/20 border border-amber-300/40 px-1.5 py-0.5 text-[10px] font-mono text-amber-200">
                    {msg.aiSmsCode || 'JAN-AI'}
                  </span>
                </div>
                <p className="text-[11px] text-white font-semibold line-clamp-1">{msg.schemeTitle}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-300">
                  <span>{msg.triggeredBy || 'AI Autonomous Engine'}</span>
                  <span>{msg.sentAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
