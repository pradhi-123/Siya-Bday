import React, { useState } from 'react';
import { Zap, RefreshCw, MessageSquare } from 'lucide-react';
import { FUNNY_QUOTES, FUNNY_POLAROIDS, handleImageFallback } from '../config';

export default function FunnyMoments() {
  const [currentQuote, setCurrentQuote] = useState(FUNNY_QUOTES[0]);
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiArray, setConfettiArray] = useState([]);

  const generateNewQuote = () => {
    const filterList = FUNNY_QUOTES.filter(j => j !== currentQuote);
    const randomJoke = filterList[Math.floor(Math.random() * filterList.length)];
    setCurrentQuote(randomJoke);
    triggerConfetti();
  };

  const triggerConfetti = () => {
    const newConfetti = [];
    const colors = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];
    
    for (let i = 0; i < 45; i++) {
      newConfetti.push({
        id: i + Math.random(),
        x: Math.random() * 100, 
        y: 80, 
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * 360,
        speed: 2 + Math.random() * 6,
        size: 5 + Math.random() * 8,
        delay: Math.random() * 0.2
      });
    }

    setConfettiArray(newConfetti);
    setConfettiActive(true);

    setTimeout(() => {
      setConfettiActive(false);
      setConfettiArray([]);
    }, 2500);
  };

  return (
    <div className="section-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
      <h2 className="section-title serif-title">Funny Moments & Inside Jokes 🤪</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '600px', marginInline: 'auto' }}>
        A collection of chaotic laughs, inside jokes, and daily banter. Click the quote generator below to raise the chaos level!
      </p>

      {/* Confetti Overlay */}
      {confettiActive && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100004 }}>
          {confettiArray.map(p => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.x}vw`,
                bottom: `${p.y}vh`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: p.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                transform: `rotate(${p.angle}deg)`,
                animation: `confettiFall 2s forwards ease-out`,
                animationDelay: `${p.delay}s`
              }}
            />
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', position: 'relative', minHeight: '450px' }}>
        
        {/* Quote Generator Box */}
        <div 
          className="glass-card" 
          style={{ 
            maxWidth: '550px', 
            width: '100%', 
            padding: '30px', 
            borderRadius: '24px', 
            textAlign: 'center', 
            boxShadow: '0 10px 30px var(--glass-shadow)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            zIndex: 10
          }}
        >
          <div style={{
            background: 'var(--accent-soft)',
            color: 'var(--accent-color)',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={22} className="animate-float" />
          </div>

          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.4 }}>
            "{currentQuote}"
          </h3>

          <button 
            className="btn-primary" 
            onClick={generateNewQuote}
            style={{ padding: '10px 20px', fontSize: '0.9rem', gap: '6px' }}
          >
            Generate Chaos <RefreshCw size={14} />
          </button>
        </div>

        {/* Scattered Polaroids Layout */}
        <div className="polaroids-wrapper" style={{ position: 'relative', width: '100%', height: '360px', marginTop: '20px' }}>
          {FUNNY_POLAROIDS.map((p, idx) => (
            <div
              key={idx}
              className="glass-card polaroid-item"
              style={{
                position: 'absolute',
                left: p.left || 'auto',
                right: p.right || 'auto',
                top: p.top || '10px',
                transform: `rotate(${p.angle})`,
                padding: '12px 12px 24px 12px',
                borderRadius: '12px',
                width: '240px',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                zIndex: 5,
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
              onClick={triggerConfetti}
            >
              {/* Comic Speech Bubble */}
              <div 
                className="glass-card speech-bubble"
                style={{
                  position: 'absolute',
                  top: '-45px',
                  left: '20px',
                  background: 'rgba(255,255,255,0.92)',
                  color: '#2d263b',
                  fontSize: '0.78rem',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontWeight: 500,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  border: '1.5px solid var(--accent-color)'
                }}
              >
                <MessageSquare size={10} color="var(--accent-color)" /> {p.bubble}
              </div>

              <img 
                src={p.img} 
                alt="Fun memory" 
                onError={(e) => handleImageFallback(e, idx === 0 ? 'bestie' : idx === 1 ? 'girl' : 'scrapbook')}
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
              />
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '12px', lineHeight: 1.4 }}>
                {p.caption}
              </p>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        .polaroid-item:hover {
          transform: rotate(0deg) scale(1.08) translateY(-10px) !important;
          z-index: 12 !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.18) !important;
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @media (max-width: 768px) {
          .polaroids-wrapper {
            height: auto !important;
            display: flex;
            flex-direction: column;
            alignItems: center;
            gap: 40px;
          }
          .polaroid-item {
            position: static !important;
            transform: none !important;
            width: 280px !important;
          }
          .polaroid-item:hover {
            transform: scale(1.03) !important;
          }
        }
      `}</style>
    </div>
  );
}
