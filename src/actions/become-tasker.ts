"use server";

import { handleError } from "@/lib/utils";
import { createClient } from "@/supabase/server";
import type {
  ExperienceLevel,
  VerificationStatus,
  User,
} from "@/types/supabase";

export interface BecomeTaskerFormData {
  experience_level: ExperienceLevel;
  bio: string;
  service_radius_km: number;
  is_available: boolean;
  operation_hours: {
    monday: { enabled: boolean; startTime: string; endTime: string };
    tuesday: { enabled: boolean; startTime: string; endTime: string };
    wednesday: { enabled: boolean; startTime: string; endTime: string };
    thursday: { enabled: boolean; startTime: string; endTime: string };
    friday: { enabled: boolean; startTime: string; endTime: string };
    saturday: { enabled: boolean; startTime: string; endTime: string };
    sunday: { enabled: boolean; startTime: string; endTime: string };
  };
}

export interface BecomeTaskerResult {
  success: boolean;
  errorMessage?: string;
  user?: User;
}

export const becomeTaskerAction = async (
  formData: BecomeTaskerFormData
): Promise<BecomeTaskerResult> => {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("You must be logged in to become a tasker");
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

    // Check if user is already a tasker
    const { data: existingUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (existingUser?.role === "tasker") {
      throw new Error("You are already a tasker");
    }

    // Start transaction-like operations
    // 1. Update user role to tasker
    const { error: roleError } = await supabase
      .from("users")
      .update({
        role: "tasker",
        verification_status: "under_review" as VerificationStatus,
      })
      .eq("id", user.id);

    if (roleError) {
      throw new Error(`Failed to update user role: ${roleError.message}`);
    }

    // 2. Create tasker profile
    const { error: profileError } = await supabase
      .from("tasker_profiles")
      .insert({
        id: user.id,
        experience_level: formData.experience_level,
        bio: formData.bio.trim(),
        service_radius_km: formData.service_radius_km,
        is_available: formData.is_available,
        operation_hours: formData.operation_hours,
        verification_status: "under_review" as VerificationStatus,
      });

    if (profileError) {
      // Rollback user role if profile creation fails
      await supabase
        .from("users")
        .update({ role: "customer" })
        .eq("id", user.id);

      throw new Error(
        `Failed to create tasker profile: ${profileError.message}`
      );
    }

    // 3. Get updated user data
    const { data: updatedUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (userError) {
      throw new Error(
        `Failed to fetch updated user data: ${userError.message}`
      );
    }

    return {
      success: true,
      user: updatedUser,
    };
  } catch (error) {
    return {
      success: false,
      ...handleError(error),
    };
  }
};

export const getCurrentUserRole = async (): Promise<{
  role: string | null;
  isTasker: boolean;
}> => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { role: null, isTasker: false };
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError) {
      return { role: null, isTasker: false };
    }

    return {
      role: userData?.role || null,
      isTasker: userData?.role === "tasker",
    };
  } catch {
    return { role: null, isTasker: false };
  }
};
