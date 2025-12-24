"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import {
  TaskerService,
  ServiceStatus,
  Address,
  TaskerProfile,
} from "@/types/supabase";
import { getAllCategoryHierarchies } from "@/lib/categories";

export interface ServiceDetailsData {
  tasker_service_id: string;
  service_id: number;
  tasker_id: string;
  title: string;
  description: string;
  price: string;
  pricing_type: "fixed" | "hourly" | "per_item";
  service_status: ServiceStatus;
  verification_status: "verified" | "pending" | "rejected" | "under_review";
  has_active_booking: boolean;
  portfolio_images: string[] | null;
  minimum_duration: number;
  service_area: object | null;
  extra_fees: number | null;
  created_at: string;
  updated_at: string;
  tasker_first_name: string;
  tasker_last_name: string;
  tasker_avatar_url: string;
  tasker_phone: string;
  tasker_created_at: string;
  tasker_role: string;
  experience_level: string | null;
  tasker_bio: string;
  tasker_verification_status: string;
  service_radius_km: number;
  tasker_is_available: boolean;
  operation_hours: Record<string, unknown> | null;
  company_id: string | null;
  tasker_rating: string;
  total_reviews: number;
  completed_jobs: number;
  total_earnings: string;
  response_time_hours: number;
  cancellation_rate: string;
  company_name: string | null;
  company_city: string | null;
  company_verification_status: string | null;
  is_available_for_booking: boolean;
  category_id: string;
  category_name_en: string;
  category_name_fr: string;
  category_name_ar: string;
}

// Helper function to get category and service names by service ID
function getCategoryAndServiceNames(serviceId: number) {
  const hierarchies = getAllCategoryHierarchies();
  for (const { parent, subcategories } of hierarchies) {
    const foundService = subcategories.find((s) => s.id === serviceId);
    if (foundService) {
      return {
        categoryName: parent.name_en,
        serviceName: foundService.name_en,
      };
    }
  }
  return {
    categoryName: "Unknown Category",
    serviceName: "Unknown Service",
  };
}

/**
 * Get all active services from the database
 * This ensures we use the actual service IDs from the database
 * instead of local hardcoded IDs that may not match
 */
export async function getServices(): Promise<{
  success: boolean;
  services?: Array<{
    id: number;
    category_id: number;
    name_en: string;
    name_fr: string;
    name_ar: string;
    description_en: string | null;
    description_fr: string | null;
    description_ar: string | null;
    icon_url: string | null;
    is_active: boolean;
    sort_order: number;
  }>;
  error?: string;
}> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("services")
      .select("id, category_id, name_en, name_fr, name_ar, description_en, description_fr, description_ar, icon_url, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching services:", error);
      return {
        success: false,
        error: `Failed to fetch services: ${error.message}`,
      };
    }

    return {
      success: true,
      services: data || [],
    };
  } catch (error) {
    console.error("Error in getServices:", error);
    return {
      success: false,
      error: "Failed to load services. Please try again later.",
    };
  }
}

export interface ServiceWithDetails extends TaskerService {
  booking_count: number;
  category_name_en?: string;
  category_name_fr?: string;
  category_name_ar?: string;
  service_name_en?: string;
  service_name_fr?: string;
  service_name_ar?: string;
}

export async function getTaskerServices(
  taskerId: string
): Promise<ServiceWithDetails[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("tasker_services")
      .select(
        `
        *,
        booking_count:service_bookings(count)
      `
      )
      .eq("tasker_id", taskerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasker services:", error);
      throw new Error(`Failed to fetch services: ${error.message}`);
    }

    // Format the data and add category names from local categories
    const services: ServiceWithDetails[] = (data || []).map((service) => {
      const { categoryName, serviceName } = getCategoryAndServiceNames(
        service.service_id
      );

      return {
        ...service,
        booking_count: service.booking_count?.[0]?.count || 0,
        category_name_en: categoryName,
        service_name_en: serviceName,
      };
    });

    return services;
  } catch (error) {
    console.error("Error in getTaskerServices:", error);
    throw error;
  }
}

export async function getTaskerServiceById(
  serviceId: string,
  taskerId: string
): Promise<ServiceWithDetails | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("tasker_services")
      .select(
        `
        *,
        booking_count:service_bookings(count)
      `
      )
      .eq("id", serviceId)
      .eq("tasker_id", taskerId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Service not found
      }
      console.error("Error fetching service:", error);
      throw new Error(`Failed to fetch service: ${error.message}`);
    }

    const { categoryName, serviceName } = getCategoryAndServiceNames(
      data.service_id
    );

    return {
      ...data,
      booking_count: data.booking_count?.[0]?.count || 0,
      category_name_en: categoryName,
      service_name_en: serviceName,
    };
  } catch (error) {
    console.error("Error in getTaskerServiceById:", error);
    throw error;
  }
}

export async function updateTaskerService(
  serviceId: string,
  taskerId: string,
  updates: Partial<
    Pick<
      TaskerService,
      | "title"
      | "description"
      | "price"
      | "pricing_type"
      | "minimum_duration"
      | "service_area"
      | "service_status"
    >
  >
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Verify the service belongs to the tasker
    const { data: existingService, error: fetchError } = await supabase
      .from("tasker_services")
      .select("tasker_id")
      .eq("id", serviceId)
      .single();

    if (fetchError || !existingService) {
      return { success: false, error: "Service not found" };
    }

    if (existingService.tasker_id !== taskerId) {
      return { success: false, error: "Unauthorized" };
    }

    // Update the service
    const { error } = await supabase
      .from("tasker_services")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", serviceId);

    if (error) {
      console.error("Error updating service:", error);
      return {
        success: false,
        error: `Failed to update service: ${error.message}`,
      };
    }

    revalidatePath("/tasker/my-services");
    revalidatePath(`/tasker/my-services/${serviceId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in updateTaskerService:", error);
    return { success: false, error: "Failed to update service" };
  }
}

export async function deleteTaskerService(
  serviceId: string,
  taskerId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Verify the service belongs to the tasker and has no active bookings
    const { data: existingService, error: fetchError } = await supabase
      .from("tasker_services")
      .select("tasker_id, has_active_booking")
      .eq("id", serviceId)
      .single();

    if (fetchError || !existingService) {
      return { success: false, error: "Service not found" };
    }

    if (existingService.tasker_id !== taskerId) {
      return { success: false, error: "Unauthorized" };
    }

    if (existingService.has_active_booking) {
      return {
        success: false,
        error: "Cannot delete service with active bookings",
      };
    }

    // Check for any pending bookings
    const { data: pendingBookings, error: bookingError } = await supabase
      .from("service_bookings")
      .select("id")
      .eq("tasker_service_id", serviceId)
      .in("status", ["pending", "accepted", "confirmed", "in_progress"]);

    if (bookingError) {
      console.error("Error checking pending bookings:", bookingError);
      return { success: false, error: "Failed to check for pending bookings" };
    }

    if (pendingBookings && pendingBookings.length > 0) {
      return {
        success: false,
        error: "Cannot delete service with pending bookings",
      };
    }

    // Delete the service
    const { error } = await supabase
      .from("tasker_services")
      .delete()
      .eq("id", serviceId);

    if (error) {
      console.error("Error deleting service:", error);
      return {
        success: false,
        error: `Failed to delete service: ${error.message}`,
      };
    }

    revalidatePath("/tasker/my-services");

    return { success: true };
  } catch (error) {
    console.error("Error in deleteTaskerService:", error);
    return { success: false, error: "Failed to delete service" };
  }
}

export async function toggleServiceStatus(
  serviceId: string,
  taskerId: string,
  newStatus: ServiceStatus
): Promise<{ success: boolean; error?: string }> {
  return updateTaskerService(serviceId, taskerId, {
    service_status: newStatus,
  });
}

//post-service page
export interface CreateServiceData {
  title: string;
  description: string;
  service_id: number; // This maps to the service ID from local categories
  service_area?: string;
  pricing_type: "fixed" | "hourly" | "per_item";
  base_price?: number;
  hourly_rate?: number;
  minimum_booking_hours?: number;
  estimated_duration?: number;
  extras: Array<{ name: string; price: number }>;
}

export async function getServiceDetails(
  serviceId: string
): Promise<{ success: boolean; data?: ServiceDetailsData; error?: string }> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("service_details_view")
      .select("*")
      .eq("tasker_service_id", serviceId)
      .single();

    if (error) {
      console.error("Service fetch error:", error);
      if (error.code === "PGRST116") {
        return { success: false, error: "Service not found" };
      }
      return {
        success: false,
        error: `Failed to fetch service: ${error.message}`,
      };
    }

    if (!data) {
      return { success: false, error: "Service not found" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error in getServiceDetails:", error);
    return {
      success: false,
      error: "Failed to load the service. Please try again later.",
    };
  }
}

// Get tasker service offer details for public viewing
export interface TaskerServiceOffer {
  id: string;
  title: string;
  description: string;
  price: number;
  pricing_type: "fixed" | "hourly" | "per_item";
  minimum_duration: number | null;
  service_area: Record<string, unknown> | null;
  portfolio_images: string[] | null;
  created_at: string;
  tasker: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    created_at: string;
    profile: {
      bio: string | null;
      experience_level: string | null;
    } | null;
  };
  stats: {
    tasker_rating: number | null;
    completed_jobs: number | null;
    total_reviews: number | null;
    response_time_hours: number | null;
  } | null;
}

export async function getTaskerServiceOffer(
  serviceId: string
): Promise<{ success: boolean; data?: TaskerServiceOffer; error?: string }> {
  const supabase = await createClient();

  try {
    if (!serviceId || typeof serviceId !== "string") {
      return { success: false, error: "Invalid service ID" };
    }

    // Fetch tasker service with related data
    const { data: taskerServiceData, error: taskerServiceError } =
      await supabase
        .from("tasker_services")
        .select(
          `
          *,
          tasker:tasker_id (
            id,
            first_name,
            last_name,
            avatar_url,
            created_at,
            profile:tasker_profiles (
              bio,
              experience_level
            )
          )
        `
        )
        .eq("id", serviceId)
        .single();

    if (taskerServiceError) {
      console.error("Tasker service error:", taskerServiceError);
      if (taskerServiceError.code === "PGRST116") {
        return { success: false, error: "Service not found" };
      }
      return { success: false, error: taskerServiceError.message };
    }

    if (!taskerServiceData) {
      return { success: false, error: "Service not found" };
    }

    // Fetch tasker stats
    const { data: statsData, error: statsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("id", taskerServiceData.tasker_id)
      .single();

    // Stats error is not critical, we can continue without stats
    if (statsError && statsError.code !== "PGRST116") {
      console.warn("Failed to fetch user stats:", statsError);
    }

    const result: TaskerServiceOffer = {
      id: taskerServiceData.id,
      title: taskerServiceData.title,
      description: taskerServiceData.description,
      price: taskerServiceData.price,
      pricing_type: taskerServiceData.pricing_type,
      minimum_duration: taskerServiceData.minimum_duration,
      service_area: taskerServiceData.service_area,
      portfolio_images: taskerServiceData.portfolio_images,
      created_at: taskerServiceData.created_at,
      tasker: taskerServiceData.tasker,
      stats: statsData || null,
    };

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching tasker service offer:", error);
    return {
      success: false,
      error: "Failed to load the service offer. Please try again later.",
    };
  }
}

// Get tasker addresses for post-service page
export async function getTaskerAddresses(): Promise<{
  success: boolean;
  addresses?: Address[];
  error?: string;
}> {
  const supabase = await createClient();

  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Get addresses
    const { data: addresses, error: addressesError } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });

    if (addressesError) {
      console.error("Error fetching addresses:", addressesError);
      return { success: false, error: "Failed to fetch addresses" };
    }

    return { success: true, addresses: addresses || [] };
  } catch (error) {
    console.error("Error in getTaskerAddresses:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Get tasker profile for post-service page
export async function getTaskerProfile(): Promise<{
  success: boolean;
  profile?: TaskerProfile | null;
  error?: string;
}> {
  const supabase = await createClient();

  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Get tasker profile
    const { data: profile, error: profileError } = await supabase
      .from("tasker_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error fetching profile:", profileError);
      return { success: false, error: "Failed to fetch profile" };
    }

    return { success: true, profile: profile || null };
  } catch (error) {
    console.error("Error in getTaskerProfile:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Updated createTaskerService to work without taskerId parameter
export async function createTaskerService(
  serviceData: CreateServiceData
): Promise<{ success: boolean; serviceId?: string; error?: string }> {
  const supabase = await createClient();

  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Validate required fields
    if (
      !serviceData.title ||
      !serviceData.description ||
      !serviceData.service_id
    ) {
      return { success: false, error: "Missing required fields" };
    }

    // Validate pricing based on type
    if (serviceData.pricing_type === "fixed" && !serviceData.base_price) {
      return {
        success: false,
        error: "Base price is required for fixed pricing",
      };
    }
    if (serviceData.pricing_type === "hourly" && !serviceData.hourly_rate) {
      return {
        success: false,
        error: "Hourly rate is required for hourly pricing",
      };
    }

    // Create the service
    const { data, error } = await supabase
      .from("tasker_services")
      .insert({
        tasker_id: user.id,
        title: serviceData.title,
        description: serviceData.description,
        service_id: serviceData.service_id,
        service_area: serviceData.service_area,
        pricing_type: serviceData.pricing_type,
        price: serviceData.base_price || serviceData.hourly_rate,
        minimum_duration: serviceData.minimum_booking_hours,
        extra_fees: serviceData.extras.length,
        service_status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating service:", error);
      return {
        success: false,
        error: `Failed to create service: ${error.message}`,
      };
    }

    revalidatePath("/tasker/my-services");
    revalidatePath("/tasker/dashboard");

    return { success: true, serviceId: data.id };
  } catch (error) {
    console.error("Error in createTaskerService:", error);
    return { success: false, error: "Failed to create service" };
  }
}

// Check if user has existing booking for a service
export async function checkExistingBooking(
  serviceId: string,
  userId: string
): Promise<{
  success: boolean;
  hasBooking: boolean;
  bookingId?: string;
  error?: string;
}> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("service_bookings")
      .select("id, status")
      .eq("tasker_service_id", serviceId)
      .eq("customer_id", userId)
      .in("status", ["pending", "accepted", "confirmed", "in_progress"])
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking existing booking:", error);
      return {
        success: false,
        hasBooking: false,
        error: "Failed to check booking status",
      };
    }

    if (data) {
      return { success: true, hasBooking: true, bookingId: data.id };
    }

    return { success: true, hasBooking: false };
  } catch (error) {
    console.error("Error in checkExistingBooking:", error);
    return {
      success: false,
      hasBooking: false,
      error: "Failed to check booking status",
    };
  }
}

// Check if user has existing conversation with tasker for a service
export async function checkExistingConversation(
  serviceId: string,
  userId: string,
  taskerId: string
): Promise<{
  success: boolean;
  hasConversation: boolean;
  conversationId?: string;
  error?: string;
}> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(participant1_id.eq.${userId},participant2_id.eq.${taskerId}),and(participant1_id.eq.${taskerId},participant2_id.eq.${userId})`
      )
      .eq("service_id", serviceId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking existing conversation:", error);
      return {
        success: false,
        hasConversation: false,
        error: "Failed to check conversation status",
      };
    }

    if (data) {
      return { success: true, hasConversation: true, conversationId: data.id };
    }

    return { success: true, hasConversation: false };
  } catch (error) {
    console.error("Error in checkExistingConversation:", error);
    return {
      success: false,
      hasConversation: false,
      error: "Failed to check conversation status",
    };
  }
}

// Get service interaction status for a user (optimized with parallel queries)
export async function getServiceInteractionStatus(
  serviceId: string,
  userId: string
): Promise<{
  success: boolean;
  data?: {
    isOwner: boolean;
    hasBooking: boolean;
    hasConversation: boolean;
    bookingId?: string;
    conversationId?: string;
  };
  error?: string;
}> {
  const supabase = await createClient();

  try {
    // Get service details to get tasker ID
    const { data: serviceData, error: serviceError } = await supabase
      .from("tasker_services")
      .select("tasker_id")
      .eq("id", serviceId)
      .single();

    if (serviceError || !serviceData) {
      return { success: false, error: "Service not found" };
    }

    const isOwner = serviceData.tasker_id === userId;

    // If user is the owner, return early
    if (isOwner) {
      return {
        success: true,
        data: {
          isOwner: true,
          hasBooking: false,
          hasConversation: false,
        },
      };
    }

    // Run booking and conversation checks in parallel for better performance
    const [bookingCheck, conversationCheck] = await Promise.all([
      checkExistingBooking(serviceId, userId),
      checkExistingConversation(serviceId, userId, serviceData.tasker_id),
    ]);

    // Check for errors in parallel operations
    if (!bookingCheck.success) {
      return { success: false, error: bookingCheck.error };
    }
    if (!conversationCheck.success) {
      return { success: false, error: conversationCheck.error };
    }

    return {
      success: true,
      data: {
        isOwner: false,
        hasBooking: bookingCheck.hasBooking,
        hasConversation: conversationCheck.hasConversation,
        bookingId: bookingCheck.bookingId,
        conversationId: conversationCheck.conversationId,
      },
    };
  } catch (error) {
    console.error("Error in getServiceInteractionStatus:", error);
    return {
      success: false,
      error: "Failed to get service interaction status",
    };
  }
}
