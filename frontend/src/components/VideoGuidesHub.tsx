import React, { useEffect, useState } from 'react';
import { Language, Scheme } from '../types/scheme';
import { GOV_SCHEMES } from '../data/schemes';
import { getSchemeYoutubeBundle } from '../data/schemeVideos';
import {
  Youtube,
  Play,
  Clock,
  ExternalLink,
  Search,
  Sparkles,
  CheckCircle2,
  FileText,
  Volume2,
  Square,
  Building2,
  Bot,
} from 'lucide-react';

interface VideoGuidesHubProps {
  language?: Language;
  currentLang?: Language;
  schemes?: Scheme[];
  initialSchemeId?: string;
  onSelectScheme: (scheme: Scheme) => void;
  onTrackScheme?: (scheme: Scheme) => void;
  onOpenScannerForScheme?: (scheme: Scheme) => void;
  onAskChatbot?: (question: string) => void;
}

export const VideoGuidesHub: React.FC<VideoGuidesHubProps> = ({
  language: languageProp,
  currentLang,
  schemes = GOV_SCHEMES,
  initialSchemeId,
  onSelectScheme,
  onAskChatbot,
}) => {
  const language: Language = currentLang || languageProp || 'en';
  const [selectedScheme, setSelectedScheme] = useState<Scheme>(() => {
    if (initialSchemeId) {
      const found = schemes.find((s) => s.id === initialSchemeId);
      if (found) return found;
    }
    return schemes[0] || GOV_SCHEMES[0];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [videoStartSeconds, setVideoStartSeconds] = useState(0);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (initialSchemeId) {
      const found = schemes.find((s) => s.id === initialSchemeId);
      if (found) {
        setSelectedScheme(found);
        setSelectedVideoIndex(0);
        setVideoStartSeconds(0);
      }
    }
  }, [initialSchemeId]);

  useEffect(() => {
    const updatedMatch = schemes.find((s) => s.id === selectedScheme?.id);
    if (updatedMatch) {
      setSelectedScheme(updatedMatch);
    } else if (schemes.length > 0) {
      setSelectedScheme(schemes[0]);
    }
  }, [schemes]);

  const categories = [
    'ALL',
    'Scholarship',
    'Direct Cash Transfer',
    'Subsidy',
    'Loan/Credit',
    'Pension',
    'Health Cover',
    'Housing',
    'In-Kind/Ration',
  ];

  const filteredSchemes = schemes.filter((s) => {
    const matchesCat = categoryFilter === 'ALL' || s.benefitType === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;
    const matchesText =
      s.titleEn.toLowerCase().includes(q) ||
      s.titlePa.toLowerCase().includes(q) ||
      s.titleHi.toLowerCase().includes(q) ||
      (s.youtubeVideoTitle || '').toLowerCase().includes(q) ||
      s.categoryTags.some((tag) => tag.toLowerCase().includes(q));
    return matchesCat && matchesText;
  });

  const getTitle = (s: Scheme) =>
    language === 'pa' ? s.titlePa : language === 'hi' ? s.titleHi : s.titleEn;
  const getDept = (s: Scheme) =>
    language === 'pa' ? s.departmentPa : language === 'hi' ? s.departmentHi : s.departmentEn;
  const getDesc = (s: Scheme) =>
    language === 'pa' ? s.descriptionPa : language === 'hi' ? s.descriptionHi : s.descriptionEn;

  const selectedYtBundle = getSchemeYoutubeBundle(selectedScheme);
  const activeVideoId =
    selectedYtBundle.videoIds[selectedVideoIndex] || selectedYtBundle.primaryVideoId;

  const handleSpeakSummary = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const stepsText = selectedScheme.applicationSteps
      .map(
        (st) =>
          `Step ${st.stepNumber}: ${
            language === 'pa' ? st.titlePa : language === 'hi' ? st.titleHi : st.titleEn
          }`
      )
      .join('. ');

    const text = `${getTitle(selectedScheme)}. ${getDesc(selectedScheme)}. Application steps: ${stepsText}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'pa' ? 'pa-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-extrabold uppercase tracking-wider">
              <Youtube className="w-4 h-4 text-rose-400" />
              <span>
                {language === 'pa'
                  ? 'ਹਰ ਸਕੀਮ ਲਈ ਵੱਖਰੀ ਯੂਟਿਊਬ ਵੀਡੀਓ ਗਾਈਡ'
                  : language === 'hi'
                    ? 'प्रत्येक योजना के लिए अलग यूट्यूब वीडियो गाइड'
                    : 'Scheme-Specific YouTube Video Tutorials & Links'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'pa'
                ? 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਭਰਨ ਦੀਆਂ ਵੀਡੀਓ ਗਾਈਡਾਂ (YouTube)'
                : language === 'hi'
                  ? 'सरकारी योजनाओं की आवेदन वीडियो गाइड (YouTube)'
                  : 'Step-by-Step Government Scheme Video Tutorials'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {language === 'pa'
                ? 'ਹਰ ਸਰਕਾਰੀ ਸਕੀਮ ਲਈ ਉਸਦੀ ਆਪਣੀ ਵੱਖਰੀ ਯੂਟਿਊਬ ਵੀਡੀਓ ਅਤੇ ਸਿੱਧਾ ਯੂਟਿਊਬ ਲਿੰਕ ਉਪਲਬਧ ਹੈ ਤਾਂ ਜੋ ਤੁਸੀਂ ਆਸਾਨੀ ਨਾਲ ਫਾਰਮ ਭਰ ਸਕੋ।'
                : language === 'hi'
                  ? 'प्रत्येक योजना के लिए उसका अपना अलग यूट्यूब ट्यूटोरियल वीडियो और सीधा यूट्यूब लिंक उपलब्ध है।'
                  : 'Every scheme features its own dedicated YouTube video tutorials, interactive step chapters, and direct YouTube links in Punjabi, Hindi, and English.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 text-center">
              <span className="text-2xl font-black text-amber-400 block">{schemes.length}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Unique Scheme Videos
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 text-center">
              <span className="text-2xl font-black text-emerald-400 block">
                {schemes.length * 3}+
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                YouTube Links
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Theater Player + Active Scheme Walkthrough */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Embedded Video Player & Timestamps */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[11px] font-extrabold uppercase tracking-wider">
                  Now Playing
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 text-[11px] font-bold">
                  {selectedScheme.benefitType}
                </span>
                {selectedScheme.id.startsWith('ai-') && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold">
                    <Bot className="w-3 h-3" />
                    AI Admin Synced Video
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1.5">
                {getTitle(selectedScheme)}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                {getDept(selectedScheme)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSpeakSummary}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSpeaking
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                {isSpeaking ? (
                  <Square className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                )}
                <span>{isSpeaking ? 'Stop Audio' : 'Voice Summary'}</span>
              </button>

              <a
                href={`https://www.youtube.com/watch?v=${activeVideoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Switch Between 3 Scheme-Specific Videos */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {selectedYtBundle.videoIds.map((vid, idx) => (
                <button
                  key={vid}
                  type="button"
                  onClick={() => {
                    setSelectedVideoIndex(idx);
                    setVideoStartSeconds(0);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border ${
                    selectedVideoIndex === idx
                      ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-rose-300'
                  }`}
                >
                  <Play className="w-3 h-3" />
                  <span>
                    {idx === 0
                      ? 'Tutorial 1: Online Apply'
                      : idx === 1
                        ? 'Tutorial 2: Documents'
                        : 'Tutorial 3: Status Check'}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={selectedYtBundle.punjabiSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
              >
                <span>ਪੰਜਾਬੀ YouTube Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={selectedYtBundle.hindiSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
              >
                <span>हिंदी YouTube Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* 16:9 YouTube Player */}
          <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950 shadow-xl border border-slate-800 aspect-video">
            <iframe
              key={`${selectedScheme.id}-${activeVideoId}-${videoStartSeconds}`}
              className="w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?start=${videoStartSeconds}&rel=0&modestbranding=1`}
              title={selectedYtBundle.videoTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Interactive Chapters */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                Jump to Application Step Timestamp
              </h4>
              <span className="text-[11px] font-semibold text-slate-400">
                Click any chapter to seek video
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => setVideoStartSeconds(0)}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  videoStartSeconds === 0
                    ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-teal-700 text-white text-[10px] font-mono font-bold">
                    00:00
                  </span>
                  <span className="text-xs font-bold">Introduction & Benefit Overview</span>
                </div>
                <Play className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              </button>

              {selectedScheme.applicationSteps.map((step, idx) => {
                const sec = (idx + 1) * 45;
                const minLabel = Math.floor(sec / 60)
                  .toString()
                  .padStart(2, '0');
                const secLabel = (sec % 60).toString().padStart(2, '0');
                const stepTitle =
                  language === 'pa'
                    ? step.titlePa
                    : language === 'hi'
                      ? step.titleHi
                      : step.titleEn;

                return (
                  <button
                    key={step.stepNumber}
                    onClick={() => setVideoStartSeconds(sec)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      videoStartSeconds === sec
                        ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 pr-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-white text-[10px] font-mono font-bold shrink-0">
                        {minLabel}:{secLabel}
                      </span>
                      <span className="text-xs font-bold line-clamp-1">{stepTitle}</span>
                    </div>
                    <Play className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Action Footer for Active Video Scheme */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectScheme(selectedScheme)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Open Benefit Estimator & Checklist</span>
              </button>

              <button
                onClick={() =>
                  onAskChatbot?.(
                    `Explain the online application process for ${selectedScheme.titleEn} in simple steps.`
                  )
                }
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Ask AI Sahayak</span>
              </button>
            </div>

            <a
              href={selectedScheme.officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-sm"
            >
              <span>Apply on {selectedScheme.officialPortalName}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Right 5 Cols: Scheme Video Playlist Directory */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col max-h-[760px]">
          <div className="space-y-3 pb-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                All Scheme Video Tutorials ({filteredSchemes.length})
              </h4>
              <span className="text-xs font-bold text-teal-700">Select to Play</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search video tutorial by scheme name..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    categoryFilter === cat
                      ? 'bg-teal-800 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Video Cards List with Unique Thumbnails & Direct YouTube Links */}
          <div className="mt-3 space-y-2.5 overflow-y-auto pr-1 flex-1">
            {filteredSchemes.map((s) => {
              const isSelected = s.id === selectedScheme.id;
              const bundle = getSchemeYoutubeBundle(s);
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedScheme(s);
                    setSelectedVideoIndex(0);
                    setVideoStartSeconds(0);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-rose-50/80 border-rose-400 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200/90'
                  }`}
                >
                  <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                    <img
                      src={`https://img.youtube.com/vi/${bundle.primaryVideoId}/hqdefault.jpg`}
                      alt={getTitle(s)}
                      loading="lazy"
                      className="w-full h-full object-cover opacity-85"
                    />
                    <span
                      className={`absolute inset-0 flex items-center justify-center ${
                        isSelected ? 'bg-rose-600/40' : 'bg-black/30'
                      }`}
                    >
                      <Play className="w-5 h-5 text-white fill-current" />
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700">
                        {s.benefitType}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {bundle.videoIds.length} Videos
                      </span>
                    </div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">
                      {getTitle(s)}
                    </h5>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {bundle.videoTitle}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        {s.benefitAmountText}
                      </span>
                      <a
                        href={bundle.watchOnYoutubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:underline shrink-0"
                      >
                        <Youtube className="w-3 h-3" />
                        <span>YouTube Link</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
