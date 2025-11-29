'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Loader2 } from 'lucide-react';

interface CVViewerProps {
  cvUrl?: string;
  onClose: () => void;
}

export default function CVViewer({ cvUrl, onClose }: CVViewerProps) {
  const [cvData, setCvData] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('application/pdf');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCV = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // If we have a direct URL, use it
        if (cvUrl && cvUrl.startsWith('http')) {
          const response = await fetch(cvUrl);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setCvData(reader.result as string);
            setMimeType(blob.type || 'application/pdf');
            setIsLoading(false);
          };
          reader.readAsDataURL(blob);
        } else {
          throw new Error('No CV URL provided');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load CV');
        setIsLoading(false);
      }
    };

    if (cvUrl) {
      loadCV();
    }
  }, [cvUrl]);

  const handleDownload = () => {
    if (cvData) {
      const link = document.createElement('a');
      link.href = cvData;
      link.download = `CV.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '90%',
            maxWidth: '1200px',
            height: '90%',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #0077b5 0%, #005885 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={24} style={{ color: 'white' }} />
              <h3
                style={{
                  margin: 0,
                  color: 'white',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                }}
              >
                CV Viewer
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {cvData && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  <Download size={16} />
                  Download
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
            {isLoading && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <Loader2 size={48} style={{ color: '#0077b5', animation: 'spin 1s linear infinite' }} />
                  <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading CV...</p>
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#ef4444',
                }}
              >
                <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>Error Loading CV</p>
                <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
              </div>
            )}

            {cvData && !isLoading && !error && (
              <iframe
                src={cvData}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title="CV Viewer"
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

