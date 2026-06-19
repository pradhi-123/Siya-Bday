import React, { useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { CONFIG } from '../config';

export default function LockScreen({ onUnlock }) {
  const [passcode, setPasscode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isAnimatingUnlock, setIsAnimatingUnlock] = useState(false);
  const [fireworks, setFireworks] = useState([]);

  const correctCode = CONFIG.VAULT_PASSCODE;

  const handleKeyPress = (num) => {
    setErrorMsg("");
    if (isAnimatingUnlock) return;
    if (passcode.length < 4) {
      const newCode = passcode + num;
      setPasscode(newCode);
      
      // Auto submit on 4 digits
      if (newCode === correctCode) {
        triggerUnlock();
      } else if (newCode.length === 4) {
        setTimeout(() => {
          if (newCode !== correctCode) {
            setErrorMsg("Incorrect secret code! Try again 🌸");
            setPasscode("");
          }
        }, 350);
      }
    }
  };

  const handleBackspace = () => {
    if (isAnimatingUnlock) return;
    setPasscode(prev => prev.slice(0, -1));
    setErrorMsg("");
  };

  const triggerUnlock = () => {
    setIsAnimatingUnlock(true);
    triggerFireworks();
    
    // Smooth delay for animation
    setTimeout(() => {
      onUnlock();
    }, 1500);
  };

  const triggerFireworks = () => {
    const newExplosion = [];
    const colors = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#fef08a'];
    
    for (let i = 0; i < 70; i++) {
      newExplosion.push({
        id: i + Math.random(),
        x: 50, 
        y: 40,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.5) * 16,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 10
      });
    }
    setFireworks(newExplosion);

    let duration = 35;
    const interval = setInterval(() => {
      setFireworks(prev => 
        prev.map(p => ({
          ...p,
          x: p.x + p.vx * 0.45,
          y: p.y + p.vy * 0.45,
          vy: p.vy + 0.12, 
          size: Math.max(0.1, p.size - 0.15)
        }))
      );
      duration--;
      if (duration <= 0) {
        clearInterval(interval);
        setFireworks([]);
      }
    }, 40);
  };

  return (
    <div 
      className="lock-screen-container" 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'var(--bg-solid)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999999, 
        overflow: 'hidden',
        transition: 'opacity 0.6s ease',
        opacity: isAnimatingUnlock ? 0.9 : 1
      }}
    >
      {/* Background glowing rings */}
      <div style={{
        position: 'absolute',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, rgba(168,85,247,0.06) 70%, transparent 100%)',
        borderRadius: '50%',
        filter: 'blur(35px)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* Fireworks Explosion Overlay */}
      {fireworks.length > 0 && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 10000000 }}>
          {fireworks.map(p => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.x}vw`,
                top: `${p.y}vh`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: p.color,
                borderRadius: '50%',
                boxShadow: `0 0 12px ${p.color}`,
                transition: 'all 0.04s linear'
              }}
            />
          ))}
        </div>
      )}

      {/* Lock Panel Wrapper */}
      <div 
        className={`glass-card ${isAnimatingUnlock ? 'unlocked-fade-scale' : ''}`}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '24px', 
          maxWidth: '400px', 
          width: '90%', 
          padding: '44px 32px',
          borderRadius: '32px',
          border: '1.5px solid var(--glass-border)',
          boxShadow: '0 20px 50px var(--glass-shadow)',
          zIndex: 3,
          textAlign: 'center',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <div>
          <h1 className="serif-title" style={{ fontSize: '1.9rem', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', justify: 'center', gap: '8px' }}>
            Memory Museum 🌸
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.4, margin: 0 }}>
            Enter the secret passcode to unlock {CONFIG.HER_NAME}'s custom tribute website.
          </p>
        </div>

        {/* Padlock / Unlocked Icon Wrapper */}
        <div 
          className={isAnimatingUnlock ? 'pulse-unlock' : ''}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: isAnimatingUnlock ? 'rgba(16, 185, 129, 0.15)' : 'var(--accent-soft)',
            color: isAnimatingUnlock ? 'var(--success-color)' : 'var(--accent-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: isAnimatingUnlock ? '2px solid var(--success-color)' : '1px solid var(--glass-border)',
            transition: 'all 0.4s ease'
          }}
        >
          {isAnimatingUnlock ? <Sparkles size={26} /> : <Lock size={24} />}
        </div>

        {/* Passcode dots indicator */}
        <div style={{ display: 'flex', gap: '18px', margin: '8px 0' }}>
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`passcode-dot ${passcode.length > idx ? 'active' : ''}`}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '2px solid var(--accent-color)',
                background: passcode.length > idx ? 'var(--accent-color)' : 'transparent',
                boxShadow: passcode.length > idx ? '0 0 10px var(--accent-color)' : 'none',
                transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.3)'
              }}
            />
          ))}
        </div>

        {/* Numerical Pad */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px',
          width: '100%',
          maxWidth: '260px'
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="keypad-btn-glass"
              style={{
                height: '52px',
                borderRadius: '16px',
                color: 'var(--text-primary)',
                fontSize: '1.25rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleBackspace}
            className="keypad-btn-clear"
            style={{
              height: '52px',
              borderRadius: '16px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
          <button
            onClick={() => handleKeyPress(0)}
            className="keypad-btn-glass"
            style={{
              height: '52px',
              borderRadius: '16px',
              color: 'var(--text-primary)',
              fontSize: '1.25rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            0
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.3rem' }} className="animate-float">
            🧸
          </div>
        </div>

        {errorMsg && (
          <span className="shake-error" style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600, marginTop: '8px' }}>
            {errorMsg}
          </span>
        )}
      </div>

      <style>{`
        @keyframes cuteFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(8deg); }
        }
        .passcode-dot.active {
          transform: scale(1.2);
          animation: dotPop 0.25s ease-out;
        }
        @keyframes dotPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.4); }
          100% { transform: scale(1.2); }
        }
        .keypad-btn-glass {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 100%) !important;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1.5px solid rgba(255, 255, 255, 0.25) !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1), inset 0 1px 1.5px rgba(255,255,255,0.25) !important;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.2) !important;
        }
        .keypad-btn-glass:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0.08) 100%) !important;
          border-color: rgba(255, 255, 255, 0.45) !important;
          transform: translateY(-3px) scale(1.06) !important;
          box-shadow: 0 8px 20px rgba(168, 85, 247, 0.22), inset 0 1px 2px rgba(255, 255, 255, 0.4) !important;
        }
        .keypad-btn-glass:active {
          transform: translateY(1px) scale(0.95) !important;
        }
        .keypad-btn-clear {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(239, 68, 68, 0.06) 100%) !important;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1.5px solid rgba(239, 68, 68, 0.25) !important;
          color: #ef4444 !important;
          font-size: 0.85rem !important;
          font-weight: 700 !important;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.05) !important;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.2) !important;
        }
        .keypad-btn-clear:hover {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.28) 0%, rgba(239, 68, 68, 0.1) 100%) !important;
          border-color: rgba(239, 68, 68, 0.38) !important;
          transform: translateY(-3px) scale(1.06) !important;
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.18) !important;
        }
        .keypad-btn-clear:active {
          transform: translateY(1px) scale(0.95) !important;
        }
        .unlocked-fade-scale {
          transform: scale(0.9) !important;
          opacity: 0;
          box-shadow: 0 0 80px rgba(16, 185, 129, 0.4) !important;
          border-color: var(--success-color) !important;
        }
        .pulse-unlock {
          animation: pulseGreen 1s infinite alternate;
        }
        @keyframes pulseGreen {
          0% { box-shadow: 0 0 0 0px rgba(16, 185, 129, 0.4); }
          100% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
        }
        .shake-error {
          animation: shake 0.4s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
