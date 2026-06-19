import React, { useState } from 'react';
import { Compass, Book, Globe, Heart, Star, Sparkles, Plus } from 'lucide-react';
import { DREAM_BOARD } from '../config';

export default function DreamBoard() {
  const dreamCards = DREAM_BOARD.CARDS;
  const starAffirmations = DREAM_BOARD.AFFIRMATIONS;
  const [activeStarQuote, setActiveStarQuote] = useState(null);

  const getIcon = (type) => {
    switch (type) {
      case 'compass': return <Compass size={22} />;
      case 'book': return <Book size={22} />;
      case 'globe': return <Globe size={22} />;
      default: return <Heart size={22} />;
    }
  };

  const clickStar = (index) => {
    setActiveStarQuote(starAffirmations[index % starAffirmations.length]);
    setTimeout(() => {
      setActiveStarQuote(null);
    }, 4000);
  };

  return (
    <div 
      className="section-container" 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        background: 'linear-gradient(180deg, rgba(12, 9, 28, 0.85) 0%, rgba(20, 15, 40, 0.95) 100%)',
        color: '#f3e8ff',
        paddingBlock: '100px',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)',
        position: 'relative'
      }}
    >
      {/* Dreamy Background Assets (Clouds, Stars) */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
        {/* Animated Moon */}
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '10%',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          boxShadow: '15px 15px 0 0 #fff3c4',
          opacity: 0.85,
          animation: 'float 8s infinite ease-in-out'
        }} />

        {/* Floating Clouds */}
        <div className="dream-cloud c1" style={{ position: 'absolute', top: '15%', left: '-10%', opacity: 0.15, fontSize: '4rem', animation: 'cloudMove 35s linear infinite' }}>☁️</div>
        <div className="dream-cloud c2" style={{ position: 'absolute', bottom: '20%', right: '-10%', opacity: 0.12, fontSize: '5rem', animation: 'cloudMoveReverse 40s linear infinite' }}>☁️</div>
        
        {/* Clickable Floating Stars */}
        {[
          { top: '22%', left: '15%', delay: '0.2s', id: 0 },
          { top: '35%', left: '80%', delay: '1.5s', id: 1 },
          { top: '70%', left: '10%', delay: '0.8s', id: 2 },
          { top: '80%', left: '75%', delay: '2.1s', id: 3 },
          { top: '50%', left: '88%', delay: '1.1s', id: 4 }
        ].map(st => (
          <button
            key={st.id}
            onClick={() => clickStar(st.id)}
            style={{
              position: 'absolute',
              top: st.top,
              left: st.left,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#fef08a',
              animation: `pulseStar 3s infinite ease-in-out`,
              animationDelay: st.delay,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Click for a whisper from the stars..."
          >
            <Star size={24} fill="#fef08a" />
          </button>
        ))}
      </div>

      <div style={{ zIndex: 2, position: 'relative', width: '100%' }}>
        <h2 className="section-title serif-title" style={{ background: 'linear-gradient(135deg, #d8b4fe 0%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Dream Board & Vision Board 🌌
        </h2>
        <p style={{ textAlign: 'center', color: '#c084fc', marginBottom: '40px', maxWidth: '600px', marginInline: 'auto' }}>
          A visual board of her future ambitions, target milestones, and places she wants to travel. Click the glowing stars to read inspirational thoughts.
        </p>

        {/* Floating Star Affirmation Banner */}
        {activeStarQuote && (
          <div 
            className="glass-card" 
            style={{
              maxWidth: '480px',
              width: '90%',
              margin: '0 auto 30px auto',
              padding: '12px 20px',
              borderRadius: '30px',
              background: 'rgba(168, 85, 247, 0.25)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              color: '#fff',
              textAlign: 'center',
              fontSize: '0.95rem',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
              animation: 'fadeInUp 0.3s ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Sparkles size={16} color="#fef08a" />
            <span>{activeStarQuote}</span>
          </div>
        )}

        {/* Board Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto',
          paddingInline: '10px'
        }}>
          {dreamCards.map((card, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                background: card.bgGrad,
                padding: '28px',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'left',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'var(--transition-smooth)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getIcon(card.type)}
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 600 }}>
                  {card.title}
                </h3>
              </div>

              <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {card.items.map((item, i) => (
                  <li 
                    key={i} 
                    style={{ 
                      fontSize: '0.9rem', 
                      color: '#d8b4fe', 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '8px',
                      lineHeight: 1.4
                    }}
                  >
                    <Plus size={14} style={{ color: card.color, marginTop: '3px', flexShrink: 0 }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes cloudMove {
          from { transform: translateX(-10%); }
          to { transform: translateX(110vw); }
        }
        @keyframes cloudMoveReverse {
          from { transform: translateX(110vw); }
          to { transform: translateX(-10%); }
        }
        @keyframes pulseStar {
          0%, 100% { transform: scale(1); opacity: 0.6; filter: drop-shadow(0 0 2px #fef08a); }
          50% { transform: scale(1.25); opacity: 1; filter: drop-shadow(0 0 8px #fef08a); }
        }
        @keyframes fadeInUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
