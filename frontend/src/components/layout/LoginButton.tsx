'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';

export default function LoginButton() {
  const router = useRouter();

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 50,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.8,
        delay: 0.7,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        position: 'fixed',
        right: 'clamp(20px, 3vw, 32px)',
        top: 'clamp(20px, 3vw, 32px)',
        zIndex: 1000,
        pointerEvents: 'auto',
      }}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/login')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 24px',
          borderRadius: '24px',
          fontWeight: 600,
          fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
          color: 'white',
          background: '#0077b5',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 119, 181, 0.3)',
          transition: 'all 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#005885';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 119, 181, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#0077b5';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 119, 181, 0.3)';
        }}
      >
        <LogIn style={{ width: '18px', height: '18px' }} />
        <span>Login</span>
      </motion.button>
    </motion.div>
  );
}

