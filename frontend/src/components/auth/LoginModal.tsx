'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserSignup from './UserSignup';
import EnterpriseSignup from './EnterpriseSignup';
import React from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<'choose' | 'login' | 'signup'>('choose');
  const [signupType, setSignupType] = useState<'user' | 'enterprise' | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <AnimatePresence mode="wait">
              {mode === 'choose' && (
                <ChooseMode
                  key="choose"
                  onLogin={() => setMode('login')}
                  onSignup={() => setMode('signup')}
                  onClose={onClose}
                />
              )}

              {mode === 'signup' && !signupType && (
                <ChooseSignupType
                  key="signup-type"
                  onUser={() => setSignupType('user')}
                  onEnterprise={() => setSignupType('enterprise')}
                  onBack={() => setMode('choose')}
                />
              )}

              {mode === 'signup' && signupType === 'user' && (
                <UserSignup
                  key="user-signup"
                  onBack={() => setSignupType(null)}
                  onClose={onClose}
                />
              )}

              {mode === 'signup' && signupType === 'enterprise' && (
                <EnterpriseSignup
                  key="enterprise-signup"
                  onBack={() => setSignupType(null)}
                  onClose={onClose}
                />
              )}

              {mode === 'login' && (
                <LoginForm
                  key="login"
                  onBack={() => setMode('choose')}
                  onClose={onClose}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ChooseMode({ onLogin, onSignup, onClose }: { onLogin: () => void; onSignup: () => void; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        borderRadius: '24px',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
        border: '1.5px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glass shimmer effect */}
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
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}
        >
          ×
        </button>

        <h2
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '32px',
            textAlign: 'center',
            color: 'var(--text-primary)',
          }}
        >
          Welcome to Worky AI
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogin}
            style={{
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

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSignup}
            style={{
              padding: '16px 32px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1rem',
              color: '#0077b5',
              background: 'rgba(0, 119, 181, 0.1)',
              border: '2px solid #0077b5',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 119, 181, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 119, 181, 0.1)';
            }}
          >
            Sign Up
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function ChooseSignupType({ onUser, onEnterprise, onBack }: { onUser: () => void; onEnterprise: () => void; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{
        borderRadius: '24px',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
        border: '1.5px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
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
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          ← Back
        </button>

        <h2
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '32px',
            textAlign: 'center',
            color: 'var(--text-primary)',
          }}
        >
          Choose Account Type
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '32px' }}>
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onUser}
            style={{
              padding: '32px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👤</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
              User
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Upload your CV and get started
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onEnterprise}
            style={{
              padding: '32px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏢</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
              Enterprise
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Register your company
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function LoginForm({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login here
    console.log('Login:', { email, password });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{
        borderRadius: '24px',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
        border: '1.5px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
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
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          ← Back
        </button>

        <h2
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '32px',
            textAlign: 'center',
            color: 'var(--text-primary)',
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
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontFamily: 'inherit',
                transition: 'all 0.3s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0077b5';
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
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
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontFamily: 'inherit',
                transition: 'all 0.3s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0077b5';
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
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
    </motion.div>
  );
}

