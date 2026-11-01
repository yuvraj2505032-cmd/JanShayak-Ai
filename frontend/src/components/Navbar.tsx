import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, Home, UserRound, X } from 'lucide-react';
import { Language } from '../types/scheme';
import { TRANSLATIONS } from '../data/translations';
import { SupabaseAccount } from './SupabaseAccount';
import type { SupabaseAccountProps } from './SupabaseAccount';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  savedCount?: number;
  cloudAccount: SupabaseAccountProps;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  activeTab,
  onTabChange,
  savedCount = 0,
  cloudAccount,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const t = TRANSLATIONS[currentLang];
  const activeEmail = cloudAccount.localUserEmail || cloudAccount.userEmail;
  const navItems = [
    { id: 'dashboard', label: t.tabDashboard },
    { id: 'insights', label: t.tabInsights },
    { id: 'wizard', label: t.tabEligibilityWizard },
    { id: 'saved', label: `${t.tabSaved}${savedCount > 0 ? ` (${savedCount})` : ''}` },
    { id: 'video-guides', label: t.tabVideoGuides },
    { id: 'scanner', label: t.tabScanner },
    { id: 'family', label: t.tabFamilyFinder },
    { id: 'whatif', label: t.tabWhatIf },
    { id: 'districts', label: t.tabDistricts },
    { id: 'deadlines', label: t.tabDeadlines },
    { id: 'tracker', label: t.tabTracker },
    { id: 'fraud-shield', label: t.tabFraudShield },
    { id: 'admin', label: t.tabAdmin },
  ];
  const languages: { id: Language; label: string }[] = [
    { id: 'en', label: 'EN' },
    { id: 'pa', label: 'ਪੰਜਾਬੀ' },
    { id: 'hi', label: 'हिंदी' },
  ];

  const selectTab = (tab: string) => {
    onTabChange(tab);
    setIsMenuOpen(false);
    if (tab === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="relative mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-2 px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            aria-controls="primary-navigation"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-200"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <span className="flex w-[19px] flex-col gap-[5px]" aria-hidden="true">
                <span className="h-[2px] w-full rounded-full bg-current" />
                <span className="h-[2px] w-full rounded-full bg-current" />
                <span className="h-[2px] w-full rounded-full bg-current" />
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => selectTab('dashboard')}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold tracking-tight text-slate-950 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:gap-2.5 sm:text-lg"
          >
            <img src="/janshayak-ai-logo.svg" alt="" className="h-8 w-7 object-contain sm:h-10 sm:w-9" />
            <span>
              Janshayak <span className="text-teal-700">AI</span>
            </span>
          </button>

          {activeTab !== 'dashboard' && (
            <button
              type="button"
              data-testid="navbar-back-home-btn"
              onClick={() => selectTab('dashboard')}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/90 px-2.5 py-1.5 text-xs font-bold text-blue-800 shadow-2xs transition hover:border-blue-300 hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:px-3"
              aria-label={t.backToHome}
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <Home className="hidden h-3.5 w-3.5 shrink-0 sm:inline" aria-hidden="true" />
              <span>{t.homeShort}</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          <div
            role="group"
            aria-label="Choose language"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100/90 p-0.5"
          >
            {languages.map((language) => {
              const isSelected = currentLang === language.id;
              return (
                <button
                  key={language.id}
                  type="button"
                  data-testid={`lang-${language.id}`}
                  onClick={() => onLanguageChange(language.id)}
                  aria-current={isSelected ? 'true' : undefined}
                  className={`rounded-lg px-2 py-1.5 text-xs font-bold transition sm:px-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-700 text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-white/70 hover:text-slate-950'
                  }`}
                >
                  {language.label}
                </button>
              );
            })}
          </div>

          <SupabaseAccount
            {...cloudAccount}
            currentLang={currentLang}
            isOpen={isAccountModalOpen}
            onOpenChange={setIsAccountModalOpen}
          />

          <button
            type="button"
            onClick={() => selectTab('profile')}
            aria-label={t.tabProfile}
            aria-current={activeTab === 'profile' ? 'page' : undefined}
            title={t.tabProfile}
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${
              activeTab === 'profile'
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {isMenuOpen && (
          <>
            <button
              type="button"
              aria-label="Close navigation menu"
              className="fixed inset-0 z-40 top-[68px] bg-slate-950/20"
              onClick={() => setIsMenuOpen(false)}
            />
            <div
              id="primary-navigation"
              className="absolute left-4 right-4 top-full z-50 mt-2 max-h-[calc(100vh-88px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/15 sm:left-6 sm:right-auto sm:w-[min(390px,calc(100vw-3rem))]"
            >
              <nav aria-label="Main navigation" className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectTab(item.id)}
                    aria-current={activeTab === item.id ? 'page' : undefined}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-sm font-medium transition ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-800'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                    {item.id === 'saved' && savedCount > 0 && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{savedCount}</span>
                    )}
                  </button>
                ))}
              </nav>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <span className="truncate text-xs font-medium text-slate-600">
                  {activeEmail ? activeEmail : t.notSignedIn}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsAccountModalOpen(true);
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-100"
                >
                  {activeEmail ? t.manageAccount : t.signIn}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
