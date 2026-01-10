"use server";

import { getUserLocale, getTranslatedString, type Locale } from "./i18n-server";

export type ErrorCategory = "general" | "walletRefunds" | "jobs" | "messages" | "reviews" | "bookings";

export type WalletRefundError =
  | "notAuthenticated"
  | "failedToFetchUser"
  | "onlyTaskersCanCreate"
  | "amountMustBeGreaterThanZero"
  | "insufficientBalance"
  | "pendingRequestExists"
  | "failedToCreate"
  | "requestNotFound"
  | "unauthorizedConfirm"
  | "cannotConfirmPayment"
  | "failedToConfirmPayment"
  | "onlyAdminsCanViewAll"
  | "onlyAdminsCanMarkVerifying"
  | "cannotMarkVerifying"
  | "onlyAdminsCanApprove"
  | "failedToFetchWalletBalance"
  | "walletBalanceWouldBeNegative"
  | "failedToUpdateWallet"
  | "failedToApprove"
  | "onlyAdminsCanReject"
  | "adminNotesRequired"
  | "failedToReject";

export type JobError =
  | "notAuthenticated"
  | "failedToFetchUser"
  | "onlyCustomersCanPost"
  | "jobNotFound"
  | "unauthorized"
  | "failedToCreate"
  | "failedToUpdate"
  | "failedToDelete"
  | "applicationNotFound"
  | "failedToAcceptApplication"
  | "failedToRejectApplication"
  | "jobAlreadyAssigned"
  | "failedToStart"
  | "failedToComplete"
  | "failedToProcessPayment"
  | "failedToConfirm";

export type MessageError =
  | "notAuthenticated"
  | "conversationNotFound"
  | "unauthorized"
  | "failedToSend"
  | "failedToCreateConversation";

export type ReviewError = "notAuthenticated" | "failedToCreate" | "reviewNotFound" | "unauthorized";

export type BookingError =
  | "notAuthenticated"
  | "bookingNotFound"
  | "unauthorized"
  | "failedToCreate"
  | "failedToUpdate"
  | "failedToCancel"
  | "failedToAccept"
  | "failedToConfirm"
  | "failedToComplete";

export type GeneralError = "notAuthenticated" | "unexpected" | "failedToFetchUser";

interface ErrorParams {
  status?: string;
  [key: string]: string | number | undefined;
}

/**
 * Gets a translated error message
 * @param locale The locale to use for translations
 * @param category The error category
 * @param errorKey The specific error key
 * @param params Optional parameters to interpolate into the error message
 * @returns The translated error message
 */
export async function getErrorTranslation(
  locale: Locale,
  category: ErrorCategory,
  errorKey: string,
  params?: ErrorParams
): Promise<string> {
  const translationKey = `errors.${category}.${errorKey}`;
  return getTranslatedString(locale, translationKey, params);
}

/**
 * Gets an error translation for a user (automatically determines their locale)
 * @param userId Optional user ID. If not provided, will use authenticated user
 * @param category The error category
 * @param errorKey The specific error key
 * @param params Optional parameters
 * @returns The translated error message
 */
export async function getErrorTranslationForUser(
  userId: string | undefined,
  category: ErrorCategory,
  errorKey: string,
  params?: ErrorParams
): Promise<string> {
  const locale = await getUserLocale(userId);
  return getErrorTranslation(locale, category, errorKey, params);
}
