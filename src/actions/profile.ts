"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  User,
  TaskerProfile,
  Address,
  ExperienceLevel,
  AvailabilitySlot,
} from "@/types/supabase";

// Optimized function to get complete profile data in one query
export async function getCompleteProfileData(userId: string): Promise<{
  user: User | null;
  taskerProfile: TaskerProfile | null;
  addresses: Address[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user:", userError);
      return {
        user: null,
        taskerProfile: null,
        addresses: [],
        error: "Failed to fetch user data",
      };
    }

    // Get tasker profile and addresses in parallel
    const [taskerResult, addressesResult] = await Promise.all([
      supabase.from("tasker_profiles").select("*").eq("id", userId).single(),
      supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false }),
    ]);

    const { data: taskerProfile, error: taskerError } = taskerResult;
    const { data: addresses, error: addressesError } = addressesResult;

    if (taskerError && taskerError.code !== "PGRST116") {
      console.error("Error fetching tasker profile:", taskerError);
      return {
        user,
        taskerProfile: null,
        addresses: [],
        error: "Failed to fetch tasker profile",
      };
    }

    if (addressesError) {
      console.error("Error fetching addresses:", addressesError);
      return {
        user,
        taskerProfile,
        addresses: [],
        error: "Failed to fetch addresses",
      };
    }

    return {
      user,
      taskerProfile,
      addresses: addresses || [],
    };
  } catch (error) {
    console.error("Error in getCompleteProfileData:", error);
    return {
      user: null,
      taskerProfile: null,
      addresses: [],
      error: "An unexpected error occurred",
    };
  }
}

// Update user personal information
export async function updateUserPersonalInfo(
  userId: string,
  updates: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    date_of_birth?: string;
  }
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const supabase = await createClient();

    // Validate required fields
    if (updates.first_name && !updates.first_name.trim()) {
      return { success: false, error: "First name cannot be empty" };
    }
    if (updates.last_name && !updates.last_name.trim()) {
      return { success: false, error: "Last name cannot be empty" };
    }

    // Validate phone number format if provided
    if (updates.phone && updates.phone.trim()) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{7,20}$/;
      if (!phoneRegex.test(updates.phone.trim())) {
        return { success: false, error: "Please enter a valid phone number" };
      }
    }

    // Validate date format if provided
    if (updates.date_of_birth && updates.date_of_birth.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(updates.date_of_birth)) {
        return {
          success: false,
          error: "Please enter a valid date in YYYY-MM-DD format",
        };
      }
    }

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user personal info:", error);
      return { success: false, error: "Failed to update personal information" };
    }

    revalidatePath("/[locale]/(profile)/tasker/profile", "layout");
    return { success: true, user: data };
  } catch (error) {
    console.error("Error in updateUserPersonalInfo:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Update user avatar
export async function updateUserAvatar(
  userId: string,
  avatarUrl: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("users")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user avatar:", error);
      return { success: false, error: "Failed to update profile photo" };
    }

    revalidatePath("/[locale]/(profile)/tasker/profile", "layout");
    return { success: true, user: data };
  } catch (error) {
    console.error("Error in updateUserAvatar:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Update tasker profile bio and experience
export async function updateTaskerBio(
  userId: string,
  updates: {
    bio?: string;
    experience_level?: ExperienceLevel;
    service_radius_km?: number;
  }
): Promise<{
  success: boolean;
  taskerProfile?: TaskerProfile;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Validate bio
    if (updates.bio !== undefined && !updates.bio.trim()) {
      return { success: false, error: "Bio is required" };
    }

    // Validate service radius
    if (updates.service_radius_km !== undefined) {
      if (updates.service_radius_km < 1 || updates.service_radius_km > 200) {
        return {
          success: false,
          error: "Service radius must be between 1 and 200 km",
        };
      }
    }

    const updateData = {
      ...updates,
      bio: updates.bio?.trim(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("tasker_profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating tasker bio:", error);
      return { success: false, error: "Failed to update bio information" };
    }

    revalidatePath("/[locale]/(profile)/tasker/profile", "layout");
    return { success: true, taskerProfile: data };
  } catch (error) {
    console.error("Error in updateTaskerBio:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Update tasker availability
export async function updateTaskerAvailability(
  userId: string,
  operationHours: AvailabilitySlot[]
): Promise<{
  success: boolean;
  taskerProfile?: TaskerProfile;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Validate that operationHours is an array
    if (!Array.isArray(operationHours)) {
      return {
        success: false,
        error: "Invalid availability data format",
      };
    }

    // Validate that at least one day is enabled
    const enabledDays = operationHours.filter((slot) => slot && slot.enabled);
    if (enabledDays.length === 0) {
      return {
        success: false,
        error: "Please enable at least one day of availability",
      };
    }

    // Validate time format for enabled days
    for (const slot of enabledDays) {
      if (!slot || !slot.startTime || !slot.endTime) {
        return {
          success: false,
          error: "Please set start and end times for all enabled days",
        };
      }

      if (slot.startTime >= slot.endTime) {
        return { success: false, error: "End time must be after start time" };
      }
    }

    const { data, error } = await supabase
      .from("tasker_profiles")
      .update({
        operation_hours: operationHours,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating tasker availability:", error);
      return { success: false, error: "Failed to update availability" };
    }

    revalidatePath("/[locale]/(profile)/tasker/profile", "layout");
    return { success: true, taskerProfile: data };
  } catch (error) {
    console.error("Error in updateTaskerAvailability:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Add new address
export async function addAddress(
  userId: string,
  addressData: {
    label: string;
    street_address: string;
    city: string;
    region: string;
    postal_code?: string;
    country: string;
    is_default: boolean;
  }
): Promise<{ success: boolean; address?: Address; error?: string }> {
  try {
    const supabase = await createClient();

    // Validate required fields
    if (
      !addressData.street_address.trim() ||
      !addressData.city.trim() ||
      !addressData.region.trim()
    ) {
      return {
        success: false,
        error: "Street address, city, and region are required",
      };
    }

    // Validate country code format
    if (addressData.country && addressData.country.length !== 2) {
      return {
        success: false,
        error: "Country code must be exactly 2 characters",
      };
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: userId,
        label: addressData.label,
        street_address: addressData.street_address.trim(),
        city: addressData.city.trim(),
        region: addressData.region.trim(),
        postal_code: addressData.postal_code?.trim() || null,
        country: addressData.country,
        is_default: addressData.is_default,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding address:", error);
      return { success: false, error: "Failed to add address" };
    }

    revalidatePath("/[locale]/(profile)/tasker/profile", "layout");
    return { success: true, address: data };
  } catch (error) {
    console.error("Error in addAddress:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Delete address
export async function deleteAddress(
  addressId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addressId);

    if (error) {
      console.error("Error deleting address:", error);
      return { success: false, error: "Failed to delete address" };
    }

    revalidatePath("/[locale]/(profile)/tasker/profile", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteAddress:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Upload profile image to Supabase storage
export async function uploadProfileImage(
  userId: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Please upload JPEG, PNG, or WebP.",
      };
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: "File size must be less than 2MB." };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // Replace existing file
      });

    if (uploadError) {
      console.error("Error uploading to storage:", uploadError);
      return { success: false, error: "Failed to upload image to storage" };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("profile-images")
      .getPublicUrl(filePath);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error("Error in uploadProfileImage:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Upload verification document to Supabase storage
export async function uploadVerificationDocument(
  userId: string,
  file: File,
  documentType: "id-front" | "id-back"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Please upload JPEG, PNG, WebP, or PDF.",
      };
    }

    // Validate file size (5MB max for documents)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: "File size must be less than 5MB." };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${documentType}.${fileExt}`;
    const filePath = `verification-documents/${userId}/${fileName}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("verification-documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // Replace existing file
      });

    if (uploadError) {
      console.error("Error uploading verification document:", uploadError);
      return { success: false, error: "Failed to upload document to storage" };
    }

    // Get the signed URL (since verification-documents bucket is private)
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("verification-documents")
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry

    if (signedUrlError) {
      console.error("Error creating signed URL:", signedUrlError);
      return { success: false, error: "Failed to create document URL" };
    }

    return { success: true, url: signedUrlData.signedUrl };
  } catch (error) {
    console.error("Error in uploadVerificationDocument:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Update tasker profile with verification document URL
export async function updateVerificationDocument(
  userId: string,
  documentUrl: string
): Promise<{
  success: boolean;
  taskerProfile?: TaskerProfile;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tasker_profiles")
      .update({
        identity_document_url: documentUrl,
        verification_status: "under_review",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating verification document:", error);
      return {
        success: false,
        error: "Failed to update verification document",
      };
    }

    revalidatePath("/[locale]/(profile)/tasker/profile", "layout");
    return { success: true, taskerProfile: data };
  } catch (error) {
    console.error("Error in updateVerificationDocument:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Get profile completion percentage for taskers
export async function getProfileCompletion(userId: string): Promise<{
  completionPercentage: number;
  missingFields: Array<{
    id: string;
    label: string;
    section: string;
    required: boolean;
  }>;
}> {
  try {
    const { user, taskerProfile, addresses } = await getCompleteProfileData(
      userId
    );

    const missingFields: Array<{
      id: string;
      label: string;
      section: string;
      required: boolean;
    }> = [];

    // Personal Information Section
    if (!user?.avatar_url) {
      missingFields.push({
        id: "profile_photo",
        label: "Profile Photo",
        section: "personal",
        required: true,
      });
    }

    if (!user?.first_name || !user?.last_name) {
      missingFields.push({
        id: "full_name",
        label: "Full Name",
        section: "personal",
        required: true,
      });
    }

    if (
      !taskerProfile?.identity_document_url ||
      taskerProfile?.verification_status !== "verified"
    ) {
      missingFields.push({
        id: "identity_verification",
        label: "Identity Verification",
        section: "personal",
        required: true,
      });
    }

    // Bio & Experience Section
    if (!taskerProfile?.bio || taskerProfile.bio.trim().length === 0) {
      missingFields.push({
        id: "bio",
        label: "Bio & Experience",
        section: "bio",
        required: true,
      });
    }

    if (
      !taskerProfile?.service_radius_km ||
      taskerProfile.service_radius_km <= 0
    ) {
      missingFields.push({
        id: "service_area",
        label: "Service Area",
        section: "bio",
        required: true,
      });
    }

    // Availability Section
    if (
      !taskerProfile?.operation_hours ||
      taskerProfile.operation_hours.length === 0
    ) {
      missingFields.push({
        id: "availability",
        label: "Availability",
        section: "availability",
        required: true,
      });
    }

    // Addresses Section
    if (!addresses || addresses.length === 0) {
      missingFields.push({
        id: "addresses",
        label: "Service Locations",
        section: "addresses",
        required: true,
      });
    }

    // Calculate completion percentage
    const totalRequiredFields = 7; // Total number of required fields
    const completedFields = totalRequiredFields - missingFields.length;
    const completionPercentage = Math.round(
      (completedFields / totalRequiredFields) * 100
    );

    return {
      completionPercentage,
      missingFields,
    };
  } catch (error) {
    console.error("Error in getProfileCompletion:", error);
    return {
      completionPercentage: 0,
      missingFields: [],
    };
  }
}

// ===== CUSTOMER PROFILE FUNCTIONS =====

// Get customer profile data (user + addresses only)
export async function getCustomerProfileData(userId: string): Promise<{
  user: User | null;
  addresses: Address[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user:", userError);
      return {
        user: null,
        addresses: [],
        error: "Failed to fetch user data",
      };
    }

    // Get addresses
    const { data: addresses, error: addressesError } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });

    if (addressesError) {
      console.error("Error fetching addresses:", addressesError);
      return {
        user,
        addresses: [],
        error: "Failed to fetch addresses",
      };
    }

    return {
      user,
      addresses: addresses || [],
    };
  } catch (error) {
    console.error("Error in getCustomerProfileData:", error);
    return {
      user: null,
      addresses: [],
      error: "An unexpected error occurred",
    };
  }
}

// Get customer profile completion percentage
export async function getCustomerProfileCompletion(userId: string): Promise<{
  completionPercentage: number;
  missingFields: Array<{
    id: string;
    label: string;
    section: string;
    required: boolean;
  }>;
}> {
  try {
    const { user, addresses } = await getCustomerProfileData(userId);

    const missingFields: Array<{
      id: string;
      label: string;
      section: string;
      required: boolean;
    }> = [];

    // Personal Information Section
    if (!user?.first_name || !user?.last_name) {
      missingFields.push({
        id: "full_name",
        label: "Full Name",
        section: "personal",
        required: true,
      });
    }

    if (!user?.avatar_url) {
      missingFields.push({
        id: "profile_photo",
        label: "Profile Photo",
        section: "personal",
        required: false,
      });
    }

    if (!user?.phone) {
      missingFields.push({
        id: "phone",
        label: "Phone Number",
        section: "personal",
        required: true,
      });
    }

    // Addresses Section
    if (!addresses || addresses.length === 0) {
      missingFields.push({
        id: "address",
        label: "Address",
        section: "addresses",
        required: true,
      });
    }

    // Calculate completion percentage (only required fields)
    const totalRequiredFields = 3; // full_name, phone, address
    const completedFields =
      totalRequiredFields - missingFields.filter((f) => f.required).length;
    const completionPercentage = Math.round(
      (completedFields / totalRequiredFields) * 100
    );

    return {
      completionPercentage,
      missingFields,
    };
  } catch (error) {
    console.error("Error in getCustomerProfileCompletion:", error);
    return {
      completionPercentage: 0,
      missingFields: [],
    };
  }
}

// Update customer personal information
export async function updateCustomerPersonalInfo(
  userId: string,
  updates: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    date_of_birth?: string;
  }
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const supabase = await createClient();

    // Validate required fields
    if (updates.first_name && !updates.first_name.trim()) {
      return { success: false, error: "First name cannot be empty" };
    }
    if (updates.last_name && !updates.last_name.trim()) {
      return { success: false, error: "Last name cannot be empty" };
    }

    // Validate phone number format if provided
    if (updates.phone && updates.phone.trim()) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{7,20}$/;
      if (!phoneRegex.test(updates.phone.trim())) {
        return { success: false, error: "Please enter a valid phone number" };
      }
    }

    // Validate date format if provided
    if (updates.date_of_birth && updates.date_of_birth.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(updates.date_of_birth)) {
        return {
          success: false,
          error: "Please enter a valid date in YYYY-MM-DD format",
        };
      }
    }

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating customer personal info:", error);
      return { success: false, error: "Failed to update personal information" };
    }

    revalidatePath("/[locale]/(profile)/customer/profile", "layout");
    return { success: true, user: data };
  } catch (error) {
    console.error("Error in updateCustomerPersonalInfo:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Add customer address
export async function addCustomerAddress(
  userId: string,
  addressData: {
    label: string;
    street_address: string;
    city: string;
    region: string;
    postal_code?: string;
    country: string;
    is_default: boolean;
  }
): Promise<{ success: boolean; address?: Address; error?: string }> {
  try {
    const supabase = await createClient();

    // Validate required fields
    if (
      !addressData.street_address.trim() ||
      !addressData.city.trim() ||
      !addressData.region.trim()
    ) {
      return {
        success: false,
        error: "Street address, city, and region are required",
      };
    }

    // Validate country code format
    if (addressData.country && addressData.country.length !== 2) {
      return {
        success: false,
        error: "Country code must be exactly 2 characters",
      };
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: userId,
        label: addressData.label,
        street_address: addressData.street_address.trim(),
        city: addressData.city.trim(),
        region: addressData.region.trim(),
        postal_code: addressData.postal_code?.trim() || null,
        country: addressData.country,
        is_default: addressData.is_default,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding customer address:", error);
      return { success: false, error: "Failed to add address" };
    }

    revalidatePath("/[locale]/(profile)/customer/profile", "layout");
    return { success: true, address: data };
  } catch (error) {
    console.error("Error in addCustomerAddress:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Delete customer address
export async function deleteCustomerAddress(
  addressId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addressId)
      .eq("user_id", userId); // Ensure user can only delete their own addresses

    if (error) {
      console.error("Error deleting customer address:", error);
      return { success: false, error: "Failed to delete address" };
    }

    revalidatePath("/[locale]/(profile)/customer/profile", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteCustomerAddress:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
