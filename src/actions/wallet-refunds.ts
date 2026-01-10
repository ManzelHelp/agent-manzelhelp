"use server";

import { createClient, createServiceRoleClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { handleError } from "@/lib/utils";
import { sendEmail, generateWalletRefundEmailTemplate } from "@/lib/email";
import { getNotificationTranslations, getNotificationTranslationsForUser } from "@/lib/notifications";
import { getErrorTranslationForUser } from "@/lib/errors";
import { getUserLocale } from "@/lib/i18n-server";

export type WalletRefundStatus =
  | "pending"
  | "payment_confirmed"
  | "admin_verifying"
  | "approved"
  | "rejected";

export interface WalletRefundRequest {
  id: string;
  tasker_id: string;
  amount: number;
  reference_code: string;
  status: WalletRefundStatus;
  receipt_url: string | null;
  admin_notes: string | null;
  admin_id: string | null;
  confirmed_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  tasker?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

export interface CreateRefundRequestResult {
  success: boolean;
  request?: WalletRefundRequest;
  error?: string;
}

export interface GetRefundRequestsResult {
  success: boolean;
  requests?: WalletRefundRequest[];
  error?: string;
}

export interface UpdateRefundRequestResult {
  success: boolean;
  error?: string;
}

/**
 * Génère un code de référence unique
 * Format: REF-{timestamp}-{random}
 */
function generateReferenceCode(): string {
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 8);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REF-${timestamp}-${random}`;
}

/**
 * Vérifie que le code de référence est unique
 */
async function ensureUniqueReferenceCode(
  supabase: Awaited<ReturnType<typeof createClient>>,
  code: string
): Promise<string> {
  const supabaseClient = await supabase;
  const { data } = await supabaseClient
    .from("wallet_refund_requests")
    .select("id")
    .eq("reference_code", code)
    .maybeSingle();

  if (data) {
    // Si le code existe déjà, générer un nouveau
    const newCode = generateReferenceCode();
    return ensureUniqueReferenceCode(supabase, newCode);
  }

  return code;
}

/**
 * Crée une demande de remboursement wallet
 * Vérifie que le tasker a suffisamment de fonds
 */
export async function createWalletRefundRequest(
  amount: number
): Promise<CreateRefundRequestResult> {
  try {
    const supabase = await createClient();

    // Vérifier l'authentification
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "walletRefunds",
        "notAuthenticated"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Vérifier que l'utilisateur est un tasker
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("role, wallet_balance")
      .eq("id", user.id)
      .single();

    if (userDataError || !userData) {
      const errorMessage = await getErrorTranslationForUser(
        user?.id,
        "walletRefunds",
        "failedToFetchUser"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    if (!["tasker", "both"].includes(userData.role)) {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "onlyTaskersCanCreate"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Validation du montant
    if (!amount || amount <= 0) {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "amountMustBeGreaterThanZero"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    const minAmount = 50; // Minimum 50 MAD
    const maxAmount = 10000; // Maximum 10000 MAD

    if (amount < minAmount) {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "minAmount",
        { min: minAmount }
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    if (amount > maxAmount) {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "maxAmount",
        { max: maxAmount }
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Vérifier que le tasker a suffisamment de fonds
    const walletBalance = parseFloat(userData.wallet_balance || "0");
    if (walletBalance < amount) {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "insufficientBalance"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Vérifier s'il y a déjà une demande en attente
    const { data: pendingRequest } = await supabase
      .from("wallet_refund_requests")
      .select("id")
      .eq("tasker_id", user.id)
      .in("status", ["pending", "payment_confirmed", "admin_verifying"])
      .maybeSingle();

    if (pendingRequest) {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "pendingRequestExists"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Générer un code de référence unique
    const supabaseClient = await supabase;
    const referenceCode = await ensureUniqueReferenceCode(
      supabaseClient,
      generateReferenceCode()
    );

    // Créer la demande
    const { data: request, error: insertError } = await supabase
      .from("wallet_refund_requests")
      .insert({
        tasker_id: user.id,
        amount: amount,
        reference_code: referenceCode,
        status: "pending",
      })
      .select(
        `
        *,
        tasker:users!wallet_refund_requests_tasker_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `
      )
      .single();

    if (insertError) {
      console.error("Error creating refund request:", insertError);
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "failedToCreate"
      );
      return {
        success: false,
        error: `${errorMessage}: ${insertError.message}`,
      };
    }

    // Créer une notification pour l'admin (utiliser service_role pour contourner RLS, fallback sur client normal)
    const serviceSupabase = createServiceRoleClient();
    const clientToUse = serviceSupabase || supabase;
    
    if (!serviceSupabase) {
      console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY not set. Using authenticated client (may fail due to RLS).");
    }
    
    const { data: admins } = await clientToUse
      .from("users")
      .select("id")
      .eq("role", "admin");

    if (admins && admins.length > 0) {
      // Create notifications for each admin with their preferred locale
      const notifications = await Promise.all(
        admins.map(async (admin) => {
          const translations = await getNotificationTranslationsForUser(
            admin.id,
            "wallet_refund_request_created",
            {
              amount,
              referenceCode,
            }
          );
          return {
            user_id: admin.id,
            type: "wallet_refund_request_created",
            title: translations.title,
            message: translations.message,
            is_read: false,
          };
        })
      );

      const { error: notifError } = await clientToUse
        .from("notifications")
        .insert(notifications);

      if (notifError) {
        console.error("❌ Error creating admin notifications:", {
          error: notifError,
          message: notifError.message,
          code: notifError.code,
          usedServiceRole: !!serviceSupabase,
        });
        
        if (!serviceSupabase && (notifError.code === "42501" || notifError.message?.includes("row-level security"))) {
          console.error("⚠️ RLS error: Set SUPABASE_SERVICE_ROLE_KEY in .env.local to bypass RLS.");
        }
      } else {
        console.log(`✅ Created notifications for ${admins.length} admin(s)`);
      }
    }

    // Revalider les pages concernées
    revalidatePath("/tasker/finance");
    revalidatePath("/tasker/finance/refunds");

    return {
      success: true,
      request: request as WalletRefundRequest,
    };
  } catch (error) {
    console.error("Error in createWalletRefundRequest:", error);
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "general",
      "unexpected"
    );
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Récupère les demandes de remboursement du tasker connecté
 */
export async function getTaskerRefundRequests(): Promise<GetRefundRequestsResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "walletRefunds",
        "notAuthenticated"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    const { data: requests, error } = await supabase
      .from("wallet_refund_requests")
      .select(
        `
        *,
        tasker:users!wallet_refund_requests_tasker_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `
      )
      .eq("tasker_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching refund requests:", error);
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "general",
        "unexpected"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    return {
      success: true,
      requests: (requests || []) as WalletRefundRequest[],
    };
  } catch (error) {
    console.error("Error in getTaskerRefundRequests:", error);
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "general",
      "unexpected"
    );
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Confirme le paiement et met à jour le statut
 * Cette fonction est appelée après l'upload du reçu
 */
export async function confirmRefundPayment(
  requestId: string,
  receiptUrl: string
): Promise<UpdateRefundRequestResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "walletRefunds",
        "notAuthenticated"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Vérifier que la demande existe et appartient au tasker
    const { data: request, error: fetchError } = await supabase
      .from("wallet_refund_requests")
      .select("tasker_id, status, reference_code, amount")
      .eq("id", requestId)
      .single();

    if (fetchError || !request) {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "requestNotFound"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    if (request.tasker_id !== user.id) {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "unauthorizedConfirm"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    if (request.status !== "pending") {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "cannotConfirmPayment",
        { status: request.status }
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Mettre à jour le statut et le reçu
    const { error: updateError } = await supabase
      .from("wallet_refund_requests")
      .update({
        status: "payment_confirmed",
        receipt_url: receiptUrl,
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Error updating refund request:", updateError);
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "failedToConfirmPayment"
      );
      return {
        success: false,
        error: `${errorMessage}: ${updateError.message}`,
      };
    }

    // Notifier l'admin (utiliser service_role pour contourner RLS, fallback sur client normal)
    const serviceSupabase = createServiceRoleClient();
    const clientToUse = serviceSupabase || supabase;
    
    if (!serviceSupabase) {
      console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY not set. Using authenticated client (may fail due to RLS).");
    }
    
    const { data: admins } = await clientToUse
      .from("users")
      .select("id")
      .eq("role", "admin");

    if (admins && admins.length > 0) {
      // Create notifications for each admin with their preferred locale
      const notifications = await Promise.all(
        admins.map(async (admin) => {
          const translations = await getNotificationTranslationsForUser(
            admin.id,
            "wallet_refund_payment_confirmed",
            {
              amount: request.amount,
              referenceCode: request.reference_code,
            }
          );
          return {
            user_id: admin.id,
            type: "wallet_refund_payment_confirmed",
            title: translations.title,
            message: translations.message,
            is_read: false,
          };
        })
      );

      const { error: notifError } = await clientToUse
        .from("notifications")
        .insert(notifications);

      if (notifError) {
        console.error("❌ Error creating admin notifications:", {
          error: notifError,
          message: notifError.message,
          code: notifError.code,
          usedServiceRole: !!serviceSupabase,
        });
        
        if (!serviceSupabase && (notifError.code === "42501" || notifError.message?.includes("row-level security"))) {
          console.error("⚠️ RLS error: Set SUPABASE_SERVICE_ROLE_KEY in .env.local to bypass RLS.");
        }
      } else {
        console.log(`✅ Created payment confirmation notifications for ${admins.length} admin(s)`);
      }
    }

    revalidatePath("/tasker/finance/refunds");
    revalidatePath("/admin/wallet-refunds");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in confirmRefundPayment:", error);
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "general",
      "unexpected"
    );
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Récupère toutes les demandes de remboursement (pour l'admin)
 */
export async function getAllRefundRequests(
  status?: WalletRefundStatus
): Promise<GetRefundRequestsResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "walletRefunds",
        "notAuthenticated"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Vérifier que l'utilisateur est admin
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userDataError || !userData || userData.role !== "admin") {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "onlyAdminsCanViewAll"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    let query = supabase
      .from("wallet_refund_requests")
      .select(
        `
        *,
        tasker:users!wallet_refund_requests_tasker_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `
      )
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error("Error fetching refund requests:", error);
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "general",
        "unexpected"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    return {
      success: true,
      requests: (requests || []) as WalletRefundRequest[],
    };
  } catch (error) {
    console.error("Error in getAllRefundRequests:", error);
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "general",
      "unexpected"
    );
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Marque une demande de remboursement comme étant en cours de vérification par l'admin
 * Cette fonction est une étape intermédiaire avant l'approbation ou le rejet
 */
export async function markAsVerifying(
  requestId: string,
  adminNotes?: string
): Promise<UpdateRefundRequestResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "walletRefunds",
        "notAuthenticated"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Vérifier que l'utilisateur est admin
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userDataError || !userData || userData.role !== "admin") {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "onlyAdminsCanMarkVerifying"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Récupérer la demande
    const { data: request, error: fetchError } = await supabase
      .from("wallet_refund_requests")
      .select("tasker_id, amount, status, reference_code")
      .eq("id", requestId)
      .single();

    if (fetchError || !request) {
      console.error("Error fetching refund request:", fetchError);
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "requestNotFound"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Vérifier que la demande peut être mise en vérification
    // Seulement depuis "pending" ou "payment_confirmed"
    if (request.status !== "pending" && request.status !== "payment_confirmed") {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "cannotMarkVerifying",
        { status: request.status }
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Mettre à jour le statut de la demande
    const updateData: { status: string; admin_id: string; admin_notes?: string; updated_at: string } = {
      status: "admin_verifying",
      admin_id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (adminNotes && adminNotes.trim().length > 0) {
      updateData.admin_notes = adminNotes.trim();
    }

    const { error: updateError } = await supabase
      .from("wallet_refund_requests")
      .update(updateData)
      .eq("id", requestId);

    if (updateError) {
      console.error("Error updating refund request:", updateError);
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "failedToReject" // Using failedToReject as closest match, should add a specific key if needed
      );
      return {
        success: false,
        error: `${errorMessage}: ${updateError.message}`,
      };
    }

    // Note: La notification est créée automatiquement par le trigger SQL trg_wallet_refund_status_changes
    console.log("✅ Refund request marked as verifying. Notification should be created by database trigger.");

    revalidatePath("/admin/wallet-refunds");
    revalidatePath("/tasker/finance");
    revalidatePath("/tasker/finance/refunds");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in markAsVerifying:", error);
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "general",
      "unexpected"
    );
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Approuve une demande de remboursement et crédite le wallet du tasker
 */
export async function approveRefundRequest(
  requestId: string,
  adminNotes?: string
): Promise<UpdateRefundRequestResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "walletRefunds",
        "notAuthenticated"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Vérifier que l'utilisateur est admin
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userDataError || !userData || userData.role !== "admin") {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "onlyAdminsCanApprove"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Récupérer la demande avec les infos du tasker (pour l'email)
    const { data: request, error: fetchError } = await supabase
      .from("wallet_refund_requests")
      .select("tasker_id, amount, status, reference_code, tasker:users!wallet_refund_requests_tasker_id_fkey(id, email, first_name, last_name)")
      .eq("id", requestId)
      .single();

    if (fetchError || !request) {
      console.error("Error fetching refund request:", fetchError);
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "requestNotFound"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Type assertion pour TypeScript - Vérifier que tasker existe
    const taskerData = (request as any).tasker as { id: string; email: string; first_name?: string; last_name?: string } | null;
    
    // Si taskerData est null, récupérer les infos du tasker séparément
    let taskerEmail: string | null = null;
    let taskerFirstName: string | null = null;
    let taskerLastName: string | null = null;
    
    if (!taskerData) {
      console.warn("⚠️ Tasker data not loaded via relation, fetching separately...");
      const { data: taskerInfo, error: taskerError } = await supabase
        .from("users")
        .select("id, email, first_name, last_name")
        .eq("id", request.tasker_id)
        .single();
      
      if (taskerError || !taskerInfo) {
        console.error("Error fetching tasker info:", taskerError);
      } else {
        taskerEmail = taskerInfo.email;
        taskerFirstName = taskerInfo.first_name || null;
        taskerLastName = taskerInfo.last_name || null;
      }
    } else {
      taskerEmail = taskerData.email;
      taskerFirstName = taskerData.first_name || null;
      taskerLastName = taskerData.last_name || null;
    }

    if (request.status !== "payment_confirmed" && request.status !== "admin_verifying") {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "cannotMarkVerifying",
        { status: request.status }
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Débiter le wallet du tasker
    const { data: tasker, error: taskerError } = await supabase
      .from("users")
      .select("wallet_balance")
      .eq("id", request.tasker_id)
      .single();

    if (taskerError || !tasker) {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "failedToFetchWalletBalance"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    const currentBalance = parseFloat(tasker.wallet_balance || "0");
    const newBalance = currentBalance - request.amount;

    if (newBalance < 0) {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "walletBalanceWouldBeNegative"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Mettre à jour le wallet
    const { error: walletUpdateError } = await supabase
      .from("users")
      .update({ wallet_balance: newBalance })
      .eq("id", request.tasker_id);

    if (walletUpdateError) {
      console.error("Error updating wallet:", walletUpdateError);
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "failedToUpdateWallet"
      );
      return {
        success: false,
        error: `${errorMessage}: ${walletUpdateError.message}`,
      };
    }

    // Créer une transaction dans wallet_transactions
    const { error: transactionError } = await supabase
      .from("wallet_transactions")
      .insert({
        user_id: request.tasker_id,
        amount: -request.amount, // Montant négatif pour un retrait
        type: "withdrawal",
        notes: `Wallet refund approved. Reference: ${request.reference_code}`,
      });

    if (transactionError) {
      console.error("Error creating wallet transaction:", transactionError);
      // Note: On continue même si la transaction échoue, le wallet a déjà été mis à jour
    }

    // Mettre à jour le statut de la demande
    const { error: updateError } = await supabase
      .from("wallet_refund_requests")
      .update({
        status: "approved",
        admin_id: user.id,
        admin_notes: adminNotes || null,
        approved_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Error updating refund request:", updateError);
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "failedToApprove"
      );
      return {
        success: false,
        error: `${errorMessage}: ${updateError.message}`,
      };
    }

    // Note: La notification est créée automatiquement par le trigger SQL trg_wallet_refund_status_changes
    // On envoie seulement l'email ici. Si le trigger n'existe pas, aucune notification ne sera créée,
    // mais l'email sera quand même envoyé.
    console.log("✅ Refund request approved. Notification should be created by database trigger.");

    // Envoyer un email au tasker (en arrière-plan, ne pas bloquer si ça échoue)
    if (taskerEmail) {
      try {
        const taskerName = taskerFirstName && taskerLastName
          ? `${taskerFirstName} ${taskerLastName}`
          : taskerFirstName || taskerEmail.split("@")[0] || "Cher utilisateur";

        const emailTemplate = generateWalletRefundEmailTemplate(
          "approved",
          taskerName,
          request.amount,
          request.reference_code,
          adminNotes || undefined
        );

        const emailResult = await sendEmail({
          to: taskerEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        });

        if (emailResult.success) {
          console.log("✅ Email sent successfully to tasker:", taskerEmail);
        } else {
          console.error("❌ Failed to send email to tasker:", emailResult.error);
        }
      } catch (emailError) {
        console.error("❌ Error sending email to tasker:", emailError);
        // Ne pas faire échouer l'opération si l'email échoue
      }
    } else {
      console.warn("⚠️ Tasker email not found, skipping email notification");
    }

    revalidatePath("/admin/wallet-refunds");
    revalidatePath("/tasker/finance");
    revalidatePath("/tasker/finance/refunds");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in approveRefundRequest:", error);
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "general",
      "unexpected"
    );
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Rejette une demande de remboursement
 */
export async function rejectRefundRequest(
  requestId: string,
  adminNotes: string
): Promise<UpdateRefundRequestResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "walletRefunds",
        "notAuthenticated"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Vérifier que l'utilisateur est admin
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userDataError || !userData || userData.role !== "admin") {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "onlyAdminsCanReject"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    if (!adminNotes || adminNotes.trim().length === 0) {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "adminNotesRequired"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Récupérer la demande avec les infos du tasker (pour l'email)
    const { data: request, error: fetchError } = await supabase
      .from("wallet_refund_requests")
      .select("tasker_id, amount, reference_code, tasker:users!wallet_refund_requests_tasker_id_fkey(id, email, first_name, last_name)")
      .eq("id", requestId)
      .single();

    if (fetchError || !request) {
      console.error("Error fetching refund request:", fetchError);
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "requestNotFound"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Type assertion pour TypeScript - Vérifier que tasker existe
    const taskerData = (request as any).tasker as { id: string; email: string; first_name?: string; last_name?: string } | null;
    
    // Si taskerData est null, récupérer les infos du tasker séparément
    let taskerEmail: string | null = null;
    let taskerFirstName: string | null = null;
    let taskerLastName: string | null = null;
    
    if (!taskerData) {
      console.warn("⚠️ Tasker data not loaded via relation, fetching separately...");
      const { data: taskerInfo, error: taskerError } = await supabase
        .from("users")
        .select("id, email, first_name, last_name")
        .eq("id", request.tasker_id)
        .single();
      
      if (taskerError || !taskerInfo) {
        console.error("Error fetching tasker info:", taskerError);
      } else {
        taskerEmail = taskerInfo.email;
        taskerFirstName = taskerInfo.first_name || null;
        taskerLastName = taskerInfo.last_name || null;
      }
    } else {
      taskerEmail = taskerData.email;
      taskerFirstName = taskerData.first_name || null;
      taskerLastName = taskerData.last_name || null;
    }

    // Mettre à jour le statut
    const { error: updateError } = await supabase
      .from("wallet_refund_requests")
      .update({
        status: "rejected",
        admin_id: user.id,
        admin_notes: adminNotes.trim(),
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Error updating refund request:", updateError);
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "walletRefunds",
        "failedToReject"
      );
      return {
        success: false,
        error: `${errorMessage}: ${updateError.message}`,
      };
    }

    // Note: La notification est créée automatiquement par le trigger SQL trg_wallet_refund_status_changes
    // On envoie seulement l'email ici. Si le trigger n'existe pas, aucune notification ne sera créée,
    // mais l'email sera quand même envoyé.
    console.log("✅ Refund request rejected. Notification should be created by database trigger.");

    // Envoyer un email au tasker (en arrière-plan, ne pas bloquer si ça échoue)
    if (taskerEmail) {
      try {
        const taskerName = taskerFirstName && taskerLastName
          ? `${taskerFirstName} ${taskerLastName}`
          : taskerFirstName || taskerEmail.split("@")[0] || "Cher utilisateur";

        const emailTemplate = generateWalletRefundEmailTemplate(
          "rejected",
          taskerName,
          request.amount,
          request.reference_code,
          adminNotes.trim()
        );

        const emailResult = await sendEmail({
          to: taskerEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        });

        if (emailResult.success) {
          console.log("✅ Email sent successfully to tasker:", taskerEmail);
        } else {
          console.error("❌ Failed to send email to tasker:", emailResult.error);
        }
      } catch (emailError) {
        console.error("❌ Error sending email to tasker:", emailError);
        // Ne pas faire échouer l'opération si l'email échoue
      }
    } else {
      console.warn("⚠️ Tasker email not found for tasker_id:", request.tasker_id, "- skipping email notification");
    }

    revalidatePath("/admin/wallet-refunds");
    revalidatePath("/tasker/finance/refunds");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in rejectRefundRequest:", error);
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "general",
      "unexpected"
    );
    return {
      success: false,
      error: errorMessage,
    };
  }
}
