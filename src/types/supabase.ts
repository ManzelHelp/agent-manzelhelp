export type UserRole = "customer" | "tasker" | "admin";
export type VerificationStatus = "pending" | "verified" | "rejected";
export type PricingType = "fixed" | "hourly";
export type JobStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";
export type ApplicationStatus = "pending" | "accepted" | "rejected";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type TransactionType = "payment" | "refund" | "promotion";
export type NotificationType =
  | "job_application"
  | "job_status"
  | "message"
  | "review"
  | "system";

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
}

export interface Address {
  id: number;
  user_id: string;
  label?: string;
  street_address: string;
  city: string;
  region: string;
  postal_code?: string;
  country?: string;
  location?: unknown; // Postgis geometry type
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
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

export interface TaskerProfile {
  id: string;
  experience_level?: string;
  bio?: string;
  identity_document_url?: string;
  verification_status?: VerificationStatus;
  service_radius_km?: number;
  is_available?: boolean;
  updated_at?: string;
}

export interface TaskerService {
  id: number;
  tasker_id: string;
  service_id: number;
  pricing_type?: PricingType;
  base_price: number;
  hourly_rate?: number;
  is_available?: boolean;
  is_promoted?: boolean;
  promotion_expires_at?: string;
  promotion_boost_score?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Job {
  id: string;
  customer_id: string;
  service_id: number;
  address_id: number;
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
  created_at?: string;
  updated_at?: string;
}

export interface JobApplication {
  id: number;
  job_id: string;
  tasker_id: string;
  proposed_price: number;
  estimated_duration?: number;
  message?: string;
  status?: ApplicationStatus;
  is_premium?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id: number;
  job_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  attachment_url?: string;
  is_read?: boolean;
  created_at?: string;
}

export interface Review {
  id: number;
  job_id: string;
  reviewer_id: string;
  reviewee_id: string;
  overall_rating: number;
  quality_rating?: number;
  communication_rating?: number;
  timeliness_rating?: number;
  comment?: string;
  created_at?: string;
}

export interface Transaction {
  id: number;
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
}

export interface Notification {
  id: number;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_job_id?: string;
  related_user_id?: string;
  is_read?: boolean;
  created_at?: string;
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
}

// Database type with all tables
export interface Database {
  users: User;
  addresses: Address;
  services: Service;
  service_categories: ServiceCategory;
  tasker_profiles: TaskerProfile;
  tasker_services: TaskerService;
  jobs: Job;
  job_applications: JobApplication;
  messages: Message;
  reviews: Review;
  transactions: Transaction;
  notifications: Notification;
  user_stats: UserStats;
  promotion_packages: PromotionPackage;
  promotions: Promotion;
}
