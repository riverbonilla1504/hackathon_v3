'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { addWorkOffer, WorkOffer } from '@/lib/storage';
import { Briefcase, DollarSign, MapPin, FileText, Calendar, Plus } from 'lucide-react';

interface CreateWorkOfferFormProps {
  onSuccess: () => void;
}

export default function CreateWorkOfferForm({ onSuccess }: CreateWorkOfferFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    rol: '',
    salary: '',
    description: '',
    availability: 'remote' as 'remote' | 'hybrid' | 'on site',
    location: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salary' ? value : name === 'availability' ? value as 'remote' | 'hybrid' | 'on site' : value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim() || !formData.rol.trim() || !formData.description.trim() || !formData.location.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.salary || parseFloat(formData.salary) <= 0) {
      setError('Please enter a valid salary');
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
      });

      if (!created) {
        setError('Failed to create work offer in Supabase. Please try again.');
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
      });

      onSuccess();
    } catch (err) {
      setError('Failed to create work offer. Please try again.');
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
        borderRadius: '20px',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
        border: '1.5px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        padding: '32px',
        maxWidth: '700px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #0077b5 0%, #005885 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Briefcase size={20} style={{ color: 'white' }} />
        </div>
        <div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
            fontFamily: 'var(--font-poppins), sans-serif',
          }}>
            Create Work Offer
          </h3>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            margin: 0,
          }}>
            Fill in the details below
          </p>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#dc2626',
            marginBottom: '20px',
            fontSize: '0.813rem',
          }}
        >
          {error}
        </motion.div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Name and Role in a row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label
              htmlFor="name"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              <Briefcase size={14} style={{ color: '#0077b5' }} />
              Name <span style={{ color: '#dc2626' }}>*</span>
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
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #9ca3af',
                background: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                transition: 'all 0.3s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#0077b5';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 119, 181, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#9ca3af';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label
              htmlFor="rol"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              <FileText size={14} style={{ color: '#0077b5' }} />
              Role <span style={{ color: '#dc2626' }}>*</span>
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
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #9ca3af',
                background: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                transition: 'all 0.3s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#0077b5';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 119, 181, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#9ca3af';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Salary, Availability, and Location in a row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label
              htmlFor="salary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              <DollarSign size={14} style={{ color: '#0077b5' }} />
              Salary <span style={{ color: '#dc2626' }}>*</span>
            </label>
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
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #9ca3af',
                background: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                transition: 'all 0.3s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#0077b5';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 119, 181, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#9ca3af';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label
              htmlFor="availability"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              <Calendar size={14} style={{ color: '#0077b5' }} />
              Type <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #9ca3af',
                background: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                transition: 'all 0.3s',
                cursor: 'pointer',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#0077b5';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 119, 181, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#9ca3af';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="on site">On Site</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="location"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              <MapPin size={14} style={{ color: '#0077b5' }} />
              Location <span style={{ color: '#dc2626' }}>*</span>
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
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #9ca3af',
                background: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                transition: 'all 0.3s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#0077b5';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 119, 181, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#9ca3af';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '6px',
            }}
          >
            <FileText size={14} style={{ color: '#0077b5' }} />
            Description <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Describe the position, requirements, and benefits..."
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1.5px solid #9ca3af',
              background: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              transition: 'all 0.3s',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#0077b5';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 119, 181, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#9ca3af';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            background: isSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #0077b5 0%, #005885 100%)',
            border: 'none',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            alignSelf: 'flex-end',
            boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(0, 119, 181, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Plus size={16} />
          {isSubmitting ? 'Creating...' : 'Create Offer'}
        </motion.button>
      </div>
    </motion.form>
  );
}

