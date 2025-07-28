import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { updateSession } from "@/supabase/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Routes that don't need auth checks - performance optimization
const PUBLIC_ROUTES = [
  "/api/webhook",
  "/api/health",
  "/_next",
  "/_vercel",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

// Routes that need auth checks
const PROTECTED_ROUTES = [
  // "/admin",
  "/customer",
  "/tasker",
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Early return for public routes - avoid unnecessary processing
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Run intl middleware first
  const intlResponse = intlMiddleware(request);

  // If next-intl wants to redirect, respect that immediately
  if (intlResponse && intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // Extract locale info for auth checks
  const { locale, pathname: cleanPathname } = getLocaleInfo(request);

  // Only run auth checks for routes that actually need them
  const needsAuthCheck = PROTECTED_ROUTES.some((route) =>
    cleanPathname.startsWith(route)
  );

  if (!needsAuthCheck) {
    return intlResponse || NextResponse.next();
  }

  // Run Supabase auth only when needed
  return await updateSession(request, intlResponse, {
    locale,
    pathname: cleanPathname,
    protectedRoutes: PROTECTED_ROUTES,
  });
}

// Helper function to extract locale and clean pathname
function getLocaleInfo(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const locale =
    routing.locales.find(
      (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`
    ) || routing.defaultLocale;

  const cleanPathname = pathname.startsWith(`/${locale}`)
    ? pathname.slice(`/${locale}`.length) || "/"
    : pathname;

  return { locale, pathname: cleanPathname };
}

export const config = {
  matcher: [
    // More specific matcher to avoid processing static files
    "/((?!api/webhook|api/health|_next/static|_next/image|_vercel|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
