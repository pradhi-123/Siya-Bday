import React, { useState } from 'react';
import { User, Sparkles, Trophy, Heart, Quote, HelpCircle, Compass, Smile } from 'lucide-react';
import { ABOUT_HER } from '../config';

export default function AboutHer() {
  const cards = ABOUT_HER.CARDS;
  const [flippedCards, setFlippedCards] = useState({});

  const toggleFlip = (index) => {
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'user': return <User size={24} />;
      case 'sparkles': return <Sparkles size={24} />;
      case 'trophy': return <Trophy size={24} />;
      case 'heart': return <Heart size={24} />;
      case 'quote': return <Quote size={24} />;
      case 'compass': return <Compass size={24} />;
      case 'question': return <HelpCircle size={24} />;
      default: return <Smile size={24} />;
    }
  };

  return (
    <div className="section-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h2 className="section-title serif-title">About Her 🌸</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '600px', marginInline: 'auto', fontSize: '1.1rem' }}>
        {ABOUT_HER.INTRO_SUBTITLE}
      </p>

      {/* Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '24px',
        width: '100%',
        perspective: '1000px'
      }}>
        {cards.map((card, idx) => {
          const isFlipped = !!flippedCards[idx];
          return (
            <div
              key={idx}
              onClick={() => toggleFlip(idx)}
              style={{
                height: '240px',
                cursor: 'pointer',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isFlipped ? 'rotateY(180deg)' : 'none'
              }}
              className="card-container"
            >
              {/* Card Front */}
              <div
                className="glass-card"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '24px',
                  textAlign: 'center',
                  gap: '16px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--glass-bg)',
                  borderRadius: '20px'
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--accent-soft)',
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px'
                }}>
                  {getIcon(card.type)}
                </div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {card.title}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Click to read ✨
                </span>
              </div>

              {/* Card Back */}
              <div
                className="glass-card"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '28px',
                  textAlign: 'center',
                  border: '1px solid var(--glass-border)',
                  background: 'linear-gradient(135deg, rgba(30, 25, 50, 0.8) 0%, rgba(15, 11, 28, 0.9) 100%)',
                  borderRadius: '20px'
                }}
              >
                <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-color)', marginBottom: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Smile size={16} /> {card.title}
                </h4>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {card.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
