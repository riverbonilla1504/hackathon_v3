'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Lottie from 'lottie-react';
import NotebookGrid from '@/components/background/NotebookGrid';
import LanguageToggle from '@/components/layout/LanguageToggle';
import { LogIn, UserPlus, ArrowLeft, ShieldCheck, Sparkles, BadgeCheck, Mail, Phone, MessageCircle, MapPin, Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [heroLottieData, setHeroLottieData] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    fetch('/loginindw.json')
      .then(res => res.json())
      .then(data => {
        if (data.v && data.fr && data.w && data.h) {
          setHeroLottieData(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <NotebookGrid />

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
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              cursor: 'pointer',
            }}
          >
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold leading-none"
              style={{ fontFamily: 'var(--font-cursive), cursive' }}
            >
              <span className="block theme-text-primary mb-1">Worky</span>
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
          </motion.div>
        </Link>
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
          padding: '32px 16px',
          perspective: '1000px',
        }}
        className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, z: -200, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, z: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            transformStyle: 'preserve-3d',
          }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch"
        >
          <motion.div
            initial={{ opacity: 0, x: -60, filter: 'blur(12px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              borderRadius: '28px',
              backdropFilter: 'blur(24px) saturate(170%)',
              WebkitBackdropFilter: 'blur(24px) saturate(170%)',
              background: 'linear-gradient(165deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 16px 60px rgba(0, 0, 0, 0.08)',
              padding: '32px',
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at top left, rgba(0,119,181,0.2), transparent 55%)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative', zIndex: 5, height: '100%' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '18px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '16px',
                    background: 'rgba(0,119,181,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(0,119,181,0.2)',
                  }}
                >
                  <LogIn size={24} color="#0077b5" />
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: '#0077b5' }}>{t('login.enterPlatform')}</p>
                  <h2
                    style={{
                      fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                      fontWeight: 700,
                      margin: 0,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {t('login.workyAiAccess')}
                  </h2>
                </div>
              </div>

              <p
                style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '24px',
                  maxWidth: '440px',
                }}
              >
                {t('login.workyAiAccessDesc')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  {
                    icon: <ShieldCheck size={18} color="#0077b5" />,
                    title: t('login.secureEnterpriseLogin'),
                    text: t('login.supabaseAuth'),
                  },
                  {
                    icon: <Sparkles size={18} color="#00a0dc" />,
                    title: t('login.aiCopilotsIncluded'),
                    text: t('login.aiSummarize'),
                  },
                  {
                    icon: <BadgeCheck size={18} color="#005885" />,
                    title: t('login.complianceReady'),
                    text: t('login.auditTrails'),
                  },
                ].map(item => (
                  <div
                    key={item.title}
                    style={{
                      display: 'flex',
                      gap: '14px',
                      alignItems: 'flex-start',
                      padding: '14px',
                      borderRadius: '14px',
                      border: '1px solid rgba(0, 119, 181, 0.15)',
                      background: 'rgba(255, 255, 255, 0.6)',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'rgba(0,119,181,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{item.title}</p>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ minHeight: '180px', position: 'relative' }}>
                {heroLottieData ? (
                  <Lottie
                    animationData={heroLottieData}
                    loop
                    autoplay
                    style={{ width: '100%', maxWidth: '340px', margin: '0 auto' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '180px',
                      borderRadius: '24px',
                      background: 'rgba(0,119,181,0.1)',
                      border: '1px dashed rgba(0,119,181,0.2)',
                    }}
                  />
                )}
              </div>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 60, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              borderRadius: '28px',
              backdropFilter: 'blur(26px) saturate(190%)',
              WebkitBackdropFilter: 'blur(26px) saturate(190%)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 12px 48px rgba(0,0,0,0.08)',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div>
              <p style={{ fontSize: '0.8rem', letterSpacing: '0.15em', color: '#0077b5', marginBottom: 8 }}>{t('login.enterpriseAccess')}</p>
              <h3
                style={{
                  fontSize: 'clamp(2rem, 4vw, 2.6rem)',
                  margin: 0,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                {t('login.controlCenter')}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 }}>
                {t('login.chooseEntry')}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px' }}>
              <button
                onClick={() => router.push('/login/form')}
                style={{
                  border: '1.5px solid rgba(0,119,181,0.3)',
                  borderRadius: '20px',
                  padding: '20px',
                  background: '#0077b5',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(0,119,181,0.25)',
                }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '16px',
                      background: 'rgba(255,255,255,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LogIn size={22} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{t('login.signIn')}</p>
                    <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>{t('login.continueManaging')}</span>
                  </div>
                </div>
                <ArrowLeft style={{ transform: 'rotate(180deg)' }} />
              </button>

              <button
                onClick={() => router.push('/signup/enterprise')}
                style={{
                  border: '1.5px solid rgba(0,119,181,0.15)',
                  borderRadius: '20px',
                  padding: '20px',
                  background: 'rgba(0,119,181,0.05)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '16px',
                      background: 'rgba(0,119,181,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(0,119,181,0.2)',
                    }}
                  >
                    <UserPlus size={22} color="#0077b5" />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{t('login.createAccount')}</p>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {t('login.configureCompany')}
                    </span>
                  </div>
                </div>
                <ArrowLeft style={{ transform: 'rotate(180deg)', color: '#0077b5' }} />
              </button>
            </div>

            <div
              style={{
                marginTop: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div
                style={{
                  padding: '20px',
                  borderRadius: '20px',
                  border: '1px dashed rgba(0,119,181,0.2)',
                  background: 'rgba(0,119,181,0.04)',
                }}
              >
                <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>{t('login.needOnboarding')}</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {t('login.reachOut')}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowContactModal(!showContactModal)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    borderRadius: '14px',
                    border: '1px solid rgba(0,119,181,0.2)',
                    background: 'white',
                    color: '#0077b5',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 119, 181, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = 'rgba(0,119,181,0.2)';
                  }}
                >
                  {t('login.talkToUs')}
                  <motion.div
                    animate={{ rotate: showContactModal ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </motion.button>
              </div>

              {/* Expandable Contact Card */}
              <motion.div
                initial={false}
                animate={{
                  height: showContactModal ? 'auto' : 0,
                  opacity: showContactModal ? 1 : 0,
                }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.6, 1] }}
                style={{
                  overflow: 'hidden',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1.5px solid rgba(0, 119, 181, 0.15)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <div style={{ padding: '20px' }}>
                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      margin: '0 0 12px 0',
                      fontFamily: 'var(--font-poppins), sans-serif',
                    }}
                  >
                    {t('contact.title')}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '20px',
                      lineHeight: 1.6,
                    }}
                  >
                    {t('contact.getInTouch')}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      {
                        icon: <Mail size={18} />,
                        label: 'Email',
                        value: 'contact@workyai.com',
                        action: () => window.open('mailto:contact@workyai.com?subject=Enterprise Inquiry', '_blank'),
                      },
                      {
                        icon: <Phone size={18} />,
                        label: 'Phone',
                        value: '+1 (555) 123-4567',
                        action: () => window.open('tel:+15551234567', '_blank'),
                      },
                      {
                        icon: <MessageCircle size={18} />,
                        label: 'WhatsApp',
                        value: '+1 (555) 123-4567',
                        action: () => window.open('https://wa.me/15551234567?text=Hello%20Worky%20AI%20Team', '_blank'),
                      },
                      {
                        icon: <MapPin size={18} />,
                        label: 'Address',
                        value: '123 Innovation Drive, Tech City',
                        action: () => window.open('https://maps.google.com/?q=123+Innovation+Drive+Tech+City', '_blank'),
                      },
                      {
                        icon: <Globe size={18} />,
                        label: 'Website',
                        value: 'www.workyai.com',
                        action: () => window.open('https://www.workyai.com', '_blank'),
                      },
                    ].map((method, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: showContactModal ? 1 : 0, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={method.action}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '1px solid rgba(0, 119, 181, 0.1)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 119, 181, 0.05)';
                          e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                          e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.1)';
                        }}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
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
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              color: 'var(--text-secondary)',
                              marginBottom: '2px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          >
                            {method.label}
                          </div>
                          <div
                            style={{
                              fontSize: '0.875rem',
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
                      marginTop: '16px',
                      padding: '12px',
                      borderRadius: '10px',
                      background: 'rgba(0, 119, 181, 0.05)',
                      border: '1px solid rgba(0, 119, 181, 0.1)',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      <strong style={{ color: '#0077b5' }}>{t('contact.businessHours').split(':')[0]}:</strong> {t('contact.businessHours').split(':')[1]?.trim()}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.aside>
        </motion.div>
      </motion.section>

      {/* Language Toggle */}
      <LanguageToggle />
    </div>
  );
}
