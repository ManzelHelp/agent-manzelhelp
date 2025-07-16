import { prisma } from "@/db/prisma";
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

export async function getUser() {
  try {
    const supabase = await createClient();
    const userObj = await supabase.auth.getUser();

    if (userObj.error) {
      return null;
    }
    return userObj.data.user;
  } catch (error) {
    console.warn("Error getting user:", error);
    return null;
  }
}

// export async function userIsHelper() {
//   const user = await getUser(); // uses Supabase Auth
//   if (!user) return null;

//   const dbUser = await prisma.user.findUnique({
//     where: { id: user.id },
//     select: { role: true },
//   });

//   return dbUser?.role === "helper";
// }
