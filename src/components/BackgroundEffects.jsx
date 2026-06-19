import React, { useEffect, useRef } from 'react';

export default function BackgroundEffects({ weatherMode, isDarkMode }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    let backgroundStars = [];

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
      initParticles();
    };

    // Initialize subtle background stars
    const initStars = () => {
      backgroundStars = [];
      const count = Math.floor((canvas.width * canvas.height) / 8000);
      for (let i = 0; i < count; i++) {
        backgroundStars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.2,
          alpha: Math.random(),
          speed: 0.005 + Math.random() * 0.015
        });
      }
    };

    // Initialize weather particles
    const initParticles = () => {
      particles = [];
      let count = 0;
      if (weatherMode === 'cherry') count = 40;
      else if (weatherMode === 'snow') count = 80;
      else if (weatherMode === 'rain') count = 120;
      else if (weatherMode === 'stars') count = 50;

      for (let i = 0; i < count; i++) {
        particles.push(createParticle(true));
      }
    };

    // Helper to create a single particle
    const createParticle = (randomY = false) => {
      const y = randomY ? Math.random() * canvas.height : -10;
      const x = Math.random() * canvas.width;

      if (weatherMode === 'cherry') {
        return {
          x,
          y,
          r: 4 + Math.random() * 6,
          d: Math.random() * 10, // density/speed modifier
          color: `rgba(255, ${180 + Math.floor(Math.random() * 50)}, ${200 + Math.floor(Math.random() * 30)}, ${0.6 + Math.random() * 0.4})`,
          swing: Math.random() * 2,
          swingSpeed: 0.01 + Math.random() * 0.02,
          angle: Math.random() * Math.PI,
          rotationSpeed: (Math.random() - 0.5) * 0.03
        };
      } else if (weatherMode === 'snow') {
        return {
          x,
          y,
          r: 1 + Math.random() * 4,
          d: 1 + Math.random() * 2,
          swing: Math.random() * 1,
          swingSpeed: 0.005 + Math.random() * 0.01
        };
      } else if (weatherMode === 'rain') {
        return {
          x,
          y,
          len: 15 + Math.random() * 15,
          speed: 10 + Math.random() * 8,
          opacity: 0.15 + Math.random() * 0.25
        };
      } else {
        // stars/sparkles mode
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: 1 + Math.random() * 3,
          alpha: 0.1 + Math.random() * 0.9,
          speed: 0.01 + Math.random() * 0.02,
          color: `rgba(${220 + Math.floor(Math.random() * 35)}, ${200 + Math.floor(Math.random() * 55)}, 255, `
        };
      }
    };

    // Draw active background stars
    const drawStars = () => {
      ctx.fillStyle = isDarkMode ? '#ffffff' : '#4a3b68';
      backgroundStars.forEach(star => {
        ctx.beginPath();
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) {
          star.speed = -star.speed;
        }
        ctx.globalAlpha = Math.max(0.1, Math.min(star.alpha, 0.6));
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    // Mouse Glow follow drawing
    const drawMouseGlow = () => {
      if (!mouseRef.current.active) return;
      const { x, y } = mouseRef.current;
      const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, 150);
      
      const glowColor = isDarkMode 
        ? 'rgba(192, 132, 252, 0.08)' 
        : 'rgba(168, 85, 247, 0.04)';
        
      glowGrad.addColorStop(0, glowColor);
      glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(x, y, 150, 0, Math.PI * 2);
      ctx.fill();
    };

    // Update and draw weather particles
    const drawParticles = () => {
      particles.forEach((p, index) => {
        if (weatherMode === 'cherry') {
          // Update
          p.y += 1 + Math.random() * 1.5;
          p.x += Math.sin(p.angle) * p.swing;
          p.angle += p.swingSpeed;
          
          // Draw petal
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          // Draw sakura petal shape
          ctx.ellipse(0, 0, p.r, p.r / 1.7, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

        } else if (weatherMode === 'snow') {
          // Update
          p.y += p.d * 0.8;
          p.x += Math.sin(p.y * p.swingSpeed) * p.swing * 0.5;

          // Draw
          ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(100, 110, 150, 0.35)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();

        } else if (weatherMode === 'rain') {
          // Update
          p.y += p.speed;
          p.x += 0.5; // slight angle

          // Draw
          ctx.strokeStyle = isDarkMode ? `rgba(156, 163, 175, ${p.opacity})` : `rgba(74, 59, 104, ${p.opacity * 0.6})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + 1, p.y + p.len);
          ctx.stroke();

        } else if (weatherMode === 'stars') {
          // Update
          p.alpha += p.speed;
          if (p.alpha > 1 || p.alpha < 0.1) {
            p.speed = -p.speed;
          }

          // Draw sparkling star
          ctx.fillStyle = p.color + Math.max(0.1, p.alpha) + ')';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Recirculate off-screen particles
        if (p.y > canvas.height + 20 || p.x > canvas.width + 20 || p.x < -20) {
          particles[index] = createParticle(false);
        }
      });
    };

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawStars();
      drawMouseGlow();
      drawParticles();
      
      animationId = requestAnimationFrame(animate);
    };

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Initial setup
    resizeCanvas();
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [weatherMode, isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1 // Sits right above absolute background, behind all text/cards
      }}
    />
  );
}
