-- ============================================
-- Interview Table for Worky AI
-- ============================================
-- Run this script in your Supabase SQL Editor
-- 
-- IMPORTANT: Run add_company_id_to_vacant.sql FIRST
-- if the vacant table doesn't have a company_id column yet.
-- ============================================

-- Create interview table
CREATE TABLE IF NOT EXISTS public.interview (
  id bigserial PRIMARY KEY,
  profile_id bigint NOT NULL REFERENCES public.profile(id) ON DELETE CASCADE,
  vacant_id bigint NOT NULL REFERENCES public.vacant(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY[
    'pending',
    'accepted',
    'rejected',
    'reschedule_requested'
  ])),
  scheduled_at timestamptz,
  proposed_slots jsonb,  -- Array of possible time slots: [{"date": "2025-01-15", "time": "10:00"}, ...]
  meeting_url text,      -- Google Meet link or similar
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_interview_profile_id ON public.interview(profile_id);
CREATE INDEX IF NOT EXISTS idx_interview_vacant_id ON public.interview(vacant_id);
CREATE INDEX IF NOT EXISTS idx_interview_status ON public.interview(status);
CREATE INDEX IF NOT EXISTS idx_interview_scheduled_at ON public.interview(scheduled_at);

-- Enable RLS
ALTER TABLE public.interview ENABLE ROW LEVEL SECURITY;

-- RLS Policies for interview table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view interviews for their company's work offers" ON public.interview;
DROP POLICY IF EXISTS "Users can create interviews for their company's work offers" ON public.interview;
DROP POLICY IF EXISTS "Users can update interviews for their company's work offers" ON public.interview;
DROP POLICY IF EXISTS "Allow authenticated users to manage interviews" ON public.interview;

-- Option 1: If vacant table has company_id (RECOMMENDED - run add_company_id_to_vacant.sql first)
-- Uncomment this section and comment out Option 2 if you have company_id in vacant table

/*
CREATE POLICY "Users can view interviews for their company's work offers"
ON public.interview
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.vacant v
    JOIN public.company c ON v.company_id = c.id
    JOIN public.company_contact_info cci ON c.id = cci.company_id
    JOIN auth.users u ON cci.corporate_email = u.email
    WHERE v.id = interview.vacant_id
      AND u.id = auth.uid()
  )
);

CREATE POLICY "Users can create interviews for their company's work offers"
ON public.interview
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.vacant v
    JOIN public.company c ON v.company_id = c.id
    JOIN public.company_contact_info cci ON c.id = cci.company_id
    JOIN auth.users u ON cci.corporate_email = u.email
    WHERE v.id = interview.vacant_id
      AND u.id = auth.uid()
  )
);

CREATE POLICY "Users can update interviews for their company's work offers"
ON public.interview
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.vacant v
    JOIN public.company c ON v.company_id = c.id
    JOIN public.company_contact_info cci ON c.id = cci.company_id
    JOIN auth.users u ON cci.corporate_email = u.email
    WHERE v.id = interview.vacant_id
      AND u.id = auth.uid()
  )
);
*/

-- Option 2: Temporary policy that allows all authenticated users (less secure)
-- Use this if vacant table doesn't have company_id yet
-- WARNING: This allows any authenticated user to access any interview
-- Recommended: Add company_id to vacant table and use Option 1 instead

CREATE POLICY "Allow authenticated users to manage interviews"
ON public.interview
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_interview_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_interview_updated_at ON public.interview;
CREATE TRIGGER trigger_update_interview_updated_at
  BEFORE UPDATE ON public.interview
  FOR EACH ROW
  EXECUTE FUNCTION update_interview_updated_at();

