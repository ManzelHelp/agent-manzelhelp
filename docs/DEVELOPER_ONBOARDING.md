# Developer Onboarding Guide - ManzelHelp

Welcome to the ManzelHelp development team! This guide will help you understand the project structure, architecture, and how to get started contributing.

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Project Architecture](#project-architecture)
4. [Project Structure](#project-structure)
5. [Key Concepts](#key-concepts)
6. [Development Workflow](#development-workflow)
7. [Common Tasks](#common-tasks)
8. [Important Files](#important-files)
9. [Coding Standards](#coding-standards)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

### What is ManzelHelp?
ManzelHelp is a **two-sided service marketplace platform** built with Next.js 15 and Supabase. It connects:
- **Customers** who need services (cleaning, repairs, tutoring, etc.)
- **Taskers** who offer services and can apply to customer job postings

### Key Characteristics
- **Dual Marketplace**: Both job postings AND direct service bookings
- **Multi-Language**: English, French, Arabic (RTL), German
- **Mobile-First**: Responsive design optimized for all devices
- **Server-Side Rendering**: Next.js App Router with SSR
- **Real-time Features**: Messaging, notifications, live updates

### Tech Stack Summary
```
Frontend: Next.js 15 + React 19 + TypeScript
Styling: Tailwind CSS 4
Database: Supabase (PostgreSQL)
Auth: Supabase Auth
State: Zustand
i18n: next-intl
UI: Radix UI + shadcn/ui
```

---

## 🚀 Quick Start

### Prerequisites
```bash
# Check Node.js version (should be 20+)
node --version

# Install pnpm if not installed
npm install -g pnpm
```

### Initial Setup

1. **Clone and Install**
```bash
git clone <repository-url>
cd agent-manzelhelp
pnpm install
```

2. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env.local

# Add your Supabase credentials
# Get these from: Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_publishable_key
```

3. **Database Setup**
   - Follow [SETUP_GUIDE.md](./SETUP_GUIDE.md) to set up Supabase
   - Run `manzelhelp_schema_cleaned.sql` in Supabase SQL Editor
   - Run `MISSING_TABLES.sql` for additional tables
   - Run `STORAGE_SETUP.sql` for storage buckets

4. **Start Development**
```bash
pnpm dev
```

Visit `http://localhost:3000` - you should see the homepage!

---

## 🏗️ Project Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│         Next.js App (Frontend)          │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   Pages      │    │  Components  │  │
│  │  (App Router)│    │  (Client/SSR) │  │
│  └──────────────┘    └──────────────┘  │
│  ┌──────────────┐    ┌──────────────┐  │
│  │ Server Actions│   │  Zustand     │  │
│  │  (API Layer) │    │  (State)     │  │
│  └──────────────┘    └──────────────┘  │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Supabase Backend               │
│  ┌──────────────┐    ┌──────────────┐  │
│  │  PostgreSQL  │    │   Storage    │  │
│  │   Database   │    │   Buckets   │  │
│  └──────────────┘    └──────────────┘  │
│  ┌──────────────┐    ┌──────────────┐  │
│  │     Auth      │    │   Real-time │  │
│  │   (Supabase)  │    │  (Websockets)│  │
│  └──────────────┘    └──────────────┘  │
└─────────────────────────────────────────┘
```

### Data Flow

1. **User Request** → Next.js Middleware (Auth check)
2. **Page Load** → Server Component (fetch data from Supabase)
3. **Client Interaction** → Client Component (use Zustand for state)
4. **Data Mutation** → Server Action → Supabase → Response

### Authentication Flow

```
User Login → Supabase Auth → JWT Token → 
Stored in Cookies → Middleware validates → 
User Store (Zustand) → Protected Routes
```

---

## 📁 Project Structure

```
agent-manzelhelp/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── [locale]/                 # Localized routes
│   │   │   ├── (auth)/               # Auth pages (login, signup)
│   │   │   ├── (profile)/            # Protected profile pages
│   │   │   │   ├── customer/         # Customer dashboard & features
│   │   │   │   └── tasker/           # Tasker dashboard & features
│   │   │   ├── (public-pages)/       # Public information pages
│   │   │   ├── layout.tsx            # Root layout with Header/Footer
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── search/               # Search pages
│   │   │   ├── service-offer/        # Service detail pages
│   │   │   └── job-offer/            # Job detail pages
│   │   └── layout.tsx                # Root layout
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── buttons/                  # Button components
│   │   ├── Header.tsx                # Main navigation
│   │   ├── Footer.tsx                # Footer component
│   │   └── ...                      # Other components
│   │
│   ├── actions/                      # Server Actions (API layer)
│   │   ├── auth.ts                   # Authentication actions
│   │   ├── profile.ts                # Profile management
│   │   ├── jobs.ts                   # Job-related actions
│   │   ├── bookings.ts               # Booking actions
│   │   └── ...                       # Other actions
│   │
│   ├── stores/                       # Zustand state management
│   │   └── userStore.ts              # User state (with SSR-safe persist)
│   │
│   ├── supabase/                     # Supabase configuration
│   │   ├── server.ts                 # Server-side Supabase client
│   │   ├── middleware.ts            # Auth middleware helper
│   │   └── client.ts                 # Client-side Supabase (if needed)
│   │
│   ├── types/                        # TypeScript types
│   │   └── supabase.ts               # Database types
│   │
│   ├── lib/                          # Utility functions
│   │   └── utils.ts                  # Helper functions
│   │
│   ├── i18n/                         # Internationalization
│   │   ├── routing.ts                # Route configuration
│   │   └── request.ts                 # i18n request handling
│   │
│   └── middleware.ts                 # Next.js middleware (auth + i18n)
│
├── messages/                          # Translation files
│   ├── en.json                       # English translations
│   ├── fr.json                       # French translations
│   ├── ar.json                       # Arabic translations
│   └── de.json                       # German translations
│
├── public/                           # Static assets
│   └── logo-manzelhelp.png
│
├── manzelhelp_schema_cleaned.sql     # Main database schema
├── MISSING_TABLES.sql                # Additional tables
├── STORAGE_SETUP.sql                 # Storage bucket setup
├── VIEWS_AND_STORAGE.sql             # Database views
│
├── BUSINESS_DOCUMENTATION.md         # Business overview
├── SETUP_GUIDE.md                    # Setup instructions
├── SCHEMA_ANALYSIS.md                # Schema documentation
└── package.json                      # Dependencies
```

---

## 🔑 Key Concepts

### 1. Next.js App Router

The project uses **Next.js 15 App Router** (not Pages Router). Key differences:

- **File-based routing**: Folders in `app/` create routes
- **Server Components by default**: Components are server-rendered unless marked `"use client"`
- **Server Actions**: Functions that run on the server (in `actions/` folder)
- **Layouts**: Shared layouts that wrap pages

**Example Route Structure:**
```
app/[locale]/customer/dashboard/page.tsx
→ URL: /en/customer/dashboard
→ Locale: en
→ Route: /customer/dashboard
```

### 2. Server vs Client Components

#### Server Components (Default)
```typescript
// No "use client" directive
// Runs on server, can access database directly
export default async function Page() {
  const supabase = await createClient(); // Server client
  const { data } = await supabase.from('users').select();
  return <div>{/* Render data */}</div>;
}
```

**Use Server Components for:**
- Data fetching
- Direct database access
- SEO-important content
- No interactivity needed

#### Client Components
```typescript
"use client"; // Required directive

import { useState } from 'react';
import { useUserStore } from '@/stores/userStore';

export default function InteractiveComponent() {
  const [count, setCount] = useState(0);
  const { user } = useUserStore();
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Use Client Components for:**
- Interactive features (buttons, forms)
- State management (useState, Zustand)
- Browser APIs (localStorage, window)
- Event handlers

### 3. Server Actions

Server Actions are functions that run on the server. They're defined in `src/actions/`:

```typescript
// src/actions/auth.ts
"use server";

import { createClient } from '@/supabase/server';

export async function loginAction(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true, user: data.user };
}
```

**Usage in Client Components:**
```typescript
"use client";

import { loginAction } from '@/actions/auth';

function LoginForm() {
  const handleSubmit = async (formData: FormData) => {
    const result = await loginAction(
      formData.get('email') as string,
      formData.get('password') as string
    );
  };
}
```

### 4. Supabase Clients

#### Server Client
```typescript
// src/supabase/server.ts
import { createClient } from '@/supabase/server';

// In Server Components or Server Actions
const supabase = await createClient();
const { data } = await supabase.from('users').select();
```

**Features:**
- Access to full database
- Server-side only
- Uses cookies for auth
- Safe for sensitive operations

#### Client Client (if needed)
```typescript
// For client-side Supabase operations
import { createBrowserClient } from '@supabase/ssr';
```

### 5. State Management (Zustand)

The project uses **Zustand** for client-side state:

```typescript
// src/stores/userStore.ts
import { useUserStore } from '@/stores/userStore';

// In Client Components
function MyComponent() {
  const { user, setUser } = useUserStore();
  // user is reactive, updates trigger re-renders
}
```

**Important**: The store is SSR-safe - it doesn't use localStorage during server-side rendering.

### 6. Internationalization (i18n)

The project uses **next-intl** for multi-language support:

```typescript
// In Server Components
import { getTranslations } from 'next-intl/server';

const t = await getTranslations('homepage');
return <h1>{t('title')}</h1>;

// In Client Components
import { useTranslations } from 'next-intl';

const t = useTranslations('homepage');
return <h1>{t('title')}</h1>;
```

**Translation Files**: `messages/{locale}.json`

**Route Structure**: `/[locale]/...` (e.g., `/en/dashboard`, `/fr/dashboard`)

### 7. Authentication & Authorization

#### Middleware Protection
```typescript
// src/middleware.ts
const PROTECTED_ROUTES = [
  "/customer/",
  "/tasker/",
  "/confirm-success",
  "/finish-signUp",
];
```

Routes in `PROTECTED_ROUTES` require authentication.

#### Role-Based Access
```typescript
// Check user role in components
const { user } = useUserStore();

if (user?.role === 'tasker') {
  // Show tasker features
} else if (user?.role === 'customer') {
  // Show customer features
}
```

### 8. Database Schema

**Key Tables:**
- `users` - User accounts
- `tasker_profiles` - Tasker information
- `companies` - Company profiles
- `services` - Service catalog
- `tasker_services` - Services offered by taskers
- `jobs` - Customer job postings
- `job_applications` - Tasker applications
- `service_bookings` - Direct service bookings
- `conversations` - Messaging threads
- `reviews` - Ratings and reviews
- `transactions` - Payment records

**See**: `SCHEMA_ANALYSIS.md` for complete schema documentation

---

## 🔄 Development Workflow

### 1. Making Changes

#### Adding a New Page
```bash
# Create page file
src/app/[locale]/my-new-page/page.tsx

# The route will be: /en/my-new-page, /fr/my-new-page, etc.
```

**Example:**
```typescript
// src/app/[locale]/my-new-page/page.tsx
import { getTranslations } from 'next-intl/server';

export default async function MyNewPage() {
  const t = await getTranslations('myNewPage');
  return <div>{t('title')}</div>;
}
```

#### Adding a New Component
```typescript
// src/components/MyComponent.tsx
"use client"; // If it needs interactivity

export default function MyComponent() {
  return <div>My Component</div>;
}
```

#### Adding a Server Action
```typescript
// src/actions/myAction.ts
"use server";

import { createClient } from '@/supabase/server';

export async function myAction() {
  const supabase = await createClient();
  // Your server-side logic
}
```

### 2. Working with Database

#### Querying Data (Server Component)
```typescript
import { createClient } from '@/supabase/server';

export default async function MyPage() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'tasker')
    .limit(10);
  
  if (error) {
    // Handle error
  }
  
  return <div>{/* Render data */}</div>;
}
```

#### Mutating Data (Server Action)
```typescript
"use server";

import { createClient } from '@/supabase/server';

export async function updateUser(userId: string, data: any) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('users')
    .update(data)
    .eq('id', userId);
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true };
}
```

### 3. Adding Translations

1. **Add translation key** to `messages/en.json`:
```json
{
  "myFeature": {
    "title": "My Feature Title",
    "description": "My feature description"
  }
}
```

2. **Add translations** to other language files (`fr.json`, `ar.json`, `de.json`)

3. **Use in components**:
```typescript
const t = await getTranslations('myFeature');
return <h1>{t('title')}</h1>;
```

### 4. Styling Guidelines

- **Use Tailwind CSS**: Utility-first approach
- **CSS Variables**: Use `var(--color-primary)` for theming
- **Mobile-First**: Design for mobile, then enhance for desktop
- **Responsive**: Use `sm:`, `md:`, `lg:` breakpoints

**Example:**
```typescript
<div className="w-full sm:w-1/2 lg:w-1/3 p-4 bg-[var(--color-surface)]">
  Content
</div>
```

---

## 🛠️ Common Tasks

### Task 1: Add a New Service Category

1. **Add to database** (via Supabase SQL Editor):
```sql
INSERT INTO service_categories (name_en, name_fr, name_ar, is_active, sort_order)
VALUES ('New Category', 'Nouvelle Catégorie', 'فئة جديدة', true, 14);
```

2. **Add services** to the category:
```sql
INSERT INTO services (category_id, name_en, name_fr, name_ar, is_active)
VALUES (14, 'Service Name', 'Nom du Service', 'اسم الخدمة', true);
```

3. **Update translations** if needed

### Task 2: Add a New Protected Route

1. **Add to middleware** (`src/middleware.ts`):
```typescript
const PROTECTED_ROUTES = [
  "/customer/",
  "/tasker/",
  "/my-new-route/", // Add here
];
```

2. **Create the route** in `src/app/[locale]/my-new-route/page.tsx`

### Task 3: Add a New User Role

1. **Update database enum**:
```sql
ALTER TYPE user_role ADD VALUE 'new_role';
```

2. **Update TypeScript types** (`src/types/supabase.ts`):
```typescript
export type UserRole = "customer" | "tasker" | "new_role" | ...;
```

3. **Update middleware** to handle new role
4. **Add role-specific pages** if needed

### Task 4: Create a New Server Action

1. **Create file** in `src/actions/myAction.ts`:
```typescript
"use server";

import { createClient } from '@/supabase/server';

export async function myAction(param: string) {
  const supabase = await createClient();
  // Implementation
  return { success: true };
}
```

2. **Use in component**:
```typescript
import { myAction } from '@/actions/myAction';

const result = await myAction('value');
```

### Task 5: Add a New Storage Bucket

1. **Create bucket** in Supabase Dashboard or via SQL:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('my-bucket', 'my-bucket', true);
```

2. **Add policies** (see `STORAGE_SETUP.sql` for examples)

---

## 📄 Important Files

### Configuration Files

- **`next.config.ts`**: Next.js configuration, image domains
- **`package.json`**: Dependencies and scripts
- **`.env.local`**: Environment variables (not in git)
- **`tailwind.config.ts`**: Tailwind CSS configuration

### Core Files

- **`src/middleware.ts`**: Authentication and i18n routing
- **`src/supabase/server.ts`**: Server-side Supabase client
- **`src/supabase/middleware.ts`**: Auth middleware helper
- **`src/stores/userStore.ts`**: User state management (SSR-safe)

### Database Files

- **`manzelhelp_schema_cleaned.sql`**: Main database schema
- **`MISSING_TABLES.sql`**: Additional tables needed
- **`STORAGE_SETUP.sql`**: Storage bucket configuration
- **`VIEWS_AND_STORAGE.sql`**: Database views

### Documentation Files

- **`BUSINESS_DOCUMENTATION.md`**: Business overview
- **`SETUP_GUIDE.md`**: Setup instructions
- **`SCHEMA_ANALYSIS.md`**: Schema documentation
- **`DEVELOPER_ONBOARDING.md`**: This file!

---

## 📝 Coding Standards

### TypeScript
- **Always use TypeScript**: No `any` types unless necessary
- **Type everything**: Functions, components, props
- **Use interfaces**: For object shapes
- **Use types**: For unions, primitives

### Component Structure
```typescript
// 1. Imports
import React from 'react';
import { Button } from '@/components/ui/button';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
  onClick: () => void;
}

// 3. Component
export default function MyComponent({ title, onClick }: MyComponentProps) {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Handlers
  const handleClick = () => {
    onClick();
  };
  
  // 6. Render
  return <Button onClick={handleClick}>{title}</Button>;
}
```

### File Naming
- **Components**: PascalCase (`MyComponent.tsx`)
- **Actions**: camelCase (`myAction.ts`)
- **Utils**: camelCase (`myUtil.ts`)
- **Types**: camelCase (`myTypes.ts`)

### Import Order
1. React/Next.js imports
2. Third-party libraries
3. Internal components
4. Types
5. Utils
6. Styles

### Comments
- **Explain WHY, not WHAT**: Code should be self-documenting
- **Use JSDoc** for functions:
```typescript
/**
 * Creates a new job posting for a customer
 * @param jobData - Job details including title, description, budget
 * @returns Success status and job ID if created
 */
export async function createJob(jobData: CreateJobData) {
  // Implementation
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "localStorage.getItem is not a function"
**Cause**: Zustand persist middleware accessing localStorage during SSR

**Solution**: The store is already fixed, but if you see this:
- Ensure `"use client"` directive is at the top of files using the store
- Don't import `useUserStore` in Server Components

#### 2. "Missing Supabase environment variables"
**Cause**: `.env.local` not configured

**Solution**:
```bash
# Check .env.local exists
cat .env.local

# Add missing variables
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_key
```

#### 3. "Type error: Property does not exist"
**Cause**: TypeScript types out of sync with database

**Solution**:
- Update types in `src/types/supabase.ts`
- Or regenerate from Supabase schema

#### 4. "Route not found" or "404"
**Cause**: Route structure mismatch

**Solution**:
- Check file is in correct `app/[locale]/` folder
- Ensure file is named `page.tsx` (not `index.tsx`)
- Check middleware isn't blocking the route

#### 5. "Hydration error"
**Cause**: Server and client rendering different content

**Solution**:
- Ensure Server Components don't use browser APIs
- Use `suppressHydrationWarning` for theme providers
- Check for conditional rendering based on `window`

### Debugging Tips

1. **Check Browser Console**: Client-side errors
2. **Check Terminal**: Server-side errors
3. **Check Supabase Logs**: Database/API errors
4. **Use React DevTools**: Component state inspection
5. **Use Next.js DevTools**: Performance and routing

### Getting Help

1. **Check Documentation**: 
   - This file
   - `BUSINESS_DOCUMENTATION.md`
   - `SETUP_GUIDE.md`

2. **Check Code Comments**: Important files have inline documentation

3. **Ask the Team**: Reach out to senior developers

---

## 🎓 Learning Resources

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### Supabase
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

### React
- [React 19 Docs](https://react.dev)
- [Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)

### Zustand
- [Zustand Docs](https://zustand.docs.pmnd.rs)
- [SSR with Zustand](https://github.com/pmndrs/zustand/blob/main/docs/guides/nextjs.md)

---

## ✅ Checklist for New Developers

- [ ] Environment set up (Node.js, pnpm)
- [ ] Repository cloned
- [ ] Dependencies installed (`pnpm install`)
- [ ] `.env.local` configured with Supabase credentials
- [ ] Database schema imported to Supabase
- [ ] Storage buckets created
- [ ] Development server runs (`pnpm dev`)
- [ ] Can access homepage at `http://localhost:3000`
- [ ] Can log in with test account
- [ ] Read `BUSINESS_DOCUMENTATION.md`
- [ ] Understand project structure
- [ ] Know difference between Server/Client Components
- [ ] Familiar with Server Actions pattern
- [ ] Understand Zustand store usage
- [ ] Know how to add translations

---

## 🚦 Next Steps

1. **Explore the Codebase**:
   - Start with `src/app/[locale]/page.tsx` (homepage)
   - Look at `src/components/Header.tsx` (navigation)
   - Check `src/actions/auth.ts` (authentication)

2. **Run the App**:
   - Create a test account
   - Try posting a job (as customer)
   - Try creating a service (as tasker)

3. **Make Your First Change**:
   - Fix a small bug
   - Add a translation
   - Update a component style

4. **Ask Questions**:
   - Don't hesitate to ask for clarification
   - Share what you've learned
   - Contribute to documentation

---

## 📞 Support

If you encounter issues or have questions:
1. Check this documentation first
2. Review `BUSINESS_DOCUMENTATION.md` for business context
3. Check `SETUP_GUIDE.md` for setup issues
4. Ask the development team

---

**Welcome to the team! Happy coding! 🎉**

---

*Last Updated: December 2024*  
*For questions or updates to this guide, contact the development team*

