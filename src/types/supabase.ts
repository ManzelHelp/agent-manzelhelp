// AUTO-GENERATED: Supabase schema types (2024-12)
// This file reflects the current database schema. Edit with caution.

// User-defined types (enums) from Supabase
export type UserRole = "customer" | "tasker" | "both" | "admin";
export type VerificationStatus = "pending" | "verified" | "rejected";
export type PricingType = "fixed" | "hourly" | "per_item";
export type ExperienceLevel = "beginner" | "intermediate" | "expert";
export type JobStatus =
  | "pending"
  | "active"
  | "in_progress"
  | "completed"
  | "cancelled";
export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type TransactionType =
  | "job_payment"
  | "platform_fee"
  | "premium_application"
  | "refund"
  | "job_promotion"
  | "service_promotion";
export type NotificationType =
  | "job_created"
  | "application_received"
  | "application_accepted"
  | "job_completed"
  | "payment_received"
  | "message_received";

// USERS TABLE
export interface User {
  id: string; // uuid
  email: string;
  phone?: string;
  role?: UserRole;
  is_active?: boolean; // default: true
  email_verified?: boolean; // default: false
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  date_of_birth?: string; // date
  preferred_language?: string; // default: 'fr'
  created_at?: string; // timestamp
  updated_at?: string; // timestamp
  last_login?: string; // timestamp
}

export interface Address {
  id: number;
  user_id: string; // uuid
  label?: string; // default: 'home'
  street_address: string;
  city: string;
  region: string;
  postal_code?: string;
  country?: string; // default: 'MA'
  location?: object; // PostGIS geography
  is_default?: boolean; // default: false
  created_at?: string; // timestamp
  updated_at?: string; // timestamp
}

export interface ServiceCategory {
  id: number;
  name_en: string;
  name_fr: string;
  name_ar: string;
  description_en?: string;
  description_fr?: string;
  description_ar?: string;
  icon_url?: string;
  is_active?: boolean; // default: true
  sort_order?: number; // default: 0
  created_at?: string; // timestamp
}

export interface Service {
  id: number;
  category_id: number;
  name_en: string;
  name_fr: string;
  name_ar: string;
  description_en?: string;
  description_fr?: string;
  description_ar?: string;
  icon_url?: string;
  is_active?: boolean; // default: true
  sort_order?: number; // default: 0
  created_at?: string; // timestamp
}

export interface TaskerProfile {
  id: string; // uuid
  experience_level?: ExperienceLevel;
  bio?: string;
  identity_document_url?: string;
  verification_status?: VerificationStatus; // default: 'pending'
  service_radius_km?: number; // default: 50
  is_available?: boolean; // default: true
  updated_at?: string; // timestamp
  operation_hours?: OperationHours[] | null; // JSONB column for operation hours
  company_id?: string; // uuid
}

export interface TaskerService {
  id: number;
  tasker_id: string; // uuid
  service_id: number;
  pricing_type?: PricingType; // default: 'fixed'
  base_price: number;
  hourly_rate?: number;
  is_available?: boolean; // default: true
  is_promoted?: boolean; // default: false
  promotion_expires_at?: string; // timestamp
  promotion_boost_score?: number; // default: 0
  created_at?: string; // timestamp
  updated_at?: string; // timestamp
}

export interface Job {
  id: string; // uuid
  customer_id: string; // uuid
  service_id: number;
  address_id: number;
  title: string;
  description: string;
  preferred_date: string; // date
  preferred_time_start?: string; // time
  preferred_time_end?: string; // time
  is_flexible?: boolean; // default: false
  estimated_duration?: number;
  customer_budget?: number;
  final_price?: number;
  is_promoted?: boolean; // default: false
  promotion_expires_at?: string; // timestamp
  promotion_boost_score?: number; // default: 0
  status?: JobStatus; // default: 'pending'
  assigned_tasker_id?: string; // uuid
  started_at?: string; // timestamp
  completed_at?: string; // timestamp
  created_at?: string; // timestamp
  updated_at?: string; // timestamp
}

export interface JobApplication {
  id: number;
  job_id: string; // uuid
  tasker_id: string; // uuid
  proposed_price: number;
  estimated_duration?: number;
  message?: string;
  status?: ApplicationStatus; // default: 'pending'
  is_premium?: boolean; // default: false
  created_at?: string; // timestamp
  updated_at?: string; // timestamp
}

export interface Review {
  id: number;
  job_id: string; // uuid
  reviewer_id: string; // uuid
  reviewee_id: string; // uuid
  overall_rating: number;
  quality_rating?: number;
  communication_rating?: number;
  timeliness_rating?: number;
  comment?: string;
  created_at?: string; // timestamp
}

export interface Message {
  id: number;
  job_id: string; // uuid
  sender_id: string; // uuid
  receiver_id: string; // uuid
  content: string;
  attachment_url?: string;
  is_read?: boolean; // default: false
  created_at?: string; // timestamp
}

export interface Transaction {
  id: number;
  job_id: string; // uuid
  payer_id: string; // uuid
  payee_id: string; // uuid
  transaction_type: TransactionType;
  amount: number;
  platform_fee?: number; // default: 0
  payment_status?: PaymentStatus; // default: 'pending'
  payment_method?: string;
  external_payment_id?: string;
  processed_at?: string; // timestamp
  created_at?: string; // timestamp
  updated_at?: string; // timestamp
}

export interface Notification {
  id: number;
  user_id: string; // uuid
  type: NotificationType;
  title: string;
  message: string;
  related_job_id?: string; // uuid
  related_user_id?: string; // uuid
  is_read?: boolean; // default: false
  created_at?: string; // timestamp
}

export interface PromotionPackage {
  id: number;
  name_en: string;
  name_fr: string;
  name_ar: string;
  description_en?: string;
  description_fr?: string;
  description_ar?: string;
  price: number;
  duration_days: number;
  boost_score: number;
  priority_listing?: boolean; // default: false
  featured_badge?: boolean; // default: false
  social_media_promotion?: boolean; // default: false
  email_promotion?: boolean; // default: false
  is_active?: boolean; // default: true
  created_at?: string; // timestamp
}

export interface Promotion {
  id: number;
  package_id: number;
  user_id: string; // uuid
  job_id?: string; // uuid
  tasker_service_id?: number;
  amount_paid: number;
  boost_score: number;
  starts_at?: string; // timestamp
  expires_at: string; // timestamp
  is_active?: boolean; // default: true
  created_at?: string; // timestamp
  updated_at?: string; // timestamp
  company_id?: string; // uuid
  tasker_profile_id?: string; // uuid
}

export interface UserStats {
  id: string; // uuid
  tasker_rating?: number; // default: 0.00
  total_reviews?: number; // default: 0
  completed_jobs?: number; // default: 0
  total_earnings?: number; // default: 0.00
  response_time_hours?: number; // default: 0
  cancellation_rate?: number; // default: 0.00
  jobs_posted?: number; // default: 0
  total_spent?: number; // default: 0.00
  updated_at?: string; // timestamp
}

// New: Companies table
export interface Company {
  id: string; // uuid
  company_name: string;
  company_registration_number?: string;
  tax_id?: string;
  website?: string;
  description?: string;
  founded_year?: number;
  number_of_employees?: number;
  street_address?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  country?: string; // default: 'MA'
  location?: object; // PostGIS geography
  company_email?: string;
  company_phone?: string;
  logo_url?: string;
  cover_image_url?: string;
  is_active?: boolean; // default: true
  verification_status?: VerificationStatus; // default: 'pending'
  verification_document_url?: string;
  created_at?: string; // timestamp
  updated_at?: string; // timestamp
}

// New: Company promotion profiles
export interface CompanyPromotionProfile {
  id: number;
  company_id: string; // uuid
  is_promoted?: boolean; // default: false
  promotion_expires_at?: string; // timestamp
  promotion_boost_score?: number; // default: 0
  promotion_badge_type?: string;
  priority_in_search?: boolean; // default: false
  featured_on_homepage?: boolean; // default: false
  highlighted_badge?: boolean; // default: false
  created_at?: string; // timestamp
  updated_at?: string; // timestamp
}

// New: Company stats
export interface CompanyStats {
  id: string; // uuid
  company_rating?: number; // default: 0.00
  total_reviews?: number; // default: 0
  completed_jobs?: number; // default: 0
  total_earnings?: number; // default: 0.00
  active_taskers?: number; // default: 0
  average_response_time_hours?: number; // default: 0
  cancellation_rate?: number; // default: 0.00
  updated_at?: string; // timestamp
}

// Operation hours for tasker profiles (JSONB structure)
export interface OperationHours {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

// Legacy alias for backwards compatibility
export type AvailabilitySlot = OperationHours;

// Database type with all tables
export interface Database {
  users: User;
  addresses: Address;
  service_categories: ServiceCategory;
  services: Service;
  tasker_profiles: TaskerProfile;
  tasker_services: TaskerService;
  jobs: Job;
  job_applications: JobApplication;
  reviews: Review;
  messages: Message;
  transactions: Transaction;
  notifications: Notification;
  promotion_packages: PromotionPackage;
  promotions: Promotion;
  user_stats: UserStats;
  companies: Company;
  company_promotion_profiles: CompanyPromotionProfile;
  company_stats: CompanyStats;
}
