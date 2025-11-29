'use client';

import { motion } from 'framer-motion';
import { Languages, Globe } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      style={{
        position: 'fixed',
        top: '90px',
        right: '24px',
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(0, 119, 181, 0.2)',
        boxShadow: '0 4px 16px rgba(0, 119, 181, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 1000,
        transition: 'all 0.3s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
        e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
        e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.2)';
      }}
      title={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
    >
      <Globe size={20} style={{ color: '#0077b5' }} />
      <span
        style={{
          position: 'absolute',
          bottom: '4px',
          right: '4px',
          fontSize: '10px',
          fontWeight: 700,
          color: '#0077b5',
          background: 'rgba(0, 119, 181, 0.1)',
          borderRadius: '4px',
          padding: '2px 4px',
          lineHeight: 1,
        }}
      >
        {language.toUpperCase()}
      </span>
    </motion.button>
  );
}

