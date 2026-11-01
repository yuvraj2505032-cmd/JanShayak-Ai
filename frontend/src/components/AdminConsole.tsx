import React, { FormEvent, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  Bot,
  Clock,
  ExternalLink,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  CheckCircle2,
  Globe,
  Youtube,
  Play,
  Calculator
} from 'lucide-react';
import type { CitizenProfile, ManagedOfficialSite, Scheme } from '../types/scheme';
import { getSchemeYoutubeBundle } from '../data/schemeVideos';
import { parseCitizenProfile } from '../lib/citizenCloudSync';
import { supabase } from '../lib/supabase';

export interface AiAdminLogEntry {
  id: string;
  timestamp: string;
  schemeTitle: string;
  portalTitle: string;
  portalUrl: string;
  youtubeUrl?: string;
  youtubeVideoTitle?: string;
  mode: 'Auto-Scheduled' | 'AI On-Demand';
}

interface AdminConsoleProps {
  user: User | null;
  sites: ManagedOfficialSite[];
  onSitesChange: (sites: ManagedOfficialSite[]) => void;
  aiAddedSchemes?: Scheme[];
  onRemoveAiScheme?: (schemeId: string) => void;
  onOpenScheme?: (scheme: Scheme) => void;
  isAiAutoSyncEnabled?: boolean;
  onToggleAiAutoSync?: (enabled: boolean) => void;
  aiAdminLogs?: AiAdminLogEntry[];
  onTriggerAiDiscovery?: (customTopic?: string) => Promise<void>;
  isAiDiscovering?: boolean;
}

interface CitizenRecord {
  userId: string;
  profile: CitizenProfile;
  updatedAt: string;
}

const EMPTY_FORM = { title: '', url: '', description: '', category: 'Students & Education' };

function isOfficialUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      (url.hostname === 'gov.in' ||
        url.hostname.endsWith('.gov.in') ||
        url.hostname === 'nic.in' ||
        url.hostname.endsWith('.nic.in') ||
        url.hostname.endsWith('.co.in') ||
        url.hostname.endsWith('.in') ||
        url.hostname === 'pgrkam.com' ||
        url.hostname === 'agrimachinerypb.com');
  } catch {
    return false;
  }
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  user,
  sites,
  onSitesChange,
  aiAddedSchemes = [],
  onRemoveAiScheme,
  onOpenScheme,
  isAiAutoSyncEnabled = true,
  onToggleAiAutoSync,
  aiAdminLogs = [],
  onTriggerAiDiscovery,
  isAiDiscovering = false
}) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<CitizenRecord[]>([]);
  const [profileError, setProfileError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [customAiTopic, setCustomAiTopic] = useState('');

  useEffect(() => {
    let active = true;
    setProfiles([]);
    setIsAdmin(false);

    if (!user || !supabase) {
      return;
    }

    supabase
      .from('app_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active || error) return;
        setIsAdmin(Boolean(data));
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!isAdmin || !supabase) return;
    let active = true;
    supabase
      .from('citizen_app_data')
      .select('user_id, profile, updated_at')
      .not('profile', 'is', null)
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setProfileError(`Could not load citizen profiles: ${error.message}`);
          return;
        }
        try {
          setProfiles((data ?? []).flatMap(row => row.profile
            ? [{ userId: row.user_id, profile: parseCitizenProfile(row.profile), updatedAt: row.updated_at }]
            : []));
          setProfileError('');
        } catch (parseError) {
          setProfileError(parseError instanceof Error ? parseError.message : 'A stored citizen profile is invalid.');
        }
      });
    return () => {
      active = false;
    };
  }, [isAdmin]);

  const handleAddSite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!isOfficialUrl(form.url.trim())) {
      setFormError('Use an HTTPS official government portal URL (e.g. .gov.in, .nic.in, .in).');
      return;
    }

    setIsSaving(true);
    const siteData = {
      title: form.title.trim(),
      url: form.url.trim(),
      description: form.description.trim(),
      category: form.category.trim() || 'Government scheme',
    };

    if (user && supabase && isAdmin) {
      const query = editingSiteId
        ? supabase.from('managed_official_sites').update(siteData).eq('id', editingSiteId)
        : supabase.from('managed_official_sites').insert({ ...siteData, created_by: user.id });
      const { data, error } = await query
        .select('id, title, url, description, category, created_at')
        .single();
      if (!error && data) {
        const updatedSite: ManagedOfficialSite = {
          id: data.id,
          title: data.title,
          url: data.url,
          description: data.description,
          category: data.category,
          createdAt: data.created_at
        };
        onSitesChange(editingSiteId
          ? sites.map(site => site.id === editingSiteId ? updatedSite : site)
          : [updatedSite, ...sites]);
        setForm(EMPTY_FORM);
        setEditingSiteId(null);
        setIsSaving(false);
        setFormSuccess('Official portal saved and synced.');
        return;
      }
    }

    const localSite: ManagedOfficialSite = {
      id: editingSiteId || `portal-local-${Date.now()}`,
      title: siteData.title,
      url: siteData.url,
      description: siteData.description,
      category: siteData.category,
      createdAt: new Date().toISOString()
    };
    onSitesChange(editingSiteId
      ? sites.map(site => site.id === editingSiteId ? localSite : site)
      : [localSite, ...sites]);
    setForm(EMPTY_FORM);
    setEditingSiteId(null);
    setIsSaving(false);
    setFormSuccess('Official portal link added to directory.');
  };

  const handleRemoveSite = async (siteId: string) => {
    setFormError('');
    if (supabase && isAdmin) {
      await supabase.from('managed_official_sites').delete().eq('id', siteId);
    }
    onSitesChange(sites.filter(site => site.id !== siteId));
  };

  const handleAiPromptSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!onTriggerAiDiscovery) return;
    await onTriggerAiDiscovery(customAiTopic.trim() || undefined);
    setCustomAiTopic('');
  };

  return (
    <div className="space-y-8">
      <header className="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-teal-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-400/20 px-3.5 py-1 text-xs font-bold text-teal-200 ring-1 ring-teal-300/30">
              <Bot className="h-4 w-4 text-teal-300" />
              <span>Janshayak AI Autonomous Admin Active (ਏ.ਆਈ ਐਡਮਿਨ)</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              AI Autonomous Scheme, Portal & YouTube Video Admin
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-blue-100">
              Janshayak AI acts as the autonomous administrator—continuously monitoring gazetted notifications to automatically add new Government Schemes, Official Portal Links, and Scheme-Specific YouTube Tutorial Videos over time.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 rounded-2xl bg-white/10 p-4 backdrop-blur-md ring-1 ring-white/15 sm:items-end">
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${isAiAutoSyncEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                {isAiAutoSyncEnabled ? 'Time-Based Auto-Discovery: ON' : 'Time-Based Auto-Discovery: PAUSED'}
              </span>
            </div>
            <p className="text-xs text-blue-200">
              {aiAddedSchemes.length} AI-discovered schemes + YouTube videos · {sites.length} official links
            </p>
            {onToggleAiAutoSync && (
              <button
                type="button"
                onClick={() => onToggleAiAutoSync(!isAiAutoSyncEnabled)}
                className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25"
              >
                <Clock className="h-3.5 w-3.5" />
                {isAiAutoSyncEnabled ? 'Pause Auto-Timer' : 'Enable Auto-Timer'}
              </button>
            )}
          </div>
        </div>

        {/* AI Discovery Trigger & Custom Topic Generator */}
        <div className="mt-6 grid gap-4 border-t border-white/15 pt-6 lg:grid-cols-12">
          <form onSubmit={handleAiPromptSubmit} className="flex flex-col gap-3 sm:flex-row lg:col-span-8">
            <input
              type="text"
              value={customAiTopic}
              onChange={(e) => setCustomAiTopic(e.target.value)}
              placeholder="Tell AI Admin to add a scheme, portal link & YouTube video (e.g., Lakhpati Didi, Solar Pump, Student Grant)…"
              className="min-h-11 flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-blue-200/70 outline-none focus:border-teal-300 focus:bg-white/15"
            />
            <button
              type="submit"
              disabled={isAiDiscovering}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-teal-400 disabled:cursor-wait disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              {isAiDiscovering ? 'AI Admin Adding…' : 'AI Add Scheme + Video'}
            </button>
          </form>

          <div className="flex items-center lg:col-span-4 lg:justify-end">
            <button
              type="button"
              disabled={isAiDiscovering}
              onClick={() => onTriggerAiDiscovery?.()}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-60 lg:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${isAiDiscovering ? 'animate-spin' : ''}`} />
              <span>Run Scheduled AI Sync Now</span>
            </button>
          </div>
        </div>
      </header>

      {/* AI Admin Live Activity Feed & AI-Added Schemes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Admin Autonomous Activity Log</h2>
              <p className="text-xs text-slate-500">New schemes, official links & YouTube tutorials automatically indexed by AI Admin.</p>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
              {aiAdminLogs.length} sync events
            </span>
          </div>

          <div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1">
            {aiAdminLogs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 font-bold text-teal-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                    {log.mode}
                  </span>
                  <span className="text-[11px] text-slate-400">{log.timestamp}</span>
                </div>
                <p className="font-semibold text-slate-900">
                  Added Scheme: {log.schemeTitle}
                </p>
                <p className="text-slate-600">
                  Official Link:{' '}
                  <a href={log.portalUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 hover:underline">
                    {log.portalTitle} ({log.portalUrl})
                  </a>
                </p>
                {log.youtubeUrl && (
                  <p className="text-rose-700 flex items-center gap-1 font-medium">
                    <Youtube className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                    <span>YouTube Video Added:</span>
                    <a href={log.youtubeUrl} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">
                      {log.youtubeVideoTitle || log.youtubeUrl}
                    </a>
                  </p>
                )}
              </div>
            ))}
            {aiAdminLogs.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">
                AI Admin is monitoring official gazettes. Click "Run Scheduled AI Sync Now" to add a scheme, portal link, and YouTube video immediately.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Schemes & YouTube Videos Added by AI Admin</h2>
              <p className="text-xs text-slate-500">Immediately live in Eligibility Checker, Benefit Estimator & Video Hub.</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
              {aiAddedSchemes.length} active
            </span>
          </div>

          <div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1">
            {aiAddedSchemes.map((scheme) => {
              const ytBundle = getSchemeYoutubeBundle(scheme);
              return (
                <article key={scheme.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 p-3.5">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <a
                      href={ytBundle.watchOnYoutubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative w-24 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 group"
                      title={`Watch ${ytBundle.videoTitle} on YouTube`}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${ytBundle.primaryVideoId}/hqdefault.jpg`}
                        alt={scheme.titleEn}
                        loading="lazy"
                        className="w-full h-full object-cover opacity-85 group-hover:opacity-70 transition"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-5 w-5 text-white fill-current" />
                      </span>
                    </a>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-800">
                          {scheme.level}
                        </span>
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                          {scheme.benefitType}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                          <Youtube className="h-3 w-3" />
                          {ytBundle.videoIds.length} YouTube Videos
                        </span>
                      </div>
                      <h3 className="mt-1 text-sm font-bold text-slate-900">{scheme.titleEn}</h3>
                      <p className="text-xs text-slate-600">{scheme.titlePa}</p>
                      <p className="mt-1 text-xs font-semibold text-emerald-700">{scheme.benefitAmountText}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3">
                        <a
                          href={scheme.officialPortalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                        >
                          <span>Official Portal</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <a
                          href={ytBundle.watchOnYoutubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline"
                        >
                          <Youtube className="h-3.5 w-3.5" />
                          <span>Watch YouTube Video</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        {onOpenScheme && (
                          <button
                            type="button"
                            onClick={() => onOpenScheme(scheme)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:underline"
                          >
                            <Calculator className="h-3.5 w-3.5" />
                            <span>Estimator & Video Player</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {onRemoveAiScheme && (
                    <button
                      type="button"
                      onClick={() => onRemoveAiScheme(scheme.id)}
                      aria-label={`Remove ${scheme.titleEn}`}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>

      {/* Official Portals Directory & Manual Addition */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Official Government Portal Links ({sites.length} Verified Portals)
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Direct links to Punjab and Central Government portals for Students, Farmers, Scholarships, Pensions, Health, and Jobs.
            </p>
          </div>
        </div>

        <form onSubmit={handleAddSite} className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Portal name
            <input
              required
              maxLength={120}
              value={form.title}
              onChange={event => setForm({ ...form, title: event.target.value })}
              placeholder="e.g., National Scholarship Portal"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Official URL
            <input
              required
              type="url"
              placeholder="https://scholarships.gov.in"
              value={form.url}
              onChange={event => setForm({ ...form, url: event.target.value })}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Category
            <input
              maxLength={80}
              value={form.category}
              onChange={event => setForm({ ...form, category: event.target.value })}
              placeholder="Students & Education"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Short description
            <input
              maxLength={400}
              value={form.description}
              onChange={event => setForm({ ...form, description: event.target.value })}
              placeholder="What citizens can apply for on this portal"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          {formError && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{formError}</p>}
          {formSuccess && <p role="status" className="text-sm text-emerald-700 sm:col-span-2">{formSuccess}</p>}
          <div className="flex items-center gap-3 sm:col-span-2">
            <button
              disabled={isSaving}
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {isSaving ? 'Saving…' : editingSiteId ? 'Save changes' : 'Add Official Portal Link'}
            </button>
            {editingSiteId && (
              <button
                type="button"
                onClick={() => { setEditingSiteId(null); setForm(EMPTY_FORM); }}
                className="min-h-11 rounded-xl px-4 text-sm font-medium text-slate-600 hover:bg-slate-200"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {sites.map(site => (
            <article key={site.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-teal-800">
                  <Globe className="h-3 w-3" />
                  {site.category}
                </span>
                <p className="mt-1.5 font-semibold text-slate-900">{site.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{site.description}</p>
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                >
                  {site.url} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSiteId(site.id);
                    setForm({ title: site.title, url: site.url, description: site.description, category: site.category });
                    setFormError('');
                  }}
                  aria-label={`Edit ${site.title}`}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => void handleRemoveSite(site.id)}
                  aria-label={`Remove ${site.title}`}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {isAdmin && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Saved citizen profiles</h2>
              <p className="mt-1 text-sm text-slate-600">Restricted to explicitly authorized administrators.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{profiles.length} profiles</span>
          </div>
          {profileError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{profileError}</p>}
          <div className="mt-4 space-y-3">
            {profiles.map(record => (
              <details key={record.userId} className="rounded-2xl border border-slate-200 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                  Citizen {record.userId.slice(0, 8)} · Updated {new Date(record.updatedAt).toLocaleDateString()}
                </summary>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  {Object.entries(record.profile).map(([field, value]) => (
                    <div key={field} className="rounded-xl bg-slate-50 p-3">
                      <dt className="text-xs text-slate-500">{field.replace(/[A-Z]/g, letter => ` ${letter.toLowerCase()}`)}</dt>
                      <dd className="mt-1 font-medium text-slate-900">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
