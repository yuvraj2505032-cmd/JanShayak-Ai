import React from 'react';
import { EligibilityEvaluation, Language, Scheme } from '../types/scheme';
import {
  buildSchemeComparisonMatrix,
  MAX_COMPARISON_SCHEMES,
} from '../utils/schemeComparison';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  FileText,
  Scale,
  ShieldCheck,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';

interface SchemeComparisonModalProps {
  schemes: Scheme[];
  evaluationMap: Map<string, EligibilityEvaluation>;
  currentLang: Language;
  onClose: () => void;
  onRemoveScheme: (schemeId: string) => void;
  onClearAll: () => void;
  onOpenSchemeDetails: (
    scheme: Scheme,
    tab?: 'overview' | 'estimator' | 'eligibility' | 'documents' | 'steps' | 'tutorial'
  ) => void;
}

export const SchemeComparisonModal: React.FC<SchemeComparisonModalProps> = ({
  schemes,
  evaluationMap,
  currentLang,
  onClose,
  onRemoveScheme,
  onClearAll,
  onOpenSchemeDetails,
}) => {
  const columns = buildSchemeComparisonMatrix(schemes, evaluationMap, currentLang);

  return (
    <div
      data-testid="scheme-compare-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scheme-compare-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-6xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="scheme-compare-modal-title"
                  className="text-base sm:text-lg font-bold tracking-tight text-white"
                >
                  {currentLang === 'pa'
                    ? 'ਸਕੀਮਾਂ ਦੀ ਆਹਮੋ-ਸਾਹਮਣੇ ਤੁਲਨਾ (Side-by-Side Comparison)'
                    : currentLang === 'hi'
                      ? 'योजनाओं की आमने-सामने तुलना (Side-by-Side Comparison)'
                      : 'Side-by-Side Government Scheme Comparison'}
                </h2>
                <span className="rounded-md bg-blue-500/30 border border-blue-400/40 px-2 py-0.5 text-xs font-extrabold text-blue-100 tabular-nums">
                  {columns.length} / {MAX_COMPARISON_SCHEMES}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentLang === 'pa'
                  ? 'ਲਾਭ ਦੀ ਰਕਮ, ਯੋਗਤਾ ਸ਼ਰਤਾਂ (ਉਮਰ, ਆਮਦਨ, ਸ਼੍ਰੇਣੀ, ਕਿੱਤਾ) ਅਤੇ ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼ਾਂ ਦੀ ਸਿੱਧੀ ਤੁਲਨਾ ਕਰੋ।'
                  : currentLang === 'hi'
                    ? 'लाभ राशि, पात्रता मापदंड (आयु, आय, श्रेणी, व्यवसाय) और आवश्यक दस्तावेजों की सीधी तुलना करें।'
                    : 'Compare benefit amounts, eligibility criteria (age, income, category, occupation), and required documents side-by-side.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {columns.length > 0 && (
              <button
                type="button"
                data-testid="modal-clear-all-compare-btn"
                onClick={onClearAll}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-rose-600/30 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white cursor-pointer whitespace-nowrap shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>
                  {currentLang === 'pa' ? 'ਸਭ ਹਟਾਓ' : currentLang === 'hi' ? 'सभी हटाएं' : 'Clear All'}
                </span>
              </button>
            )}
            <button
              type="button"
              data-testid="close-scheme-compare-modal-btn"
              onClick={onClose}
              aria-label="Close comparison modal"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/20 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {columns.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Scale className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {currentLang === 'pa'
                  ? 'ਤੁਲਨਾ ਕਰਨ ਲਈ ਕੋਈ ਸਕੀਮ ਨਹੀਂ ਚੁਣੀ ਗਈ'
                  : currentLang === 'hi'
                    ? 'तुलना के लिए कोई योजना चयनित नहीं है'
                    : 'No schemes selected for comparison'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {currentLang === 'pa'
                  ? 'ਕਿਸੇ ਵੀ ਸਕੀਮ ਕਾਰਡ ਉੱਤੇ "Compare" ਬਟਨ ਦਬਾ ਕੇ 4 ਤੱਕ ਸਕੀਮਾਂ ਦੀ ਆਹਮੋ-ਸਾਹਮਣੇ ਤੁਲਨਾ ਕਰੋ।'
                  : currentLang === 'hi'
                    ? 'किसी भी योजना कार्ड पर "Compare" बटन दबाकर 4 योजनाओं तक की तुलना करें।'
                    : 'Click the "Compare" button on any scheme card to compare up to 4 schemes side-by-side.'}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 px-4 py-2 text-xs font-bold text-white cursor-pointer"
              >
                <span>Browse Schemes</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table
                data-testid="scheme-compare-table"
                className="w-full min-w-[680px] border-collapse text-left text-xs"
              >
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="w-44 sm:w-52 bg-slate-50 dark:bg-slate-800/80 p-3.5 font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-300 align-top">
                      {currentLang === 'pa'
                        ? 'ਤੁਲਨਾ ਮਾਪਦੰਡ'
                        : currentLang === 'hi'
                          ? 'तुलना मापदंड'
                          : 'Comparison Metric'}
                    </th>
                    {columns.map((col) => (
                      <th
                        key={col.schemeId}
                        data-testid={`compare-col-header-${col.schemeId}`}
                        className="min-w-[230px] p-3.5 align-top bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <ShieldCheck className="h-3 w-3" />
                            <span>{col.level}</span>
                          </span>
                          <button
                            type="button"
                            data-testid={`remove-compare-scheme-btn-${col.schemeId}`}
                            onClick={() => onRemoveScheme(col.schemeId)}
                            aria-label={`Remove ${col.title} from comparison`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                        <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {col.title}
                        </h3>
                        <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {col.department}
                        </p>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {/* 1. Benefit Amount & Type Row */}
                  <tr data-testid="compare-benefit-row">
                    <td className="bg-slate-50/90 dark:bg-slate-800/60 p-3.5 font-bold text-slate-800 dark:text-slate-200 align-top">
                      <div>
                        {currentLang === 'pa'
                          ? 'ਮਿਲਣ ਵਾਲਾ ਲਾਭ / ਰਕਮ'
                          : currentLang === 'hi'
                            ? 'लाभ राशि और प्रकार'
                            : 'Benefit Amount & Type'}
                      </div>
                      <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                        Financial / Welfare Value
                      </div>
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.schemeId}
                        data-testid={`compare-benefit-cell-${col.schemeId}`}
                        className="p-3.5 align-top border-l border-slate-200 dark:border-slate-800 bg-teal-50/40 dark:bg-teal-950/20"
                      >
                        <div className="text-sm font-extrabold text-teal-900 dark:text-teal-300">
                          {col.benefitAmountText}
                        </div>
                        <div className="mt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          Type: {col.benefitType}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* 2. Personalized Eligibility Score & Status Row */}
                  <tr data-testid="compare-eligibility-score-row">
                    <td className="bg-slate-50/90 dark:bg-slate-800/60 p-3.5 font-bold text-slate-800 dark:text-slate-200 align-top">
                      <div>
                        {currentLang === 'pa'
                          ? 'ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਯੋਗਤਾ'
                          : currentLang === 'hi'
                            ? 'आपकी प्रोफ़ाइल पात्रता'
                            : 'Your Profile Match'}
                      </div>
                      <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                        Live Eligibility Score
                      </div>
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.schemeId}
                        className="p-3.5 align-top border-l border-slate-200 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-extrabold tabular-nums ${
                              col.isEligible
                                ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                                : col.isPotentialMatch
                                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {col.isEligible ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                            ) : (
                              <AlertCircle className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                            )}
                            <span>{col.matchPercentage}% Match</span>
                          </span>
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                            {col.statusLabel}
                          </span>
                        </div>
                        {col.failedReasons.length > 0 && (
                          <p className="mt-1.5 text-[11px] font-medium text-rose-700 dark:text-rose-400">
                            Unmet: {col.failedReasons.join(' · ')}
                          </p>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* 3. Eligibility Criteria: Age & Annual Income Limit */}
                  <tr data-testid="compare-age-income-row">
                    <td className="bg-slate-50/90 dark:bg-slate-800/60 p-3.5 font-bold text-slate-800 dark:text-slate-200 align-top">
                      <div>
                        {currentLang === 'pa'
                          ? 'ਉਮਰ ਅਤੇ ਆਮਦਨ ਸ਼ਰਤਾਂ'
                          : currentLang === 'hi'
                            ? 'आयु और आय पात्रता'
                            : 'Age & Income Criteria'}
                      </div>
                      <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                        Statutory Thresholds
                      </div>
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.schemeId}
                        data-testid={`compare-age-income-cell-${col.schemeId}`}
                        className="p-3.5 align-top border-l border-slate-200 dark:border-slate-800 space-y-2"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Age Requirement
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                            {col.ageRequirementText}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Annual Income Limit
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                            {col.incomeRequirementText}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* 4. Eligibility Criteria: Category, Gender, Occupation & Special Rules */}
                  <tr data-testid="compare-eligibility-criteria-row">
                    <td className="bg-slate-50/90 dark:bg-slate-800/60 p-3.5 font-bold text-slate-800 dark:text-slate-200 align-top">
                      <div>
                        {currentLang === 'pa'
                          ? 'ਸ਼੍ਰੇਣੀ, ਕਿੱਤਾ ਅਤੇ ਵਿਸ਼ੇਸ਼ ਸ਼ਰਤਾਂ'
                          : currentLang === 'hi'
                            ? 'श्रेणी, व्यवसाय व विशेष नियम'
                            : 'Eligibility Rules & Target Group'}
                      </div>
                      <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                        Category, Gender & Occupation
                      </div>
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.schemeId}
                        data-testid={`compare-eligibility-cell-${col.schemeId}`}
                        className="p-3.5 align-top border-l border-slate-200 dark:border-slate-800 space-y-2"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Eligible Categories
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {col.categoryRequirementText}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Target Gender & Occupation
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {col.genderRequirementText} · {col.occupationRequirementText}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Domicile & Special Conditions
                          </span>
                          <ul className="mt-1 space-y-1">
                            {col.specialConditionsList.map((cond, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <span>{cond}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* 5. Rule-by-Rule Profile Verification */}
                  <tr>
                    <td className="bg-slate-50/90 dark:bg-slate-800/60 p-3.5 font-bold text-slate-800 dark:text-slate-200 align-top">
                      <div>
                        {currentLang === 'pa'
                          ? 'ਨਿਯਮ-ਅਨੁਸਾਰ ਜਾਂਚ'
                          : currentLang === 'hi'
                            ? 'नियम-वार सत्यापन'
                            : 'Rule-by-Rule Verification'}
                      </div>
                      <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                        Matched vs. Unmet Rules
                      </div>
                    </td>
                    {columns.map((col) => {
                      const evalItem = evaluationMap.get(col.schemeId);
                      const criteriaList = evalItem?.criteria ?? [];
                      return (
                        <td
                          key={col.schemeId}
                          className="p-3.5 align-top border-l border-slate-200 dark:border-slate-800 space-y-1.5"
                        >
                          {criteriaList.length > 0 ? (
                            criteriaList.map((c) => (
                              <div key={c.id} className="flex items-start gap-1.5 text-[11px]">
                                {c.isMet ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {currentLang === 'pa' ? c.labelPa : currentLang === 'hi' ? c.labelHi : c.labelEn}:
                                  </span>{' '}
                                  <span className="text-slate-600 dark:text-slate-400">
                                    {c.requiredDescription}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-500">Standard eligibility rules apply</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* 6. Required Documents Row */}
                  <tr data-testid="compare-documents-row">
                    <td className="bg-slate-50/90 dark:bg-slate-800/60 p-3.5 font-bold text-slate-800 dark:text-slate-200 align-top">
                      <div>
                        {currentLang === 'pa'
                          ? 'ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼'
                          : currentLang === 'hi'
                            ? 'आवश्यक दस्तावेज़'
                            : 'Required Documents'}
                      </div>
                      <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                        Mandatory Certificates
                      </div>
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.schemeId}
                        className="p-3.5 align-top border-l border-slate-200 dark:border-slate-800"
                      >
                        <div className="mb-1.5 text-[11px] font-extrabold text-blue-700 dark:text-blue-400 tabular-nums">
                          {col.requiredDocumentsCount} Required Documents
                        </div>
                        <ul className="space-y-1">
                          {col.requiredDocumentsNames.map((docName, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                              <FileText className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                              <span>{docName}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  {/* 7. Application Deadline & Direct In-Website Guide Actions */}
                  <tr>
                    <td className="bg-slate-50/90 dark:bg-slate-800/60 p-3.5 font-bold text-slate-800 dark:text-slate-200 align-top">
                      <div>
                        {currentLang === 'pa'
                          ? 'ਆਖਰੀ ਮਿਤੀ ਅਤੇ ਅਰਜ਼ੀ'
                          : currentLang === 'hi'
                            ? 'अंतिम तिथि और आवेदन'
                            : 'Deadline & Application'}
                      </div>
                      <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                        In-Website Guide & Steps
                      </div>
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.schemeId}
                        className="p-3.5 align-top border-l border-slate-200 dark:border-slate-800 space-y-2.5"
                      >
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{col.applicationDeadline}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            data-testid={`compare-open-details-btn-${col.schemeId}`}
                            onClick={() => {
                              onClose();
                              onOpenSchemeDetails(col.scheme, 'overview');
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
                          >
                            <span>
                              {currentLang === 'pa'
                                ? 'ਪੂਰੀ ਗਾਈਡ ਖੋਲ੍ਹੋ'
                                : currentLang === 'hi'
                                  ? 'पूरी गाइड खोलें'
                                  : 'Open Full Guide'}
                            </span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenSchemeDetails(col.scheme, 'steps');
                            }}
                            className="inline-flex items-center gap-1 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 text-xs font-bold text-teal-900 cursor-pointer"
                          >
                            <span>
                              {currentLang === 'pa' ? 'ਅਪਲਾਈ ਕਦਮ' : currentLang === 'hi' ? 'आवेदन चरण' : 'Steps'}
                            </span>
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SchemeComparisonTrayProps {
  selectedSchemes: Scheme[];
  currentLang: Language;
  limitNotice?: string | null;
  onOpenModal: () => void;
  onRemoveScheme: (schemeId: string) => void;
  onClearAll: () => void;
}

export const SchemeComparisonTray: React.FC<SchemeComparisonTrayProps> = ({
  selectedSchemes,
  currentLang,
  limitNotice,
  onOpenModal,
  onRemoveScheme,
  onClearAll,
}) => {
  if (selectedSchemes.length === 0) return null;

  return (
    <div
      data-testid="scheme-compare-tray"
      role="region"
      aria-label="Selected schemes for comparison"
      className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-4xl -translate-x-1/2 rounded-2xl border border-blue-300/80 bg-slate-900/95 text-white p-3 sm:p-4 shadow-2xl backdrop-blur-md"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-2.5 py-1 text-xs font-extrabold text-white shrink-0 tabular-nums">
            <Scale className="h-3.5 w-3.5" />
            <span>
              {currentLang === 'pa'
                ? `ਤੁਲਨਾ (${selectedSchemes.length}/${MAX_COMPARISON_SCHEMES})`
                : currentLang === 'hi'
                  ? `तुलना (${selectedSchemes.length}/${MAX_COMPARISON_SCHEMES})`
                  : `Compare (${selectedSchemes.length}/${MAX_COMPARISON_SCHEMES})`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {selectedSchemes.map((s) => {
              const title = currentLang === 'pa' ? s.titlePa : currentLang === 'hi' ? s.titleHi : s.titleEn;
              return (
                <span
                  key={s.id}
                  data-testid={`compare-tray-item-${s.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-100 max-w-[200px] shrink-0"
                >
                  <span className="truncate">{title}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveScheme(s.id)}
                    aria-label={`Remove ${title} from comparison`}
                    className="text-slate-300 hover:text-rose-300 cursor-pointer shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            data-testid="clear-scheme-compare-btn"
            onClick={onClearAll}
            className="rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-bold text-slate-200 cursor-pointer whitespace-nowrap"
          >
            {currentLang === 'pa' ? 'ਸਭ ਹਟਾਓ' : currentLang === 'hi' ? 'साफ़ करें' : 'Clear'}
          </button>
          <button
            type="button"
            data-testid="open-scheme-compare-modal-btn"
            onClick={onOpenModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs font-extrabold text-slate-950 shadow-sm cursor-pointer whitespace-nowrap tabular-nums"
          >
            <Scale className="h-3.5 w-3.5" />
            <span>
              {currentLang === 'pa'
                ? `ਹੁਣੇ ਤੁਲਨਾ ਕਰੋ (${selectedSchemes.length})`
                : currentLang === 'hi'
                  ? `तुलना देखें (${selectedSchemes.length})`
                  : `Compare Now (${selectedSchemes.length})`}
            </span>
          </button>
        </div>
      </div>

      {limitNotice && (
        <p className="mt-2 text-[11px] font-semibold text-amber-300">
          {limitNotice}
        </p>
      )}
    </div>
  );
};
