import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AboutHer from './components/AboutHer';
import MemoryTimeline from './components/MemoryTimeline';
import Gallery from './components/Gallery';
import Achievements from './components/Achievements';
import DreamBoard from './components/DreamBoard';
import MessagesFromMe from './components/MessagesFromMe';
import BirthdayCountdown from './components/BirthdayCountdown';
import Guestbook from './components/Guestbook';
import FinalTribute from './components/FinalTribute';
import BackgroundEffects from './components/BackgroundEffects';
import MusicPlayer from './components/MusicPlayer';
import LockScreen from './components/LockScreen';

const TABS_ORDER = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About Her' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'dreamboard', label: 'Dream Board' },
  { id: 'messages', label: 'Letters' },
  { id: 'countdown', label: 'Countdown' },
  { id: 'guestbook', label: 'Guestbook' },
  { id: 'tribute', label: 'Tribute' }
];

export default function App() {
  const [isSiteUnlocked, setIsSiteUnlocked] = useState(() => localStorage.getItem('site_unlocked') === 'true');
  const [activeTab, setActiveTab] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [weatherMode, setWeatherMode] = useState('stars');
  const [isMusicPlaying, setIsMusicPlaying] = useState(() => localStorage.getItem('site_unlocked') === 'true');
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorGlowPos, setCursorGlowPos] = useState({ x: 0, y: 0 });

  const currentIdx = TABS_ORDER.findIndex(t => t.id === activeTab);
  const prevTab = currentIdx > 0 ? TABS_ORDER[currentIdx - 1] : null;
  const nextTab = currentIdx < TABS_ORDER.length - 1 ? TABS_ORDER[currentIdx + 1] : null;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Loading screen fadeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  // Update document theme on changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  // Track scroll position for progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track mouse coordinates for custom cursor
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      
      // Lazy trail for glowing shadow
      setTimeout(() => {
        setCursorGlowPos({ x: e.clientX, y: e.clientY });
      }, 60);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Map of views
  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return <Home onBeginJourney={() => setActiveTab('about')} />;
      case 'about':
        return <AboutHer />;
      case 'timeline':
        return <MemoryTimeline />;
      case 'gallery':
        return <Gallery />;
      case 'achievements':
        return <Achievements />;
      case 'dreamboard':
        return <DreamBoard />;
      case 'messages':
        return <MessagesFromMe />;
      case 'countdown':
        return <BirthdayCountdown />;
      case 'guestbook':
        return <Guestbook />;
      case 'tribute':
        return <FinalTribute isMusicPlaying={isMusicPlaying} setIsMusicPlaying={setIsMusicPlaying} />;
      default:
        return <Home onBeginJourney={() => setActiveTab('about')} />;
    }
  };

  if (!isSiteUnlocked) {
    return (
      <>
        {/* Glowing cursor & background trail */}
        <div className="custom-cursor" style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }} />
        <div className="custom-cursor-glow" style={{ left: `${cursorGlowPos.x}px`, top: `${cursorGlowPos.y}px` }} />

        {/* Global Interactive Canvas Particles background */}
        <BackgroundEffects weatherMode={weatherMode} isDarkMode={isDarkMode} />

        <LockScreen onUnlock={() => {
          localStorage.setItem('site_unlocked', 'true');
          setIsSiteUnlocked(true);
          setIsMusicPlaying(true);
        }} />
      </>
    );
  }

  return (
    <>
      {/* Scroll Progress Indicator */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {/* Glowing cursor & background trail */}
      <div className="custom-cursor" style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }} />
      <div className="custom-cursor-glow" style={{ left: `${cursorGlowPos.x}px`, top: `${cursorGlowPos.y}px` }} />

      {/* Global Interactive Canvas Particles background */}
      <BackgroundEffects weatherMode={weatherMode} isDarkMode={isDarkMode} />

      {/* Global Background Sound Control */}
      <MusicPlayer isPlaying={isMusicPlaying} setIsPlaying={setIsMusicPlaying} />

      {/* Loading Screen */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: isDarkMode ? '#0d0a16' : '#fcf9ff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          gap: '20px'
        }}>
          {/* Initial spinner logo */}
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            border: '4px solid var(--accent-soft)',
            borderTopColor: 'var(--accent-color)',
            animation: 'spin 1.2s infinite linear',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-color)', animation: 'pulse 1.8s infinite' }}>
              S.S.
            </span>
          </div>
          <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '1px' }}>
            Unfolding Memories...
          </span>
        </div>
      )}

      {/* Core Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* Navigation Bar */}
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode}
          weatherMode={weatherMode}
          setWeatherMode={setWeatherMode}
          onLock={() => {
            localStorage.removeItem('site_unlocked');
            setIsSiteUnlocked(false);
          }}
        />

        {/* Main Render Section Wrapper */}
        <main style={{ flexGrow: 1, paddingBottom: '80px', position: 'relative' }}>
          <div className="view-transition-wrapper">
            {renderView()}
          </div>

          {/* Centered Next/Previous page navigation buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            marginTop: '50px',
            width: '100%',
            maxWidth: '600px',
            marginInline: 'auto',
            paddingInline: '20px',
            zIndex: 10
          }}>
            {prevTab && (
              <button
                onClick={() => handleTabChange(prevTab.id)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '30px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--glass-bg)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(5px)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-color)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                ← Previous: {prevTab.label}
              </button>
            )}
            {nextTab && (
              <button
                onClick={() => handleTabChange(nextTab.id)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '30px',
                  border: '1px solid var(--accent-color)',
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(236, 72, 153, 0.25))',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 15px rgba(168, 85, 247, 0.15)',
                  backdropFilter: 'blur(5px)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(168, 85, 247, 0.15)';
                }}
              >
                Next: {nextTab.label} →
              </button>
            )}
          </div>
        </main>

      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        .view-transition-wrapper {
          animation: fadeEnter 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        @keyframes fadeEnter {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
