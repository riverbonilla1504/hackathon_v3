'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const startSectionRef = useRef<HTMLElement>(null);

  const scrollToStart = () => {
    if (startSectionRef.current) {
      startSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  useEffect(() => {
    if (typingComplete) {
      // Wait 2 seconds after typing completes, then auto-scroll
      setTimeout(() => {
        scrollToStart();
      }, 2000);
    }
  }, [typingComplete]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <NotebookGrid />
      
      {/* Minimized Title - always visible in top-left corner */}
      <motion.div
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

      {/* Login Button - top right (fixed) */}
      <LoginButton />

      {/* Hero Section - centered title */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex items-center justify-center h-screen"
      >
        <div className="text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Main Title with 3D Effect */}
            <motion.h1 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
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
            </motion.h1>
            
            {/* Scroll indicator */}
            {typingComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-12"
              >
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#0077b5',
                    cursor: 'pointer',
                  }}
                  onClick={scrollToStart}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Scroll to explore</span>
                  <motion.svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                  </motion.svg>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Content Sections - always visible */}
      <Start ref={startSectionRef} />
      <Papers />
      <Features />
      <Footer />
    </div>
  );
}
