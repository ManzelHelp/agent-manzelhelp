/**
 * Next.js Proxy (formerly Middleware)
 * 
 * MIGRATION FROM middleware.ts TO proxy.ts (Next.js 16):
 * Next.js 16 has deprecated the `middleware.ts` convention in favor of `proxy.ts`
 * to clarify its role as a network request interception point. This change avoids
 * confusion with the term "middleware" used in other frameworks and emphasizes
 * that this functionality works on the Node.js runtime.
 * 
 * IMPORTANT NOTES:
 * - The Edge runtime is NOT supported in proxy.ts. If you need Edge-specific
 *   features, continue using middleware.ts until further guidance is provided.
 * - The function signature changes from `middleware(request)` to `proxy(request)`
 * - The config matcher remains the same
 * 
 * This proxy handles:
 * 1. Internationalization (i18n) routing with next-intl
 * 2. Authentication checks for protected routes using Supabase
 * 3. Performance optimization by skipping system routes early
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */

import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { updateSession } from "@/supabase/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * SYSTEM_ROUTES: Routes that should skip all proxy processing for performance.
 * These are static assets, system routes, or webhooks that don't need i18n or auth.
 * Early return prevents unnecessary processing and improves response times.
 */
const SYSTEM_ROUTES = [
  "/_next",
  "/_vercel",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/api/webhook",
  "/api/health",
];

/**
 * PROTECTED_ROUTES: Routes that require authentication.
 * These routes will trigger Supabase session validation.
 * Routes are matched using startsWith, so sub-routes are automatically protected.
 */
const PROTECTED_ROUTES = [
  "/customer/",
  "/tasker/",
  "/confirm-success",
  "/finish-signUp",
];

/**
 * Main proxy function that processes all incoming requests.
 * 
 * This function replaces the deprecated `middleware` function in Next.js 16.
 * The signature can be either synchronous or async:
 * - `proxy(request: NextRequest)` for synchronous operations
 * - `async function proxy(request: NextRequest)` for async operations
 * 
 * Since we need to call async functions (updateSession), we use the async version.
 * The proxy function can return NextResponse, Promise<NextResponse>, or void.
 * 
 * Execution order:
 * 1. Early return for system routes (performance optimization)
 * 2. Extract locale information from the request path
 * 3. Run next-intl middleware for i18n routing
 * 4. Check if route is protected (requires authentication)
 * 5. Run Supabase auth middleware for protected routes only
 * 
 * This order ensures:
 * - Performance: System routes skip all processing
 * - Correctness: i18n routing happens before auth checks
 * - Security: Protected routes are validated before access
 * - User experience: Proper redirects for unauthenticated users
 * 
 * @param request - The Next.js request object
 * @returns NextResponse, Promise<NextResponse>, or void (void means pass through without modification)
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Performance optimization: Skip all processing for system routes
  // This prevents unnecessary i18n and auth checks for static assets
  if (SYSTEM_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Extract locale and clean pathname for route matching
  // This handles both /en/... and /... patterns correctly
  const { locale, pathname: cleanPathname } = getLocaleInfo(request);

  // Run i18n middleware first to handle locale routing and redirects
  // This ensures proper locale detection and URL normalization
  const intlResponse = intlMiddleware(request);

  // Respect next-intl redirects immediately (e.g., locale prefix addition)
  // Status codes 300-399 indicate redirects
  if (intlResponse && intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // Check if this route requires authentication
  // Only protected routes need Supabase session validation
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    cleanPathname.startsWith(route)
  );

  // Public routes don't need auth checks - return i18n response immediately
  if (!isProtectedRoute) {
    return intlResponse || NextResponse.next();
  }

  // Protected routes: Validate Supabase session before allowing access
  // This ensures only authenticated users can access protected areas
  // updateSession is async, so we await it
  try {
    return await updateSession(request, intlResponse, {
      locale,
      pathname: cleanPathname,
      protectedRoutes: PROTECTED_ROUTES,
    });
  } catch (error) {
    // Error handling: Log error and redirect to login
    // This prevents crashes and provides a smooth user experience
    console.error("Auth proxy error:", error);
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }
}

/**
 * Extracts locale information from the request pathname.
 * 
 * This function:
 * 1. Finds the locale prefix in the URL (e.g., /en/, /fr/, /de/)
 * 2. Falls back to default locale if no prefix is found
 * 3. Returns the clean pathname without the locale prefix for route matching
 * 
 * Examples:
 * - /en/dashboard -> { locale: "en", pathname: "/dashboard" }
 * - /fr/customer/profile -> { locale: "fr", pathname: "/customer/profile" }
 * - /dashboard -> { locale: "en" (default), pathname: "/dashboard" }
 * 
 * @param request - The Next.js request object
 * @returns Object with locale and clean pathname
 */
function getLocaleInfo(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Find locale prefix in the pathname
  // Matches both /locale/... and /locale patterns
  const locale =
    routing.locales.find(
      (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`
    ) || routing.defaultLocale;

  // Remove locale prefix from pathname for route matching
  // This allows protected routes to be matched correctly regardless of locale
  const cleanPathname = pathname.startsWith(`/${locale}`)
    ? pathname.slice(`/${locale}`.length) || "/"
    : pathname;

  return { locale, pathname: cleanPathname };
}

/**
 * Proxy configuration - defines which routes should be processed.
 * 
 * The matcher uses negative lookahead regex patterns to:
 * 1. Skip Next.js internal paths (_next, _vercel) for performance
 * 2. Skip static assets (images, fonts, CSS, JS) to avoid unnecessary processing
 * 3. Process API routes (except webhook and health endpoints)
 * 4. Process all page routes for i18n and auth checks
 * 
 * This configuration ensures proxy only runs where needed, optimizing performance.
 * 
 * Note: The config format remains the same as middleware.ts
 */
export const config = {
  matcher: [
    // Skip all internal paths (_next, _vercel) - these are handled by Next.js
    "/((?!_next/static|_next/image|_vercel|favicon.ico).*)",
    // Skip all file extensions (images, fonts, etc.) - static assets don't need processing
    "/((?!.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|eot)$).*)",
    // Include API routes we want to process (exclude webhook and health for performance)
    "/api/((?!webhook|health).*)",
  ],
};

