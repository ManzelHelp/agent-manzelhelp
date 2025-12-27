import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import LogoutButton from "./LogoutButton";

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
      .maybeSingle();

    // If profile not found by ID, try by email (handles ID mismatch)
    let finalProfile = profile;
    if (profileError || !profile) {
      if (user.email) {
        const { data: profileByEmail } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email)
          .maybeSingle();
        finalProfile = profileByEmail;
      }
    }

    // Redirect based on user role
    if (finalProfile) {
      const role = finalProfile.role;
      if (role === "tasker") {
        redirect(`/${locale}/tasker/dashboard`);
      } else if (role === "customer") {
        redirect(`/${locale}/customer/dashboard`);
      }
    }

    // If no profile found at all, show error page instead of redirecting
    // This prevents the redirect loop and shows a clear error message
    console.error("[AuthenticatedDashboardPage] User profile not found:", {
      userId: user.id,
      email: user.email,
      profileError: profileError?.message,
    });
    
    // Return error page component instead of redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Profil utilisateur introuvable
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Aucun profil n'a été trouvé dans la base de données pour l'email :{" "}
            <strong className="text-gray-900 dark:text-white">
              {user.email || "N/A"}
            </strong>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            ID utilisateur authentifié : {user.id}
          </p>
          <div className="space-y-3">
            <a
              href={`/${locale}/diagnostic`}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Diagnostic du compte
            </a>
            <LogoutButton locale={locale} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("[AuthenticatedDashboardPage] Error:", error);
    // On any error, redirect to login to break the loop
    redirect(`/${locale}/login`);
  }
}

