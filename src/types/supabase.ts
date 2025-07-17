// AUTO-GENERATED: Supabase schema types (2024-06)
// This file reflects the current database schema. Edit with caution.

// User-defined types (enums) from Supabase
export type UserRole = "customer" | "tasker" | "both" | "admin";
export type VerificationStatus = "pending" | "verified" | "rejected";
export type PricingType = "fixed" | "hourly" | "per_item";
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

// USERS TABLE (includes auth fields)
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
  instance_id?: string; // uuid
  aud?: string;
  encrypted_password?: string;
  email_confirmed_at?: string; // timestamp
  invited_at?: string; // timestamp
  confirmation_token?: string;
  confirmation_sent_at?: string; // timestamp
  recovery_token?: string;
  recovery_sent_at?: string; // timestamp
  email_change_token_new?: string;
  email_change?: string;
  email_change_sent_at?: string; // timestamp
  last_sign_in_at?: string; // timestamp
  raw_app_meta_data?: Record<string, unknown>;
  raw_user_meta_data?: Record<string, unknown>;
  is_super_admin?: boolean;
  phone_confirmed_at?: string; // timestamp
  phone_change?: string;
  phone_change_token?: string;
  phone_change_sent_at?: string; // timestamp
  confirmed_at?: string; // timestamp
  email_change_token_current?: string;
  email_change_confirm_status?: number; // smallint
  banned_until?: string; // timestamp
  reauthentication_token?: string;
  reauthentication_sent_at?: string; // timestamp
  is_sso_user: boolean; // default: false
  deleted_at?: string; // timestamp
  is_anonymous: boolean; // default: false
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
  location?: object; // PostGIS geometry
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
  experience_level?: string; // user-defined
  bio?: string;
  identity_document_url?: string;
  verification_status?: VerificationStatus; // default: 'pending'
  service_radius_km?: number; // default: 50
  is_available?: boolean; // default: true
  updated_at?: string; // timestamp
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
  topic: string;
  extension: string;
  payload?: unknown;
  event?: string;
  private?: boolean; // default: false
  updated_at: string; // timestamp (no tz)
  inserted_at: string; // timestamp (no tz)
  uuid?: string; // gen_random_uuid()
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
}
