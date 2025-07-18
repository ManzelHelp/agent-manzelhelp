import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import type { User as DBUser } from "@/types/supabase";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// Unified function to get the authenticated user and their profile from the users table
export async function getUserWithProfile(): Promise<
  (SupabaseAuthUser & { profile: DBUser | null }) | null
> {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return null;
    }
    // Fetch user profile from your own users table
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();
    if (profileError) {
      return { ...authData.user, profile: null };
    }
    return { ...authData.user, profile: userProfile };
  } catch (error) {
    console.warn("Error getting user with profile:", error);
    return null;
  }
}
