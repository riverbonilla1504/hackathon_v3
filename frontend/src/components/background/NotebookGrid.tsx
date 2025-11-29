'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function NotebookGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetPosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });
  const isHovering = useRef(false);
  const animationFrameId = useRef<number>();
  const animationTime = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Smooth interpolation function (easing)
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    let lastTimestamp = 0;
    
    // Animation loop using requestAnimationFrame for 60fps
    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      
      // Normalize delta time for consistent animation speed (target 60fps = 16.67ms per frame)
      const normalizedDelta = Math.min(deltaTime / 16.67, 2);
      
      // Update time for pulsing effect
      animationTime.current += deltaTime * 0.001;
      
      // Smooth interpolation for fluid movement - using exponential smoothing
      const smoothFactor = isHovering.current ? 0.12 : 0.05;
      
      // Apply delta time normalization for consistent speed across different frame rates
      const adjustedFactor = 1 - Math.pow(1 - smoothFactor, normalizedDelta);
      
      currentPosition.current.x = lerp(
        currentPosition.current.x,
        targetPosition.current.x,
        adjustedFactor
      );
      currentPosition.current.y = lerp(
        currentPosition.current.y,
        targetPosition.current.y,
        adjustedFactor
      );

      // Calculate 3D transform with smooth easing
      const rotateX = currentPosition.current.y * 10;
      const rotateY = currentPosition.current.x * 10;
      const translateX = currentPosition.current.x * 35;
      const translateY = currentPosition.current.y * 35;
      const translateZ = isHovering.current ? 60 : 0;

      // Subtle pulsing effect with smoother sine wave
      const pulse = Math.sin(animationTime.current) * 0.5 + 0.5;
      const opacity = 0.35 + pulse * 0.15;

      // Apply transform directly to DOM for better performance
      container.style.transform = `
        perspective(1200px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateX(${translateX}px)
        translateY(${translateY}px)
        translateZ(${translateZ}px)
      `;
      
      // Update grid opacity for subtle pulsing
      const gridElement = container.querySelector('.grid-pattern') as HTMLElement;
      if (gridElement) {
        gridElement.style.opacity = opacity.toString();
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Start animation loop with timestamp
    animationFrameId.current = requestAnimationFrame(animate);

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      
      targetPosition.current = { x, y };
      isHovering.current = true;
    };

    const handleMouseLeave = () => {
      isHovering.current = false;
      targetPosition.current = { x: 0, y: 0 };
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Generate floating particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 60 + 20,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10"
      style={{
        pointerEvents: 'none',
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        transformOrigin: 'center center',
        overflow: 'hidden',
      }}
    >
      {/* Grid Pattern */}
      <div
        className="grid-pattern"
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(90deg, var(--line) 0.5px, transparent 0.5px 50px) 50% 50% / 50px 50px,
            linear-gradient(var(--line) 0.5px, transparent 0.5px 50px) 50% 50% / 50px 50px
          `,
          opacity: 0.4,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Animated Gradient Overlays */}
      <motion.div
        animate={{
          background: [
            'radial-gradient(circle at 20% 30%, rgba(0, 119, 181, 0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 70%, rgba(0, 160, 220, 0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 50%, rgba(0, 119, 181, 0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 30%, rgba(0, 119, 181, 0.08) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: [0.4, 0, 0.6, 1],
        }}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      />

      <motion.div
        animate={{
          background: [
            'radial-gradient(circle at 70% 20%, rgba(0, 160, 220, 0.06) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 80%, rgba(0, 119, 181, 0.06) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 20%, rgba(0, 160, 220, 0.06) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: [0.4, 0, 0.6, 1],
        }}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}%`,
            y: `${particle.y}%`,
            opacity: 0.1,
            scale: 0.8,
          }}
          animate={{
            x: [
              `${particle.x}%`,
              `${(particle.x + 20) % 100}%`,
              `${(particle.x - 10) % 100}%`,
              `${particle.x}%`,
            ],
            y: [
              `${particle.y}%`,
              `${(particle.y - 15) % 100}%`,
              `${(particle.y + 25) % 100}%`,
              `${particle.y}%`,
            ],
            opacity: [0.1, 0.2, 0.15, 0.1],
            scale: [0.8, 1.2, 1, 0.8],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: [0.4, 0, 0.6, 1],
            delay: particle.delay,
          }}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(0, 119, 181, 0.15) 0%, transparent 70%)`,
            filter: 'blur(20px)',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Floating Geometric Shapes */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`shape-${i}`}
          initial={{
            x: `${(i * 15) % 100}%`,
            y: `${(i * 20 + 10) % 100}%`,
            rotate: i * 60,
          }}
          animate={{
            x: [
              `${(i * 15) % 100}%`,
              `${((i * 15) + 30) % 100}%`,
              `${((i * 15) - 20) % 100}%`,
              `${(i * 15) % 100}%`,
            ],
            y: [
              `${(i * 20 + 10) % 100}%`,
              `${((i * 20 + 10) - 25) % 100}%`,
              `${((i * 20 + 10) + 30) % 100}%`,
              `${(i * 20 + 10) % 100}%`,
            ],
            rotate: [i * 60, i * 60 + 360],
            opacity: [0.05, 0.12, 0.08, 0.05],
            scale: [1, 1.3, 1.1, 1],
          }}
          transition={{
            duration: 35 + i * 5,
            repeat: Infinity,
            ease: [0.4, 0, 0.6, 1],
            delay: i * 2,
          }}
          style={{
            position: 'absolute',
            width: 100 + i * 20,
            height: 100 + i * 20,
            border: `1px solid rgba(0, 119, 181, 0.1)`,
            borderRadius: i % 2 === 0 ? '50%' : '20%',
            pointerEvents: 'none',
            filter: 'blur(1px)',
          }}
        />
      ))}
    </div>
  );
}

