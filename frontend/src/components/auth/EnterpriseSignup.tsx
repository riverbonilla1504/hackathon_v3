'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface EnterpriseSignupProps {
  onBack: () => void;
  onClose: () => void;
}

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

export default function EnterpriseSignup({ onBack, onClose }: EnterpriseSignupProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('basic');
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

  const [completedSteps, setCompletedSteps] = useState<FormStep[]>([]);

  const steps: { key: FormStep; title: string }[] = [
    { key: 'basic', title: 'Basic Company Information' },
    { key: 'contact', title: 'Contact Information' },
    { key: 'documents', title: 'Required Documents' },
    { key: 'job-posting', title: 'Information for Job Posting' },
  ];

  const updateFormData = (field: keyof EnterpriseFormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    
    const currentIndex = steps.findIndex(s => s.key === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key);
    } else {
      // Submit form
      handleSubmit();
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(s => s.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key);
    } else {
      onBack();
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    onClose();
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
      default:
        return false;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{
        borderRadius: '24px',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
        border: '1.5px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
        maxHeight: '90vh',
        overflowY: 'auto',
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
        {/* Progress Steps */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', gap: '8px' }}>
          {steps.map((step, index) => {
            const isActive = step.key === currentStep;
            const isCompleted = completedSteps.includes(step.key);
            const stepIndex = steps.findIndex(s => s.key === currentStep);
            const isAccessible = index <= stepIndex || isCompleted;

            return (
              <div
                key={step.key}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isAccessible ? 1 : 0.4,
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCompleted
                      ? '#0077b5'
                      : isActive
                      ? 'rgba(0, 119, 181, 0.2)'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: isActive ? '2px solid #0077b5' : '2px solid rgba(255, 255, 255, 0.2)',
                    color: isCompleted ? 'white' : isActive ? '#0077b5' : 'var(--text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  {isCompleted ? <Check style={{ width: '20px', height: '20px' }} /> : index + 1}
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {step.title.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleBack}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Back
        </button>

        <h2
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '32px',
            textAlign: 'center',
            color: 'var(--text-primary)',
          }}
        >
          {steps.find(s => s.key === currentStep)?.title}
        </h2>

        <AnimatePresence mode="wait">
          {currentStep === 'basic' && (
            <BasicInfoForm
              key="basic"
              formData={formData}
              updateFormData={updateFormData}
            />
          )}

          {currentStep === 'contact' && (
            <ContactInfoForm
              key="contact"
              formData={formData}
              updateFormData={updateFormData}
            />
          )}

          {currentStep === 'documents' && (
            <DocumentsForm
              key="documents"
              formData={formData}
              updateFormData={updateFormData}
            />
          )}

          {currentStep === 'job-posting' && (
            <JobPostingForm
              key="job-posting"
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBack}
            style={{
              flex: 1,
              padding: '16px 32px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1rem',
              color: '#0077b5',
              background: 'rgba(0, 119, 181, 0.1)',
              border: '2px solid #0077b5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
            Back
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            disabled={!isStepValid(currentStep)}
            style={{
              flex: 1,
              padding: '16px 32px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1rem',
              color: 'white',
              background: isStepValid(currentStep) ? '#0077b5' : 'rgba(0, 119, 181, 0.5)',
              border: 'none',
              cursor: isStepValid(currentStep) ? 'pointer' : 'not-allowed',
              boxShadow: '0 4px 12px rgba(0, 119, 181, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              if (isStepValid(currentStep)) {
                e.currentTarget.style.background = '#005885';
              }
            }}
            onMouseLeave={(e) => {
              if (isStepValid(currentStep)) {
                e.currentTarget.style.background = '#0077b5';
              }
            }}
          >
            {currentStep === 'job-posting' ? 'Submit' : 'Next'}
            {currentStep !== 'job-posting' && <ArrowRight style={{ width: '18px', height: '18px' }} />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Basic Company Information Form
function BasicInfoForm({
  formData,
  updateFormData,
}: {
  formData: EnterpriseFormData;
  updateFormData: (field: keyof EnterpriseFormData, value: string | File | null) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      <FormField
        label="Legal Name"
        value={formData.legal_name}
        onChange={(e) => updateFormData('legal_name', e.target.value)}
        placeholder="Legal name according to Chamber of Commerce"
        required
      />
      <FormField
        label="Trade Name"
        value={formData.trade_name}
        onChange={(e) => updateFormData('trade_name', e.target.value)}
        placeholder="Business or brand name"
        required
      />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        <FormField
          label="Tax ID (NIT)"
          value={formData.tax_id}
          onChange={(e) => updateFormData('tax_id', e.target.value)}
          placeholder="NIT number"
          required
        />
        <FormField
          label="Verification Digit"
          value={formData.verification_digit}
          onChange={(e) => updateFormData('verification_digit', e.target.value)}
          placeholder="Digit"
          type="number"
          required
        />
      </div>
      <FormField
        label="Legal Representative"
        value={formData.legal_representative}
        onChange={(e) => updateFormData('legal_representative', e.target.value)}
        placeholder="Full name of the legal representative"
        required
      />
      <FormField
        label="Company Type"
        value={formData.company_type}
        onChange={(e) => updateFormData('company_type', e.target.value)}
        placeholder="S.A.S., LTDA, S.A., etc."
        required
      />
      <FormField
        label="Incorporation Date"
        value={formData.incorporation_date}
        onChange={(e) => updateFormData('incorporation_date', e.target.value)}
        type="date"
        required
      />
    </motion.div>
  );
}

// Contact Information Form
function ContactInfoForm({
  formData,
  updateFormData,
}: {
  formData: EnterpriseFormData;
  updateFormData: (field: keyof EnterpriseFormData, value: string | File | null) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      <FormField
        label="Address"
        value={formData.address}
        onChange={(e) => updateFormData('address', e.target.value)}
        placeholder="Registered physical address"
        required
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormField
          label="City"
          value={formData.city}
          onChange={(e) => updateFormData('city', e.target.value)}
          placeholder="City"
          required
        />
        <FormField
          label="State/Department"
          value={formData.state}
          onChange={(e) => updateFormData('state', e.target.value)}
          placeholder="Department"
          required
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormField
          label="Landline Phone"
          value={formData.landline_phone}
          onChange={(e) => updateFormData('landline_phone', e.target.value)}
          placeholder="Official landline number"
          type="tel"
          required
        />
        <FormField
          label="Mobile Phone"
          value={formData.mobile_phone}
          onChange={(e) => updateFormData('mobile_phone', e.target.value)}
          placeholder="Mobile contact number"
          type="tel"
          required
        />
      </div>
      <FormField
        label="Corporate Email"
        value={formData.corporate_email}
        onChange={(e) => updateFormData('corporate_email', e.target.value)}
        placeholder="Main corporate email"
        type="email"
        required
      />
      <FormField
        label="Website URL"
        value={formData.website_url}
        onChange={(e) => updateFormData('website_url', e.target.value)}
        placeholder="Company's website URL"
        type="url"
        required
      />
    </motion.div>
  );
}

// Required Documents Form
function DocumentsForm({
  formData,
  updateFormData,
}: {
  formData: EnterpriseFormData;
  updateFormData: (field: keyof EnterpriseFormData, value: string | File | null) => void;
}) {
  const handleFileChange = (field: 'chamber_of_commerce_certificate' | 'rut_document' | 'legal_representative_id' | 'company_logo', file: File | null) => {
    updateFormData(field, file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      <FileUploadField
        label="Chamber of Commerce Certificate"
        description="Certificate issued within the last 30 days (PDF)"
        file={formData.chamber_of_commerce_certificate}
        onChange={(file) => handleFileChange('chamber_of_commerce_certificate', file)}
        accept=".pdf"
        required
      />
      <FileUploadField
        label="RUT Document"
        description="Updated RUT tax document (PDF)"
        file={formData.rut_document}
        onChange={(file) => handleFileChange('rut_document', file)}
        accept=".pdf"
        required
      />
      <FileUploadField
        label="Legal Representative ID"
        description="ID document of the legal representative (PDF/Image)"
        file={formData.legal_representative_id}
        onChange={(file) => handleFileChange('legal_representative_id', file)}
        accept=".pdf,.jpg,.jpeg,.png"
        required
      />
      <FileUploadField
        label="Company Logo"
        description="Company logo for display (Image)"
        file={formData.company_logo}
        onChange={(file) => handleFileChange('company_logo', file)}
        accept=".jpg,.jpeg,.png,.svg"
        required
      />
    </motion.div>
  );
}

// Information for Job Posting Form
function JobPostingForm({
  formData,
  updateFormData,
}: {
  formData: EnterpriseFormData;
  updateFormData: (field: keyof EnterpriseFormData, value: string | File | null) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      <FormField
        label="Industry Sector"
        value={formData.industry_sector}
        onChange={(e) => updateFormData('industry_sector', e.target.value)}
        placeholder="Industry or economic sector"
        required
      />
      <FormField
        label="Company Size"
        value={formData.company_size}
        onChange={(e) => updateFormData('company_size', e.target.value)}
        placeholder="Number of employees or size category"
        required
      />
      <FormField
        label="Company Description"
        value={formData.company_description}
        onChange={(e) => updateFormData('company_description', e.target.value)}
        placeholder="Company description for candidates"
        type="textarea"
        required
      />
      <FormField
        label="LinkedIn URL"
        value={formData.linkedin_url}
        onChange={(e) => updateFormData('linkedin_url', e.target.value)}
        placeholder="LinkedIn profile URL"
        type="url"
      />
      <FormField
        label="Facebook URL"
        value={formData.facebook_url}
        onChange={(e) => updateFormData('facebook_url', e.target.value)}
        placeholder="Facebook page URL"
        type="url"
      />
      <FormField
        label="Instagram URL"
        value={formData.instagram_url}
        onChange={(e) => updateFormData('instagram_url', e.target.value)}
        placeholder="Instagram page URL"
        type="url"
      />
    </motion.div>
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
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '0.875rem',
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
          rows={4}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1.5px solid rgba(255, 255, 255, 0.3)',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            fontFamily: 'inherit',
            resize: 'vertical',
            transition: 'all 0.3s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#0077b5';
            e.target.style.background = 'rgba(255, 255, 255, 0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1.5px solid rgba(255, 255, 255, 0.3)',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            fontFamily: 'inherit',
            transition: 'all 0.3s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#0077b5';
            e.target.style.background = 'rgba(255, 255, 255, 0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
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
}: {
  label: string;
  description: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept: string;
  required?: boolean;
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
          marginBottom: '8px',
          fontSize: '0.875rem',
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
        style={{ display: 'none' }}
      />
      <label
        htmlFor={`file-${label}`}
        style={{
          display: 'block',
          padding: '24px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '2px dashed rgba(255, 255, 255, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.3s',
          textAlign: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        }}
      >
        <Upload style={{ width: '32px', height: '32px', color: '#0077b5', margin: '0 auto 12px' }} />
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {file ? file.name : 'Click to upload'}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{description}</p>
      </label>
    </div>
  );
}

