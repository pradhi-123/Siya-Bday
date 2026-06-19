import React, { useState } from 'react';
import { Calendar, Coffee, Award, Star, MessageCircle, Smile, X, Sparkles } from 'lucide-react';
import { TIMELINE_EVENTS, handleImageFallback } from '../config';

export default function MemoryTimeline() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const getIcon = (type) => {
    switch (type) {
      case 'coffee': return <Coffee size={18} />;
      case 'award': return <Award size={18} />;
      case 'star': return <Star size={18} />;
      case 'message': return <MessageCircle size={18} />;
      default: return <Smile size={18} />;
    }
  };

  const getFallbackType = (type) => {
    switch (type) {
      case 'award': return 'girl';
      case 'star': return 'scrapbook';
      case 'message': return 'starry';
      default: return 'bestie';
    }
  };

  return (
    <div className="section-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h2 className="section-title serif-title">Memory Timeline ⏳</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '50px', maxWidth: '600px', marginInline: 'auto' }}>
        A vertical walk down memory lane. Click any chapter to read the full story and view pictures.
      </p>

      {/* Timeline Structure */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '850px', margin: '0 auto', padding: '10px 0' }}>
        
        {/* Center Vertical Line */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '0',
          bottom: '0',
          width: '4px',
          background: 'linear-gradient(180deg, var(--accent-color) 0%, var(--pink-color) 100%)',
          transform: 'translateX(-50%)',
          borderRadius: '2px',
          opacity: 0.6
        }} className="timeline-line" />

        {/* Timeline Events */}
        {TIMELINE_EVENTS.map((evt, idx) => {
          const isLeft = idx % 2 === 0;
          return (
            <div
              key={evt.id}
              style={{
                display: 'flex',
                justifyContent: isLeft ? 'flex-start' : 'flex-end',
                alignItems: 'center',
                width: '100%',
                marginBottom: '40px',
                position: 'relative'
              }}
              className="timeline-item-container"
            >
              {/* Timeline Center Bullet Pin */}
              <div style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--bg-solid)',
                border: '3px solid var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-color)',
                zIndex: 4,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }} className="timeline-dot">
                {getIcon(evt.type)}
              </div>

              {/* Memory Card */}
              <div
                className="glass-card"
                onClick={() => setSelectedEvent(evt)}
                style={{
                  width: '44%',
                  padding: '20px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  zIndex: 3
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-color)', background: 'var(--accent-soft)', padding: '4px 10px', borderRadius: '12px' }}>
                    {evt.tag}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {evt.date}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {evt.title}
                </h3>
                {evt.image.endsWith('.mp4') ? (
                  <video
                    src={evt.image}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ width: '100%', height: 'auto', borderRadius: '8px', marginTop: '4px' }}
                  />
                ) : (
                  <img
                    src={evt.image}
                    alt={evt.title}
                    onError={(e) => handleImageFallback(e, getFallbackType(evt.type))}
                    style={{ width: '100%', height: 'auto', borderRadius: '8px', marginTop: '4px' }}
                  />
                )}
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  "{evt.caption}"
                </p>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-color)', fontWeight: 500, alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  Read full story <Sparkles size={12} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Popup for Memories */}
      {selectedEvent && (
        <div
          onClick={() => setSelectedEvent(null)}
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
            zIndex: 100002,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-card"
            style={{
              maxWidth: '600px',
              width: '100%',
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'var(--bg-solid)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              animation: 'modalOpen 0.3s ease-out'
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: 'auto', display: 'flex', justifyContent: 'center', background: '#0a0814' }}>
              {selectedEvent.image.endsWith('.mp4') ? (
                <video
                  src={selectedEvent.image}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ width: '100%', maxHeight: '420px', objectFit: 'contain' }}
                />
              ) : (
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  onError={(e) => handleImageFallback(e, getFallbackType(selectedEvent.type))}
                  style={{ width: '100%', maxHeight: '420px', objectFit: 'contain' }}
                />
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-color)', background: 'var(--accent-soft)', padding: '4px 10px', borderRadius: '12px' }}>
                  {selectedEvent.tag}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {selectedEvent.date}
                </span>
              </div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
                {selectedEvent.title}
              </h3>
              <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {selectedEvent.description}
              </p>
              
              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  marginTop: '16px',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  border: '1px solid var(--glass-border)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'var(--accent-color)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                }}
              >
                <X size={14} /> Close & Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalOpen {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 768px) {
          .timeline-line {
            left: 20px !important;
          }
          .timeline-dot {
            left: 20px !important;
            transform: translateX(-50%) !important;
          }
          .timeline-item-container {
            justify-content: flex-end !important;
            padding-left: 40px;
          }
          .timeline-item-container > .glass-card {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
