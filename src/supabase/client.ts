import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

export async function getUserRole() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    console.warn("Error fetching user role:", error);
    return null;
  }

  return data?.role;
}
