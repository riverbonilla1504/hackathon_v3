-- ============================================
-- Fix RLS Policies for Profile Table
-- ============================================
-- Run this script in your Supabase SQL Editor to fix CV upload issues
-- ============================================

-- 1. Enable RLS on profile table if not already enabled
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist (to allow re-running the script)
DROP POLICY IF EXISTS "Allow service role full access to profile" ON public.profile;
DROP POLICY IF EXISTS "Allow authenticated insert to profile" ON public.profile;
DROP POLICY IF EXISTS "Allow authenticated select from profile" ON public.profile;
DROP POLICY IF EXISTS "Allow public insert to profile" ON public.profile;

-- 3. Policy: Allow service role full access (for server-side API routes)
-- This is CRITICAL for the upload-cvs API route that uses SUPABASE_SERVICE_ROLE_KEY
CREATE POLICY "Allow service role full access to profile"
ON public.profile
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Policy: Allow authenticated users to insert profiles
CREATE POLICY "Allow authenticated insert to profile"
ON public.profile
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Policy: Allow authenticated users to select profiles
CREATE POLICY "Allow authenticated select from profile"
ON public.profile
FOR SELECT
TO authenticated
USING (true);

-- 6. Policy: Allow public/anonymous inserts (for API routes without auth)
-- This might be needed if the service role isn't working
CREATE POLICY "Allow public insert to profile"
ON public.profile
FOR INSERT
TO anon
WITH CHECK (true);

-- ============================================
-- Verification
-- ============================================
-- Check if policies were created:
-- SELECT * FROM pg_policies WHERE tablename = 'profile' AND schemaname = 'public';

-- ============================================
-- Notes:
-- ============================================
-- 1. The service_role policy should allow the API route to insert records
-- 2. Make sure SUPABASE_SERVICE_ROLE_KEY is set in your .env.local file
-- 3. If you still get RLS errors, check that the service role key is being used correctly
-- 4. You can verify the service role is working by checking the Supabase logs

