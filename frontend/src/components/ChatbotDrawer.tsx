import React, { useState, useEffect, useRef } from 'react';
import { Language, CitizenProfile, Scheme } from '../types/scheme';
import type { AssistantAppAction } from '../../../shared/types/backend';
import { TRANSLATIONS } from '../data/translations';
import { GOV_SCHEMES } from '../data/schemes';
import { buildAiKnowledgeSummary } from '../utils/adminSchemeManager';
import { generateOfflineChatReply } from '../utils/offlineCache';
import { INDIAN_22_LANGUAGES, getIndianLanguageConfig } from '../utils/indianLanguages';
import { apiUrl } from '../lib/apiUrl';
import {
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  ShieldCheck,
  ArrowRight,
  Radio,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedSchemeIds?: string[];
  isAiGrounded?: boolean;
  officialSources?: Array<{ title: string; url: string }>;
}

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  userProfile: CitizenProfile;
  schemes?: Scheme[];
  initialQuestion: string;
  onInitialQuestionHandled: () => void;
  onAppAction: (action: AssistantAppAction) => void;
  onOpenSchemeModal: (scheme: Scheme) => void;
}

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  isOpen,
  onClose,
  currentLang,
  userProfile,
  schemes = GOV_SCHEMES,
  initialQuestion,
  onInitialQuestionHandled,
  onAppAction,
  onOpenSchemeModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const [assistantLang, setAssistantLang] = useState<Language>(currentLang || 'pa');
  const [voiceLanguage, setVoiceLanguage] = useState<string>(
    currentLang === 'pa' ? 'pa-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-IN'
  );
  // Auto-speak responses after AI finishes answering
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState<boolean>(true);
  // Citizen Consent Checkbox state — enabled by default so live 22-language AI works out of the box
  const [hasConsent, setHasConsent] = useState<boolean>(true);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fallbackIndexRef = useRef<number>(0);

  const t = TRANSLATIONS[assistantLang];
  const activeLangConfig = getIndianLanguageConfig(voiceLanguage);

  // Load and track browser SpeechSynthesis voices across mobile & desktop
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);
      }
    };
    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices);
    };
  }, []);

  // Sync initial language when top-level app language changes (unless user already picked a specific 22-language option while open)
  useEffect(() => {
    const mapped = currentLang === 'pa' ? 'pa-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-IN';
    setAssistantLang(currentLang);
    setVoiceLanguage((prev) => {
      const prevPrefix = prev.split('-')[0];
      if (['pa', 'hi', 'en'].includes(prevPrefix)) {
        return mapped;
      }
      return prev;
    });
  }, [currentLang]);

  useEffect(() => {
    if (!isOpen || !initialQuestion) return;
    setInputText(initialQuestion);
    onInitialQuestionHandled();
  }, [isOpen, initialQuestion, onInitialQuestionHandled]);

  // Keep welcome message synchronized with any of the 22 selected Indian languages
  useEffect(() => {
    const langCfg = getIndianLanguageConfig(voiceLanguage);
    setMessages((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: 'welcome',
            sender: 'assistant',
            text: langCfg.welcomeGreeting,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            recommendedSchemeIds: ['pm-kisan', 'sarbat-sehat-bima', 'post-matric-sc'],
            isAiGrounded: true,
          },
        ];
      }
      // Update the welcome message in-place when user switches language
      return prev.map((m) => (m.id === 'welcome' ? { ...m, text: langCfg.welcomeGreeting } : m));
    });
  }, [voiceLanguage]);

  // Scroll chat container to bottom on new message
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading, liveTranscript]);

  // Multi-tier voice synthesis for all 22 Indian languages
  const handleSpeak = (msgId: string, text: string, localeToUse = voiceLanguage) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting, brackets, URLs, and emojis that clutter TTS
    const cleanText = text
      .replace(/[*#_`\[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[📶🔒✅⚠️🎙️]/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanText) return;

    const langCfg = getIndianLanguageConfig(localeToUse);
    const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    let selectedVoice: SpeechSynthesisVoice | undefined;

    // 1. Try each locale in langCfg.ttsVoiceFallbacks in priority order
    for (const candidateLocale of langCfg.ttsVoiceFallbacks) {
      const lowerCandidate = candidateLocale.toLowerCase();
      const prefix = lowerCandidate.split(/[-_]/)[0];
      selectedVoice =
        voices.find((v) => v.lang.toLowerCase() === lowerCandidate) ||
        voices.find((v) => v.lang.toLowerCase().replace('_', '-') === lowerCandidate) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(`${prefix}-`)) ||
        voices.find((v) => v.lang.toLowerCase() === prefix);
      if (selectedVoice) break;
    }

    // 2. Fallback to any Indian English / Hindi voice or system default voice so audio always plays
    if (!selectedVoice && voices.length > 0) {
      selectedVoice =
        voices.find((v) => v.lang.toLowerCase().includes('in')) ||
        voices.find((v) => v.default) ||
        voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      // Align utterance.lang with the chosen voice so mobile/desktop engines never reject unknown BCP-47 tags
      utterance.lang = selectedVoice.lang || langCfg.ttsVoiceFallbacks[0] || 'en-IN';
    } else {
      utterance.lang = langCfg.ttsVoiceFallbacks[0] || localeToUse;
    }

    utterance.rate = 0.92;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Speech recognition setup with automatic fallback across the 22 Indian languages
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const langCfg = getIndianLanguageConfig(voiceLanguage);
    fallbackIndexRef.current = 0;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = langCfg.speechRecognitionFallbacks[0] || voiceLanguage;

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError(null);
      setLiveTranscript('');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const currentText = final || interim;
      setLiveTranscript(currentText);

      if (final) {
        setInputText(final);
        setIsListening(false);
        setLiveTranscript('');
        void handleSend(final, voiceLanguage);
      }
    };

    recognition.onerror = (event: any) => {
      // If browser does not support a regional BCP-47 code (e.g., doi-IN or sat-IN), seamlessly retry with fallback locale
      if (
        (event.error === 'language-not-supported' || event.error === 'bad-grammar') &&
        fallbackIndexRef.current + 1 < langCfg.speechRecognitionFallbacks.length
      ) {
        fallbackIndexRef.current += 1;
        const nextLocale = langCfg.speechRecognitionFallbacks[fallbackIndexRef.current];
        try {
          recognition.lang = nextLocale;
          recognition.start();
          return;
        } catch {
          // ignore restart error
        }
      }

      setIsListening(false);
      setLiveTranscript('');
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setSpeechError(`Voice input notice (${langCfg.nameEn}): ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [voiceLanguage]);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError(t.speechNotSupported);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      setLiveTranscript('');
    } else {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          setSpeakingMessageId(null);
        }
        if (recognitionRef.current) {
          fallbackIndexRef.current = 0;
          recognitionRef.current.lang = activeLangConfig.speechRecognitionFallbacks[0] || voiceLanguage;
          recognitionRef.current.start();
        }
      } catch (err) {
        console.error('Error starting speech recognition:', err);
      }
    }
  };

  const handleSend = async (textToSend?: string, explicitLocale?: string) => {
    const query = (textToSend ?? inputText).trim();
    if (!query || isLoading) return;

    const targetLocale = explicitLocale || voiceLanguage;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLiveTranscript('');
    setIsLoading(true);

    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Offline mode active');
      }
      const response = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: targetLocale,
          userProfile,
          knowledgeBase: buildAiKnowledgeSummary(schemes),
          consentGiven: hasConsent,
          conversationHistory: messages.slice(-4).map((m) => ({ role: m.sender, content: m.text })),
        }),
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      const data = await response.json();
      if (typeof data.reply !== 'string' || !data.reply.trim()) {
        throw new Error(typeof data.error === 'string' ? data.error : 'The assistant returned an empty response.');
      }
      if (data.action) {
        const action = data.action as AssistantAppAction;
        if (
          action.type === 'search' &&
          typeof action.query === 'string' &&
          action.query.trim().length > 0 &&
          action.query.length <= 120
        ) {
          onAppAction({ type: 'search', query: action.query.trim() });
        } else if (action.type === 'navigate') {
          const allowedTabs = new Set([
            'dashboard',
            'profile',
            'wizard',
            'saved',
            'insights',
            'family',
            'video-guides',
            'scanner',
            'whatif',
            'districts',
            'deadlines',
            'tracker',
          ]);
          if (allowedTabs.has(action.tab)) onAppAction(action);
        } else if (
          action.type === 'filter' &&
          ['all', 'Agriculture', 'Health', 'Education', 'Finance'].includes(action.category)
        ) {
          onAppAction(action);
        }
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedSchemeIds: data.recommendedSchemeIds || [],
        officialSources: data.officialSources || [],
        isAiGrounded: data.isAiGrounded === true,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (autoSpeakEnabled) {
        window.setTimeout(() => {
          handleSpeak(assistantMsg.id, assistantMsg.text, targetLocale);
        }, 200);
      }
    } catch (err) {
      console.info('Using local 22-language scheme assistant:', err);
      const offlineResult = generateOfflineChatReply(query, targetLocale, userProfile, schemes);
      const fallbackMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: offlineResult.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedSchemeIds: offlineResult.recommendedSchemeIds,
        isAiGrounded: offlineResult.isAiGrounded,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (autoSpeakEnabled) {
        window.setTimeout(() => {
          handleSpeak(fallbackMsg.id, fallbackMsg.text, targetLocale);
        }, 200);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageSelectChange = (locale: string) => {
    setVoiceLanguage(locale);
    const nextCfg = getIndianLanguageConfig(locale);
    if (nextCfg.prefix === 'pa' || nextCfg.prefix === 'hi' || nextCfg.prefix === 'en') {
      setAssistantLang(nextCfg.prefix as Language);
    } else if (nextCfg.scriptFamily === 'devanagari') {
      setAssistantLang('hi');
    } else {
      setAssistantLang('en');
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    setSpeechError(null);

    // If user already had conversation messages, add a localized language-switch greeting
    setMessages((prev) => {
      const updated = prev.map((m) => (m.id === 'welcome' ? { ...m, text: nextCfg.welcomeGreeting } : m));
      if (updated.length > 1) {
        return [
          ...updated,
          {
            id: `lang-switch-${Date.now()}`,
            sender: 'assistant',
            text: nextCfg.welcomeGreeting,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            recommendedSchemeIds: ['pm-kisan', 'sarbat-sehat-bima', 'post-matric-sc'],
            isAiGrounded: true,
          },
        ];
      }
      return updated;
    });

    if (autoSpeakEnabled) {
      window.setTimeout(() => {
        handleSpeak('welcome', nextCfg.welcomeGreeting, locale);
      }, 150);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Top Header */}
      <div className="bg-slate-900 bg-linear-to-r bg-gradient-to-r from-blue-900 via-indigo-950 to-teal-900 text-white p-3.5 sm:p-4 shadow-md shrink-0">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-teal-400/20 border border-teal-300/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-teal-300" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-1.5 truncate">
                <span className="truncate">{activeLangConfig.headerTitle}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
              </h3>
              <span className="text-[11px] text-teal-200 font-medium flex items-center gap-1">
                <Radio className="w-3 h-3 text-teal-400 animate-pulse shrink-0" />
                <span className="truncate">
                  {activeLangConfig.nativeLabel} · 22 Indian Languages Active
                </span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Close assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Voice Assistant Controls: 22-Language switcher and Auto-Speak switch */}
        <div className="flex items-center justify-between pt-2 border-t border-white/15 gap-2 text-xs">
          <div className="flex min-w-0 items-center gap-2 flex-1">
            <label htmlFor="assistant-language" className="shrink-0 text-[10px] font-semibold text-slate-200">
              22 Languages:
            </label>
            <select
              id="assistant-language"
              data-testid="voice-language-select"
              value={voiceLanguage}
              onChange={(event) => handleLanguageSelectChange(event.target.value)}
              className="min-w-0 flex-1 max-w-48 rounded-lg border border-white/20 bg-slate-950/70 px-2.5 py-1.5 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-teal-300 cursor-pointer"
            >
              {INDIAN_22_LANGUAGES.map((language) => (
                <option key={language.code} value={language.code} className="bg-white text-slate-900">
                  {language.nativeLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Auto-Speak Answers Toggle */}
          <button
            type="button"
            onClick={() => {
              setAutoSpeakEnabled(!autoSpeakEnabled);
              if (autoSpeakEnabled && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                setSpeakingMessageId(null);
              }
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold border transition-all cursor-pointer shrink-0 ${
              autoSpeakEnabled
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                : 'bg-white/5 text-slate-300 border-white/10'
            }`}
            title="Automatically read aloud replies"
          >
            {autoSpeakEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Auto-Speak: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span>Auto-Speak: OFF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Voice Active Waveform Visualizer Banner */}
      {isListening && (
        <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white p-3.5 flex flex-col gap-2 shadow-inner animate-in slide-in-from-top duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
              </span>
              <span className="font-bold text-xs">{activeLangConfig.listeningBanner}</span>
            </div>

            <div className="flex items-center gap-0.5 h-4">
              <span className="w-1 bg-white rounded-full h-2 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 bg-white rounded-full h-4 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 bg-white rounded-full h-3 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="w-1 bg-white rounded-full h-5 animate-bounce" style={{ animationDelay: '75ms' }} />
              <span className="w-1 bg-white rounded-full h-2 animate-bounce" style={{ animationDelay: '200ms' }} />
            </div>
          </div>

          <div className="bg-black/20 rounded-lg p-2 text-xs font-medium text-teal-50 min-h-[32px] flex items-center justify-between">
            <span>{liveTranscript || activeLangConfig.inputPlaceholder}</span>

            <button
              type="button"
              onClick={() => toggleListening()}
              className="text-[10px] font-bold bg-white text-teal-800 px-2 py-0.5 rounded-sm hover:bg-teal-50 ml-2 shrink-0 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Speech error indicator */}
      {speechError && (
        <div className="bg-amber-100 text-amber-900 text-xs px-3 py-1.5 flex items-center justify-between border-b border-amber-200">
          <span>{speechError}</span>
          <button onClick={() => setSpeechError(null)} className="font-bold ml-2 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Chat Messages List */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm bg-slate-50/70">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSpeaking = speakingMessageId === msg.id;

          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 shadow-xs whitespace-pre-wrap leading-relaxed ${
                  isUser
                    ? 'bg-blue-700 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-none'
                }`}
              >
                {!isUser && (
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100 text-[10px] font-bold text-teal-800">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-emerald-800">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        {activeLangConfig.template.verifiedBadge}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-amber-900">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                        {activeLangConfig.template.aiGuidanceBadge}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSpeak(msg.id, msg.text, voiceLanguage)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                        isSpeaking
                          ? 'bg-rose-100 text-rose-700 animate-pulse'
                          : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                      title={isSpeaking ? 'Stop voice playback' : `Read aloud in ${activeLangConfig.nameEn}`}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3 h-3 text-rose-600" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>{activeLangConfig.listenButtonLabel}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="text-xs sm:text-sm leading-relaxed">{msg.text}</div>

                {!isUser && msg.officialSources && msg.officialSources.length > 0 && (
                  <div className="mt-2 border-t border-slate-100 pt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Official websites
                    </span>
                    <div className="mt-1 flex flex-col gap-1">
                      {msg.officialSources.map((source) => (
                        <a
                          key={source.url}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-700 hover:text-blue-900 underline"
                        >
                          {source.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`text-[10px] mt-1.5 text-right ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {/* Recommended Scheme Cards embedded inside message */}
              {msg.recommendedSchemeIds && msg.recommendedSchemeIds.length > 0 && (
                <div className="mt-2 space-y-1.5 w-full max-w-[88%]">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {activeLangConfig.template.recommendedHeading}
                  </span>
                  {msg.recommendedSchemeIds.map((schemeId) => {
                    const scheme =
                      schemes.find((s) => s.id === schemeId) || GOV_SCHEMES.find((s) => s.id === schemeId);
                    if (!scheme) return null;
                    const usePunjabi = activeLangConfig.prefix === 'pa';
                    const useDevanagari = activeLangConfig.scriptFamily === 'devanagari';
                    const schemeTitle = usePunjabi
                      ? scheme.titlePa
                      : useDevanagari
                      ? scheme.titleHi
                      : scheme.titleEn;

                    return (
                      <div
                        key={scheme.id}
                        onClick={() => onOpenSchemeModal(scheme)}
                        className="bg-white p-2.5 rounded-xl border border-blue-200 hover:border-blue-400 cursor-pointer shadow-xs transition-all flex items-center justify-between gap-2 group"
                      >
                        <div>
                          <div className="font-bold text-xs text-blue-900 group-hover:text-blue-700">
                            {schemeTitle}
                          </div>
                          <div className="text-[10px] text-teal-700 font-semibold mt-0.5">
                            {scheme.benefitAmountText}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-3 rounded-2xl border border-slate-200 w-fit shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-ping" />
            <span>
              {activeLangConfig.prefix === 'pa'
                ? 'ਪੰਜਾਬ ਸਰਕਾਰ ਦੇ ਗਜ਼ਟ ਅਤੇ ਨਿਯਮਾਂ ਦੀ ਪੁਸ਼ਟੀ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...'
                : `Generating verified response in ${activeLangConfig.nativeLabel}...`}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Voice Queries Carousel in Selected Language (All 22 Languages Supported) */}
      <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Mic className="w-3 h-3 text-teal-600" />
            {activeLangConfig.suggestedPromptsLabel}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Click or Speak</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {activeLangConfig.suggestedPrompts.map((prompt, idx) => (
            <button
              key={`${voiceLanguage}-${idx}`}
              type="button"
              data-testid={`voice-suggested-prompt-${idx}`}
              onClick={() => void handleSend(prompt, voiceLanguage)}
              className="bg-white text-slate-700 hover:text-blue-700 hover:border-blue-300 border border-slate-200 px-2.5 py-1 rounded-lg whitespace-nowrap text-[11px] font-medium transition-colors shrink-0 shadow-2xs cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Citizen Privacy & Consent Bar (DPDP Act Compliance) */}
      <div className="px-3.5 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hasConsent}
            onChange={(e) => setHasConsent(e.target.checked)}
            className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-[10px] sm:text-[11px]">
            {assistantLang === 'pa'
              ? 'ਮੈਂ ਇਹ ਗੱਲਬਾਤ ਅਤੇ ਚੋਣਵਾਂ ਪ੍ਰੋਫਾਈਲ ਲਾਈਵ AI ਸੇਵਾਵਾਂ ਨੂੰ ਭੇਜਣ ਲਈ ਸਹਿਮਤ ਹਾਂ।'
              : assistantLang === 'hi'
              ? 'मैं यह बातचीत और वैकल्पिक प्रोफ़ाइल लाइव AI सेवाओं को भेजने के लिए सहमत हूँ।'
              : 'Enable Live 22-Language AI & Search grounding (DPDP Consent).'}
          </span>
        </label>
        <span className="text-[9px] sm:text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 shrink-0">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>DPDP Act</span>
        </span>
      </div>

      {/* Input Box Footer with Voice Mic Button */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Main Voice Mic Button with Localized Label */}
          <button
            type="button"
            data-testid="voice-mic-btn"
            onClick={() => toggleListening()}
            className={`p-2.5 sm:px-3 sm:py-2.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white border-rose-600 animate-pulse shadow-md shadow-rose-500/20'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200 shadow-xs'
            }`}
            title={`Click to speak in ${activeLangConfig.nativeLabel}`}
            aria-label="Voice input"
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 text-white" />
                <span className="text-xs font-bold">Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-teal-700 animate-pulse" />
                <span className="text-xs font-bold">{activeLangConfig.speakButtonLabel}</span>
              </>
            )}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={activeLangConfig.inputPlaceholder}
            className="flex-1 min-w-0 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
