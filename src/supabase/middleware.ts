import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

interface AuthOptions {
  locale: string;
  pathname: string;
  protectedRoutes: string[];
}

interface CookieToSet {
  name: string;
  value: string;
  options?: {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: "strict" | "lax" | "none";
    secure?: boolean;
  };
}

export async function updateSession(
  request: NextRequest,
  response?: NextResponse,
  options?: AuthOptions
) {
  let supabaseResponse = response || NextResponse.next({ request });

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Missing Supabase environment variables in middleware. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"
    );
    // Return response without auth if env vars are missing
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Performance optimization: only call getUser for auth-sensitive routes
  if (!options) {
    return supabaseResponse;
  }

  const { locale, pathname, protectedRoutes } = options;

  // Check if this route actually needs auth verification
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return supabaseResponse;
  }

  // Only call getUser() when we actually need to check auth status
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Handle auth errors
    if (error) {
      console.error("Auth error in middleware:", error);
      // Ensure locale is valid before redirecting
      const loginUrl = locale
        ? new URL(`/${locale}/login`, request.url)
        : new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Handle protected routes
    if (!user && isProtectedRoute) {
      // Ensure locale is valid before redirecting
      const loginUrl = locale
        ? new URL(`/${locale}/login`, request.url)
        : new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Unexpected auth error:", error);
    // Ensure locale is valid before redirecting
    const loginUrl = locale
      ? new URL(`/${locale}/login`, request.url)
      : new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}
