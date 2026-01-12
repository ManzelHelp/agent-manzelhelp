"use server";

import { handleError } from "@/lib/utils";
import { createClient } from "@/supabase/server";
import { headers } from "next/headers";
import { signupSchema, loginSchema } from "@/lib/schemas/auth";

/**
 * LOGIN
 */
export const loginAction = async (email: string, password: string) => {
  try {
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const { auth } = await createClient();
    const { error } = await auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: { user } } = await auth.getUser();
    if (user) {
      const supabase = await createClient();
      await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", user.id);
    }

    return { success: true, errorMessage: null, user: user ? JSON.parse(JSON.stringify(user)) : null };
  } catch (error) {
    return { success: false, ...handleError(error), user: null };
  }
};

/**
 * SIGN UP
 */
export const signUpAction = async (email: string, password: string, userRole: string) => {
  try {
    const validation = signupSchema.safeParse({ email, password, userRole });
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const acceptLanguage = headersList.get("accept-language");
    let locale = "fr";
    
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();
      if (preferredLocale && ["fr", "en", "de", "ar"].includes(preferredLocale)) {
        locale = preferredLocale;
      }
    }

    const emailRedirectTo = `${origin}/${locale}/confirm?userRole=${userRole}`;
    const normalizedRole = userRole === "tasker" ? "tasker" : "customer";

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: { userRole: normalizedRole, role: normalizedRole },
      },
    });
    
    if (error) throw error;
    return { success: true, errorMessage: null, user: null };
  } catch (error) {
    return { success: false, ...handleError(error), user: null };
  }
};

/**
 * LOGOUT
 */
export const logOutAction = async () => {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) throw error;
    return { success: true, errorMessage: null, user: null };
  } catch (error) {
    return { success: false, ...handleError(error), user: null };
  }
};

/**
 * GET PROFILE
 */
export const getUserProfileAction = async () => {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, user: null, errorMessage: "No active session." };
    }

    let profile = null;
    let retries = 3;
    while (retries > 0) {
      const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single();
      if (!error) { profile = data; break; }
      if (retries > 1) await new Promise((res) => setTimeout(res, 500));
      retries--;
    }

    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from("users")
        .insert([{ id: user.id, email: user.email || "", role: (user.user_metadata?.role as any) || "customer", email_verified: !!user.email_confirmed_at, is_active: true, preferred_language: "fr" }])
        .select().single();
      if (createError) throw createError;
      profile = newProfile;
    }

    return { success: true, user: JSON.parse(JSON.stringify(profile)), errorMessage: null };
  } catch (error) {
    return { success: false, user: null, ...handleError(error) };
  }
};

/**
 * VERIFY PASSWORD RESET CODE (LA FONCTION QUI MANQUAIT)
 */
export const verifyPasswordResetCodeAction = async (code?: string, token_hash?: string, type?: string) => {
  try {
    const supabase = await createClient();
    let data: any;
    let error: any;

    if (code) {
      const result = await supabase.auth.exchangeCodeForSession(code);
      data = result.data;
      error = result.error;
    } else if (token_hash) {
      const result = await supabase.auth.verifyOtp({ token_hash, type: "recovery" });
      data = result.data;
      error = result.error;
    } else {
      return { success: false, errorMessage: "Missing reset code" };
    }

    if (error) throw error;
    if (!data.session) return { success: false, errorMessage: "Failed to create session" };

    return { success: true, errorMessage: null };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
};

/**
 * UPDATE PASSWORD
 */
export const updatePasswordAction = async (password: string) => {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * RESET PASSWORD (SEND EMAIL)
 */
export const resetPasswordAction = async (email: string) => {
  try {
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const locale = headersList.get("x-locale") || "fr";
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/${locale}/reset-password`,
    });
    if (error) throw error;
    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * TASKER PROFILE HELPERS
 */
export const hasTaskerCompletedProfileAction = async (): Promise<{ hasCompleted: boolean; errorMessage?: string }> => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { hasCompleted: false };
    const { data, error } = await supabase.from("tasker_profiles").select("id").eq("id", user.id).single();
    if (error && error.code !== "PGRST116") throw error;
    return { hasCompleted: !!data };
  } catch (error) {
    return { hasCompleted: false, ...handleError(error) };
  }
};

export const createTaskerProfileAction = async (formData: any) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Auth required");
    const { error: profileError } = await supabase.from("tasker_profiles").insert({
      id: user.id, ...formData
    });
    if (profileError) throw profileError;
    await supabase.from("users").update({ role: "tasker", phone: formData.phone }).eq("id", user.id);
    return { success: true };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
};

/**
 * CREATE INITIAL RECORDS
 */
export const createUserRecordsAction = async (userId: string) => {
  try {
    const supabase = await createClient();
    await supabase.from("user_stats").insert([{
      id: userId, tasker_rating: 0, total_reviews: 0, completed_jobs: 0, total_earnings: 0, 
      response_time_hours: 0, cancellation_rate: 0, jobs_posted: 0, total_spent: 0,
    }]);
    return { errorMessage: null };
  } catch (error) {
    return { errorMessage: "Failed to create user records" };
  }
};