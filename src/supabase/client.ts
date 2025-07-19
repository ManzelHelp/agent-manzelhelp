import { createBrowserClient } from "@supabase/ssr";
import { User } from "@supabase/supabase-js";

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

export async function getProfile(user?: User | null) {
  const supabase = createClient();

  if (!user) {
    user = await getUser();
    user = (await supabase.auth.getUser()).data.user;

    if (!user) return null;
  }
  try {
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
