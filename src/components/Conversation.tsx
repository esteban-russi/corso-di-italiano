import { useState, useEffect, useMemo } from 'react';
import { useLang } from '../context/LangContext';
import { useCopy } from '../copy';
import { INITIAL_PERSONAS, INITIAL_MESSAGES, generatePersonaFallbackMessage } from '../content/personas';
import type { Persona, ChatMessage, DevSettings, CallMode } from '../types/conversation';
import { SocialSidebar } from './conversation/SocialSidebar';
import { ChatInterface } from './conversation/ChatInterface';
import { PhoneCallModal } from './conversation/PhoneCallModal';
import { DevSettingsDrawer } from './conversation/DevSettingsDrawer';
import { PersonaProfileModal } from './conversation/PersonaProfileModal';
import { PersonaBadge } from './conversation/PersonaBadge';
import { speechService } from '../utils/speech';
import { btn } from '../utils';

const STORE = 'corso-convo';

interface SavedState {
  messagesMap?: Record<string, ChatMessage[]>;
  selectedPersonaId?: string;
  started?: boolean;
  msgs?: Array<{ role: string; text: string; translation?: string }>;
}

function loadSaved(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.messagesMap) return parsed;
    if (Array.isArray(parsed.msgs) && parsed.msgs.length > 0) {
      const converted: ChatMessage[] = parsed.msgs.map((m: { role: string; text: string; translation?: string }, i: number) => ({
        id: `m-legacy-${i}`,
        sender: m.role === 'user' ? 'user' : 'persona',
        personaId: 'matteo',
        text: m.text,
        translation: m.translation || '',
        timestamp: '09:40'
      }));
      return {
        messagesMap: { matteo: converted },
        selectedPersonaId: 'matteo',
        started: true
      };
    }
    return null;
  } catch {
    return null;
  }
}

export default function Conversation() {
  const { lang } = useLang();
  const c = useCopy();
  const saved = useMemo(loadSaved, []);

  const [personas] = useState<Persona[]>(INITIAL_PERSONAS);
  const [selectedPersona, setSelectedPersona] = useState<Persona>(() => {
    const found = personas.find((p) => p.id === saved?.selectedPersonaId);
    return found || personas[0];
  });

  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(
    saved?.messagesMap || INITIAL_MESSAGES
  );
  const [started, setStarted] = useState<boolean>(Boolean(saved?.started));
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Active call state (audio only, no videocall)
  const [activeCall, setActiveCall] = useState<{
    persona: Persona;
    mode: CallMode;
  } | null>(null);

  // Modals & drawers
  const [isDevLabOpen, setIsDevLabOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'sidebar' | 'chat'>('chat');

  // Dev Settings for AI Models and Voice Lab
  const [devSettings, setDevSettings] = useState<DevSettings>({
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
  });

  const activeMessages = messagesMap[selectedPersona.id] || [];

  // Persist conversation state to localStorage
  useEffect(() => {
    if (started) {
      const currentList = messagesMap[selectedPersona.id] || [];
      localStorage.setItem(
        STORE,
        JSON.stringify({
          messagesMap,
          selectedPersonaId: selectedPersona.id,
          started: true,
          // Backwards compatibility for tests expecting msgs array
          msgs: currentList.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'marco',
            text: m.text,
            translation: m.translation
          }))
        })
      );
    }
  }, [messagesMap, selectedPersona.id, started]);

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      personaId: selectedPersona.id,
      text,
      translation: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...activeMessages, userMsg];
    setMessagesMap((prev) => ({
      ...prev,
      [selectedPersona.id]: updated
    }));

    setIsAiGenerating(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaPrompt: selectedPersona.personaPrompt,
          history: updated.slice(-6),
          userMessage: text,
          temperature: devSettings.temperature,
          grammarStrictness: devSettings.grammarStrictness
        })
      });

      if (res.status === 429) {
        const errorMsg: ChatMessage = {
          id: `b-err-${Date.now()}`,
          sender: 'persona',
          personaId: selectedPersona.id,
          text: c('state.rateLimited'),
          translation: '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessagesMap((prev) => ({
          ...prev,
          [selectedPersona.id]: [...(prev[selectedPersona.id] || []), errorMsg]
        }));
        setIsAiGenerating(false);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        const replyText = data.text || data.reply;
        if (replyText) {
          const aiMessage: ChatMessage = {
            id: `b-${Date.now()}`,
            sender: 'persona',
            personaId: selectedPersona.id,
            text: replyText,
            translation: data.translation || '',
            grammarNotes: Array.isArray(data.grammarNotes) ? data.grammarNotes : [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setMessagesMap((prev) => ({
            ...prev,
            [selectedPersona.id]: [...(prev[selectedPersona.id] || []), aiMessage]
          }));

          if (devSettings.autoPlayAudio) {
            speechService.speakSmart(aiMessage.text, {
              provider: devSettings.voiceProvider,
              voiceName: selectedPersona.voiceId,
              gender: selectedPersona.voiceGender
            });
          }

          setIsAiGenerating(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Fallback generator when offline or server unreachable
    setTimeout(() => {
      const fallback = generatePersonaFallbackMessage(selectedPersona, text);
      setMessagesMap((prev) => ({
        ...prev,
        [selectedPersona.id]: [...(prev[selectedPersona.id] || []), fallback]
      }));

      if (devSettings.autoPlayAudio) {
        speechService.speakSmart(fallback.text, {
          provider: devSettings.voiceProvider,
          voiceName: selectedPersona.voiceId,
          gender: selectedPersona.voiceGender
        });
      }

      setIsAiGenerating(false);
    }, 400);
  };

  const handleStartCall = (persona: Persona) => {
    setSelectedPersona(persona);
    setActiveCall({ persona, mode: 'audio' });
  };

  const handleEndCall = () => {
    setActiveCall(null);
  };

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    setMobileView('chat');
  };

  // Welcome Intro View before conversation is started
  if (!started) {
    return (
      <div style={{ textAlign: 'center', padding: '28px 16px' }}>
        <div style={{ fontSize: 42, marginBottom: 10 }} aria-hidden="true">
          💬
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 6 }}>
          {lang === 'en' ? 'Talk with Italian Tutors' : 'Habla con tutores italianos'}
        </div>
        <p
          style={{
            fontSize: 13.5,
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            maxWidth: 440,
            margin: '0 auto 20px'
          }}
        >
          {lang === 'en'
            ? 'Realistic conversational chat and voice calls with native Italian personas. Practice ordering at the bar with Matteo or exploring Roman culture with Sofia.'
            : 'Conversación realista por chat y llamadas de voz con tutores nativos italianos. Practica pedir en el bar con Matteo o explora la cultura de Roma con Sofia.'}
        </p>

        {/* Two Character Preview Cards (Matteo & Sofia) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            maxWidth: 480,
            margin: '0 auto 24px'
          }}
        >
          {personas.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                setSelectedPersona(p);
                setStarted(true);
              }}
              style={{
                padding: '16px',
                borderRadius: 14,
                background: 'var(--color-background-primary)',
                border: '1px solid var(--color-border-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <PersonaBadge persona={p} size="sm" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--color-text-primary)' }}>
                    {p.fullName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-brand-red)', fontWeight: 600 }}>
                    {p.city} · {p.cefrLevel}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                &ldquo;{p.nativeSaying}&rdquo;
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStarted(true)}
          className="btn-primary"
          style={{
            ...btn(),
            padding: '13px 32px',
            fontWeight: 700,
            fontSize: 15,
            background: 'var(--color-brand-red)',
            color: 'var(--color-on-primary)',
            border: 'none',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {lang === 'en' ? 'Start chatting →' : 'Empezar a charlar →'}
        </button>
      </div>
    );
  }

  // Full Conversational Chat and Calling Interface
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid var(--color-border-tertiary)',
        background: 'var(--color-background-primary)',
        boxShadow: 'var(--shadow-md)',
        minHeight: 580
      }}
    >
      {/* Mobile top navigation toggle bar */}
      <div
        className="mobile-convo-toggle"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          background: 'var(--color-background-secondary)',
          borderBottom: '1px solid var(--color-border-tertiary)'
        }}
      >
        <button
          onClick={() => setMobileView(mobileView === 'sidebar' ? 'chat' : 'sidebar')}
          style={{
            ...btn(),
            padding: '5px 12px',
            fontSize: 11.5,
            borderRadius: 8,
            background: 'var(--color-background-primary)',
            border: '1px solid var(--color-border-secondary)',
            color: 'var(--color-text-primary)'
          }}
        >
          {mobileView === 'sidebar'
            ? (lang === 'en' ? '💬 Go to Chat' : '💬 Ir al chat')
            : (lang === 'en' ? '👥 Contacts' : '👥 Contactos')}
        </button>

        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {selectedPersona.name} ({selectedPersona.city})
        </span>

        <button
          onClick={() => {
            setMessagesMap(INITIAL_MESSAGES);
            localStorage.removeItem(STORE);
          }}
          style={{
            ...btn(),
            padding: '5px 10px',
            fontSize: 11,
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-secondary)'
          }}
          title={lang === 'en' ? 'Reset messages' : 'Restablecer'}
        >
          ↺
        </button>
      </div>

      {/* Main 2-Column Responsive Body */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          height: 600,
          minHeight: 520,
          overflow: 'hidden'
        }}
      >
        {/* Left Column: Social Contacts & Stories Sidebar */}
        <div
          style={{
            display: mobileView === 'sidebar' ? 'flex' : undefined,
            width: mobileView === 'sidebar' ? '100%' : undefined
          }}
          className={mobileView === 'chat' ? 'hidden-on-mobile' : ''}
        >
          <SocialSidebar
            personas={personas}
            selectedPersona={selectedPersona}
            onSelectPersona={handleSelectPersona}
            onStartCall={(p) => handleStartCall(p)}
            onOpenDevLab={() => setIsDevLabOpen(true)}
          />
        </div>

        {/* Center/Right Column: Chat Interface */}
        <div
          style={{
            flex: 1,
            display: mobileView === 'chat' ? 'flex' : undefined,
            flexDirection: 'column',
            minWidth: 0
          }}
          className={mobileView === 'sidebar' ? 'hidden-on-mobile' : ''}
        >
          <ChatInterface
            persona={selectedPersona}
            messages={activeMessages}
            devSettings={devSettings}
            onSendMessage={handleSendMessage}
            onStartCall={() => handleStartCall(selectedPersona)}
            onOpenPersonaDetails={() => setIsProfileModalOpen(true)}
            onOpenDevLab={() => setIsDevLabOpen(true)}
            isAiGenerating={isAiGenerating}
          />
        </div>
      </div>

      {/* Full-Screen Phone Call Interface (Audio Call, NO videocall) */}
      {activeCall && (
        <PhoneCallModal
          persona={activeCall.persona}
          devSettings={devSettings}
          onEndCall={handleEndCall}
          onOpenDevSettings={() => setIsDevLabOpen(true)}
        />
      )}

      {/* AI Lab & Voice Models Drawer */}
      <DevSettingsDrawer
        isOpen={isDevLabOpen}
        onClose={() => setIsDevLabOpen(false)}
        settings={devSettings}
        onSaveSettings={(updated) => setDevSettings(updated)}
        activePersonaName={selectedPersona.fullName}
      />

      {/* Persona Cultural Details Modal */}
      <PersonaProfileModal
        persona={selectedPersona}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onStartCall={() => handleStartCall(selectedPersona)}
      />
    </div>
  );
}
