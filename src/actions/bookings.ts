"use server";

import { createClient, createServiceRoleClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { BookingStatus } from "@/types/supabase";
import { getErrorTranslationForUser } from "@/lib/errors";

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
  customer_confirmed_at: string | null;
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
  tasker_email: string | null;
  tasker_phone: string | null;
  service_title: string | null;
  category_name: string | null;
  street_address: string | null;
  city: string | null;
  region: string | null;
}

export async function getTaskerBookings(
  limit: number = 10,
  offset: number = 0,
  includeTotal: boolean = true
): Promise<{
  bookings: BookingWithDetails[];
  total: number;
  hasMore: boolean;
}> {
  const supabase = await createClient();

  // Get the authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "bookings",
      "notAuthenticated"
    );
    throw new Error(errorMessage);
  }

  const taskerId = user.id;

  // Get total count only when needed (for initial load or when includeTotal is true)
  let total = 0;
  if (includeTotal || offset === 0) {
    const { count, error: countError } = await supabase
      .from("service_bookings")
      .select("*", { count: "exact", head: true })
      .eq("tasker_id", taskerId);

    if (countError) {
      console.error("Error fetching bookings count:", countError);
      const errorMessage = await getErrorTranslationForUser(
        taskerId,
        "bookings",
        "failedToFetchBookingsCount"
      );
      throw new Error(errorMessage);
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
        avatar_url,
        email,
        phone
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
    const errorMessage = await getErrorTranslationForUser(
      taskerId,
      "bookings",
      "failedToFetchBookings"
    );
    throw new Error(errorMessage);
  }

  // Check if there are more items
  const hasMore = data.length > limit;
  const bookings = data.slice(0, limit); // Remove the extra item if it exists

  // Explicitly serialize all fields to ensure proper JSON serialization
  const formattedBookings: BookingWithDetails[] = bookings.map((booking: any) => {
    const customer = booking.customer || {};
    const tasker = booking.tasker || {};
    const taskerService = booking.tasker_service || {};
    const address = booking.address || {};

    return {
      id: String(booking.id),
      customer_id: String(booking.customer_id),
      tasker_id: String(booking.tasker_id),
      tasker_service_id: String(booking.tasker_service_id),
      booking_type: booking.booking_type as "instant" | "scheduled" | "recurring",
      scheduled_date: booking.scheduled_date ? new Date(booking.scheduled_date).toISOString() : null,
      scheduled_time_start: booking.scheduled_time_start ? String(booking.scheduled_time_start) : null,
      scheduled_time_end: booking.scheduled_time_end ? String(booking.scheduled_time_end) : null,
      estimated_duration: booking.estimated_duration ? Number(booking.estimated_duration) : null,
      address_id: String(booking.address_id),
      service_address: booking.service_address ? String(booking.service_address) : null,
      agreed_price: Number(booking.agreed_price || 0),
      currency: String(booking.currency || "MAD"),
      status: booking.status as BookingStatus,
      accepted_at: booking.accepted_at ? new Date(booking.accepted_at).toISOString() : null,
      confirmed_at: booking.confirmed_at ? new Date(booking.confirmed_at).toISOString() : null,
      started_at: booking.started_at ? new Date(booking.started_at).toISOString() : null,
      completed_at: booking.completed_at ? new Date(booking.completed_at).toISOString() : null,
      customer_confirmed_at: booking.customer_confirmed_at ? new Date(booking.customer_confirmed_at).toISOString() : null,
      cancelled_at: booking.cancelled_at ? new Date(booking.cancelled_at).toISOString() : null,
      cancelled_by: booking.cancelled_by ? String(booking.cancelled_by) : null,
      cancellation_reason: booking.cancellation_reason ? String(booking.cancellation_reason) : null,
      customer_requirements: booking.customer_requirements ? String(booking.customer_requirements) : null,
      created_at: booking.created_at ? new Date(booking.created_at).toISOString() : new Date().toISOString(),
      updated_at: booking.updated_at ? new Date(booking.updated_at).toISOString() : new Date().toISOString(),
      payment_method: booking.payment_method as "cash" | "online" | "wallet" | "pending",
      cancellation_fee: Number(booking.cancellation_fee || 0),
      // Joined data - explicitly serialize
      customer_first_name: customer.first_name ? String(customer.first_name) : null,
      customer_last_name: customer.last_name ? String(customer.last_name) : null,
      customer_avatar: customer.avatar_url ? String(customer.avatar_url) : null,
      customer_email: customer.email ? String(customer.email) : null,
      customer_phone: customer.phone ? String(customer.phone) : null,
      tasker_first_name: tasker.first_name ? String(tasker.first_name) : null,
      tasker_last_name: tasker.last_name ? String(tasker.last_name) : null,
      tasker_avatar: tasker.avatar_url ? String(tasker.avatar_url) : null,
      tasker_email: tasker.email ? String(tasker.email) : null,
      tasker_phone: tasker.phone ? String(tasker.phone) : null,
      service_title: taskerService.title ? String(taskerService.title) : null,
      category_name: null,
      street_address: address.street_address ? String(address.street_address) : null,
      city: address.city ? String(address.city) : null,
      region: address.region ? String(address.region) : null,
    };
  });

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
        avatar_url,
        email,
        phone
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

  // Explicitly serialize all fields to ensure proper JSON serialization
  // Remove nested objects (customer, tasker, tasker_service, address) to avoid serialization issues
  const customer = data.customer || {};
  const tasker = data.tasker || {};
  const taskerService = data.tasker_service || {};
  const address = data.address || {};

  return {
    id: String(data.id),
    customer_id: String(data.customer_id),
    tasker_id: String(data.tasker_id),
    tasker_service_id: String(data.tasker_service_id),
    booking_type: data.booking_type as "instant" | "scheduled" | "recurring",
    scheduled_date: data.scheduled_date ? new Date(data.scheduled_date).toISOString() : null,
    scheduled_time_start: data.scheduled_time_start ? String(data.scheduled_time_start) : null,
    scheduled_time_end: data.scheduled_time_end ? String(data.scheduled_time_end) : null,
    estimated_duration: data.estimated_duration ? Number(data.estimated_duration) : null,
    address_id: String(data.address_id),
    service_address: data.service_address ? String(data.service_address) : null,
    agreed_price: Number(data.agreed_price || 0),
    currency: String(data.currency || "MAD"),
    status: data.status as BookingStatus,
    accepted_at: data.accepted_at ? new Date(data.accepted_at).toISOString() : null,
    confirmed_at: data.confirmed_at ? new Date(data.confirmed_at).toISOString() : null,
    started_at: data.started_at ? new Date(data.started_at).toISOString() : null,
    completed_at: data.completed_at ? new Date(data.completed_at).toISOString() : null,
    customer_confirmed_at: data.customer_confirmed_at ? new Date(data.customer_confirmed_at).toISOString() : null,
    cancelled_at: data.cancelled_at ? new Date(data.cancelled_at).toISOString() : null,
    cancelled_by: data.cancelled_by ? String(data.cancelled_by) : null,
    cancellation_reason: data.cancellation_reason ? String(data.cancellation_reason) : null,
    customer_requirements: data.customer_requirements ? String(data.customer_requirements) : null,
    created_at: data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString(),
    updated_at: data.updated_at ? new Date(data.updated_at).toISOString() : new Date().toISOString(),
    payment_method: data.payment_method as "cash" | "online" | "wallet" | "pending",
    cancellation_fee: Number(data.cancellation_fee || 0),
    // Joined data - explicitly serialize
    customer_first_name: customer.first_name ? String(customer.first_name) : null,
    customer_last_name: customer.last_name ? String(customer.last_name) : null,
    customer_avatar: customer.avatar_url ? String(customer.avatar_url) : null,
    customer_email: customer.email ? String(customer.email) : null,
    customer_phone: customer.phone ? String(customer.phone) : null,
    tasker_first_name: tasker.first_name ? String(tasker.first_name) : null,
    tasker_last_name: tasker.last_name ? String(tasker.last_name) : null,
    tasker_avatar: tasker.avatar_url ? String(tasker.avatar_url) : null,
    tasker_email: tasker.email ? String(tasker.email) : null,
    tasker_phone: tasker.phone ? String(tasker.phone) : null,
    service_title: taskerService.title ? String(taskerService.title) : null,
    category_name: null,
    street_address: address.street_address ? String(address.street_address) : null,
    city: address.city ? String(address.city) : null,
    region: address.region ? String(address.region) : null,
  };
}

export async function getCustomerBookings(
  limit: number = 10,
  offset: number = 0,
  includeTotal: boolean = true
): Promise<{
  bookings: BookingWithDetails[];
  total: number;
  hasMore: boolean;
}> {
  const supabase = await createClient();

  // Get the authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "bookings",
      "notAuthenticated"
    );
    throw new Error(errorMessage);
  }

  const customerId = user.id;

  // Get total count only when needed (for initial load or when includeTotal is true)
  let total = 0;
  if (includeTotal || offset === 0) {
    const { count, error: countError } = await supabase
      .from("service_bookings")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    if (countError) {
      console.error("Error fetching customer bookings count:", countError);
      const errorMessage = await getErrorTranslationForUser(
        customerId,
        "bookings",
        "failedToFetchBookingsCount"
      );
      throw new Error(errorMessage);
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
        avatar_url,
        email,
        phone
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
    const errorMessage = await getErrorTranslationForUser(
      customerId,
      "bookings",
      "failedToFetchBookings"
    );
    throw new Error(errorMessage);
  }

  // Check if there are more items by fetching one extra record
  const hasMore = data.length > limit;
  const bookings = hasMore ? data.slice(0, limit) : data; // Remove the extra item if it exists

  // Ensure hasMore is false if we have no bookings at all
  const finalHasMore = bookings.length > 0 ? hasMore : false;

  // Format bookings and ensure all data is serializable
  // Handle cases where relations might be arrays instead of objects
  const formattedBookings = bookings.map((booking) => {
    // Handle customer - can be object or array (Supabase foreign key relations)
    const customer = Array.isArray(booking.customer) 
      ? booking.customer[0] 
      : booking.customer;
    
    // Handle tasker - can be object or array
    const tasker = Array.isArray(booking.tasker) 
      ? booking.tasker[0] 
      : booking.tasker;
    
    // Handle tasker_service - can be object or array
    const taskerService = Array.isArray(booking.tasker_service) 
      ? booking.tasker_service[0] 
      : booking.tasker_service;
    
    // Handle address - can be object or array
    const address = Array.isArray(booking.address) 
      ? booking.address[0] 
      : booking.address;

    // Return only serializable fields (no spread of complex Supabase objects)
    // This prevents "An unexpected response was received from the server" errors
    // Explicitly serialize all fields to ensure proper JSON serialization
    return {
      id: String(booking.id),
      customer_id: String(booking.customer_id),
      tasker_id: String(booking.tasker_id),
      tasker_service_id: String(booking.tasker_service_id),
      booking_type: booking.booking_type as "instant" | "scheduled" | "recurring",
      scheduled_date: booking.scheduled_date ? new Date(booking.scheduled_date).toISOString() : null,
      scheduled_time_start: booking.scheduled_time_start ? String(booking.scheduled_time_start) : null,
      scheduled_time_end: booking.scheduled_time_end ? String(booking.scheduled_time_end) : null,
      estimated_duration: booking.estimated_duration ? Number(booking.estimated_duration) : null,
      address_id: String(booking.address_id),
      service_address: booking.service_address ? String(booking.service_address) : null,
      agreed_price: typeof booking.agreed_price === 'string' 
        ? parseFloat(booking.agreed_price) 
        : Number(booking.agreed_price || 0),
      currency: String(booking.currency || 'MAD'),
      status: booking.status as BookingStatus,
      accepted_at: booking.accepted_at ? new Date(booking.accepted_at).toISOString() : null,
      confirmed_at: booking.confirmed_at ? new Date(booking.confirmed_at).toISOString() : null,
      started_at: booking.started_at ? new Date(booking.started_at).toISOString() : null,
      completed_at: booking.completed_at ? new Date(booking.completed_at).toISOString() : null,
      customer_confirmed_at: booking.customer_confirmed_at ? new Date(booking.customer_confirmed_at).toISOString() : null,
      cancelled_at: booking.cancelled_at ? new Date(booking.cancelled_at).toISOString() : null,
      cancelled_by: booking.cancelled_by ? String(booking.cancelled_by) : null,
      cancellation_reason: booking.cancellation_reason ? String(booking.cancellation_reason) : null,
      customer_requirements: booking.customer_requirements ? String(booking.customer_requirements) : null,
      created_at: booking.created_at ? new Date(booking.created_at).toISOString() : new Date().toISOString(),
      updated_at: booking.updated_at ? new Date(booking.updated_at).toISOString() : new Date().toISOString(),
      payment_method: booking.payment_method as "cash" | "online" | "wallet" | "pending",
      cancellation_fee: typeof booking.cancellation_fee === 'string'
        ? parseFloat(booking.cancellation_fee)
        : Number(booking.cancellation_fee || 0),
      // Extracted relation data (ensure all values are serializable)
      customer_first_name: customer?.first_name ? String(customer.first_name) : null,
      customer_last_name: customer?.last_name ? String(customer.last_name) : null,
      customer_avatar: customer?.avatar_url ? String(customer.avatar_url) : null,
      customer_email: customer?.email ? String(customer.email) : null,
      customer_phone: customer?.phone ? String(customer.phone) : null,
      tasker_first_name: tasker?.first_name ? String(tasker.first_name) : null,
      tasker_last_name: tasker?.last_name ? String(tasker.last_name) : null,
      tasker_avatar: tasker?.avatar_url ? String(tasker.avatar_url) : null,
      tasker_email: tasker?.email ? String(tasker.email) : null,
      tasker_phone: tasker?.phone ? String(tasker.phone) : null,
      service_title: taskerService?.title ? String(taskerService.title) : null,
      category_name: null,
      street_address: address?.street_address ? String(address.street_address) : null,
      city: address?.city ? String(address.city) : null,
      region: address?.region ? String(address.region) : null,
    };
  });

  return {
    bookings: formattedBookings,
    total,
    hasMore: finalHasMore,
  };
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Get the authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "User not authenticated" };
  }

  const taskerId = user.id;

  // Verify the booking belongs to the tasker
  const { data: booking, error: fetchError } = await supabase
    .from("service_bookings")
    .select("tasker_id, status")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "bookings",
      "bookingNotFound"
    );
    return { success: false, error: errorMessage };
  }

  if (booking.tasker_id !== taskerId) {
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "bookings",
      "unauthorized"
    );
    return { success: false, error: errorMessage };
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
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "bookings",
      "bookingNotFound"
    );
    return { success: false, error: errorMessage };
  }

  // Server-side authorization: Check if the user is the customer
  if (booking.customer_id !== user.id) {
    console.error("Unauthorized cancellation attempt:", {
      bookingId,
      userId: user.id,
      customerId: booking.customer_id,
    });
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "bookings",
      "unauthorized"
    );
    return { success: false, error: errorMessage };
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

  // Use service role client to bypass RLS for customer cancellation
  // This is safe because we've already verified the customer owns the booking
  const serviceClient = createServiceRoleClient();
  if (!serviceClient) {
    // Fallback to regular client if service role is not available
    const { error } = await supabase
      .from("service_bookings")
      .update(updateData)
      .eq("id", bookingId)
      .eq("customer_id", user.id); // Additional check for RLS

    if (error) {
      console.error("Error cancelling booking:", error);
      return {
        success: false,
        error: `Failed to cancel booking: ${error.message}`,
      };
    }
  } else {
    // Use service role client to bypass RLS
    const { error } = await serviceClient
      .from("service_bookings")
      .update(updateData)
      .eq("id", bookingId)
      .eq("customer_id", user.id); // Still verify customer ownership

    if (error) {
      console.error("Error cancelling booking:", error);
      return {
        success: false,
        error: `Failed to cancel booking: ${error.message}`,
      };
    }
  }

  revalidatePath("/customer/bookings");
  revalidatePath(`/customer/bookings/${bookingId}`);

  return { success: true };
}

/**
 * Confirm booking completion by customer
 * Similar to confirmJobCompletion - processes payment after customer confirms
 */
export async function confirmBookingCompletion(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Get the current user (customer)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required" };
    }

    const customerId = user.id;

    // Get the booking and verify it belongs to this customer
    const { data: booking, error: fetchError } = await supabase
      .from("service_bookings")
      .select(
        `
        id,
        customer_id,
        status,
        completed_at,
        customer_confirmed_at,
        agreed_price,
        currency,
        tasker_id,
        tasker_service:tasker_services(title)
      `
      )
      .eq("id", bookingId)
      .single();

    console.log("📋 Booking data fetched:", {
      bookingId,
      hasBooking: !!booking,
      status: booking?.status,
      taskerId: booking?.tasker_id,
      agreedPrice: booking?.agreed_price,
      completedAt: booking?.completed_at,
      customerConfirmedAt: booking?.customer_confirmed_at,
    });

    if (fetchError || !booking) {
      const errorMessage = await getErrorTranslationForUser(
      undefined,
      "bookings",
      "bookingNotFound"
    );
    return { success: false, error: errorMessage };
    }

    // Verify the booking belongs to this customer
    if (booking.customer_id !== customerId) {
      return {
        success: false,
        error: "You are not authorized to confirm this booking",
      };
    }

    // Verify the booking status is 'completed'
    if (booking.status !== "completed") {
      return {
        success: false,
        error: `Booking must be in 'completed' status to confirm. Current status: ${booking.status}`,
      };
    }

    // Verify the booking has been completed by the tasker
    if (!booking.completed_at) {
      return {
        success: false,
        error: "The tasker has not yet completed this booking",
      };
    }

    // Verify the booking hasn't already been confirmed
    if (booking.customer_confirmed_at) {
      return {
        success: false,
        error: "This booking has already been confirmed",
      };
    }

    // Get tasker's current wallet balance for payment processing
    const { data: taskerData, error: taskerError } = await supabase
      .from("users")
      .select("wallet_balance")
      .eq("id", booking.tasker_id)
      .single();

    if (taskerError) {
      console.error("Error fetching tasker wallet balance:", taskerError);
    }

    const taskerWalletBalance = taskerData?.wallet_balance || 0;

    // Update the booking: set customer_confirmed_at
    // IMPORTANT: Do this BEFORE payment processing to ensure atomicity
    const { error: updateError } = await supabase
      .from("service_bookings")
      .update({
        customer_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .eq("customer_id", customerId) // Ensure customer owns this booking
      .is("customer_confirmed_at", null); // Only update if not already confirmed

    if (updateError) {
      console.error("❌ Error confirming booking completion:", {
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint,
        bookingId,
        customerId,
      });
      return {
        success: false,
        error: `Failed to confirm booking completion: ${updateError.message}${updateError.hint ? ` (${updateError.hint})` : ""}`,
      };
    }

    console.log("✅ Booking confirmed: customer_confirmed_at set");

    // --- Payment Processing ---
    // Extract values to avoid serialization issues with nested objects
    const taskerId = String(booking.tasker_id || "");
    const agreedPrice = Number(booking.agreed_price || 0);
    const currency = String(booking.currency || "MAD");
    
    // Get service title safely
    let serviceTitle = "the service";
    if (booking.tasker_service) {
      const taskerService = booking.tasker_service as any;
      serviceTitle = String(taskerService?.title || "the service");
    }

    console.log("💳 Checking payment conditions:", {
      hasTaskerId: !!taskerId,
      hasAgreedPrice: !!agreedPrice,
      taskerId,
      agreedPrice,
    });

    if (taskerId && agreedPrice > 0) {
      const platformFeeRate = 0.10; // 10% platform fee
      const totalAmount = agreedPrice;
      const platformFee = totalAmount * platformFeeRate;
      const netAmount = totalAmount - platformFee;

      console.log("💰 Processing payment for booking:", {
        bookingId,
        taskerId,
        customerId,
        totalAmount,
        platformFee,
        netAmount,
        currentWalletBalance: taskerWalletBalance,
      });

      // 1. Create a transaction record
      // Note: job_id should be nullable (run fix_transactions_for_bookings.sql if this fails)
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          job_id: null, // No job_id for service bookings - must be nullable in DB
          booking_id: bookingId,
          payer_id: customerId,
          payee_id: taskerId,
          transaction_type: "job_payment", // Utiliser job_payment pour tous (bookings, services, jobs)
          amount: totalAmount,
          platform_fee: platformFee,
          payment_status: "paid",
          processed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (transactionError) {
        console.error("❌ Error creating transaction for booking completion:", {
          message: transactionError.message,
          code: transactionError.code,
          details: transactionError.details,
          hint: transactionError.hint,
          bookingId,
          taskerId,
          customerId,
          totalAmount,
        });
        
        // The most common error is job_id NOT NULL constraint
        if (transactionError.code === "23502" || transactionError.message.includes("null value") || transactionError.message.includes("job_id")) {
          console.error("🚨 CRITICAL: Transaction creation failed because job_id is NOT NULL. Please run fix_transactions_for_bookings.sql to make job_id nullable.");
        }
      } else {
        console.log("✅ Transaction created successfully:", transaction);
      }

      // 2. Update tasker's wallet balance - DÉDUIRE les frais de plateforme
      // Le wallet est un crédit donné par l'admin, on déduit les frais à chaque transaction
      const newWalletBalance = taskerWalletBalance - platformFee;
      
      console.log(`[confirmBookingCompletion] Wallet update calculation:`, {
        taskerId,
        currentBalance: taskerWalletBalance,
        platformFee,
        newBalance: newWalletBalance,
        bookingId,
        transactionId: transaction?.id,
      });
      
      if (newWalletBalance < 0) {
        console.error("❌ CRITICAL: Wallet balance would be negative:", {
          taskerId,
          currentBalance: taskerWalletBalance,
          platformFee,
          newBalance: newWalletBalance,
        });
        return {
          success: false,
          error: `Insufficient wallet balance. Current: ${taskerWalletBalance} MAD, Fee: ${platformFee} MAD`,
        };
      }

      // Use service role client to bypass RLS for wallet updates
      // Fallback to regular client if service role is not available
      let walletUpdateError;
      let walletUpdateSuccess = false;
      
      const serviceSupabase = createServiceRoleClient();
      if (serviceSupabase) {
        // Service role client is available - use it (bypasses RLS)
        try {
          console.log(`[confirmBookingCompletion] Attempting wallet update with service role client for tasker ${taskerId}`);
          const result = await serviceSupabase
            .from("users")
            .update({ wallet_balance: newWalletBalance })
            .eq("id", taskerId)
            .select("wallet_balance");
          walletUpdateError = result.error;
          if (!walletUpdateError && result.data && result.data.length > 0) {
            walletUpdateSuccess = true;
            console.log(`[confirmBookingCompletion] ✅ Wallet updated successfully. New balance: ${result.data[0].wallet_balance}`);
          }
        } catch (serviceRoleError) {
          console.error("❌ Error using service role client:", serviceRoleError);
          walletUpdateError = serviceRoleError instanceof Error ? serviceRoleError : new Error(String(serviceRoleError));
        }
      }
      
      // If service role client is not available or failed, try with regular client (RLS must allow it)
      if (!walletUpdateSuccess && !serviceSupabase) {
        console.warn("⚠️ Service role client not available, attempting with regular client (RLS must allow wallet_balance updates)");
        const { error, data } = await supabase
          .from("users")
          .update({ wallet_balance: newWalletBalance })
          .eq("id", taskerId)
          .select("wallet_balance");
        walletUpdateError = error;
        if (!walletUpdateError && data && data.length > 0) {
          walletUpdateSuccess = true;
          console.log(`[confirmBookingCompletion] ✅ Wallet updated successfully with regular client. New balance: ${data[0].wallet_balance}`);
        } else if (walletUpdateError) {
          console.error("❌ Regular client also failed to update wallet:", walletUpdateError);
        }
      }

      if (walletUpdateError) {
        console.error("❌ CRITICAL: Error updating tasker wallet balance:", {
          error: walletUpdateError,
          errorMessage: walletUpdateError.message,
          errorCode: walletUpdateError.code,
          errorDetails: walletUpdateError.details,
          taskerId,
          currentBalance: taskerWalletBalance,
          platformFee,
          newBalance: newWalletBalance,
        });
        // Don't continue if wallet update fails - this is critical
        return {
          success: false,
          error: `Failed to update wallet: ${walletUpdateError.message}`,
        };
      }
      
      if (!walletUpdateSuccess) {
        console.error("❌ CRITICAL: Wallet update appeared to succeed but no data returned:", {
          taskerId,
          currentBalance: taskerWalletBalance,
          platformFee,
          newBalance: newWalletBalance,
          walletUpdateError,
        });
        // Verify the wallet was actually updated by fetching it
        try {
          const verifySupabase = createServiceRoleClient();
          const { data: verifyData, error: verifyError } = await verifySupabase
            .from("users")
            .select("wallet_balance")
            .eq("id", taskerId)
            .single();
          
          if (verifyError) {
            console.error("❌ CRITICAL: Could not verify wallet update:", verifyError);
            return {
              success: false,
              error: `Wallet update verification failed: ${verifyError.message}`,
            };
          }
          
          if (verifyData && parseFloat(String(verifyData.wallet_balance)) !== newWalletBalance) {
            console.error("❌ CRITICAL: Wallet was NOT updated correctly!", {
              expected: newWalletBalance,
              actual: verifyData.wallet_balance,
              taskerId,
            });
            return {
              success: false,
              error: `Wallet update failed: Expected ${newWalletBalance} but got ${verifyData.wallet_balance}`,
            };
          } else {
            console.log(`✅ Wallet update verified: ${verifyData.wallet_balance}`);
            walletUpdateSuccess = true;
          }
        } catch (verifyException) {
          console.error("❌ CRITICAL: Exception verifying wallet update:", verifyException);
          return {
            success: false,
            error: `Wallet update verification exception: ${verifyException instanceof Error ? verifyException.message : 'Unknown error'}`,
          };
        }
      }
      
      if (walletUpdateSuccess) {
        console.log(`✅ Tasker ${taskerId} wallet updated: ${taskerWalletBalance} - ${platformFee} (fees) = ${newWalletBalance}`);
        
        // Log wallet transaction for audit trail
        try {
          console.log(`[confirmBookingCompletion] Attempting to insert wallet_transaction for tasker ${taskerId}, amount: -${platformFee}`);
          const serviceSupabase = createServiceRoleClient();
          if (!serviceSupabase) {
            console.warn("⚠️ Service role client not available, skipping wallet_transaction logging");
          } else {
            const { data: walletTxData, error: walletTxError } = await serviceSupabase
              .from("wallet_transactions")
              .insert({
                user_id: taskerId,
                amount: -platformFee, // Negative because it's a deduction
                type: "fee_deduction",
                related_job_id: null, // Bookings use related_booking_id instead
                related_booking_id: bookingId, // Link to the booking
                notes: `Platform fee (10%) deducted for booking payment. Transaction ID: ${transaction?.id || 'N/A'}`,
              })
              .select()
              .single();
          
            if (walletTxError) {
              console.error("❌ CRITICAL: Failed to insert wallet_transaction:", {
                error: walletTxError,
                errorMessage: walletTxError.message,
                errorCode: walletTxError.code,
                errorDetails: walletTxError.details,
                errorHint: walletTxError.hint,
                taskerId,
                platformFee,
                bookingId,
                transactionId: transaction?.id,
              });
            } else {
              console.log(`✅ Wallet transaction logged successfully: ID ${walletTxData?.id} for tasker ${taskerId}, amount: -${platformFee}`);
            }
          }
        } catch (walletTransactionError) {
          // Don't fail the whole operation if wallet_transactions insert fails
          console.error("❌ CRITICAL: Exception inserting wallet_transaction:", {
            error: walletTransactionError,
            errorMessage: walletTransactionError instanceof Error ? walletTransactionError.message : String(walletTransactionError),
            taskerId,
            platformFee,
            bookingId,
          });
        }
      }

      // 3. Update tasker's user_stats manually (ALWAYS do this, even if transaction failed)
      const { data: taskerStats, error: taskerStatsFetchError } = await supabase
        .from("user_stats")
        .select("completed_jobs, total_earnings")
        .eq("id", taskerId)
        .maybeSingle();

      if (taskerStatsFetchError && taskerStatsFetchError.code !== "PGRST116") {
        console.error("Error fetching tasker stats:", taskerStatsFetchError);
      } else {
        const currentCompletedJobs = taskerStats?.completed_jobs || 0;
        const currentTotalEarnings = parseFloat(String(taskerStats?.total_earnings || 0));

          const { error: taskerStatsUpdateError } = await supabase
            .from("user_stats")
            .upsert({
              id: taskerId,
              completed_jobs: currentCompletedJobs + 1,
              total_earnings: currentTotalEarnings + netAmount,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: "id"
            });

          if (taskerStatsUpdateError) {
            console.error("Error updating tasker stats:", taskerStatsUpdateError);
          } else {
            console.log(`✅ Tasker ${taskerId} stats updated: completed_jobs=${currentCompletedJobs + 1}, total_earnings=${currentTotalEarnings + netAmount}`);
          }
      }

      // 4. Update customer's user_stats manually (ALWAYS do this, even if transaction failed)
      const { data: customerStats, error: customerStatsFetchError } = await supabase
        .from("user_stats")
        .select("total_spent")
        .eq("id", customerId)
        .maybeSingle();

      if (customerStatsFetchError && customerStatsFetchError.code !== "PGRST116") {
        console.error("Error fetching customer stats:", customerStatsFetchError);
      } else {
        const currentTotalSpent = parseFloat(String(customerStats?.total_spent || 0));

        const { error: customerStatsUpdateError } = await supabase
          .from("user_stats")
          .upsert({
            id: customerId,
            total_spent: currentTotalSpent + totalAmount,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "id"
          });

        if (customerStatsUpdateError) {
          console.error("Error updating customer stats:", customerStatsUpdateError);
        } else {
          console.log(`✅ Customer ${customerId} stats updated: total_spent=${currentTotalSpent + totalAmount}`);
        }
      }

      // 5. Create notification for customer about payment processed
      // Valeurs autorisées dans CHECK constraint: 'job_created', 'application_received', 
      // 'application_accepted', 'job_completed', 'payment_received', 'message_received'
      const { error: customerPaymentNotificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: customerId,
          type: "payment_received", // Type valide dans CHECK constraint
          title: "Payment Processed",
          message: `Your payment of ${totalAmount} ${currency} for booking "${serviceTitle}" has been processed.`,
          related_booking_id: bookingId,
          is_read: false,
        });
      if (customerPaymentNotificationError) {
        console.error("Error creating customer payment notification:", customerPaymentNotificationError);
      }

      // 6. Create notification for tasker
      const { error: taskerNotificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: taskerId,
          type: "job_completed", // Type valide dans CHECK constraint (booking et job sont traités de la même manière)
          title: "Booking Confirmed by Customer",
          message: `The customer has confirmed that you completed the booking: "${serviceTitle}".`,
          related_booking_id: bookingId,
          is_read: false,
        });
      if (taskerNotificationError) {
        console.error("Error creating tasker notification:", taskerNotificationError);
      }
    } else {
      console.warn("⚠️ Payment processing skipped:", {
        hasTaskerId: !!taskerId,
        hasAgreedPrice: agreedPrice > 0,
      });
    }

    // Revalidate relevant paths
    revalidatePath("/customer/bookings");
    revalidatePath(`/customer/bookings/${bookingId}`);
    revalidatePath("/tasker/bookings");
    revalidatePath(`/tasker/bookings/${bookingId}`);
    revalidatePath("/tasker/dashboard");
    revalidatePath("/tasker/finance");
    revalidatePath("/customer/dashboard");
    revalidatePath("/customer/finance");

    return { success: true };
  } catch (error) {
    console.error("Error in confirmBookingCompletion:", error);
    return { success: false, error: "Failed to confirm booking completion" };
  }
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
    // Convert estimated_duration to integer (round to nearest integer)
    const estimatedDurationInt = bookingData.estimated_duration
      ? Math.round(bookingData.estimated_duration)
      : null;

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
        estimated_duration: estimatedDurationInt,
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
    revalidatePath("/tasker/finance");

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
        error instanceof Error
          ? error.message
          : await getErrorTranslationForUser(undefined, "bookings", "failedToCreate"),
    };
  }
}

// New interfaces for job applications and tasker bookings
export interface JobApplicationWithDetails {
  id: string;
  job_id: string;
  tasker_id: string;
  proposed_price: number;
  estimated_duration: number | null;
  message: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  job_title: string | null;
  job_description: string | null;
  preferred_date: string | null;
  customer_budget: number | null;
  job_status: string | null;
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_avatar: string | null;
  tasker_first_name: string | null;
  tasker_last_name: string | null;
  tasker_avatar: string | null;
}

export interface TaskerBookingWithDetails {
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

// Get tasker's job applications
export async function getTaskerJobApplications(
  limit: number = 10,
  offset: number = 0,
  includeTotal: boolean = true
): Promise<{
  applications: JobApplicationWithDetails[];
  total: number;
  hasMore: boolean;
}> {
  const supabase = await createClient();

  // Get the authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "bookings",
      "notAuthenticated"
    );
    throw new Error(errorMessage);
  }

  const taskerId = user.id;

  // Get total count only when needed
  let total = 0;
  if (includeTotal || offset === 0) {
    const { count, error: countError } = await supabase
      .from("job_applications")
      .select("*", { count: "exact", head: true })
      .eq("tasker_id", taskerId);

    if (countError) {
      console.error("Error fetching job applications count:", countError);
      throw new Error(
        `Failed to fetch job applications count: ${countError.message}`
      );
    }
    total = count || 0;
  }

  // Get applications with pagination
  const { data, error } = await supabase
    .from("job_applications")
    .select(
      `
      *,
      job:jobs(
        title,
        description,
        preferred_date,
        customer_budget,
        status,
        customer:users!jobs_customer_id_fkey(
          first_name,
          last_name,
          avatar_url
        )
      ),
      tasker:users!job_applications_tasker_id_fkey(
        first_name,
        last_name,
        avatar_url
      )
    `
    )
    .eq("tasker_id", taskerId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);

  if (error) {
    console.error("Error fetching job applications:", error);
    throw new Error(`Failed to fetch job applications: ${error.message}`);
  }

  // Check if there are more items
  const hasMore = data.length > limit;
  const applications = data.slice(0, limit);

  const formattedApplications = applications.map((application) => ({
    ...application,
    job_title: application.job?.title,
    job_description: application.job?.description,
    preferred_date: application.job?.preferred_date,
    customer_budget: application.job?.customer_budget,
    job_status: application.job?.status,
    customer_first_name: application.job?.customer?.first_name,
    customer_last_name: application.job?.customer?.last_name,
    customer_avatar: application.job?.customer?.avatar_url,
    tasker_first_name: application.tasker?.first_name,
    tasker_last_name: application.tasker?.last_name,
    tasker_avatar: application.tasker?.avatar_url,
  }));

  return {
    applications: formattedApplications,
    total,
    hasMore,
  };
}

// Get tasker's bookings (when they book other taskers)
export async function getTaskerAsCustomerBookings(
  limit: number = 20,
  offset: number = 0,
  includeTotal: boolean = true
): Promise<{
  bookings: TaskerBookingWithDetails[];
  total: number;
  hasMore: boolean;
}> {
  const supabase = await createClient();

  // Get the authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "bookings",
      "notAuthenticated"
    );
    throw new Error(errorMessage);
  }

  const customerId = user.id;

  // Get total count only when needed
  let total = 0;
  if (includeTotal || offset === 0) {
    const { count, error: countError } = await supabase
      .from("service_bookings")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    if (countError) {
      console.error("Error fetching tasker bookings count:", countError);
      throw new Error(
        `Failed to fetch tasker bookings count: ${countError.message}`
      );
    }
    total = count || 0;
  }

  // Get bookings with pagination
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
        avatar_url,
        email,
        phone
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
    console.error("Error fetching tasker bookings:", error);
    throw new Error(`Failed to fetch tasker bookings: ${error.message}`);
  }

  // Check if there are more items
  const hasMore = data.length > limit;
  const bookings = data.slice(0, limit);

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
