# ManzelHelp - Service Marketplace Platform

> **Your All-in-One Service Solution - Connect, help, and grow together!**

ManzelHelp is a comprehensive two-sided marketplace platform that connects customers who need services with skilled taskers (service providers) who can offer their expertise. The platform supports both job postings and direct service bookings, creating a flexible and comprehensive service marketplace.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (recommended: Node.js 22)
- pnpm (or npm/yarn)
- Supabase account

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials to .env.local

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 Documentation

- **[Developer Onboarding Guide](./DEVELOPER_ONBOARDING.md)** ⭐ **Start here if you're new!**
- **[Quick Reference](./QUICK_REFERENCE.md)** - Cheat sheet for common tasks
- **[Business Documentation](./BUSINESS_DOCUMENTATION.md)** - Comprehensive business overview, features, and functionalities
- **[Setup Guide](./SETUP_GUIDE.md)** - Database setup and configuration instructions
- **[Schema Analysis](./SCHEMA_ANALYSIS.md)** - Database schema details and migration guide

## 🎯 Project Overview

### What is ManzelHelp?

ManzelHelp is a service marketplace platform that enables:

- **Customers** to post jobs and book services from verified taskers
- **Taskers** to offer services and apply to customer job postings
- **Companies** to manage multiple taskers and scale their service offerings

### Key Features

- ✅ **Dual Marketplace**: Both job posting and service booking
- ✅ **Multi-Language**: English, French, Arabic, German support
- ✅ **Service Categories**: 13 categories with 69+ services
- ✅ **Secure Payments**: Escrow system with secure transactions
- ✅ **User Verification**: Identity verification for trust and safety
- ✅ **Reviews & Ratings**: Comprehensive review system
- ✅ **Real-time Messaging**: Direct communication between users
- ✅ **Promotion Tools**: Marketing and visibility features
- ✅ **Mobile-First**: Responsive design optimized for all devices

## 🏗️ Tech Stack

- **Framework**: Next.js 15.3.5 (App Router)
- **UI**: React 19.0.0, Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Zustand
- **Internationalization**: next-intl
- **UI Components**: Radix UI, shadcn/ui

## 👥 User Roles

1. **Customer**: Post jobs, book services, manage bookings
2. **Tasker**: Offer services, apply to jobs, manage earnings
3. **Company**: Manage multiple taskers, company branding
4. **Admin**: Platform management
5. **Support**: Customer support

## 📂 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [locale]/          # Localized routes
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (profile)/     # User profile pages
│   │   └── (public-pages)/ # Public information pages
├── components/            # React components
├── actions/               # Server actions
├── stores/                # State management (Zustand)
├── supabase/              # Supabase client configuration
├── types/                 # TypeScript type definitions
└── lib/                   # Utility functions
```

## 🌍 Supported Languages

- 🇬🇧 English (en)
- 🇫🇷 French (fr)
- 🇸🇦 Arabic (ar) - RTL support
- 🇩🇪 German (de)

## 🔧 Environment Variables

Required environment variables (`.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_key
```

## 📦 Service Categories

1. Cleaning Services
2. Handyman Services
3. Plumbing
4. Electrical
5. Gardening
6. Moving Services
7. Delivery Services
8. Beauty & Wellness
9. Tutoring
10. IT & Tech
11. Automotive
12. Pet Care
13. Event Services

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies**: `pnpm install`
3. **Set up Supabase**: Follow [SETUP_GUIDE.md](./SETUP_GUIDE.md)
4. **Configure environment**: Add `.env.local` with Supabase credentials
5. **Run migrations**: Execute SQL scripts in Supabase SQL Editor
6. **Start development**: `pnpm dev`

## 📖 Learn More

- [Business Documentation](./BUSINESS_DOCUMENTATION.md) - Complete business overview
- [Setup Guide](./SETUP_GUIDE.md) - Database and environment setup
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

## 🤝 Contributing

This is a private project. For questions or support, please contact the development team.

## 📄 License

Private - All rights reserved

---

**Version**: 0.1.0  
**Last Updated**: December 2024
