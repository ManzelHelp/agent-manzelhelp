import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { createClient } from "@/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Extract locale from the URL path (e.g., /de/confirm or /en/confirm)
  const pathname = request.nextUrl.pathname;
  const locale = pathname.split("/")[1] || "en"; // fallback to 'en' if no locale found

  // Clean up the redirect URL by removing auth flow parameters
  const redirectTo = new URL(request.url);
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");

  if (token_hash && type) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error && data.session && data.user) {
      try {
        // Update user's email_verified status in the database
        const { error: updateError } = await supabase
          .from("users")
          .update({
            email_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.user.id);

        if (updateError) {
          console.error(
            "Failed to update email verification status:",
            updateError
          );
          // Don't fail the entire process for this, but log it
        }

        // User is now authenticated, get their profile data
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (!profileError && profile) {
          // Redirect to a client component that will handle Zustand store update
          // and then redirect to the appropriate dashboard
          redirectTo.pathname = `/${locale}/confirm-success`;
          redirectTo.searchParams.set("userRole", profile.role || "customer");
          redirectTo.searchParams.delete("next");

          return Response.redirect(redirectTo.toString());
        } else {
          // Profile fetch failed but user is authenticated
          // Redirect to a generic dashboard
          redirectTo.pathname = `/${locale}/customer/dashboard`;
          redirectTo.searchParams.delete("next");

          return Response.redirect(redirectTo.toString());
        }
      } catch (dbError) {
        console.error("Database operation failed:", dbError);
        // Still redirect to success since auth worked
        redirectTo.pathname = `/${locale}/customer/dashboard`;
        redirectTo.searchParams.delete("next");

        return Response.redirect(redirectTo.toString());
      }
    }
  }

  // Verification failed - redirect to error page with locale
  redirectTo.pathname = `/${locale}/error`;
  redirectTo.searchParams.delete("next");

  return Response.redirect(redirectTo.toString());
}
