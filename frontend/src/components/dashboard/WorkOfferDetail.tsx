'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { WorkOffer, Applicant, getApplicantsByVacantId, getCompanyIdFromEmail } from '@/lib/storage';
import { ArrowLeft, MapPin, DollarSign, Calendar, Briefcase, FileText, Share2, X, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useTranslation } from '@/contexts/TranslationContext';
import AISummary from './AISummary';
import EnterpriseInsights from './EnterpriseInsights';
import ApplicantsTable from './ApplicantsTable';
import BulkCVUpload from './BulkCVUpload';

interface WorkOfferDetailProps {
  offer: WorkOffer;
  onBack: () => void;
}

export default function WorkOfferDetail({ offer, onBack }: WorkOfferDetailProps) {
  const { t } = useTranslation();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [showShareBanner, setShowShareBanner] = useState(true);
  const [lottieData, setLottieData] = useState<any>(null);
  const [chatLottieData, setChatLottieData] = useState<any>(null);

  const loadApplicants = async () => {
    try {
      const appData = await getApplicantsByVacantId(offer.vacant_id);
      setApplicants(appData);
    } catch (error) {
      console.error('Error loading applicants:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      // Get company ID
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user?.email) {
        const id = await getCompanyIdFromEmail(sessionData.session.user.email);
        setCompanyId(id);
      }
      
      // Load applicants
      await loadApplicants();
    };

    init();
  }, [offer.vacant_id]);

  useEffect(() => {
    // Load notfound.json for Lottie animation
    fetch('/noftound.json')
      .then(res => res.json())
      .then(data => {
        if (data.v && data.fr && data.w && data.h) {
          setLottieData(data);
        }
      })
      .catch(() => {
        console.error('Failed to load notfound.json');
      });

    // Load Chat.json for WhatsApp share banner
    fetch('/Chat.json')
      .then(res => res.json())
      .then(data => {
        if (data.v && data.fr && data.w && data.h) {
          setChatLottieData(data);
        }
      })
      .catch(() => {
        console.error('Failed to load Chat.json');
      });
  }, []);

  const handleUploadComplete = async () => {
    // Refresh applicants after upload
    await loadApplicants();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  // Get top 5 candidates
  const topCandidates = [...applicants]
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 5);

  // Calculate insights
  const averageScore = applicants.length > 0
    ? Math.round(applicants.reduce((sum, a) => sum + a.match_score, 0) / applicants.length)
    : 0;

  const allSkills = applicants.flatMap(a => a.skills);
  const skillCounts = allSkills.reduce((acc, skill) => {
    acc[skill] = (acc[skill] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topSkills = Object.entries(skillCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([skill]) => skill);

  // Generate WhatsApp share link with pre-filled message
  const handleShareWhatsApp = () => {
    const message = `Hola, el id de la oferta laboral que estoy interesado es ${offer.vacant_id}`;

    // Encode the message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    // Open WhatsApp in a new window
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header with Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <motion.button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1.5px solid rgba(255, 255, 255, 0.5)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={18} />
            {t('offerDetail.backToOffers')}
          </motion.button>
        </div>
      </motion.div>

      {/* Share Banner */}
      <AnimatePresence>
        {showShareBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          style={{
            marginBottom: '24px',
            borderRadius: '16px',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.15) 0%, rgba(37, 211, 102, 0.1) 100%)',
            border: '2px solid rgba(37, 211, 102, 0.3)',
            boxShadow: '0 8px 32px rgba(37, 211, 102, 0.2)',
            padding: '20px',
            position: 'relative',
          }}
        >
          {/* Close Button */}
          <motion.button
            onClick={() => setShowShareBanner(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.8)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={16} />
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingRight: '40px' }}>
            {/* Lottie Animation */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, rgba(18, 140, 126, 0.1) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(37, 211, 102, 0.2)',
              flexShrink: 0,
              padding: '8px',
            }}>
              {chatLottieData ? (
                <Lottie
                  animationData={chatLottieData}
                  loop={true}
                  autoplay={true}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              ) : (
                <MessageCircle size={32} style={{ color: '#25D366' }} />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                marginBottom: '6px',
                fontFamily: 'var(--font-poppins), sans-serif',
              }}>
                {t('offerDetail.shareJobOffer')}
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                margin: 0,
                marginBottom: '12px',
                lineHeight: 1.5,
              }}>
                {t('offerDetail.shareDescription')}
              </p>

              {/* Share Button */}
              <motion.button
                onClick={handleShareWhatsApp}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  border: 'none',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(37, 211, 102, 0.4)',
                  transition: 'all 0.3s',
                }}
              >
                <Share2 size={18} />
                {t('offerDetail.shareOnWhatsApp')}
              </motion.button>
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Detail Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          borderRadius: '20px',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
          border: '1.5px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          padding: '24px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid rgba(0, 119, 181, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0077b5 0%, #005885 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Briefcase size={18} style={{ color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                  fontFamily: 'var(--font-poppins), sans-serif',
                }}
              >
                {offer.name}
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  color: '#0077b5',
                  fontWeight: 600,
                  marginBottom: '2px',
                }}
              >
                {offer.rol}
              </p>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                }}
              >
                {t('offerDetail.offerId')}: {offer.vacant_id}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(0, 119, 181, 0.05)',
              border: '1.5px solid rgba(0, 119, 181, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <DollarSign size={16} style={{ color: '#0077b5' }} />
              <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                {t('offerDetail.salary')}
              </h3>
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {formatSalary(offer.salary)}
            </p>
          </div>

          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(0, 119, 181, 0.05)',
              border: '1.5px solid rgba(0, 119, 181, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <MapPin size={16} style={{ color: '#0077b5' }} />
              <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                {t('offerDetail.location')}
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {offer.location}
            </p>
          </div>

          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(0, 119, 181, 0.05)',
              border: '1.5px solid rgba(0, 119, 181, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Briefcase size={16} style={{ color: '#0077b5' }} />
              <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                {t('offerDetail.workType')}
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {offer.availability.charAt(0).toUpperCase() + offer.availability.slice(1)}
            </p>
          </div>

          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(0, 119, 181, 0.05)',
              border: '1.5px solid rgba(0, 119, 181, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Calendar size={16} style={{ color: '#0077b5' }} />
              <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                {t('offerDetail.created')}
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {formatDate(offer.create_at)}
            </p>
          </div>
        </div>

        {/* Description Section */}
        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(0, 119, 181, 0.05)',
            border: '1.5px solid rgba(0, 119, 181, 0.1)',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <FileText size={18} style={{ color: '#0077b5' }} />
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {t('offerDetail.jobDescription')}
            </h3>
          </div>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}
          >
            {offer.description}
          </p>
        </div>

        {/* AI Summary Section */}
        {topCandidates.length > 0 && (
          <AISummary topCandidates={topCandidates} />
        )}

        {/* Enterprise Insights */}
        {applicants.length > 0 && (
          <EnterpriseInsights
            totalApplicants={applicants.length}
            averageScore={averageScore}
            topSkills={topSkills}
          />
        )}

        {/* Bulk CV Upload */}
        {companyId && (
          <BulkCVUpload
            vacantId={offer.vacant_id}
            companyId={companyId}
            onUploadComplete={handleUploadComplete}
          />
        )}

        {/* Applicants Table */}
        {applicants.length > 0 ? (
          <ApplicantsTable 
            applicants={applicants} 
            vacantId={offer.vacant_id}
            onStatusUpdate={loadApplicants}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              padding: '48px 24px',
            }}
          >
            {/* Floating Animation Container */}
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                marginBottom: '32px',
              }}
            >
              {/* Glow effect */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.15), rgba(0, 160, 220, 0.15), rgba(0, 119, 181, 0.15))',
                  borderRadius: '50%',
                  filter: 'blur(40px)',
                  transform: 'scale(1.2)',
                  zIndex: -1,
                }}
              />
              
              {/* Lottie Animation */}
              {lottieData ? (
                <Lottie
                  animationData={lottieData}
                  loop={true}
                  autoplay={true}
                  style={{
                    width: '100%',
                    height: 'auto',
                    filter: 'drop-shadow(0 10px 30px rgba(0, 119, 181, 0.3))',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Briefcase size={64} style={{ color: '#0077b5', opacity: 0.5 }} />
                </div>
              )}
            </motion.div>

            {/* Floating Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                textAlign: 'center',
              }}
            >
              <h3
                style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                  fontFamily: 'var(--font-poppins), sans-serif',
                }}
              >
                {t('offerDetail.noApplicantsYet')}
              </h3>
              <p
                style={{
                  fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  maxWidth: '500px',
                  margin: '0 auto',
                }}
              >
                {t('offerDetail.shareToReceive')}
              </p>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}

