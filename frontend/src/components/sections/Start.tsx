'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';

export default function Start() {
  const [documentsCount, setDocumentsCount] = useState(0);
  const [lottieData, setLottieData] = useState<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Load documents.json for Lottie animation
    fetch('/documents.json')
      .then(res => res.json())
      .then(data => {
        // Check if it's a Lottie animation (has 'v', 'fr', 'w', 'h' properties)
        if (data.v && data.fr && data.w && data.h) {
          setLottieData(data);
          setDocumentsCount(1247);
        } else if (Array.isArray(data)) {
          setDocumentsCount(data.length);
        } else {
          setDocumentsCount(1247);
        }
      })
      .catch(() => {
        setDocumentsCount(1247);
      });
  }, []);

  const handleGetStarted = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
  };

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
            className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr]"
          >
                {/* Left Side - Text Content */}
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
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 'clamp(16px, 2vw, 20px)',
                    paddingRight: 'clamp(32px, 5vw, 80px)',
                    paddingLeft: 'clamp(16px, 2vw, 24px)',
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
                        delay: 0.8, 
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
                        Stop Losing Time
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
                        Checking CVs
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
                        delay: 1, 
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
                      Every day, recruiters spend countless hours manually reviewing resumes, 
                      losing valuable time that could be spent on finding the perfect candidate.
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
                        delay: 1.2, 
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
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Worky AI</span> revolutionizes 
                      recruitment by intelligently analyzing CVs at scale. Transform hours of work into seconds.
                    </motion.p>
                  </div>

                  <motion.div
                    initial={{ 
                      opacity: 0, 
                      y: 30,
                      z: -60,
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
                      delay: 1.4, 
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      paddingTop: '8px',
                      transformStyle: 'preserve-3d',
                    }}
                    className="flex flex-col sm:flex-row"
                  >
                    <button
                      onClick={handleGetStarted}
                      style={{
                        padding: '10px 24px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                        color: 'white',
                        background: '#0077b5',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 10px 15px -3px rgba(0, 119, 181, 0.3)',
                        transition: 'all 0.3s',
                        transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
                      }}
                      className="transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.background = '#005885';
                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 119, 181, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = isAnimating ? 'scale(0.95)' : 'scale(1)';
                        e.currentTarget.style.background = '#0077b5';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 119, 181, 0.3)';
                      }}
                    >
                      Get Started
                    </button>
                    <button
                      style={{
                        padding: '10px 24px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                        color: 'var(--text-primary)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s',
                      }}
                      className="hover:border-white/50 hover:bg-white/20 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      Learn More
                    </button>
                  </motion.div>

                  {documentsCount > 0 && (
                    <motion.div
                      initial={{ 
                        opacity: 0,
                        z: -40,
                        scale: 0.9
                      }}
                      animate={{ 
                        opacity: 1,
                        z: 0,
                        scale: 1
                      }}
                      transition={{ 
                        duration: 0.8, 
                        delay: 1.6, 
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      style={{ 
                        paddingTop: '4px',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 16px',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.3s',
                        }}
                        className="hover:bg-white/20 transition-all duration-300"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                        }}
                      >
                        <span
                          style={{
                            fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
                            fontWeight: 700,
                            background: 'linear-gradient(to right, #0077b5, #00a0dc)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          {documentsCount.toLocaleString()}+
                        </span>
                        <span
                          style={{
                            fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                            fontWeight: 500,
                            color: 'var(--text-secondary)',
                            opacity: 0.85,
                          }}
                        >
                          Documents Processed
                        </span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Right Side - Lottie Animation */}
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
                    alignItems: 'center',
                    justifyContent: 'center',
                    transformStyle: 'preserve-3d',
                  }}
                  className="order-first lg:order-last"
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
              </div>
            </div>
          </motion.div>
    </motion.section>
  );
}