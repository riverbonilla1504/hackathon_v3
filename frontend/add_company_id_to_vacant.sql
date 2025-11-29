-- ============================================
-- Add company_id to vacant table
-- ============================================
-- This migration adds the company_id column to link work offers to companies
-- Run this script BEFORE running create_interview_table.sql
-- ============================================

-- Add company_id column to vacant table
ALTER TABLE public.vacant 
ADD COLUMN IF NOT EXISTS company_id bigint;

-- Add foreign key constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'vacant_company_id_fkey'
  ) THEN
    ALTER TABLE public.vacant 
    ADD CONSTRAINT vacant_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES public.company(id);
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_vacant_company_id ON public.vacant(company_id);

-- Note: Existing records will have NULL company_id
-- You may want to update them manually or via a separate script

