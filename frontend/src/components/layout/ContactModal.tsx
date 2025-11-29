'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, MessageCircle, MapPin, Globe } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const contactMethods = [
    {
      icon: <Mail size={20} />,
      label: t('contact.email'),
      value: 'contact@workyai.com',
      action: () => window.open('mailto:contact@workyai.com?subject=Enterprise Inquiry', '_blank'),
    },
    {
      icon: <Phone size={20} />,
      label: t('contact.phone'),
      value: '+1 (555) 123-4567',
      action: () => window.open('tel:+15551234567', '_blank'),
    },
    {
      icon: <MessageCircle size={20} />,
      label: t('contact.whatsapp'),
      value: '+1 (555) 123-4567',
      action: () => window.open('https://wa.me/15551234567?text=Hello%20Worky%20AI%20Team', '_blank'),
    },
    {
      icon: <MapPin size={20} />,
      label: t('contact.address'),
      value: '123 Innovation Drive, Tech City, TC 12345',
      action: () => window.open('https://maps.google.com/?q=123+Innovation+Drive+Tech+City', '_blank'),
    },
    {
      icon: <Globe size={20} />,
      label: t('contact.website'),
      value: 'www.workyai.com',
      action: () => window.open('https://www.workyai.com', '_blank'),
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '520px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1.5px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '24px 24px 20px',
              borderBottom: '1.5px solid rgba(0, 119, 181, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.05) 0%, transparent 100%)',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  marginBottom: '4px',
                  fontFamily: 'var(--font-poppins), sans-serif',
                }}
              >
                {t('contact.contactUs')}
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  margin: 0,
                }}
              >
                {t('contact.getInTouch')}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(0, 119, 181, 0.1)',
                border: '1px solid rgba(0, 119, 181, 0.2)',
                color: '#0077b5',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* Content */}
          <div style={{ padding: '24px' }}>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '24px',
              }}
            >
              {t('contact.getInTouchDesc')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {contactMethods.map((method, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={method.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '1.5px solid rgba(0, 119, 181, 0.15)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 119, 181, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                    e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.15)';
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0,
                    }}
                  >
                    {method.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {method.label}
                    </div>
                    <div
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {method.value}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div
              style={{
                marginTop: '24px',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(0, 119, 181, 0.05)',
                border: '1px solid rgba(0, 119, 181, 0.1)',
              }}
            >
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {t('contact.businessHours')}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

