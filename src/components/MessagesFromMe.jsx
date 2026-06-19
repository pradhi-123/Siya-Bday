import React, { useState } from 'react';
import { Mail, Heart, Info, Star, Compass, Smile, Eye, X, Sparkles } from 'lucide-react';
import { LETTERS } from '../config';

export default function MessagesFromMe() {
  const [activeLetter, setActiveLetter] = useState(null);
  const [isOpenAnimation, setIsOpenAnimation] = useState(false);

  const getIcon = (type) => {
    switch (type) {
      case 'heart': return <Heart size={18} />;
      case 'sparkles': return <Sparkles size={18} />;
      case 'star': return <Star size={18} />;
      case 'compass': return <Compass size={18} />;
      case 'info': return <Info size={18} />;
      default: return <Smile size={18} />;
    }
  };

  const openLetter = (letter) => {
    setActiveLetter(letter);
    setIsOpenAnimation(false);
    setTimeout(() => {
      setIsOpenAnimation(true);
    }, 100);
  };

  const closeLetter = () => {
    setIsOpenAnimation(false);
    setTimeout(() => {
      setActiveLetter(null);
    }, 300);
  };

  return (
    <div className="section-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h2 className="section-title serif-title">Letters From Me ✉️</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '50px', maxWidth: '600px', marginInline: 'auto' }}>
        Click on any envelope to open the letter. These are thoughts, memories, and wishes written straight from the heart.
      </p>

      {/* Envelope Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '30px',
        width: '100%',
        maxWidth: '960px',
        margin: '0 auto'
      }}>
        {LETTERS.map(letter => (
          <div
            key={letter.id}
            onClick={() => openLetter(letter)}
            className="glass-card envelope-card"
            style={{
              padding: '24px',
              borderRadius: '20px',
              border: '1.5px dashed var(--glass-border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'var(--glass-bg)',
              position: 'relative',
              transition: 'var(--transition-smooth)',
              boxShadow: '0 8px 25px var(--glass-shadow)'
            }}
          >
            {/* Sealed Stamp Heart Icon */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--accent-soft)',
              color: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
            }} className="stamp-icon">
              <Mail size={20} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {letter.title}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                {letter.teaser}
              </p>
            </div>

            <span style={{ fontSize: '0.78rem', color: 'var(--accent-color)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Open Envelope <Eye size={12} />
            </span>
          </div>
        ))}
      </div>

      {/* 3D Envelope Letter Opening Modal */}
      {activeLetter && (
        <div
          onClick={closeLetter}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(10, 8, 20, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100005,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '520px',
              width: '100%',
              perspective: '1200px'
            }}
          >
            {/* Main Letter Box */}
            <div
              className="glass-card"
              style={{
                width: '100%',
                background: activeLetter.bg,
                border: `2px solid ${activeLetter.borderColor}`,
                borderRadius: '24px',
                padding: '36px 28px',
                color: '#2d263b', 
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                transform: isOpenAnimation ? 'rotateX(0deg) translateY(0)' : 'rotateX(-25deg) translateY(60px)',
                opacity: isOpenAnimation ? 1 : 0,
                transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease',
                maxHeight: '80vh',
                overflowY: 'auto',
                position: 'relative'
              }}
            >
              {/* Close Button */}
              <button
                onClick={closeLetter}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0,0,0,0.06)',
                  border: 'none',
                  color: '#2d263b',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
              >
                <X size={16} />
              </button>

              {/* Letter Heading */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ color: activeLetter.borderColor }}>
                  {getIcon(activeLetter.type)}
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, borderBottom: `1px solid ${activeLetter.borderColor}`, paddingBottom: '4px', flexGrow: 1 }}>
                  {activeLetter.title}
                </h3>
              </div>

              {/* Letter Body Text */}
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '1rem',
                lineHeight: 1.7,
                whiteSpace: 'pre-line',
                color: '#3c324d',
                paddingInline: '4px'
              }}>
                {activeLetter.content}
              </p>

              {/* Letter Signature */}
              <div style={{ marginTop: '28px', textAlign: 'right', fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontStyle: 'italic', fontWeight: 600, color: '#2d263b' }}>
                With appreciation, <br />
                Your Best Friend ❤️
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .envelope-card:hover {
          transform: translateY(-8px) scale(1.03);
          border-color: var(--accent-color);
          box-shadow: 0 15px 35px rgba(168, 85, 247, 0.15);
        }
        .envelope-card:hover .stamp-icon {
          transform: scale(1.1) rotate(5deg);
          color: var(--pink-color);
        }
      `}</style>
    </div>
  );
}
