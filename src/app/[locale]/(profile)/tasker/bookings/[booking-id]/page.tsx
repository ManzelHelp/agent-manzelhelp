"use client";

import React, { useState, useEffect, useCallback, useMemo, use } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { BackButton } from "@/components/ui/BackButton";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Play,
  MessageSquare,
  FileText,
  Clock3,
  CalendarDays,
  Info,
  X,
  MoreHorizontal,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  getBookingById,
  updateBookingStatus,
  type BookingWithDetails,
} from "@/actions/bookings";
import { createConversationAction } from "@/actions/messages";
import { BookingStatus } from "@/types/supabase";
import { useTranslations } from "next-intl";
import { formatDateShort } from "@/lib/date-utils";

interface ConfirmationDialogState {
  isOpen: boolean;
  action: string;
  title: string;
  description: string;
  confirmText: string;
  variant:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export default function TaskerBookingDetailPage({
  params,
}: {
  params: Promise<{ "booking-id": string }>;
}) {
  // Use the use() hook to handle async params in client component
  const { "booking-id": bookingId } = use(params);

  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmationDialog, setConfirmationDialog] =
    useState<ConfirmationDialogState>({
      isOpen: false,
      action: "",
      title: "",
      description: "",
      confirmText: "",
      variant: "default",
    });
  const router = useRouter();
  const t = useTranslations("bookingDetails");
  const { toast } = useToast();

  const fetchBookingData = useCallback(async () => {
    try {
      setIsLoading(true);
      const bookingData = await getBookingById(bookingId);
      if (!bookingData) {
        toast({
          variant: "destructive",
          title: t("bookingNotFound"),
        });
        router.push("/tasker/bookings");
        return;
      }

      setBooking(bookingData);
    } catch (error) {
      console.error("Error fetching booking:", error);
      const errorMessage =
        error instanceof Error ? error.message : t("errors.unexpectedError");
      toast({
        variant: "destructive",
        title: t("error"),
        description: errorMessage,
      });
      router.push("/tasker/bookings");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, router, t]);

  useEffect(() => {
    fetchBookingData();
  }, [fetchBookingData]);

  const getStatusInfo = useCallback(
    (status: BookingStatus) => {
      switch (status) {
        case "pending":
          return {
            label: t("status.pending"),
            color:
              "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
            icon: AlertCircle,
            description: t("statusDescriptions.pending"),
          };
        case "accepted":
          return {
            label: t("status.accepted"),
            color:
              "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
            icon: CheckCircle,
            description: t("statusDescriptions.accepted"),
          };
        case "confirmed":
          return {
            label: t("status.confirmed"),
            color:
              "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300",
            icon: CheckCircle,
            description: t("statusDescriptions.confirmed"),
          };
        case "in_progress":
          return {
            label: t("status.in_progress"),
            color:
              "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300",
            icon: Play,
            description: t("statusDescriptions.in_progress"),
          };
        case "completed":
          return {
            label: t("status.completed"),
            color:
              "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
            icon: CheckCircle,
            description: t("statusDescriptions.completed"),
          };
        case "cancelled":
          return {
            label: t("status.cancelled"),
            color:
              "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
            icon: X,
            description: t("statusDescriptions.cancelled"),
          };
        default:
          return {
            label: t("status.unknown"),
            color:
              "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
            icon: Info,
            description: t("statusDescriptions.unknown"),
          };
      }
    },
    [t]
  );

  const getBookingTypeInfo = useCallback(
    (type: string) => {
      switch (type) {
        case "instant":
          return { label: t("bookingType.instant"), icon: Clock3 };
        case "scheduled":
          return { label: t("bookingType.scheduled"), icon: CalendarDays };
        case "recurring":
          return { label: t("bookingType.recurring"), icon: Calendar };
        default:
          return { label: t("bookingType.scheduled"), icon: CalendarDays };
      }
    },
    [t]
  );

  const formatCurrency = useCallback((amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatDuration = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return formatDateShort(dateString);
  }, []);

  const formatTime = useCallback((timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  const getCustomerName = useCallback(() => {
    if (!booking) return t("customer");
    const firstName = booking.customer_first_name || "";
    const lastName = booking.customer_last_name || "";
    return `${firstName} ${lastName}`.trim() || t("customer");
  }, [booking, t]);

  const getCustomerEmail = useCallback(() => {
    if (!booking) return "N/A";
    return booking.customer_email || "N/A";
  }, [booking]);

  const getCustomerPhone = useCallback(() => {
    if (!booking) return "N/A";
    return booking.customer_phone || "N/A";
  }, [booking]);

  // Check if contact info should be shown (booking accepted, in_progress, completed, or started)
  const shouldShowContactInfo = useCallback(() => {
    if (!booking) return false;
    return (
      booking.status === "accepted" ||
      booking.status === "confirmed" ||
      booking.status === "in_progress" ||
      booking.status === "completed" ||
      booking.started_at !== null
    );
  }, [booking]);

  const handleStatusAction = useCallback(
    async (action: string) => {
      if (!booking) return;

      const actionConfig = {
        accept: {
          title: t("confirmations.accept.title"),
          description: t("confirmations.accept.description"),
          confirmText: t("confirmations.accept.confirmText"),
          variant: "default" as const,
          status: "accepted" as BookingStatus,
        },
        decline: {
          title: t("confirmations.decline.title"),
          description: t("confirmations.decline.description"),
          confirmText: t("confirmations.decline.confirmText"),
          variant: "destructive" as const,
          status: "cancelled" as BookingStatus,
        },
        confirm: {
          title: t("confirmations.confirm.title"),
          description: t("confirmations.confirm.description"),
          confirmText: t("confirmations.confirm.confirmText"),
          variant: "default" as const,
          status: "confirmed" as BookingStatus,
        },
        start: {
          title: t("confirmations.start.title"),
          description: t("confirmations.start.description"),
          confirmText: t("confirmations.start.confirmText"),
          variant: "default" as const,
          status: "in_progress" as BookingStatus,
        },
        complete: {
          title: t("confirmations.complete.title"),
          description: t("confirmations.complete.description"),
          confirmText: t("confirmations.complete.confirmText"),
          variant: "default" as const,
          status: "completed" as BookingStatus,
        },
        cancel: {
          title: t("confirmations.cancel.title"),
          description: t("confirmations.cancel.description"),
          confirmText: t("confirmations.cancel.confirmText"),
          variant: "destructive" as const,
          status: "cancelled" as BookingStatus,
        },
      };

      const config = actionConfig[action as keyof typeof actionConfig];
      if (!config) return;

      setConfirmationDialog({
        isOpen: true,
        action,
        title: config.title,
        description: config.description,
        confirmText: config.confirmText,
        variant: config.variant,
      });
    },
    [booking, t]
  );

  const handleConfirmAction = useCallback(async () => {
    if (!booking) return;

    setIsUpdating(true);

    try {
      const statusMap: Record<string, BookingStatus> = {
        accept: "accepted",
        decline: "cancelled",
        confirm: "confirmed",
        start: "in_progress",
        complete: "completed",
        cancel: "cancelled",
      };

      const newStatus = statusMap[confirmationDialog.action];
      if (!newStatus) return;

      const result = await updateBookingStatus(booking.id, newStatus);

      if (result.success) {
        setBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
        toast({
          variant: "success",
          title: t("success.statusUpdated"),
        });
      } else {
        console.error("Failed to update booking:", result.error);
        toast({
          variant: "destructive",
          title: t("errors.updateFailed"),
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        variant: "destructive",
        title: t("errors.unexpectedError"),
      });
    } finally {
      setIsUpdating(false);
      setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
    }
  }, [booking, confirmationDialog, t]);

  const handleCloseDialog = useCallback(() => {
    setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Memoize computed values before early returns
  const statusInfo = useMemo(
    () => (booking ? getStatusInfo(booking.status) : null),
    [booking, getStatusInfo]
  );
  const bookingTypeInfo = useMemo(
    () => (booking ? getBookingTypeInfo(booking.booking_type) : null),
    [booking, getBookingTypeInfo]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 animate-pulse mx-auto"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t("loading")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t("pleaseWait")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
            <X className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t("notFound")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t("bookingNotFound")}
            </p>
          </div>
          <Button
            onClick={() => router.push("/tasker/bookings")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
          >
            {t("backToBookings")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20">
      {/* Modern Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center gap-4">
            <BackButton className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mobile-text-xl">
                {t("title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mobile-text-sm">
                {booking.service_title || t("service")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 touch-target mobile-focus transition-all duration-200"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl space-y-8">
        {/* Hero Section with Status */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-700 dark:via-slate-800 dark:to-slate-600"></div>

          {/* Content */}
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              {/* Service Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mobile-text-2xl">
                      {booking.service_title || t("service")}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg mobile-text-base">
                      {booking.category_name
                        ? `${booking.category_name} service`
                        : "Professional service"}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-4">
                  <Badge
                    className={`${statusInfo?.color} text-lg font-semibold px-6 py-3 rounded-2xl shadow-lg`}
                  >
                    {statusInfo?.icon && (
                      <statusInfo.icon className="h-5 w-5 mr-2" />
                    )}
                    {statusInfo?.label}
                  </Badge>
                  <span className="text-slate-600 dark:text-slate-400 text-lg mobile-text-base">
                    {statusInfo?.description}
                  </span>
                </div>
              </div>

              {/* Price Display */}
              <div className="lg:text-right">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/20">
                  <div className="flex items-center gap-3 justify-center lg:justify-end">
                    <div>
                      <p className="text-4xl font-bold text-slate-900 dark:text-white mobile-text-3xl">
                        {formatCurrency(booking.agreed_price, booking.currency)}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mobile-text-sm">
                        {t("agreedPrice")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 px-8 py-6 border-b border-slate-200/50 dark:border-slate-600/50">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              {t("sections.customerInfo")}
            </h2>
          </div>

          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              {/* Customer Avatar */}
              <div className="relative group">
                <div className="relative h-24 w-24 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                  <User className="h-12 w-12 text-blue-600 dark:text-blue-400 m-auto mt-6" />
                </div>
              </div>

              {/* Customer Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {getCustomerName()}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    {t("customer")}
                  </p>
                </div>

                {/* Contact Info - Only show if booking is accepted or started */}
                {shouldShowContactInfo() && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-4 border border-blue-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            Email
                          </p>
                          <p className="text-slate-900 dark:text-white font-semibold">
                            {getCustomerEmail()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-4 border border-emerald-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            Phone
                          </p>
                          <p className="text-slate-900 dark:text-white font-semibold">
                            {getCustomerPhone()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Service & Booking Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Details */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-700 dark:to-slate-600 px-8 py-6 border-b border-slate-200/50 dark:border-slate-600/50">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                {t("sections.serviceDetails")}
              </h2>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {booking.service_title || t("service")}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  {booking.category_name
                    ? `${booking.category_name} service`
                    : "Professional service"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-emerald-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {t("price")}
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(booking.agreed_price, booking.currency)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-blue-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {t("duration")}
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatDuration(booking.estimated_duration || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 px-8 py-6 border-b border-slate-200/50 dark:border-slate-600/50">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                {t("sections.bookingInfo")}
              </h2>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="group bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-purple-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {t("date")}
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatDate(
                          booking.scheduled_date || booking.created_at
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-blue-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {t("time")}
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {booking.scheduled_time_start &&
                        booking.scheduled_time_end
                          ? `${formatTime(
                              booking.scheduled_time_start
                            )} - ${formatTime(booking.scheduled_time_end)}`
                          : t("timeNotSpecified")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-yellow-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {bookingTypeInfo?.icon && (
                        <bookingTypeInfo.icon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {t("type")}
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {bookingTypeInfo?.label}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-emerald-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {t("payment")}
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                        {booking.payment_method}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Requirements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Location */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 px-8 py-6 border-b border-slate-200/50 dark:border-slate-600/50">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                {t("sections.location")}
              </h2>
            </div>

            <div className="p-8">
              <div className="group bg-gradient-to-br from-red-50 to-pink-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-red-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      {booking.street_address || t("addressNotSpecified")}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {[booking.city, booking.region]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Requirements */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-slate-700 dark:to-slate-600 px-8 py-6 border-b border-slate-200/50 dark:border-slate-600/50">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                {t("sections.requirements")}
              </h2>
            </div>

            <div className="p-8">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                  {booking.customer_requirements || t("noRequirements")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 px-8 py-6 border-b border-slate-200/50 dark:border-slate-600/50">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              {t("sections.actions")}
            </h2>
          </div>

          <div className="p-8 space-y-6">
            {/* Primary Actions */}
            {booking.status === "pending" && (
              <div className="space-y-4">
                <Button
                  onClick={() => handleStatusAction("accept")}
                  disabled={isUpdating}
                  className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <CheckCircle className="h-6 w-6 mr-3" />
                  {t("actions.acceptRequest")}
                </Button>
                <Button
                  onClick={() => handleStatusAction("decline")}
                  disabled={isUpdating}
                  variant="outline"
                  className="w-full h-14 text-lg font-semibold border-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <X className="h-5 w-5 mr-3" />
                  {t("actions.declineRequest")}
                </Button>
              </div>
            )}

            {booking.status === "accepted" && (
              <div className="space-y-4">
                <Button
                  onClick={() => handleStatusAction("confirm")}
                  disabled={isUpdating}
                  className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <CheckCircle className="h-6 w-6 mr-3" />
                  {t("actions.confirmBooking")}
                </Button>
                <Button
                  onClick={() => handleStatusAction("cancel")}
                  disabled={isUpdating}
                  variant="outline"
                  className="w-full h-14 text-lg font-semibold border-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <X className="h-5 w-5 mr-3" />
                  {t("actions.cancelBooking")}
                </Button>
              </div>
            )}

            {booking.status === "confirmed" && (
              <div className="space-y-4">
                <Button
                  onClick={() => handleStatusAction("start")}
                  disabled={isUpdating}
                  className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Play className="h-6 w-6 mr-3" />
                  {t("actions.startTask")}
                </Button>
                <Button
                  onClick={() => handleStatusAction("cancel")}
                  disabled={isUpdating}
                  variant="outline"
                  className="w-full h-14 text-lg font-semibold border-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <X className="h-5 w-5 mr-3" />
                  {t("actions.cancelBooking")}
                </Button>
              </div>
            )}

            {booking.status === "in_progress" && (
              <div className="space-y-4">
                <Button
                  onClick={() => handleStatusAction("complete")}
                  disabled={isUpdating}
                  className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <CheckCircle className="h-6 w-6 mr-3" />
                  {t("actions.completeTask")}
                </Button>
              </div>
            )}

            {(booking.status === "completed" ||
              booking.status === "cancelled") && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  {booking.status === "completed" ? (
                    <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <X className="h-8 w-8 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  {booking.status === "completed"
                    ? t("completed")
                    : t("cancelled")}
                </p>
              </div>
            )}

            {/* Communication Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={async () => {
                  if (!booking || !booking.customer_id) {
                    toast({
                      variant: "destructive",
                      title: t("error"),
                      description: "Customer information not available",
                    });
                    return;
                  }
                  
                  try {
                    const result = await createConversationAction(
                      booking.customer_id,
                      undefined, // jobId
                      undefined, // serviceId
                      booking.id, // bookingId
                      `Hello! I'd like to discuss the booking for "${booking.service_title || 'this service'}".`
                    );

                    if (result.conversation) {
                      router.push(`/tasker/messages/${result.conversation.id}`);
                    } else {
                      toast({
                        variant: "destructive",
                        title: t("error"),
                        description: result.errorMessage || "Failed to start conversation",
                      });
                    }
                  } catch (error) {
                    console.error("Error starting conversation:", error);
                    toast({
                      variant: "destructive",
                      title: t("error"),
                      description: "Failed to start conversation",
                    });
                  }
                }}
                className="h-14 text-lg font-semibold border-2 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageSquare className="h-5 w-5 mr-3" />
                {t("actions.messageCustomer")}
              </Button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 px-8 py-6 border-b border-slate-200/50 dark:border-slate-600/50">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              {t("sections.timeline")}
            </h2>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              {/* Timeline Item - Booking Created */}
              <div className="flex items-start gap-6">
                <div className="relative">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-slate-200 dark:bg-slate-600"></div>
                </div>
                <div className="flex-1 pb-8">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-emerald-200/50 dark:border-slate-600/50">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {t("timeline.bookingCreated")}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {formatDate(booking.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline Item - Booking Accepted */}
              {booking.accepted_at && (
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-slate-200 dark:bg-slate-600"></div>
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-blue-200/50 dark:border-slate-600/50">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {t("timeline.bookingAccepted")}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {formatDate(booking.accepted_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline Item - Booking Confirmed */}
              {booking.confirmed_at && (
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-slate-200 dark:bg-slate-600"></div>
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-emerald-200/50 dark:border-slate-600/50">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {t("timeline.bookingConfirmed")}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {formatDate(booking.confirmed_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline Item - Task Started */}
              {booking.started_at && (
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-slate-200 dark:bg-slate-600"></div>
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-indigo-200/50 dark:border-slate-600/50">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {t("timeline.taskStarted")}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {formatDate(booking.started_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline Item - Task Completed */}
              {booking.completed_at && (
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-emerald-200/50 dark:border-slate-600/50">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {t("timeline.taskCompleted")}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {formatDate(booking.completed_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmAction}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
        confirmText={confirmationDialog.confirmText}
        variant={confirmationDialog.variant}
        isLoading={isUpdating}
      />
    </div>
  );
}
