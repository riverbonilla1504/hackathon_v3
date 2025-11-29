'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import NotebookGrid from '@/components/background/NotebookGrid';
import { getEnterpriseData, logout, EnterpriseData, getWorkOffers, WorkOffer, fetchEnterpriseDataFromSupabase, getCompanyIdFromEmail } from '@/lib/storage';
import { Building2, Mail, FileText, Briefcase, LogOut, Home, ListChecks, Plus, User, ArrowLeft, LayoutDashboard, Video } from 'lucide-react';
import CreateWorkOfferForm, { CreateWorkOfferFormRef } from '@/components/dashboard/CreateWorkOfferForm';
import WorkOfferAIChat from '@/components/dashboard/WorkOfferAIChat';
import WorkOffersList from '@/components/dashboard/WorkOffersList';
import WorkOfferDetail from '@/components/dashboard/WorkOfferDetail';
import EnterpriseProfile from '@/components/dashboard/EnterpriseProfile';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import AIAssistant from '@/components/dashboard/AIAssistant';
import LanguageToggle from '@/components/layout/LanguageToggle';
import Meetings from '@/components/dashboard/Meetings';
import { supabase } from '@/lib/supabaseClient';
import { useTranslation } from '@/contexts/TranslationContext';

type DashboardView = 'summary' | 'offers' | 'create' | 'profile' | 'meetings';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [enterpriseData, setEnterpriseData] = useState<EnterpriseData | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<DashboardView>('summary');
  const [workOffers, setWorkOffers] = useState<WorkOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<WorkOffer | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const offersButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<CreateWorkOfferFormRef>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/login');
        return;
      }

      // Try to load enterprise data from local cache first
      let localEnterprise = getEnterpriseData();
      
      // If not in local storage, fetch from Supabase
      if (!localEnterprise && data.session.user?.email) {
        localEnterprise = await fetchEnterpriseDataFromSupabase(data.session.user.email);
      }

      setEnterpriseData(localEnterprise);

      // Get company ID
      if (data.session.user?.email) {
        const id = await getCompanyIdFromEmail(data.session.user.email);
        setCompanyId(id);
      }

      // Load work offers from Supabase
      const offers = await getWorkOffers();
      setWorkOffers(offers);

      setSessionLoaded(true);
    };

    init();
  }, [router]);

  const refreshWorkOffers = async () => {
    const offers = await getWorkOffers();
    setWorkOffers(offers);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!sessionLoaded) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <NotebookGrid />
      
      {/* Sidebar */}
      <motion.aside
        data-ai-target="sidebar"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '280px',
          zIndex: 1000,
          padding: '24px 16px',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.3) 100%)',
          borderRight: '1.5px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
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
          }}
        />

        <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Logo */}
          <Link href="/" passHref>
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{ cursor: 'pointer', marginBottom: '24px' }}
            >
              <h1 
                className="text-2xl sm:text-3xl font-bold leading-none"
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
            </motion.div>
          </Link>

          {/* Enterprise Profile Info */}
          {enterpriseData && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.4)',
                border: '1.5px solid rgba(0, 119, 181, 0.2)',
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {enterpriseData.company_logo ? (
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: `url(${enterpriseData.company_logo}) center/cover`,
                      border: '2px solid rgba(255, 255, 255, 0.8)',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #0077b5 0%, #005885 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid rgba(255, 255, 255, 0.8)',
                      flexShrink: 0,
                    }}
                  >
                    <Building2 size={24} style={{ color: 'white' }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {enterpriseData.trade_name || enterpriseData.legal_name || 'Enterprise'}
                  </p>
                  {companyId && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: '#0077b5',
                        margin: '4px 0 0 0',
                        fontWeight: 600,
                      }}
                    >
                      ID: {companyId}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {!selectedOffer ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveView('summary');
                    setSelectedOffer(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: activeView === 'summary' 
                      ? 'rgba(0, 119, 181, 0.15)' 
                      : 'transparent',
                    border: activeView === 'summary'
                      ? '1.5px solid rgba(0, 119, 181, 0.3)'
                      : '1.5px solid transparent',
                    color: activeView === 'summary' ? '#0077b5' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: activeView === 'summary' ? 600 : 500,
                    transition: 'all 0.3s',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    if (activeView !== 'summary') {
                      e.currentTarget.style.background = 'rgba(0, 119, 181, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeView !== 'summary') {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <LayoutDashboard size={20} style={{ color: activeView === 'summary' ? '#0077b5' : 'var(--text-secondary)' }} />
                  <span>{t('nav.overview')}</span>
                </motion.button>

                <motion.button
                  data-ai-target="offers"
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveView('offers');
                    setSelectedOffer(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: activeView === 'offers' 
                      ? 'rgba(0, 119, 181, 0.15)' 
                      : 'transparent',
                    border: activeView === 'offers'
                      ? '1.5px solid rgba(0, 119, 181, 0.3)'
                      : '1.5px solid transparent',
                    color: activeView === 'offers' ? '#0077b5' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: activeView === 'offers' ? 600 : 500,
                    transition: 'all 0.3s',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    if (activeView !== 'offers') {
                      e.currentTarget.style.background = 'rgba(0, 119, 181, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeView !== 'offers') {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <ListChecks size={20} style={{ color: activeView === 'offers' ? '#0077b5' : 'var(--text-secondary)' }} />
                  <span>{t('nav.workOffers')}</span>
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedOffer(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'rgba(0, 119, 181, 0.15)',
                    border: '1.5px solid rgba(0, 119, 181, 0.3)',
                    color: '#0077b5',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    transition: 'all 0.3s',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <ArrowLeft size={20} style={{ color: '#0077b5' }} />
                  <span>{t('nav.backToOffers')}</span>
                </motion.button>
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(0, 119, 181, 0.05)',
                  border: '1px solid rgba(0, 119, 181, 0.1)',
                  marginTop: '8px',
                }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 8px 0', fontWeight: 600 }}>
                    {t('dashboard.viewing')}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
                    {selectedOffer.name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#0077b5', margin: '4px 0 0 0' }}>
                    {selectedOffer.rol}
                  </p>
                </div>
              </>
            )}

            <motion.button
              data-ai-target="create"
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveView('create')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: activeView === 'create' 
                  ? 'rgba(0, 119, 181, 0.15)' 
                  : 'transparent',
                border: activeView === 'create'
                  ? '1.5px solid rgba(0, 119, 181, 0.3)'
                  : '1.5px solid transparent',
                color: activeView === 'create' ? '#0077b5' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: activeView === 'create' ? 600 : 500,
                transition: 'all 0.3s',
                textAlign: 'left',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                if (activeView !== 'create') {
                  e.currentTarget.style.background = 'rgba(0, 119, 181, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== 'create') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Plus size={20} style={{ color: activeView === 'create' ? '#0077b5' : 'var(--text-secondary)' }} />
              <span>{t('nav.createOffer')}</span>
            </motion.button>

            <motion.button
              data-ai-target="meetings"
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveView('meetings');
                setSelectedOffer(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: activeView === 'meetings' 
                  ? 'rgba(0, 119, 181, 0.15)' 
                  : 'transparent',
                border: activeView === 'meetings'
                  ? '1.5px solid rgba(0, 119, 181, 0.3)'
                  : '1.5px solid transparent',
                color: activeView === 'meetings' ? '#0077b5' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: activeView === 'meetings' ? 600 : 500,
                transition: 'all 0.3s',
                textAlign: 'left',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                if (activeView !== 'meetings') {
                  e.currentTarget.style.background = 'rgba(0, 119, 181, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== 'meetings') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Video size={20} style={{ color: activeView === 'meetings' ? '#0077b5' : 'var(--text-secondary)' }} />
              <span>{t('nav.meetings')}</span>
            </motion.button>

            <motion.button
              data-ai-target="profile"
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveView('profile');
                setSelectedOffer(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: activeView === 'profile' 
                  ? 'rgba(0, 119, 181, 0.15)' 
                  : 'transparent',
                border: activeView === 'profile'
                  ? '1.5px solid rgba(0, 119, 181, 0.3)'
                  : '1.5px solid transparent',
                color: activeView === 'profile' ? '#0077b5' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: activeView === 'profile' ? 600 : 500,
                transition: 'all 0.3s',
                textAlign: 'left',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                if (activeView !== 'profile') {
                  e.currentTarget.style.background = 'rgba(0, 119, 181, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== 'profile') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Building2 size={20} style={{ color: activeView === 'profile' ? '#0077b5' : 'var(--text-secondary)' }} />
              <span>{t('nav.profile')}</span>
            </motion.button>
          </nav>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1.5px solid #9ca3af',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 600,
              transition: 'all 0.3s',
              marginTop: 'auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.borderColor = '#0077b5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
          >
            <LogOut size={20} style={{ color: '#0077b5' }} />
            <span>{t('nav.logout')}</span>
          </motion.button>
        </div>
      </motion.aside>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'relative',
          minHeight: '100vh',
          marginLeft: '280px',
          padding: '48px 32px',
        }}
        className="px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          {/* Content based on active view */}
          {activeView === 'summary' && (
            <DashboardSummary
              workOffers={workOffers}
              onCreateOffer={() => setActiveView('create')}
              onViewOffers={() => setActiveView('offers')}
            />
          )}

          {activeView === 'offers' && (
            <div>
              {selectedOffer ? (
                <WorkOfferDetail
                  offer={selectedOffer}
                  onBack={() => setSelectedOffer(null)}
                />
              ) : (
                <>
                  <h2
                    style={{
                      fontSize: 'clamp(2rem, 5vw, 3rem)',
                      fontWeight: 700,
                      marginBottom: '32px',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-poppins), sans-serif',
                    }}
                  >
                    {t('offers.title')}
                  </h2>
                  <WorkOffersList
                    offers={workOffers}
                    onDelete={refreshWorkOffers}
                    onSelectOffer={setSelectedOffer}
                    onCreateOffer={() => setActiveView('create')}
                  />
                </>
              )}
            </div>
          )}

          {activeView === 'create' && (
            <div>
              <h2
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  fontWeight: 700,
                  marginBottom: '32px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-poppins), sans-serif',
                }}
              >
                Create Work Offer
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) minmax(380px, 420px)',
                  gap: '32px',
                  alignItems: 'start',
                }}
              >
              <CreateWorkOfferForm
                  ref={formRef}
                onSuccess={() => {
                  refreshWorkOffers();
                  setActiveView('offers');
                }}
              />
                <WorkOfferAIChat
                  onApplySuggestion={(suggestion) => {
                    if (formRef.current) {
                      formRef.current.applySuggestion({
                        name: suggestion.name,
                        rol: suggestion.rol,
                        salary: suggestion.salary,
                        description: suggestion.description,
                        availability: suggestion.availability,
                        location: suggestion.location,
                        skills: suggestion.skills,
                      });
                    }
                  }}
                />
              </div>
            </div>
          )}

          {activeView === 'meetings' && (
            <Meetings workOffers={workOffers} />
          )}

          {activeView === 'profile' && enterpriseData && (
            <div>
              <EnterpriseProfile 
                enterpriseData={enterpriseData}
                onUpdate={(updatedData) => {
                  setEnterpriseData(updatedData);
                }}
              />
            </div>
          )}
        </motion.div>
      </motion.section>

      {/* AI Assistant */}
      <AIAssistant
        currentPage={activeView}
        workOffersCount={workOffers.length}
        workOffers={workOffers}
        hasProfile={!!enterpriseData}
        enterpriseName={enterpriseData?.trade_name || enterpriseData?.legal_name || undefined}
        companyId={companyId || undefined}
        onNavigate={(page) => {
          if (page === 'offers') setActiveView('offers');
          else if (page === 'create') setActiveView('create');
          else if (page === 'profile') setActiveView('profile');
          else if (page === 'meetings') setActiveView('meetings');
          else if (page === 'summary') setActiveView('summary');
        }}
        onWorkOfferCreated={() => {
          refreshWorkOffers();
        }}
      />

      {/* Language Toggle */}
      <LanguageToggle />
    </div>
  );
}

