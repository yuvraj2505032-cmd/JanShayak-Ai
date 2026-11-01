import React, { useState } from 'react';
import { Language, Scheme } from '../types/scheme';
import {
  getUpcomingSavedSchemeDeadlines,
  getUnsavedUpcomingSchemeDeadlines,
  UpcomingSchemeDeadline
} from '../utils/deadlineAlerts';
import {
  BellRing,
  CalendarClock,
  ExternalLink,
  Calculator,
  ArrowRight,
  BookmarkCheck,
  BookmarkPlus,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';

interface SavedDeadlineBannerProps {
  schemes: Scheme[];
  savedSchemeIds: Set<string>;
  currentLang: Language;
  referenceDate?: Date;
  onOpenSchemeDetails: (
    scheme: Scheme,
    initialTab?: 'overview' | 'estimator' | 'eligibility' | 'documents' | 'steps' | 'tutorial'
  ) => void;
  onToggleSave: (scheme: Scheme) => void;
  onOpenDeadlineHub: () => void;
  onFilterSavedSchemes: () => void;
}

export const SavedDeadlineBanner: React.FC<SavedDeadlineBannerProps> = ({
  schemes,
  savedSchemeIds,
  currentLang,
  referenceDate,
  onOpenSchemeDetails,
  onToggleSave,
  onOpenDeadlineHub,
  onFilterSavedSchemes
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const upcomingSavedDeadlines = React.useMemo(
    () => getUpcomingSavedSchemeDeadlines(schemes, savedSchemeIds, referenceDate, 30),
    [schemes, savedSchemeIds, referenceDate]
  );

  const suggestedUrgentDeadlines = React.useMemo(
    () => getUnsavedUpcomingSchemeDeadlines(schemes, savedSchemeIds, referenceDate, 30).slice(0, 3),
    [schemes, savedSchemeIds, referenceDate]
  );

  const getSchemeTitle = (scheme: Scheme) => {
    if (currentLang === 'pa') return scheme.titlePa;
    if (currentLang === 'hi') return scheme.titleHi;
    return scheme.titleEn;
  };

  const getMilestoneLabel = (item: UpcomingSchemeDeadline) => {
    if (currentLang === 'pa') return item.milestoneLabelPa;
    if (currentLang === 'hi') return item.milestoneLabelHi;
    return item.milestoneLabelEn;
  };

  const getFormattedDate = (item: UpcomingSchemeDeadline) => {
    if (currentLang === 'pa') return item.formattedDatePa;
    if (currentLang === 'hi') return item.formattedDateHi;
    return item.formattedDateEn;
  };

  const getDaysRemainingText = (days: number) => {
    if (days === 0) {
      return currentLang === 'pa'
        ? 'ਅੱਜ ਆਖਰੀ ਦਿਨ'
        : currentLang === 'hi'
        ? 'आज अंतिम दिन'
        : 'Closes Today';
    }
    if (days === 1) {
      return currentLang === 'pa'
        ? '1 ਦਿਨ ਬਾਕੀ'
        : currentLang === 'hi'
        ? '1 दिन शेष'
        : '1 Day Left';
    }
    return currentLang === 'pa'
      ? `${days} ਦਿਨ ਬਾਕੀ`
      : currentLang === 'hi'
      ? `${days} दिन शेष`
      : `${days} Days Left`;
  };

  const getUrgencyLabel = (urgency: UpcomingSchemeDeadline['urgency']) => {
    if (urgency === 'critical') {
      return currentLang === 'pa' ? 'ਅਤਿ ਜ਼ਰੂਰੀ' : currentLang === 'hi' ? 'अति आवश्यक' : 'Critical Window';
    }
    if (urgency === 'urgent') {
      return currentLang === 'pa' ? 'ਜਲਦੀ ਅਪਲਾਈ ਕਰੋ' : currentLang === 'hi' ? 'शीघ्र आवेदन करें' : 'Closing Soon';
    }
    return currentLang === 'pa' ? '30-ਦਿਨਾਂ ਦੀ ਸਮਾਂ ਸੀਮਾ' : currentLang === 'hi' ? '30-दिवसीय समय सीमा' : 'Upcoming 30-Day Cutoff';
  };

  const earliestDays = upcomingSavedDeadlines.length > 0 ? upcomingSavedDeadlines[0].daysRemaining : null;

  return (
    <section
      aria-label="Upcoming application deadlines for saved schemes"
      data-testid="saved-deadline-notification-banner"
      className="rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/60 p-5 shadow-xs transition-all"
    >
      {/* Top Notification Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
            <BellRing className="h-5 w-5" aria-hidden="true" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-900 tabular-nums">
              <span className="uppercase tracking-wider text-amber-800">
                {currentLang === 'pa'
                  ? '30-ਦਿਨਾਂ ਦੀ ਡੈੱਡਲਾਈਨ ਅਲਰਟ'
                  : currentLang === 'hi'
                  ? '30-दिवसीय समय-सीमा अलर्ट'
                  : '30-Day Saved Scheme Deadline Alert'}
              </span>
              <span aria-hidden="true">·</span>
              <span data-testid="saved-deadline-alert-count" className="font-bold text-rose-700">
                {upcomingSavedDeadlines.length}{' '}
                {currentLang === 'pa'
                  ? 'ਸੇਵ ਕੀਤੀਆਂ ਸਕੀਮਾਂ ਦੀ ਆਖਰੀ ਮਿਤੀ ਨੇੜੇ ਹੈ'
                  : currentLang === 'hi'
                  ? 'सहेजी गई योजनाओं की अंतिम तिथि निकट है'
                  : upcomingSavedDeadlines.length === 1
                  ? 'saved scheme closing within 30 days'
                  : 'saved schemes closing within 30 days'}
              </span>
              {earliestDays !== null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-700">
                    {currentLang === 'pa'
                      ? `ਸਭ ਤੋਂ ਨੇੜਲੀ ਮਿਤੀ: ${earliestDays} ਦਿਨ ਬਾਕੀ`
                      : currentLang === 'hi'
                      ? `सबसे निकटतम तिथि: ${earliestDays} दिन शेष`
                      : `Next cutoff in ${earliestDays} ${earliestDays === 1 ? 'day' : 'days'}`}
                  </span>
                </>
              )}
            </div>

            <h2 className="mt-1 text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              {currentLang === 'pa'
                ? 'ਤੁਹਾਡੀਆਂ ਸੇਵ ਕੀਤੀਆਂ ਸਕੀਮਾਂ ਲਈ ਆਉਣ ਵਾਲੀਆਂ ਅਰਜ਼ੀ ਦੀਆਂ ਆਖਰੀ ਮਿਤੀਆਂ (ਅਗਲੇ 30 ਦਿਨ)'
                : currentLang === 'hi'
                ? 'आपकी सहेजी गई योजनाओं के लिए आगामी आवेदन अंतिम तिथियां (अगले 30 दिन)'
                : 'Upcoming Application Deadlines for Your Saved Schemes (Next 30 Days)'}
            </h2>

            <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
              {currentLang === 'pa'
                ? 'ਕਿਸ਼ਤ ਜਾਂ ਵਜ਼ੀਫ਼ਾ ਰੁਕਣ ਤੋਂ ਬਚਾਉਣ ਲਈ ਹੇਠਾਂ ਦਿੱਤੀਆਂ ਸੇਵ ਕੀਤੀਆਂ ਸਕੀਮਾਂ ਦੀ ਆਖਰੀ ਮਿਤੀ ਤੋਂ ਪਹਿਲਾਂ ਅਪਲਾਈ ਜਾਂ ਈ-ਕੇਵਾਈਸੀ ਪੂਰੀ ਕਰੋ।'
                : currentLang === 'hi'
                ? 'किस्त या छात्रवृत्ति रुकने से बचाने के लिए अपनी सहेजी गई योजनाओं की अंतिम तिथि से पहले आवेदन या ई-केवाईसी पूरा करें।'
                : 'Complete your portal submission, e-KYC, or institutional verification before these 30-day cutoffs to avoid missed benefits.'}
            </p>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onFilterSavedSchemes}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:border-amber-400 hover:bg-amber-50/70"
          >
            <BookmarkCheck className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
            <span>
              {currentLang === 'pa'
                ? `ਸੇਵ ਕੀਤੀਆਂ ਸਕੀਮਾਂ (${savedSchemeIds.size})`
                : currentLang === 'hi'
                ? `सहेजी गई योजनाएं (${savedSchemeIds.size})`
                : `View All Saved (${savedSchemeIds.size})`}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenDeadlineHub}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            <CalendarClock className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
            <span>
              {currentLang === 'pa'
                ? 'ਸਾਰੇ ਰੀਮਾਈਂਡਰ ਦੇਖੋ'
                : currentLang === 'hi'
                ? 'सभी रिमाइंडर देखें'
                : 'All Deadline Reminders'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(prev => !prev)}
            aria-expanded={!isCollapsed}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <span>
              {isCollapsed
                ? currentLang === 'pa'
                  ? 'ਵੇਰਵਾ ਦਿਖਾਓ'
                  : currentLang === 'hi'
                  ? 'विवरण दिखाएं'
                  : 'Show Alerts'
                : currentLang === 'pa'
                ? 'ਛੋਟਾ ਕਰੋ'
                : currentLang === 'hi'
                ? 'संक्षिप्त करें'
                : 'Minimize'}
            </span>
            {isCollapsed ? (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Body */}
      {!isCollapsed && (
        <div className="mt-4 space-y-4">
          {upcomingSavedDeadlines.length > 0 ? (
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSavedDeadlines.map(item => {
                const isCritical = item.urgency === 'critical';
                const isUrgent = item.urgency === 'urgent';
                const borderAccentClass = isCritical
                  ? 'border-l-4 border-l-rose-600'
                  : isUrgent
                  ? 'border-l-4 border-l-amber-500'
                  : 'border-l-4 border-l-blue-600';

                const countdownTextColor = isCritical
                  ? 'text-rose-700'
                  : isUrgent
                  ? 'text-amber-800'
                  : 'text-blue-800';

                return (
                  <article
                    key={item.scheme.id}
                    data-testid={`saved-deadline-card-${item.scheme.id}`}
                    className={`flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs transition hover:border-amber-300 hover:shadow-sm ${borderAccentClass}`}
                  >
                    <div>
                      {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums">
                        <div className="flex flex-wrap items-center gap-1.5 font-bold">
                          {isCritical && (
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" aria-hidden="true" />
                          )}
                          <span className={countdownTextColor}>
                            {getDaysRemainingText(item.daysRemaining)}
                          </span>
                          <span className="text-slate-300" aria-hidden="true">·</span>
                          <span className="font-semibold text-slate-600">
                            {getUrgencyLabel(item.urgency)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onToggleSave(item.scheme)}
                          title="Remove from saved schemes"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 transition hover:text-rose-700"
                        >
                          <BookmarkCheck className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                          <span>{currentLang === 'pa' ? 'ਸੇਵਡ' : currentLang === 'hi' ? 'सहेजा गया' : 'Saved'}</span>
                        </button>
                      </div>

                      {/* Scheme Title */}
                      <h3 className="mt-2 text-sm font-bold leading-snug text-slate-900 line-clamp-2">
                        {getSchemeTitle(item.scheme)}
                      </h3>

                      {/* Milestone & Cutoff Date */}
                      <p className="mt-1.5 text-xs font-medium text-slate-700 line-clamp-2">
                        {getMilestoneLabel(item)}
                      </p>

                      <div className="mt-2 space-y-1 text-xs tabular-nums">
                        <p className="font-semibold text-slate-800">
                          {currentLang === 'pa'
                            ? 'ਆਖਰੀ ਮਿਤੀ:'
                            : currentLang === 'hi'
                            ? 'अंतिम तिथि:'
                            : 'Cutoff Date:'}{' '}
                          <span className="text-slate-900">{getFormattedDate(item)}</span>
                        </p>
                        <p className="truncate font-medium text-emerald-800">
                          {item.scheme.benefitAmountText}
                        </p>
                      </div>
                    </div>

                    {/* Card Interactive Actions */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => onOpenSchemeDetails(item.scheme, 'overview')}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-800"
                      >
                        <span>
                          {currentLang === 'pa'
                            ? 'ਵੇਰਵਾ ਅਤੇ ਅਪਲਾਈ'
                            : currentLang === 'hi'
                            ? 'विवरण व आवेदन'
                            : 'View & Apply'}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenSchemeDetails(item.scheme, 'estimator')}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50/70 px-2.5 py-1.5 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100"
                      >
                        <Calculator className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                        <span>
                          {currentLang === 'pa'
                            ? 'ਲਾਭ ਹਿਸਾਬ'
                            : currentLang === 'hi'
                            ? 'लाभ गणना'
                            : 'Estimate'}
                        </span>
                      </button>

                      <a
                        href={item.scheme.officialPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
                      >
                        <span>{currentLang === 'pa' ? 'ਪੋਰਟਲ' : currentLang === 'hi' ? 'पोर्टल' : 'Portal'}</span>
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200/80 bg-white p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">
                {currentLang === 'pa'
                  ? 'ਤੁਹਾਡੀਆਂ ਸੇਵ ਕੀਤੀਆਂ ਸਕੀਮਾਂ ਵਿੱਚ ਅਗਲੇ 30 ਦਿਨਾਂ ਵਿੱਚ ਕੋਈ ਆਖਰੀ ਮਿਤੀ ਬੰਦ ਨਹੀਂ ਹੋ ਰਹੀ।'
                  : currentLang === 'hi'
                  ? 'आपकी सहेजी गई योजनाओं में अगले 30 दिनों के भीतर कोई अंतिम तिथि समाप्त नहीं हो रही है।'
                  : 'None of your currently saved schemes have an application cutoff within the next 30 days.'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {currentLang === 'pa'
                  ? 'ਹੇਠਾਂ ਦਿੱਤੀਆਂ 30-ਦਿਨਾਂ ਅੰਦਰ ਬੰਦ ਹੋਣ ਵਾਲੀਆਂ ਸਕੀਮਾਂ ਨੂੰ ਬੁੱਕਮਾਰਕ (Save) ਕਰੋ ਤਾਂ ਜੋ ਇੱਥੇ ਸਿੱਧਾ ਕਾਊਂਟਡਾਊਨ ਦਿਸੇ।'
                  : currentLang === 'hi'
                  ? 'नीचे दी गई 30 दिनों में बंद होने वाली योजनाओं को बुकमार्क (Save) करें ताकि यहां लाइव काउंटडाउन दिखे।'
                  : 'Bookmark any scheme below or in the directory to track its 30-day application countdown here.'}
              </p>
            </div>
          )}

          {/* Quick-Bookmark Bar for Other Urgent Schemes Closing Within 30 Days */}
          {suggestedUrgentDeadlines.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200/60 bg-amber-50/50 px-3.5 py-2.5 text-xs">
              <span className="font-semibold text-amber-950">
                {currentLang === 'pa'
                  ? 'ਅਗਲੇ 30 ਦਿਨਾਂ ਵਿੱਚ ਬੰਦ ਹੋਣ ਵਾਲੀਆਂ ਹੋਰ ਸਕੀਮਾਂ (ਅਲਰਟ ਲਈ ਸੇਵ ਕਰੋ):'
                  : currentLang === 'hi'
                  ? 'अगले 30 दिनों में बंद होने वाली अन्य योजनाएं (अलर्ट के लिए सहेजें):'
                  : 'Other schemes closing within 30 days (click to save & monitor):'}
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {suggestedUrgentDeadlines.map(item => (
                  <button
                    key={item.scheme.id}
                    type="button"
                    data-testid={`quick-save-deadline-${item.scheme.id}`}
                    onClick={() => onToggleSave(item.scheme)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900"
                  >
                    <BookmarkPlus className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
                    <span className="max-w-[200px] truncate">{getSchemeTitle(item.scheme)}</span>
                    <span className="text-rose-700 font-bold tabular-nums">
                      ({getDaysRemainingText(item.daysRemaining)})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
