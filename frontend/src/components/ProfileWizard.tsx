import React, { useMemo, useState } from 'react';
import { CitizenProfile, Language, Occupation, Category, Gender, UserRole } from '../types/scheme';
import { TRANSLATIONS } from '../data/translations';
import { PUNJAB_DISTRICTS } from '../data/punjabDistricts';
import { Sparkles, RotateCcw, CheckCircle2, User, Briefcase, MapPin, IndianRupee, Layers, Check, ShieldCheck, Bot } from 'lucide-react';

interface ProfileWizardProps {
  currentLang: Language;
  profile: CitizenProfile;
  onChange: (updatedProfile: CitizenProfile) => void;
  onReset: () => void;
  onApply: () => void;
  onSaveProfile: () => Promise<void>;
  onSetPassword: (password: string) => Promise<void>;
  accountEmail: string | null;
  onOpenAiRoadmap?: () => void;
  onOpenAdminConsole?: () => void;
  eligibleCount: number;
  potentialCount: number;
}

export const ProfileWizard: React.FC<ProfileWizardProps> = ({
  currentLang,
  profile,
  onChange,
  onReset,
  onApply,
  onSaveProfile,
  onSetPassword,
  accountEmail,
  onOpenAiRoadmap,
  onOpenAdminConsole,
  eligibleCount,
  potentialCount
}) => {
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const t = TRANSLATIONS[currentLang];

  const occupations: Occupation[] = [
    'Student',
    'Farmer',
    'Agricultural Labourer',
    'Unemployed Youth',
    'Artisan/Craftsperson',
    'Self-Employed',
    'Self-Employed/Shopkeeper',
    'Daily Wage Worker',
    'Homemaker',
    'Senior Citizen',
    'Private Employee',
    'Government Employee'
  ];

  const categories: Category[] = ['General', 'SC', 'OBC/BC', 'EWS', 'ST'];
  const genders: Gender[] = ['Male', 'Female', 'Transgender'];

  const incomePresets = [
    { label: '< ₹60,000 (BPL)', value: 55000 },
    { label: '₹1.5 Lakh', value: 150000 },
    { label: '₹2.5 Lakh (SC/EWS)', value: 240000 },
    { label: '₹5.0 Lakh', value: 500000 },
    { label: '₹8.0 Lakh', value: 800000 },
  ];

  const profileProgress = useMemo(() => {
    const checks = [
      !!profile.username?.trim(),
      typeof profile.age === 'number' && profile.age > 0,
      !!profile.gender,
      !!profile.occupation,
      !!profile.category,
      !!profile.district,
      typeof profile.annualIncome === 'number' && profile.annualIncome >= 0,
      profile.isPunjabDomicile !== undefined,
      profile.hasDisability !== undefined,
      profile.isWidowOrDestitute !== undefined,
      profile.isEnrolledInSchoolOrCollege !== undefined,
    ];
    const completed = checks.filter(Boolean).length;
    const percent = Math.round((completed / checks.length) * 100);
    return { completed, total: checks.length, percent };
  }, [profile]);

  const handleChange = <K extends keyof CitizenProfile>(field: K, value: CitizenProfile[K]) => {
    onChange({
      ...profile,
      [field]: value
    });
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setSaveMessage('');
    setSaveError('');
    try {
      if (profile.username.trim().length > 80) {
        throw new Error('Username must be 80 characters or fewer.');
      }
      await onSaveProfile();
      setSaveMessage('Profile saved. You can reopen it from the profile icon.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save your profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSetPassword = async () => {
    setPasswordMessage('');
    setPasswordError('');
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('The passwords do not match.');
      return;
    }

    setIsSettingPassword(true);
    try {
      await onSetPassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Your password has been updated securely.');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Could not update your password.');
    } finally {
      setIsSettingPassword(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 mb-8">
      {/* Wizard Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {t.wizardTitle}
            </h2>
            <span className="bg-teal-100 text-teal-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
              {currentLang === 'pa' ? 'ਲਾਈਵ AI ਮਿਲਾਣ' : currentLang === 'hi' ? 'लाइव AI मिलान' : 'Live AI Matching'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.wizardSubtitle}
          </p>
        </div>

        {/* Live Matching Counter Badge */}
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-3.5 py-1.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-slate-700">
            {currentLang === 'pa' ? 'ਮਿਲਾਣ:' : currentLang === 'hi' ? 'मिलान:' : 'Matches:'}{' '}
            <strong className="text-emerald-700">
              {eligibleCount} {t.eligibleShort}
            </strong>,{' '}
            <span className="text-blue-700">
              {potentialCount} {t.potentialShort}
            </span>
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
        <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider text-blue-800">
          <span>Eligibility questionnaire progress</span>
          <span>{profileProgress.percent}%</span>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-blue-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 transition-all"
            style={{ width: `${profileProgress.percent}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-slate-600">
          {profileProgress.completed} of {profileProgress.total} profile checks completed.
        </p>
      </div>

      {/* User Profile Role Designation ('Citizen' | 'Admin') */}
      <div className="mt-4 rounded-2xl border border-teal-200/80 bg-gradient-to-r from-slate-900 via-blue-950 to-teal-900 p-4 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
                User Profile Role State (ਵਰਤੋਂਕਾਰ ਭੂਮਿਕਾ)
              </span>
              <span
                data-testid="active-profile-role-badge"
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                  profile.role === 'Admin'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-white/15 text-white'
                }`}
              >
                {(profile.role ?? 'Citizen') === 'Admin' ? 'Admin Role Active' : 'Citizen Role Active'}
              </span>
            </div>
            <p className="text-xs text-blue-100">
              Designate the <strong>Admin</strong> role in your profile state to unlock manually adding, editing, or deleting government scheme entries directly from the UI for the AI&apos;s knowledge base.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['Citizen', 'Admin'] as UserRole[]).map((roleOption) => {
              const isSelected = (profile.role ?? 'Citizen') === roleOption;
              return (
                <button
                  key={roleOption}
                  type="button"
                  data-testid={`profile-role-${roleOption.toLowerCase()}-btn`}
                  aria-pressed={isSelected}
                  onClick={() => handleChange('role', roleOption)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-teal-400 text-slate-950 shadow-md ring-2 ring-teal-200'
                      : 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {roleOption === 'Admin' ? 'Admin (AI Knowledge Manager)' : 'Citizen (Standard)'}
                </button>
              );
            })}

            {profile.role === 'Admin' && onOpenAdminConsole && (
              <button
                type="button"
                data-testid="profile-open-admin-kb-btn"
                onClick={onOpenAdminConsole}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 shadow-sm transition hover:bg-amber-300 cursor-pointer"
              >
                <Bot className="h-3.5 w-3.5" />
                <span>Manage AI Knowledge Base</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-5">
        <div>
          <label htmlFor="citizen-username" className="mb-1.5 block text-xs font-semibold text-slate-700">
            {currentLang === 'pa' ? 'ਤੁਹਾਡਾ ਨਾਮ / ਯੂਜ਼ਰਨੇਮ' : currentLang === 'hi' ? 'आपका नाम / यूज़रनेम' : 'Username'}
          </label>
          <input
            id="citizen-username"
            type="text"
            autoComplete="username"
            maxLength={80}
            value={profile.username}
            onChange={(event) => handleChange('username', event.target.value)}
            placeholder={
              currentLang === 'pa'
                ? 'ਆਪਣਾ ਨਾਮ ਲਿਖੋ'
                : currentLang === 'hi'
                ? 'अपना नाम दर्ज करें'
                : 'Enter your name or username'
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Age Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>{t.ageLabel}</span>
            <span className="text-blue-600 font-bold">
              {profile.age} {currentLang === 'pa' ? 'ਸਾਲ' : currentLang === 'hi' ? 'वर्ष' : 'Years'}
            </span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="95"
              value={profile.age}
              onChange={(e) => handleChange('age', Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <input
              type="number"
              min="1"
              max="110"
              value={profile.age}
              onChange={(e) => handleChange('age', Math.max(1, Number(e.target.value)))}
              className="w-16 px-2 py-1 text-xs border border-slate-300 rounded-lg text-center font-bold text-slate-800"
            />
          </div>
        </div>

        {/* Gender Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {t.genderLabel}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {genders.map((g) => {
              const genderLabel =
                g === 'Male'
                  ? (currentLang === 'pa' ? 'ਪੁਰਸ਼' : currentLang === 'hi' ? 'पुरुष' : 'Male')
                  : g === 'Female'
                  ? (currentLang === 'pa' ? 'ਮਹਿਲਾ' : currentLang === 'hi' ? 'महिला' : 'Female')
                  : (currentLang === 'pa' ? 'ਟ੍ਰਾਂਸਜੈਂਡਰ' : currentLang === 'hi' ? 'ट्रांसजेंडर' : 'Transgender');
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleChange('gender', g)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    profile.gender === g
                      ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {genderLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Social Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {t.categoryLabel}
          </label>
          <select
            value={profile.category}
            onChange={(e) => handleChange('category', e.target.value as Category)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Occupation */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.occupationLabel}</span>
          </label>
          <select
            value={profile.occupation}
            onChange={(e) => {
              const occ = e.target.value as Occupation;
              if (occ === 'Student') {
                onChange({
                  ...profile,
                  occupation: 'Student',
                  isEnrolledInSchoolOrCollege: true,
                  age: profile.age > 30 ? 20 : profile.age,
                });
              } else {
                onChange({
                  ...profile,
                  occupation: occ,
                  isEnrolledInSchoolOrCollege: false,
                });
              }
            }}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {occupations.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Annual Income */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.incomeLabel}</span>
            </span>
            <span className="text-teal-700 font-bold">₹{profile.annualIncome.toLocaleString('en-IN')}</span>
          </label>
          <input
            type="number"
            step="10000"
            value={profile.annualIncome}
            onChange={(e) => handleChange('annualIncome', Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          {/* Quick presets */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {incomePresets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleChange('annualIncome', p.value)}
                className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                  profile.annualIncome === p.value
                    ? 'bg-teal-600 text-white border-teal-600 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* District in Punjab */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.districtLabel}</span>
          </label>
          <select
            value={profile.district}
            onChange={(e) => handleChange('district', e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {PUNJAB_DISTRICTS.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} ({currentLang === 'pa' ? d.namePa : currentLang === 'hi' ? d.nameHi : d.name})
              </option>
            ))}
          </select>
        </div>

        {/* Landholding (if Farmer) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>{t.landholdingLabel}</span>
            <span className="text-slate-500 font-medium">
              {profile.landholdingAcres} {currentLang === 'pa' ? 'ਏਕੜ' : currentLang === 'hi' ? 'एकड़' : 'Acres'}
            </span>
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={profile.landholdingAcres}
            onChange={(e) => handleChange('landholdingAcres', Number(e.target.value))}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-800"
          />
        </div>

        {/* Toggles: Punjab Domicile, Disability, Widow, Student */}
        <div className="sm:col-span-2 lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {/* Punjab Domicile */}
          <button
            type="button"
            onClick={() => handleChange('isPunjabDomicile', !profile.isPunjabDomicile)}
            className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
              profile.isPunjabDomicile
                ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold">{t.domicileLabel}</span>
              {profile.isPunjabDomicile && <Check className="w-3.5 h-3.5 text-blue-700" />}
            </div>
            <span className="text-[10px] font-bold mt-1 text-blue-700">
              {profile.isPunjabDomicile
                ? (currentLang === 'pa' ? 'ਹਾਂ, ਪੰਜਾਬ ਵਸਨੀਕ' : currentLang === 'hi' ? 'हाँ, पंजाब निवासी' : 'Yes, Punjab Resident')
                : (currentLang === 'pa' ? 'ਨਹੀਂ' : currentLang === 'hi' ? 'नहीं' : 'No')}
            </span>
          </button>

          {/* Disability Toggle */}
          <button
            type="button"
            onClick={() => handleChange('hasDisability', !profile.hasDisability)}
            className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
              profile.hasDisability
                ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold">{t.disabilityLabel}</span>
              {profile.hasDisability && <Check className="w-3.5 h-3.5 text-purple-700" />}
            </div>
            <span className="text-[10px] font-bold mt-1 text-purple-700">
              {profile.hasDisability
                ? (currentLang === 'pa' ? 'ਹਾਂ (≥ 40% / UDID)' : currentLang === 'hi' ? 'हाँ (≥ 40% / UDID)' : 'Yes (≥ 40% / UDID)')
                : (currentLang === 'pa' ? 'ਨਹੀਂ' : currentLang === 'hi' ? 'नहीं' : 'No')}
            </span>
          </button>

          {/* Widow Toggle */}
          <button
            type="button"
            onClick={() => handleChange('isWidowOrDestitute', !profile.isWidowOrDestitute)}
            className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
              profile.isWidowOrDestitute
                ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold">{t.widowLabel}</span>
              {profile.isWidowOrDestitute && <Check className="w-3.5 h-3.5 text-rose-700" />}
            </div>
            <span className="text-[10px] font-bold mt-1 text-rose-700">
              {profile.isWidowOrDestitute
                ? (currentLang === 'pa' ? 'ਹਾਂ' : currentLang === 'hi' ? 'हाँ' : 'Yes')
                : (currentLang === 'pa' ? 'ਨਹੀਂ' : currentLang === 'hi' ? 'नहीं' : 'No')}
            </span>
          </button>

          {/* Student Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextEnrolled = !profile.isEnrolledInSchoolOrCollege;
              onChange({
                ...profile,
                isEnrolledInSchoolOrCollege: nextEnrolled,
                occupation: nextEnrolled ? 'Student' : (profile.occupation === 'Student' ? 'Unemployed Youth' : profile.occupation),
                age: nextEnrolled && profile.age > 30 ? 20 : profile.age,
              });
            }}
            className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
              profile.isEnrolledInSchoolOrCollege || profile.occupation === 'Student'
                ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold">{t.studentLabel}</span>
              {(profile.isEnrolledInSchoolOrCollege || profile.occupation === 'Student') && <Check className="w-3.5 h-3.5 text-amber-700" />}
            </div>
            <span className="text-[10px] font-bold mt-1 text-amber-700">
              {profile.isEnrolledInSchoolOrCollege || profile.occupation === 'Student'
                ? (currentLang === 'pa' ? 'ਹਾਂ, ਵਿਦਿਆਰਥੀ' : currentLang === 'hi' ? 'हाँ, अध्ययनरत' : 'Yes, Enrolled')
                : (currentLang === 'pa' ? 'ਨਹੀਂ' : currentLang === 'hi' ? 'नहीं' : 'No')}
            </span>
          </button>
        </div>
      </div>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {currentLang === 'pa' ? 'ਖਾਤਾ ਪਾਸਵਰਡ ਸੈਟਿੰਗ' : currentLang === 'hi' ? 'खाता पासवर्ड सेटिंग' : 'Account password'}
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {accountEmail
                ? (currentLang === 'pa'
                    ? `${accountEmail} ਲਈ ਨਵਾਂ ਪਾਸਵਰਡ ਸੈੱਟ ਕਰੋ।`
                    : currentLang === 'hi'
                    ? `${accountEmail} के लिए नया पासवर्ड सेट करें।`
                    : `Set a new password for ${accountEmail}.`)
                : (currentLang === 'pa'
                    ? 'ਪਾਸਵਰਡ ਬਦਲਣ ਲਈ ਆਪਣੇ ਖਾਤੇ ਵਿੱਚ ਸਾਈਨ ਇਨ ਕਰੋ।'
                    : currentLang === 'hi'
                    ? 'पासवर्ड बदलने के लिए अपने खाते में साइन इन करें।'
                    : 'Sign in to your account to set or change its password.')}
            </p>
          </div>
        </div>
        {accountEmail ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700">
              {t.newPasswordLabel}
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              {t.confirmNewPasswordLabel}
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
            <button
              type="button"
              onClick={() => void handleSetPassword()}
              disabled={isSettingPassword || !newPassword || !confirmPassword}
              className="min-h-10 justify-self-start rounded-full bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
            >
              {isSettingPassword ? t.pleaseWait : (currentLang === 'pa' ? 'ਪਾਸਵਰਡ ਸੈੱਟ ਕਰੋ' : currentLang === 'hi' ? 'पासवर्ड सेट करें' : 'Set password')}
            </button>
            {(passwordMessage || passwordError) && (
              <p role={passwordError ? 'alert' : 'status'} className={`text-xs sm:col-span-2 ${passwordError ? 'text-red-700' : 'text-emerald-700'}`}>
                {passwordError || passwordMessage}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-xs font-medium text-blue-700">
            {currentLang === 'pa'
              ? 'ਉੱਪਰ ਦਿੱਤੇ ਸਾਈਨ-ਇਨ ਬਟਨ ਰਾਹੀਂ ਈਮੇਲ ਜਾਂ Google ਨਾਲ ਖਾਤਾ ਬਣਾਓ ਜਾਂ ਸਾਈਨ ਇਨ ਕਰੋ।'
              : currentLang === 'hi'
              ? 'ऊपर दिए गए साइन-इन बटन से ईमेल या Google के माध्यम से साइन इन करें।'
              : 'Use the Sign in button in the top bar to sign in with Email or Google.'}
          </p>
        )}
      </section>

      {/* Citizen Consent Checkbox (Digital Personal Data Protection Act, 2023 Compliance) */}
      <div className="mt-5 p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/80 flex items-start gap-3">
        <input
          type="checkbox"
          id="profile-consent-check"
          defaultChecked
          className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
        />
        <label htmlFor="profile-consent-check" className="text-xs text-slate-700 cursor-pointer select-none leading-relaxed">
          <strong className="text-blue-950 font-semibold block mb-0.5">
            {currentLang === 'pa' ? 'ਨਾਗਰਿਕ ਡਾਟਾ ਸੁਰੱਖਿਆ ਸਹਿਮਤੀ' : currentLang === 'hi' ? 'नागरिक गोपनीयता एवं डेटा सहमति' : 'Citizen Privacy & Data Consent Checkbox'}
          </strong>
          {currentLang === 'pa'
            ? 'ਮੈਂ ਆਪਣੀ ਉਮਰ, ਆਮਦਨ, ਸ਼੍ਰੇਣੀ ਅਤੇ ਜ਼ਿਲ੍ਹੇ ਦੇ ਆਧਾਰ ਤੇ ਸਕੀਮਾਂ ਦੀ ਯੋਗਤਾ ਜਾਣਨ ਲਈ ਸਹਿਮਤੀ ਦਿੰਦਾ/ਦਿੰਦੀ ਹਾਂ। ਕੋਈ ਵੀ ਨਿੱਜੀ ਡਾਟਾ ਬਿਨਾਂ ਸਹਿਮਤੀ ਦੇ ਕਿਸੇ ਵੀ ਸਰਵਰ ਤੇ ਸਟੋਰ ਨਹੀਂ ਕੀਤਾ ਜਾਵੇਗਾ।'
            : currentLang === 'hi'
            ? 'मैं सरकारी योजना पात्रता जानने हेतु अपनी जानकारी प्रोसेस करने की सहमति देता/देती हूँ। बिना अनुमति के कोई व्यक्तिगत डेटा सर्वर पर स्टोर नहीं किया जाएगा।'
            : 'I consent to local processing of my profile to find eligible government welfare schemes. No personal identifying information is stored or retained on remote servers without explicit consent.'}
        </label>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-5 border-t border-slate-100">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.resetButton}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => void handleSaveProfile()}
            disabled={isSavingProfile}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60 sm:text-sm"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>
              {isSavingProfile
                ? t.pleaseWait
                : (currentLang === 'pa' ? 'ਪ੍ਰੋਫ਼ਾਈਲ ਸੇਵ ਕਰੋ' : currentLang === 'hi' ? 'प्रोफ़ाइल सहेजें' : 'Save Profile')}
            </span>
          </button>
          {onOpenAiRoadmap && (
            <button
              type="button"
              onClick={onOpenAiRoadmap}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-600 fill-amber-300" />
              <span>
                {currentLang === 'pa' ? 'AI ਭਲਾਈ ਰੋਡਮੈਪ' : currentLang === 'hi' ? 'AI कल्याण रोडमैप' : 'AI Welfare Roadmap'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onApply}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t.checkButton} ({eligibleCount + potentialCount})</span>
          </button>
        </div>
      </div>
      {(saveMessage || saveError) && (
        <p role={saveError ? 'alert' : 'status'} className={`mt-3 text-right text-xs font-medium ${saveError ? 'text-red-700' : 'text-emerald-700'}`}>
          {saveError || saveMessage}
        </p>
      )}
    </div>
  );
};
