'use client';

import { motion } from 'framer-motion';
import { Zap, Shield, Clock, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process hundreds of CVs in seconds, not hours. Our AI-powered system analyzes resumes at unprecedented speed.',
    color: '#0077b5',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is protected with enterprise-grade security. All CVs are processed securely and confidentially.',
    color: '#00a0dc',
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Access your recruitment tools anytime, anywhere. No downtime, no waiting - just results when you need them.',
    color: '#0077b5',
  },
  {
    icon: TrendingUp,
    title: 'Smart Matching',
    description: 'Advanced algorithms match candidates to job requirements with precision, saving you time and improving quality.',
    color: '#00a0dc',
  },
];

export default function Features() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(48px, 8vw, 120px) 16px',
        perspective: '1000px',
      }}
      className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
    >
      {/* Content Container */}
      <motion.div
        initial={{ 
          opacity: 0, 
          scale: 0.7,
          z: -200,
          filter: 'blur(10px)'
        }}
        whileInView={{ 
          opacity: 1, 
          scale: 1,
          z: 0,
          filter: 'blur(0px)'
        }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ 
          duration: 1.2, 
          delay: 0.2, 
          ease: [0.16, 1, 0.3, 1]
        }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: 'clamp(32px, 5vw, 80px) clamp(24px, 4vw, 80px)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Section Header */}
        <motion.div
          initial={{ 
            opacity: 0, 
            y: 30,
            z: -100
          }}
          whileInView={{ 
            opacity: 1, 
            y: 0,
            z: 0
          }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ 
            duration: 0.8, 
            delay: 0.4, 
            ease: [0.16, 1, 0.3, 1]
          }}
          style={{
            textAlign: 'center',
            marginBottom: 'clamp(48px, 6vw, 80px)',
            transformStyle: 'preserve-3d',
          }}
        >
          <motion.h2
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-poppins), sans-serif',
              marginBottom: '16px',
              transformStyle: 'preserve-3d',
            }}
          >
            <span
              style={{
                display: 'block',
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}
            >
              Why Choose
            </span>
            <span
              style={{
                display: 'block',
                background: 'linear-gradient(to right, #0077b5, #00a0dc, #0077b5)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Worky AI?
            </span>
          </motion.h2>
          <motion.p
            initial={{ 
              opacity: 0, 
              y: 20
            }}
            whileInView={{ 
              opacity: 1, 
              y: 0
            }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ 
              duration: 0.8, 
              delay: 0.6, 
              ease: [0.16, 1, 0.3, 1]
            }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              opacity: 0.85,
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Powerful features designed to transform your recruitment process
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'clamp(16px, 2.5vw, 24px)',
            width: '100%',
          }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ 
                  opacity: 0, 
                  y: 50,
                  z: -150,
                  scale: 0.9,
                  filter: 'blur(8px)'
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  z: 0,
                  scale: 1,
                  filter: 'blur(0px)',
                }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.3 + (index * 0.1), 
                  ease: [0.16, 1, 0.3, 1]
                }}
                style={{
                  position: 'relative',
                  padding: '20px',
                  borderRadius: '20px',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  background:
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 8px 24px 0 rgba(31, 38, 135, 0.25)',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.5 + (index * 0.1),
                    type: 'spring',
                    stiffness: 200
                  }}
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}25)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    border: `1.5px solid ${feature.color}30`,
                  }}
                >
                  <Icon 
                    size={32} 
                    style={{ color: feature.color }}
                  />
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.6 + (index * 0.1)
                  }}
                  style={{
                    fontSize: 'clamp(1.1rem, 2.2vw, 1.35rem)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                    fontFamily: 'var(--font-poppins), sans-serif',
                  }}
                >
                  {feature.title}
                </motion.h3>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.7 + (index * 0.1)
                  }}
                  style={{
                    fontSize: 'clamp(0.85rem, 1.4vw, 0.95rem)',
                    lineHeight: 1.6,
                    color: 'var(--text-secondary)',
                    opacity: 0.85,
                    margin: 0,
                  }}
                >
                  {feature.description}
                </motion.p>

              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.section>
  );
}

