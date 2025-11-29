'use client';

import { supabase } from './supabaseClient';

export interface EnterpriseData {
  // Basic Company Information
  legal_name: string;
  trade_name: string;
  tax_id: string;
  verification_digit: string;
  legal_representative: string;
  company_type: string;
  incorporation_date: string;
  
  // Contact Information
  address: string;
  city: string;
  state: string;
  landline_phone: string;
  mobile_phone: string;
  corporate_email: string;
  website_url: string;
  
  // Required Documents (stored as base64 or file names)
  chamber_of_commerce_certificate: string | null;
  rut_document: string | null;
  legal_representative_id: string | null;
  company_logo: string | null;
  
  // Information for Job Posting
  industry_sector: string;
  company_size: string;
  company_description: string;
  linkedin_url: string;
  facebook_url: string;
  instagram_url: string;
}

export interface UserData {
  email: string;
  name?: string;
  cvFile?: string;
}

export interface WorkOffer {
  vacant_id: number;
  name: string;
  rol: string;
  salary: number;
  description: string;
  availability: 'remote' | 'hybrid' | 'on site';
  location: string;
  create_at: string; // ISO timestamp string
}

export interface Applicant {
  id: number;
  vacant_id: number;
  name: string;
  email: string;
  phone?: string;
  experience_years: number;
  skills: string[];
  education: string;
  match_score: number; // 0-100
  applied_at: string; // ISO timestamp string
  status: 'pending' | 'reviewed' | 'interviewed' | 'rejected' | 'accepted';
  notes?: string;
  cv_link?: string;
}

const STORAGE_KEYS = {
  ENTERPRISE: 'worky_ai_enterprise',
  USER: 'worky_ai_user',
  WORK_OFFERS: 'worky_ai_work_offers',
  APPLICANTS: 'worky_ai_applicants',
};

// Supabase-auth logout helper
export const logout = async () => {
  await supabase.auth.signOut();
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.ENTERPRISE);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
};

// Enterprise functions
export const saveEnterpriseData = (data: EnterpriseData) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ENTERPRISE, JSON.stringify(data));
  }
};

export const getEnterpriseData = (): EnterpriseData | null => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEYS.ENTERPRISE);
    return data ? JSON.parse(data) : null;
  }
  return null;
};

// User functions
export const saveUserData = (data: UserData) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));
  }
};

export const getUserData = (): UserData | null => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  }
  return null;
};

// Work Offer functions (Supabase-backed)
export const getWorkOffers = async (): Promise<WorkOffer[]> => {
  const { data, error } = await supabase
    .from('vacant')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.error('Error fetching work offers from Supabase:', error);
    return [];
  }

  // Map DB rows to WorkOffer shape used in the app
  return data.map((row: any) => ({
    vacant_id: row.id,
    name: row.name,
    rol: row.role,
    salary: row.salary ?? 0,
    description: row.description ?? '',
    availability: row.availability === 'on_site' ? 'on site' : row.availability,
    location: row.location ?? '',
    create_at: row.created_at,
  }));
};

export const addWorkOffer = async (
  offer: Omit<WorkOffer, 'vacant_id' | 'create_at'>,
): Promise<WorkOffer | null> => {
  const availabilityDb =
    offer.availability === 'on site' ? 'on_site' : offer.availability;

  const { data, error } = await supabase
    .from('vacant')
    .insert({
      name: offer.name,
      role: offer.rol,
      salary: offer.salary,
      description: offer.description,
      availability: availabilityDb,
      location: offer.location,
    })
    .select('*')
    .single();

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.error('Error inserting work offer into Supabase:', error);
    return null;
  }

  return {
    vacant_id: data.id,
    name: data.name,
    rol: data.role,
    salary: data.salary ?? 0,
    description: data.description ?? '',
    availability: data.availability === 'on_site' ? 'on site' : data.availability,
    location: data.location ?? '',
    create_at: data.created_at,
  };
};

export const deleteWorkOffer = async (vacant_id: number): Promise<void> => {
  const { error } = await supabase.from('vacant').delete().eq('id', vacant_id);
  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting work offer from Supabase:', error);
  }
};

// Applicant functions
export const saveApplicants = (applicants: Applicant[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(applicants));
  }
};

export const getApplicants = (): Applicant[] => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEYS.APPLICANTS);
    return data ? JSON.parse(data) : [];
  }
  return [];
};

export const getApplicantsByVacantId = (vacant_id: number): Applicant[] => {
  return getApplicants().filter(a => a.vacant_id === vacant_id);
};

export const addApplicant = (applicant: Omit<Applicant, 'id' | 'applied_at'>): Applicant => {
  const applicants = getApplicants();
  const newId = applicants.length > 0 ? Math.max(...applicants.map(a => a.id)) + 1 : 1;
  const newApplicant: Applicant = {
    ...applicant,
    id: newId,
    applied_at: new Date().toISOString(),
  };
  applicants.push(newApplicant);
  saveApplicants(applicants);
  return newApplicant;
};

// Initialize mock applicants if none exist
export const initializeMockApplicants = (vacant_id: number) => {
  const existing = getApplicantsByVacantId(vacant_id);
  if (existing.length === 0) {
    const mockApplicants: Omit<Applicant, 'id' | 'applied_at'>[] = [
      {
        vacant_id,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        experience_years: 5,
        skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker'],
        education: 'BS Computer Science, MIT',
        match_score: 95,
        status: 'pending',
        cv_link: 'https://example.com/cv/sarah-johnson.pdf',
      },
      {
        vacant_id,
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+1 (555) 234-5678',
        experience_years: 7,
        skills: ['Python', 'Django', 'PostgreSQL', 'Kubernetes', 'CI/CD'],
        education: 'MS Software Engineering, Stanford',
        match_score: 92,
        status: 'pending',
        cv_link: 'https://example.com/cv/michael-chen.pdf',
      },
      {
        vacant_id,
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@email.com',
        phone: '+1 (555) 345-6789',
        experience_years: 4,
        skills: ['JavaScript', 'Vue.js', 'MongoDB', 'GraphQL', 'Redis'],
        education: 'BS Information Systems, UC Berkeley',
        match_score: 88,
        status: 'pending',
        cv_link: 'https://example.com/cv/emily-rodriguez.pdf',
      },
      {
        vacant_id,
        name: 'David Kim',
        email: 'david.kim@email.com',
        phone: '+1 (555) 456-7890',
        experience_years: 6,
        skills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'Elasticsearch'],
        education: 'BS Computer Engineering, Carnegie Mellon',
        match_score: 90,
        status: 'reviewed',
        cv_link: 'https://example.com/cv/david-kim.pdf',
      },
      {
        vacant_id,
        name: 'Jessica Martinez',
        email: 'jessica.martinez@email.com',
        phone: '+1 (555) 567-8901',
        experience_years: 3,
        skills: ['React', 'Next.js', 'Tailwind CSS', 'Firebase', 'Git'],
        education: 'BS Web Development, General Assembly',
        match_score: 85,
        status: 'pending',
        cv_link: 'https://example.com/cv/jessica-martinez.pdf',
      },
      {
        vacant_id,
        name: 'Robert Taylor',
        email: 'robert.taylor@email.com',
        phone: '+1 (555) 678-9012',
        experience_years: 8,
        skills: ['C#', '.NET', 'SQL Server', 'Azure', 'Docker'],
        education: 'BS Computer Science, University of Washington',
        match_score: 87,
        status: 'pending',
        cv_link: 'https://example.com/cv/robert-taylor.pdf',
      },
      {
        vacant_id,
        name: 'Amanda White',
        email: 'amanda.white@email.com',
        phone: '+1 (555) 789-0123',
        experience_years: 4,
        skills: ['Python', 'Flask', 'PostgreSQL', 'Docker', 'Linux'],
        education: 'BS Software Engineering, Georgia Tech',
        match_score: 83,
        status: 'pending',
        cv_link: 'https://example.com/cv/amanda-white.pdf',
      },
      {
        vacant_id,
        name: 'James Wilson',
        email: 'james.wilson@email.com',
        phone: '+1 (555) 890-1234',
        experience_years: 5,
        skills: ['JavaScript', 'Express.js', 'MongoDB', 'React', 'Node.js'],
        education: 'BS Computer Science, UT Austin',
        match_score: 86,
        status: 'reviewed',
        cv_link: 'https://example.com/cv/james-wilson.pdf',
      },
    ];
    
    mockApplicants.forEach(applicant => addApplicant(applicant));
  }
};

// File to base64 conversion
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

