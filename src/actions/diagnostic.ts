"use server";

import { createClient } from "@/supabase/server";

/**
 * Diagnostic action to check user account setup
 * This helps identify why "Your account is not properly set up" errors occur
 */
export async function diagnoseUserAccount(): Promise<{
  success: boolean;
  diagnostics: {
    authUser: {
      exists: boolean;
      id?: string;
      email?: string;
      role?: string;
    };
    dbUser: {
      exists: boolean;
      id?: string;
      email?: string;
      role?: string;
      error?: string;
    };
    taskerProfile: {
      exists: boolean;
      id?: string;
      verification_status?: string;
      error?: string;
    };
    canCreateUser: {
      canCreate: boolean;
      error?: string;
    };
    rlsStatus: {
      canRead: boolean;
      canReadAll: boolean;
      error?: string;
    };
  };
  error?: string;
}> {
  const supabase = await createClient();

  try {
    // 1. Check auth user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return {
        success: false,
        diagnostics: {
          authUser: { exists: false },
          dbUser: { exists: false },
          taskerProfile: { exists: false },
          canCreateUser: { canCreate: false },
          rlsStatus: { canRead: false, canReadAll: false },
        },
        error: "Not authenticated",
      };
    }

    const diagnostics = {
      authUser: {
        exists: true,
        id: authUser.id,
        email: authUser.email || undefined,
        role: authUser.user_metadata?.role as string | undefined,
      },
      dbUser: {
        exists: false,
      } as {
        exists: boolean;
        id?: string;
        email?: string;
        role?: string;
        error?: string;
      },
      taskerProfile: {
        exists: false,
      } as {
        exists: boolean;
        id?: string;
        verification_status?: string;
        error?: string;
      },
      canCreateUser: {
        canCreate: false,
      } as {
        canCreate: boolean;
        error?: string;
      },
      rlsStatus: {
        canRead: false,
        canReadAll: false,
      } as {
        canRead: boolean;
        canReadAll: boolean;
        error?: string;
      },
    };

    // 2. Check if user exists in users table (by ID)
    // Try with service role client to bypass RLS if needed
    const { data: dbUser, error: dbUserError } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("id", authUser.id)
      .maybeSingle();
    
    // Also try to get ALL users to see if RLS is blocking
    const { data: allUsers, error: allUsersError } = await supabase
      .from("users")
      .select("id, email")
      .limit(10);
    
    console.log("Diagnostic - All users check:", {
      found: allUsers?.length || 0,
      error: allUsersError?.message,
      rlsBlocking: allUsersError?.code === "42501" || allUsersError?.message?.includes("permission"),
    });

    // Also check by email in case ID doesn't match
    let dbUserByEmail = null;
    if (authUser.email) {
      const { data: emailUser } = await supabase
        .from("users")
        .select("id, email, role")
        .eq("email", authUser.email)
        .maybeSingle();
      dbUserByEmail = emailUser;
    }

    if (dbUserError) {
      const isRLSError = dbUserError.code === "42501" || dbUserError.message?.includes("permission") || dbUserError.message?.includes("policy");
      diagnostics.dbUser = {
        exists: false,
        error: `Error checking by ID: ${dbUserError.message} (code: ${dbUserError.code})${isRLSError ? " - ⚠️ PROBLÈME RLS: Les politiques RLS bloquent probablement la lecture!" : ""}`,
      };
    } else if (dbUser) {
      diagnostics.dbUser = {
        exists: true,
        id: dbUser.id,
        email: dbUser.email || undefined,
        role: dbUser.role || undefined,
      };
    } else if (dbUserByEmail) {
      // User exists but with different ID - this is a problem!
      diagnostics.dbUser = {
        exists: false,
        error: `User found by email but ID mismatch! Auth ID: ${authUser.id}, DB ID: ${dbUserByEmail.id}`,
      };
    } else {
      diagnostics.dbUser = {
        exists: false,
        error: "User not found in users table (checked by ID and email)",
      };
    }

    // 3. Check if tasker profile exists
    const { data: taskerProfile, error: taskerError } = await supabase
      .from("tasker_profiles")
      .select("id, verification_status")
      .eq("id", authUser.id)
      .maybeSingle();

    if (taskerError) {
      diagnostics.taskerProfile = {
        exists: false,
        error: `Error checking: ${taskerError.message} (code: ${taskerError.code})`,
      };
    } else if (taskerProfile) {
      diagnostics.taskerProfile = {
        exists: true,
        id: taskerProfile.id,
        verification_status: taskerProfile.verification_status || undefined,
      };
    }

    // 4. Test if we can create user (actually try to create, then delete if successful)
    if (!dbUser && !dbUserByEmail) {
      const testUser = {
        id: authUser.id,
        email: authUser.email || "",
        role: (authUser.user_metadata?.role as "customer" | "tasker") || "customer",
        email_verified: authUser.email_confirmed_at ? true : false,
        is_active: true,
        preferred_language: "en",
        verification_status: "pending",
        wallet_balance: 0,
      };

      // Actually try to create to see the error
      const { data: testCreate, error: createError } = await supabase
        .from("users")
        .insert([testUser])
        .select("id")
        .single();

      if (createError) {
        diagnostics.canCreateUser = {
          canCreate: false,
          error: `${createError.message} (code: ${createError.code})`,
        };
      } else if (testCreate) {
        // Successfully created, now delete it
        await supabase.from("users").delete().eq("id", testCreate.id);
        diagnostics.canCreateUser = {
          canCreate: true,
        };
      } else {
        diagnostics.canCreateUser = {
          canCreate: false,
          error: "Unknown error during test creation",
        };
      }
    } else {
      diagnostics.canCreateUser = {
        canCreate: true,
      };
    }

    // 5. Check RLS status
    diagnostics.rlsStatus = {
      canRead: !dbUserError && !!dbUser,
      canReadAll: !allUsersError && (allUsers?.length || 0) > 0,
      error: allUsersError ? `Cannot read all users: ${allUsersError.message} (code: ${allUsersError.code})` : undefined,
    };

    return {
      success: true,
      diagnostics,
    };
  } catch (error) {
    console.error("Diagnostic error:", error);
    return {
      success: false,
      diagnostics: {
        authUser: { exists: false },
        dbUser: { exists: false },
        taskerProfile: { exists: false },
        canCreateUser: { canCreate: false },
        rlsStatus: { canRead: false, canReadAll: false },
      },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

