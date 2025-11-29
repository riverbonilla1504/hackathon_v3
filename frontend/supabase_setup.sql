-- ============================================
-- Supabase Setup Script for Worky AI
-- ============================================
-- Run this script in your Supabase SQL Editor
-- ============================================

-- 1. Verify Storage Bucket Exists
-- ============================================
-- NOTE: The 'cvs' bucket should already exist in your Supabase project.
-- If it doesn't exist, create it through the Dashboard:
-- Storage → Buckets → New Bucket → Name: 'cvs' → Public: true
--
-- Verify the bucket exists:
-- SELECT * FROM storage.buckets WHERE id = 'cvs';

-- 2. Verify Profile Table Schema
-- ============================================
-- The profile table should already have the cv_url column according to your schema.
-- This script verifies the structure matches expectations.
--
-- Expected columns in profile table:
-- - cv_url (text) - already exists in your schema
-- - personal_information (jsonb)
-- - experience (jsonb)
-- - education (jsonb)
-- - skills (jsonb)
-- - projects (jsonb)
-- - status (text)
-- - vacant_id (bigint)
-- - created_at (timestamp)
-- - extras (jsonb)

-- 3. Storage Policies (RLS) for CVs Bucket
-- ============================================
-- NOTE: RLS on storage.objects is typically already enabled by Supabase.
-- We only need to create the policies, not alter the table.

-- Drop existing policies if they exist (to allow re-running the script)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role full access" ON storage.objects;

-- Policy: Allow authenticated users to upload CVs
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = 'cvs'
);

-- Policy: Allow public read access to CVs (if bucket is public)
-- If you want to restrict access, remove this policy and use the authenticated read policy below
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'cvs'
);

-- Policy: Allow authenticated users to read CVs
CREATE POLICY "Allow authenticated read"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs'
);

-- Policy: Allow service role full access (for server-side operations)
-- This is needed for the API routes that use SUPABASE_SERVICE_ROLE_KEY
CREATE POLICY "Allow service role full access"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'cvs')
WITH CHECK (bucket_id = 'cvs');

-- 4. RLS Policies for Profile Table
-- ============================================
-- Enable RLS on profile table if not already enabled
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running the script)
DROP POLICY IF EXISTS "Allow service role full access to profile" ON public.profile;
DROP POLICY IF EXISTS "Allow authenticated insert to profile" ON public.profile;
DROP POLICY IF EXISTS "Allow authenticated select from profile" ON public.profile;

-- Policy: Allow service role full access (for server-side API routes)
-- This is needed for the upload-cvs API route that uses SUPABASE_SERVICE_ROLE_KEY
CREATE POLICY "Allow service role full access to profile"
ON public.profile
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Allow authenticated users to insert profiles
CREATE POLICY "Allow authenticated insert to profile"
ON public.profile
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to select profiles
CREATE POLICY "Allow authenticated select from profile"
ON public.profile
FOR SELECT
TO authenticated
USING (true);

-- 5. Optional: Create indexes for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profile_vacant_id ON public.profile(vacant_id);
CREATE INDEX IF NOT EXISTS idx_profile_status ON public.profile(status);
CREATE INDEX IF NOT EXISTS idx_profile_cv_url ON public.profile(cv_url) WHERE cv_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profile_match_profile_id ON public.profile_match(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_match_vacant_id ON public.profile_match(vacant_id);
CREATE INDEX IF NOT EXISTS idx_vacant_created_at ON public.vacant(created_at);

-- 6. Optional: Create a function to get public URL for CVs
-- ============================================
-- This function constructs the public URL for a CV file
-- Note: Replace 'your-project-ref' with your actual Supabase project reference
CREATE OR REPLACE FUNCTION get_cv_url(cv_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  public_url TEXT;
  project_url TEXT := 'https://your-project-ref.supabase.co'; -- REPLACE WITH YOUR PROJECT URL
BEGIN
  IF cv_path IS NULL OR cv_path = '' THEN
    RETURN NULL;
  END IF;
  
  -- Construct the public URL
  -- Format: https://project-ref.supabase.co/storage/v1/object/public/cvs/path/to/file.pdf
  public_url := project_url || '/storage/v1/object/public/cvs/' || cv_path;
  
  RETURN public_url;
END;
$$;

-- Example usage:
-- SELECT get_cv_url('cvs/123/456/1234567890_cv.pdf');

-- 7. Grant necessary permissions
-- ============================================
-- Grant usage on storage schema
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO anon;

-- Grant select on buckets
GRANT SELECT ON storage.buckets TO authenticated;
GRANT SELECT ON storage.buckets TO anon;

-- Grant operations on storage.objects
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon; -- Only if you want public read access

-- ============================================
-- Verification Queries
-- ============================================
-- Run these to verify the setup:

-- Check if bucket exists
-- SELECT * FROM storage.buckets WHERE id = 'cvs';

-- Check if cv_url column exists in profile table
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'profile' 
-- AND column_name = 'cv_url';

-- Check storage policies
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check profile table policies
-- SELECT * FROM pg_policies WHERE tablename = 'profile' AND schemaname = 'public';

-- ============================================
-- Notes:
-- ============================================
-- 1. Make sure to replace 'your-project-ref' in the get_cv_url function
--    with your actual Supabase project reference
-- 2. If you want private buckets, set the bucket to public = false and
--    remove the "Allow public read" policy
-- 3. The service_role policy is necessary for server-side API routes
-- 4. Adjust file_size_limit and allowed_mime_types as needed
-- 5. IMPORTANT: Make sure SUPABASE_SERVICE_ROLE_KEY is set in your .env.local
--    The service role key bypasses RLS, but policies are still needed for
--    authenticated users. If you're getting RLS errors, verify the service
--    role key is being used correctly in the API route.

