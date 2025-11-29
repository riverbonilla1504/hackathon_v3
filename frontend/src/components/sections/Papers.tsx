'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { useTranslation } from '@/contexts/TranslationContext';

export default function Papers() {
  const { t } = useTranslation();
  const [lottieData, setLottieData] = useState<any>(null);

  useEffect(() => {
    // Load papers.json for Lottie animation
    fetch('/papers.json')
      .then(res => res.json())
      .then(data => {
        if (data.v && data.fr && data.w && data.h) {
          setLottieData(data);
        }
      })
      .catch(() => {
        console.error('Failed to load papers.json');
      });
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        perspective: '1000px',
      }}
      className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
    >
      {/* Content Container */}
      <motion.div
        initial={{ 
          opacity: 0, 
          scale: 0.7,
          z: -200,
          filter: 'blur(10px)'
        }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          z: 0,
          filter: 'blur(0px)'
        }}
        transition={{ 
          duration: 1.2, 
          delay: 0.3, 
          ease: [0.16, 1, 0.3, 1]
        }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: 'clamp(32px, 5vw, 80px) clamp(24px, 4vw, 80px)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          style={{
            maxWidth: '1152px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'grid',
              gap: 'clamp(24px, 3vw, 48px)',
              alignItems: 'center',
            }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr]"
          >
            {/* Left Side - Lottie Animation */}
            <motion.div
              initial={{ 
                opacity: 0, 
                x: -50,
                z: -150,
                scale: 0.85,
                filter: 'blur(8px)'
              }}
              animate={{ 
                opacity: 1, 
                x: 0,
                z: 0,
                scale: 1,
                filter: 'blur(0px)'
              }}
              transition={{ 
                duration: 1, 
                delay: 0.6, 
                ease: [0.16, 1, 0.3, 1]
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transformStyle: 'preserve-3d',
              }}
              className="order-first lg:order-first"
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '512px',
                }}
                className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg"
              >
                <div style={{ position: 'relative' }}>
                  {/* Glow effect */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.2), rgba(0, 160, 220, 0.2), rgba(0, 119, 181, 0.2))',
                      borderRadius: '50%',
                      filter: 'blur(40px)',
                      transform: 'scale(1.1)',
                      zIndex: -1,
                    }}
                  />
                  
                  {/* Lottie Animation */}
                  {lottieData ? (
                    <Lottie
                      animationData={lottieData}
                      loop={true}
                      autoplay={true}
                      style={{
                        width: '100%',
                        height: 'auto',
                        filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2))',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '300px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span>Loading animation...</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right Side - Text Content */}
            <motion.div
              initial={{ 
                opacity: 0, 
                x: 50,
                z: -150,
                scale: 0.85,
                filter: 'blur(8px)'
              }}
              animate={{ 
                opacity: 1, 
                x: 0,
                z: 0,
                scale: 1,
                filter: 'blur(0px)'
              }}
              transition={{ 
                duration: 1, 
                delay: 0.9, 
                ease: [0.16, 1, 0.3, 1]
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 'clamp(16px, 2vw, 20px)',
                paddingLeft: 'clamp(32px, 5vw, 80px)',
                paddingRight: 'clamp(16px, 2vw, 24px)',
                transformStyle: 'preserve-3d',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <motion.h2
                  initial={{ 
                    opacity: 0, 
                    y: 30,
                    z: -100,
                    scale: 0.9
                  }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    z: 0,
                    scale: 1
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 1.1, 
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  style={{
                    fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                    fontWeight: 700,
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                    fontFamily: 'var(--font-poppins), sans-serif',
                    margin: 0,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      color: 'var(--text-primary)',
                      marginBottom: '6px',
                    }}
                    className="block theme-text-primary mb-1.5"
                  >
                    {t('papers.intelligentAnalysis')}
                  </span>
                  <span
                    style={{
                      display: 'block',
                      background: 'linear-gradient(to right, #0077b5, #00a0dc, #0077b5)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                    className="block gradient-text"
                  >
                    {t('papers.atYourFingertips')}
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ 
                    opacity: 0, 
                    y: 25,
                    z: -80,
                    scale: 0.95
                  }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    z: 0,
                    scale: 1
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 1.3, 
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  style={{
                    fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
                    lineHeight: 1.75,
                    fontWeight: 400,
                    color: 'var(--text-primary)',
                    opacity: 0.9,
                    margin: 0,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {t('papers.subtitle')}
                </motion.p>

                <motion.p
                  initial={{ 
                    opacity: 0, 
                    y: 25,
                    z: -80,
                    scale: 0.95
                  }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    z: 0,
                    scale: 1
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 1.5, 
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  style={{
                    fontSize: 'clamp(0.75rem, 1.5vw, 1rem)',
                    lineHeight: 1.75,
                    fontWeight: 400,
                    color: 'var(--text-secondary)',
                    opacity: 0.85,
                    margin: 0,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {t('papers.mlDescription')}
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}

