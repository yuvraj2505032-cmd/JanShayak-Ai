import React, { FormEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Cloud, Eye, EyeOff, Link2, LogIn, LogOut, Monitor, ShieldCheck, Unlink, UserRound, X } from 'lucide-react';
import { Language } from '../types/scheme';
import { TRANSLATIONS } from '../data/translations';

type AuthResult = { error?: string; notice?: string };

export interface SupabaseAccountProps {
  configured: boolean;
  configurationError: string | null;
  userEmail: string | null;
  localUserEmail: string | null;
  googleLinkedEmail?: string | null;
  username?: string;
  localAuthError: string | null;
  syncStatus: string;
  currentLang?: Language;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSignIn: (email: string, password: string, importLocalData: boolean) => Promise<AuthResult>;
  onSignUp: (email: string, password: string, importLocalData: boolean) => Promise<AuthResult>;
  onLocalSignIn: (email: string, password: string) => Promise<AuthResult>;
  onLocalSignUp: (email: string, password: string, importLocalData: boolean) => Promise<AuthResult>;
  onLocalResetPassword?: (email: string, newPassword: string) => Promise<AuthResult>;
  onCloudResetPassword?: (email: string) => Promise<AuthResult>;
  onGoogleSignIn?: (googleEmail: string) => Promise<AuthResult>;
  onLinkGoogle?: (googleEmail: string) => Promise<AuthResult>;
  onUnlinkGoogle?: () => Promise<AuthResult>;
  onSignOut: () => Promise<string | null>;
}

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
    />
  </svg>
);

export const SupabaseAccount: React.FC<SupabaseAccountProps> = ({
  configured,
  configurationError,
  userEmail,
  localUserEmail,
  googleLinkedEmail,
  username,
  localAuthError,
  syncStatus,
  currentLang = 'en',
  isOpen: controlledIsOpen,
  onOpenChange,
  onSignIn,
  onSignUp,
  onLocalSignIn,
  onLocalSignUp,
  onLocalResetPassword,
  onCloudResetPassword,
  onGoogleSignIn,
  onLinkGoogle,
  onUnlinkGoogle,
  onSignOut
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (nextOpen: boolean) => {
    setInternalIsOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };
  const [isLocalAuth, setIsLocalAuth] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showGoogleSignInBox, setShowGoogleSignInBox] = useState(false);
  const [googleInputEmail, setGoogleInputEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cloudConsent, setCloudConsent] = useState(true);
  const [importLocalData, setImportLocalData] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const activeEmail = localUserEmail || userEmail;
  const t = TRANSLATIONS[currentLang];
  const displayUserLabel = username?.trim() || (activeEmail ? activeEmail.split('@')[0] : '');

  const resetFeedback = () => {
    setError('');
    setFeedback('');
  };

  const handleGoogleSignInSubmit = async (e: FormEvent) => {
    e.preventDefault();
    resetFeedback();
    const targetEmail = googleInputEmail.trim().toLowerCase();
    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      setError(
        currentLang === 'pa'
          ? 'ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ Google / Gmail ਪਤਾ ਭਰੋ।'
          : currentLang === 'hi'
          ? 'कृपया एक मान्य Google / Gmail पता दर्ज करें।'
          : 'Please enter a valid Google / Gmail address.'
      );
      return;
    }
    if (!onGoogleSignIn) return;
    setIsBusy(true);
    try {
      const res = await onGoogleSignIn(targetEmail);
      if (res.error) {
        setError(res.error);
      } else {
        setFeedback(
          res.notice ||
            (currentLang === 'pa'
              ? 'Google ਖਾਤੇ ਨਾਲ ਸਫਲਤਾਪੂਰਵਕ ਸਾਈਨ ਇਨ ਅਤੇ ਲਿੰਕ ਹੋ ਗਿਆ!'
              : currentLang === 'hi'
              ? 'Google खाते से सफलतापूर्वक साइन इन और लिंक हो गया!'
              : 'Signed in and linked with Google successfully!')
        );
        setShowGoogleSignInBox(false);
        setGoogleInputEmail('');
        if (!res.notice) setIsOpen(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleLinkGoogleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    resetFeedback();
    const candidateEmail = (googleInputEmail.trim() || activeEmail || '').toLowerCase();
    if (!candidateEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateEmail)) {
      setError(
        currentLang === 'pa'
          ? 'ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ Google / Gmail ਪਤਾ ਭਰੋ।'
          : currentLang === 'hi'
          ? 'कृपया एक मान्य Google / Gmail पता दर्ज करें।'
          : 'Please enter a valid Google / Gmail address.'
      );
      return;
    }
    if (!onLinkGoogle) return;
    setIsBusy(true);
    try {
      const res = await onLinkGoogle(candidateEmail);
      if (res.error) {
        setError(res.error);
      } else {
        setFeedback(
          res.notice ||
            (currentLang === 'pa'
              ? `ਤੁਹਾਡਾ ਖਾਤਾ Google (${candidateEmail}) ਨਾਲ ਸਿੱਧਾ ਲਿੰਕ ਹੋ ਗਿਆ ਹੈ!`
              : currentLang === 'hi'
              ? `आपका खाता Google (${candidateEmail}) से सीधे लिंक हो गया है!`
              : `Your account is now directly linked with Google (${candidateEmail})!`)
        );
        setGoogleInputEmail('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not link Google account.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleUnlinkGoogleClick = async () => {
    if (!onUnlinkGoogle) return;
    resetFeedback();
    setIsBusy(true);
    try {
      const res = await onUnlinkGoogle();
      if (res.error) setError(res.error);
      else {
        setFeedback(
          res.notice ||
            (currentLang === 'pa'
              ? 'Google ਖਾਤਾ ਲਿੰਕ ਹਟਾ ਦਿੱਤਾ ਗਿਆ ਹੈ।'
              : currentLang === 'hi'
              ? 'Google खाता लिंक हटा दिया गया है।'
              : 'Google account link removed.')
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not unlink Google account.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();
    setIsBusy(true);

    try {
      if (isForgotPassword) {
        if (isLocalAuth || !configured) {
          if (password.length < 8) {
            setError('New password must be at least 8 characters.');
            return;
          }
          if (password !== confirmResetPassword) {
            setError('New password and confirmation do not match.');
            return;
          }
          const resetRes = onLocalResetPassword
            ? await onLocalResetPassword(email, password)
            : { error: 'Password reset is not available.' };
          if (resetRes.error) {
            setError(resetRes.error);
          } else {
            setFeedback(resetRes.notice || 'Password reset and signed in successfully.');
            setIsForgotPassword(false);
            setPassword('');
            setConfirmResetPassword('');
            setIsOpen(false);
          }
        } else {
          const resetRes = onCloudResetPassword
            ? await onCloudResetPassword(email)
            : { error: 'Cloud password reset is not configured.' };
          if (resetRes.error) {
            setError(resetRes.error);
          } else {
            setFeedback(resetRes.notice || 'Password reset email sent. Check your inbox.');
          }
        }
        return;
      }

      const useLocal = isLocalAuth || !configured;
      const result = useLocal
        ? isSignUp
          ? await onLocalSignUp(email, password, importLocalData)
          : await onLocalSignIn(email, password)
        : isSignUp
          ? await onSignUp(email, password, importLocalData)
          : await onSignIn(email, password, importLocalData);
      if (result.error) {
        setError(result.error);
      } else {
        setFeedback(result.notice || 'Signed in successfully.');
        if (!result.notice) setIsOpen(false);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Account request failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSignOut = async () => {
    resetFeedback();
    setIsBusy(true);
    try {
      const signOutError = await onSignOut();
      if (signOutError) setError(signOutError);
      else {
        setIsSignUp(false);
        setIsForgotPassword(false);
        setShowGoogleSignInBox(false);
        setPassword('');
        setConfirmResetPassword('');
        setIsOpen(false);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not sign out.');
    } finally {
      setIsBusy(false);
    }
  };

  const modalContent = isOpen ? (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm overflow-y-auto"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setIsOpen(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-title"
        className="my-auto w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/30"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-teal-900 px-6 pb-6 pt-5 text-white">
          <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full border border-white/10" aria-hidden="true" />
          <div className="absolute -right-1 -top-5 h-28 w-28 rounded-full border border-white/10" aria-hidden="true" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <ShieldCheck className="h-5 w-5 text-teal-200" aria-hidden="true" />
              </div>
              {isLocalAuth && localAuthError && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {localAuthError}
                </p>
              )}
              <h2 id="account-title" className="text-xl font-bold tracking-tight">
                {activeEmail ? t.manageAccount : t.welcomeJanshayak}
              </h2>
              <p className="mt-1 max-w-xs text-sm leading-5 text-blue-100">
                {activeEmail ? t.accountSubtextSignedIn : t.accountSubtextSignedOut}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close account dialog"
              className="rounded-full p-2 text-white/75 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          {activeEmail ? (
            <div className="space-y-4">
              {/* Active User Account Info */}
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-blue-800 shadow-sm ring-1 ring-slate-200">
                  {localUserEmail
                    ? <Monitor className="h-5 w-5" aria-hidden="true" />
                    : <Cloud className="h-5 w-5" aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{activeEmail}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {localUserEmail ? t.onThisDevice : t.cloudSyncTab}
                  </p>
                </div>
              </div>

              {/* Direct Google Account Link Section */}
              <div
                data-testid="google-account-link-section"
                className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/60 via-white to-teal-50/40 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-2xs ring-1 ring-slate-200">
                      <GoogleIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        {googleLinkedEmail ? t.linkedWithGoogle : t.linkWithGoogle}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {googleLinkedEmail ? googleLinkedEmail : t.googleLinkDescription}
                      </p>
                    </div>
                  </div>
                  {googleLinkedEmail && (
                    <span
                      data-testid="google-linked-badge"
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Google</span>
                    </span>
                  )}
                </div>

                {googleLinkedEmail ? (
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/70">
                    <span className="text-xs font-medium text-emerald-800 truncate">
                      {googleLinkedEmail}
                    </span>
                    <button
                      type="button"
                      data-testid="unlink-google-btn"
                      disabled={isBusy}
                      onClick={() => void handleUnlinkGoogleClick()}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Unlink className="h-3 w-3" />
                      <span>{t.unlinkGoogle}</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleLinkGoogleSubmit} className="space-y-2.5 pt-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      {t.googleEmailLabel}
                      <input
                        type="email"
                        data-testid="link-google-email-input"
                        value={googleInputEmail}
                        onChange={(e) => setGoogleInputEmail(e.target.value)}
                        placeholder={activeEmail.endsWith('@gmail.com') ? activeEmail : t.googleEmailPlaceholder}
                        className="mt-1 min-h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-normal text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <button
                      type="submit"
                      data-testid="confirm-link-google-btn"
                      disabled={isBusy}
                      className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50"
                    >
                      <GoogleIcon className="h-4 w-4" />
                      <Link2 className="h-3.5 w-3.5" />
                      <span>{t.confirmGoogleLink}</span>
                    </button>
                  </form>
                )}
              </div>

              <p className={`rounded-xl p-3 text-xs leading-5 ${
                localUserEmail ? 'bg-teal-50 text-teal-950 border border-teal-200/70' : 'bg-blue-50 text-blue-950 border border-blue-200/70'
              }`}>
                {syncStatus}
              </p>

              {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
              {feedback && <p role="status" className="text-sm font-medium text-emerald-700">{feedback}</p>}

              <button
                type="button"
                disabled={isBusy}
                onClick={handleSignOut}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {t.signOut}
              </button>
            </div>
          ) : (
            <>
              {/* Direct Sign In / Link with Google Button */}
              <div className="space-y-2.5">
                {!showGoogleSignInBox ? (
                  <button
                    type="button"
                    data-testid="google-signin-toggle-btn"
                    onClick={() => {
                      resetFeedback();
                      setShowGoogleSignInBox(true);
                    }}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-xs transition hover:border-blue-400 hover:bg-blue-50/40 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    <GoogleIcon className="h-4 w-4" />
                    <span>{t.continueWithGoogle}</span>
                  </button>
                ) : (
                  <form
                    onSubmit={handleGoogleSignInSubmit}
                    data-testid="google-signin-form"
                    className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-900">
                        <GoogleIcon className="h-4 w-4" />
                        <span>{t.signInWithGoogle}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowGoogleSignInBox(false);
                          resetFeedback();
                        }}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        {t.cancelAction}
                      </button>
                    </div>
                    <label className="block text-xs font-semibold text-slate-700">
                      {t.googleEmailLabel}
                      <input
                        type="email"
                        required
                        data-testid="google-signin-email-input"
                        value={googleInputEmail}
                        onChange={(e) => setGoogleInputEmail(e.target.value)}
                        placeholder={t.googleEmailPlaceholder}
                        className="mt-1 min-h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <button
                      type="submit"
                      data-testid="google-signin-submit-btn"
                      disabled={isBusy}
                      className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-800 disabled:opacity-50"
                    >
                      <GoogleIcon className="h-3.5 w-3.5 bg-white rounded-full p-0.5" />
                      <span>{isBusy ? t.pleaseWait : t.confirmGoogleSignIn}</span>
                    </button>
                  </form>
                )}
              </div>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-200" />
                <span className="mx-3 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {currentLang === 'pa' ? 'ਜਾਂ ਈਮੇਲ ਰਾਹੀਂ' : currentLang === 'hi' ? 'या ईमेल द्वारा' : 'Or with Email'}
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              <div role="tablist" aria-label="Choose account type" className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isLocalAuth}
                  onClick={() => {
                    setIsLocalAuth(true);
                    setIsSignUp(false);
                    setIsForgotPassword(false);
                    resetFeedback();
                  }}
                  className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-2 text-xs sm:text-sm font-semibold transition ${
                    isLocalAuth ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Monitor className="h-4 w-4" aria-hidden="true" />
                  {t.onThisDevice}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isLocalAuth}
                  onClick={() => {
                    setIsLocalAuth(false);
                    setIsSignUp(false);
                    setIsForgotPassword(false);
                    resetFeedback();
                  }}
                  className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-2 text-xs sm:text-sm font-semibold transition ${
                    !isLocalAuth ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Cloud className="h-4 w-4" aria-hidden="true" />
                  {t.cloudSyncTab}
                </button>
              </div>

              {!isLocalAuth && !configured && (
                <p role="status" className="rounded-xl border border-teal-200 bg-teal-50/80 p-3 text-xs leading-5 text-teal-950">
                  {currentLang === 'pa'
                    ? 'ਸੁਪਾਬੇਸ (Supabase) ਕੁੰਜੀਆਂ .env ਵਿੱਚ ਸੈੱਟ ਹੋਣ ਤੇ ਕਲਾਊਡ ਸਿੰਕ ਆਪਣੇ-ਆਪ ਚਾਲੂ ਹੋ ਜਾਵੇਗਾ। ਤਦ ਤੱਕ ਤੁਹਾਡਾ ਡਾਟਾ ਸੁਰੱਖਿਅਤ ਰੂਪ ਵਿੱਚ ਸੇਵ ਹੋਵੇਗਾ।'
                    : currentLang === 'hi'
                    ? 'सुपाबेस (Supabase) कुंजियाँ .env में सेट होने पर क्लाउड सिंक स्वतः सक्रिय हो जाएगा। तब तक आपका डेटा सुरक्षित रूप से सहेजा जाएगा।'
                    : (configurationError || 'Supabase keys can be added in .env for live cloud sync. Your account will automatically save locally and sync when connected.')}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  {t.emailAddressLabel}
                  <input
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                {(!isForgotPassword || isLocalAuth || !configured) && (
                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="account-password-input" className="block text-sm font-semibold text-slate-700">
                        {isForgotPassword ? t.newPasswordLabel : t.passwordLabel}
                      </label>
                      {!isSignUp && !isForgotPassword && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setPassword('');
                            setConfirmResetPassword('');
                            resetFeedback();
                          }}
                          className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                        >
                          {t.forgotPasswordBtn}
                        </button>
                      )}
                    </div>
                    <span className="relative mt-1.5 block">
                      <input
                        id="account-password-input"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete={isSignUp || isForgotPassword ? 'new-password' : 'current-password'}
                        minLength={8}
                        maxLength={256}
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder={isSignUp || isForgotPassword ? 'At least 8 characters' : 'Enter your password'}
                        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 pr-12 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(value => !value)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-slate-500 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                      >
                        {showPassword
                          ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                          : <Eye className="h-4 w-4" aria-hidden="true" />}
                      </button>
                    </span>
                  </div>
                )}

                {isForgotPassword && (isLocalAuth || !configured) && (
                  <label className="block text-sm font-semibold text-slate-700">
                    {t.confirmNewPasswordLabel}
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={256}
                      required
                      value={confirmResetPassword}
                      onChange={(event) => setConfirmResetPassword(event.target.value)}
                      placeholder="Re-enter new password"
                      className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                )}

                {!isForgotPassword && !isLocalAuth && configured && (
                  <label className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
                    <input
                      type="checkbox"
                      required
                      checked={cloudConsent}
                      onChange={(event) => setCloudConsent(event.target.checked)}
                      className="mt-1 accent-blue-800"
                    />
                    <span>
                      {currentLang === 'pa'
                        ? 'ਮੈਂ ਆਪਣੀਆਂ ਸੇਵ ਕੀਤੀਆਂ ਸਕੀਮਾਂ, ਪ੍ਰੋਫ਼ਾਈਲ ਅਤੇ ਅਰਜ਼ੀ ਟਰੈਕਰ ਡਾਟਾ ਨੂੰ ਸੁਪਾਬੇਸ (Supabase) ਕਲਾਊਡ ਵਿੱਚ ਸੁਰੱਖਿਅਤ ਕਰਨ ਲਈ ਸਹਿਮਤ ਹਾਂ।'
                        : currentLang === 'hi'
                        ? 'मैं अपनी सहेजी गई योजनाओं, प्रोफ़ाइल और आवेदन ट्रैकर डेटा को सुपाबेस (Supabase) क्लाउड में सहेजने के लिए सहमत हूँ।'
                        : 'I agree to store my saved schemes, profile, and tracker details in my Supabase cloud account.'}
                    </span>
                  </label>
                )}

                {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
                {feedback && <p role="status" className="text-sm font-medium text-emerald-700">{feedback}</p>}
                <button
                  type="submit"
                  disabled={isBusy || (!isLocalAuth && configured && !isForgotPassword && !cloudConsent)}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  {isBusy
                    ? t.pleaseWait
                    : isForgotPassword
                      ? (isLocalAuth || !configured ? 'Reset password & Sign in' : 'Send reset link')
                      : isSignUp
                        ? t.createAccount
                        : t.signIn}
                </button>
                {isForgotPassword ? (
                  <p className="text-center text-sm text-slate-600">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setPassword('');
                        setConfirmResetPassword('');
                        resetFeedback();
                      }}
                      className="font-semibold text-blue-800 underline decoration-blue-300 underline-offset-2 hover:text-blue-950"
                    >
                      {t.backToSignIn}
                    </button>
                  </p>
                ) : (
                  <p className="text-center text-sm text-slate-600">
                    {isSignUp ? t.alreadyHaveAccount : t.newToJanshayak}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(value => !value);
                        setIsForgotPassword(false);
                        setPassword('');
                        resetFeedback();
                      }}
                      className="font-semibold text-blue-800 underline decoration-blue-300 underline-offset-2 hover:text-blue-950"
                    >
                      {isSignUp ? t.signIn : t.createAccount}
                    </button>
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  ) : null;

  return (
    <>
      {activeEmail ? (
        <div className="inline-flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              resetFeedback();
              setIsOpen(true);
            }}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/90 px-2.5 py-1.5 text-xs font-semibold text-emerald-950 shadow-xs transition hover:border-emerald-300 hover:bg-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-100 sm:px-3"
            aria-label={`Account ${activeEmail}`}
            title={googleLinkedEmail ? `${activeEmail} (${t.linkedWithGoogle}: ${googleLinkedEmail})` : activeEmail}
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
            {googleLinkedEmail ? (
              <GoogleIcon className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <UserRound className="hidden h-3.5 w-3.5 shrink-0 text-emerald-700 sm:inline" aria-hidden="true" />
            )}
            <span className="max-w-20 truncate sm:max-w-32">{displayUserLabel}</span>
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void handleSignOut()}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-700 shadow-xs transition hover:border-rose-300 hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
            aria-label={t.signOut}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{t.signOut}</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            resetFeedback();
            setIsOpen(true);
          }}
          className="inline-flex h-8 sm:min-h-10 shrink-0 whitespace-nowrap items-center gap-1 rounded-xl bg-blue-700 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 sm:gap-1.5 sm:px-3.5 sm:py-1.5 sm:text-sm cursor-pointer"
          aria-label={t.signIn}
        >
          <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" aria-hidden="true" />
          <span>{t.signIn}</span>
        </button>
      )}

      {modalContent && typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent}
    </>
  );
};
