import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
