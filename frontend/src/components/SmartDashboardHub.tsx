import React, { useState } from 'react';
import {
  AgeBracketFilter,
  AdvancedSearchFilters,
  countActiveAdvancedFilters,
  EducationLevelFilter,
  isAiAutoAddedScheme,
  LevelFilter,
  OFFICIAL_GOV_ANNOUNCEMENTS,
  SchemeEraFilter,
  TargetGroupFilter,
} from '../utils/advancedSchemeFilter';
import { getSchemeEra } from '../data/officialPortals';
import { INDIA_STATES_AND_UTS } from '../data/indiaStatesAndDistricts';
import { CitizenProfile, EligibilityEvaluation, Language, Occupation, Scheme } from '../types/scheme';
import {
  Bookmark,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Filter,
  GraduationCap,
  HeartHandshake,
  History,
  Landmark,
  Megaphone,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sprout,
  Briefcase,
  ArrowRight,
  ClipboardCheck,
} from 'lucide-react';

interface SmartDashboardHubProps {
  currentLang: Language;
  profile: CitizenProfile;
  evaluations: EligibilityEvaluation[];
  topRecommended: EligibilityEvaluation[];
  recentlyViewedSchemes: Scheme[];
  savedSchemeIds: string[];
  advancedFilters: AdvancedSearchFilters;
  onUpdateFilters: (patch: Partial<AdvancedSearchFilters>) => void;
  onResetFilters: () => void;
  onOpenSchemeDetails: (scheme: Scheme) => void;
  onClearRecentlyViewed: () => void;
  onNavigateTab: (tab: string) => void;
  onSyncAllAiSchemes?: () => void;
  onTriggerAiDiscovery?: (customTopic?: string) => Promise<void>;
  isAiDiscovering?: boolean;
  isAiAutoSyncEnabled?: boolean;
  onToggleAiAutoSync?: (enabled: boolean) => void;
  latestAutoAddedTitle?: string;
}

export const SmartDashboardHub: React.FC<SmartDashboardHubProps> = ({
  currentLang,
  profile,
  evaluations,
  topRecommended,
  recentlyViewedSchemes,
  savedSchemeIds,
  advancedFilters,
  onUpdateFilters,
  onResetFilters,
  onOpenSchemeDetails,
  onClearRecentlyViewed,
  onNavigateTab,
  onSyncAllAiSchemes,
  onTriggerAiDiscovery,
  isAiDiscovering = false,
  isAiAutoSyncEnabled = true,
  onToggleAiAutoSync,
  latestAutoAddedTitle,
}) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 640 : true
  );
  const [quickAiTopic, setQuickAiTopic] = useState('');
  const [syncNotice, setSyncNotice] = useState('');
  const activeFilterCount = countActiveAdvancedFilters(advancedFilters);

  const eligibleCount = evaluations.filter((e) => e.isEligible).length;
  const partialCount = evaluations.filter((e) => e.isPotentialMatch).length;
  const newSchemesCount = evaluations.filter((e) => getSchemeEra(e.scheme) === 'new').length;
  const puraniSchemesCount = evaluations.filter((e) => getSchemeEra(e.scheme) === 'purani').length;
  const aiAutoAddedCount = evaluations.filter((e) => isAiAutoAddedScheme(e.scheme)).length;
  const activeEra: SchemeEraFilter = advancedFilters.schemeEra ?? 'all';

  const targetGroupButtons: {
    id: TargetGroupFilter;
    labelEn: string;
    labelPa: string;
    labelHi: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'all',
      labelEn: 'All Citizens',
      labelPa: 'ਸਾਰੇ ਨਾਗਰਿਕ',
      labelHi: 'सभी नागरिक',
      icon: <Landmark className="h-3.5 w-3.5 shrink-0" />,
    },
    {
      id: 'women',
      labelEn: 'Women & Girls',
      labelPa: 'ਔਰਤਾਂ ਅਤੇ ਧੀਆਂ',
      labelHi: 'महिलाएं और बेटियां',
      icon: <HeartHandshake className="h-3.5 w-3.5 shrink-0" />,
    },
    {
      id: 'students',
      labelEn: 'Students & Youth',
      labelPa: 'ਵਿਦਿਆਰਥੀ',
      labelHi: 'छात्र और युवा',
      icon: <GraduationCap className="h-3.5 w-3.5 shrink-0" />,
    },
    {
      id: 'farmers',
      labelEn: 'Farmers (Kisan)',
      labelPa: 'ਕਿਸਾਨ',
      labelHi: 'किसान',
      icon: <Sprout className="h-3.5 w-3.5 shrink-0" />,
    },
    {
      id: 'business',
      labelEn: 'Business & Artisans',
      labelPa: 'ਕਾਰੋਬਾਰ / ਕਾਰੀਗਰ',
      labelHi: 'व्यवसाय और कारीगर',
      icon: <Briefcase className="h-3.5 w-3.5 shrink-0" />,
    },
  ];

  const getSchemeTitle = (scheme: Scheme) =>
    currentLang === 'pa' ? scheme.titlePa : currentLang === 'hi' ? scheme.titleHi : scheme.titleEn;

  const handleQuickAiAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onTriggerAiDiscovery) return;
    const topic = quickAiTopic.trim();
    await onTriggerAiDiscovery(topic || undefined);
    setQuickAiTopic('');
    setSyncNotice(
      currentLang === 'pa'
        ? 'AI ਨੇ ਨਵੀਂ/ਪੁਰਾਣੀ ਸਰਕਾਰੀ ਸਕੀਮ ਅਤੇ ਪੋਰਟਲ ਲਿੰਕ ਸਫਲਤਾਪੂਰਵਕ ਜੋੜ ਦਿੱਤਾ ਹੈ!'
        : currentLang === 'hi'
        ? 'AI ने नई/पुरानी सरकारी योजना और पोर्टल लिंक सफलतापूर्वक जोड़ दिया है!'
        : 'AI automatically added the Government Scheme & Official Portal Link!'
    );
  };

  return (
    <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-5" data-testid="smart-dashboard-hub">
      {/* 0. AI Autonomous Scheme Discovery Bar: Auto-Add New (2025-26) + All 36 States + Purani Schemes */}
      <div
        data-testid="ai-autonomous-sync-bar"
        className="rounded-2xl border border-blue-200/90 bg-slate-900 bg-linear-to-r bg-gradient-to-r from-slate-900 via-blue-950 to-teal-950 p-3.5 sm:p-4 text-white shadow-md"
      >
        <div className="flex flex-col justify-between gap-3.5 lg:flex-row lg:items-center">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/20 px-2.5 sm:px-3 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-teal-200 ring-1 ring-teal-300/30">
                <Bot className="h-3.5 w-3.5 text-teal-300 shrink-0" />
                <span>
                  {currentLang === 'pa'
                    ? 'AI ਆਟੋਮੈਟਿਕ ਸਕੀਮ ਐਡਮਿਨ (ਸਾਰੇ 36 ਰਾਜ + ਕੇਂਦਰੀ ਸਕੀਮਾਂ)'
                    : currentLang === 'hi'
                    ? 'AI ऑटोमैटिक योजना एडमिन (सभी 36 राज्य + केंद्रीय योजनाएं)'
                    : 'AI Autonomous Scheme Sync (All 36 States/UTs + Central + Purani)'}
                </span>
              </span>
              <button
                type="button"
                data-testid="toggle-ai-autosync-btn"
                onClick={() => onToggleAiAutoSync?.(!isAiAutoSyncEnabled)}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition cursor-pointer ${
                  isAiAutoSyncEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40'
                    : 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isAiAutoSyncEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {isAiAutoSyncEnabled
                  ? `Auto-Sync ON (${evaluations.length} Total Schemes)`
                  : `Auto-Sync Paused (${evaluations.length} Total Schemes)`}
              </button>
              <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-200">
                Online + Offline Hybrid Engine
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-blue-100/90 leading-relaxed">
              {currentLang === 'pa'
                ? 'AI ਐਡਮਿਨ ਆਪਣੇ ਆਪ ਭਾਰਤ ਦੇ ਸਾਰੇ 28 ਰਾਜਾਂ, 8 ਕੇਂਦਰ ਸ਼ਾਸਤ ਪ੍ਰਦੇਸ਼ਾਂ ਅਤੇ ਕੇਂਦਰ ਸਰਕਾਰ ਦੀਆਂ ਨਵੀਆਂ ਅਤੇ ਪੁਰਾਣੀਆਂ ਸਕੀਮਾਂ ਆਨਲਾਈਨ ਅਤੇ ਆਫ਼ਲਾਈਨ ਦੋਵੇਂ ਮੋਡ ਵਿੱਚ ਜੋੜਦਾ ਰਹਿੰਦਾ ਹੈ।'
                : currentLang === 'hi'
                ? 'AI एडमिन स्वचालित रूप से सभी 28 राज्यों, 8 केंद्र शासित प्रदेशों और केंद्र सरकार की नई व पुरानी योजनाएं ऑनलाइन और ऑफ़लाइन दोनों मोड में जोड़ता रहता है।'
                : 'AI Admin continuously discovers and auto-adds new (2025–2026) and classic (Purani) schemes across all 28 States & 8 Union Territories in both Online and Offline modes.'}
            </p>
            {latestAutoAddedTitle && (
              <p className="text-[11px] font-semibold text-teal-300 truncate" data-testid="latest-ai-added-ticker">
                ⚡ Latest AI Auto-Added: <span className="text-white underline decoration-teal-400/60">{latestAutoAddedTitle}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2">
            {onTriggerAiDiscovery && (
              <button
                type="button"
                data-testid="ai-auto-add-next-btn"
                disabled={isAiDiscovering}
                onClick={async () => {
                  await onTriggerAiDiscovery(undefined);
                  setSyncNotice(
                    currentLang === 'pa'
                      ? 'AI ਐਡਮਿਨ ਨੇ ਆਪਣੇ ਆਪ ਇੱਕ ਨਵੀਂ ਸਰਕਾਰੀ ਸਕੀਮ ਖੋਜ ਕੇ ਜੋੜ ਦਿੱਤੀ ਹੈ!'
                      : currentLang === 'hi'
                      ? 'AI एडमिन ने स्वचालित रूप से एक नई सरकारी योजना खोज कर जोड़ दी है!'
                      : 'AI Admin autonomously discovered and added a new Government Scheme!'
                  );
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 shadow-sm transition hover:bg-emerald-300 disabled:opacity-60 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {currentLang === 'pa'
                    ? 'AI ਨਾਲ ਨਵੀਂ ਸਕੀਮ ਹੁਣੇ ਜੋੜੋ'
                    : currentLang === 'hi'
                    ? 'AI से नई योजना अभी जोड़ें'
                    : 'AI Auto-Add New Scheme Now'}
                </span>
              </button>
            )}
            {onSyncAllAiSchemes && (
              <button
                type="button"
                data-testid="sync-all-ai-schemes-btn"
                onClick={() => {
                  onSyncAllAiSchemes();
                  setSyncNotice(
                    currentLang === 'pa'
                      ? 'ਸਾਰੇ ਰਾਜਾਂ ਦੀਆਂ ਨਵੀਆਂ ਅਤੇ ਪੁਰਾਣੀਆਂ ਸਕੀਮਾਂ AI ਦੁਆਰਾ ਜੋੜ ਦਿੱਤੀਆਂ ਗਈਆਂ ਹਨ!'
                      : currentLang === 'hi'
                      ? 'सभी राज्यों की नई और पुरानी योजनाएं AI द्वारा जोड़ दी गई हैं!'
                      : 'All 36 States/UTs New (2026) & Purani (Classic) schemes synced by AI!'
                  );
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 shadow-sm transition hover:bg-teal-300 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 shrink-0 ${isAiDiscovering ? 'animate-spin' : ''}`} />
                <span>
                  {currentLang === 'pa'
                    ? 'ਸਾਰੇ ਰਾਜਾਂ ਦੀਆਂ ਸਕੀਮਾਂ ਸਿੰਕ ਕਰੋ'
                    : currentLang === 'hi'
                    ? 'सभी राज्यों की योजनाएं सिंक करें'
                    : 'Sync All States + Purani Schemes'}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigateTab('admin')}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300 shrink-0" />
              <span>{currentLang === 'pa' ? 'AI ਐਡਮਿਨ ਪੈਨਲ' : currentLang === 'hi' ? 'AI एडमिन पैनल' : 'AI Admin Console'}</span>
            </button>
          </div>
        </div>

        {/* Era Filter Pills + Quick On-Demand AI Add Input */}
        <div className="mt-3.5 flex flex-col justify-between gap-3 border-t border-white/15 pt-3.5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap" role="group" aria-label="Scheme Era Filter">
            <button
              type="button"
              data-testid="era-filter-all"
              onClick={() => onUpdateFilters({ schemeEra: 'all' })}
              className={`shrink-0 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeEra === 'all'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'bg-white/10 text-blue-100 hover:bg-white/20'
              }`}
            >
              {currentLang === 'pa'
                ? `ਸਾਰੀਆਂ ਸਕੀਮਾਂ (${evaluations.length})`
                : currentLang === 'hi'
                ? `सभी योजनाएं (${evaluations.length})`
                : `All Schemes (${evaluations.length})`}
            </button>
            <button
              type="button"
              data-testid="era-filter-new"
              onClick={() => onUpdateFilters({ schemeEra: 'new' })}
              className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeEra === 'new'
                  ? 'bg-emerald-400 text-slate-950 shadow-xs'
                  : 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30 hover:bg-emerald-500/30'
              }`}
            >
              <Sparkles className="h-3 w-3 shrink-0" />
              <span>
                {currentLang === 'pa'
                  ? `ਨਵੀਆਂ ਸਕੀਮਾਂ 2025-26 (${newSchemesCount})`
                  : currentLang === 'hi'
                  ? `नई योजनाएं 2025-26 (${newSchemesCount})`
                  : `New Schemes 2025-26 (${newSchemesCount})`}
              </span>
            </button>
            <button
              type="button"
              data-testid="era-filter-purani"
              onClick={() => onUpdateFilters({ schemeEra: 'purani' })}
              className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeEra === 'purani'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/30 hover:bg-amber-500/30'
              }`}
            >
              <History className="h-3 w-3 shrink-0" />
              <span>
                {currentLang === 'pa'
                  ? `ਪੁਰਾਣੀਆਂ / ਸਦਾਬਹਾਰ ਸਕੀਮਾਂ (${puraniSchemesCount})`
                  : currentLang === 'hi'
                  ? `पुरानी / सदाबहार योजनाएं (${puraniSchemesCount})`
                  : `Purani / Classic Schemes (${puraniSchemesCount})`}
              </span>
            </button>
            <button
              type="button"
              data-testid="era-filter-ai-added"
              onClick={() => onUpdateFilters({ schemeEra: 'ai-added' })}
              className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeEra === 'ai-added'
                  ? 'bg-teal-400 text-slate-950 shadow-xs'
                  : 'bg-teal-500/20 text-teal-200 ring-1 ring-teal-400/30 hover:bg-teal-500/30'
              }`}
            >
              <Bot className="h-3 w-3 shrink-0" />
              <span>
                {currentLang === 'pa'
                  ? `AI ਦੁਆਰਾ ਜੋੜੀਆਂ (${aiAutoAddedCount})`
                  : currentLang === 'hi'
                  ? `AI द्वारा जोड़ी गई (${aiAutoAddedCount})`
                  : `AI Auto-Added (${aiAutoAddedCount})`}
              </span>
            </button>
          </div>

          {onTriggerAiDiscovery && (
            <form onSubmit={handleQuickAiAddSubmit} className="flex w-full sm:w-auto items-center gap-2">
              <input
                type="text"
                data-testid="dashboard-ai-topic-input"
                value={quickAiTopic}
                onChange={(e) => setQuickAiTopic(e.target.value)}
                placeholder={
                  currentLang === 'pa'
                    ? 'ਕੋਈ ਵੀ ਨਵੀਂ ਜਾਂ ਪੁਰਾਣੀ ਸਕੀਮ ਦਾ ਨਾਮ ਲਿਖੋ...'
                    : currentLang === 'hi'
                    ? 'कोई भी नई या पुरानी योजना का नाम लिखें...'
                    : 'Type any New or Purani scheme for AI to add...'
                }
                className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-blue-200/70 outline-none focus:border-teal-300 sm:w-64"
              />
              <button
                type="submit"
                disabled={isAiDiscovering}
                data-testid="dashboard-ai-add-btn"
                className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-slate-950 transition hover:bg-blue-50 disabled:opacity-60 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{isAiDiscovering ? 'Adding…' : 'AI Add'}</span>
              </button>
            </form>
          )}
        </div>

        {syncNotice && (
          <p role="status" className="mt-2.5 text-xs font-bold text-emerald-300">
            ✓ {syncNotice}
          </p>
        )}
      </div>

      {/* 1. Provenance & Trust Strip: Verified Govt Data vs. AI Guidance */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-teal-200/80 bg-gradient-to-r from-teal-50/90 via-white to-blue-50/80 px-4 py-3 shadow-2xs dark:border-teal-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/50 sm:flex-row sm:items-center">
        <div className="flex items-start gap-2.5 sm:items-center">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold tracking-tight text-slate-900 dark:text-white">
                {currentLang === 'pa'
                  ? 'ਪ੍ਰਮਾਣਿਤ ਸਰਕਾਰੀ ਡੇਟਾ (.gov.in) ਬਨਾਮ AI ਮਾਰਗਦਰਸ਼ਨ'
                  : currentLang === 'hi'
                  ? 'सत्यापित सरकारी डेटा (.gov.in) बनाम AI मार्गदर्शन'
                  : 'Verified Government Data (.gov.in) vs. AI Guidance'}
              </span>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                100% Official Portals
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              {currentLang === 'pa'
                ? 'ਸਾਰੀਆਂ ਯੋਗਤਾ ਸ਼ਰਤਾਂ ਅਤੇ ਅਰਜ਼ੀ ਲਿੰਕ ਅਧਿਕਾਰਤ ਸਰਕਾਰੀ ਗਜ਼ਟ (.gov.in / .nic.in) ਤੋਂ ਹਨ। AI ਸਲਾਹ ਸਿਰਫ਼ ਮਾਰਗਦਰਸ਼ਨ ਲਈ ਹੈ।'
                : currentLang === 'hi'
                ? 'सभी पात्रता नियम और आवेदन लिंक आधिकारिक सरकारी गजट (.gov.in / .nic.in) से हैं। AI सलाह केवल मार्गदर्शन के लिए है।'
                : 'All scheme rules, benefits & application links point to official .gov.in / .nic.in portals. AI summaries are clearly labeled as guidance.'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('tracker')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <ClipboardCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>
              {currentLang === 'pa' ? 'ਅਰਜ਼ੀ ਟ੍ਰੈਕਰ' : currentLang === 'hi' ? 'आवेदन ट्रैकर' : 'Application Tracker'}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Important Government Announcements & Verified Portals */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              {currentLang === 'pa'
                ? 'ਮਹੱਤਵਪੂਰਨ ਸਰਕਾਰੀ ਸੂਚਨਾਵਾਂ ਅਤੇ ਪੋਰਟਲ'
                : currentLang === 'hi'
                ? 'महत्वपूर्ण सरकारी घोषणाएं और पोर्टल'
                : 'Important Government Announcements & Official Portals'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('deadlines')}
            className="text-xs font-bold text-blue-700 hover:underline dark:text-blue-400 cursor-pointer"
          >
            {currentLang === 'pa' ? 'ਸਾਰੀਆਂ ਮਿਤੀਆਂ ਦੇਖੋ →' : currentLang === 'hi' ? 'सभी तिथियां देखें →' : 'View All Deadlines →'}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {OFFICIAL_GOV_ANNOUNCEMENTS.map((ann) => {
            const badge =
              currentLang === 'pa' ? ann.badgePa : currentLang === 'hi' ? ann.badgeHi : ann.badgeEn;
            const title =
              currentLang === 'pa' ? ann.titlePa : currentLang === 'hi' ? ann.titleHi : ann.titleEn;
            return (
              <div
                key={ann.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 transition hover:border-blue-300 dark:border-slate-800 dark:bg-slate-800/50"
              >
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        ann.isUrgent
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {badge}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                      .gov.in
                    </span>
                  </div>
                  <p className="text-xs font-semibold leading-snug text-slate-800 dark:text-slate-100">
                    {title}
                  </p>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px] dark:border-slate-700/60">
                  <span className="truncate text-slate-500 dark:text-slate-400">{ann.departmentEn}</span>
                  <a
                    href={ann.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 font-bold text-blue-700 hover:underline dark:text-blue-400"
                  >
                    <span>Portal</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Multi-Faceted Advanced Search & Filter Engine */}
      <div
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
        data-testid="advanced-search-panel"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-700 dark:text-blue-400" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {currentLang === 'pa'
                ? 'ਉੱਨਤ ਸਕੀਮ ਫਿਲਟਰ (ਰਾਜ, ਉਮਰ, ਆਮਦਨ, ਸਿੱਖਿਆ, ਕਿੱਤਾ)'
                : currentLang === 'hi'
                ? 'उन्नत योजना फ़िल्टर (राज्य, आयु, आय, शिक्षा, व्यवसाय)'
                : 'Advanced Scheme Filter (State, Age, Income, Education & Occupation)'}
            </h2>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-blue-700 px-2 py-0.5 text-[11px] font-bold text-white">
                {activeFilterCount} Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                type="button"
                data-testid="reset-advanced-filters-btn"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>{currentLang === 'pa' ? 'ਰੀਸੈੱਟ' : currentLang === 'hi' ? 'रीसेट' : 'Reset Filters'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsFilterExpanded((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
            >
              <span>{isFilterExpanded ? 'Hide' : 'Show'}</span>
              {isFilterExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Target Group Quick Pills (Women, Students, Farmers, Business Owners) */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap">
          {targetGroupButtons.map((group) => {
            const isSelected = advancedFilters.targetGroup === group.id;
            const label =
              currentLang === 'pa' ? group.labelPa : currentLang === 'hi' ? group.labelHi : group.labelEn;
            return (
              <button
                key={group.id}
                type="button"
                data-testid={`target-group-${group.id}`}
                onClick={() => onUpdateFilters({ targetGroup: group.id })}
                className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                {group.icon}
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {isFilterExpanded && (
          <div className="mt-3.5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3.5 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-5">
            {/* State / Level Filter */}
            <div>
              <label
                htmlFor="filter-level"
                className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                {currentLang === 'pa' ? 'ਰਾਜ / ਕੇਂਦਰ ਸਰਕਾਰ (36 States/UTs)' : currentLang === 'hi' ? 'राज्य / केंद्र सरकार (36 States/UTs)' : 'State / Central Level (All 36 States)'}
              </label>
              <select
                id="filter-level"
                data-testid="filter-level-select"
                value={advancedFilters.level}
                onChange={(e) => onUpdateFilters({ level: e.target.value as LevelFilter })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="all">All India (Central + All 36 States/UTs)</option>
                <option value="Central Government">Central Government (India)</option>
                <option value="Punjab State">Punjab State Government</option>
                <optgroup label="All 28 Indian States & 8 Union Territories">
                  {INDIA_STATES_AND_UTS.map((st) => (
                    <option key={st.code} value={st.name === 'Punjab' ? 'Punjab State' : st.name}>
                      {st.name} ({st.namePa}) — {st.districts.length} Districts
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Age Filter */}
            <div>
              <label
                htmlFor="filter-age"
                className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                {currentLang === 'pa' ? 'ਉਮਰ ਵਰਗ' : currentLang === 'hi' ? 'आयु वर्ग' : 'Age Group'}
              </label>
              <select
                id="filter-age"
                data-testid="filter-age-select"
                value={advancedFilters.ageBracket}
                onChange={(e) => onUpdateFilters({ ageBracket: e.target.value as AgeBracketFilter })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="all">Any Age</option>
                <option value="under18">Under 18 (Children / School)</option>
                <option value="18to25">18–25 Years (College / Youth)</option>
                <option value="26to45">26–45 Years (Working Adults)</option>
                <option value="46to59">46–59 Years</option>
                <option value="60plus">60+ Years (Senior Citizens)</option>
              </select>
            </div>

            {/* Annual Income Filter */}
            <div>
              <label
                htmlFor="filter-income"
                className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                {currentLang === 'pa' ? 'ਸਾਲਾਨਾ ਆਮਦਨ' : currentLang === 'hi' ? 'वार्षिक आय' : 'Annual Family Income'}
              </label>
              <select
                id="filter-income"
                data-testid="filter-income-select"
                value={advancedFilters.maxIncome === null ? 'all' : String(advancedFilters.maxIncome)}
                onChange={(e) =>
                  onUpdateFilters({
                    maxIncome: e.target.value === 'all' ? null : Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="all">Any Income Level</option>
                <option value="60000">Up to ₹60,000 (BPL / Antyodaya)</option>
                <option value="150000">Up to ₹1.5 Lakh / year</option>
                <option value="250000">Up to ₹2.5 Lakh / year</option>
                <option value="500000">Up to ₹5.0 Lakh / year</option>
              </select>
            </div>

            {/* Education Filter */}
            <div>
              <label
                htmlFor="filter-education"
                className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                {currentLang === 'pa' ? 'ਸਿੱਖਿਆ ਪੱਧਰ' : currentLang === 'hi' ? 'शिक्षा स्तर' : 'Education / Skill Level'}
              </label>
              <select
                id="filter-education"
                data-testid="filter-education-select"
                value={advancedFilters.educationLevel}
                onChange={(e) => onUpdateFilters({ educationLevel: e.target.value as EducationLevelFilter })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="all">All Education Levels</option>
                <option value="enrolled">School / College Enrolled</option>
                <option value="skill">Skill / Vocational / Artisan</option>
                <option value="general">General (No Degree Needed)</option>
              </select>
            </div>

            {/* Occupation Filter */}
            <div>
              <label
                htmlFor="filter-occupation"
                className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                {currentLang === 'pa' ? 'ਕਿੱਤਾ (Occupation)' : currentLang === 'hi' ? 'व्यवसाय (Occupation)' : 'Occupation'}
              </label>
              <select
                id="filter-occupation"
                data-testid="filter-occupation-select"
                value={advancedFilters.occupation}
                onChange={(e) => onUpdateFilters({ occupation: e.target.value as Occupation | 'All' })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="All">All Occupations</option>
                <option value="Student">Student (ਵਿਦਿਆਰਥੀ)</option>
                <option value="Farmer">Farmer (ਕਿਸਾਨ)</option>
                <option value="Daily Wage Worker">Daily Wage Worker (ਮਜ਼ਦੂਰ)</option>
                <option value="Self-Employed">Self-Employed / Business</option>
                <option value="Unemployed Youth">Unemployed Youth</option>
                <option value="Senior Citizen">Senior Citizen (ਬਜ਼ੁਰਗ)</option>
                <option value="Homemaker">Homemaker (ਗ੍ਰਹਿਣੀ)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 4. Smart Dashboard Overview Grid: Personalized Top Picks, Recently Viewed & Saved/Eligibility Status */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Card A: Personalized Top Recommendations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {currentLang === 'pa'
                  ? 'ਤੁਹਾਡੇ ਲਈ ਸਿਫਾਰਸ਼ ਕੀਤੀਆਂ ਸਕੀਮਾਂ'
                  : currentLang === 'hi'
                  ? 'आपके लिए अनुशंसित योजनाएं'
                  : 'Recommended For Your Profile'}
              </h3>
            </div>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {profile.occupation} • {profile.district}
            </span>
          </div>
          <div className="space-y-2">
            {topRecommended.map(({ scheme, matchPercentage }) => (
              <button
                key={scheme.id}
                type="button"
                onClick={() => onOpenSchemeDetails(scheme)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-left transition hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-blue-700 cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                    {getSchemeTitle(scheme)}
                  </p>
                  <p className="truncate text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                    {scheme.benefitAmountText}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {matchPercentage}% Match
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Card B: Recently Viewed Schemes */}
        <div
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
          data-testid="recently-viewed-widget"
        >
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <History className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {currentLang === 'pa'
                  ? 'ਹਾਲ ਹੀ ਵਿੱਚ ਦੇਖੀਆਂ ਸਕੀਮਾਂ'
                  : currentLang === 'hi'
                  ? 'हाल ही में देखी गई योजनाएं'
                  : 'Recently Viewed Schemes'}
              </h3>
            </div>
            {recentlyViewedSchemes.length > 0 && (
              <button
                type="button"
                onClick={onClearRecentlyViewed}
                className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          {recentlyViewedSchemes.length === 0 ? (
            <div className="flex h-[132px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3 text-center dark:border-slate-800 dark:bg-slate-800/30">
              <Clock className="mb-1.5 h-5 w-5 text-slate-400" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {currentLang === 'pa'
                  ? 'ਕਿਸੇ ਵੀ ਸਕੀਮ ਦੇ ਵੇਰਵੇ ਜਾਂ ਦਸਤਾਵੇਜ਼ ਖੋਲ੍ਹੋ, ਉਹ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੀਆਂ।'
                  : currentLang === 'hi'
                  ? 'किसी भी योजना का विवरण खोलें, वह यहाँ दिखाई देगी।'
                  : 'Inspect any scheme card, benefit estimator, or checklist to access it quickly here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentlyViewedSchemes.slice(0, 3).map((scheme) => (
                <button
                  key={scheme.id}
                  type="button"
                  onClick={() => onOpenSchemeDetails(scheme)}
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-left transition hover:border-teal-300 hover:bg-teal-50/40 dark:border-slate-800 dark:bg-slate-800/60 cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {getSchemeTitle(scheme)}
                    </p>
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {scheme.level} • {scheme.benefitType}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Card C: Eligibility Status, Saved Schemes & Official Tracking Summary */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {currentLang === 'pa'
                    ? 'ਯੋਗਤਾ ਅਤੇ ਸੇਵ ਕੀਤੀਆਂ ਸਕੀਮਾਂ'
                    : currentLang === 'hi'
                    ? 'पात्रता और सहेजी गई योजनाएं'
                    : 'Eligibility & Saved Status'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('profile')}
                className="text-[11px] font-bold text-blue-700 hover:underline dark:text-blue-400 cursor-pointer"
              >
                Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/70 p-2.5 dark:border-emerald-900/60 dark:bg-emerald-950/40">
                <div className="font-mono text-lg font-extrabold text-emerald-800 dark:text-emerald-300">
                  {eligibleCount}
                </div>
                <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  Eligible
                </div>
              </div>
              <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 p-2.5 dark:border-amber-900/60 dark:bg-amber-950/40">
                <div className="font-mono text-lg font-extrabold text-amber-800 dark:text-amber-300">
                  {partialCount}
                </div>
                <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                  Potential
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('saved')}
                className="rounded-xl border border-blue-200/70 bg-blue-50/70 p-2.5 transition hover:bg-blue-100/70 dark:border-blue-900/60 dark:bg-blue-950/40 cursor-pointer"
              >
                <div className="font-mono text-lg font-extrabold text-blue-800 dark:text-blue-300">
                  {savedSchemeIds.length}
                </div>
                <div className="flex items-center justify-center gap-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-400">
                  <Bookmark className="h-2.5 w-2.5" />
                  <span>Saved</span>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[11px] dark:bg-slate-800/70">
            <span className="font-medium text-slate-600 dark:text-slate-300">
              Official Sewa Kendra & Scholarship Tracking
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('tracker')}
              className="font-bold text-blue-700 hover:underline dark:text-blue-400 cursor-pointer"
            >
              Track →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
