'use client';

import { motion } from 'framer-motion';

interface SubmitButtonProps {
  disabled: boolean;
  children: React.ReactNode;
}

export default function SubmitButton({ disabled, children }: SubmitButtonProps) {
  return (
    <motion.button
      type="submit"
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '16px 32px',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '1rem',
        color: 'white',
        background: disabled ? 'rgba(0, 119, 181, 0.5)' : '#0077b5',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 4px 12px rgba(0, 119, 181, 0.3)',
        transition: 'all 0.3s',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = '#005885';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = '#0077b5';
        }
      }}
    >
      {children}
    </motion.button>
  );
}

