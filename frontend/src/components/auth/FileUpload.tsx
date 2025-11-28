'use client';

import { Upload } from 'lucide-react';

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept?: string;
}

export default function FileUpload({ file, onFileChange, accept = '.pdf,.doc,.docx' }: FileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    } else {
      onFileChange(null);
    }
  };

  return (
    <div
      style={{
        marginBottom: '32px',
        padding: '40px',
        borderRadius: '16px',
        background: 'rgba(0, 0, 0, 0.05)',
        border: '2px dashed #9ca3af',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.borderColor = '#0077b5';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 119, 181, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.borderColor = '#9ca3af';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <input
        type="file"
        accept={accept}
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
            {file ? file.name : 'Click to upload your CV'}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            PDF, DOC, or DOCX (Max 10MB)
          </p>
        </div>
      </label>
    </div>
  );
}

