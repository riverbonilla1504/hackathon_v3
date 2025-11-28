'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Applicant } from '@/lib/storage';
import { Search, Mail, Phone, Calendar, Award, Filter, FileText, ExternalLink } from 'lucide-react';

interface ApplicantsTableProps {
  applicants: Applicant[];
}

export default function ApplicantsTable({ applicants }: ApplicantsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredApplicants = useMemo(() => {
    return applicants.filter(applicant => {
      const matchesSearch = 
        applicant.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [applicants, searchQuery, statusFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' };
      case 'reviewed':
        return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
      case 'interviewed':
        return { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' };
      case 'rejected':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      default:
        return { bg: 'rgba(156, 163, 175, 0.1)', text: '#9ca3af', border: 'rgba(156, 163, 175, 0.3)' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with Search and Filter */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
          <Search
            size={20}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)',
            }}
          />
          <input
            type="text"
            placeholder="Search by skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              borderRadius: '12px',
              border: '1.5px solid rgba(0, 119, 181, 0.2)',
              background: 'rgba(255, 255, 255, 0.85)',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'all 0.3s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#0077b5';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.2)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1.5px solid rgba(0, 119, 181, 0.2)',
              background: 'rgba(255, 255, 255, 0.85)',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="interviewed">Interviewed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{
        borderRadius: '16px',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
        border: '1.5px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 119, 181, 0.05)', borderBottom: '2px solid rgba(0, 119, 181, 0.1)' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Skills
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Experience
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Match Score
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Status
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Applied
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  CV
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No applicants found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((applicant, index) => {
                  const statusStyle = getStatusColor(applicant.status);
                  return (
                    <motion.tr
                      key={applicant.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        borderBottom: '1px solid rgba(0, 119, 181, 0.1)',
                      }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {applicant.skills.slice(0, 5).map((skill, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: '0.7rem',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: 'rgba(0, 119, 181, 0.1)',
                                color: '#0077b5',
                                fontWeight: 500,
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                          {applicant.skills.length > 5 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', padding: '4px 8px' }}>
                              +{applicant.skills.length - 5}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Award size={14} style={{ color: '#0077b5' }} />
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                            {applicant.experience_years} years
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                          {applicant.education}
                        </p>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '60px',
                            height: '8px',
                            borderRadius: '4px',
                            background: 'rgba(0, 119, 181, 0.1)',
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              width: `${applicant.match_score}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #0077b5 0%, #00a0dc 100%)',
                            }} />
                          </div>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0077b5', minWidth: '40px' }}>
                            {applicant.match_score}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '4px 12px',
                            borderRadius: '8px',
                            background: statusStyle.bg,
                            color: statusStyle.text,
                            border: `1px solid ${statusStyle.border}`,
                            fontWeight: 600,
                            textTransform: 'capitalize',
                          }}
                        >
                          {applicant.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} style={{ color: 'var(--text-secondary)' }} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {formatDate(applicant.applied_at)}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <motion.button
                          onClick={() => {
                            if (applicant.cv_link) {
                              window.open(applicant.cv_link, '_blank');
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: applicant.cv_link 
                              ? 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)'
                              : 'rgba(0, 119, 181, 0.3)',
                            border: 'none',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: applicant.cv_link ? 'pointer' : 'not-allowed',
                            transition: 'all 0.3s',
                          }}
                        >
                          <FileText size={14} />
                          View CV
                          {applicant.cv_link && <ExternalLink size={12} />}
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

