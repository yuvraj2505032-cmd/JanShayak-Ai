import React, { useEffect, useState } from 'react';
import { CitizenProfile, EligibilityEvaluation, Language, Scheme } from '../types/scheme';
import { getSchemeYoutubeBundle } from '../data/schemeVideos';
import { TRANSLATIONS } from '../data/translations';
import { printSchemeDocument } from '../utils/printHelper';
import {
  BenefitEstimatorInputs,
  calculateSchemeBenefit,
  getDefaultEstimatorInputs,
} from '../utils/benefitEstimator';
import { SchemeVideoTutorials } from './SchemeVideoTutorials';
import {
  X,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  Volume2,
  Square,
  Printer,
  Share2,
  ShieldAlert,
  Play,
  ListChecks,
  Building,
  Calendar,
  Award,
  Check,
  Sparkles,
  BookOpen,
  Youtube,
  Clock,
  HelpCircle,
  Calculator,
  Users,
  Sprout,
  GraduationCap,
  Zap,
  Briefcase,
  IndianRupee,
  RotateCcw,
} from 'lucide-react';

interface SchemeDetailModalProps {
  scheme?: Scheme;
  evaluation?: EligibilityEvaluation | null;
  language?: Language;
  currentLang?: Language;
  initialTab?: 'overview' | 'estimator' | 'eligibility' | 'documents' | 'steps' | 'tutorial';
  onClose: () => void;
  onStartTracking?: (scheme: Scheme) => void;
  onTrackScheme?: (scheme: Scheme) => void;
  isTracked?: boolean;
  isAlreadyTracked?: boolean;
  isSaved?: boolean;
  onToggleSave?: (scheme: Scheme) => void;
  onAskChatbot?: (question: string) => void;
  onOpenAiAdvisor?: (scheme: Scheme) => void;
  profile?: CitizenProfile;
}

export const SchemeDetailModal: React.FC<SchemeDetailModalProps> = ({
  scheme: schemeProp,
  evaluation,
  language: languageProp,
  currentLang,
  initialTab = 'overview',
  onClose,
  onStartTracking,
  onTrackScheme,
  isTracked: isTrackedProp,
  isAlreadyTracked,
  onAskChatbot,
  onOpenAiAdvisor,
  profile,
}) => {
  const language: Language = currentLang || languageProp || 'en';
  const isTracked = Boolean(isAlreadyTracked ?? isTrackedProp);
  const handleStartTracking = (s: Scheme) => {
    onTrackScheme?.(s);
    onStartTracking?.(s);
  };
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<
    'overview' | 'estimator' | 'eligibility' | 'documents' | 'steps' | 'tutorial'
  >(initialTab);
  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [videoStartSeconds, setVideoStartSeconds] = useState(0);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  const resolvedScheme = evaluation?.scheme || schemeProp;

  const [estimatorInputs, setEstimatorInputs] = useState<BenefitEstimatorInputs>(() =>
    resolvedScheme
      ? getDefaultEstimatorInputs(resolvedScheme, profile)
      : {
          familySize: 4,
          eligibleMembersInFamily: 1,
          cropAcreage: 4,
          durationYears: 1,
          annualTuitionFee: 45000,
          monthlyElectricityUnits: 280,
          workDaysPerYear: 100,
          loanOrProjectAmount: 200000,
        }
  );

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (resolvedScheme) {
      setEstimatorInputs(getDefaultEstimatorInputs(resolvedScheme, profile));
      setSelectedVideoIndex(0);
      setVideoStartSeconds(0);
    }
  }, [resolvedScheme?.id]);

  if (!resolvedScheme) return null;

  const scheme = resolvedScheme;
  const isEligible = evaluation?.isEligible ?? true;
  const isPotentialMatch = evaluation?.isPotentialMatch ?? false;
  const matchPercentage = evaluation?.matchPercentage ?? 100;
  const criteria = evaluation?.criteria ?? [];
  const ytBundle = getSchemeYoutubeBundle(scheme);
  const activeVideoId = ytBundle.videoIds[selectedVideoIndex] || ytBundle.primaryVideoId;
  const estimateResult = calculateSchemeBenefit(scheme, estimatorInputs);

  const title =
    language === 'pa' ? scheme.titlePa : language === 'hi' ? scheme.titleHi : scheme.titleEn;
  const dept =
    language === 'pa'
      ? scheme.departmentPa
      : language === 'hi'
        ? scheme.departmentHi
        : scheme.departmentEn;
  const desc =
    language === 'pa'
      ? scheme.descriptionPa
      : language === 'hi'
        ? scheme.descriptionHi
        : scheme.descriptionEn;

  const toggleDocCheck = (idx: number) => {
    setCheckedDocs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleListen = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const speechText = `${title}. ${dept}. ${desc}. Benefit: ${scheme.benefitAmountText}. Estimated Annual Benefit: ₹${estimateResult.annualBenefit.toLocaleString('en-IN')}.`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = language === 'pa' ? 'pa-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handlePrint = () => {
    printSchemeDocument(scheme, language);
  };

  const handleShare = () => {
    const shareText = `Check out *${title}* on Janshayak AI!\n💰 Benefit: ${scheme.benefitAmountText}\n🧮 My Estimated Annual Benefit: ₹${estimateResult.annualBenefit.toLocaleString('en-IN')}\n🌐 Official Portal: ${scheme.officialPortalUrl}\n▶️ Video Guide: ${ytBundle.watchOnYoutubeUrl}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const checkedCount = Object.values(checkedDocs).filter(Boolean).length;

  const renderBenefitEstimatorPanel = (compact = false) => {
    const showField = (field: keyof BenefitEstimatorInputs) =>
      !compact || estimateResult.relevantFields.includes(field) || field === 'familySize' || field === 'cropAcreage';

    return (
      <div
        data-testid="benefit-estimator-panel"
        className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/60 p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-teal-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-base font-extrabold text-slate-900">
                  {language === 'pa'
                    ? 'ਲਾਭ ਕੈਲਕੁਲੇਟਰ (Benefit Estimator)'
                    : language === 'hi'
                      ? 'लाभ कैलकुलेटर (Benefit Estimator)'
                      : 'Interactive Benefit Estimator'}
                </h4>
                <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[11px] font-bold text-teal-800">
                  Live ₹ Calculator
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-600">
                {language === 'pa'
                  ? 'ਆਪਣੇ ਪਰਿਵਾਰ ਦੇ ਜੀਅ, ਫ਼ਸਲ ਦਾ ਰਕਬਾ (ਏਕੜ) ਅਤੇ ਹੋਰ ਵੇਰਵੇ ਭਰ ਕੇ ਕੁੱਲ ਵਿੱਤੀ ਲਾਭ ਦਾ ਹਿਸਾਬ ਲਗਾਓ।'
                  : language === 'hi'
                    ? 'परिवार के आकार, फसल एकड़ और अन्य विवरण दर्ज करके अपनी अनुमानित वित्तीय सहायता की गणना करें।'
                    : 'Enter your family size, specific crop acreage, or course/project variables to calculate your estimated financial benefit.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEstimatorInputs(getDefaultEstimatorInputs(scheme, profile))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Summary Output Cards */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-200 bg-white p-3.5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {language === 'pa'
                ? 'ਸਾਲਾਨਾ ਅੰਦਾਜ਼ਨ ਲਾਭ (1 ਸਾਲ)'
                : language === 'hi'
                  ? 'वार्षिक अनुमानित लाभ (1 वर्ष)'
                  : 'Estimated Annual Benefit'}
            </p>
            <p
              data-testid="estimator-annual-amount"
              className="mt-1 text-2xl font-black text-emerald-700"
            >
              ₹{estimateResult.annualBenefit.toLocaleString('en-IN')}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">
              ≈ ₹{estimateResult.monthlyEquivalent.toLocaleString('en-IN')} / month value
            </p>
          </div>

          <div className="rounded-xl border border-teal-200 bg-teal-950 p-3.5 text-white shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
              {language === 'pa'
                ? `ਕੁੱਲ ਲਾਭ (${estimatorInputs.durationYears} ਸਾਲ)`
                : language === 'hi'
                  ? `कुल अनुमानित लाभ (${estimatorInputs.durationYears} वर्ष)`
                  : `Total Projected (${estimatorInputs.durationYears} Yr${estimatorInputs.durationYears > 1 ? 's' : ''})`}
            </p>
            <p
              data-testid="estimator-total-amount"
              className="mt-1 text-2xl font-black text-amber-300"
            >
              ₹{estimateResult.totalProjectedBenefit.toLocaleString('en-IN')}
            </p>
            <p className="mt-0.5 text-[11px] text-teal-200">
              Direct DBT + Subsidy Value
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {language === 'pa'
                ? 'ਚੁਣੇ ਗਏ ਵੇਰਵੇ'
                : language === 'hi'
                  ? 'चयनित इनपुट'
                  : 'Active Variables'}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">
              {estimatorInputs.familySize} Family Members · {estimatorInputs.cropAcreage} Acres
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {estimatorInputs.eligibleMembersInFamily} Eligible Beneficiary · {estimatorInputs.durationYears} Yr Horizon
            </p>
          </div>
        </div>

        {/* Interactive Variable Inputs */}
        <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. Family Size (Always visible) */}
          <label className="block rounded-xl border border-slate-200 bg-white p-3">
            <span className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-teal-600" />
                {language === 'pa'
                  ? 'ਪਰਿਵਾਰ ਦੇ ਕੁੱਲ ਜੀਅ (Family Size)'
                  : language === 'hi'
                    ? 'परिवार के सदस्य (Family Size)'
                    : 'Family Size (Members)'}
              </span>
              <span className="rounded bg-teal-50 px-1.5 py-0.5 text-xs font-extrabold text-teal-800">
                {estimatorInputs.familySize}
              </span>
            </span>
            <input
              data-testid="input-family-size"
              type="number"
              min={1}
              max={12}
              step={1}
              value={estimatorInputs.familySize}
              onChange={(e) => {
                const nextFamily = Math.max(1, Math.min(12, Number(e.target.value) || 1));
                setEstimatorInputs((prev) => ({
                  ...prev,
                  familySize: nextFamily,
                  eligibleMembersInFamily: Math.min(prev.eligibleMembersInFamily, nextFamily),
                }));
              }}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-teal-600 focus:outline-none"
            />
          </label>

          {/* 2. Specific Crop Acreage (Always visible as requested) */}
          <label className="block rounded-xl border border-slate-200 bg-white p-3">
            <span className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <Sprout className="h-3.5 w-3.5 text-emerald-600" />
                {language === 'pa'
                  ? 'ਫ਼ਸਲ / ਜ਼ਮੀਨ ਦਾ ਰਕਬਾ (Crop Acreage)'
                  : language === 'hi'
                    ? 'फसल / भूमि एकड़ (Crop Acreage)'
                    : 'Specific Crop Acreage (Acres)'}
              </span>
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-extrabold text-emerald-800">
                {estimatorInputs.cropAcreage} Acres
              </span>
            </span>
            <input
              data-testid="input-crop-acreage"
              type="number"
              min={0.5}
              max={25}
              step={0.5}
              value={estimatorInputs.cropAcreage}
              onChange={(e) =>
                setEstimatorInputs((prev) => ({
                  ...prev,
                  cropAcreage: Math.max(0.5, Math.min(25, Number(e.target.value) || 0.5)),
                }))
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-teal-600 focus:outline-none"
            />
          </label>

          {/* 3. Projection / Course Duration Years */}
          <label className="block rounded-xl border border-slate-200 bg-white p-3">
            <span className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                {language === 'pa'
                  ? 'ਸਮਾਂ ਮਿਆਦ (Years)'
                  : language === 'hi'
                    ? 'अवधि (Years)'
                    : 'Benefit Duration (Years)'}
              </span>
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-extrabold text-blue-800">
                {estimatorInputs.durationYears} Yr{estimatorInputs.durationYears > 1 ? 's' : ''}
              </span>
            </span>
            <input
              data-testid="input-duration-years"
              type="number"
              min={1}
              max={5}
              step={1}
              value={estimatorInputs.durationYears}
              onChange={(e) =>
                setEstimatorInputs((prev) => ({
                  ...prev,
                  durationYears: Math.max(1, Math.min(5, Number(e.target.value) || 1)),
                }))
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-teal-600 focus:outline-none"
            />
          </label>

          {/* 4. Eligible Beneficiaries / Students in Family */}
          {showField('eligibleMembersInFamily') && (
            <label className="block rounded-xl border border-slate-200 bg-white p-3">
              <span className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
                  {language === 'pa'
                    ? 'ਯੋਗ ਲਾਭਪਾਤਰੀ / ਵਿਦਿਆਰਥੀ'
                    : language === 'hi'
                      ? 'पात्र लाभार्थी / छात्र'
                      : 'Eligible Beneficiaries / Students'}
                </span>
                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-extrabold text-indigo-800">
                  {estimatorInputs.eligibleMembersInFamily}
                </span>
              </span>
              <input
                data-testid="input-eligible-members"
                type="number"
                min={1}
                max={estimatorInputs.familySize}
                step={1}
                value={estimatorInputs.eligibleMembersInFamily}
                onChange={(e) =>
                  setEstimatorInputs((prev) => ({
                    ...prev,
                    eligibleMembersInFamily: Math.max(
                      1,
                      Math.min(prev.familySize, Number(e.target.value) || 1)
                    ),
                  }))
                }
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </label>
          )}

          {/* 5. Annual Tuition Fee (for Scholarship / Student schemes) */}
          {showField('annualTuitionFee') && (
            <label className="block rounded-xl border border-slate-200 bg-white p-3">
              <span className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-purple-600" />
                  {language === 'pa'
                    ? 'ਸਾਲਾਨਾ ਕਾਲਜ ਫੀਸ (₹)'
                    : language === 'hi'
                      ? 'वार्षिक ट्यूशन फीस (₹)'
                      : 'Annual Tuition Fee (₹)'}
                </span>
                <span className="text-xs font-extrabold text-purple-800">
                  ₹{estimatorInputs.annualTuitionFee.toLocaleString('en-IN')}
                </span>
              </span>
              <input
                data-testid="input-tuition-fee"
                type="number"
                min={0}
                max={500000}
                step={5000}
                value={estimatorInputs.annualTuitionFee}
                onChange={(e) =>
                  setEstimatorInputs((prev) => ({
                    ...prev,
                    annualTuitionFee: Math.max(0, Math.min(500000, Number(e.target.value) || 0)),
                  }))
                }
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </label>
          )}

          {/* 6. Monthly Electricity Units */}
          {showField('monthlyElectricityUnits') && (
            <label className="block rounded-xl border border-slate-200 bg-white p-3">
              <span className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-600" />
                  {language === 'pa'
                    ? 'ਮਹੀਨਾਵਾਰ ਬਿਜਲੀ ਖਪਤ (Units)'
                    : language === 'hi'
                      ? 'मासिक बिजली खपत (Units)'
                      : 'Monthly Electricity (Units)'}
                </span>
                <span className="text-xs font-extrabold text-amber-800">
                  {estimatorInputs.monthlyElectricityUnits} kWh
                </span>
              </span>
              <input
                data-testid="input-electricity-units"
                type="number"
                min={50}
                max={1000}
                step={10}
                value={estimatorInputs.monthlyElectricityUnits}
                onChange={(e) =>
                  setEstimatorInputs((prev) => ({
                    ...prev,
                    monthlyElectricityUnits: Math.max(
                      50,
                      Math.min(1000, Number(e.target.value) || 50)
                    ),
                  }))
                }
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </label>
          )}

          {/* 7. Work / Training Days */}
          {showField('workDaysPerYear') && (
            <label className="block rounded-xl border border-slate-200 bg-white p-3">
              <span className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-orange-600" />
                  {language === 'pa'
                    ? 'ਸਾਲਾਨਾ ਕੰਮ ਦੇ ਦਿਨ (Days)'
                    : language === 'hi'
                      ? 'वार्षिक कार्य दिवस (Days)'
                      : 'Work / Training Days / Yr'}
                </span>
                <span className="text-xs font-extrabold text-orange-800">
                  {estimatorInputs.workDaysPerYear} Days
                </span>
              </span>
              <input
                data-testid="input-work-days"
                type="number"
                min={5}
                max={100}
                step={5}
                value={estimatorInputs.workDaysPerYear}
                onChange={(e) =>
                  setEstimatorInputs((prev) => ({
                    ...prev,
                    workDaysPerYear: Math.max(5, Math.min(100, Number(e.target.value) || 5)),
                  }))
                }
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </label>
          )}

          {/* 8. Loan / Project / Machinery Cost */}
          {showField('loanOrProjectAmount') && (
            <label className="block rounded-xl border border-slate-200 bg-white p-3">
              <span className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="inline-flex items-center gap-1.5">
                  <IndianRupee className="h-3.5 w-3.5 text-teal-600" />
                  {language === 'pa'
                    ? 'ਪ੍ਰੋਜੈਕਟ / ਕਰਜ਼ਾ ਰਕਮ (₹)'
                    : language === 'hi'
                      ? 'प्रोजेक्ट / ऋण राशि (₹)'
                      : 'Project / Loan Amount (₹)'}
                </span>
                <span className="text-xs font-extrabold text-teal-800">
                  ₹{estimatorInputs.loanOrProjectAmount.toLocaleString('en-IN')}
                </span>
              </span>
              <input
                data-testid="input-project-amount"
                type="number"
                min={10000}
                max={2500000}
                step={10000}
                value={estimatorInputs.loanOrProjectAmount}
                onChange={(e) =>
                  setEstimatorInputs((prev) => ({
                    ...prev,
                    loanOrProjectAmount: Math.max(
                      10000,
                      Math.min(2500000, Number(e.target.value) || 10000)
                    ),
                  }))
                }
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </label>
          )}
        </div>

        {/* Formula & Component Breakdown */}
        <div className="mt-4 space-y-2 rounded-xl border border-slate-200/90 bg-white/90 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {language === 'pa'
                ? 'ਲਾਭ ਦਾ ਵਿਸਥਾਰਿਤ ਹਿਸਾਬ (Calculation Breakdown)'
                : language === 'hi'
                  ? 'लाभ गणना विवरण (Calculation Breakdown)'
                  : 'Itemized Benefit Calculation Breakdown'}
            </span>
            {compact && (
              <button
                type="button"
                onClick={() => setActiveTab('estimator')}
                className="text-xs font-bold text-teal-700 hover:underline"
              >
                Open Full Calculator →
              </button>
            )}
          </div>
          {estimateResult.breakdown.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs"
            >
              <div>
                <p className="font-bold text-slate-800">
                  {language === 'pa'
                    ? item.labelPa
                    : language === 'hi'
                      ? item.labelHi
                      : item.labelEn}
                </p>
                <p className="text-[11px] text-slate-500">{item.formulaText}</p>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-emerald-700">
                  ₹{item.annualAmount.toLocaleString('en-IN')} / yr
                </span>
                {estimatorInputs.durationYears > 1 && (
                  <p className="text-[10px] font-semibold text-slate-500">
                    Total: ₹{item.totalAmount.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 sm:p-6 relative shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/10 text-teal-300 border border-white/10">
                  {scheme.level === 'Punjab State'
                    ? (language === 'pa' ? 'ਪੰਜਾਬ ਸਰਕਾਰ' : language === 'hi' ? 'पंजाब सरकार' : 'Punjab State')
                    : (language === 'pa' ? 'ਕੇਂਦਰ ਸਰਕਾਰ' : language === 'hi' ? 'केंद्र सरकार' : 'Central Govt')}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/20">
                  {scheme.benefitType}
                </span>
                {isEligible ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {language === 'pa' ? 'ਯੋਗ' : language === 'hi' ? 'पात्र' : 'Eligible'} ({matchPercentage}%)
                  </span>
                ) : isPotentialMatch ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    {language === 'pa' ? 'ਸੰਭਾਵੀ ਮੇਲ' : language === 'hi' ? 'संभावित मिलान' : 'Potential Match'} ({matchPercentage}%)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-400/30">
                    <XCircle className="w-3.5 h-3.5" />
                    {language === 'pa' ? 'ਯੋਗ ਨਹੀਂ' : language === 'hi' ? 'अपात्र' : 'Not Eligible'}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold leading-snug text-white">
                {title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-teal-400 shrink-0" />
                {dept}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Utility Action Strip */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/10">
            <button
              onClick={handleListen}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {isSpeaking ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>
                {isSpeaking
                  ? (language === 'pa' ? 'ਆਵਾਜ਼ ਰੋਕੋ' : language === 'hi' ? 'आवाज़ रोकें' : 'Stop Audio')
                  : (language === 'pa' ? 'ਸੁਣੋ (Audio)' : language === 'hi' ? 'सुनें (Audio)' : 'Listen Audio')}
              </span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'pa' ? 'ਪ੍ਰਿੰਟ / PDF' : language === 'hi' ? 'प्रिंट / PDF' : 'Print / Save PDF'}</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              {copiedShare ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>
                {copiedShare
                  ? 'Copied!'
                  : (language === 'pa' ? 'ਸ਼ੇਅਰ ਕਰੋ' : language === 'hi' ? 'शेयर करें' : 'Share Summary')}
              </span>
            </button>

            <button
              onClick={() => {
                if (onOpenAiAdvisor) {
                  onOpenAiAdvisor(scheme);
                  return;
                }
                onClose();
                onAskChatbot?.(
                  `Tell me step-by-step how I can apply for ${scheme.titleEn} and what documents I should take to Sewa Kendra.`
                );
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 transition-all ml-auto cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Sahayak</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex shrink-0 border-b border-slate-200 bg-slate-50 px-4 sm:px-6 overflow-x-auto no-scrollbar">
          {[
            {
              id: 'overview',
              label: language === 'pa' ? 'ਜਾਣਕਾਰੀ ਅਤੇ ਲਾਭ' : language === 'hi' ? 'विवरण और लाभ' : 'Overview & Benefits',
              icon: Award,
            },
            {
              id: 'estimator',
              label: language === 'pa' ? 'ਲਾਭ ਕੈਲਕੁਲੇਟਰ' : language === 'hi' ? 'लाभ कैलकुलेटर' : 'Benefit Estimator',
              icon: Calculator,
            },
            {
              id: 'eligibility',
              label: `${language === 'pa' ? 'ਯੋਗਤਾ ਨਿਯਮ' : language === 'hi' ? 'पात्रता नियम' : 'Eligibility'} (${criteria.filter((c) => c.isMet).length}/${criteria.length})`,
              icon: CheckCircle2,
            },
            {
              id: 'documents',
              label: `${language === 'pa' ? 'ਦਸਤਾਵੇਜ਼' : language === 'hi' ? 'दस्तावेज़' : 'Documents'} (${scheme.requiredDocuments.length})`,
              icon: FileText,
            },
            {
              id: 'steps',
              label: language === 'pa' ? 'ਅਪਲਾਈ ਕਰਨ ਦੀ ਵਿਧੀ' : language === 'hi' ? 'आवेदन प्रक्रिया' : 'Application Steps',
              icon: ListChecks,
            },
            {
              id: 'tutorial',
              label: language === 'pa' ? 'YouTube ਵੀਡੀਓ' : language === 'hi' ? 'YouTube वीडियो' : 'Video Guide',
              icon: Youtube,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={`modal-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-teal-700 text-teal-800 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Highlight Benefit Box */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                    {language === 'pa' ? 'ਮੁੱਖ ਵਿੱਤੀ ਲਾਭ' : language === 'hi' ? 'मुख्य वित्तीय लाभ' : 'Key Financial Benefit'}
                  </span>
                  <p className="text-lg sm:text-xl font-extrabold text-slate-900">
                    {scheme.benefitAmountText}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-emerald-200 shadow-2xs shrink-0">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      {language === 'pa' ? 'ਆਖਰੀ ਮਿਤੀ' : language === 'hi' ? 'अंतिम तिथि' : 'Application Timeline'}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {scheme.applicationDeadline}
                    </span>
                  </div>
                </div>
              </div>

              {/* Embedded Interactive Benefit Estimator */}
              {renderBenefitEstimatorPanel(true)}

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Scheme Description
                </h4>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  {desc}
                </p>
              </div>

              {scheme.warningAlert && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Anti-Fraud Citizen Alert
                    </h5>
                    <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
                      {scheme.warningAlert}
                    </p>
                  </div>
                </div>
              )}

              <SchemeVideoTutorials
                schemeName={title}
                schemeId={scheme.id}
                youtubeVideoId={scheme.youtubeVideoId}
                youtubeVideoTitle={scheme.youtubeVideoTitle}
              />

              {/* Verification Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-400 font-semibold block mb-0.5">
                    Official Source Citation
                  </span>
                  <span className="font-bold text-slate-700">{scheme.sourceCitation}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-400 font-semibold block mb-0.5">
                    Official Portal & Last Verified
                  </span>
                  <a
                    href={scheme.officialPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-teal-700 hover:underline inline-flex items-center gap-1"
                  >
                    {scheme.officialPortalName} ({scheme.verifiedDate})
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'estimator' && <div className="space-y-5">{renderBenefitEstimatorPanel(false)}</div>}

          {activeTab === 'eligibility' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Rule-by-Rule Citizen Profile Evaluation
                  </h4>
                  <p className="text-xs text-slate-500">
                    Transparent verification against your entered profile parameters
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-teal-700">{matchPercentage}%</span>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">
                    Match Score
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {criteria.map((c) => {
                  const label =
                    language === 'pa' ? c.labelPa : language === 'hi' ? c.labelHi : c.labelEn;
                  return (
                    <div
                      key={c.id}
                      className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
                        c.isMet
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-rose-50/60 border-rose-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {c.isMet ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h5 className="text-sm font-bold text-slate-900">{label}</h5>
                          <p className="text-xs text-slate-600 mt-1">
                            <span className="font-semibold">Your Profile:</span>{' '}
                            {c.userValueDescription}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                          Required Rule
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            c.isMet ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {c.requiredDescription}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-teal-50/70 border border-teal-200 p-4 rounded-2xl">
                <div>
                  <h4 className="text-sm font-bold text-teal-950">
                    Interactive Document Readiness Checklist
                  </h4>
                  <p className="text-xs text-teal-700">
                    Tick off documents you already have ready at home before visiting Sewa Kendra
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-teal-700 text-white text-xs font-bold">
                  {checkedCount} / {scheme.requiredDocuments.length} Ready
                </span>
              </div>

              <div className="space-y-2.5">
                {scheme.requiredDocuments.map((doc, idx) => {
                  const docName =
                    language === 'pa'
                      ? doc.namePa
                      : language === 'hi'
                        ? doc.nameHi
                        : doc.nameEn;
                  const isChecked = !!checkedDocs[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleDocCheck(idx)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <h5
                            className={`text-sm font-bold ${
                              isChecked ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            {docName}
                          </h5>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Issued by:{' '}
                            <span className="font-semibold text-slate-700">
                              {doc.issuingAuthority}
                            </span>
                          </p>
                        </div>
                      </div>

                      {doc.availableOnDigiLocker && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                          DigiLocker Ready
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="relative pl-4 sm:pl-6 space-y-4 before:content-[''] before:absolute before:left-6 sm:before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-teal-200">
                {scheme.applicationSteps.map((step) => {
                  const sTitle =
                    language === 'pa'
                      ? step.titlePa
                      : language === 'hi'
                        ? step.titleHi
                        : step.titleEn;
                  const sDesc =
                    language === 'pa'
                      ? step.descriptionPa
                      : language === 'hi'
                        ? step.descriptionHi
                        : step.descriptionEn;
                  return (
                    <div
                      key={step.stepNumber}
                      className="relative flex items-start gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200"
                    >
                      <div className="w-8 h-8 rounded-xl bg-teal-700 text-white font-extrabold text-sm flex items-center justify-center shrink-0 z-10 shadow-sm">
                        {step.stepNumber}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900">{sTitle}</h5>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">{sDesc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'tutorial' && (
            <div className="space-y-5">
              {/* Video Header & Direct YouTube Links */}
              <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border border-rose-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Youtube className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                        Scheme-Specific Video Tutorial
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        Punjabi / Hindi / English
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1">
                      How to Apply for {title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Video: {ytBundle.videoTitle}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <a
                    href={`https://www.youtube.com/watch?v=${activeVideoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>Watch on YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={ytBundle.punjabiSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-all"
                  >
                    <span>Punjabi YouTube Guide</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Switch Between the 3 Distinct Scheme-Specific YouTube Videos */}
              <div className="flex flex-wrap items-center gap-2">
                {ytBundle.videoIds.map((vid, idx) => (
                  <button
                    key={vid}
                    type="button"
                    onClick={() => {
                      setSelectedVideoIndex(idx);
                      setVideoStartSeconds(0);
                    }}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all border ${
                      selectedVideoIndex === idx
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>
                      {idx === 0
                        ? 'Video 1: Online Apply Guide'
                        : idx === 1
                          ? 'Video 2: Documents & Eligibility'
                          : 'Video 3: Status & DBT Check'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Embedded Responsive YouTube Player */}
              <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950 shadow-xl border border-slate-800 aspect-video">
                <iframe
                  key={`${scheme.id}-${activeVideoId}-${videoStartSeconds}`}
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?start=${videoStartSeconds}&rel=0&modestbranding=1`}
                  title={ytBundle.videoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Interactive Video Chapters */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    Interactive Video Chapters (Click to Jump)
                  </h5>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {scheme.applicationSteps.length + 1} Key Milestones
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setVideoStartSeconds(0)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      videoStartSeconds === 0
                        ? 'bg-teal-50 border-teal-500 text-teal-950 shadow-2xs'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-teal-700 text-white text-[11px] font-mono font-bold">
                        00:00
                      </span>
                      <span className="text-xs font-bold">
                        Scheme Overview & Eligibility Rules
                      </span>
                    </div>
                    <Play className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  </button>

                  {scheme.applicationSteps.map((step, idx) => {
                    const jumpSec = (idx + 1) * 45;
                    const minStr = Math.floor(jumpSec / 60)
                      .toString()
                      .padStart(2, '0');
                    const secStr = (jumpSec % 60).toString().padStart(2, '0');
                    const sTitle =
                      language === 'pa'
                        ? step.titlePa
                        : language === 'hi'
                          ? step.titleHi
                          : step.titleEn;

                    return (
                      <button
                        key={step.stepNumber}
                        onClick={() => setVideoStartSeconds(jumpSec)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          videoStartSeconds === jumpSec
                            ? 'bg-teal-50 border-teal-500 text-teal-950 shadow-2xs'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 pr-2">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-white text-[11px] font-mono font-bold shrink-0">
                            {minStr}:{secStr}
                          </span>
                          <span className="text-xs font-bold line-clamp-1">
                            Step {step.stepNumber}: {sTitle}
                          </span>
                        </div>
                        <Play className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sewa Kendra / Self-Apply Pro Tips */}
              <div className="bg-teal-950 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-amber-300">
                      Need Offline Assistance Applying?
                    </h5>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Show this video guide and your Document Checklist at your nearest{' '}
                      <strong>Punjab Sewa Kendra</strong> or call Helpline <strong>1100</strong>.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('documents')}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold whitespace-nowrap transition-colors border border-white/15"
                >
                  Open Document Checklist
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleStartTracking(scheme)}
            disabled={isTracked}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isTracked
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs'
            }`}
          >
            <BookOpen className="w-4 h-4 text-teal-600" />
            <span>
              {isTracked
                ? `✓ ${language === 'pa' ? 'ਟਰੈਕ ਕੀਤਾ ਗਿਆ' : language === 'hi' ? 'ट्रैक किया गया' : 'Tracked in My Applications'}`
                : (language === 'pa' ? 'ਅਰਜ਼ੀ ਟਰੈਕ ਕਰੋ' : language === 'hi' ? 'आवेदन ट्रैक करें' : 'Track My Application')}
            </span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href={scheme.officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <span>
                {language === 'pa'
                  ? 'ਅਧਿਕਾਰਤ ਪੋਰਟਲ ਤੇ ਅਪਲਾਈ ਕਰੋ (.gov.in)'
                  : language === 'hi'
                    ? 'आधिकारिक पोर्टल पर आवेदन करें (.gov.in)'
                    : 'Apply on Official Portal (.gov.in)'}
              </span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
