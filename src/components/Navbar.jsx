import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles, CloudRain, Snowflake, Flower, EyeOff, Menu, X, Lock } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  weatherMode,
  setWeatherMode,
  onLock
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
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

  // Track scrolling to shrink navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const selectTab = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    
    // Smooth scroll to top of viewport when page changes (since it's an SPA representation)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const weatherIcons = [
    { mode: 'stars', icon: <Sparkles size={16} />, label: 'Stars' },
    { mode: 'cherry', icon: <Flower size={16} />, label: 'Cherry' },
    { mode: 'rain', icon: <CloudRain size={16} />, label: 'Rain' },
    { mode: 'snow', icon: <Snowflake size={16} />, label: 'Snow' },
    { mode: 'none', icon: <EyeOff size={16} />, label: 'Clear' }
  ];

  return (
    <>
      <nav
        className="glass-card"
        style={{
          position: 'fixed',
          top: isScrolled ? '12px' : '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: isScrolled ? '92%' : '96%',
          maxWidth: '1200px',
          padding: isScrolled ? '10px 20px' : '16px 28px',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '40px',
          transition: 'var(--transition-smooth)',
          border: '1px solid var(--glass-border)',
          boxShadow: isScrolled ? '0 10px 30px rgba(0,0,0,0.12)' : '0 4px 20px rgba(0,0,0,0.06)'
        }}
      >
        {/* Brand Logo / Initials */}
        <div 
          onClick={() => selectTab('home')}
          style={{ 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            background: 'linear-gradient(135deg, var(--accent-color), var(--pink-color))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>S🌸S</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.8, color: 'var(--text-primary)', fontWeight: 500 }} className="hidden-mobile">
            | Sister & Bestie
          </span>
        </div>

        {/* Desktop Navigation Links (Horizontal scrollable pill if overflow) */}
        <div 
          className="hidden-mobile hidden-scrollbar"
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            padding: '4px',
            maxWidth: '60%',
            whiteSpace: 'nowrap'
          }}
        >
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => selectTab(item.id)}
              style={{
                background: activeTab === item.id ? 'var(--accent-soft)' : 'transparent',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: activeTab === item.id ? 600 : 400,
                color: activeTab === item.id ? 'var(--accent-color)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
              className="nav-link"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Control Center (Weather, Dark Mode, Hamburger) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Weather Selection Pill */}
          <div 
            className="glass-card" 
            style={{ 
              display: 'flex', 
              gap: '4px', 
              padding: '3px', 
              borderRadius: '20px', 
              background: 'rgba(255,255,255,0.06)' 
            }}
          >
            {weatherIcons.map(item => (
              <button
                key={item.mode}
                onClick={() => setWeatherMode(item.mode)}
                style={{
                  background: weatherMode === item.mode ? 'var(--accent-color)' : 'transparent',
                  color: weatherMode === item.mode ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                title={`Change weather to ${item.label}`}
              >
                {item.icon}
              </button>
            ))}
          </div>


          {/* Lock Site Button */}
          {onLock && (
            <button
              onClick={onLock}
              style={{
                background: 'var(--glass-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--glass-border)',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
              title="Lock Website"
            >
              <Lock size={15} />
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="visible-mobile"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'var(--glass-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--glass-border)',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'none', // Overridden by media query in responsive section
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="glass-card"
          style={{
            position: 'fixed',
            top: '75px',
            left: '5%',
            width: '90%',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
            padding: '24px',
            borderRadius: '24px',
            zIndex: 9998,
            border: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 20px 45px rgba(0,0,0,0.18)'
          }}
        >
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
            Jump to Section
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => selectTab(item.id)}
                style={{
                  background: activeTab === item.id ? 'var(--accent-color)' : 'transparent',
                  color: activeTab === item.id ? '#fff' : 'var(--text-primary)',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  textAlign: 'left',
                  fontSize: '1rem',
                  fontWeight: activeTab === item.id ? 600 : 400,
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'var(--transition-fast)'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile view responsive styles overrides */}
      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile {
            display: none !important;
          }
          .visible-mobile {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
