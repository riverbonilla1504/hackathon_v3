'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Applicant } from '@/lib/storage';
import { Search, Mail, Phone, Calendar, Filter, FileText, ExternalLink, CheckCircle2, Video, X, Plus, XCircle } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { updateApplicantStatus } from '@/lib/storage';

interface ApplicantsTableProps {
  applicants: Applicant[];
  vacantId: number;
  onStatusUpdate?: () => void;
}

export default function ApplicantsTable({ applicants, vacantId, onStatusUpdate }: ApplicantsTableProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredApplicants = useMemo(() => {
    // Filter applicants while maintaining the ranking order
    const filtered = applicants.filter(applicant => {
      const matchesSearch = 
        applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.skills.some(skill => {
          const skillName = typeof skill === 'string' ? skill : (skill?.name || String(skill));
          return skillName.toLowerCase().includes(searchQuery.toLowerCase());
        });
      
      const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    // Sort by match score (highest first) to maintain ranking order
    return filtered.sort((a, b) => b.match_score - a.match_score);
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
      case 'approved':
        return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' };
      case 'rejected':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      default: // pending
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
            <option value="all">{t('applicants.all')}</option>
            <option value="pending">{t('applicants.pending')}</option>
            <option value="approved">{t('applicants.approved')}</option>
            <option value="rejected">{t('applicants.rejected')}</option>
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
                <th style={{ padding: '16px', textAlign: 'center', width: '50px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      // Select/deselect all
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Candidate
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Skills
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Ranking & Score
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Status
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Applied
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
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
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                            {applicant.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Mail size={12} />
                            {applicant.email}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {applicant.skills.slice(0, 5).map((skill, i) => {
                            // Handle both string and object formats defensively
                            const skillName = typeof skill === 'string' ? skill : (skill?.name || String(skill));
                            return (
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
                                {skillName}
                              </span>
                            );
                          })}
                          {applicant.skills.length > 5 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', padding: '4px 8px' }}>
                              +{applicant.skills.length - 5}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {/* Rank Position */}
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: index < 3 
                              ? index === 0 
                                ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                                : index === 1
                                ? 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)'
                                : 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)'
                              : 'rgba(0, 119, 181, 0.1)',
                            color: index < 3 ? 'white' : '#0077b5',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}>
                            #{index + 1}
                          </div>
                          {/* Match Score */}
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
                                background: applicant.match_score >= 80
                                  ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                                  : applicant.match_score >= 60
                                  ? 'linear-gradient(90deg, #0077b5 0%, #00a0dc 100%)'
                                  : 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                              }} />
                            </div>
                            <span style={{ 
                              fontSize: '0.875rem', 
                              fontWeight: 700, 
                              color: applicant.match_score >= 80 ? '#22c55e' : applicant.match_score >= 60 ? '#0077b5' : '#f59e0b',
                              minWidth: '45px' 
                            }}>
                              {applicant.match_score.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <select
                          value={applicant.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value as Applicant['status'];
                            setIsUpdating(true);
                            try {
                              const response = await fetch('/api/applicants/update-status', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  profile_id: applicant.id,
                                  status: newStatus,
                                }),
                              });
                              const result = await response.json();
                              if (result.success) {
                                const statusMessages: Record<string, string> = {
                                  'approved': t('applicants.approvedSuccess'),
                                  'rejected': t('applicants.rejectedSuccess'),
                                  'pending': t('applicants.statusChanged'),
                                };
                                showSuccess(statusMessages[newStatus] || t('applicants.statusChanged'));
                                if (onStatusUpdate) onStatusUpdate();
                              } else {
                                throw new Error(result.error || 'Failed to update status');
                              }
                            } catch (error: any) {
                              showError(error.message || 'Failed to update status');
                              // Reset select to original value on error
                              e.target.value = applicant.status;
                            } finally {
                              setIsUpdating(false);
                            }
                          }}
                          disabled={isUpdating}
                          style={{
                            fontSize: '0.75rem',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: statusStyle.bg,
                            color: statusStyle.text,
                            border: `1px solid ${statusStyle.border}`,
                            fontWeight: 600,
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                            outline: 'none',
                            textTransform: 'capitalize',
                            minWidth: '120px',
                            opacity: isUpdating ? 0.6 : 1,
                          }}
                        >
                          <option value="pending">{t('applicants.pending')}</option>
                          <option value="approved">{t('applicants.approved')}</option>
                          <option value="rejected">{t('applicants.rejected')}</option>
                        </select>
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
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {(applicant.cv_url || applicant.cv_link) && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => window.open(applicant.cv_url || applicant.cv_link, '_blank')}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                background: 'rgba(0, 119, 181, 0.1)',
                                border: '1px solid rgba(0, 119, 181, 0.2)',
                                color: '#0077b5',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <FileText size={14} />
                              CV
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedApplicant(applicant);
                              setShowScheduleModal(true);
                            }}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                              border: 'none',
                              color: 'white',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Video size={14} />
                            Schedule
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interview Scheduling Modal */}
      {showScheduleModal && selectedApplicant && (
        <InterviewScheduleModal
          applicant={selectedApplicant}
          vacantId={vacantId}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedApplicant(null);
          }}
          onSuccess={() => {
            if (onStatusUpdate) onStatusUpdate();
            setShowScheduleModal(false);
            setSelectedApplicant(null);
          }}
        />
      )}
    </motion.div>
  );
}

// Interview Scheduling Modal Component
interface InterviewScheduleModalProps {
  applicant: Applicant;
  vacantId: number;
  onClose: () => void;
  onSuccess: () => void;
}

function InterviewScheduleModal({ applicant, vacantId, onClose, onSuccess }: InterviewScheduleModalProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const [proposedSlots, setProposedSlots] = useState<Array<{ date: string; time: string }>>([
    { date: '', time: '' },
  ]);
  const [isCreating, setIsCreating] = useState(false);

  const addSlot = () => {
    setProposedSlots([...proposedSlots, { date: '', time: '' }]);
  };

  const removeSlot = (index: number) => {
    if (proposedSlots.length > 1) {
      setProposedSlots(proposedSlots.filter((_, i) => i !== index));
    }
  };

  const updateSlot = (index: number, field: 'date' | 'time', value: string) => {
    const updated = [...proposedSlots];
    updated[index][field] = value;
    setProposedSlots(updated);
  };

  const handleCreateInterview = async () => {
    // Validate slots
    const validSlots = proposedSlots.filter(slot => slot.date && slot.time);
    if (validSlots.length === 0) {
      showError('Please add at least one valid time slot');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/interviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: applicant.id,
          vacant_id: vacantId,
          proposed_slots: validSlots.map(slot => ({
            date: slot.date,
            time: slot.time,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create interview');
      }

      showSuccess(`Interview scheduled with ${applicant.name}. Notifications will be sent.`);
      
      // TODO: Send WhatsApp and email notifications with the links from result.notificationLinks
      
      onSuccess();
    } catch (error: any) {
      showError(error.message || 'Failed to schedule interview');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            {t('interview.scheduleWith')} {applicant.name}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={24} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          {t('interview.proposeSlots')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {proposedSlots.map((slot, index) => (
            <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
                <input
                  type="date"
                  value={slot.date}
                  onChange={(e) => updateSlot(index, 'date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid rgba(0, 119, 181, 0.2)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
                <input
                  type="time"
                  value={slot.time}
                  onChange={(e) => updateSlot(index, 'time', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid rgba(0, 119, 181, 0.2)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>
              {proposedSlots.length > 1 && (
                <button
                  onClick={() => removeSlot(index)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addSlot}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: '8px',
            background: 'rgba(0, 119, 181, 0.1)',
            border: '1px solid rgba(0, 119, 181, 0.3)',
            color: '#0077b5',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '24px',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          <Plus size={18} />
          {t('interview.addSlot')}
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.05)',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('common.cancel')}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateInterview}
            disabled={isCreating}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
              border: 'none',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: isCreating ? 'not-allowed' : 'pointer',
              opacity: isCreating ? 0.6 : 1,
            }}
          >
            {isCreating ? t('common.loading') : t('interview.createInterview')}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

