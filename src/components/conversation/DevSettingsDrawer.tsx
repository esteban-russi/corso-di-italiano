import React, { useState } from 'react';
import { useLang } from '../../context/LangContext';
import type { DevSettings, VoiceProvider } from '../../types/conversation';
import { speechService } from '../../utils/speech';
import { btn } from '../../utils';

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
  const { lang } = useLang();
  const [localSettings, setLocalSettings] = useState<DevSettings>(settings);
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
    setTestStatusMessage(lang === 'en' ? 'Synthesizing voice test…' : 'Sintetizando prueba de voz…');

    await speechService.speakSmart(
      `Ciao! Questo è un test audio reale con ${localSettings.voiceProvider === 'gemini_live' ? 'Gemini Flash Live TTS' : 'sintesi vocale locale'}. Tutto funziona perfettamente!`,
      {
        provider: localSettings.voiceProvider,
        voiceName: localSettings.voiceId,
        rate: localSettings.speechRate,
        onStart: () => {
          setTestStatusMessage(lang === 'en' ? 'Playing audio test…' : 'Reproduciendo audio…');
        },
        onEnd: () => {
          setIsTestingVoice(false);
          setTestStatusMessage(lang === 'en' ? 'Audio test completed!' : '¡Prueba completada!');
          setTimeout(() => setTestStatusMessage(''), 2500);
        },
        onError: () => {
          setIsTestingVoice(false);
          setTestStatusMessage(lang === 'en' ? 'Test finished' : 'Prueba finalizada');
          setTimeout(() => setTestStatusMessage(''), 2500);
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'var(--color-scrim)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          height: '100%',
          background: 'var(--color-background-primary)',
          borderLeft: '1px solid var(--color-border-primary)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-background-primary)'
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              🎙️ Voice Lab & AI Models
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              {activePersonaName}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              ...btn(),
              padding: '6px 10px',
              borderRadius: 8,
              fontSize: 13,
              background: 'var(--color-background-secondary)',
              border: '1px solid var(--color-border-tertiary)',
              color: 'var(--color-text-secondary)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Body content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Voice Provider */}
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
              {lang === 'en' ? 'Voice Model Engine' : 'Motor del modelo de voz'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {[
                { id: 'gemini_live' as VoiceProvider, label: 'Gemini Live Server' },
                { id: 'browser_tts' as VoiceProvider, label: 'Browser Web Speech' },
                { id: 'elevenlabs' as VoiceProvider, label: 'ElevenLabs (API)' },
                { id: 'openai_tts' as VoiceProvider, label: 'OpenAI TTS' }
              ].map((provider) => {
                const active = localSettings.voiceProvider === provider.id;
                return (
                  <button
                    key={provider.id}
                    onClick={() => handleChange('voiceProvider', provider.id)}
                    style={{
                      ...btn(active),
                      padding: '8px 10px',
                      borderRadius: 10,
                      fontSize: 11.5,
                      fontWeight: 600,
                      textAlign: 'left',
                      background: active ? 'var(--color-brand-red-subtle)' : 'var(--color-background-secondary)',
                      color: active ? 'var(--color-brand-red)' : 'var(--color-text-primary)',
                      border: `1px solid ${active ? 'var(--color-brand-red-border)' : 'var(--color-border-tertiary)'}`
                    }}
                  >
                    {provider.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice ID */}
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
              {lang === 'en' ? 'Prebuilt Voice Persona' : 'Voz predefinida'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {['Fenrir', 'Aoede', 'Kore', 'Puck', 'Charon', 'Zephyr'].map((v) => {
                const active = localSettings.voiceId.startsWith(v);
                return (
                  <button
                    key={v}
                    onClick={() => handleChange('voiceId', v)}
                    style={{
                      ...btn(active),
                      padding: '6px 8px',
                      borderRadius: 8,
                      fontSize: 11.5,
                      fontWeight: 600,
                      background: active ? 'var(--color-brand-red)' : 'var(--color-background-secondary)',
                      color: active ? 'var(--color-on-primary)' : 'var(--color-text-primary)',
                      border: `1px solid ${active ? 'var(--color-brand-red)' : 'var(--color-border-tertiary)'}`
                    }}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders: Temperature & Speech Rate */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                <span>{lang === 'en' ? 'Temperature' : 'Temperatura'}</span>
                <span>{localSettings.temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.2"
                step="0.05"
                value={localSettings.temperature}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-brand-red)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                <span>{lang === 'en' ? 'Speech Rate' : 'Velocidad'}</span>
                <span>{localSettings.speechRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.4"
                step="0.05"
                value={localSettings.speechRate}
                onChange={(e) => handleChange('speechRate', parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-brand-red)' }}
              />
            </div>
          </div>

          {/* Grammar Strictness */}
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
              {lang === 'en' ? 'Pedagogical Strictness' : 'Rigor pedagógico'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {[
                { id: 'conversational' as const, label: lang === 'en' ? 'Casual' : 'Casual' },
                { id: 'tutor' as const, label: lang === 'en' ? 'Tutor' : 'Tutor' },
                { id: 'strict' as const, label: lang === 'en' ? 'Strict' : 'Estricto' }
              ].map((item) => {
                const active = localSettings.grammarStrictness === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleChange('grammarStrictness', item.id)}
                    style={{
                      ...btn(active),
                      padding: '6px 8px',
                      borderRadius: 8,
                      fontSize: 11.5,
                      fontWeight: 600,
                      background: active ? 'var(--color-brand-red)' : 'var(--color-background-secondary)',
                      color: active ? 'var(--color-on-primary)' : 'var(--color-text-primary)',
                      border: `1px solid ${active ? 'var(--color-brand-red)' : 'var(--color-border-tertiary)'}`
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio Quality Sampling Rate */}
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
              {lang === 'en' ? 'Sampling Rate' : 'Tasa de muestreo'}
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['16kHz', '24kHz', '48kHz'] as const).map((rate) => {
                const active = localSettings.audioSamplingRate === rate;
                return (
                  <button
                    key={rate}
                    onClick={() => handleChange('audioSamplingRate', rate)}
                    style={{
                      ...btn(active),
                      flex: 1,
                      padding: '6px 8px',
                      borderRadius: 8,
                      fontSize: 11.5,
                      fontWeight: 600,
                      background: active ? 'var(--color-brand-red)' : 'var(--color-background-secondary)',
                      color: active ? 'var(--color-on-primary)' : 'var(--color-text-primary)',
                      border: `1px solid ${active ? 'var(--color-brand-red)' : 'var(--color-border-tertiary)'}`
                    }}
                  >
                    {rate}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggle Switches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-primary)', cursor: 'pointer' }}>
              <span>{lang === 'en' ? 'Live subtitles in call' : 'Subtítulos en vivo'}</span>
              <input
                type="checkbox"
                checked={localSettings.subtitlesEnabled}
                onChange={(e) => handleChange('subtitlesEnabled', e.target.checked)}
                style={{ accentColor: 'var(--color-brand-red)' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-primary)', cursor: 'pointer' }}>
              <span>{lang === 'en' ? 'Autoplay response audio' : 'Reproducir audio automáticamente'}</span>
              <input
                type="checkbox"
                checked={localSettings.autoPlayAudio}
                onChange={(e) => handleChange('autoPlayAudio', e.target.checked)}
                style={{ accentColor: 'var(--color-brand-red)' }}
              />
            </label>
          </div>

          {/* Voice Test button */}
          <div style={{ marginTop: 6, padding: '12px', borderRadius: 12, background: 'var(--color-background-secondary)', border: '1px solid var(--color-border-tertiary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {lang === 'en' ? 'Voice Synthesis Test' : 'Prueba de síntesis de voz'}
                </div>
                {testStatusMessage && (
                  <div style={{ fontSize: 10.5, color: 'var(--color-brand-red)', marginTop: 2 }}>
                    {testStatusMessage}
                  </div>
                )}
              </div>
              <button
                onClick={handleTestVoice}
                disabled={isTestingVoice}
                style={{
                  ...btn(),
                  padding: '7px 14px',
                  borderRadius: 10,
                  fontSize: 11.5,
                  fontWeight: 700,
                  background: 'var(--color-brand-red)',
                  color: 'var(--color-on-primary)',
                  border: 'none',
                  opacity: isTestingVoice ? 0.6 : 1
                }}
              >
                {isTestingVoice ? '⏳' : '▶'} {lang === 'en' ? 'Test' : 'Probar'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--color-border-tertiary)',
            background: 'var(--color-background-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <button
            onClick={handleResetDefaults}
            style={{
              ...btn(),
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 11.5,
              background: 'var(--color-background-primary)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-secondary)'
            }}
          >
            {lang === 'en' ? 'Reset Defaults' : 'Restablecer'}
          </button>

          <button
            onClick={onClose}
            style={{
              ...btn(),
              padding: '7px 18px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              background: 'var(--color-brand-red)',
              color: 'var(--color-on-primary)',
              border: 'none'
            }}
          >
            {lang === 'en' ? 'Done' : 'Listo'}
          </button>
        </div>
      </div>
    </div>
  );
};
