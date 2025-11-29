'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NotebookGrid from '@/components/background/NotebookGrid';
import { ArrowLeft, Check, Upload, Building2, Mail, FileText, Briefcase, Home } from 'lucide-react';
import { saveEnterpriseData, fileToBase64, EnterpriseData } from '@/lib/storage';
import { supabase } from '@/lib/supabaseClient';

type FormStep = 'basic' | 'contact' | 'documents' | 'job-posting';

interface EnterpriseFormData {
  // Basic Company Information
  legal_name: string;
  trade_name: string;
  tax_id: string;
  verification_digit: string;
  legal_representative: string;
  company_type: string;
  incorporation_date: string;
  
  // Contact Information
  address: string;
  city: string;
  state: string;
  landline_phone: string;
  mobile_phone: string;
  corporate_email: string;
  website_url: string;
  password: string;
  confirm_password: string;
  
  // Required Documents
  chamber_of_commerce_certificate: File | null;
  rut_document: File | null;
  legal_representative_id: File | null;
  company_logo: File | null;
  
  // Information for Job Posting
  industry_sector: string;
  company_size: string;
  company_description: string;
  linkedin_url: string;
  facebook_url: string;
  instagram_url: string;
}

export default function EnterpriseSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<EnterpriseFormData>({
    legal_name: '',
    trade_name: '',
    tax_id: '',
    verification_digit: '',
    legal_representative: '',
    company_type: '',
    incorporation_date: '',
    address: '',
    city: '',
    state: '',
    landline_phone: '',
    mobile_phone: '',
    corporate_email: '',
    website_url: '',
    password: '',
    confirm_password: '',
    chamber_of_commerce_certificate: null,
    rut_document: null,
    legal_representative_id: null,
    company_logo: null,
    industry_sector: '',
    company_size: '',
    company_description: '',
    linkedin_url: '',
    facebook_url: '',
    instagram_url: '',
  });

  const steps: { key: FormStep; title: string; icon: any }[] = [
    { key: 'basic', title: 'Basic Company Information', icon: Building2 },
    { key: 'contact', title: 'Contact Information', icon: Mail },
    { key: 'documents', title: 'Required Documents', icon: FileText },
    { key: 'job-posting', title: 'Information for Job Posting', icon: Briefcase },
  ];

  const updateFormData = (field: keyof EnterpriseFormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepCompleted = (step: FormStep): boolean => {
    return isStepValid(step);
  };

  const isStepEnabled = (stepIndex: number): boolean => {
    if (stepIndex === 0) return true;
    return isStepCompleted(steps[stepIndex - 1].key);
  };

  const handleSubmit = async () => {
    try {
      // Convert files to base64 for storage
      const enterpriseData: EnterpriseData = {
        legal_name: formData.legal_name,
        trade_name: formData.trade_name,
        tax_id: formData.tax_id,
        verification_digit: formData.verification_digit,
        legal_representative: formData.legal_representative,
        company_type: formData.company_type,
        incorporation_date: formData.incorporation_date,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        landline_phone: formData.landline_phone,
        mobile_phone: formData.mobile_phone,
        corporate_email: formData.corporate_email,
        website_url: formData.website_url,
        chamber_of_commerce_certificate: formData.chamber_of_commerce_certificate 
          ? await fileToBase64(formData.chamber_of_commerce_certificate) 
          : null,
        rut_document: formData.rut_document 
          ? await fileToBase64(formData.rut_document) 
          : null,
        legal_representative_id: formData.legal_representative_id 
          ? await fileToBase64(formData.legal_representative_id) 
          : null,
        company_logo: formData.company_logo 
          ? await fileToBase64(formData.company_logo) 
          : null,
        industry_sector: formData.industry_sector,
        company_size: formData.company_size,
        company_description: formData.company_description,
        linkedin_url: formData.linkedin_url,
        facebook_url: formData.facebook_url,
        instagram_url: formData.instagram_url,
      };

      // Persist in local storage so current dashboard keeps working
      saveEnterpriseData(enterpriseData);
      
      // Also persist in Supabase using the normalized schema
      const { data: company, error: companyError } = await supabase
        .from('company')
        .insert({
          legal_name: formData.legal_name,
          trade_name: formData.trade_name,
          tax_id: formData.tax_id,
          verification_digit: Number(formData.verification_digit || 0),
          legal_representative: formData.legal_representative,
          company_type: formData.company_type,
          incorporation_date: formData.incorporation_date || null,
        })
        .select('id')
        .single();

      if (companyError || !company) {
        console.error('Error creating company in Supabase:', companyError);
      } else {
        const companyId = company.id;

        // Contact info
        const { error: contactError } = await supabase.from('company_contact_info').upsert(
          {
            company_id: companyId,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            landline_phone: formData.landline_phone,
            mobile_phone: formData.mobile_phone,
            corporate_email: formData.corporate_email,
            website_url: formData.website_url,
          },
          { onConflict: 'company_id' },
        );
        if (contactError) {
          console.error('Error saving company_contact_info in Supabase:', contactError);
        }

        // Documents (we store base64 strings as text)
        const { error: docsError } = await supabase.from('company_documents').upsert(
          {
            company_id: companyId,
            chamber_of_commerce_certificate: enterpriseData.chamber_of_commerce_certificate,
            rut_document: enterpriseData.rut_document,
            legal_representative_id: enterpriseData.legal_representative_id,
            company_logo: enterpriseData.company_logo,
          },
          { onConflict: 'company_id' },
        );
        if (docsError) {
          console.error('Error saving company_documents in Supabase:', docsError);
        }

        // Job posting info
        const { error: jobError } = await supabase.from('company_job_posting_info').upsert(
          {
            company_id: companyId,
            industry_sector: formData.industry_sector,
            company_size: formData.company_size,
            company_description: formData.company_description,
            linkedin_url: formData.linkedin_url,
            facebook_url: formData.facebook_url,
            instagram_url: formData.instagram_url,
          },
          { onConflict: 'company_id' },
        );
        if (jobError) {
          console.error('Error saving company_job_posting_info in Supabase:', jobError);
        }
      }
      
      // Validate password match
      if (formData.password !== formData.confirm_password) {
        alert('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }

      // Create Supabase auth user (enterprise)
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.corporate_email,
        password: formData.password,
        options: {
          data: {
            type: 'enterprise',
          },
        },
      });

      if (signUpError) {
        console.error('Error creating Supabase user:', signUpError);
        alert('Error creating account. Please try again.');
        return;
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    }
  };

  const isStepValid = (step: FormStep): boolean => {
    switch (step) {
      case 'basic':
        return !!(
          formData.legal_name &&
          formData.trade_name &&
          formData.tax_id &&
          formData.verification_digit &&
          formData.legal_representative &&
          formData.company_type &&
          formData.incorporation_date
        );
      case 'contact':
        return !!(
          formData.address &&
          formData.city &&
          formData.state &&
          formData.landline_phone &&
          formData.mobile_phone &&
          formData.corporate_email &&
          formData.website_url &&
          formData.password &&
          formData.confirm_password &&
          formData.password === formData.confirm_password
        );
      case 'documents':
        return !!(
          formData.chamber_of_commerce_certificate &&
          formData.rut_document &&
          formData.legal_representative_id &&
          formData.company_logo
        );
      case 'job-posting':
        return !!(
          formData.industry_sector &&
          formData.company_size &&
          formData.company_description
        );
      default:
        return false;
    }
  };

  const getStepIcon = (step: FormStep) => {
    const stepData = steps.find(s => s.key === step);
    return stepData ? stepData.icon : Building2;
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <NotebookGrid />
      
      
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 16px',
          perspective: '1000px',
        }}
        className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12"
      >
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: 0.7,
            z: -200,
            filter: 'blur(10px)'
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            z: 0,
            filter: 'blur(0px)'
          }}
          transition={{ 
            duration: 1.2, 
            delay: 0.3, 
            ease: [0.16, 1, 0.3, 1]
          }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1600px',
            margin: '0 auto',
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            style={{
              borderRadius: '24px',
              backdropFilter: 'blur(22px) saturate(170%)',
              WebkitBackdropFilter: 'blur(22px) saturate(170%)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 14px 50px 0 rgba(15, 23, 42, 0.25)',
              padding: '28px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.5,
                pointerEvents: 'none',
                background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%)',
              }}
            />

            <div style={{ position: 'relative', zIndex: 10 }}>
              {/* Header with Logo and Back Button */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  paddingBottom: '14px',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.35)',
                }}
              >
                {/* WorkyAI Logo - Left */}
                <Link href="/" passHref>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    style={{ cursor: 'pointer' }}
                  >
                    <h1
                      className="text-xl sm:text-2xl md:text-3xl font-bold leading-none"
                      style={{ fontFamily: 'var(--font-cursive), cursive' }}
                    >
                      <span className="block theme-text-primary mb-0.5">
                        Worky
                      </span>
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

                {/* Back to login - Right */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/login')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1.5px solid #9ca3af',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                    e.currentTarget.style.borderColor = '#0077b5';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 119, 181, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
                    e.currentTarget.style.borderColor = '#9ca3af';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <ArrowLeft size={16} style={{ color: '#0077b5' }} />
                  <span>Back to login</span>
                </motion.button>
              </div>

              {/* Title + description row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ maxWidth: '520px' }}>
                  <p
                    style={{
                      fontSize: '0.8rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#0077b5',
                      marginBottom: '6px',
                    }}
                  >
                    Enterprise onboarding
                  </p>
                  <h2
                    style={{
                      fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    Create your Worky AI company space
                  </h2>
                  <p
                    style={{
                      marginTop: '8px',
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                    }}
                  >
                    Complete the four short steps from left to right. Each card unlocks once the
                    previous one is valid, so you always know what to do next.
                  </p>
                </div>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(0,119,181,0.06)',
                    border: '1px solid rgba(0,119,181,0.25)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    maxWidth: '260px',
                  }}
                >
                  <p style={{ margin: 0 }}>
                    <span style={{ fontWeight: 600, color: '#0077b5' }}>Tip:</span> Use your
                    official corporate email and legal data so offers and applicants stay compliant.
                  </p>
                </div>
              </div>

              {/* Progress Steps - Compact Horizontal with Indicators and Connecting Lines */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                marginBottom: '32px', 
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
              }}>
                {steps.map((step, index) => {
                  const isCompleted = isStepCompleted(step.key);
                  const isEnabled = isStepEnabled(index);
                  const Icon = step.icon;
                  const stepNumber = String(index + 1).padStart(2, '0');
                  const isLast = index === steps.length - 1;
                  // Show connecting line if current step is completed
                  const showConnectingLine = isCompleted && !isLast;

                  return (
                    <div
                      key={step.key}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative',
                        opacity: isEnabled ? 1 : 0.4,
                      }}
                    >
                      {/* Connecting Line */}
                      {!isLast && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '20px',
                            left: '50%',
                            width: '100%',
                            height: '2px',
                            background: showConnectingLine
                              ? 'linear-gradient(to right, #0077b5, #0077b5)'
                              : 'rgba(255, 255, 255, 0.2)',
                            zIndex: 0,
                            transform: 'translateX(20px)',
                            transition: 'all 0.3s',
                          }}
                        />
                      )}
                      
                      {/* Step Indicator */}
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isCompleted
                            ? '#0077b5'
                            : 'rgba(255, 255, 255, 0.1)',
                          border: isCompleted ? '2px solid #0077b5' : '2px solid rgba(255, 255, 255, 0.2)',
                          color: isCompleted ? 'white' : 'var(--text-secondary)',
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        {isCompleted ? (
                          <Check style={{ width: '18px', height: '18px' }} />
                        ) : (
                          <>
                            <span style={{
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              lineHeight: 1,
                              marginBottom: '2px',
                            }}>
                              {stepNumber}
                            </span>
                            <Icon style={{ width: '14px', height: '14px' }} />
                          </>
                        )}
                      </div>
                      
                      {/* Step Title */}
                      <span
                        style={{
                          marginTop: '8px',
                          fontSize: '0.65rem',
                          textAlign: 'center',
                          color: isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontWeight: isCompleted ? 600 : 400,
                          lineHeight: 1.2,
                        }}
                      >
                        {step.title.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* All Forms Horizontal Cascade - Each in Separate Widget */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '16px',
                alignItems: 'stretch',
                height: 'fit-content',
              }}>
                {/* Basic Info Form Widget - Highest Position */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: isStepEnabled(0) ? 1 : 0.5, y: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    marginTop: '0px',
                    borderRadius: '20px',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
                    border: '1.5px solid rgba(0, 119, 181, 0.3)',
                    boxShadow: '0 8px 24px rgba(0, 119, 181, 0.15)',
                    padding: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    pointerEvents: isStepEnabled(0) ? 'auto' : 'none',
                    transform: 'translateY(0px)',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.3,
                    pointerEvents: 'none',
                    background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.1) 0%, transparent 100%)',
                  }} />
                  <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <Building2 size={20} style={{ color: isStepCompleted('basic') ? '#0077b5' : '#9ca3af' }} />
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}>
                        Basic Info
                      </h3>
                    </div>
                    <div style={{ flex: 1 }}>
                      <BasicInfoForm
                        formData={formData}
                        updateFormData={updateFormData}
                        disabled={!isStepEnabled(0)}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Contact Info Form Widget - Second Position */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: isStepEnabled(1) ? 1 : 0.5, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  style={{
                    marginTop: '0px',
                    borderRadius: '20px',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
                    border: '1.5px solid rgba(0, 119, 181, 0.25)',
                    boxShadow: '0 8px 24px rgba(0, 119, 181, 0.12)',
                    padding: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    pointerEvents: isStepEnabled(1) ? 'auto' : 'none',
                    transform: 'translateY(0px)',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.25,
                    pointerEvents: 'none',
                    background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.08) 0%, transparent 100%)',
                  }} />
                  <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <Mail size={20} style={{ color: isStepCompleted('contact') ? '#0077b5' : '#9ca3af' }} />
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}>
                        Contact
                      </h3>
                    </div>
                    <div style={{ flex: 1 }}>
                      <ContactInfoForm
                        formData={formData}
                        updateFormData={updateFormData}
                        disabled={!isStepEnabled(1)}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Documents Form Widget - Third Position */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: isStepEnabled(2) ? 1 : 0.5, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  style={{
                    marginTop: '0px',
                    borderRadius: '20px',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.7) 100%)',
                    border: '1.5px solid rgba(0, 119, 181, 0.2)',
                    boxShadow: '0 8px 24px rgba(0, 119, 181, 0.1)',
                    padding: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    pointerEvents: isStepEnabled(2) ? 'auto' : 'none',
                    transform: 'translateY(0px)',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.2,
                    pointerEvents: 'none',
                    background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.06) 0%, transparent 100%)',
                  }} />
                  <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <FileText size={20} style={{ color: isStepCompleted('documents') ? '#0077b5' : '#9ca3af' }} />
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}>
                        Documents
                      </h3>
                    </div>
                    <div style={{ flex: 1 }}>
                      <DocumentsForm
                        formData={formData}
                        updateFormData={updateFormData}
                        disabled={!isStepEnabled(2)}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Job Posting Form Widget + Submit Button - Lowest Position */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: isStepEnabled(3) ? 1 : 0.5, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  style={{
                    marginTop: '0px',
                    borderRadius: '20px',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.65) 100%)',
                    border: '1.5px solid rgba(0, 119, 181, 0.15)',
                    boxShadow: '0 8px 24px rgba(0, 119, 181, 0.08)',
                    padding: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    pointerEvents: isStepEnabled(3) ? 'auto' : 'none',
                    transform: 'translateY(0px)',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.15,
                    pointerEvents: 'none',
                    background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.04) 0%, transparent 100%)',
                  }} />
                  <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <Briefcase size={20} style={{ color: isStepCompleted('job-posting') ? '#0077b5' : '#9ca3af' }} />
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}>
                        Job Posting
                      </h3>
                    </div>
                    <div style={{ flex: 1 }}>
                      <JobPostingForm
                        formData={formData}
                        updateFormData={updateFormData}
                        disabled={!isStepEnabled(3)}
                      />
                    </div>
                    
                    {/* Submit Button in Last Widget */}
                    <div style={{ 
                      marginTop: 'auto',
                      paddingTop: '20px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.3)',
                    }}>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={!isStepValid('basic') || !isStepValid('contact') || !isStepValid('documents') || !isStepValid('job-posting')}
                        style={{
                          width: '100%',
                          padding: '14px 24px',
                          borderRadius: '12px',
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          color: 'white',
                          background: (isStepValid('basic') && isStepValid('contact') && isStepValid('documents') && isStepValid('job-posting')) 
                            ? '#0077b5' 
                            : 'rgba(0, 119, 181, 0.5)',
                          border: 'none',
                          cursor: (isStepValid('basic') && isStepValid('contact') && isStepValid('documents') && isStepValid('job-posting')) 
                            ? 'pointer' 
                            : 'not-allowed',
                          boxShadow: '0 4px 12px rgba(0, 119, 181, 0.3)',
                          transition: 'all 0.3s',
                        }}
                        onMouseEnter={(e) => {
                          if (isStepValid('basic') && isStepValid('contact') && isStepValid('documents') && isStepValid('job-posting')) {
                            e.currentTarget.style.background = '#005885';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (isStepValid('basic') && isStepValid('contact') && isStepValid('documents') && isStepValid('job-posting')) {
                            e.currentTarget.style.background = '#0077b5';
                          }
                        }}
                      >
                        Submit Registration
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}

// Basic Company Information Form
function BasicInfoForm({
  formData,
  updateFormData,
  disabled = false,
}: {
  formData: EnterpriseFormData;
  updateFormData: (field: keyof EnterpriseFormData, value: string | File | null) => void;
  disabled?: boolean;
}) {
  return (
    <div
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px',
        transformStyle: 'preserve-3d',
      }}
    >
      <FormField
        label="Legal Name"
        value={formData.legal_name}
        onChange={(e) => updateFormData('legal_name', e.target.value)}
        placeholder="Legal name according to Chamber of Commerce"
        required
        disabled={disabled}
      />
      <FormField
        label="Trade Name"
        value={formData.trade_name}
        onChange={(e) => updateFormData('trade_name', e.target.value)}
        placeholder="Business or brand name"
        required
        disabled={disabled}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
        <FormField
          label="Tax ID (NIT)"
          value={formData.tax_id}
          onChange={(e) => updateFormData('tax_id', e.target.value)}
          placeholder="NIT number"
          required
          disabled={disabled}
        />
        <FormField
          label="Verification Digit"
          value={formData.verification_digit}
          onChange={(e) => updateFormData('verification_digit', e.target.value)}
          placeholder="Digit"
          type="number"
          required
          disabled={disabled}
        />
      </div>
      <FormField
        label="Legal Representative"
        value={formData.legal_representative}
        onChange={(e) => updateFormData('legal_representative', e.target.value)}
        placeholder="Full name of the legal representative"
        required
        disabled={disabled}
      />
      <FormField
        label="Company Type"
        value={formData.company_type}
        onChange={(e) => updateFormData('company_type', e.target.value)}
        placeholder="S.A.S., LTDA, S.A., etc."
        required
        disabled={disabled}
      />
      <FormField
        label="Incorporation Date"
        value={formData.incorporation_date}
        onChange={(e) => updateFormData('incorporation_date', e.target.value)}
        type="date"
        required
        disabled={disabled}
      />
    </div>
  );
}

// Contact Information Form
function ContactInfoForm({
  formData,
  updateFormData,
  disabled = false,
}: {
  formData: EnterpriseFormData;
  updateFormData: (field: keyof EnterpriseFormData, value: string | File | null) => void;
  disabled?: boolean;
}) {
  return (
    <div
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px',
        transformStyle: 'preserve-3d',
      }}
    >
      <FormField
        label="Address"
        value={formData.address}
        onChange={(e) => updateFormData('address', e.target.value)}
        placeholder="Registered physical address"
        required
        disabled={disabled}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <FormField
          label="City"
          value={formData.city}
          onChange={(e) => updateFormData('city', e.target.value)}
          placeholder="City"
          required
          disabled={disabled}
        />
        <FormField
          label="State/Department"
          value={formData.state}
          onChange={(e) => updateFormData('state', e.target.value)}
          placeholder="Department"
          required
          disabled={disabled}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <FormField
          label="Landline Phone"
          value={formData.landline_phone}
          onChange={(e) => updateFormData('landline_phone', e.target.value)}
          placeholder="Official landline number"
          type="tel"
          required
          disabled={disabled}
        />
        <FormField
          label="Mobile Phone"
          value={formData.mobile_phone}
          onChange={(e) => updateFormData('mobile_phone', e.target.value)}
          placeholder="Mobile contact number"
          type="tel"
          required
          disabled={disabled}
        />
      </div>
      <FormField
        label="Corporate Email"
        value={formData.corporate_email}
        onChange={(e) => updateFormData('corporate_email', e.target.value)}
        placeholder="Main corporate email"
        type="email"
        required
        disabled={disabled}
      />
      <FormField
        label="Website URL"
        value={formData.website_url}
        onChange={(e) => updateFormData('website_url', e.target.value)}
        placeholder="Company's website URL"
        type="url"
        required
        disabled={disabled}
      />
      <FormField
        label="Password"
        value={formData.password}
        onChange={(e) => updateFormData('password', e.target.value)}
        placeholder="Create a password (min. 6 characters)"
        type="password"
        required
        disabled={disabled}
      />
      <FormField
        label="Confirm Password"
        value={formData.confirm_password}
        onChange={(e) => updateFormData('confirm_password', e.target.value)}
        placeholder="Confirm your password"
        type="password"
        required
        disabled={disabled}
      />
    </div>
  );
}

// Required Documents Form
function DocumentsForm({
  formData,
  updateFormData,
  disabled = false,
}: {
  formData: EnterpriseFormData;
  updateFormData: (field: keyof EnterpriseFormData, value: string | File | null) => void;
  disabled?: boolean;
}) {
  const handleFileChange = (field: 'chamber_of_commerce_certificate' | 'rut_document' | 'legal_representative_id' | 'company_logo', file: File | null) => {
    if (!disabled) {
      updateFormData(field, file);
    }
  };

  return (
    <div
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px',
        transformStyle: 'preserve-3d',
      }}
    >
      <FileUploadField
        label="Chamber of Commerce Certificate"
        description="Certificate issued within the last 30 days (PDF)"
        file={formData.chamber_of_commerce_certificate}
        onChange={(file) => handleFileChange('chamber_of_commerce_certificate', file)}
        accept=".pdf"
        required
        disabled={disabled}
      />
      <FileUploadField
        label="RUT Document"
        description="Updated RUT tax document (PDF)"
        file={formData.rut_document}
        onChange={(file) => handleFileChange('rut_document', file)}
        accept=".pdf"
        required
        disabled={disabled}
      />
      <FileUploadField
        label="Legal Representative ID"
        description="ID document of the legal representative (PDF/Image)"
        file={formData.legal_representative_id}
        onChange={(file) => handleFileChange('legal_representative_id', file)}
        accept=".pdf,.jpg,.jpeg,.png"
        required
        disabled={disabled}
      />
      <FileUploadField
        label="Company Logo"
        description="Company logo for display (Image)"
        file={formData.company_logo}
        onChange={(file) => handleFileChange('company_logo', file)}
        accept=".jpg,.jpeg,.png,.svg"
        required
        disabled={disabled}
      />
    </div>
  );
}

// Information for Job Posting Form
function JobPostingForm({
  formData,
  updateFormData,
  disabled = false,
}: {
  formData: EnterpriseFormData;
  updateFormData: (field: keyof EnterpriseFormData, value: string | File | null) => void;
  disabled?: boolean;
}) {
  return (
    <div
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px',
        transformStyle: 'preserve-3d',
      }}
    >
      <FormField
        label="Industry Sector"
        value={formData.industry_sector}
        onChange={(e) => updateFormData('industry_sector', e.target.value)}
        placeholder="Industry or economic sector"
        required
        disabled={disabled}
      />
      <FormField
        label="Company Size"
        value={formData.company_size}
        onChange={(e) => updateFormData('company_size', e.target.value)}
        placeholder="Number of employees or size category"
        required
        disabled={disabled}
      />
      <FormField
        label="Company Description"
        value={formData.company_description}
        onChange={(e) => updateFormData('company_description', e.target.value)}
        placeholder="Company description for candidates"
        type="textarea"
        required
        disabled={disabled}
      />
      <FormField
        label="LinkedIn URL"
        value={formData.linkedin_url}
        onChange={(e) => updateFormData('linkedin_url', e.target.value)}
        placeholder="LinkedIn profile URL"
        type="url"
        disabled={disabled}
      />
      <FormField
        label="Facebook URL"
        value={formData.facebook_url}
        onChange={(e) => updateFormData('facebook_url', e.target.value)}
        placeholder="Facebook page URL"
        type="url"
        disabled={disabled}
      />
      <FormField
        label="Instagram URL"
        value={formData.instagram_url}
        onChange={(e) => updateFormData('instagram_url', e.target.value)}
        placeholder="Instagram page URL"
        type="url"
        disabled={disabled}
      />
    </div>
  );
}

// Reusable Form Field Component
function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}
      >
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={2}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: '10px',
            border: '1.5px solid #9ca3af',
            background: disabled ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.05)',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
            fontFamily: 'inherit',
            resize: 'vertical',
            transition: 'all 0.3s',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'text',
          }}
          onFocus={(e) => {
            if (!disabled) {
              e.target.style.borderColor = '#0077b5';
              e.target.style.background = 'rgba(0, 0, 0, 0.08)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 119, 181, 0.1)';
            }
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#9ca3af';
            e.target.style.background = disabled ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.05)';
            e.target.style.boxShadow = 'none';
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
      style={{
        width: '100%',
        padding: '8px 10px',
        borderRadius: '10px',
        border: '1.5px solid #9ca3af',
        background: disabled ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.05)',
        color: 'var(--text-primary)',
        fontSize: '0.8rem',
        fontFamily: 'inherit',
        transition: 'all 0.3s',
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'text',
      }}
          onFocus={(e) => {
            if (!disabled) {
              e.target.style.borderColor = '#0077b5';
              e.target.style.background = 'rgba(0, 0, 0, 0.08)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 119, 181, 0.1)';
            }
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#9ca3af';
            e.target.style.background = disabled ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.05)';
            e.target.style.boxShadow = 'none';
          }}
        />
      )}
    </div>
  );
}

// File Upload Field Component
function FileUploadField({
  label,
  description,
  file,
  onChange,
  accept,
  required = false,
  disabled = false,
}: {
  label: string;
  description: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    } else {
      onChange(null);
    }
  };

  return (
    <div>
      <label
        style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}
      >
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
      </label>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        id={`file-${label}`}
        disabled={disabled}
        style={{ display: 'none' }}
      />
      <label
        htmlFor={`file-${label}`}
        style={{
          display: 'block',
          padding: '12px',
          borderRadius: '10px',
          background: disabled ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.05)',
          border: '2px dashed #9ca3af',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s',
          textAlign: 'center',
          opacity: disabled ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)';
            e.currentTarget.style.borderColor = '#0077b5';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 119, 181, 0.1)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = disabled ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.05)';
          e.currentTarget.style.borderColor = '#9ca3af';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Upload style={{ width: '24px', height: '24px', color: '#0077b5', margin: '0 auto 8px' }} />
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
          {file ? file.name : 'Click to upload'}
        </p>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{description}</p>
      </label>
    </div>
  );
}

