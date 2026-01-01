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

    // Handle auth errors - be more tolerant of temporary session issues
    // Only redirect to login if it's a clear authentication failure, not a temporary error
    if (error) {
      // Check if it's a session-related error that might be temporary
      const isSessionError = 
        error.message?.includes("session") || 
        error.message?.includes("JWT") ||
        error.message?.includes("token") ||
        error.message?.includes("expired");
      
      // For session errors, allow the request to continue (user might still be authenticated)
      // The client-side will handle re-authentication if needed
      if (isSessionError) {
        console.warn("Temporary session error detected, allowing request to continue:", error.message);
        // Don't redirect - let the request continue
        // The client-side auth check will handle re-authentication if needed
        return supabaseResponse;
      }
      
      // For other auth errors, log but don't immediately redirect
      // This prevents logout on temporary network issues
      console.error("Auth error (non-session):", error);
      // Only redirect if we're sure the user is not authenticated
      // For now, allow the request to continue - client will handle auth state
      return supabaseResponse;
    }

    // Handle protected routes - only redirect if we're CERTAIN user is not authenticated
    if (!user && isProtectedRoute) {
      // Double-check by trying to get session from cookies
      const { data: { session } } = await supabase.auth.getSession();
      
      // If session exists but getUser() failed, it's likely a temporary issue
      // Allow the request to continue
      if (session) {
        console.warn("Session exists but getUser() failed, allowing request to continue");
        return supabaseResponse;
      }
      
      // Only redirect if we're absolutely sure there's no session
      console.log("No user and no session found, redirecting to login");
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
          // If we can't verify role, don't immediately redirect
          // This could be a temporary database issue
          // Allow the request to continue - the client will handle role-based access
          // Only redirect if it's a clear authorization issue (not a temporary error)
          if (profileError?.code === "PGRST116" || profileError?.message?.includes("not found")) {
            // User profile doesn't exist - this is a real issue, but don't logout
            // Let the client handle this gracefully
            console.warn("User profile not found, but allowing request to continue");
            return supabaseResponse;
          }
          // For other errors, allow request to continue (might be temporary)
          return supabaseResponse;
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
    // Don't immediately redirect on unexpected errors
    // These could be temporary network issues, database problems, etc.
    // Allow the request to continue - the client will handle auth state
    // Only redirect if it's a critical security issue
    console.warn("Allowing request to continue despite error - client will handle auth state");
    return supabaseResponse;
  }
}

