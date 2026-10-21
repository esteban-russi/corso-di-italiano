import React, { useState, useRef, useEffect } from 'react';
import { useLang } from '../../context/LangContext';
import { useCopy } from '../../copy';
import type { Persona, ChatMessage, DevSettings, CharacterSpeakingState } from '../../types/conversation';
import { PersonaBadge } from './PersonaBadge';
import { speechService, createSpeechRecognizer } from '../../utils/speech';
import { SUGGESTED_STARTERS } from '../../content/personas';
import { btn } from '../../utils';

interface ChatInterfaceProps {
  persona: Persona;
  messages: ChatMessage[];
  devSettings: DevSettings;
  onSendMessage: (text: string) => void;
  onStartCall: () => void;
  onOpenPersonaDetails: () => void;
  onOpenDevLab: () => void;
  isAiGenerating?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  persona,
  messages,
  devSettings,
  onSendMessage,
  onStartCall,
  onOpenPersonaDetails,
  onOpenDevLab,
  isAiGenerating = false
}) => {
  const { lang } = useLang();
  const c = useCopy();
  const [inputText, setInputText] = useState('');
  const [showAllTranslations, setShowAllTranslations] = useState(false);
  const [shownTranslations, setShownTranslations] = useState<Set<string>>(new Set());
  const [expandedGrammarId, setExpandedGrammarId] = useState<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [speakingState, setSpeakingState] = useState<CharacterSpeakingState>('idle');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognizerRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiGenerating]);

  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const insertAccent = (char: string) => {
    setInputText((prev) => prev + char);
  };

  const handlePlayVoice = async (message: ChatMessage) => {
    if (playingMessageId === message.id) {
      speechService.stopSpeaking();
      setPlayingMessageId(null);
      setSpeakingState('idle');
      return;
    }

    setPlayingMessageId(message.id);
    setSpeakingState('speaking');

    await speechService.speakSmart(message.text, {
      provider: devSettings.voiceProvider,
      voiceName: persona.voiceId,
      rate: devSettings.speechRate,
      gender: persona.voiceGender,
      onStart: () => setSpeakingState('speaking'),
      onEnd: () => {
        setPlayingMessageId(null);
        setSpeakingState('idle');
      },
      onError: () => {
        setPlayingMessageId(null);
        setSpeakingState('idle');
      }
    });
  };

  const toggleMicRecording = () => {
    if (isRecordingMic) {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsRecordingMic(false);
      return;
    }

    const recognizer = createSpeechRecognizer(
      (transcript: string) => {
        setInputText(transcript);
      },
      () => {
        setIsRecordingMic(false);
      },
      () => {
        setIsRecordingMic(false);
      }
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      try {
        recognizer.start();
        setIsRecordingMic(true);
      } catch {
        setIsRecordingMic(false);
      }
    }
  };

  return (
    <main
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 520,
        background: 'var(--color-background-primary)',
        overflow: 'hidden'
      }}
    >
      {/* Chat Top Bar */}
      <header
        style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--color-border-tertiary)',
          background: 'var(--color-background-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: 12
        }}
      >
        {/* Left: Persona identity */}
        <div
          onClick={onOpenPersonaDetails}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer'
          }}
          title={lang === 'en' ? 'View tutor details' : 'Ver detalles del tutor'}
        >
          <PersonaBadge persona={persona} size="md" speakingState={speakingState} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {persona.fullName}
              </h2>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--color-brand-red)',
                  background: 'var(--color-brand-red-subtle)',
                  padding: '1px 6px',
                  borderRadius: 6,
                  border: '1px solid var(--color-brand-red-border)'
                }}
              >
                {persona.cefrLevel}
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>{persona.city}</span>
              <span>·</span>
              <span>{persona.role}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Translation Global Toggle */}
          <button
            onClick={() => setShowAllTranslations(!showAllTranslations)}
            style={{
              ...btn(showAllTranslations),
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 10,
              background: showAllTranslations ? 'var(--color-brand-red-subtle)' : 'var(--color-background-secondary)',
              color: showAllTranslations ? 'var(--color-brand-red)' : 'var(--color-text-secondary)',
              border: `1px solid ${showAllTranslations ? 'var(--color-brand-red-border)' : 'var(--color-border-secondary)'}`
            }}
          >
            {showAllTranslations
              ? (lang === 'en' ? 'Translations ON' : 'Traducciones ON')
              : (lang === 'en' ? 'Italian only' : 'Solo italiano')}
          </button>

          {/* Dev Lab indicator button */}
          <button
            onClick={onOpenDevLab}
            style={{
              ...btn(),
              padding: '6px 10px',
              fontSize: 11,
              borderRadius: 10,
              background: 'var(--color-background-secondary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
            title={lang === 'en' ? 'Voice Model Settings' : 'Configuración del modelo de voz'}
          >
            <span>🎙️</span>
            <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {devSettings.voiceProvider === 'gemini_live' ? 'Gemini Live' : 'Web Speech'}
            </span>
          </button>

          {/* Audio Call Button (Audio only, NO videocall) */}
          <button
            onClick={onStartCall}
            style={{
              ...btn(),
              padding: '7px 14px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              background: 'var(--color-brand-red)',
              color: 'var(--color-on-primary)',
              border: 'none',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
            title={lang === 'en' ? 'Start Audio Call' : 'Iniciar llamada de audio'}
          >
            <span>📞</span>
            <span>{lang === 'en' ? 'Call' : 'Llamar'}</span>
          </button>

          {/* Info Details Modal */}
          <button
            onClick={onOpenPersonaDetails}
            style={{
              ...btn(),
              padding: '6px 8px',
              borderRadius: 10,
              fontSize: 12,
              background: 'var(--color-background-secondary)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-secondary)'
            }}
            title={lang === 'en' ? 'Tutor Profile' : 'Perfil del tutor'}
          >
            ℹ️
          </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          background: 'var(--color-background-secondary)'
        }}
      >
        {/* Cultural Welcome Note */}
        <div
          style={{
            maxWidth: 420,
            margin: '0 auto 8px',
            textAlign: 'center',
            padding: '12px 16px',
            borderRadius: 14,
            background: 'var(--color-background-primary)',
            border: '1px solid var(--color-border-tertiary)',
            boxShadow: 'var(--shadow-sm)',
            fontSize: 12
          }}
        >
          <div style={{ fontWeight: 800, color: 'var(--color-brand-red)' }}>
            {persona.fullName} · {persona.city}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', marginTop: 4, fontStyle: 'italic' }}>
            &ldquo;{persona.nativeSaying}&rdquo; — {persona.nativeSayingTranslation}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginTop: 8,
              paddingTop: 8,
              borderTop: '1px solid var(--color-border-tertiary)',
              fontSize: 11,
              color: 'var(--color-text-secondary)'
            }}
          >
            <span style={{ fontWeight: 600 }}>{lang === 'en' ? 'Specialty:' : 'Especialidad:'}</span>
            <span style={{ color: 'var(--color-text-primary)' }}>{persona.dialectSpecialty}</span>
          </div>
        </div>

        {/* Message Stream */}
        {messages.map((message) => {
          const isUser = message.sender === 'user';
          const isPlaying = playingMessageId === message.id;
          const isGrammarExpanded = expandedGrammarId === message.id;

          return (
            <div
              key={message.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                alignSelf: isUser ? 'flex-end' : 'flex-start'
              }}
            >
              {/* Message Bubble */}
              <div
                style={{
                  borderRadius: 16,
                  borderTopRightRadius: isUser ? 2 : 16,
                  borderTopLeftRadius: isUser ? 16 : 2,
                  padding: '12px 16px',
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  background: isUser ? 'var(--color-brand-red)' : 'var(--color-background-primary)',
                  color: isUser ? 'var(--color-on-primary)' : 'var(--color-text-primary)',
                  border: isUser ? 'none' : '1px solid var(--color-border-tertiary)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Voice Note waveform header if voice note */}
                {message.isVoiceNote && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 8,
                      paddingBottom: 6,
                      borderBottom: '1px solid var(--color-border-tertiary)'
                    }}
                  >
                    <button
                      onClick={() => handlePlayVoice(message)}
                      style={{
                        ...btn(),
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isPlaying
                          ? (isUser ? 'var(--color-background-primary)' : 'var(--color-brand-red)')
                          : (isUser ? 'var(--color-brand-red-hover)' : 'var(--color-brand-red-subtle)'),
                        color: isPlaying
                          ? (isUser ? 'var(--color-brand-red)' : 'var(--color-on-primary)')
                          : (isUser ? 'var(--color-on-primary)' : 'var(--color-brand-red)'),
                        border: 'none',
                        fontSize: 10
                      }}
                      title={lang === 'en' ? 'Play audio voice note' : 'Reproducir nota de voz'}
                    >
                      {isPlaying ? '⏸' : '▶'}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
                      <span className={isPlaying ? 'animate-wave-1' : ''} style={{ width: 3, height: isPlaying ? 16 : 8, borderRadius: 2, background: isUser ? 'var(--color-on-primary)' : 'var(--color-brand-red)' }} />
                      <span className={isPlaying ? 'animate-wave-2' : ''} style={{ width: 3, height: isPlaying ? 22 : 12, borderRadius: 2, background: isUser ? 'var(--color-on-primary)' : 'var(--color-brand-red)' }} />
                      <span className={isPlaying ? 'animate-wave-3' : ''} style={{ width: 3, height: isPlaying ? 14 : 7, borderRadius: 2, background: isUser ? 'var(--color-on-primary)' : 'var(--color-brand-red)' }} />
                      <span className={isPlaying ? 'animate-wave-4' : ''} style={{ width: 3, height: isPlaying ? 20 : 14, borderRadius: 2, background: isUser ? 'var(--color-on-primary)' : 'var(--color-brand-red)' }} />
                      <span className={isPlaying ? 'animate-wave-5' : ''} style={{ width: 3, height: isPlaying ? 16 : 10, borderRadius: 2, background: isUser ? 'var(--color-on-primary)' : 'var(--color-brand-red)' }} />
                    </div>

                    <span style={{ fontSize: 10.5, opacity: 0.8 }}>
                      {message.audioDuration || '0:05'}
                    </span>
                  </div>
                )}

                {/* Primary Italian Text */}
                <div style={{ fontWeight: isUser ? 500 : 400 }}>
                  {message.text}
                </div>

                {/* Translation button for tutor reply messages */}
                {!isUser && message.id !== 'm1' && message.id !== 's1' && (
                  <button
                    onClick={() => {
                      setShownTranslations((prev) => {
                        const next = new Set(prev);
                        if (next.has(message.id)) next.delete(message.id);
                        else next.add(message.id);
                        return next;
                      });
                    }}
                    style={{
                      ...btn(),
                      padding: '2px 8px',
                      marginTop: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--color-text-secondary)',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    {shownTranslations.has(message.id) || showAllTranslations
                      ? c('chat.hideTranslation')
                      : c('chat.translate')}
                  </button>
                )}

                {/* English / Learner Translation */}
                {(showAllTranslations || shownTranslations.has(message.id)) && !isUser && (
                  <div
                    style={{
                      marginTop: 6,
                      paddingTop: 6,
                      fontSize: 12,
                      fontStyle: message.translation ? 'italic' : 'normal',
                      opacity: 0.85,
                      borderTop: '1px solid var(--color-border-tertiary)',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    {message.translation
                      ? `"${message.translation}"`
                      : c('chat.translationUnavailable')}
                  </div>
                )}

                {/* Expandable Grammar & Vocabulary Note */}
                {!isUser && message.grammarNotes && message.grammarNotes.length > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid var(--color-border-tertiary)' }}>
                    <button
                      onClick={() => setExpandedGrammarId(isGrammarExpanded ? null : message.id)}
                      style={{
                        ...btn(),
                        padding: '2px 0',
                        fontSize: 11,
                        color: 'var(--color-brand-red)',
                        fontWeight: 700,
                        border: 'none',
                        background: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <span>📖</span>
                      <span>
                        {lang === 'en'
                          ? `Grammar & Vocabulary Notes (${message.grammarNotes.length})`
                          : `Notas de gramática y vocabulario (${message.grammarNotes.length})`}
                      </span>
                      <span>{isGrammarExpanded ? '▲' : '▼'}</span>
                    </button>

                    {isGrammarExpanded && (
                      <div
                        style={{
                          marginTop: 6,
                          padding: '8px 10px',
                          borderRadius: 8,
                          background: 'var(--color-brand-red-subtle)',
                          border: '1px solid var(--color-brand-red-border)',
                          fontSize: 11.5,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6
                        }}
                      >
                        {message.grammarNotes.map((note, idx) => (
                          <div
                            key={idx}
                            style={{
                              paddingBottom: 4,
                              borderBottom: idx < message.grammarNotes!.length - 1 ? '1px solid var(--color-brand-red-border)' : 'none'
                            }}
                          >
                            <span style={{ fontWeight: 800, color: 'var(--color-brand-red)' }}>
                              {note.wordOrPhrase}:
                            </span>{' '}
                            <span style={{ color: 'var(--color-text-primary)' }}>{note.explanation}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Timestamp & Quick Audio Button */}
                <div
                  style={{
                    marginTop: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    fontSize: 10,
                    opacity: 0.7
                  }}
                >
                  <span>{message.timestamp}</span>

                  {!isUser && (
                    <button
                      onClick={() => handlePlayVoice(message)}
                      style={{
                        ...btn(),
                        padding: '2px 6px',
                        fontSize: 11,
                        border: 'none',
                        background: 'transparent',
                        color: 'inherit',
                        cursor: 'pointer'
                      }}
                      title={lang === 'en' ? 'Listen to Italian pronunciation' : 'Escuchar pronunciación'}
                    >
                      🔊
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* AI Generating Indicator */}
        {isAiGenerating && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              background: 'var(--color-background-primary)',
              border: '1px solid var(--color-border-tertiary)',
              borderRadius: 14,
              maxWidth: 300,
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--color-brand-red)',
                animation: 'pulseGlow 1.2s ease-in-out infinite'
              }}
            />
            <span>
              {lang === 'en'
                ? `${persona.name} is formulating a reply…`
                : `${persona.name} está formulando una respuesta…`}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Accents Bar & Suggested Starters */}
      <div
        style={{
          padding: '8px 14px',
          borderTop: '1px solid var(--color-border-tertiary)',
          background: 'var(--color-background-primary)',
          flexShrink: 0
        }}
      >
        {/* Suggested Quick Starters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
            {lang === 'en' ? 'Prompts:' : 'Ideas:'}
          </span>
          {SUGGESTED_STARTERS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(prompt)}
              style={{
                ...btn(),
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 11.5,
                background: 'var(--color-background-secondary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-tertiary)',
                whiteSpace: 'nowrap'
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Accents toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            paddingTop: 4,
            borderTop: '1px solid var(--color-border-tertiary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginRight: 4 }}>
              {lang === 'en' ? 'Accents:' : 'Acentos:'}
            </span>
            {['à', 'è', 'é', 'ì', 'ò', 'ù', '€', '«', '»'].map((char) => (
              <button
                key={char}
                onClick={() => insertAccent(char)}
                style={{
                  ...btn(),
                  width: 24,
                  height: 24,
                  padding: 0,
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 6,
                  background: 'var(--color-background-secondary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-tertiary)'
                }}
              >
                {char}
              </button>
            ))}
          </div>

          <span style={{ fontSize: 10.5, color: 'var(--color-text-secondary)' }}>
            {lang === 'en' ? 'Press Enter to send' : 'Presiona Enter para enviar'}
          </span>
        </div>
      </div>

      {/* Input Composer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--color-border-tertiary)',
          background: 'var(--color-background-primary)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Microphone recording button */}
          <button
            onClick={toggleMicRecording}
            style={{
              ...btn(),
              width: 42,
              height: 42,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              background: isRecordingMic ? 'var(--color-brand-red)' : 'var(--color-background-secondary)',
              color: isRecordingMic ? 'var(--color-on-primary)' : 'var(--color-text-secondary)',
              border: `1px solid ${isRecordingMic ? 'var(--color-brand-red)' : 'var(--color-border-secondary)'}`,
              boxShadow: isRecordingMic ? 'var(--shadow-md)' : 'none',
              animation: isRecordingMic ? 'pulseGlow 1.2s ease-in-out infinite' : 'none'
            }}
            title={isRecordingMic ? (lang === 'en' ? 'Listening… Tap to stop' : 'Escuchando… Toca para detener') : (lang === 'en' ? 'Speak in Italian' : 'Hablar en italiano')}
          >
            {isRecordingMic ? '🛑' : '🎤'}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder={lang === 'en' ? `Message ${persona.name}…` : `Mensaje a ${persona.name}…`}
            style={{
              flex: 1,
              background: 'var(--color-background-secondary)',
              border: '1px solid var(--color-border-secondary)',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 14,
              color: 'var(--color-text-primary)',
              outline: 'none'
            }}
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            style={{
              ...btn(),
              width: 42,
              height: 42,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              background: 'var(--color-brand-red)',
              color: 'var(--color-on-primary)',
              border: 'none',
              cursor: inputText.trim() ? 'pointer' : 'default',
              opacity: inputText.trim() ? 1 : 0.4
            }}
            title={lang === 'en' ? 'Send message' : 'Enviar mensaje'}
          >
            ➤
          </button>
        </div>
      </div>
    </main>
  );
};
