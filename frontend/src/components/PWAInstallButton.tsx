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

const PWA_INSTALLED_STORAGE_KEY = 'janshayak_pwa_installed_v1';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      if (window.localStorage.getItem(PWA_INSTALLED_STORAGE_KEY) === 'true') {
        return true;
      }
    } catch {
      // ignore storage errors
    }
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });
  const [isIOS, setIsIOS] = useState(false);

  const markAsInstalled = () => {
    setIsInstalled(true);
    setDeferredPrompt(null);
    try {
      window.localStorage.setItem(PWA_INSTALLED_STORAGE_KEY, 'true');
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) {
      markAsInstalled();
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      markAsInstalled();
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
      markAsInstalled();
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
    markAsInstalled,
  };
}

interface PWAInstallButtonProps {
  currentLang?: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ currentLang = 'en' }) => {
  const { isInstallable, isInstalled, isIOS, install, markAsInstalled } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [showGuideModal, setShowGuideModal] = useState(false);

  const labelInstall =
    currentLang === 'pa'
      ? 'ਆਫ਼ਲਾਈਨ ਐਪ'
      : currentLang === 'hi'
      ? 'ऑफ़लाइन ऐप'
      : 'Offline App';

  const labelInstallShort =
    currentLang === 'pa'
      ? 'ਐਪ ਡਾਊਨਲੋਡ'
      : currentLang === 'hi'
      ? 'ऐप डाउनलोड'
      : 'Download';

  const handleConfirmDownload = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setShowGuideModal(false);
        return;
      }
    }
    // Trigger offline web app shortcut file download for desktop/mobile browsers when native prompt is unavailable
    try {
      const shortcutHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0;url=${window.location.origin}" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Janshayak AI — Offline Welfare Navigator</title>
</head>
<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0f172a;color:#fff;">
  <p>Opening Janshayak AI (<a href="${window.location.origin}" style="color:#38bdf8;">Click here if not redirected</a>)...</p>
</body>
</html>`;
      const blob = new Blob([shortcutHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Janshayak-AI-App.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // ignore blob download errors in restricted environments
    }
    markAsInstalled();
    setShowGuideModal(false);
  };

  return (
    <>
      <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-1.5">
        {/* Live Connectivity Status Pill — always visible on mobile and desktop */}
        <span
          data-testid="network-status-badge"
          title={
            isOnline
              ? 'Online & Offline Ready — Live AI + Local Cache Active'
              : 'Offline Mode Active — Working without internet'
          }
          className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[11px] sm:text-xs font-bold transition whitespace-nowrap ${
            isOnline
              ? 'border-emerald-200 bg-emerald-50/90 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'border-amber-300 bg-amber-100 text-amber-950 animate-pulse dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>
                {currentLang === 'pa' ? 'ਆਨਲਾਈਨ + ਆਫ਼ਲਾਈਨ ਤਿਆਰ' : currentLang === 'hi' ? 'ऑनलाइन + ऑफ़लाइन तैयार' : 'Online + Offline Ready'}
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
              <span>
                {currentLang === 'pa' ? 'ਆਫ਼ਲਾਈਨ ਮੋਡ (Offline)' : currentLang === 'hi' ? 'ऑफ़लाइन मोड (Offline)' : 'Offline Mode Active'}
              </span>
            </>
          )}
        </span>

        {/* Install / Offline App Button — stays visible until user downloads/installs the app */}
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
            className="inline-flex h-8 sm:h-9 w-auto items-center justify-center gap-1.5 rounded-xl bg-blue-700 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-white shadow-2xs transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 cursor-pointer shrink-0 whitespace-nowrap"
            aria-label="Install Offline App"
            title={labelInstall}
          >
            <Download className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="sm:hidden">{labelInstallShort}</span>
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
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
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
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 cursor-pointer"
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
                  <p>1. Click <strong>Download App Now</strong> below or use your browser’s <strong>Install App</strong> icon.</p>
                  <p>2. Launch <strong>Janshayak AI</strong> anytime from your home screen or desktop—even without internet!</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                data-testid="pwa-confirm-download-btn"
                onClick={() => void handleConfirmDownload()}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 py-2.5 px-4 text-xs font-bold text-white hover:bg-blue-800 transition cursor-pointer"
              >
                <Download className="h-4 w-4 shrink-0" />
                <span>
                  {currentLang === 'pa'
                    ? 'ਐਪ ਡਾਊਨਲੋਡ ਕਰੋ (Download Now)'
                    : currentLang === 'hi'
                    ? 'ऐप डाउनलोड करें (Download Now)'
                    : 'Download Offline App Now'}
                </span>
              </button>
              <button
                type="button"
                data-testid="pwa-later-btn"
                onClick={() => setShowGuideModal(false)}
                className="rounded-xl border border-slate-200 bg-slate-100 py-2.5 px-4 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition cursor-pointer"
              >
                {currentLang === 'pa' ? 'ਬਾਅਦ ਵਿੱਚ (Later)' : currentLang === 'hi' ? 'बाद में (Later)' : 'Later'}
              </button>
            </div>
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
