'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Lottie from 'lottie-react';
import NotebookGrid from '@/components/background/NotebookGrid';
import LanguageToggle from '@/components/layout/LanguageToggle';
import { ArrowLeft, Check, Upload, Building2, Mail, FileText, Briefcase, UserPlus, Lock, ChevronRight, ChevronLeft } from 'lucide-react';
import { saveEnterpriseData, fileToBase64, EnterpriseData } from '@/lib/storage';
import { supabase } from '@/lib/supabaseClient';
import { useNotifications } from '@/contexts/NotificationContext';

type FormStep = 'basic' | 'contact' | 'documents' | 'job-posting' | 'register';

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
  const { showError, showSuccess } = useNotifications();
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

  const [heroLottieData, setHeroLottieData] = useState<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    fetch('/enterprise.json')
      .then(res => res.json())
      .then(data => {
        if (data.v && data.fr && data.w && data.h) {
          setHeroLottieData(data);
        }
      })
      .catch(() => {});
  }, []);

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1 && isStepValid(steps[currentStepIndex].key)) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const steps: { key: FormStep; title: string; icon: any }[] = [
    { key: 'basic', title: 'Basic Company Information', icon: Building2 },
    { key: 'contact', title: 'Contact Information', icon: Mail },
    { key: 'documents', title: 'Required Documents', icon: FileText },
    { key: 'job-posting', title: 'Information for Job Posting', icon: Briefcase },
    { key: 'register', title: 'Create Account', icon: Lock },
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
      // Validate password match
      if (formData.password !== formData.confirm_password) {
        showError('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
      }

      // Step 1: Create Supabase auth user first
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.corporate_email,
        password: formData.password,
        options: {
          data: {
            type: 'enterprise',
          },
        },
      });

      if (signUpError || !authData.user) {
        console.error('Error creating Supabase user:', signUpError);
        showError(`Error creating account: ${signUpError?.message || 'Unknown error'}`);
        return;
      }

      // Step 2: Create company record in database
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
        showError(`Error creating company: ${companyError?.message || 'Unknown error'}. Please contact support.`);
        return;
      }

      const companyId = company.id;

      // Step 3: Create contact info
      const { error: contactError } = await supabase.from('company_contact_info').insert({
        company_id: companyId,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        landline_phone: formData.landline_phone,
        mobile_phone: formData.mobile_phone,
        corporate_email: formData.corporate_email,
        website_url: formData.website_url,
      });

      if (contactError) {
        console.error('Error saving company_contact_info in Supabase:', contactError);
        showError(`Error saving contact information: ${contactError.message}`);
        return;
      }

      // Step 4: Convert files to base64 and save documents
      const chamberCert = formData.chamber_of_commerce_certificate 
        ? await fileToBase64(formData.chamber_of_commerce_certificate) 
        : null;
      const rutDoc = formData.rut_document 
        ? await fileToBase64(formData.rut_document) 
        : null;
      const legalRepId = formData.legal_representative_id 
        ? await fileToBase64(formData.legal_representative_id) 
        : null;
      const companyLogo = formData.company_logo 
        ? await fileToBase64(formData.company_logo) 
        : null;

      const { error: docsError } = await supabase.from('company_documents').insert({
        company_id: companyId,
        chamber_of_commerce_certificate: chamberCert,
        rut_document: rutDoc,
        legal_representative_id: legalRepId,
        company_logo: companyLogo,
      });

      if (docsError) {
        console.error('Error saving company_documents in Supabase:', docsError);
        showError(`Error saving documents: ${docsError.message}`);
        return;
      }

      // Step 5: Save job posting info
      const { error: jobError } = await supabase.from('company_job_posting_info').insert({
        company_id: companyId,
        industry_sector: formData.industry_sector,
        company_size: formData.company_size,
        company_description: formData.company_description,
        linkedin_url: formData.linkedin_url || null,
        facebook_url: formData.facebook_url || null,
        instagram_url: formData.instagram_url || null,
      });

      if (jobError) {
        console.error('Error saving company_job_posting_info in Supabase:', jobError);
        showError(`Error saving job posting information: ${jobError.message}`);
        return;
      }

      // Step 6: Update user metadata with company_id
      await supabase.auth.updateUser({
        data: {
          type: 'enterprise',
          company_id: companyId,
        },
      });

      // Step 7: Build enterprise data object for local storage
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
        chamber_of_commerce_certificate: chamberCert,
        rut_document: rutDoc,
        legal_representative_id: legalRepId,
        company_logo: companyLogo,
        industry_sector: formData.industry_sector,
        company_size: formData.company_size,
        company_description: formData.company_description,
        linkedin_url: formData.linkedin_url,
        facebook_url: formData.facebook_url,
        instagram_url: formData.instagram_url,
      };

      // Save to local storage for immediate access
      saveEnterpriseData(enterpriseData);

      // Success! Redirect to dashboard
      showSuccess('Account created successfully! Redirecting to dashboard...');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error submitting form:', error);
      showError(`Error submitting form: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          formData.website_url
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
      case 'register':
        return !!(
          formData.password &&
          formData.confirm_password &&
          formData.password === formData.confirm_password &&
          formData.password.length >= 6
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

      {/* Top-left: Worky AI Logo */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
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
            whileTap={{ scale: 0.9 }}
            style={{
              cursor: 'pointer',
            }}
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

      {/* Top-right: Back to Login Button */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'fixed',
          top: 'clamp(20px, 3vw, 32px)',
          right: 'clamp(20px, 3vw, 32px)',
          zIndex: 1000,
        }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/login')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: 'clamp(12px, 2vw, 20px) clamp(16px, 3vw, 32px)',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: 'clamp(0.875rem, 2vw, 1rem)',
            fontWeight: 600,
            transition: 'all 0.3s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          }}
        >
          <ArrowLeft size={20} style={{ color: '#0077b5' }} />
          <span>Back to login</span>
        </motion.button>
      </motion.div>
      
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
          initial={{ opacity: 0, scale: 0.9, z: -200, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, z: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            transformStyle: 'preserve-3d',
          }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch"
        >
          {/* Left Side: Text and SVG */}
          <motion.div
            initial={{ opacity: 0, x: -60, filter: 'blur(12px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              borderRadius: '28px',
              backdropFilter: 'blur(24px) saturate(170%)',
              WebkitBackdropFilter: 'blur(24px) saturate(170%)',
              background: 'linear-gradient(165deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 16px 60px rgba(0, 0, 0, 0.08)',
              padding: '32px',
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at top left, rgba(0,119,181,0.2), transparent 55%)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative', zIndex: 5, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '18px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '16px',
                    background: 'rgba(0,119,181,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(0,119,181,0.2)',
                  }}
                >
                  <Building2 size={24} color="#0077b5" />
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: '#0077b5' }}>ENTERPRISE ONBOARDING</p>
                  <h2
                    style={{
                      fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                      fontWeight: 700,
                      margin: 0,
                      color: 'var(--text-primary)',
                    }}
                  >
                    Create your Worky AI company space
                  </h2>
                </div>
              </div>

              <p
                style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '24px',
                  maxWidth: '440px',
                }}
              >
                Complete each step to unlock the next. Each section guides you through the registration process with clear validation.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  {
                    icon: <Building2 size={18} color="#0077b5" />,
                    title: 'Company information',
                    text: 'Legal details and corporate structure.',
                  },
                  {
                    icon: <Mail size={18} color="#00a0dc" />,
                    title: 'Contact & credentials',
                    text: 'Corporate email and account setup.',
                  },
                  {
                    icon: <FileText size={18} color="#005885" />,
                    title: 'Documentation',
                    text: 'Required certificates and compliance files.',
                  },
                ].map(item => (
                  <div
                    key={item.title}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.5)',
                      border: '1px solid rgba(0, 119, 181, 0.1)',
                    }}
                  >
                    <div style={{ flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.title}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lottie Animation */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                {heroLottieData ? (
                  <Lottie
                    animationData={heroLottieData}
                    loop
                    autoplay
                    style={{ width: '100%', maxWidth: '320px' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      borderRadius: '24px',
                      background: 'rgba(0,119,181,0.08)',
                      border: '1px dashed rgba(0,119,181,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Building2 size={48} color="#0077b5" style={{ opacity: 0.3 }} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Side: Form Steps */}
          <motion.div
            initial={{ opacity: 0, x: 60, filter: 'blur(12px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              borderRadius: '28px',
              backdropFilter: 'blur(24px) saturate(170%)',
              WebkitBackdropFilter: 'blur(24px) saturate(170%)',
              background: 'linear-gradient(165deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 16px 60px rgba(0, 0, 0, 0.08)',
              padding: '32px',
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at top right, rgba(0,119,181,0.2), transparent 55%)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative', zIndex: 5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Progress Steps - Compact Horizontal */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    marginBottom: '16px', 
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
                          {!isLast && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '18px',
                                left: '50%',
                                width: '100%',
                                height: '1px',
                                background: showConnectingLine
                                  ? 'linear-gradient(to right, #0077b5, #0077b5)'
                                  : 'rgba(255, 255, 255, 0.2)',
                                zIndex: 0,
                                transform: 'translateX(18px)',
                                transition: 'all 0.3s',
                              }}
                            />
                          )}
                          
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
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
                              <Check style={{ width: '16px', height: '16px' }} />
                            ) : (
                              <>
                                <span style={{
                                  fontSize: '0.55rem',
                                  fontWeight: 700,
                                  lineHeight: 1,
                                  marginBottom: '2px',
                                }}>
                                  {stepNumber}
                                </span>
                                <Icon style={{ width: '12px', height: '12px' }} />
                              </>
                            )}
                          </div>
                          
                          <span
                            style={{
                              marginTop: '6px',
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

                  {/* Single Form Container - Shows one step at a time */}
                  <div style={{
                    position: 'relative',
                    minHeight: '400px',
                  }}>
                    <AnimatePresence mode="wait">
                      {steps.map((step, index) => {
                        if (index !== currentStepIndex) return null;
                        
                        const Icon = step.icon;
                        const isCurrentStep = index === currentStepIndex;
                        const isEnabled = isStepEnabled(index);
                        const isCompleted = isStepCompleted(step.key);
                        const isLast = index === steps.length - 1;

                        return (
                          <motion.div
                            key={step.key}
                            initial={{ opacity: 0, x: 40, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -40, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                              borderRadius: '20px',
                              backdropFilter: 'blur(20px) saturate(180%)',
                              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
                              border: '1.5px solid rgba(0, 119, 181, 0.3)',
                              boxShadow: '0 8px 24px rgba(0, 119, 181, 0.15)',
                              padding: '28px',
                              position: 'relative',
                              overflow: 'hidden',
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
                              {/* Step Header */}
                              <div style={{
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                              }}>
                                <div style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '16px',
                                  background: isCompleted ? 'rgba(0,119,181,0.12)' : 'rgba(0,119,181,0.08)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: `1.5px solid ${isCompleted ? '#0077b5' : 'rgba(0,119,181,0.2)'}`,
                                }}>
                                  <Icon size={24} style={{ color: isCompleted ? '#0077b5' : '#9ca3af' }} />
                                </div>
                                <div>
                                  <p style={{
                                    fontSize: '0.75rem',
                                    letterSpacing: '0.1em',
                                    color: '#0077b5',
                                    margin: 0,
                                    marginBottom: '4px',
                                  }}>
                                    STEP {String(index + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
                                  </p>
                                  <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: 'var(--text-primary)',
                                    margin: 0,
                                  }}>
                                    {step.title}
                                  </h3>
                                </div>
                              </div>

                              {/* Form Content */}
                              <div style={{ flex: 1, marginBottom: '24px' }}>
                                {step.key === 'basic' && (
                                  <BasicInfoForm
                                    formData={formData}
                                    updateFormData={updateFormData}
                                    disabled={!isEnabled}
                                  />
                                )}
                                {step.key === 'contact' && (
                                  <ContactInfoForm
                                    formData={formData}
                                    updateFormData={updateFormData}
                                    disabled={!isEnabled}
                                  />
                                )}
                                {step.key === 'documents' && (
                                  <DocumentsForm
                                    formData={formData}
                                    updateFormData={updateFormData}
                                    disabled={!isEnabled}
                                  />
                                )}
                                {step.key === 'job-posting' && (
                                  <JobPostingForm
                                    formData={formData}
                                    updateFormData={updateFormData}
                                    disabled={!isEnabled}
                                  />
                                )}
                                {step.key === 'register' && (
                                  <RegistrationForm
                                    formData={formData}
                                    updateFormData={updateFormData}
                                    disabled={!isEnabled}
                                  />
                                )}
                              </div>

                              {/* Navigation Buttons */}
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '12px',
                                paddingTop: '20px',
                                borderTop: '1px solid rgba(255, 255, 255, 0.3)',
                              }}>
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={goToPreviousStep}
                                  disabled={currentStepIndex === 0}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 20px',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    color: currentStepIndex === 0 ? '#9ca3af' : 'var(--text-primary)',
                                    background: currentStepIndex === 0 ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.8)',
                                    border: '1.5px solid rgba(0, 119, 181, 0.2)',
                                    cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s',
                                  }}
                                >
                                  <ChevronLeft size={18} />
                                  Previous
                                </motion.button>

                                {isLast ? (
                                  <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSubmit}
                                    disabled={!isStepValid('basic') || !isStepValid('contact') || !isStepValid('documents') || !isStepValid('job-posting') || !isStepValid('register')}
                                    style={{
                                      flex: 1,
                                      padding: '14px 28px',
                                      borderRadius: '12px',
                                      fontWeight: 600,
                                      fontSize: '0.95rem',
                                      color: 'white',
                                      background: (isStepValid('basic') && isStepValid('contact') && isStepValid('documents') && isStepValid('job-posting') && isStepValid('register')) 
                                        ? '#0077b5' 
                                        : 'rgba(0, 119, 181, 0.5)',
                                      border: 'none',
                                      cursor: (isStepValid('basic') && isStepValid('contact') && isStepValid('documents') && isStepValid('job-posting') && isStepValid('register')) 
                                        ? 'pointer' 
                                        : 'not-allowed',
                                      boxShadow: '0 4px 12px rgba(0, 119, 181, 0.3)',
                                      transition: 'all 0.3s',
                                    }}
                                  >
                                    Create Account & Register
                                  </motion.button>
                                ) : (
                                  <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={goToNextStep}
                                    disabled={!isStepValid(step.key)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '12px 24px',
                                      borderRadius: '12px',
                                      fontWeight: 600,
                                      fontSize: '0.9rem',
                                      color: 'white',
                                      background: isStepValid(step.key) ? '#0077b5' : 'rgba(0, 119, 181, 0.5)',
                                      border: 'none',
                                      cursor: isStepValid(step.key) ? 'pointer' : 'not-allowed',
                                      boxShadow: isStepValid(step.key) ? '0 4px 12px rgba(0, 119, 181, 0.3)' : 'none',
                                      transition: 'all 0.3s',
                                    }}
                                  >
                                    Next
                                    <ChevronRight size={18} />
                                  </motion.button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Language Toggle */}
      <LanguageToggle />
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
      }}
    >
      <FormField
        label="Legal Name"
        value={formData.legal_name}
        onChange={(e) => updateFormData('legal_name', e.target.value)}
        placeholder="Legal name"
        required
        disabled={disabled}
      />
      <FormField
        label="Trade Name"
        value={formData.trade_name}
        onChange={(e) => updateFormData('trade_name', e.target.value)}
        placeholder="Business name"
        required
        disabled={disabled}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
        <FormField
          label="Tax ID"
          value={formData.tax_id}
          onChange={(e) => updateFormData('tax_id', e.target.value)}
          placeholder="NIT"
          required
          disabled={disabled}
        />
        <FormField
          label="Verification"
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
        placeholder="Full name"
        required
        disabled={disabled}
      />
      <FormField
        label="Company Type"
        value={formData.company_type}
        onChange={(e) => updateFormData('company_type', e.target.value)}
        placeholder="S.A.S., LTDA, etc."
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

// Contact Information Form (without password fields)
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
      }}
    >
      <FormField
        label="Address"
        value={formData.address}
        onChange={(e) => updateFormData('address', e.target.value)}
        placeholder="Physical address"
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
          label="State"
          value={formData.state}
          onChange={(e) => updateFormData('state', e.target.value)}
          placeholder="Department"
          required
          disabled={disabled}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <FormField
          label="Landline"
          value={formData.landline_phone}
          onChange={(e) => updateFormData('landline_phone', e.target.value)}
          placeholder="Landline"
          type="tel"
          required
          disabled={disabled}
        />
        <FormField
          label="Mobile"
          value={formData.mobile_phone}
          onChange={(e) => updateFormData('mobile_phone', e.target.value)}
          placeholder="Mobile"
          type="tel"
          required
          disabled={disabled}
        />
      </div>
      <FormField
        label="Corporate Email"
        value={formData.corporate_email}
        onChange={(e) => updateFormData('corporate_email', e.target.value)}
        placeholder="email@company.com"
        type="email"
        required
        disabled={disabled}
      />
      <FormField
        label="Website"
        value={formData.website_url}
        onChange={(e) => updateFormData('website_url', e.target.value)}
        placeholder="https://company.com"
        type="url"
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
      }}
    >
      <FileUploadField
        label="Chamber Certificate"
        description="PDF (last 30 days)"
        file={formData.chamber_of_commerce_certificate}
        onChange={(file) => handleFileChange('chamber_of_commerce_certificate', file)}
        accept=".pdf"
        required
        disabled={disabled}
      />
      <FileUploadField
        label="RUT Document"
        description="Updated RUT (PDF)"
        file={formData.rut_document}
        onChange={(file) => handleFileChange('rut_document', file)}
        accept=".pdf"
        required
        disabled={disabled}
      />
      <FileUploadField
        label="Legal Rep ID"
        description="ID document (PDF/Image)"
        file={formData.legal_representative_id}
        onChange={(file) => handleFileChange('legal_representative_id', file)}
        accept=".pdf,.jpg,.jpeg,.png"
        required
        disabled={disabled}
      />
      <FileUploadField
        label="Company Logo"
        description="Logo (Image)"
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
      }}
    >
      <FormField
        label="Industry Sector"
        value={formData.industry_sector}
        onChange={(e) => updateFormData('industry_sector', e.target.value)}
        placeholder="Industry"
        required
        disabled={disabled}
      />
      <FormField
        label="Company Size"
        value={formData.company_size}
        onChange={(e) => updateFormData('company_size', e.target.value)}
        placeholder="Employees"
        required
        disabled={disabled}
      />
      <FormField
        label="Description"
        value={formData.company_description}
        onChange={(e) => updateFormData('company_description', e.target.value)}
        placeholder="Company description"
        type="textarea"
        required
        disabled={disabled}
      />
      <FormField
        label="LinkedIn"
        value={formData.linkedin_url}
        onChange={(e) => updateFormData('linkedin_url', e.target.value)}
        placeholder="LinkedIn URL"
        type="url"
        disabled={disabled}
      />
      <FormField
        label="Facebook"
        value={formData.facebook_url}
        onChange={(e) => updateFormData('facebook_url', e.target.value)}
        placeholder="Facebook URL"
        type="url"
        disabled={disabled}
      />
      <FormField
        label="Instagram"
        value={formData.instagram_url}
        onChange={(e) => updateFormData('instagram_url', e.target.value)}
        placeholder="Instagram URL"
        type="url"
        disabled={disabled}
      />
    </div>
  );
}

// Registration Form - Final Step with Account Creation
function RegistrationForm({
  formData,
  updateFormData,
  disabled = false,
}: {
  formData: EnterpriseFormData;
  updateFormData: (field: keyof EnterpriseFormData, value: string | File | null) => void;
  disabled?: boolean;
}) {
  const allStepsValid = 
    formData.legal_name &&
    formData.trade_name &&
    formData.corporate_email &&
    formData.industry_sector &&
    formData.chamber_of_commerce_certificate;

  return (
    <div
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
      }}
    >
      {/* Summary Section */}
      {allStepsValid && (
        <div
          style={{
            padding: '12px',
            borderRadius: '12px',
            background: 'rgba(0, 119, 181, 0.06)',
            border: '1px solid rgba(0, 119, 181, 0.2)',
            marginBottom: '8px',
          }}
        >
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0077b5', marginBottom: '8px' }}>
            Registration Summary
          </p>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <p style={{ margin: '4px 0' }}><strong>Company:</strong> {formData.trade_name}</p>
            <p style={{ margin: '4px 0' }}><strong>Email:</strong> {formData.corporate_email}</p>
            <p style={{ margin: '4px 0' }}><strong>Industry:</strong> {formData.industry_sector}</p>
          </div>
        </div>
      )}

      <FormField
        label="Password"
        value={formData.password}
        onChange={(e) => updateFormData('password', e.target.value)}
        placeholder="Min. 6 characters"
        type="password"
        required
        disabled={disabled}
      />
      <FormField
        label="Confirm Password"
        value={formData.confirm_password}
        onChange={(e) => updateFormData('confirm_password', e.target.value)}
        placeholder="Confirm password"
        type="password"
        required
        disabled={disabled}
      />
      
      {formData.password && formData.confirm_password && formData.password !== formData.confirm_password && (
        <p style={{ fontSize: '0.7rem', color: '#ef4444', margin: 0 }}>
          Passwords do not match
        </p>
      )}
      
      {formData.password && formData.password.length > 0 && formData.password.length < 6 && (
        <p style={{ fontSize: '0.7rem', color: '#ef4444', margin: 0 }}>
          Password must be at least 6 characters
        </p>
      )}
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
