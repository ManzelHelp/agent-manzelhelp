"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { TaskerService, ServiceStatus } from "@/types/supabase";
import { serviceCategories } from "@/lib/categories";

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
  for (const category of serviceCategories) {
    const foundService = category.services.find((s) => s.id === serviceId);
    if (foundService) {
      return {
        categoryName: category.name_en,
        serviceName: foundService.name_en,
      };
    }
  }
  return {
    categoryName: "Unknown Category",
    serviceName: "Unknown Service",
  };
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

export async function createTaskerService(
  taskerId: string,
  serviceData: CreateServiceData
): Promise<{ success: boolean; serviceId?: string; error?: string }> {
  const supabase = await createClient();

  try {
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
        tasker_id: taskerId,
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
