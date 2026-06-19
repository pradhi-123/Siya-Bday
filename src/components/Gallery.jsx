import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Play, Pause, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { GALLERY_ITEMS, handleImageFallback } from '../config';

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);

  const filteredItems = GALLERY_ITEMS;

  // Slideshow play/pause handler
  useEffect(() => {
    let timer;
    if (isSlideshowPlaying && lightboxIndex !== null) {
      timer = setInterval(() => {
        setLightboxIndex(prev => (prev + 1) % filteredItems.length);
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isSlideshowPlaying, lightboxIndex, filteredItems]);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setIsSlideshowPlaying(false);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setIsSlideshowPlaying(false);
  };

  const nextSlide = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
  };

  const prevSlide = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
  };

  const getFallbackType = (category) => {
    if (category === 'school') return 'girl';
    if (category === 'favorites') return 'scrapbook';
    if (category === 'random') return 'starry';
    if (category === 'childhood') return 'scrapbook';
    return 'bestie';
  };

  return (
    <div className="section-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h2 className="section-title serif-title">Aesthetic Gallery 🎨</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '600px', marginInline: 'auto' }}>
        A Pinterest-style grid containing highlights of our journey. Click any photo to expand into a full-screen slideshow.
      </p>

      {/* Masonry / Grid Layout */}
      <div 
        className="gallery-masonry"
        style={{
          columnCount: 3,
          columnGap: '20px',
          width: '100%',
          maxWidth: '1100px',
          margin: '0 auto'
        }}
      >
        {filteredItems.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => openLightbox(idx)}
            className="glass-card gallery-card"
            style={{
              display: 'inline-block',
              width: '100%',
              marginBottom: '20px',
              padding: '10px',
              borderRadius: '16px',
              cursor: 'pointer',
              overflow: 'hidden',
              breakInside: 'avoid',
              position: 'relative'
            }}
          >
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '10px' }}>
              {item.img.endsWith('.mp4') ? (
                <video
                  src={item.img}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    transition: 'transform 0.4s ease-out'
                  }}
                  className="gallery-image"
                />
              ) : (
                <img
                  src={item.img}
                  alt={item.title}
                  onError={(e) => handleImageFallback(e, getFallbackType(item.category))}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    transition: 'transform 0.4s ease-out'
                  }}
                  className="gallery-image"
                />
              )}
              <div 
                className="gallery-overlay"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 80%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '16px',
                  color: '#fff',
                  textAlign: 'left'
                }}
              >
                <h4 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Heart size={14} fill="var(--pink-color)" stroke="none" /> {item.title}
                </h4>
                <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>{item.caption}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Slideshow Modal */}
      {lightboxIndex !== null && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(10, 8, 20, 0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100003
          }}
        >
          {/* Controls Container */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '800px',
              width: '92%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            {/* Top Bar Controls */}
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', color: '#fff', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginRight: 'auto' }}>
                {lightboxIndex + 1} / {filteredItems.length}
              </span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setIsSlideshowPlaying(!isSlideshowPlaying)}
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {isSlideshowPlaying ? <Pause size={18} /> : <Play size={18} />}
                  <span style={{ fontSize: '0.85rem' }}>{isSlideshowPlaying ? "Pause Show" : "Play Slideshow"}</span>
                </button>
                <button
                  onClick={closeLightbox}
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Image Box */}
            <div style={{ position: 'relative', display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <button
                onClick={prevSlide}
                style={{
                  position: 'absolute',
                  left: '-40px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                className="lightbox-arrow"
              >
                <ChevronLeft size={20} />
              </button>

              {filteredItems[lightboxIndex].img.endsWith('.mp4') ? (
                <video
                  src={filteredItems[lightboxIndex].img}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    maxWidth: '100%',
                    maxHeight: '65vh',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                  }}
                />
              ) : (
                <img
                  src={filteredItems[lightboxIndex].img}
                  alt={filteredItems[lightboxIndex].title}
                  onError={(e) => handleImageFallback(e, getFallbackType(filteredItems[lightboxIndex].category))}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '65vh',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    transition: 'opacity 0.4s ease'
                  }}
                />
              )}

              <button
                onClick={nextSlide}
                style={{
                  position: 'absolute',
                  right: '-40px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                className="lightbox-arrow"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Bottom Caption Info */}
            <div style={{ textAlign: 'center', color: '#fff', maxWidth: '600px' }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                <Sparkles size={16} color="var(--accent-color)" />
                {filteredItems[lightboxIndex].title}
              </h3>
              <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                {filteredItems[lightboxIndex].caption}
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .gallery-card:hover .gallery-image {
          transform: scale(1.05);
        }
        .gallery-card:hover .gallery-overlay {
          opacity: 1 !important;
        }
        @media (max-width: 900px) {
          .gallery-masonry {
            column-count: 2 !important;
          }
        }
        @media (max-width: 600px) {
          .gallery-masonry {
            column-count: 1 !important;
          }
          .lightbox-arrow {
            position: static !important;
            margin: 0 10px !important;
          }
        }
      `}</style>
    </div>
  );
}
