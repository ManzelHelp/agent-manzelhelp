"use server";

import { getUserLocale, getTranslatedString, type Locale } from "./i18n-server";

export type NotificationType =
  | "job_created"
  | "job_approved"
  | "application_received"
  | "application_accepted"
  | "job_started"
  | "job_completed"
  | "payment_received"
  | "message_received"
  | "booking_created"
  | "booking_accepted"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_completed"
  | "booking_reminder"
  | "review_reminder"
  | "job_review_reminder"
  | "service_created"
  | "service_updated"
  | "payment_confirmed"
  | "payment_pending"
  | "wallet_refund_request_created"
  | "wallet_refund_payment_confirmed"
  | "wallet_refund_verifying"
  | "wallet_refund_approved"
  | "wallet_refund_rejected"
  | "wallet_low_balance"
  | "review_received";

interface NotificationParams {
  amount?: number;
  currency?: string;
  referenceCode?: string;
  jobTitle?: string;
  bookingTitle?: string;
  rating?: number;
  context?: string;
  balance?: number;
  reason?: string;
  status?: string;
}

/**
 * Gets translated notification title and message for a given notification type
 * @param locale The locale to use for translations
 * @param type The notification type
 * @param params Optional parameters to interpolate into the message
 * @returns Object with title and message translations
 */
export async function getNotificationTranslations(
  locale: Locale,
  type: NotificationType,
  params?: NotificationParams
): Promise<{ title: string; message: string }> {
  // Determine message key based on type and params
  let titleKey: string;
  let messageKey: string;

  switch (type) {
    case "job_created":
      titleKey = "notifications.titles.newJob";
      messageKey = "notifications.messages.newJob";
      break;
    case "job_approved":
      titleKey = "notifications.titles.jobApproved";
      messageKey = "notifications.messages.jobApproved";
      break;
    case "application_received":
      titleKey = "notifications.titles.newApplicationReceived";
      messageKey = "notifications.messages.newApplicationReceived";
      break;
    case "application_accepted":
      titleKey = "notifications.titles.applicationAccepted";
      messageKey = "notifications.messages.applicationAccepted";
      break;
    case "job_started":
      titleKey = "notifications.titles.jobStarted";
      messageKey = "notifications.messages.jobStarted";
      break;
    case "job_completed":
      titleKey = "notifications.titles.jobCompleted";
      messageKey = "notifications.messages.jobCompleted";
      break;
    case "payment_received":
    case "payment_confirmed":
    case "payment_pending":
      titleKey = "notifications.titles.paymentProcessed";
      // Use booking-specific template when we have a bookingTitle but no jobTitle
      messageKey =
        params?.bookingTitle && !params?.jobTitle
          ? "notifications.messages.bookingPaymentProcessed"
          : "notifications.messages.paymentProcessed";
      break;
    case "message_received":
      titleKey = "notifications.titles.newMessage";
      messageKey = params?.context ? "notifications.messages.newMessageWithJob" : "notifications.messages.newMessage";
      break;
    case "booking_created":
      titleKey = "notifications.titles.bookingCreated";
      messageKey = "notifications.messages.bookingCreated";
      break;
    case "booking_accepted":
      titleKey = "notifications.titles.bookingAccepted";
      messageKey = "notifications.messages.bookingAccepted";
      break;
    case "booking_confirmed":
      titleKey = "notifications.titles.bookingConfirmed";
      messageKey = "notifications.messages.bookingConfirmedByCustomer";
      break;
    case "booking_cancelled":
      titleKey = "notifications.titles.bookingCancelled";
      messageKey = "notifications.messages.bookingCancelled";
      break;
    case "booking_completed":
      titleKey = "notifications.titles.bookingCompleted";
      messageKey = "notifications.messages.bookingCompleted";
      break;
    case "booking_reminder":
      titleKey = "notifications.titles.bookingReminder";
      messageKey = "notifications.messages.bookingReminder";
      break;
    case "review_reminder":
      titleKey = "notifications.titles.reviewReminder";
      messageKey = "notifications.messages.reviewReminder";
      break;
    case "job_review_reminder":
      titleKey = "notifications.titles.reviewReminder";
      messageKey = "notifications.messages.jobReviewReminder";
      break;
    case "service_created":
      titleKey = "notifications.titles.serviceCreated";
      messageKey = "notifications.messages.serviceCreated";
      break;
    case "service_updated":
      titleKey = "notifications.titles.serviceUpdated";
      messageKey = "notifications.messages.serviceUpdated";
      break;
    case "wallet_refund_request_created":
      titleKey = "notifications.titles.newWalletRefundRequest";
      messageKey = "notifications.messages.newWalletRefundRequest";
      break;
    case "wallet_refund_payment_confirmed":
      titleKey = "notifications.titles.paymentConfirmedForRefund";
      messageKey = "notifications.messages.paymentConfirmedForRefund";
      break;
    case "wallet_refund_verifying":
      titleKey = "notifications.titles.refundRequestUnderReview";
      messageKey = "notifications.messages.refundRequestUnderReview";
      break;
    case "wallet_refund_approved":
      titleKey = "notifications.titles.refundRequestApproved";
      messageKey = "notifications.messages.refundRequestApproved";
      break;
    case "wallet_refund_rejected":
      titleKey = "notifications.titles.refundRequestRejected";
      messageKey = "notifications.messages.refundRequestRejected";
      break;
    case "wallet_low_balance":
      titleKey = "notifications.titles.walletLowBalance";
      messageKey = "notifications.messages.walletLowBalance";
      break;
    case "review_received":
      titleKey = "notifications.titles.newReviewReceived";
      if (params?.jobTitle) {
        messageKey = "notifications.messages.newReviewForJob";
      } else if (params?.bookingTitle) {
        messageKey = "notifications.messages.newReviewForBooking";
      } else {
        messageKey = "notifications.messages.newReviewReceived";
      }
      break;
    default:
      titleKey = "notifications.titles.general";
      messageKey = "notifications.messages.general";
  }

  // Prepare parameters for interpolation - filter out undefined values
  const messageParams: Record<string, string | number> = {};
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        messageParams[key] = value;
      }
    });
  }

  // Format context for message_received
  if (type === "message_received") {
    if (params?.context) {
      messageParams.context = params.context;
    } else {
      messageParams.context = "";
    }
  }

  // Format reason for refund_rejected
  if (type === "wallet_refund_rejected") {
    if (params?.reason) {
      messageParams.reason = ` ${params.reason}`;
    } else {
      messageParams.reason = "";
    }
  }

  // Format context for review_received - already handled in messageKey selection above
  // No need to add context param here as it's part of the message template

  // Filter out undefined values from params for title translation
  const titleParams: Record<string, string | number> = {};
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        titleParams[key] = value;
      }
    });
  }

  const [title, message] = await Promise.all([
    getTranslatedString(locale, titleKey, titleParams),
    getTranslatedString(locale, messageKey, messageParams),
  ]);

  return { title, message };
}

/**
 * Gets notification translations for a user (automatically determines their locale)
 * @param userId Optional user ID. If not provided, will use authenticated user
 * @param type The notification type
 * @param params Optional parameters
 * @returns Object with title and message translations
 */
export async function getNotificationTranslationsForUser(
  userId?: string,
  type?: NotificationType,
  params?: NotificationParams
): Promise<{ title: string; message: string; locale: Locale }> {
  const locale = await getUserLocale(userId);
  if (!type) {
    return {
      title: "",
      message: "",
      locale,
    };
  }
  const translations = await getNotificationTranslations(locale, type, params);
  return {
    ...translations,
    locale,
  };
}
