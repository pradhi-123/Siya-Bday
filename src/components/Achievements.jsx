import React from 'react';
import { BookOpen, Award, Medal, Target, Heart } from 'lucide-react';
import { ACHIEVEMENTS_LIST } from '../config';

export default function Achievements() {
  const getIcon = (type) => {
    switch (type) {
      case 'book': return <BookOpen size={20} />;
      case 'award': return <Award size={20} />;
      case 'medal': return <Medal size={20} />;
      case 'target': return <Target size={20} />;
      default: return <Heart size={20} />;
    }
  };

  return (
    <div className="section-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h2 className="section-title serif-title">Achievements & Strengths 🏆</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '50px', maxWidth: '600px', marginInline: 'auto' }}>
        Celebrating her academic growth, creative talents, personal milestones, and the glowing path to her future ambitions.
      </p>

      {/* Two-Column Responsive Layout */}
      <div className="achievements-layout" style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        gap: '36px',
        width: '100%',
        maxWidth: '1100px',
        margin: '0 auto',
        alignItems: 'start'
      }}>
        {/* Left Column: Achievements List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {ACHIEVEMENTS_LIST.map((ach, idx) => (
            <div
              key={idx}
              className="glass-card achievement-card"
              style={{
                padding: '24px',
                borderRadius: '20px',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
                background: 'var(--glass-bg)',
                boxShadow: '0 8px 32px var(--glass-shadow)',
                transition: 'var(--transition-smooth)'
              }}
            >
              {/* Glowing border effect helper */}
              <div className="glow-border" />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--accent-soft)',
                  color: ach.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getIcon(ach.type)}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {ach.date}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: ach.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {ach.subtitle}
                </span>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginTop: '4px', fontWeight: 600 }}>
                  {ach.title}
                </h3>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {ach.description}
              </p>
            </div>
          ))}
        </div>

        {/* Right Column: Video Showcase Card */}
        <div
          className="glass-card video-showcase-card"
          style={{
            position: 'sticky',
            top: '100px',
            padding: '24px',
            borderRadius: '24px',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            boxShadow: '0 8px 32px var(--glass-shadow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            textAlign: 'center',
            transition: 'var(--transition-smooth)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem' }}>🌟</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }} className="serif-title">
              Momentum Reel
            </h3>
          </div>

          <div style={{
            width: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            position: 'relative',
            background: '#000'
          }}>
            <video
              src="/photos/ach.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                display: 'block',
                objectFit: 'cover'
              }}
            />
          </div>

          <div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '8px 0 0 0', fontStyle: 'italic' }}>
              "Always moving forward, shining bright, and mastering the volleyball court with confidence."
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .achievement-card {
          z-index: 2;
        }
        .achievement-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(168, 85, 247, 0.2);
          border-color: var(--accent-color);
        }
        .achievement-card::before {
          content: '';
          position: absolute;
          top: -2px; left: -2px; right: -2px; bottom: -2px;
          background: linear-gradient(135deg, var(--accent-color), var(--pink-color));
          z-index: -1;
          border-radius: 22px;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .achievement-card:hover::before {
          opacity: 0.35;
        }
        .video-showcase-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(168, 85, 247, 0.15);
          border-color: var(--accent-color);
        }
        @media (max-width: 900px) {
          .achievements-layout {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .video-showcase-card {
            position: static !important;
            order: -1;
          }
        }
      `}</style>
    </div>
  );
}
