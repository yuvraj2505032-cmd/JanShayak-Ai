import React from 'react';
import { Language } from '../types/scheme';
import { TRANSLATIONS } from '../data/translations';
import { ShieldAlert, PhoneCall, Lock, CheckCircle2, Search } from 'lucide-react';

interface FraudProtectionBannerProps {
  currentLang: Language;
  onOpenScanner?: () => void;
}

export const FraudProtectionBanner: React.FC<FraudProtectionBannerProps> = ({
  currentLang,
  onOpenScanner,
}) => {
  const t = TRANSLATIONS[currentLang];

  return (
    <div className="bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 border border-amber-300/90 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Alert Message */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-800 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-amber-950 tracking-tight">
                {t.fraudAlertTitle}
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300">
                <CheckCircle2 className="w-3 h-3" />
                {currentLang === 'pa'
                  ? 'ਵੈਰੀਫਾਈਡ .gov.in ਪੋਰਟਲ ਅਤੇ ਐਂਟੀ-ਹੈਕਰ ਸ਼ੀਲਡ'
                  : currentLang === 'hi'
                  ? 'सत्यापित .gov.in पोर्टल और एंटी-हैकर शील्ड'
                  : 'Verified .gov.in Portals & Anti-Hacker Shield'}
              </span>
            </div>
            <p className="text-xs text-amber-900/90 mt-1 leading-relaxed max-w-3xl">
              {t.fraudAlertBody}
            </p>
          </div>
        </div>

        {/* Right Action / Scanner Trigger & Helpline Pill */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          {onOpenScanner && (
            <button
              type="button"
              data-testid="open-cyber-scanner-banner-btn"
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl shadow-xs text-xs font-extrabold transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-teal-400" />
              <span>
                {currentLang === 'pa'
                  ? 'ਵੈੱਬਸਾਈਟ ਅਸਲੀ/ਨਕਲੀ ਸਕੈਨ ਕਰੋ'
                  : currentLang === 'hi'
                  ? 'वेबसाइट असली/नकली स्कैन करें'
                  : 'Scan Website (Real vs Fake)'}
              </span>
            </button>
          )}
          <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-amber-200 shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-teal-700" />
            <span className="text-[11px] font-bold text-slate-700">
              {currentLang === 'pa'
                ? 'ਜ਼ੀਰੋ ਰਿਸ਼ਵਤ ਗਾਰੰਟੀ'
                : currentLang === 'hi'
                ? 'ज़ीरो रिश्वत गारंटी'
                : 'Zero-Bribe Guarantee'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-900 text-white px-3.5 py-2 rounded-xl shadow-xs text-xs font-bold">
            <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {currentLang === 'pa'
                ? 'ਹੈਲਪਲਾਈਨ: 1100 / 1930'
                : currentLang === 'hi'
                ? 'हेल्पलाइन: 1100 / 1930'
                : 'Helpline: 1100 / 1930'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
