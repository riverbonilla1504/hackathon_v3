'use client';

import { useState, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Sparkles, Zap, Shield, TrendingUp, Users, Clock } from 'lucide-react';

const getBenefits = (t: (key: string) => string) => [
  {
    icon: <Zap size={24} />,
    title: t('start.benefit1.title'),
    description: t('start.benefit1.desc'),
  },
  {
    icon: <Sparkles size={24} />,
    title: t('start.benefit2.title'),
    description: t('start.benefit2.desc'),
  },
  {
    icon: <Shield size={24} />,
    title: t('start.benefit3.title'),
    description: t('start.benefit3.desc'),
  },
  {
    icon: <TrendingUp size={24} />,
    title: t('start.benefit4.title'),
    description: t('start.benefit4.desc'),
  },
];

const Start = forwardRef<HTMLElement>((props, ref) => {
  const { t } = useTranslation();
  const [documentsCount, setDocumentsCount] = useState(0);
  const [lottieData, setLottieData] = useState<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentBenefitIndex, setCurrentBenefitIndex] = useState(0);
  const benefits = getBenefits(t);

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

  useEffect(() => {
    // Cycle through benefits with longer delay for better readability
    const interval = setInterval(() => {
      setCurrentBenefitIndex((prev) => (prev + 1) % 4);
    }, 4000); // Increased from 3000 to 4000ms for better readability
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        perspective: '1000px',
        overflow: 'visible',
      }}
      className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
    >
      {/* Content Container */}
      <motion.div
        initial={{ 
          opacity: 0, 
          scale: 0.95,
          y: 30,
          filter: 'blur(8px)'
        }}
        whileInView={{ 
          opacity: 1, 
          scale: 1,
          y: 0,
          filter: 'blur(0px)'
        }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ 
          duration: 0.5, 
          delay: 0.1, 
          ease: 'easeOut'
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
                    x: -40,
                    y: 20,
                    scale: 0.95,
                    filter: 'blur(6px)'
                  }}
                  whileInView={{ 
                    opacity: 1, 
                    x: 0,
                    y: 0,
                    scale: 1,
                    filter: 'blur(0px)'
                  }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.15, 
                    ease: 'easeOut'
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Main Title */}
                    <motion.h2
                      initial={{ 
                        opacity: 0, 
                        y: 20,
                        scale: 0.97
                      }}
                      whileInView={{ 
                        opacity: 1, 
                        y: 0,
                        scale: 1
                      }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 0.4, 
                        delay: 0.05, 
                        ease: 'easeOut'
                      }}
                      style={{
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 800,
                        lineHeight: 1.1,
                        letterSpacing: '-0.03em',
                        fontFamily: 'var(--font-poppins), sans-serif',
                        margin: 0,
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <span
                        style={{
                          display: 'block',
                          color: 'var(--text-primary)',
                          marginBottom: '8px',
                        }}
                        className="block theme-text-primary mb-2"
                      >
                        {t('start.stopLosingTime')}
                      </span>
                      <span
                        style={{
                          display: 'block',
                          background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 50%, #0077b5 100%)',
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundSize: '200% auto',
                          animation: 'gradient 3s ease infinite',
                        }}
                        className="block gradient-text"
                      >
                        {t('start.checkingCVs')}
                      </span>
                    </motion.h2>

                    {/* Animated Subtitle */}
                    <motion.div
                      initial={{ 
                        opacity: 0, 
                        y: 15,
                        scale: 0.97
                      }}
                      whileInView={{ 
                        opacity: 1, 
                        y: 0,
                        scale: 1
                      }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 0.4, 
                        delay: 0.1, 
                        ease: 'easeOut'
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        y: -2,
                        transition: { duration: 0.3 }
                      }}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.1) 0%, rgba(0, 160, 220, 0.08) 100%)',
                        border: '1.5px solid rgba(0, 119, 181, 0.2)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                      }}
                    >
                      <p
                        style={{
                          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                          fontWeight: 600,
                          color: '#0077b5',
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {t('start.transformHiring')}
                      </p>
                    </motion.div>

                    {/* Rotating Benefits */}
                    <div style={{ minHeight: '120px', position: 'relative' }}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentBenefitIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ 
                            duration: 0.3,
                            ease: 'easeInOut'
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '16px',
                            padding: '20px',
                            borderRadius: '16px',
                            background: 'rgba(255, 255, 255, 0.6)',
                            border: '1.5px solid rgba(0, 119, 181, 0.15)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                          }}
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              flexShrink: 0,
                            }}
                          >
                            {benefits[currentBenefitIndex].icon}
                          </motion.div>
                          <div style={{ flex: 1 }}>
                            <motion.h3
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.05, duration: 0.3, ease: 'easeOut' }}
                              style={{
                                fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                margin: '0 0 6px 0',
                              }}
                            >
                              {benefits[currentBenefitIndex].title}
                            </motion.h3>
                            <motion.p
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
                              style={{
                                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                                color: 'var(--text-secondary)',
                                margin: 0,
                                lineHeight: 1.5,
                              }}
                            >
                              {benefits[currentBenefitIndex].description}
                            </motion.p>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Key Features List */}
                    <motion.div
                      initial={{ 
                        opacity: 0, 
                        y: 20
                      }}
                      whileInView={{ 
                        opacity: 1, 
                        y: 0
                      }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 0.4, 
                        delay: 0.15, 
                        ease: 'easeOut'
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {[
                        { icon: <Users size={18} />, text: t('start.matchRequirements') },
                        { icon: <Clock size={18} />, text: t('start.saveTime') },
                        { icon: <Sparkles size={18} />, text: t('login.feature3Desc') },
                      ].map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20, scale: 0.95 }}
                          whileInView={{ opacity: 1, x: 0, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ 
                            delay: 0.2 + index * 0.05, 
                            duration: 0.35,
                            ease: 'easeOut'
                          }}
                          whileHover={{ 
                            x: 5,
                            scale: 1.02,
                            transition: { duration: 0.2 }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.4)',
                            border: '1px solid rgba(0, 119, 181, 0.1)',
                          }}
                        >
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: 'rgba(0, 119, 181, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#0077b5',
                            }}
                          >
                            {feature.icon}
                          </div>
                          <span
                            style={{
                              fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                              color: 'var(--text-primary)',
                              fontWeight: 500,
                            }}
                          >
                            {feature.text}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ 
                      opacity: 0, 
                      y: 20,
                      scale: 0.95
                    }}
                    whileInView={{ 
                      opacity: 1, 
                      y: 0,
                      scale: 1
                    }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.4, 
                      delay: 0.25, 
                      ease: 'easeOut'
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
                      {t('start.getStarted')}
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
                      {t('start.learnMore')}
                    </button>
                  </motion.div>

                  {documentsCount > 0 && (
                    <motion.div
                      initial={{ 
                        opacity: 0,
                        scale: 0.95
                      }}
                      whileInView={{ 
                        opacity: 1,
                        scale: 1
                      }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 0.4, 
                        delay: 0.3, 
                        ease: 'easeOut'
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
                          {t('start.documentsProcessed')}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Right Side - Lottie Animation */}
                <motion.div
                  initial={{ 
                    opacity: 0, 
                    x: 40,
                    y: 20,
                    scale: 0.95,
                    filter: 'blur(6px)'
                  }}
                  whileInView={{ 
                    opacity: 1, 
                    x: 0,
                    y: 0,
                    scale: 1,
                    filter: 'blur(0px)'
                  }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.2, 
                    ease: 'easeOut'
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
});

Start.displayName = 'Start';

export default Start;