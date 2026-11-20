import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types/scheme';
import {
  countUnreadNotifications,
  SchemeNotificationItem,
} from '../utils/schemeNotifications';
import {
  Bell,
  BellRing,
  CalendarClock,
  CheckCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';

interface NotificationCenterProps {
  notifications: SchemeNotificationItem[];
  currentLang: Language;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
  onOpenSchemeById: (schemeId: string) => void;
  onNavigateTab: (tab: string) => void;
  onTriggerDemoStatusAdvance?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  currentLang,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onOpenSchemeById,
  onNavigateTab,
  onTriggerDemoStatusAdvance,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'deadlines' | 'status'>('all');
  const containerRef = useRef<HTMLDivElement | null>(null);

  const stats = React.useMemo(
    () => countUnreadNotifications(notifications),
    [notifications]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (ev: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(ev.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredNotifications = React.useMemo(() => {
    if (activeFilter === 'deadlines') {
      return notifications.filter((n) => n.type === 'deadline_approaching');
    }
    if (activeFilter === 'status') {
      return notifications.filter((n) => n.type === 'status_change');
    }
    return notifications;
  }, [notifications, activeFilter]);

  const getTitle = (item: SchemeNotificationItem) =>
    currentLang === 'pa'
      ? item.titlePa
      : currentLang === 'hi'
        ? item.titleHi
        : item.titleEn;

  const getMessage = (item: SchemeNotificationItem) =>
    currentLang === 'pa'
      ? item.messagePa
      : currentLang === 'hi'
        ? item.messageHi
        : item.messageEn;

  const getUrgencyBadge = (item: SchemeNotificationItem) => {
    if (item.type === 'deadline_approaching') {
      const days = item.daysRemaining ?? 0;
      const label =
        days === 0
          ? currentLang === 'pa'
            ? 'ਅੱਜ ਆਖਰੀ ਦਿਨ'
            : currentLang === 'hi'
              ? 'आज अंतिम दिन'
              : 'Closes Today'
          : days === 1
            ? currentLang === 'pa'
              ? '1 ਦਿਨ ਬਾਕੀ'
              : currentLang === 'hi'
                ? '1 दिन शेष'
                : '1 Day Left'
            : currentLang === 'pa'
              ? `${days} ਦਿਨ ਬਾਕੀ`
              : currentLang === 'hi'
                ? `${days} दिन शेष`
                : `${days} Days Left`;

      const style =
        item.urgency === 'critical'
          ? 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950/80 dark:text-red-200 dark:border-red-800'
          : item.urgency === 'urgent'
            ? 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800'
            : 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-800';

      return { label, style, icon: CalendarClock };
    }

    const label =
      currentLang === 'pa'
        ? `ਸਥਿਤੀ: ${item.newStatus || 'ਅਪਡੇਟ'}`
        : currentLang === 'hi'
          ? `स्थिति: ${item.newStatus || 'अपडेट'}`
          : `Status: ${item.newStatus || 'Updated'}`;
    const style =
      item.urgency === 'success'
        ? 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800'
        : 'bg-indigo-100 text-indigo-950 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-200 dark:border-indigo-800';

    return { label, style, icon: CheckCircle2 };
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        data-testid="notification-bell-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={
          stats.unread > 0
            ? `Notifications (${stats.unread} unread alerts)`
            : 'Notifications'
        }
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`relative inline-flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border transition cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-100 ${
          isOpen
            ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300'
            : stats.unread > 0
              ? 'border-amber-300 bg-amber-50/90 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
        }`}
      >
        {stats.unread > 0 ? (
          <BellRing className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-amber-600 dark:text-amber-400" />
        ) : (
          <Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
        )}
        {stats.unread > 0 && (
          <span
            data-testid="notification-unread-badge"
            className="absolute -right-1 -top-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-xs tabular-nums"
          >
            {stats.unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          data-testid="notification-center-panel"
          role="dialog"
          aria-label="Scheme Deadline and Status Notifications"
          className="fixed inset-x-3 top-16 z-50 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[430px] max-h-[82vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-teal-950 text-white px-4 py-3.5 border-b border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-300">
                  <BellRing className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-black tracking-tight text-white truncate">
                    {currentLang === 'pa'
                      ? 'ਸਕੀਮ ਅਲਰਟ ਅਤੇ ਸਥਿਤੀ ਸੂਚਨਾਵਾਂ'
                      : currentLang === 'hi'
                        ? 'योजना अलर्ट और स्थिति सूचनाएं'
                        : 'Saved Scheme Alerts & Status Updates'}
                  </h3>
                  <p className="text-[11px] text-teal-200 truncate">
                    {currentLang === 'pa'
                      ? `${stats.deadlineCount} ਆਖਰੀ ਮਿਤੀ ਅਲਰਟ • ${stats.statusChangeCount} ਸਥਿਤੀ ਬਦਲਾਅ`
                      : currentLang === 'hi'
                        ? `${stats.deadlineCount} अंतिम तिथि अलर्ट • ${stats.statusChangeCount} स्थिति अपडेट`
                        : `${stats.deadlineCount} approaching deadlines • ${stats.statusChangeCount} status changes`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {stats.unread > 0 && (
                  <button
                    type="button"
                    data-testid="notif-mark-all-read-btn"
                    onClick={onMarkAllRead}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1 text-[11px] font-bold text-white transition cursor-pointer"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>
                      {currentLang === 'pa'
                        ? 'ਸਭ ਪੜ੍ਹੇ'
                        : currentLang === 'hi'
                          ? 'सभी पढ़े'
                          : 'Mark all read'}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  data-testid="notif-close-panel-btn"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close notifications"
                  className="rounded-lg p-1 text-slate-300 hover:bg-white/15 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mt-3 flex items-center justify-between gap-1.5">
              <div
                role="tablist"
                aria-label="Filter notifications"
                className="inline-flex items-center gap-1 rounded-xl bg-slate-950/60 p-1 border border-white/10"
              >
                <button
                  type="button"
                  role="tab"
                  data-testid="notif-filter-all"
                  aria-selected={activeFilter === 'all'}
                  onClick={() => setActiveFilter('all')}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition cursor-pointer tabular-nums ${
                    activeFilter === 'all'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {currentLang === 'pa'
                    ? `ਸਾਰੇ (${stats.total})`
                    : currentLang === 'hi'
                      ? `सभी (${stats.total})`
                      : `All (${stats.total})`}
                </button>
                <button
                  type="button"
                  role="tab"
                  data-testid="notif-filter-deadlines"
                  aria-selected={activeFilter === 'deadlines'}
                  onClick={() => setActiveFilter('deadlines')}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition cursor-pointer tabular-nums ${
                    activeFilter === 'deadlines'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {currentLang === 'pa'
                    ? `ਆਖਰੀ ਮਿਤੀ (${stats.deadlineCount})`
                    : currentLang === 'hi'
                      ? `अंतिम तिथि (${stats.deadlineCount})`
                      : `Deadlines (${stats.deadlineCount})`}
                </button>
                <button
                  type="button"
                  role="tab"
                  data-testid="notif-filter-status"
                  aria-selected={activeFilter === 'status'}
                  onClick={() => setActiveFilter('status')}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition cursor-pointer tabular-nums ${
                    activeFilter === 'status'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {currentLang === 'pa'
                    ? `ਸਥਿਤੀ (${stats.statusChangeCount})`
                    : currentLang === 'hi'
                      ? `स्थिति (${stats.statusChangeCount})`
                      : `Status (${stats.statusChangeCount})`}
                </button>
              </div>

              {onTriggerDemoStatusAdvance && (
                <button
                  type="button"
                  data-testid="notif-quick-status-advance-btn"
                  onClick={onTriggerDemoStatusAdvance}
                  title="Update next stage on your saved/tracked scheme"
                  className="inline-flex items-center gap-1 rounded-xl bg-teal-500/25 hover:bg-teal-500/40 border border-teal-400/40 px-2.5 py-1 text-[11px] font-extrabold text-teal-200 transition cursor-pointer shrink-0"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>
                    {currentLang === 'pa'
                      ? 'ਸਥਿਤੀ ਅਪਡੇਟ'
                      : currentLang === 'hi'
                        ? 'स्थिति अपडेट'
                        : 'Advance Status'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Notification Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 max-h-[420px]">
            {filteredNotifications.length === 0 ? (
              <div
                data-testid="notification-empty-state"
                className="p-8 text-center space-y-2"
              >
                <Bell className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {currentLang === 'pa'
                    ? 'ਕੋਈ ਨਵਾਂ ਅਲਰਟ ਨਹੀਂ ਹੈ'
                    : currentLang === 'hi'
                      ? 'कोई नया अलर्ट नहीं है'
                      : 'No active notifications in this view'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentLang === 'pa'
                    ? 'ਜਦੋਂ ਕਿਸੇ ਸੇਵ ਕੀਤੀ ਸਕੀਮ ਦੀ ਆਖਰੀ ਮਿਤੀ ਨੇੜੇ ਆਵੇਗੀ ਜਾਂ ਅਰਜ਼ੀ ਦੀ ਸਥਿਤੀ ਬਦਲੇਗੀ ਤਾਂ ਇੱਥੇ ਤੁਰੰਤ ਅਲਰਟ ਮਿਲੇਗਾ।'
                    : currentLang === 'hi'
                      ? 'जब किसी सेव की गई योजना की अंतिम तिथि नजदीक आएगी या आवेदन स्थिति बदलेगी तो यहां तुरंत अलर्ट मिलेगा।'
                      : 'You will be alerted here whenever a saved scheme deadline approaches or its application status changes.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const badge = getUrgencyBadge(item);
                const BadgeIcon = badge.icon;
                return (
                  <div
                    key={item.id}
                    data-testid={`notification-item-${item.id}`}
                    className={`p-3.5 transition ${
                      item.read
                        ? 'bg-white dark:bg-slate-900 opacity-80'
                        : 'bg-amber-50/40 dark:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {!item.read && (
                          <span
                            aria-label="Unread alert"
                            className="h-2 w-2 rounded-full bg-red-600 shrink-0"
                          />
                        )}
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-extrabold ${badge.style}`}
                        >
                          <BadgeIcon className="h-3 w-3" />
                          <span>{badge.label}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          <Clock className="h-2.5 w-2.5" />
                          {item.createdAt}
                        </span>
                      </div>

                      <button
                        type="button"
                        data-testid={`notif-dismiss-${item.id}`}
                        onClick={() => onDismiss(item.id)}
                        aria-label="Dismiss notification"
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <h4 className="mt-1.5 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                      {getTitle(item)}
                    </h4>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {getMessage(item)}
                    </p>

                    {item.benefitAmountText && (
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-[11px] font-extrabold text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-200">
                        <Sparkles className="h-3 w-3 text-emerald-600" />
                        <span>{item.benefitAmountText}</span>
                      </div>
                    )}

                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          data-testid={`notif-open-scheme-${item.schemeId}`}
                          onClick={() => {
                            onMarkRead(item.id);
                            setIsOpen(false);
                            onOpenSchemeById(item.schemeId);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-700 hover:bg-blue-800 px-2.5 py-1 text-[11px] font-bold text-white transition cursor-pointer"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>
                            {currentLang === 'pa'
                              ? 'ਸਕੀਮ ਖੋਲ੍ਹੋ'
                              : currentLang === 'hi'
                                ? 'योजना खोलें'
                                : 'View Scheme'}
                          </span>
                        </button>

                        <button
                          type="button"
                          data-testid={`notif-goto-tab-${item.id}`}
                          onClick={() => {
                            onMarkRead(item.id);
                            setIsOpen(false);
                            onNavigateTab(
                              item.type === 'deadline_approaching'
                                ? 'deadlines'
                                : 'tracker'
                            );
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
                        >
                          <span>
                            {item.type === 'deadline_approaching'
                              ? currentLang === 'pa'
                                ? 'ਡੈੱਡਲਾਈਨ ਹੱਬ'
                                : currentLang === 'hi'
                                  ? 'डेडलाइन हब'
                                  : 'Deadline Hub'
                              : currentLang === 'pa'
                                ? 'ਅਰਜ਼ੀ ਟ੍ਰੈਕਰ'
                                : currentLang === 'hi'
                                  ? 'आवेदन ट्रैकर'
                                  : 'Open Tracker'}
                          </span>
                        </button>
                      </div>

                      {!item.read && (
                        <button
                          type="button"
                          data-testid={`notif-mark-read-${item.id}`}
                          onClick={() => onMarkRead(item.id)}
                          className="text-[11px] font-bold text-blue-700 hover:underline dark:text-blue-400 cursor-pointer"
                        >
                          {currentLang === 'pa'
                            ? 'ਪੜ੍ਹਿਆ ਵਜੋਂ ਚਿੰਨ੍ਹਿਤ ਕਰੋ'
                            : currentLang === 'hi'
                              ? 'पढ़ा हुआ चिह्नित करें'
                              : 'Mark read'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer quick links */}
          <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
            <button
              type="button"
              data-testid="notif-footer-deadlines-btn"
              onClick={() => {
                setIsOpen(false);
                onNavigateTab('deadlines');
              }}
              className="font-bold text-blue-700 hover:underline dark:text-blue-400 cursor-pointer"
            >
              {currentLang === 'pa'
                ? 'ਸਾਰੀਆਂ ਆਖਰੀ ਮਿਤੀਆਂ →'
                : currentLang === 'hi'
                  ? 'सभी अंतिम तिथियां →'
                  : 'All Saved Deadlines →'}
            </button>
            <button
              type="button"
              data-testid="notif-footer-tracker-btn"
              onClick={() => {
                setIsOpen(false);
                onNavigateTab('tracker');
              }}
              className="font-bold text-teal-700 hover:underline dark:text-teal-400 cursor-pointer"
            >
              {currentLang === 'pa'
                ? 'ਅਰਜ਼ੀ ਟ੍ਰੈਕਰ ਖੋਲ੍ਹੋ →'
                : currentLang === 'hi'
                  ? 'आवेदन ट्रैकर खोलें →'
                  : 'Application Status Tracker →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface SchemeNotificationToastProps {
  notification: SchemeNotificationItem | null;
  currentLang: Language;
  onClose: () => void;
  onOpenSchemeById: (schemeId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const SchemeNotificationToast: React.FC<SchemeNotificationToastProps> = ({
  notification,
  currentLang,
  onClose,
  onOpenSchemeById,
  onNavigateTab,
}) => {
  if (!notification) return null;

  const isDeadline = notification.type === 'deadline_approaching';
  const title =
    currentLang === 'pa'
      ? notification.titlePa
      : currentLang === 'hi'
        ? notification.titleHi
        : notification.titleEn;
  const message =
    currentLang === 'pa'
      ? notification.messagePa
      : currentLang === 'hi'
        ? notification.messageHi
        : notification.messageEn;

  return (
    <div
      data-testid="scheme-notification-toast"
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-20 sm:bottom-7 left-4 sm:left-7 z-50 max-w-md w-[calc(100vw-2rem)] rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all ${
        isDeadline
          ? 'bg-amber-950/95 text-white border-amber-400/70'
          : 'bg-indigo-950/95 text-white border-teal-400/70'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              isDeadline
                ? 'bg-amber-400/20 border-amber-300/40 text-amber-300'
                : 'bg-teal-400/20 border-teal-300/40 text-teal-300'
            }`}
          >
            {isDeadline ? (
              <CalendarClock className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold border ${
                  isDeadline
                    ? 'bg-amber-400/20 border-amber-300/40 text-amber-200'
                    : 'bg-teal-400/20 border-teal-300/40 text-teal-200'
                }`}
              >
                {isDeadline
                  ? currentLang === 'pa'
                    ? '⏰ ਸੇਵ ਕੀਤੀ ਸਕੀਮ ਆਖਰੀ ਮਿਤੀ ਅਲਰਟ'
                    : currentLang === 'hi'
                      ? '⏰ सेव की गई योजना अंतिम तिथि अलर्ट'
                      : '⏰ Saved Scheme Deadline Alert'
                  : currentLang === 'pa'
                    ? '🔄 ਸਕੀਮ ਸਥਿਤੀ ਬਦਲਾਅ ਅਲਰਟ'
                    : currentLang === 'hi'
                      ? '🔄 योजना स्थिति बदलाव अलर्ट'
                      : '🔄 Scheme Status Change Alert'}
              </span>
              <span className="text-[10px] text-slate-300 font-semibold">
                {notification.createdAt}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-black text-white mt-1 leading-snug">
              {title}
            </p>
            <p className="text-[11px] text-slate-200 mt-1 leading-relaxed">
              {message}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                data-testid="toast-open-scheme-btn"
                onClick={() => {
                  onOpenSchemeById(notification.schemeId);
                  onClose();
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-1 text-[11px] font-black transition cursor-pointer"
              >
                <ExternalLink className="h-3 w-3" />
                <span>
                  {currentLang === 'pa'
                    ? 'ਸਕੀਮ ਦੇਖੋ'
                    : currentLang === 'hi'
                      ? 'योजना देखें'
                      : 'View Scheme'}
                </span>
              </button>
              <button
                type="button"
                data-testid="toast-open-tab-btn"
                onClick={() => {
                  onNavigateTab(isDeadline ? 'deadlines' : 'tracker');
                  onClose();
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 text-[11px] font-bold transition cursor-pointer"
              >
                <span>
                  {isDeadline
                    ? currentLang === 'pa'
                      ? 'ਡੈੱਡਲਾਈਨ ਹੱਬ'
                      : currentLang === 'hi'
                        ? 'डेडलाइन हब'
                        : 'Deadline Hub'
                    : currentLang === 'pa'
                      ? 'ਅਰਜ਼ੀ ਟ੍ਰੈਕਰ'
                      : currentLang === 'hi'
                        ? 'आवेदन ट्रैकर'
                        : 'Open Tracker'}
                </span>
              </button>
            </div>
          </div>
        </div>
        <button
          type="button"
          data-testid="close-scheme-notification-toast-btn"
          onClick={onClose}
          aria-label="Close alert toast"
          className="rounded-lg p-1 text-slate-300 hover:bg-white/15 hover:text-white cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
