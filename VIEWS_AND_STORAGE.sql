-- ============================================
-- VIEWS AND STORAGE SETUP
-- ============================================

-- ============================================
-- SERVICE LISTING VIEW
-- ============================================
-- This view joins multiple tables to provide a comprehensive service listing
CREATE OR REPLACE VIEW public.service_listing_view AS
SELECT 
    ts.id AS tasker_service_id,
    ts.service_id,
    ts.tasker_id,
    ts.title,
    ts.description,
    COALESCE(ts.price, ts.base_price) AS price,
    ts.pricing_type,
    ts.service_status,
    ts.verification_status,
    ts.has_active_booking,
    ts.created_at,
    ts.updated_at,
    ts.portfolio_images,
    ts.minimum_duration,
    ts.service_area,
    ts.extra_fees,
    -- User information
    u.first_name AS tasker_first_name,
    u.last_name AS tasker_last_name,
    u.email AS tasker_email,
    u.avatar_url AS tasker_avatar_url,
    u.phone AS tasker_phone,
    u.role AS tasker_role,
    u.verification_status AS tasker_verification_status,
    u.created_at AS tasker_created_at,
    -- Tasker profile information
    tp.experience_level,
    tp.bio AS tasker_bio,
    tp.operation_hours,
    tp.service_radius_km,
    tp.is_available AS tasker_is_available,
    tp.identity_document_url,
    tp.verification_status AS profile_verification_status,
    tp.updated_at AS profile_updated_at,
    tp.company_id,
    -- Service information
    s.name_en AS service_name_en,
    s.name_fr AS service_name_fr,
    s.name_ar AS service_name_ar,
    s.description_en AS service_description_en,
    s.description_fr AS service_description_fr,
    s.description_ar AS service_description_ar,
    s.is_active AS service_is_active,
    s.sort_order AS service_sort_order,
    -- Category information
    sc.id AS category_id,
    sc.name_en AS category_name_en,
    sc.name_fr AS category_name_fr,
    sc.name_ar AS category_name_ar,
    sc.description_en AS category_description_en,
    sc.description_fr AS category_description_fr,
    sc.description_ar AS category_description_ar,
    sc.icon_url AS category_icon_url,
    sc.is_active AS category_is_active,
    sc.sort_order AS category_sort_order,
    -- User stats
    us.tasker_rating,
    us.total_reviews,
    us.completed_jobs,
    us.total_earnings,
    us.response_time_hours,
    us.cancellation_rate,
    us.jobs_posted,
    us.total_spent,
    us.updated_at AS stats_updated_at,
    -- Company information (if applicable)
    c.company_name,
    c.city AS company_city,
    c.verification_status AS company_verification_status,
    -- Availability check
    CASE 
        WHEN tp.is_available = true 
        AND ts.service_status = 'active' 
        AND ts.verification_status = 'verified'
        AND ts.is_available = true
        THEN true
        ELSE false
    END AS is_available_for_booking
FROM public.tasker_services ts
INNER JOIN public.users u ON ts.tasker_id = u.id
LEFT JOIN public.tasker_profiles tp ON ts.tasker_id = tp.id
LEFT JOIN public.services s ON ts.service_id = s.id
LEFT JOIN public.service_categories sc ON s.category_id = sc.id
LEFT JOIN public.user_stats us ON ts.tasker_id = us.id
LEFT JOIN public.companies c ON tp.company_id = c.id;

-- Grant access to the view
GRANT SELECT ON public.service_listing_view TO anon, authenticated, service_role;

-- ============================================
-- STORAGE BUCKETS SETUP
-- ============================================
-- Note: Storage buckets must be created via Supabase Dashboard or API
-- This SQL creates the bucket policies after buckets are created

-- 1. VERIFICATION DOCUMENTS BUCKET (Private)
-- Create via Dashboard: Storage > New Bucket > Name: "verification-documents" > Private

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

-- 2. AVATARS BUCKET (Public)
-- Create via Dashboard: Storage > New Bucket > Name: "avatars" > Public

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

-- 3. SERVICE IMAGES BUCKET (Public)
-- Create via Dashboard: Storage > New Bucket > Name: "service-images" > Public

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

-- 4. JOB IMAGES BUCKET (Public)
-- Create via Dashboard: Storage > New Bucket > Name: "job-images" > Public

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

-- 5. COMPANY LOGOS BUCKET (Public)
-- Create via Dashboard: Storage > New Bucket > Name: "company-logos" > Public

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

-- 6. COMPANY COVERS BUCKET (Public)
-- Create via Dashboard: Storage > New Bucket > Name: "company-covers" > Public

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

