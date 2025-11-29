'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WorkOffer, deleteWorkOffer } from '@/lib/storage';
import { Trash2, MapPin, DollarSign, Calendar, Briefcase, Plus, Search, X } from 'lucide-react';
import Lottie from 'lottie-react';
import ConfirmDialog from './ConfirmDialog';
import { useNotifications } from '@/contexts/NotificationContext';

interface WorkOffersListProps {
  offers: WorkOffer[];
  onDelete: () => void;
  onSelectOffer: (offer: WorkOffer) => void;
  onCreateOffer?: () => void;
}

export default function WorkOffersList({ offers, onDelete, onSelectOffer, onCreateOffer }: WorkOffersListProps) {
  const { showSuccess, showError } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [lottieData, setLottieData] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    vacantId: number | null;
    offerName: string;
  }>({
    isOpen: false,
    vacantId: null,
    offerName: '',
  });

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

  const handleDeleteClick = (vacantId: number, offerName: string) => {
    setConfirmDialog({
      isOpen: true,
      vacantId,
      offerName,
    });
  };

  const handleConfirmDelete = async () => {
    if (confirmDialog.vacantId) {
      try {
        await deleteWorkOffer(confirmDialog.vacantId);
        showSuccess('Work offer deleted successfully');
        onDelete();
      } catch (error) {
        showError('Failed to delete work offer');
      }
    }
    setConfirmDialog({
      isOpen: false,
      vacantId: null,
      offerName: '',
    });
  };

  const handleCancelDelete = () => {
    setConfirmDialog({
      isOpen: false,
      vacantId: null,
      offerName: '',
    });
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

  // Filter offers based on search query
  const filteredOffers = offers.filter((offer) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    const searchableText = [
      offer.name,
      offer.rol,
      offer.location,
      offer.description,
      offer.availability,
      ...(offer.required_skills || []).map(skill => 
        typeof skill === 'string' ? skill : skill.name
      ),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(query);
  });

  if (offers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
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
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            textAlign: 'center',
          }}
        >
          <h3
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '12px',
              fontFamily: 'var(--font-poppins), sans-serif',
            }}
          >
            No Work Offers Found
          </h3>
          <p
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '500px',
              margin: '0 auto 32px',
            }}
          >
            Create your first work offer to start attracting talented candidates!
          </p>
          {onCreateOffer && (
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
              Create Work Offer
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'relative',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={20}
            style={{
              position: 'absolute',
              left: '16px',
              color: 'var(--text-secondary)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          <input
            type="text"
            placeholder="Search work offers by name, role, location, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 48px 14px 48px',
              borderRadius: '16px',
              border: '1.5px solid rgba(0, 119, 181, 0.2)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
              backdropFilter: 'blur(10px)',
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(0, 119, 181, 0.08)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#0077b5';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 119, 181, 0.2)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.2)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 119, 181, 0.08)';
            }}
          />
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                padding: '6px',
                borderRadius: '8px',
                background: 'rgba(0, 119, 181, 0.1)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0077b5',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 119, 181, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 119, 181, 0.1)';
              }}
            >
              <X size={16} />
            </motion.button>
          )}
        </div>
        {searchQuery && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '8px',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              paddingLeft: '4px',
            }}
          >
            Found {filteredOffers.length} {filteredOffers.length === 1 ? 'offer' : 'offers'} matching "{searchQuery}"
          </motion.p>
        )}
      </motion.div>

      {/* No Results Message */}
      {searchQuery && filteredOffers.length === 0 && offers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%)',
            border: '1.5px dashed rgba(0, 119, 181, 0.3)',
          }}
        >
          <Search size={48} style={{ color: '#0077b5', opacity: 0.5, marginBottom: '16px' }} />
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            No offers found
          </h3>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              marginBottom: '16px',
            }}
          >
            No work offers match "{searchQuery}"
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSearchQuery('')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: 'rgba(0, 119, 181, 0.1)',
              border: '1px solid rgba(0, 119, 181, 0.3)',
              color: '#0077b5',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <X size={14} />
            Clear search
          </motion.button>
        </motion.div>
      )}

      {/* Work Offers List */}
      {filteredOffers.map((offer, index) => (
        <motion.div
          key={offer.vacant_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.01, y: -2 }}
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
          }}
        >
          {/* Delete Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(offer.vacant_id, offer.name);
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

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Work Offer"
        message={`Are you sure you want to delete "${confirmDialog.offerName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

