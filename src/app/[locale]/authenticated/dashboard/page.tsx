import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";

/**
 * Fallback route for /authenticated/dashboard
 * This route handles legacy redirects or incorrect URLs and redirects to the correct dashboard
 * based on the user's role.
 * 
 * IMPORTANT: Uses server-side redirect to prevent client-side redirect loops.
 * This is a server component that redirects immediately without rendering.
 * 
 * Uses direct Supabase query to avoid potential loops in getUserProfileAction.
 */
export default async function AuthenticatedDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      redirect(`/${locale}/login`);
    }

    // Fetch user profile directly (avoid getUserProfileAction to prevent loops)
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    // Redirect based on user role
    if (!profileError && profile) {
      const role = profile.role;
      if (role === "tasker") {
        redirect(`/${locale}/tasker/dashboard`);
      } else if (role === "customer") {
        redirect(`/${locale}/customer/dashboard`);
      }
    }

    // Fallback: redirect to login if no profile or unknown role
    redirect(`/${locale}/login`);
  } catch (error) {
    console.error("[AuthenticatedDashboardPage] Error:", error);
    // On any error, redirect to login to break the loop
    redirect(`/${locale}/login`);
  }
}

