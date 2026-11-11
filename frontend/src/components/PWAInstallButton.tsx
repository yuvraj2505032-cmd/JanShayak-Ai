import React, { useEffect, useState } from 'react';
import { Download, Wifi, WifiOff, CheckCircle2, X, Smartphone, ExternalLink } from 'lucide-react';
import { Language } from '../types/scheme';
import { GOV_SCHEMES } from '../data/schemes';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __deferredPwaPrompt?: BeforeInstallPromptEvent | null;
  }
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

const PWA_INSTALLED_STORAGE_KEY = 'janshayak_pwa_installed_v2';

export function buildStandaloneOfflineAppHtml(origin: string): string {
  const embeddedSchemes = JSON.stringify(
    GOV_SCHEMES.map((s) => ({
      id: s.id,
      title: { en: s.titleEn, pa: s.titlePa, hi: s.titleHi },
      department: { en: s.departmentEn, pa: s.departmentPa, hi: s.departmentHi },
      benefits: {
        en: `${s.benefitAmountText} — ${s.descriptionEn}`,
        pa: `${s.benefitAmountText} — ${s.descriptionPa}`,
        hi: `${s.benefitAmountText} — ${s.descriptionHi}`,
      },
      officialWebsite: s.officialPortalUrl,
      helpline: '1100',
      documents: (s.requiredDocuments || []).map((d) => ({
        en: d.nameEn,
        pa: d.namePa,
        hi: d.nameHi,
      })),
    }))
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Janshayak AI — Offline Citizen Welfare App</title>
  <style>
    * { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
    body { margin: 0; background: #f8fafc; color: #0f172a; padding-bottom: 48px; }
    header { background: linear-gradient(135deg, #0f172a, #1e3a8a, #115e59); color: #fff; padding: 18px 16px; position: sticky; top: 0; z-index: 20; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
    .container { max-width: 980px; margin: 0 auto; padding: 0 14px; }
    .top-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
    .brand { font-size: 20px; font-weight: 900; display: flex; align-items: center; gap: 8px; }
    .badge { background: rgba(16,185,129,0.2); border: 1px solid rgba(52,211,153,0.4); color: #6ee7b7; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; }
    .lang-group button { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 6px 11px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; margin-left: 4px; }
    .lang-group button.active { background: #2563eb; border-color: #60a5fa; }
    .search-bar { margin-top: 14px; display: flex; gap: 8px; }
    .search-bar input { flex: 1; padding: 12px 14px; border-radius: 12px; border: none; font-size: 14px; outline: none; }
    .live-btn { display: inline-flex; align-items: center; gap: 6px; background: #10b981; color: #052e16; font-weight: 800; font-size: 12px; padding: 10px 14px; border-radius: 12px; text-decoration: none; white-space: nowrap; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 14px; margin-top: 18px; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); display: flex; flex-direction: column; justify-content: space-between; }
    .card h3 { margin: 6px 0 8px; font-size: 16px; color: #0f172a; }
    .dept { font-size: 11px; font-weight: 800; color: #0d9488; text-transform: uppercase; }
    .benefit { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 10px; border-radius: 10px; font-size: 13px; font-weight: 600; margin: 8px 0; }
    .docs { font-size: 12px; color: #475569; margin: 6px 0 12px; }
    .card-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 10px; border-top: 1px solid #f1f5f9; }
    .portal-link { background: #1d4ed8; color: #fff; text-decoration: none; padding: 8px 12px; border-radius: 10px; font-size: 12px; font-weight: 700; }
    .helpline { font-size: 11px; font-weight: 700; color: #64748b; }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="top-row">
        <div class="brand">
          <span>Janshayak AI</span>
          <span class="badge">100% Offline App</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <div class="lang-group">
            <button id="btn-en" class="active" onclick="setLang('en')">EN</button>
            <button id="btn-pa" onclick="setLang('pa')">ਪੰਜਾਬੀ</button>
            <button id="btn-hi" onclick="setLang('hi')">हिंदी</button>
          </div>
          <a class="live-btn" href="${origin}" target="_blank" rel="noopener">Open Full Live App ↗</a>
        </div>
      </div>
      <div class="search-bar">
        <input id="q" type="search" placeholder="Search schemes offline (e.g., Kisan, Scholarship, Pension, Ashirwad)..." oninput="render()" />
      </div>
    </div>
  </header>
  <main class="container">
    <p id="count" style="font-size:13px;font-weight:700;color:#475569;margin-top:16px;"></p>
    <div id="list" class="grid"></div>
  </main>
  <script>
    const SCHEMES = ${embeddedSchemes};
    let lang = 'en';
    function setLang(l) {
      lang = l;
      ['en','pa','hi'].forEach(k => document.getElementById('btn-'+k).classList.toggle('active', k===l));
      render();
    }
    function render() {
      const q = (document.getElementById('q').value || '').toLowerCase().trim();
      const filtered = SCHEMES.filter(s => !q || JSON.stringify(s).toLowerCase().includes(q));
      document.getElementById('count').textContent = 'Showing ' + filtered.length + ' verified government schemes (100% Offline Ready)';
      document.getElementById('list').innerHTML = filtered.map(s => {
        const title = (s.title && (s.title[lang] || s.title.en)) || '';
        const dept = (s.department && (s.department[lang] || s.department.en)) || '';
        const ben = (s.benefits && (s.benefits[lang] || s.benefits.en)) || '';
        const docs = (s.documents || []).map(d => d[lang] || d.en).join(', ');
        return '<div class="card"><div><div class="dept">' + dept + '</div><h3>' + title + '</h3><div class="benefit">' + ben + '</div><div class="docs"><strong>Documents:</strong> ' + docs + '</div></div><div class="card-footer"><span class="helpline">Helpline: ' + s.helpline + '</span><a class="portal-link" href="' + s.officialWebsite + '" target="_blank" rel="noopener">Official Portal ↗</a></div></div>';
      }).join('');
    }
    render();
  </script>
</body>
</html>`;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__deferredPwaPrompt) {
      return window.__deferredPwaPrompt;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      // Clear legacy v1 flag so users who didn't get a real download see the button
      window.localStorage.removeItem('janshayak_pwa_installed_v1');
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
    if (typeof window !== 'undefined') {
      window.__deferredPwaPrompt = null;
      try {
        window.localStorage.setItem(PWA_INSTALLED_STORAGE_KEY, 'true');
      } catch {
        // ignore storage errors
      }
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

    if (window.__deferredPwaPrompt) {
      setDeferredPrompt(window.__deferredPwaPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__deferredPwaPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleCustomPromptReady = () => {
      if (window.__deferredPwaPrompt) {
        setDeferredPrompt(window.__deferredPwaPrompt);
      }
    };

    const handleAppInstalled = () => {
      markAsInstalled();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handleCustomPromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-app-installed', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handleCustomPromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-app-installed', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    const activePrompt = deferredPrompt || (typeof window !== 'undefined' ? window.__deferredPwaPrompt : null);
    if (!activePrompt) return false;
    await activePrompt.prompt();
    const { outcome } = await activePrompt.userChoice;
    if (outcome === 'accepted') {
      markAsInstalled();
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!(deferredPrompt || (typeof window !== 'undefined' && window.__deferredPwaPrompt)),
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
  const [downloadSuccess, setDownloadSuccess] = useState(false);

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

  const triggerStandaloneFileDownload = () => {
    try {
      const htmlContent = buildStandaloneOfflineAppHtml(window.location.origin);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'Janshayak-AI-Offline-App.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
    } catch {
      // Fallback to server attachment endpoint if Blob download is restricted
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = '/api/download-app';
      document.body.appendChild(iframe);
      window.setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 5000);
    }
  };

  const handleConfirmDownload = async () => {
    // 1. If native browser PWA install prompt is ready, invoke it first
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setShowGuideModal(false);
        return;
      }
    }

    // 2. Immediately trigger the standalone Offline App download synchronously
    triggerStandaloneFileDownload();
    setDownloadSuccess(true);

    // 3. Mark as installed after showing confirmation so the navbar button hides
    window.setTimeout(() => {
      markAsInstalled();
      setShowGuideModal(false);
      setDownloadSuccess(false);
    }, 900);
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
                const installed = await install();
                if (!installed) {
                  setShowGuideModal(true);
                }
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
                      ? 'ਵੈੱਬਸਾਈਟ ਆਫ਼ਲਾਈਨ ਐਪ ਡਾਊਨਲੋਡ ਕਰੋ'
                      : currentLang === 'hi'
                      ? 'वेबसाइट ऑफ़लाइन ऐप डाउनलोड करें'
                      : 'Download & Install Offline App'}
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
                      ? 'ਤੁਹਾਡੇ ਫ਼ੋਨ/ਕੰਪਿਊਟਰ ਲਈ ਆਫ਼ਲਾਈਨ ਐਪ ਤਿਆਰ ਹੈ!'
                      : 'Standalone Offline App Package is ready to download!'}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed">
                  {currentLang === 'pa'
                    ? 'ਹੇਠਾਂ "ਐਪ ਡਾਊਨਲੋਡ ਕਰੋ" ਬਟਨ ਦਬਾਓ। ਇਹ ਤੁਹਾਡੇ ਫ਼ੋਨ ਜਾਂ ਕੰਪਿਊਟਰ ਵਿੱਚ Janshayak AI Offline App ਡਾਊਨਲੋਡ ਕਰ ਦੇਵੇਗਾ ਜੋ ਬਿਨਾਂ ਇੰਟਰਨੈੱਟ ਤੋਂ ਵੀ ਚੱਲੇਗਾ।'
                    : 'Tap "Download Offline App Now" below to download the self-contained Janshayak AI Offline App with all verified schemes, search, and portals.'}
                </p>
              </div>

              {downloadSuccess && (
                <div
                  role="status"
                  className="rounded-xl border border-blue-300 bg-blue-50 p-3 text-xs font-bold text-blue-900 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200"
                >
                  {currentLang === 'pa'
                    ? '✅ Janshayak AI Offline App ਸਫਲਤਾਪੂਰਵਕ ਡਾਊਨਲੋਡ ਹੋ ਗਿਆ ਹੈ!'
                    : '✅ Janshayak AI Offline App downloaded successfully!'}
                </div>
              )}

              {isIOS ? (
                <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                  <p className="font-bold text-slate-900 dark:text-white">Install on iPhone / iPad (Safari):</p>
                  <p>1. Tap <strong>Download Offline App Now</strong> below, or tap <strong>Share → Add to Home Screen</strong> in Safari.</p>
                </div>
              ) : (
                <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {currentLang === 'pa' ? 'ਹੋਮ ਸਕ੍ਰੀਨ ਜਾਂ ਡੈਸਕਟਾਪ ਤੇ ਚਲਾਓ:' : 'Run on Phone or Desktop:'}
                  </p>
                  <p>
                    {currentLang === 'pa'
                      ? '1. ਹੇਠਾਂ ਨੀਲੇ ਬਟਨ ਉੱਤੇ ਕਲਿੱਕ ਕਰਕੇ ਆਫ਼ਲਾਈਨ ਐਪ ਫਾਈਲ ਡਾਊਨਲੋਡ ਕਰੋ।'
                      : '1. Click the blue button below to download the standalone Offline App file.'}
                  </p>
                  <p>
                    {currentLang === 'pa'
                      ? '2. ਜਾਂ ਬ੍ਰਾਊਜ਼ਰ ਦੇ "Add to Home screen / Install App" ਆਪਸ਼ਨ ਨਾਲ ਇੰਸਟਾਲ ਕਰੋ।'
                      : '2. Or open in a full browser tab and select "Add to Home Screen / Install App".'}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <a
                href="/api/download-app"
                download="Janshayak-AI-Offline-App.html"
                data-testid="pwa-confirm-download-btn"
                onClick={(e) => {
                  if (isInstallable || !isOnline) {
                    e.preventDefault();
                    void handleConfirmDownload();
                    return;
                  }
                  // Online & no native deferredPrompt: let the browser natively download /api/download-app
                  // (Content-Disposition: attachment) and also trigger Blob fallback if needed
                  setDownloadSuccess(true);
                  window.setTimeout(() => {
                    markAsInstalled();
                    setShowGuideModal(false);
                    setDownloadSuccess(false);
                  }, 1000);
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 px-4 text-xs sm:text-sm font-bold text-white hover:bg-blue-800 transition cursor-pointer text-center shadow-md"
              >
                <Download className="h-4 w-4 shrink-0" />
                <span>
                  {currentLang === 'pa'
                    ? 'ਐਪ ਡਾਊਨਲੋਡ ਕਰੋ (Download Offline App Now)'
                    : currentLang === 'hi'
                    ? 'ऐप डाउनलोड करें (Download Offline App Now)'
                    : 'Download Offline App Now'}
                </span>
              </a>

              <div className="flex items-center gap-2">
                <a
                  href={typeof window !== 'undefined' ? window.location.href : '/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 py-2.5 px-3 text-xs font-bold text-blue-800 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300 transition text-center"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {currentLang === 'pa'
                      ? 'ਨਵੀਂ ਟੈਬ ਵਿੱਚ ਇੰਸਟਾਲ ਕਰੋ'
                      : currentLang === 'hi'
                      ? 'नए टैब में इंस्टॉल करें'
                      : 'Open in Browser to Install APK/PWA'}
                  </span>
                </a>

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
