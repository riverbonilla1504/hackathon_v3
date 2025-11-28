'use client';

import { motion } from 'framer-motion';
import { Home, FileText, Settings, User } from 'lucide-react';

export default function FloatingNav() {
  return (
    <motion.nav
      initial={{ 
        opacity: 0, 
        x: -50,
        scale: 0.9
      }}
      animate={{ 
        opacity: 1, 
        x: 0,
        scale: 1
      }}
      transition={{ 
        duration: 0.8, 
        delay: 0.7,
        ease: [0.16, 1, 0.3, 1]
      }}
      style={{
        position: 'fixed',
        left: 'clamp(16px, 2vw, 24px)',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          borderRadius: '20px',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
          border: '1.5px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          padding: '16px 12px',
          overflow: 'hidden',
          position: 'relative',
          width: '72px',
        }}
      >
        {/* Enhanced glass shimmer effect */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.5,
            pointerEvents: 'none',
            background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%)',
          }}
        />
        {/* Additional glass reflection */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            opacity: 0.3,
            pointerEvents: 'none',
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent)',
            borderRadius: '20px 20px 0 0',
          }}
        />

        {/* Navigation Items - Icon Only */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <motion.a
            href="#"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              borderRadius: '12px',
              color: '#0077b5',
              textDecoration: 'none',
              transition: 'all 0.3s',
              background: 'rgba(0, 119, 181, 0.12)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              width: '48px',
              height: '48px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 119, 181, 0.25)';
              e.currentTarget.style.color = '#005885';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 119, 181, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 119, 181, 0.12)';
              e.currentTarget.style.color = '#0077b5';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Home style={{ width: '20px', height: '20px' }} />
          </motion.a>

          <motion.a
            href="#"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              borderRadius: '12px',
              color: '#0077b5',
              textDecoration: 'none',
              transition: 'all 0.3s',
              background: 'rgba(0, 119, 181, 0.12)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              width: '48px',
              height: '48px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 119, 181, 0.25)';
              e.currentTarget.style.color = '#005885';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 119, 181, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 119, 181, 0.12)';
              e.currentTarget.style.color = '#0077b5';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <FileText style={{ width: '20px', height: '20px' }} />
          </motion.a>

          <motion.a
            href="#"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              borderRadius: '12px',
              color: '#0077b5',
              textDecoration: 'none',
              transition: 'all 0.3s',
              background: 'rgba(0, 119, 181, 0.12)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              width: '48px',
              height: '48px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 119, 181, 0.25)';
              e.currentTarget.style.color = '#005885';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 119, 181, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 119, 181, 0.12)';
              e.currentTarget.style.color = '#0077b5';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <User style={{ width: '20px', height: '20px' }} />
          </motion.a>

          <motion.a
            href="#"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              borderRadius: '12px',
              color: '#0077b5',
              textDecoration: 'none',
              transition: 'all 0.3s',
              background: 'rgba(0, 119, 181, 0.12)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              width: '48px',
              height: '48px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 119, 181, 0.25)';
              e.currentTarget.style.color = '#005885';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 119, 181, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 119, 181, 0.12)';
              e.currentTarget.style.color = '#0077b5';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Settings style={{ width: '20px', height: '20px' }} />
          </motion.a>
        </div>
      </div>
    </motion.nav>
  );
}

