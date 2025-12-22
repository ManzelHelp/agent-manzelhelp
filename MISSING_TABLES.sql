-- ============================================
-- MISSING TABLES MIGRATION SCRIPT
-- Run this after restoring the main schema
-- ============================================

-- 1. CONVERSATIONS TABLE
-- Replaces direct messages with conversation-based messaging
CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
    service_id integer REFERENCES public.services(id) ON DELETE CASCADE,
    booking_id uuid, -- Will reference service_bookings when created
    participant1_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    participant2_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    last_message_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT conversations_participants_check CHECK (participant1_id != participant2_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON public.conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON public.conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_job_id ON public.conversations(job_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

-- 2. UPDATE MESSAGES TABLE TO REFERENCE CONVERSATIONS
-- Add conversation_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'messages' 
        AND column_name = 'conversation_id'
    ) THEN
        ALTER TABLE public.messages 
        ADD COLUMN conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
    END IF;
END $$;

-- 3. SERVICE_BOOKINGS TABLE
-- Critical for booking functionality
CREATE TABLE IF NOT EXISTS public.service_bookings (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    customer_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tasker_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tasker_service_id integer NOT NULL REFERENCES public.tasker_services(id) ON DELETE CASCADE,
    booking_type text NOT NULL CHECK (booking_type IN ('instant', 'scheduled', 'recurring')),
    scheduled_date date,
    scheduled_time_start time without time zone,
    scheduled_time_end time without time zone,
    estimated_duration integer,
    address_id integer NOT NULL REFERENCES public.addresses(id) ON DELETE CASCADE,
    service_address text,
    agreed_price numeric(10,2) NOT NULL,
    currency character(3) DEFAULT 'MAD',
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed', 'refunded')),
    accepted_at timestamp with time zone,
    confirmed_at timestamp with time zone,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancelled_by uuid REFERENCES public.users(id),
    cancellation_reason text,
    customer_requirements text,
    tasker_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    payment_method text CHECK (payment_method IN ('cash', 'online', 'wallet', 'pending')),
    cancellation_fee numeric(10,2) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_service_bookings_customer_id ON public.service_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_tasker_id ON public.service_bookings(tasker_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_tasker_service_id ON public.service_bookings(tasker_service_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON public.service_bookings(status);
CREATE INDEX IF NOT EXISTS idx_service_bookings_scheduled_date ON public.service_bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_service_bookings_created_at ON public.service_bookings(created_at DESC);

-- Update conversations to reference service_bookings
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'service_bookings'
    ) THEN
        ALTER TABLE public.conversations 
        ADD CONSTRAINT conversations_booking_id_fkey 
        FOREIGN KEY (booking_id) REFERENCES public.service_bookings(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. USER_FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tasker_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_favorites_unique UNIQUE (user_id, tasker_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_tasker_id ON public.user_favorites(tasker_id);

-- 5. TASKER_AVAILABILITY TABLE
CREATE TABLE IF NOT EXISTS public.tasker_availability (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tasker_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tasker_availability_unique UNIQUE (tasker_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_tasker_availability_tasker_id ON public.tasker_availability(tasker_id);
CREATE INDEX IF NOT EXISTS idx_tasker_availability_day ON public.tasker_availability(day_of_week);

-- 6. TASKER_BLOCKED_DATES TABLE
CREATE TABLE IF NOT EXISTS public.tasker_blocked_dates (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tasker_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    blocked_date date NOT NULL,
    reason text,
    is_full_day boolean DEFAULT true,
    start_time time without time zone,
    end_time time without time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tasker_blocked_dates_unique UNIQUE (tasker_id, blocked_date)
);

CREATE INDEX IF NOT EXISTS idx_tasker_blocked_dates_tasker_id ON public.tasker_blocked_dates(tasker_id);
CREATE INDEX IF NOT EXISTS idx_tasker_blocked_dates_date ON public.tasker_blocked_dates(blocked_date);

-- 7. JOB_APPLICATION_COUNTS TABLE
CREATE TABLE IF NOT EXISTS public.job_application_counts (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    application_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT job_application_counts_unique UNIQUE (job_id)
);

CREATE INDEX IF NOT EXISTS idx_job_application_counts_job_id ON public.job_application_counts(job_id);

-- 8. USER_MONTHLY_USAGE TABLE
CREATE TABLE IF NOT EXISTS public.user_monthly_usage (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    month_year text NOT NULL, -- Format: 'YYYY-MM'
    applications_count integer DEFAULT 0,
    job_postings_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_monthly_usage_unique UNIQUE (user_id, month_year)
);

CREATE INDEX IF NOT EXISTS idx_user_monthly_usage_user_id ON public.user_monthly_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_monthly_usage_month_year ON public.user_monthly_usage(month_year);

-- 9. WALLET_TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount numeric(10,2) NOT NULL,
    type text NOT NULL, -- 'deposit', 'withdrawal', 'payment', 'refund', etc.
    related_job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions(type);

-- 10. FAQ TABLE
CREATE TABLE IF NOT EXISTS public.faq (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    role text, -- 'customer', 'tasker', 'both', 'admin'
    audience text, -- 'public', 'authenticated', 'admin'
    category text,
    question_en text NOT NULL,
    answer_en text NOT NULL,
    question_fr text,
    answer_fr text,
    question_ar text,
    answer_ar text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_faq_role ON public.faq(role);
CREATE INDEX IF NOT EXISTS idx_faq_audience ON public.faq(audience);
CREATE INDEX IF NOT EXISTS idx_faq_category ON public.faq(category);

-- ============================================
-- UPDATE EXISTING TABLES
-- ============================================

-- Add missing columns to users table
DO $$ 
BEGIN
    -- Add wallet_balance if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'wallet_balance'
    ) THEN
        ALTER TABLE public.users ADD COLUMN wallet_balance numeric(12,2) DEFAULT 0.00;
    END IF;
    
    -- Add verification_status if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'verification_status'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN verification_status public.verification_status DEFAULT 'pending'::public.verification_status;
    END IF;
END $$;

-- Update tasker_services table to match TypeScript types
DO $$ 
BEGIN
    -- Add title if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasker_services' 
        AND column_name = 'title'
    ) THEN
        ALTER TABLE public.tasker_services ADD COLUMN title character varying(200);
    END IF;
    
    -- Add description if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasker_services' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE public.tasker_services ADD COLUMN description text;
    END IF;
    
    -- Add price if missing (use base_price as fallback)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasker_services' 
        AND column_name = 'price'
    ) THEN
        ALTER TABLE public.tasker_services ADD COLUMN price numeric(10,2);
        -- Copy from base_price if it exists
        UPDATE public.tasker_services SET price = base_price WHERE price IS NULL AND base_price IS NOT NULL;
    END IF;
    
    -- Add service_status if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasker_services' 
        AND column_name = 'service_status'
    ) THEN
        ALTER TABLE public.tasker_services 
        ADD COLUMN service_status text DEFAULT 'draft' CHECK (service_status IN ('draft', 'under_review', 'active', 'paused', 'suspended', 'deleted_pending', 'deleted'));
    END IF;
    
    -- Add verification_status if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasker_services' 
        AND column_name = 'verification_status'
    ) THEN
        ALTER TABLE public.tasker_services 
        ADD COLUMN verification_status text DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'under_review', 'verified', 'rejected', 'suspended'));
    END IF;
    
    -- Add portfolio_images if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasker_services' 
        AND column_name = 'portfolio_images'
    ) THEN
        ALTER TABLE public.tasker_services ADD COLUMN portfolio_images jsonb;
    END IF;
    
    -- Add minimum_duration if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasker_services' 
        AND column_name = 'minimum_duration'
    ) THEN
        ALTER TABLE public.tasker_services ADD COLUMN minimum_duration integer;
    END IF;
    
    -- Add extra_fees if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasker_services' 
        AND column_name = 'extra_fees'
    ) THEN
        ALTER TABLE public.tasker_services ADD COLUMN extra_fees numeric(10,2) DEFAULT 0;
    END IF;
    
    -- Add service_area if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasker_services' 
        AND column_name = 'service_area'
    ) THEN
        ALTER TABLE public.tasker_services ADD COLUMN service_area jsonb;
    END IF;
    
    -- Add has_active_booking if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasker_services' 
        AND column_name = 'has_active_booking'
    ) THEN
        ALTER TABLE public.tasker_services ADD COLUMN has_active_booking boolean DEFAULT false;
    END IF;
END $$;

-- Update jobs table status enum if needed
DO $$ 
BEGIN
    -- Check if we need to update the job_status enum
    -- The schema has: 'pending', 'active', 'in_progress', 'completed', 'cancelled'
    -- Types expect: 'under_review', 'active', 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed', 'draft'
    -- We'll add the missing values if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'under_review' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'job_status')
    ) THEN
        ALTER TYPE public.job_status ADD VALUE 'under_review';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'assigned' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'job_status')
    ) THEN
        ALTER TYPE public.job_status ADD VALUE 'assigned';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'disputed' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'job_status')
    ) THEN
        ALTER TYPE public.job_status ADD VALUE 'disputed';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'draft' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'job_status')
    ) THEN
        ALTER TYPE public.job_status ADD VALUE 'draft';
    END IF;
END $$;

-- Add missing columns to jobs table
DO $$ 
BEGIN
    -- Add images if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'jobs' 
        AND column_name = 'images'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN images jsonb;
    END IF;
    
    -- Add requirements if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'jobs' 
        AND column_name = 'requirements'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN requirements text;
    END IF;
    
    -- Add currency if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'jobs' 
        AND column_name = 'currency'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN currency character(3) DEFAULT 'MAD';
    END IF;
    
    -- Add max_applications if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'jobs' 
        AND column_name = 'max_applications'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN max_applications integer;
    END IF;
    
    -- Add premium_applications_purchased if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'jobs' 
        AND column_name = 'premium_applications_purchased'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN premium_applications_purchased integer DEFAULT 0;
    END IF;
    
    -- Add current_applications if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'jobs' 
        AND column_name = 'current_applications'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN current_applications integer DEFAULT 0;
    END IF;
    
    -- Add verification_status if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'jobs' 
        AND column_name = 'verification_status'
    ) THEN
        ALTER TABLE public.jobs 
        ADD COLUMN verification_status public.verification_status DEFAULT 'pending'::public.verification_status;
    END IF;
END $$;

-- Add missing columns to job_applications
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'job_applications' 
        AND column_name = 'availability'
    ) THEN
        ALTER TABLE public.job_applications ADD COLUMN availability text;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'job_applications' 
        AND column_name = 'experience_level'
    ) THEN
        ALTER TABLE public.job_applications ADD COLUMN experience_level text;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'job_applications' 
        AND column_name = 'experience_description'
    ) THEN
        ALTER TABLE public.job_applications ADD COLUMN experience_description text;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'job_applications' 
        AND column_name = 'availability_details'
    ) THEN
        ALTER TABLE public.job_applications ADD COLUMN availability_details text;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'job_applications' 
        AND column_name = 'is_flexible_schedule'
    ) THEN
        ALTER TABLE public.job_applications ADD COLUMN is_flexible_schedule boolean DEFAULT false;
    END IF;
END $$;

-- Add missing columns to reviews
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews' 
        AND column_name = 'reply_comment'
    ) THEN
        ALTER TABLE public.reviews ADD COLUMN reply_comment text;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews' 
        AND column_name = 'replied_at'
    ) THEN
        ALTER TABLE public.reviews ADD COLUMN replied_at timestamp with time zone;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews' 
        AND column_name = 'booking_id'
    ) THEN
        ALTER TABLE public.reviews ADD COLUMN booking_id uuid;
    END IF;
END $$;

-- Add missing columns to notifications
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'related_booking_id'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN related_booking_id uuid;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'related_service_id'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN related_service_id integer;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'action_url'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN action_url text;
    END IF;
END $$;

-- Add missing columns to transactions
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions' 
        AND column_name = 'cash_payment_confirmed'
    ) THEN
        ALTER TABLE public.transactions ADD COLUMN cash_payment_confirmed boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions' 
        AND column_name = 'cash_payment_confirmed_by'
    ) THEN
        ALTER TABLE public.transactions ADD COLUMN cash_payment_confirmed_by uuid REFERENCES public.users(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions' 
        AND column_name = 'cash_payment_confirmed_at'
    ) THEN
        ALTER TABLE public.transactions ADD COLUMN cash_payment_confirmed_at timestamp with time zone;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions' 
        AND column_name = 'booking_id'
    ) THEN
        ALTER TABLE public.transactions ADD COLUMN booking_id uuid;
    END IF;
END $$;

-- Grant permissions
GRANT ALL ON TABLE public.conversations TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.service_bookings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_favorites TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.tasker_availability TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.tasker_blocked_dates TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.job_application_counts TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_monthly_usage TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.wallet_transactions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.faq TO anon, authenticated, service_role;

