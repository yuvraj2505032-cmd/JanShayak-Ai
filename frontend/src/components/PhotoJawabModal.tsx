import React, { useState, useRef } from 'react';
import { Language, Scheme } from '../types/scheme';
import { GOV_SCHEMES } from '../data/schemes';
import {
  SAMPLE_PHOTO_JAWAB_PRESETS,
  SamplePhotoJawabPreset,
  PhotoJawabAnalysis,
  analyzePhotoJawabInput,
} from '../utils/photoJawabHelper';
import { apiUrl } from '../lib/apiUrl';
import {
  X,
  Camera,
  UploadCloud,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  ArrowRight,
  FileText,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';

interface PhotoJawabModalProps {
  currentLang: Language;
  onClose: () => void;
  schemes?: Scheme[];
  onOpenSchemeModal?: (scheme: Scheme) => void;
  onOpenChatWithQuestion?: (question: string) => void;
}

export const PhotoJawabModal: React.FC<PhotoJawabModalProps> = ({
  currentLang,
  onClose,
  schemes = GOV_SCHEMES,
  onOpenSchemeModal,
  onOpenChatWithQuestion,
}) => {
  const [selectedLang, setSelectedLang] = useState<Language>(currentLang || 'pa');
  const [activePresetKey, setActivePresetKey] = useState<string>('ration_card');
  const [previewImageUrl, setPreviewImageUrl] = useState<string>(
    SAMPLE_PHOTO_JAWAB_PRESETS[0].previewSvgDataUrl
  );
  const [uploadedFileName, setUploadedFileName] = useState<string>(
    SAMPLE_PHOTO_JAWAB_PRESETS[0].sampleFileName
  );
  const [userNote, setUserNote] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<PhotoJawabAnalysis>(() =>
    analyzePhotoJawabInput({
      presetKey: 'ration_card',
      fileName: SAMPLE_PHOTO_JAWAB_PRESETS[0].sampleFileName,
      rawText: SAMPLE_PHOTO_JAWAB_PRESETS[0].sampleRawText,
      language: currentLang || 'pa',
    })
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleSpeakAnalysis = (targetAnalysis: PhotoJawabAnalysis, lang: Language = selectedLang) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    window.speechSynthesis.cancel();

    const whatIsWritten =
      lang === 'pa'
        ? `ਇਹਦੇ ਵਿੱਚ ਕੀ ਲਿਖਿਆ ਹੈ: ${targetAnalysis.ehdeChKiLikheyaPa}`
        : lang === 'hi'
          ? `इसमें क्या लिखा है: ${targetAnalysis.ehdeChKiLikheyaHi}`
          : `What is written in this photo: ${targetAnalysis.ehdeChKiLikheyaEn}`;

    const nextSteps =
      lang === 'pa'
        ? `ਅੱਗੇ ਕੀ ਕਰਨਾ ਹੈ: ${targetAnalysis.aggeKiKarnaPa.join(' ')}`
        : lang === 'hi'
          ? `आगे क्या करना है: ${targetAnalysis.aggeKiKarnaHi.join(' ')}`
          : `What to do next: ${targetAnalysis.aggeKiKarnaEn.join(' ')}`;

    const utterance = new SpeechSynthesisUtterance(`${whatIsWritten} ... ${nextSteps}`);
    const voices = window.speechSynthesis.getVoices();
    const targetBcp = lang === 'pa' ? 'pa-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    const prefix = targetBcp.split('-')[0];
    const matchedVoice =
      voices.find((v) => v.lang.toLowerCase() === targetBcp.toLowerCase()) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ||
      voices.find((v) => v.lang.toLowerCase().includes('in'));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    } else {
      utterance.lang = targetBcp;
    }
    utterance.rate = 0.92;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const runPhotoJawabAnalysis = async (payload: {
    presetKey?: string;
    fileName?: string;
    rawText?: string;
    imageBase64?: string;
    mimeType?: string;
    previewUrl?: string;
  }) => {
    stopSpeaking();
    setIsAnalyzing(true);
    if (payload.previewUrl) {
      setPreviewImageUrl(payload.previewUrl);
    }
    if (payload.fileName) {
      setUploadedFileName(payload.fileName);
    }

    let result: PhotoJawabAnalysis | null = null;
    try {
      const response = await fetch(apiUrl('/api/ai/photo-jawab'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presetKey: payload.presetKey,
          fileName: payload.fileName,
          rawText: payload.rawText,
          imageBase64: payload.imageBase64,
          mimeType: payload.mimeType,
          language: selectedLang,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data?.analysis) {
          result = data.analysis;
        }
      }
    } catch {
      // Fallback to local offline photo reader
    }

    if (!result) {
      result = analyzePhotoJawabInput({
        presetKey: payload.presetKey,
        fileName: payload.fileName,
        rawText: payload.rawText,
        language: selectedLang,
      });
    }

    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleSelectPreset = (preset: SamplePhotoJawabPreset) => {
    setActivePresetKey(preset.key);
    void runPhotoJawabAnalysis({
      presetKey: preset.key,
      fileName: preset.sampleFileName,
      rawText: `${preset.sampleRawText} ${userNote}`.trim(),
      previewUrl: preset.previewSvgDataUrl,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActivePresetKey('custom');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      void runPhotoJawabAnalysis({
        fileName: file.name,
        rawText: `${file.name} ${userNote}`.trim(),
        imageBase64: dataUrl,
        mimeType: file.type || 'image/jpeg',
        previewUrl: dataUrl || SAMPLE_PHOTO_JAWAB_PRESETS[0].previewSvgDataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  const docTitle =
    selectedLang === 'pa'
      ? analysis.documentTitlePa
      : selectedLang === 'hi'
        ? analysis.documentTitleHi
        : analysis.documentTitleEn;

  const badgeText =
    selectedLang === 'pa'
      ? analysis.badgePa
      : selectedLang === 'hi'
        ? analysis.badgeHi
        : analysis.badgeEn;

  const ehdeChText =
    selectedLang === 'pa'
      ? analysis.ehdeChKiLikheyaPa
      : selectedLang === 'hi'
        ? analysis.ehdeChKiLikheyaHi
        : analysis.ehdeChKiLikheyaEn;

  const aggeKiSteps =
    selectedLang === 'pa'
      ? analysis.aggeKiKarnaPa
      : selectedLang === 'hi'
        ? analysis.aggeKiKarnaHi
        : analysis.aggeKiKarnaEn;

  const sewaTipText =
    selectedLang === 'pa'
      ? analysis.sewaKendraTipPa
      : selectedLang === 'hi'
        ? analysis.sewaKendraTipHi
        : analysis.sewaKendraTipEn;

  return (
    <div
      data-testid="photo-jawab-modal"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-0 sm:my-6 max-h-[95dvh] flex flex-col">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-blue-900 to-teal-900 text-white p-4 sm:p-6 shrink-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shrink-0">
                <Camera className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-300/30 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-200 mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Photo Bhejo, Jawab Pao • ਫ਼ੋਟੋ ਭੇਜੋ, ਜਵਾਬ ਪਾਓ</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  {selectedLang === 'pa'
                    ? 'ਰਾਸ਼ਨ ਕਾਰਡ, ਬਿੱਲ ਜਾਂ ਫਾਰਮ ਦੀ ਫ਼ੋਟੋ ਭੇਜੋ — ਜਨ-ਸਹਾਇਕ ਪੜ੍ਹ ਕੇ ਦੱਸੇਗਾ!'
                    : selectedLang === 'hi'
                      ? 'राशन कार्ड, बिल या फॉर्म की फोटो भेजें — जन-सहायक पढ़कर बताएगा!'
                      : 'Send Photo of Ration Card, Bill, or Form — Jan-Shayak Reads & Explains!'}
                </h2>
                <p className="text-xs text-teal-100 mt-0.5">
                  {selectedLang === 'pa'
                    ? '"ਇਹਦੇ ਵਿੱਚ ਕੀ ਲਿਖਿਆ ਆ, ਅਤੇ ਅੱਗੇ ਕੀ ਕਰਨਾ ਆ" — ਸਰਲ ਪੰਜਾਬੀ, ਹਿੰਦੀ ਅਤੇ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਆਵਾਜ਼ ਸਮੇਤ'
                    : selectedLang === 'hi'
                      ? '"इसमें क्या लिखा है, और आगे क्या करना है" — सरल भाषा और आवाज़ के साथ'
                      : '"Ehde ch ki likheya aa, agge ki karna aa" — Simple explanation + step-by-step next actions'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Toggle inside Modal */}
              <div className="inline-flex rounded-xl bg-slate-950/60 p-1 border border-white/15 text-xs">
                {(['pa', 'hi', 'en'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSelectedLang(lang)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      selectedLang === lang
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-200 hover:text-white'
                    }`}
                  >
                    {lang === 'pa' ? 'ਪੰਜਾਬੀ' : lang === 'hi' ? 'हिंदी' : 'EN'}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  onClose();
                }}
                className="text-slate-300 hover:text-white bg-white/10 p-2 rounded-xl transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Upload / Camera Bar + 4 Instant Sample Photos */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-amber-300 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>
                    {selectedLang === 'pa'
                      ? '1. ਆਪਣੇ ਕੈਮਰੇ ਤੋਂ ਫ਼ੋਟੋ ਖਿੱਚੋ ਜਾਂ ਹੇਠਾਂ ਦਿੱਤੇ ਨਮੂਨੇ (Ration Card / Bill / Form) ਤੇ ਕਲਿੱਕ ਕਰੋ:'
                      : selectedLang === 'hi'
                        ? '1. कैमरे से फोटो अपलोड करें या नीचे दिए गए नमूने (Ration Card / Bill / Form) पर क्लिक करें:'
                        : '1. Upload Photo from Phone/Camera or Try a Sample Ration Card, Bill, or Form:'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Supports Ration Card, Electricity Bill (PSPCL), Sewa Kendra Application Form, or Income/Caste Certificate.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  data-testid="photo-jawab-file-input"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  data-testid="photo-jawab-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 shadow-sm transition cursor-pointer w-full sm:w-auto"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>
                    {selectedLang === 'pa'
                      ? '📸 ਫ਼ੋਟੋ ਭੇਜੋ (Upload / Camera)'
                      : selectedLang === 'hi'
                        ? '📸 फोटो भेजें (Upload / Camera)'
                        : '📸 Upload / Snap Photo'}
                  </span>
                </button>
              </div>
            </div>

            {/* 4 Instant Preset Buttons: Ration Card, Electricity Bill, Form, Certificate */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SAMPLE_PHOTO_JAWAB_PRESETS.map((preset) => {
                const isSelected = activePresetKey === preset.key;
                const label =
                  selectedLang === 'pa'
                    ? preset.shortLabelPa
                    : selectedLang === 'hi'
                      ? preset.shortLabelHi
                      : preset.shortLabelEn;
                const sub =
                  selectedLang === 'pa'
                    ? preset.subtitlePa
                    : selectedLang === 'hi'
                      ? preset.subtitleHi
                      : preset.subtitleEn;

                return (
                  <button
                    key={preset.key}
                    type="button"
                    data-testid={`photo-jawab-preset-${preset.key}`}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-teal-500/20 border-teal-400 ring-2 ring-teal-400/30'
                        : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-lg">{preset.emoji}</span>
                      {isSelected && (
                        <span className="text-[10px] font-extrabold bg-teal-400 text-slate-950 px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-extrabold text-white">{label}</div>
                      <div className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">{sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Optional custom text / note input */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                data-testid="photo-jawab-note-input"
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder={
                  selectedLang === 'pa'
                    ? 'ਫ਼ੋਟੋ ਬਾਰੇ ਕੋਈ ਸਵਾਲ ਜਾਂ ਲਿਖਤ ਇੱਥੇ ਪਾਓ (ਜਿਵੇਂ: ਰਾਸ਼ਨ ਕਾਰਡ e-KYC, 300 ਯੂਨਿਟ ਬਿੱਲ, ਪੈਨਸ਼ਨ ਫਾਰਮ)...'
                    : selectedLang === 'hi'
                      ? 'फोटो के बारे में कोई सवाल यहाँ लिखें (जैसे: राशन कार्ड, बिजली बिल, फॉर्म)...'
                      : 'Optional: Type any text printed on your photo or ask a question (e.g., Ration Card e-KYC, Bijli Bill)...'
                }
                className="flex-1 rounded-xl bg-slate-950/90 border border-slate-700 px-3.5 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="button"
                data-testid="photo-jawab-analyze-btn"
                onClick={() =>
                  void runPhotoJawabAnalysis({
                    presetKey: activePresetKey === 'custom' ? undefined : activePresetKey,
                    fileName: uploadedFileName,
                    rawText: userNote,
                  })
                }
                className="rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs px-4 py-2 transition cursor-pointer shrink-0"
              >
                {selectedLang === 'pa' ? 'ਜਵਾਬ ਪਾਓ (Read Photo)' : selectedLang === 'hi' ? 'जवाब पाएं' : 'Read & Explain'}
              </button>
            </div>
          </div>

          {/* Photo Preview + Voice Read-Aloud Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="lg:col-span-5">
              <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-white shadow-xs">
                <img
                  src={previewImageUrl}
                  alt={uploadedFileName}
                  className="w-full h-44 object-contain bg-slate-100"
                />
                <div className="bg-slate-900/90 text-white px-3 py-1.5 text-[11px] font-semibold flex items-center justify-between">
                  <span className="truncate">{uploadedFileName}</span>
                  <span className="text-emerald-300 font-bold shrink-0 ml-2">
                    {analysis.confidenceScore}% Read
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 text-xs font-extrabold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{badgeText}</span>
                </span>

                <button
                  type="button"
                  data-testid="photo-jawab-speak-btn"
                  onClick={() => handleSpeakAnalysis(analysis, selectedLang)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition cursor-pointer shadow-xs ${
                    isSpeaking
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-blue-700 hover:bg-blue-800 text-white'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>{selectedLang === 'pa' ? 'ਆਵਾਜ਼ ਰੋਕੋ' : selectedLang === 'hi' ? 'आवाज़ रोकें' : 'Stop Audio'}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>
                        {selectedLang === 'pa'
                          ? '🔊 ਬੋਲ ਕੇ ਸੁਣਾਓ (Listen in Punjabi)'
                          : selectedLang === 'hi'
                            ? '🔊 बोल कर सुनाएं (Listen in Hindi)'
                            : '🔊 Listen Aloud (Voice Explanation)'}
                      </span>
                    </>
                  )}
                </button>
              </div>

              <h3
                data-testid="photo-jawab-detected-title"
                className="text-base sm:text-lg font-black text-slate-900 dark:text-white"
              >
                {docTitle}
              </h3>

              {/* Extracted Key Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {analysis.keyFields.map((field, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {selectedLang === 'pa'
                        ? field.labelPa
                        : selectedLang === 'hi'
                          ? field.labelHi
                          : field.labelEn}
                    </div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {isAnalyzing ? (
            <div className="p-8 rounded-2xl border border-teal-200 bg-teal-50/60 text-center space-y-2">
              <div className="w-6 h-6 rounded-full border-2 border-teal-600 border-t-transparent animate-spin mx-auto" />
              <p className="text-sm font-bold text-teal-900">
                {selectedLang === 'pa'
                  ? 'ਜਨ-ਸਹਾਇਕ ਤੁਹਾਡੀ ਫ਼ੋਟੋ ਪੜ੍ਹ ਰਿਹਾ ਹੈ...'
                  : selectedLang === 'hi'
                    ? 'जन-सहायक आपकी फोटो पढ़ रहा है...'
                    : 'Jan-Shayak is reading your photo...'}
              </p>
            </div>
          ) : (
            /* CORE 2-COLUMN ANSWER: 1. Ehde ch ki likheya aa | 2. Agge ki karna aa */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Ehde ch ki likheya aa */}
              <div
                data-testid="photo-jawab-ehde-ch-card"
                className="rounded-2xl bg-blue-50/90 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-800 p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-700 text-white font-black text-sm flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-blue-950 dark:text-blue-200">
                      {selectedLang === 'pa'
                        ? '📋 ਇਹਦੇ ਵਿੱਚ ਕੀ ਲਿਖਿਆ ਆ (Ehde ch ki likheya aa)'
                        : selectedLang === 'hi'
                          ? '📋 इसमें क्या लिखा है (Ehde ch ki likheya aa)'
                          : '📋 Ehde ch ki likheya aa (What is written in this)'}
                    </h4>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold">
                      {selectedLang === 'pa'
                        ? 'ਫ਼ੋਟੋ ਦਾ ਸਿੱਧਾ ਅਤੇ ਸਰਲ ਮਤਲਬ'
                        : selectedLang === 'hi'
                          ? 'फोटो का सीधा और सरल मतलब'
                          : 'Plain-language summary of your document/photo'}
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line font-medium bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-blue-200/80">
                  {ehdeChText}
                </p>

                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-950">
                  <strong className="font-extrabold block mb-0.5">
                    {selectedLang === 'pa'
                      ? '🏛️ ਸੇਵਾ ਕੇਂਦਰ / ਸਰਕਾਰੀ ਸਲਾਹ:'
                      : selectedLang === 'hi'
                        ? '🏛️ सेवा केंद्र / सरकारी सलाह:'
                        : '🏛️ Official Sewa Kendra Tip:'}
                  </strong>
                  <span>{sewaTipText}</span>
                </div>
              </div>

              {/* Card 2: Agge ki karna aa */}
              <div
                data-testid="photo-jawab-agge-ki-card"
                className="rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800 p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-emerald-950 dark:text-emerald-200">
                      {selectedLang === 'pa'
                        ? '👉 ਅੱਗੇ ਕੀ ਕਰਨਾ ਆ (Agge ki karna aa)'
                        : selectedLang === 'hi'
                          ? '👉 आगे क्या करना है (Agge ki karna aa)'
                          : '👉 Agge ki karna aa (What to do next)'}
                    </h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
                      {selectedLang === 'pa'
                        ? 'ਕਦਮ-ਦਰ-ਕਦਮ ਅਗਲੀ ਕਾਰਵਾਈ'
                        : selectedLang === 'hi'
                          ? 'कदम-दर-कदम अगली कार्रवाई'
                          : 'Step-by-step action checklist for you'}
                    </p>
                  </div>
                </div>

                <ol className="space-y-2.5">
                  {aggeKiSteps.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 bg-white/90 dark:bg-slate-900/90 p-3 rounded-xl border border-emerald-200/80 text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-medium"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Linked / Unlocked Government Schemes */}
          {analysis.unlockedSchemeIds.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>
                  {selectedLang === 'pa'
                    ? 'ਇਸ ਕਾਗਜ਼ ਨਾਲ ਮਿਲਣ ਵਾਲੀਆਂ ਸਰਕਾਰੀ ਸਕੀਮਾਂ:'
                    : selectedLang === 'hi'
                      ? 'इस दस्तावेज़ से मिलने वाली सरकारी योजनाएं:'
                      : 'Government Schemes Linked to This Document:'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {analysis.unlockedSchemeIds.map((id) => {
                  const scheme =
                    schemes.find((s) => s.id === id) || GOV_SCHEMES.find((s) => s.id === id);
                  if (!scheme) return null;
                  const title =
                    selectedLang === 'pa'
                      ? scheme.titlePa
                      : selectedLang === 'hi'
                        ? scheme.titleHi
                        : scheme.titleEn;

                  return (
                    <button
                      key={scheme.id}
                      type="button"
                      onClick={() => {
                        stopSpeaking();
                        if (onOpenSchemeModal) {
                          onClose();
                          onOpenSchemeModal(scheme);
                        }
                      }}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 hover:border-blue-400 text-left flex items-center justify-between gap-2 shadow-2xs transition cursor-pointer group"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-700 truncate">
                          {title}
                        </div>
                        <div className="text-[11px] font-semibold text-teal-700 mt-0.5 truncate">
                          {scheme.benefitAmountText}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
            <span>
              {selectedLang === 'pa'
                ? 'ਤੁਹਾਡੀ ਫ਼ੋਟੋ ਸੁਰੱਖਿਅਤ ਹੈ • ਟੋਲ-ਫ੍ਰੀ ਸੇਵਾ ਕੇਂਦਰ ਮਦਦ: 1100'
                : 'DPDP Privacy Protected • Official Sewa Kendra Helpline: 1100'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenChatWithQuestion && (
              <button
                type="button"
                data-testid="photo-jawab-ask-chat-btn"
                onClick={() => {
                  stopSpeaking();
                  onClose();
                  onOpenChatWithQuestion(
                    selectedLang === 'pa'
                      ? `ਮੇਰੇ ਕੋਲ ${analysis.documentTitlePa} ਹੈ — ਇਹਦੇ ਵਿੱਚ ਕੀ ਲਿਖਿਆ ਆ ਅਤੇ ਅੱਗੇ ਕੀ ਕਰਨਾ ਆ?`
                      : `Explain my ${analysis.documentTitleEn} — Ehde ch ki likheya aa, agge ki karna aa?`
                  );
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-2.5 transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>
                  {selectedLang === 'pa'
                    ? 'ਜਨ-ਸਹਾਇਕ ਚੈਟ ਵਿੱਚ ਪੁੱਛੋ'
                    : selectedLang === 'hi'
                      ? 'जन-सहायक चैट में पूछें'
                      : 'Continue in Jan-Shayak Chat'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 transition cursor-pointer"
            >
              {selectedLang === 'pa' ? 'ਬੰਦ ਕਰੋ (Done)' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
