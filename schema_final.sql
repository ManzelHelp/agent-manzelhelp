-- ============================================
-- MANZELHELP COMPLETE DATABASE SCHEMA
-- ============================================
-- Merged from: manzelhelp_schema_cleaned.sql, MISSING_TABLES.sql,
--              STORAGE_SETUP.sql, VIEWS_AND_STORAGE.sql
-- Generated: 2024-12

-- ============================================
-- ENABLE REQUIRED EXTENSIONS
-- ============================================
-- Enable PostGIS extension for geography/geometry types
-- Note: PostGIS types are available in public schema after enabling
CREATE EXTENSION IF NOT EXISTS postgis;
-- Enable uuid-ossp extension for uuid_generate_v4() function
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
-- NOTE: Supabase manages search_path automatically, skip this
-- SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- ============================================
-- CREATE TYPES/ENUMS
-- ============================================
CREATE TYPE public.application_status AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'withdrawn'
);

CREATE TYPE public.experience_level AS ENUM (
    'beginner',
    'intermediate',
    'expert'
);

CREATE TYPE public.job_status AS ENUM (
    'pending',
    'active',
    'in_progress',
    'completed',
    'cancelled'
);

CREATE TYPE public.notification_type AS ENUM (
    'job_created',
    'application_received',
    'application_accepted',
    'job_completed',
    'payment_received',
    'message_received'
);

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded'
);

CREATE TYPE public.pricing_type AS ENUM (
    'fixed',
    'hourly',
    'per_item'
);

CREATE TYPE public.transaction_type AS ENUM (
    'job_payment',
    'platform_fee',
    'premium_application',
    'refund',
    'job_promotion',
    'service_promotion'
);

CREATE TYPE public.user_role AS ENUM (
    'customer',
    'tasker',
    'both',
    'admin'
);

CREATE TYPE public.verification_status AS ENUM (
    'pending',
    'verified',
    'rejected'
);

-- ============================================
-- CREATE MAIN TABLES
-- ============================================
CREATE TABLE public.addresses (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    label character varying(50) DEFAULT 'home'::character varying,
    street_address text NOT NULL,
    city character varying(100) NOT NULL,
    region character varying(100) NOT NULL,
    postal_code character varying(20),
    country character(2) DEFAULT 'MA'::bpchar,
    location geography(Point,4326),
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


-- ALTER TABLE public.addresses OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 277 (class 1259 OID 18457)
-- Name: addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.addresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.addresses_id_seq OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 4898 (class 0 OID 0)
-- Dependencies: 277
-- Name: addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.addresses_id_seq OWNED BY public.addresses.id;


--
-- TOC entry 300 (class 1259 OID 24340)
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    company_name character varying(255) NOT NULL,
    company_registration_number character varying(100),
    tax_id character varying(100),
    website character varying(255),
    description text,
    founded_year integer,
    number_of_employees integer,
    street_address text,
    city character varying(100),
    region character varying(100),
    postal_code character varying(20),
    country character(2) DEFAULT 'MA'::bpchar,
    location geography(Point,4326),
    company_email character varying(255),
    company_phone character varying(20),
    logo_url text,
    cover_image_url text,
    is_active boolean DEFAULT true,
    verification_status public.verification_status DEFAULT 'pending'::public.verification_status,
    verification_document_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


-- ALTER TABLE public.companies OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 303 (class 1259 OID 24377)
-- Name: company_promotion_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_promotion_profiles (
    id integer NOT NULL,
    company_id uuid NOT NULL,
    is_promoted boolean DEFAULT false,
    promotion_expires_at timestamp with time zone,
    promotion_boost_score integer DEFAULT 0,
    promotion_badge_type character varying(50),
    priority_in_search boolean DEFAULT false,
    featured_on_homepage boolean DEFAULT false,
    highlighted_badge boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


-- ALTER TABLE public.company_promotion_profiles OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 302 (class 1259 OID 24376)
-- Name: company_promotion_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.company_promotion_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.company_promotion_profiles_id_seq OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 4902 (class 0 OID 0)
-- Dependencies: 302
-- Name: company_promotion_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.company_promotion_profiles_id_seq OWNED BY public.company_promotion_profiles.id;


--
-- TOC entry 301 (class 1259 OID 24358)
-- Name: company_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_stats (
    id uuid NOT NULL,
    company_rating numeric(3,2) DEFAULT 0.00,
    total_reviews integer DEFAULT 0,
    completed_jobs integer DEFAULT 0,
    total_earnings numeric(12,2) DEFAULT 0.00,
    active_taskers integer DEFAULT 0,
    average_response_time_hours integer DEFAULT 0,
    cancellation_rate numeric(5,2) DEFAULT 0.00,
    updated_at timestamp with time zone DEFAULT now()
);


-- ALTER TABLE public.company_stats OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 287 (class 1259 OID 18563)
-- Name: job_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_applications (
    id integer NOT NULL,
    job_id uuid NOT NULL,
    tasker_id uuid NOT NULL,
    proposed_price numeric(10,2) NOT NULL,
    estimated_duration integer,
    message text,
    status public.application_status DEFAULT 'pending'::public.application_status,
    is_premium boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


-- ALTER TABLE public.job_applications OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 286 (class 1259 OID 18562)
-- Name: job_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.job_applications_id_seq OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 4906 (class 0 OID 0)
-- Dependencies: 286
-- Name: job_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_applications_id_seq OWNED BY public.job_applications.id;


--
-- TOC entry 285 (class 1259 OID 18528)
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    customer_id uuid NOT NULL,
    service_id integer NOT NULL,
    address_id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text NOT NULL,
    preferred_date date NOT NULL,
    preferred_time_start time without time zone,
    preferred_time_end time without time zone,
    is_flexible boolean DEFAULT false,
    estimated_duration integer,
    customer_budget numeric(10,2),
    final_price numeric(10,2),
    is_promoted boolean DEFAULT false,
    promotion_expires_at timestamp with time zone,
    promotion_boost_score integer DEFAULT 0,
    status public.job_status DEFAULT 'pending'::public.job_status,
    assigned_tasker_id uuid,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


-- ALTER TABLE public.jobs OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 291 (class 1259 OID 18611)
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    job_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    receiver_id uuid NOT NULL,
    content text NOT NULL,
    attachment_url text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


-- ALTER TABLE public.messages OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 290 (class 1259 OID 18610)
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.messages_id_seq OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 4910 (class 0 OID 0)
-- Dependencies: 290
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- TOC entry 295 (class 1259 OID 18663)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    type public.notification_type NOT NULL,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    related_job_id uuid,
    related_user_id uuid,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


-- ALTER TABLE public.notifications OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 294 (class 1259 OID 18662)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 4913 (class 0 OID 0)
-- Dependencies: 294
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 297 (class 1259 OID 18689)
-- Name: promotion_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_packages (
    id integer NOT NULL,
    name_en character varying(100) NOT NULL,
    name_fr character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    description_en text,
    description_fr text,
    description_ar text,
    price numeric(10,2) NOT NULL,
    duration_days integer NOT NULL,
    boost_score integer NOT NULL,
    priority_listing boolean DEFAULT false,
    featured_badge boolean DEFAULT false,
    social_media_promotion boolean DEFAULT false,
    email_promotion boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


-- ALTER TABLE public.promotion_packages OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 296 (class 1259 OID 18688)
-- Name: promotion_packages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promotion_packages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.promotion_packages_id_seq OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 4916 (class 0 OID 0)
-- Dependencies: 296
-- Name: promotion_packages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promotion_packages_id_seq OWNED BY public.promotion_packages.id;


--
-- TOC entry 299 (class 1259 OID 18704)
-- Name: promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotions (
    id integer NOT NULL,
    package_id integer NOT NULL,
    user_id uuid NOT NULL,
    job_id uuid,
    tasker_service_id integer,
    amount_paid numeric(10,2) NOT NULL,
    boost_score integer NOT NULL,
    starts_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    company_id uuid,
    tasker_profile_id uuid,
    CONSTRAINT promotion_target_check CHECK ((((job_id IS NOT NULL) AND (tasker_service_id IS NULL) AND (company_id IS NULL) AND (tasker_profile_id IS NULL)) OR ((job_id IS NULL) AND (tasker_service_id IS NOT NULL) AND (company_id IS NULL) AND (tasker_profile_id IS NULL)) OR ((job_id IS NULL) AND (tasker_service_id IS NULL) AND (company_id IS NOT NULL) AND (tasker_profile_id IS NULL)) OR ((job_id IS NULL) AND (tasker_service_id IS NULL) AND (company_id IS NULL) AND (tasker_profile_id IS NOT NULL))))
);


-- ALTER TABLE public.promotions OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 298 (class 1259 OID 18703)
-- Name: promotions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promotions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.promotions_id_seq OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 4919 (class 0 OID 0)
-- Dependencies: 298
-- Name: promotions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promotions_id_seq OWNED BY public.promotions.id;


--
-- TOC entry 289 (class 1259 OID 18586)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    job_id uuid NOT NULL,
    reviewer_id uuid NOT NULL,
    reviewee_id uuid NOT NULL,
    overall_rating integer NOT NULL,
    quality_rating integer,
    communication_rating integer,
    timeliness_rating integer,
    comment text,
    created_at timestamp with time zone DEFAULT now()
);


-- ALTER TABLE public.reviews OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 288 (class 1259 OID 18585)
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 4922 (class 0 OID 0)
-- Dependencies: 288
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- TOC entry 280 (class 1259 OID 18477)
-- Name: service_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_categories (
    id integer NOT NULL,
    name_en character varying(100) NOT NULL,
    name_fr character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    description_en text,
    description_fr text,
    description_ar text,
    icon_url text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


-- ALTER TABLE public.service_categories OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 279 (class 1259 OID 18476)
-- Name: service_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.service_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.service_categories_id_seq OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 4925 (class 0 OID 0)
-- Dependencies: 279
-- Name: service_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.service_categories_id_seq OWNED BY public.service_categories.id;


--
-- TOC entry 282 (class 1259 OID 18489)
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name_en character varying(100) NOT NULL,
    name_fr character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    description_en text,
    description_fr text,
    description_ar text,
    icon_url text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


-- ALTER TABLE public.services OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 281 (class 1259 OID 18488)
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.services_id_seq OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 4928 (class 0 OID 0)
-- Dependencies: 281
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- TOC entry 275 (class 1259 OID 18422)
-- Name: tasker_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasker_profiles (
    id uuid NOT NULL,
    experience_level public.experience_level,
    bio text,
    identity_document_url text,
    verification_status public.verification_status DEFAULT 'pending'::public.verification_status,
    service_radius_km integer DEFAULT 50,
    is_available boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT now(),
    operation_hours jsonb,
    company_id uuid
);


-- ALTER TABLE public.tasker_profiles OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 305 (class 1259 OID 24396)
-- Name: tasker_promotion_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasker_promotion_profiles (
    id integer NOT NULL,
    tasker_id uuid NOT NULL,
    is_promoted boolean DEFAULT false,
    promotion_expires_at timestamp with time zone,
    promotion_boost_score integer DEFAULT 0,
    promotion_badge_type character varying(50),
    priority_in_search boolean DEFAULT false,
    featured_on_homepage boolean DEFAULT false,
    highlighted_badge boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


-- ALTER TABLE public.tasker_promotion_profiles OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 304 (class 1259 OID 24395)
-- Name: tasker_promotion_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tasker_promotion_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.tasker_promotion_profiles_id_seq OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 4932 (class 0 OID 0)
-- Dependencies: 304
-- Name: tasker_promotion_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasker_promotion_profiles_id_seq OWNED BY public.tasker_promotion_profiles.id;


--
-- TOC entry 284 (class 1259 OID 18506)
-- Name: tasker_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasker_services (
    id integer NOT NULL,
    tasker_id uuid NOT NULL,
    service_id integer NOT NULL,
    pricing_type public.pricing_type DEFAULT 'fixed'::public.pricing_type,
    base_price numeric(10,2) NOT NULL,
    hourly_rate numeric(10,2),
    is_available boolean DEFAULT true,
    is_promoted boolean DEFAULT false,
    promotion_expires_at timestamp with time zone,
    promotion_boost_score integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


-- ALTER TABLE public.tasker_services OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 283 (class 1259 OID 18505)
-- Name: tasker_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tasker_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.tasker_services_id_seq OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 4935 (class 0 OID 0)
-- Dependencies: 283
-- Name: tasker_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasker_services_id_seq OWNED BY public.tasker_services.id;


--
-- TOC entry 293 (class 1259 OID 18637)
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    job_id uuid NOT NULL,
    payer_id uuid NOT NULL,
    payee_id uuid NOT NULL,
    transaction_type public.transaction_type NOT NULL,
    amount numeric(10,2) NOT NULL,
    platform_fee numeric(10,2) DEFAULT 0,
    payment_status public.payment_status DEFAULT 'pending'::public.payment_status,
    payment_method character varying(50),
    external_payment_id character varying(100),
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


-- ALTER TABLE public.transactions OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 292 (class 1259 OID 18636)
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.transactions_id_seq OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 4938 (class 0 OID 0)
-- Dependencies: 292
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- TOC entry 276 (class 1259 OID 18438)
-- Name: user_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_stats (
    id uuid NOT NULL,
    tasker_rating numeric(3,2) DEFAULT 0.00,
    total_reviews integer DEFAULT 0,
    completed_jobs integer DEFAULT 0,
    total_earnings numeric(12,2) DEFAULT 0.00,
    response_time_hours integer DEFAULT 0,
    cancellation_rate numeric(5,2) DEFAULT 0.00,
    jobs_posted integer DEFAULT 0,
    total_spent numeric(12,2) DEFAULT 0.00,
    updated_at timestamp with time zone DEFAULT now()
);


-- ALTER TABLE public.user_stats OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 274 (class 1259 OID 18407)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    role public.user_role DEFAULT 'customer'::public.user_role,
    is_active boolean DEFAULT true,
    email_verified boolean DEFAULT false,
    first_name character varying(100),
    last_name character varying(100),
    avatar_url text,
    date_of_birth date,
    preferred_language character varying(5) DEFAULT 'fr'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_login timestamp with time zone
);


-- ALTER TABLE public.users OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 4472 (class 2604 OID 18461)
-- Name: addresses id; Type: DEFAULT; Schema: public; Owner: postgres
--

-- ============================================
-- CREATE ADDITIONAL TABLES
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
    related_booking_id uuid REFERENCES public.service_bookings(id) ON DELETE SET NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_booking_id ON public.wallet_transactions(related_booking_id);

-- 9.5. WALLET_REFUND_REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.wallet_refund_requests (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tasker_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount numeric(10,2) NOT NULL CHECK (amount > 0),
    reference_code varchar(50) NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'payment_confirmed', 'admin_verifying', 'approved', 'rejected')),
    receipt_url text,
    admin_notes text,
    admin_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    confirmed_at timestamp with time zone,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_refund_requests_tasker_id ON public.wallet_refund_requests(tasker_id);
CREATE INDEX IF NOT EXISTS idx_wallet_refund_requests_status ON public.wallet_refund_requests(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_refund_requests_reference_code ON public.wallet_refund_requests(reference_code);
CREATE INDEX IF NOT EXISTS idx_wallet_refund_requests_created_at ON public.wallet_refund_requests(created_at DESC);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_wallet_refund_requests_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER wallet_refund_requests_updated_at
    BEFORE UPDATE ON public.wallet_refund_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_wallet_refund_requests_updated_at();

-- Activer RLS
ALTER TABLE public.wallet_refund_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour wallet_refund_requests
-- Policy INSERT : Les taskers peuvent créer leurs propres demandes
DROP POLICY IF EXISTS "Taskers can create refund requests" ON public.wallet_refund_requests;

CREATE POLICY "Taskers can create refund requests"
ON public.wallet_refund_requests FOR INSERT
TO authenticated
WITH CHECK (
    tasker_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('tasker', 'both')
    )
);

-- Policy SELECT : Les taskers peuvent lire leurs propres demandes, les admins peuvent tout lire
DROP POLICY IF EXISTS "Taskers can read own refund requests" ON public.wallet_refund_requests;
DROP POLICY IF EXISTS "Admins can read all refund requests" ON public.wallet_refund_requests;

CREATE POLICY "Taskers can read own refund requests"
ON public.wallet_refund_requests FOR SELECT
TO authenticated
USING (
    tasker_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy UPDATE : Les taskers peuvent mettre à jour leurs demandes en statut 'pending', les admins peuvent tout mettre à jour
DROP POLICY IF EXISTS "Taskers can update own pending refund requests" ON public.wallet_refund_requests;
DROP POLICY IF EXISTS "Admins can update all refund requests" ON public.wallet_refund_requests;

CREATE POLICY "Taskers can update own pending refund requests"
ON public.wallet_refund_requests FOR UPDATE
TO authenticated
USING (
    tasker_id = auth.uid() AND status = 'pending'
)
WITH CHECK (
    tasker_id = auth.uid() AND (status = 'pending' OR status = 'payment_confirmed')
);

CREATE POLICY "Admins can update all refund requests"
ON public.wallet_refund_requests FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

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

-- ============================================
-- SET SEQUENCE DEFAULTS
-- ============================================
ALTER TABLE ONLY public.addresses ALTER COLUMN id SET DEFAULT nextval('public.addresses_id_seq'::regclass);

ALTER TABLE ONLY public.company_promotion_profiles ALTER COLUMN id SET DEFAULT nextval('public.company_promotion_profiles_id_seq'::regclass);

ALTER TABLE ONLY public.job_applications ALTER COLUMN id SET DEFAULT nextval('public.job_applications_id_seq'::regclass);

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);

ALTER TABLE ONLY public.promotion_packages ALTER COLUMN id SET DEFAULT nextval('public.promotion_packages_id_seq'::regclass);

ALTER TABLE ONLY public.promotions ALTER COLUMN id SET DEFAULT nextval('public.promotions_id_seq'::regclass);

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);

ALTER TABLE ONLY public.service_categories ALTER COLUMN id SET DEFAULT nextval('public.service_categories_id_seq'::regclass);

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);

ALTER TABLE ONLY public.tasker_promotion_profiles ALTER COLUMN id SET DEFAULT nextval('public.tasker_promotion_profiles_id_seq'::regclass);

ALTER TABLE ONLY public.tasker_services ALTER COLUMN id SET DEFAULT nextval('public.tasker_services_id_seq'::regclass);

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);

-- ============================================
-- PRIMARY KEYS
-- ============================================
ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.company_promotion_profiles
    ADD CONSTRAINT company_promotion_profiles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.company_stats
    ADD CONSTRAINT company_stats_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.promotion_packages
    ADD CONSTRAINT promotion_packages_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.tasker_profiles
    ADD CONSTRAINT tasker_profiles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.tasker_promotion_profiles
    ADD CONSTRAINT tasker_promotion_profiles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.tasker_services
    ADD CONSTRAINT tasker_services_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- ============================================
-- UNIQUE CONSTRAINTS
-- ============================================
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX idx_addresses_city ON public.addresses USING btree (city);

CREATE INDEX idx_addresses_location ON public.addresses USING gist (location);

CREATE INDEX idx_addresses_user_id ON public.addresses USING btree (user_id);

CREATE INDEX idx_companies_active ON public.companies USING btree (is_active);

CREATE INDEX idx_companies_city ON public.companies USING btree (city);

CREATE INDEX idx_companies_location ON public.companies USING gist (location);

CREATE INDEX idx_companies_name ON public.companies USING btree (company_name);

CREATE INDEX idx_companies_verification ON public.companies USING btree (verification_status);

CREATE INDEX idx_company_promotion_profiles_badge_type ON public.company_promotion_profiles USING btree (promotion_badge_type);

CREATE INDEX idx_company_promotion_profiles_boost_score ON public.company_promotion_profiles USING btree (promotion_boost_score DESC);

CREATE INDEX idx_company_promotion_profiles_company_id ON public.company_promotion_profiles USING btree (company_id);

CREATE INDEX idx_company_promotion_profiles_promoted ON public.company_promotion_profiles USING btree (is_promoted, promotion_expires_at);

CREATE INDEX idx_company_stats_completed_jobs ON public.company_stats USING btree (completed_jobs);

CREATE INDEX idx_company_stats_rating ON public.company_stats USING btree (company_rating);

CREATE INDEX idx_job_applications_job_id ON public.job_applications USING btree (job_id);

CREATE INDEX idx_job_applications_status ON public.job_applications USING btree (status);

CREATE INDEX idx_job_applications_tasker_id ON public.job_applications USING btree (tasker_id);

CREATE INDEX idx_jobs_assigned_tasker ON public.jobs USING btree (assigned_tasker_id);

CREATE INDEX idx_jobs_boost_score ON public.jobs USING btree (promotion_boost_score DESC);

CREATE INDEX idx_jobs_created_at ON public.jobs USING btree (created_at);

CREATE INDEX idx_jobs_customer_id ON public.jobs USING btree (customer_id);

CREATE INDEX idx_jobs_date ON public.jobs USING btree (preferred_date);

CREATE INDEX idx_jobs_promoted ON public.jobs USING btree (is_promoted, promotion_expires_at);

CREATE INDEX idx_jobs_service_id ON public.jobs USING btree (service_id);

CREATE INDEX idx_jobs_status ON public.jobs USING btree (status);

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at);

CREATE INDEX idx_messages_job_id ON public.messages USING btree (job_id);

CREATE INDEX idx_messages_receiver_unread ON public.messages USING btree (receiver_id, is_read);

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at);

CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, is_read);

CREATE INDEX idx_promotions_active ON public.promotions USING btree (is_active, expires_at);

CREATE INDEX idx_promotions_company_id ON public.promotions USING btree (company_id);

CREATE INDEX idx_promotions_expires_at ON public.promotions USING btree (expires_at);

CREATE INDEX idx_promotions_job_id ON public.promotions USING btree (job_id);

CREATE INDEX idx_promotions_tasker_profile_id ON public.promotions USING btree (tasker_profile_id);

CREATE INDEX idx_promotions_tasker_service_id ON public.promotions USING btree (tasker_service_id);

CREATE INDEX idx_promotions_user_id ON public.promotions USING btree (user_id);

CREATE INDEX idx_reviews_job_id ON public.reviews USING btree (job_id);

CREATE INDEX idx_reviews_rating ON public.reviews USING btree (overall_rating);

CREATE INDEX idx_reviews_reviewee_id ON public.reviews USING btree (reviewee_id);

CREATE INDEX idx_service_categories_active ON public.service_categories USING btree (is_active);

CREATE INDEX idx_services_active ON public.services USING btree (is_active);

CREATE INDEX idx_services_category_id ON public.services USING btree (category_id);

CREATE INDEX idx_tasker_profiles_available ON public.tasker_profiles USING btree (is_available);

CREATE INDEX idx_tasker_profiles_company_id ON public.tasker_profiles USING btree (company_id);

CREATE INDEX idx_tasker_profiles_verification ON public.tasker_profiles USING btree (verification_status);

CREATE INDEX idx_tasker_promotion_profiles_badge_type ON public.tasker_promotion_profiles USING btree (promotion_badge_type);

CREATE INDEX idx_tasker_promotion_profiles_boost_score ON public.tasker_promotion_profiles USING btree (promotion_boost_score DESC);

CREATE INDEX idx_tasker_promotion_profiles_promoted ON public.tasker_promotion_profiles USING btree (is_promoted, promotion_expires_at);

CREATE INDEX idx_tasker_promotion_profiles_tasker_id ON public.tasker_promotion_profiles USING btree (tasker_id);

CREATE INDEX idx_tasker_services_available ON public.tasker_services USING btree (is_available);

CREATE INDEX idx_tasker_services_boost_score ON public.tasker_services USING btree (promotion_boost_score DESC);

CREATE INDEX idx_tasker_services_promoted ON public.tasker_services USING btree (is_promoted, promotion_expires_at);

CREATE INDEX idx_tasker_services_service_id ON public.tasker_services USING btree (service_id);

CREATE INDEX idx_tasker_services_tasker_id ON public.tasker_services USING btree (tasker_id);

CREATE INDEX idx_transactions_created_at ON public.transactions USING btree (created_at);

CREATE INDEX idx_transactions_job_id ON public.transactions USING btree (job_id);

CREATE INDEX idx_transactions_payee_id ON public.transactions USING btree (payee_id);

CREATE INDEX idx_transactions_payer_id ON public.transactions USING btree (payer_id);

CREATE INDEX idx_transactions_status ON public.transactions USING btree (payment_status);

CREATE INDEX idx_user_stats_completed_jobs ON public.user_stats USING btree (completed_jobs);

CREATE INDEX idx_user_stats_rating ON public.user_stats USING btree (tasker_rating);

CREATE INDEX idx_users_active ON public.users USING btree (is_active);

CREATE INDEX idx_users_email ON public.users USING btree (email);

CREATE INDEX idx_users_phone ON public.users USING btree (phone);

CREATE INDEX idx_users_role ON public.users USING btree (role);

CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON public.conversations(participant1_id);

CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON public.conversations(participant2_id);

CREATE INDEX IF NOT EXISTS idx_conversations_job_id ON public.conversations(job_id);

CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_service_bookings_customer_id ON public.service_bookings(customer_id);

CREATE INDEX IF NOT EXISTS idx_service_bookings_tasker_id ON public.service_bookings(tasker_id);

CREATE INDEX IF NOT EXISTS idx_service_bookings_tasker_service_id ON public.service_bookings(tasker_service_id);

CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON public.service_bookings(status);

CREATE INDEX IF NOT EXISTS idx_service_bookings_scheduled_date ON public.service_bookings(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_service_bookings_created_at ON public.service_bookings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);

CREATE INDEX IF NOT EXISTS idx_user_favorites_tasker_id ON public.user_favorites(tasker_id);

CREATE INDEX IF NOT EXISTS idx_tasker_availability_tasker_id ON public.tasker_availability(tasker_id);

CREATE INDEX IF NOT EXISTS idx_tasker_availability_day ON public.tasker_availability(day_of_week);

CREATE INDEX IF NOT EXISTS idx_tasker_blocked_dates_tasker_id ON public.tasker_blocked_dates(tasker_id);

CREATE INDEX IF NOT EXISTS idx_tasker_blocked_dates_date ON public.tasker_blocked_dates(blocked_date);

CREATE INDEX IF NOT EXISTS idx_job_application_counts_job_id ON public.job_application_counts(job_id);

CREATE INDEX IF NOT EXISTS idx_user_monthly_usage_user_id ON public.user_monthly_usage(user_id);

CREATE INDEX IF NOT EXISTS idx_user_monthly_usage_month_year ON public.user_monthly_usage(month_year);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions(type);

CREATE INDEX IF NOT EXISTS idx_faq_role ON public.faq(role);

CREATE INDEX IF NOT EXISTS idx_faq_audience ON public.faq(audience);

CREATE INDEX IF NOT EXISTS idx_faq_category ON public.faq(category);

-- ============================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================
ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.company_promotion_profiles
    ADD CONSTRAINT company_promotion_profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.company_stats
    ADD CONSTRAINT company_stats_id_fkey FOREIGN KEY (id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_tasker_id_fkey FOREIGN KEY (tasker_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_assigned_tasker_id_fkey FOREIGN KEY (assigned_tasker_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_related_job_id_fkey FOREIGN KEY (related_job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_related_user_id_fkey FOREIGN KEY (related_user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.promotion_packages(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_tasker_profile_id_fkey FOREIGN KEY (tasker_profile_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_tasker_service_id_fkey FOREIGN KEY (tasker_service_id) REFERENCES public.tasker_services(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.tasker_profiles
    ADD CONSTRAINT tasker_profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.tasker_profiles
    ADD CONSTRAINT tasker_profiles_id_fkey FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.tasker_promotion_profiles
    ADD CONSTRAINT tasker_promotion_profiles_tasker_id_fkey FOREIGN KEY (tasker_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.tasker_services
    ADD CONSTRAINT tasker_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.tasker_services
    ADD CONSTRAINT tasker_services_tasker_id_fkey FOREIGN KEY (tasker_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_payee_id_fkey FOREIGN KEY (payee_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_payer_id_fkey FOREIGN KEY (payer_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_id_fkey FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;

-- ============================================
-- CREATE VIEWS
-- ============================================
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

-- ============================================
-- CREATE STORAGE BUCKETS
-- ============================================
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

-- ============================================
-- INSERT INITIAL DATA
-- ============================================
-- ============================================
-- INSERT INITIAL DATA
-- ============================================

-- Insert promotion_packages
INSERT INTO public.promotion_packages (id, name_en, name_fr, name_ar, description_en, description_fr, description_ar, price, duration_days, boost_score, priority_listing, featured_badge, social_media_promotion, email_promotion, is_active, created_at) VALUES
(1, 'Tasker Basic Promotion', 'Promotion Tasker Basique', 'ترويج أساسي للحرفي', 'Basic promotion for individual tasker profile', 'Promotion basique pour profil tasker individuel', 'ترويج أساسي لملف الحرفي الفردي', 50.00, 7, 10, true, false, false, false, true, '2025-07-21 21:43:28.193714+00'),
(2, 'Tasker Premium Promotion', 'Promotion Tasker Premium', 'ترويج مميز للحرفي', 'Premium promotion with featured badge for tasker', 'Promotion premium avec badge vedette pour tasker', 'ترويج مميز مع شارة مميزة للحرفي', 150.00, 30, 25, true, true, false, false, true, '2025-07-21 21:43:28.193714+00'),
(3, 'Company Basic Promotion', 'Promotion Entreprise Basique', 'ترويج أساسي للشركة', 'Basic promotion for company profile', 'Promotion basique pour profil entreprise', 'ترويج أساسي لملف الشركة', 100.00, 7, 20, true, false, false, false, true, '2025-07-21 21:43:28.193714+00'),
(4, 'Company Premium Promotion', 'Promotion Entreprise Premium', 'ترويج مميز للشركة', 'Premium promotion for company with all features', 'Promotion premium pour entreprise avec toutes les fonctionnalités', 'ترويج مميز للشركة مع جميع الميزات', 300.00, 30, 50, true, true, false, false, true, '2025-07-21 21:43:28.193714+00'),
(5, 'Company Spotlight', 'Entreprise En Vedette', 'شركة مميزة', 'Company profile spotlight with maximum visibility', 'Spotlight entreprise avec visibilité maximale', 'بروز الشركة مع أقصى قدر من الرؤية', 500.00, 30, 100, true, true, false, false, true, '2025-07-21 21:43:28.193714+00');

-- Insert service_categories
INSERT INTO public.service_categories (id, name_en, name_fr, name_ar, description_en, description_fr, description_ar, icon_url, is_active, sort_order, created_at) VALUES
(1, 'Cleaning', 'Nettoyage', 'تنظيف', NULL, NULL, NULL, NULL, true, 1, '2025-07-16 13:35:05.046123+00'),
(2, 'Handyman', 'Bricolage', 'صيانة منزلية', NULL, NULL, NULL, NULL, true, 2, '2025-07-16 13:35:05.046123+00'),
(3, 'Plumbing', 'Plomberie', 'سباكة', NULL, NULL, NULL, NULL, true, 3, '2025-07-16 13:35:05.046123+00'),
(4, 'Electrical', 'Électricité', 'كهرباء', NULL, NULL, NULL, NULL, true, 4, '2025-07-16 13:35:05.046123+00'),
(5, 'Gardening', 'Jardinage', 'بستنة', NULL, NULL, NULL, NULL, true, 5, '2025-07-16 13:35:05.046123+00'),
(6, 'Moving', 'Déménagement', 'نقل', NULL, NULL, NULL, NULL, true, 6, '2025-07-16 13:35:05.046123+00'),
(7, 'Delivery', 'Livraison', 'توصيل', NULL, NULL, NULL, NULL, true, 7, '2025-07-16 13:35:05.046123+00'),
(8, 'Beauty & Wellness', 'Beauté & Bien-être', 'جمال و عناية', NULL, NULL, NULL, NULL, true, 8, '2025-07-16 13:35:05.046123+00'),
(9, 'Tutoring', 'Cours particuliers', 'دروس خصوصية', NULL, NULL, NULL, NULL, true, 9, '2025-07-16 13:35:05.046123+00'),
(10, 'IT & Tech', 'Informatique & Tech', 'تكنولوجيا المعلومات', NULL, NULL, NULL, NULL, true, 10, '2025-07-16 13:35:05.046123+00'),
(11, 'Automotive', 'Automobile', 'سيارات', NULL, NULL, NULL, NULL, true, 11, '2025-07-16 13:35:05.046123+00'),
(12, 'Pet Care', 'Soins pour animaux', 'رعاية الحيوانات', NULL, NULL, NULL, NULL, true, 12, '2025-07-16 13:35:05.046123+00'),
(13, 'Event Services', 'Services événementiels', 'خدمات المناسبات', NULL, NULL, NULL, NULL, true, 13, '2025-07-16 13:35:05.046123+00');

-- Insert services
INSERT INTO public.services (id, category_id, name_en, name_fr, name_ar, description_en, description_fr, description_ar, icon_url, is_active, sort_order, created_at) VALUES
(1, 1, 'House Cleaning', 'Nettoyage de maison', 'تنظيف المنزل', NULL, NULL, NULL, NULL, true, 1, '2025-07-16 13:35:05.046123+00'),
(2, 1, 'Office Cleaning', 'Nettoyage de bureau', 'تنظيف المكتب', NULL, NULL, NULL, NULL, true, 2, '2025-07-16 13:35:05.046123+00'),
(3, 1, 'Deep Cleaning', 'Nettoyage en profondeur', 'تنظيف عميق', NULL, NULL, NULL, NULL, true, 3, '2025-07-16 13:35:05.046123+00'),
(4, 1, 'Window Cleaning', 'Nettoyage de vitres', 'تنظيف النوافذ', NULL, NULL, NULL, NULL, true, 4, '2025-07-16 13:35:05.046123+00'),
(5, 1, 'Carpet Cleaning', 'Nettoyage de tapis', 'تنظيف السجاد', NULL, NULL, NULL, NULL, true, 5, '2025-07-16 13:35:05.046123+00'),
(6, 1, 'Post-Construction Cleaning', 'Nettoyage après travaux', 'تنظيف بعد البناء', NULL, NULL, NULL, NULL, true, 6, '2025-07-16 13:35:05.046123+00'),
(7, 2, 'Furniture Assembly', 'Montage de meubles', 'تركيب الأثاث', NULL, NULL, NULL, NULL, true, 1, '2025-07-16 13:35:05.046123+00'),
(8, 2, 'Painting', 'Peinture', 'طلاء', NULL, NULL, NULL, NULL, true, 2, '2025-07-16 13:35:05.046123+00'),
(9, 2, 'Wall Mounting', 'Fixation murale', 'تعليق على الحائط', NULL, NULL, NULL, NULL, true, 3, '2025-07-16 13:35:05.046123+00'),
(10, 2, 'Door & Window Repair', 'Réparation portes/fenêtres', 'إصلاح الأبواب والنوافذ', NULL, NULL, NULL, NULL, true, 4, '2025-07-16 13:35:05.046123+00'),
(11, 2, 'Shelving Installation', 'Installation d''étagères', 'تركيب الرفوف', NULL, NULL, NULL, NULL, true, 5, '2025-07-16 13:35:05.046123+00'),
(12, 2, 'Minor Repairs', 'Petites réparations', 'إصلاحات بسيطة', NULL, NULL, NULL, NULL, true, 6, '2025-07-16 13:35:05.046123+00'),
(13, 3, 'Leak Repair', 'Réparation de fuites', 'إصلاح التسريبات', NULL, NULL, NULL, NULL, true, 1, '2025-07-16 13:35:05.046123+00'),
(14, 3, 'Toilet Repair', 'Réparation WC', 'إصلاح المرحاض', NULL, NULL, NULL, NULL, true, 2, '2025-07-16 13:35:05.046123+00'),
(15, 3, 'Drain Cleaning', 'Débouchage canalisations', 'تنظيف المجاري', NULL, NULL, NULL, NULL, true, 3, '2025-07-16 13:35:05.046123+00'),
(16, 3, 'Faucet Installation', 'Installation robinetterie', 'تركيب الصنابير', NULL, NULL, NULL, NULL, true, 4, '2025-07-16 13:35:05.046123+00'),
(17, 3, 'Water Heater Repair', 'Réparation chauffe-eau', 'إصلاح سخان المياه', NULL, NULL, NULL, NULL, true, 5, '2025-07-16 13:35:05.046123+00'),
(18, 3, 'Pipe Installation', 'Installation tuyauterie', 'تركيب الأنابيب', NULL, NULL, NULL, NULL, true, 6, '2025-07-16 13:35:05.046123+00'),
(19, 4, 'Light Installation', 'Installation éclairage', 'تركيب الإضاءة', NULL, NULL, NULL, NULL, true, 1, '2025-07-16 13:35:05.046123+00'),
(20, 4, 'Socket Installation', 'Installation prises', 'تركيب المقابس', NULL, NULL, NULL, NULL, true, 2, '2025-07-16 13:35:05.046123+00'),
(21, 4, 'Electrical Troubleshooting', 'Dépannage électrique', 'إصلاح الأعطال الكهربائية', NULL, NULL, NULL, NULL, true, 3, '2025-07-16 13:35:05.046123+00'),
(22, 4, 'Ceiling Fan Installation', 'Installation ventilateur', 'تركيب مروحة السقف', NULL, NULL, NULL, NULL, true, 4, '2025-07-16 13:35:05.046123+00'),
(23, 4, 'Circuit Breaker Repair', 'Réparation disjoncteur', 'إصلاح قاطع الدائرة', NULL, NULL, NULL, NULL, true, 5, '2025-07-16 13:35:05.046123+00'),
(24, 4, 'Wiring Installation', 'Installation câblage', 'تركيب الأسلاك', NULL, NULL, NULL, NULL, true, 6, '2025-07-16 13:35:05.046123+00'),
(25, 5, 'Lawn Mowing', 'Tonte pelouse', 'قص العشب', NULL, NULL, NULL, NULL, true, 1, '2025-07-16 13:35:05.046123+00'),
(26, 5, 'Garden Maintenance', 'Entretien jardin', 'صيانة الحديقة', NULL, NULL, NULL, NULL, true, 2, '2025-07-16 13:35:05.046123+00'),
(27, 5, 'Tree Trimming', 'Élagage arbres', 'تقليم الأشجار', NULL, NULL, NULL, NULL, true, 3, '2025-07-16 13:35:05.046123+00'),
(28, 5, 'Planting', 'Plantation', 'زراعة', NULL, NULL, NULL, NULL, true, 4, '2025-07-16 13:35:05.046123+00'),
(29, 5, 'Weeding', 'Désherbage', 'إزالة الأعشاب', NULL, NULL, NULL, NULL, true, 5, '2025-07-16 13:35:05.046123+00'),
(30, 5, 'Irrigation System Setup', 'Installation arrosage', 'تركيب نظام الري', NULL, NULL, NULL, NULL, true, 6, '2025-07-16 13:35:05.046123+00'),
(31, 6, 'Home Moving', 'Déménagement résidentiel', 'نقل المنزل', NULL, NULL, NULL, NULL, true, 1, '2025-07-16 13:35:05.046123+00'),
(32, 6, 'Office Moving', 'Déménagement bureau', 'نقل المكتب', NULL, NULL, NULL, NULL, true, 2, '2025-07-16 13:35:05.046123+00'),
(33, 6, 'Packing Services', 'Services d''emballage', 'خدمات التعبئة', NULL, NULL, NULL, NULL, true, 3, '2025-07-16 13:35:05.046123+00'),
(34, 6, 'Furniture Moving', 'Transport mobilier', 'نقل الأثاث', NULL, NULL, NULL, NULL, true, 4, '2025-07-16 13:35:05.046123+00'),
(35, 6, 'Storage Services', 'Services de stockage', 'خدمات التخزين', NULL, NULL, NULL, NULL, true, 5, '2025-07-16 13:35:05.046123+00'),
(36, 7, 'Food Delivery', 'Livraison nourriture', 'توصيل الطعام', NULL, NULL, NULL, NULL, true, 1, '2025-07-16 13:35:05.046123+00'),
(37, 7, 'Package Delivery', 'Livraison colis', 'توصيل الطرود', NULL, NULL, NULL, NULL, true, 2, '2025-07-16 13:35:05.046123+00'),
(38, 7, 'Grocery Delivery', 'Livraison courses', 'توصيل البقالة', NULL, NULL, NULL, NULL, true, 3, '2025-07-16 13:35:05.046123+00'),
(39, 7, 'Pharmacy Delivery', 'Livraison pharmacie', 'توصيل الصيدلية', NULL, NULL, NULL, NULL, true, 4, '2025-07-16 13:35:05.046123+00'),
(40, 7, 'Document Delivery', 'Livraison documents', 'توصيل المستندات', NULL, NULL, NULL, NULL, true, 5, '2025-07-16 13:35:05.046123+00'),
(41, 8, 'Home Hairdressing', 'Coiffure à domicile', 'تصفيف الشعر بالمنزل', NULL, NULL, NULL, NULL, true, 1, '2025-07-16 13:35:05.046123+00'),
(42, 8, 'Manicure/Pedicure', 'Manucure/Pédicure', 'عناية الأظافر', NULL, NULL, NULL, NULL, true, 2, '2025-07-16 13:35:05.046123+00'),
(43, 8, 'Massage Therapy', 'Massage thérapeutique', 'تدليك علاجي', NULL, NULL, NULL, NULL, true, 3, '2025-07-16 13:35:05.046123+00'),
(44, 8, 'Makeup Services', 'Services maquillage', 'خدمات المكياج', NULL, NULL, NULL, NULL, true, 4, '2025-07-16 13:35:05.046123+00'),
(45, 8, 'Facial Treatment', 'Soins du visage', 'علاج الوجه', NULL, NULL, NULL, NULL, true, 5, '2025-07-16 13:35:05.046123+00'),
(46, 9, 'Math Tutoring', 'Cours de mathématiques', 'دروس الرياضيات', NULL, NULL, NULL, NULL, true, 1, '2025-07-16 13:35:05.046123+00'),
(47, 9, 'Language Tutoring', 'Cours de langues', 'دروس اللغات', NULL, NULL, NULL, NULL, true, 2, '2025-07-16 13:35:05.046123+00'),
(48, 9, 'Science Tutoring', 'Cours de sciences', 'دروس العلوم', NULL, NULL, NULL, NULL, true, 3, '2025-07-16 13:35:05.046123+00'),
(49, 9, 'Computer Skills', 'Informatique', 'مهارات الحاسوب', NULL, NULL, NULL, NULL, true, 4, '2025-07-16 13:35:05.046123+00'),
(50, 9, 'Music Lessons', 'Cours de musique', 'دروس الموسيقى', NULL, NULL, NULL, NULL, true, 5, '2025-07-16 13:35:05.046123+00'),
(51, 10, 'Computer Repair', 'Réparation ordinateur', 'إصلاح الكمبيوتر', NULL, NULL, NULL, NULL, true, 1, '2025-07-16 13:35:05.046123+00'),
(52, 10, 'Software Installation', 'Installation logiciel', 'تثبيت البرامج', NULL, NULL, NULL, NULL, true, 2, '2025-07-16 13:35:05.046123+00'),
(53, 10, 'Network Setup', 'Configuration réseau', 'إعداد الشبكة', NULL, NULL, NULL, NULL, true, 3, '2025-07-16 13:35:05.046123+00'),
(54, 10, 'Data Recovery', 'Récupération données', 'استعادة البيانات', NULL, NULL, NULL, NULL, true, 4, '2025-07-16 13:35:05.046123+00'),
(55, 10, 'Phone Repair', 'Réparation téléphone', 'إصلاح الهاتف', NULL, NULL, NULL, NULL, true, 5, '2025-07-16 13:35:05.046123+00'),
(56, 11, 'Car Washing', 'Lavage auto', 'غسيل السيارة', NULL, NULL, NULL, NULL, true, 1, '2025-07-16 13:35:05.046123+00'),
(57, 11, 'Oil Change', 'Vidange', 'تغيير الزيت', NULL, NULL, NULL, NULL, true, 2, '2025-07-16 13:35:05.046123+00'),
(58, 11, 'Tire Change', 'Changement pneus', 'تغيير الإطارات', NULL, NULL, NULL, NULL, true, 3, '2025-07-16 13:35:05.046123+00'),
(59, 11, 'Battery Replacement', 'Remplacement batterie', 'استبدال البطارية', NULL, NULL, NULL, NULL, true, 4, '2025-07-16 13:35:05.046123+00'),
(60, 11, 'Car Detailing', 'Nettoyage détaillé', 'تنظيف تفصيلي', NULL, NULL, NULL, NULL, true, 5, '2025-07-16 13:35:05.046123+00'),
(61, 12, 'Pet Walking', 'Promenade animaux', 'المشي مع الحيوانات', NULL, NULL, NULL, NULL, true, 1, '2025-07-16 13:35:05.046123+00'),
(62, 12, 'Pet Sitting', 'Garde d''animaux', 'رعاية الحيوانات', NULL, NULL, NULL, NULL, true, 2, '2025-07-16 13:35:05.046123+00'),
(63, 12, 'Pet Grooming', 'Toilettage', 'تنظيف الحيوانات', NULL, NULL, NULL, NULL, true, 3, '2025-07-16 13:35:05.046123+00'),
(64, 12, 'Pet Training', 'Dressage', 'تدريب الحيوانات', NULL, NULL, NULL, NULL, true, 4, '2025-07-16 13:35:05.046123+00'),
(65, 13, 'Event Planning', 'Organisation événements', 'تنظيم المناسبات', NULL, NULL, NULL, NULL, true, 1, '2025-07-16 13:35:05.046123+00'),
(66, 13, 'Catering Services', 'Services traiteur', 'خدمات التموين', NULL, NULL, NULL, NULL, true, 2, '2025-07-16 13:35:05.046123+00'),
(67, 13, 'Photography', 'Photographie', 'التصوير الفوتوغرافي', NULL, NULL, NULL, NULL, true, 3, '2025-07-16 13:35:05.046123+00'),
(68, 13, 'DJ Services', 'Services DJ', 'خدمات دي جي', NULL, NULL, NULL, NULL, true, 4, '2025-07-16 13:35:05.046123+00'),
(69, 13, 'Decoration', 'Décoration', 'ديكور', NULL, NULL, NULL, NULL, true, 5, '2025-07-16 13:35:05.046123+00');

-- Insert users
INSERT INTO public.users (id, email, phone, role, is_active, email_verified, first_name, last_name, avatar_url, date_of_birth, preferred_language, created_at, updated_at, last_login) VALUES
('6c8e8ac5-3b32-4759-b239-2b35006abd7c', 'jbs2jonas@gmail.com', NULL, 'tasker', true, true, NULL, NULL, NULL, NULL, 'fr', '2025-07-20 19:11:20.249051+00', '2025-07-20 19:11:29.947+00', NULL);

-- ============================================
-- SET SEQUENCE VALUES
-- ============================================
SELECT pg_catalog.setval('public.addresses_id_seq', 1, false);

SELECT pg_catalog.setval('public.company_promotion_profiles_id_seq', 1, false);

SELECT pg_catalog.setval('public.job_applications_id_seq', 1, false);

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);

SELECT pg_catalog.setval('public.promotion_packages_id_seq', 5, true);

SELECT pg_catalog.setval('public.promotions_id_seq', 1, false);

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);

SELECT pg_catalog.setval('public.service_categories_id_seq', 13, true);

SELECT pg_catalog.setval('public.services_id_seq', 69, true);

SELECT pg_catalog.setval('public.tasker_promotion_profiles_id_seq', 1, false);

SELECT pg_catalog.setval('public.tasker_services_id_seq', 1, false);

SELECT pg_catalog.setval('public.transactions_id_seq', 1, false);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON SCHEMA public TO postgres;

GRANT USAGE ON SCHEMA public TO anon;

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT USAGE ON SCHEMA public TO service_role;

GRANT ALL ON TABLE public.addresses TO anon;

GRANT ALL ON TABLE public.addresses TO authenticated;

GRANT ALL ON TABLE public.addresses TO service_role;

GRANT ALL ON SEQUENCE public.addresses_id_seq TO anon;

GRANT ALL ON SEQUENCE public.addresses_id_seq TO authenticated;

GRANT ALL ON SEQUENCE public.addresses_id_seq TO service_role;

GRANT ALL ON TABLE public.companies TO anon;

GRANT ALL ON TABLE public.companies TO authenticated;

GRANT ALL ON TABLE public.companies TO service_role;

GRANT ALL ON TABLE public.company_promotion_profiles TO anon;

GRANT ALL ON TABLE public.company_promotion_profiles TO authenticated;

GRANT ALL ON TABLE public.company_promotion_profiles TO service_role;

GRANT ALL ON SEQUENCE public.company_promotion_profiles_id_seq TO anon;

GRANT ALL ON SEQUENCE public.company_promotion_profiles_id_seq TO authenticated;

GRANT ALL ON SEQUENCE public.company_promotion_profiles_id_seq TO service_role;

GRANT ALL ON TABLE public.company_stats TO anon;

GRANT ALL ON TABLE public.company_stats TO authenticated;

GRANT ALL ON TABLE public.company_stats TO service_role;

GRANT ALL ON TABLE public.job_applications TO anon;

GRANT ALL ON TABLE public.job_applications TO authenticated;

GRANT ALL ON TABLE public.job_applications TO service_role;

GRANT ALL ON SEQUENCE public.job_applications_id_seq TO anon;

GRANT ALL ON SEQUENCE public.job_applications_id_seq TO authenticated;

GRANT ALL ON SEQUENCE public.job_applications_id_seq TO service_role;

GRANT ALL ON TABLE public.jobs TO anon;

GRANT ALL ON TABLE public.jobs TO authenticated;

GRANT ALL ON TABLE public.jobs TO service_role;

GRANT ALL ON TABLE public.messages TO anon;

GRANT ALL ON TABLE public.messages TO authenticated;

GRANT ALL ON TABLE public.messages TO service_role;

GRANT ALL ON SEQUENCE public.messages_id_seq TO anon;

GRANT ALL ON SEQUENCE public.messages_id_seq TO authenticated;

GRANT ALL ON SEQUENCE public.messages_id_seq TO service_role;

GRANT ALL ON TABLE public.notifications TO anon;

GRANT ALL ON TABLE public.notifications TO authenticated;

GRANT ALL ON TABLE public.notifications TO service_role;

GRANT ALL ON SEQUENCE public.notifications_id_seq TO anon;

GRANT ALL ON SEQUENCE public.notifications_id_seq TO authenticated;

GRANT ALL ON SEQUENCE public.notifications_id_seq TO service_role;

GRANT ALL ON TABLE public.promotion_packages TO anon;

GRANT ALL ON TABLE public.promotion_packages TO authenticated;

GRANT ALL ON TABLE public.promotion_packages TO service_role;

GRANT ALL ON SEQUENCE public.promotion_packages_id_seq TO anon;

GRANT ALL ON SEQUENCE public.promotion_packages_id_seq TO authenticated;

GRANT ALL ON SEQUENCE public.promotion_packages_id_seq TO service_role;

GRANT ALL ON TABLE public.promotions TO anon;

GRANT ALL ON TABLE public.promotions TO authenticated;

GRANT ALL ON TABLE public.promotions TO service_role;

GRANT ALL ON SEQUENCE public.promotions_id_seq TO anon;

GRANT ALL ON SEQUENCE public.promotions_id_seq TO authenticated;

GRANT ALL ON SEQUENCE public.promotions_id_seq TO service_role;

GRANT ALL ON TABLE public.reviews TO anon;

GRANT ALL ON TABLE public.reviews TO authenticated;

GRANT ALL ON TABLE public.reviews TO service_role;

GRANT ALL ON SEQUENCE public.reviews_id_seq TO anon;

GRANT ALL ON SEQUENCE public.reviews_id_seq TO authenticated;

GRANT ALL ON SEQUENCE public.reviews_id_seq TO service_role;

GRANT ALL ON TABLE public.service_categories TO anon;

GRANT ALL ON TABLE public.service_categories TO authenticated;

GRANT ALL ON TABLE public.service_categories TO service_role;

GRANT ALL ON SEQUENCE public.service_categories_id_seq TO anon;

GRANT ALL ON SEQUENCE public.service_categories_id_seq TO authenticated;

GRANT ALL ON SEQUENCE public.service_categories_id_seq TO service_role;

GRANT ALL ON TABLE public.services TO anon;

GRANT ALL ON TABLE public.services TO authenticated;

GRANT ALL ON TABLE public.services TO service_role;

GRANT ALL ON SEQUENCE public.services_id_seq TO anon;

GRANT ALL ON SEQUENCE public.services_id_seq TO authenticated;

GRANT ALL ON SEQUENCE public.services_id_seq TO service_role;

GRANT ALL ON TABLE public.tasker_profiles TO anon;

GRANT ALL ON TABLE public.tasker_profiles TO authenticated;

GRANT ALL ON TABLE public.tasker_profiles TO service_role;

GRANT ALL ON TABLE public.tasker_promotion_profiles TO anon;

GRANT ALL ON TABLE public.tasker_promotion_profiles TO authenticated;

GRANT ALL ON TABLE public.tasker_promotion_profiles TO service_role;

GRANT ALL ON SEQUENCE public.tasker_promotion_profiles_id_seq TO anon;

GRANT ALL ON SEQUENCE public.tasker_promotion_profiles_id_seq TO authenticated;

GRANT ALL ON SEQUENCE public.tasker_promotion_profiles_id_seq TO service_role;

GRANT ALL ON TABLE public.tasker_services TO anon;

GRANT ALL ON TABLE public.tasker_services TO authenticated;

GRANT ALL ON TABLE public.tasker_services TO service_role;

GRANT ALL ON SEQUENCE public.tasker_services_id_seq TO anon;

GRANT ALL ON SEQUENCE public.tasker_services_id_seq TO authenticated;

GRANT ALL ON SEQUENCE public.tasker_services_id_seq TO service_role;

GRANT ALL ON TABLE public.transactions TO anon;

GRANT ALL ON TABLE public.transactions TO authenticated;

GRANT ALL ON TABLE public.transactions TO service_role;

GRANT ALL ON SEQUENCE public.transactions_id_seq TO anon;

GRANT ALL ON SEQUENCE public.transactions_id_seq TO authenticated;

GRANT ALL ON SEQUENCE public.transactions_id_seq TO service_role;

GRANT ALL ON TABLE public.user_stats TO anon;

GRANT ALL ON TABLE public.user_stats TO authenticated;

GRANT ALL ON TABLE public.user_stats TO service_role;

GRANT ALL ON TABLE public.users TO anon;

GRANT ALL ON TABLE public.users TO authenticated;

GRANT ALL ON TABLE public.users TO service_role;

GRANT ALL ON SEQUENCES TO postgres;

GRANT ALL ON SEQUENCES TO anon;

GRANT ALL ON SEQUENCES TO authenticated;

GRANT ALL ON SEQUENCES TO service_role;

GRANT ALL ON FUNCTIONS TO postgres;

GRANT ALL ON FUNCTIONS TO anon;

GRANT ALL ON FUNCTIONS TO authenticated;

GRANT ALL ON FUNCTIONS TO service_role;

GRANT ALL ON TABLES TO postgres;

GRANT ALL ON TABLES TO anon;

GRANT ALL ON TABLES TO authenticated;

GRANT ALL ON TABLES TO service_role;

GRANT ALL ON TABLE public.conversations TO anon, authenticated, service_role;

GRANT ALL ON TABLE public.service_bookings TO anon, authenticated, service_role;

GRANT ALL ON TABLE public.user_favorites TO anon, authenticated, service_role;

GRANT ALL ON TABLE public.tasker_availability TO anon, authenticated, service_role;

GRANT ALL ON TABLE public.tasker_blocked_dates TO anon, authenticated, service_role;

GRANT ALL ON TABLE public.job_application_counts TO anon, authenticated, service_role;

GRANT ALL ON TABLE public.user_monthly_usage TO anon, authenticated, service_role;

GRANT ALL ON TABLE public.wallet_transactions TO anon, authenticated, service_role;

GRANT ALL ON TABLE public.wallet_refund_requests TO anon, authenticated, service_role;

GRANT ALL ON TABLE public.faq TO anon, authenticated, service_role;

GRANT SELECT ON public.service_listing_view TO anon, authenticated, service_role;

-- ============================================
-- SCHEMA COMPLETE
-- ============================================