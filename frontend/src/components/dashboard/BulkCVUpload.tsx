'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileArchive, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTranslation } from '@/contexts/TranslationContext';

interface BulkCVUploadProps {
  vacantId: number;
  companyId: number;
  onUploadComplete: () => void;
}

export default function BulkCVUpload({ vacantId, companyId, onUploadComplete }: BulkCVUploadProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    processed: number;
    total: number;
    errors?: string[];
  } | null>(null);

  const processFile = async (file: File) => {
    // Validate file type
    const fileName = file.name.toLowerCase();
    const ext = fileName.split('.').pop();
    const isZip = fileName.endsWith('.zip');
    const isCV = ext === 'pdf';

    if (!isZip && !isCV) {
      showError('Please select a ZIP file or a PDF file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('vacantId', vacantId.toString());
      formData.append('companyId', companyId.toString());

      // Use XMLHttpRequest to track upload progress
      const result = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 90); // 90% for upload, 10% for processing
            setUploadProgress(percentComplete);
          }
        });

        // Track overall progress (upload + processing simulation)
        xhr.addEventListener('loadstart', () => {
          setUploadProgress(5);
        });

        xhr.addEventListener('load', () => {
          // Move to processing phase
          setUploadProgress(95);
          
          try {
            const response = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              setUploadProgress(100);
              setTimeout(() => resolve(response), 300);
            } else {
              reject(new Error(response.error || 'Failed to upload CVs'));
            }
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was cancelled'));
        });

        xhr.open('POST', '/api/upload-cvs');
        xhr.send(formData);
      });

      setUploadResult({
        processed: result.processed,
        total: result.total,
        errors: result.errors,
      });

      if (result.processed > 0) {
        showSuccess(`Successfully processed ${result.processed} CV(s)!`);
        onUploadComplete();
      } else {
        showError('No CVs were processed. Please check the ZIP file format.');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to upload CVs');
      setUploadResult(null);
      setUploadProgress(0);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    // Reset file input
    e.target.value = '';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    await processFile(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        borderRadius: '16px',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
        border: '1.5px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0077b5 0%, #005885 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FileArchive size={20} style={{ color: 'white' }} />
        </div>
        <div>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              marginBottom: '4px',
            }}
          >
            Upload CVs
          </h3>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              margin: 0,
            }}
          >
            Upload individual PDF files or a ZIP file containing multiple PDFs
          </p>
        </div>
      </div>

      <label
        htmlFor="bulk-cv-upload"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          borderRadius: '12px',
          border: `2px dashed ${
            isDragging
              ? 'rgba(0, 119, 181, 0.7)'
              : isUploading
              ? 'rgba(0, 119, 181, 0.3)'
              : 'rgba(0, 119, 181, 0.3)'
          }`,
          background: isDragging
            ? 'rgba(0, 119, 181, 0.1)'
            : isUploading
            ? 'rgba(0, 119, 181, 0.05)'
            : 'rgba(0, 119, 181, 0.02)',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s',
          position: 'relative',
          overflow: 'hidden',
          transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        }}
        onMouseEnter={(e) => {
          if (!isUploading && !isDragging) {
            e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.5)';
            e.currentTarget.style.background = 'rgba(0, 119, 181, 0.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isUploading && !isDragging) {
            e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.3)';
            e.currentTarget.style.background = 'rgba(0, 119, 181, 0.02)';
          }
        }}
      >
        <input
          type="file"
          id="bulk-cv-upload"
          accept=".pdf,.zip"
          onChange={handleFileSelect}
          disabled={isUploading}
          style={{ display: 'none' }}
        />

        {isUploading ? (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block', marginBottom: '12px' }}
            >
              <Loader2
                size={40}
                style={{
                  color: '#0077b5',
                }}
              />
            </motion.div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {uploadProgress < 95 ? 'Uploading CVs...' : 'Processing CVs...'}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              {uploadProgress < 95 
                ? `Uploading file... ${uploadProgress}%`
                : 'AI is analyzing and extracting information...'}
            </p>
            {/* Progress percentage */}
            <div style={{
              marginTop: '16px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'rgba(0, 119, 181, 0.1)',
              display: 'inline-block',
            }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#0077b5',
              }}>
                {uploadProgress}%
              </span>
            </div>
          </div>
        ) : (
          <>
            <Upload size={32} style={{ color: '#0077b5', marginBottom: '12px' }} />
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {isDragging ? 'Drop file here' : 'Click or drag file to upload'}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Supports PDF files or ZIP containing multiple PDFs
            </p>
          </>
        )}

        {/* Enhanced Progress bar */}
        {isUploading && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'rgba(0, 119, 181, 0.1)',
              borderRadius: '0 0 12px 12px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #0077b5 0%, #00a0dc 50%, #0077b5 100%)',
                backgroundSize: '200% 100%',
                position: 'relative',
                boxShadow: '0 0 10px rgba(0, 119, 181, 0.5)',
              }}
            >
              {/* Animated shine effect */}
              <motion.div
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                  width: '50%',
                }}
              />
            </motion.div>
          </div>
        )}
      </label>

      {/* Upload Result */}
      {uploadResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '16px',
            padding: '12px',
            borderRadius: '10px',
            background: uploadResult.processed > 0
              ? 'rgba(34, 197, 94, 0.1)'
              : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${
              uploadResult.processed > 0
                ? 'rgba(34, 197, 94, 0.3)'
                : 'rgba(239, 68, 68, 0.3)'
            }`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            {uploadResult.processed > 0 ? (
              <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
            ) : (
              <XCircle size={16} style={{ color: '#ef4444' }} />
            )}
            <p
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: uploadResult.processed > 0 ? '#22c55e' : '#ef4444',
                margin: 0,
              }}
            >
              Processed {uploadResult.processed} of {uploadResult.total} CV(s)
            </p>
          </div>
          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Errors:
              </p>
              <ul style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0, paddingLeft: '20px' }}>
                {uploadResult.errors.slice(0, 5).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
                {uploadResult.errors.length > 5 && (
                  <li>... and {uploadResult.errors.length - 5} more</li>
                )}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

