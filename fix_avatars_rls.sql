-- Fix RLS policy for avatars bucket upload
-- This ensures users can only upload avatars to their own folder

-- Drop existing policy
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;

-- Create new policy that checks the folder matches the user ID
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Also ensure UPDATE policy allows upsert operations
-- The existing UPDATE policy should already handle this, but let's verify
-- If the file exists and we use upsert, it will try to UPDATE first
-- So we need to make sure UPDATE policy allows it too

