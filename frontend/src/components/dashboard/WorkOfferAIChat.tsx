'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Briefcase, Zap, Search, X, Code, Database, Palette, TrendingUp, Shield, Smartphone, BarChart } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

interface WorkOfferAIChatProps {
  onApplySuggestion: (suggestion: WorkOfferSuggestion) => void;
}

interface WorkOfferSuggestion {
  name?: string;
  rol?: string;
  salary?: string;
  description?: string;
  availability?: 'remote' | 'hybrid' | 'on site';
  location?: string;
  skills?: Array<{ name: string; importance: number; must_have: boolean }>;
}

const presetMessages = [
  {
    id: '1',
    title: 'Senior Software Developer',
    icon: Code,
    description: 'Create a job offer for a senior developer position',
    suggestion: {
      name: 'Senior Software Developer',
      rol: 'Full Stack Developer',
      salary: '90000',
      description: 'We are looking for an experienced Senior Software Developer to join our team. You will be responsible for designing, developing, and maintaining high-quality software solutions. The ideal candidate should have strong problem-solving skills and experience with modern web technologies.',
      availability: 'remote' as const,
      location: 'Remote',
      skills: [
        { name: 'JavaScript', importance: 5, must_have: true },
        { name: 'React', importance: 5, must_have: true },
        { name: 'Node.js', importance: 4, must_have: true },
        { name: 'TypeScript', importance: 4, must_have: false },
        { name: 'AWS', importance: 3, must_have: false },
      ],
    },
  },
  {
    id: '2',
    title: 'Frontend Developer',
    icon: Code,
    description: 'Frontend developer with React experience',
    suggestion: {
      name: 'Frontend Developer',
      rol: 'Frontend Engineer',
      salary: '75000',
      description: 'Join our frontend team and help build beautiful, responsive user interfaces. We need someone passionate about creating exceptional user experiences and working with modern frontend technologies.',
      availability: 'hybrid' as const,
      location: 'San Francisco, CA',
      skills: [
        { name: 'React', importance: 5, must_have: true },
        { name: 'TypeScript', importance: 4, must_have: true },
        { name: 'CSS/SCSS', importance: 4, must_have: true },
        { name: 'Redux', importance: 3, must_have: false },
        { name: 'Next.js', importance: 3, must_have: false },
      ],
    },
  },
  {
    id: '3',
    title: 'Backend Developer',
    icon: Database,
    description: 'Backend developer specializing in APIs and databases',
    suggestion: {
      name: 'Backend Developer',
      rol: 'Backend Engineer',
      salary: '85000',
      description: 'We are seeking a skilled Backend Developer to build robust, scalable server-side applications. You will work on API development, database optimization, and system architecture. Strong experience with server-side technologies is essential.',
      availability: 'remote' as const,
      location: 'Remote',
      skills: [
        { name: 'Python', importance: 5, must_have: true },
        { name: 'Django/Flask', importance: 5, must_have: true },
        { name: 'PostgreSQL', importance: 4, must_have: true },
        { name: 'Docker', importance: 4, must_have: false },
        { name: 'REST APIs', importance: 4, must_have: false },
      ],
    },
  },
  {
    id: '4',
    title: 'Data Scientist',
    icon: BarChart,
    description: 'Data scientist position with ML/AI focus',
    suggestion: {
      name: 'Data Scientist',
      rol: 'Machine Learning Engineer',
      salary: '110000',
      description: 'We are seeking a talented Data Scientist to help us build and deploy machine learning models. You will work with large datasets, create predictive models, and collaborate with cross-functional teams to solve complex business problems.',
      availability: 'on site' as const,
      location: 'New York, NY',
      skills: [
        { name: 'Python', importance: 5, must_have: true },
        { name: 'Machine Learning', importance: 5, must_have: true },
        { name: 'TensorFlow', importance: 4, must_have: true },
        { name: 'SQL', importance: 4, must_have: false },
        { name: 'Statistics', importance: 4, must_have: false },
      ],
    },
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    icon: Briefcase,
    description: 'DevOps engineer for cloud infrastructure',
    suggestion: {
      name: 'DevOps Engineer',
      rol: 'Site Reliability Engineer',
      salary: '95000',
      description: 'Join our DevOps team to manage and optimize our cloud infrastructure. You will be responsible for CI/CD pipelines, monitoring, automation, and ensuring high availability of our services.',
      availability: 'hybrid' as const,
      location: 'Austin, TX',
      skills: [
        { name: 'AWS/Azure', importance: 5, must_have: true },
        { name: 'Docker/Kubernetes', importance: 5, must_have: true },
        { name: 'CI/CD', importance: 4, must_have: true },
        { name: 'Terraform', importance: 4, must_have: false },
        { name: 'Linux', importance: 4, must_have: false },
      ],
    },
  },
  {
    id: '6',
    title: 'UI/UX Designer',
    icon: Palette,
    description: 'Creative designer for user interfaces',
    suggestion: {
      name: 'UI/UX Designer',
      rol: 'Product Designer',
      salary: '70000',
      description: 'We are looking for a creative UI/UX Designer to join our design team. You will create intuitive, user-centered designs and collaborate with product managers and developers to bring concepts to life.',
      availability: 'hybrid' as const,
      location: 'Los Angeles, CA',
      skills: [
        { name: 'Figma', importance: 5, must_have: true },
        { name: 'User Research', importance: 5, must_have: true },
        { name: 'Prototyping', importance: 4, must_have: true },
        { name: 'Adobe Creative Suite', importance: 3, must_have: false },
        { name: 'Design Systems', importance: 3, must_have: false },
      ],
    },
  },
  {
    id: '7',
    title: 'Mobile Developer',
    icon: Smartphone,
    description: 'Mobile app developer for iOS/Android',
    suggestion: {
      name: 'Mobile Developer',
      rol: 'iOS/Android Engineer',
      salary: '88000',
      description: 'Join our mobile team to build native and cross-platform mobile applications. You will work on developing, testing, and maintaining mobile apps that provide exceptional user experiences.',
      availability: 'remote' as const,
      location: 'Remote',
      skills: [
        { name: 'React Native', importance: 5, must_have: true },
        { name: 'Swift/Kotlin', importance: 4, must_have: true },
        { name: 'Mobile UI/UX', importance: 4, must_have: true },
        { name: 'Firebase', importance: 3, must_have: false },
        { name: 'App Store', importance: 3, must_have: false },
      ],
    },
  },
  {
    id: '8',
    title: 'Cybersecurity Specialist',
    icon: Shield,
    description: 'Security expert for protecting systems',
    suggestion: {
      name: 'Cybersecurity Specialist',
      rol: 'Information Security Analyst',
      salary: '105000',
      description: 'We need a Cybersecurity Specialist to protect our systems and data from threats. You will conduct security audits, implement security measures, and respond to security incidents.',
      availability: 'on site' as const,
      location: 'Washington, DC',
      skills: [
        { name: 'Network Security', importance: 5, must_have: true },
        { name: 'Penetration Testing', importance: 5, must_have: true },
        { name: 'Security Protocols', importance: 4, must_have: true },
        { name: 'SOC Operations', importance: 4, must_have: false },
        { name: 'Compliance', importance: 3, must_have: false },
      ],
    },
  },
  {
    id: '9',
    title: 'QA Engineer',
    icon: Briefcase,
    description: 'Quality assurance engineer for testing',
    suggestion: {
      name: 'QA Engineer',
      rol: 'Software Test Engineer',
      salary: '65000',
      description: 'Join our QA team to ensure the quality of our software products. You will design test cases, execute manual and automated tests, and work with developers to resolve issues.',
      availability: 'hybrid' as const,
      location: 'Seattle, WA',
      skills: [
        { name: 'Manual Testing', importance: 5, must_have: true },
        { name: 'Automated Testing', importance: 4, must_have: true },
        { name: 'Selenium/Cypress', importance: 4, must_have: true },
        { name: 'API Testing', importance: 3, must_have: false },
        { name: 'Test Planning', importance: 3, must_have: false },
      ],
    },
  },
  {
    id: '10',
    title: 'Product Manager',
    icon: TrendingUp,
    description: 'Product management role',
    suggestion: {
      name: 'Product Manager',
      rol: 'Senior Product Manager',
      salary: '95000',
      description: 'Lead product strategy and development for our platform. You will work closely with engineering, design, and business teams to define product roadmaps, prioritize features, and ensure successful product launches.',
      availability: 'remote' as const,
      location: 'Remote',
      skills: [
        { name: 'Product Strategy', importance: 5, must_have: true },
        { name: 'Agile', importance: 4, must_have: true },
        { name: 'Analytics', importance: 4, must_have: true },
        { name: 'User Research', importance: 3, must_have: false },
        { name: 'Technical Writing', importance: 3, must_have: false },
      ],
    },
  },
  {
    id: '11',
    title: 'Business Analyst',
    icon: BarChart,
    description: 'Analyst for business requirements',
    suggestion: {
      name: 'Business Analyst',
      rol: 'Senior Business Analyst',
      salary: '72000',
      description: 'We are seeking a Business Analyst to bridge the gap between business stakeholders and technical teams. You will gather requirements, analyze processes, and help define solutions.',
      availability: 'hybrid' as const,
      location: 'Chicago, IL',
      skills: [
        { name: 'Requirements Analysis', importance: 5, must_have: true },
        { name: 'Process Modeling', importance: 4, must_have: true },
        { name: 'Data Analysis', importance: 4, must_have: true },
        { name: 'SQL', importance: 3, must_have: false },
        { name: 'Documentation', importance: 3, must_have: false },
      ],
    },
  },
];

export default function WorkOfferAIChat({ onApplySuggestion }: WorkOfferAIChatProps) {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSuggestionClick = (suggestion: WorkOfferSuggestion, id: string) => {
    setSelectedId(id);
    // Small delay for visual feedback
    setTimeout(() => {
      onApplySuggestion(suggestion);
      setSelectedId(null);
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{
        borderRadius: '24px',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
        border: '1.5px solid rgba(0, 119, 181, 0.2)',
        boxShadow: '0 16px 48px rgba(0, 119, 181, 0.15)',
        padding: '32px',
        height: 'fit-content',
        maxHeight: 'calc(180vh - 40px)',
        position: 'sticky',
        top: '20px',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(0, 119, 181, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 119, 181, 0.3)',
              }}
            >
              <Sparkles size={24} style={{ color: 'white' }} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  fontFamily: 'var(--font-poppins), sans-serif',
                  background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                      {t('aiQuickStart.title')}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        margin: 0,
                        fontWeight: 500,
                      }}
                    >
                      {presetMessages.length} {t('aiQuickStart.templatesAvailable')}
                    </p>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
            <input
              type="text"
              placeholder={t('aiQuickStart.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: '12px',
                border: '1.5px solid rgba(0, 119, 181, 0.2)',
                background: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                transition: 'all 0.3s',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#0077b5';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0, 119, 181, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '6px',
                  borderRadius: '8px',
                  background: 'rgba(0, 119, 181, 0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0077b5',
                }}
              >
                <X size={14} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Preset Messages */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          maxHeight: 'calc(200vh - 250px)',
          overflowY: 'auto',
          paddingRight: '8px',
        }}>
          {(() => {
            const filteredMessages = presetMessages.filter((preset) => {
              if (!searchQuery.trim()) return true;
              const query = searchQuery.toLowerCase();
              return (
                preset.title.toLowerCase().includes(query) ||
                preset.description.toLowerCase().includes(query) ||
                preset.suggestion.rol.toLowerCase().includes(query) ||
                preset.suggestion.location.toLowerCase().includes(query) ||
                preset.suggestion.skills?.some(skill => skill.name.toLowerCase().includes(query))
              );
            });

            if (filteredMessages.length === 0) {
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    textAlign: 'center',
                    padding: '32px 16px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.05) 0%, rgba(0, 160, 220, 0.03) 100%)',
                    border: '1px dashed rgba(0, 119, 181, 0.2)',
                  }}
                >
                  <Search size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, margin: 0, marginBottom: '4px' }}>
                    {t('aiQuickStart.noTemplatesFound')}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {t('aiQuickStart.tryDifferentTerm')}
                  </p>
                </motion.div>
              );
            }

            return filteredMessages.map((preset, index) => {
            const Icon = preset.icon;
            const isSelected = selectedId === preset.id;

            return (
              <motion.button
                key={preset.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSuggestionClick(preset.suggestion, preset.id)}
                disabled={isSelected}
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  border: isSelected
                    ? '2px solid #0077b5'
                    : '1.5px solid rgba(0, 119, 181, 0.2)',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(0, 119, 181, 0.1) 0%, rgba(0, 160, 220, 0.08) 100%)'
                    : 'rgba(255, 255, 255, 0.9)',
                  cursor: isSelected ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isSelected
                    ? '0 4px 12px rgba(0, 119, 181, 0.2)'
                    : '0 2px 8px rgba(0, 119, 181, 0.1)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#0077b5';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 119, 181, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.2)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 119, 181, 0.1)';
                  }
                }}
              >
                {/* Animated border on selection */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        border: '2px solid #0077b5',
                        borderRadius: '16px',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </AnimatePresence>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: isSelected
                        ? 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)'
                        : 'rgba(0, 119, 181, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      size={20}
                      style={{
                        color: isSelected ? 'white' : '#0077b5',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px',
                      }}
                    >
                      <h4
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          margin: 0,
                        }}
                      >
                        {preset.title}
                      </h4>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: '#0077b5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Zap size={10} style={{ color: 'white' }} />
                        </motion.div>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        margin: 0,
                        lineHeight: 1.4,
                      }}
                    >
                      {preset.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
            });
          })()}
        </div>
        
        {searchQuery && (() => {
          const filteredCount = presetMessages.filter((preset) => {
            const query = searchQuery.toLowerCase();
            return (
              preset.title.toLowerCase().includes(query) ||
              preset.description.toLowerCase().includes(query) ||
              preset.suggestion.rol.toLowerCase().includes(query) ||
              preset.suggestion.location.toLowerCase().includes(query) ||
              preset.suggestion.skills?.some(skill => skill.name.toLowerCase().includes(query))
            );
          }).length;
          
          return filteredCount > 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                marginTop: '12px',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                padding: '8px',
              }}
            >
              {t('aiQuickStart.foundTemplates').replace('{count}', filteredCount.toString())}
            </motion.p>
          ) : null;
        })()}

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: '24px',
            padding: '16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.05) 0%, rgba(0, 160, 220, 0.03) 100%)',
            border: '1px solid rgba(0, 119, 181, 0.1)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <Bot size={18} style={{ color: '#0077b5', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                margin: 0,
                marginBottom: '4px',
                fontWeight: 600,
              }}
            >
              {t('aiQuickStart.quickFill')}
            </p>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {t('aiQuickStart.quickFillDesc')}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

