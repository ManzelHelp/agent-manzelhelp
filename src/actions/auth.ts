"use server";

import { handleError } from "@/lib/utils";
import { createClient, createServiceRoleClient } from "@/supabase/server";
import { headers } from "next/headers";
import { signupSchema, loginSchema } from "@/lib/schemas/auth";

/**
 * Action de connexion
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
 * Action d'inscription
 */
export const signUpAction = async (email: string, password: string, userRole: string) => {
  try {
    const validation = signupSchema.safeParse({ email, password, userRole });
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const supabase = await createClient();
    
    // Vérifier si l'email existe déjà dans auth.users
    // Note: Supabase ne permet pas de vérifier directement auth.users depuis le client
    // Mais on peut vérifier dans la table users de notre base de données
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();
    
    if (existingUser) {
      return { 
        success: false, 
        errorMessage: "Cet email est déjà utilisé",
        user: null 
      };
    }
    
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

    const emailRedirectTo = `${origin}/${locale}/verify-otp?email=${encodeURIComponent(email.toLowerCase().trim())}&userRole=${userRole}`;
    const normalizedRole = userRole === "tasker" ? "tasker" : "customer";

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        emailRedirectTo,
        data: { 
          userRole: normalizedRole, 
          role: normalizedRole,
          locale: locale,
        },
      },
    });
    
    if (error) {
      // Vérifier les codes d'erreur spécifiques de Supabase
      if (error.message?.includes("User already registered") || 
          error.message?.includes("already registered") ||
          error.message?.includes("email address is already") ||
          error.code === "signup_disabled" ||
          error.status === 400) {
        // Vérifier à nouveau si l'utilisateur existe (au cas où il aurait été créé entre-temps)
        const { data: checkUser } = await supabase
          .from("users")
          .select("id, email")
          .eq("email", email.toLowerCase().trim())
          .maybeSingle();
        
        if (checkUser) {
          return { 
            success: false, 
            errorMessage: "Cet email est déjà utilisé",
            user: null 
          };
        }
      }
      throw error;
    }
    
    // Vérifier si l'utilisateur a vraiment été créé
    // Si la confirmation d'email est activée, Supabase peut retourner un user fictif
    // même si l'email existe déjà (pour des raisons de sécurité)
    if (data?.user) {
      // Si l'utilisateur existe mais n'a pas d'email confirmé, vérifier s'il existe déjà dans la DB
      if (!data.user.email_confirmed_at) {
        const { data: checkUser } = await supabase
          .from("users")
          .select("id, email")
          .eq("email", email.toLowerCase().trim())
          .maybeSingle();
        
        if (checkUser && checkUser.id !== data.user.id) {
          return { 
            success: false, 
            errorMessage: "Cet email est déjà utilisé",
            user: null 
          };
        }
      }
    }
    
    return { success: true, errorMessage: null, user: null };
  } catch (error) {
    return { success: false, ...handleError(error), user: null };
  }
};

/**
 * Verify OTP code for email confirmation
 */
export const verifyOTPAction = async (email: string, token: string) => {
  try {
    const supabase = await createClient();
    
    // Verify OTP with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.toLowerCase().trim(),
      token: token.trim(),
      type: 'signup',
    });

    if (error) {
      // Determine error type for UI handling
      let errorType: 'invalid' | 'expired' | 'rate_limit' | 'other' = 'other';
      
      if (error.message?.includes('expired') || error.message?.includes('expir')) {
        errorType = 'expired';
      } else if (error.message?.includes('invalid') || error.message?.includes('Invalid')) {
        errorType = 'invalid';
      } else if (error.message?.includes('rate') || error.message?.includes('limit')) {
        errorType = 'rate_limit';
      }

      return {
        success: false,
        errorMessage: error.message,
        errorType,
        user: null,
      };
    }

    if (!data.session || !data.user) {
      return {
        success: false,
        errorMessage: "Verification failed. Please try again.",
        errorType: 'other' as const,
        user: null,
      };
    }

    // Get user role from metadata
    const userRole = data.user.user_metadata?.userRole || data.user.user_metadata?.role || 'customer';
    const locale = data.user.user_metadata?.locale || 'fr';

    // Create user record in database if it doesn't exist
    const serviceClient = createServiceRoleClient();
    if (serviceClient) {
      const { data: existingUser } = await serviceClient
        .from("users")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!existingUser) {
        const validRole: "customer" | "tasker" = userRole === "tasker" ? "tasker" : "customer";
        
        const { error: insertError } = await serviceClient.from("users").insert([
          {
            id: data.user.id,
            email: data.user.email,
            role: validRole,
            email_verified: true,
            is_active: true,
            preferred_language: locale,
            verification_status: "pending",
            wallet_balance: 0,
          },
        ]);

        if (insertError) {
          console.error("Failed to create user record:", insertError);
          return {
            success: false,
            errorMessage: "Account verification succeeded but profile creation failed. Please contact support.",
            errorType: 'other' as const,
            user: null,
          };
        }

        // Create related records (user_stats)
        await createUserRecordsAction(data.user.id);
      }
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    return {
      success: true,
      errorMessage: null,
      errorType: null,
      user: profile ? JSON.parse(JSON.stringify(profile)) : null,
      userRole: profile?.role || userRole,
    };
  } catch (error) {
    console.error("Error in verifyOTPAction:", error);
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : "An unexpected error occurred",
      errorType: 'other' as const,
      user: null,
    };
  }
};

/**
 * Resend OTP code for email confirmation
 */
export const resendOTPAction = async (email: string) => {
  try {
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    // Get locale from accept-language header
    const acceptLanguage = headersList.get("accept-language");
    let locale = "fr";
    
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();
      if (preferredLocale && ["fr", "en", "de", "ar"].includes(preferredLocale)) {
        locale = preferredLocale;
      }
    }

    // Resend OTP
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: `${origin}/${locale}/verify-otp?email=${encodeURIComponent(email.toLowerCase().trim())}`,
      },
    });

    if (error) {
      let errorType: 'rate_limit' | 'other' = 'other';
      
      if (error.message?.includes('rate') || error.message?.includes('limit') || error.message?.includes('too many')) {
        errorType = 'rate_limit';
      }

      return {
        success: false,
        errorMessage: error.message,
        errorType,
      };
    }

    return {
      success: true,
      errorMessage: null,
      errorType: null,
    };
  } catch (error) {
    console.error("Error in resendOTPAction:", error);
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : "An unexpected error occurred",
      errorType: 'other' as const,
    };
  }
};

/**
 * Déconnexion
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
 * Récupération du profil utilisateur
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
 * Vérification si le Tasker a complété son profil (Celle qui manquait !)
 */
export const hasTaskerCompletedProfileAction = async (): Promise<{ hasCompleted: boolean; errorMessage?: string }> => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { hasCompleted: false, errorMessage: "User not authenticated" };

    const { data, error } = await supabase
      .from("tasker_profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return { hasCompleted: !!data };
  } catch (error) {
    return { hasCompleted: false, ...handleError(error) };
  }
};

/**
 * Création profil Tasker
 */
export const createTaskerProfileAction = async (formData: any) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required");

    const { error: profileError } = await supabase
      .from("tasker_profiles")
      .insert({
        id: user.id,
        experience_level: formData.experience_level,
        bio: formData.bio.trim(),
        service_radius_km: formData.service_radius_km,
        is_available: formData.is_available,
        operation_hours: formData.operation_hours,
        identity_document_url: formData.identity_document_url,
      });

    if (profileError) throw profileError;
    await supabase.from("users").update({ role: "tasker", phone: formData.phone }).eq("id", user.id);

    return { success: true, errorMessage: null };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
};

// --- AUTRES ACTIONS DE MOT DE PASSE ---

export const updatePasswordAction = async (password: string) => {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return { success: true, errorMessage: null };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
};

export const updateEmailAction = async (newEmail: string, currentPassword: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.email) {
      return { success: false, errorMessage: "User not found" };
    }

    // Verify current password first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      return { success: false, errorMessage: "Current password is incorrect" };
    }

    // Update email (Supabase will send verification email automatically)
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) throw error;
    
    return { success: true, errorMessage: null };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
};

export const verifyCurrentPasswordAction = async (password: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.email) {
      return { success: false, errorMessage: "User not found" };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password,
    });

    if (error) {
      return { success: false, errorMessage: "Current password is incorrect" };
    }

    return { success: true, errorMessage: null };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
};

export const resetPasswordAction = async (email: string) => {
  try {
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/fr/reset-password` });
    if (error) throw error;
    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Create related records for a new user (user_stats)
 * This is called after user creation to initialize statistics
 */
export const createUserRecordsAction = async (userId: string) => {
  try {
    const supabase = await createClient();
    
    // Create user_stats record with default values
    // All fields have defaults in the database schema
    const { error } = await supabase
      .from("user_stats")
      .upsert(
        { id: userId },
        { onConflict: "id", ignoreDuplicates: true }
      );
    
    if (error) {
      console.error("Failed to create user_stats record:", error);
      // Don't throw - this is a non-critical operation
      return { success: false, errorMessage: error.message };
    }
    
    return { success: true, errorMessage: null };
  } catch (error) {
    console.error("Error in createUserRecordsAction:", error);
    return { success: false, ...handleError(error) };
  }
};