'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotebookGrid from '@/components/background/NotebookGrid';
import TypewriterText from '@/components/animations/TypewriterText';
import Start from '@/components/sections/Start';
import Papers from '@/components/sections/Papers';
import Features from '@/components/sections/Features';
import Footer from '@/components/layout/Footer';
import LoginButton from '@/components/layout/LoginButton';

export default function Home() {
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const [titleMinimized, setTitleMinimized] = useState(false);

  useEffect(() => {
    if (typingComplete) {
      // Wait 5 seconds after typing completes
      setTimeout(() => {
        // Minimize title
        setTitleMinimized(true);
      }, 5000);
    }
  }, [typingComplete]);

  return (
    <div className="relative min-h-screen">
      <NotebookGrid />
      
      {/* Hero Section - centered initially, then animates up and fades out */}
      <AnimatePresence mode="wait">
        {!titleMinimized && (
          <motion.div
            key="centered-title"
            initial={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              y: -100,
              transition: { 
                duration: 1.2, 
                ease: [0.25, 0.46, 0.45, 0.94] 
              }
            }}
            className="relative z-10 flex items-center justify-center h-screen"
          >
            <div className="text-center px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                {/* Main Title with 3D Effect */}
                <h1 
                  className="text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] font-bold mb-6 leading-none text-3d"
                  style={{ fontFamily: 'var(--font-cursive), cursive' }}
                >
                  <span className="block theme-text-primary mb-2">
                    <TypewriterText 
                      text="Worky" 
                      speed={150}
                      onComplete={() => {
                        setTimeout(() => setShowSubtitle(true), 300);
                      }}
                    />
                  </span>
                  <span 
                    className="block gradient-text text-3d-gradient"
                    style={{
                      background: 'linear-gradient(to right, #0077b5, #00a0dc, #0077b5)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {showSubtitle && (
                      <TypewriterText 
                        text="AI" 
                        speed={200}
                        onComplete={() => setTypingComplete(true)}
                      />
                    )}
                  </span>
                </h1>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized Title - appears in top-left corner */}
      <AnimatePresence>
        {titleMinimized && (
          <motion.div
            key="minimized-title"
            initial={{ 
              opacity: 0, 
              scale: 0.8,
              x: -50,
              y: -50
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: 0,
              y: 0
            }}
            transition={{ 
              duration: 0.8, 
              delay: 0.3,
              ease: [0.16, 1, 0.3, 1]
            }}
            style={{
              position: 'fixed',
              top: 'clamp(20px, 3vw, 32px)',
              left: 'clamp(20px, 3vw, 32px)',
              zIndex: 50,
              padding: 'clamp(12px, 2vw, 20px) clamp(16px, 3vw, 32px)',
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl font-bold leading-none"
              style={{ fontFamily: 'var(--font-cursive), cursive' }}
            >
              <span className="block theme-text-primary mb-1">
                Worky
              </span>
              <span 
                className="block gradient-text"
                style={{
                  background: 'linear-gradient(to right, #0077b5, #00a0dc, #0077b5)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                AI
              </span>
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Button - top right (fixed) */}
      {titleMinimized && <LoginButton />}

      {/* Start Section - appears after title disappears */}
      {titleMinimized && (
        <>
          <Start />
          <Papers />
          <Features />
          <Footer />
        </>
      )}
    </div>
  );
}
