'use client';

import { X, Home, Settings, User, LogOut } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: '280px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.18)',
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 
              className="text-2xl font-bold theme-text-primary"
              style={{ fontFamily: 'var(--font-cursive), cursive' }}
            >
              Worky AI
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 theme-text-primary" />
            </button>
          </div>

          <nav className="space-y-2">
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg theme-text-secondary hover:bg-white/10 hover:theme-text-primary transition-all group"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg theme-text-secondary hover:bg-white/10 hover:theme-text-primary transition-all group"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg theme-text-secondary hover:bg-white/10 hover:theme-text-primary transition-all group"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg theme-text-secondary hover:bg-white/10 hover:theme-text-primary transition-all group mt-8"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </a>
          </nav>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={onClose}
        />
      )}
    </>
  );
}

