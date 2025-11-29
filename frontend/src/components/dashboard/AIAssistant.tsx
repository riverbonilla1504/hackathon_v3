'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { X, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { addWorkOffer, getAllApplicantsFromSupabase, WorkOffer, Applicant } from '@/lib/storage';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTranslation } from '@/contexts/TranslationContext';
import MarkdownRenderer from './MarkdownRenderer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface WorkOfferDraft {
  name?: string;
  rol?: string;
  salary?: number;
  description?: string;
  availability?: 'remote' | 'hybrid' | 'on site';
  location?: string;
}

interface AIAssistantProps {
  currentPage?: string;
  workOffersCount?: number;
  workOffers?: WorkOffer[];
  hasProfile?: boolean;
  enterpriseName?: string;
  companyId?: number;
  onNavigate?: (page: string) => void;
  onWorkOfferCreated?: () => void;
}

export default function AIAssistant({ 
  currentPage = 'dashboard', 
  workOffersCount = 0,
  workOffers = [],
  hasProfile = false,
  enterpriseName,
  companyId,
  onNavigate,
  onWorkOfferCreated
}: AIAssistantProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animationData, setAnimationData] = useState<any>(null);
  const [showContinue, setShowContinue] = useState(false);
  const [waitingForContinue, setWaitingForContinue] = useState(false);
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  const [workOfferDraft, setWorkOfferDraft] = useState<WorkOfferDraft>({});
  const [botPosition, setBotPosition] = useState<{ x: number; y: number } | null>(null);
  const [botTarget, setBotTarget] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);

  useEffect(() => {
    // Load animation.json
    fetch('/animation.json')
      .then(res => res.json())
      .then(data => {
        if (data.v && data.fr) {
          setAnimationData(data);
        }
      })
      .catch(() => {});

    // Load applicants when work offers are available or when chat opens
    const loadApplicants = async () => {
      if (workOffers.length > 0) {
        try {
          const vacantIds = workOffers.map(offer => offer.vacant_id);
          const applicants = await getAllApplicantsFromSupabase(vacantIds);
          setAllApplicants(applicants);
        } catch (error) {
          console.error('Error loading applicants for AI assistant:', error);
          setAllApplicants([]);
        }
      } else {
        setAllApplicants([]);
      }
    };

    // Load applicants when chat opens or when work offers change
    if (isOpen) {
      loadApplicants();
    }

    // Add welcome message when opening
    if (isOpen && messages.length === 0) {
      const greeting = enterpriseName 
        ? t('ai.welcomeGreeting').replace('{name}', enterpriseName)
        : t('ai.welcome');
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `${greeting} ${t('ai.welcomeMessage')}`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, enterpriseName, workOffers]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showContinue]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Animate bot to target position
  useEffect(() => {
    if (botTarget && isOpen) {
      let targetElement: HTMLElement | null = null;
      let targetPosition = { x: 0, y: 0 };

      // Use data attributes to find elements
      switch (botTarget) {
        case 'sidebar':
          targetElement = document.querySelector('[data-ai-target="sidebar"]') as HTMLElement;
          break;
        case 'create':
          targetElement = document.querySelector('[data-ai-target="create"]') as HTMLElement;
          break;
        case 'offers':
          targetElement = document.querySelector('[data-ai-target="offers"]') as HTMLElement;
          break;
        case 'profile':
          targetElement = document.querySelector('[data-ai-target="profile"]') as HTMLElement;
          break;
      }

      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        targetPosition = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }

      if (targetPosition.x > 0 && targetPosition.y > 0) {
        setBotPosition(targetPosition);
        // Reset after animation
        setTimeout(() => {
          setBotPosition(null);
          setBotTarget(null);
        }, 2000);
      }
    }
  }, [botTarget, isOpen]);

  const extractWorkOfferInfo = (text: string): Partial<WorkOfferDraft> => {
    const info: Partial<WorkOfferDraft> = {};
    const lower = text.toLowerCase();
    const lines = text.split(/\n|,|;/).map(l => l.trim()).filter(l => l.length > 0);

    // Extract availability first (it's easy to detect)
    if (lower.includes('remote') && !lower.includes('hybrid') && !lower.includes('on site')) {
      info.availability = 'remote';
    } else if (lower.includes('hybrid')) {
      info.availability = 'hybrid';
    } else if (lower.includes('on site') || lower.includes('onsite') || lower.includes('on-site') || lower.includes('on_site')) {
      info.availability = 'on site';
    }

    // Try to extract from structured format first (with labels)
    const nameMatch = text.match(/(?:name|title|position|job)(?:\s+is)?:\s*["']?([^"'\n,;]+)["']?/i) ||
                     text.match(/(?:create|post|add)\s+(?:a\s+)?(?:work\s+offer|job)\s+(?:for\s+)?["']?([^"'\n,;]+)["']?/i);
    if (nameMatch) {
      info.name = nameMatch[1].trim();
    }

    const roleMatch = text.match(/(?:role|position|type)(?:\s+is)?\s+(?:is\s+)?["']?([^"'\n,;]+)["']?/i) ||
                     text.match(/(?:the\s+)?role\s+is\s+["']?([^"'\n,;]+)["']?/i);
    if (roleMatch) {
      const roleValue = roleMatch[1].trim();
      // Make sure it's not just "role" or "is"
      if (roleValue.toLowerCase() !== 'role' && roleValue.toLowerCase() !== 'is' && roleValue.length > 0) {
        info.rol = roleValue;
      }
    }

    const salaryMatch = text.match(/(?:salary|pay|compensation)(?:\s+is)?:\s*\$?([\d,]+)\s*(?:usd|dollars?)?/i) ||
                       text.match(/(?:paying|pay)\s+\$?([\d,]+)\s*(?:usd|dollars?)?/i);
    if (salaryMatch) {
      info.salary = parseFloat(salaryMatch[1].replace(/,/g, ''));
    }

    const locationMatch = text.match(/(?:location|city|where)(?:\s+is)?(?:\s+is\s+)?(?:in\s+)?["']?([^"'\n,;]+)["']?/i) ||
                         text.match(/(?:the\s+)?location\s+is\s+(?:in\s+)?["']?([^"'\n,;]+)["']?/i) ||
                         text.match(/in\s+["']?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)["']?/);
    if (locationMatch) {
      const locValue = locationMatch[1].trim();
      // Make sure it's not just "location" or "is" or "in"
      if (locValue.toLowerCase() !== 'location' && locValue.toLowerCase() !== 'is' && 
          locValue.toLowerCase() !== 'in' && locValue.length > 0) {
        info.location = locValue;
      }
    }

    const descMatch = text.match(/(?:description|details|about)(?:\s+is)?:\s*["']?([^"'\n]+)["']?/i);
    if (descMatch) {
      info.description = descMatch[1].trim();
    }

    // If we have multiple lines, parse them as a list (common format)
    if (lines.length >= 2) {
      // First line is often the job title/name
      if (!info.name && lines[0]) {
        const firstLine = lines[0].toLowerCase();
        // Skip if it's a label
        if (!firstLine.match(/^(name|title|role|salary|location|description|remote|hybrid|on site|employee|usd|dollars?|create|job|position)/i)) {
          // Check if it looks like a job title
          if (firstLine.includes('developer') || firstLine.includes('engineer') || 
              firstLine.includes('designer') || firstLine.includes('manager') ||
              firstLine.includes('analyst') || firstLine.includes('specialist') ||
              firstLine.includes('front') || firstLine.includes('back') ||
              firstLine.length > 5) {
            info.name = lines[0].trim();
          }
        }
      }

      // Look for salary in any line (numbers with USD)
      for (const line of lines) {
        if (!info.salary) {
          const salaryPattern = line.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:usd|dollars?|\$)/i) || 
                               line.match(/\$(\d+(?:,\d+)*(?:\.\d+)?)/i) ||
                               line.match(/(\d+)\s*(?:usd|dollars?)/i);
          if (salaryPattern) {
            info.salary = parseFloat(salaryPattern[1].replace(/,/g, ''));
          }
        }
      }

      // Look for role/employee type
      for (const line of lines) {
        if (!info.rol) {
          const lowerLine = line.toLowerCase().trim();
          // Check if it's a role type
          if (lowerLine === 'employee' || lowerLine === 'employer' || 
              lowerLine === 'contractor' || lowerLine === 'freelancer' ||
              lowerLine === 'intern' || lowerLine === 'part-time' ||
              lowerLine === 'full-time' || lowerLine === 'part time' ||
              lowerLine === 'full time') {
            info.rol = line.trim();
          }
        }
      }
      
      // Also check the full text for role mentions
      if (!info.rol) {
        const roleMatch = lower.match(/\b(employee|employer|contractor|freelancer|intern|part-time|full-time|part time|full time)\b/i);
        if (roleMatch) {
          info.rol = roleMatch[1].trim();
        }
      }
      
      // If the entire message is just a role word, use it
      if (!info.rol && lines.length === 1) {
        const singleLine = lines[0].toLowerCase().trim();
        if (singleLine === 'employee' || singleLine === 'employer' || 
            singleLine === 'contractor' || singleLine === 'freelancer' ||
            singleLine === 'intern' || singleLine === 'part-time' ||
            singleLine === 'full-time' || singleLine === 'part time' ||
            singleLine === 'full time') {
          info.rol = lines[0].trim();
        }
      }

      // Look for location (city names - usually short, no numbers, not common job words)
      for (const line of lines) {
        if (!info.location) {
          const lowerLine = line.toLowerCase().trim();
          // Skip if it's a known field or contains numbers
          const excludedWords = ['name', 'title', 'role', 'salary', 'location', 'description', 'remote', 'hybrid', 'on site', 'employee', 'usd', 'dollars', 'create', 'job', 'position', 'front', 'back', 'developer', 'engineer', 'designer', 'manager', 'analyst', 'specialist', 'work', 'nice', 'people', 'offering', 'paying', 'where', 'is', 'in', 'at', 'the'];
          const isExcluded = excludedWords.some(word => lowerLine === word || lowerLine.startsWith(word + ' ') || lowerLine.endsWith(' ' + word));
          
          if (!isExcluded &&
              !line.match(/\d/) && // No numbers
              line.length >= 3 && line.length <= 50 && // Reasonable city name length
              line !== info.name && line !== info.rol &&
              !lowerLine.includes('developer') && !lowerLine.includes('employee') &&
              !lowerLine.includes('usd') && !lowerLine.includes('dollar')) {
            // Likely a location
            info.location = line.trim();
          }
        }
      }
      
      // Also check for "in [location]" or "location is [location]" patterns
      if (!info.location) {
        const locationPatterns = [
          text.match(/location\s+(?:is\s+)?(?:in\s+)?["']?([^"'\n,;]+)["']?/i),
          text.match(/in\s+["']?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)["']?/),
          text.match(/at\s+["']?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)["']?/),
          text.match(/(?:the\s+)?location\s+is\s+(?:in\s+)?["']?([^"'\n,;]+)["']?/i),
        ];
        for (const match of locationPatterns) {
          if (match && match[1]) {
            const loc = match[1].trim();
            // Make sure it's not a job title or other field
            if (loc.length >= 3 && loc.length <= 50 && 
                !loc.toLowerCase().match(/^(name|title|role|salary|description|remote|hybrid|on site|employee|usd|dollars?|developer|engineer|is|in|at|the)$/i) &&
                !loc.match(/\d/)) {
              info.location = loc;
              break;
            }
          }
        }
      }
      
      // If the entire message is just a location word (like "pasto"), use it
      if (!info.location && lines.length === 1) {
        const singleLine = lines[0].trim();
        const lowerSingle = singleLine.toLowerCase();
        // Check if it's not a known field word
        if (singleLine.length >= 3 && singleLine.length <= 50 &&
            !lowerSingle.match(/^(name|title|role|salary|location|description|remote|hybrid|on site|employee|usd|dollars?|developer|engineer|is|in|at|the|create|job|position|work|offer)$/i) &&
            !singleLine.match(/\d/)) {
          // Capitalize first letter if needed
          info.location = singleLine.charAt(0).toUpperCase() + singleLine.slice(1).toLowerCase();
        }
      }

      // Look for description (usually longer text, often last)
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        if (!info.description) {
          const lowerLine = line.toLowerCase();
          // Longer text that doesn't match other patterns
          if (line.length > 15 && 
              !lowerLine.match(/^(name|title|role|salary|location|remote|hybrid|on site|employee|usd|dollars?)/i) &&
              !line.match(/^\d+/) && // Doesn't start with number
              line !== info.name && line !== info.rol && line !== info.location) {
            info.description = line.trim();
          }
        }
      }
    }

    // Fallback: extract from common patterns in the full text
    if (!info.name) {
      // Look for job titles
      const titlePatterns = [
        /(?:front\s+end|frontend|backend|back\s+end|full\s+stack|fullstack|software|web|mobile|devops|data|ui|ux)\s+(?:developer|engineer|designer|analyst|architect|specialist)/i,
        /(?:senior|junior|lead|principal|mid|mid-level)\s+(?:developer|engineer|designer|analyst|architect)/i,
        /(?:project|product|marketing|sales|hr|accounting|finance)\s+(?:manager|director|coordinator|specialist)/i,
      ];
      for (const pattern of titlePatterns) {
        const match = text.match(pattern);
        if (match) {
          info.name = match[0].trim();
          break;
        }
      }
      // If still no match, check first significant word/phrase
      if (!info.name && lines.length > 0) {
        const firstLine = lines[0];
        if (firstLine.length > 3 && !firstLine.match(/^\d/)) {
          info.name = firstLine.trim();
        }
      }
    }

    // Extract salary from various formats
    if (!info.salary) {
      const salaryPatterns = [
        text.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:usd|dollars?)/i),
        text.match(/\$(\d+(?:,\d+)*(?:\.\d+)?)/i),
        text.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:per\s+)?(?:month|year|hour)/i),
        text.match(/(\d+)\s*(?:usd|dollars?)/i),
      ];
      for (const match of salaryPatterns) {
        if (match) {
          info.salary = parseFloat(match[1].replace(/,/g, ''));
          break;
        }
      }
    }

    // Extract location (city names) - look for capitalized words
    if (!info.location) {
      // Look for words that might be city names
      const words = text.split(/\s+/);
      for (const word of words) {
        const trimmed = word.trim().replace(/[.,;!?]/g, '');
        if (trimmed.length >= 3 && trimmed.length <= 30 &&
            /^[A-Z]/.test(trimmed) && // Starts with capital
            !trimmed.match(/\d/) && // No numbers
            !['Front', 'End', 'Backend', 'Full', 'Stack', 'Software', 'Web', 'Mobile', 
              'Senior', 'Junior', 'Lead', 'Principal', 'Employee', 'USD', 'Dollars'].includes(trimmed)) {
          info.location = trimmed;
          break;
        }
      }
    }

    // Clean up extracted values
    if (info.name) info.name = info.name.replace(/^["']|["']$/g, '').trim();
    if (info.rol) info.rol = info.rol.replace(/^["']|["']$/g, '').trim();
    if (info.location) info.location = info.location.replace(/^["']|["']$/g, '').trim();
    if (info.description) info.description = info.description.replace(/^["']|["']$/g, '').trim();

    return info;
  };

  const getMissingFields = (draft: WorkOfferDraft): string[] => {
    const missing: string[] = [];
    if (!draft.name) missing.push('name');
    if (!draft.rol) missing.push('role');
    if (!draft.salary) missing.push('salary');
    if (!draft.description) missing.push('description');
    if (!draft.availability) missing.push('availability type (remote/hybrid/on site)');
    if (!draft.location) missing.push('location');
    return missing;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const userInput = input.trim();
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowContinue(false);
    setWaitingForContinue(false);

    try {
      // Check if user wants to create a work offer
      const lowerInput = userInput.toLowerCase();
      const wantsToCreate = lowerInput.includes('create') && 
                           (lowerInput.includes('work offer') || lowerInput.includes('job') || lowerInput.includes('position'));

      if (wantsToCreate || isCreatingOffer) {
        // Extract information from user input
        const extractedInfo = extractWorkOfferInfo(userInput);
        // Merge with existing draft, but only update fields that were actually extracted
        const updatedDraft: WorkOfferDraft = { ...workOfferDraft };
        if (extractedInfo.name) updatedDraft.name = extractedInfo.name;
        if (extractedInfo.rol) updatedDraft.rol = extractedInfo.rol;
        if (extractedInfo.salary) updatedDraft.salary = extractedInfo.salary;
        if (extractedInfo.description) updatedDraft.description = extractedInfo.description;
        if (extractedInfo.availability) updatedDraft.availability = extractedInfo.availability;
        if (extractedInfo.location) updatedDraft.location = extractedInfo.location;
        
        setWorkOfferDraft(updatedDraft);
        setIsCreatingOffer(true);

        const missing = getMissingFields(updatedDraft);
        
        if (missing.length === 0) {
          // All fields collected, create the offer
          try {
            const created = await addWorkOffer({
              name: updatedDraft.name!,
              rol: updatedDraft.rol!,
              salary: updatedDraft.salary!,
              description: updatedDraft.description!,
              availability: updatedDraft.availability!,
              location: updatedDraft.location!,
            });

            if (created) {
              const successMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `**Great!** I've successfully created your work offer:\n\n• **Name:** ${updatedDraft.name}\n• **Role:** ${updatedDraft.rol}\n• **Salary:** $${updatedDraft.salary?.toLocaleString()}\n• **Location:** ${updatedDraft.location}\n• **Type:** ${updatedDraft.availability}\n\nYour work offer is now live and ready to receive applications! 🎉`,
                timestamp: new Date(),
              };
              setMessages(prev => [...prev, successMessage]);
              setIsCreatingOffer(false);
              setWorkOfferDraft({});
              showSuccess('Work offer created successfully!');
              if (onWorkOfferCreated) onWorkOfferCreated();
            } else {
              throw new Error('Failed to create work offer');
            }
          } catch (error) {
            const errorMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `I encountered an error while creating the work offer. Please try again or use the "Create Offer" form in the sidebar.`,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
            setIsCreatingOffer(false);
            showError('Failed to create work offer');
          }
        } else {
          // Ask for missing fields
          const fieldNames = {
            name: 'job title/name',
            rol: 'role/position type',
            salary: 'salary amount',
            description: 'job description',
            'availability type (remote/hybrid/on site)': 'availability type (remote, hybrid, or on site)',
            location: 'location',
          };

          const missingFieldsText = missing.map(f => `• **${fieldNames[f as keyof typeof fieldNames] || f}**`).join('\n');
          
          // Show what we have so far
          const currentInfo = [];
          if (updatedDraft.name) currentInfo.push(`• **Name:** ${updatedDraft.name}`);
          if (updatedDraft.rol) currentInfo.push(`• **Role:** ${updatedDraft.rol}`);
          if (updatedDraft.salary) currentInfo.push(`• **Salary:** $${updatedDraft.salary.toLocaleString()}`);
          if (updatedDraft.location) currentInfo.push(`• **Location:** ${updatedDraft.location}`);
          if (updatedDraft.availability) currentInfo.push(`• **Type:** ${updatedDraft.availability}`);
          if (updatedDraft.description) currentInfo.push(`• **Description:** ${updatedDraft.description}`);
          
          const currentInfoText = currentInfo.length > 0 
            ? `\n\n**What I have so far:**\n${currentInfo.join('\n')}\n`
            : '';
          
          const questionMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `I need a bit more information to create your work offer. Please provide:\n\n${missingFieldsText}${currentInfoText}\n\nYou can tell me all at once or one at a time!`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, questionMessage]);
        }
        setIsLoading(false);
        setWaitingForContinue(true);
        return;
      }

      // Check for navigation requests
      if (lowerInput.includes('check') || lowerInput.includes('show') || lowerInput.includes('where') || lowerInput.includes('find')) {
        if (lowerInput.includes('create') || lowerInput.includes('offer form')) {
          setBotTarget('create');
        } else if (lowerInput.includes('offer') || lowerInput.includes('job')) {
          setBotTarget('offers');
        } else if (lowerInput.includes('profile')) {
          setBotTarget('profile');
        } else if (lowerInput.includes('sidebar') || lowerInput.includes('menu')) {
          setBotTarget('sidebar');
        }
      }

      // Regular AI chat - include work offers and applicants data
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userInput,
          context: {
            currentPage,
            workOffersCount,
            hasProfile,
            enterpriseName,
            companyId,
            isCreatingOffer,
            workOfferDraft: isCreatingOffer ? workOfferDraft : undefined,
            workOffers: workOffers.map(offer => ({
              vacant_id: offer.vacant_id,
              name: offer.name,
              rol: offer.rol,
              salary: offer.salary,
              description: offer.description,
              availability: offer.availability,
              location: offer.location,
              created_at: offer.create_at,
            })),
            applicants: allApplicants.map(applicant => ({
              id: applicant.id,
              vacant_id: applicant.vacant_id,
              name: applicant.name,
              email: applicant.email,
              experience_years: applicant.experience_years,
              skills: applicant.skills,
              education: applicant.education,
              match_score: applicant.match_score,
              status: applicant.status,
              applied_at: applicant.applied_at,
            })),
          },
        }),
      });

      let answer: string;

      if (!res.ok) {
        answer = generateFallbackResponse(userInput);
      } else {
        const data = (await res.json()) as { answer?: string };
        answer = data.answer || generateFallbackResponse(userInput);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Check if user wants to create an offer and navigate if needed
      if (onNavigate && (lowerInput.includes('create') || lowerInput.includes('work offer') || lowerInput.includes('post job')) && 
          (lowerInput.includes('help') || lowerInput.includes('guide') || lowerInput.includes('show') || lowerInput.includes('take me'))) {
        setTimeout(() => {
          onNavigate('create');
        }, 1000);
      }
      
      // Show continue button after response
      setWaitingForContinue(true);
    } catch (error) {
      console.error('Error calling AI assistant:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateFallbackResponse(userInput),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setWaitingForContinue(true);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    const greeting = enterpriseName ? `**${enterpriseName}**, ` : '';

    // Check if asking about participants/applicants/work offers
    if (lowerQuestion.includes('participant') || lowerQuestion.includes('aplicante') || lowerQuestion.includes('cuantos') || lowerQuestion.includes('cuántos')) {
      if (workOffers.length === 0) {
        return `${greeting}Actualmente no tienes ofertas de trabajo creadas. Para comenzar, puedes crear una oferta desde el menú "Crear Oferta" en la barra lateral.`;
      }

      if (allApplicants.length === 0) {
        return `${greeting}Actualmente tienes **${workOffers.length}** ${workOffers.length === 1 ? 'oferta' : 'ofertas'} de trabajo, pero aún no has recibido aplicantes. Puedes compartir tus ofertas para comenzar a recibir aplicaciones.`;
      }

      let response = `${greeting}Aquí tienes un resumen de tus participantes:\n\n`;
      response += `**Total de Aplicantes:** ${allApplicants.length}\n\n`;
      
      // Summary by offer
      workOffers.forEach(offer => {
        const applicantsForOffer = allApplicants.filter(app => app.vacant_id === offer.vacant_id);
        if (applicantsForOffer.length > 0) {
          const approved = applicantsForOffer.filter(app => app.status === 'approved').length;
          const rejected = applicantsForOffer.filter(app => app.status === 'rejected').length;
          const pending = applicantsForOffer.filter(app => app.status === 'pending').length;
          
          response += `**${offer.name}:**\n`;
          response += `• Total: ${applicantsForOffer.length} aplicante(s)\n`;
          response += `• Aprobados: ${approved}\n`;
          response += `• Rechazados: ${rejected}\n`;
          response += `• Pendientes: ${pending}\n\n`;
        }
      });

      return response;
    }

    if (lowerQuestion.includes('create') || lowerQuestion.includes('work offer') || lowerQuestion.includes('post') || lowerQuestion.includes('job')) {
      return `${greeting}Para crear una oferta de trabajo:\n\n1. Haz clic en **"Crear Oferta"** en la barra lateral\n2. Completa los detalles del trabajo:\n   • **Nombre:** Título del trabajo (ej: "Desarrollador Senior")\n   • **Rol:** Tipo de posición (ej: "Ingeniero de Software")\n   • **Salario:** Monto de compensación\n   • **Tipo:** Remoto, Híbrido o Presencial\n   • **Ubicación:** Ciudad/País\n   • **Descripción:** Requisitos y responsabilidades\n3. Haz clic en **"Crear Oferta"**\n\n¡O puedes decirme los detalles y lo crearé por ti!`;
    }

    if (lowerQuestion.includes('applicant') || lowerQuestion.includes('candidate') || lowerQuestion.includes('review') || lowerQuestion.includes('aplicante')) {
      return `Para revisar aplicantes:\n\n1. Ve a **"Ofertas de Trabajo"** en la barra lateral\n2. Haz clic en cualquier oferta para ver los detalles\n3. Revisa el resumen de IA con los mejores candidatos\n4. Navega todos los aplicantes en la tabla\n5. Usa el chat de IA para hacer preguntas sobre los candidatos`;
    }

    if (lowerQuestion.includes('navigate') || lowerQuestion.includes('where') || lowerQuestion.includes('how to')) {
      return `Here's how to navigate:\n\n• **Overview:** See statistics and quick actions\n• **Work Offers:** View and manage all your job postings\n• **Create Offer:** Post a new job opening\n• **Profile:** Edit your enterprise information\n\nUse the sidebar on the left to switch between sections!`;
    }

    if (lowerQuestion.includes('ai') || lowerQuestion.includes('assistant') || lowerQuestion.includes('feature')) {
      return `Worky AI uses AI to:\n\n• Match candidates to your job offers\n• Generate summaries of top applicants\n• Answer questions about your offers and candidates\n• Provide insights and recommendations\n\nTry asking me about your work offers or applicants!`;
    }

    if (lowerQuestion.includes('profile') || lowerQuestion.includes('edit') || lowerQuestion.includes('company')) {
      return `${greeting}To edit your profile:\n\n1. Click **"Profile"** in the sidebar\n2. Click **"Edit Profile"**\n3. Update your information\n4. Upload a company logo\n5. Click **"Save Changes"**\n\nYou can also share your profile with a public link!`;
    }

    return `${greeting}I'm here to help! You can ask me about:\n\n• Creating work offers\n• Managing applicants\n• Using AI features\n• Navigating the platform\n• Profile management\n\nWhat would you like to know?`;
  };

  const handleContinue = () => {
    setShowContinue(false);
    setWaitingForContinue(false);
    
    // Suggest next steps based on context
    const suggestions: Message[] = [];
    const greeting = enterpriseName ? `**${enterpriseName}**, ` : '';
    
    if (workOffersCount === 0) {
      suggestions.push({
        id: Date.now().toString(),
        role: 'assistant',
        content: `${greeting}You don't have any work offers yet. Let me help you create your first one!\n\nJust tell me:\n• What position you're hiring for\n• The role/type\n• Salary range\n• Location\n• Work type (remote/hybrid/on site)\n• Job description\n\nI'll create it for you!`,
        timestamp: new Date(),
      });
    } else if (!hasProfile) {
      suggestions.push({
        id: Date.now().toString(),
        role: 'assistant',
        content: `${greeting}Complete your profile to make your company more attractive to candidates. Click **"Profile"** in the sidebar to get started!`,
        timestamp: new Date(),
      });
    } else {
      suggestions.push({
        id: Date.now().toString(),
        role: 'assistant',
        content: `${greeting}Check out your work offers to see applicant summaries and use AI insights to find the best candidates! You can also create more offers if needed.`,
        timestamp: new Date(),
      });
    }

    if (suggestions.length > 0) {
      setMessages(prev => [...prev, ...suggestions]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Animated Bot (moves across screen) */}
      {botPosition && animationData && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: botPosition.x - 32,
            y: botPosition.y - 32,
          }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            width: '64px',
            height: '64px',
            zIndex: 10002,
            pointerEvents: 'none',
          }}
        >
          <Lottie
            animationData={animationData}
            loop
            autoplay
            style={{ width: '64px', height: '64px' }}
          />
        </motion.div>
      )}

      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0, 119, 181, 0.4)',
          zIndex: 9999,
          overflow: 'hidden',
        }}
      >
        {animationData ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lottie
              animationData={animationData}
              loop
              autoplay
              style={{ width: '80px', height: '80px' }}
            />
          </div>
        ) : (
          <Sparkles size={32} style={{ color: 'white' }} />
        )}
      </motion.button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(4px)',
                zIndex: 10000,
              }}
            />

            {/* Chat Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                position: 'fixed',
                bottom: '100px',
                right: '24px',
                width: '420px',
                maxWidth: 'calc(100vw - 48px)',
                height: '600px',
                maxHeight: 'calc(100vh - 140px)',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1.5px solid rgba(0, 119, 181, 0.2)',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 10001,
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                style={{
                  padding: '20px',
                  borderBottom: '1.5px solid rgba(0, 119, 181, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.1) 0%, rgba(0, 160, 220, 0.05) 100%)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {animationData ? (
                    <div style={{ width: '40px', height: '40px' }}>
                      <Lottie
                        animationData={animationData}
                        loop
                        autoplay
                        style={{ width: '40px', height: '40px' }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Sparkles size={20} style={{ color: 'white' }} />
                    </div>
                  )}
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {t('ai.chatTitle')}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {isCreatingOffer ? t('ai.creatingOffer') : t('ai.help')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsCreatingOffer(false);
                    setWorkOfferDraft({});
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(0, 0, 0, 0.05)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <X size={18} style={{ color: 'var(--text-primary)' }} />
                </button>
              </div>

              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '85%',
                        padding: message.role === 'assistant' ? '16px 18px' : '12px 16px',
                        borderRadius: '16px',
                        background: message.role === 'user'
                          ? 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)'
                          : 'rgba(255, 255, 255, 0.95)',
                        border: message.role === 'assistant' ? '1px solid rgba(0, 119, 181, 0.15)' : 'none',
                        color: message.role === 'user' ? 'white' : 'var(--text-primary)',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        boxShadow: message.role === 'assistant' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                      }}
                    >
                      {message.role === 'assistant' ? (
                        <MarkdownRenderer content={message.content} />
                      ) : (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-secondary)',
                        marginTop: '4px',
                        padding: '0 4px',
                      }}
                    >
                      {message.timestamp.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      borderRadius: '16px',
                      background: 'rgba(0, 119, 181, 0.1)',
                      maxWidth: '80%',
                    }}
                  >
                    <motion.div
                      animate={{
                        opacity: [1, 0.5, 1],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#0077b5',
                      }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Thinking...
                    </span>
                  </motion.div>
                )}

                {waitingForContinue && !showContinue && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: '8px',
                    }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleContinue}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(0, 119, 181, 0.3)',
                      }}
                    >
                      <CheckCircle2 size={18} />
                      Continue
                    </motion.button>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div
                style={{
                  padding: '16px 20px',
                  borderTop: '1.5px solid rgba(0, 119, 181, 0.1)',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-end',
                }}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={isCreatingOffer ? "Provide the missing information..." : "Ask me anything..."}
                  disabled={isLoading}
                  rows={1}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(0, 119, 181, 0.2)',
                    background: 'rgba(255, 255, 255, 0.8)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.3s',
                    resize: 'none',
                    maxHeight: '120px',
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0077b5';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 119, 181, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 119, 181, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: isLoading || !input.trim()
                      ? 'rgba(0, 119, 181, 0.3)'
                      : 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                    border: 'none',
                    cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isLoading || !input.trim()
                      ? 'none'
                      : '0 4px 12px rgba(0, 119, 181, 0.3)',
                    flexShrink: 0,
                  }}
                >
                  <Send size={20} style={{ color: 'white' }} />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
