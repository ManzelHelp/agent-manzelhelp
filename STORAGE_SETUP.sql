-- ============================================
-- STORAGE BUCKETS CREATION AND POLICIES
-- ============================================
-- This script creates all required storage buckets and their policies
-- Run this in Supabase SQL Editor after creating the schema

-- ============================================
-- CREATE STORAGE BUCKETS
-- ============================================

-- 1. VERIFICATION DOCUMENTS BUCKET (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false, -- Private bucket
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 2. AVATARS BUCKET (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Public bucket
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 3. SERVICE IMAGES BUCKET (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images',
  'service-images',
  true, -- Public bucket
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 4. JOB IMAGES BUCKET (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-images',
  'job-images',
  true, -- Public bucket
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 5. COMPANY LOGOS BUCKET (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true, -- Public bucket
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- 6. COMPANY COVERS BUCKET (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-covers',
  'company-covers',
  true, -- Public bucket
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================
-- Note: Drop existing policies first to make this script idempotent

-- ============================================
-- 1. VERIFICATION DOCUMENTS BUCKET POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own verification documents" ON storage.objects;

-- Policy: Users can upload their own verification documents
CREATE POLICY "Users can upload own verification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'verification-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own verification documents
CREATE POLICY "Users can read own verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'verification-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own verification documents
CREATE POLICY "Users can update own verification documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'verification-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own verification documents
CREATE POLICY "Users can delete own verification documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'verification-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 2. AVATARS BUCKET POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

-- Policy: Authenticated users can upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Policy: Anyone can read avatars (public)
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy: Users can update their own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 3. SERVICE IMAGES BUCKET POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload service images" ON storage.objects;
DROP POLICY IF EXISTS "Public service image access" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own service images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own service images" ON storage.objects;

-- Policy: Authenticated users can upload service images
CREATE POLICY "Authenticated users can upload service images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'service-images');

-- Policy: Public can read service images
CREATE POLICY "Public service image access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'service-images');

-- Policy: Users can update their own service images
CREATE POLICY "Users can update own service images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'service-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own service images
CREATE POLICY "Users can delete own service images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'service-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 4. JOB IMAGES BUCKET POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload job images" ON storage.objects;
DROP POLICY IF EXISTS "Public job image access" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own job images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own job images" ON storage.objects;

-- Policy: Authenticated users can upload job images
CREATE POLICY "Authenticated users can upload job images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'job-images');

-- Policy: Public can read job images
CREATE POLICY "Public job image access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'job-images');

-- Policy: Users can update their own job images
CREATE POLICY "Users can update own job images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'job-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own job images
CREATE POLICY "Users can delete own job images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'job-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 5. COMPANY LOGOS BUCKET POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload company logos" ON storage.objects;
DROP POLICY IF EXISTS "Public company logo access" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own company logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own company logos" ON storage.objects;

-- Policy: Authenticated users can upload company logos
CREATE POLICY "Authenticated users can upload company logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-logos');

-- Policy: Public can read company logos
CREATE POLICY "Public company logo access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-logos');

-- Policy: Users can update their own company logos
CREATE POLICY "Users can update own company logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'company-logos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own company logos
CREATE POLICY "Users can delete own company logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'company-logos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 6. COMPANY COVERS BUCKET POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload company covers" ON storage.objects;
DROP POLICY IF EXISTS "Public company cover access" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own company covers" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own company covers" ON storage.objects;

-- Policy: Authenticated users can upload company covers
CREATE POLICY "Authenticated users can upload company covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-covers');

-- Policy: Public can read company covers
CREATE POLICY "Public company cover access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-covers');

-- Policy: Users can update their own company covers
CREATE POLICY "Users can update own company covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'company-covers' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own company covers
CREATE POLICY "Users can delete own company covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'company-covers' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

