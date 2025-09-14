"use server";

import { handleError } from "@/lib/utils";
import { createClient } from "@/supabase/server";
import { headers } from "next/headers";

export const loginAction = async (email: string, password: string) => {
  try {
    // Enhanced server-side validation
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please enter a valid email address");
    }

    const { auth } = await createClient();

    const { error } = await auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // Update last_login timestamp
    const {
      data: { user },
    } = await auth.getUser();
    if (user) {
      const supabase = await createClient();
      await supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", user.id);
    }

    return {
      success: true,
      errorMessage: null,
      user: user,
    };
  } catch (error) {
    return {
      success: false,
      ...handleError(error),
      user: null,
    };
  }
};

export const logOutAction = async () => {
  try {
    const { auth } = await createClient();

    const { error } = await auth.signOut();
    if (error) throw error;

    return {
      success: true,
      errorMessage: null,
      user: null,
    };
  } catch (error) {
    return {
      success: false,
      ...handleError(error),
      user: null,
    };
  }
};

export const signUpAction = async (
  email: string,
  password: string,
  userRole: string
) => {
  try {
    const supabase = await createClient();
    const headersList = await headers();

    // Enhanced server-side validation
    if (!email || !password || !userRole) {
      throw new Error("All fields are required");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please enter a valid email address");
    }

    // Enhanced password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error(
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
      );
    }

    // Validate user role against schema
    const validRoles = ["customer", "tasker", "support", "admin"];
    if (!validRoles.includes(userRole)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    // Get the origin from headers or use environment variable
    const origin =
      headersList.get("origin") ||
      headersList.get("x-forwarded-host") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    // Ensure origin has protocol
    const baseUrl = origin.startsWith("http") ? origin : `https://${origin}`;

    // Construct the confirmation URL with role - next-intl middleware will handle locale
    const emailRedirectTo = `${baseUrl}/confirm?userRole=${userRole}`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
      },
    });
    if (error) throw error;

    return {
      success: true,
      errorMessage: null,
      user: null,
    };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      success: false,
      ...handleError(error),
      user: null,
    };
  }
};

export const resetPasswordAction = async (email: string) => {
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

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/reset-password`,
    });
    if (error) throw error;

    return { errorMessage: null };
  } catch (error) {
    console.error("Password reset error:", error);
    return handleError(error);
  }
};

export const updatePasswordAction = async (password: string) => {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: password,
    });
    if (error) throw error;

    return { errorMessage: null };
  } catch (error) {
    console.error("Password update error:", error);
    return handleError(error);
  }
};

// Server action to get user profile after authentication
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

    return {
      success: true,
      user: profile,
      errorMessage: null,
    };
  } catch (error) {
    return {
      success: false,
      user: null,
      ...handleError(error),
    };
  }
};

// Action to create initial user records after email confirmation
export const createUserRecordsAction = async (
  userId: string,
  userRole: string
) => {
  try {
    const supabase = await createClient();

    // Create user_stats record
    const { error: statsError } = await supabase.from("user_stats").insert([
      {
        id: userId,
        tasker_rating: 0,
        total_reviews: 0,
        completed_jobs: 0,
        total_earnings: 0,
        response_time_hours: 0,
        cancellation_rate: 0,
        jobs_posted: 0,
        total_spent: 0,
      },
    ]);

    if (statsError) {
      console.error("Failed to create user_stats:", statsError);
    }

    // If user is a tasker, create tasker_profile
    if (userRole === "tasker") {
      const { error: profileError } = await supabase
        .from("tasker_profiles")
        .insert([
          {
            id: userId,
            experience_level: "beginner",
            service_radius_km: 50,
            is_available: true,
            verification_status: "unverified",
          },
        ]);

      if (profileError) {
        console.error("Failed to create tasker_profile:", profileError);
      }
    }

    return { errorMessage: null };
  } catch (error) {
    console.error("Error creating user records:", error);
    return { errorMessage: "Failed to create user records" };
  }
};
