import React, { useState } from 'react';
import { useLang } from '../../context/LangContext';
import type { Persona } from '../../types/conversation';
import { PersonaBadge } from './PersonaBadge';
import { speechService } from '../../utils/speech';
import { btn } from '../../utils';

interface PersonaProfileModalProps {
  persona: Persona;
  isOpen: boolean;
  onClose: () => void;
  onStartCall: () => void;
}

export const PersonaProfileModal: React.FC<PersonaProfileModalProps> = ({
  persona,
  isOpen,
  onClose,
  onStartCall
}) => {
  const { lang } = useLang();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!isOpen) return null;

  const handlePlayVoiceSample = async () => {
    setIsPlayingAudio(true);
    await speechService.speakSmart(persona.sampleAudioText, {
      provider: 'gemini_live',
      voiceName: persona.voiceId,
      gender: persona.voiceGender,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false)
    });
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
        background: 'var(--color-scrim)',
        backdropFilter: 'blur(4px)',
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--color-background-primary)',
          border: '1px solid var(--color-border-primary)',
          borderRadius: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Header with Italian Red Accent */}
        <div
          style={{
            position: 'relative',
            padding: '20px 24px',
            background: 'var(--color-brand-red)',
            color: 'var(--color-on-primary)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <PersonaBadge persona={persona} size="lg" speakingState={isPlayingAudio ? 'speaking' : 'idle'} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--color-on-primary)' }}>
                  {persona.fullName}
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: 'var(--color-brand-red-hover)',
                    color: 'var(--color-on-primary)'
                  }}
                >
                  {persona.cefrLevel}
                </span>
              </div>
              <p style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>{persona.role}</p>
              <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>📍</span>
                <span>{persona.city}, {persona.region}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              ...btn(),
              padding: '6px 10px',
              borderRadius: 8,
              fontSize: 14,
              background: 'var(--color-brand-red-hover)',
              color: 'var(--color-on-primary)',
              border: 'none'
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Motto & Philosophy */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 14,
              background: 'var(--color-brand-red-subtle)',
              border: '1px solid var(--color-brand-red-border)'
            }}
          >
            <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-brand-red)', marginBottom: 4 }}>
              {lang === 'en' ? 'Motto & Philosophy' : 'Lema y filosofía'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, fontStyle: 'italic', color: 'var(--color-text-primary)' }}>
              &ldquo;{persona.nativeSaying}&rdquo;
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {persona.nativeSayingTranslation}
            </div>
          </div>

          {/* Bio */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              {lang === 'en' ? 'About' : 'Acerca de'}
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-primary)' }}>
              {persona.bio}
            </p>
          </div>

          {/* Dialect and Style */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 12,
              background: 'var(--color-background-secondary)',
              border: '1px solid var(--color-border-tertiary)'
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-primary)', marginBottom: 4 }}>
              {lang === 'en' ? 'Language Specialty' : 'Especialidad lingüística'}
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              {persona.dialectSpecialty}
            </p>
          </div>

          {/* Topics */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              {lang === 'en' ? 'Conversation Topics' : 'Temas de conversación'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {persona.topics.map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: 'var(--color-background-secondary)',
                    border: '1px solid var(--color-border-tertiary)',
                    fontSize: 11.5,
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Voice sample preview */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 12,
              background: 'var(--color-background-secondary)',
              border: '1px solid var(--color-border-tertiary)'
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {lang === 'en' ? 'Assigned Voice Model' : 'Modelo de voz asignado'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                {persona.voiceId}
              </div>
            </div>

            <button
              onClick={handlePlayVoiceSample}
              disabled={isPlayingAudio}
              style={{
                ...btn(),
                padding: '7px 14px',
                borderRadius: 10,
                fontSize: 11.5,
                fontWeight: 700,
                background: 'var(--color-brand-red)',
                color: 'var(--color-on-primary)',
                border: 'none',
                opacity: isPlayingAudio ? 0.6 : 1
              }}
            >
              {isPlayingAudio ? '⏳' : '🔊'} {lang === 'en' ? 'Listen' : 'Escuchar'}
            </button>
          </div>
        </div>

        {/* Modal Actions (Audio Call Only - NO videocall button) */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--color-border-tertiary)',
            background: 'var(--color-background-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10
          }}
        >
          <button
            onClick={() => {
              onClose();
              onStartCall();
            }}
            style={{
              ...btn(),
              padding: '9px 20px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 800,
              background: 'var(--color-brand-red)',
              color: 'var(--color-on-primary)',
              border: 'none',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>📞</span>
            <span>{lang === 'en' ? 'Call' : 'Llamar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
