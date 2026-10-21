import React, { useState, useEffect, useRef } from 'react';
import { useLang } from '../../context/LangContext';
import type { Persona, CharacterSpeakingState, DevSettings } from '../../types/conversation';
import { PersonaBadge } from './PersonaBadge';
import { speechService, createSpeechRecognizer } from '../../utils/speech';
import { ITALIAN_PRACTICE_PHRASES, generateCallFallback } from '../../content/personas';
import { btn } from '../../utils';

interface PhoneCallModalProps {
  persona: Persona;
  devSettings: DevSettings;
  onEndCall: () => void;
  onOpenDevSettings: () => void;
}

interface CallExchange {
  speaker: 'user' | 'persona';
  text: string;
  translation: string;
  timestamp: string;
}

export const PhoneCallModal: React.FC<PhoneCallModalProps> = ({
  persona,
  devSettings,
  onEndCall,
  onOpenDevSettings
}) => {
  const { lang } = useLang();
  const [callStatus, setCallStatus] = useState<'calling' | 'connected'>('calling');
  const [callDurationSec, setCallDurationSec] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(devSettings.subtitlesEnabled);
  const [showKeypad, setShowKeypad] = useState(false);
  const [showPromptAssistance, setShowPromptAssistance] = useState(false);
  const [speakingState, setSpeakingState] = useState<CharacterSpeakingState>('idle');

  const [currentSpeechText, setCurrentSpeechText] = useState('');
  const [currentTranslation, setCurrentTranslation] = useState('');
  const [dialogueHistory, setDialogueHistory] = useState<CallExchange[]>([]);
  const [userTranscriptInput, setUserTranscriptInput] = useState('');
  const [dialedDigits, setDialedDigits] = useState('');

  const timerRef = useRef<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognizerRef = useRef<any>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePersonaSpeak = async (text: string, translation: string) => {
    setSpeakingState('speaking');
    setCurrentSpeechText(text);
    setCurrentTranslation(translation);

    setDialogueHistory((prev) => [
      ...prev,
      {
        speaker: 'persona',
        text,
        translation,
        timestamp: formatDuration(callDurationSec)
      }
    ]);

    if (isSpeakerOn) {
      await speechService.speakSmart(text, {
        provider: devSettings.voiceProvider,
        voiceName: persona.voiceId,
        rate: devSettings.speechRate,
        gender: persona.voiceGender,
        onStart: () => setSpeakingState('speaking'),
        onEnd: () => {
          setSpeakingState('listening');
        },
        onError: () => {
          setSpeakingState('idle');
        }
      });
    } else {
      setTimeout(() => {
        setSpeakingState('listening');
      }, 2000);
    }
  };

  const handleUserReply = async (spokenText: string) => {
    if (!spokenText.trim()) return;

    setDialogueHistory((prev) => [
      ...prev,
      {
        speaker: 'user',
        text: spokenText,
        translation: 'Learner spoken phrase',
        timestamp: formatDuration(callDurationSec)
      }
    ]);

    setUserTranscriptInput('');
    setSpeakingState('thinking');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaPrompt: persona.personaPrompt,
          history: dialogueHistory.slice(-4),
          userMessage: spokenText,
          temperature: devSettings.temperature,
          grammarStrictness: devSettings.grammarStrictness
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          handlePersonaSpeak(data.text, data.translation || '');
          return;
        }
      }
    } catch {
      // fallback
    }

    const reply = generateCallFallback(persona, spokenText);
    handlePersonaSpeak(reply.it, reply.en);
  };

  useEffect(() => {
    speechService.playRingtoneBurst();
    const ringInterval = setInterval(() => {
      speechService.playRingtoneBurst();
    }, 2500);

    const connectTimeout = setTimeout(() => {
      clearInterval(ringInterval);
      setCallStatus('connected');

      timerRef.current = window.setInterval(() => {
        setCallDurationSec((prev) => prev + 1);
      }, 1000);

      handlePersonaSpeak(
        persona.sampleAudioText,
        `Hello! Welcome to ${persona.city}. Let's practice speaking conversational Italian together!`
      );
    }, 2000);

    return () => {
      clearInterval(ringInterval);
      clearTimeout(connectTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
      speechService.stopSpeaking();
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [persona]);

  useEffect(() => {
    if (callStatus !== 'connected' || isMuted) {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {
          // ignore
        }
      }
      return;
    }

    const rec = createSpeechRecognizer(
      (transcript: string) => {
        setUserTranscriptInput(transcript);
      },
      () => {},
      () => {}
    );

    if (rec) {
      recognizerRef.current = rec;
      try {
        rec.start();
      } catch {
        // ignore
      }
    }
  }, [callStatus, isMuted]);

  const handleKeyPress = (digit: string) => {
    speechService.playDtmfTone(digit);
    setDialedDigits((prev) => (prev + digit).slice(-12));
  };

  const handleHangup = () => {
    speechService.stopSpeaking();
    speechService.playHangupTone();
    if (timerRef.current) clearInterval(timerRef.current);
    onEndCall();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-call-overlay)',
        backdropFilter: 'blur(8px)',
        padding: '16px'
      }}
    >
      {/* Phone container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 420,
          height: '92vh',
          maxHeight: 780,
          background: 'var(--color-background-primary)',
          border: '1px solid var(--color-border-primary)',
          borderRadius: 28,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Soft Ambient Top Glow */}
        <div
          style={{
            position: 'absolute',
            top: -60,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 260,
            height: 160,
            background: 'var(--color-brand-red-soft)',
            borderRadius: '50%',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }}
        />

        {/* Top Header Bar */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            padding: '16px 20px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--color-border-tertiary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--color-brand-red)',
                animation: 'pulseGlow 1.2s ease-in-out infinite'
              }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {callStatus === 'calling'
                  ? (lang === 'en' ? 'Calling…' : 'Llamando…')
                  : formatDuration(callDurationSec)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {devSettings.voiceProvider === 'gemini_live' ? 'GEMINI 3.8 SERVER TTS' : 'WEB SPEECH'} · {persona.city}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={onOpenDevSettings}
              style={{
                ...btn(),
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                background: 'var(--color-brand-red-subtle)',
                color: 'var(--color-brand-red)',
                border: '1px solid var(--color-brand-red-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>🎙️</span>
              <span>Voice Lab</span>
            </button>

            <button
              onClick={handleHangup}
              style={{
                ...btn(),
                padding: '4px 8px',
                borderRadius: 8,
                fontSize: 13,
                background: 'var(--color-background-secondary)',
                border: '1px solid var(--color-border-tertiary)',
                color: 'var(--color-text-secondary)'
              }}
              title={lang === 'en' ? 'Close call' : 'Cerrar llamada'}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Center Sound Stage */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            textAlign: 'center',
            overflowY: 'auto'
          }}
        >
          {/* Identity */}
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              {persona.fullName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              <span>{persona.city}</span>
              <span>·</span>
              <span style={{ color: 'var(--color-brand-red)', fontWeight: 700 }}>{persona.levelLabel}</span>
              <span>·</span>
              <span>{persona.role}</span>
            </div>
          </div>

          {/* Minimalist Sound Stage Monogram Badge */}
          <div style={{ margin: '10px auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PersonaBadge persona={persona} size="call" speakingState={speakingState} />

            {/* Speaking / Listening Frequency Visualizer */}
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span className={speakingState === 'speaking' ? 'animate-wave-1' : ''} style={{ width: 4, height: speakingState === 'speaking' ? 24 : 8, borderRadius: 2, background: 'var(--color-brand-red)' }} />
              <span className={speakingState === 'speaking' ? 'animate-wave-2' : ''} style={{ width: 4, height: speakingState === 'speaking' ? 32 : 12, borderRadius: 2, background: 'var(--color-brand-red)' }} />
              <span className={speakingState === 'speaking' ? 'animate-wave-3' : ''} style={{ width: 4, height: speakingState === 'speaking' ? 20 : 6, borderRadius: 2, background: 'var(--color-brand-red)' }} />
              <span className={speakingState === 'speaking' ? 'animate-wave-4' : ''} style={{ width: 4, height: speakingState === 'speaking' ? 36 : 14, borderRadius: 2, background: 'var(--color-brand-red)' }} />
              <span className={speakingState === 'speaking' ? 'animate-wave-5' : ''} style={{ width: 4, height: speakingState === 'speaking' ? 22 : 8, borderRadius: 2, background: 'var(--color-brand-red)' }} />
            </div>

            <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700 }}>
              {speakingState === 'speaking' ? (
                <span style={{ color: 'var(--color-brand-red)' }}>
                  {persona.name} {lang === 'en' ? 'is speaking…' : 'está hablando…'}
                </span>
              ) : speakingState === 'listening' ? (
                <span style={{ color: 'var(--color-success)' }}>
                  {lang === 'en' ? 'Listening… speak now!' : 'Escuchando… ¡habla ahora!'}
                </span>
              ) : speakingState === 'thinking' ? (
                <span style={{ color: 'var(--color-primary)' }}>
                  {lang === 'en' ? 'Processing with Gemini AI…' : 'Procesando con Gemini AI…'}
                </span>
              ) : (
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {lang === 'en' ? 'Audio channel connected' : 'Canal de voz conectado'}
                </span>
              )}
            </div>
          </div>

          {/* Subtitles Overlay */}
          {showSubtitles && (
            <div
              style={{
                width: '100%',
                maxWidth: 360,
                background: 'var(--color-background-primary)',
                border: '1px solid var(--color-border-secondary)',
                borderRadius: 14,
                padding: '10px 14px',
                margin: '8px 0',
                textAlign: 'left',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-text-secondary)', marginBottom: 4, borderBottom: '1px solid var(--color-border-tertiary)', paddingBottom: 3 }}>
                <span style={{ color: 'var(--color-brand-red)', fontWeight: 800 }}>
                  💬 {lang === 'en' ? 'Live Subtitles' : 'Subtítulos en vivo'}
                </span>
                <span>{speakingState === 'speaking' ? persona.name : (lang === 'en' ? 'Student' : 'Estudiante')}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                {currentSpeechText || (userTranscriptInput || (lang === 'en' ? 'Waiting for speech…' : 'Esperando voz…'))}
              </div>
              {currentTranslation && (
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontStyle: 'italic', marginTop: 4, borderTop: '1px solid var(--color-border-tertiary)', paddingTop: 4 }}>
                  &ldquo;{currentTranslation}&rdquo;
                </div>
              )}
            </div>
          )}

          {/* Speaking Practice Suggestions ("Cosa dire") */}
          {showPromptAssistance && (
            <div
              style={{
                width: '100%',
                maxWidth: 360,
                background: 'var(--color-background-primary)',
                border: '1px solid var(--color-brand-red-border)',
                borderRadius: 14,
                padding: '10px 12px',
                margin: '6px 0',
                textAlign: 'left',
                fontSize: 12,
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 800, color: 'var(--color-brand-red)' }}>
                  💡 {lang === 'en' ? 'What to say:' : 'Qué decir:'}
                </span>
                <button onClick={() => setShowPromptAssistance(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 110, overflowY: 'auto' }}>
                {ITALIAN_PRACTICE_PHRASES.slice(0, 3).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleUserReply(item.it)}
                    style={{
                      ...btn(),
                      width: '100%',
                      textAlign: 'left',
                      padding: '6px 10px',
                      borderRadius: 8,
                      background: 'var(--color-background-secondary)',
                      border: '1px solid var(--color-border-tertiary)',
                      display: 'block'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--color-brand-red)', fontSize: 11.5 }}>{item.it}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{item.en}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dialpad Overlay */}
          {showKeypad && (
            <div
              style={{
                width: '100%',
                maxWidth: 280,
                background: 'var(--color-background-primary)',
                border: '1px solid var(--color-border-secondary)',
                borderRadius: 14,
                padding: '12px',
                margin: '6px 0',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid var(--color-border-tertiary)' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {dialedDigits || (lang === 'en' ? 'Dialpad' : 'Teclado')}
                </span>
                <button onClick={() => setShowKeypad(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleKeyPress(digit)}
                    style={{
                      ...btn(),
                      height: 38,
                      borderRadius: 10,
                      background: 'var(--color-background-secondary)',
                      fontSize: 14,
                      fontWeight: 800,
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border-tertiary)'
                    }}
                  >
                    {digit}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick text reply composer in call */}
          <div style={{ width: '100%', maxWidth: 360, marginTop: 6, display: 'flex', gap: 6 }}>
            <input
              type="text"
              value={userTranscriptInput}
              onChange={(e) => setUserTranscriptInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && userTranscriptInput.trim()) {
                  handleUserReply(userTranscriptInput);
                }
              }}
              placeholder={lang === 'en' ? 'Type or speak reply…' : 'Escribe o habla…'}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: 12,
                borderRadius: 10,
                border: '1px solid var(--color-border-secondary)',
                background: 'var(--color-background-secondary)',
                color: 'var(--color-text-primary)',
                outline: 'none'
              }}
            />
            {userTranscriptInput.trim() && (
              <button
                onClick={() => handleUserReply(userTranscriptInput)}
                style={{
                  ...btn(),
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  background: 'var(--color-brand-red)',
                  color: 'var(--color-on-primary)',
                  border: 'none'
                }}
              >
                ➤
              </button>
            )}
          </div>
        </div>

        {/* Regular Basic Call Controls (NO videocall button) */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            background: 'var(--color-background-secondary)',
            borderTop: '1px solid var(--color-border-tertiary)',
            padding: '14px 20px 20px'
          }}
        >
          {/* Secondary buttons: Subtitles, Suggestions, Dialpad */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginBottom: 14 }}>
            <button
              onClick={() => setShowSubtitles(!showSubtitles)}
              style={{
                ...btn(),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                border: 'none',
                background: 'transparent',
                color: showSubtitles ? 'var(--color-brand-red)' : 'var(--color-text-secondary)',
                fontSize: 10,
                fontWeight: showSubtitles ? 700 : 500
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: showSubtitles ? 'var(--color-brand-red-subtle)' : 'var(--color-background-primary)',
                  border: `1px solid ${showSubtitles ? 'var(--color-brand-red-border)' : 'var(--color-border-secondary)'}`,
                  fontSize: 14
                }}
              >
                💬
              </div>
              <span>{lang === 'en' ? 'Subtitles' : 'Subtítulos'}</span>
            </button>

            <button
              onClick={() => setShowPromptAssistance(!showPromptAssistance)}
              style={{
                ...btn(),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                border: 'none',
                background: 'transparent',
                color: showPromptAssistance ? 'var(--color-brand-red)' : 'var(--color-text-secondary)',
                fontSize: 10,
                fontWeight: showPromptAssistance ? 700 : 500
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: showPromptAssistance ? 'var(--color-brand-red-subtle)' : 'var(--color-background-primary)',
                  border: `1px solid ${showPromptAssistance ? 'var(--color-brand-red-border)' : 'var(--color-border-secondary)'}`,
                  fontSize: 14
                }}
              >
                💡
              </div>
              <span>{lang === 'en' ? 'Ideas' : 'Ideas'}</span>
            </button>

            <button
              onClick={() => setShowKeypad(!showKeypad)}
              style={{
                ...btn(),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                border: 'none',
                background: 'transparent',
                color: showKeypad ? 'var(--color-brand-red)' : 'var(--color-text-secondary)',
                fontSize: 10,
                fontWeight: showKeypad ? 700 : 500
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: showKeypad ? 'var(--color-brand-red-subtle)' : 'var(--color-background-primary)',
                  border: `1px solid ${showKeypad ? 'var(--color-brand-red-border)' : 'var(--color-border-secondary)'}`,
                  fontSize: 14
                }}
              >
                🔢
              </div>
              <span>{lang === 'en' ? 'Keypad' : 'Teclado'}</span>
            </button>
          </div>

          {/* Primary Call Controls: Mute, Speaker, Hangup (NO videocall button) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            {/* 1. Mute */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{
                ...btn(),
                width: 52,
                height: 52,
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: isMuted ? 'var(--color-brand-red-subtle)' : 'var(--color-background-primary)',
                border: `1px solid ${isMuted ? 'var(--color-brand-red-border)' : 'var(--color-border-secondary)'}`,
                color: isMuted ? 'var(--color-brand-red)' : 'var(--color-text-primary)',
                fontSize: 16
              }}
              title={isMuted ? (lang === 'en' ? 'Unmute microphone' : 'Activar micrófono') : (lang === 'en' ? 'Mute microphone' : 'Silenciar micrófono')}
            >
              <span>{isMuted ? '🔇' : '🎙️'}</span>
              <span style={{ fontSize: 9, marginTop: 1 }}>{isMuted ? (lang === 'en' ? 'Muted' : 'Silencio') : (lang === 'en' ? 'Mic' : 'Mic')}</span>
            </button>

            {/* 2. Speaker */}
            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              style={{
                ...btn(),
                width: 52,
                height: 52,
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: !isSpeakerOn ? 'var(--color-background-secondary)' : 'var(--color-background-primary)',
                border: `1px solid ${!isSpeakerOn ? 'var(--color-border-secondary)' : 'var(--color-border-primary)'}`,
                color: 'var(--color-text-primary)',
                fontSize: 16
              }}
              title={isSpeakerOn ? (lang === 'en' ? 'Mute speaker' : 'Silenciar altavoz') : (lang === 'en' ? 'Turn on speaker' : 'Activar altavoz')}
            >
              <span>{isSpeakerOn ? '🔊' : '🔈'}</span>
              <span style={{ fontSize: 9, marginTop: 1 }}>{isSpeakerOn ? (lang === 'en' ? 'Speaker' : 'Altavoz') : (lang === 'en' ? 'Muted' : 'Mudo')}</span>
            </button>

            {/* 3. End Call (Circular red button) */}
            <button
              onClick={handleHangup}
              style={{
                ...btn(),
                width: 58,
                height: 58,
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-brand-red)',
                color: 'var(--color-on-primary)',
                border: '2px solid var(--color-background-primary)',
                boxShadow: 'var(--shadow-md)',
                fontSize: 18
              }}
              title={lang === 'en' ? 'End call' : 'Finalizar llamada'}
            >
              <span>📵</span>
              <span style={{ fontSize: 9, fontWeight: 700, marginTop: 1 }}>{lang === 'en' ? 'End' : 'Fin'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
