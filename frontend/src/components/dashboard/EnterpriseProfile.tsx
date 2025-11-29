'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EnterpriseData, fileToBase64, saveEnterpriseData } from '@/lib/storage';
import { supabase } from '@/lib/supabaseClient';
import { 
  Building2, Mail, MapPin, Phone, Globe, Linkedin, Facebook, Instagram, 
  FileText, Calendar, User, Briefcase, Edit2, Save, X, Upload, Camera, Share2 
} from 'lucide-react';
import { getCompanyIdFromEmail } from '@/lib/storage';
import { useNotifications } from '@/contexts/NotificationContext';

interface EnterpriseProfileProps {
  enterpriseData: EnterpriseData;
  onUpdate?: (updatedData: EnterpriseData) => void;
}

export default function EnterpriseProfile({ enterpriseData, onUpdate }: EnterpriseProfileProps) {
  const { showSuccess, showError } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<EnterpriseData>(enterpriseData);
  const [profilePic, setProfilePic] = useState<string | null>(enterpriseData.company_logo);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);

  useEffect(() => {
    setFormData(enterpriseData);
    setProfilePic(enterpriseData.company_logo);
  }, [enterpriseData]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  const handleInputChange = (field: keyof EnterpriseData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      const base64 = await fileToBase64(file);
      setProfilePic(base64);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Get current user session to find company
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user?.email) {
        alert('Session expired. Please log in again.');
        return;
      }

      // Find company by email
      const { data: contactInfo } = await supabase
        .from('company_contact_info')
        .select('company_id')
        .eq('corporate_email', sessionData.session.user.email)
        .single();

      if (!contactInfo) {
        alert('Company not found. Please contact support.');
        return;
      }

      const companyId = contactInfo.company_id;

      // Update company table
      const { error: companyError } = await supabase
        .from('company')
        .update({
          legal_name: formData.legal_name,
          trade_name: formData.trade_name,
          tax_id: formData.tax_id,
          verification_digit: Number(formData.verification_digit || 0),
          legal_representative: formData.legal_representative,
          company_type: formData.company_type,
          incorporation_date: formData.incorporation_date || null,
        })
        .eq('id', companyId);

      if (companyError) {
        throw new Error(`Error updating company: ${companyError.message}`);
      }

      // Update contact info
      const { error: contactError } = await supabase
        .from('company_contact_info')
        .update({
          address: formData.address,
          city: formData.city,
          state: formData.state,
          landline_phone: formData.landline_phone,
          mobile_phone: formData.mobile_phone,
          corporate_email: formData.corporate_email,
          website_url: formData.website_url,
        })
        .eq('company_id', companyId);

      if (contactError) {
        throw new Error(`Error updating contact info: ${contactError.message}`);
      }

      // Update documents (including profile pic)
      const updatedLogo = profilePicFile ? await fileToBase64(profilePicFile) : profilePic;
      const { error: docsError } = await supabase
        .from('company_documents')
        .update({
          company_logo: updatedLogo,
          chamber_of_commerce_certificate: formData.chamber_of_commerce_certificate,
          rut_document: formData.rut_document,
          legal_representative_id: formData.legal_representative_id,
        })
        .eq('company_id', companyId);

      if (docsError) {
        throw new Error(`Error updating documents: ${docsError.message}`);
      }

      // Update job posting info
      const { error: jobError } = await supabase
        .from('company_job_posting_info')
        .update({
          industry_sector: formData.industry_sector,
          company_size: formData.company_size,
          company_description: formData.company_description,
          linkedin_url: formData.linkedin_url || null,
          facebook_url: formData.facebook_url || null,
          instagram_url: formData.instagram_url || null,
        })
        .eq('company_id', companyId);

      if (jobError) {
        throw new Error(`Error updating job posting info: ${jobError.message}`);
      }

      // Update local storage
      const updatedData: EnterpriseData = {
        ...formData,
        company_logo: updatedLogo || formData.company_logo,
      };
      saveEnterpriseData(updatedData);
      
      if (onUpdate) {
        onUpdate(updatedData);
      }

      setIsEditing(false);
      setProfilePicFile(null);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      showError(`Error saving profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(enterpriseData);
    setProfilePic(enterpriseData.company_logo);
    setProfilePicFile(null);
    setIsEditing(false);
  };

  const handleShare = async () => {
    try {
      // Use corporate_email from enterpriseData directly
      const emailToUse = enterpriseData.corporate_email;
      
      if (!emailToUse) {
        showError('Corporate email not found. Please update your profile.');
        return;
      }

      // Get company ID from corporate email
      const companyId = await getCompanyIdFromEmail(emailToUse);
      
      if (!companyId) {
        showError('Could not generate share link. Please try again.');
        return;
      }

      const shareUrl = `${window.location.origin}/enterprise/${companyId}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      showSuccess('Profile link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing profile:', error);
      showError('Error generating share link. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        borderRadius: '28px',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
        border: '1.5px solid rgba(0, 119, 181, 0.2)',
        boxShadow: '0 20px 60px rgba(0, 119, 181, 0.12), 0 8px 24px rgba(0, 0, 0, 0.08)',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradients */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at top right, rgba(0, 119, 181, 0.08), transparent 50%),
            radial-gradient(circle at bottom left, rgba(0, 160, 220, 0.06), transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #0077b5 0%, #00a0dc 50%, #0077b5 100%)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Header with Profile Picture */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ 
            marginBottom: '48px', 
            paddingBottom: '40px', 
            borderBottom: '2px solid rgba(0, 119, 181, 0.1)',
            background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.03) 0%, rgba(0, 160, 220, 0.02) 100%)',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(0, 119, 181, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px', flexWrap: 'wrap' }}>
            {/* Profile Picture */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{ position: 'relative' }}
            >
              <div
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '24px',
                  background: profilePic 
                    ? `url(${profilePic}) center/cover` 
                    : 'linear-gradient(135deg, #0077b5 0%, #00a0dc 50%, #005885 100%)',
                  border: '4px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 12px 32px rgba(0, 119, 181, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {!profilePic && (
                  <Building2 size={56} style={{ color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                )}
                {/* Shine effect */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
              {isEditing && (
                <motion.label
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    position: 'absolute',
                    bottom: '-10px',
                    right: '-10px',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                    border: '4px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 6px 16px rgba(0, 119, 181, 0.4)',
                    zIndex: 10,
                  }}
                >
                  <Camera size={22} style={{ color: 'white' }} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    style={{ display: 'none' }}
                  />
                </motion.label>
              )}
            </motion.div>

            {/* Company Info */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input
                    type="text"
                    value={formData.trade_name || ''}
                    onChange={(e) => handleInputChange('trade_name', e.target.value)}
                    placeholder="Trade Name"
                    style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      border: '2px solid rgba(0, 119, 181, 0.3)',
                      borderRadius: '16px',
                      padding: '14px 20px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      width: '100%',
                      fontFamily: 'var(--font-poppins), sans-serif',
                      transition: 'all 0.3s',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0077b5';
                      e.target.style.boxShadow = '0 0 0 4px rgba(0, 119, 181, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0, 119, 181, 0.3)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <input
                    type="text"
                    value={formData.legal_name || ''}
                    onChange={(e) => handleInputChange('legal_name', e.target.value)}
                    placeholder="Legal Name"
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: '#0077b5',
                      border: '2px solid rgba(0, 119, 181, 0.3)',
                      borderRadius: '16px',
                      padding: '12px 20px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      width: '100%',
                      transition: 'all 0.3s',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0077b5';
                      e.target.style.boxShadow = '0 0 0 4px rgba(0, 119, 181, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0, 119, 181, 0.3)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              ) : (
                <>
                  <h2
                    style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '12px',
                      fontFamily: 'var(--font-poppins), sans-serif',
                      background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      lineHeight: 1.2,
                    }}
                  >
                    {formData.trade_name || formData.legal_name || 'Enterprise'}
                  </h2>
                  <p style={{ 
                    fontSize: '1.1rem', 
                    color: '#0077b5', 
                    fontWeight: 600, 
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <Building2 size={18} />
                    {formData.legal_name}
                  </p>
                  {formData.industry_sector && (
                    <p style={{ 
                      fontSize: '0.95rem', 
                      color: 'var(--text-secondary)', 
                      marginTop: '8px',
                      margin: 0,
                      marginTop: '8px',
                    }}>
                      {formData.industry_sector}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Edit/Save Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {!isEditing ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleShare}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px 24px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.1) 0%, rgba(0, 160, 220, 0.08) 100%)',
                      color: '#0077b5',
                      border: '2px solid rgba(0, 119, 181, 0.2)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 12px rgba(0, 119, 181, 0.1)',
                    }}
                  >
                    <Share2 size={20} />
                    Share Profile
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px 24px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      boxShadow: '0 6px 20px rgba(0, 119, 181, 0.35)',
                      transition: 'all 0.3s',
                    }}
                  >
                    <Edit2 size={20} />
                    Edit Profile
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancel}
                    disabled={isSaving}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px 24px',
                      borderRadius: '16px',
                      background: 'rgba(0, 0, 0, 0.04)',
                      color: 'var(--text-primary)',
                      border: '2px solid rgba(0, 0, 0, 0.1)',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      opacity: isSaving ? 0.6 : 1,
                    }}
                  >
                    <X size={20} />
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={!isSaving ? { scale: 1.05, y: -2 } : {}}
                    whileTap={!isSaving ? { scale: 0.98 } : {}}
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px 24px',
                      borderRadius: '16px',
                      background: isSaving 
                        ? '#9ca3af' 
                        : 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                      color: 'white',
                      border: 'none',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      boxShadow: isSaving 
                        ? 'none' 
                        : '0 6px 20px rgba(0, 119, 181, 0.35)',
                      transition: 'all 0.3s',
                    }}
                  >
                    <Save size={20} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Form Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Company Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            style={{
              padding: '32px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
              border: '1.5px solid rgba(0, 119, 181, 0.15)',
              boxShadow: '0 8px 24px rgba(0, 119, 181, 0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: 'linear-gradient(180deg, #0077b5 0%, #00a0dc 100%)',
                borderRadius: '0 4px 4px 0',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', paddingLeft: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.15) 0%, rgba(0, 160, 220, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid rgba(0, 119, 181, 0.2)',
                boxShadow: '0 4px 12px rgba(0, 119, 181, 0.1)',
              }}>
                <Building2 size={24} style={{ color: '#0077b5' }} />
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                color: 'var(--text-primary)', 
                margin: 0,
                fontFamily: 'var(--font-poppins), sans-serif',
                background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Company Information
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <FormField
                label="Legal Name"
                value={formData.legal_name}
                onChange={(v) => handleInputChange('legal_name', v)}
                disabled={!isEditing}
                required
              />
              <FormField
                label="Trade Name"
                value={formData.trade_name}
                onChange={(v) => handleInputChange('trade_name', v)}
                disabled={!isEditing}
              />
              <FormField
                label="Tax ID"
                value={formData.tax_id}
                onChange={(v) => handleInputChange('tax_id', v)}
                disabled={!isEditing}
                required
              />
              <FormField
                label="Verification Digit"
                value={formData.verification_digit}
                onChange={(v) => handleInputChange('verification_digit', v)}
                disabled={!isEditing}
                type="number"
                required
              />
              <FormField
                label="Company Type"
                value={formData.company_type}
                onChange={(v) => handleInputChange('company_type', v)}
                disabled={!isEditing}
                placeholder="S.A.S., LTDA, etc."
              />
              <FormField
                label="Legal Representative"
                value={formData.legal_representative}
                onChange={(v) => handleInputChange('legal_representative', v)}
                disabled={!isEditing}
                required
              />
              <FormField
                label="Incorporation Date"
                value={formatDate(formData.incorporation_date)}
                onChange={(v) => handleInputChange('incorporation_date', v)}
                disabled={!isEditing}
                type="date"
              />
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            style={{
              padding: '32px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
              border: '1.5px solid rgba(0, 119, 181, 0.15)',
              boxShadow: '0 8px 24px rgba(0, 119, 181, 0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: 'linear-gradient(180deg, #0077b5 0%, #00a0dc 100%)',
                borderRadius: '0 4px 4px 0',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', paddingLeft: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.15) 0%, rgba(0, 160, 220, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid rgba(0, 119, 181, 0.2)',
                boxShadow: '0 4px 12px rgba(0, 119, 181, 0.1)',
              }}>
                <Mail size={24} style={{ color: '#0077b5' }} />
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                color: 'var(--text-primary)', 
                margin: 0,
                fontFamily: 'var(--font-poppins), sans-serif',
                background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Contact Information
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <FormField
                label="Corporate Email"
                value={formData.corporate_email}
                onChange={(v) => handleInputChange('corporate_email', v)}
                disabled={!isEditing}
                type="email"
                required
              />
              <FormField
                label="Mobile Phone"
                value={formData.mobile_phone}
                onChange={(v) => handleInputChange('mobile_phone', v)}
                disabled={!isEditing}
                type="tel"
              />
              <FormField
                label="Landline Phone"
                value={formData.landline_phone}
                onChange={(v) => handleInputChange('landline_phone', v)}
                disabled={!isEditing}
                type="tel"
              />
              <FormField
                label="Address"
                value={formData.address}
                onChange={(v) => handleInputChange('address', v)}
                disabled={!isEditing}
                style={{ gridColumn: '1 / -1' }}
              />
              <FormField
                label="City"
                value={formData.city}
                onChange={(v) => handleInputChange('city', v)}
                disabled={!isEditing}
              />
              <FormField
                label="State"
                value={formData.state}
                onChange={(v) => handleInputChange('state', v)}
                disabled={!isEditing}
              />
              <FormField
                label="Website URL"
                value={formData.website_url}
                onChange={(v) => handleInputChange('website_url', v)}
                disabled={!isEditing}
                type="url"
                style={{ gridColumn: '1 / -1' }}
              />
            </div>
          </motion.div>

          {/* Business Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            style={{
              padding: '32px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
              border: '1.5px solid rgba(0, 119, 181, 0.15)',
              boxShadow: '0 8px 24px rgba(0, 119, 181, 0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: 'linear-gradient(180deg, #0077b5 0%, #00a0dc 100%)',
                borderRadius: '0 4px 4px 0',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', paddingLeft: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.15) 0%, rgba(0, 160, 220, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid rgba(0, 119, 181, 0.2)',
                boxShadow: '0 4px 12px rgba(0, 119, 181, 0.1)',
              }}>
                <Briefcase size={24} style={{ color: '#0077b5' }} />
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                color: 'var(--text-primary)', 
                margin: 0,
                fontFamily: 'var(--font-poppins), sans-serif',
                background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Business Information
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <FormField
                label="Industry Sector"
                value={formData.industry_sector}
                onChange={(v) => handleInputChange('industry_sector', v)}
                disabled={!isEditing}
              />
              <FormField
                label="Company Size"
                value={formData.company_size}
                onChange={(v) => handleInputChange('company_size', v)}
                disabled={!isEditing}
                placeholder="e.g., 50-100 employees"
              />
              <FormField
                label="Company Description"
                value={formData.company_description}
                onChange={(v) => handleInputChange('company_description', v)}
                disabled={!isEditing}
                type="textarea"
                style={{ gridColumn: '1 / -1' }}
              />
            </div>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            style={{
              padding: '32px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
              border: '1.5px solid rgba(0, 119, 181, 0.15)',
              boxShadow: '0 8px 24px rgba(0, 119, 181, 0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: 'linear-gradient(180deg, #0077b5 0%, #00a0dc 100%)',
                borderRadius: '0 4px 4px 0',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', paddingLeft: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.15) 0%, rgba(0, 160, 220, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid rgba(0, 119, 181, 0.2)',
                boxShadow: '0 4px 12px rgba(0, 119, 181, 0.1)',
              }}>
                <Globe size={24} style={{ color: '#0077b5' }} />
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                color: 'var(--text-primary)', 
                margin: 0,
                fontFamily: 'var(--font-poppins), sans-serif',
                background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Social Media & Online Presence
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <FormField
                label="LinkedIn URL"
                value={formData.linkedin_url}
                onChange={(v) => handleInputChange('linkedin_url', v)}
                disabled={!isEditing}
                type="url"
                icon={<Linkedin size={18} style={{ color: '#0077b5' }} />}
              />
              <FormField
                label="Facebook URL"
                value={formData.facebook_url}
                onChange={(v) => handleInputChange('facebook_url', v)}
                disabled={!isEditing}
                type="url"
                icon={<Facebook size={18} style={{ color: '#1877f2' }} />}
              />
              <FormField
                label="Instagram URL"
                value={formData.instagram_url}
                onChange={(v) => handleInputChange('instagram_url', v)}
                disabled={!isEditing}
                type="url"
                icon={<Instagram size={18} style={{ color: '#e4405f' }} />}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// Reusable Form Field Component
function FormField({
  label,
  value,
  onChange,
  disabled = false,
  type = 'text',
  placeholder,
  required = false,
  icon,
  style,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={style}>
      <label
        style={{
          display: 'block',
          marginBottom: '10px',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-poppins), sans-serif',
        }}
      >
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={5}
          style={{
            width: '100%',
            padding: '14px 18px',
            borderRadius: '14px',
            border: disabled ? '2px solid rgba(0, 0, 0, 0.08)' : '2px solid rgba(0, 119, 181, 0.25)',
            background: disabled ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.9)',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            resize: 'vertical',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'text',
            lineHeight: 1.6,
          }}
          onFocus={(e) => {
            if (!disabled) {
              e.target.style.borderColor = '#0077b5';
              e.target.style.boxShadow = '0 0 0 4px rgba(0, 119, 181, 0.1)';
              e.target.style.background = 'rgba(255, 255, 255, 1)';
            }
          }}
          onBlur={(e) => {
            e.target.style.borderColor = disabled ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 119, 181, 0.25)';
            e.target.style.boxShadow = 'none';
            e.target.style.background = disabled ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.9)';
          }}
        />
      ) : (
        <div style={{ position: 'relative' }}>
          {icon && (
            <div
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              {icon}
            </div>
          )}
          <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            style={{
              width: '100%',
              padding: '14px 18px',
              paddingLeft: icon ? '48px' : '18px',
              borderRadius: '14px',
              border: disabled ? '2px solid rgba(0, 0, 0, 0.08)' : '2px solid rgba(0, 119, 181, 0.25)',
              background: disabled ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.9)',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              outline: 'none',
              cursor: disabled ? 'not-allowed' : 'text',
            }}
            onFocus={(e) => {
              if (!disabled) {
                e.target.style.borderColor = '#0077b5';
                e.target.style.boxShadow = '0 0 0 4px rgba(0, 119, 181, 0.1)';
                e.target.style.background = 'rgba(255, 255, 255, 1)';
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = disabled ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 119, 181, 0.25)';
              e.target.style.boxShadow = 'none';
              e.target.style.background = disabled ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.9)';
            }}
          />
        </div>
      )}
    </div>
  );
}
