'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NotebookGrid from '@/components/background/NotebookGrid';
import { ArrowLeft, Home, LogIn } from 'lucide-react';
import { getAuth } from '@/lib/storage';

export default function LoginFormPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if user exists in local storage
    const auth = getAuth();
    if (auth && auth.email === email && auth.password === password) {
      // User authenticated, redirect to dashboard
      if (auth.type === 'enterprise') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } else {
      alert('Invalid email or password');
    }
  };

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
            <Home size={18} />
            <span>Worky AI</span>
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/login')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1.5px solid #9ca3af',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
            fontWeight: 600,
            transition: 'all 0.3s',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
            e.currentTarget.style.borderColor = '#0077b5';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 119, 181, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
            e.currentTarget.style.borderColor = '#9ca3af';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
          }}
        >
          <ArrowLeft size={18} style={{ color: '#0077b5' }} />
          <span>Back</span>
        </motion.button>
      </motion.div>
      
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
            maxWidth: '500px',
            margin: '0 auto',
            transformStyle: 'preserve-3d',
          }}
        >
          <div
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

            <div style={{ position: 'relative', zIndex: 10 }}>

              <h2
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  marginBottom: '32px',
                  textAlign: 'center',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-poppins), sans-serif',
                }}
              >
                Log In
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid #9ca3af',
                      background: 'rgba(0, 0, 0, 0.05)',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      transition: 'all 0.3s',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0077b5';
                      e.target.style.background = 'rgba(0, 0, 0, 0.08)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 119, 181, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#9ca3af';
                      e.target.style.background = 'rgba(0, 0, 0, 0.05)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid #9ca3af',
                      background: 'rgba(0, 0, 0, 0.05)',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      transition: 'all 0.3s',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0077b5';
                      e.target.style.background = 'rgba(0, 0, 0, 0.08)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 119, 181, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#9ca3af';
                      e.target.style.background = 'rgba(0, 0, 0, 0.05)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
                  Log In
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}

