import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getUser() {
  try {
    const supabase = createClient();
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

export async function getProfile() {
  try {
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return null;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.warn("Error fetching user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.warn("Error in getProfile:", error);
    return null;
  }
}
