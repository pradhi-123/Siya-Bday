import React, { useState, useEffect, useRef } from 'react';
import { Heart, Sparkles, X, Film } from 'lucide-react';
import { MEMORABLE_VIDEOS } from '../config';

// Video Fruit coordinates hanging from branches inside SVG viewBox (600 x 600) - 14 fruits symmetrical layout
const FRUIT_POSITIONS = [
  { x: 110, y: 370, branchX: 150, branchY: 330 }, // Fruit 1: Special Reel (reel1)
  { x: 190, y: 410, branchX: 200, branchY: 350 }, // Fruit 2: Happy Moments (reel2)
  { x: 140, y: 220, branchX: 175, branchY: 200 }, // Fruit 3: Precious Memories (reel3)
  { x: 220, y: 280, branchX: 250, branchY: 240 }, // Fruit 4: Sweet Banter (reel4)
  { x: 210, y: 140, branchX: 240, branchY: 120 }, // Fruit 5: Milestones Reel (reel5)
  { x: 300, y: 370, branchX: 300, branchY: 310 }, // Fruit 6: Daily Laughs & Joy (reel6)
  { x: 300, y: 290, branchX: 300, branchY: 230 }, // Fruit 7: Unforgettable Journeys (reel7)
  { x: 300, y: 210, branchX: 300, branchY: 150 }, // Fruit 8: Sisterly Bond (reel8)
  { x: 300, y: 130, branchX: 300, branchY: 80 },  // Fruit 9: Memorable Reel 9 (reel9)
  { x: 390, y: 140, branchX: 360, branchY: 120 }, // Fruit 10: Siya & Mom (reel10.jpeg)
  { x: 380, y: 280, branchX: 350, branchY: 240 }, // Fruit 11: Family Temple Visit (reel11.jpeg)
  { x: 460, y: 220, branchX: 425, branchY: 200 }, // Fruit 12: Volleyball Spikes (ath)
  { x: 410, y: 410, branchX: 400, branchY: 350 }, // Fruit 13: Dance Performance (dance)
  { x: 490, y: 370, branchX: 450, branchY: 330 }  // Fruit 14: Achievements Highlight (ach)
];

// Seeded generator for decorative leaves to maintain layout across renders in a 600x600 system
const generateDecorativeLeaves = () => {
  const list = [];
  const clusters = [
    { cx: 300, cy: 220, r: 96 },
    { cx: 210, cy: 260, r: 76 },
    { cx: 390, cy: 240, r: 76 },
    { cx: 300, cy: 150, r: 64 }
  ];
  
  let seed = 73;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  clusters.forEach((c) => {
    // Generate 12 leaves per cluster
    for (let i = 0; i < 12; i++) {
      const angle = random() * Math.PI * 2;
      const dist = random() * c.r;
      const x = c.cx + Math.cos(angle) * dist;
      const y = c.cy + Math.sin(angle) * dist;
      const scale = 0.7 + random() * 0.8;
      const rotation = random() * 360;
      const colorType = Math.floor(random() * 3); // 0: pink, 1: purple, 2: teal/gold
      list.push({ x, y, scale, rotation, colorType });
    }
  });
  return list;
};

const DECORATIVE_LEAVES = generateDecorativeLeaves();

export default function FinalTribute() {
  const [hoveredFruitId, setHoveredFruitId] = useState(null);

  // Video playback overlay state
  const [selectedVideo, setSelectedVideo] = useState(MEMORABLE_VIDEOS[0]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Canvas and interaction refs
  const canvasRef = useRef(null);
  const hoveredFruitIdRef = useRef(null);
  const pendingBurstsRef = useRef([]);

  // Sync states to refs for callback access inside the particle loops
  useEffect(() => {
    hoveredFruitIdRef.current = hoveredFruitId;
  }, [hoveredFruitId]);

  // Sparkle burst from clicking a fruit
  const handleFruitClick = (video, fruitPos) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
    // Push the click coordinate into bursts array
    pendingBurstsRef.current.push({ x: fruitPos.x, y: fruitPos.y });
  };

  // Firefly and active sparkle particle simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resizeCanvas = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial base fireflies
    const particles = [];
    const baseFireflyCount = 45; // Increased count for huge tree container

    for (let i = 0; i < baseFireflyCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height * 0.25 + Math.random() * canvas.height * 0.7,
        size: 1.2 + Math.random() * 2.8,
        speedY: 0.15 + Math.random() * 0.35,
        amplitude: 0.4 + Math.random() * 1.2,
        frequency: 0.005 + Math.random() * 0.008,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.55 ? 'rgba(192, 132, 252, 0.65)' : 'rgba(236, 72, 153, 0.65)',
        life: Math.random() * 100,
        maxLife: 200 + Math.random() * 180,
        isSparkle: false
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Spawning interactive sparkles if hovering a video fruit
      if (hoveredFruitIdRef.current) {
        const fruitIdx = hoveredFruitIdRef.current - 1;
        const hoveredFruit = FRUIT_POSITIONS[fruitIdx];
        if (hoveredFruit && particles.length < 180 && Math.random() > 0.2) {
          const fX = (hoveredFruit.x / 600) * canvas.width;
          const fY = (hoveredFruit.y / 600) * canvas.height;
          particles.push({
            x: fX + (Math.random() - 0.5) * 20,
            y: fY + (Math.random() - 0.5) * 20,
            size: 0.8 + Math.random() * 1.8,
            speedY: -0.2 - Math.random() * 0.4, // float up slowly
            speedX: (Math.random() - 0.5) * 1.5, // expand outwards
            amplitude: 0.3 + Math.random() * 0.8,
            frequency: 0.008 + Math.random() * 0.01,
            phase: Math.random() * Math.PI * 2,
            color: 'rgba(45, 212, 191, 0.95)', // Teal magic sparkles on video hover
            life: 0,
            maxLife: 40 + Math.random() * 20,
            isSparkle: true
          });
        }
      }

      // 2. Spawning burst sparkles from clicked elements (fruits)
      if (pendingBurstsRef.current.length > 0) {
        pendingBurstsRef.current.forEach(burst => {
          const lX = (burst.x / 600) * canvas.width;
          const lY = (burst.y / 600) * canvas.height;
          // Spawn radial particle burst
          for (let k = 0; k < 25; k++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 0.8 + Math.random() * 2.2;
            particles.push({
              x: lX,
              y: lY,
              size: 1.0 + Math.random() * 2.5,
              speedY: Math.sin(angle) * velocity - 0.35, 
              speedX: Math.cos(angle) * velocity,
              amplitude: 0.2 + Math.random() * 0.4,
              frequency: 0.01 + Math.random() * 0.02,
              phase: Math.random() * Math.PI * 2,
              color: Math.random() > 0.4 ? 'rgba(251, 191, 36, 0.95)' : 'rgba(236, 72, 153, 0.95)',
              life: 0,
              maxLife: 45 + Math.random() * 35,
              isSparkle: true
            });
          }
        });
        pendingBurstsRef.current = [];
      }

      // 3. Render and update particles
      particles.forEach((p, idx) => {
        ctx.beginPath();
        const glowRadius = p.size * (p.isSparkle ? 4.8 : 4.0);
        const radG = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        radG.addColorStop(0, p.color);
        radG.addColorStop(0.3, p.color);
        radG.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = radG;
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Physics
        if (p.isSparkle) {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.y * p.frequency + p.phase) * p.amplitude * 0.5;
        } else {
          p.y -= p.speedY;
          p.x += Math.sin(p.y * p.frequency + p.phase) * p.amplitude * 0.4;
        }

        p.life++;

        // Expired handling
        if (p.y < canvas.height * 0.05 || p.life > p.maxLife || p.x < 0 || p.x > canvas.width) {
          if (p.isSparkle) {
            particles.splice(idx, 1);
          } else {
            p.x = Math.random() * canvas.width;
            p.y = canvas.height * 0.85 + Math.random() * canvas.height * 0.15;
            p.life = 0;
            p.size = 1.2 + Math.random() * 2.8;
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div 
      className="section-container" 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        background: 'linear-gradient(180deg, rgba(8, 6, 20, 0.94) 0%, rgba(13, 10, 32, 0.99) 100%)',
        color: '#f5f3ff',
        borderRadius: '24px',
        paddingBlock: '100px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.95)'
      }}
    >
      {/* Night Sky Shooting Stars */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
        <div className="shooting-star s1" style={{ position: 'absolute', top: '10%', left: '30%', width: '100px', height: '2px', background: 'linear-gradient(90deg, #fff, transparent)', transform: 'rotate(-35deg)', animation: 'shoot 6s infinite linear' }} />
        <div className="shooting-star s2" style={{ position: 'absolute', top: '25%', left: '70%', width: '120px', height: '2px', background: 'linear-gradient(90deg, #fff, transparent)', transform: 'rotate(-35deg)', animation: 'shoot 9s infinite linear', animationDelay: '2s' }} />
        <div className="shooting-star s3" style={{ position: 'absolute', top: '50%', left: '15%', width: '80px', height: '2px', background: 'linear-gradient(90deg, #fff, transparent)', transform: 'rotate(-35deg)', animation: 'shoot 8s infinite linear', animationDelay: '4.5s' }} />
      </div>

      <div style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', maxWidth: '950px', marginInline: 'auto', width: '100%' }}>
        
        {/* Core Dedicated Quotes Section */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 className="serif-title" style={{ 
            fontSize: '1.9rem', 
            lineHeight: 1.5, 
            color: '#d8b4fe',
            fontStyle: 'italic',
            textShadow: '0 0 15px rgba(216, 180, 254, 0.35)',
            margin: 0
          }}>
            "Some people become memories.<br />
            Some become family.<br />
            And some become both."
          </h2>

          <div style={{ width: '60px', height: '2px', background: 'var(--accent-color)', marginInline: 'auto', marginBlock: '8px' }} />

          <p style={{
            fontSize: '1.08rem',
            color: '#b3a5ca',
            maxWidth: '650px',
            marginInline: 'auto',
            lineHeight: 1.7,
            fontStyle: 'italic',
            margin: 0
          }}>
            "Thank you for all the laughter, chaos, memories, and happiness.
            Keep smiling, keep dreaming, and keep being the wonderful person you are. 🌸"
          </p>
        </div>

        {/* 🌳 DYNAMIC HUGE MAGICAL MEMORY TREE */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Sparkles size={18} color="var(--accent-color)" />
            <h3 style={{ fontSize: '1.4rem', color: 'var(--accent-color)', margin: 0 }} className="serif-title">
              The Magical Memory Tree
            </h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px', margin: 0, textAlign: 'center', paddingHorizontal: '12px' }}>
            Hover and click the glowing circular cover fruits hanging on the branches to open her video reels and photos.
          </p>

          {/* Interactive Massive Memory Tree Container (Perfect square for pixel-perfect overlays alignment) */}
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            maxWidth: '650px', 
            aspectRatio: '1/1', 
            border: '1px solid rgba(255,255,255,0.03)', 
            borderRadius: '32px', 
            overflow: 'hidden', 
            background: 'rgba(255,255,255,0.015)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 0 40px rgba(168, 85, 247, 0.05)'
          }}>
            
            {/* Canvas Particle Overlay for Fireflies & click sparkles */}
            <canvas 
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 2
              }}
            />

            {/* SVG Memory Tree */}
            <svg 
              viewBox="0 0 600 600" 
              style={{ 
                width: '100%', 
                height: '100%', 
                overflow: 'visible',
                position: 'relative',
                zIndex: 3
              }}
            >
              <defs>
                <linearGradient id="foliage-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(168, 85, 247, 0.25)" />
                  <stop offset="100%" stopColor="rgba(236, 72, 153, 0.04)" />
                </linearGradient>
                <linearGradient id="foliage-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(236, 72, 153, 0.22)" />
                  <stop offset="100%" stopColor="rgba(59, 130, 246, 0.03)" />
                </linearGradient>
                <linearGradient id="foliage-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
                  <stop offset="100%" stopColor="rgba(168, 85, 247, 0.04)" />
                </linearGradient>
                <linearGradient id="trunk-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1b0c2a" />
                  <stop offset="50%" stopColor="#3c1d5c" />
                  <stop offset="100%" stopColor="#11071c" />
                </linearGradient>
              </defs>

              {/* Foliage Glow Clouds behind branches */}
              <g opacity="0.85">
                <circle cx="300" cy="220" r="110" fill="url(#foliage-grad-1)" filter="blur(16px)" />
                <circle cx="210" cy="260" r="90" fill="url(#foliage-grad-2)" filter="blur(16px)" />
                <circle cx="390" cy="240" r="90" fill="url(#foliage-grad-3)" filter="blur(16px)" />
                <circle cx="300" cy="150" r="80" fill="url(#foliage-grad-1)" filter="blur(16px)" />
              </g>

              {/* Organic Detailed Tree Trunk with sway animation */}
              <g className="tree-trunk-sway">
                {/* Main Roots & Trunk Base */}
                <path d="M 250,590 C 270,570 280,520 280,440 C 280,440 250,380 200,340 C 190,330 195,320 205,325 C 245,355 275,395 285,420 C 290,390 285,340 270,280 C 265,260 250,220 210,190 C 200,180 205,170 215,175 C 245,195 265,230 275,260 C 280,220 275,180 255,140 C 250,130 258,125 265,132 C 280,165 288,205 288,245 C 292,205 300,165 315,132 C 322,125 330,130 325,140 C 305,180 300,220 305,260 C 315,230 335,195 365,175 C 375,170 380,180 370,190 C 330,220 315,260 310,280 C 295,340 290,390 295,420 C 305,395 335,355 375,325 C 385,320 390,330 380,340 C 330,380 300,440 300,440 C 300,520 310,570 330,590 Z" fill="url(#trunk-grad)" />
                
                {/* Secondary branching layers for structural realism */}
                <path d="M 210,345 C 170,310 140,280 100,240 C 90,230 95,220 105,225 C 135,255 165,285 200,325 Z" fill="url(#trunk-grad)" opacity="0.95" />
                <path d="M 220,200 C 205,190 195,185 190,180 C 182,175 188,168 195,172 C 205,178 212,185 220,192 Z" fill="url(#trunk-grad)" opacity="0.95" />
                <path d="M 370,345 C 410,310 440,280 500,240 C 510,230 505,220 495,225 C 460,255 430,285 380,325 Z" fill="url(#trunk-grad)" opacity="0.95" />
                <path d="M 358,190 C 375,185 395,182 410,180 C 418,179 418,186 410,187 C 395,189 375,192 358,198 Z" fill="url(#trunk-grad)" opacity="0.95" />

                {/* Decorative foliage leaves */}
                {DECORATIVE_LEAVES.map((leaf, index) => {
                  let leafColor;
                  if (leaf.colorType === 0) leafColor = 'rgba(236, 72, 153, 0.4)'; // pink
                  else if (leaf.colorType === 1) leafColor = 'rgba(168, 85, 247, 0.4)'; // purple
                  else leafColor = 'rgba(45, 212, 191, 0.35)'; // teal/gold

                  return (
                    <g
                      key={`dec-leaf-${index}`}
                      transform={`translate(${leaf.x}, ${leaf.y})`}
                    >
                      <path
                        d="M 0,0 C -3,-5 -3,-10 0,-14 C 3,-10 3,-5 0,0 Z"
                        fill={leafColor}
                        transform={`rotate(${leaf.rotation}) scale(${leaf.scale})`}
                        style={{
                          transformOrigin: '0px 0px',
                          animation: `leafSway ${5 + (index % 4) * 1.5}s infinite ease-in-out`,
                          animationDelay: `${-(index % 6) * 0.9}s`
                        }}
                      />
                    </g>
                  );
                })}

                {/* 🎥 Glowing Video/Image Fruits hanging on branches */}
                {MEMORABLE_VIDEOS.map((video, idx) => {
                  const fruitPos = FRUIT_POSITIONS[idx];
                  if (!fruitPos) return null; // safety check if positions and config count mismatch
                  const isHovered = hoveredFruitId === video.id;
                  const fruitColor = idx % 2 === 0 ? 'var(--accent-color)' : 'var(--pink-color)';
                  const isImage = video.src.endsWith('.jpeg') || video.src.endsWith('.jpg') || video.src.endsWith('.png');

                  return (
                    <g key={`fruit-group-${video.id}`}>
                      {/* Hanging Stem */}
                      <line 
                         x1={fruitPos.branchX} 
                         y1={fruitPos.branchY} 
                         x2={fruitPos.x} 
                         y2={fruitPos.y} 
                         stroke="rgba(168, 85, 247, 0.45)" 
                         strokeWidth="2.5" 
                      />
                      
                      {/* Little leaf attachment at the fruit cap */}
                      <path 
                        d="M 0,0 C -3,-4 -3,-8 0,-11 C 3,-8 3,-4 0,0 Z" 
                        fill="var(--success-color)" 
                        transform={`translate(${fruitPos.x}, ${fruitPos.y - 37}) rotate(-30) scale(0.9)`} 
                      />
                      <circle cx={fruitPos.x} cy={fruitPos.y - 37} r="4" fill="var(--pink-color)" />

                      {/* HTML Media frame rendered in SVG coordinates */}
                      <foreignObject 
                        x={fruitPos.x - 37} 
                        y={fruitPos.y - 37} 
                        width="74" 
                        height="74"
                        style={{ overflow: 'visible' }}
                      >
                        <div
                          onClick={() => handleFruitClick(video, fruitPos)}
                          onMouseEnter={() => setHoveredFruitId(video.id)}
                          onMouseLeave={() => setHoveredFruitId(null)}
                          style={{
                            width: '74px',
                            height: '74px',
                            borderRadius: '50%',
                            border: `3px solid ${isHovered ? 'var(--pink-color)' : fruitColor}`,
                            boxShadow: `0 0 ${isHovered ? '25px' : '12px'} ${fruitColor}`,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transform: isHovered ? 'scale(1.2) translateY(4px)' : 'scale(1)',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            background: '#000',
                            position: 'relative'
                          }}
                          title={`Watch "${video.title}" 🎥`}
                        >
                          {isImage ? (
                            <img
                              src={video.src}
                              alt={video.title}
                              style={{
                                width: '100%',
                                height: video.src.includes('reel10') || video.src.includes('reel11') ? '118%' : '100%',
                                objectFit: 'cover',
                                transform: video.src.includes('reel10') || video.src.includes('reel11') ? 'translateY(-7%)' : 'none',
                                display: 'block'
                              }}
                            />
                          ) : (
                            <video
                              src={video.src}
                              autoPlay
                              loop
                              muted
                              playsInline
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          )}
                          {/* Hover Play icon overlay */}
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(168, 85, 247, 0.25)',
                            opacity: isHovered ? 1 : 0,
                            transition: 'opacity 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Film size={14} color="#fff" />
                          </div>
                        </div>
                      </foreignObject>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Hover Tooltip Overlay for video fruits */}
            {hoveredFruitId && FRUIT_POSITIONS[hoveredFruitId - 1] && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(FRUIT_POSITIONS[hoveredFruitId - 1].x / 600) * 100}%`,
                  top: `${(FRUIT_POSITIONS[hoveredFruitId - 1].y / 600) * 100 + 10}%`,
                  transform: 'translate(-50%, 0)',
                  background: 'rgba(15, 11, 28, 0.95)',
                  border: '1px solid var(--pink-color)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  pointerEvents: 'none',
                  zIndex: 10,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.4), 0 0 10px rgba(236, 72, 153, 0.3)',
                  whiteSpace: 'nowrap',
                  animation: 'fadeInUpShort 0.25s ease-out'
                }}
              >
                {MEMORABLE_VIDEOS[hoveredFruitId - 1]?.title} {MEMORABLE_VIDEOS[hoveredFruitId - 1]?.src.endsWith('.mp4') ? '🎥' : '🖼️'} (Click to view)
              </div>
            )}

          </div>
        </div>

        {/* Footer Credit */}
        <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '30px', width: '100%', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: '#796c8d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: 0 }}>
            Made with countless memories and lots of appreciation <Heart size={14} fill="#ef4444" color="#ef4444" />
          </p>
        </div>

      </div>

      {/* 📺 VIDEO/IMAGE PLAYBACK FULLSCREEN OVERLAY MODAL (PLAYS WITH SOUND) */}
      {isVideoModalOpen && selectedVideo && (() => {
        const isSelectedImage = selectedVideo.src.endsWith('.jpeg') || selectedVideo.src.endsWith('.jpg') || selectedVideo.src.endsWith('.png');
        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(10, 8, 20, 0.88)',
            backdropFilter: 'blur(15px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000000,
            padding: '20px'
          }}>
            <div 
              className="glass-card" 
              style={{
                width: '100%',
                maxWidth: '640px',
                padding: '24px',
                borderRadius: '28px',
                border: '1.5px solid var(--accent-color)',
                background: 'var(--glass-bg)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                position: 'relative'
              }}
            >
              {/* Close button */}
              <button 
                onClick={() => setIsVideoModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255,255,255,0.06)',
                  border: 'none',
                  color: 'var(--text-primary)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10
                }}
              >
                <X size={16} />
              </button>

              {/* Media viewport player */}
              <div style={{ 
                width: '100%', 
                borderRadius: '16px', 
                overflow: 'hidden', 
                background: '#000', 
                border: '1px solid var(--glass-border)', 
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                position: 'relative'
              }}>
                {isSelectedImage ? (
                  <div style={{ 
                    width: '100%', 
                    overflow: 'hidden', 
                    position: 'relative',
                    aspectRatio: selectedVideo.src.includes('reel10') || selectedVideo.src.includes('reel11') ? '4/5' : 'auto'
                  }}>
                    <img 
                      src={selectedVideo.src} 
                      alt={selectedVideo.title}
                      style={{
                        width: '100%',
                        height: selectedVideo.src.includes('reel10') || selectedVideo.src.includes('reel11') ? '118%' : 'auto',
                        maxHeight: '550px',
                        display: 'block',
                        objectFit: 'cover',
                        transform: selectedVideo.src.includes('reel10') || selectedVideo.src.includes('reel11') ? 'translateY(-7%)' : 'none'
                      }}
                    />
                  </div>
                ) : (
                  <video 
                    src={selectedVideo.src} 
                    controls 
                    autoPlay 
                    style={{
                      width: '100%',
                      maxHeight: '440px',
                      display: 'block'
                    }} 
                  />
                )}
              </div>

              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 600, margin: '0 0 6px 0' }}>
                  {selectedVideo.title}
                </h4>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {selectedVideo.caption}
                </p>
              </div>

              <button
                onClick={() => setIsVideoModalOpen(false)}
                style={{
                  marginTop: '8px',
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
                  e.currentTarget.style.borderColor = 'var(--pink-color)';
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
        );
      })()}

      <style>{`
        @keyframes shoot {
          0% { transform: translate(0, 0) rotate(-35deg); opacity: 0; }
          2% { opacity: 1; }
          6% { transform: translate(400px, 280px) rotate(-35deg); opacity: 0; }
          100% { transform: translate(400px, 280px) rotate(-35deg); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes leafSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(12deg); }
        }
        @keyframes trunkSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(1.2deg); }
        }
        .tree-trunk-sway {
          animation: trunkSway 10s infinite ease-in-out;
          transform-origin: 300px 590px;
        }
        @keyframes fadeInShort {
          from { opacity: 0; transform: translate(-50%, -90%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -100%) scale(1); }
        }
        @keyframes fadeInUpShort {
          from { opacity: 0; transform: translate(-50%, 8px) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
      `}</style>
    </div>
  );
}
