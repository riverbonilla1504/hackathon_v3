'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { addWorkOffer, WorkOffer, Skill } from '@/lib/storage';
import { Briefcase, DollarSign, MapPin, FileText, Calendar, Plus, X, Target, CheckCircle2, Star, Zap, Sparkles } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTranslation } from '@/contexts/TranslationContext';

interface CreateWorkOfferFormProps {
  onSuccess: () => void;
  initialData?: {
    name?: string;
    rol?: string;
    salary?: string;
    description?: string;
    availability?: 'remote' | 'hybrid' | 'on site';
    location?: string;
    required_skills?: Skill[];
  };
}

export interface CreateWorkOfferFormRef {
  applySuggestion: (data: {
    name?: string;
    rol?: string;
    salary?: string;
    description?: string;
    availability?: 'remote' | 'hybrid' | 'on site';
    location?: string;
    skills?: Array<{ name: string; importance: number; must_have: boolean }>;
  }) => void;
}

const CreateWorkOfferForm = forwardRef<CreateWorkOfferFormRef, CreateWorkOfferFormProps>(
  ({ onSuccess, initialData }, ref) => {
  const { showSuccess, showError } = useNotifications();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    rol: initialData?.rol || '',
    salary: initialData?.salary || '',
    description: initialData?.description || '',
    availability: (initialData?.availability || 'remote') as 'remote' | 'hybrid' | 'on site',
    location: initialData?.location || '',
    required_skills: initialData?.required_skills || [] as Skill[], // All skills with their properties
  });
  const [skillInput, setSkillInput] = useState({
    name: '',
    importance: 3,
    must_have: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expose method to update form from external components
  useImperativeHandle(ref, () => ({
    applySuggestion: (data) => {
      setFormData(prev => ({
        ...prev,
        ...(data.name && { name: data.name }),
        ...(data.rol && { rol: data.rol }),
        ...(data.salary && { salary: data.salary }),
        ...(data.description && { description: data.description }),
        ...(data.availability && { availability: data.availability }),
        ...(data.location && { location: data.location }),
        ...(data.skills && { required_skills: data.skills }),
      }));
    },
  }));

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...(initialData.name && { name: initialData.name }),
        ...(initialData.rol && { rol: initialData.rol }),
        ...(initialData.salary && { salary: initialData.salary }),
        ...(initialData.description && { description: initialData.description }),
        ...(initialData.availability && { availability: initialData.availability }),
        ...(initialData.location && { location: initialData.location }),
        ...(initialData.required_skills && { required_skills: initialData.required_skills }),
      }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salary' ? value : name === 'availability' ? value as 'remote' | 'hybrid' | 'on site' : value,
    }));
  };

  const addSkill = () => {
    const trimmedName = skillInput.name.trim();
    if (!trimmedName) return;

    // Check if skill already exists
    if (formData.required_skills.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) {
      return;
    }

    const newSkill: Skill = {
      name: trimmedName,
      importance: skillInput.importance,
      must_have: skillInput.must_have,
    };

    setFormData(prev => ({
      ...prev,
      required_skills: [...prev.required_skills, newSkill],
    }));

    // Reset input
    setSkillInput({
      name: '',
      importance: 3,
      must_have: false,
    });
  };

  const removeSkill = (skillName: string) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(s => s.name !== skillName),
    }));
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim() || !formData.rol.trim() || !formData.description.trim() || !formData.location.trim()) {
      showError(t('offers.fillAllFields'));
      return;
    }

    if (!formData.salary || parseFloat(formData.salary) <= 0) {
      showError(t('offers.validSalary'));
      return;
    }

    if (formData.required_skills.length === 0) {
      showError('Please add at least one skill for evaluation');
      return;
    }

    if (!formData.required_skills.some(s => s.must_have)) {
      showError('Please add at least one must-have skill for evaluation');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await addWorkOffer({
        name: formData.name.trim(),
        rol: formData.rol.trim(),
        salary: parseFloat(formData.salary),
        description: formData.description.trim(),
        availability: formData.availability,
        location: formData.location.trim(),
        required_skills: formData.required_skills.length > 0 ? formData.required_skills : undefined,
      });

      if (!created) {
        showError(t('offers.createFailed'));
        return;
      }

      // Reset form
      setFormData({
        name: '',
        rol: '',
        salary: '',
        description: '',
        availability: 'remote',
        location: '',
        required_skills: [],
      });
      setSkillInput({
        name: '',
        importance: 3,
        must_have: false,
      });

      showSuccess(t('offers.createdSuccess'));
      onSuccess();
    } catch (err: any) {
      console.error('Error creating work offer:', err);
      const errorMessage = err?.message || err?.error?.message || 'Failed to create work offer. Please try again.';
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      style={{
        borderRadius: '24px',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
        border: '1.5px solid rgba(0, 119, 181, 0.2)',
        boxShadow: '0 16px 48px rgba(0, 119, 181, 0.15)',
        padding: '40px',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient decoration */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(0, 119, 181, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(0, 160, 220, 0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(-30%, 30%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            marginBottom: '32px',
            paddingBottom: '24px',
            borderBottom: '2px solid rgba(0, 119, 181, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(0, 119, 181, 0.3)',
            }}>
              <Briefcase size={28} style={{ color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                marginBottom: '4px',
                fontFamily: 'var(--font-poppins), sans-serif',
                background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {t('offers.create')}
              </h3>
              <p style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                margin: 0,
                fontWeight: 500,
              }}>
                Fill in the details below to create your work offer
              </p>
            </div>
          </div>
        </motion.div>


        {/* Form Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Basic Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(0, 119, 181, 0.1)',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0, 119, 181, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Briefcase size={16} style={{ color: '#0077b5' }} />
              </div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}>
                Basic Information
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label
                  htmlFor="name"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '10px',
                  }}
                >
                  <Briefcase size={16} style={{ color: '#0077b5' }} />
                  {t('offers.name')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Senior Developer"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(0, 119, 181, 0.2)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    transition: 'all 0.3s',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#0077b5';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0, 119, 181, 0.1)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="rol"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '10px',
                  }}
                >
                  <FileText size={16} style={{ color: '#0077b5' }} />
                  {t('offers.role')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Software Engineer"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(0, 119, 181, 0.2)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    transition: 'all 0.3s',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#0077b5';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0, 119, 181, 0.1)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Job Details Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(0, 119, 181, 0.1)',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0, 119, 181, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <DollarSign size={16} style={{ color: '#0077b5' }} />
              </div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}>
                Job Details
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div>
                <label
                  htmlFor="salary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '10px',
                  }}
                >
                  <DollarSign size={16} style={{ color: '#0077b5' }} />
                  {t('offers.salary')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                  }}>
                    $
                  </span>
                  <input
                    type="number"
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="50000"
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 32px',
                      borderRadius: '12px',
                      border: '1.5px solid rgba(0, 119, 181, 0.2)',
                      background: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                      color: 'var(--text-primary)',
                      transition: 'all 0.3s',
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#0077b5';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0, 119, 181, 0.1)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="availability"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '10px',
                  }}
                >
                  <Calendar size={16} style={{ color: '#0077b5' }} />
                  Type <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  id="availability"
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(0, 119, 181, 0.2)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    outline: 'none',
                    fontFamily: 'inherit',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230077b5' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 14px center',
                    paddingRight: '40px',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#0077b5';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0, 119, 181, 0.1)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  }}
                >
                  <option value="remote">{t('offers.remote')}</option>
                  <option value="hybrid">{t('offers.hybrid')}</option>
                  <option value="on site">{t('offers.onSite')}</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="location"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '10px',
                  }}
                >
                  <MapPin size={16} style={{ color: '#0077b5' }} />
                  {t('offers.location')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g. New York, NY"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(0, 119, 181, 0.2)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    transition: 'all 0.3s',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#0077b5';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0, 119, 181, 0.1)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Description Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(0, 119, 181, 0.1)',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0, 119, 181, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <FileText size={16} style={{ color: '#0077b5' }} />
              </div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}>
                Description
              </h4>
            </div>

            <div>
              <label
                htmlFor="description"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '10px',
                }}
              >
                {t('offers.description')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Describe the position, requirements, responsibilities, and benefits. Be as detailed as possible to attract the right candidates..."
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1.5px solid rgba(0, 119, 181, 0.2)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: 1.6,
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0077b5';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0, 119, 181, 0.1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                }}
              />
            </div>
          </motion.div>

          {/* Skills Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(0, 119, 181, 0.1)',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0, 119, 181, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Target size={16} style={{ color: '#0077b5' }} />
              </div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}>
                Skills & Requirements
              </h4>
            </div>

            {/* Skill Input Form */}
            <div style={{
              padding: '20px',
              borderRadius: '12px',
              background: 'rgba(0, 119, 181, 0.05)',
              border: '1.5px solid rgba(0, 119, 181, 0.1)',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                <div>
                  <label
                    htmlFor="skillName"
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '8px',
                    }}
                  >
                    Skill Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="skillName"
                    value={skillInput.name}
                    onChange={(e) => setSkillInput(prev => ({ ...prev, name: e.target.value }))}
                    onKeyPress={handleSkillKeyPress}
                    placeholder="e.g. React, TypeScript, Inglés B2"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid rgba(0, 119, 181, 0.2)',
                      background: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      transition: 'all 0.3s',
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#0077b5';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0, 119, 181, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="skillImportance"
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '8px',
                    }}
                  >
                    Importance (1-5)
                  </label>
                  <select
                    id="skillImportance"
                    value={skillInput.importance}
                    onChange={(e) => setSkillInput(prev => ({ ...prev, importance: parseInt(e.target.value) }))}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid rgba(0, 119, 181, 0.2)',
                      background: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  >
                    <option value={1}>1 - Low</option>
                    <option value={2}>2 - Below Average</option>
                    <option value={3}>3 - Average</option>
                    <option value={4}>4 - High</option>
                    <option value={5}>5 - Critical</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="skillMustHave"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      id="skillMustHave"
                      checked={skillInput.must_have}
                      onChange={(e) => setSkillInput(prev => ({ ...prev, must_have: e.target.checked }))}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: '#ef4444',
                      }}
                    />
                    <span>Must Have</span>
                  </label>
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: skillInput.must_have ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                    border: `1.5px solid ${skillInput.must_have ? '#ef4444' : 'rgba(0, 119, 181, 0.2)'}`,
                    fontSize: '0.875rem',
                    color: skillInput.must_have ? '#ef4444' : 'var(--text-secondary)',
                    fontWeight: skillInput.must_have ? 600 : 400,
                    textAlign: 'center',
                  }}>
                    {skillInput.must_have ? 'Required' : 'Optional'}
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={addSkill}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    height: 'fit-content',
                  }}
                >
                  <Plus size={16} />
                  Add
                </motion.button>
              </div>
            </div>

            {/* Skills List */}
            {formData.required_skills.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                {/* Skills Summary */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.08) 0%, rgba(0, 160, 220, 0.05) 100%)',
                  border: '1px solid rgba(0, 119, 181, 0.15)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Target size={18} style={{ color: '#0077b5' }} />
                    <span style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}>
                      Added Skills
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '0.85rem',
                  }}>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#dc2626',
                      fontWeight: 600,
                    }}>
                      <Zap size={12} style={{ fill: '#dc2626', color: '#dc2626' }} />
                      {formData.required_skills.filter(s => s.must_have).length} Required
                    </span>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'rgba(0, 119, 181, 0.1)',
                      color: '#0077b5',
                      fontWeight: 600,
                    }}>
                      <Sparkles size={12} style={{ color: '#0077b5' }} />
                      {formData.required_skills.filter(s => !s.must_have).length} Optional
                    </span>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0, 119, 181, 0.15)',
                      color: '#0077b5',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}>
                      Total: {formData.required_skills.length}
                    </span>
                  </div>
                </div>

                {/* Must-Have Skills Section */}
                {formData.required_skills.filter(s => s.must_have).length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                    }}>
                      <Zap size={16} style={{ color: '#dc2626' }} />
                      <h5 style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: '#dc2626',
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Must-Have Skills ({formData.required_skills.filter(s => s.must_have).length})
                      </h5>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {formData.required_skills
                        .filter(skill => skill.must_have)
                        .map((skill, index) => (
                          <motion.div
                            key={`must-have-${skill.name}-${index}`}
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '12px 16px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                              border: '2px solid #dc2626',
                              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)',
                              position: 'relative',
                              overflow: 'hidden',
                            }}
                          >
                            {/* Background accent */}
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '4px',
                              height: '100%',
                              background: '#dc2626',
                            }} />
                            
                            {/* Skill Name */}
                            <span style={{
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              color: '#991b1b',
                              paddingLeft: '8px',
                            }}>
                              {skill.name}
                            </span>
                            
                            {/* Importance Badge */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              background: '#ffffff',
                              border: '1px solid #dc2626',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            }}>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  style={{
                                    fill: i < skill.importance ? '#fbbf24' : 'none',
                                    color: i < skill.importance ? '#fbbf24' : '#d1d5db',
                                  }}
                                />
                              ))}
                              <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: '#991b1b',
                                marginLeft: '4px',
                              }}>
                                {skill.importance}/5
                              </span>
                            </div>
                            
                            {/* Required Badge */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              background: '#dc2626',
                              color: '#ffffff',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
                            }}>
                              <Zap size={10} style={{ fill: '#ffffff', color: '#ffffff' }} />
                              Required
                            </div>
                            
                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill.name)}
                              style={{
                                background: 'rgba(220, 38, 38, 0.1)',
                                border: '1px solid rgba(220, 38, 38, 0.3)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                padding: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#dc2626',
                                transition: 'all 0.2s',
                                marginLeft: 'auto',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#dc2626';
                                e.currentTarget.style.color = '#ffffff';
                                e.currentTarget.style.transform = 'scale(1.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
                                e.currentTarget.style.color = '#dc2626';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              <X size={14} />
                            </button>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Optional Skills Section */}
                {formData.required_skills.filter(s => !s.must_have).length > 0 && (
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                    }}>
                      <Sparkles size={16} style={{ color: '#0077b5' }} />
                      <h5 style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: '#0077b5',
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Optional Skills ({formData.required_skills.filter(s => !s.must_have).length})
                      </h5>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {formData.required_skills
                        .filter(skill => !skill.must_have)
                        .map((skill, index) => (
                          <motion.div
                            key={`optional-${skill.name}-${index}`}
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '12px 16px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                              border: '2px solid #0284c7',
                              boxShadow: '0 2px 8px rgba(0, 119, 181, 0.15)',
                              position: 'relative',
                              overflow: 'hidden',
                            }}
                          >
                            {/* Background accent */}
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '4px',
                              height: '100%',
                              background: '#0284c7',
                            }} />
                            
                            {/* Skill Name */}
                            <span style={{
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              color: '#0c4a6e',
                              paddingLeft: '8px',
                            }}>
                              {skill.name}
                            </span>
                            
                            {/* Importance Badge */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              background: '#ffffff',
                              border: '1px solid #0284c7',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            }}>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  style={{
                                    fill: i < skill.importance ? '#fbbf24' : 'none',
                                    color: i < skill.importance ? '#fbbf24' : '#d1d5db',
                                  }}
                                />
                              ))}
                              <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: '#0c4a6e',
                                marginLeft: '4px',
                              }}>
                                {skill.importance}/5
                              </span>
                            </div>
                            
                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill.name)}
                              style={{
                                background: 'rgba(2, 132, 199, 0.1)',
                                border: '1px solid rgba(2, 132, 199, 0.3)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                padding: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#0284c7',
                                transition: 'all 0.2s',
                                marginLeft: 'auto',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#0284c7';
                                e.currentTarget.style.color = '#ffffff';
                                e.currentTarget.style.transform = 'scale(1.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(2, 132, 199, 0.1)';
                                e.currentTarget.style.color = '#0284c7';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              <X size={14} />
                            </button>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {formData.required_skills.length === 0 && (
              <div style={{
                marginTop: '24px',
                padding: '32px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.05) 0%, rgba(0, 160, 220, 0.03) 100%)',
                border: '2px dashed rgba(0, 119, 181, 0.2)',
                textAlign: 'center',
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(0, 119, 181, 0.1)',
                  marginBottom: '16px',
                }}>
                  <Target size={32} style={{ color: '#0077b5' }} />
                </div>
                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  margin: '0 0 8px 0',
                }}>
                  No skills added yet
                </p>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  Add skills with their importance level (1-5) and mark them as must-have or optional
                </p>
              </div>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              paddingTop: '24px',
              borderTop: '2px solid rgba(0, 119, 181, 0.1)',
            }}
          >
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={isSubmitting ? {} : { scale: 1.02, y: -2 }}
              whileTap={isSubmitting ? {} : { scale: 0.98 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 40px',
                borderRadius: '12px',
                background: isSubmitting
                  ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                  : 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                border: 'none',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                boxShadow: isSubmitting
                  ? 'none'
                  : '0 8px 24px rgba(0, 119, 181, 0.4)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 119, 181, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 119, 181, 0.4)';
                }
              }}
            >
              <Plus size={20} />
              {isSubmitting ? t('common.loading') : t('offers.createButton')}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.form>
  );
});

CreateWorkOfferForm.displayName = 'CreateWorkOfferForm';

export default CreateWorkOfferForm;

