'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { WorkOffer, getApplicants, getApplicantsByVacantId, getAllApplicantsFromSupabase, Applicant } from '@/lib/storage';
import { 
  Briefcase, Plus, TrendingUp, Users, FileText, Sparkles, 
  ArrowRight, CheckCircle2, BarChart3, Clock, MapPin, DollarSign,
  Activity, Target, Zap, XCircle, PauseCircle
} from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

interface DashboardSummaryProps {
  workOffers: WorkOffer[];
  onCreateOffer: () => void;
  onViewOffers: () => void;
}

export default function DashboardSummary({ workOffers, onCreateOffer, onViewOffers }: DashboardSummaryProps) {
  const { t } = useTranslation();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [applicationsPerOffer, setApplicationsPerOffer] = useState<{ name: string; count: number }[]>([]);
  const [applicationTrends, setApplicationTrends] = useState<{ date: string; count: number }[]>([]);
  const [lottieData, setLottieData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Only fetch applicants for the user's work offers
      const vacantIds = workOffers.map(offer => offer.vacant_id);
      const allApplicants = vacantIds.length > 0 
        ? await getAllApplicantsFromSupabase(vacantIds)
        : [];
      setApplicants(allApplicants);

      // Calculate applications per offer
      const perOfferPromises = workOffers.map(async (offer) => {
        const applicants = await getApplicantsByVacantId(offer.vacant_id);
        return {
          name: offer.name.length > 20 ? offer.name.substring(0, 20) + '...' : offer.name,
          count: applicants.length,
        };
      });
      
      const perOffer = await Promise.all(perOfferPromises);
      perOffer.sort((a, b) => b.count - a.count);
      setApplicationsPerOffer(perOffer);

      // Calculate application trends (last 7 days)
      const trends: { [key: string]: number } = {};
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        trends[dateStr] = 0;
      }

      allApplicants.forEach(applicant => {
        const appDate = new Date(applicant.applied_at);
        const daysAgo = Math.floor((today.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo >= 0 && daysAgo <= 6) {
          const dateStr = appDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (trends[dateStr] !== undefined) {
            trends[dateStr]++;
          }
        }
      });

      setApplicationTrends(Object.entries(trends).map(([date, count]) => ({ date, count })));
    };

    fetchData();
  }, [workOffers]);

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
  }, []);

  const totalOffers = workOffers.length;
  const recentOffers = workOffers.filter(offer => {
    const offerDate = new Date(offer.create_at);
    const daysAgo = (Date.now() - offerDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 7;
  }).length;

  const totalSalary = workOffers.reduce((sum, offer) => sum + (offer.salary || 0), 0);
  const avgSalary = totalOffers > 0 ? Math.round(totalSalary / totalOffers) : 0;

  const totalApplications = applicants.length;
  const avgApplicationsPerOffer = totalOffers > 0 ? Math.round(totalApplications / totalOffers) : 0;
  const responseRate = totalOffers > 0 ? Math.round((totalApplications / totalOffers) * 100) / 100 : 0;

  // Calculate applicants by status
  const approvedCount = applicants.filter(a => a.status === 'approved').length;
  const rejectedCount = applicants.filter(a => a.status === 'rejected').length;
  const pendingCount = applicants.filter(a => a.status === 'pending').length;

  // Calculate applicants by status per offer
  const applicantsByOfferAndStatus = workOffers.map(offer => {
    const offerApplicants = applicants.filter(a => a.vacant_id === offer.vacant_id);
    return {
      offerName: offer.name,
      offerId: offer.vacant_id,
      approved: offerApplicants.filter(a => a.status === 'approved').length,
      rejected: offerApplicants.filter(a => a.status === 'rejected').length,
      pending: offerApplicants.filter(a => a.status === 'pending').length,
      total: offerApplicants.length,
    };
  }).filter(item => item.total > 0);

  const availabilityBreakdown = {
    remote: workOffers.filter(o => o.availability === 'remote').length,
    hybrid: workOffers.filter(o => o.availability === 'hybrid').length,
    'on site': workOffers.filter(o => o.availability === 'on site').length,
  };

  const maxApplications = Math.max(...applicationsPerOffer.map(o => o.count), 1);
  const maxTrendCount = Math.max(...applicationTrends.map(t => t.count), 1);

  const stats = [
    {
      icon: Briefcase,
      label: t('dashboard.totalOffers'),
      value: totalOffers,
      color: '#0077b5',
    },
    {
      icon: Clock,
      label: t('dashboard.recentOffers'),
      value: recentOffers,
      color: '#00a0dc',
    },
    {
      icon: DollarSign,
      label: t('dashboard.avgSalary'),
      value: avgSalary > 0 ? `$${avgSalary.toLocaleString()}` : 'N/A',
      color: '#10b981',
    },
    {
      icon: Users,
      label: t('dashboard.totalApplications'),
      value: totalApplications,
      color: '#f59e0b',
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: t('dashboard.step1'),
      description: t('dashboard.step1Desc'),
      icon: Plus,
    },
    {
      step: 2,
      title: t('dashboard.step2'),
      description: t('dashboard.step2Desc'),
      icon: Sparkles,
    },
    {
      step: 3,
      title: t('dashboard.step3'),
      description: t('dashboard.step3Desc'),
      icon: Users,
    },
    {
      step: 4,
      title: t('dashboard.step4'),
      description: t('dashboard.step4Desc'),
      icon: FileText,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 700,
            marginBottom: '12px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-poppins), sans-serif',
          }}
        >
          {t('dashboard.title')}
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: 0 }}>
          {t('dashboard.welcome')}
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
        }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            whileHover={{ y: -2 }}
            style={{
              padding: '32px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
              backdropFilter: 'blur(12px)',
              willChange: 'transform',
              transform: 'translateZ(0)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(0, 119, 181, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '140px',
            }}
          >
            {/* Decorative gradient background */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '120px',
                height: '120px',
                background: `radial-gradient(circle, ${stat.color}20 0%, transparent 70%)`,
                borderRadius: '50%',
                transform: 'translate(30px, -30px)',
                pointerEvents: 'none',
              }}
            />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '18px',
                  background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 24px ${stat.color}40`,
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <stat.icon size={36} style={{ color: 'white' }} />
              </motion.div>
              <div style={{ flex: 1 }}>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    margin: 0,
                    background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}cc 100%)`,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 + index * 0.05 }}
                  style={{
                    fontSize: '1rem',
                    color: 'var(--text-secondary)',
                    margin: '8px 0 0 0',
                    fontWeight: 600,
                    letterSpacing: '0.3px',
                  }}
                >
                  {stat.label}
                </motion.p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Applicant Status Statistics */}
      {totalApplications > 0 && (
        <>
          {/* Status Overview Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
            }}
          >
            {[
              {
                icon: CheckCircle2,
                label: t('dashboard.approvedCandidates'),
                value: approvedCount,
                color: '#22c55e',
                bgGradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
              },
              {
                icon: XCircle,
                label: t('dashboard.rejectedCandidates'),
                value: rejectedCount,
                color: '#ef4444',
                bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
              },
              {
                icon: PauseCircle,
                label: t('dashboard.pendingCandidates'),
                value: pendingCount,
                color: '#f59e0b',
                bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                whileHover={{ y: -2 }}
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  background: stat.bgGradient,
                  border: `2px solid ${stat.color}30`,
                  boxShadow: `0 8px 32px ${stat.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}cc 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${stat.color}40`,
                    flexShrink: 0,
                  }}
                >
                  <stat.icon size={32} style={{ color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: '2rem',
                      fontWeight: 800,
                      margin: 0,
                      color: stat.color,
                      lineHeight: 1.2,
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      margin: '4px 0 0 0',
                      fontWeight: 600,
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Status by Work Offer */}
          {applicantsByOfferAndStatus.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              style={{
                padding: '28px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 8px 32px rgba(0, 119, 181, 0.15)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative background */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(0, 119, 181, 0.1) 0%, transparent 70%)',
                  borderRadius: '50%',
                  transform: 'translate(50px, -50px)',
                  pointerEvents: 'none',
                }}
              />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 119, 181, 0.3)',
                  }}
                >
                  <Activity size={24} style={{ color: 'white' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    {t('dashboard.statusByOffer')}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    {t('dashboard.statusByOfferDesc')}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 1 }}>
                {applicantsByOfferAndStatus.map((item, index) => {
                  const maxStatus = Math.max(item.approved, item.rejected, item.pending, 1);
                  return (
                    <motion.div
                      key={item.offerId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                      style={{
                        padding: '20px',
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.6)',
                        border: '1.5px solid rgba(0, 119, 181, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        {item.offerName.length > 40 ? item.offerName.substring(0, 40) + '...' : item.offerName}
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* Approved */}
                        {item.approved > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
                              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', minWidth: '80px' }}>
                                {t('dashboard.approved')}
                              </span>
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.2)', overflow: 'hidden' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(item.approved / maxStatus) * 100}%` }}
                                  transition={{ duration: 0.6, delay: 0.4 + index * 0.05 }}
                                  style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                                    borderRadius: '4px',
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#22c55e', minWidth: '30px', textAlign: 'right' }}>
                                {item.approved}
                              </span>
                            </div>
                          </div>
                        )}
                        {/* Rejected */}
                        {item.rejected > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <XCircle size={16} style={{ color: '#ef4444' }} />
                              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', minWidth: '80px' }}>
                                {t('dashboard.rejected')}
                              </span>
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', overflow: 'hidden' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(item.rejected / maxStatus) * 100}%` }}
                                  transition={{ duration: 0.6, delay: 0.45 + index * 0.05 }}
                                  style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                                    borderRadius: '4px',
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ef4444', minWidth: '30px', textAlign: 'right' }}>
                                {item.rejected}
                              </span>
                            </div>
                          </div>
                        )}
                        {/* Pending */}
                        {item.pending > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <PauseCircle size={16} style={{ color: '#f59e0b' }} />
                              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', minWidth: '80px' }}>
                                {t('dashboard.pending')}
                              </span>
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', overflow: 'hidden' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(item.pending / maxStatus) * 100}%` }}
                                  transition={{ duration: 0.6, delay: 0.5 + index * 0.05 }}
                                  style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)',
                                    borderRadius: '4px',
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f59e0b', minWidth: '30px', textAlign: 'right' }}>
                                {item.pending}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Empty State or Quick Actions */}
      {totalOffers === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
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
              willChange: 'transform',
              transform: 'translateZ(0)',
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
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '12px',
                fontFamily: 'var(--font-poppins), sans-serif',
              }}
            >
              No Work Offers Found
            </h2>
            <p
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                maxWidth: '500px',
                margin: '0 auto 32px',
              }}
            >
              Get started by creating your first work offer. Our AI will help you find the perfect candidates!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateOffer}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 32px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0, 119, 181, 0.3)',
              }}
            >
              <Plus size={20} />
              Create Your First Offer
            </motion.button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Applications Per Offer Chart */}
          {applicationsPerOffer.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              style={{
                padding: '28px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 8px 32px rgba(0, 119, 181, 0.15)',
                gridColumn: 'span 2',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative background */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(0, 119, 181, 0.1) 0%, transparent 70%)',
                  borderRadius: '50%',
                  transform: 'translate(50px, -50px)',
                  pointerEvents: 'none',
                }}
              />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 119, 181, 0.3)',
                  }}
                >
                  <BarChart3 size={24} style={{ color: 'white' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    {t('dashboard.applicationsPerOffer')}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    {t('dashboard.applicationsPerOfferDesc')}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '240px', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                {applicationsPerOffer.slice(0, 6).map((item, index) => {
                  const height = (item.count / maxApplications) * 100;
                  const gradientColors = [
                    ['#0077b5', '#00a0dc'],
                    ['#00a0dc', '#34d399'],
                    ['#34d399', '#10b981'],
                    ['#10b981', '#f59e0b'],
                    ['#f59e0b', '#f97316'],
                    ['#f97316', '#ef4444'],
                  ];
                  const colors = gradientColors[index % gradientColors.length];
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 + index * 0.05 }}
                      whileHover={{ y: -4 }}
                      style={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '12px', 
                        cursor: 'pointer',
                        willChange: 'transform',
                        transform: 'translateZ(0)',
                      }}
                    >
                      <div style={{ position: 'relative', width: '100%', height: '200px', display: 'flex', alignItems: 'flex-end' }}>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.6, delay: 0.3 + index * 0.05 }}
                          style={{
                            width: '100%',
                            background: `linear-gradient(to top, ${colors[0]}, ${colors[1]})`,
                            borderRadius: '12px 12px 0 0',
                            minHeight: item.count > 0 ? '8px' : '0',
                            boxShadow: `0 4px 16px ${colors[0]}50`,
                            position: 'relative',
                            overflow: 'hidden',
                            willChange: 'height',
                            transform: 'translateZ(0)',
                          }}
                        >
                        </motion.div>
                        {item.count > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                            style={{
                              position: 'absolute',
                              top: `${100 - height}%`,
                              left: '50%',
                              transform: 'translateX(-50%) translateY(-32px)',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              background: 'rgba(255, 255, 255, 0.95)',
                              backdropFilter: 'blur(8px)',
                              border: '1.5px solid rgba(0, 119, 181, 0.2)',
                              fontSize: '0.875rem',
                              fontWeight: 700,
                              color: '#0077b5',
                              whiteSpace: 'nowrap',
                              boxShadow: '0 4px 12px rgba(0, 119, 181, 0.2)',
                            }}
                          >
                            {item.count} {item.count === 1 ? t('dashboard.app') : t('dashboard.apps')}
                          </motion.div>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-primary)',
                          textAlign: 'center',
                          fontWeight: 600,
                          lineHeight: 1.3,
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 4px',
                        }}
                      >
                        {item.name}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Application Trends Chart */}
          {applicationTrends.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              style={{
                padding: '28px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 8px 32px rgba(0, 119, 181, 0.15)',
                gridColumn: 'span 2',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative background */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(0, 160, 220, 0.1) 0%, transparent 70%)',
                  borderRadius: '50%',
                  transform: 'translate(-50px, 50px)',
                  pointerEvents: 'none',
                }}
              />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #00a0dc 0%, #34d399 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 160, 220, 0.3)',
                  }}
                >
                  <Activity size={24} style={{ color: 'white' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    {t('dashboard.applicationTrends')}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    {t('dashboard.applicationTrendsDesc')}
                  </p>
                </div>
              </div>
              <div style={{ position: 'relative', height: '240px', marginBottom: '20px', zIndex: 1, willChange: 'contents', transform: 'translateZ(0)' }}>
                <svg width="100%" height="240" style={{ overflow: 'visible', willChange: 'contents' }}>
                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0077b5" stopOpacity="1" />
                      <stop offset="50%" stopColor="#00a0dc" stopOpacity="1" />
                      <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0077b5" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#0077b5" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area fill */}
                  <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    d={`M ${(0 / (applicationTrends.length - 1)) * 100}% ${100 - (applicationTrends[0].count / maxTrendCount) * 80}% ${applicationTrends.map((trend, index) => {
                      const x = (index / (applicationTrends.length - 1)) * 100;
                      const y = 100 - (trend.count / maxTrendCount) * 80;
                      return `L ${x}% ${y}%`;
                    }).join(' ')} L ${(applicationTrends.length - 1) / (applicationTrends.length - 1) * 100}% 100% L 0% 100% Z`}
                    fill="url(#areaGradient)"
                    style={{ willChange: 'opacity' }}
                  />
                  
                  {applicationTrends.map((trend, index) => {
                    const x = (index / (applicationTrends.length - 1)) * 100;
                    const y = 100 - (trend.count / maxTrendCount) * 80;
                    const nextTrend = applicationTrends[index + 1];
                    const nextX = nextTrend ? ((index + 1) / (applicationTrends.length - 1)) * 100 : x;
                    const nextY = nextTrend ? 100 - (nextTrend.count / maxTrendCount) * 80 : y;
                    
                    return (
                      <g key={index} style={{ willChange: 'opacity' }}>
                        {index < applicationTrends.length - 1 && (
                          <line
                            x1={`${x}%`}
                            y1={`${y}%`}
                            x2={`${nextX}%`}
                            y2={`${nextY}%`}
                            stroke="url(#lineGradient)"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                            style={{ 
                              filter: 'drop-shadow(0 2px 8px rgba(0, 119, 181, 0.4))',
                              opacity: 0,
                              animation: `fadeIn 0.3s ease-out ${0.25 + index * 0.03}s forwards`,
                            }}
                          />
                        )}
                        <circle
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r="8"
                          fill="white"
                          stroke="#0077b5"
                          strokeWidth="3"
                          style={{ 
                            filter: 'drop-shadow(0 2px 4px rgba(0, 119, 181, 0.3))', 
                            cursor: 'pointer',
                            opacity: 0,
                            animation: `fadeIn 0.2s ease-out ${0.3 + index * 0.03}s forwards`,
                          }}
                        />
                        <circle
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r="4"
                          fill="#0077b5"
                          style={{
                            opacity: 0,
                            animation: `fadeIn 0.2s ease-out ${0.35 + index * 0.03}s forwards`,
                          }}
                        />
                        <text
                          x={`${x}%`}
                          y="230"
                          textAnchor="middle"
                          fontSize="11"
                          fill="var(--text-secondary)"
                          fontWeight="600"
                        >
                          {trend.date.split(' ')[1]}
                        </text>
                        {trend.count > 0 && (
                          <text
                            x={`${x}%`}
                            y={`${y - 16}%`}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#0077b5"
                            fontWeight="700"
                            style={{ 
                              filter: 'drop-shadow(0 1px 2px rgba(0, 119, 181, 0.2))',
                              opacity: 0,
                              animation: `fadeIn 0.2s ease-out ${0.4 + index * 0.03}s forwards`,
                            }}
                          >
                            {trend.count}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </motion.div>
          )}

          {/* Availability Breakdown with Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            style={{
              padding: '28px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(0, 119, 181, 0.15)',
              gridColumn: 'span 2',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative background */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '150px',
                height: '150px',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                transform: 'translate(-30px, -30px)',
                pointerEvents: 'none',
              }}
            />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                }}
              >
                <Target size={24} style={{ color: 'white' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {t('dashboard.availabilityTypes')}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  {t('dashboard.availabilityTypesDesc')}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '160px', height: '160px', position: 'relative', flexShrink: 0, willChange: 'contents', transform: 'translateZ(0)' }}>
                <svg width="160" height="160" viewBox="0 0 160 160" style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 119, 181, 0.2))', willChange: 'contents' }}>
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="rgba(0, 119, 181, 0.1)"
                    strokeWidth="16"
                  />
                  {(() => {
                    const total = Object.values(availabilityBreakdown).reduce((a, b) => a + b, 0);
                    if (total === 0) return null;
                    let currentAngle = -90;
                    const colors = { remote: '#0077b5', hybrid: '#00a0dc', 'on site': '#10b981' };
                    return Object.entries(availabilityBreakdown).map(([type, count], index) => {
                      const percentage = (count / total) * 100;
                      const angle = (percentage / 100) * 360;
                      const startAngle = currentAngle;
                      const endAngle = currentAngle + angle;
                      currentAngle = endAngle;
                      
                      if (count === 0) return null;
                      
                      const startX = 80 + 70 * Math.cos((startAngle * Math.PI) / 180);
                      const startY = 80 + 70 * Math.sin((startAngle * Math.PI) / 180);
                      const endX = 80 + 70 * Math.cos((endAngle * Math.PI) / 180);
                      const endY = 80 + 70 * Math.sin((endAngle * Math.PI) / 180);
                      const largeArc = angle > 180 ? 1 : 0;
                      
                      return (
                        <path
                          key={type}
                          d={`M 80 80 L ${startX} ${startY} A 70 70 0 ${largeArc} 1 ${endX} ${endY} Z`}
                          fill={colors[type as keyof typeof colors]}
                          style={{ 
                            filter: `drop-shadow(0 2px 8px ${colors[type as keyof typeof colors]}50)`,
                            opacity: 0,
                            animation: `fadeIn 0.3s ease-out ${0.3 + index * 0.1}s forwards`,
                            willChange: 'opacity',
                          }}
                        />
                      );
                    });
                  })()}
                  {/* Center circle for donut effect */}
                  <circle
                    cx="80"
                    cy="80"
                    r="50"
                    fill="white"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
                  />
                  <text
                    x="80"
                    y="75"
                    textAnchor="middle"
                    fontSize="20"
                    fontWeight="700"
                    fill="#0077b5"
                  >
                    {Object.values(availabilityBreakdown).reduce((a, b) => a + b, 0)}
                  </text>
                  <text
                    x="80"
                    y="95"
                    textAnchor="middle"
                    fontSize="11"
                    fill="var(--text-secondary)"
                    fontWeight="600"
                  >
                    {t('dashboard.total')}
                  </text>
                </svg>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.entries(availabilityBreakdown).map(([type, count], index) => {
                  const total = Object.values(availabilityBreakdown).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                  const colors: { [key: string]: string } = { remote: '#0077b5', hybrid: '#00a0dc', 'on site': '#10b981' };
                  return (
                    <motion.div
                      key={type}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      whileHover={{ x: 2 }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.6)',
                        border: `1.5px solid ${colors[type]}30`,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        willChange: 'transform',
                        transform: 'translateZ(0)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${colors[type]}10`;
                        e.currentTarget.style.borderColor = `${colors[type]}50`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                        e.currentTarget.style.borderColor = `${colors[type]}30`;
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '4px',
                            background: colors[type] || '#0077b5',
                            boxShadow: `0 2px 8px ${colors[type]}50`,
                          }}
                        />
                        <span style={{ fontSize: '1rem', color: 'var(--text-primary)', textTransform: 'capitalize', fontWeight: 600 }}>
                          {type === 'remote' ? t('offers.remote') : type === 'hybrid' ? t('offers.hybrid') : t('offers.onSite')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{percentage}%</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: colors[type] }}>
                          {count}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Impact Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            style={{
              padding: '28px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(0, 119, 181, 0.15)',
              gridColumn: 'span 2',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative background */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '150px',
                height: '150px',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                transform: 'translate(30px, -30px)',
                pointerEvents: 'none',
              }}
            />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                }}
              >
                <Zap size={24} style={{ color: 'white' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {t('dashboard.impactMetrics')}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  {t('dashboard.impactMetricsDesc')}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
              {[
                {
                  label: t('dashboard.responseRate'),
                  value: `${responseRate.toFixed(1)} ${t('dashboard.appsPerOffer')}`,
                  percentage: Math.min((responseRate / 10) * 100, 100),
                  gradient: ['#0077b5', '#00a0dc'],
                  icon: TrendingUp,
                },
                {
                  label: t('dashboard.avgApplications'),
                  value: `${avgApplicationsPerOffer}`,
                  percentage: Math.min((avgApplicationsPerOffer / 20) * 100, 100),
                  gradient: ['#10b981', '#34d399'],
                  icon: Users,
                },
                {
                  label: t('dashboard.engagement'),
                  value: totalApplications > 0 ? t('dashboard.active') : t('dashboard.pending'),
                  percentage: totalApplications > 0 ? 100 : 0,
                  gradient: ['#f59e0b', '#fbbf24'],
                  icon: Activity,
                },
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(0, 119, 181, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <metric.icon size={18} style={{ color: metric.gradient[0] }} />
                      <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {metric.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '1.125rem', fontWeight: 700, background: `linear-gradient(135deg, ${metric.gradient[0]}, ${metric.gradient[1]})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {metric.value}
                    </span>
                  </div>
                  <div style={{ position: 'relative', height: '12px', background: 'rgba(0, 119, 181, 0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.percentage}%` }}
                      transition={{ duration: 0.6, delay: 0.45 + index * 0.05 }}
                      style={{
                        height: '100%',
                        background: `linear-gradient(to right, ${metric.gradient[0]}, ${metric.gradient[1]})`,
                        borderRadius: '6px',
                        boxShadow: `0 2px 8px ${metric.gradient[0]}50`,
                        position: 'relative',
                        overflow: 'hidden',
                        willChange: 'width',
                        transform: 'translateZ(0)',
                      }}
                    >
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </motion.div>
      )}

      {/* How It Works Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{
          padding: '32px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(0, 119, 181, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 119, 181, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(0, 119, 181, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid rgba(0, 119, 181, 0.2)',
            }}
          >
            <Sparkles size={24} style={{ color: '#0077b5' }} />
          </div>
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              margin: 0,
              color: 'var(--text-primary)',
            }}
          >
            {t('dashboard.howItWorks')}
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          {howItWorks.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              style={{
                padding: '24px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1.5px solid rgba(0, 119, 181, 0.15)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(0, 119, 181, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid rgba(0, 119, 181, 0.2)',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#0077b5',
                    }}
                  >
                    {item.step}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <item.icon size={20} style={{ color: '#0077b5' }} />
                    <h3
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        margin: 0,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {item.title}
                    </h3>
                  </div>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

