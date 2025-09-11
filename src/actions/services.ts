"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { TaskerService, ServiceStatus } from "@/types/supabase";

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

    // Format the data
    const services: ServiceWithDetails[] = (data || []).map((service) => ({
      ...service,
      booking_count: service.booking_count?.[0]?.count || 0,
    }));

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

    return {
      ...data,
      booking_count: data.booking_count?.[0]?.count || 0,
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
