import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Helper functions for authentication and session management.
 * Used by src/proxy.ts for route protection and role-based access control.
 * 
 * Options for authentication helper
 */
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

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"
    );
    // Return response without auth if env vars are missing
    return supabaseResponse;
  }

  // Create Supabase client with cookie handling for Next.js
  // Using the same pattern as server.ts but adapted for NextRequest/NextResponse
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        // Return all cookies from the request
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Update cookies in the request object (for internal use)
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        
        // Create a new response with updated cookies
        supabaseResponse = NextResponse.next({ request });
        
        // Set all cookies in the response with their options
        // The options type is compatible with Next.js cookie options
        cookiesToSet.forEach(({ name, value, options }) => {
          if (options) {
            // Ensure sameSite is a valid string type (not boolean)
            const cookieOptions: {
              domain?: string;
              expires?: Date;
              httpOnly?: boolean;
              maxAge?: number;
              path?: string;
              sameSite?: "strict" | "lax" | "none";
              secure?: boolean;
            } = {
              ...options,
              // Ensure sameSite is always a valid string type
              sameSite: typeof options.sameSite === "string" 
                ? options.sameSite 
                : options.sameSite === false 
                  ? "none" 
                  : "lax",
            };
            supabaseResponse.cookies.set(name, value, cookieOptions);
          } else {
            supabaseResponse.cookies.set(name, value);
          }
        });
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
      console.error("Auth error:", error);
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

    // Role-based access control: Verify user has access to the requested route
    if (user && isProtectedRoute) {
      // Check if route is role-specific
      const isCustomerRoute = pathname.startsWith("/customer/");
      const isTaskerRoute = pathname.startsWith("/tasker/");

      if (isCustomerRoute || isTaskerRoute) {
        // Fetch user role from database
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError || !userProfile) {
          console.error("Error fetching user role:", profileError);
          // If we can't verify role, redirect to login for security
          const loginUrl = locale
            ? new URL(`/${locale}/login`, request.url)
            : new URL("/login", request.url);
          return NextResponse.redirect(loginUrl);
        }

        const userRole = userProfile.role;

        // Check role-based access
        if (isCustomerRoute && userRole !== "customer" && userRole !== "both") {
          // Customer route but user is not customer or both
          const dashboardUrl = locale
            ? new URL(`/${locale}/tasker/dashboard`, request.url)
            : new URL("/tasker/dashboard", request.url);
          return NextResponse.redirect(dashboardUrl);
        }

        if (isTaskerRoute && userRole !== "tasker" && userRole !== "both") {
          // Tasker route but user is not tasker or both
          const dashboardUrl = locale
            ? new URL(`/${locale}/customer/dashboard`, request.url)
            : new URL("/customer/dashboard", request.url);
          return NextResponse.redirect(dashboardUrl);
        }
      }
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

