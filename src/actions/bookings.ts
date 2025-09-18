"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { BookingStatus } from "@/types/supabase";

export interface BookingWithDetails {
  id: string;
  customer_id: string;
  tasker_id: string;
  tasker_service_id: string;
  booking_type: "instant" | "scheduled" | "recurring";
  scheduled_date: string | null;
  scheduled_time_start: string | null;
  scheduled_time_end: string | null;
  estimated_duration: number | null;
  address_id: string;
  service_address: string | null;
  agreed_price: number;
  currency: string;
  status: BookingStatus;
  accepted_at: string | null;
  confirmed_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  customer_requirements: string | null;
  created_at: string;
  updated_at: string;
  payment_method: "cash" | "online" | "wallet" | "pending";
  cancellation_fee: number;
  // Joined data
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_avatar: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  tasker_first_name: string | null;
  tasker_last_name: string | null;
  tasker_avatar: string | null;
  service_title: string | null;
  category_name: string | null;
  street_address: string | null;
  city: string | null;
  region: string | null;
}

export async function getTaskerBookings(
  taskerId: string,
  limit: number = 20,
  offset: number = 0,
  includeTotal: boolean = true
): Promise<{
  bookings: BookingWithDetails[];
  total: number;
  hasMore: boolean;
}> {
  const supabase = await createClient();

  // Get total count only when needed (for initial load or when includeTotal is true)
  let total = 0;
  if (includeTotal || offset === 0) {
    const { count, error: countError } = await supabase
      .from("service_bookings")
      .select("*", { count: "exact", head: true })
      .eq("tasker_id", taskerId);

    if (countError) {
      console.error("Error fetching bookings count:", countError);
      throw new Error(`Failed to fetch bookings count: ${countError.message}`);
    }
    total = count || 0;
  }

  // Get bookings with pagination - fetch one extra to determine if there are more
  const { data, error } = await supabase
    .from("service_bookings")
    .select(
      `
      *,
      customer:users!service_bookings_customer_id_fkey(
        first_name,
        last_name,
        avatar_url,
        email,
        phone
      ),
      tasker:users!service_bookings_tasker_id_fkey(
        first_name,
        last_name,
        avatar_url
      ),
      tasker_service:tasker_services(
        title,
        description
      ),
      address:addresses(
        street_address,
        city,
        region
      )
    `
    )
    .eq("tasker_id", taskerId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);

  if (error) {
    console.error("Error fetching bookings:", error);
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  // Check if there are more items
  const hasMore = data.length > limit;
  const bookings = data.slice(0, limit); // Remove the extra item if it exists

  const formattedBookings = bookings.map((booking) => ({
    ...booking,
    customer_first_name: booking.customer?.first_name,
    customer_last_name: booking.customer?.last_name,
    customer_avatar: booking.customer?.avatar_url,
    customer_email: booking.customer?.email,
    customer_phone: booking.customer?.phone,
    tasker_first_name: booking.tasker?.first_name,
    tasker_last_name: booking.tasker?.last_name,
    tasker_avatar: booking.tasker?.avatar_url,
    service_title: booking.tasker_service?.title,
    category_name: null,
    street_address: booking.address?.street_address,
    city: booking.address?.city,
    region: booking.address?.region,
  }));

  return {
    bookings: formattedBookings,
    total,
    hasMore,
  };
}

export async function getBookingById(
  bookingId: string
): Promise<BookingWithDetails | null> {
  const supabase = await createClient();

  // Get the authenticated user for authorization
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User not authenticated:", userError);
    return null;
  }

  const { data, error } = await supabase
    .from("service_bookings")
    .select(
      `
      *,
      customer:users!service_bookings_customer_id_fkey(
        first_name,
        last_name,
        avatar_url,
        email,
        phone
      ),
      tasker:users!service_bookings_tasker_id_fkey(
        first_name,
        last_name,
        avatar_url
      ),
      tasker_service:tasker_services(
        title,
        description
      ),
      address:addresses(
        street_address,
        city,
        region,
        postal_code,
        country
      )
    `
    )
    .eq("id", bookingId)
    .single();

  if (error) {
    console.error("Error fetching booking:", error);
    return null;
  }

  // Server-side authorization: Check if the user is either the customer or tasker
  if (data.customer_id !== user.id && data.tasker_id !== user.id) {
    console.error("Unauthorized access to booking:", {
      bookingId,
      userId: user.id,
      customerId: data.customer_id,
      taskerId: data.tasker_id,
    });
    return null;
  }

  return {
    ...data,
    customer_first_name: data.customer?.first_name,
    customer_last_name: data.customer?.last_name,
    customer_avatar: data.customer?.avatar_url,
    customer_email: data.customer?.email,
    customer_phone: data.customer?.phone,
    tasker_first_name: data.tasker?.first_name,
    tasker_last_name: data.tasker?.last_name,
    tasker_avatar: data.tasker?.avatar_url,
    service_title: data.tasker_service?.title,
    category_name: null,
    street_address: data.address?.street_address,
    city: data.address?.city,
    region: data.address?.region,
  };
}

export async function getCustomerBookings(
  customerId: string,
  limit: number = 20,
  offset: number = 0,
  includeTotal: boolean = true
): Promise<{
  bookings: BookingWithDetails[];
  total: number;
  hasMore: boolean;
}> {
  const supabase = await createClient();

  // Get total count only when needed (for initial load or when includeTotal is true)
  let total = 0;
  if (includeTotal || offset === 0) {
    const { count, error: countError } = await supabase
      .from("service_bookings")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    if (countError) {
      console.error("Error fetching customer bookings count:", countError);
      throw new Error(
        `Failed to fetch customer bookings count: ${countError.message}`
      );
    }
    total = count || 0;
  }

  // Get bookings with pagination - fetch one extra to determine if there are more
  const { data, error } = await supabase
    .from("service_bookings")
    .select(
      `
      *,
      customer:users!service_bookings_customer_id_fkey(
        first_name,
        last_name,
        avatar_url,
        email,
        phone
      ),
      tasker:users!service_bookings_tasker_id_fkey(
        first_name,
        last_name,
        avatar_url
      ),
      tasker_service:tasker_services(
        title,
        description
      ),
      address:addresses(
        street_address,
        city,
        region
      )
    `
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);

  if (error) {
    console.error("Error fetching customer bookings:", error);
    throw new Error(`Failed to fetch customer bookings: ${error.message}`);
  }

  // Check if there are more items by fetching one extra record
  const hasMore = data.length > limit;
  const bookings = hasMore ? data.slice(0, limit) : data; // Remove the extra item if it exists

  // Ensure hasMore is false if we have no bookings at all
  const finalHasMore = bookings.length > 0 ? hasMore : false;

  const formattedBookings = bookings.map((booking) => ({
    ...booking,
    customer_first_name: booking.customer?.first_name,
    customer_last_name: booking.customer?.last_name,
    customer_avatar: booking.customer?.avatar_url,
    customer_email: booking.customer?.email,
    customer_phone: booking.customer?.phone,
    tasker_first_name: booking.tasker?.first_name,
    tasker_last_name: booking.tasker?.last_name,
    tasker_avatar: booking.tasker?.avatar_url,
    service_title: booking.tasker_service?.title,
    category_name: null,
    street_address: booking.address?.street_address,
    city: booking.address?.city,
    region: booking.address?.region,
  }));

  return {
    bookings: formattedBookings,
    total,
    hasMore: finalHasMore,
  };
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  taskerId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Verify the booking belongs to the tasker
  const { data: booking, error: fetchError } = await supabase
    .from("service_bookings")
    .select("tasker_id, status")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    return { success: false, error: "Booking not found" };
  }

  if (booking.tasker_id !== taskerId) {
    return { success: false, error: "Unauthorized" };
  }

  // Prepare update data based on status
  const updateData: Record<string, unknown> = { status };

  switch (status) {
    case "accepted":
      updateData.accepted_at = new Date().toISOString();
      break;
    case "confirmed":
      updateData.confirmed_at = new Date().toISOString();
      break;
    case "in_progress":
      updateData.started_at = new Date().toISOString();
      break;
    case "completed":
      updateData.completed_at = new Date().toISOString();
      break;
    case "cancelled":
      updateData.cancelled_at = new Date().toISOString();
      updateData.cancelled_by = taskerId;
      break;
  }

  const { error } = await supabase
    .from("service_bookings")
    .update(updateData)
    .eq("id", bookingId);

  if (error) {
    console.error("Error updating booking status:", error);
    return {
      success: false,
      error: `Failed to update booking status: ${error.message}`,
    };
  }

  revalidatePath("/tasker/bookings");
  revalidatePath(`/tasker/bookings/${bookingId}`);

  return { success: true };
}

export async function cancelCustomerBooking(
  bookingId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Get the authenticated user for authorization
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "User not authenticated" };
  }

  // Verify the booking belongs to the customer
  const { data: booking, error: fetchError } = await supabase
    .from("service_bookings")
    .select("customer_id, status")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    return { success: false, error: "Booking not found" };
  }

  // Server-side authorization: Check if the user is the customer
  if (booking.customer_id !== user.id) {
    console.error("Unauthorized cancellation attempt:", {
      bookingId,
      userId: user.id,
      customerId: booking.customer_id,
    });
    return { success: false, error: "Unauthorized" };
  }

  // Check if booking can be cancelled
  if (["completed", "cancelled", "disputed"].includes(booking.status)) {
    return { success: false, error: "Cannot cancel booking in current status" };
  }

  // Prepare update data
  const updateData = {
    status: "cancelled" as BookingStatus,
    cancelled_at: new Date().toISOString(),
    cancelled_by: user.id,
    cancellation_reason: reason || "Cancelled by customer",
  };

  const { error } = await supabase
    .from("service_bookings")
    .update(updateData)
    .eq("id", bookingId);

  if (error) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      error: `Failed to cancel booking: ${error.message}`,
    };
  }

  revalidatePath("/customer/bookings");
  revalidatePath(`/customer/bookings/${bookingId}`);

  return { success: true };
}

// Create a new service booking
export interface CreateBookingData {
  tasker_service_id: string;
  booking_type: "instant" | "scheduled" | "recurring";
  scheduled_date?: string;
  scheduled_time_start?: string;
  scheduled_time_end?: string;
  estimated_duration?: number;
  address_id?: string;
  service_address?: string;
  agreed_price: number;
  customer_requirements?: string;
  payment_method?: "cash" | "online" | "wallet" | "pending";
}

// Enhanced booking validation result
interface BookingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Enhanced validation function for booking data
async function validateBookingData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bookingData: CreateBookingData
): Promise<BookingValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get the authenticated user
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    errors.push("Authentication required");
    return { isValid: false, errors, warnings };
  }

  const customerId = authUser.id;

  // Basic field validation
  if (!bookingData.tasker_service_id) {
    errors.push("Service ID is required");
  }

  if (!bookingData.agreed_price || bookingData.agreed_price <= 0) {
    errors.push("Valid price is required");
  }

  if (bookingData.booking_type === "scheduled") {
    if (!bookingData.scheduled_date) {
      errors.push("Scheduled date is required for scheduled bookings");
    }
    if (!bookingData.scheduled_time_start) {
      errors.push("Start time is required for scheduled bookings");
    }
    if (!bookingData.scheduled_time_end) {
      errors.push("End time is required for scheduled bookings");
    }
  }

  // Get service details for validation
  const { data: serviceData, error: serviceError } = await supabase
    .from("tasker_services")
    .select(
      "tasker_id, title, price, pricing_type, service_status, minimum_duration"
    )
    .eq("id", bookingData.tasker_service_id)
    .single();

  if (serviceError || !serviceData) {
    errors.push("Service not found or unavailable");
    return { isValid: false, errors, warnings };
  }

  // Prevent self-booking
  if (serviceData.tasker_id === customerId) {
    errors.push("You cannot book your own service");
    return { isValid: false, errors, warnings };
  }

  // Service status validation
  if (serviceData.service_status !== "active") {
    errors.push("Service is not currently available");
  }

  // Price validation
  if (bookingData.agreed_price < serviceData.price) {
    warnings.push("Agreed price is lower than the service's base price");
  }

  // Duration validation for hourly services
  if (serviceData.pricing_type === "hourly") {
    if (
      !bookingData.estimated_duration ||
      bookingData.estimated_duration <= 0
    ) {
      errors.push("Duration is required for hourly services");
    }
    if (
      serviceData.minimum_duration &&
      bookingData.estimated_duration &&
      bookingData.estimated_duration < serviceData.minimum_duration
    ) {
      errors.push(`Minimum duration is ${serviceData.minimum_duration} hours`);
    }
  }

  // Check for existing pending bookings
  const { data: existingBooking } = await supabase
    .from("service_bookings")
    .select("id, status")
    .eq("customer_id", customerId)
    .eq("tasker_service_id", bookingData.tasker_service_id)
    .in("status", ["pending", "accepted", "confirmed"])
    .single();

  if (existingBooking) {
    errors.push("You already have a pending booking for this service");
  }

  // Address validation
  if (!bookingData.address_id) {
    const { data: customerAddresses } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", customerId)
      .limit(1);

    if (!customerAddresses || customerAddresses.length === 0) {
      errors.push(
        "No address found. Please add an address to your profile first"
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export async function createServiceBooking(
  bookingData: CreateBookingData
): Promise<{
  success: boolean;
  bookingId?: string;
  error?: string;
  warnings?: string[];
}> {
  const supabase = await createClient();

  try {
    // Get the authenticated user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return { success: false, error: "Authentication required" };
    }

    const customerId = authUser.id;

    // Enhanced validation
    const validation = await validateBookingData(supabase, bookingData);

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(". ") + ".",
        warnings: validation.warnings,
      };
    }

    // Get tasker service details
    const { data: serviceData, error: serviceError } = await supabase
      .from("tasker_services")
      .select("tasker_id, title, price, pricing_type")
      .eq("id", bookingData.tasker_service_id)
      .single();

    if (serviceError || !serviceData) {
      return { success: false, error: "Service not found" };
    }

    // Get customer's default address if no address_id provided
    let addressId = bookingData.address_id;
    if (!addressId) {
      const { data: defaultAddress, error: addressError } = await supabase
        .from("addresses")
        .select("id")
        .eq("user_id", customerId)
        .eq("is_default", true)
        .single();

      if (addressError || !defaultAddress) {
        // If no default address, get any address for the user
        const { data: anyAddress, error: anyAddressError } = await supabase
          .from("addresses")
          .select("id")
          .eq("user_id", customerId)
          .limit(1)
          .single();

        if (anyAddressError || !anyAddress) {
          return {
            success: false,
            error:
              "No address found. Please add an address to your profile first.",
          };
        }
        addressId = anyAddress.id;
      } else {
        addressId = defaultAddress.id;
      }
    }

    // Validate scheduled date is not in the past
    if (
      bookingData.booking_type === "scheduled" &&
      bookingData.scheduled_date
    ) {
      const scheduledDate = new Date(bookingData.scheduled_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (scheduledDate < today) {
        return {
          success: false,
          error: "Scheduled date cannot be in the past",
        };
      }
    }

    // Create the booking with enhanced data
    const { data: booking, error: bookingError } = await supabase
      .from("service_bookings")
      .insert({
        customer_id: customerId,
        tasker_id: serviceData.tasker_id,
        tasker_service_id: bookingData.tasker_service_id,
        booking_type: bookingData.booking_type,
        scheduled_date: bookingData.scheduled_date || null,
        scheduled_time_start: bookingData.scheduled_time_start || null,
        scheduled_time_end: bookingData.scheduled_time_end || null,
        estimated_duration: bookingData.estimated_duration || null,
        address_id: addressId,
        service_address: bookingData.service_address || null,
        agreed_price: bookingData.agreed_price,
        currency: "MAD", // Using database default currency
        status: "pending",
        customer_requirements: bookingData.customer_requirements || null,
        payment_method: bookingData.payment_method || "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (bookingError) {
      console.error("Error creating booking:", bookingError);

      // Handle specific database errors
      if (bookingError.code === "23505") {
        return {
          success: false,
          error: "A booking for this service already exists",
        };
      }

      return {
        success: false,
        error: `Failed to create booking: ${bookingError.message}`,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/customer/bookings");
    revalidatePath("/tasker/bookings");
    revalidatePath("/customer/dashboard");
    revalidatePath("/tasker/dashboard");

    return {
      success: true,
      bookingId: booking.id,
      warnings:
        validation.warnings.length > 0 ? validation.warnings : undefined,
    };
  } catch (error) {
    console.error("Error in createServiceBooking:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create booking",
    };
  }
}
