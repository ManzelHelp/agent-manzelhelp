// AUTO-GENERATED: Supabase schema types (2024-12)
// This file is generated from the live Supabase schema. Do not edit manually.

// ENUMS FROM SUPABASE
export type UserRole = "customer" | "tasker" | "support" | "admin";
export type VerificationStatus =
  | "unverified"
  | "under_review"
  | "verified"
  | "rejected"
  | "suspended";
export type PricingType = "fixed" | "hourly" | "per_item";
export type ExperienceLevel = "beginner" | "intermediate" | "expert";
export type JobStatus =
  | "under_review"
  | "active"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed"
  | "draft";
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
  | "service_promotion"
  | "booking_payment"
  | "service_payment"
  | "cash_payment";
export type NotificationType =
  | "job_created"
  | "application_received"
  | "application_accepted"
  | "job_started"
  | "job_completed"
  | "payment_received"
  | "message_received"
  | "booking_created"
  | "booking_accepted"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_completed"
  | "booking_reminder"
  | "service_created"
  | "service_updated"
  | "payment_confirmed"
  | "payment_pending";
export type BookingStatus =
  | "pending"
  | "accepted"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed"
  | "refunded";
export type BookingType = "instant" | "scheduled" | "recurring";
export type BookingPaymentMethod = "cash" | "online" | "wallet" | "pending";
export type ServiceVerificationStatus =
  | "unverified"
  | "under_review"
  | "verified"
  | "rejected"
  | "suspended";
export type ServiceAvailabilityStatus =
  | "available"
  | "unavailable"
  | "busy"
  | "on_break";
export type ServiceStatus =
  | "draft"
  | "under_review"
  | "active"
  | "paused"
  | "suspended"
  | "deleted_pending"
  | "deleted";
export type RatingCategory =
  | "quality"
  | "communication"
  | "timeliness"
  | "professionalism"
  | "value";

export interface User {
  id: string;
  email: string;
  phone?: string;
  role?: UserRole;
  is_active?: boolean;
  email_verified?: boolean;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  date_of_birth?: string;
  preferred_language?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  verification_status?: VerificationStatus;
  wallet_balance?: number;
}

export interface Address {
  id: string;
  user_id: string;
  label?: string;
  street_address: string;
  city: string;
  region: string;
  postal_code?: string;
  country?: string;
  location?: object | null;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
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
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
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
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface TaskerProfile {
  id: string;
  experience_level?: ExperienceLevel;
  bio?: string;
  identity_document_url?: string;
  verification_status?: string;
  service_radius_km?: number;
  is_available?: boolean;
  updated_at?: string;
  operation_hours?: OperationHoursObject | null;
  company_id?: string;
}

export interface TaskerService {
  id: string;
  tasker_id: string;
  service_id: number;
  pricing_type?: PricingType;
  price?: number;
  is_promoted?: boolean;
  promotion_expires_at?: string;
  promotion_boost_score?: number;
  created_at?: string;
  updated_at?: string;
  title: string;
  description?: string;
  portfolio_images?: object | null;
  minimum_duration?: number;
  extra_fees?: number;
  has_active_booking?: boolean;
  service_status?: ServiceStatus;
  service_area?: object | null;
  verification_status?: ServiceVerificationStatus;
}

export interface Job {
  id: string;
  customer_id: string;
  service_id: number;
  address_id: string;
  title: string;
  description: string;
  preferred_date: string;
  preferred_time_start?: string;
  preferred_time_end?: string;
  is_flexible?: boolean;
  estimated_duration?: number;
  customer_budget?: number;
  final_price?: number;
  is_promoted?: boolean;
  promotion_expires_at?: string;
  promotion_boost_score?: number;
  status?: JobStatus;
  assigned_tasker_id?: string;
  started_at?: string;
  completed_at?: string;
  customer_confirmed_at?: string;
  created_at?: string;
  updated_at?: string;
  images?: object | null;
  requirements?: string;
  currency?: string;
  max_applications?: number;
  premium_applications_purchased?: number;
  current_applications?: number;
  verification_status?: VerificationStatus;
}

export interface JobApplication {
  id: string;
  job_id: string;
  tasker_id: string;
  proposed_price: number;
  estimated_duration?: number;
  message?: string;
  status?: ApplicationStatus;
  is_premium?: boolean;
  created_at?: string;
  updated_at?: string;
  availability?: string;
  experience_level?: string;
  experience_description?: string;
  availability_details?: string;
  is_flexible_schedule?: boolean;
}

export interface Review {
  id: string;
  job_id?: string;
  reviewer_id: string;
  reviewee_id: string;
  overall_rating: number;
  quality_rating?: number;
  communication_rating?: number;
  timeliness_rating?: number;
  comment?: string;
  created_at?: string;
  reply_comment?: string;
  replied_at?: string;
  booking_id?: string;
}

export interface Conversation {
  id: string;
  job_id?: string;
  service_id?: string;
  booking_id?: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at?: string;
  created_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachment_url?: string;
  is_read?: boolean;
  created_at?: string;
}

export interface Transaction {
  id: string;
  job_id: string;
  payer_id: string;
  payee_id: string;
  transaction_type: TransactionType;
  amount: number;
  platform_fee?: number;
  payment_status?: PaymentStatus;
  payment_method?: string;
  external_payment_id?: string;
  processed_at?: string;
  created_at?: string;
  updated_at?: string;
  cash_payment_confirmed?: boolean;
  cash_payment_confirmed_by?: string;
  cash_payment_confirmed_at?: string;
  booking_id?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_job_id?: string;
  related_user_id?: string;
  is_read?: boolean;
  created_at?: string;
  related_booking_id?: string;
  related_service_id?: string;
  action_url?: string;
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
  priority_listing?: boolean;
  featured_badge?: boolean;
  social_media_promotion?: boolean;
  email_promotion?: boolean;
  is_active?: boolean;
  created_at?: string;
}

export interface Promotion {
  id: number;
  package_id: number;
  user_id: string;
  job_id?: string;
  tasker_service_id?: number;
  amount_paid: number;
  boost_score: number;
  starts_at?: string;
  expires_at: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  tasker_profile_id?: string;
}

export interface UserStats {
  id: string;
  tasker_rating?: number;
  total_reviews?: number;
  completed_jobs?: number;
  total_earnings?: number;
  response_time_hours?: number;
  cancellation_rate?: number;
  jobs_posted?: number;
  total_spent?: number;
  updated_at?: string;
}

export interface Company {
  id: string;
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
  country?: string;
  location?: object | null;
  company_email?: string;
  company_phone?: string;
  logo_url?: string;
  cover_image_url?: string;
  is_active?: boolean;
  verification_status?: string;
  verification_document_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyPromotionProfile {
  id: number;
  company_id: string;
  is_promoted?: boolean;
  promotion_expires_at?: string;
  promotion_boost_score?: number;
  promotion_badge_type?: string;
  priority_in_search?: boolean;
  featured_on_homepage?: boolean;
  highlighted_badge?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyStats {
  id: string;
  company_rating?: number;
  total_reviews?: number;
  completed_jobs?: number;
  total_earnings?: number;
  active_taskers?: number;
  average_response_time_hours?: number;
  cancellation_rate?: number;
  updated_at?: string;
}

export interface TaskerPromotionProfile {
  id: number;
  tasker_id: string;
  is_promoted?: boolean;
  promotion_expires_at?: string;
  promotion_boost_score?: number;
  promotion_badge_type?: string;
  priority_in_search?: boolean;
  featured_on_homepage?: boolean;
  highlighted_badge?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserFavorite {
  id: number;
  user_id: string;
  tasker_id: string;
  created_at?: string;
}

export interface TaskerAvailability {
  id: string;
  tasker_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active?: boolean;
  created_at?: string;
}

export interface TaskerBlockedDate {
  id: string;
  tasker_id: string;
  blocked_date: string;
  reason?: string;
  is_full_day?: boolean;
  start_time?: string;
  end_time?: string;
  created_at?: string;
}

export interface ServiceBooking {
  id: string;
  customer_id: string;
  tasker_id: string;
  tasker_service_id: string;
  booking_type: BookingType;
  scheduled_date?: string;
  scheduled_time_start?: string;
  scheduled_time_end?: string;
  estimated_duration?: number;
  address_id: string;
  service_address?: string;
  agreed_price: number;
  currency?: string;
  status: BookingStatus;
  accepted_at?: string;
  confirmed_at?: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  customer_requirements?: string;
  tasker_notes?: string;
  created_at?: string;
  updated_at?: string;
  payment_method?: BookingPaymentMethod;
  cancellation_fee?: number;
}

export interface JobApplicationCount {
  id: string;
  job_id: string;
  application_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserMonthlyUsage {
  id: string;
  user_id: string;
  month_year: string;
  applications_count?: number;
  job_postings_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  related_job_id?: string;
  notes?: string;
  created_at?: string;
}

export interface FAQ {
  id: string;
  role: string;
  audience: string;
  category: string;
  question_en: string;
  answer_en: string;
  question_fr?: string;
  answer_fr?: string;
  question_ar?: string;
  answer_ar?: string;
  created_at?: string;
}

// VIEWS (for reference - these are read-only)
export interface ServiceBookingSummary {
  booking_id?: string;
  status?: BookingStatus;
  agreed_price?: number;
  scheduled_date?: string;
  scheduled_time_start?: string;
  scheduled_time_end?: string;
  payment_method?: BookingPaymentMethod;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_avatar?: string;
  tasker_first_name?: string;
  tasker_last_name?: string;
  tasker_avatar?: string;
  service_name?: string;
  category_name?: string;
  payment_status?: PaymentStatus;
  transaction_method?: string;
  customer_rating?: number;
  customer_quality_rating?: number;
  customer_communication_rating?: number;
  customer_timeliness_rating?: number;
  customer_review?: string;
  customer_review_date?: string;
  tasker_rating?: number;
  tasker_quality_rating?: number;
  tasker_communication_rating?: number;
  tasker_timeliness_rating?: number;
  tasker_review?: string;
  tasker_review_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceListingView {
  tasker_service_id?: string;
  service_id?: number;
  tasker_id?: string;
  title?: string;
  description?: string;
  price?: number;
  pricing_type?: PricingType;
  service_status?: ServiceStatus;
  verification_status?: ServiceVerificationStatus;
  has_active_booking?: boolean;
  created_at?: string;
  updated_at?: string;
  service_name_en?: string;
  service_name_fr?: string;
  service_name_ar?: string;
  service_description_en?: string;
  service_description_fr?: string;
  service_description_ar?: string;
  service_is_active?: boolean;
  service_sort_order?: number;
  category_id?: number;
  category_name_en?: string;
  category_name_fr?: string;
  category_name_ar?: string;
  category_description_en?: string;
  category_description_fr?: string;
  category_description_ar?: string;
  category_icon_url?: string;
  category_is_active?: boolean;
  category_sort_order?: number;
  tasker_user_id?: string;
  tasker_first_name?: string;
  tasker_last_name?: string;
  tasker_email?: string;
  tasker_avatar_url?: string;
  tasker_phone?: string;
  tasker_role?: UserRole;
  tasker_verification_status?: VerificationStatus;
  tasker_created_at?: string;
  experience_level?: ExperienceLevel;
  tasker_bio?: string;
  operation_hours?: object | null;
  service_radius_km?: number;
  tasker_is_available?: boolean;
  identity_document_url?: string;
  profile_verification_status?: string;
  profile_updated_at?: string;
  tasker_rating?: number;
  total_reviews?: number;
  completed_jobs?: number;
  total_earnings?: number;
  response_time_hours?: number;
  cancellation_rate?: number;
  jobs_posted?: number;
  total_spent?: number;
  stats_updated_at?: string;
}

// Custom type for operation hours
export interface AvailabilitySlot {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

// Type for the object format of operation hours (current database format)
export interface OperationHoursObject {
  monday?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  tuesday?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  wednesday?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  thursday?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  friday?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  saturday?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  sunday?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

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
  conversations: Conversation;
  messages: Message;
  transactions: Transaction;
  notifications: Notification;
  promotion_packages: PromotionPackage;
  promotions: Promotion;
  user_stats: UserStats;
  companies: Company;
  company_promotion_profiles: CompanyPromotionProfile;
  company_stats: CompanyStats;
  tasker_promotion_profiles: TaskerPromotionProfile;
  user_favorites: UserFavorite;
  tasker_availability: TaskerAvailability;
  tasker_blocked_dates: TaskerBlockedDate;
  service_bookings: ServiceBooking;
  job_application_counts: JobApplicationCount;
  user_monthly_usage: UserMonthlyUsage;
  wallet_transactions: WalletTransaction;
  faq: FAQ;
}
