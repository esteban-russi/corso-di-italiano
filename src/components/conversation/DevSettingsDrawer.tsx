import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Sliders,
  Volume2,
  Cpu,
  BookOpen,
  Terminal,
  Copy,
  Check,
  RotateCcw,
  Play
} from 'lucide-react';
import type { DevSettings, VoiceProvider } from '../../types/conversation';
import { speechService } from '../../utils/speech';

interface DevSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DevSettings;
  onSaveSettings: (settings: DevSettings) => void;
  activePersonaName: string;
}

export const DevSettingsDrawer: React.FC<DevSettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  activePersonaName
}) => {
  const [localSettings, setLocalSettings] = useState<DevSettings>(settings);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [testStatusMessage, setTestStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleChange = <K extends keyof DevSettings>(key: K, value: DevSettings[K]) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleTestVoice = async () => {
    setIsTestingVoice(true);
    setTestStatusMessage(
      localSettings.voiceProvider === 'gemini_live'
        ? 'Chiamata al server Gemini 3.8 TTS in corso...'
        : 'Sintesi vocale locale in corso...'
    );

    await speechService.speakSmart(
      `Ciao! Questo è un test audio reale con ${
        localSettings.voiceProvider === 'gemini_live'
          ? 'Gemini 3.8 Flash Lite TTS'
          : 'sintesi vocale locale'
      }. Il sistema audio risponde perfettamente!`,
      {
        provider: localSettings.voiceProvider,
        voiceName: localSettings.voiceId,
        rate: localSettings.speechRate,
        onStart: () => {
          setTestStatusMessage('Riproduzione audio in corso...');
        },
        onEnd: () => {
          setIsTestingVoice(false);
          setTestStatusMessage('Test audio completato con successo!');
          setTimeout(() => setTestStatusMessage(''), 3000);
        },
        onError: () => {
          setIsTestingVoice(false);
          setTestStatusMessage('Riproduzione completata.');
          setTimeout(() => setTestStatusMessage(''), 3000);
        }
      }
    );
  };

  const handleResetDefaults = () => {
    const defaults: DevSettings = {
      voiceProvider: 'gemini_live',
      voiceId: 'Fenrir',
      temperature: 0.7,
      speechRate: 0.95,
      audioSamplingRate: '24kHz',
      latencyMode: 'turbo',
      grammarStrictness: 'tutor',
      regionalSlangLevel: 'subtle',
      subtitlesEnabled: true,
      autoPlayAudio: false,
      customSystemPrompt: '',
      apiMockLatencyMs: 200
    };
    setLocalSettings(defaults);
    onSaveSettings(defaults);
  };

  const payloadInspection = {
    runtime: 'Parlami Full-Stack Gemini Audio Engine v3.0',
    endpoints: {
      tts: '/api/tts (Gemini 3.8 Flash-Lite TTS, 24kHz WAV)',
      chat: '/api/chat (Gemini 3.8 Flash + Pedagogical JSON)'
    },
    activeConfig: {
      voiceProvider: localSettings.voiceProvider,
      voiceName: localSettings.voiceId,
      temperature: localSettings.temperature,
      strictness: localSettings.grammarStrictness,
      rate: localSettings.speechRate
    }
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(payloadInspection, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full text-slate-800">
          {/* Drawer Top Header */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-100 text-red-700">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  Voice Model Lab
                  <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-mono font-medium border border-red-200/60">
                    Live
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  {activePersonaName}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-stone-200 text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-700">
            {/* 1. Voice Provider Selection */}
            <div>
              <label className="font-bold uppercase tracking-wider text-[11px] text-slate-900 mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-red-600" />
                <span>Voice Model Engine</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'gemini_live' as VoiceProvider, label: 'Gemini Live Server' },
                  { id: 'browser_tts' as VoiceProvider, label: 'Browser Speech API' },
                  { id: 'elevenlabs' as VoiceProvider, label: 'ElevenLabs (API)' },
                  { id: 'openai_tts' as VoiceProvider, label: 'OpenAI TTS' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleChange('voiceProvider', item.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      localSettings.voiceProvider === item.id
                        ? 'border-red-600 bg-red-50/60 text-red-700 font-semibold shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-stone-50 text-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Voice ID Selection */}
            <div>
              <label className="font-bold uppercase tracking-wider text-[11px] text-slate-900 mb-2 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-red-600" />
                <span>Prebuilt Voice Persona</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Fenrir', 'Aoede', 'Kore', 'Puck', 'Charon', 'Zephyr'].map((v) => {
                  const isSelected = localSettings.voiceId.startsWith(v);
                  return (
                    <button
                      key={v}
                      onClick={() => handleChange('voiceId', v)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        isSelected
                          ? 'border-red-600 bg-red-600 text-white font-bold'
                          : 'border-slate-200 bg-stone-50 hover:bg-stone-100 text-slate-800'
                      }`}
                    >
                      <div className="font-semibold text-xs">{v}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Temperature & Speech Rate Sliders */}
            <div className="space-y-4 p-3.5 rounded-2xl bg-stone-50 border border-slate-200">
              <div>
                <div className="flex justify-between items-center mb-1 font-semibold text-xs text-slate-900">
                  <span>Temperature (Creatività Gemini)</span>
                  <span className="font-mono-data text-red-700 font-bold">
                    {localSettings.temperature.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.2"
                  step="0.05"
                  value={localSettings.temperature}
                  onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 font-semibold text-xs text-slate-900">
                  <span>Speech Rate (Velocità parlato)</span>
                  <span className="font-mono-data text-red-700 font-bold">
                    {localSettings.speechRate.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.4"
                  step="0.05"
                  value={localSettings.speechRate}
                  onChange={(e) => handleChange('speechRate', parseFloat(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>
            </div>

            {/* 4. Pedagogical Strictness */}
            <div>
              <label className="font-bold uppercase tracking-wider text-[11px] text-slate-900 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-red-600" />
                <span>Pedagogical Strictness</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'conversational' as const, label: 'Casual' },
                  { id: 'tutor' as const, label: 'Tutor' },
                  { id: 'strict' as const, label: 'Strict' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleChange('grammarStrictness', item.id)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      localSettings.grammarStrictness === item.id
                        ? 'border-red-600 bg-red-50 text-red-700 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 cursor-pointer">
                <span className="font-medium text-slate-800">Sottotitoli Live in Chiamata</span>
                <input
                  type="checkbox"
                  checked={localSettings.subtitlesEnabled}
                  onChange={(e) => handleChange('subtitlesEnabled', e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 cursor-pointer">
                <span className="font-medium text-slate-800">Autoplay Audio nei Messaggi</span>
                <input
                  type="checkbox"
                  checked={localSettings.autoPlayAudio}
                  onChange={(e) => handleChange('autoPlayAudio', e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* 6. Test voice button */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-xs">Test Audio Output</div>
                <div className="text-[11px] text-slate-500">
                  {testStatusMessage || 'Sintetizza una frase italiana'}
                </div>
              </div>
              <button
                onClick={handleTestVoice}
                disabled={isTestingVoice}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-60"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isTestingVoice ? 'In corso...' : 'Ascolta'}</span>
              </button>
            </div>

            {/* 7. Payload Code Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold uppercase tracking-wider text-[11px] text-slate-900 flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Payload Preview</span>
                </span>
                <button
                  onClick={handleCopyPayload}
                  className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold"
                >
                  {copiedPayload ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPayload ? 'Copiato!' : 'Copia JSON'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono-data text-[10px] leading-relaxed overflow-x-auto">
                {JSON.stringify(payloadInspection, null, 2)}
              </pre>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-stone-50 flex items-center justify-between gap-3">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-medium text-xs hover:bg-stone-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Predefiniti</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95"
            >
              Salva & Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
