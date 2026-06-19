import React, { useState, useEffect } from 'react';
import { Heart, Star, Sparkles, ArrowRight } from 'lucide-react';
import { CONFIG, IMAGES, handleImageFallback } from '../config';

export default function Home({ onBeginJourney }) {
  const typingWords = CONFIG.TYPEWRITER_WORDS;
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect logic
  useEffect(() => {
    let timer;
    const currentWord = typingWords[currentWordIndex];
    const typingSpeed = isDeleting ? 40 : 100;

    if (!isDeleting && displayText === currentWord) {
      timer = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % typingWords.length);
    } else {
      timer = setTimeout(() => {
        setDisplayText(
          isDeleting
            ? currentWord.substring(0, displayText.length - 1)
            : currentWord.substring(0, displayText.length + 1)
        );
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentWordIndex, typingWords]);

  return (
    <div className="section-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', overflow: 'hidden' }}>
      {/* Decorative Butterflies */}
      <div className="butterfly-container" style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
        <div className="butterfly b1" style={{ position: 'absolute', top: '15%', left: '10%', animation: 'float 7s infinite ease-in-out' }}>🌸</div>
        <div className="butterfly b2" style={{ position: 'absolute', top: '25%', right: '15%', animation: 'float-slower 10s infinite ease-in-out' }}>🦋</div>
        <div className="butterfly b3" style={{ position: 'absolute', bottom: '20%', left: '18%', animation: 'float 9s infinite ease-in-out' }}>✨</div>
        <div className="butterfly b4" style={{ position: 'absolute', bottom: '30%', right: '8%', animation: 'float-slower 8s infinite ease-in-out' }}>🌸</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', zIndex: 3, maxWidth: '900px', width: '100%' }}>
        {/* Animated Polaroids Collage */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '24px', 
          marginBottom: '20px', 
          flexWrap: 'wrap',
          perspective: '1000px'
        }}>
          {/* Polaroid 1 */}
          <div className="glass-card animate-float" style={{
            padding: '12px 12px 24px 12px',
            borderRadius: '12px',
            transform: 'rotate(-6deg)',
            width: '180px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <img 
              src={IMAGES.us} 
              alt="Best Friends" 
              onError={(e) => handleImageFallback(e, 'bestie')}
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
            />
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', marginTop: '12px', color: 'var(--text-secondary)' }}>Us Together 💖</p>
          </div>

          {/* Polaroid 2 */}
          <div className="glass-card animate-float-slower" style={{
            padding: '12px 12px 24px 12px',
            borderRadius: '12px',
            transform: 'rotate(4deg) translateY(-15px)',
            width: '200px',
            boxShadow: '0 15px 30px rgba(0,0,0,0.12)'
          }}>
            <img 
              src={IMAGES.scrapbook} 
              alt="Memory Cover" 
              onError={(e) => handleImageFallback(e, 'scrapbook')}
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} 
            />
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', marginTop: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Our Scrapbook 📖</p>
          </div>

          {/* Polaroid 3 */}
          <div className="glass-card animate-float" style={{
            padding: '12px 12px 24px 12px',
            borderRadius: '12px',
            transform: 'rotate(-3deg) translateY(10px)',
            width: '180px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <img 
              src="/photos/pic1.jpeg" 
              alt="The Dreamer" 
              onError={(e) => handleImageFallback(e, 'girl')}
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
            />
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', marginTop: '12px', color: 'var(--text-secondary)' }}>The Dreamer ☁️</p>
          </div>
        </div>

        {/* Text Headers */}
        <div>
          <h1 className="serif-title" style={{ fontSize: '3.5rem', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '16px' }}>
            {CONFIG.HERO_HEADING.split('Special')[0]}
            <span style={{ 
              background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--pink-color) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Special ✨</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 24px auto', fontWeight: 300 }}>
            "{CONFIG.HERO_SUBHEADING}"
          </p>

          {/* Typewriter text block */}
          <div style={{ height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.15rem', color: 'var(--text-muted)' }}>She is my:</span>
            <span style={{ 
              fontSize: '1.3rem', 
              fontWeight: 600, 
              color: 'var(--accent-color)',
              borderRight: '2px solid var(--accent-color)',
              paddingRight: '4px',
              animation: 'blink 0.8s infinite'
            }}>
              {displayText}
            </span>
          </div>
        </div>

        {/* Begin Journey Button */}
        <button className="btn-primary" onClick={onBeginJourney} style={{ marginTop: '10px' }}>
          Begin Journey <ArrowRight size={18} />
        </button>
      </div>

      <style>{`
        @keyframes blink {
          50% { border-color: transparent; }
        }
        @media (max-width: 768px) {
          h1 {
            font-size: 2.2rem !important;
          }
          p {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
