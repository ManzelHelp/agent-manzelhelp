"use server";

import { createClient, createServiceRoleClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { BookingStatus } from "@/types/supabase";
import { getErrorTranslationForUser } from "@/lib/errors";
import { getUserLocale, getTranslatedString } from "@/lib/i18n-server";
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
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    
    const { data, error, count } = await supabase
      .from("service_bookings")
      .select("*, customer:users!service_bookings_customer_id_fkey(*), tasker:users!service_bookings_tasker_id_fkey(*), tasker_service:tasker_services(*), address:addresses(*)", { count: "exact" })
      .eq("tasker_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching tasker bookings:", error);
      return { bookings: [], total: 0, hasMore: false, error: error.message };
    }

    const flattenedBookings = (data || []).map(booking => {
      // Handle potential array results from Supabase joins
      const getSingle = (val: any) => Array.isArray(val) ? val[0] : val;
      
      const address = getSingle((booking as any).address);
      const customer = getSingle((booking as any).customer);
      const tasker = getSingle((booking as any).tasker);
      const taskerService = getSingle((booking as any).tasker_service);

      return {
        ...booking,
        street_address: address?.street_address || null,
        city: address?.city || null,
        region: address?.region || null,
        address: address || null,
        customer_first_name: customer?.first_name || null,
        customer_last_name: customer?.last_name || null,
        customer_avatar: customer?.avatar_url || null,
        customer_email: customer?.email || null,
        customer_phone: customer?.phone || null,
        tasker_first_name: tasker?.first_name || null,
        tasker_last_name: tasker?.last_name || null,
        tasker_avatar: tasker?.avatar_url || null,
        tasker_email: tasker?.email || null,
        tasker_phone: tasker?.phone || null,
        service_title: taskerService?.title || null,
        category_name: null,
      } as BookingWithDetails;
    });

    return { bookings: flattenedBookings, total: count || 0, hasMore: (data?.length || 0) >= limit };
  } catch (error: any) {
    console.error("Exception in getTaskerBookings:", error);
    return { bookings: [], total: 0, hasMore: false, error: error.message };
  }
}

export async function getBookingById(bookingId: string): Promise<BookingWithDetails | null> {
  try {
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

    const getSingle = (val: any) => Array.isArray(val) ? val[0] : val;
    const address = getSingle((data as any).address);
    const customer = getSingle((data as any).customer);
    const tasker = getSingle((data as any).tasker);
    const taskerService = getSingle((data as any).tasker_service);

    return {
      ...data,
      street_address: address?.street_address || null,
      city: address?.city || null,
      region: address?.region || null,
      address: address || null,
      customer_first_name: customer?.first_name || null,
      customer_last_name: customer?.last_name || null,
      customer_avatar: customer?.avatar_url || null,
      customer_email: customer?.email || null,
      customer_phone: customer?.phone || null,
      tasker_first_name: tasker?.first_name || null,
      tasker_last_name: tasker?.last_name || null,
      tasker_avatar: tasker?.avatar_url || null,
      tasker_email: tasker?.email || null,
      tasker_phone: tasker?.phone || null,
      service_title: taskerService?.title || null,
      category_name: null,
    } as BookingWithDetails;
  } catch (error) {
    console.error("Exception in getBookingById:", error);
    return null;
  }
}

export async function getCustomerBookings(limit: number = 10, offset: number = 0, includeTotal: boolean = false) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    
    const { data, error, count } = await supabase
      .from("service_bookings")
      .select("*, tasker:users!service_bookings_tasker_id_fkey(*), tasker_service:tasker_services(*), address:addresses(*)", { count: "exact" })
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching customer bookings:", error);
      return { bookings: [], total: 0, hasMore: false, error: error.message };
    }

    const flattenedBookings = (data || []).map(booking => {
      const getSingle = (val: any) => Array.isArray(val) ? val[0] : val;
      const address = getSingle((booking as any).address);
      const tasker = getSingle((booking as any).tasker);
      const taskerService = getSingle((booking as any).tasker_service);

      return {
        ...booking,
        street_address: address?.street_address || null,
        city: address?.city || null,
        region: address?.region || null,
        address: address || null,
        tasker_first_name: tasker?.first_name || null,
        tasker_last_name: tasker?.last_name || null,
        tasker_avatar: tasker?.avatar_url || null,
        tasker_email: tasker?.email || null,
        tasker_phone: tasker?.phone || null,
        service_title: taskerService?.title || null,
        category_name: null,
      } as BookingWithDetails;
    });

    return { bookings: flattenedBookings, total: count || 0, hasMore: (data?.length || 0) >= limit };
  } catch (error: any) {
    console.error("Exception in getCustomerBookings:", error);
    return { bookings: [], total: 0, hasMore: false, error: error.message };
  }
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
    
    // If job is assigned/in_progress/completed and this application's tasker is the assigned tasker, mark as accepted
    const isAssignedTasker = job.assigned_tasker_id === app.tasker_id;
    let effectiveStatus = app.status;
    
    // If job has an assigned tasker (assigned, in_progress, completed)
    const jobHasTasker = !!job.assigned_tasker_id;
    
    if (jobHasTasker) {
      if (isAssignedTasker) {
        // If this tasker IS the assigned one, they are accepted
        effectiveStatus = "accepted";
      } else {
        // If this tasker is NOT the assigned one, they are effectively rejected
        effectiveStatus = "rejected";
      }
    } else if (job.status === "cancelled") {
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
      // Override status if job is assigned/completed/cancelled
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
  
  // 1. Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Authentication required" };

  // 2. Fetch booking to verify ownership and get tasker_id
  const { data: booking, error: bookingError } = await supabase
    .from("service_bookings")
    .select("id, tasker_id, customer_id, tasker_service_id, agreed_price, currency, payment_method, status")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) return { success: false, error: "Booking not found" };

  // Only the assigned tasker can change booking status in tasker flows
  if (booking.tasker_id !== user.id) {
    return { success: false, error: "Unauthorized" };
  }

  // 3. Check wallet balance if trying to accept or start
  if (["accepted", "in_progress"].includes(status)) {
    const { data: userData } = await supabase
      .from("users")
      .select("wallet_balance, preferred_language")
      .eq("id", user.id)
      .single();

    const walletBalance = Number(userData?.wallet_balance || 0);
    if (walletBalance < 10) {
      const lang = userData?.preferred_language || "en";
      const errorMessage = lang === 'ar'
        ? "لا يمكنك قبول أو بدء العمل لأن رصيد محفظتك أقل من 10 دراهم. يرجى شحن محفظتك."
        : lang === 'fr'
        ? "Vous ne pouvez pas accepter ou commencer le travail car votre solde est inférieur à 10 MAD. Veuillez recharger votre portefeuille."
        : "You cannot accept or start the job because your wallet balance is less than 10 MAD. Please top up your wallet.";
      
      return { success: false, error: errorMessage };
    }
  }

  // Execute transaction immediately when the tasker accepts the booking (cash payment assumed)
  if (status === "accepted" && booking.status === "pending") {
    const expectedAmount = Number(booking.agreed_price || 0);
    const platformFee = expectedAmount * 0.1;
    const nowIso = new Date().toISOString();

    if (expectedAmount > 0) {
      // Deduct fee from tasker's wallet once (idempotent)
      const { data: taskerUser } = await supabase
        .from("users")
        .select("wallet_balance")
        .eq("id", booking.tasker_id)
        .maybeSingle();

      const taskerWalletBalance = Number(taskerUser?.wallet_balance || 0);
      if (taskerWalletBalance < platformFee) {
        return { success: false, error: "Tasker wallet balance is insufficient to cover platform fee" };
      }

      const { data: existingTx } = await supabase
        .from("transactions")
        .select("id")
        .eq("booking_id", booking.id)
        .in("transaction_type", ["booking_payment", "service_payment", "cash_payment"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingTx?.id) {
        await supabase
          .from("transactions")
          .update({
            amount: expectedAmount,
            platform_fee: platformFee,
            payment_status: "paid",
            processed_at: nowIso,
            updated_at: nowIso,
          })
          .eq("id", existingTx.id);
      } else {
        await supabase.from("transactions").insert({
          job_id: null,
          booking_id: booking.id,
          payer_id: booking.customer_id,
          payee_id: booking.tasker_id,
          transaction_type: "booking_payment",
          amount: expectedAmount,
          platform_fee: platformFee,
          payment_status: "paid",
          payment_method: booking.payment_method || "cash",
          processed_at: nowIso,
        });
      }

      const { data: existingFeeLedger } = await supabase
        .from("wallet_transactions")
        .select("id")
        .eq("user_id", booking.tasker_id)
        .eq("type", "fee_deduction")
        .eq("related_booking_id", booking.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!existingFeeLedger && platformFee > 0) {
        const newBalance = taskerWalletBalance - platformFee;
        const serviceSupabase = createServiceRoleClient();
        const clientToUse = serviceSupabase || supabase;

        await clientToUse
          .from("users")
          .update({ wallet_balance: newBalance })
          .eq("id", booking.tasker_id);

        await clientToUse.from("wallet_transactions").insert({
          user_id: booking.tasker_id,
          amount: -platformFee,
          type: "fee_deduction",
          related_booking_id: booking.id,
          notes: "Platform fee (10%) deducted on booking acceptance.",
        });
      }

      // Notify tasker
      const { getNotificationTranslationsForUser } = await import("@/lib/notifications");
      let bookingTitle = "Booking";
      if (booking.tasker_service_id) {
        const { data: svc } = await supabase
          .from("tasker_services")
          .select("title")
          .eq("id", booking.tasker_service_id)
          .maybeSingle();
        if (svc?.title) bookingTitle = String(svc.title);
      }
      const n = await getNotificationTranslationsForUser(booking.tasker_id, "payment_confirmed", {
        amount: expectedAmount,
        currency: String(booking.currency || "MAD"),
        bookingTitle,
      });
      await supabase.from("notifications").insert({
        user_id: booking.tasker_id,
        type: "payment_confirmed",
        title: n.title,
        message: n.message,
        related_booking_id: booking.id,
        is_read: false,
      });
    }
  }

  const updates: any = { 
    status,
    updated_at: new Date().toISOString()
  };

  // Add timestamps based on status
  if (status === "accepted") {
    updates.accepted_at = new Date().toISOString();
  } else if (status === "confirmed") {
    updates.confirmed_at = new Date().toISOString();
  } else if (status === "in_progress") {
    updates.started_at = new Date().toISOString();
  } else if (status === "completed") {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("service_bookings")
    .update(updates)
    .eq("id", bookingId);

  if (!error) {
    revalidatePath("/tasker/bookings");
    revalidatePath(`/tasker/bookings/${bookingId}`);
    revalidatePath("/customer/bookings");
    revalidatePath(`/customer/bookings/${bookingId}`);
  }
  
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
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { success: false, error: "Authentication required" };

    const { data: booking, error: fetchError } = await supabase
      .from("service_bookings")
      .select("id, tasker_id, customer_id, customer_confirmed_at, agreed_price, payment_method")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) return { success: false, error: "Booking not found" };
    if (booking.customer_id !== user.id) return { success: false, error: "Unauthorized" };
    if (booking.customer_confirmed_at) return { success: false, error: "This booking has already been confirmed" };

    const nowIso = new Date().toISOString();

    const { error: updateBookingError } = await supabase
      .from("service_bookings")
      .update({
        customer_confirmed_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", bookingId);

    if (updateBookingError) throw updateBookingError;

    // Payment is executed at acceptance time; avoid double charge on confirmation.
    // We keep this as a safety net ONLY if the transaction doesn't exist yet.
    const totalAmount = Number((booking as any).agreed_price || 0);
    const platformFee = totalAmount * 0.1;

    if (booking.tasker_id && totalAmount > 0) {
      const { data: existingPaidTx } = await supabase
        .from("transactions")
        .select("id")
        .eq("booking_id", booking.id)
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!existingPaidTx?.id) {
        await supabase.from("transactions").insert({
          job_id: null,
          booking_id: booking.id,
          payer_id: booking.customer_id,
          payee_id: booking.tasker_id,
          transaction_type: "booking_payment",
          amount: totalAmount,
          platform_fee: platformFee,
          payment_status: "paid",
          payment_method: booking.payment_method || "cash",
          processed_at: nowIso,
        });
      }
    }

    revalidatePath("/customer/bookings");
    revalidatePath(`/customer/bookings/${bookingId}`);
    revalidatePath("/tasker/bookings");
    revalidatePath(`/tasker/bookings/${bookingId}`);

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error confirming booking completion:", error);
    return { success: false, error: error?.message || "Failed to confirm booking" };
  }
}