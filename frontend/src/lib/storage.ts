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

export interface Skill {
  name: string;
  importance: number; // 1-5 scale
  must_have: boolean;
}

export interface WorkOffer {
  vacant_id: number;
  name: string;
  rol: string;
  salary: number;
  description: string;
  availability: 'remote' | 'hybrid' | 'on site';
  location: string;
  required_skills?: Skill[]; // Array of skill objects with name, importance, and must_have
  create_at: string; // ISO timestamp string
}

// Helper function to normalize skills from various formats (backward compatibility)
const normalizeSkills = (skills: any): Skill[] => {
  if (!Array.isArray(skills)) return [];
  
  return skills.map((skill: any) => {
    // If it's already a Skill object
    if (typeof skill === 'object' && skill !== null && 'name' in skill) {
      return {
        name: skill.name || '',
        importance: typeof skill.importance === 'number' ? Math.max(1, Math.min(5, skill.importance)) : 3,
        must_have: typeof skill.must_have === 'boolean' ? skill.must_have : false,
      };
    }
    // If it's a string (old format), convert to Skill object
    if (typeof skill === 'string') {
      return {
        name: skill,
        importance: 3, // Default importance
        must_have: false, // Default to false for backward compatibility
      };
    }
    // Invalid format, return default
    return {
      name: String(skill) || '',
      importance: 3,
      must_have: false,
    };
  });
};

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
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  cv_link?: string;
  cv_path?: string; // Path in Supabase Storage
  cv_url?: string; // Public URL from Supabase Storage
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

// Get company ID from email
export const getCompanyIdFromEmail = async (userEmail: string): Promise<number | null> => {
  try {
    const { data: contactInfo, error: contactError } = await supabase
      .from('company_contact_info')
      .select('company_id')
      .eq('corporate_email', userEmail)
      .single();

    if (contactError || !contactInfo) {
      console.error('Error fetching company contact info:', contactError);
      return null;
    }

    return contactInfo.company_id;
  } catch (error) {
    console.error('Error getting company ID:', error);
    return null;
  }
};

// Fetch enterprise data from Supabase based on user email
export const fetchEnterpriseDataFromSupabase = async (userEmail: string): Promise<EnterpriseData | null> => {
  try {
    // First, find the company by email in company_contact_info
    const { data: contactInfo, error: contactError } = await supabase
      .from('company_contact_info')
      .select('company_id')
      .eq('corporate_email', userEmail)
      .single();

    if (contactError || !contactInfo) {
      console.error('Error fetching company contact info:', contactError);
      return null;
    }

    const companyId = contactInfo.company_id;

    // Fetch all related data
    const [companyResult, contactResult, documentsResult, jobPostingResult] = await Promise.all([
      supabase.from('company').select('*').eq('id', companyId).single(),
      supabase.from('company_contact_info').select('*').eq('company_id', companyId).single(),
      supabase.from('company_documents').select('*').eq('company_id', companyId).single(),
      supabase.from('company_job_posting_info').select('*').eq('company_id', companyId).single(),
    ]);

    if (companyResult.error || !companyResult.data) {
      console.error('Error fetching company data:', companyResult.error);
      return null;
    }

    const company = companyResult.data;
    const contact = contactResult.data || {};
    const documents = documentsResult.data || {};
    const jobPosting = jobPostingResult.data || {};

    // Build EnterpriseData object
    const enterpriseData: EnterpriseData = {
      legal_name: company.legal_name,
      trade_name: company.trade_name || '',
      tax_id: company.tax_id,
      verification_digit: String(company.verification_digit),
      legal_representative: company.legal_representative,
      company_type: company.company_type || '',
      incorporation_date: company.incorporation_date || '',
      address: contact.address || '',
      city: contact.city || '',
      state: contact.state || '',
      landline_phone: contact.landline_phone || '',
      mobile_phone: contact.mobile_phone || '',
      corporate_email: contact.corporate_email || userEmail,
      website_url: contact.website_url || '',
      chamber_of_commerce_certificate: documents.chamber_of_commerce_certificate || null,
      rut_document: documents.rut_document || null,
      legal_representative_id: documents.legal_representative_id || null,
      company_logo: documents.company_logo || null,
      industry_sector: jobPosting.industry_sector || '',
      company_size: jobPosting.company_size || '',
      company_description: jobPosting.company_description || '',
      linkedin_url: jobPosting.linkedin_url || '',
      facebook_url: jobPosting.facebook_url || '',
      instagram_url: jobPosting.instagram_url || '',
    };

    // Save to local storage for future use
    saveEnterpriseData(enterpriseData);

    return enterpriseData;
  } catch (error) {
    console.error('Error fetching enterprise data from Supabase:', error);
    return null;
  }
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
export const getWorkOffers = async (companyId?: number): Promise<WorkOffer[]> => {
  const query = supabase
    .from('vacant')
    .select('*')
    .order('created_at', { ascending: false });

  // If companyId is provided, filter by company (we'll need to add company_id to vacant table or use a join)
  // For now, we'll get all offers. You can add company_id to vacant table later if needed.
  
  const { data, error } = await query;

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
    required_skills: normalizeSkills(row.required_skills),
    create_at: row.created_at,
  }));
};

// Fetch enterprise data by company ID (for public profile)
export const fetchEnterpriseDataByCompanyId = async (companyId: number): Promise<EnterpriseData | null> => {
  try {
    const [companyResult, contactResult, documentsResult, jobPostingResult] = await Promise.all([
      supabase.from('company').select('*').eq('id', companyId).single(),
      supabase.from('company_contact_info').select('*').eq('company_id', companyId).single(),
      supabase.from('company_documents').select('*').eq('company_id', companyId).single(),
      supabase.from('company_job_posting_info').select('*').eq('company_id', companyId).single(),
    ]);

    if (companyResult.error || !companyResult.data) {
      console.error('Error fetching company data:', companyResult.error);
      return null;
    }

    const company = companyResult.data;
    const contact = contactResult.data || {};
    const documents = documentsResult.data || {};
    const jobPosting = jobPostingResult.data || {};

    const enterpriseData: EnterpriseData = {
      legal_name: company.legal_name,
      trade_name: company.trade_name || '',
      tax_id: company.tax_id,
      verification_digit: String(company.verification_digit),
      legal_representative: company.legal_representative,
      company_type: company.company_type || '',
      incorporation_date: company.incorporation_date || '',
      address: contact.address || '',
      city: contact.city || '',
      state: contact.state || '',
      landline_phone: contact.landline_phone || '',
      mobile_phone: contact.mobile_phone || '',
      corporate_email: contact.corporate_email || '',
      website_url: contact.website_url || '',
      chamber_of_commerce_certificate: documents.chamber_of_commerce_certificate || null,
      rut_document: documents.rut_document || null,
      legal_representative_id: documents.legal_representative_id || null,
      company_logo: documents.company_logo || null,
      industry_sector: jobPosting.industry_sector || '',
      company_size: jobPosting.company_size || '',
      company_description: jobPosting.company_description || '',
      linkedin_url: jobPosting.linkedin_url || '',
      facebook_url: jobPosting.facebook_url || '',
      instagram_url: jobPosting.instagram_url || '',
    };

    return enterpriseData;
  } catch (error) {
    console.error('Error fetching enterprise data by company ID:', error);
    return null;
  }
};

export const addWorkOffer = async (
  offer: Omit<WorkOffer, 'vacant_id' | 'create_at'>,
): Promise<WorkOffer | null> => {
  const availabilityDb =
    offer.availability === 'on site' ? 'on_site' : offer.availability;

  try {
  const { data, error } = await supabase
    .from('vacant')
    .insert({
      name: offer.name,
      role: offer.rol,
      salary: offer.salary,
      description: offer.description,
      availability: availabilityDb,
      location: offer.location,
        required_skills: offer.required_skills || [],
    })
    .select('*')
    .single();

    if (error) {
    console.error('Error inserting work offer into Supabase:', error);
      // Throw error with message so it can be caught and displayed to user
      throw new Error(error.message || 'Failed to create work offer');
    }

    if (!data) {
      throw new Error('No data returned from database');
  }

  return {
    vacant_id: data.id,
    name: data.name,
    rol: data.role,
    salary: data.salary ?? 0,
    description: data.description ?? '',
    availability: data.availability === 'on_site' ? 'on site' : data.availability,
    location: data.location ?? '',
      required_skills: normalizeSkills(data.required_skills),
    create_at: data.created_at,
  };
  } catch (error: any) {
    console.error('Error in addWorkOffer:', error);
    // Re-throw to let the calling function handle it
    throw error;
  }
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

// Fetch all applicants from Supabase
// If vacantIds is provided, only fetch applicants for those work offers
export const getAllApplicantsFromSupabase = async (vacantIds?: number[]): Promise<Applicant[]> => {
  try {
    let query = supabase
      .from('profile')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by vacant_ids if provided
    if (vacantIds && vacantIds.length > 0) {
      query = query.in('vacant_id', vacantIds);
    }

    const { data: profiles, error } = await query;

    if (error) {
      console.error('Error fetching applicants from Supabase:', error);
      // Return empty array instead of falling back to localStorage to avoid showing wrong data
      return [];
    }

    if (!profiles || profiles.length === 0) {
      // Return empty array - no applicants found
      return [];
    }

    // Helper to normalize skills to string array
    const normalizeSkillsToStrings = (skills: any): string[] => {
      if (!Array.isArray(skills)) return [];
      return skills.map((skill: any) => {
        if (typeof skill === 'string') return skill;
        if (typeof skill === 'object' && skill !== null) {
          // Handle object format {name, level} or {name, importance, must_have}
          return skill.name || String(skill);
        }
        return String(skill);
      }).filter(Boolean);
    };

    // Transform Supabase profile data to Applicant format
    // Filter out any profiles without CV URL (additional safety check)
    return profiles
      .filter((profile: any) => profile.cv_url != null && profile.cv_url !== '')
      .map((profile: any) => {
        const personalInfo = profile.personal_information || {};
        const experience = profile.experience || {};
        const education = profile.education || {};
        const skills = profile.skills || [];

        return {
          id: profile.id,
          vacant_id: profile.vacant_id,
          name: personalInfo.name || 'Unknown',
          email: personalInfo.email || '',
          phone: personalInfo.phone || '',
          experience_years: experience.years || 0,
          skills: normalizeSkillsToStrings(skills),
          education: education.degree || education.institution || '',
          match_score: 75,
          applied_at: profile.created_at || new Date().toISOString(),
          status: profile.status || 'pending',
          cv_url: profile.cv_url || null,
          cv_link: profile.cv_url || null,
        };
      });
  } catch (error) {
    console.error('Error in getAllApplicantsFromSupabase:', error);
    // Return empty array to avoid showing wrong/old data from local storage
    return [];
  }
};

export const getApplicantsByVacantId = async (vacant_id: number): Promise<Applicant[]> => {
  try {
    // Fetch from Supabase profile table - strictly filter by vacant_id
    const { data: profiles, error } = await supabase
      .from('profile')
      .select('*')
      .eq('vacant_id', vacant_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applicants from Supabase:', error);
      // Return empty array instead of falling back to local storage to avoid showing old/wrong data
      return [];
    }

    if (!profiles || profiles.length === 0) {
      // Return empty array - no applicants for this work offer
      return [];
    }

    // Helper to normalize skills to string array
    const normalizeSkillsToStrings = (skills: any): string[] => {
      if (!Array.isArray(skills)) return [];
      return skills.map((skill: any) => {
        if (typeof skill === 'string') return skill;
        if (typeof skill === 'object' && skill !== null) {
          // Handle object format {name, level} or {name, importance, must_have}
          return skill.name || String(skill);
        }
        return String(skill);
      }).filter(Boolean);
    };

    // Transform Supabase profile data to Applicant format
    // Filter out any profiles without CV URL (additional safety check)
    return profiles
      .filter((profile: any) => profile.cv_url != null && profile.cv_url !== '')
      .map((profile: any) => {
        const personalInfo = profile.personal_information || {};
        const experience = profile.experience || {};
        const education = profile.education || {};
        const skills = profile.skills || [];

        return {
          id: profile.id,
          vacant_id: profile.vacant_id,
          name: personalInfo.name || 'Unknown',
          email: personalInfo.email || '',
          phone: personalInfo.phone || '',
          experience_years: experience.years || 0,
          skills: normalizeSkillsToStrings(skills),
          education: education.degree || education.institution || '',
          match_score: 75, // Default, can be calculated based on job requirements
          applied_at: profile.created_at || new Date().toISOString(),
          status: profile.status || 'pending',
          cv_url: profile.cv_url || null,
          cv_link: profile.cv_url || null, // For backward compatibility
          // Note: cv_path is not in the schema, only cv_url exists
        };
      });
  } catch (error) {
    console.error('Error in getApplicantsByVacantId:', error);
    // Return empty array to avoid showing wrong/old data from local storage
    return [];
  }
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

// Update applicant status in Supabase
export const updateApplicantStatus = async (profileId: number, status: Applicant['status']): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profile')
      .update({ status })
      .eq('id', profileId);

    if (error) {
      console.error('Error updating applicant status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateApplicantStatus:', error);
    return false;
  }
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

