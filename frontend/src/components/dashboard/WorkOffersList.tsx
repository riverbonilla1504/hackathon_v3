'use client';

import { motion } from 'framer-motion';
import { WorkOffer, deleteWorkOffer } from '@/lib/storage';
import { Trash2, MapPin, DollarSign, Calendar, Briefcase } from 'lucide-react';

interface WorkOffersListProps {
  offers: WorkOffer[];
  onDelete: () => void;
  onSelectOffer: (offer: WorkOffer) => void;
}

export default function WorkOffersList({ offers, onDelete, onSelectOffer }: WorkOffersListProps) {
  const handleDelete = async (vacantId: number) => {
    if (confirm('Are you sure you want to delete this work offer?')) {
      await deleteWorkOffer(vacantId);
      onDelete();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  if (offers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          borderRadius: '24px',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
          border: '1.5px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          padding: '48px',
          textAlign: 'center',
        }}
      >
        <Briefcase size={64} style={{ color: '#0077b5', marginBottom: '24px', opacity: 0.5 }} />
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
          No work offers yet. Create your first offer to get started!
        </p>
      </motion.div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {offers.map((offer, index) => (
        <motion.div
          key={offer.vacant_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -4 }}
          onClick={() => onSelectOffer(offer)}
          style={{
            borderRadius: '24px',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
            border: '1.5px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            padding: '32px',
            position: 'relative',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0077b5';
            e.currentTarget.style.boxShadow = '0 12px 40px 0 rgba(0, 119, 181, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.37)';
          }}
        >
          {/* Delete Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(offer.vacant_id);
            }}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#dc2626',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            }}
          >
            <Trash2 size={18} />
          </motion.button>

          {/* Header */}
          <div style={{ marginBottom: '20px', paddingRight: '48px' }}>
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '8px',
                fontFamily: 'var(--font-poppins), sans-serif',
              }}
            >
              {offer.name}
            </h3>
            <p
              style={{
                fontSize: '1.125rem',
                color: '#0077b5',
                fontWeight: 600,
                marginBottom: '4px',
              }}
            >
              {offer.rol}
            </p>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}
            >
              ID: {offer.vacant_id}
            </p>
          </div>

          {/* Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} style={{ color: '#0077b5' }} />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                  Salary
                </p>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formatSalary(offer.salary)}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} style={{ color: '#0077b5' }} />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                  Location
                </p>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {offer.location}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={20} style={{ color: '#0077b5' }} />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                  Availability
                </p>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {offer.availability.charAt(0).toUpperCase() + offer.availability.slice(1)}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} style={{ color: '#0077b5' }} />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                  Created
                </p>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formatDate(offer.create_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                fontWeight: 600,
              }}
            >
              Description:
            </p>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                lineHeight: 1.6,
              }}
            >
              {offer.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

