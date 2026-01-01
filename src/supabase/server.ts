import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY in your .env.local file."
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
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
  });
}

/**
 * Creates a Supabase client with service role key (bypasses RLS)
 * Use this ONLY for server-side operations that need to bypass RLS,
 * such as updating wallet balance or creating users during email confirmation.
 * 
 * @returns Supabase client with service role, or null if service role key is not available
 * @throws Error if Supabase URL is missing
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing Supabase URL. Please set NEXT_PUBLIC_SUPABASE_URL in your .env.local file."
    );
  }

  if (!serviceRoleKey) {
    console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY is not set. Service role client will not be available.");
    console.warn("⚠️ Wallet updates may fail if RLS policies don't allow regular users to update wallet_balance.");
    console.warn("⚠️ To fix: Get your service role key from Supabase Dashboard > Settings > API > service_role key");
    return null;
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// export async function getUser() {
//   try {
//     const supabase = await createClient();
//     const userObj = await supabase.auth.getUser();

//     if (userObj.error) {
//       return null;
//     }
//     return userObj.data.user;
//   } catch (error) {
//     console.warn("Error getting user:", error);
//     return null;
//   }
// }

// export async function getProfile(user?: User | null) {
//   if (!user) {
//     user = await getUser();
//     if (!user) return null;
//   }
//   try {
//     const supabase = await createClient();

//     const { data, error } = await supabase
//       .from("users")
//       .select("*")
//       .eq("id", user.id)
//       .single();

//     if (error) {
//       console.warn("Error fetching user profile:", error);
//       return null;
//     }

//     return data;
//   } catch (error) {
//     console.warn("Error in getProfile:", error);
//     return null;
//   }
// }
