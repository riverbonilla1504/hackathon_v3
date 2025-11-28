'use client';

import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, Users, Clock } from 'lucide-react';

interface EnterpriseInsightsProps {
  totalApplicants: number;
  averageScore: number;
  topSkills: string[];
}

export default function EnterpriseInsights({ totalApplicants, averageScore, topSkills }: EnterpriseInsightsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        borderRadius: '16px',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.1) 0%, rgba(0, 160, 220, 0.05) 100%)',
        border: '1.5px solid rgba(0, 119, 181, 0.2)',
        padding: '16px',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Lightbulb size={16} style={{ color: 'white' }} />
        </div>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-poppins), sans-serif',
            margin: 0,
          }}
        >
          Key Insights
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} style={{ color: '#0077b5' }} />
          <div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', margin: 0 }}>
              Applicants
            </p>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {totalApplicants}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={16} style={{ color: '#0077b5' }} />
          <div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', margin: 0 }}>
              Avg Match
            </p>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {averageScore}%
            </p>
          </div>
        </div>
      </div>

      <div style={{
        padding: '12px',
        borderRadius: '10px',
        background: 'rgba(255, 255, 255, 0.5)',
        border: '1px solid rgba(0, 119, 181, 0.1)',
      }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '8px' }}>
          <strong>What stands out:</strong> Top applicants share expertise in{' '}
          <strong style={{ color: '#0077b5' }}>{topSkills.slice(0, 2).join(' and ')}</strong>.
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
          <strong>Recommendation:</strong> Focus interviews on candidates with match scores above 85%.
        </p>
      </div>
    </motion.div>
  );
}

