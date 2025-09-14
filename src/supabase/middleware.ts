import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

interface AuthOptions {
  locale: string;
  pathname: string;
  protectedRoutes: string[];
}

export async function updateSession(
  request: NextRequest,
  response?: NextResponse,
  options?: AuthOptions
) {
  let supabaseResponse = response || NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

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
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    // Handle protected routes
    if (!user && isProtectedRoute) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Unexpected auth error:", error);
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }
}
