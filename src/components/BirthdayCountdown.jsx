import React, { useState, useEffect, useRef } from 'react';
import { Gift, Clock, Sparkles, Heart, Cake, Star, Smile } from 'lucide-react';
import { CONFIG, COMPLIMENTS } from '../config';

export default function BirthdayCountdown() {
  const getNextBirthday = () => {
    const currentYear = new Date().getFullYear();
    const month = CONFIG.BIRTHDAY_MONTH;
    const day = CONFIG.BIRTHDAY_DAY;
    let bday = new Date(`${month} ${day}, ${currentYear} 00:00:00`);
    if (bday.getTime() < Date.now()) {
      bday = new Date(`${month} ${day}, ${currentYear + 1} 00:00:00`);
    }
    return bday;
  };

  const [targetDate, setTargetDate] = useState(getNextBirthday());
  const [timeLeft, setTimeLeft] = useState({
    months: 0,
    days: 0,
    hours: 0,
    seconds: 0
  });

  const [activeCompliment, setActiveCompliment] = useState(COMPLIMENTS[0]);
  const [heartFloater, setHeartFloater] = useState(false);
  const [balloonsPopped, setBalloonsPopped] = useState(0);
  const [isDemoBdayMode, setIsDemoBdayMode] = useState(false);

  // Particle systems
  const [popParticles, setPopParticles] = useState([]);
  const [balloons, setBalloons] = useState([
    { id: 1, left: '10%', bottom: -100, color: 'rgba(168, 85, 247, 0.65)', size: 65, speed: 1.1 },
    { id: 2, left: '25%', bottom: -350, color: 'rgba(236, 72, 153, 0.65)', size: 85, speed: 0.8 },
    { id: 3, left: '45%', bottom: -600, color: 'rgba(59, 130, 246, 0.65)', size: 70, speed: 1.3 },
    { id: 4, left: '70%', bottom: -220, color: 'rgba(16, 185, 129, 0.65)', size: 80, speed: 0.9 },
    { id: 5, left: '85%', bottom: -480, color: 'rgba(245, 158, 11, 0.65)', size: 75, speed: 1.0 }
  ]);

  // Birthday check: June 23 (month is 5 because 0-indexed)
  const isActuallyBirthday = () => {
    const today = new Date();
    return today.getMonth() === 5 && today.getDate() === 23;
  };

  const showBirthdayGreeting = isActuallyBirthday() || isDemoBdayMode;

  // Synthesize balloon pop sound (Web Audio API)
  const playPopSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.08);

      gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (err) {
      console.warn("AudioContext synthesis is blocked or unsupported: ", err);
    }
  };

  // Live countdown calculation
  useEffect(() => {
    const interval = setInterval(() => {
      const difference = targetDate.getTime() - Date.now();
      
      if (difference <= 0) {
        clearInterval(interval);
        setTargetDate(getNextBirthday());
      } else {
        const seconds = Math.floor((difference / 1000) % 60);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        
        const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
        const months = Math.floor(totalDays / 30.4);
        const days = Math.floor(totalDays % 30.4);

        setTimeLeft({ months, days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  // Balloon animator loop
  useEffect(() => {
    let animationFrameId;
    const updateBalloons = () => {
      setBalloons(prev => 
        prev.map(b => {
          let nextBottom = b.bottom + b.speed;
          if (nextBottom > window.innerHeight + 100) {
            // Reset to bottom with random properties
            return {
              ...b,
              bottom: -150 - Math.random() * 100,
              left: `${5 + Math.random() * 85}%`,
              speed: 0.7 + Math.random() * 0.8,
              size: 55 + Math.random() * 30
            };
          }
          return { ...b, bottom: nextBottom };
        })
      );
      animationFrameId = requestAnimationFrame(updateBalloons);
    };

    animationFrameId = requestAnimationFrame(updateBalloons);
    return () => cancelAnimationFrame(updateBalloons);
  }, []);

  // Pop balloon handler
  const handlePopBalloon = (id, left, bottom, color, e) => {
    e.stopPropagation();
    
    // Play Pop sound
    playPopSound();
    
    // Increment score
    setBalloonsPopped(prev => prev + 1);

    // Get cursor position or relative position
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = rect.left + rect.width / 2;
    const clickY = rect.top + rect.height / 2;

    // Spawn pop particles
    const particles = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const velocity = 3 + Math.random() * 4;
      particles.push({
        id: Math.random() + i,
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color: color,
        size: 4 + Math.random() * 6
      });
    }

    setPopParticles(prev => [...prev, ...particles]);

    // Reset the popped balloon instantly to the bottom
    setBalloons(prev => 
      prev.map(b => 
        b.id === id 
          ? {
              ...b,
              bottom: -150 - Math.random() * 100,
              left: `${5 + Math.random() * 85}%`,
              speed: 0.7 + Math.random() * 0.8,
              size: 55 + Math.random() * 30
            }
          : b
      )
    );
  };

  // Particles updater loop
  useEffect(() => {
    if (popParticles.length === 0) return;
    const interval = setInterval(() => {
      setPopParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1, // gravity
            size: Math.max(0.1, p.size - 0.2)
          }))
          .filter(p => p.size > 0.5)
      );
    }, 20);

    return () => clearInterval(interval);
  }, [popParticles]);

  // Rotate compliment manually or automatically
  const triggerNextCompliment = () => {
    // Show heart floater
    setHeartFloater(true);
    setTimeout(() => setHeartFloater(false), 800);

    const filterList = COMPLIMENTS.filter(c => c !== activeCompliment);
    const randC = filterList[Math.floor(Math.random() * filterList.length)];
    setActiveCompliment(randC);
  };

  // Auto-rotate compliments every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      triggerNextCompliment();
    }, 8000);

    return () => clearInterval(interval);
  }, [activeCompliment]);

  return (
    <div className="section-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
      
      {/* Pop Particles Renderer */}
      {popParticles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            borderRadius: '50%',
            boxShadow: `0 0 6px ${p.color}`,
            pointerEvents: 'none',
            zIndex: 10000001
          }}
        />
      ))}

      {/* Floating Interactive Balloons */}
      {balloons.map(b => (
        <div
          key={b.id}
          onMouseDown={(e) => handlePopBalloon(b.id, b.left, b.bottom, b.color, e)}
          onTouchStart={(e) => handlePopBalloon(b.id, b.left, b.bottom, b.color, e)}
          style={{
            position: 'absolute',
            left: b.left,
            bottom: `${b.bottom}px`,
            width: `${b.size}px`,
            height: `${b.size * 1.25}px`,
            background: b.color,
            borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
            boxShadow: 'inset -8px -8px 16px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.06)',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'transform 0.1s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {/* Balloon Reflection */}
          <div style={{
            position: 'absolute',
            top: '12%',
            left: '18%',
            width: '15%',
            height: '15%',
            background: 'rgba(255,255,255,0.4)',
            borderRadius: '50%'
          }} />

          {/* Balloon Knot */}
          <div style={{
            position: 'absolute',
            bottom: '-5px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderBottom: `6px solid ${b.color}`
          }} />

          {/* String */}
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '1px',
            height: '30px',
            background: 'rgba(0,0,0,0.15)'
          }} />
        </div>
      ))}

      {/* Main Content Layout */}
      <div style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '36px', maxWidth: '850px', marginInline: 'auto', width: '100%' }}>
        
        {showBirthdayGreeting ? (
          /* ==============================================================
             SPECIAL BIRTHDAY CELEBRATION STATE (DYNAMIC & EMOTIONAL GREETING)
             ============================================================== */
          <div 
            className="glass-card bday-card-container"
            style={{
              width: '100%',
              padding: '40px 32px',
              borderRadius: '28px',
              border: '1.5px solid var(--accent-color)',
              background: 'var(--glass-bg)',
              boxShadow: '0 20px 50px rgba(168, 85, 247, 0.25)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              animation: 'bounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <div className="sparkle-crown" style={{ animation: 'float 4s infinite ease-in-out' }}>
              <Cake size={56} color="var(--pink-color)" style={{ filter: 'drop-shadow(0 0 10px var(--pink-color))' }} />
            </div>

            <div>
              <h1 className="serif-title" style={{
                fontSize: '3.2rem',
                margin: '8px 0',
                background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--pink-color) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                Happy Birthday, Siya! 🎉🎂
              </h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 500, fontStyle: 'italic', marginTop: '8px' }}>
                "Today, we celebrate the absolute best junior, volleyball champ, and sister by bond!"
              </p>
            </div>

            {/* Glowing Message */}
            <div 
              className="glass-card" 
              style={{
                maxWidth: '600px',
                padding: '24px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(30, 25, 50, 0.75) 0%, rgba(15, 11, 28, 0.85) 100%)',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 8px 20px var(--glass-shadow)',
                lineHeight: 1.6,
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)', fontWeight: 600, marginBottom: '10px' }}>
                <Sparkles size={16} /> A Special Note For You
              </div>
              <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', margin: 0 }}>
                Siya, you are an incredibly bright, talented, and dedicated person. Watching you spike volleyballs on the court, crack Grade 10 exams, and fill the room with humor is a privilege. Never doubt your capabilities, study hard, play hard, and keep shining. Happy Birthday, darling! 🌸💖
              </p>
            </div>

            {/* interactive Pop Count helper */}
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              🍰 Sparkle score: <strong>{balloonsPopped}</strong> balloons popped! (Tap floating balloons to pop!)
            </div>
          </div>
        ) : (
          /* ==============================================================
             NORMAL ACTIVE COUNTDOWN STATE
             ============================================================== */
          <>
            <div>
              <h2 className="section-title serif-title">Birthday Countdown 🎈</h2>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Counting down every single second until your next birthday! ({CONFIG.BIRTHDAY_MONTH} {CONFIG.BIRTHDAY_DAY})
              </p>
            </div>

            {/* Countdown Grid Cards */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              width: '100%'
            }}>
              {[
                { label: "Months", val: timeLeft.months },
                { label: "Days", val: timeLeft.days },
                { label: "Hours", val: timeLeft.hours },
                { label: "Min", val: timeLeft.minutes },
                { label: "Sec", val: timeLeft.seconds }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="glass-card countdown-card"
                  style={{
                    width: '110px',
                    padding: '20px 10px',
                    borderRadius: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    border: '1.5px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                    boxShadow: '0 8px 30px var(--glass-shadow)',
                    transform: 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                >
                  <span style={{
                    fontSize: '2.2rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--pink-color) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: 'monospace',
                    letterSpacing: '-1px'
                  }}>
                    {String(item.val).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Compliment Box Card */}
            <div 
              className="glass-card compliment-card-box"
              onClick={triggerNextCompliment}
              style={{
                maxWidth: '520px',
                width: '100%',
                padding: '28px 30px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(30, 25, 50, 0.75) 0%, rgba(15, 11, 28, 0.85) 100%)',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 10px 30px var(--glass-shadow)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
            >
              {heartFloater && (
                <div className="heart-floating-indicator" style={{
                  position: 'absolute',
                  top: '-15px',
                  color: 'var(--pink-color)',
                  fontSize: '1.5rem',
                  animation: 'floatUpAndFade 0.8s forwards'
                }}>
                  ❤️
                </div>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--pink-color)',
                fontWeight: 600,
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <Gift size={14} /> compliment cards
              </div>
              
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.25rem',
                color: 'var(--text-primary)',
                fontStyle: 'italic',
                lineHeight: 1.4,
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 0
              }}>
                "{activeCompliment}"
              </p>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  triggerNextCompliment();
                }}
                className="btn-secondary" 
                style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '15px' }}
              >
                Reveal Another <Star size={12} color="var(--accent-color)" fill="var(--accent-color)" />
              </button>
            </div>

            {/* Scoreboard display */}
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', zIndex: 5 }}>
              <Smile size={16} /> Pops recorded: <strong>{balloonsPopped}</strong> (Click floating balloons to pop!)
            </div>
          </>
        )}

        {/* Dynamic Birthday Preview Toggle (For developer testing and customer preview) */}
        <button
          onClick={() => setIsDemoBdayMode(!isDemoBdayMode)}
          style={{
            marginTop: '10px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-muted)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            zIndex: 10
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-soft)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
        >
          {isDemoBdayMode ? "⬅️ Show Regular Countdown" : "🎉 Preview Birthday Greeting Mode"}
        </button>

      </div>

      <style>{`
        .countdown-card:hover {
          transform: translateY(-5px) scale(1.05) !important;
          box-shadow: 0 12px 36px rgba(168, 85, 247, 0.18) !important;
          border-color: var(--accent-color) !important;
        }
        .compliment-card-box:hover {
          transform: scale(1.02);
          box-shadow: 0 12px 36px rgba(236, 72, 153, 0.18) !important;
          border-color: var(--pink-color) !important;
        }
        @keyframes floatUpAndFade {
          0% { transform: translateY(10px) scale(0.6); opacity: 1; }
          100% { transform: translateY(-40px) scale(1.3); opacity: 0; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 0.8; }
          70% { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 600px) {
          h1 {
            font-size: 2.2rem !important;
          }
          .countdown-card {
            width: 85px !important;
            padding: 12px 5px !important;
          }
          .countdown-card span {
            font-size: 1.6rem !important;
          }
        }
      `}</style>
    </div>
  );
}
