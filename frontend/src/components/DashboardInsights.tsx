import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  Scheme,
  EligibilityEvaluation,
  Language,
  CitizenProfile,
} from '../types/scheme';
import {
  computeAnalyticsSummary,
  type CategoryAnalyticsRow,
} from '../utils/schemeAnalytics';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Layers,
  CheckCircle2,
  Building2,
  UserCheck,
  SlidersHorizontal,
  ArrowUpRight,
  RotateCcw,
} from 'lucide-react';

interface DashboardInsightsProps {
  schemes: Scheme[];
  evaluations: EligibilityEvaluation[];
  profile: CitizenProfile;
  currentLang: Language;
  onSelectCategory?: (category: string) => void;
  onOpenScheme?: (scheme: Scheme) => void;
  onChangeOccupation?: (occupation: CitizenProfile['occupation']) => void;
  onOpenProfileWizard?: () => void;
}

const OCCUPATION_OPTIONS: Array<{
  id: CitizenProfile['occupation'];
  labelEn: string;
  labelPa: string;
  labelHi: string;
}> = [
  { id: 'Student', labelEn: 'Student', labelPa: 'ਵਿਦਿਆਰਥੀ', labelHi: 'छात्र' },
  { id: 'Farmer', labelEn: 'Farmer', labelPa: 'ਕਿਸਾਨ', labelHi: 'किसान' },
  { id: 'Daily Wage Worker', labelEn: 'Daily Wage Worker', labelPa: 'ਦਿਹਾੜੀਦਾਰ ਮਜ਼ਦੂਰ', labelHi: 'दिहाड़ी मजदूर' },
  { id: 'Self-Employed', labelEn: 'Self-Employed', labelPa: 'ਸਵੈ-ਰੁਜ਼ਗਾਰ', labelHi: 'स्वरोजगार' },
  { id: 'Unemployed Youth', labelEn: 'Unemployed Youth', labelPa: 'ਬੇਰੁਜ਼ਗਾਰ ਨੌਜਵਾਨ', labelHi: 'बेरोजगार युवा' },
  { id: 'Senior Citizen', labelEn: 'Senior Citizen (60+)', labelPa: 'ਬਜ਼ੁਰਗ ਨਾਗਰਿਕ', labelHi: 'वरिष्ठ नागरिक' },
  { id: 'Homemaker', labelEn: 'Homemaker', labelPa: 'ਘਰੇਲੂ ਔਰਤ', labelHi: 'गृहिणी' },
];

export const DashboardInsights: React.FC<DashboardInsightsProps> = ({
  schemes,
  evaluations,
  profile,
  currentLang,
  onSelectCategory,
  onOpenScheme,
  onChangeOccupation,
  onOpenProfileWizard,
}) => {
  const [viewScope, setViewScope] = useState<'all' | 'eligible'>('all');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'Central Government' | 'Punjab State' | 'Other States'>('ALL');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('ALL');
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  const scopedSchemes = useMemo(() => {
    if (levelFilter === 'ALL') return schemes;
    if (levelFilter === 'Central Government') {
      return schemes.filter((s) => s.level === 'Central Government');
    }
    if (levelFilter === 'Punjab State') {
      return schemes.filter((s) => s.level === 'Punjab State' || s.state === 'Punjab');
    }
    return schemes.filter(
      (s) => s.level !== 'Central Government' && s.level !== 'Punjab State' && s.state !== 'Punjab'
    );
  }, [schemes, levelFilter]);

  const evaluationMap = useMemo(() => {
    const map = new Map<string, EligibilityEvaluation>();
    evaluations.forEach((e) => map.set(e.schemeId, e));
    return map;
  }, [evaluations]);

  const analytics = useMemo(
    () => computeAnalyticsSummary(scopedSchemes, evaluations),
    [scopedSchemes, evaluations]
  );

  const getLocalizedCategoryName = (item: CategoryAnalyticsRow) => {
    if (currentLang === 'pa') return item.labelPa;
    if (currentLang === 'hi') return item.labelHi;
    return item.labelEn;
  };

  // Chart 1 data: Stacked / Grouped Bar Chart of Eligibility Counts by Category
  const categoryBarData = useMemo(() => {
    return analytics.categoryDistribution.map((row) => ({
      key: row.key,
      category:
        currentLang === 'pa'
          ? row.labelPa.split(' ')[0]
          : currentLang === 'hi'
          ? row.labelHi.split(' ')[0]
          : row.key,
      fullLabel: getLocalizedCategoryName(row),
      Eligible: row.eligibleCount,
      Potential: row.potentialCount,
      Ineligible: row.ineligibleCount,
      Total: row.totalCount,
      color: row.color,
    }));
  }, [analytics.categoryDistribution, currentLang]);

  // Chart 2 data: Donut Chart of Scheme Distribution by Category
  const pieChartData = useMemo(() => {
    return analytics.categoryDistribution
      .map((row) => ({
        ...row,
        name: getLocalizedCategoryName(row),
        value: viewScope === 'eligible' ? row.eligibleCount : row.totalCount,
      }))
      .filter((d) => d.value > 0);
  }, [analytics.categoryDistribution, viewScope, currentLang]);

  const totalPieCount = useMemo(
    () => pieChartData.reduce((sum, item) => sum + item.value, 0),
    [pieChartData]
  );

  // Chart 3 data: Radar Chart of Eligibility Coverage % by Category
  const radarCoverageData = useMemo(() => {
    return analytics.categoryDistribution.map((row) => {
      const actionable = row.eligibleCount + row.potentialCount;
      const coveragePct = row.totalCount > 0 ? Math.round((actionable / row.totalCount) * 100) : 0;
      return {
        sector: row.key,
        eligibleCount: row.eligibleCount,
        totalCount: row.totalCount,
        coveragePct,
      };
    });
  }, [analytics.categoryDistribution]);

  const visibleCategoryRows = useMemo(() => {
    if (selectedCategoryKey === 'ALL') return analytics.categoryDistribution;
    return analytics.categoryDistribution.filter((r) => r.key === selectedCategoryKey);
  }, [analytics.categoryDistribution, selectedCategoryKey]);

  const handleResetAnalyticsFilters = () => {
    setViewScope('all');
    setLevelFilter('ALL');
    setSelectedCategoryKey('ALL');
  };

  return (
    <section
      data-testid="scheme-analytics-view"
      aria-label="Scheme Distribution and Profile Eligibility Analytics"
      className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8 space-y-8"
    >
      {/* Top Header & Active Profile Context */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400">
            <BarChart3 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {currentLang === 'pa'
                ? 'ਸਕੀਮ ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਯੋਗਤਾ ਡੈਸ਼ਬੋਰਡ (Analytics)'
                : currentLang === 'hi'
                ? 'योजना विश्लेषण एवं पात्रता डैशबोर्ड (Analytics)'
                : 'Scheme Distribution & Eligibility Analytics'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500 dark:text-slate-400 tabular-nums">
              {analytics.totalSchemes}{' '}
              {currentLang === 'pa' ? 'ਕੁੱਲ ਸਕੀਮਾਂ' : currentLang === 'hi' ? 'कुल योजनाएं' : 'Available Schemes'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            {currentLang === 'pa'
              ? 'ਸ਼੍ਰੇਣੀ ਅਨੁਸਾਰ ਸਕੀਮਾਂ ਦੀ ਵੰਡ ਅਤੇ ਤੁਹਾਡੀ ਪ੍ਰੋਫ਼ਾਈਲ ਯੋਗਤਾ ਅੰਕੜੇ'
              : currentLang === 'hi'
              ? 'श्रेणी-वार योजना वितरण और आपकी प्रोफ़ाइल पात्रता गणना'
              : 'Scheme Distribution by Category & Profile Eligibility Counts'}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {currentLang === 'pa'
              ? `ਤੁਹਾਡੀ ਮੌਜੂਦਾ ਪ੍ਰੋਫ਼ਾਈਲ (${profile.occupation}, ਉਮਰ ${profile.age} ਸਾਲ, ਆਮਦਨ ₹${profile.annualIncome.toLocaleString('en-IN')}, ਸ਼੍ਰੇਣੀ ${profile.category}, ${profile.district}${profile.state ? `, ${profile.state}` : ''}) ਦੇ ਆਧਾਰ 'ਤੇ ਉਪਲਬਧ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਅਤੇ ਯੋਗਤਾ ਦੀ ਰੀਅਲ-ਟਾਈਮ ਵੰਡ।`
              : currentLang === 'hi'
              ? `आपकी वर्तमान प्रोफ़ाइल (${profile.occupation}, आयु ${profile.age} वर्ष, आय ₹${profile.annualIncome.toLocaleString('en-IN')}, श्रेणी ${profile.category}, ${profile.district}${profile.state ? `, ${profile.state}` : ''}) के आधार पर उपलब्ध सरकारी योजनाओं और पात्रता का वास्तविक समय विश्लेषण।`
              : `Real-time visualization of available welfare schemes by category and eligibility counts tailored to your active profile (${profile.occupation} · Age ${profile.age} · ₹${profile.annualIncome.toLocaleString('en-IN')}/yr · ${profile.category} · ${profile.district}${profile.state ? `, ${profile.state}` : ''}).`}
          </p>
        </div>

        {/* Scope & Level Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start">
          <div
            role="group"
            aria-label="Analytics chart scope"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
          >
            <button
              type="button"
              data-testid="analytics-scope-all"
              onClick={() => setViewScope('all')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition cursor-pointer whitespace-nowrap ${
                viewScope === 'all'
                  ? 'bg-white text-slate-950 shadow-2xs font-bold dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span className="tabular-nums">
                {currentLang === 'pa'
                  ? `ਸਾਰੀਆਂ ਸਕੀਮਾਂ (${analytics.totalSchemes})`
                  : currentLang === 'hi'
                  ? `सभी योजनाएं (${analytics.totalSchemes})`
                  : `All Available (${analytics.totalSchemes})`}
              </span>
            </button>
            <button
              type="button"
              data-testid="analytics-scope-eligible"
              onClick={() => setViewScope('eligible')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition cursor-pointer whitespace-nowrap ${
                viewScope === 'eligible'
                  ? 'bg-white text-teal-800 shadow-2xs font-bold dark:bg-slate-900 dark:text-teal-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span className="tabular-nums">
                {currentLang === 'pa'
                  ? `ਸਿਰਫ਼ ਯੋਗ (${analytics.eligibleCount})`
                  : currentLang === 'hi'
                  ? `केवल पात्र (${analytics.eligibleCount})`
                  : `Eligible Only (${analytics.eligibleCount})`}
              </span>
            </button>
          </div>

          <label className="sr-only" htmlFor="analytics-level-select">
            Filter analytics by government level
          </label>
          <select
            id="analytics-level-select"
            data-testid="analytics-level-select"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as typeof levelFilter)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="ALL">All Levels (Central + All 36 States)</option>
            <option value="Central Government">Central Government Only</option>
            <option value="Punjab State">Punjab State Only</option>
            <option value="Other States">Other Indian States & UTs</option>
          </select>

          {(viewScope !== 'all' || levelFilter !== 'ALL' || selectedCategoryKey !== 'ALL') && (
            <button
              type="button"
              onClick={handleResetAnalyticsFilters}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Profile Bar for Live Eligibility Simulation */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
            <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
            <span className="font-bold text-slate-900 dark:text-white">
              {currentLang === 'pa'
                ? 'ਮੌਜੂਦਾ ਪ੍ਰੋਫ਼ਾਈਲ ਕਿੱਤਾ (Occupation):'
                : currentLang === 'hi'
                ? 'वर्तमान प्रोफ़ाइल व्यवसाय (Occupation):'
                : 'Current Profile Occupation:'}
            </span>
            <span>{profile.occupation}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">Age {profile.age}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">₹{profile.annualIncome.toLocaleString('en-IN')}/yr</span>
            <span aria-hidden="true">·</span>
            <span>{profile.category}</span>
            <span aria-hidden="true">·</span>
            <span>{profile.district}</span>
          </div>

          {onOpenProfileWizard && (
            <button
              type="button"
              onClick={onOpenProfileWizard}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300 cursor-pointer whitespace-nowrap"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {currentLang === 'pa'
                  ? 'ਪੂਰੀ ਪ੍ਰੋਫ਼ਾਈਲ ਸੋਧੋ'
                  : currentLang === 'hi'
                  ? 'प्रोफ़ाइल संपादित करें'
                  : 'Customize Full Profile'}
              </span>
            </button>
          )}
        </div>

        {onChangeOccupation && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5" role="group" aria-label="Switch profile occupation to compare analytics">
            {OCCUPATION_OPTIONS.map((occ) => {
              const isSelected = profile.occupation === occ.id;
              const label =
                currentLang === 'pa' ? occ.labelPa : currentLang === 'hi' ? occ.labelHi : occ.labelEn;
              return (
                <button
                  key={occ.id}
                  type="button"
                  data-testid={`analytics-occ-${occ.id.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onChangeOccupation(occ.id)}
                  aria-pressed={isSelected}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-blue-700 text-white shadow-2xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4-Column KPI Metrics Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          data-testid="analytics-kpi-eligible"
          className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>
              {currentLang === 'pa'
                ? 'ਪੂਰੀ ਤਰ੍ਹਾਂ ਯੋਗ (Confirmed Eligible)'
                : currentLang === 'hi'
                ? 'पूर्णतः पात्र (Confirmed Eligible)'
                : 'Confirmed Eligible Schemes'}
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white tabular-nums">
              {analytics.eligibleCount}
            </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              ({analytics.eligibilityRatePercent}% of {analytics.totalSchemes})
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            100% profile criteria matched
          </p>
        </div>

        <div
          data-testid="analytics-kpi-potential"
          className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>
              {currentLang === 'pa'
                ? 'ਸੰਭਾਵੀ ਮੈਚ (Potential Match)'
                : currentLang === 'hi'
                ? 'संभावित मिलान (Potential Match)'
                : 'Potential Match Schemes'}
            </span>
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white tabular-nums">
              {analytics.potentialCount}
            </span>
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
              ({analytics.actionableRatePercent}% actionable)
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Eligible with minor document / domicile check
          </p>
        </div>

        <div
          data-testid="analytics-kpi-top-category"
          className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>
              {currentLang === 'pa'
                ? 'ਸਭ ਤੋਂ ਵੱਧ ਯੋਗ ਸ਼੍ਰੇਣੀ'
                : currentLang === 'hi'
                ? 'शीर्ष पात्र श्रेणी'
                : 'Top Eligible Category'}
            </span>
            <PieIcon className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" aria-hidden="true" />
          </div>
          <div className="mt-2 truncate text-lg sm:text-xl font-bold text-slate-950 dark:text-white">
            {analytics.topEligibleCategory
              ? getLocalizedCategoryName(analytics.topEligibleCategory)
              : 'None'}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {analytics.topEligibleCategory
              ? `${analytics.topEligibleCategory.eligibleCount} eligible · ${analytics.topEligibleCategory.totalCount} total in sector`
              : '-'}
          </p>
        </div>

        <div
          data-testid="analytics-kpi-level-split"
          className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>
              {currentLang === 'pa'
                ? 'ਕੇਂਦਰ ਬਨਾਮ ਰਾਜ ਸਕੀਮਾਂ'
                : currentLang === 'hi'
                ? 'केंद्र बनाम राज्य योजनाएं'
                : 'Central vs State Schemes'}
            </span>
            <Building2 className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-baseline gap-2 tabular-nums">
            <span className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">
              {analytics.levelDistribution.find((l) => l.levelKey === 'Central Government')?.totalCount ?? 0}
            </span>
            <span className="text-sm font-medium text-slate-400">/</span>
            <span className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-400">
              {analytics.totalSchemes -
                (analytics.levelDistribution.find((l) => l.levelKey === 'Central Government')?.totalCount ?? 0)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Central Govt / State & UT Schemes
          </p>
        </div>
      </div>

      {/* Primary Charts Grid: Stacked Bar Chart (Eligibility by Category) + Category Distribution Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Chart 1: Stacked Bar Chart of Eligibility Counts by Category (7 cols) */}
        <div
          data-testid="chart-category-eligibility-bars"
          className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-800/40"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {currentLang === 'pa'
                  ? 'ਸ਼੍ਰੇਣੀ ਅਨੁਸਾਰ ਯੋਗਤਾ ਗਿਣਤੀ (Eligibility Counts by Category)'
                  : currentLang === 'hi'
                  ? 'श्रेणी के अनुसार पात्रता संख्या (Eligibility Counts by Category)'
                  : 'Eligibility Counts by Scheme Category'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Confirmed Eligible vs. Potential Match vs. Not Eligible across all 7 welfare categories
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
              {analytics.eligibleCount} Eligible · {analytics.potentialCount} Potential
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryBarData}
                margin={{ top: 10, right: 16, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.5} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={48}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const row = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white shadow-xl space-y-1.5">
                          <div className="font-bold text-sm text-white">{row.fullLabel}</div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 tabular-nums">
                            <span className="text-emerald-400 font-semibold">Confirmed Eligible:</span>
                            <span className="text-right font-bold">{row.Eligible}</span>
                            <span className="text-blue-400 font-semibold">Potential Match:</span>
                            <span className="text-right font-bold">{row.Potential}</span>
                            <span className="text-slate-400">Not Eligible:</span>
                            <span className="text-right font-bold">{row.Ineligible}</span>
                            <span className="border-t border-slate-800 pt-1 text-slate-200 font-semibold">
                              Total Available:
                            </span>
                            <span className="border-t border-slate-800 pt-1 text-right font-bold text-teal-300">
                              {row.Total}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={32}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', fontWeight: 600 }}
                />
                <Bar
                  dataKey="Eligible"
                  name={currentLang === 'pa' ? 'ਯੋਗ (Eligible)' : currentLang === 'hi' ? 'पात्र (Eligible)' : 'Confirmed Eligible'}
                  stackId="a"
                  fill="#16a34a"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="Potential"
                  name={currentLang === 'pa' ? 'ਸੰਭਾਵੀ (Potential)' : currentLang === 'hi' ? 'संभावित (Potential)' : 'Potential Match'}
                  stackId="a"
                  fill="#2563eb"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="Ineligible"
                  name={currentLang === 'pa' ? 'ਅਯੋਗ (Not Eligible)' : currentLang === 'hi' ? 'अपात्र (Not Eligible)' : 'Not Eligible'}
                  stackId="a"
                  fill="#cbd5e1"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Donut Chart of Scheme Distribution by Category (5 cols) */}
        <div
          data-testid="chart-category-distribution-pie"
          className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-800/40"
        >
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {currentLang === 'pa'
                  ? 'ਸ਼੍ਰੇਣੀ ਅਨੁਪਾਤ ਚਾਰਟ (Category Share)'
                  : currentLang === 'hi'
                  ? 'श्रेणी अनुपात चार्ट (Category Share)'
                  : 'Distribution by Category (Donut)'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {viewScope === 'eligible'
                  ? 'Share of confirmed eligible schemes per sector'
                  : 'Share of all available schemes per sector'}
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
              {totalPieCount} {viewScope === 'eligible' ? 'Eligible' : 'Total'}
            </span>
          </div>

          {totalPieCount > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="46%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2.5}
                    dataKey="value"
                    onMouseEnter={(_, idx) => setActivePieIndex(idx)}
                    onMouseLeave={() => setActivePieIndex(null)}
                    onClick={(_, index) => {
                      const clickedItem = pieChartData[index];
                      if (clickedItem) {
                        setSelectedCategoryKey((prev) =>
                          prev === clickedItem.key ? 'ALL' : clickedItem.key
                        );
                      }
                    }}
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`pie-cell-${entry.key}`}
                        fill={entry.color}
                        opacity={activePieIndex === null || activePieIndex === index ? 1 : 0.65}
                        className="cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as CategoryAnalyticsRow & { value: number };
                        const pct = totalPieCount > 0 ? Math.round((item.value / totalPieCount) * 100) : 0;
                        return (
                          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white shadow-xl space-y-1">
                            <div className="font-bold flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              <span>{getLocalizedCategoryName(item)}</span>
                            </div>
                            <div className="text-slate-300 tabular-nums">
                              <span className="font-bold text-teal-400 text-sm">{item.value}</span>{' '}
                              {viewScope === 'eligible' ? 'eligible schemes' : 'available schemes'} ({pct}%)
                            </div>
                            <div className="text-[11px] text-slate-400 tabular-nums">
                              {item.eligibleCount} Eligible · {item.potentialCount} Potential · {item.ineligibleCount} Ineligible
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-center p-6 space-y-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No schemes match the active filter combination.
              </p>
              <button
                type="button"
                onClick={handleResetAnalyticsFilters}
                className="text-xs font-bold text-blue-700 dark:text-blue-400 underline cursor-pointer"
              >
                Show all {analytics.totalSchemes} schemes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Charts Grid: Profile Eligibility Breakdown + Government Level Comparison + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Chart 3: Profile Eligibility Status Breakdown (4 cols) */}
        <div
          data-testid="chart-profile-eligibility-status"
          className="lg:col-span-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-800/40 flex flex-col justify-between"
        >
          <div className="mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {currentLang === 'pa'
                ? 'ਪ੍ਰੋਫ਼ਾਈਲ ਯੋਗਤਾ ਸਥਿਤੀ (Profile Eligibility Status)'
                : currentLang === 'hi'
                ? 'प्रोफ़ाइल पात्रता स्थिति (Profile Eligibility Status)'
                : 'Profile Eligibility Status Summary'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Overall eligibility breakdown for {profile.occupation} ({profile.district})
            </p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.eligibilityStatusDistribution}
                layout="vertical"
                margin={{ top: 5, right: 24, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#cbd5e1" opacity={0.5} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis
                  dataKey="labelEn"
                  type="category"
                  width={115}
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#334155' }}
                />
                <Tooltip
                  formatter={(val: unknown) => [`${val} Schemes`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {analytics.eligibilityStatusDistribution.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/80 dark:border-slate-700 text-center tabular-nums">
            {analytics.eligibilityStatusDistribution.map((slice) => (
              <div key={slice.id} className="rounded-xl bg-white dark:bg-slate-900 p-2 border border-slate-200/70 dark:border-slate-800">
                <div className="text-lg font-bold text-slate-950 dark:text-white">{slice.count}</div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {slice.labelEn.replace('Confirmed ', '')} ({slice.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Government Level Split (4 cols) */}
        <div
          data-testid="chart-government-level-split"
          className="lg:col-span-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-800/40 flex flex-col justify-between"
        >
          <div className="mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {currentLang === 'pa'
                ? 'ਸਰਕਾਰੀ ਪੱਧਰ ਵੰਡ (Central vs State)'
                : currentLang === 'hi'
                ? 'सरकारी स्तर वितरण (Central vs State)'
                : 'Schemes by Government Level'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Eligible vs. Total schemes across Central & State Governments
            </p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.levelDistribution}
                margin={{ top: 5, right: 12, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.5} />
                <XAxis dataKey="labelEn" tick={{ fontSize: 11, fontWeight: 600, fill: '#334155' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                  }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="eligibleCount" name="Confirmed Eligible" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="totalCount" name="Total Available" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-200/80 dark:border-slate-700 tabular-nums">
            <span>Central + 36 States/UTs Coverage</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {analytics.totalSchemes} Verified Schemes
            </span>
          </div>
        </div>

        {/* Chart 5: Sector Actionable Coverage Radar Chart (4 cols) */}
        <div
          data-testid="chart-sector-radar"
          className="lg:col-span-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-800/40 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                <span>
                  {currentLang === 'pa'
                    ? 'ਖੇਤਰ-ਵਾਰ ਕਵਰੇਜ ਰੇਡਾਰ'
                    : currentLang === 'hi'
                    ? 'क्षेत्र-वार कवरेज रडार'
                    : 'Sector Match Rate Radar (%)'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Percentage of schemes in each sector matching your profile
              </p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarCoverageData}>
                <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="sector" tick={{ fill: '#334155', fontSize: 10, fontWeight: 600 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                <Radar
                  name="Match Coverage %"
                  dataKey="coveragePct"
                  stroke="#0f766e"
                  fill="#14b8a6"
                  fillOpacity={0.5}
                />
                <Tooltip
                  formatter={(val: unknown) => [`${val}% Match Rate`, 'Coverage']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* High-Density Category & Eligibility Quantitative Table */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {currentLang === 'pa'
                ? 'ਸ਼੍ਰੇਣੀ-ਵਾਰ ਯੋਗਤਾ ਅਤੇ ਸਕੀਮਾਂ ਦੀ ਸਾਰਣੀ'
                : currentLang === 'hi'
                ? 'श्रेणी-वार पात्रता और योजनाओं की तालिका'
                : 'Category-Wise Scheme Distribution & Eligibility Matrix'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any category row to filter the scheme cards below or jump directly to matching schemes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter category breakdown">
            <button
              type="button"
              onClick={() => setSelectedCategoryKey('ALL')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                selectedCategoryKey === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-blue-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              All ({analytics.categoryDistribution.length})
            </button>
            {analytics.categoryDistribution.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategoryKey((prev) => (prev === cat.key ? 'ALL' : cat.key))}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  selectedCategoryKey === cat.key
                    ? 'bg-slate-900 text-white dark:bg-blue-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {cat.key} ({cat.totalCount})
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table
            data-testid="analytics-category-table"
            className="w-full text-left border-collapse text-xs sm:text-sm"
          >
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-400">
                <th className="py-3 pl-4 pr-3">Welfare Category</th>
                <th className="px-3 py-3 text-right">Available Schemes</th>
                <th className="px-3 py-3 text-right">Confirmed Eligible</th>
                <th className="px-3 py-3 text-right">Potential Match</th>
                <th className="px-3 py-3 text-right">Not Eligible</th>
                <th className="px-3 py-3 text-right">Share of Total</th>
                <th className="py-3 pl-3 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 bg-white dark:bg-slate-900 tabular-nums">
              {visibleCategoryRows.map((row) => (
                <tr
                  key={row.key}
                  className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 pl-4 pr-3 font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-sm shrink-0"
                        style={{ backgroundColor: row.color }}
                      />
                      <div>
                        <div>{getLocalizedCategoryName(row)}</div>
                        <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 line-clamp-1">
                          {row.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-slate-900 dark:text-white">
                    {row.totalCount}
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                    {row.eligibleCount}
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-blue-700 dark:text-blue-400">
                    {row.potentialCount}
                  </td>
                  <td className="px-3 py-3 text-right text-slate-500 dark:text-slate-400">
                    {row.ineligibleCount}
                  </td>
                  <td className="px-3 py-3 text-right font-medium text-slate-700 dark:text-slate-300">
                    {row.shareOfTotalPercent}%
                  </td>
                  <td className="py-3 pl-3 pr-4 text-right">
                    {onSelectCategory && (
                      <button
                        type="button"
                        onClick={() => onSelectCategory(row.key)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer whitespace-nowrap"
                      >
                        <span>Explore</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Scheme Drilldown Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            {currentLang === 'pa'
              ? 'ਸ਼੍ਰੇਣੀ ਅਨੁਸਾਰ ਯੋਜਨਾਵਾਂ ਦੀ ਸੂਚੀ'
              : currentLang === 'hi'
              ? 'श्रेणी अनुसार योजनाओं की सूची'
              : 'Schemes by Category & Eligibility Drilldown'}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Showing {visibleCategoryRows.length} {visibleCategoryRows.length === 1 ? 'category' : 'categories'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleCategoryRows.map((item) => {
            const displaySchemes = viewScope === 'eligible' ? item.eligibleSchemes : item.schemes;

            return (
              <div
                key={item.key}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {getLocalizedCategoryName(item)}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums shrink-0">
                      {item.eligibleCount} Eligible / {item.totalCount} Total
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {viewScope === 'eligible' ? 'Confirmed Eligible Schemes:' : 'Top Schemes in Category:'}
                  </div>
                  {displaySchemes.length > 0 ? (
                    <div className="space-y-1">
                      {displaySchemes.slice(0, 4).map((sch) => {
                        const evalMatch = evaluationMap.get(sch.id);
                        return (
                          <button
                            key={sch.id}
                            type="button"
                            onClick={() => onOpenScheme && onOpenScheme(sch)}
                            className="w-full flex items-center justify-between text-left text-xs p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                          >
                            <span className="truncate pr-2 font-medium">{sch.titleEn}</span>
                            {evalMatch && (
                              <span
                                className={`text-[11px] font-bold tabular-nums shrink-0 ${
                                  evalMatch.isEligible
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : evalMatch.isPotentialMatch
                                    ? 'text-blue-700 dark:text-blue-400'
                                    : 'text-slate-400'
                                }`}
                              >
                                {evalMatch.matchPercentage}%
                              </span>
                            )}
                          </button>
                        );
                      })}
                      {displaySchemes.length > 4 && (
                        <div className="text-[11px] text-slate-400 text-right pt-0.5 tabular-nums">
                          +{displaySchemes.length - 4} more schemes
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-2">
                      No confirmed eligible schemes in this category for current profile.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
