"use server";

import { handleError } from "@/lib/utils";
import { createClient } from "@/supabase/server";
import { headers } from "next/headers";

export const loginAction = async (email: string, password: string) => {
  try {
    const { auth } = await createClient();

    const { error } = await auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const logOutAction = async () => {
  try {
    const { auth } = await createClient();

    const { error } = await auth.signOut();
    if (error) throw error;

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const signUpAction = async (
  email: string,
  password: string,
  userRole: string,
  locale: string = "en"
) => {
  try {
    const supabase = await createClient();
    const headersList = await headers();

    // Get the origin from headers or use environment variable
    const origin =
      headersList.get("origin") ||
      headersList.get("x-forwarded-host") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    // Ensure origin has protocol
    const baseUrl = origin.startsWith("http") ? origin : `https://${origin}`;

    // Construct the confirmation URL with proper locale
    const emailRedirectTo = `${baseUrl}/${locale}/confirm`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          role: userRole,
        },
      },
    });
    if (error) throw error;

    const userId = data.user?.id;
    if (!userId) throw new Error("Error signing up");

    const { error: dbError } = await supabase.from("users").insert([
      {
        id: userId,
        email,
        role: userRole,
        email_verified: false, // Will be updated to true after email confirmation
      },
    ]);
    if (dbError) throw dbError;

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

// New server action to get user profile after authentication
export const getUserProfileAction = async () => {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Fetch user profile from the users table
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    return { user: profile, errorMessage: null };
  } catch (error) {
    return { user: null, ...handleError(error) };
  }
};
