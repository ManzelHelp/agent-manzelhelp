import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { createClient, createServiceRoleClient } from "@/supabase/server";
import { getLocale } from "next-intl/server";
import { createUserRecordsAction } from "@/actions/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // Get userRole from query params first, then from user metadata as fallback
  let userRole = searchParams.get("userRole");
  
  // Log for debugging
  console.log("[Confirm Route] Query params:", {
    token_hash: !!token_hash,
    type,
    userRoleFromParams: userRole,
    allParams: Object.fromEntries(searchParams.entries()),
  });

  // Use next-intl's built-in locale detection
  const locale = await getLocale();

  // Clean up the redirect URL by removing auth flow parameters
  const redirectTo = new URL(request.url);
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("userRole");

  if (token_hash && type) {
    const supabase = await createClient();

    console.log("[Confirm Route] Verifying OTP:", { type, hasToken: !!token_hash });

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      console.error("[Confirm Route] OTP verification error:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });
    }

    if (!error && data.session && data.user) {
      console.log("[Confirm Route] OTP verified successfully, user ID:", data.user.id);
      
      // Get userRole from query params or user metadata
      // Supabase may not preserve query params in redirect, so check metadata as fallback
      const roleFromParams = searchParams.get("userRole");
      const roleFromMetadata = data.user.user_metadata?.userRole || data.user.user_metadata?.role;
      
      // IMPORTANT: If no role found, default to "customer" but log a warning
      let finalUserRole = roleFromParams || roleFromMetadata;
      
      if (!finalUserRole) {
        console.error("[Confirm Route] ⚠️ NO ROLE FOUND! Defaulting to customer. This should not happen!");
        console.error("[Confirm Route] Query params:", Object.fromEntries(searchParams.entries()));
        console.error("[Confirm Route] User metadata:", data.user.user_metadata);
        finalUserRole = "customer";
      }
      
      console.log("[Confirm Route] Role determination:", {
        fromParams: roleFromParams,
        fromMetadata: roleFromMetadata,
        userMetadata: data.user.user_metadata,
        final: finalUserRole,
      });
      
      try {
        // Check if user already exists
        const serviceClient = createServiceRoleClient();
        const { data: existingUser } = await serviceClient
          .from("users")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        // Validate userRole - must be "tasker" or "customer"
        // IMPORTANT: Only accept "tasker" or "customer", default to "customer" if invalid
        let validRole: "customer" | "tasker" = "customer";
        if (finalUserRole === "tasker") {
          validRole = "tasker";
        } else if (finalUserRole === "customer") {
          validRole = "customer";
        } else {
          console.error(`[Confirm Route] ⚠️ INVALID ROLE "${finalUserRole}", defaulting to "customer"`);
        }
        
        // Only create if user doesn't exist
        if (!existingUser) {
          console.log("[Confirm Route] ✅ Creating user with role:", validRole);
          
          if (finalUserRole !== validRole) {
            console.warn(
              `[Confirm Route] Role mismatch: received "${finalUserRole}", using "${validRole}"`
            );
          }
          
          // Use service role client to bypass RLS for user creation
          const { error: insertError } = await serviceClient.from("users").insert([
            {
              id: data.user.id,
              email: data.user.email,
              role: validRole as "customer" | "tasker",
              email_verified: true,
              is_active: true,
              preferred_language: locale,
              verification_status: "pending", // Default status
              wallet_balance: 0, // Required field with default
            },
          ]);

          if (insertError) {
            console.error("Failed to create user record:", insertError);
            // If user creation fails, redirect to error page with error details
            redirectTo.pathname = `/${locale}/error`;
            redirectTo.searchParams.set("error", "user_creation_failed");
            redirectTo.searchParams.set("message", insertError.message);
            return Response.redirect(redirectTo.toString());
          }

          // Create related records (user_stats for all users)
          await createUserRecordsAction(data.user.id);
        } else {
          // User already exists - check if role needs to be updated
          const { data: currentUser } = await serviceClient
            .from("users")
            .select("role")
            .eq("id", data.user.id)
            .single();
          
          if (currentUser && currentUser.role !== validRole) {
            console.log(
              `[Confirm Route] Updating existing user role from "${currentUser.role}" to "${validRole}"`
            );
            
            // Update role if it doesn't match
            const { error: updateError } = await serviceClient
              .from("users")
              .update({ role: validRole as "customer" | "tasker" })
              .eq("id", data.user.id);
            
            if (updateError) {
              console.error("Failed to update user role:", updateError);
            } else {
              console.log("[Confirm Route] User role updated successfully");
            }
          }
        }

        // User is now authenticated and created, get their profile data using regular client
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
        redirectTo.searchParams.set("error", "database_error");
        return Response.redirect(redirectTo.toString());
      }
    } else {
      // Verification failed - redirect to error page with error type
      console.error("[Confirm Route] Verification failed:", error);
      redirectTo.pathname = `/${locale}/error`;
      if (error) {
        console.error("[Confirm Route] Error details:", {
          message: error.message,
          status: error.status,
          name: error.name,
        });
        if (error.message.includes("expired") || error.message.includes("expir")) {
          redirectTo.searchParams.set("error", "confirmation_expired");
        } else if (
          error.message.includes("invalid") ||
          error.message.includes("already") ||
          error.message.includes("used")
        ) {
          redirectTo.searchParams.set("error", "confirmation_invalid");
        } else {
          redirectTo.searchParams.set("error", "confirmation_invalid");
          redirectTo.searchParams.set("message", error.message);
        }
      } else {
        redirectTo.searchParams.set("error", "confirmation_invalid");
      }
      return Response.redirect(redirectTo.toString());
    }
  }

  // No token or type - redirect to error page
  console.warn("[Confirm Route] Missing token_hash or type:", { token_hash: !!token_hash, type });
  redirectTo.pathname = `/${locale}/error`;
  redirectTo.searchParams.set("error", "confirmation_invalid");
  return Response.redirect(redirectTo.toString());
}
