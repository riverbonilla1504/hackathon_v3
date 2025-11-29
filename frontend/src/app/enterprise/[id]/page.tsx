'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import NotebookGrid from '@/components/background/NotebookGrid';
import { 
  Building2, Mail, MapPin, Phone, Globe, Linkedin, Facebook, Instagram, 
  Briefcase, Calendar, ExternalLink, MapPin as MapPinIcon, DollarSign, Clock
} from 'lucide-react';
import { EnterpriseData, WorkOffer, fetchEnterpriseDataByCompanyId, getWorkOffers } from '@/lib/storage';
import Link from 'next/link';

export default function PublicEnterpriseProfile() {
  const params = useParams();
  const companyId = params?.id ? Number(params.id) : null;
  const [enterpriseData, setEnterpriseData] = useState<EnterpriseData | null>(null);
  const [workOffers, setWorkOffers] = useState<WorkOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!companyId) {
        setLoading(false);
        return;
      }

      try {
        const [data, offers] = await Promise.all([
          fetchEnterpriseDataByCompanyId(companyId),
          getWorkOffers(),
        ]);

        setEnterpriseData(data);
        // For now, show all offers. Later you can filter by company_id if you add it to vacant table
        setWorkOffers(offers.slice(0, 6)); // Show top 6 offers
      } catch (error) {
        console.error('Error loading enterprise data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-x-hidden">
        <NotebookGrid />
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          color: 'var(--text-primary)'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!enterpriseData) {
    return (
      <div className="relative min-h-screen overflow-x-hidden">
        <NotebookGrid />
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          color: 'var(--text-primary)',
          gap: '16px'
        }}>
          <Building2 size={64} style={{ opacity: 0.3 }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Enterprise Profile Not Found</h2>
          <p style={{ color: 'var(--text-secondary)' }}>The profile you're looking for doesn't exist.</p>
          <Link href="/" style={{ 
            padding: '12px 24px',
            borderRadius: '12px',
            background: '#0077b5',
            color: 'white',
            textDecoration: 'none',
            fontWeight: 600,
          }}>
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not provided';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <NotebookGrid />

      {/* Header with Home Link */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'fixed',
          top: 'clamp(20px, 3vw, 32px)',
          left: 'clamp(20px, 3vw, 32px)',
          zIndex: 1000,
        }}
      >
        <Link href="/" passHref>
          <motion.div
            whileHover={{ scale: 1.1 }}
            style={{ cursor: 'pointer' }}
          >
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold leading-none"
              style={{ fontFamily: 'var(--font-cursive), cursive' }}
            >
              <span className="block theme-text-primary mb-1">Worky</span>
              <span
                className="block gradient-text"
                style={{
                  background: 'linear-gradient(to right, #0077b5, #00a0dc, #0077b5)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                AI
              </span>
            </h1>
          </motion.div>
        </Link>
      </motion.div>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'relative',
          minHeight: '100vh',
          padding: '120px 16px 60px',
        }}
        className="px-4 sm:px-6 lg:px-8"
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              borderRadius: '28px',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
              border: '1.5px solid rgba(0, 119, 181, 0.3)',
              boxShadow: '0 16px 48px rgba(0, 119, 181, 0.15)',
              padding: '40px',
              marginBottom: '32px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at top right, rgba(0,119,181,0.1), transparent 60%)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
              {/* Profile Picture */}
              <div
                style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: '24px',
                  background: enterpriseData.company_logo 
                    ? `url(${enterpriseData.company_logo}) center/cover` 
                    : 'linear-gradient(135deg, #0077b5 0%, #005885 100%)',
                  border: '4px solid rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 8px 24px rgba(0, 119, 181, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {!enterpriseData.company_logo && <Building2 size={64} style={{ color: 'white' }} />}
              </div>

              {/* Company Info */}
              <div style={{ flex: 1 }}>
                <h1
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '12px',
                    fontFamily: 'var(--font-poppins), sans-serif',
                  }}
                >
                  {enterpriseData.trade_name || enterpriseData.legal_name}
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#0077b5', fontWeight: 600, marginBottom: '24px' }}>
                  {enterpriseData.legal_name}
                </p>

                {enterpriseData.company_description && (
                  <p style={{ 
                    fontSize: '1rem', 
                    color: 'var(--text-secondary)', 
                    lineHeight: 1.7,
                    marginBottom: '24px',
                    maxWidth: '800px',
                  }}>
                    {enterpriseData.company_description}
                  </p>
                )}

                {/* Quick Info */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  {enterpriseData.industry_sector && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Briefcase size={18} style={{ color: '#0077b5' }} />
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {enterpriseData.industry_sector}
                      </span>
                    </div>
                  )}
                  {enterpriseData.company_size && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={18} style={{ color: '#0077b5' }} />
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {enterpriseData.company_size}
                      </span>
                    </div>
                  )}
                  {enterpriseData.city && enterpriseData.state && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPinIcon size={18} style={{ color: '#0077b5' }} />
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {enterpriseData.city}, {enterpriseData.state}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
            {/* Company Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                borderRadius: '24px',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
                border: '1.5px solid rgba(0, 119, 181, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 119, 181, 0.1)',
                padding: '32px',
              }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px' }}>
                Company Details
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <InfoRow label="Company Type" value={enterpriseData.company_type} />
                <InfoRow label="Legal Representative" value={enterpriseData.legal_representative} />
                <InfoRow label="Tax ID" value={enterpriseData.tax_id} />
                <InfoRow label="Incorporation Date" value={formatDate(enterpriseData.incorporation_date)} />
                {enterpriseData.address && (
                  <InfoRow 
                    label="Address" 
                    value={`${enterpriseData.address}, ${enterpriseData.city || ''}, ${enterpriseData.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '')} 
                  />
                )}
              </div>
            </motion.div>

            {/* Contact & Social */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                borderRadius: '24px',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
                border: '1.5px solid rgba(0, 119, 181, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 119, 181, 0.1)',
                padding: '32px',
              }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px' }}>
                Contact & Social
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {enterpriseData.corporate_email && (
                  <InfoRow 
                    label="Email" 
                    value={enterpriseData.corporate_email}
                    icon={<Mail size={18} style={{ color: '#0077b5' }} />}
                  />
                )}
                {enterpriseData.mobile_phone && (
                  <InfoRow 
                    label="Mobile" 
                    value={enterpriseData.mobile_phone}
                    icon={<Phone size={18} style={{ color: '#0077b5' }} />}
                  />
                )}
                {enterpriseData.website_url && (
                  <a
                    href={enterpriseData.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <InfoRow 
                      label="Website" 
                      value={enterpriseData.website_url}
                      icon={<Globe size={18} style={{ color: '#0077b5' }} />}
                      link
                    />
                  </a>
                )}
                {(enterpriseData.linkedin_url || enterpriseData.facebook_url || enterpriseData.instagram_url) && (
                  <div style={{ marginTop: '8px' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      Social Media
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {enterpriseData.linkedin_url && (
                        <a
                          href={enterpriseData.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            borderRadius: '12px',
                            background: 'rgba(0, 119, 181, 0.1)',
                            color: '#0077b5',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                          }}
                        >
                          <Linkedin size={18} />
                          LinkedIn
                        </a>
                      )}
                      {enterpriseData.facebook_url && (
                        <a
                          href={enterpriseData.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            borderRadius: '12px',
                            background: 'rgba(24, 119, 242, 0.1)',
                            color: '#1877f2',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                          }}
                        >
                          <Facebook size={18} />
                          Facebook
                        </a>
                      )}
                      {enterpriseData.instagram_url && (
                        <a
                          href={enterpriseData.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            borderRadius: '12px',
                            background: 'rgba(228, 64, 95, 0.1)',
                            color: '#e4405f',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                          }}
                        >
                          <Instagram size={18} />
                          Instagram
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Work Offers */}
          {workOffers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                borderRadius: '24px',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
                border: '1.5px solid rgba(0, 119, 181, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 119, 181, 0.1)',
                padding: '32px',
              }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px' }}>
                Open Positions
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {workOffers.map((offer) => (
                  <motion.div
                    key={offer.vacant_id}
                    whileHover={{ scale: 1.02, y: -4 }}
                    style={{
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.6)',
                      border: '1.5px solid rgba(0, 119, 181, 0.2)',
                      padding: '20px',
                      transition: 'all 0.3s',
                    }}
                  >
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {offer.name}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#0077b5', fontWeight: 600, marginBottom: '12px' }}>
                      {offer.rol}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
                      {offer.description?.substring(0, 120)}...
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {offer.salary > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <DollarSign size={16} style={{ color: '#0077b5' }} />
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            ${offer.salary.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} style={{ color: '#0077b5' }} />
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {offer.availability}
                        </span>
                      </div>
                      {offer.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPinIcon size={16} style={{ color: '#0077b5' }} />
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {offer.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.section>
    </div>
  );
}

function InfoRow({ 
  label, 
  value, 
  icon,
  link = false 
}: { 
  label: string; 
  value: string | null | undefined;
  icon?: React.ReactNode;
  link?: boolean;
}) {
  if (!value) return null;
  
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
      {icon && <div style={{ marginTop: '2px' }}>{icon}</div>}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
          {label}
        </p>
        <p style={{ 
          fontSize: '0.9rem', 
          color: link ? '#0077b5' : 'var(--text-primary)', 
          margin: 0,
          wordBreak: 'break-word',
        }}>
          {value}
        </p>
      </div>
    </div>
  );
}

