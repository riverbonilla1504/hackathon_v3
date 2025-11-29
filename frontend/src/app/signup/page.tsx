'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Lottie from 'lottie-react';
import NotebookGrid from '@/components/background/NotebookGrid';
import { User, Building2, ArrowLeft, Home } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [userLottieData, setUserLottieData] = useState<any>(null);
  const [enterpriseLottieData, setEnterpriseLottieData] = useState<any>(null);

  useEffect(() => {
    // Load person.json for user box
    fetch('/person.json')
      .then(res => res.json())
      .then(data => {
        if (data.v && data.fr && data.w && data.h) {
          setUserLottieData(data);
        }
      })
      .catch(() => {});

    // Load enterprise.json for enterprise box
    fetch('/enterprise.json')
      .then(res => res.json())
      .then(data => {
        if (data.v && data.fr && data.w && data.h) {
          setEnterpriseLottieData(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <NotebookGrid />
      
      {/* Home Button - Top Left */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'fixed',
          top: 'clamp(20px, 3vw, 32px)',
          left: 'clamp(20px, 3vw, 32px)',
          zIndex: 1000,
        }}
      >
        <Link href="/" passHref>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: 'clamp(12px, 2vw, 20px) clamp(16px, 3vw, 32px)',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
          >
            <h1 
              className="text-2xl sm:text-3xl md:text-4xl font-bold leading-none"
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
          </motion.button>
        </Link>
      </motion.div>

      {/* Back Button - Top Right */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'fixed',
          top: 'clamp(20px, 3vw, 32px)',
          right: 'clamp(20px, 3vw, 32px)',
          zIndex: 1000,
        }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
            fontWeight: 600,
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          }}
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </motion.button>
      </motion.div>
      
      <motion.section
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
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
            maxWidth: '1200px',
            margin: '0 auto',
            transformStyle: 'preserve-3d',
          }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 25, z: -100, scale: 0.9, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, z: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '48px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-poppins), sans-serif',
              transformStyle: 'preserve-3d',
            }}
          >
            Choose Your Account Type
          </motion.h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'clamp(24px, 4vw, 48px)',
              alignItems: 'stretch',
              width: '100%',
              maxWidth: '900px',
              margin: '0 auto',
            }}
            className="grid grid-cols-1 md:grid-cols-2"
          >
            {/* User Signup Box */}
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
                delay: 1.0, 
                ease: [0.16, 1, 0.3, 1]
              }}
              style={{
                borderRadius: '24px',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
                border: '1.5px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                padding: '48px',
                position: 'relative',
                overflow: 'hidden',
                transformStyle: 'preserve-3d',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.5,
                  pointerEvents: 'none',
                  background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%)',
                }}
              />

              <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '120px' }}>
                  {userLottieData ? (
                    <Lottie
                      animationData={userLottieData}
                      loop={true}
                      autoplay={true}
                      style={{
                        width: '120px',
                        height: '120px',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '20px',
                        background: 'rgba(0, 119, 181, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(0, 119, 181, 0.3)',
                      }}
                    >
                      <User style={{ width: '40px', height: '40px', color: '#0077b5' }} />
                    </div>
                  )}
                </div>

                <h3
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-poppins), sans-serif',
                  }}
                >
                  User
                </h3>

                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '32px',
                    lineHeight: 1.6,
                  }}
                >
                  Find your next job opportunity
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/signup/user')}
                  style={{
                    width: '100%',
                    padding: '16px 32px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: 'white',
                    background: '#0077b5',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0, 119, 181, 0.3)',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#005885';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#0077b5';
                  }}
                >
                  Sign Up as User
                </motion.button>
              </div>
            </motion.div>

            {/* Enterprise Signup Box */}
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
                delay: 1.2, 
                ease: [0.16, 1, 0.3, 1]
              }}
              style={{
                borderRadius: '24px',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
                border: '1.5px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                padding: '48px',
                position: 'relative',
                overflow: 'hidden',
                transformStyle: 'preserve-3d',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.5,
                  pointerEvents: 'none',
                  background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%)',
                }}
              />

              <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '120px' }}>
                  {enterpriseLottieData ? (
                    <Lottie
                      animationData={enterpriseLottieData}
                      loop={true}
                      autoplay={true}
                      style={{
                        width: '120px',
                        height: '120px',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '20px',
                        background: 'rgba(0, 119, 181, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(0, 119, 181, 0.3)',
                      }}
                    >
                      <Building2 style={{ width: '40px', height: '40px', color: '#0077b5' }} />
                    </div>
                  )}
                </div>

                <h3
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-poppins), sans-serif',
                  }}
                >
                  Enterprise
                </h3>

                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '32px',
                    lineHeight: 1.6,
                  }}
                >
                  Find the best talent for your company
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/signup/enterprise')}
                  style={{
                    width: '100%',
                    padding: '16px 32px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: 'white',
                    background: '#0077b5',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0, 119, 181, 0.3)',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#005885';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#0077b5';
                  }}
                >
                  Sign Up as Enterprise
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}

