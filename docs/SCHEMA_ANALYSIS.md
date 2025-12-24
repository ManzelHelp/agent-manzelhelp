# Supabase Schema Analysis & Migration Guide

## 📊 Schema Analysis Summary

### ✅ Tables Present in Schema File

The schema file contains the following **18 core tables**:

1. ✅ `addresses` - User addresses
2. ✅ `companies` - Company profiles
3. ✅ `company_promotion_profiles` - Company promotion data
4. ✅ `company_stats` - Company statistics
5. ✅ `job_applications` - Job applications from taskers
6. ✅ `jobs` - Job postings
7. ✅ `messages` - Direct messages (legacy structure)
8. ✅ `notifications` - User notifications
9. ✅ `promotion_packages` - Promotion package definitions
10. ✅ `promotions` - Active promotions
11. ✅ `reviews` - Reviews/ratings
12. ✅ `service_categories` - Service categories (parent)
13. ✅ `services` - Individual services (child of categories)
14. ✅ `tasker_profiles` - Tasker profile information
15. ✅ `tasker_promotion_profiles` - Tasker promotion data
16. ✅ `tasker_services` - Services offered by taskers
17. ✅ `transactions` - Payment transactions
18. ✅ `user_stats` - User statistics
19. ✅ `users` - User accounts

### ❌ Missing Tables (Referenced in Codebase)

The following tables are referenced in your TypeScript types and code but **ARE NOT in the schema file**:

1. ❌ **`conversations`** - Used for messaging system (replaces direct messages)
   - Referenced in: `src/types/supabase.ts`, `src/actions/dashboard.ts`
   - Fields needed: `id`, `job_id`, `service_id`, `booking_id`, `participant1_id`, `participant2_id`, `last_message_at`, `created_at`

2. ❌ **`service_bookings`** - Service bookings (different from jobs)
   - Referenced in: `src/types/supabase.ts`, `src/actions/dashboard.ts`, `src/actions/bookings.ts`
   - Critical for booking functionality
   - Fields needed: `id`, `customer_id`, `tasker_id`, `tasker_service_id`, `booking_type`, `scheduled_date`, `status`, `agreed_price`, etc.

3. ❌ **`user_favorites`** - User favorite taskers
   - Referenced in: `src/types/supabase.ts`
   - Fields needed: `id`, `user_id`, `tasker_id`, `created_at`

4. ❌ **`tasker_availability`** - Tasker availability schedule
   - Referenced in: `src/types/supabase.ts`
   - Fields needed: `id`, `tasker_id`, `day_of_week`, `start_time`, `end_time`, `is_active`, `created_at`

5. ❌ **`tasker_blocked_dates`** - Tasker blocked dates
   - Referenced in: `src/types/supabase.ts`
   - Fields needed: `id`, `tasker_id`, `blocked_date`, `reason`, `is_full_day`, `start_time`, `end_time`, `created_at`

6. ❌ **`job_application_counts`** - Job application counters
   - Referenced in: `src/types/supabase.ts`
   - Fields needed: `id`, `job_id`, `application_count`, `created_at`, `updated_at`

7. ❌ **`user_monthly_usage`** - User monthly usage tracking
   - Referenced in: `src/types/supabase.ts`
   - Fields needed: `id`, `user_id`, `month_year`, `applications_count`, `job_postings_count`, `created_at`, `updated_at`

8. ❌ **`wallet_transactions`** - Wallet transaction history
   - Referenced in: `src/types/supabase.ts`
   - Fields needed: `id`, `user_id`, `amount`, `type`, `related_job_id`, `notes`, `created_at`

9. ❌ **`faq`** - FAQ entries
   - Referenced in: `src/types/supabase.ts`
   - Fields needed: `id`, `role`, `audience`, `category`, `question_en`, `answer_en`, `question_fr`, `answer_fr`, `question_ar`, `answer_ar`, `created_at`

### ⚠️ Schema Differences

1. **`messages` table structure**: The schema has a simple `messages` table, but your code references a `conversations` table with a different structure. You may need to migrate or create both.

2. **`tasker_services` table**: The schema shows `tasker_services` with fields like `base_price`, `hourly_rate`, but your TypeScript types expect `price`, `title`, `description`, `service_status`, `verification_status`, etc. There's a mismatch.

3. **`jobs` table**: Schema has `status` enum with values: `pending`, `active`, `in_progress`, `completed`, `cancelled`. Your types expect: `under_review`, `active`, `assigned`, `in_progress`, `completed`, `cancelled`, `disputed`, `draft`. There's a mismatch.

4. **`users` table**: Schema doesn't show `wallet_balance` or `verification_status` fields, but your types expect them.

### 📦 Storage Buckets Required

Based on `src/actions/file-uploads.ts`, you need the following storage buckets:

1. ✅ **`verification-documents`** - For ID document uploads
   - Used for: User identity verification
   - Path structure: `{userId}/id-front.jpg`, `{userId}/id-back.jpg`

2. ❓ **`avatars`** - For user profile pictures (likely needed)
   - Referenced via `avatar_url` in users table

3. ❓ **`service-images`** - For service/portfolio images (likely needed)
   - Referenced via `portfolio_images` in tasker_services

4. ❓ **`job-images`** - For job posting images (likely needed)
   - Referenced via `images` in jobs table

5. ❓ **`company-logos`** - For company logos (likely needed)
   - Referenced via `logo_url` in companies table

6. ❓ **`company-covers`** - For company cover images (likely needed)
   - Referenced via `cover_image_url` in companies table

### 🔍 Views Required

1. ❌ **`service_listing_view`** - Referenced in `src/app/[locale]/search/services/page.tsx`
   - This is a database view that joins multiple tables for service listings
   - Needs to be created in Supabase

### 🔧 Functions & Triggers

The schema file doesn't show any:
- ❌ Database functions
- ❌ Triggers
- ❌ Row Level Security (RLS) policies
- ❌ Indexes (though some are shown)

**Important**: You'll need to set up RLS policies for security!

## 🚀 Migration Steps

### Step 1: Create New Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized
3. Get your project URL and publishable key from Settings → API
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Publishable Default Key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

### Step 2: Restore Schema

1. Open Supabase SQL Editor
2. Copy the entire content of `manzelhelp_schema_cleaned.sql` (use this cleaned version!)
3. Execute it in the SQL Editor
4. Verify all tables are created
5. Verify initial data was inserted (promotion_packages, service_categories, services, users)

### Step 3: Create Missing Tables

You'll need to create SQL scripts for the missing tables. I can help generate these.

### Step 4: Create Storage Buckets

1. Go to Storage in Supabase dashboard
2. Create buckets:
   - `verification-documents` (private)
   - `avatars` (public)
   - `service-images` (public)
   - `job-images` (public)
   - `company-logos` (public)
   - `company-covers` (public)

3. Set up bucket policies for access control

### Step 5: Create Views

Create the `service_listing_view` view (SQL needed).

### Step 6: Set Up RLS Policies

Configure Row Level Security for all tables based on your access patterns.

## 💻 Local Supabase Setup (Recommended)

For offline development, set up **Supabase CLI**:

### Installation

```bash
# Install Supabase CLI
npm install -g supabase

# Or with Homebrew (macOS)
brew install supabase/tap/supabase
```

### Initialize Local Project

```bash
# Initialize Supabase in your project
supabase init

# Start local Supabase (requires Docker)
supabase start

# This will give you:
# - Local API URL: http://localhost:54321
# - Local publishable key (use as NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)
# - Local database
```

### Link to Remote Project

```bash
# Link to your remote Supabase project
supabase link --project-ref your-project-ref

# Pull remote schema
supabase db pull

# Push local changes
supabase db push
```

### Benefits of Local Setup

- ✅ Work offline
- ✅ Faster development (no network latency)
- ✅ Safe testing (won't affect production)
- ✅ Version control for migrations
- ✅ Easy reset/rollback

## 📝 Next Steps

1. **Create missing table SQL scripts** - I can generate these
2. **Create storage bucket setup script** - I can generate this
3. **Create view SQL** - I can generate this
4. **Set up RLS policies** - I can help with this
5. **Update environment variables** - Add to `.env.local`

Would you like me to generate the SQL scripts for the missing tables and other components?

