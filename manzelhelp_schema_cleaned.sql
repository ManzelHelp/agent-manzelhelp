--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.0

-- Started on 2025-07-22 00:23:05 CEST

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

--
-- TOC entry 14 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--
-- NOTE: Supabase already has the public schema, so we skip creating it
-- CREATE SCHEMA public;
-- ALTER SCHEMA public OWNER TO pg_database_owner;
-- COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 1860 (class 1247 OID 18344)
-- Name: application_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.application_status AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'withdrawn'
);


-- ALTER TYPE public.application_status OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 1854 (class 1247 OID 18324)
-- Name: experience_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.experience_level AS ENUM (
    'beginner',
    'intermediate',
    'expert'
);


-- ALTER TYPE public.experience_level OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 1857 (class 1247 OID 18332)
-- Name: job_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.job_status AS ENUM (
    'pending',
    'active',
    'in_progress',
    'completed',
    'cancelled'
);


-- ALTER TYPE public.job_status OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 1875 (class 1247 OID 18394)
-- Name: notification_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notification_type AS ENUM (
    'job_created',
    'application_received',
    'application_accepted',
    'job_completed',
    'payment_received',
    'message_received'
);


-- ALTER TYPE public.notification_type OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 1863 (class 1247 OID 18354)
-- Name: payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded'
);


-- ALTER TYPE public.payment_status OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 1866 (class 1247 OID 18364)
-- Name: pricing_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.pricing_type AS ENUM (
    'fixed',
    'hourly',
    'per_item'
);


-- ALTER TYPE public.pricing_type OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 1872 (class 1247 OID 18380)
-- Name: transaction_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.transaction_type AS ENUM (
    'job_payment',
    'platform_fee',
    'premium_application',
    'refund',
    'job_promotion',
    'service_promotion'
);


-- ALTER TYPE public.transaction_type OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 1851 (class 1247 OID 18314)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'customer',
    'tasker',
    'both',
    'admin'
);


-- ALTER TYPE public.user_role OWNER TO postgres; -- Supabase manages ownership

--
-- TOC entry 1869 (class 1247 OID 18372)
-- Name: verification_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.verification_status AS ENUM (
    'pending',
    'verified',
    'rejected'
);


-- ALTER TYPE public.verification_status OWNER TO postgres; -- Supabase manages ownership

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 278 (class 1259 OID 18458)
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

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

ALTER TABLE ONLY public.addresses ALTER COLUMN id SET DEFAULT nextval('public.addresses_id_seq'::regclass);


--
-- TOC entry 4544 (class 2604 OID 24380)
-- Name: company_promotion_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_promotion_profiles ALTER COLUMN id SET DEFAULT nextval('public.company_promotion_profiles_id_seq'::regclass);


--
-- TOC entry 4500 (class 2604 OID 18566)
-- Name: job_applications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications ALTER COLUMN id SET DEFAULT nextval('public.job_applications_id_seq'::regclass);


--
-- TOC entry 4507 (class 2604 OID 18614)
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- TOC entry 4515 (class 2604 OID 18666)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 4518 (class 2604 OID 18692)
-- Name: promotion_packages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_packages ALTER COLUMN id SET DEFAULT nextval('public.promotion_packages_id_seq'::regclass);


--
-- TOC entry 4525 (class 2604 OID 18707)
-- Name: promotions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions ALTER COLUMN id SET DEFAULT nextval('public.promotions_id_seq'::regclass);


--
-- TOC entry 4505 (class 2604 OID 18589)
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- TOC entry 4478 (class 2604 OID 18480)
-- Name: service_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_categories ALTER COLUMN id SET DEFAULT nextval('public.service_categories_id_seq'::regclass);


--
-- TOC entry 4482 (class 2604 OID 18492)
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- TOC entry 4552 (class 2604 OID 24399)
-- Name: tasker_promotion_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasker_promotion_profiles ALTER COLUMN id SET DEFAULT nextval('public.tasker_promotion_profiles_id_seq'::regclass);


--
-- TOC entry 4486 (class 2604 OID 18509)
-- Name: tasker_services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasker_services ALTER COLUMN id SET DEFAULT nextval('public.tasker_services_id_seq'::regclass);


--
-- TOC entry 4510 (class 2604 OID 18640)
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- TOC entry 4862 (class 0 OID 18458)
-- Dependencies: 278
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4884 (class 0 OID 24340)
-- Dependencies: 300
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4887 (class 0 OID 24377)
-- Dependencies: 303
-- Data for Name: company_promotion_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4885 (class 0 OID 24358)
-- Dependencies: 301
-- Data for Name: company_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4871 (class 0 OID 18563)
-- Dependencies: 287
-- Data for Name: job_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4869 (class 0 OID 18528)
-- Dependencies: 285
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4875 (class 0 OID 18611)
-- Dependencies: 291
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4879 (class 0 OID 18663)
-- Dependencies: 295
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4881 (class 0 OID 18689)
-- Dependencies: 297
-- Data for Name: promotion_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4883 (class 0 OID 18704)
-- Dependencies: 299
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4873 (class 0 OID 18586)
-- Dependencies: 289
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4864 (class 0 OID 18477)
-- Dependencies: 280
-- Data for Name: service_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4866 (class 0 OID 18489)
-- Dependencies: 282
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4452 (class 0 OID 17582)
-- Dependencies: 270
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--



--
-- TOC entry 4859 (class 0 OID 18422)
-- Dependencies: 275
-- Data for Name: tasker_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4889 (class 0 OID 24396)
-- Dependencies: 305
-- Data for Name: tasker_promotion_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4868 (class 0 OID 18506)
-- Dependencies: 284
-- Data for Name: tasker_services; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4877 (class 0 OID 18637)
-- Dependencies: 293
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4860 (class 0 OID 18438)
-- Dependencies: 276
-- Data for Name: user_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4858 (class 0 OID 18407)
-- Dependencies: 274
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4942 (class 0 OID 0)
-- Dependencies: 277
-- Name: addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.addresses_id_seq', 1, false);


--
-- TOC entry 4943 (class 0 OID 0)
-- Dependencies: 302
-- Name: company_promotion_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.company_promotion_profiles_id_seq', 1, false);


--
-- TOC entry 4944 (class 0 OID 0)
-- Dependencies: 286
-- Name: job_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_applications_id_seq', 1, false);


--
-- TOC entry 4945 (class 0 OID 0)
-- Dependencies: 290
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- TOC entry 4946 (class 0 OID 0)
-- Dependencies: 294
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- TOC entry 4947 (class 0 OID 0)
-- Dependencies: 296
-- Name: promotion_packages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promotion_packages_id_seq', 5, true);


--
-- TOC entry 4948 (class 0 OID 0)
-- Dependencies: 298
-- Name: promotions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promotions_id_seq', 1, false);


--
-- TOC entry 4949 (class 0 OID 0)
-- Dependencies: 288
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- TOC entry 4950 (class 0 OID 0)
-- Dependencies: 279
-- Name: service_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.service_categories_id_seq', 13, true);


--
-- TOC entry 4951 (class 0 OID 0)
-- Dependencies: 281
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_id_seq', 69, true);


--
-- TOC entry 4952 (class 0 OID 0)
-- Dependencies: 304
-- Name: tasker_promotion_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasker_promotion_profiles_id_seq', 1, false);


--
-- TOC entry 4953 (class 0 OID 0)
-- Dependencies: 283
-- Name: tasker_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasker_services_id_seq', 1, false);


--
-- TOC entry 4954 (class 0 OID 0)
-- Dependencies: 292
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 1, false);


--
-- TOC entry 4582 (class 2606 OID 18470)
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 4648 (class 2606 OID 24352)
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- TOC entry 4659 (class 2606 OID 24389)
-- Name: company_promotion_profiles company_promotion_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_promotion_profiles
    ADD CONSTRAINT company_promotion_profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4655 (class 2606 OID 24370)
-- Name: company_stats company_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_stats
    ADD CONSTRAINT company_stats_pkey PRIMARY KEY (id);


--
-- TOC entry 4614 (class 2606 OID 18574)
-- Name: job_applications job_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_pkey PRIMARY KEY (id);


--
-- TOC entry 4609 (class 2606 OID 18541)
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4624 (class 2606 OID 18620)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 4635 (class 2606 OID 18672)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4637 (class 2606 OID 18702)
-- Name: promotion_packages promotion_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_packages
    ADD CONSTRAINT promotion_packages_pkey PRIMARY KEY (id);


--
-- TOC entry 4646 (class 2606 OID 18714)
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- TOC entry 4619 (class 2606 OID 18594)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 4588 (class 2606 OID 18487)
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4592 (class 2606 OID 18499)
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- TOC entry 4576 (class 2606 OID 18432)
-- Name: tasker_profiles tasker_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasker_profiles
    ADD CONSTRAINT tasker_profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4669 (class 2606 OID 24408)
-- Name: tasker_promotion_profiles tasker_promotion_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasker_promotion_profiles
    ADD CONSTRAINT tasker_promotion_profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4599 (class 2606 OID 18517)
-- Name: tasker_services tasker_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasker_services
    ADD CONSTRAINT tasker_services_pkey PRIMARY KEY (id);


--
-- TOC entry 4631 (class 2606 OID 18646)
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4580 (class 2606 OID 18451)
-- Name: user_stats user_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_pkey PRIMARY KEY (id);


--
-- TOC entry 4569 (class 2606 OID 18421)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4571 (class 2606 OID 18419)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4583 (class 1259 OID 18745)
-- Name: idx_addresses_city; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_addresses_city ON public.addresses USING btree (city);


--
-- TOC entry 4584 (class 1259 OID 18744)
-- Name: idx_addresses_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_addresses_location ON public.addresses USING gist (location);


--
-- TOC entry 4585 (class 1259 OID 18743)
-- Name: idx_addresses_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_addresses_user_id ON public.addresses USING btree (user_id);


--
-- TOC entry 4649 (class 1259 OID 24427)
-- Name: idx_companies_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_active ON public.companies USING btree (is_active);


--
-- TOC entry 4650 (class 1259 OID 24426)
-- Name: idx_companies_city; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_city ON public.companies USING btree (city);


--
-- TOC entry 4651 (class 1259 OID 24429)
-- Name: idx_companies_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_location ON public.companies USING gist (location);


--
-- TOC entry 4652 (class 1259 OID 24425)
-- Name: idx_companies_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_name ON public.companies USING btree (company_name);


--
-- TOC entry 4653 (class 1259 OID 24428)
-- Name: idx_companies_verification; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_verification ON public.companies USING btree (verification_status);


--
-- TOC entry 4660 (class 1259 OID 24436)
-- Name: idx_company_promotion_profiles_badge_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_company_promotion_profiles_badge_type ON public.company_promotion_profiles USING btree (promotion_badge_type);


--
-- TOC entry 4661 (class 1259 OID 24435)
-- Name: idx_company_promotion_profiles_boost_score; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_company_promotion_profiles_boost_score ON public.company_promotion_profiles USING btree (promotion_boost_score DESC);


--
-- TOC entry 4662 (class 1259 OID 24433)
-- Name: idx_company_promotion_profiles_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_company_promotion_profiles_company_id ON public.company_promotion_profiles USING btree (company_id);


--
-- TOC entry 4663 (class 1259 OID 24434)
-- Name: idx_company_promotion_profiles_promoted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_company_promotion_profiles_promoted ON public.company_promotion_profiles USING btree (is_promoted, promotion_expires_at);


--
-- TOC entry 4656 (class 1259 OID 24431)
-- Name: idx_company_stats_completed_jobs; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_company_stats_completed_jobs ON public.company_stats USING btree (completed_jobs);


--
-- TOC entry 4657 (class 1259 OID 24430)
-- Name: idx_company_stats_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_company_stats_rating ON public.company_stats USING btree (company_rating);


--
-- TOC entry 4610 (class 1259 OID 18762)
-- Name: idx_job_applications_job_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_applications_job_id ON public.job_applications USING btree (job_id);


--
-- TOC entry 4611 (class 1259 OID 18764)
-- Name: idx_job_applications_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_applications_status ON public.job_applications USING btree (status);


--
-- TOC entry 4612 (class 1259 OID 18763)
-- Name: idx_job_applications_tasker_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_applications_tasker_id ON public.job_applications USING btree (tasker_id);


--
-- TOC entry 4600 (class 1259 OID 18757)
-- Name: idx_jobs_assigned_tasker; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_assigned_tasker ON public.jobs USING btree (assigned_tasker_id);


--
-- TOC entry 4601 (class 1259 OID 18761)
-- Name: idx_jobs_boost_score; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_boost_score ON public.jobs USING btree (promotion_boost_score DESC);


--
-- TOC entry 4602 (class 1259 OID 18759)
-- Name: idx_jobs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_created_at ON public.jobs USING btree (created_at);


--
-- TOC entry 4603 (class 1259 OID 18754)
-- Name: idx_jobs_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_customer_id ON public.jobs USING btree (customer_id);


--
-- TOC entry 4604 (class 1259 OID 18758)
-- Name: idx_jobs_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_date ON public.jobs USING btree (preferred_date);


--
-- TOC entry 4605 (class 1259 OID 18760)
-- Name: idx_jobs_promoted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_promoted ON public.jobs USING btree (is_promoted, promotion_expires_at);


--
-- TOC entry 4606 (class 1259 OID 18755)
-- Name: idx_jobs_service_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_service_id ON public.jobs USING btree (service_id);


--
-- TOC entry 4607 (class 1259 OID 18756)
-- Name: idx_jobs_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_status ON public.jobs USING btree (status);


--
-- TOC entry 4620 (class 1259 OID 18770)
-- Name: idx_messages_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at);


--
-- TOC entry 4621 (class 1259 OID 18768)
-- Name: idx_messages_job_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_job_id ON public.messages USING btree (job_id);


--
-- TOC entry 4622 (class 1259 OID 18769)
-- Name: idx_messages_receiver_unread; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_receiver_unread ON public.messages USING btree (receiver_id, is_read);


--
-- TOC entry 4632 (class 1259 OID 18777)
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at);


--
-- TOC entry 4633 (class 1259 OID 18776)
-- Name: idx_notifications_user_unread; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, is_read);


--
-- TOC entry 4638 (class 1259 OID 18781)
-- Name: idx_promotions_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promotions_active ON public.promotions USING btree (is_active, expires_at);


--
-- TOC entry 4639 (class 1259 OID 24441)
-- Name: idx_promotions_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promotions_company_id ON public.promotions USING btree (company_id);


--
-- TOC entry 4640 (class 1259 OID 18782)
-- Name: idx_promotions_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promotions_expires_at ON public.promotions USING btree (expires_at);


--
-- TOC entry 4641 (class 1259 OID 18779)
-- Name: idx_promotions_job_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promotions_job_id ON public.promotions USING btree (job_id);


--
-- TOC entry 4642 (class 1259 OID 24442)
-- Name: idx_promotions_tasker_profile_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promotions_tasker_profile_id ON public.promotions USING btree (tasker_profile_id);


--
-- TOC entry 4643 (class 1259 OID 18780)
-- Name: idx_promotions_tasker_service_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promotions_tasker_service_id ON public.promotions USING btree (tasker_service_id);


--
-- TOC entry 4644 (class 1259 OID 18778)
-- Name: idx_promotions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promotions_user_id ON public.promotions USING btree (user_id);


--
-- TOC entry 4615 (class 1259 OID 18765)
-- Name: idx_reviews_job_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_job_id ON public.reviews USING btree (job_id);


--
-- TOC entry 4616 (class 1259 OID 18767)
-- Name: idx_reviews_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_rating ON public.reviews USING btree (overall_rating);


--
-- TOC entry 4617 (class 1259 OID 18766)
-- Name: idx_reviews_reviewee_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_reviewee_id ON public.reviews USING btree (reviewee_id);


--
-- TOC entry 4586 (class 1259 OID 18748)
-- Name: idx_service_categories_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_service_categories_active ON public.service_categories USING btree (is_active);


--
-- TOC entry 4589 (class 1259 OID 18747)
-- Name: idx_services_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_active ON public.services USING btree (is_active);


--
-- TOC entry 4590 (class 1259 OID 18746)
-- Name: idx_services_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_category_id ON public.services USING btree (category_id);


--
-- TOC entry 4572 (class 1259 OID 18740)
-- Name: idx_tasker_profiles_available; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasker_profiles_available ON public.tasker_profiles USING btree (is_available);


--
-- TOC entry 4573 (class 1259 OID 24432)
-- Name: idx_tasker_profiles_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasker_profiles_company_id ON public.tasker_profiles USING btree (company_id);


--
-- TOC entry 4574 (class 1259 OID 18739)
-- Name: idx_tasker_profiles_verification; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasker_profiles_verification ON public.tasker_profiles USING btree (verification_status);


--
-- TOC entry 4664 (class 1259 OID 24440)
-- Name: idx_tasker_promotion_profiles_badge_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasker_promotion_profiles_badge_type ON public.tasker_promotion_profiles USING btree (promotion_badge_type);


--
-- TOC entry 4665 (class 1259 OID 24439)
-- Name: idx_tasker_promotion_profiles_boost_score; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasker_promotion_profiles_boost_score ON public.tasker_promotion_profiles USING btree (promotion_boost_score DESC);


--
-- TOC entry 4666 (class 1259 OID 24438)
-- Name: idx_tasker_promotion_profiles_promoted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasker_promotion_profiles_promoted ON public.tasker_promotion_profiles USING btree (is_promoted, promotion_expires_at);


--
-- TOC entry 4667 (class 1259 OID 24437)
-- Name: idx_tasker_promotion_profiles_tasker_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasker_promotion_profiles_tasker_id ON public.tasker_promotion_profiles USING btree (tasker_id);


--
-- TOC entry 4593 (class 1259 OID 18751)
-- Name: idx_tasker_services_available; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasker_services_available ON public.tasker_services USING btree (is_available);


--
-- TOC entry 4594 (class 1259 OID 18753)
-- Name: idx_tasker_services_boost_score; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasker_services_boost_score ON public.tasker_services USING btree (promotion_boost_score DESC);


--
-- TOC entry 4595 (class 1259 OID 18752)
-- Name: idx_tasker_services_promoted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasker_services_promoted ON public.tasker_services USING btree (is_promoted, promotion_expires_at);


--
-- TOC entry 4596 (class 1259 OID 18750)
-- Name: idx_tasker_services_service_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasker_services_service_id ON public.tasker_services USING btree (service_id);


--
-- TOC entry 4597 (class 1259 OID 18749)
-- Name: idx_tasker_services_tasker_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasker_services_tasker_id ON public.tasker_services USING btree (tasker_id);


--
-- TOC entry 4625 (class 1259 OID 18775)
-- Name: idx_transactions_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_created_at ON public.transactions USING btree (created_at);


--
-- TOC entry 4626 (class 1259 OID 18771)
-- Name: idx_transactions_job_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_job_id ON public.transactions USING btree (job_id);


--
-- TOC entry 4627 (class 1259 OID 18773)
-- Name: idx_transactions_payee_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_payee_id ON public.transactions USING btree (payee_id);


--
-- TOC entry 4628 (class 1259 OID 18772)
-- Name: idx_transactions_payer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_payer_id ON public.transactions USING btree (payer_id);


--
-- TOC entry 4629 (class 1259 OID 18774)
-- Name: idx_transactions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_status ON public.transactions USING btree (payment_status);


--
-- TOC entry 4577 (class 1259 OID 18742)
-- Name: idx_user_stats_completed_jobs; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_stats_completed_jobs ON public.user_stats USING btree (completed_jobs);


--
-- TOC entry 4578 (class 1259 OID 18741)
-- Name: idx_user_stats_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_stats_rating ON public.user_stats USING btree (tasker_rating);


--
-- TOC entry 4564 (class 1259 OID 18738)
-- Name: idx_users_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_active ON public.users USING btree (is_active);


--
-- TOC entry 4565 (class 1259 OID 18735)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4566 (class 1259 OID 18736)
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_phone ON public.users USING btree (phone);


--
-- TOC entry 4567 (class 1259 OID 18737)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 4673 (class 2606 OID 18471)
-- Name: addresses addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4702 (class 2606 OID 24390)
-- Name: company_promotion_profiles company_promotion_profiles_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_promotion_profiles
    ADD CONSTRAINT company_promotion_profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- TOC entry 4701 (class 2606 OID 24371)
-- Name: company_stats company_stats_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_stats
    ADD CONSTRAINT company_stats_id_fkey FOREIGN KEY (id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- TOC entry 4681 (class 2606 OID 18575)
-- Name: job_applications job_applications_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 4682 (class 2606 OID 18580)
-- Name: job_applications job_applications_tasker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_tasker_id_fkey FOREIGN KEY (tasker_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4677 (class 2606 OID 18552)
-- Name: jobs jobs_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id) ON DELETE CASCADE;


--
-- TOC entry 4678 (class 2606 OID 18557)
-- Name: jobs jobs_assigned_tasker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_assigned_tasker_id_fkey FOREIGN KEY (assigned_tasker_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4679 (class 2606 OID 18542)
-- Name: jobs jobs_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4680 (class 2606 OID 18547)
-- Name: jobs jobs_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- TOC entry 4686 (class 2606 OID 18621)
-- Name: messages messages_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 4687 (class 2606 OID 18631)
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4688 (class 2606 OID 18626)
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4692 (class 2606 OID 18678)
-- Name: notifications notifications_related_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_related_job_id_fkey FOREIGN KEY (related_job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 4693 (class 2606 OID 18683)
-- Name: notifications notifications_related_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_related_user_id_fkey FOREIGN KEY (related_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4694 (class 2606 OID 18673)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4695 (class 2606 OID 24414)
-- Name: promotions promotions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- TOC entry 4696 (class 2606 OID 18725)
-- Name: promotions promotions_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 4697 (class 2606 OID 18715)
-- Name: promotions promotions_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.promotion_packages(id) ON DELETE CASCADE;


--
-- TOC entry 4698 (class 2606 OID 24419)
-- Name: promotions promotions_tasker_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_tasker_profile_id_fkey FOREIGN KEY (tasker_profile_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4699 (class 2606 OID 18730)
-- Name: promotions promotions_tasker_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_tasker_service_id_fkey FOREIGN KEY (tasker_service_id) REFERENCES public.tasker_services(id) ON DELETE CASCADE;


--
-- TOC entry 4700 (class 2606 OID 18720)
-- Name: promotions promotions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4683 (class 2606 OID 18595)
-- Name: reviews reviews_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 4684 (class 2606 OID 18605)
-- Name: reviews reviews_reviewee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4685 (class 2606 OID 18600)
-- Name: reviews reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4674 (class 2606 OID 18500)
-- Name: services services_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id) ON DELETE CASCADE;


--
-- TOC entry 4670 (class 2606 OID 24353)
-- Name: tasker_profiles tasker_profiles_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasker_profiles
    ADD CONSTRAINT tasker_profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- TOC entry 4671 (class 2606 OID 18433)
-- Name: tasker_profiles tasker_profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasker_profiles
    ADD CONSTRAINT tasker_profiles_id_fkey FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4703 (class 2606 OID 24409)
-- Name: tasker_promotion_profiles tasker_promotion_profiles_tasker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasker_promotion_profiles
    ADD CONSTRAINT tasker_promotion_profiles_tasker_id_fkey FOREIGN KEY (tasker_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4675 (class 2606 OID 18523)
-- Name: tasker_services tasker_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasker_services
    ADD CONSTRAINT tasker_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- TOC entry 4676 (class 2606 OID 18518)
-- Name: tasker_services tasker_services_tasker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasker_services
    ADD CONSTRAINT tasker_services_tasker_id_fkey FOREIGN KEY (tasker_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4689 (class 2606 OID 18647)
-- Name: transactions transactions_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 4690 (class 2606 OID 18657)
-- Name: transactions transactions_payee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_payee_id_fkey FOREIGN KEY (payee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4691 (class 2606 OID 18652)
-- Name: transactions transactions_payer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_payer_id_fkey FOREIGN KEY (payer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4672 (class 2606 OID 18452)
-- Name: user_stats user_stats_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_id_fkey FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4896 (class 0 OID 0)
-- Dependencies: 14
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- TOC entry 4897 (class 0 OID 0)
-- Dependencies: 278
-- Name: TABLE addresses; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.addresses TO anon;
GRANT ALL ON TABLE public.addresses TO authenticated;
GRANT ALL ON TABLE public.addresses TO service_role;


--
-- TOC entry 4899 (class 0 OID 0)
-- Dependencies: 277
-- Name: SEQUENCE addresses_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.addresses_id_seq TO anon;
GRANT ALL ON SEQUENCE public.addresses_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.addresses_id_seq TO service_role;


--
-- TOC entry 4900 (class 0 OID 0)
-- Dependencies: 300
-- Name: TABLE companies; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.companies TO anon;
GRANT ALL ON TABLE public.companies TO authenticated;
GRANT ALL ON TABLE public.companies TO service_role;


--
-- TOC entry 4901 (class 0 OID 0)
-- Dependencies: 303
-- Name: TABLE company_promotion_profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.company_promotion_profiles TO anon;
GRANT ALL ON TABLE public.company_promotion_profiles TO authenticated;
GRANT ALL ON TABLE public.company_promotion_profiles TO service_role;


--
-- TOC entry 4903 (class 0 OID 0)
-- Dependencies: 302
-- Name: SEQUENCE company_promotion_profiles_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.company_promotion_profiles_id_seq TO anon;
GRANT ALL ON SEQUENCE public.company_promotion_profiles_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.company_promotion_profiles_id_seq TO service_role;


--
-- TOC entry 4904 (class 0 OID 0)
-- Dependencies: 301
-- Name: TABLE company_stats; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.company_stats TO anon;
GRANT ALL ON TABLE public.company_stats TO authenticated;
GRANT ALL ON TABLE public.company_stats TO service_role;


--
-- TOC entry 4905 (class 0 OID 0)
-- Dependencies: 287
-- Name: TABLE job_applications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.job_applications TO anon;
GRANT ALL ON TABLE public.job_applications TO authenticated;
GRANT ALL ON TABLE public.job_applications TO service_role;


--
-- TOC entry 4907 (class 0 OID 0)
-- Dependencies: 286
-- Name: SEQUENCE job_applications_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.job_applications_id_seq TO anon;
GRANT ALL ON SEQUENCE public.job_applications_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.job_applications_id_seq TO service_role;


--
-- TOC entry 4908 (class 0 OID 0)
-- Dependencies: 285
-- Name: TABLE jobs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.jobs TO anon;
GRANT ALL ON TABLE public.jobs TO authenticated;
GRANT ALL ON TABLE public.jobs TO service_role;


--
-- TOC entry 4909 (class 0 OID 0)
-- Dependencies: 291
-- Name: TABLE messages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.messages TO anon;
GRANT ALL ON TABLE public.messages TO authenticated;
GRANT ALL ON TABLE public.messages TO service_role;


--
-- TOC entry 4911 (class 0 OID 0)
-- Dependencies: 290
-- Name: SEQUENCE messages_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.messages_id_seq TO anon;
GRANT ALL ON SEQUENCE public.messages_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.messages_id_seq TO service_role;


--
-- TOC entry 4912 (class 0 OID 0)
-- Dependencies: 295
-- Name: TABLE notifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.notifications TO anon;
GRANT ALL ON TABLE public.notifications TO authenticated;
GRANT ALL ON TABLE public.notifications TO service_role;


--
-- TOC entry 4914 (class 0 OID 0)
-- Dependencies: 294
-- Name: SEQUENCE notifications_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.notifications_id_seq TO anon;
GRANT ALL ON SEQUENCE public.notifications_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.notifications_id_seq TO service_role;


--
-- TOC entry 4915 (class 0 OID 0)
-- Dependencies: 297
-- Name: TABLE promotion_packages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.promotion_packages TO anon;
GRANT ALL ON TABLE public.promotion_packages TO authenticated;
GRANT ALL ON TABLE public.promotion_packages TO service_role;


--
-- TOC entry 4917 (class 0 OID 0)
-- Dependencies: 296
-- Name: SEQUENCE promotion_packages_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.promotion_packages_id_seq TO anon;
GRANT ALL ON SEQUENCE public.promotion_packages_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.promotion_packages_id_seq TO service_role;


--
-- TOC entry 4918 (class 0 OID 0)
-- Dependencies: 299
-- Name: TABLE promotions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.promotions TO anon;
GRANT ALL ON TABLE public.promotions TO authenticated;
GRANT ALL ON TABLE public.promotions TO service_role;


--
-- TOC entry 4920 (class 0 OID 0)
-- Dependencies: 298
-- Name: SEQUENCE promotions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.promotions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.promotions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.promotions_id_seq TO service_role;


--
-- TOC entry 4921 (class 0 OID 0)
-- Dependencies: 289
-- Name: TABLE reviews; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.reviews TO anon;
GRANT ALL ON TABLE public.reviews TO authenticated;
GRANT ALL ON TABLE public.reviews TO service_role;


--
-- TOC entry 4923 (class 0 OID 0)
-- Dependencies: 288
-- Name: SEQUENCE reviews_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.reviews_id_seq TO anon;
GRANT ALL ON SEQUENCE public.reviews_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.reviews_id_seq TO service_role;


--
-- TOC entry 4924 (class 0 OID 0)
-- Dependencies: 280
-- Name: TABLE service_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.service_categories TO anon;
GRANT ALL ON TABLE public.service_categories TO authenticated;
GRANT ALL ON TABLE public.service_categories TO service_role;


--
-- TOC entry 4926 (class 0 OID 0)
-- Dependencies: 279
-- Name: SEQUENCE service_categories_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.service_categories_id_seq TO anon;
GRANT ALL ON SEQUENCE public.service_categories_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.service_categories_id_seq TO service_role;


--
-- TOC entry 4927 (class 0 OID 0)
-- Dependencies: 282
-- Name: TABLE services; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.services TO anon;
GRANT ALL ON TABLE public.services TO authenticated;
GRANT ALL ON TABLE public.services TO service_role;


--
-- TOC entry 4929 (class 0 OID 0)
-- Dependencies: 281
-- Name: SEQUENCE services_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.services_id_seq TO anon;
GRANT ALL ON SEQUENCE public.services_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.services_id_seq TO service_role;


--
-- TOC entry 4930 (class 0 OID 0)
-- Dependencies: 275
-- Name: TABLE tasker_profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tasker_profiles TO anon;
GRANT ALL ON TABLE public.tasker_profiles TO authenticated;
GRANT ALL ON TABLE public.tasker_profiles TO service_role;


--
-- TOC entry 4931 (class 0 OID 0)
-- Dependencies: 305
-- Name: TABLE tasker_promotion_profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tasker_promotion_profiles TO anon;
GRANT ALL ON TABLE public.tasker_promotion_profiles TO authenticated;
GRANT ALL ON TABLE public.tasker_promotion_profiles TO service_role;


--
-- TOC entry 4933 (class 0 OID 0)
-- Dependencies: 304
-- Name: SEQUENCE tasker_promotion_profiles_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.tasker_promotion_profiles_id_seq TO anon;
GRANT ALL ON SEQUENCE public.tasker_promotion_profiles_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.tasker_promotion_profiles_id_seq TO service_role;


--
-- TOC entry 4934 (class 0 OID 0)
-- Dependencies: 284
-- Name: TABLE tasker_services; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tasker_services TO anon;
GRANT ALL ON TABLE public.tasker_services TO authenticated;
GRANT ALL ON TABLE public.tasker_services TO service_role;


--
-- TOC entry 4936 (class 0 OID 0)
-- Dependencies: 283
-- Name: SEQUENCE tasker_services_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.tasker_services_id_seq TO anon;
GRANT ALL ON SEQUENCE public.tasker_services_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.tasker_services_id_seq TO service_role;


--
-- TOC entry 4937 (class 0 OID 0)
-- Dependencies: 293
-- Name: TABLE transactions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.transactions TO anon;
GRANT ALL ON TABLE public.transactions TO authenticated;
GRANT ALL ON TABLE public.transactions TO service_role;


--
-- TOC entry 4939 (class 0 OID 0)
-- Dependencies: 292
-- Name: SEQUENCE transactions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.transactions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.transactions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.transactions_id_seq TO service_role;


--
-- TOC entry 4940 (class 0 OID 0)
-- Dependencies: 276
-- Name: TABLE user_stats; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_stats TO anon;
GRANT ALL ON TABLE public.user_stats TO authenticated;
GRANT ALL ON TABLE public.user_stats TO service_role;


--
-- TOC entry 4941 (class 0 OID 0)
-- Dependencies: 274
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- TOC entry 3231 (class 826 OID 16488)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres; -- Supabase manages default privileges
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon; -- Supabase manages default privileges
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated; -- Supabase manages default privileges
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role; -- Supabase manages default privileges


--
-- TOC entry 3232 (class 826 OID 16489)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres; -- Supabase manages default privileges
-- ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon; -- Supabase manages default privileges
-- ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated; -- Supabase manages default privileges
-- ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role; -- Supabase manages default privileges


--
-- TOC entry 3230 (class 826 OID 16487)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres; -- Supabase manages default privileges
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon; -- Supabase manages default privileges
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated; -- Supabase manages default privileges
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role; -- Supabase manages default privileges


--
-- TOC entry 3234 (class 826 OID 16491)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres; -- Supabase manages default privileges
-- ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon; -- Supabase manages default privileges
-- ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated; -- Supabase manages default privileges
-- ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role; -- Supabase manages default privileges


--
-- TOC entry 3229 (class 826 OID 16486)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres; -- Supabase manages default privileges
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon; -- Supabase manages default privileges
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated; -- Supabase manages default privileges
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role; -- Supabase manages default privileges


--
-- TOC entry 3233 (class 826 OID 16490)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres; -- Supabase manages default privileges
-- ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon; -- Supabase manages default privileges
-- ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated; -- Supabase manages default privileges
-- ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role; -- Supabase manages default privileges


-- Completed on 2025-07-22 00:23:09 CEST

--
-- PostgreSQL database dump complete
--