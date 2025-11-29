'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BlurTextProps {
  text: string;
  delay?: number;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom' | 'left' | 'right';
  onAnimationComplete?: () => void;
  className?: string;
}

export default function BlurText({
  text,
  delay = 0,
  animateBy = 'words',
  direction = 'top',
  onAnimationComplete,
  className = '',
}: BlurTextProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getDirection = () => {
    switch (direction) {
      case 'top':
        return { y: -20, x: 0 };
      case 'bottom':
        return { y: 20, x: 0 };
      case 'left':
        return { y: 0, x: -20 };
      case 'right':
        return { y: 0, x: 20 };
      default:
        return { y: -20, x: 0 };
    }
  };

  const directionValues = getDirection();

  if (animateBy === 'words') {
    const words = text.split(' ');
    const totalDuration = words.length * 0.1;

    return (
      <div className={`flex flex-wrap justify-center items-center gap-2 mx-auto ${className}`} style={{ width: '100%' }}>
        {words.map((word, index) => (
          <motion.span
            key={index}
            initial={{
              opacity: 0,
              filter: 'blur(10px)',
              y: directionValues.y,
              x: directionValues.x,
            }}
            animate={
              isVisible
                ? {
                    opacity: 1,
                    filter: 'blur(0px)',
                    y: 0,
                    x: 0,
                  }
                : {}
            }
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            onAnimationComplete={() => {
              if (index === words.length - 1 && onAnimationComplete) {
                setTimeout(() => onAnimationComplete(), 200);
              }
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
        ))}
      </div>
    );
  }

  // Animate by letters
  const letters = text.split('');
  return (
    <div className={`inline-block ${className}`}>
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          initial={{
            opacity: 0,
            filter: 'blur(10px)',
            y: directionValues.y,
            x: directionValues.x,
          }}
          animate={
            isVisible
              ? {
                  opacity: 1,
                  filter: 'blur(0px)',
                  y: 0,
                  x: 0,
                }
              : {}
          }
          transition={{
            duration: 0.3,
            delay: index * 0.05,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          onAnimationComplete={() => {
            if (index === letters.length - 1 && onAnimationComplete) {
              setTimeout(() => onAnimationComplete(), 200);
            }
          }}
          className="inline-block"
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </div>
  );
}

