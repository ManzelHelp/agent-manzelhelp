"use server";

import { handleError } from "@/lib/utils";
import { createClient, createServiceRoleClient } from "@/supabase/server";
import type { ContactMessage, ContactMessageStatus } from "@/types/supabase";

// Re-export types for convenience
export type { ContactMessage, ContactMessageStatus };

export interface SubmitContactMessageData {
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SubmitContactMessageResult {
  success: boolean;
  errorMessage?: string | null;
  messageId?: string;
}

export interface GetContactMessagesResult {
  success: boolean;
  messages?: ContactMessage[];
  errorMessage?: string | null;
  total?: number;
}

export interface UpdateContactMessageStatusData {
  status?: ContactMessageStatus;
  admin_notes?: string;
}

export interface UpdateContactMessageStatusResult {
  success: boolean;
  errorMessage?: string | null;
}

/**
 * Submit a contact message from the contact form
 * Anyone can submit (public access)
 */
export async function submitContactMessage(
  data: SubmitContactMessageData
): Promise<SubmitContactMessageResult> {
  try {
    // Validation
    if (!data.first_name || !data.last_name || !data.email || !data.subject || !data.message) {
      return {
        success: false,
        errorMessage: "Tous les champs sont requis",
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        errorMessage: "Veuillez entrer une adresse email valide",
      };
    }

    // Message length validation
    if (data.message.trim().length < 10) {
      return {
        success: false,
        errorMessage: "Le message doit contenir au moins 10 caractères",
      };
    }

    if (data.message.trim().length > 5000) {
      return {
        success: false,
        errorMessage: "Le message ne peut pas dépasser 5000 caractères",
      };
    }

    // Use service_role to bypass RLS for public contact form submissions
    // This is safe because we validate the data before insertion
    const supabase = createServiceRoleClient();
    
    if (!supabase) {
      return {
        success: false,
        errorMessage: "Service temporarily unavailable. Please try again later.",
      };
    }

    // Insert the contact message
    // Note: status will use the default value from the database if it exists
    const { data: message, error } = await supabase
      .from("contact_messages")
      .insert({
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        email: data.email.trim().toLowerCase(),
        subject: data.subject.trim(),
        message: data.message.trim(),
        // status will use the default value from the database
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error submitting contact message:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        fullError: JSON.stringify(error, null, 2),
      });
      
      // Message d'erreur plus détaillé pour le développement
      let errorMessage = "Erreur lors de l'envoi du message. Veuillez réessayer.";
      if (error.code === "42501" || error.message.includes("permission") || error.message.includes("policy")) {
        errorMessage = `Erreur de permissions (Code: ${error.code}). Détails: ${error.message}. ${error.hint ? `Hint: ${error.hint}` : ''}`;
      } else if (error.code === "42P01" || error.message.includes("does not exist")) {
        errorMessage = "La table contact_messages n'existe pas. Veuillez exécuter le script SQL dans Supabase.";
      } else if (error.code === "23514" || error.message.includes("check constraint")) {
        errorMessage = `Erreur de contrainte CHECK: ${error.message}. Vérifiez que la valeur du status est valide.`;
      }
      
      return {
        success: false,
        errorMessage,
      };
    }

    return {
      success: true,
      messageId: message.id,
      errorMessage: null,
    };
  } catch (error) {
    console.error("Error in submitContactMessage:", error);
    return {
      success: false,
      ...handleError(error),
    };
  }
}

/**
 * Get all contact messages (admin only)
 */
export async function getContactMessages(
  status?: ContactMessageStatus,
  limit: number = 50,
  offset: number = 0
): Promise<GetContactMessagesResult> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        errorMessage: "Non authentifié",
      };
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || !userData || userData.role !== "admin") {
      return {
        success: false,
        errorMessage: "Accès non autorisé. Admin uniquement.",
      };
    }

    // Build query
    let query = supabase.from("contact_messages").select("*", { count: "exact" });

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status);
    }

    // Apply pagination and ordering
    const { data: messages, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching contact messages:", error);
      return {
        success: false,
        errorMessage: "Erreur lors de la récupération des messages",
      };
    }

    return {
      success: true,
      messages: messages || [],
      total: count || 0,
      errorMessage: null,
    };
  } catch (error) {
    console.error("Error in getContactMessages:", error);
    return {
      success: false,
      ...handleError(error),
    };
  }
}

/**
 * Update contact message status and/or admin notes (admin only)
 */
export async function updateContactMessageStatus(
  messageId: string,
  updateData: UpdateContactMessageStatusData
): Promise<UpdateContactMessageStatusResult> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        errorMessage: "Non authentifié",
      };
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || !userData || userData.role !== "admin") {
      return {
        success: false,
        errorMessage: "Accès non autorisé. Admin uniquement.",
      };
    }

    // Build update object
    const updateObj: Partial<ContactMessage> = {};
    if (updateData.status !== undefined) {
      updateObj.status = updateData.status;
    }
    if (updateData.admin_notes !== undefined) {
      updateObj.admin_notes = updateData.admin_notes;
    }

    // Update the message
    const { error } = await supabase
      .from("contact_messages")
      .update(updateObj)
      .eq("id", messageId);

    if (error) {
      console.error("Error updating contact message:", error);
      return {
        success: false,
        errorMessage: "Erreur lors de la mise à jour du message",
      };
    }

    return {
      success: true,
      errorMessage: null,
    };
  } catch (error) {
    console.error("Error in updateContactMessageStatus:", error);
    return {
      success: false,
      ...handleError(error),
    };
  }
}

