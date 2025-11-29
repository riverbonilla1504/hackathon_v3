'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { Zap, Shield, Clock, TrendingUp, Quote, Star, Users } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

const getFeatures = (t: (key: string) => string) => [
  {
    icon: Zap,
    title: t('features.lightningFast'),
    description: t('features.lightningFastDesc'),
    color: '#0077b5',
  },
  {
    icon: Shield,
    title: t('features.secure'),
    description: t('features.secureDesc'),
    color: '#00a0dc',
  },
  {
    icon: Clock,
    title: t('features.available'),
    description: t('features.availableDesc'),
    color: '#0077b5',
  },
  {
    icon: TrendingUp,
    title: t('features.smartMatching'),
    description: t('features.smartMatchingDesc'),
    color: '#00a0dc',
  },
];

const getTestimonials = (t: (key: string) => string) => [
  {
    name: t('features.testimonial1.name'),
    role: t('features.testimonial1.role'),
    company: t('features.testimonial1.company'),
    content: t('features.testimonial1.content'),
    rating: 5,
  },
  {
    name: t('features.testimonial2.name'),
    role: t('features.testimonial2.role'),
    company: t('features.testimonial2.company'),
    content: t('features.testimonial2.content'),
    rating: 5,
  },
];

export default function Features() {
  const { t } = useTranslation();
  const [personsLottieData, setPersonsLottieData] = useState<any>(null);
  const features = getFeatures(t);
  const testimonials = getTestimonials(t);

  useEffect(() => {
    // Load persons.json for Lottie animation
    fetch('/persons.json')
      .then(res => res.json())
      .then(data => {
        // Check if it's a Lottie animation (has 'v', 'fr', 'w', 'h' properties)
        if (data.v && data.fr && data.w && data.h) {
          setPersonsLottieData(data);
        }
      })
      .catch(err => {
        console.error('Error loading persons.json:', err);
      });
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: 0.4, 
        ease: 'easeOut' 
      }}
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
          scale: 0.95,
          y: 20
        }}
        whileInView={{ 
          opacity: 1, 
          scale: 1,
          y: 0
        }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ 
          duration: 0.5, 
          delay: 0.05, 
          ease: 'easeOut'
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
            y: 20
          }}
          whileInView={{ 
            opacity: 1, 
            y: 0
          }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ 
            duration: 0.4, 
            delay: 0.1, 
            ease: 'easeOut'
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
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.35, 
                  delay: 0.05, 
                  ease: 'easeOut' 
                }}
                style={{
                  display: 'block',
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}
              >
                {t('features.whyChoose')}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.35, 
                  delay: 0.1, 
                  ease: 'easeOut' 
                }}
                style={{
                  display: 'block',
                  background: 'linear-gradient(to right, #0077b5, #00a0dc, #0077b5)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {t('features.workyAi')}
              </motion.span>
          </motion.h2>
          <motion.p
            initial={{ 
              opacity: 0, 
              y: 15
            }}
            whileInView={{ 
              opacity: 1, 
              y: 0
            }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ 
              duration: 0.4, 
              delay: 0.15, 
              ease: 'easeOut'
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
              {t('features.subtitle')}
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
                  y: 30,
                  scale: 0.95
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.2 + (index * 0.05), 
                  ease: 'easeOut'
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
                  initial={{ 
                    opacity: 0,
                    scale: 0.8,
                    rotate: -10
                  }}
                  whileInView={{ 
                    opacity: 1,
                    scale: 1,
                    rotate: 0
                  }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.35, 
                    delay: 0.25 + (index * 0.05),
                    ease: 'easeOut'
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
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.3 + (index * 0.05),
                      ease: 'easeOut'
                    }}
                  >
                    <Icon 
                      size={32} 
                      style={{ color: feature.color }}
                    />
                  </motion.div>
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.35, 
                    delay: 0.25 + (index * 0.05),
                    ease: 'easeOut'
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
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.35, 
                    delay: 0.3 + (index * 0.05),
                    ease: 'easeOut'
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

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ 
            duration: 0.4, 
            delay: 0.35, 
            ease: 'easeOut'
          }}
          style={{
            marginTop: 'clamp(64px, 10vw, 120px)',
            width: '100%',
          }}
        >
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}
            style={{
              textAlign: 'center',
              marginBottom: 'clamp(48px, 6vw, 80px)',
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
              }}
            >
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.45 }}
                style={{
                  display: 'block',
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}
              >
                {t('features.testimonials.title')}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.5 }}
                style={{
                  display: 'block',
                  background: 'linear-gradient(to right, #0077b5, #00a0dc, #0077b5)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {t('features.testimonials.clientsSay')}
              </motion.span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.55 }}
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                opacity: 0.85,
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              {t('features.testimonials.subtitle')}
            </motion.p>
          </motion.div>

          {/* Testimonials Grid with Animation */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'clamp(24px, 3vw, 32px)',
              width: '100%',
              alignItems: 'start',
            }}
          >
            {/* Lottie Animation Column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                position: 'relative',
              }}
            >
              <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                {/* Glow effect */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.15), rgba(0, 160, 220, 0.15), rgba(0, 119, 181, 0.15))',
                    borderRadius: '50%',
                    filter: 'blur(40px)',
                    transform: 'scale(1.2)',
                    zIndex: -1,
                  }}
                />
                
                {/* Lottie Animation */}
                {personsLottieData ? (
                  <Lottie
                    animationData={personsLottieData}
                    loop={true}
                    autoplay={true}
                    style={{
                      width: '100%',
                      height: 'auto',
                      filter: 'drop-shadow(0 10px 30px rgba(0, 119, 181, 0.2))',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '400px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Users size={64} style={{ color: '#0077b5', opacity: 0.5 }} />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Testimonials */}
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.65 + (index * 0.1), 
                  ease: 'easeOut'
                }}
                style={{
                  position: 'relative',
                  padding: '32px',
                  borderRadius: '24px',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 12px 32px 0 rgba(31, 38, 135, 0.2)',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Quote Icon */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.7 + (index * 0.1) }}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.15), rgba(0, 160, 220, 0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    border: '1.5px solid rgba(0, 119, 181, 0.2)',
                  }}
                >
                  <Quote size={24} style={{ color: '#0077b5' }} />
                </motion.div>

                {/* Rating Stars */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.75 + (index * 0.1) }}
                  style={{
                    display: 'flex',
                    gap: '4px',
                    marginBottom: '16px',
                  }}
                >
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      style={{ 
                        color: '#ffd700', 
                        fill: '#ffd700',
                        filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3))',
                      }}
                    />
                  ))}
                </motion.div>

                {/* Content */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.8 + (index * 0.1) }}
                  style={{
                    fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)',
                    lineHeight: 1.7,
                    color: 'var(--text-secondary)',
                    marginBottom: '24px',
                    fontStyle: 'italic',
                  }}
                >
                  "{testimonial.content}"
                </motion.p>

                {/* Author */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.85 + (index * 0.1) }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    paddingTop: '16px',
                    borderTop: '1.5px solid rgba(0, 119, 181, 0.1)',
                  }}
                >
                  <p
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      margin: 0,
                      fontFamily: 'var(--font-poppins), sans-serif',
                    }}
                  >
                    {testimonial.name}
                  </p>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: '#0077b5',
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    {testimonial.role} · {testimonial.company}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

