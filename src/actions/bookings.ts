"use server";

import { createClient, createServiceRoleClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { BookingStatus } from "@/types/supabase";
import { getErrorTranslationForUser } from "@/lib/errors";
import { createBookingSchema } from "@/lib/schemas/bookings"; // AJOUT ZOD
import type { JobApplicationWithDetails } from "@/actions/jobs";

// Extended type for tasker job applications with job details
export interface TaskerJobApplicationWithDetails extends JobApplicationWithDetails {
  job_title?: string | null;
  job_description?: string | null;
  job_status?: string | null;
  preferred_date?: string | null;
  customer_budget?: number | null;
  customer_currency?: string | null;
  customer_first_name?: string | null;
  customer_last_name?: string | null;
  customer_avatar?: string | null;
}

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
  address_id: string | number;
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
  address?: {
    id: number;
    street_address: string;
    city: string;
    region: string;
    postal_code?: string | null;
    country: string;
    label?: string | null;
  } | null;
}

// Alias for tasker-specific booking details (same structure)
export type TaskerBookingWithDetails = BookingWithDetails;

export interface CreateBookingData {
  tasker_id: string; // AJOUTÉ POUR FIXER L'ERREUR TYPESCRIPT
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

// --- TA LOGIQUE D'ORIGINE AVEC VALIDATION ZOD ---

export async function createServiceBooking(bookingData: CreateBookingData) {
  const supabase = await createClient();

  // 1. VALIDATION ZOD SERVEUR
  const validation = createBookingSchema.safeParse(bookingData);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) return { success: false, error: "Authentication required" };

    const customerId = authUser.id;

    // Convertir address_id en integer
    const addressIdInt = typeof bookingData.address_id === 'string' 
      ? parseInt(bookingData.address_id, 10) 
      : bookingData.address_id;

    // Vérifier que l'adresse existe et appartient au customer (avec client normal)
    if (addressIdInt) {
      const { data: address, error: addressError } = await supabase
        .from("addresses")
        .select("id, user_id")
        .eq("id", addressIdInt)
        .single();

      if (addressError || !address) {
        return { success: false, error: "Adresse introuvable" };
      }

      if (address.user_id !== customerId) {
        return { success: false, error: "Cette adresse ne vous appartient pas" };
      }
    }

    // Ici on garde ta logique de création exacte
    const estimatedDurationInt = bookingData.estimated_duration ? Math.round(bookingData.estimated_duration) : null;

    // Utiliser le service role client pour contourner RLS lors de l'insertion
    const serviceRoleClient = createServiceRoleClient();
    if (!serviceRoleClient) {
      // Fallback: utiliser le client normal si service role n'est pas disponible
      const { data: booking, error: bookingError } = await supabase
        .from("service_bookings")
        .insert({
          customer_id: customerId,
          tasker_id: bookingData.tasker_id,
          tasker_service_id: bookingData.tasker_service_id,
          booking_type: bookingData.booking_type,
          scheduled_date: bookingData.scheduled_date || null,
          scheduled_time_start: bookingData.scheduled_time_start || null,
          scheduled_time_end: bookingData.scheduled_time_end || null,
          estimated_duration: estimatedDurationInt,
          address_id: addressIdInt,
          service_address: bookingData.service_address || null,
          agreed_price: bookingData.agreed_price,
          currency: "MAD",
          status: "pending",
          customer_requirements: bookingData.customer_requirements || null,
          payment_method: bookingData.payment_method || "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (bookingError) return { success: false, error: bookingError.message };

      revalidatePath("/customer/bookings");
      return { success: true, bookingId: booking.id };
    }

    // Utiliser service role client pour créer le booking (bypass RLS)
    const { data: booking, error: bookingError } = await serviceRoleClient
      .from("service_bookings")
      .insert({
        customer_id: customerId,
        tasker_id: bookingData.tasker_id,
        tasker_service_id: bookingData.tasker_service_id,
        booking_type: bookingData.booking_type,
        scheduled_date: bookingData.scheduled_date || null,
        scheduled_time_start: bookingData.scheduled_time_start || null,
        scheduled_time_end: bookingData.scheduled_time_end || null,
        estimated_duration: estimatedDurationInt,
        address_id: addressIdInt,
        service_address: bookingData.service_address || null,
        agreed_price: bookingData.agreed_price,
        currency: "MAD",
        status: "pending",
        customer_requirements: bookingData.customer_requirements || null,
        payment_method: bookingData.payment_method || "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (bookingError) return { success: false, error: bookingError.message };

    revalidatePath("/customer/bookings");
    return { success: true, bookingId: booking.id };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: "Failed to create booking" };
  }
}

// --- RESTE DU CODE D'ORIGINE STRICTEMENT IDENTIQUE ---

export async function getTaskerBookings(limit: number = 10, offset: number = 0, includeTotal: boolean = true) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error, count } = await supabase.from("service_bookings").select("*, customer:users!service_bookings_customer_id_fkey(*), tasker:users!service_bookings_tasker_id_fkey(*), tasker_service:tasker_services(*), address:addresses(*)", { count: "exact" }).eq("tasker_id", user.id).range(offset, offset + limit - 1);
  return { bookings: data || [], total: count || 0, hasMore: (data?.length || 0) >= limit };
}

export async function getBookingById(bookingId: string): Promise<BookingWithDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_bookings")
    .select(`
      *,
      customer:users!service_bookings_customer_id_fkey(*),
      tasker:users!service_bookings_tasker_id_fkey(*),
      tasker_service:tasker_services(*),
      address:addresses(*)
    `)
    .eq("id", bookingId)
    .single();
  
  if (error || !data) {
    console.error("Error fetching booking:", error);
    return null;
  }

  // Transformer les données pour correspondre à BookingWithDetails
  const address = (data as any).address;
  const customer = (data as any).customer;
  const tasker = (data as any).tasker;
  const taskerService = (data as any).tasker_service;

  return {
    ...data,
    // Extraire les champs de l'adresse pour faciliter l'accès
    street_address: address?.street_address || null,
    city: address?.city || null,
    region: address?.region || null,
    // Garder l'objet address complet aussi
    address: address || null,
    // Extraire les infos du customer
    customer_first_name: customer?.first_name || null,
    customer_last_name: customer?.last_name || null,
    customer_avatar: customer?.avatar_url || null,
    customer_email: customer?.email || null,
    customer_phone: customer?.phone || null,
    // Extraire les infos du tasker
    tasker_first_name: tasker?.first_name || null,
    tasker_last_name: tasker?.last_name || null,
    tasker_avatar: tasker?.avatar_url || null,
    tasker_email: tasker?.email || null,
    tasker_phone: tasker?.phone || null,
    // Extraire les infos du service
    service_title: taskerService?.title || null,
    category_name: null, // À récupérer si nécessaire
  } as BookingWithDetails;
}

export async function getCustomerBookings(limit: number = 10, offset: number = 0, includeTotal: boolean = false) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, count } = await supabase.from("service_bookings").select("*, tasker:users!service_bookings_tasker_id_fkey(*), tasker_service:tasker_services(*), address:addresses(*)", { count: "exact" }).eq("customer_id", user.id).range(offset, offset + limit - 1);
  return { bookings: data || [], total: count || 0, hasMore: (data?.length || 0) >= limit };
}

// FONCTIONS POUR ÉVITER LES BUILD ERRORS
export async function getTaskerAsCustomerBookings(limit: number = 10, offset: number = 0, includeTotal: boolean = false) {
  return getCustomerBookings(limit, offset, includeTotal);
}

export async function getTaskerJobApplications(limit: number = 10, offset: number = 0, includeTotal: boolean = false) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  
  let query = supabase
    .from("job_applications")
    .select(`
      *,
      job:jobs(
        id,
        title,
        description,
        status,
        preferred_date,
        customer_budget,
        currency,
        customer_id,
        assigned_tasker_id,
        customer:users!jobs_customer_id_fkey(
          first_name,
          last_name,
          avatar_url
        )
      )
    `, includeTotal ? { count: "exact" } : undefined)
    .eq("tasker_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  
  const { data, count } = await query;
  
  // Map the data to include job details in the application object
  const mappedApplications = (data || []).map((app: any) => {
    const job = app.job || {};
    const customer = job.customer || {};
    
    // If job is completed and this application's tasker is the assigned tasker, mark as accepted
    const isAssignedTasker = job.assigned_tasker_id === app.tasker_id;
    let effectiveStatus = app.status;
    
    // If job is completed and this tasker was assigned, the application should be accepted
    if (job.status === "completed" && isAssignedTasker && (!app.status || app.status === "pending")) {
      effectiveStatus = "accepted";
    }
    // If job is completed/cancelled and this tasker was NOT assigned, the application should be rejected
    else if (
      (job.status === "completed" || job.status === "cancelled") &&
      !isAssignedTasker &&
      (!app.status || app.status === "pending")
    ) {
      effectiveStatus = "rejected";
    }
    
    return {
      ...app,
      job_title: job.title || null,
      job_description: job.description || null,
      job_status: job.status || null,
      preferred_date: job.preferred_date || null,
      customer_budget: job.customer_budget || null,
      customer_currency: job.currency || null,
      customer_first_name: customer.first_name || null,
      customer_last_name: customer.last_name || null,
      customer_avatar: customer.avatar_url || null,
      // Override status if job is completed/cancelled
      status: effectiveStatus || app.status,
    };
  });
  
  return { 
    applications: mappedApplications as TaskerJobApplicationWithDetails[], 
    total: count || 0, 
    hasMore: (data?.length || 0) >= limit 
  };
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("service_bookings").update({ status }).eq("id", bookingId);
  if (!error) revalidatePath("/tasker/bookings");
  return { success: !error, error: error?.message };
}

export async function cancelCustomerBooking(bookingId: string, reason?: string) {
  const supabase = await createClient();
  
  // Récupérer l'utilisateur authentifié
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser) {
    return { success: false, error: "Authentication required" };
  }

  // Vérifier que le booking appartient au customer
  const { data: booking, error: bookingError } = await supabase
    .from("service_bookings")
    .select("customer_id, status")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    return { success: false, error: "Booking not found" };
  }

  if (booking.customer_id !== authUser.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Vérifier que le booking peut être annulé
  if (!["pending", "accepted", "confirmed"].includes(booking.status)) {
    return { success: false, error: "This booking cannot be cancelled" };
  }

  // Utiliser le service role client pour contourner RLS
  const serviceRoleClient = createServiceRoleClient();
  const clientToUse = serviceRoleClient || supabase;

  const { error } = await clientToUse
    .from("service_bookings")
    .update({
      status: "cancelled",
      cancellation_reason: reason || null,
      cancelled_by: authUser.id,
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (!error) revalidatePath("/customer/bookings");
  return { success: !error, error: error?.message };
}

export async function confirmBookingCompletion(bookingId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("service_bookings").update({ customer_confirmed_at: new Date().toISOString() }).eq("id", bookingId);
  if (!error) revalidatePath("/customer/bookings");
  return { success: !error, error: error?.message };
}