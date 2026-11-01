import React from 'react';
import { ArrowRight, Search, Sparkles, Users, X } from 'lucide-react';
import { Language } from '../types/scheme';
import { TRANSLATIONS } from '../data/translations';

interface HeroBannerProps {
  currentLang?: Language;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onStartWizard: () => void;
  onOpenFamilyFinder: () => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onAskAI: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  currentLang = 'en',
  searchQuery,
  onSearchChange,
  onStartWizard,
  onOpenFamilyFinder,
  activeFilter,
  onFilterChange,
  onAskAI,
}) => {
  const t = TRANSLATIONS[currentLang];
  const filterItems = [
    { value: 'all', label: t.catAll },
    { value: 'Students', label: t.catStudents },
    { value: 'Agriculture', label: t.catAgriculture },
    { value: 'Health', label: t.catHealth },
    { value: 'Education', label: t.catEducation },
    { value: 'Finance', label: t.catFinance },
  ];

  return (
    <section className="bg-white px-4 pb-8 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(115deg,rgba(255,153,51,0.12)_0%,rgba(255,255,255,0.97)_47%,rgba(19,136,8,0.09)_100%)] px-5 py-12 text-center shadow-[0_24px_70px_-48px_rgba(15,23,42,0.34)] sm:px-10 sm:py-16 lg:py-20">
          <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-orange-200/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-slate-500 sm:text-sm">
              {t.heroEyebrow}
            </p>
            <h1 className="text-3xl font-bold leading-[1.15] tracking-[-0.03em] text-slate-950 sm:text-5xl">
              {t.heroTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              {t.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onStartWizard}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-blue-700 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                {t.heroCheckEligibility}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onOpenFamilyFinder}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/90 px-6 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-4 focus:ring-slate-200"
              >
                <Users className="h-4 w-4 text-slate-600" aria-hidden="true" />
                {t.heroFamilyFinder}
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-4xl">
          <div className="flex h-[60px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-[0_12px_36px_-26px_rgba(15,23,42,0.35)] transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 sm:px-5">
            <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
            <label className="sr-only" htmlFor="scheme-search">{t.heroSearchPlaceholder}</label>
            <input
              id="scheme-search"
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && searchQuery.trim()) onAskAI();
              }}
              placeholder={t.heroSearchPlaceholder}
              className="h-full min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 sm:text-[17px]"
            />
            {searchQuery && (
              <button type="button" onClick={() => onSearchChange('')} aria-label={t.clearSearch} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              disabled={!searchQuery.trim()}
              onClick={onAskAI}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-blue-700 px-3 text-xs font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-45 sm:px-4 sm:text-sm"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>{t.heroAskAi}</span>
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-slate-500">
            {t.heroSearchHint}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2" aria-label="Filter schemes by category">
            {filterItems.map((filter) => {
              const selected = activeFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => onFilterChange(filter.value)}
                  aria-pressed={selected}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    selected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
