import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { createClient } from "@/supabase/server";
import { getLocale } from "next-intl/server";
import { createUserRecordsAction } from "@/actions/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const userRole = searchParams.get("userRole");

  // Use next-intl's built-in locale detection
  const locale = await getLocale();

  // Clean up the redirect URL by removing auth flow parameters
  const redirectTo = new URL(request.url);
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("userRole");

  if (token_hash && type) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error && data.session && data.user) {
      try {
        // Create the user record in the database with proper schema
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: data.user.id,
            email: data.user.email,
            role: userRole as "customer" | "tasker",
            email_verified: true,
            is_active: true,
            preferred_language: locale,
            verification_status: "unverified", // Default status
            wallet_balance: 0, // Required field with default
          },
        ]);

        if (insertError) {
          console.error("Failed to create user record:", insertError);
          // If user creation fails, redirect to error page
          redirectTo.pathname = `/${locale}/error`;
          return Response.redirect(redirectTo.toString());
        }

        // Create related records (user_stats for all users)
        await createUserRecordsAction(data.user.id);

        // User is now authenticated and created, get their profile data
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (!profileError && profile) {
          // Redirect to a client component that will handle Zustand store update
          // and then redirect to the appropriate dashboard
          redirectTo.pathname = `/${locale}/confirm-success`;
          return Response.redirect(redirectTo.toString());
        } else {
          // Profile fetch failed but user is authenticated
          // Redirect to a generic dashboard
          redirectTo.pathname = `/${locale}/customer/dashboard`;
          return Response.redirect(redirectTo.toString());
        }
      } catch (dbError) {
        console.error("Database operation failed:", dbError);
        // Database operation failed - redirect to error page
        redirectTo.pathname = `/${locale}/error`;
        return Response.redirect(redirectTo.toString());
      }
    }
  }

  // Verification failed - redirect to error page with locale
  redirectTo.pathname = `/${locale}/error`;
  return Response.redirect(redirectTo.toString());
}
