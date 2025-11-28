'use client';

import { motion } from 'framer-motion';
import { EnterpriseData } from '@/lib/storage';
import { Building2, Mail, MapPin, Phone, Globe, Linkedin, Facebook, Instagram, FileText, Calendar, User, Briefcase } from 'lucide-react';

interface EnterpriseProfileProps {
  enterpriseData: EnterpriseData;
}

export default function EnterpriseProfile({ enterpriseData }: EnterpriseProfileProps) {
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
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          borderRadius: '20px',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
          border: '1.5px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          padding: '24px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0077b5 0%, #005885 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Building2 size={32} style={{ color: 'white' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '4px',
                fontFamily: 'var(--font-poppins), sans-serif',
              }}
            >
              {enterpriseData.trade_name || enterpriseData.legal_name || 'Enterprise'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#0077b5', fontWeight: 600, margin: 0 }}>
              {enterpriseData.legal_name}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Company Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          borderRadius: '20px',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
          border: '1.5px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          padding: '24px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Building2 size={20} style={{ color: '#0077b5' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Company Information
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Legal Name
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
              {enterpriseData.legal_name || 'Not provided'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Trade Name
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
              {enterpriseData.trade_name || 'Not provided'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Tax ID
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
              {enterpriseData.tax_id || 'Not provided'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Company Type
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
              {enterpriseData.company_type || 'Not provided'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Legal Representative
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
              {enterpriseData.legal_representative || 'Not provided'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Incorporation Date
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
              {formatDate(enterpriseData.incorporation_date)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          borderRadius: '20px',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
          border: '1.5px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          padding: '24px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Mail size={20} style={{ color: '#0077b5' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Contact Information
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Email
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
              {enterpriseData.corporate_email || 'Not provided'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Mobile Phone
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
              {enterpriseData.mobile_phone || 'Not provided'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Landline
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
              {enterpriseData.landline_phone || 'Not provided'}
            </p>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Address
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
              {enterpriseData.address ? `${enterpriseData.address}, ${enterpriseData.city || ''}, ${enterpriseData.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '') : 'Not provided'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Business Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          borderRadius: '20px',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
          border: '1.5px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          padding: '24px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Briefcase size={20} style={{ color: '#0077b5' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Business Information
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Industry Sector
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
              {enterpriseData.industry_sector || 'Not provided'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Company Size
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
              {enterpriseData.company_size || 'Not provided'}
            </p>
          </div>
        </div>
        {enterpriseData.company_description && (
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
              Company Description
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
              {enterpriseData.company_description}
            </p>
          </div>
        )}
      </motion.div>

      {/* Social Media & Website */}
      {(enterpriseData.website_url || enterpriseData.linkedin_url || enterpriseData.facebook_url || enterpriseData.instagram_url) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            borderRadius: '20px',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
            border: '1.5px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            padding: '24px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Globe size={20} style={{ color: '#0077b5' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Online Presence
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {enterpriseData.website_url && (
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                  Website
                </p>
                <a
                  href={enterpriseData.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.875rem',
                    color: '#0077b5',
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  {enterpriseData.website_url}
                </a>
              </div>
            )}
            {enterpriseData.linkedin_url && (
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                  LinkedIn
                </p>
                <a
                  href={enterpriseData.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.875rem',
                    color: '#0077b5',
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  {enterpriseData.linkedin_url}
                </a>
              </div>
            )}
            {enterpriseData.facebook_url && (
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                  Facebook
                </p>
                <a
                  href={enterpriseData.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.875rem',
                    color: '#0077b5',
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  {enterpriseData.facebook_url}
                </a>
              </div>
            )}
            {enterpriseData.instagram_url && (
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                  Instagram
                </p>
                <a
                  href={enterpriseData.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.875rem',
                    color: '#0077b5',
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  {enterpriseData.instagram_url}
                </a>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Documents Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          borderRadius: '20px',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
          border: '1.5px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <FileText size={20} style={{ color: '#0077b5' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Documents
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            background: enterpriseData.chamber_of_commerce_certificate ? 'rgba(0, 119, 181, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            border: `1.5px solid ${enterpriseData.chamber_of_commerce_certificate ? 'rgba(0, 119, 181, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
          }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Chamber of Commerce
            </p>
            <p style={{ fontSize: '0.75rem', color: enterpriseData.chamber_of_commerce_certificate ? '#0077b5' : 'var(--text-secondary)', margin: 0, fontWeight: 600 }}>
              {enterpriseData.chamber_of_commerce_certificate ? 'Uploaded' : 'Not uploaded'}
            </p>
          </div>
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            background: enterpriseData.rut_document ? 'rgba(0, 119, 181, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            border: `1.5px solid ${enterpriseData.rut_document ? 'rgba(0, 119, 181, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
          }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              RUT Document
            </p>
            <p style={{ fontSize: '0.75rem', color: enterpriseData.rut_document ? '#0077b5' : 'var(--text-secondary)', margin: 0, fontWeight: 600 }}>
              {enterpriseData.rut_document ? 'Uploaded' : 'Not uploaded'}
            </p>
          </div>
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            background: enterpriseData.legal_representative_id ? 'rgba(0, 119, 181, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            border: `1.5px solid ${enterpriseData.legal_representative_id ? 'rgba(0, 119, 181, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
          }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Legal Rep. ID
            </p>
            <p style={{ fontSize: '0.75rem', color: enterpriseData.legal_representative_id ? '#0077b5' : 'var(--text-secondary)', margin: 0, fontWeight: 600 }}>
              {enterpriseData.legal_representative_id ? 'Uploaded' : 'Not uploaded'}
            </p>
          </div>
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            background: enterpriseData.company_logo ? 'rgba(0, 119, 181, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            border: `1.5px solid ${enterpriseData.company_logo ? 'rgba(0, 119, 181, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
          }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Company Logo
            </p>
            <p style={{ fontSize: '0.75rem', color: enterpriseData.company_logo ? '#0077b5' : 'var(--text-secondary)', margin: 0, fontWeight: 600 }}>
              {enterpriseData.company_logo ? 'Uploaded' : 'Not uploaded'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

