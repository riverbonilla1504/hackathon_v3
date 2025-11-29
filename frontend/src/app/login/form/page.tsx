 'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Lottie from 'lottie-react';
import NotebookGrid from '@/components/background/NotebookGrid';
import LanguageToggle from '@/components/layout/LanguageToggle';
import { ArrowLeft, LogIn, ShieldCheck, Sparkles, BadgeCheck } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { fetchEnterpriseDataFromSupabase } from '@/lib/storage';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTranslation } from '@/contexts/TranslationContext';

export default function LoginFormPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { showError, showSuccess } = useNotifications();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [heroLottieData, setHeroLottieData] = useState<any>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      setIsLoading(false);
      showError(t('login.invalidCredentials'));
      return;
    }

    // Fetch enterprise data from Supabase and save to local storage
    try {
      const enterpriseData = await fetchEnterpriseDataFromSupabase(email);
      if (!enterpriseData) {
        console.warn('Could not fetch enterprise data, but login was successful');
      }
    } catch (err) {
      console.error('Error fetching enterprise data:', err);
    }

    setIsLoading(false);
    showSuccess(t('login.success'));
    router.push('/dashboard');
  };

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
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
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
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: '4px',
                fontFamily: 'var(--font-cursive), cursive',
                fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
                lineHeight: 1,
              }}
            >
              <span className="theme-text-primary">Worky</span>
              <span
                className="gradient-text"
                style={{
                  background: 'linear-gradient(to right, #0077b5, #00a0dc, #0077b5)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                AI
              </span>
            </span>
          </motion.button>
        </Link>
      </motion.div>

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
              background:
                'linear-gradient(165deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
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
                background:
                  'radial-gradient(circle at top left, rgba(0,119,181,0.2), transparent 55%)',
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
                  <p style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: '#0077b5' }}>
                    {t('login.enterpriseLogin')}
                  </p>
                  <h2
                    style={{
                      fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                      fontWeight: 700,
                      margin: 0,
                      fontFamily: 'var(--font-cursive), cursive',
                    }}
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
                {t('login.logIntoCockpit')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  {
                    icon: <ShieldCheck size={18} color="#0077b5" />,
                    title: t('login.supabaseSession'),
                    text: t('login.loginManaged'),
                  },
                  {
                    icon: <Sparkles size={18} color="#00a0dc" />,
                    title: t('login.smartContext'),
                    text: t('login.rememberData'),
                  },
                ].map(item => (
                  <div
                    key={item.title}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'flex-start',
                      padding: '16px',
                      borderRadius: '16px',
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
                      <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                        {item.title}
                      </p>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ minHeight: '170px', position: 'relative' }}>
                {heroLottieData ? (
                  <Lottie
                    animationData={heroLottieData}
                    loop
                    autoplay
                    style={{ width: '100%', maxWidth: '320px', margin: '0 auto' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '170px',
                      borderRadius: '24px',
                      background: 'rgba(0,119,181,0.08)',
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
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 12px 48px rgba(0,0,0,0.08)',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div>
              <p style={{ fontSize: '0.8rem', letterSpacing: '0.15em', color: '#0077b5', marginBottom: 8 }}>
                SIGN IN
              </p>
              <h3
                style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
                  margin: 0,
                  fontWeight: 700,
                  fontFamily: 'var(--font-cursive), cursive',
                }}
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
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 }}>
                {t('login.useRegisteredEmail')}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '8px' }}
            >
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
                  {t('login.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('login.email')}
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
                  onFocus={e => {
                    e.target.style.borderColor = '#0077b5';
                    e.target.style.background = 'rgba(0, 0, 0, 0.08)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 119, 181, 0.1)';
                  }}
                  onBlur={e => {
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
                  {t('login.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('login.password')}
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
                  onFocus={e => {
                    e.target.style.borderColor = '#0077b5';
                    e.target.style.background = 'rgba(0, 0, 0, 0.08)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 119, 181, 0.1)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#9ca3af';
                    e.target.style.background = 'rgba(0, 0, 0, 0.05)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                style={{
                  width: '100%',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'white',
                  background: isLoading ? '#9ca3af' : '#0077b5',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: isLoading ? 'none' : '0 4px 12px rgba(0, 119, 181, 0.3)',
                  transition: 'all 0.3s',
                }}
              >
                {isLoading ? t('common.loading') : t('login.signIn')}
              </motion.button>
            </form>

            <div
              style={{
                marginTop: 'auto',
                paddingTop: '12px',
                borderTop: '1px solid rgba(148, 163, 184, 0.25)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <BadgeCheck size={16} color="#0077b5" />
              <span>{t('login.enterpriseOnly')}</span>
            </div>
          </motion.aside>
        </motion.div>
      </motion.section>

      {/* Language Toggle */}
      <LanguageToggle />
    </div>
  );
}

