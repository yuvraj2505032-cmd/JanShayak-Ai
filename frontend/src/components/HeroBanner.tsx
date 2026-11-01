import React, { useState, useRef } from 'react';
import { ArrowRight, Mic, MicOff, Search, ShieldCheck, Sparkles, Users, X } from 'lucide-react';
import { Language } from '../types/scheme';
import { TRANSLATIONS } from '../data/translations';
import { getSmartSearchSuggestions } from '../utils/advancedSchemeFilter';

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
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const filterItems = [
    { value: 'all', label: t.catAll },
    { value: 'Students', label: t.catStudents },
    { value: 'Women', label: currentLang === 'pa' ? 'ਔਰਤਾਂ (Women)' : currentLang === 'hi' ? 'महिलाएं (Women)' : 'Women' },
    { value: 'Farmers', label: currentLang === 'pa' ? 'ਕਿਸਾਨ (Farmers)' : currentLang === 'hi' ? 'किसान (Farmers)' : 'Farmers' },
    { value: 'Business Owners', label: currentLang === 'pa' ? 'ਕਾਰੋਬਾਰ (Business)' : currentLang === 'hi' ? 'व्यवसाय (Business)' : 'Business Owners' },
    { value: 'Agriculture', label: t.catAgriculture },
    { value: 'Health', label: t.catHealth },
    { value: 'Education', label: t.catEducation },
    { value: 'Finance', label: t.catFinance },
  ];

  const smartSuggestions = getSmartSearchSuggestions(searchQuery, currentLang);

  const handleVoiceSearchToggle = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Gracefully open AI voice assistant drawer or notify user
      setVoiceFeedback(
        currentLang === 'pa'
          ? 'ਤੁਹਾਡੇ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਸਿੱਧਾ ਮਾਈਕ ਉਪਲਬਧ ਨਹੀਂ ਹੈ — AI ਸਹਾਇਕ ਖੋਲ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ।'
          : currentLang === 'hi'
          ? 'ब्राउज़र में सीधा माइक उपलब्ध नहीं है — AI सहायक खोला जा रहा है।'
          : 'Direct browser mic not supported in this environment — opening Voice AI Assistant.'
      );
      onAskAI();
      setTimeout(() => setVoiceFeedback(null), 4000);
      return;
    }

    if (isVoiceListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsVoiceListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentLang === 'pa' ? 'pa-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsVoiceListening(true);
        setVoiceFeedback(
          currentLang === 'pa'
            ? '🎙️ ਪੰਜਾਬੀ ਵਿੱਚ ਬੋਲੋ...'
            : currentLang === 'hi'
            ? '🎙️ हिंदी में बोलें...'
            : '🎙️ Listening... Speak your scheme question'
        );
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          onSearchChange(transcript.trim());
        }
      };

      recognition.onerror = () => {
        setIsVoiceListening(false);
        setVoiceFeedback(null);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
        setTimeout(() => setVoiceFeedback(null), 2500);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsVoiceListening(false);
    }
  };

  return (
    <section className="bg-white px-4 pb-6 pt-5 transition-colors dark:bg-slate-950 sm:px-6 sm:pb-10 sm:pt-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(115deg,rgba(255,153,51,0.12)_0%,rgba(255,255,255,0.97)_47%,rgba(19,136,8,0.09)_100%)] px-5 py-10 text-center shadow-[0_24px_70px_-48px_rgba(15,23,42,0.34)] dark:border-slate-800 dark:bg-[linear-gradient(115deg,rgba(30,58,138,0.35)_0%,rgba(15,23,42,0.95)_50%,rgba(13,148,136,0.25)_100%)] sm:px-10 sm:py-14 lg:py-16">
          <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-orange-200/20 blur-3xl dark:bg-blue-500/10" />
          <div className="pointer-events-none absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl dark:bg-teal-500/10" />
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-4 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>{t.heroEyebrow}</span>
            </div>
            <h1 className="text-3xl font-bold leading-[1.15] tracking-[-0.03em] text-slate-950 dark:text-white sm:text-5xl">
              {t.heroTitle}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
              {t.heroSubtitle}
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onStartWizard}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-blue-700 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 cursor-pointer"
              >
                {t.heroCheckEligibility}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onOpenFamilyFinder}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/90 px-6 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Users className="h-4 w-4 text-slate-600 dark:text-slate-300" aria-hidden="true" />
                {t.heroFamilyFinder}
              </button>
            </div>
          </div>
        </div>

        {/* Natural Language & Voice Search Bar */}
        <div className="mx-auto mt-7 max-w-4xl">
          <div className="flex h-[60px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 shadow-[0_12px_36px_-26px_rgba(15,23,42,0.35)] transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:focus-within:border-blue-500 dark:focus-within:ring-blue-950 sm:gap-3 sm:px-5">
            <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
            <label className="sr-only" htmlFor="scheme-search">{t.heroSearchPlaceholder}</label>
            <input
              id="scheme-search"
              data-testid="hero-search-input"
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && searchQuery.trim()) onAskAI();
              }}
              placeholder={t.heroSearchPlaceholder}
              className="h-full min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500 sm:text-[17px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label={t.clearSearch}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              data-testid="hero-voice-search-btn"
              onClick={handleVoiceSearchToggle}
              aria-label={isVoiceListening ? 'Stop voice search' : 'Search schemes by voice'}
              title={isVoiceListening ? 'Stop voice search' : 'Voice search (English, Punjabi, Hindi)'}
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition cursor-pointer ${
                isVoiceListening
                  ? 'border-rose-500 bg-rose-600 text-white animate-pulse'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-600'
              }`}
            >
              {isVoiceListening ? (
                <MicOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Mic className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              disabled={!searchQuery.trim()}
              onClick={onAskAI}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-blue-700 px-3 text-xs font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-45 sm:px-4 sm:text-sm cursor-pointer"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>{t.heroAskAi}</span>
            </button>
          </div>

          {voiceFeedback && (
            <p className="mt-2 text-center text-xs font-semibold text-teal-700 dark:text-teal-300">
              {voiceFeedback}
            </p>
          )}

          {/* Smart Search Suggestions Bar */}
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              {currentLang === 'pa' ? 'ਸਮਾਰਟ ਖੋਜ:' : currentLang === 'hi' ? 'स्मार्ट खोज:' : 'Smart suggestions:'}
            </span>
            {smartSuggestions.slice(0, 4).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSearchChange(suggestion)}
                className="rounded-lg border border-slate-200/80 bg-slate-50/90 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-300 cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Primary Category Filter Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2" aria-label="Filter schemes by category">
            {filterItems.map((filter) => {
              const selected = activeFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  data-testid={`hero-filter-${filter.value.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onFilterChange(filter.value)}
                  aria-pressed={selected}
                  className={`rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition cursor-pointer ${
                    selected
                      ? 'bg-slate-900 text-white shadow-sm dark:bg-blue-600 dark:text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
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
