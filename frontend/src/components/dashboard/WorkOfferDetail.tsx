'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WorkOffer, Applicant, getApplicantsByVacantId, initializeMockApplicants } from '@/lib/storage';
import { ArrowLeft, MapPin, DollarSign, Calendar, Briefcase, FileText } from 'lucide-react';
import AISummary from './AISummary';
import EnterpriseInsights from './EnterpriseInsights';
import ApplicantsTable from './ApplicantsTable';
import AIChatInline from './AIChatInline';

interface WorkOfferDetailProps {
  offer: WorkOffer;
  onBack: () => void;
}

export default function WorkOfferDetail({ offer, onBack }: WorkOfferDetailProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  useEffect(() => {
    // Initialize mock applicants if none exist
    initializeMockApplicants(offer.vacant_id);
    const appData = getApplicantsByVacantId(offer.vacant_id);
    setApplicants(appData);
  }, [offer.vacant_id]);

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
            Back to Offers
          </motion.button>
        </div>
      </motion.div>

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
                Offer ID: {offer.vacant_id}
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
                Salary
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
                Location
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
                Work Type
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
                Created
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
              Job Description
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

        {/* AI Chat Inline */}
        {applicants.length > 0 && (
          <AIChatInline
            offer={offer}
            applicants={applicants}
          />
        )}

        {/* Applicants Table */}
        {applicants.length > 0 ? (
          <ApplicantsTable applicants={applicants} />
        ) : (
          <div style={{
            borderRadius: '16px',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
            border: '1.5px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            padding: '48px',
            textAlign: 'center',
          }}>
            <Briefcase size={64} style={{ color: '#0077b5', marginBottom: '24px', opacity: 0.5 }} />
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
              No applicants yet. Share this job posting to start receiving applications!
            </p>
          </div>
        )}
      </motion.div>
    </>
  );
}

