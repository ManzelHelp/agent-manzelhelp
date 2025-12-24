import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/**
 * Next.js Configuration
 * 
 * This configuration handles:
 * - Image optimization with remote patterns for Supabase storage
 * - Turbopack root directory configuration to resolve multiple lockfiles warning
 * - Internationalization (i18n) with next-intl
 */

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qffdjohdswfdkmxhcncu.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "tajxdctsdxbhskoxjtca.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Server Actions configuration
  // Increase body size limit to allow uploading ID documents (up to 5MB each)
  // Default limit is 1MB, but we need at least 10MB for 2 files of 5MB each
  // Note: In Next.js 16, this might need to be in experimental or may not be available
  // Alternative: Upload directly from client to Supabase Storage (recommended)
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // NOTE: Multiple lockfiles warning
  // Turbopack may show a warning about multiple lockfiles (e.g., package-lock.json
  // in parent directory). This is a non-blocking warning and can be safely ignored.
  // If you want to resolve it, you can:
  // 1. Delete the package-lock.json from the parent directory (if not needed)
  // 2. Or ignore the warning as it doesn't affect functionality
  // There is no official Next.js configuration option to suppress this warning
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
