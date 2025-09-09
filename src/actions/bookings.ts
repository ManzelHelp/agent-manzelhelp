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
  scheduled_date: string;
  scheduled_time_start: string;
  scheduled_time_end: string;
  estimated_duration: number;
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
  taskerId: string
): Promise<BookingWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("service_bookings")
    .select(
      `
      *,
      customer:users!service_bookings_customer_id_fkey(
        first_name,
        last_name,
        avatar_url
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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  return data.map((booking) => ({
    ...booking,
    customer_first_name: booking.customer?.first_name,
    customer_last_name: booking.customer?.last_name,
    customer_avatar: booking.customer?.avatar_url,
    tasker_first_name: booking.tasker?.first_name,
    tasker_last_name: booking.tasker?.last_name,
    tasker_avatar: booking.tasker?.avatar_url,
    service_title: booking.tasker_service?.title,
    category_name: null,
    street_address: booking.address?.street_address,
    city: booking.address?.city,
    region: booking.address?.region,
  }));
}

export async function getBookingById(
  bookingId: string
): Promise<BookingWithDetails | null> {
  const supabase = await createClient();

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

  return {
    ...data,
    customer_first_name: data.customer?.first_name,
    customer_last_name: data.customer?.last_name,
    customer_avatar: data.customer?.avatar_url,
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
