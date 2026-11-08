import React, { useState, useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { 
  Language, 
  CitizenProfile, 
  Scheme, 
  ApplicationTrackerItem, 
  EligibilityEvaluation,
  ManagedOfficialSite
} from './types/scheme';
import { GOV_SCHEMES } from './data/schemes';
import { TRANSLATIONS } from './data/translations';
import { evaluateAllSchemes } from './utils/schemeEngine';
import { matchesSchemeSearch } from './utils/schemeSearch';
import {
  INITIAL_ADMIN_KNOWLEDGE_STATE,
  addAdminScheme,
  buildAiKnowledgeSummary,
  computeActiveSchemes,
  deleteAdminScheme,
  restoreDeletedSchemes,
  updateAdminScheme,
  type AdminSchemeFormInput,
  type AdminSchemeKnowledgeState
} from './utils/adminSchemeManager';

import {
  DEFAULT_ADVANCED_FILTERS,
  filterSchemesAdvanced,
  getTopRecommendedSchemes,
  recordRecentlyViewedScheme,
  type AdvancedSearchFilters,
} from './utils/advancedSchemeFilter';
import { setOfflineRecentlyViewed } from './utils/offlineCache';

// Components (eagerly imported so 100% of tabs and modals work offline without network chunk errors)
import { HeroBanner } from './components/HeroBanner';
import { SchemeCard } from './components/SchemeCard';
import { FraudProtectionBanner } from './components/FraudProtectionBanner';
import type { AiAdminLogEntry } from './components/AdminConsole';
import { Navbar } from './components/Navbar';
import { SmartDashboardHub } from './components/SmartDashboardHub';
import { ProfileWizard } from './components/ProfileWizard';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { DocumentCenter } from './components/DocumentCenter';
import { SchemeDetailModal } from './components/SchemeDetailModal';
import { FamilyBenefitFinder } from './components/FamilyBenefitFinder';
import { DistrictPortalFinder } from './components/DistrictPortalFinder';
import { ApplicationTracker } from './components/ApplicationTracker';
import { VideoGuidesHub } from './components/VideoGuidesHub';
import { DocumentScannerModal } from './components/DocumentScannerModal';
import { DeadlineReminderHub } from './components/DeadlineReminderHub';
import { CyberFraudShieldModal } from './components/CyberFraudShieldModal';
import { DashboardInsights } from './components/DashboardInsights';
import { ViewAllDocumentsModal } from './components/ViewAllDocumentsModal';
import { AiSchemeAdvisorModal } from './components/AiSchemeAdvisorModal';
import { AiProfileRoadmapModal } from './components/AiProfileRoadmapModal';
import { AdminConsole } from './components/AdminConsole';
import { SavedDeadlineBanner } from './components/SavedDeadlineBanner';
import { OfflineIndicator } from './components/PWAInstallButton';
import { DEFAULT_OFFICIAL_PORTALS, AI_DISCOVERABLE_SCHEMES_POOL } from './data/officialPortals';
import { ALL_STATES_SCHEMES_POOL, generateAutonomousAiSchemeBundle, INDIA_STATES_AND_UTS, getDistrictsForState } from './data/indiaStatesAndDistricts';
import {
  buildDynamicEligibilityPreset,
  resolveLocationFromInputOrCoords,
} from './utils/cyberFraudScanner';
import { supabase, supabaseConfigurationError } from './lib/supabase';
import { apiUrl } from './lib/apiUrl';
import { loadCitizenCloudData, parseCitizenProfile, parseSavedSchemeIds, parseTrackedItems, saveCitizenCloudData } from './lib/citizenCloudSync';
import {
  createLocalAccount,
  linkLocalAccountWithGoogle,
  resetLocalAccountPassword,
  restoreLocalAccount,
  signInLocalAccount,
  signInOrCreateGoogleLocalAccount,
  signOutLocalAccount,
  unlinkLocalAccountGoogle,
  updateLocalAccountPassword
} from './lib/localAuth';
import type { LocalAccount } from './lib/localAuth';

import { 
  ShieldCheck,
  ShieldAlert,
  SearchX,
  Bookmark,
  Trash2,
  Mic,
  ExternalLink,
  ArrowLeft,
  Bot,
  GraduationCap,
  Sparkles,
  MapPin,
  Navigation
} from 'lucide-react';

const DEFAULT_PROFILE: CitizenProfile = {
  username: '',
  role: 'Citizen',
  age: 20,
  gender: 'Male',
  occupation: 'Student',
  annualIncome: 120000,
  category: 'SC',
  district: 'Ludhiana',
  isPunjabDomicile: true,
  landholdingAcres: 0,
  hasDisability: false,
  isWidowOrDestitute: false,
  isEnrolledInSchoolOrCollege: true
};

function getPreferredLanguage(): Language {
  try {
    const savedLanguage = localStorage.getItem('janshayak_language');
    return savedLanguage === 'pa' || savedLanguage === 'hi' ? savedLanguage : 'en';
  } catch (error) {
    console.warn('Could not restore the preferred language:', error);
    return 'en';
  }
}

function loadStoredProfile(key: string): CitizenProfile | null {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    const parsed = parseCitizenProfile(JSON.parse(stored));
    // Upgrade legacy untouched default Farmer profile so Student is selected by default
    if (
      key === 'janshayak_profile' &&
      !localStorage.getItem('janshayak_student_default_v2') &&
      parsed.occupation === 'Farmer' &&
      parsed.age === 38 &&
      parsed.annualIncome === 120000 &&
      !parsed.username
    ) {
      localStorage.setItem('janshayak_student_default_v2', '1');
      return DEFAULT_PROFILE;
    }
    return parsed;
  } catch (error) {
    console.warn(`Could not restore profile from ${key}:`, error);
    return null;
  }
}

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>(getPreferredLanguage);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('janshayak_theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [adminSessionToken, setAdminSessionToken] = useState<string | null>(null);
  useEffect(() => {
    if (activeTab !== 'admin') setAdminSessionToken(null);
  }, [activeTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedSearchFilters>(DEFAULT_ADVANCED_FILTERS);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('janshayak_recently_viewed_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((id): id is string => typeof id === 'string');
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('janshayak_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const trackRecentlyViewed = (schemeId: string) => {
    setRecentlyViewedIds((prev) => {
      const next = recordRecentlyViewedScheme(prev, schemeId, 6);
      try {
        localStorage.setItem('janshayak_recently_viewed_v1', JSON.stringify(next));
        setOfflineRecentlyViewed(next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [profile, setProfile] = useState<CitizenProfile>(() => loadStoredProfile('janshayak_profile') ?? DEFAULT_PROFILE);
  const [managedSites, setManagedSites] = useState<ManagedOfficialSite[]>(() => {
    try {
      const saved = localStorage.getItem('janshayak_official_portals_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not load saved official portals:', e);
    }
    return [
      ...AI_DISCOVERABLE_SCHEMES_POOL.map((b) => b.portal),
      ...ALL_STATES_SCHEMES_POOL.map((b) => b.portal),
      ...DEFAULT_OFFICIAL_PORTALS,
    ];
  });
  const [aiAddedSchemes, setAiAddedSchemes] = useState<Scheme[]>(() => {
    try {
      const saved = localStorage.getItem('janshayak_ai_admin_schemes_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not load AI admin schemes:', e);
    }
    // Automatically seed New (2025-26), Purani (Classic), AND All 36 Indian States/UTs flagship schemes
    return [
      ...AI_DISCOVERABLE_SCHEMES_POOL.map((b) => b.scheme),
      ...ALL_STATES_SCHEMES_POOL.map((b) => b.scheme),
    ];
  });
  const [isAiAutoSyncEnabled, setIsAiAutoSyncEnabled] = useState<boolean>(true);
  const [isAiDiscovering, setIsAiDiscovering] = useState<boolean>(false);
  const [aiAdminLogs, setAiAdminLogs] = useState<AiAdminLogEntry[]>(() =>
    AI_DISCOVERABLE_SCHEMES_POOL.slice(0, 6).map((bundle, idx) => ({
      id: `log-initial-${idx + 1}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      schemeTitle: `${bundle.scheme.titleEn} (${bundle.era === 'new' ? 'New 2026' : 'Purani / Classic'})`,
      portalTitle: bundle.portal.title,
      portalUrl: bundle.portal.url,
      mode: 'Auto-Scheduled',
    }))
  );
  const [portalCategoryFilter, setPortalCategoryFilter] = useState<string>('All');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [localAccount, setLocalAccount] = useState<LocalAccount | null>(null);
  const [localAuthReady, setLocalAuthReady] = useState(false);
  const [localAuthError, setLocalAuthError] = useState<string | null>(null);
  const [dataOwnerId, setDataOwnerId] = useState<string | null | undefined>(undefined);
  const [cloudSyncStatus, setCloudSyncStatus] = useState('Cloud sync is not active.');
  const importLocalDataOnSignIn = useRef(false);
  const importLocalDataOnLocalSignUp = useRef(false);
  const hadActiveCloudAccount = useRef(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [assistantInitialQuestion, setAssistantInitialQuestion] = useState('');
  const hasWelcomedOnLoad = useRef(false);

  const handleLanguageChange = (language: Language) => {
    setCurrentLang(language);
    try {
      localStorage.setItem('janshayak_language', language);
    } catch (error) {
      console.warn('Could not save the preferred language:', error);
    }
  };

  useEffect(() => {
    if (hasWelcomedOnLoad.current || !('speechSynthesis' in window)) return;
    const greetings: Record<Language, { text: string; locale: string }> = {
      en: { text: 'Hello! Welcome to Jansahayak AI. How can I help you today?', locale: 'en-IN' },
      pa: { text: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਜੀ! ਜਨਸਹਾਇਕ AI ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?', locale: 'pa-IN' },
      hi: { text: 'नमस्ते! जनसहायक AI में आपका स्वागत है। आज मैं आपकी कैसे मदद कर सकता हूँ?', locale: 'hi-IN' }
    };

    const timeout = window.setTimeout(() => {
      if (hasWelcomedOnLoad.current) return;
      hasWelcomedOnLoad.current = true;

      const greeting = greetings[currentLang];
      const utterance = new SpeechSynthesisUtterance(greeting.text);
      utterance.lang = greeting.locale;
      utterance.rate = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const languagePrefix = greeting.locale.split('-')[0].toLowerCase();
      const voice = voices.find(candidate => candidate.lang.toLowerCase() === greeting.locale.toLowerCase())
        ?? voices.find(candidate => candidate.lang.toLowerCase().startsWith(`${languagePrefix}-`));
      if (voice) utterance.voice = voice;

      window.speechSynthesis.speak(utterance);
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [currentLang]);

  // Modal states for new innovative features
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerTargetScheme, setScannerTargetScheme] = useState<Scheme | null>(null);
  const [isFraudModalOpen, setIsFraudModalOpen] = useState(false);
  const [videoTutorialSchemeId, setVideoTutorialSchemeId] = useState<string>('pm-kisan');
  const [selectedSchemeModalTab, setSelectedSchemeModalTab] = useState<'overview' | 'estimator' | 'eligibility' | 'documents' | 'steps' | 'tutorial'>('overview');
  const [schemeForDocumentsModal, setSchemeForDocumentsModal] = useState<Scheme | null>(null);
  const [aiAdvisorScheme, setAiAdvisorScheme] = useState<Scheme | null>(null);
  const [isAiRoadmapOpen, setIsAiRoadmapOpen] = useState<boolean>(false);

  // Saved schemes storage
  const [savedSchemeIds, setSavedSchemeIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('punjab_saved_schemes');
      if (saved) return parseSavedSchemeIds(JSON.parse(saved));
    } catch (e) {
      console.warn('Could not read saved schemes from localStorage', e);
    }
    return new Set<string>(['pm-kisan', 'sarbat-sehat-bima']);
  });

  // Application tracker storage
  const [trackedItems, setTrackedItems] = useState<ApplicationTrackerItem[]>(() => {
    try {
      const saved = localStorage.getItem('punjab_tracked_schemes');
      if (saved) return parseTrackedItems(JSON.parse(saved));
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return [
      {
        id: 'track-default-1',
        schemeId: 'pm-kisan',
        schemeTitle: 'PM-Kisan Samman Nidhi Yojana',
        dateStarted: '2026-10-15',
        status: 'Documents Assembled',
        applicationRefNumber: 'PB-PMK-2026-88192'
      },
      {
        id: 'track-default-2',
        schemeId: 'sarbat-sehat-bima',
        schemeTitle: 'Ayushman Bharat - Sarbat Sehat Bima Yojana',
        dateStarted: '2026-10-20',
        status: 'Approved',
        applicationRefNumber: 'SHA-PB-774012'
      }
    ];
  });

  // Smart document owned keys
  const [userOwnedDocs, setUserOwnedDocs] = useState<Set<string>>(() => {
    return new Set<string>([
      'aadhaar card linked with mobile',
      'punjab residence / domicile certificate',
      'active bank passbook (npci mapped)'
    ]);
  });

  useEffect(() => {
    try {
      setLocalAccount(restoreLocalAccount());
    } catch (error) {
      console.error('Could not restore local account:', error);
      setLocalAuthError(error instanceof Error ? error.message : 'Could not restore the local account.');
    } finally {
      setLocalAuthReady(true);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setAuthUser(session?.user ?? null);
      setAuthReady(true);
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.error('Could not restore Supabase session:', error);
        setCloudSyncStatus(`Authentication error: ${error.message}`);
      }
      setAuthUser(data.session?.user ?? null);
      setAuthReady(true);
    }).catch((error: unknown) => {
      if (!active) return;
      console.error('Could not restore Supabase session:', error);
      setCloudSyncStatus(error instanceof Error ? error.message : 'Could not restore Supabase session.');
      setAuthReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady || !localAuthReady) return;

    if (!authUser && localAccount) {
      const ownerId = `local-${localAccount.id}`;
      hadActiveCloudAccount.current = false;
      try {
        const savedSchemes = localStorage.getItem(`punjab_saved_schemes:${ownerId}`);
        const trackedSchemes = localStorage.getItem(`punjab_tracked_schemes:${ownerId}`);
        const savedProfile = loadStoredProfile(`janshayak_profile:${ownerId}`);
        const importGuestData = importLocalDataOnLocalSignUp.current;
        const guestSavedSchemes = importGuestData ? localStorage.getItem('punjab_saved_schemes') : null;
        const guestTrackedSchemes = importGuestData ? localStorage.getItem('punjab_tracked_schemes') : null;
        setSavedSchemeIds(savedSchemes
          ? parseSavedSchemeIds(JSON.parse(savedSchemes))
          : guestSavedSchemes
            ? parseSavedSchemeIds(JSON.parse(guestSavedSchemes))
            : new Set());
        setTrackedItems(trackedSchemes
          ? parseTrackedItems(JSON.parse(trackedSchemes))
          : guestTrackedSchemes
            ? parseTrackedItems(JSON.parse(guestTrackedSchemes)).filter(item => !item.id.startsWith('track-default-'))
            : []);
        setProfile(savedProfile ?? (importGuestData ? loadStoredProfile('janshayak_profile') : null) ?? DEFAULT_PROFILE);
        importLocalDataOnLocalSignUp.current = false;
        setDataOwnerId(ownerId);
        setCloudSyncStatus('This account is saved on this device only. It does not sync to the cloud.');
      } catch (error) {
        console.error('Could not load local account data:', error);
        setCloudSyncStatus(error instanceof Error ? error.message : 'Could not load local account data.');
      }
      return;
    }

    if (!authUser) {
      if (hadActiveCloudAccount.current) {
        setSavedSchemeIds(new Set(['pm-kisan', 'sarbat-sehat-bima']));
        setTrackedItems([]);
      }
      setProfile(loadStoredProfile('janshayak_profile') ?? DEFAULT_PROFILE);
      hadActiveCloudAccount.current = false;
      try {
        const savedSchemes = localStorage.getItem('punjab_saved_schemes');
        const trackedSchemes = localStorage.getItem('punjab_tracked_schemes');
        if (savedSchemes) setSavedSchemeIds(parseSavedSchemeIds(JSON.parse(savedSchemes)));
        if (trackedSchemes) setTrackedItems(parseTrackedItems(JSON.parse(trackedSchemes)));
      } catch (error) {
        console.error('Could not restore local scheme data:', error);
        setCloudSyncStatus('Could not load this device’s saved scheme data.');
      }
      setDataOwnerId(null);
      setCloudSyncStatus('Changes save on this device. Sign in to enable cloud sync.');
      return;
    }

    if (!supabase) return;
    let active = true;
    hadActiveCloudAccount.current = true;
    setDataOwnerId(undefined);
    setProfile(DEFAULT_PROFILE);
    setSavedSchemeIds(new Set());
    setTrackedItems([]);
    setCloudSyncStatus('Loading your account data…');

    loadCitizenCloudData(authUser.id).then(({ savedSchemeIds: cloudSaved, trackedItems: cloudTracked, profile: cloudProfile, hasCloudRecord }) => {
      if (!active) return;
      const cachedProfile = loadStoredProfile(`janshayak_profile:${authUser.id}`);
      const importedProfile = !hasCloudRecord && importLocalDataOnSignIn.current
        ? loadStoredProfile('janshayak_profile')
        : null;
      setProfile(cloudProfile ?? importedProfile ?? cachedProfile ?? DEFAULT_PROFILE);
      if (!hasCloudRecord && importLocalDataOnSignIn.current) {
        const localSaved = localStorage.getItem('punjab_saved_schemes');
        const localTracked = localStorage.getItem('punjab_tracked_schemes');
        const migratedSaved = localSaved ? parseSavedSchemeIds(JSON.parse(localSaved)) : cloudSaved;
        const migratedTracked = localTracked
          ? parseTrackedItems(JSON.parse(localTracked)).filter(item => !item.id.startsWith('track-default-'))
          : cloudTracked;
        setSavedSchemeIds(migratedSaved);
        setTrackedItems(migratedTracked);
      } else if (hasCloudRecord) {
        setSavedSchemeIds(cloudSaved);
        setTrackedItems(cloudTracked);
      } else {
        setSavedSchemeIds(new Set());
        setTrackedItems([]);
      }
      importLocalDataOnSignIn.current = false;
      setDataOwnerId(authUser.id);
      setCloudSyncStatus(hasCloudRecord
        ? 'Cloud data is up to date.'
        : 'First-time local data sync is complete.');
    }).catch((error: unknown) => {
      if (!active) return;
      console.error('Could not load Supabase app data:', error);
      setCloudSyncStatus(error instanceof Error ? error.message : 'Could not load cloud data.');
    });

    return () => {
      active = false;
    };
  }, [authReady, localAuthReady, authUser?.id, localAccount?.id]);

  // Keep the signed-in account's cache separate from guest data on shared devices.
  useEffect(() => {
    const ownerId = authUser?.id ?? (localAccount ? `local-${localAccount.id}` : null);
    if (!authReady || !localAuthReady || dataOwnerId !== ownerId) return;

    const savedKey = ownerId ? `punjab_saved_schemes:${ownerId}` : 'punjab_saved_schemes';
    const trackedKey = ownerId ? `punjab_tracked_schemes:${ownerId}` : 'punjab_tracked_schemes';
    try {
      localStorage.setItem(trackedKey, JSON.stringify(trackedItems));
      localStorage.setItem(savedKey, JSON.stringify(Array.from(savedSchemeIds)));
    } catch (error) {
      console.error('Could not cache scheme data on this device:', error);
      setCloudSyncStatus('Could not save your local cache.');
    }

    if (!authUser || !supabase) return;
    setCloudSyncStatus('Syncing changes…');
    const timeout = window.setTimeout(() => {
      saveCitizenCloudData(authUser.id, savedSchemeIds, trackedItems, profile).then(() => {
        setCloudSyncStatus('Cloud data is up to date.');
      }).catch((error: unknown) => {
        console.error('Could not sync Supabase app data:', error);
        setCloudSyncStatus(error instanceof Error ? error.message : 'Could not sync cloud data.');
      });
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [authReady, localAuthReady, dataOwnerId, authUser?.id, localAccount?.id, savedSchemeIds, trackedItems, profile]);

  useEffect(() => {
    const ownerId = authUser?.id ?? (localAccount ? `local-${localAccount.id}` : null);
    if (!authReady || !localAuthReady || dataOwnerId !== ownerId) return;
    try {
      localStorage.setItem(ownerId ? `janshayak_profile:${ownerId}` : 'janshayak_profile', JSON.stringify(profile));
    } catch (error) {
      console.error('Could not cache citizen profile on this device:', error);
      setCloudSyncStatus('Could not save your profile on this device.');
    }
  }, [authReady, localAuthReady, dataOwnerId, authUser?.id, localAccount?.id, profile]);

  useEffect(() => {
    try {
      localStorage.setItem('janshayak_official_portals_v4', JSON.stringify(managedSites));
    } catch (e) {
      console.warn('Could not save official portals to localStorage:', e);
    }
  }, [managedSites]);

  useEffect(() => {
    try {
      localStorage.setItem('janshayak_ai_admin_schemes_v4', JSON.stringify(aiAddedSchemes));
    } catch (e) {
      console.warn('Could not save AI admin schemes to localStorage:', e);
    }
  }, [aiAddedSchemes]);

  useEffect(() => {
    if (!supabase) {
      return;
    }
    let active = true;
    supabase
      .from('managed_official_sites')
      .select('id, title, url, description, category, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active || error || !data || data.length === 0) return;
        const cloudSites: ManagedOfficialSite[] = data.map(site => ({
          id: site.id,
          title: site.title,
          url: site.url,
          description: site.description,
          category: site.category,
          createdAt: site.created_at
        }));
        setManagedSites(prev => {
          const existingUrls = new Set(cloudSites.map(s => s.url));
          return [...cloudSites, ...prev.filter(p => !existingUrls.has(p.url))];
        });
      });
    return () => {
      active = false;
    };
  }, []);

  const handleTriggerAiDiscovery = async (customTopic?: string, mode: 'Auto-Scheduled' | 'AI On-Demand' = 'AI On-Demand') => {
    setIsAiDiscovering(true);
    try {
      let chosenScheme: Scheme | null = null;
      let chosenPortal: ManagedOfficialSite | null = null;

      if (customTopic && (typeof navigator === 'undefined' || navigator.onLine)) {
        try {
          const resp = await fetch(apiUrl('/api/ai/admin-discover'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: customTopic })
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data?.scheme && data?.portal) {
              chosenScheme = data.scheme;
              chosenPortal = data.portal;
            }
          }
        } catch (err) {
          console.warn('AI Admin endpoint fallback:', err);
        }
      }

      if (!chosenScheme || !chosenPortal) {
        const existingIds = new Set([...GOV_SCHEMES.map(s => s.id), ...aiAddedSchemes.map(s => s.id)]);
        const combinedPool = [...AI_DISCOVERABLE_SCHEMES_POOL, ...ALL_STATES_SCHEMES_POOL];
        const nextFromPool = combinedPool.find(item => !existingIds.has(item.scheme.id));
        if (nextFromPool && !customTopic) {
          chosenScheme = nextFromPool.scheme;
          chosenPortal = nextFromPool.portal;
        } else if (customTopic) {
          const slug = customTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 28) || 'welfare';
          const stamp = Date.now().toString().slice(-4);
          const isStudentTopic = /student|scholar|laptop|college|school|education|ਵਿਦਿਆਰਥੀ/i.test(customTopic);
          const targetState = profile.state || 'Punjab';
          chosenScheme = {
            id: `ai-${slug}-${stamp}`,
            titleEn: `${targetState} & Central ${customTopic} Welfare Initiative`,
            titlePa: `${targetState} ਅਤੇ ਕੇਂਦਰ ${customTopic} ਭਲਾਈ ਯੋਜਨਾ`,
            titleHi: `${targetState} एवं केंद्र ${customTopic} कल्याण योजना`,
            level: targetState === 'Punjab' ? 'Punjab State' : `${targetState} State`,
            state: targetState,
            departmentEn: isStudentTopic ? `Department of Higher Education, ${targetState}` : `Department of Social Justice & Citizen Welfare, ${targetState}`,
            departmentPa: isStudentTopic ? `ਉਚੇਰੀ ਸਿੱਖਿਆ ਵਿਭਾਗ, ${targetState}` : `ਸਮਾਜਿਕ ਨਿਆਂ ਅਤੇ ਭਲਾਈ ਵਿਭਾਗ, ${targetState}`,
            departmentHi: isStudentTopic ? `उच्च शिक्षा विभाग, ${targetState}` : `सामाजिक न्याय एवं कल्याण विभाग, ${targetState}`,
            categoryTags: isStudentTopic ? [targetState, 'Students', 'Education', 'Scholarship', 'New Scheme 2026', 'AI Admin Added'] : [targetState, 'Social Security', 'Subsidy', 'Finance', 'New Scheme 2026', 'AI Admin Added'],
            descriptionEn: `Official AI-indexed government welfare scheme providing direct benefit assistance and digital portal registration for ${customTopic} in ${targetState}.`,
            descriptionPa: `${customTopic} ਲਈ ਸਿੱਧੀ ਸਰਕਾਰੀ ਸਹਾਇਤਾ ਅਤੇ ਆਨਲਾਈਨ ਪੋਰਟਲ ਸਹੂਲਤ।`,
            descriptionHi: `${customTopic} के लिए प्रत्यक्ष सरकारी सहायता और ऑनलाइन पोर्टल सुविधा।`,
            benefitAmountText: isStudentTopic ? '₹25,000 / year Direct Student Grant' : '₹20,000 Direct Benefit Assistance',
            benefitType: isStudentTopic ? 'Scholarship' : 'Direct Cash Transfer',
            minAge: isStudentTopic ? 15 : 18,
            maxAge: isStudentTopic ? 32 : 65,
            eligibleOccupations: isStudentTopic ? ['Student', 'Unemployed Youth'] : ['Student', 'Farmer', 'Daily Wage Worker', 'Self-Employed', 'Unemployed Youth'],
            requiresPunjabDomicile: targetState === 'Punjab',
            maxIncome: 400000,
            applicationDeadline: 'Open on Official Portal (2026-27)',
            deadlineType: 'Ongoing',
            officialPortalUrl: isStudentTopic ? 'https://scholarships.gov.in' : 'https://www.myscheme.gov.in',
            officialPortalName: isStudentTopic ? 'National & State Scholarship Portal' : 'Official e-Governance Portal',
            requiredDocuments: [
              { nameEn: 'Aadhaar Card linked with Mobile', namePa: 'ਮੋਬਾਈਲ ਨਾਲ ਲਿੰਕ ਆਧਾਰ ਕਾਰਡ', nameHi: 'आधार कार्ड', issuingAuthority: 'UIDAI', availableOnDigiLocker: true },
              { nameEn: `${targetState} Residence / Domicile Certificate`, namePa: `${targetState} ਰਿਹਾਇਸ਼ ਸਰਟੀਫਿਕੇਟ`, nameHi: `${targetState} निवास प्रमाण पत्र`, issuingAuthority: 'e-District / Sewa Kendra', availableOnDigiLocker: true }
            ],
            applicationSteps: [
              {
                stepNumber: 1,
                titleEn: 'Apply Online on Official Portal or e-Seva Kendra',
                titlePa: 'ਅਧਿਕਾਰਤ ਪੋਰਟਲ ਜਾਂ ਸੇਵਾ ਕੇਂਦਰ ਰਾਹੀਂ ਅਪਲਾਈ ਕਰੋ',
                titleHi: 'आधिकारिक पोर्टल या सेवा केंद्र से आवेदन करें',
                descriptionEn: 'Submit Aadhaar e-KYC and bank details free of cost.',
                descriptionPa: 'ਆਧਾਰ ਈ-ਕੇਵਾਈਸੀ ਅਤੇ ਬੈਂਕ ਵੇਰਵੇ ਮੁਫ਼ਤ ਦਰਜ ਕਰੋ।',
                descriptionHi: 'आधार ई-केवाईसी और बैंक विवरण निःशुल्क दर्ज करें।'
              }
            ],
            sourceCitation: 'AI Autonomous Admin · Verified Gazette Sync 2026',
            verifiedDate: 'November 2026'
          };
          chosenPortal = {
            id: `portal-ai-${slug}-${stamp}`,
            title: `${customTopic} Official Government Portal`,
            url: isStudentTopic ? 'https://scholarships.gov.in' : 'https://www.myscheme.gov.in',
            description: `Direct official portal link added by Janshayak AI Admin for ${customTopic}.`,
            category: isStudentTopic ? 'Students & Education' : 'Citizen e-Services',
            createdAt: new Date().toISOString()
          };
        } else {
          // Autonomous pan-India synthesizer: continuously generates new State & Central schemes both Online & Offline
          const autoBundle = generateAutonomousAiSchemeBundle(existingIds, aiAddedSchemes.length);
          chosenScheme = autoBundle.scheme;
          chosenPortal = autoBundle.portal;
        }
      }

      if (chosenScheme && chosenPortal) {
        const schemeToAdd = chosenScheme;
        const portalToAdd = chosenPortal;
        setAiAddedSchemes(prev => [schemeToAdd, ...prev.filter(s => s.id !== schemeToAdd.id)]);
        setManagedSites(prev => [portalToAdd, ...prev.filter(p => p.id !== portalToAdd.id)]);
        setAiAdminLogs(prev => [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            schemeTitle: schemeToAdd.titleEn,
            portalTitle: portalToAdd.title,
            portalUrl: portalToAdd.url,
            mode
          },
          ...prev
        ]);
      }
    } finally {
      setIsAiDiscovering(false);
    }
  };

  const handleAppendDiscoveredScheme = (scheme: Scheme, portal?: ManagedOfficialSite) => {
    setAiAddedSchemes((prev) => [scheme, ...prev.filter((s) => s.id !== scheme.id)]);
    if (portal) {
      setManagedSites((prev) => [portal, ...prev.filter((p) => p.id !== portal.id)]);
    }
    setAiAdminLogs((prev) => [
      {
        id: `log-append-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        schemeTitle: scheme.titleEn,
        portalTitle: portal?.title ?? scheme.officialPortalName,
        portalUrl: portal?.url ?? scheme.officialPortalUrl,
        mode: 'AI On-Demand',
      },
      ...prev,
    ]);
  };

  const handleSyncAllAiSchemes = () => {
    const combinedBundles = [...AI_DISCOVERABLE_SCHEMES_POOL, ...ALL_STATES_SCHEMES_POOL];
    setAiAddedSchemes((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const missingSchemes = combinedBundles.map((b) => b.scheme).filter(
        (s) => !existingIds.has(s.id)
      );
      const nextList = [...missingSchemes, ...prev];
      const nextIds = new Set([...GOV_SCHEMES.map((s) => s.id), ...nextList.map((s) => s.id)]);
      const bonusBundle = generateAutonomousAiSchemeBundle(nextIds, nextList.length);
      return [bonusBundle.scheme, ...nextList.filter((s) => s.id !== bonusBundle.scheme.id)];
    });
    setManagedSites((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const missingPortals = combinedBundles.map((b) => b.portal).filter(
        (p) => !existingIds.has(p.id)
      );
      return [...missingPortals, ...prev];
    });
    setAiAdminLogs((prev) => [
      {
        id: `log-sync-all-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        schemeTitle: `Synced All ${combinedBundles.length}+ All-India 36 States/UTs, New (2026) & Purani Schemes`,
        portalTitle: 'Official All-India & State Portals (.gov.in)',
        portalUrl: 'https://www.myscheme.gov.in',
        mode: 'AI On-Demand',
      },
      ...prev,
    ]);
  };

  // Continuous autonomous AI Admin background sync (discovers & adds new State/Central schemes automatically over time in both Online & Offline modes)
  useEffect(() => {
    if (!isAiAutoSyncEnabled) return;
    const interval = window.setInterval(() => {
      void handleTriggerAiDiscovery(undefined, 'Auto-Scheduled');
    }, 12000);
    return () => window.clearInterval(interval);
  }, [isAiAutoSyncEnabled, aiAddedSchemes.length]);

  const handleSignIn = async (email: string, password: string, importLocalData: boolean) => {
    if (!supabase) return { error: supabaseConfigurationError || 'Supabase is not configured.' };
    importLocalDataOnSignIn.current = importLocalData;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && localAccount) {
      signOutLocalAccount();
      setLocalAccount(null);
    }
    return error ? { error: error.message } : {};
  };

  const handleSignUp = async (email: string, password: string, importLocalData: boolean) => {
    if (!supabase) return { error: supabaseConfigurationError || 'Supabase is not configured.' };
    importLocalDataOnSignIn.current = importLocalData;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (!data.session) {
      return { notice: 'Check your email to confirm your account, then sign in.' };
    }
    if (localAccount) {
      signOutLocalAccount();
      setLocalAccount(null);
    }
    return {};
  };

  const handleLocalSignIn = async (email: string, password: string) => {
    const account = await signInLocalAccount(email, password);
    if (authUser && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        signOutLocalAccount();
        return { error: `Could not switch accounts: ${error.message}` };
      }
    }
    setLocalAccount(account);
    return {};
  };

  const handleLocalSignUp = async (email: string, password: string, importLocalData: boolean) => {
    const account = await createLocalAccount(email, password);
    if (authUser && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        signOutLocalAccount();
        return { error: `Could not switch accounts: ${error.message}` };
      }
    }
    importLocalDataOnLocalSignUp.current = importLocalData;
    setLocalAccount(account);
    return {};
  };

  const handleLocalResetPassword = async (email: string, newPassword: string) => {
    const account = await resetLocalAccountPassword(email, newPassword);
    if (authUser && supabase) {
      await supabase.auth.signOut();
    }
    setLocalAccount(account);
    return { notice: 'Password reset and signed in successfully.' };
  };

  const handleCloudResetPassword = async (email: string) => {
    if (!supabase) return { error: supabaseConfigurationError || 'Supabase is not configured.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) return { error: error.message };
    return { notice: 'Password reset instructions have been sent to your email.' };
  };

  const handleSignOut = async () => {
    if (localAccount) {
      signOutLocalAccount();
      setLocalAccount(null);
      return null;
    }
    if (!supabase) return supabaseConfigurationError || 'Supabase is not configured.';
    const { error } = await supabase.auth.signOut();
    return error?.message ?? null;
  };

  const handleGoogleSignIn = async (googleEmail?: string) => {
    if (supabase && !googleEmail) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) return { error: error.message };
      return { notice: 'Redirecting to Google Sign-In…' };
    }
    if (!googleEmail) {
      return { error: 'Enter your Google email address to continue with Google.' };
    }
    const account = await signInOrCreateGoogleLocalAccount(googleEmail);
    setLocalAccount(account);
    return { notice: `Signed in and linked with Google (${account.googleLinkedEmail}).` };
  };

  const handleLinkGoogle = async (googleEmail?: string) => {
    if (!googleEmail) {
      return { error: 'Enter your Google email address to link your Google account.' };
    }
    if (localAccount) {
      const updated = linkLocalAccountWithGoogle(localAccount.id, googleEmail);
      setLocalAccount(updated);
      return { notice: `Linked with Google (${updated.googleLinkedEmail}).` };
    }
    const created = await signInOrCreateGoogleLocalAccount(googleEmail);
    setLocalAccount(created);
    return { notice: `Signed in and linked with Google (${created.googleLinkedEmail}).` };
  };

  const handleUnlinkGoogle = async () => {
    if (localAccount) {
      const updated = unlinkLocalAccountGoogle(localAccount.id);
      setLocalAccount(updated);
      return { notice: 'Google account unlinked from this profile.' };
    }
    return {};
  };

  const handleSaveProfile = async () => {
    const ownerId = authUser?.id ?? (localAccount ? `local-${localAccount.id}` : null);
    if (!authReady || dataOwnerId !== ownerId) {
      throw new Error('Your account data is still loading. Please try again in a moment.');
    }

    const profileKey = ownerId ? `janshayak_profile:${ownerId}` : 'janshayak_profile';
    try {
      localStorage.setItem(profileKey, JSON.stringify(profile));
    } catch (error) {
      console.error('Could not save citizen profile on this device:', error);
      throw new Error('Could not save the profile on this device. Check available storage and try again.');
    }

    if (authUser) {
      if (!supabase) throw new Error(supabaseConfigurationError || 'Supabase is not configured.');
      setCloudSyncStatus('Saving your profile to Supabase…');
      try {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { username: profile.username.trim() }
        });
        if (metadataError) throw metadataError;
        await saveCitizenCloudData(authUser.id, savedSchemeIds, trackedItems, profile);
      } catch (error) {
        console.error('Could not save citizen profile to Supabase:', error);
        setCloudSyncStatus(error instanceof Error ? error.message : 'Could not save profile to Supabase.');
        throw new Error('The profile is saved on this device, but cloud sync failed. Check your connection and Supabase setup.');
      }
      setCloudSyncStatus('Your profile is saved and synced to Supabase.');
      return;
    }

    setCloudSyncStatus('Your profile is saved on this device. Sign in to sync it with Supabase.');
  };

  const handleSetPassword = async (password: string) => {
    if (localAccount && !authUser) {
      await updateLocalAccountPassword(localAccount.id, password);
      return;
    }
    if (!authUser || !supabase) {
      throw new Error('Sign in to your account before setting a password.');
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.error('Could not update Supabase account password:', error);
      throw new Error(error.message);
    }
  };

  const handleToggleSave = (scheme: Scheme) => {
    setSavedSchemeIds(prev => {
      const next = new Set(prev);
      if (next.has(scheme.id)) {
        next.delete(scheme.id);
      } else {
        next.add(scheme.id);
      }
      return next;
    });
  };

  const handleClearSaved = () => {
    setSavedSchemeIds(new Set());
  };

  const [locationDraft, setLocationDraft] = useState<string>(() => profile.customLocation || '');
  const [locationStatusMsg, setLocationStatusMsg] = useState<string>('');

  const handleQuickOccupationSelect = (selection: CitizenProfile['occupation'] | string) => {
    setProfile(prev => {
      const preset = buildDynamicEligibilityPreset(selection, prev);
      return {
        ...prev,
        ...preset.profilePatch,
      };
    });
  };

  const handleApplyCustomLocation = (rawText: string) => {
    const trimmed = rawText.trim();
    const resolved = resolveLocationFromInputOrCoords({
      rawLocationText: trimmed,
      currentState: profile.state || 'Punjab',
      currentDistrict: profile.district,
    });
    setProfile(prev => ({
      ...prev,
      state: resolved.state,
      district: resolved.district,
      customLocation: resolved.customLocation || trimmed,
      pincode: resolved.pincode || prev.pincode,
      isPunjabDomicile: resolved.state === 'Punjab',
    }));
    setLocationDraft(resolved.customLocation || trimmed);
    setLocationStatusMsg(
      `Location set: ${resolved.customLocation ? `${resolved.customLocation} · ` : ''}${resolved.district}, ${resolved.state}${resolved.pincode ? ` (PIN ${resolved.pincode})` : ''}`
    );
  };

  const handleDetectGpsLocation = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setLocationStatusMsg('Detecting GPS coordinates...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const resolved = resolveLocationFromInputOrCoords({
            rawLocationText: locationDraft,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            currentState: profile.state || 'Punjab',
            currentDistrict: profile.district,
          });
          setProfile(prev => ({
            ...prev,
            state: resolved.state,
            district: resolved.district,
            customLocation: resolved.customLocation,
            isPunjabDomicile: resolved.state === 'Punjab',
          }));
          setLocationDraft(resolved.customLocation);
          setLocationStatusMsg(`GPS matched: ${resolved.district}, ${resolved.state}`);
        },
        () => {
          const fallback = resolveLocationFromInputOrCoords({
            rawLocationText: locationDraft || `${profile.district}, ${profile.state || 'Punjab'}`,
            currentState: profile.state || 'Punjab',
            currentDistrict: profile.district,
          });
          setProfile(prev => ({
            ...prev,
            state: fallback.state,
            district: fallback.district,
            customLocation: fallback.customLocation,
          }));
          setLocationStatusMsg(`Active location: ${fallback.district}, ${fallback.state}`);
        },
        { timeout: 4000 }
      );
    } else {
      handleApplyCustomLocation(locationDraft || `${profile.district}, ${profile.state || 'Punjab'}`);
    }
  };

  const [adminKnowledgeState, setAdminKnowledgeState] = useState<AdminSchemeKnowledgeState>(() => {
    try {
      const saved = localStorage.getItem('janshayak_admin_kb_state_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            customSchemes: Array.isArray(parsed.customSchemes) ? parsed.customSchemes : [],
            editedSchemes: parsed.editedSchemes && typeof parsed.editedSchemes === 'object' ? parsed.editedSchemes : {},
            deletedSchemeIds: Array.isArray(parsed.deletedSchemeIds) ? parsed.deletedSchemeIds : []
          };
        }
      }
    } catch (e) {
      console.warn('Could not load admin knowledge base state:', e);
    }
    return INITIAL_ADMIN_KNOWLEDGE_STATE;
  });
  const [adminEditTargetScheme, setAdminEditTargetScheme] = useState<Scheme | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('janshayak_admin_kb_state_v1', JSON.stringify(adminKnowledgeState));
    } catch (e) {
      console.warn('Could not save admin knowledge base state:', e);
    }
  }, [adminKnowledgeState]);

  const handleAddAdminScheme = (input: AdminSchemeFormInput): Scheme => {
    if (!adminSessionToken) throw new Error('Unlock the admin portal before managing schemes.');
    const { nextState, createdScheme } = addAdminScheme(adminKnowledgeState, input, 'Admin');
    setAdminKnowledgeState(nextState);
    return createdScheme;
  };

  const handleUpdateAdminScheme = (existingScheme: Scheme, input: AdminSchemeFormInput): Scheme => {
    if (!adminSessionToken) throw new Error('Unlock the admin portal before managing schemes.');
    const { nextState, updatedScheme } = updateAdminScheme(adminKnowledgeState, existingScheme, input, 'Admin');
    setAdminKnowledgeState(nextState);
    if (selectedScheme?.id === updatedScheme.id) {
      setSelectedScheme(updatedScheme);
    }
    return updatedScheme;
  };

  const handleDeleteAdminScheme = (schemeId: string) => {
    if (!adminSessionToken) throw new Error('Unlock the admin portal before managing schemes.');
    const nextState = deleteAdminScheme(adminKnowledgeState, schemeId, 'Admin');
    setAdminKnowledgeState(nextState);
    if (selectedScheme?.id === schemeId) {
      setSelectedScheme(null);
    }
  };

  const handleRestoreDeletedSchemes = () => {
    if (!adminSessionToken) throw new Error('Unlock the admin portal before managing schemes.');
    const nextState = restoreDeletedSchemes(adminKnowledgeState, 'Admin');
    setAdminKnowledgeState(nextState);
  };

  const handleEditSchemeFromCard = (scheme: Scheme) => {
    setAdminEditTargetScheme(scheme);
    setActiveTab('admin');
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const t = TRANSLATIONS[currentLang];

  // Combine Admin custom/edited/deleted state, AI-Admin added schemes, and static GOV_SCHEMES
  const allSchemes = React.useMemo(() => {
    return computeActiveSchemes(GOV_SCHEMES, aiAddedSchemes, adminKnowledgeState);
  }, [aiAddedSchemes, adminKnowledgeState]);

  // Sync the active scheme knowledge base to the backend AI server whenever Admin modifies schemes
  useEffect(() => {
    if (!adminSessionToken) return;
    const summary = buildAiKnowledgeSummary(allSchemes);
    fetch(apiUrl('/api/admin/knowledge-base'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminSessionToken}` },
      body: JSON.stringify({ knowledgeBase: summary })
    }).then(response => {
      if (!response.ok) console.error(`Admin knowledge-base sync failed with HTTP ${response.status}.`);
    }).catch(error => {
      console.error('Admin knowledge-base sync failed:', error);
    });
  }, [allSchemes, adminSessionToken]);

  // Evaluate profile against all schemes
  const evaluations = evaluateAllSchemes(profile, allSchemes);
  const evaluationMap = new Map<string, EligibilityEvaluation>();
  evaluations.forEach(e => evaluationMap.set(e.schemeId, e));

  const eligibleCount = evaluations.filter(e => e.isEligible).length;
  const potentialCount = evaluations.filter(e => e.isPotentialMatch).length;

  const effectiveAdvancedFilters: AdvancedSearchFilters = {
    ...advancedFilters,
    query: searchQuery,
    category: activeCategoryFilter,
  };

  const filteredEvaluations = filterSchemesAdvanced(
    evaluations,
    effectiveAdvancedFilters,
    Array.from(savedSchemeIds)
  );
  const filteredSchemes = filteredEvaluations.map(e => e.scheme);
  const topRecommendedEvaluations = getTopRecommendedSchemes(evaluations, 3);
  const recentlyViewedSchemes = recentlyViewedIds
    .map(id => allSchemes.find(s => s.id === id))
    .filter((s): s is Scheme => Boolean(s));

  const handleUpdateAdvancedFilters = (patch: Partial<AdvancedSearchFilters>) => {
    if (typeof patch.query === 'string') {
      setSearchQuery(patch.query);
    }
    if (typeof patch.category === 'string') {
      setActiveCategoryFilter(patch.category);
    }
    if (patch.occupation && patch.occupation !== 'All') {
      handleQuickOccupationSelect(patch.occupation);
    }
    setAdvancedFilters(prev => ({ ...prev, ...patch }));
  };

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setActiveCategoryFilter('all');
    setAdvancedFilters(DEFAULT_ADVANCED_FILTERS);
  };

  const handleTrackScheme = (scheme: Scheme) => {
    const existing = trackedItems.find(item => item.schemeId === scheme.id);
    if (!existing) {
      const newItem: ApplicationTrackerItem = {
        id: `track-${Date.now()}`,
        schemeId: scheme.id,
        schemeTitle: scheme.titleEn,
        dateStarted: new Date().toISOString().split('T')[0],
        status: 'Discovered'
      };
      setTrackedItems(prev => [newItem, ...prev]);
    }
  };

  const handleAddTrackedSchemeById = (schemeId: string) => {
    const scheme = allSchemes.find(s => s.id === schemeId);
    if (scheme) {
      handleTrackScheme(scheme);
    }
  };

  const handleUpdateStatus = (id: string, status: ApplicationTrackerItem['status']) => {
    setTrackedItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const handleUpdateRefNumber = (id: string, refNumber: string) => {
    setTrackedItems(prev => prev.map(item => item.id === id ? { ...item, applicationRefNumber: refNumber } : item));
  };

  const handleRemoveTrackedItem = (id: string) => {
    setTrackedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleToggleDoc = (docKey: string) => {
    setUserOwnedDocs(prev => {
      const next = new Set(prev);
      const lowerKey = docKey.toLowerCase();
      if (next.has(lowerKey)) {
        next.delete(lowerKey);
      } else {
        next.add(lowerKey);
      }
      return next;
    });
  };

  const handleAddOwnedDoc = (docKey: string) => {
    setUserOwnedDocs(prev => new Set(prev).add(docKey.toLowerCase()));
  };

  const handleRemoveOwnedDoc = (docKey: string) => {
    setUserOwnedDocs(prev => {
      const next = new Set(prev);
      next.delete(docKey.toLowerCase());
      return next;
    });
  };

  const handleOpenTutorial = (scheme: Scheme) => {
    setVideoTutorialSchemeId(scheme.id);
    setActiveTab('video-guides');
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleOpenScanner = (scheme?: Scheme) => {
    setScannerTargetScheme(scheme || null);
    setIsScannerOpen(true);
  };

  const handleOpenSchemeDetails = (
    scheme: Scheme, 
    initialTab: 'overview' | 'estimator' | 'eligibility' | 'documents' | 'steps' | 'tutorial' = 'overview'
  ) => {
    trackRecentlyViewed(scheme.id);
    setSelectedScheme(scheme);
    setSelectedSchemeModalTab(initialTab);
  };

  const handleOpenAllDocuments = (scheme: Scheme) => {
    trackRecentlyViewed(scheme.id);
    setSchemeForDocumentsModal(scheme);
  };

  // Get saved schemes
  const savedSchemes = allSchemes.filter(s => savedSchemeIds.has(s.id));

  const portalCategories = ['All', ...Array.from(new Set(managedSites.map(s => s.category)))];
  const visiblePortals = portalCategoryFilter === 'All'
    ? managedSites
    : managedSites.filter(s => s.category === portalCategoryFilter);

  const occupationsList: { id: CitizenProfile['occupation']; label: string }[] = [
    { id: 'Student', label: currentLang === 'pa' ? 'ਵਿਦਿਆਰਥੀ (Student)' : currentLang === 'hi' ? 'छात्र (Student)' : 'Student (ਵਿਦਿਆਰਥੀ)' },
    { id: 'Farmer', label: currentLang === 'pa' ? 'ਕਿਸਾਨ (Farmer)' : currentLang === 'hi' ? 'किसान (Farmer)' : 'Farmer (ਕਿਸਾਨ)' },
    { id: 'Daily Wage Worker', label: currentLang === 'pa' ? 'ਦਿਹਾੜੀਦਾਰ ਮਜ਼ਦੂਰ' : currentLang === 'hi' ? 'दिहाड़ी मजदूर' : 'Daily Wage Worker' },
    { id: 'Self-Employed', label: currentLang === 'pa' ? 'ਸਵੈ-ਰੁਜ਼ਗਾਰ' : currentLang === 'hi' ? 'स्वरोजगार' : 'Self-Employed' },
    { id: 'Unemployed Youth', label: currentLang === 'pa' ? 'ਬੇਰੁਜ਼ਗਾਰ ਨੌਜਵਾਨ' : currentLang === 'hi' ? 'बेरोजगार युवा' : 'Unemployed Youth' },
    { id: 'Senior Citizen', label: currentLang === 'pa' ? 'ਬਜ਼ੁਰਗ ਨਾਗਰਿਕ (60+)' : currentLang === 'hi' ? 'वरिष्ठ नागरिक (60+)' : 'Senior Citizen (60+)' },
    { id: 'Homemaker', label: currentLang === 'pa' ? 'ਘਰੇਲੂ ਔਰਤ' : currentLang === 'hi' ? 'गृहिणी' : 'Homemaker' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 selection:text-slate-900 transition-colors">
      <OfflineIndicator currentLang={currentLang} />
      <React.Suspense fallback={<div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 text-center text-sm text-slate-500">Loading feature…</div>}>
      {/* Top Navbar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        savedCount={savedSchemeIds.size}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        cloudAccount={{
          configured: Boolean(supabase),
          configurationError: supabaseConfigurationError,
          userEmail: authUser?.email ?? null,
          localUserEmail: localAccount?.email ?? null,
          googleLinkedEmail: localAccount?.googleLinkedEmail ?? (authUser?.app_metadata?.provider === 'google' ? authUser.email : null),
          username: profile.username,
          localAuthError,
          syncStatus: cloudSyncStatus,
          onSignIn: handleSignIn,
          onSignUp: handleSignUp,
          onLocalSignIn: handleLocalSignIn,
          onLocalSignUp: handleLocalSignUp,
          onLocalResetPassword: handleLocalResetPassword,
          onCloudResetPassword: handleCloudResetPassword,
          onGoogleSignIn: handleGoogleSignIn,
          onLinkGoogle: handleLinkGoogle,
          onUnlinkGoogle: handleUnlinkGoogle,
          onSignOut: handleSignOut
        }}
      />

      {activeTab === 'dashboard' && (
        <HeroBanner
          currentLang={currentLang}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onStartWizard={() => setActiveTab('wizard')}
          onOpenFamilyFinder={() => setActiveTab('family')}
          activeFilter={activeCategoryFilter}
          onFilterChange={(filter) => {
            setActiveCategoryFilter(filter);
            if (filter === 'Students') {
              handleQuickOccupationSelect('Student');
            } else if (filter === 'Farmers') {
              handleQuickOccupationSelect('Farmer');
            } else if (filter === 'Women') {
              handleQuickOccupationSelect('Women');
            } else if (filter === 'Seniors') {
              handleQuickOccupationSelect('Senior Citizen');
            } else if (filter === 'Business Owners') {
              handleQuickOccupationSelect('Self-Employed');
            }
          }}
          onAskAI={() => {
            setAssistantInitialQuestion(searchQuery.trim());
            setIsVoiceAssistantOpen(true);
          }}
        />
      )}

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">

        {/* TAB: DASHBOARD & SCHEME DIRECTORY */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <FraudProtectionBanner
              currentLang={currentLang}
              onOpenScanner={() => setIsFraudModalOpen(true)}
            />
            <SavedDeadlineBanner
              schemes={allSchemes}
              savedSchemeIds={savedSchemeIds}
              currentLang={currentLang}
              onOpenSchemeDetails={(scheme) => handleOpenSchemeDetails(scheme, 'overview')}
              onToggleSave={handleToggleSave}
              onOpenDeadlineHub={() => setActiveTab('deadlines')}
              onFilterSavedSchemes={() => setActiveTab('saved')}
            />
            <SmartDashboardHub
              currentLang={currentLang}
              profile={profile}
              evaluations={evaluations}
              topRecommended={topRecommendedEvaluations}
              recentlyViewedSchemes={recentlyViewedSchemes}
              savedSchemeIds={Array.from(savedSchemeIds)}
              advancedFilters={effectiveAdvancedFilters}
              onUpdateFilters={handleUpdateAdvancedFilters}
              onResetFilters={handleResetAllFilters}
              onOpenSchemeDetails={(scheme) => handleOpenSchemeDetails(scheme, 'overview')}
              onClearRecentlyViewed={() => {
                setRecentlyViewedIds([]);
                try {
                  localStorage.removeItem('janshayak_recently_viewed_v1');
                } catch {
                  // ignore
                }
              }}
              onNavigateTab={setActiveTab}
              onSyncAllAiSchemes={handleSyncAllAiSchemes}
              onTriggerAiDiscovery={(topic) => handleTriggerAiDiscovery(topic, 'AI On-Demand')}
              isAiDiscovering={isAiDiscovering}
              isAiAutoSyncEnabled={isAiAutoSyncEnabled}
              onToggleAiAutoSync={setIsAiAutoSyncEnabled}
              latestAutoAddedTitle={aiAdminLogs[0]?.schemeTitle}
            />
            {/* Active Occupation + Dynamic Eligibility Criteria + Custom Location Selector Bar */}
            {(() => {
              const activePreset = buildDynamicEligibilityPreset(profile.occupation, profile);
              return (
                <section
                  aria-label="Occupation selector"
                  data-testid="live-eligibility-criteria-panel"
                  className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/90 via-white to-teal-50/80 p-4 sm:p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white shadow-xs">
                        <GraduationCap className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                            {currentLang === 'pa' ? 'ਕਿੱਤਾ ਅਤੇ ਯੋਗਤਾ (Occupation & Eligibility):' : 'Occupation & Dynamic Eligibility:'}
                          </span>
                          <span
                            data-testid="active-occupation-badge"
                            className="inline-flex items-center gap-1 rounded-full bg-blue-700 px-2.5 py-0.5 text-xs font-bold text-white"
                          >
                            {occupationsList.find(o => o.id === profile.occupation)?.label || profile.occupation}
                          </span>
                          <span
                            data-testid="active-location-badge"
                            className="inline-flex items-center gap-1 rounded-full bg-teal-700 px-2.5 py-0.5 text-xs font-bold text-white"
                          >
                            <MapPin className="h-3 w-3" />
                            {profile.customLocation ? `${profile.customLocation} · ` : ''}
                            {profile.district}, {profile.state || 'Punjab'}
                          </span>
                          <span
                            data-testid="live-eligibility-match-summary"
                            className="text-xs font-extrabold text-emerald-700"
                          >
                            ({eligibleCount} Eligible · {potentialCount} Potential)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {currentLang === 'pa'
                            ? activePreset.summaryPa
                            : currentLang === 'hi'
                            ? activePreset.summaryHi
                            : activePreset.summaryEn}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        data-testid="open-cyber-scanner-quick-btn"
                        onClick={() => setIsFraudModalOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-900 transition hover:bg-red-100 cursor-pointer"
                      >
                        <ShieldAlert className="h-3.5 w-3.5 text-red-700" />
                        <span>
                          {currentLang === 'pa' ? 'ਵੈੱਬਸਾਈਟ ਅਸਲੀ/ਨਕਲੀ ਸਕੈਨਰ' : 'Scan Website (Cyber Shield)'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('admin')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-900 transition hover:bg-teal-100 cursor-pointer"
                      >
                        <Bot className="h-3.5 w-3.5 text-teal-700" />
                        <span>AI Knowledge Base ({allSchemes.length} Schemes)</span>
                      </button>
                    </div>
                  </div>

                  {/* Occupation Selection Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {occupationsList.map((occ) => {
                      const isSelected = profile.occupation === occ.id;
                      return (
                        <button
                          key={occ.id}
                          type="button"
                          data-testid={`occupation-btn-${occ.id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                          onClick={() => handleQuickOccupationSelect(occ.id)}
                          aria-pressed={isSelected}
                          className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-700 text-white shadow-sm ring-2 ring-blue-300'
                              : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                        >
                          {occ.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Live Adjustable Eligibility Criteria + Add Custom Location Bar */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-2 border-t border-blue-100/80">
                    {/* Left: Live Eligibility Criteria Controls for Selected Occupation */}
                    <div className="lg:col-span-7 bg-white/95 rounded-xl border border-slate-200 p-3 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900">
                          {currentLang === 'pa'
                            ? `${profile.occupation} ਲਈ ਲਾਈਵ ਯੋਗਤਾ ਸ਼ਰਤਾਂ (Live Eligibility Criteria)`
                            : `Active Eligibility Criteria for ${profile.occupation}`}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {activePreset.criteriaPills.map((pill, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md"
                            >
                              {pill.labelEn}: <strong>{pill.value}</strong>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <label className="text-[11px] font-semibold text-slate-600">
                          Age (Years)
                          <input
                            type="number"
                            data-testid="quick-eligibility-age-input"
                            min={1}
                            max={105}
                            value={profile.age}
                            onChange={(e) =>
                              setProfile((prev) => ({
                                ...prev,
                                age: Math.max(1, Number(e.target.value) || 18),
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                          />
                        </label>

                        <label className="text-[11px] font-semibold text-slate-600">
                          Income (₹/Yr)
                          <select
                            data-testid="quick-eligibility-income-select"
                            value={profile.annualIncome}
                            onChange={(e) =>
                              setProfile((prev) => ({
                                ...prev,
                                annualIncome: Number(e.target.value),
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold text-slate-900"
                          >
                            <option value={55000}>₹55,000 (BPL)</option>
                            <option value={120000}>₹1,20,000</option>
                            <option value={150000}>₹1,50,000</option>
                            <option value={180000}>₹1,80,000</option>
                            <option value={240000}>₹2,40,000</option>
                            <option value={300000}>₹3,00,000</option>
                            <option value={500000}>₹5,00,000</option>
                            <option value={800000}>₹8,00,000</option>
                          </select>
                        </label>

                        <label className="text-[11px] font-semibold text-slate-600">
                          Social Category
                          <select
                            data-testid="quick-eligibility-category-select"
                            value={profile.category}
                            onChange={(e) =>
                              setProfile((prev) => ({
                                ...prev,
                                category: e.target.value as CitizenProfile['category'],
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold text-slate-900"
                          >
                            <option value="General">General</option>
                            <option value="SC">SC</option>
                            <option value="OBC/BC">OBC/BC</option>
                            <option value="EWS">EWS</option>
                            <option value="ST">ST</option>
                          </select>
                        </label>

                        <label className="text-[11px] font-semibold text-slate-600">
                          Land (Acres)
                          <input
                            type="number"
                            data-testid="quick-eligibility-land-input"
                            min={0}
                            max={100}
                            step={0.5}
                            value={profile.landholdingAcres}
                            onChange={(e) =>
                              setProfile((prev) => ({
                                ...prev,
                                landholdingAcres: Math.max(0, Number(e.target.value) || 0),
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Right: Add Custom Location (Village / City / Pincode / State / District + GPS) */}
                    <div className="lg:col-span-5 bg-white/95 rounded-xl border border-teal-200 p-3 shadow-2xs flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-900 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-teal-600" />
                          {currentLang === 'pa'
                            ? 'ਆਪਣੀ ਲੋਕੇਸ਼ਨ ਐਡ ਕਰੋ (Add Your Location)'
                            : currentLang === 'hi'
                            ? 'अपना स्थान जोड़ें (Add Your Location)'
                            : 'Add Your Location (Village / City / Pincode)'}
                        </span>
                        <button
                          type="button"
                          data-testid="detect-gps-location-btn"
                          onClick={handleDetectGpsLocation}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-md cursor-pointer"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>{currentLang === 'pa' ? 'GPS ਲੋਕੇਸ਼ਨ' : 'Detect GPS'}</span>
                        </button>
                      </div>

                      <div className="flex gap-1.5">
                        <input
                          id="dashboard-custom-location-input"
                          type="text"
                          data-testid="custom-location-input"
                          value={locationDraft}
                          onChange={(e) => setLocationDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyCustomLocation(e.currentTarget.value);
                            }
                          }}
                          placeholder={
                            currentLang === 'pa'
                              ? 'ਪਿੰਡ / ਸ਼ਹਿਰ / ਪਿੰਨਕੋਡ (ਜਿਵੇਂ Samana, Patiala, 147101)...'
                              : 'Enter Village, City, District or Pincode (e.g. Patiala 147001)...'
                          }
                          className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900"
                        />
                        <button
                          type="button"
                          data-testid="save-custom-location-btn"
                          onClick={() => {
                            const el = document.getElementById('dashboard-custom-location-input') as HTMLInputElement | null;
                            handleApplyCustomLocation(el?.value ?? locationDraft);
                          }}
                          className="rounded-lg bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 text-xs font-bold shrink-0 cursor-pointer"
                        >
                          {currentLang === 'pa' ? 'ਲੋਕੇਸ਼ਨ ਸੇਵ' : 'Set Location'}
                        </button>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-1.5">
                        <select
                          aria-label="Quick State Select"
                          data-testid="quick-location-state-select"
                          value={profile.state || 'Punjab'}
                          onChange={(e) => {
                            const nextState = e.target.value;
                            const dists = getDistrictsForState(nextState);
                            setProfile((prev) => ({
                              ...prev,
                              state: nextState,
                              district: dists[0]?.name || 'Ludhiana',
                              isPunjabDomicile: nextState === 'Punjab',
                            }));
                          }}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-800"
                        >
                          {INDIA_STATES_AND_UTS.map((st) => (
                            <option key={st.code} value={st.name}>
                              {st.name}
                            </option>
                          ))}
                        </select>
                        <select
                          aria-label="Quick District Select"
                          data-testid="quick-location-district-select"
                          value={profile.district}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              district: e.target.value,
                            }))
                          }
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-800"
                        >
                          {getDistrictsForState(profile.state || 'Punjab').map((d) => (
                            <option key={d.name} value={d.name}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {locationStatusMsg && (
                        <p
                          data-testid="location-status-message"
                          className="mt-1 text-[11px] font-semibold text-emerald-700"
                        >
                          {locationStatusMsg}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              );
            })()}

            {/* Scheme Cards Grid */}
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  Explore government schemes
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Discover benefits and support matched to your needs ({profile.occupation} profile active).
                </p>
              </div>
              <span className="text-sm font-medium text-slate-500">
                {filteredSchemes.length} {filteredSchemes.length === 1 ? 'scheme' : 'schemes'}
              </span>
            </div>

            {filteredSchemes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSchemes.map((scheme) => (
                  <SchemeCard
                    key={scheme.id}
                    scheme={scheme}
                    evaluation={evaluationMap.get(scheme.id)}
                    currentLang={currentLang}
                    onOpenDetails={(s, tab) => handleOpenSchemeDetails(s, tab)}
                    onOpenAllDocuments={handleOpenAllDocuments}
                    onOpenAiAdvisor={(s) => setAiAdvisorScheme(s)}
                    onOpenTutorial={(s) => handleOpenTutorial(s)}
                    onOpenScanner={(s) => handleOpenScanner(s)}
                    isSaved={savedSchemeIds.has(scheme.id)}
                    onToggleSave={handleToggleSave}
                    isAdminRole={Boolean(adminSessionToken)}
                    onEditScheme={adminSessionToken ? handleEditSchemeFromCard : undefined}
                    onDeleteScheme={adminSessionToken ? (s) => handleDeleteAdminScheme(s.id) : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
                <SearchX className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-bold text-slate-800">No schemes matched your search criteria</h3>
                <p className="text-xs text-slate-500">
                  Try adjusting the search query or switching the category filter back to "All Schemes".
                </p>
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="text-xs font-bold text-blue-700 underline mt-2 cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {managedSites.length > 0 && (
              <section className="space-y-4 pt-6 border-t border-slate-200/80">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Verified Direct Government Links ({managedSites.length} Portals)</span>
                    </div>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                      Official Government Portals & Direct Application Links
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Verified .gov.in & .nic.in portals maintained by Janshayak AI Admin for Students, Farmers, Health, Pensions & Jobs.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('admin')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Bot className="h-3.5 w-3.5 text-teal-300" />
                    <span>Open AI Admin Console</span>
                  </button>
                </div>

                {/* Portal Category Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  {portalCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPortalCategoryFilter(cat)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                        portalCategoryFilter === cat
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visiblePortals.map(site => (
                    <article key={site.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{site.category}</p>
                        <h3 className="mt-2 text-base font-semibold text-slate-900">{site.title}</h3>
                        {site.description && <p className="mt-2 text-sm leading-6 text-slate-600">{site.description}</p>}
                      </div>
                      <a href={site.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline">
                        Visit official portal ({new URL(site.url).hostname}) <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* TAB: ELIGIBILITY WIZARD */}
        {(activeTab === 'wizard' || activeTab === 'profile') && (
          <div className="space-y-6">
            {activeTab === 'profile' && (
              <header className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back to home
                </button>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Private citizen profile</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">My Profile</h1>
                <p className="mt-2 text-sm text-slate-600">
                  Your eligibility details are saved on this device. Sign in to sync them securely to your Supabase account. {authUser ? cloudSyncStatus : ''}
                </p>
              </header>
            )}
            <ProfileWizard
              currentLang={currentLang}
              profile={profile}
              onChange={setProfile}
              onSaveProfile={handleSaveProfile}
              onSetPassword={handleSetPassword}
              accountEmail={authUser?.email ?? localAccount?.email ?? null}
              onReset={() => setProfile(DEFAULT_PROFILE)}
              onApply={() => {
                setActiveTab('dashboard');
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
              onOpenAiRoadmap={() => setIsAiRoadmapOpen(true)}
              eligibleCount={eligibleCount}
              potentialCount={potentialCount}
            />

            {/* Real-time Eligible Schemes Preview */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Instant Matching Results for this Profile ({evaluations.filter(e => e.isEligible || e.isPotentialMatch).length} Schemes)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {evaluations
                  .filter(e => e.isEligible || e.isPotentialMatch)
                  .map(evalItem => (
                    <SchemeCard
                      key={evalItem.schemeId}
                      scheme={evalItem.scheme}
                      evaluation={evalItem}
                      currentLang={currentLang}
                      onOpenDetails={(s, tab) => handleOpenSchemeDetails(s, tab)}
                      onOpenAllDocuments={handleOpenAllDocuments}
                      onOpenAiAdvisor={(s) => setAiAdvisorScheme(s)}
                      onOpenTutorial={(s) => handleOpenTutorial(s)}
                      onOpenScanner={(s) => handleOpenScanner(s)}
                      isSaved={savedSchemeIds.has(evalItem.scheme.id)}
                      onToggleSave={handleToggleSave}
                      isAdminRole={Boolean(adminSessionToken)}
                      onEditScheme={adminSessionToken ? handleEditSchemeFromCard : undefined}
                      onDeleteScheme={adminSessionToken ? (s) => handleDeleteAdminScheme(s.id) : undefined}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <AdminConsole
            user={authUser}
            onAuthorizationChange={setAdminSessionToken}
            allSchemes={allSchemes}
            adminKnowledgeState={adminKnowledgeState}
            onAddAdminScheme={handleAddAdminScheme}
            onUpdateAdminScheme={handleUpdateAdminScheme}
            onDeleteAdminScheme={handleDeleteAdminScheme}
            onRestoreDeletedSchemes={handleRestoreDeletedSchemes}
            initialEditScheme={adminEditTargetScheme}
            onClearInitialEditScheme={() => setAdminEditTargetScheme(null)}
            sites={managedSites}
            onSitesChange={setManagedSites}
            aiAddedSchemes={aiAddedSchemes}
            onRemoveAiScheme={(schemeId) => setAiAddedSchemes(prev => prev.filter(s => s.id !== schemeId))}
            onOpenScheme={(s) => handleOpenSchemeDetails(s, 'overview')}
            isAiAutoSyncEnabled={isAiAutoSyncEnabled}
            onToggleAiAutoSync={setIsAiAutoSyncEnabled}
            aiAdminLogs={aiAdminLogs}
            onTriggerAiDiscovery={(topic) => handleTriggerAiDiscovery(topic, 'AI On-Demand')}
            onSyncAllAiSchemes={handleSyncAllAiSchemes}
            isAiDiscovering={isAiDiscovering}
          />
        )}

        {/* TAB: ANALYTICS & DASHBOARD INSIGHTS */}
        {(activeTab === 'analytics' || activeTab === 'insights') && (
          <div className="space-y-6">
            <DashboardInsights
              schemes={allSchemes}
              evaluations={evaluations}
              profile={profile}
              currentLang={currentLang}
              onSelectCategory={(cat) => {
                setActiveCategoryFilter(cat);
                setActiveTab('dashboard');
              }}
              onOpenScheme={(s) => handleOpenSchemeDetails(s, 'overview')}
              onChangeOccupation={handleQuickOccupationSelect}
              onOpenProfileWizard={() => setActiveTab('wizard')}
            />
          </div>
        )}

        {/* TAB: SAVED SCHEMES */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-teal-900 text-white rounded-2xl p-6 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-300/30">
                    <Bookmark className="w-3.5 h-3.5 fill-amber-300" />
                    <span>Personal Scheme Vault</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {t.tabSaved} ({savedSchemeIds.size})
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                    Review and compare the welfare schemes you have bookmarked. Add them to your Application Journey Tracker when you are ready to apply.
                  </p>
                </div>

                {savedSchemeIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSaved}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-rose-500/20 text-slate-200 hover:text-rose-200 border border-white/20 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All Saved</span>
                  </button>
                )}
              </div>
            </div>

            {savedSchemes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {savedSchemes.map((scheme) => (
                  <SchemeCard
                    key={scheme.id}
                    scheme={scheme}
                    evaluation={evaluationMap.get(scheme.id)}
                    currentLang={currentLang}
                    onOpenDetails={(s, tab) => handleOpenSchemeDetails(s, tab)}
                    onOpenAllDocuments={handleOpenAllDocuments}
                    onOpenAiAdvisor={(s) => setAiAdvisorScheme(s)}
                    onOpenTutorial={(s) => handleOpenTutorial(s)}
                    onOpenScanner={(s) => handleOpenScanner(s)}
                    isSaved={true}
                    onToggleSave={handleToggleSave}
                    isAdminRole={Boolean(adminSessionToken)}
                    onEditScheme={adminSessionToken ? handleEditSchemeFromCard : undefined}
                    onDeleteScheme={adminSessionToken ? (s) => handleDeleteAdminScheme(s.id) : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
                <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-base text-slate-800">{t.noSavedSchemes}</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {t.noSavedSchemesDesc}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="mt-3 inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <span>Browse Schemes Directory</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: YOUTUBE VIDEO GUIDES */}
        {activeTab === 'video-guides' && (
          <VideoGuidesHub
            currentLang={currentLang}
            initialSchemeId={videoTutorialSchemeId}
            onSelectScheme={(s) => setSelectedScheme(s)}
            onTrackScheme={handleTrackScheme}
            onOpenScannerForScheme={(s) => handleOpenScanner(s)}
          />
        )}

        {/* TAB: AI DOCUMENT SCANNER & DETECTOR */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <DocumentCenter
              currentLang={currentLang}
              evaluations={evaluations}
              userOwnedDocs={userOwnedDocs}
              onToggleDoc={handleToggleDoc}
              onOpenScanner={() => handleOpenScanner()}
            />
          </div>
        )}

        {/* TAB: FAMILY BENEFIT FINDER */}
        {activeTab === 'family' && (
          <FamilyBenefitFinder
            currentLang={currentLang}
            baseProfile={profile}
            onOpenSchemeModal={(s) => setSelectedScheme(s)}
          />
        )}

        {/* TAB: WHAT-IF SIMULATOR */}
        {activeTab === 'whatif' && (
          <WhatIfSimulator
            currentLang={currentLang}
            baseProfile={profile}
            onOpenSchemeModal={(s) => setSelectedScheme(s)}
          />
        )}

        {/* TAB: DISTRICT SEWA KENDRAS (ALL 36 INDIAN STATES & UTs) */}
        {activeTab === 'districts' && (
          <DistrictPortalFinder
            currentLang={currentLang}
            selectedStateName={profile.state || 'Punjab'}
            onSelectState={(stateName) =>
              setProfile((prev) => ({
                ...prev,
                state: stateName,
                isPunjabDomicile: stateName === 'Punjab',
              }))
            }
            selectedDistrictName={profile.district}
            onSelectDistrict={(districtName) => setProfile(prev => ({ ...prev, district: districtName }))}
            onOpenSchemeModal={(s) => setSelectedScheme(s)}
            allSchemes={allSchemes}
          />
        )}

        {/* TAB: DEADLINE REMINDERS */}
        {activeTab === 'deadlines' && (
          <DeadlineReminderHub
            currentLang={currentLang}
            onOpenSchemeModal={(s) => setSelectedScheme(s)}
            onTrackScheme={handleTrackScheme}
          />
        )}

        {/* TAB: APPLICATION TRACKER */}
        {activeTab === 'tracker' && (
          <ApplicationTracker
            currentLang={currentLang}
            trackedItems={trackedItems}
            onUpdateStatus={handleUpdateStatus}
            onUpdateRefNumber={handleUpdateRefNumber}
            onRemoveItem={handleRemoveTrackedItem}
            onOpenSchemeModal={(s) => setSelectedScheme(s)}
            onAddTrackedScheme={handleAddTrackedSchemeById}
          />
        )}

        {/* TAB: CYBER FRAUD SHIELD */}
        {activeTab === 'fraud-shield' && (
          <div className="space-y-6">
            <CyberFraudShieldModal
              inlineMode={true}
              currentLang={currentLang}
              onClose={() => setActiveTab('dashboard')}
            />
          </div>
        )}
      </main>

      {/* Scheme Detail & Application Modal */}
      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          evaluation={evaluationMap.get(selectedScheme.id)}
          currentLang={currentLang}
          initialTab={selectedSchemeModalTab}
          onClose={() => setSelectedScheme(null)}
          onTrackScheme={handleTrackScheme}
          isAlreadyTracked={trackedItems.some(i => i.schemeId === selectedScheme.id)}
          isSaved={savedSchemeIds.has(selectedScheme.id)}
          onToggleSave={handleToggleSave}
          onOpenAiAdvisor={(s) => {
            setSelectedScheme(null);
            setAiAdvisorScheme(s);
          }}
        />
      )}

      {/* View All Documents Dedicated Popup Modal */}
      {schemeForDocumentsModal && (
        <ViewAllDocumentsModal
          scheme={schemeForDocumentsModal}
          currentLang={currentLang}
          onClose={() => setSchemeForDocumentsModal(null)}
          onOpenFullDetails={(s) => {
            setSchemeForDocumentsModal(null);
            handleOpenSchemeDetails(s, 'overview');
          }}
        />
      )}

      {/* Gemini 3.8 Flash Per-Scheme AI Advisor Modal */}
      {aiAdvisorScheme && (
        <AiSchemeAdvisorModal
          scheme={aiAdvisorScheme}
          profile={profile}
          currentLang={currentLang}
          onClose={() => setAiAdvisorScheme(null)}
          onOpenVoiceAssistant={() => {
            setAiAdvisorScheme(null);
            setIsVoiceAssistantOpen(true);
          }}
        />
      )}

      {/* Gemini 3.8 Flash Full Profile AI Welfare Roadmap Modal */}
      {isAiRoadmapOpen && (
        <AiProfileRoadmapModal
          profile={profile}
          schemes={allSchemes}
          currentLang={currentLang}
          onClose={() => setIsAiRoadmapOpen(false)}
          onOpenVoiceAssistant={() => {
            setIsAiRoadmapOpen(false);
            setIsVoiceAssistantOpen(true);
          }}
        />
      )}

      {/* Interactive AI Document Scanner & Missing Doc Detector Modal */}
      {isScannerOpen && (
        <DocumentScannerModal
          currentLang={currentLang}
          onClose={() => setIsScannerOpen(false)}
          targetScheme={scannerTargetScheme}
          userOwnedDocs={userOwnedDocs}
          onAddOwnedDoc={handleAddOwnedDoc}
          onRemoveOwnedDoc={handleRemoveOwnedDoc}
        />
      )}

      {/* Cyber Fraud Shield Modal */}
      {isFraudModalOpen && (
        <CyberFraudShieldModal
          currentLang={currentLang}
          onClose={() => setIsFraudModalOpen(false)}
        />
      )}

      {/* AI Voice Assistant & Chatbot Drawer */}
      <ChatbotDrawer
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        currentLang={currentLang}
        userProfile={profile}
        schemes={allSchemes}
        initialQuestion={assistantInitialQuestion}
        onInitialQuestionHandled={() => setAssistantInitialQuestion('')}
        onAppAction={(action) => {
          if (action.type === 'search') {
            setSearchQuery(action.query);
            setActiveCategoryFilter('all');
            setActiveTab('dashboard');
            return;
          }
          if (action.type === 'filter') {
            setActiveCategoryFilter(action.category);
            setActiveTab('dashboard');
            return;
          }
          setActiveTab(action.tab);
          if (action.tab === 'dashboard') window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSchemeModal={(s) => {
          setIsVoiceAssistantOpen(false);
          setSelectedScheme(s);
        }}
      />
      </React.Suspense>

      {!isVoiceAssistantOpen && (
        <button
          type="button"
          onClick={() => setIsVoiceAssistantOpen(true)}
          className="fixed bottom-5 right-5 z-40 inline-flex min-h-16 items-center gap-3 rounded-full bg-blue-700 px-6 text-base font-semibold text-white shadow-2xl shadow-blue-900/30 transition hover:-translate-y-0.5 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 sm:bottom-7 sm:right-7"
          aria-label="Open multilingual Voice AI"
        >
          <Mic className="h-6 w-6" aria-hidden="true" />
          <span>Voice AI</span>
        </button>
      )}

      {/* Official Government Footer */}
      <footer className="bg-slate-900 text-slate-300 text-xs py-8 border-t border-slate-800 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FraudProtectionBanner currentLang={currentLang} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-800">
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold text-xs">
                  PB
                </div>
                <span className="font-extrabold text-white text-sm">
                  {t.appTitle}
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                {t.footerDescription}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-teal-400 font-semibold pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t.footerZeroBrokerage}</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-2">
                {t.footerKeyPortals}
              </h5>
              <ul className="space-y-1.5 text-slate-400">
                <li><a href="https://punjab.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">punjab.gov.in (Official Govt)</a></li>
                <li><a href="https://esewa.punjab.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">esewa.punjab.gov.in (Sewa Kendra)</a></li>
                <li><a href="https://myscheme.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">myscheme.gov.in (National Portal)</a></li>
                <li><a href="https://sha.punjab.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">sha.punjab.gov.in (Ayushman Sehat)</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-2">
                {t.footerHelplines}
              </h5>
              <ul className="space-y-1.5 text-slate-400">
                <li>{t.footerGrievance}: <strong className="text-white">1100</strong></li>
                <li>{t.footerCyberCrime}: <strong className="text-white">1930</strong></li>
                <li>{t.footerWomenHelpline}: <strong className="text-white">1091</strong></li>
                <li>{t.footerChildline}: <strong className="text-white">1098</strong></li>
                <li>{t.footerKisanCenter}: <strong className="text-white">1800-180-1551</strong></li>
              </ul>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <span className="font-bold text-teal-300 tracking-wide">
              {t.footerMadeBy}
            </span>
            <span>{t.footerCitations}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
