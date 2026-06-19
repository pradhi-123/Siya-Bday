import React, { useEffect, useRef } from 'react';
import { Play, Pause, Music } from 'lucide-react';

export default function MusicPlayer({ isPlaying, setIsPlaying }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.log("Audio autoplay was prevented or failed:", e);
          // Reset playing state so UI stays in sync if playback fails initially
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, setIsPlaying]);

  return (
    <div 
      className="glass-card" 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 20px',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderRadius: '30px',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 8px 32px var(--glass-shadow)',
        pointerEvents: 'auto',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        style={{
          background: 'var(--accent-color)',
          border: 'none',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          boxShadow: '0 4px 10px rgba(168, 85, 247, 0.3)'
        }}
        className="music-toggle-btn"
        title={isPlaying ? "Pause Background Music" : "Play Background Music"}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
      </button>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Music size={12} className={isPlaying ? "animate-float" : ""} />
          Siya's Tribute Theme 🌸
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          {isPlaying ? "Playing Background Music..." : "Music Paused"}
        </span>
      </div>

      <audio
        ref={audioRef}
        src="/photos/music.mpeg"
        loop
      />
    </div>
  );
}
