'use client';

import { motion } from 'framer-motion';
import { Applicant } from '@/lib/storage';
import { Sparkles, Award, TrendingUp, Users, Target } from 'lucide-react';

interface AISummaryProps {
  topCandidates: Applicant[];
}

export default function AISummary({ topCandidates }: AISummaryProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Sparkles size={16} style={{ color: 'white' }} />
        </div>
        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-poppins), sans-serif',
            margin: 0,
          }}
        >
          AI-Powered Summary
        </h3>
      </div>

      {/* Top Candidates Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '0',
        }}
      >
        {topCandidates.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{
              borderRadius: '12px',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
              padding: '12px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Rank Badge */}
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: index === 0
                ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                : index === 1
                ? 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)'
                : index === 2
                ? 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)'
                : 'linear-gradient(135deg, #0077b5 0%, #005885 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.7rem',
            }}>
              {index + 1}
            </div>

            {/* Candidate Info */}
            <div style={{ marginBottom: '10px', paddingRight: '32px' }}>
              <h4
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '2px',
                }}
              >
                Candidate #{index + 1}
              </h4>
            </div>

            {/* Match Score */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Match
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0077b5' }}>
                  {candidate.match_score}%
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: 'rgba(0, 119, 181, 0.1)',
                overflow: 'hidden',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${candidate.match_score}%` }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #0077b5 0%, #00a0dc 100%)',
                    borderRadius: '3px',
                  }}
                />
              </div>
            </div>

            {/* Key Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={12} style={{ color: '#0077b5' }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                  {candidate.experience_years}y exp
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '2px' }}>
                <Target size={12} style={{ color: '#0077b5', marginTop: '1px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                    {candidate.skills.slice(0, 3).map((skill, i) => {
                      // Handle both string and object formats
                      const skillName = typeof skill === 'string' ? skill : (skill?.name || String(skill));
                      return (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.6rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(0, 119, 181, 0.1)',
                            color: '#0077b5',
                            fontWeight: 600,
                          }}
                        >
                          {skillName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

