import React, { useEffect, useState } from 'react';
import { Download, Wifi, WifiOff, CheckCircle2, X, Smartphone } from 'lucide-react';
import { Language } from '../types/scheme';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}

interface PWAInstallButtonProps {
  currentLang?: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ currentLang = 'en' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [showGuideModal, setShowGuideModal] = useState(false);

  const labelInstall =
    currentLang === 'pa'
      ? 'ਆਫ਼ਲਾਈਨ ਐਪ'
      : currentLang === 'hi'
      ? 'ऑफ़लाइन ऐप'
      : 'Offline App';

  return (
    <>
      <div className="inline-flex items-center gap-1.5">
        {/* Live Connectivity Status Pill */}
        <span
          data-testid="network-status-badge"
          title={
            isOnline
              ? 'Online & Offline Ready — Live AI + Local Cache Active'
              : 'Offline Mode Active — Working without internet'
          }
          className={`inline-flex items-center gap-1 rounded-xl border px-2 py-1 text-[11px] font-bold transition ${
            isOnline
              ? 'border-emerald-200 bg-emerald-50/90 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'border-amber-300 bg-amber-100 text-amber-950 animate-pulse dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span className="hidden md:inline">
                {currentLang === 'pa' ? 'ਆਨਲਾਈਨ + ਆਫ਼ਲਾਈਨ ਤਿਆਰ' : currentLang === 'hi' ? 'ऑनलाइन + ऑफ़लाइन तैयार' : 'Online + Offline Ready'}
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300" aria-hidden="true" />
              <span>
                {currentLang === 'pa' ? 'ਆਫ਼ਲਾਈਨ ਮੋਡ' : currentLang === 'hi' ? 'ऑफ़लाइन मोड' : 'Offline Mode'}
              </span>
            </>
          )}
        </span>

        {/* Install / Offline App Button */}
        {!isInstalled && (
          <button
            type="button"
            data-testid="pwa-install-btn"
            onClick={async () => {
              if (isInstallable) {
                await install();
              } else {
                setShowGuideModal(true);
              }
            }}
            className="inline-flex h-8 sm:h-9 items-center gap-1.5 rounded-xl bg-blue-700 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-white shadow-2xs transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 cursor-pointer"
            aria-label="Install Offline App"
          >
            <Download className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">{labelInstall}</span>
          </button>
        )}
      </div>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="offline-pwa-modal-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Smartphone className="h-5 w-5" />
                </span>
                <div>
                  <h3 id="offline-pwa-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                    {currentLang === 'pa'
                      ? 'ਵੈੱਬਸਾਈਟ ਆਫ਼ਲਾਈਨ ਚਲਾਓ ਅਤੇ ਇੰਸਟਾਲ ਕਰੋ'
                      : currentLang === 'hi'
                      ? 'वेबसाइट ऑफ़लाइन चलाएं और इंस्टॉल करें'
                      : 'Install & Use Website Offline'}
                  </h3>
                  <p className="text-xs text-emerald-700 font-semibold dark:text-emerald-400">
                    100% Offline Ready PWA · Service Worker Active
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                aria-label="Close offline app guide"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    {currentLang === 'pa'
                      ? 'ਤੁਹਾਡੇ ਡਿਵਾਈਸ ਵਿੱਚ ਸਾਰਾ ਡਾਟਾ ਸੇਵ ਹੋ ਚੁੱਕਾ ਹੈ!'
                      : 'All schemes & tools are cached for offline use!'}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed">
                  {currentLang === 'pa'
                    ? 'ਤੁਸੀਂ ਇੰਟਰਨੈੱਟ ਬੰਦ ਹੋਣ ਤੇ ਵੀ ਸਾਰੀਆਂ ਪੰਜਾਬ ਅਤੇ ਕੇਂਦਰੀ ਸਕੀਮਾਂ, ਯੋਗਤਾ ਚੈੱਕ, ਫੈਮਿਲੀ ਕੈਲਕੁਲੇਟਰ, ਅਤੇ ਆਫ਼ਲਾਈਨ AI ਚੈਟਬੋਟ ਵਰਤ ਸਕਦੇ ਹੋ।'
                    : 'Even when your Wi-Fi or mobile data is turned off, you can browse all schemes, check eligibility, run simulators, and ask the offline AI assistant.'}
                </p>
              </div>

              {isIOS ? (
                <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                  <p className="font-bold text-slate-900 dark:text-white">Install on iPhone / iPad (Safari):</p>
                  <p>1. Tap the <strong>Share</strong> icon in Safari toolbar.</p>
                  <p>2. Select <strong>Add to Home Screen</strong>.</p>
                </div>
              ) : (
                <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                  <p className="font-bold text-slate-900 dark:text-white">How to Install as Desktop / Mobile App:</p>
                  <p>1. Click the <strong>Install App</strong> icon in your browser address bar (Chrome / Edge) or browser menu.</p>
                  <p>2. Launch <strong>Janshayak AI</strong> anytime from your home screen or desktop—even without internet!</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="mt-5 w-full rounded-xl bg-blue-700 py-2.5 text-xs font-bold text-white hover:bg-blue-800 transition cursor-pointer"
            >
              {currentLang === 'pa' ? 'ਠੀਕ ਹੈ (Got it)' : 'Got It'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC<{ currentLang?: Language }> = ({ currentLang = 'en' }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="offline-banner"
      className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold shadow-md border-b border-amber-600"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <WifiOff className="h-4 w-4 shrink-0 text-slate-950" aria-hidden="true" />
          <span>
            {currentLang === 'pa'
              ? 'ਆਫ਼ਲਾਈਨ ਮੋਡ ਚਾਲੂ ਹੈ — ਬਿਨਾਂ ਇੰਟਰਨੈੱਟ ਤੋਂ ਸਾਰੀਆਂ ਸਕੀਮਾਂ, ਯੋਗਤਾ ਚੈੱਕ ਅਤੇ ਆਫ਼ਲਾਈਨ AI ਸਹਾਇਕ ਕੰਮ ਕਰ ਰਹੇ ਹਨ।'
              : currentLang === 'hi'
              ? 'ऑफ़लाइन मोड चालू है — बिना इंटरनेट के सभी योजनाएं, पात्रता जांच और ऑफ़लाइन AI सहायक काम कर रहे हैं।'
              : 'Offline Mode Active — All government schemes, eligibility checks, calculators & offline AI assistant are working without internet.'}
          </span>
        </div>
        <span className="rounded-full bg-slate-950/15 px-2.5 py-0.5 text-[11px] font-extrabold">
          100% Offline Ready
        </span>
      </div>
    </div>
  );
};
