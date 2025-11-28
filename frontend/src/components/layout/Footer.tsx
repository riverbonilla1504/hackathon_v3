'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      style={{
        position: 'relative',
        width: '100%',
        padding: 'clamp(32px, 5vw, 64px) clamp(24px, 4vw, 48px)',
        background: 'linear-gradient(135deg, #0077b5 0%, #005885 100%)',
        borderTop: '1.5px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 -8px 32px 0 rgba(0, 119, 181, 0.3)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'clamp(32px, 4vw, 48px)',
            marginBottom: 'clamp(24px, 3vw, 32px)',
          }}
        >
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Link href="/" passHref>
              <h3
                className="text-2xl sm:text-3xl font-bold leading-none mb-4"
                style={{ fontFamily: 'var(--font-cursive), cursive', cursor: 'pointer' }}
              >
                <span className="block mb-1" style={{ color: 'rgba(255, 255, 255, 1)' }}>
                  Worky
                </span>
                <span
                  className="block"
                  style={{
                    background: 'linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 1))',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  AI
                </span>
              </h3>
            </Link>
            <p
              style={{
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              Revolutionizing recruitment with intelligent CV analysis and candidate matching.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 1)',
                marginBottom: '16px',
              }}
            >
              Quick Links
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <li>
                <Link
                  href="/login"
                  style={{
                    fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                    color: 'rgba(255, 255, 255, 0.85)',
                    textDecoration: 'none',
                    transition: 'color 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                  }}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup/enterprise"
                  style={{
                    fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                    color: 'rgba(255, 255, 255, 0.85)',
                    textDecoration: 'none',
                    transition: 'color 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                  }}
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 1)',
                marginBottom: '16px',
              }}
            >
              Company
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <li>
                <a
                  href="#"
                  style={{
                    fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                    color: 'rgba(255, 255, 255, 0.85)',
                    textDecoration: 'none',
                    transition: 'color 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                  }}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  style={{
                    fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                    color: 'rgba(255, 255, 255, 0.85)',
                    textDecoration: 'none',
                    transition: 'color 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                  }}
                >
                  Contact
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            paddingTop: 'clamp(24px, 3vw, 32px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
            <p
              style={{
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: 0,
              }}
            >
              © {new Date().getFullYear()} Worky AI. All rights reserved.
            </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}

