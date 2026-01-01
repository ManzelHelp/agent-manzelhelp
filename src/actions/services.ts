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
 * Get all active service categories from the database
 */
export async function getServiceCategories(): Promise<{
  success: boolean;
  categories?: Array<{
    id: number;
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
      .from("service_categories")
      .select("id, name_en, name_fr, name_ar, description_en, description_fr, description_ar, icon_url, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching service categories:", error);
      return {
        success: false,
        error: `Failed to fetch categories: ${error.message}`,
      };
    }

    return {
      success: true,
      categories: data || [],
    };
  } catch (error) {
    console.error("Error in getServiceCategories:", error);
    return {
      success: false,
      error: "Failed to load categories. Please try again later.",
    };
  }
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
    // Use SQL query with JOINs to get category and service names from database
    const { data, error } = await supabase
      .from("tasker_services")
      .select(
        `
        *,
        service:services!tasker_services_service_id_fkey(
          id,
          name_en,
          name_fr,
          name_ar,
          category:service_categories!services_category_id_fkey(
            id,
            name_en,
            name_fr,
            name_ar
          )
        ),
        booking_count:service_bookings(count)
      `
      )
      .eq("tasker_id", taskerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasker services:", error);
      throw new Error(`Failed to fetch services: ${error.message}`);
    }

    // Format the data and add category names from database
    // Explicitly serialize all fields to ensure proper JSON serialization
    const services: ServiceWithDetails[] = (data || []).map((service: any) => {
      const serviceData = service.service;
      const categoryData = serviceData?.category;

      return {
        ...service,
        id: String(service.id),
        tasker_id: String(service.tasker_id),
        service_id: Number(service.service_id),
        title: String(service.title || ""),
        description: String(service.description || ""),
        base_price: Number(service.base_price || 0),
        hourly_rate: service.hourly_rate ? Number(service.hourly_rate) : null,
        price: service.price ? Number(service.price) : (service.base_price ? Number(service.base_price) : 0),
        minimum_duration: service.minimum_duration ? Number(service.minimum_duration) : null,
        service_area: service.service_area ? (typeof service.service_area === 'object' ? service.service_area : (() => {
          try {
            return JSON.parse(String(service.service_area));
          } catch (e) {
            // If service_area is not valid JSON (e.g., plain text like "Sala AL Ja"), return as string wrapped in object
            console.warn("service_area is not valid JSON, treating as plain text:", service.service_area);
            return { text: String(service.service_area) };
          }
        })()) : null,
        extra_fees: service.extra_fees ? Number(service.extra_fees) : null,
        portfolio_images: service.portfolio_images ? (Array.isArray(service.portfolio_images) ? service.portfolio_images : (() => {
          try {
            return JSON.parse(String(service.portfolio_images));
          } catch (e) {
            console.warn("portfolio_images is not valid JSON:", service.portfolio_images);
            return [];
          }
        })()) : null,
        created_at: service.created_at ? new Date(service.created_at).toISOString() : new Date().toISOString(),
        updated_at: service.updated_at ? new Date(service.updated_at).toISOString() : new Date().toISOString(),
        booking_count: Number(service.booking_count?.[0]?.count || 0),
        category_name_en: String(categoryData?.name_en || "Unknown Category"),
        category_name_fr: categoryData?.name_fr ? String(categoryData.name_fr) : undefined,
        category_name_ar: categoryData?.name_ar ? String(categoryData.name_ar) : undefined,
        service_name_en: String(serviceData?.name_en || "Unknown Service"),
        service_name_fr: serviceData?.name_fr ? String(serviceData.name_fr) : undefined,
        service_name_ar: serviceData?.name_ar ? String(serviceData.name_ar) : undefined,
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
    // Use SQL query with JOINs to get category and service names from database
    const { data, error } = await supabase
      .from("tasker_services")
      .select(
        `
        *,
        service:services!tasker_services_service_id_fkey(
          id,
          name_en,
          name_fr,
          name_ar,
          category:service_categories!services_category_id_fkey(
            id,
            name_en,
            name_fr,
            name_ar
          )
        ),
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

    const serviceData = (data as any).service;
    const categoryData = serviceData?.category;

    return {
      ...data,
      booking_count: (data as any).booking_count?.[0]?.count || 0,
      category_name_en: categoryData?.name_en || "Unknown Category",
      category_name_fr: categoryData?.name_fr || null,
      category_name_ar: categoryData?.name_ar || null,
      service_name_en: serviceData?.name_en || "Unknown Service",
      service_name_fr: serviceData?.name_fr || null,
      service_name_ar: serviceData?.name_ar || null,
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

    // Check for any active bookings (pending, accepted, confirmed, in_progress)
    const { data: activeBookings, error: bookingError } = await supabase
      .from("service_bookings")
      .select("id")
      .eq("tasker_service_id", serviceId)
      .in("status", ["pending", "accepted", "confirmed", "in_progress"]);

    if (bookingError) {
      console.error("Error checking active bookings:", bookingError);
      // Don't block deletion if we can't check bookings, but log it
      console.warn("Could not verify bookings, proceeding with deletion");
    } else if (activeBookings && activeBookings.length > 0) {
      return {
        success: false,
        error: "Cannot delete service with active bookings",
      };
    }

    // Delete the service
    const { data: deletedData, error: deleteError } = await supabase
      .from("tasker_services")
      .delete()
      .eq("id", serviceId)
      .eq("tasker_id", taskerId) // Double check ownership in DELETE
      .select(); // Select to verify deletion

    if (deleteError) {
      console.error("Error deleting service:", {
        message: deleteError.message,
        code: deleteError.code,
        details: deleteError.details,
        hint: deleteError.hint,
      });
      
      // Check if it's an RLS error
      if (deleteError.code === "42501" || deleteError.message.includes("row-level security")) {
        return {
          success: false,
          error: "Permission denied. Please ensure Row Level Security policy for DELETE exists on tasker_services table.",
        };
      }
      
      return {
        success: false,
        error: `Failed to delete service: ${deleteError.message}`,
      };
    }

    // Check if any rows were actually deleted
    if (!deletedData || deletedData.length === 0) {
      // No rows deleted, likely RLS blocking or service doesn't exist
      console.error("No rows deleted. Service may not exist or RLS is blocking deletion.");
      
      // Verify service still exists
      const { data: verifyService, error: verifyError } = await supabase
        .from("tasker_services")
        .select("id")
        .eq("id", serviceId)
        .single();

      if (!verifyError && verifyService) {
        // Service still exists, deletion was blocked
        return {
          success: false,
          error: "Failed to delete service. Row Level Security policy may be blocking deletion. Please run the fix_tasker_services_delete_rls.sql script.",
        };
      } else {
        // Service doesn't exist (might have been deleted or never existed)
        return {
          success: false,
          error: "Service not found or already deleted.",
        };
      }
    }

    revalidatePath("/tasker/my-services");
    revalidatePath(`/tasker/my-services/${serviceId}`);

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
    // Get authenticated user to verify ownership
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Fetch tasker service with all related data using JOINs
    const { data, error } = await supabase
      .from("tasker_services")
      .select(
        `
        *,
        service:services!tasker_services_service_id_fkey(
          id,
          category_id,
          category:service_categories!services_category_id_fkey(
            id,
            name_en,
            name_fr,
            name_ar
          )
        ),
        tasker:users!tasker_services_tasker_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url,
          phone,
          role,
          verification_status,
          created_at,
          tasker_profile:tasker_profiles!tasker_profiles_id_fkey(
            experience_level,
            bio,
            service_radius_km,
            is_available,
            operation_hours,
            company_id,
            company:companies!tasker_profiles_company_id_fkey(
              company_name,
              city,
              verification_status
            )
          ),
          user_stats:user_stats!user_stats_id_fkey(
            tasker_rating,
            total_reviews,
            completed_jobs,
            total_earnings,
            response_time_hours,
            cancellation_rate
          )
        ),
        active_bookings:service_bookings!service_bookings_tasker_service_id_fkey(
          id
        )
      `
      )
      .eq("id", serviceId)
      .eq("tasker_id", user.id)
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

    // Transform the data to match ServiceDetailsData interface
    const serviceData = data as any;
    const service = serviceData.service;
    const category = service?.category;
    const tasker = serviceData.tasker;
    const taskerProfile = tasker?.tasker_profile;
    const company = taskerProfile?.company;
    const stats = tasker?.user_stats;
    const activeBookings = serviceData.active_bookings || [];

    const formattedData: ServiceDetailsData = {
      tasker_service_id: serviceData.id.toString(),
      service_id: serviceData.service_id,
      tasker_id: serviceData.tasker_id,
      title: serviceData.title || "",
      description: serviceData.description || "",
      price: (serviceData.base_price || serviceData.price || 0).toString(),
      pricing_type: serviceData.pricing_type || "fixed",
      service_status: serviceData.service_status || "active",
      verification_status: serviceData.verification_status || "pending",
      has_active_booking: activeBookings.length > 0,
      portfolio_images: serviceData.portfolio_images || null,
      minimum_duration: serviceData.minimum_duration || 0,
      service_area: serviceData.service_area || null,
      extra_fees: serviceData.extra_fees || null,
      created_at: serviceData.created_at || new Date().toISOString(),
      updated_at: serviceData.updated_at || new Date().toISOString(),
      tasker_first_name: tasker?.first_name || "",
      tasker_last_name: tasker?.last_name || "",
      tasker_avatar_url: tasker?.avatar_url || "",
      tasker_phone: tasker?.phone || "",
      tasker_created_at: tasker?.created_at || new Date().toISOString(),
      tasker_role: tasker?.role || "tasker",
      experience_level: taskerProfile?.experience_level || null,
      tasker_bio: taskerProfile?.bio || "",
      tasker_verification_status: tasker?.verification_status || "pending",
      service_radius_km: taskerProfile?.service_radius_km || 0,
      tasker_is_available: taskerProfile?.is_available ?? true,
      operation_hours: taskerProfile?.operation_hours || null,
      company_id: taskerProfile?.company_id || null,
      tasker_rating: (stats?.tasker_rating || 0).toString(),
      total_reviews: stats?.total_reviews || 0,
      completed_jobs: stats?.completed_jobs || 0,
      total_earnings: (stats?.total_earnings || 0).toString(),
      response_time_hours: stats?.response_time_hours || 0,
      cancellation_rate: (stats?.cancellation_rate || 0).toString(),
      company_name: company?.company_name || null,
      company_city: company?.city || null,
      company_verification_status: company?.verification_status || null,
      is_available_for_booking: taskerProfile?.is_available ?? true,
      category_id: category?.id?.toString() || "",
      category_name_en: category?.name_en || "Unknown Category",
      category_name_fr: category?.name_fr || "",
      category_name_ar: category?.name_ar || "",
    };

    return { success: true, data: formattedData };
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
          tasker:users!tasker_services_tasker_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url,
            created_at,
            tasker_profile:tasker_profiles!tasker_profiles_id_fkey(
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

    // Fetch tasker profile for review stats (stored values, not calculated)
    const { data: taskerProfileData } = await supabase
      .from("tasker_profiles")
      .select("tasker_rating, total_reviews")
      .eq("id", taskerServiceData.tasker_id)
      .maybeSingle();

    // Fetch real completed jobs count (bookings + jobs with customer_confirmed_at)
    const [completedBookingsResult, completedJobsResult] = await Promise.all([
      supabase
        .from("service_bookings")
        .select("id, customer_confirmed_at")
        .eq("tasker_id", taskerServiceData.tasker_id)
        .eq("status", "completed"),
      supabase
        .from("jobs")
        .select("id, customer_confirmed_at")
        .eq("assigned_tasker_id", taskerServiceData.tasker_id)
        .eq("status", "completed"),
    ]);

    // Filter to only confirmed bookings/jobs (customer_confirmed_at IS NOT NULL)
    const confirmedBookings = (completedBookingsResult.data || []).filter(
      (b) => b.customer_confirmed_at !== null && b.customer_confirmed_at !== undefined
    );
    const confirmedJobs = (completedJobsResult.data || []).filter(
      (j) => j.customer_confirmed_at !== null && j.customer_confirmed_at !== undefined
    );
    const realCompletedJobs = confirmedBookings.length + confirmedJobs.length;

    // Use stored values from tasker_profiles (calculated when review is created)
    const totalReviews = taskerProfileData?.total_reviews || 0;
    const taskerRating = taskerProfileData?.tasker_rating || null;

    // Transform tasker data to match interface
    const taskerData = (taskerServiceData as any).tasker;
    const taskerProfile = taskerData?.tasker_profile || null;

    console.log("[getTaskerServiceOffer] Raw tasker data:", {
      taskerData,
      taskerProfile,
      avatar_url: taskerData?.avatar_url,
    });

    const result: TaskerServiceOffer = {
      id: taskerServiceData.id.toString(),
      title: taskerServiceData.title || "",
      description: taskerServiceData.description || "",
      price: taskerServiceData.price || taskerServiceData.base_price || 0,
      pricing_type: taskerServiceData.pricing_type || "fixed",
      minimum_duration: taskerServiceData.minimum_duration || null,
      service_area: taskerServiceData.service_area || null,
      portfolio_images: taskerServiceData.portfolio_images || null,
      created_at: taskerServiceData.created_at || new Date().toISOString(),
      tasker: {
        id: taskerData?.id || taskerServiceData.tasker_id,
        first_name: taskerData?.first_name || null,
        last_name: taskerData?.last_name || null,
        avatar_url: taskerData?.avatar_url || null,
        created_at: taskerData?.created_at || new Date().toISOString(),
        profile: taskerProfile ? {
          bio: taskerProfile.bio || null,
          experience_level: taskerProfile.experience_level || null,
        } : null,
      },
      stats: {
        tasker_rating: taskerRating, // Use real-time calculation from reviews table
        completed_jobs: realCompletedJobs, // Use real count instead of user_stats
        total_reviews: totalReviews, // Use real-time count from reviews table
        response_time_hours: statsData?.response_time_hours || null,
      },
    };

    console.log("[getTaskerServiceOffer] Final result tasker avatar_url:", result.tasker.avatar_url);

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
    // base_price is NOT NULL in the database, so we must provide it
    // For fixed and per_item pricing, use base_price
    // For hourly pricing, use hourly_rate as base_price (or set a default)
    const basePrice = serviceData.pricing_type === "hourly" 
      ? (serviceData.hourly_rate || 0) 
      : (serviceData.base_price || 0);

    // Convert minimum_booking_hours to integer for minimum_duration
    // minimum_duration is INTEGER in database, so we need to round decimal values
    // If user enters 0.5 hours, we round to 1 hour (or convert to minutes if needed)
    const minimumDuration = serviceData.minimum_booking_hours 
      ? Math.round(serviceData.minimum_booking_hours) 
      : null;

    const { data, error } = await supabase
      .from("tasker_services")
      .insert({
        tasker_id: user.id,
        title: serviceData.title,
        description: serviceData.description,
        service_id: serviceData.service_id,
        service_area: serviceData.service_area,
        pricing_type: serviceData.pricing_type,
        base_price: basePrice, // Required field
        hourly_rate: serviceData.hourly_rate || null,
        price: serviceData.base_price || serviceData.hourly_rate,
        minimum_duration: minimumDuration,
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
