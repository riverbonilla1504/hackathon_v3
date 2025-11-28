'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';

interface UserSignupProps {
  onBack: () => void;
  onClose: () => void;
}

export default function UserSignup({ onBack, onClose }: UserSignupProps) {
  const [cvFile, setCvFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('CV uploaded:', cvFile);
    onClose();
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
        <button
          onClick={onBack}
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
          }}
        >
          ← Back
        </button>

        <h2
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '8px',
            textAlign: 'center',
            color: 'var(--text-primary)',
          }}
        >
          User Registration
        </h2>

        <p
          style={{
            fontSize: '1rem',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            marginBottom: '32px',
          }}
        >
          Upload your CV to get started
        </p>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              marginBottom: '32px',
              padding: '40px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px dashed rgba(255, 255, 255, 0.3)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
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
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              id="cv-upload"
              style={{ display: 'none' }}
            />
            <label
              htmlFor="cv-upload"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
              }}
            >
              <Upload style={{ width: '48px', height: '48px', color: '#0077b5' }} />
              <div>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {cvFile ? cvFile.name : 'Click to upload your CV'}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  PDF, DOC, or DOCX (Max 10MB)
                </p>
              </div>
            </label>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!cvFile}
            style={{
              width: '100%',
              padding: '16px 32px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1rem',
              color: 'white',
              background: cvFile ? '#0077b5' : 'rgba(0, 119, 181, 0.5)',
              border: 'none',
              cursor: cvFile ? 'pointer' : 'not-allowed',
              boxShadow: '0 4px 12px rgba(0, 119, 181, 0.3)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              if (cvFile) {
                e.currentTarget.style.background = '#005885';
              }
            }}
            onMouseLeave={(e) => {
              if (cvFile) {
                e.currentTarget.style.background = '#0077b5';
              }
            }}
          >
            Submit
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}

