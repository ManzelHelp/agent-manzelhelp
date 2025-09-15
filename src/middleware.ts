import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { updateSession } from "@/supabase/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Static/system routes that should skip all processing for performance
const SYSTEM_ROUTES = [
  "/_next",
  "/_vercel",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/api/webhook",
  "/api/health",
];

// Routes that need auth checks
const PROTECTED_ROUTES = ["/customer/", "/tasker/"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Early return for system routes - skip all processing for performance
  if (SYSTEM_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Extract locale info for route checking
  const { locale, pathname: cleanPathname } = getLocaleInfo(request);

  // Run intl middleware first
  const intlResponse = intlMiddleware(request);

  // If next-intl wants to redirect, respect that immediately
  if (intlResponse && intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // Check if this is a protected route that needs auth
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    cleanPathname.startsWith(route)
  );

  // If not a protected route, just return the intl response
  if (!isProtectedRoute) {
    return intlResponse || NextResponse.next();
  }

  // Run Supabase auth only for protected routes
  try {
    return await updateSession(request, intlResponse, {
      locale,
      pathname: cleanPathname,
      protectedRoutes: PROTECTED_ROUTES,
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    // Fallback to login page on auth errors
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }
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
    // Skip all internal paths (_next, _vercel)
    "/((?!_next/static|_next/image|_vercel|favicon.ico).*)",
    // Skip all file extensions (images, fonts, etc.)
    "/((?!.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|eot)$).*)",
    // Include API routes we want to process
    "/api/((?!webhook|health).*)",
  ],
};
