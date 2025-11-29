'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WorkOffer, Applicant } from '@/lib/storage';
import { MessageSquare, Send, Bot } from 'lucide-react';

interface AIChatInlineProps {
  offer: WorkOffer;
  applicants: Applicant[];
}

interface Message {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

export default function AIChatInline({ offer, applicants }: AIChatInlineProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Local fallback logic if API is not available
  const generateFallbackResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple rule-based responses (in production, this would call an AI API)
    if (lowerMessage.includes('top candidate') || lowerMessage.includes('best candidate')) {
      const topCandidate = applicants.sort((a, b) => b.match_score - a.match_score)[0];
      return `The top candidate has a ${topCandidate.match_score}% match score. They have ${topCandidate.experience_years} years of experience and expertise in ${topCandidate.skills.slice(0, 3).join(', ')}. Their education background includes ${topCandidate.education}.`;
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
        return `Comparing the top two candidates:\n\nCandidate 1 (${topTwo[0].match_score}% match): ${topTwo[0].experience_years} years experience, strong in ${topTwo[0].skills.slice(0, 3).join(', ')}.\n\nCandidate 2 (${topTwo[1].match_score}% match): ${topTwo[1].experience_years} years experience, strong in ${topTwo[1].skills.slice(0, 3).join(', ')}.\n\nBoth are excellent candidates, but Candidate 1 has a slightly higher match score.`;
      }
    }
    
    if (lowerMessage.includes('experience') || lowerMessage.includes('years')) {
      const avgExperience = Math.round(applicants.reduce((sum, a) => sum + a.experience_years, 0) / applicants.length);
      return `The average years of experience among applicants is ${avgExperience} years. The range is from ${Math.min(...applicants.map(a => a.experience_years))} to ${Math.max(...applicants.map(a => a.experience_years))} years.`;
    }
    
    // Default response
    return `I understand you're asking about "${userMessage}". Based on the ${applicants.length} applicants for the "${offer.name}" position, I can help you with:\n\n• Candidate comparisons and rankings\n• Skills analysis and trends\n• Match score explanations\n• Job posting details\n• Application statistics\n\nCould you be more specific about what you'd like to know?`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          offer,
          applicants,
        }),
      });

      let answer: string;

      if (!res.ok) {
        // API error, fallback to local rules
        answer = generateFallbackResponse(question);
      } else {
        const data = (await res.json()) as { answer?: string };
        answer = data.answer || generateFallbackResponse(question);
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        question,
        answer,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error calling AI API:', error);
      const newMessage: Message = {
        id: Date.now().toString(),
        question,
        answer: generateFallbackResponse(question),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        marginTop: '32px',
        borderRadius: '24px',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
        border: '1.5px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        padding: '32px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Bot size={24} style={{ color: 'white' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, marginBottom: '4px' }}>
            AI Assistant
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            Ask questions about candidates, skills, or the job posting
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about candidates, skills, or the job..."
          style={{
            flex: 1,
            padding: '14px 18px',
            borderRadius: '12px',
            border: '1.5px solid rgba(0, 119, 181, 0.2)',
            background: 'rgba(255, 255, 255, 0.9)',
            fontSize: '0.875rem',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'all 0.3s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#0077b5';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.2)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
          }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          style={{
            padding: '14px 24px',
            borderRadius: '12px',
            background: input.trim() && !isLoading
              ? 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)'
              : 'rgba(0, 119, 181, 0.3)',
            border: 'none',
            cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: 600,
            boxShadow: input.trim() && !isLoading ? '0 4px 16px rgba(0, 119, 181, 0.3)' : 'none',
          }}
        >
          <Send size={18} />
          Send
        </motion.button>
      </div>

      {/* Messages Table */}
      {messages.length > 0 && (
        <div style={{
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1.5px solid rgba(0, 119, 181, 0.1)',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0, 119, 181, 0.05)', borderBottom: '2px solid rgba(0, 119, 181, 0.1)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', width: '30%' }}>
                    Question
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', width: '70%' }}>
                    Answer
                  </th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message, index) => (
                  <motion.tr
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      borderBottom: '1px solid rgba(0, 119, 181, 0.1)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 119, 181, 0.03)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                        <MessageSquare size={16} style={{ color: '#0077b5', marginTop: '2px', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                            {message.question}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                        <Bot size={16} style={{ color: '#0077b5', marginTop: '2px', flexShrink: 0 }} />
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                          {message.answer}
                        </p>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {isLoading && (
                  <tr>
                    <td colSpan={2} style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
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
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                          AI is thinking...
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {messages.length === 0 && !isLoading && (
        <div style={{
          padding: '48px',
          textAlign: 'center',
          borderRadius: '16px',
          background: 'rgba(0, 119, 181, 0.05)',
          border: '1.5px dashed rgba(0, 119, 181, 0.2)',
        }}>
          <MessageSquare size={48} style={{ color: '#0077b5', marginBottom: '16px', opacity: 0.5 }} />
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            Ask a question to get started. I can help you understand candidates, analyze skills, and answer questions about the job posting.
          </p>
        </div>
      )}

      <div ref={messagesEndRef} />
    </motion.div>
  );
}

