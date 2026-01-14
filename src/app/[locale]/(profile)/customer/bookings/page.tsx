"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { CustomerBookingCard } from "@/components/bookings/CustomerBookingCard";
import { BookingTabs } from "@/components/bookings/BookingTabs";
import { EmptyState } from "@/components/bookings/EmptyState";
import { BookingLoadingSkeleton } from "@/components/bookings/BookingLoadingSkeleton";
import {
  getCustomerBookings,
  cancelCustomerBooking,
  type BookingWithDetails,
} from "@/actions/bookings";
import { BookingStatus } from "@/types/supabase";
import { Calendar, ArrowRight } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { useBookingsRealtime } from "@/hooks/useBookingsRealtime";
import { BackButton } from "@/components/ui/BackButton";

type TaskStatus =
  | "all"
  | "pending"
  | "accepted"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

interface ConfirmationDialogState {
  isOpen: boolean;
  bookingId: string;
  action: string;
  title: string;
  description: string;
  confirmText: string;
  variant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const getActionButton = (
  booking: BookingWithDetails,
  t: (key: string, values?: Record<string, string | number>) => string
) => {
  const { status } = booking;

  const actionConfig = {
    pending: {
      text: t("actions.cancelBooking"),
      variant: "destructive" as const,
      action: "cancel",
      className: "bg-red-600 text-white hover:bg-red-700",
    },
    accepted: {
      text: t("actions.cancelBooking"),
      variant: "destructive" as const,
      action: "cancel",
      className: "bg-red-600 text-white hover:bg-red-700",
    },
    confirmed: {
      text: t("actions.cancelBooking"),
      variant: "destructive" as const,
      action: "cancel",
      className: "bg-red-600 text-white hover:bg-red-700",
    },
    in_progress: {
      text: t("actions.cancelBooking"),
      variant: "destructive" as const,
      action: "cancel",
      className: "bg-red-600 text-white hover:bg-red-700",
    },
    completed: {
      text: t("status.completed"),
      variant: "default" as const,
      action: "none",
      className: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
    },
    cancelled: {
      text: t("status.cancelled"),
      variant: "default" as const,
      action: "none",
      className: "bg-red-500/10 text-red-500 border border-red-500/20",
    },
    disputed: {
      text: t("status.disputed"),
      variant: "default" as const,
      action: "none",
      className: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    },
    refunded: {
      text: t("status.refunded"),
      variant: "default" as const,
      action: "none",
      className: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
    },
  };

  return actionConfig[status] || actionConfig.completed;
};

const getTaskerName = (booking: BookingWithDetails) => {
  const firstName = booking.tasker_first_name || "";
  const lastName = booking.tasker_last_name || "";
  return `${firstName} ${lastName}`.trim() || "Tasker";
};

export default function CustomerBookingsPage() {
  const { user } = useUserStore();
  const { toast } = useToast();
  const t = useTranslations("customerBookings");
  const tCommon = useTranslations("common");

  const [activeTab, setActiveTab] = useState<TaskStatus>("all");
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationError, setPaginationError] = useState<string | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationDialogState>({
    isOpen: false,
    bookingId: "",
    action: "",
    title: "",
    description: "",
    confirmText: "",
    variant: "default",
  });

  const fetchBookings = useCallback(
    async (page: number = 0, append: boolean = false) => {
      try {
        append ? setIsLoadingMore(true) : setIsLoading(true);
        setPaginationError(null);

        const result = await getCustomerBookings(10, page * 10, !append);

        if (append) {
          setBookings((prev) => [...prev, ...result.bookings]);
        } else {
          setBookings(result.bookings);
        }

        setCurrentPage(page);
        setHasMore(result.hasMore);
        setTotalCount(result.total);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        const errorMessage = t("errors.loadFailed");
        setPaginationError(errorMessage);

        if (!append) {
          toast({
            variant: "destructive",
            title: tCommon("error"),
            description: errorMessage,
          });
          setBookings([]);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [t, tCommon, toast]
  );

  useBookingsRealtime({
    userId: user?.id || null,
    enabled: !!user?.id,
    onBookingUpdate: (bookingId, updates) => {
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, ...updates } : booking
        )
      );
    },
    onNewBooking: (booking) => {
      setBookings((prev) => {
        if (prev.some((b) => b.id === booking.id)) return prev;
        return [booking as BookingWithDetails, ...prev];
      });
    },
  });

  useEffect(() => {
    fetchBookings(0);
  }, [fetchBookings]);

  const filteredBookings = useMemo(() => {
    return activeTab === "all" ? bookings : bookings.filter((b) => b.status === activeTab);
  }, [bookings, activeTab]);

  const bookingCounts = useMemo(() => {
    return {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      accepted: bookings.filter((b) => b.status === "accepted").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      in_progress: bookings.filter((b) => b.status === "in_progress").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };
  }, [bookings]);

  const handleActionClick = useCallback(
    (booking: BookingWithDetails) => {
      const actionButton = getActionButton(booking, t);
      if (actionButton.action === "none") return;

      setConfirmationDialog({
        isOpen: true,
        bookingId: booking.id,
        action: actionButton.action,
        title: t("confirmations.cancel.title"),
        description: t("confirmations.cancel.description", {
          taskerName: getTaskerName(booking),
        }),
        confirmText: t("confirmations.cancel.confirmText"),
        variant: "destructive",
      });
    },
    [t]
  );

  const handleConfirmAction = useCallback(async () => {
    setIsUpdating(true);
    try {
      if (confirmationDialog.action === "cancel") {
        const result = await cancelCustomerBooking(confirmationDialog.bookingId, "Cancelled by customer");

        if (result.success) {
          setBookings((prev) =>
            prev.map((b) => (b.id === confirmationDialog.bookingId ? { ...b, status: "cancelled" } : b))
          );
          toast({
            variant: "success",
            title: tCommon("complete"),
            description: t("success.bookingCancelled"),
          });
        } else {
          toast({
            variant: "destructive",
            title: tCommon("error"),
            description: result.error || t("errors.cancelFailed"),
          });
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: tCommon("error"),
        description: t("errors.unexpectedError"),
      });
    } finally {
      setIsUpdating(false);
      setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
    }
  }, [confirmationDialog, t, tCommon, toast]);

  const handleCloseDialog = useCallback(() => {
    setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  if (isLoading) return <BookingLoadingSkeleton />;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="container mx-auto px-4 py-6 max-w-6xl space-y-8">
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 px-8 py-6 border-b border-slate-200/50 dark:border-slate-600/50">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              {t("title")}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{t("description")}</p>
          </div>
          <div className="p-6">
            <BookingTabs
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab as TaskStatus);
                setIsNavExpanded(false);
                setCurrentPage(0);
              }}
              bookingCounts={bookingCounts}
              isNavExpanded={isNavExpanded}
              onNavToggle={() => setIsNavExpanded(!isNavExpanded)}
              filteredBookingsLength={filteredBookings.length}
            />
          </div>
        </div>

        <div className="space-y-6">
          {filteredBookings.map((booking, index) => (
            <div
              key={booking.id}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden transform transition-all duration-500 hover:scale-[1.01] animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CustomerBookingCard
                booking={booking}
                onActionClick={handleActionClick}
                isUpdating={isUpdating}
                actionButton={getActionButton(booking, t)}
              />
            </div>
          ))}

          {isLoadingMore && (
            <div className="flex justify-center py-8">
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">{t("loading.loadingMore")}</span>
              </div>
            </div>
          )}
        </div>

        {!isLoading && filteredBookings.length === 0 && (
          <div className="animate-fade-in-up">
            <EmptyState activeTab={activeTab} />
          </div>
        )}

        {hasMore && !isLoading && bookings.length < totalCount && (
          <div className="flex flex-col items-center py-8 space-y-4">
            {paginationError && (
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm mb-2">{paginationError}</p>
                <button onClick={() => fetchBookings(currentPage + 1, true)} className="text-blue-600 text-sm font-bold underline">
                  {t("actions.tryAgain")}
                </button>
              </div>
            )}
            <button
              onClick={() => fetchBookings(currentPage + 1, true)}
              disabled={isLoadingMore}
              className="px-8 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoadingMore ? t("loading.loadingMore") : t("actions.loadMoreBookings")}
              {!isLoadingMore && <ArrowRight className="w-4 h-4" />}
            </button>
            <p className="text-xs text-slate-500">
              {t("results.showing", { current: bookings.length, total: totalCount })}
            </p>
          </div>
        )}
      </div>

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