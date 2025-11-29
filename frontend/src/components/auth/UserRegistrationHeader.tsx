'use client';

import { Upload } from 'lucide-react';

export default function UserRegistrationHeader() {
  return (
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'rgba(0, 119, 181, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(0, 119, 181, 0.3)',
          }}
        >
          <Upload style={{ width: '40px', height: '40px', color: '#0077b5' }} />
        </div>
      </div>

      <h2
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '8px',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-poppins), sans-serif',
        }}
      >
        User Registration
      </h2>

      <p
        style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
        }}
      >
        Upload your CV to get started
      </p>
    </div>
  );
}

