import React, { useRef, useEffect } from 'react';

const ParticleSphere = ({ state }) => { // state = 'idle', 'listening', 'speaking'
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Resize
    const resize = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Particles
    const particles = [];
    const particleCount = 400; // Density
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = 120;

    class Particle {
      constructor() {
        this.angle = Math.random() * Math.PI * 2;
        this.radius = Math.random() * baseRadius;
        this.size = Math.random() * 2 + 1;
        this.speed = Math.random() * 0.02 + 0.005;
        this.offset = Math.random() * 20; // Wiggle
      }

      update(mode) {
        // Rotation
        this.angle += this.speed;
        
        // Mode Logic
        let targetRadius = baseRadius;
        let expansionSpeed = 0.1;
        
        if (mode === 'speaking') { // AI Speaking (Blue, Fast, Big)
            targetRadius = baseRadius * 1.5 + Math.sin(Date.now() * 0.01) * 30;
            this.speed = 0.04; 
        } else if (mode === 'listening') { // User Speaking (Gold, Vibrating)
            targetRadius = baseRadius * 1.3 + Math.sin(Date.now() * 0.02) * 10;
            this.speed = 0.03;
        } else { // Idle (Calm breathing)
            targetRadius = baseRadius + Math.sin(Date.now() * 0.002) * 10;
            this.speed = 0.01;
        }

        // Smooth transition to target radius
        this.radius += (targetRadius - this.radius) * 0.05;
      }

      draw(mode) {
        const x = centerX + Math.cos(this.angle) * this.radius;
        const y = centerY + Math.sin(this.angle) * this.radius;
        
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        
        // Dynamic Color
        if (mode === 'speaking') {
            ctx.fillStyle = `rgba(0, 150, 255, ${Math.random()})`; // Blue/Cyan
        } else if (mode === 'listening') {
            ctx.fillStyle = `rgba(255, 200, 0, ${Math.random()})`; // Gold
        } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`; // White/Grey
        }
        
        ctx.fill();
      }
    }

    // Init
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Loop
    const animate = () => {
      // Trail effect (Motion Blur)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
          p.update(state);
          p.draw(state);
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationFrameId);
    };
  }, [state]); // Re-run if state changes (though logic handles it inside loop too)

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default ParticleSphere;
