'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Video, Clock, Mail, Phone, User, ExternalLink, Play, Pause, Square, CheckCircle2, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Applicant, getAllApplicantsFromSupabase, WorkOffer } from '@/lib/storage';
import { useTranslation } from '@/contexts/TranslationContext';
import { useNotifications } from '@/contexts/NotificationContext';
import Lottie from 'lottie-react';
import { supabase } from '@/lib/supabaseClient';

interface MeetingsProps {
  workOffers: WorkOffer[];
}

interface Meeting {
  id: string;
  applicantId: number;
  applicantName: string;
  applicantEmail: string;
  meetingLink: string;
  scheduledDate: string;
  duration: number; // in minutes
  isActive: boolean;
  startTime?: Date;
  interviewerName?: string;
  interviewerEmail?: string;
}

export default function Meetings({ workOffers }: MeetingsProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const [acceptedApplicants, setAcceptedApplicants] = useState<Applicant[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingDuration, setMeetingDuration] = useState(30);
  const [interviewerEmail, setInterviewerEmail] = useState('');
  const [interviewerName, setInterviewerName] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [meetLottieData, setMeetLottieData] = useState<any>(null);

  useEffect(() => {
    loadAcceptedApplicants();
    loadMeetings();
    
    // Load interviewer info from session
    const loadInterviewerInfo = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user?.email) {
        setInterviewerEmail(sessionData.session.user.email);
        // Try to get name from enterprise data
        try {
          const { data: enterpriseData } = await supabase
            .from('company_contact_info')
            .select('company_id, corporate_email')
            .eq('corporate_email', sessionData.session.user.email)
            .single();
          
          if (enterpriseData?.company_id) {
            // Get company name
            const { data: companyData } = await supabase
              .from('company')
              .select('legal_name, trade_name')
              .eq('id', enterpriseData.company_id)
              .single();
            
            if (companyData) {
              setInterviewerName(companyData.trade_name || companyData.legal_name || sessionData.session.user.email.split('@')[0]);
            } else {
              setInterviewerName(sessionData.session.user.email.split('@')[0]);
            }
          } else {
            setInterviewerName(sessionData.session.user.email.split('@')[0]);
          }
        } catch (error) {
          // Fallback to email username
          setInterviewerName(sessionData.session.user.email.split('@')[0]);
        }
      }
    };
    
    loadInterviewerInfo();
    
    // Load meet.json Lottie animation
    fetch('/meet.json')
      .then(res => res.json())
      .then(data => {
        if (data.v && data.fr && data.w && data.h) {
          setMeetLottieData(data);
        }
      })
      .catch(() => {
        console.error('Failed to load meet.json');
      });
  }, [workOffers]);

  useEffect(() => {
    if (activeMeetingId) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [activeMeetingId]);

  const loadAcceptedApplicants = async () => {
    try {
      const vacantIds = workOffers.map(offer => offer.vacant_id);
      const allApplicants = vacantIds.length > 0 
        ? await getAllApplicantsFromSupabase(vacantIds)
        : [];
      
      // Filter only approved applicants
      const approved = allApplicants.filter(app => app.status === 'approved');
      setAcceptedApplicants(approved);
    } catch (error) {
      console.error('Error loading accepted applicants:', error);
    }
  };

  const loadMeetings = () => {
    // Load meetings from localStorage (in production, this would come from a database)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('worky_ai_meetings');
      if (saved) {
        setMeetings(JSON.parse(saved));
      }
    }
  };

  const saveMeetings = (newMeetings: Meeting[]) => {
    setMeetings(newMeetings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('worky_ai_meetings', JSON.stringify(newMeetings));
    }
  };

  const createGoogleMeetLink = async (): Promise<string> => {
    try {
      // Get enterprise email from session
      const { data: sessionData } = await supabase.auth.getSession();
      const enterpriseEmail = sessionData.session?.user?.email || '';

      // Call API to create Google Meet link
      const response = await fetch('/api/create-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicantEmail: selectedApplicant?.email,
          applicantName: selectedApplicant?.name,
          enterpriseEmail: enterpriseEmail,
          scheduledDate: selectedApplicant && meetingDate && meetingTime 
            ? new Date(`${meetingDate}T${meetingTime}`).toISOString()
            : new Date().toISOString(),
          duration: meetingDuration,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create meeting');
      }

      return result.meetLink;
    } catch (error) {
      console.error('Error creating Google Meet link:', error);
      // Fallback to generating a link if API fails
      const meetId = Math.random().toString(36).substring(2, 15);
      return `https://meet.google.com/${meetId}`;
    }
  };

  const handleScheduleMeeting = async () => {
    if (!selectedApplicant || !meetingDate || !meetingTime || !interviewerEmail) {
      showError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const meetLink = await createGoogleMeetLink();
      const scheduledDateTime = new Date(`${meetingDate}T${meetingTime}`);
      
      const newMeeting: Meeting = {
        id: `meeting-${Date.now()}`,
        applicantId: selectedApplicant.id,
        applicantName: selectedApplicant.name,
        applicantEmail: selectedApplicant.email,
        meetingLink: meetLink,
        scheduledDate: scheduledDateTime.toISOString(),
        duration: meetingDuration,
        isActive: false,
        interviewerName: interviewerName,
        interviewerEmail: interviewerEmail,
      };

      const updatedMeetings = [...meetings, newMeeting];
      saveMeetings(updatedMeetings);
      
      showSuccess(`Reunión programada con ${selectedApplicant.name}`);
      setShowScheduleModal(false);
      setSelectedApplicant(null);
      setMeetingDate('');
      setMeetingTime('');
    } catch (error: any) {
      showError(error.message || 'Error al programar la reunión');
    }
  };

  const startMeeting = (meetingId: string) => {
    const updatedMeetings = meetings.map(meeting => 
      meeting.id === meetingId 
        ? { ...meeting, isActive: true, startTime: new Date() }
        : meeting
    );
    saveMeetings(updatedMeetings);
    setActiveMeetingId(meetingId);
    setElapsedTime(0);
  };

  const stopMeeting = (meetingId: string) => {
    const updatedMeetings = meetings.map(meeting => 
      meeting.id === meetingId 
        ? { ...meeting, isActive: false }
        : meeting
    );
    saveMeetings(updatedMeetings);
    setActiveMeetingId(null);
    setElapsedTime(0);
  };

  const handleDeleteApproved = async (applicantId: number) => {
    if (!confirm(t('meetings.confirmDelete') || 'Are you sure you want to remove this approved candidate?')) {
      return;
    }

    setIsDeleting(applicantId);
    try {
      // Update status to rejected
      const response = await fetch('/api/applicants/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: applicantId,
          status: 'rejected',
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Remove meetings associated with this applicant
        const updatedMeetings = meetings.filter(m => m.applicantId !== applicantId);
        saveMeetings(updatedMeetings);
        
        // Reload approved applicants to update the list
        await loadAcceptedApplicants();
        
        showSuccess(t('meetings.candidateRemoved') || 'Candidate removed successfully');
      } else {
        throw new Error(result.error || 'Failed to remove candidate');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to remove candidate');
    } finally {
      setIsDeleting(null);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date || !meetingDate) return false;
    return date.toISOString().split('T')[0] === meetingDate;
  };

  const isPast = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = (date: Date | null) => {
    if (!date || isPast(date)) return;
    setMeetingDate(date.toISOString().split('T')[0]);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0077b5 0%, #005885 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Video size={24} style={{ color: 'white' }} />
          </div>
          <div>
            <h2
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                fontFamily: 'var(--font-poppins), sans-serif',
              }}
            >
              {t('meetings.title')}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              {t('meetings.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Accepted Applicants Grid */}
      {acceptedApplicants.length > 0 ? (
        <div style={{ marginBottom: '32px' }}>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}
          >
            {t('meetings.acceptedCandidates')}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px',
            }}
          >
            {acceptedApplicants.map((applicant) => {
              const hasMeeting = meetings.some(m => m.applicantId === applicant.id);
              return (
                <motion.div
                  key={applicant.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  style={{
                    borderRadius: '16px',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
                    border: '1.5px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    padding: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <User size={24} style={{ color: 'white' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <h4
                          style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            margin: 0,
                            marginBottom: '4px',
                          }}
                        >
                          {applicant.name}
                        </h4>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteApproved(applicant.id)}
                          disabled={isDeleting === applicant.id}
                          style={{
                            padding: '6px',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            cursor: isDeleting === applicant.id ? 'not-allowed' : 'pointer',
                            opacity: isDeleting === applicant.id ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title={t('meetings.removeCandidate') || 'Remove candidate'}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Mail size={12} style={{ color: 'var(--text-secondary)' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {applicant.email}
                        </span>
                      </div>
                      {applicant.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Phone size={12} style={{ color: 'var(--text-secondary)' }} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {applicant.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {hasMeeting ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const meeting = meetings.find(m => m.applicantId === applicant.id);
                          if (meeting) {
                            window.open(meeting.meetingLink, '_blank');
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
                          border: 'none',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(26, 115, 232, 0.3)',
                        }}
                      >
                        <Video size={16} />
                        {t('meetings.joinMeeting')}
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedApplicant(applicant);
                          setShowScheduleModal(true);
                        }}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                          border: 'none',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <Calendar size={16} />
                        {t('meetings.scheduleMeeting')}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Empty State - Show when no approved applicants AND no meetings */}
      {acceptedApplicants.length === 0 && meetings.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            borderRadius: '16px',
            background: 'rgba(0, 119, 181, 0.05)',
            border: '2px dashed rgba(0, 119, 181, 0.3)',
          }}
        >
          {meetLottieData ? (
            <div style={{ maxWidth: '400px', margin: '0 auto 24px', display: 'flex', justifyContent: 'center' }}>
              <Lottie
                animationData={meetLottieData}
                loop={true}
                autoplay={true}
                style={{
                  width: '100%',
                  height: 'auto',
                }}
              />
            </div>
          ) : (
            <Video size={64} style={{ color: '#0077b5', opacity: 0.5, marginBottom: '16px' }} />
          )}
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            {t('meetings.noAccepted')}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {t('meetings.noAcceptedDesc')}
          </p>
        </motion.div>
      )}

      {/* Scheduled Meetings */}
      {meetings.length > 0 && (
        <div>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}
          >
            {t('meetings.scheduledMeetings')}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '16px',
            }}
          >
            {meetings.map((meeting) => {
              const isActive = activeMeetingId === meeting.id;
              return (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    borderRadius: '16px',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.1) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
                    border: isActive
                      ? '2px solid rgba(34, 197, 94, 0.5)'
                      : '1.5px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    padding: '20px',
                  }}
                >
                  {/* Google Meet Badge */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    marginBottom: '12px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, rgba(26, 115, 232, 0.1) 0%, rgba(26, 115, 232, 0.05) 100%)',
                    border: '1px solid rgba(26, 115, 232, 0.2)',
                    width: 'fit-content',
                  }}>
                    <Video size={16} style={{ color: '#1a73e8' }} />
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      color: '#1a73e8',
                      letterSpacing: '0.5px',
                    }}>
                      Google Meet
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          fontSize: '1.125rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          margin: 0,
                          marginBottom: '12px',
                        }}
                      >
                        {meeting.applicantName}
                      </h4>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '8px',
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'rgba(0, 119, 181, 0.05)',
                        border: '1px solid rgba(0, 119, 181, 0.1)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Calendar size={16} style={{ color: 'white' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                              {t('meetings.date')}
                            </div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {new Date(meeting.scheduledDate).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #ea4335 0%, #c5221f 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Clock size={16} style={{ color: 'white' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                              {t('meetings.time')}
                            </div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {new Date(meeting.scheduledDate).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })} - {new Date(new Date(meeting.scheduledDate).getTime() + meeting.duration * 60000).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #34a853 0%, #137333 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Video size={16} style={{ color: 'white' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                              {t('meetings.duration')}
                            </div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {meeting.duration} {t('meetings.minutes')}
                            </div>
                          </div>
                        </div>
                        {meeting.interviewerName && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <User size={16} style={{ color: 'white' }} />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                                Entrevistador
                              </div>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {meeting.interviewerName}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {isActive && (
                      <div
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: 'rgba(34, 197, 94, 0.2)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                        }}
                      >
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#22c55e' }}>
                          {formatTime(elapsedTime)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {isActive ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.open(meeting.meetingLink, '_blank')}
                          style={{
                            flex: 1,
                            padding: '12px 16px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
                            border: 'none',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(26, 115, 232, 0.3)',
                          }}
                        >
                          <Video size={16} />
                          {t('meetings.joinMeeting')}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => stopMeeting(meeting.id)}
                          style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            border: 'none',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}
                        >
                          <Square size={16} />
                          {t('meetings.endMeeting')}
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => startMeeting(meeting.id)}
                          style={{
                            flex: 1,
                            padding: '10px 16px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            border: 'none',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}
                        >
                          <Play size={16} />
                          {t('meetings.startMeeting')}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.open(meeting.meetingLink, '_blank')}
                          style={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                            background: 'rgba(26, 115, 232, 0.1)',
                            border: '1px solid rgba(26, 115, 232, 0.3)',
                            color: '#1a73e8',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <ExternalLink size={16} />
                          {t('meetings.openLink')}
                        </motion.button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal - Improved Design */}
      {showScheduleModal && selectedApplicant && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px',
          }}
          onClick={() => setShowScheduleModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              borderRadius: '24px',
              padding: '0',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
              border: '1.5px solid rgba(255, 255, 255, 0.5)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '32px 32px 24px',
              borderBottom: '1.5px solid rgba(0, 119, 181, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Calendar size={24} style={{ color: 'white' }} />
                  </div>
                  {t('meetings.scheduleWith')} {selectedApplicant.name}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {t('meetings.scheduleDesc')}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowScheduleModal(false)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.05)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Content */}
            <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              {/* Left Column - Calendar */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                }}>
                  {t('meetings.date')}
                </label>
                
                {/* Calendar */}
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '2px solid rgba(0, 119, 181, 0.1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                }}>
                  {/* Calendar Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                  }}>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigateMonth('prev')}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'rgba(0, 119, 181, 0.1)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#0077b5',
                      }}
                    >
                      <ChevronLeft size={18} />
                    </motion.button>
                    <h4 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      margin: 0,
                      textTransform: 'capitalize',
                    }}>
                      {formatMonthYear(currentMonth)}
                    </h4>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigateMonth('next')}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'rgba(0, 119, 181, 0.1)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#0077b5',
                      }}
                    >
                      <ChevronRight size={18} />
                    </motion.button>
                  </div>

                  {/* Calendar Days */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '8px',
                  }}>
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                      <div key={day} style={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        padding: '8px 0',
                      }}>
                        {day}
                      </div>
                    ))}
                    {getDaysInMonth(currentMonth).map((date, index) => (
                      <motion.button
                        key={index}
                        whileHover={date && !isPast(date) ? { scale: 1.1 } : {}}
                        whileTap={date && !isPast(date) ? { scale: 0.9 } : {}}
                        onClick={() => handleDateClick(date)}
                        disabled={!date || isPast(date)}
                        style={{
                          aspectRatio: '1',
                          borderRadius: '10px',
                          border: 'none',
                          background: date
                            ? isSelected(date)
                              ? 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)'
                              : isToday(date)
                              ? 'rgba(26, 115, 232, 0.15)'
                              : isPast(date)
                              ? 'rgba(0, 0, 0, 0.05)'
                              : 'rgba(0, 119, 181, 0.08)'
                            : 'transparent',
                          color: date
                            ? isSelected(date)
                              ? 'white'
                              : isPast(date)
                              ? 'var(--text-secondary)'
                              : 'var(--text-primary)'
                            : 'transparent',
                          fontSize: '0.875rem',
                          fontWeight: isSelected(date) || isToday(date) ? 700 : 500,
                          cursor: date && !isPast(date) ? 'pointer' : 'not-allowed',
                          opacity: date && isPast(date) ? 0.4 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {date ? date.getDate() : ''}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Time, Duration, Interviewer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Time */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}>
                    {t('meetings.time')}
                  </label>
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      border: '2px solid rgba(0, 119, 181, 0.2)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      background: 'white',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0077b5'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(0, 119, 181, 0.2)'}
                  />
                </div>

                {/* Duration */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}>
                    {t('meetings.duration')}
                  </label>
                  <select
                    value={meetingDuration}
                    onChange={(e) => setMeetingDuration(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      border: '2px solid rgba(0, 119, 181, 0.2)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      background: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0077b5'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(0, 119, 181, 0.2)'}
                  >
                    <option value={15}>15 {t('meetings.minutes')}</option>
                    <option value={30}>30 {t('meetings.minutes')}</option>
                    <option value={45}>45 {t('meetings.minutes')}</option>
                    <option value={60}>60 {t('meetings.minutes')}</option>
                    <option value={90}>90 {t('meetings.minutes')}</option>
                  </select>
                </div>

                {/* Interviewer */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}>
                    Entrevistador
                  </label>
                  <div style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: '2px solid rgba(0, 119, 181, 0.2)',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <User size={20} style={{ color: 'white' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}>
                        {interviewerName || 'Entrevistador'}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                      }}>
                        {interviewerEmail || 'No especificado'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Date Display */}
                {meetingDate && (
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(26, 115, 232, 0.1) 0%, rgba(26, 115, 232, 0.05) 100%)',
                    border: '1.5px solid rgba(26, 115, 232, 0.2)',
                  }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#1a73e8',
                      marginBottom: '4px',
                    }}>
                      Fecha Seleccionada
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}>
                      {new Date(meetingDate).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '24px 32px',
              borderTop: '1.5px solid rgba(0, 119, 181, 0.1)',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowScheduleModal(false)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.05)',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleScheduleMeeting}
                disabled={!meetingDate || !meetingTime}
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: meetingDate && meetingTime
                    ? 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)'
                    : 'rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: meetingDate && meetingTime ? 'pointer' : 'not-allowed',
                  opacity: meetingDate && meetingTime ? 1 : 0.5,
                  boxShadow: meetingDate && meetingTime ? '0 4px 12px rgba(26, 115, 232, 0.3)' : 'none',
                }}
              >
                {t('meetings.createMeeting')}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

