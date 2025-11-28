'use client';

import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header 
      className="fixed top-0 left-0 z-50 px-4 sm:px-6 lg:px-8 py-4"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
        borderRight: '1px solid rgba(255, 255, 255, 0.18)',
        borderBottomRightRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}
    >
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Menu"
          style={{ color: 'var(--text-primary)' }}
        >
          <Menu className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
        </button>
        <nav className="hidden md:flex items-center gap-6 ml-6">
          <a 
            href="#" 
            className="transition-colors text-sm font-medium hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Features
          </a>
          <a 
            href="#" 
            className="transition-colors text-sm font-medium hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            About
          </a>
          <a 
            href="#" 
            className="transition-colors text-sm font-medium hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}

