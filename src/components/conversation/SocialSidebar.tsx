import React, { useState } from 'react';
import { useLang } from '../../context/LangContext';
import { useStreak } from '../../context/StreakContext';
import type { Persona, CulturalStory } from '../../types/conversation';
import { PersonaBadge } from './PersonaBadge';
import { CULTURAL_STORIES } from '../../content/personas';
import { speechService } from '../../utils/speech';
import { btn } from '../../utils';

interface SocialSidebarProps {
  personas: Persona[];
  selectedPersona: Persona;
  onSelectPersona: (persona: Persona) => void;
  onStartCall: (persona: Persona) => void;
  onOpenDevLab: () => void;
  style?: React.CSSProperties;
}

export const SocialSidebar: React.FC<SocialSidebarProps> = ({
  personas,
  selectedPersona,
  onSelectPersona,
  onStartCall,
  onOpenDevLab,
  style = {}
}) => {
  const { lang } = useLang();
  const streak = useStreak();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [activeStory, setActiveStory] = useState<CulturalStory | null>(null);

  const filteredPersonas = personas.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.fullName.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.topics.some((t) => t.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (levelFilter === 'all') return true;
    if (levelFilter === 'A') return p.cefrLevel === 'A1' || p.cefrLevel === 'A2';
    if (levelFilter === 'B') return p.cefrLevel === 'B1' || p.cefrLevel === 'B2';
    return true;
  });

  const handlePlayStory = (story: CulturalStory) => {
    setActiveStory(story);
    const storyPersona = personas.find((p) => p.id === story.personaId);
    speechService.speakItalian(`${story.title}. ${story.subtitle}. ${story.snippet}`, {
      rate: 0.92,
      gender: storyPersona?.voiceGender || 'female',
      onEnd: () => {
        setTimeout(() => setActiveStory(null), 1000);
      }
    });
  };

  return (
    <aside
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: 320,
        background: 'var(--color-background-primary)',
        borderRight: '1px solid var(--color-border-tertiary)',
        height: '100%',
        minHeight: 520,
        userSelect: 'none',
        ...style
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--color-border-tertiary)',
          background: 'var(--color-background-primary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              Parlami
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--color-brand-red)',
                background: 'var(--color-brand-red-subtle)',
                padding: '2px 7px',
                borderRadius: 6,
                border: '1px solid var(--color-brand-red-border)'
              }}
            >
              Italiano
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Streak Counter */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                borderRadius: 20,
                background: 'var(--color-background-secondary)',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--color-brand-red)'
              }}
              title={lang === 'en' ? `${streak.currentStreak} day streak` : `Racha de ${streak.currentStreak} días`}
            >
              <span>🔥</span>
              <span>{streak.currentStreak}d</span>
            </div>

            {/* Voice Lab Button */}
            <button
              onClick={onOpenDevLab}
              style={{
                ...btn(),
                padding: '5px 8px',
                fontSize: 12,
                borderRadius: 8,
                background: 'var(--color-background-secondary)',
                border: '1px solid var(--color-border-secondary)',
                color: 'var(--color-text-primary)'
              }}
              title={lang === 'en' ? 'Voice Model Lab & Settings' : 'Laboratorio de voz y configuración'}
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'en' ? 'Search contacts…' : 'Buscar contactos…'}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 12.5,
              borderRadius: 10,
              border: '1px solid var(--color-border-secondary)',
              background: 'var(--color-background-secondary)',
              color: 'var(--color-text-primary)',
              outline: 'none'
            }}
          />
        </div>

        {/* CEFR Level Filter Pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'all', label: lang === 'en' ? 'All' : 'Todos' },
            { id: 'A', label: 'A1-A2' },
            { id: 'B', label: 'B1-B2' }
          ].map((pill) => {
            const active = levelFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setLevelFilter(pill.id)}
                style={{
                  ...btn(active),
                  padding: '3px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 14,
                  background: active ? 'var(--color-brand-red)' : 'var(--color-background-secondary)',
                  color: active ? 'var(--color-on-primary)' : 'var(--color-text-secondary)',
                  border: `1px solid ${active ? 'var(--color-brand-red)' : 'var(--color-border-tertiary)'}`
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contact List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', padding: '4px 8px 6px' }}>
          {lang === 'en' ? 'Tutors' : 'Tutores'} ({filteredPersonas.length})
        </div>

        {filteredPersonas.map((persona) => {
          const isSelected = selectedPersona.id === persona.id;
          return (
            <div
              key={persona.id}
              onClick={() => onSelectPersona(persona)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px',
                borderRadius: 12,
                cursor: 'pointer',
                marginBottom: 4,
                background: isSelected ? 'var(--color-brand-red-subtle)' : 'var(--color-background-primary)',
                border: `1px solid ${isSelected ? 'var(--color-brand-red-border)' : 'transparent'}`,
                transition: 'background 0.15s ease'
              }}
            >
              <PersonaBadge persona={persona} size="sm" />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: isSelected ? 'var(--color-brand-red)' : 'var(--color-text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {persona.fullName}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                    {persona.lastMessageTime}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      color: 'var(--color-brand-red)',
                      background: 'var(--color-brand-red-soft)',
                      padding: '1px 5px',
                      borderRadius: 4
                    }}
                  >
                    {persona.cefrLevel}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--color-text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {persona.city} · {persona.role}
                  </span>
                </div>
              </div>

              {/* Call shortcut button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartCall(persona);
                }}
                style={{
                  ...btn(),
                  padding: '6px 8px',
                  borderRadius: 10,
                  fontSize: 11,
                  background: 'var(--color-brand-red-subtle)',
                  color: 'var(--color-brand-red)',
                  border: '1px solid var(--color-brand-red-border)',
                  flexShrink: 0
                }}
                title={lang === 'en' ? `Call ${persona.name}` : `Llamar a ${persona.name}`}
              >
                📞
              </button>
            </div>
          );
        })}
      </div>

      {/* Cultural Audio Story Player */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--color-border-tertiary)',
          background: 'var(--color-background-secondary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
            {lang === 'en' ? 'Cultural Audio Clip' : 'Clip de audio cultural'}
          </span>
          <span style={{ fontSize: 10, color: 'var(--color-brand-red)', fontWeight: 600 }}>
            {activeStory ? (lang === 'en' ? 'Playing…' : 'Reproduciendo…') : '🎧'}
          </span>
        </div>

        {CULTURAL_STORIES.slice(0, 1).map((story) => (
          <div
            key={story.id}
            onClick={() => handlePlayStory(story)}
            style={{
              padding: '9px 12px',
              borderRadius: 10,
              background: 'var(--color-background-primary)',
              border: '1px solid var(--color-border-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {story.title}
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: 'var(--color-text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {story.subtitle}
              </div>
            </div>

            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--color-brand-red)',
                color: 'var(--color-on-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                flexShrink: 0
              }}
            >
              {activeStory?.id === story.id ? '⏸' : '▶'}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
};
