# Quick Reference Guide - ManzelHelp

A quick reference cheat sheet for common development tasks.

## 🚀 Quick Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run linter

# Database
# Run SQL files in Supabase SQL Editor:
# - manzelhelp_schema_cleaned.sql
# - MISSING_TABLES.sql
# - STORAGE_SETUP.sql
```

## 📁 File Locations

| What | Where |
|------|-------|
| Pages | `src/app/[locale]/` |
| Components | `src/components/` |
| Server Actions | `src/actions/` |
| State Management | `src/stores/` |
| Supabase Config | `src/supabase/` |
| Types | `src/types/` |
| Translations | `messages/{locale}.json` |
| Proxy (Middleware) | `src/proxy.ts` |

## 🔑 Common Patterns

### Create a Server Component Page
```typescript
// src/app/[locale]/my-page/page.tsx
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/supabase/server';

export default async function MyPage() {
  const t = await getTranslations('myPage');
  const supabase = await createClient();
  const { data } = await supabase.from('table').select();
  return <div>{t('title')}</div>;
}
```

### Create a Client Component
```typescript
// src/components/MyComponent.tsx
"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const [state, setState] = useState();
  const t = useTranslations('myComponent');
  return <div>{t('title')}</div>;
}
```

### Create a Server Action
```typescript
// src/actions/myAction.ts
"use server";

import { createClient } from '@/supabase/server';

export async function myAction(param: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('table').insert({ data: param });
  return { success: !error, error: error?.message };
}
```

### Use Zustand Store
```typescript
"use client";

import { useUserStore } from '@/stores/userStore';

export default function MyComponent() {
  const { user, setUser } = useUserStore();
  // user is reactive
}
```

### Database Query (Server)
```typescript
const supabase = await createClient();
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('role', 'tasker')
  .order('created_at', { ascending: false })
  .limit(10);
```

### Database Insert (Server Action)
```typescript
"use server";

const supabase = await createClient();
const { data, error } = await supabase
  .from('table')
  .insert({ field: value })
  .select()
  .single();
```

### Add Translation
```json
// messages/en.json
{
  "myFeature": {
    "title": "My Title",
    "description": "My Description"
  }
}
```

```typescript
// Use in component
const t = await getTranslations('myFeature');
return <h1>{t('title')}</h1>;
```

## 🎨 Styling

### Tailwind with CSS Variables
```typescript
<div className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">
  Content
</div>
```

### Responsive Design
```typescript
<div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
  Responsive
</div>
```

## 🔐 Authentication

### Check if User is Logged In
```typescript
"use client";
const { user } = useUserStore();
if (!user) {
  router.push('/login');
}
```

### Get Current User (Server)
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
```

### Protect Route
```typescript
// Add to src/proxy.ts
const PROTECTED_ROUTES = [
  "/my-route/",
];
```

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts |
| `tasker_profiles` | Tasker information |
| `companies` | Company profiles |
| `services` | Service catalog |
| `tasker_services` | Services offered by taskers |
| `jobs` | Customer job postings |
| `job_applications` | Tasker applications |
| `service_bookings` | Direct bookings |
| `conversations` | Messaging threads |
| `reviews` | Ratings and reviews |
| `transactions` | Payment records |

## 🌍 Locales

- `en` - English
- `fr` - French
- `ar` - Arabic (RTL)
- `de` - German

## 🎯 User Roles

- `customer` - Service seeker
- `tasker` - Service provider
- `company` - Business account
- `admin` - Platform admin
- `support` - Support staff

## 📝 Common Imports

```typescript
// Next.js
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Supabase
import { createClient } from '@/supabase/server';

// i18n
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

// State
import { useUserStore } from '@/stores/userStore';

// UI
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

## ⚠️ Common Mistakes

1. **Using localStorage in Server Components** ❌
   ```typescript
   // WRONG
   const data = localStorage.getItem('key');
   
   // RIGHT - Use in Client Component only
   "use client";
   const data = localStorage.getItem('key');
   ```

2. **Importing useUserStore in Server Components** ❌
   ```typescript
   // WRONG
   import { useUserStore } from '@/stores/userStore';
   
   // RIGHT - Use createClient() in Server Components
   const supabase = await createClient();
   ```

3. **Forgetting "use client" directive** ❌
   ```typescript
   // WRONG - Missing directive
   import { useState } from 'react';
   
   // RIGHT
   "use client";
   import { useState } from 'react';
   ```

4. **Not handling errors in Server Actions** ❌
   ```typescript
   // WRONG
   const { data } = await supabase.from('table').select();
   
   // RIGHT
   const { data, error } = await supabase.from('table').select();
   if (error) {
     return { success: false, error: error.message };
   }
   ```

## 🔍 Debugging

```typescript
// Console logging
console.log('Debug:', data);

// Check Supabase error
if (error) {
  console.error('Supabase error:', error.message, error.code);
}

// Check user state
console.log('User:', useUserStore.getState().user);
```

## 📚 Documentation Links

- [Full Onboarding Guide](./DEVELOPER_ONBOARDING.md)
- [Business Documentation](./BUSINESS_DOCUMENTATION.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Schema Analysis](./SCHEMA_ANALYSIS.md)

---

*Keep this file handy for quick reference!*

