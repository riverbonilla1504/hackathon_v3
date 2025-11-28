'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkOffer, Applicant } from '@/lib/storage';
import { MessageSquare, Send, Bot, X } from 'lucide-react';

interface AIChatSidebarProps {
  offer: WorkOffer;
  applicants: Applicant[];
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChatSidebar({ offer, applicants, isOpen, onClose }: AIChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your AI assistant for the "${offer.name}" position. I can help you understand the candidates, analyze their qualifications, compare applicants, and answer questions about the job posting. What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple rule-based responses (in production, this would call an AI API)
    if (lowerMessage.includes('top candidate') || lowerMessage.includes('best candidate')) {
      const topCandidate = applicants.sort((a, b) => b.match_score - a.match_score)[0];
      return `The top candidate is ${topCandidate.name} with a ${topCandidate.match_score}% match score. They have ${topCandidate.experience_years} years of experience and expertise in ${topCandidate.skills.slice(0, 3).join(', ')}. Their education background includes ${topCandidate.education}.`;
    }
    
    if (lowerMessage.includes('how many') || lowerMessage.includes('total applicants')) {
      return `You have received ${applicants.length} applications for this position. The average match score is ${Math.round(applicants.reduce((sum, a) => sum + a.match_score, 0) / applicants.length)}%.`;
    }
    
    if (lowerMessage.includes('skills') || lowerMessage.includes('what skills')) {
      const allSkills = applicants.flatMap(a => a.skills);
      const skillCounts = allSkills.reduce((acc, skill) => {
        acc[skill] = (acc[skill] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topSkills = Object.entries(skillCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([skill]) => skill);
      return `The most common skills among applicants are: ${topSkills.join(', ')}. These skills align well with your job requirements.`;
    }
    
    if (lowerMessage.includes('salary') || lowerMessage.includes('compensation')) {
      return `The position offers ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(offer.salary)}. This is competitive for ${offer.rol} positions in ${offer.location}.`;
    }
    
    if (lowerMessage.includes('location') || lowerMessage.includes('where')) {
      return `This position is located in ${offer.location} and offers ${offer.availability} work arrangement. ${offer.availability === 'remote' ? 'All candidates can work remotely.' : offer.availability === 'hybrid' ? 'Candidates should be able to work in a hybrid model.' : 'Candidates need to be available for on-site work.'}`;
    }
    
    if (lowerMessage.includes('compare') || lowerMessage.includes('difference')) {
      const topTwo = applicants.sort((a, b) => b.match_score - a.match_score).slice(0, 2);
      if (topTwo.length >= 2) {
        return `Comparing the top two candidates:\n\n${topTwo[0].name} (${topTwo[0].match_score}% match): ${topTwo[0].experience_years} years experience, strong in ${topTwo[0].skills.slice(0, 3).join(', ')}.\n\n${topTwo[1].name} (${topTwo[1].match_score}% match): ${topTwo[1].experience_years} years experience, strong in ${topTwo[1].skills.slice(0, 3).join(', ')}.\n\nBoth are excellent candidates, but ${topTwo[0].name} has a slightly higher match score.`;
      }
    }
    
    if (lowerMessage.includes('experience') || lowerMessage.includes('years')) {
      const avgExperience = Math.round(applicants.reduce((sum, a) => sum + a.experience_years, 0) / applicants.length);
      return `The average years of experience among applicants is ${avgExperience} years. The range is from ${Math.min(...applicants.map(a => a.experience_years))} to ${Math.max(...applicants.map(a => a.experience_years))} years.`;
    }
    
    // Default response
    return `I understand you're asking about "${userMessage}". Based on the ${applicants.length} applicants for the "${offer.name}" position, I can help you with:\n\n• Candidate comparisons and rankings\n• Skills analysis and trends\n• Match score explanations\n• Job posting details\n• Application statistics\n\nCould you be more specific about what you'd like to know?`;
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(input),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              zIndex: 999,
            }}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              width: '420px',
              maxWidth: '90vw',
              zIndex: 1000,
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.85) 100%)',
              borderLeft: '1.5px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '-8px 0 32px 0 rgba(31, 38, 135, 0.37)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1.5px solid rgba(0, 119, 181, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Bot size={20} style={{ color: 'white' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    AI Assistant
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Ask me anything
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'rgba(0, 119, 181, 0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} style={{ color: '#0077b5' }} />
              </motion.button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div style={{
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: message.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: message.role === 'user'
                      ? 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)'
                      : 'rgba(0, 119, 181, 0.1)',
                    color: message.role === 'user' ? 'white' : 'var(--text-primary)',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {message.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                  }}
                >
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'rgba(0, 119, 181, 0.1)',
                    display: 'flex',
                    gap: '4px',
                  }}>
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#0077b5',
                      }}
                    />
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#0077b5',
                      }}
                    />
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#0077b5',
                      }}
                    />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '20px',
              borderTop: '1.5px solid rgba(0, 119, 181, 0.1)',
              display: 'flex',
              gap: '12px',
            }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about candidates, skills, or the job..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid rgba(0, 119, 181, 0.2)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: input.trim() && !isLoading
                    ? 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)'
                    : 'rgba(0, 119, 181, 0.3)',
                  border: 'none',
                  cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Send size={18} style={{ color: 'white' }} />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

