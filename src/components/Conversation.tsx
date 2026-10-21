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

interface ConversationProps {
  onNavigate?: (section: 'conversation' | 'verbs-learning' | 'settings') => void;
  activeSection?: string;
  streakCount?: number;
}

export default function Conversation({
  onNavigate,
  activeSection = 'conversation',
  streakCount = 5
}: ConversationProps) {
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
  const [started, setStarted] = useState<boolean>(true);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Active call state (audio only, no videocall)
  const [activeCall, setActiveCall] = useState<{
    persona: Persona;
    mode: CallMode;
  } | null>(null);

  // Modals & drawers
  const [isDevLabOpen, setIsDevLabOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'sidebar' | 'chat'>('sidebar');

  useEffect(() => {
    if (window.location.pathname === '/conversation') {
      setMobileView('chat');
    }
  }, []);

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
  }, [messagesMap, selectedPersona.id]);

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

  // Full-Screen Conversational Chat and Calling Interface (matching Italix-AI)
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* Left Column: Social Contacts & Stories Sidebar */}
      <SocialSidebar
        personas={personas}
        selectedPersona={selectedPersona}
        onSelectPersona={handleSelectPersona}
        onStartCall={(p) => handleStartCall(p)}
        onOpenDevLab={() => setIsDevLabOpen(true)}
        onNavigate={(target) => {
          if (target === 'conversation') {
            setMobileView('chat');
          }
          onNavigate?.(target);
        }}
        activeSection={activeSection}
        streakCount={streakCount}
        className={mobileView === 'chat' ? 'hidden lg:flex' : 'flex'}
      />

      {/* Center/Right Column: Chat Interface */}
      <ChatInterface
        persona={selectedPersona}
        messages={activeMessages}
        devSettings={devSettings}
        onSendMessage={handleSendMessage}
        onStartCall={() => handleStartCall(selectedPersona)}
        onOpenPersonaDetails={() => setIsProfileModalOpen(true)}
        onOpenDevLab={() => setIsDevLabOpen(true)}
        onStartChatting={() => setStarted(true)}
        onBackToSidebar={() => setMobileView('sidebar')}
        isAiGenerating={isAiGenerating}
        className={mobileView === 'sidebar' ? 'hidden lg:flex' : 'flex'}
      />

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
