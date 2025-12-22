import { createServerClient } from "@supabase/ssr";
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
