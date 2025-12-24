# Supabase Project Setup Guide

## 📋 Complete Setup Checklist

### Phase 1: Create New Supabase Project

1. ✅ Go to [supabase.com](https://supabase.com) and sign in
2. ✅ Click "New Project"
3. ✅ Fill in project details:
   - Name: `manzelhelp` (or your preferred name)
   - Database Password: (save this securely!)
   - Region: Choose closest to your users
4. ✅ Wait for project initialization (2-3 minutes)
5. ✅ Get your credentials from Settings → API:
   - Project URL: `https://xxxxx.supabase.co`
   - Publishable Default Key: `eyJhbGc...` (use as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`)
   - Service Role Key: (keep secret!)

### Phase 2: Restore Database Schema

1. ✅ Open Supabase SQL Editor
2. ✅ Copy entire content from `manzelhelp_schema_cleaned.sql` (use this file, not the original!)
3. ✅ Paste and execute in SQL Editor
4. ✅ Verify tables are created (check Table Editor)
5. ✅ Verify data was inserted (check promotion_packages, service_categories, services tables)

### Phase 3: Add Missing Tables

1. ✅ Open SQL Editor again
2. ✅ Copy entire content from `MISSING_TABLES.sql`
3. ✅ Execute the script
4. ✅ Verify new tables are created

### Phase 4: Create Views

1. ✅ Open SQL Editor
2. ✅ Copy entire content from `VIEWS_AND_STORAGE.sql`
3. ✅ Execute the view creation part (first section)
4. ✅ Verify view exists: `SELECT * FROM service_listing_view LIMIT 1;`

### Phase 5: Create Storage Buckets

**Option A: Via Dashboard (Recommended)**

1. Go to Storage in Supabase dashboard
2. Click "New Bucket" for each:
   - `verification-documents` → **Private**
   - `avatars` → **Public**
   - `service-images` → **Public**
   - `job-images` → **Public**
   - `company-logos` → **Public**
   - `company-covers` → **Public**

**Option B: Via SQL (After creating buckets manually)**

1. Execute the storage policies section from `VIEWS_AND_STORAGE.sql`

### Phase 6: Configure Environment Variables

Create `.env.local` in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key-here

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Phase 7: Set Up Row Level Security (RLS)

⚠️ **IMPORTANT**: The schema file doesn't include RLS policies. You need to set these up for security!

Basic RLS setup:

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasker_services ENABLE ROW LEVEL SECURITY;
-- ... (enable for all tables)

-- Example: Users can only read their own data
CREATE POLICY "Users can read own data"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Example: Users can update their own data
CREATE POLICY "Users can update own data"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id);
```

**Note**: You'll need comprehensive RLS policies for your use case. Consider:
- Public read access for listings
- Authenticated write access for own data
- Admin access for moderation
- Tasker/customer role-based access

### Phase 8: Test Connection

1. Restart your dev server:
   ```bash
   pnpm dev
   ```

2. Check for errors in terminal
3. Visit `http://localhost:3000` and verify it loads

## 🏠 Local Supabase Setup (Optional but Recommended)

### Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase
```

### Initialize Local Project

```bash
# In your project directory
supabase init

# Start local Supabase (requires Docker)
supabase start

# You'll get:
# API URL: http://localhost:54321
# publishable key: (shown in output, use as NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)
# service_role key: (shown in output)
```

### Link to Remote Project

```bash
# Get your project ref from Supabase dashboard URL
# https://supabase.com/dashboard/project/[PROJECT_REF]

supabase link --project-ref your-project-ref

# Pull remote schema
supabase db pull

# Push local changes
supabase db push
```

### Use Local Supabase

Update `.env.local` for local development:

```env
# Local Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-local-publishable-key
```

### Benefits

- ✅ Work completely offline
- ✅ Faster development (no network latency)
- ✅ Safe testing (won't affect production)
- ✅ Easy database resets
- ✅ Version control for migrations

## 🔍 Verification Checklist

After setup, verify:

- [ ] All 27 tables exist (18 from schema + 9 missing)
- [ ] `service_listing_view` view exists
- [ ] All 6 storage buckets created
- [ ] Storage policies applied
- [ ] Environment variables set
- [ ] App connects without errors
- [ ] Can query data from tables
- [ ] Can upload files to storage

## 🐛 Troubleshooting

### Error: "relation does not exist"
- Check if table was created: `SELECT * FROM information_schema.tables WHERE table_name = 'table_name';`
- Re-run the SQL script

### Error: "permission denied"
- Check RLS policies
- Verify storage bucket policies
- Check user authentication

### Error: "bucket does not exist"
- Create buckets via Dashboard first
- Then apply storage policies

### Error: "column does not exist"
- Check if column was added: `SELECT column_name FROM information_schema.columns WHERE table_name = 'table_name';`
- Re-run the missing columns section

## 📚 Next Steps

1. Set up comprehensive RLS policies
2. Create database functions/triggers if needed
3. Set up database backups
4. Configure email templates (if using Supabase Auth)
5. Set up monitoring and alerts

## 🆘 Need Help?

If you encounter issues:
1. Check Supabase logs in dashboard
2. Check browser console for errors
3. Verify all SQL scripts executed successfully
4. Ensure environment variables are correct

