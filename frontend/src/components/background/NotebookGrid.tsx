'use client';

import { useEffect, useRef } from 'react';

export default function NotebookGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetPosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });
  const isHovering = useRef(false);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Smooth interpolation function (easing)
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    // Animation loop using requestAnimationFrame for 60fps
    const animate = () => {
      // Smooth interpolation for fluid movement
      const smoothFactor = isHovering.current ? 0.15 : 0.08; // Faster when hovering, slower when returning
      
      currentPosition.current.x = lerp(
        currentPosition.current.x,
        targetPosition.current.x,
        smoothFactor
      );
      currentPosition.current.y = lerp(
        currentPosition.current.y,
        targetPosition.current.y,
        smoothFactor
      );

      // Calculate 3D transform with increased movement range
      const rotateX = currentPosition.current.y * 12; // Increased from 5 to 12 degrees
      const rotateY = currentPosition.current.x * 12; // Increased from 5 to 12 degrees
      const translateX = currentPosition.current.x * 40; // Increased from 20 to 40px
      const translateY = currentPosition.current.y * 40; // Increased from 20 to 40px
      const translateZ = isHovering.current ? 80 : 0; // Increased depth effect

      // Apply transform directly to DOM for better performance
      container.style.transform = `
        perspective(1200px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateX(${translateX}px)
        translateY(${translateY}px)
        translateZ(${translateZ}px)
      `;

      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Start animation loop
    animate();

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized position (-1 to 1)
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

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 grid-animate"
      style={{
        pointerEvents: 'none',
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        background: `
          linear-gradient(90deg, var(--line) 0.5px, transparent 0.5px 50px) 50% 50% / 50px 50px,
          linear-gradient(var(--line) 0.5px, transparent 0.5px 50px) 50% 50% / 50px 50px
        `,
        opacity: 1,
        top: 0,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        transformOrigin: 'center center',
      }}
    />
  );
}

