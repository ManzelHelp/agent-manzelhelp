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

    // Use scope: 'global' to destroy all sessions and remove all cookies
    const { error } = await auth.signOut({ scope: 'global' });
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
    const validRoles = ["customer", "tasker"];
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

    // Get locale from Accept-Language header or use default
    const acceptLanguage = headersList.get("accept-language");
    const defaultLocale = "fr"; // Default locale for your app
    let locale = defaultLocale;
    
    if (acceptLanguage) {
      // Try to extract locale from Accept-Language header
      const preferredLocale = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();
      if (preferredLocale && ["fr", "en", "de"].includes(preferredLocale)) {
        locale = preferredLocale;
      }
    }

    // Construct the confirmation URL with locale and role
    // Supabase will append token_hash and type automatically
    const emailRedirectTo = `${baseUrl}/${locale}/confirm?userRole=${userRole}`;

    // Validate and normalize userRole
    const normalizedRole = userRole === "tasker" ? "tasker" : "customer";
    
    console.log("[signUpAction] Creating account with role:", normalizedRole, "Original:", userRole);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        // Store userRole in user metadata so we can retrieve it during confirmation
        // Store it in multiple places to ensure we can retrieve it
        data: {
          userRole: normalizedRole,
          role: normalizedRole, // Also store as "role" for compatibility
        },
      },
    });
    
    if (error) {
      console.error("[signUpAction] Sign up error:", error);
    } else {
      console.log("[signUpAction] ✅ Sign up successful, role stored in metadata:", normalizedRole);
    }
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

    // Get locale from headers or default to 'fr'
    const locale = headersList.get("x-locale") || "fr";
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/${locale}/reset-password`,
    });
    if (error) throw error;

    return { errorMessage: null };
  } catch (error) {
    console.error("Password reset error:", error);
    return handleError(error);
  }
};

/**
 * Verifies the password reset code and creates a session
 * This must be called before updatePasswordAction
 * 
 * For password reset, Supabase sends a `code` in the URL.
 * We use `exchangeCodeForSession` to exchange the code for a session.
 * 
 * Alternatively, Supabase can send `token_hash` + `type` for OTP verification.
 */
export const verifyPasswordResetCodeAction = async (
  code?: string,
  token_hash?: string,
  type?: string
) => {
  try {
    const supabase = await createClient();

    console.log("[verifyPasswordResetCodeAction] Parameters:", {
      hasCode: !!code,
      hasTokenHash: !!token_hash,
      type,
      codeLength: code?.length,
      tokenHashLength: token_hash?.length,
    });

    if (!code && !token_hash) {
      return {
        success: false,
        errorMessage: "Missing reset code",
      };
    }

    let data: any;
    let error: any;

    // For password reset, Supabase typically sends a `code` parameter
    // Use exchangeCodeForSession for code-based reset (recommended method)
    if (code) {
      console.log("[verifyPasswordResetCodeAction] Using exchangeCodeForSession with code");
      const { auth } = supabase;
      const result = await auth.exchangeCodeForSession(code);
      data = result.data;
      error = result.error;
      console.log("[verifyPasswordResetCodeAction] exchangeCodeForSession result:", {
        hasSession: !!data?.session,
        hasUser: !!data?.user,
        error: error?.message,
      });
    } 
    // If token_hash is provided, use verifyOtp (alternative method)
    else if (token_hash) {
      console.log("[verifyPasswordResetCodeAction] Using verifyOtp with token_hash");
      // Ensure type is "recovery" for password reset
      const otpType = "recovery" as const;
      const result = await supabase.auth.verifyOtp({
        token_hash,
        type: otpType,
      });
      data = result.data;
      error = result.error;
      console.log("[verifyPasswordResetCodeAction] verifyOtp result:", {
        hasSession: !!data?.session,
        hasUser: !!data?.user,
        error: error?.message,
      });
    } else {
      return {
        success: false,
        errorMessage: "Missing reset code or token",
      };
    }

    if (error) {
      console.error("Password reset code verification error:", error);
      return {
        success: false,
        errorMessage: error.message || "Invalid or expired reset link",
      };
    }

    if (!data.session) {
      return {
        success: false,
        errorMessage: "Failed to create session",
      };
    }

    return {
      success: true,
      errorMessage: null,
    };
  } catch (error) {
    console.error("Password reset code verification error:", error);
    return {
      success: false,
      errorMessage: "An error occurred while verifying the reset code",
    };
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
/**
 * Fetches the user profile from the database after authentication
 * This function is called after successful login to populate the user store
 * 
 * @returns Object with success status, user profile, and error message
 */
export const getUserProfileAction = async () => {
  try {
    const supabase = await createClient();

    // Get the authenticated user from Supabase Auth
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    
    // Check if user is authenticated
    // Handle missing session gracefully instead of throwing
    if (userError) {
      // If it's an AuthSessionMissingError, return gracefully
      if (userError.message?.includes("session") || userError.message?.includes("Auth session missing")) {
        console.log("[getUserProfileAction] No active session - user not authenticated");
        return {
          success: false,
          user: null,
          errorMessage: "No active session. Please log in.",
        };
      }
      // For other auth errors, log and return gracefully
      console.error("Auth error in getUserProfileAction:", userError);
      return {
        success: false,
        user: null,
        errorMessage: `Authentication failed: ${userError.message}`,
      };
    }
    
    if (!user) {
      console.log("[getUserProfileAction] No user found in session");
      return {
        success: false,
        user: null,
        errorMessage: "User not authenticated - no user found in session",
      };
    }

    // Fetch user profile from the users table
    // Using .select('*') to get all user fields
    // Add a small retry mechanism for eventual consistency after updates
    let profile = null;
    let profileError = null;
    let retries = 3;
    
    while (retries > 0) {
      const result = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      
      profile = result.data;
      profileError = result.error;
      
      // If successful or if it's not a "not found" error, break
      if (!profileError || profileError.code !== "PGRST116") {
        break;
      }
      
      // If profile not found and we have retries left, wait a bit and retry
      // This handles eventual consistency after role updates
      if (retries > 1) {
        console.log(`[getUserProfileAction] Profile not found, retrying... (${retries - 1} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      retries--;
    }

    // Handle case where profile doesn't exist (user signed up but profile wasn't created)
    // This can happen if user logs in before email confirmation
    if (profileError && profileError.code === "PGRST116") {
      // Profile doesn't exist - try to create it with default values
      console.log("User profile not found, creating default profile...");
      
      const { data: newProfile, error: createError } = await supabase
        .from("users")
        .insert([
          {
            id: user.id,
            email: user.email || "",
            role: (user.user_metadata?.role as "customer" | "tasker") || "customer",
            email_verified: user.email_confirmed_at ? true : false,
            is_active: true,
            preferred_language: "en",
            verification_status: "pending",
            wallet_balance: 0,
          },
        ])
        .select()
        .single();

      // If creation fails due to duplicate email, try to fetch by email instead
      // This handles race conditions where profile was created between our check and insert
      if (createError && createError.code === "23505") {
        console.log("Profile creation failed due to duplicate email, fetching by email instead...");
        const { data: existingProfile, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email)
          .single();

        if (!fetchError && existingProfile) {
          // Found profile by email - return it
          console.log("Found existing profile by email");
          return {
            success: true,
            user: existingProfile,
            errorMessage: null,
          };
        } else {
          // Still can't find it - this is a real error
          console.error("Failed to fetch profile by email:", fetchError);
          throw new Error(
            `User profile not found and failed to create: ${createError.message}`
          );
        }
      }

      if (createError || !newProfile) {
        console.error("Failed to create user profile:", createError);
        throw new Error(
          `User profile not found and failed to create: ${createError?.message || "Unknown error"}`
        );
      }

      // Create user_stats record
      await supabase.from("user_stats").insert([
        {
          id: user.id,
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

      return {
        success: true,
        user: newProfile,
        errorMessage: null,
      };
    }

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      throw new Error(`Failed to fetch user profile: ${profileError.message}`);
    }

    if (!profile) {
      throw new Error("User profile not found in database");
    }

    return {
      success: true,
      user: profile,
      errorMessage: null,
    };
  } catch (error) {
    // Enhanced error handling with detailed logging
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Unknown error occurred while fetching user profile";
    
    if (process.env.NODE_ENV === "development") {
      console.error("getUserProfileAction error:", error);
    }
    
    return {
      success: false,
      user: null,
      ...handleError(error),
    };
  }
};

// Action to create initial user records after email confirmation
export const createUserRecordsAction = async (userId: string) => {
  try {
    const supabase = await createClient();

    // Create user_stats record for all users
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

    // Note: For taskers, we DON'T create tasker_profile here
    // It will be created in the finish-signUp page after they complete their profile

    return { errorMessage: null };
  } catch (error) {
    console.error("Error creating user records:", error);
    return { errorMessage: "Failed to create user records" };
  }
};

// Action to create tasker profile after completing finish-signUp
export const createTaskerProfileAction = async (formData: {
  experience_level: string;
  bio: string;
  service_radius_km: number;
  is_available: boolean;
  phone?: string;
  identity_document_url: string;
  operation_hours: Record<
    string,
    { enabled: boolean; startTime: string; endTime: string }
  >;
}) => {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("You must be logged in to complete your tasker profile");
    }

    // Validate form data
    if (!formData.experience_level) {
      throw new Error("Experience level is required");
    }

    if (!formData.bio || formData.bio.trim().length < 50) {
      throw new Error("Bio must be at least 50 characters long");
    }

    if (formData.service_radius_km < 1 || formData.service_radius_km > 200) {
      throw new Error("Service radius must be between 1 and 200 km");
    }

    // CRITICAL: Ensure user exists in users table before creating tasker profile
    // The foreign key constraint tasker_profiles_id_fkey requires the user to exist in users table
    // Check if user exists in users table by ID first
    let userInDb = null;
    let actualUserId = user.id; // Default to auth.uid()
    
    const { data: userById, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    // If user doesn't exist by ID, check by email (might exist with different ID)
    if (userCheckError && userCheckError.code === "PGRST116") {
      console.log("[createTaskerProfileAction] User not found by ID, checking by email...");
      const { data: userByEmail, error: emailCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("email", user.email)
        .single();

      if (!emailCheckError && userByEmail) {
        // User exists with same email but different ID - use the existing ID
        console.warn("[createTaskerProfileAction] User exists with different ID, using existing user ID", {
          authUserId: user.id,
          dbUserId: userByEmail.id,
          email: user.email,
        });
        actualUserId = userByEmail.id; // Use the existing user ID from database
        userInDb = userByEmail;
      } else {
        userInDb = null; // User doesn't exist at all
      }
    } else if (!userCheckError && userById) {
      userInDb = userById; // User exists with matching ID
      actualUserId = userById.id; // Ensure actualUserId is set
    } else if (userCheckError && userCheckError.code !== "PGRST116") {
      // Other error checking user (not "not found")
      console.error("[createTaskerProfileAction] Error checking user:", userCheckError);
      throw new Error(
        `Failed to verify user: ${userCheckError.message}`
      );
    }

    // Check if tasker profile already exists with actualUserId
    const { data: existingProfile } = await supabase
      .from("tasker_profiles")
      .select("id")
      .eq("id", actualUserId)
      .single();

    if (existingProfile) {
      throw new Error("Tasker profile already exists");
    }

    // If user doesn't exist in users table, create it
    if (!userInDb) {
      console.log("[createTaskerProfileAction] User not found in users table, creating user profile...");
      const { error: createUserError } = await supabase
        .from("users")
        .insert({
          id: actualUserId, // Use actualUserId (might be different from auth.uid() if user exists)
          email: user.email || "",
          role: "customer", // Will be updated to "tasker" below
          email_verified: user.email_confirmed_at ? true : false,
          is_active: true,
          preferred_language: "en",
          verification_status: "pending",
          wallet_balance: 0,
        });

      // Handle duplicate email error (user might exist with different ID or race condition)
      if (createUserError) {
        if (createUserError.code === "23505") {
          // Duplicate email - user might exist with different ID or race condition
          // Try to fetch user by email to verify
          console.log("[createTaskerProfileAction] Duplicate email detected, checking if user exists by email...");
          const { data: existingUserByEmail, error: fetchByEmailError } = await supabase
            .from("users")
            .select("id, email")
            .eq("email", user.email)
            .single();

          if (!fetchByEmailError && existingUserByEmail) {
            // User exists with same email
            if (existingUserByEmail.id !== user.id) {
              // User exists with same email but different ID - this is a data inconsistency
              // We cannot create a tasker profile with auth.uid() if the user exists with a different ID
              // The foreign key constraint will fail, but we'll let it fail with a clearer error
              console.error("[createTaskerProfileAction] User exists with different ID - data inconsistency", {
                authUserId: user.id,
                dbUserId: existingUserByEmail.id,
                email: user.email,
              });
              // Continue - the foreign key constraint will catch this and provide a clearer error
            } else {
              // User exists with same ID and email - just continue (race condition resolved)
              console.log("[createTaskerProfileAction] User already exists with matching ID, continuing...");
            }
          } else {
            // Couldn't fetch by email - might be a race condition, continue anyway
            console.warn("[createTaskerProfileAction] Couldn't fetch user by email, but duplicate email error occurred. Continuing...");
          }
        } else {
          // Other error creating user
          console.error("[createTaskerProfileAction] Failed to create user:", createUserError);
          throw new Error(
            `Failed to create user profile: ${createUserError.message}`
          );
        }
      } else {
        // User created successfully - also create user_stats record
        console.log("[createTaskerProfileAction] User created successfully, creating user_stats...");
        const { error: statsError } = await supabase.from("user_stats").insert([
          {
            id: actualUserId,
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
        
        if (statsError && statsError.code !== "23505") {
          // Ignore duplicate key error for user_stats (might already exist)
          console.warn("[createTaskerProfileAction] Failed to create user_stats:", statsError);
        }
      }
    } else if (userInDb) {
      // User exists - verify user_stats exists too
      // User exists - verify user_stats exists too
      const { data: userStats, error: statsError } = await supabase
        .from("user_stats")
        .select("id")
        .eq("id", actualUserId)
        .single();

      if (statsError && statsError.code === "PGRST116") {
        // User_stats doesn't exist - create it
        console.log("[createTaskerProfileAction] User exists but user_stats missing, creating...");
        await supabase.from("user_stats").insert([
          {
            id: actualUserId,
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
      }
    }

    // Now create tasker profile - use actualUserId (which exists in users table)
    console.log("[createTaskerProfileAction] Creating tasker profile with user ID:", actualUserId);
    const { error: profileError } = await supabase
      .from("tasker_profiles")
      .insert({
        id: actualUserId, // Use actualUserId which is guaranteed to exist in users table
        experience_level: formData.experience_level,
        bio: formData.bio.trim(),
        service_radius_km: formData.service_radius_km,
        is_available: formData.is_available,
        operation_hours: formData.operation_hours,
        verification_status: "pending",
        identity_document_url: formData.identity_document_url,
      });

    if (profileError) {
      throw new Error(
        `Failed to create tasker profile: ${profileError.message}`
      );
    }

    // CRITICAL: Update user role to "tasker" in the users table
    // This ensures the user is recognized as a tasker and can access tasker routes
    console.log("[createTaskerProfileAction] Updating user role to tasker for user:", user.id);
    const { data: updateData, error: roleError } = await supabase
      .from("users")
      .update({ 
        role: "tasker",
        // Also update phone if provided (trim to remove whitespace)
        ...(formData.phone && formData.phone.trim() && { phone: formData.phone.trim() }),
      })
      .eq("id", user.id)
      .select(); // Select to verify the update

    if (roleError) {
      console.error("[createTaskerProfileAction] Failed to update user role to tasker:", roleError);
      // This is critical - if role update fails, the user won't be able to access tasker routes
      // We should still throw an error to prevent inconsistent state
      throw new Error(
        `Failed to update user role to tasker: ${roleError.message}`
      );
    }

    console.log("[createTaskerProfileAction] Role update successful. Updated data:", updateData);

    // Get updated user data with the new role and phone to verify the update
    const { data: updatedUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("[createTaskerProfileAction] Failed to fetch updated user:", userError);
      // Profile and role were updated successfully, but we couldn't fetch the updated user
      // Return success anyway as the critical operations completed
    } else if (updatedUser) {
      // Verify that the role was actually updated
      if (updatedUser.role !== "tasker") {
        console.error(
          "[createTaskerProfileAction] CRITICAL: Role update failed! User role is still:",
          updatedUser.role,
          "Expected: tasker"
        );
        throw new Error(
          `Failed to update user role. Current role: ${updatedUser.role}, Expected: tasker`
        );
      }
      console.log("[createTaskerProfileAction] Role update verified. User role is now:", updatedUser.role);
    }

    return {
      success: true,
      errorMessage: null,
      user: updatedUser || null, // Return updated user data if available
    };
  } catch (error) {
    return {
      success: false,
      ...handleError(error),
    };
  }
};

// Action to check if tasker has completed their profile setup
export const hasTaskerCompletedProfileAction = async (): Promise<{
  hasCompleted: boolean;
  errorMessage?: string;
}> => {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        hasCompleted: false,
        errorMessage: "User not authenticated",
      };
    }

    // First, get the user from users table to get the actual ID (might differ from auth.uid())
    // Try by ID first
    let userInDb = null;
    const { data: userById } = await supabase
      .from("users")
      .select("id, email")
      .eq("id", user.id)
      .single();
    
    if (userById) {
      userInDb = userById;
    } else {
      // If not found by ID, try by email
      const { data: userByEmail } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", user.email || "")
        .single();
      
      if (userByEmail) {
        userInDb = userByEmail;
      }
    }

    // Use the ID from users table if available, otherwise use auth user ID
    const userIdToCheck = userInDb?.id || user.id;

    // Check if tasker profile exists with retry mechanism for eventual consistency
    let profile = null;
    let profileError = null;
    let retries = 3;
    let delay = 300;

    while (retries > 0) {
      const result = await supabase
        .from("tasker_profiles")
        .select("id")
        .eq("id", userIdToCheck)
        .single();

      profile = result.data;
      profileError = result.error;

      // If profile found, return success immediately
      if (profile && !profileError) {
        return {
          hasCompleted: true,
        };
      }

      // If error is not "not found", it's a real error
      if (profileError && profileError.code !== "PGRST116") {
        // Try one more time with auth user ID in case of ID mismatch
        if (userIdToCheck !== user.id) {
          const fallbackResult = await supabase
            .from("tasker_profiles")
            .select("id")
            .eq("id", user.id)
            .single();
          
          if (fallbackResult.data && !fallbackResult.error) {
            return {
              hasCompleted: true,
            };
          }
        }
        
        return {
          hasCompleted: false,
          errorMessage: "Failed to check tasker profile",
        };
      }

      // Profile not found - retry if we have retries left
      if (retries > 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
      retries--;
    }

    // After all retries, profile still not found - try one final check with auth user ID
    if (userIdToCheck !== user.id) {
      const finalCheck = await supabase
        .from("tasker_profiles")
        .select("id")
        .eq("id", user.id)
        .single();
      
      if (finalCheck.data && !finalCheck.error) {
        return {
          hasCompleted: true,
        };
      }
    }

    // Profile not found after all attempts
    return {
      hasCompleted: false,
    };
  } catch (error) {
    return {
      hasCompleted: false,
      ...handleError(error),
    };
  }
};
