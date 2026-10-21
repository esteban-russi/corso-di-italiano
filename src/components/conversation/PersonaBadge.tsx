import React from 'react';
import type { Persona, CharacterSpeakingState } from '../../types/conversation';

interface PersonaBadgeProps {
  persona: Persona;
  size?: 'sm' | 'md' | 'lg' | 'call';
  speakingState?: CharacterSpeakingState;
  style?: React.CSSProperties;
}

export const PersonaBadge: React.FC<PersonaBadgeProps> = ({
  persona,
  size = 'md',
  speakingState = 'idle',
  style = {}
}) => {
  const isSpeaking = speakingState === 'speaking';
  const isListening = speakingState === 'listening';
  const isThinking = speakingState === 'thinking';

  // Extract initials
  const initials = persona.fullName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sizeDimensions = {
    sm: { width: 40, height: 40, fontSize: 13, radius: 12 },
    md: { width: 48, height: 48, fontSize: 16, radius: 14 },
    lg: { width: 64, height: 64, fontSize: 22, radius: 18 },
    call: { width: 170, height: 170, fontSize: 48, radius: 36 }
  }[size];

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: sizeDimensions.width,
        height: sizeDimensions.height,
        ...style
      }}
    >
      {/* Outer audio pulse ring when speaking in call */}
      {isSpeaking && (
        <>
          <span
            style={{
              position: 'absolute',
              inset: -6,
              borderRadius: sizeDimensions.radius + 6,
              background: 'var(--color-brand-red-soft)',
              opacity: 0.6,
              animation: 'pulseGlow 1.5s ease-in-out infinite'
            }}
          />
          <span
            style={{
              position: 'absolute',
              inset: -12,
              borderRadius: sizeDimensions.radius + 12,
              border: '2px solid var(--color-brand-red-border)',
              opacity: 0.4,
              animation: 'pulseGlow 2s ease-in-out infinite'
            }}
          />
        </>
      )}

      {isListening && (
        <span
          style={{
            position: 'absolute',
            inset: -6,
            borderRadius: sizeDimensions.radius + 6,
            border: '2px dashed var(--color-success)',
            opacity: 0.7,
            animation: 'pulseGlow 1.8s ease-in-out infinite'
          }}
        />
      )}

      {isThinking && (
        <span
          style={{
            position: 'absolute',
            inset: -6,
            borderRadius: sizeDimensions.radius + 6,
            border: '2px solid var(--color-primary)',
            opacity: 0.7,
            animation: 'pulseGlow 1.2s ease-in-out infinite'
          }}
        />
      )}

      {/* Monogram Box */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: sizeDimensions.radius,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: isSpeaking ? 'var(--color-brand-red)' : 'var(--color-background-secondary)',
          color: isSpeaking ? 'var(--color-on-primary)' : 'var(--color-text-primary)',
          border: `1px solid ${isSpeaking ? 'var(--color-brand-red)' : 'var(--color-border-secondary)'}`,
          boxShadow: isSpeaking ? 'var(--shadow-md)' : 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden',
          userSelect: 'none',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Subtle city initial watermark in background */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            fontSize: sizeDimensions.width * 0.9,
            fontWeight: 900,
            color: 'var(--color-text-primary)',
            opacity: 0.04,
            pointerEvents: 'none'
          }}
        >
          {persona.city[0]}
        </span>

        {/* Initials */}
        <span
          style={{
            position: 'relative',
            fontSize: sizeDimensions.fontSize,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-sans)'
          }}
        >
          {initials}
        </span>

        {/* City Pill for large badge */}
        {size === 'call' && (
          <span
            style={{
              position: 'relative',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: 6,
              padding: '2px 10px',
              borderRadius: 12,
              background: isSpeaking ? 'var(--color-brand-red-hover)' : 'var(--color-brand-red-subtle)',
              color: isSpeaking ? 'var(--color-on-primary)' : 'var(--color-brand-red)'
            }}
          >
            {persona.city}
          </span>
        )}
      </div>

      {/* Online indicator dot */}
      {size !== 'call' && persona.isOnline && (
        <span
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'var(--color-success)',
            border: '2px solid var(--color-background-primary)',
            boxShadow: 'var(--shadow-sm)'
          }}
          title={persona.name}
        />
      )}
    </div>
  );
};
