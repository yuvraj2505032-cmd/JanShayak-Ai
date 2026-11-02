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
  Calculator,
  ShieldCheck,
  Lock,
  Database,
  RotateCcw,
  Search
} from 'lucide-react';
import type { CitizenProfile, ManagedOfficialSite, Occupation, Scheme, SchemeLevel } from '../types/scheme';
import type { AdminSchemeFormInput, AdminSchemeKnowledgeState } from '../utils/adminSchemeManager';
import { getSchemeYoutubeBundle } from '../data/schemeVideos';
import { parseCitizenProfile } from '../lib/citizenCloudSync';
import { supabase } from '../lib/supabase';
import { apiUrl } from '../lib/apiUrl';

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
  onAuthorizationChange?: (token: string | null) => void;
  allSchemes?: Scheme[];
  adminKnowledgeState?: AdminSchemeKnowledgeState;
  onAddAdminScheme?: (input: AdminSchemeFormInput) => Scheme;
  onUpdateAdminScheme?: (existingScheme: Scheme, input: AdminSchemeFormInput) => Scheme;
  onDeleteAdminScheme?: (schemeId: string) => void;
  onRestoreDeletedSchemes?: () => void;
  initialEditScheme?: Scheme | null;
  onClearInitialEditScheme?: () => void;
  sites: ManagedOfficialSite[];
  onSitesChange: (sites: ManagedOfficialSite[]) => void;
  aiAddedSchemes?: Scheme[];
  onRemoveAiScheme?: (schemeId: string) => void;
  onOpenScheme?: (scheme: Scheme) => void;
  isAiAutoSyncEnabled?: boolean;
  onToggleAiAutoSync?: (enabled: boolean) => void;
  aiAdminLogs?: AiAdminLogEntry[];
  onTriggerAiDiscovery?: (customTopic?: string) => Promise<void>;
  onSyncAllAiSchemes?: () => void;
  isAiDiscovering?: boolean;
}

interface CitizenRecord {
  userId: string;
  profile: CitizenProfile;
  updatedAt: string;
}

const EMPTY_FORM = { title: '', url: '', description: '', category: 'Students & Education' };
interface SchemeCrudFormState {
  titleEn: string;
  titlePa: string;
  level: SchemeLevel;
  departmentEn: string;
  benefitAmountText: string;
  benefitType: Scheme['benefitType'];
  descriptionEn: string;
  minAge: string;
  maxAge: string;
  maxIncome: string;
  targetOccupation: string;
  officialPortalUrl: string;
  requiredDocumentsText: string;
}

const EMPTY_SCHEME_FORM: SchemeCrudFormState = {
  titleEn: '',
  titlePa: '',
  level: 'Punjab State',
  departmentEn: 'Department of Social Justice & Citizen Welfare, Punjab',
  benefitAmountText: '',
  benefitType: 'Direct Cash Transfer',
  descriptionEn: '',
  minAge: '18',
  maxAge: '65',
  maxIncome: '300000',
  targetOccupation: 'All',
  officialPortalUrl: 'https://punjab.gov.in',
  requiredDocumentsText: 'Aadhaar Card linked with Mobile, Punjab Residence / Domicile Certificate, Active Bank Passbook (NPCI mapped)'
};

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
  onAuthorizationChange,
  allSchemes = [],
  adminKnowledgeState,
  onAddAdminScheme,
  onUpdateAdminScheme,
  onDeleteAdminScheme,
  onRestoreDeletedSchemes,
  initialEditScheme = null,
  onClearInitialEditScheme,
  sites,
  onSitesChange,
  aiAddedSchemes = [],
  onRemoveAiScheme,
  onOpenScheme,
  isAiAutoSyncEnabled = true,
  onToggleAiAutoSync,
  aiAdminLogs = [],
  onTriggerAiDiscovery,
  onSyncAllAiSchemes,
  isAiDiscovering = false
}) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPortalUnlocked, setIsPortalUnlocked] = useState(false);
  const [portalPassword, setPortalPassword] = useState('');
  const [portalPasswordError, setPortalPasswordError] = useState('');
  const [isUnlockingPortal, setIsUnlockingPortal] = useState(false);
  const [profiles, setProfiles] = useState<CitizenRecord[]>([]);
  const [profileError, setProfileError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [customAiTopic, setCustomAiTopic] = useState('');

  // Admin Role & AI Knowledge Base Scheme CRUD State
  const isProfileAdmin = isPortalUnlocked;
  const [schemeForm, setSchemeForm] = useState<SchemeCrudFormState>(EMPTY_SCHEME_FORM);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [schemeFormError, setSchemeFormError] = useState('');
  const [schemeFormSuccess, setSchemeFormSuccess] = useState('');
  const [kbSearchQuery, setKbSearchQuery] = useState('');

  const populateFormForEdit = (scheme: Scheme) => {
    setEditingScheme(scheme);
    setSchemeForm({
      titleEn: scheme.titleEn,
      titlePa: scheme.titlePa || '',
      level: scheme.level,
      departmentEn: scheme.departmentEn,
      benefitAmountText: scheme.benefitAmountText,
      benefitType: scheme.benefitType,
      descriptionEn: scheme.descriptionEn,
      minAge: scheme.minAge !== undefined ? String(scheme.minAge) : '',
      maxAge: scheme.maxAge !== undefined ? String(scheme.maxAge) : '',
      maxIncome: scheme.maxIncome !== undefined ? String(scheme.maxIncome) : '',
      targetOccupation: scheme.eligibleOccupations?.[0] ?? 'All',
      officialPortalUrl: scheme.officialPortalUrl,
      requiredDocumentsText: scheme.requiredDocuments.map((d) => d.nameEn).join(', ')
    });
    setSchemeFormError('');
    setSchemeFormSuccess('');
  };

  useEffect(() => {
    if (initialEditScheme) {
      populateFormForEdit(initialEditScheme);
      onClearInitialEditScheme?.();
    }
  }, [initialEditScheme]);

  const handleSchemeFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSchemeFormError('');
    setSchemeFormSuccess('');
    if (!isProfileAdmin) {
      setSchemeFormError('Unlock the admin portal before adding or editing schemes.');
      return;
    }

    try {
      const input: AdminSchemeFormInput = {
        titleEn: schemeForm.titleEn,
        titlePa: schemeForm.titlePa,
        level: schemeForm.level,
        departmentEn: schemeForm.departmentEn,
        benefitAmountText: schemeForm.benefitAmountText,
        benefitType: schemeForm.benefitType,
        descriptionEn: schemeForm.descriptionEn,
        minAge: schemeForm.minAge.trim() ? Number(schemeForm.minAge) : undefined,
        maxAge: schemeForm.maxAge.trim() ? Number(schemeForm.maxAge) : undefined,
        maxIncome: schemeForm.maxIncome.trim() ? Number(schemeForm.maxIncome) : undefined,
        eligibleOccupations:
          schemeForm.targetOccupation !== 'All'
            ? [schemeForm.targetOccupation as Occupation]
            : undefined,
        officialPortalUrl: schemeForm.officialPortalUrl,
        requiredDocumentsText: schemeForm.requiredDocumentsText
      };

      if (editingScheme && onUpdateAdminScheme) {
        const updated = onUpdateAdminScheme(editingScheme, input);
        setSchemeFormSuccess(`Updated "${updated.titleEn}" in the AI Knowledge Base.`);
        setEditingScheme(null);
        setSchemeForm(EMPTY_SCHEME_FORM);
      } else if (onAddAdminScheme) {
        const created = onAddAdminScheme(input);
        setSchemeFormSuccess(`Added "${created.titleEn}" to the AI Knowledge Base.`);
        setSchemeForm(EMPTY_SCHEME_FORM);
      }
    } catch (err) {
      setSchemeFormError(err instanceof Error ? err.message : 'Could not save scheme.');
    }
  };

  const handleDeleteSchemeClick = (scheme: Scheme) => {
    setSchemeFormError('');
    setSchemeFormSuccess('');
    if (!isProfileAdmin) {
      setSchemeFormError('Unlock the admin portal before deleting schemes.');
      return;
    }
    try {
      onDeleteAdminScheme?.(scheme.id);
      if (editingScheme?.id === scheme.id) {
        setEditingScheme(null);
        setSchemeForm(EMPTY_SCHEME_FORM);
      }
      setSchemeFormSuccess(`Deleted "${scheme.titleEn}" from the AI Knowledge Base.`);
    } catch (err) {
      setSchemeFormError(err instanceof Error ? err.message : 'Could not delete scheme.');
    }
  };

  const filteredKbSchemes = allSchemes.filter((s) => {
    if (!kbSearchQuery.trim()) return true;
    const q = kbSearchQuery.toLowerCase();
    return (
      s.titleEn.toLowerCase().includes(q) ||
      s.departmentEn.toLowerCase().includes(q) ||
      s.benefitAmountText.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    let active = true;
    setProfiles([]);
    setIsAdmin(false);

    if (!isPortalUnlocked || !user || !supabase) {
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
  }, [user?.id, isPortalUnlocked]);

  useEffect(() => {
    if (!isPortalUnlocked || !isAdmin || !supabase) return;
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
  }, [isAdmin, isPortalUnlocked]);

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

  const handlePortalUnlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUnlockingPortal(true);
    setPortalPasswordError('');
    try {
      const response = await fetch(apiUrl('/api/admin/unlock'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: portalPassword })
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
          ? result.error
          : 'Could not verify admin password.';
        throw new Error(message);
      }
      if (!result || typeof result !== 'object' || !('token' in result) || typeof result.token !== 'string') {
        throw new Error('Admin authorization response was invalid.');
      }

      setPortalPassword('');
      setPortalPasswordError('');
      setIsPortalUnlocked(true);
      onAuthorizationChange?.(result.token);
    } catch (error) {
      setPortalPasswordError(error instanceof Error ? error.message : 'Could not unlock admin portal.');
    } finally {
      setIsUnlockingPortal(false);
    }
  };

  if (!isPortalUnlocked) {
    return (
      <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-800">
          <Lock className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Admin portal locked</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Enter the admin password to open the Janshayak AI console.</p>
        <form onSubmit={handlePortalUnlock} className="mt-6 space-y-4">
          <label htmlFor="admin-portal-password" className="block text-sm font-semibold text-slate-700">
            Admin password
          </label>
          <input
            id="admin-portal-password"
            type="password"
            autoComplete="current-password"
            value={portalPassword}
            onChange={event => {
              setPortalPassword(event.target.value);
              setPortalPasswordError('');
            }}
            required
            disabled={isUnlockingPortal}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
          {portalPasswordError && <p role="alert" className="text-sm font-medium text-red-700">{portalPasswordError}</p>}
          <button
            type="submit"
            disabled={isUnlockingPortal}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            {isUnlockingPortal ? 'Verifying…' : 'Unlock admin portal'}
          </button>
        </form>
      </section>
    );
  }

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
            <button
              type="button"
              onClick={() => {
                setIsPortalUnlocked(false);
                onAuthorizationChange?.(null);
              }}
              className="mt-1 inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Lock Admin Portal
            </button>
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

          <div className="flex flex-wrap items-center gap-2 lg:col-span-4 lg:justify-end">
            {onSyncAllAiSchemes && (
              <button
                type="button"
                data-testid="admin-sync-all-ai-schemes-btn"
                onClick={onSyncAllAiSchemes}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 shadow-md transition hover:bg-amber-300 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Sync All New + Purani Schemes</span>
              </button>
            )}
            <button
              type="button"
              disabled={isAiDiscovering}
              onClick={() => onTriggerAiDiscovery?.()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isAiDiscovering ? 'animate-spin' : ''}`} />
              <span>Run Scheduled AI Sync Now</span>
            </button>
          </div>
        </div>
      </header>

      {/* ADMIN ROLE DESIGNATION & AI KNOWLEDGE BASE SCHEME MANAGER (ADD / EDIT / DELETE) */}
      <section
        aria-label="AI Knowledge Base Scheme Manager"
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 space-y-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 border border-blue-200">
              <Database className="h-3.5 w-3.5 text-blue-700" />
              <span>AI Knowledge Base CRUD Manager · {allSchemes.length} Active Schemes</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Manage Government Scheme Entries for AI Knowledge Base
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl">
              Manually add, edit, or delete government scheme entries directly from the UI. Every change immediately updates the Eligibility Engine and the AI Assistant&apos;s live knowledge base.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`h-4 w-4 ${isProfileAdmin ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-xs font-bold text-slate-700">
                Admin access:
              </span>
              <span
                data-testid="admin-console-role-status"
                className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                  isProfileAdmin
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {isProfileAdmin ? 'Authorized' : 'Locked'}
              </span>
            </div>
          </div>
        </div>

        {!isProfileAdmin ? (
          <div
            data-testid="admin-role-locked-banner"
            className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-amber-950">Admin portal access required</h3>
                <p className="text-xs text-amber-900 max-w-xl leading-relaxed">
                  Unlock the admin portal to manually add, edit, or delete government scheme entries for the AI&apos;s knowledge base.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Manual Add / Edit Scheme Form */}
            <form
              onSubmit={handleSchemeFormSubmit}
              data-testid="admin-scheme-crud-form"
              className="grid gap-4 rounded-2xl border border-blue-100 bg-slate-50/90 p-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  {editingScheme ? (
                    <>
                      <Pencil className="h-4 w-4 text-blue-700" />
                      <span>Editing Scheme Entry: {editingScheme.titleEn}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 text-teal-700" />
                      <span>Manually Add New Government Scheme to AI Knowledge Base</span>
                    </>
                  )}
                </h3>
                {editingScheme && (
                  <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-900">
                    ID: {editingScheme.id}
                  </span>
                )}
              </div>

              <label className="text-xs font-semibold text-slate-700">
                Scheme Title (English) *
                <input
                  required
                  data-testid="admin-scheme-title-input"
                  value={schemeForm.titleEn}
                  onChange={(e) => setSchemeForm({ ...schemeForm, titleEn: e.target.value })}
                  placeholder="e.g., Punjab Youth AI Skill Grant 2026"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Scheme Title (Punjabi / ਪੰਜਾਬੀ)
                <input
                  value={schemeForm.titlePa}
                  onChange={(e) => setSchemeForm({ ...schemeForm, titlePa: e.target.value })}
                  placeholder="e.g., ਪੰਜਾਬ ਯੂਥ ਏ.ਆਈ ਸਕਿੱਲ ਗ੍ਰਾਂਟ"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Department / Ministry *
                <input
                  required
                  data-testid="admin-scheme-dept-input"
                  value={schemeForm.departmentEn}
                  onChange={(e) => setSchemeForm({ ...schemeForm, departmentEn: e.target.value })}
                  placeholder="Department of Higher Education, Punjab"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Benefit Amount / Entitlement *
                <input
                  required
                  data-testid="admin-scheme-benefit-input"
                  value={schemeForm.benefitAmountText}
                  onChange={(e) => setSchemeForm({ ...schemeForm, benefitAmountText: e.target.value })}
                  placeholder="e.g., ₹30,000 / year Direct Grant"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Benefit Category Type
                <select
                  data-testid="admin-scheme-benefit-type-select"
                  value={schemeForm.benefitType}
                  onChange={(e) => setSchemeForm({ ...schemeForm, benefitType: e.target.value as Scheme['benefitType'] })}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500"
                >
                  <option value="Scholarship">Scholarship</option>
                  <option value="Direct Cash Transfer">Direct Cash Transfer</option>
                  <option value="Subsidy">Subsidy</option>
                  <option value="Health Cover">Health Cover</option>
                  <option value="Pension">Pension</option>
                  <option value="Loan/Credit">Loan/Credit</option>
                  <option value="Housing">Housing</option>
                  <option value="In-Kind/Ration">In-Kind/Ration</option>
                </select>
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Government Level
                <select
                  data-testid="admin-scheme-level-select"
                  value={schemeForm.level}
                  onChange={(e) => setSchemeForm({ ...schemeForm, level: e.target.value as SchemeLevel })}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500"
                >
                  <option value="Punjab State">Punjab State</option>
                  <option value="Central Government">Central Government</option>
                </select>
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Target Occupation
                <select
                  value={schemeForm.targetOccupation}
                  onChange={(e) => setSchemeForm({ ...schemeForm, targetOccupation: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500"
                >
                  <option value="All">All Occupations</option>
                  <option value="Student">Student</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Daily Wage Worker">Daily Wage Worker</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Unemployed Youth">Unemployed Youth</option>
                  <option value="Senior Citizen">Senior Citizen</option>
                  <option value="Homemaker">Homemaker</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-semibold text-slate-700">
                  Min Age
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={schemeForm.minAge}
                    onChange={(e) => setSchemeForm({ ...schemeForm, minAge: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-700">
                  Max Age
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={schemeForm.maxAge}
                    onChange={(e) => setSchemeForm({ ...schemeForm, maxAge: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500"
                  />
                </label>
              </div>

              <label className="text-xs font-semibold text-slate-700">
                Max Annual Income Ceiling (₹)
                <input
                  type="number"
                  step="10000"
                  min="0"
                  value={schemeForm.maxIncome}
                  onChange={(e) => setSchemeForm({ ...schemeForm, maxIncome: e.target.value })}
                  placeholder="300000"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Official Portal URL *
                <input
                  required
                  type="url"
                  data-testid="admin-scheme-portal-input"
                  value={schemeForm.officialPortalUrl}
                  onChange={(e) => setSchemeForm({ ...schemeForm, officialPortalUrl: e.target.value })}
                  placeholder="https://punjab.gov.in"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
                Required Documents (comma-separated)
                <input
                  value={schemeForm.requiredDocumentsText}
                  onChange={(e) => setSchemeForm({ ...schemeForm, requiredDocumentsText: e.target.value })}
                  placeholder="Aadhaar Card, Punjab Domicile Certificate, Bank Passbook"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700 sm:col-span-2 lg:col-span-3">
                Scheme Description &amp; AI Grounding Summary *
                <textarea
                  required
                  rows={2}
                  data-testid="admin-scheme-desc-input"
                  value={schemeForm.descriptionEn}
                  onChange={(e) => setSchemeForm({ ...schemeForm, descriptionEn: e.target.value })}
                  placeholder="Explain key benefits, eligibility rules, and how citizens can apply so the AI Assistant can accurately advise citizens..."
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500"
                />
              </label>

              {schemeFormError && (
                <p role="alert" className="text-xs font-bold text-red-700 sm:col-span-2 lg:col-span-3">
                  {schemeFormError}
                </p>
              )}
              {schemeFormSuccess && (
                <p role="status" data-testid="admin-scheme-crud-status" className="text-xs font-bold text-emerald-700 sm:col-span-2 lg:col-span-3">
                  {schemeFormSuccess}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-3">
                <button
                  type="submit"
                  data-testid="admin-scheme-submit-btn"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 cursor-pointer"
                >
                  {editingScheme ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  <span>
                    {editingScheme
                      ? 'Save Edited Scheme to AI Knowledge Base'
                      : 'Add Scheme to AI Knowledge Base'}
                  </span>
                </button>

                {editingScheme && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingScheme(null);
                      setSchemeForm(EMPTY_SCHEME_FORM);
                      setSchemeFormError('');
                    }}
                    className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}

                {adminKnowledgeState && adminKnowledgeState.deletedSchemeIds.length > 0 && onRestoreDeletedSchemes && (
                  <button
                    type="button"
                    data-testid="admin-restore-deleted-btn"
                    onClick={() => {
                      onRestoreDeletedSchemes();
                      setSchemeFormSuccess('Restored all deleted default schemes to the AI Knowledge Base.');
                    }}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 cursor-pointer ml-auto"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Restore Deleted Schemes ({adminKnowledgeState.deletedSchemeIds.length})</span>
                  </button>
                )}
              </div>
            </form>

            {/* AI Knowledge Base Active Schemes List with Edit & Delete */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-900">
                  AI Knowledge Base Scheme Entries ({filteredKbSchemes.length} of {allSchemes.length})
                </h3>
                <div className="relative w-full sm:w-72">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    data-testid="admin-kb-search-input"
                    value={kbSearchQuery}
                    onChange={(e) => setKbSearchQuery(e.target.value)}
                    placeholder="Filter AI knowledge base schemes..."
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1">
                {filteredKbSchemes.map((scheme) => {
                  const isCustomAdded = adminKnowledgeState?.customSchemes.some((s) => s.id === scheme.id);
                  const isAdminEdited = Boolean(adminKnowledgeState?.editedSchemes[scheme.id]);
                  return (
                    <article
                      key={scheme.id}
                      data-testid={`admin-kb-scheme-row-${scheme.id}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 transition hover:border-blue-200"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            {scheme.level}
                          </span>
                          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                            {scheme.benefitType}
                          </span>
                          {isCustomAdded && (
                            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-900">
                              Admin Added
                            </span>
                          )}
                          {!isCustomAdded && isAdminEdited && (
                            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
                              Admin Edited
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-slate-900 truncate">{scheme.titleEn}</p>
                        <p className="text-xs font-semibold text-emerald-700">{scheme.benefitAmountText}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          data-testid={`admin-edit-scheme-${scheme.id}`}
                          onClick={() => populateFormForEdit(scheme)}
                          aria-label={`Edit ${scheme.titleEn}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800 transition hover:bg-blue-100 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          data-testid={`admin-delete-scheme-${scheme.id}`}
                          onClick={() => handleDeleteSchemeClick(scheme)}
                          aria-label={`Delete ${scheme.titleEn}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

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
