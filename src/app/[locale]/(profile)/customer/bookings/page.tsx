"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/stores/userStore";
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
  variant: "default" | "success" | "warning" | "danger";
}

// Utility functions moved outside component to avoid re-creation
const getActionButton = (
  booking: BookingWithDetails,
  t: (key: string, values?: Record<string, string | number>) => string
) => {
  const { status } = booking;

  const actionConfig = {
    pending: {
      text: t("actions.cancelBooking"),
      variant: "danger" as const,
      action: "cancel",
      className: "bg-color-error text-color-surface hover:bg-color-error-dark",
    },
    accepted: {
      text: t("actions.cancelBooking"),
      variant: "danger" as const,
      action: "cancel",
      className: "bg-color-error text-color-surface hover:bg-color-error-dark",
    },
    confirmed: {
      text: t("actions.cancelBooking"),
      variant: "danger" as const,
      action: "cancel",
      className: "bg-color-error text-color-surface hover:bg-color-error-dark",
    },
    in_progress: {
      text: t("actions.cancelBooking"),
      variant: "danger" as const,
      action: "cancel",
      className: "bg-color-error text-color-surface hover:bg-color-error-dark",
    },
    completed: {
      text: t("status.completed"),
      variant: "default" as const,
      action: "none",
      className:
        "bg-color-success/10 text-color-success border border-color-success/20",
    },
    cancelled: {
      text: t("status.cancelled"),
      variant: "default" as const,
      action: "none",
      className:
        "bg-color-error/10 text-color-error border border-color-error/20",
    },
    disputed: {
      text: t("status.disputed"),
      variant: "default" as const,
      action: "none",
      className:
        "bg-color-warning/10 text-color-warning border border-color-warning/20",
    },
    refunded: {
      text: t("status.refunded"),
      variant: "default" as const,
      action: "none",
      className: "bg-color-info/10 text-color-info border border-color-info/20",
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
  const [confirmationDialog, setConfirmationDialog] =
    useState<ConfirmationDialogState>({
      isOpen: false,
      bookingId: "",
      action: "",
      title: "",
      description: "",
      confirmText: "",
      variant: "default",
    });

  const { user } = useUserStore();
  const t = useTranslations("customerBookings");

  // Fetch bookings with pagination
  const fetchBookings = useCallback(
    async (page: number = 0, append: boolean = false) => {
      if (!user) return;

      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }

        // Clear any previous pagination errors
        setPaginationError(null);

        const result = await getCustomerBookings(
          user.id,
          20,
          page * 20,
          !append
        );

        if (append) {
          // Append new bookings to existing ones
          setBookings((prev) => [...prev, ...result.bookings]);
        } else {
          // Replace bookings for initial load or refresh
          setBookings(result.bookings);
        }

        setCurrentPage(page);
        setHasMore(result.hasMore);
        setTotalCount(result.total);
      } catch (error) {
        console.error("Error fetching customer bookings:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load bookings";

        // Set pagination error for better UX
        setPaginationError(errorMessage);

        // Only show toast for initial load errors, not for load more errors
        if (!append) {
          toast.error(errorMessage);
          setBookings([]);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [user]
  );

  // Initial data fetch
  useEffect(() => {
    fetchBookings(0);
  }, [fetchBookings]);

  // Memoized filtered bookings for better performance
  const filteredBookings = useMemo(() => {
    if (activeTab === "all") {
      return bookings;
    }
    return bookings.filter((booking) => booking.status === activeTab);
  }, [bookings, activeTab]);

  // Memoized booking counts for better performance
  const bookingCounts = useMemo(() => {
    const counts: Record<TaskStatus, number> = {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      accepted: bookings.filter((b) => b.status === "accepted").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      in_progress: bookings.filter((b) => b.status === "in_progress").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };
    return counts;
  }, [bookings]);

  const handleActionClick = useCallback(
    (booking: BookingWithDetails) => {
      const actionButton = getActionButton(booking, t);

      if (actionButton.action === "none") {
        return;
      }

      const actionConfig = {
        cancel: {
          title: t("confirmations.cancel.title"),
          description: t("confirmations.cancel.description", {
            taskerName: getTaskerName(booking),
          }),
          confirmText: t("confirmations.cancel.confirmText"),
          variant: "danger" as const,
        },
      };

      const config =
        actionConfig[actionButton.action as keyof typeof actionConfig];

      setConfirmationDialog({
        isOpen: true,
        bookingId: booking.id,
        action: actionButton.action,
        title: config.title,
        description: config.description,
        confirmText: config.confirmText,
        variant: config.variant,
      });
    },
    [t]
  );

  const handleConfirmAction = useCallback(async () => {
    if (!user) return;

    setIsUpdating(true);

    try {
      if (confirmationDialog.action === "cancel") {
        const result = await cancelCustomerBooking(
          confirmationDialog.bookingId,
          user.id,
          "Cancelled by customer"
        );

        if (result.success) {
          // Update local state
          setBookings((prev) =>
            prev.map((booking) =>
              booking.id === confirmationDialog.bookingId
                ? { ...booking, status: "cancelled" as BookingStatus }
                : booking
            )
          );
          toast.success(t("success.bookingCancelled"));
        } else {
          console.error("Failed to cancel booking:", result.error);
          toast.error(result.error || t("errors.cancelFailed"));
        }
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(t("errors.unexpectedError"));
    } finally {
      setIsUpdating(false);
      setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
    }
  }, [confirmationDialog, user, t]);

  const handleCloseDialog = useCallback(() => {
    setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleTabChange = useCallback((tab: TaskStatus) => {
    setActiveTab(tab);
    setIsNavExpanded(false);
    // Reset pagination when changing tabs
    setCurrentPage(0);
    setHasMore(false);
    setPaginationError(null);
    // Note: We don't refetch here since filtering is done client-side
    // If you want server-side filtering, you'd need to refetch here
  }, []);

  const handleNavToggle = useCallback(() => {
    setIsNavExpanded((prev) => !prev);
  }, []);

  const handleRetryLoadMore = useCallback(() => {
    setPaginationError(null);
    fetchBookings(currentPage + 1, true);
  }, [fetchBookings, currentPage]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchBookings(currentPage + 1, true);
    }
  }, [fetchBookings, currentPage, isLoadingMore, hasMore]);

  if (isLoading) {
    return <BookingLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-6 max-w-6xl space-y-8">
        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 px-8 py-6 border-b border-slate-200/50 dark:border-slate-600/50">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              {t("title")}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              {t("description")}
            </p>
          </div>
          <div className="p-6">
            <BookingTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              bookingCounts={bookingCounts}
              isNavExpanded={isNavExpanded}
              onNavToggle={handleNavToggle}
              filteredBookingsLength={filteredBookings.length}
            />
          </div>
        </div>

        {/* Booking Cards */}
        <div className="space-y-6">
          {filteredBookings.map((booking, index) => {
            const actionButton = getActionButton(booking, t);

            return (
              <div
                key={booking.id}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden transform transition-all duration-500 hover:scale-[1.02] animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CustomerBookingCard
                  booking={booking}
                  onActionClick={handleActionClick}
                  isUpdating={isUpdating}
                  actionButton={actionButton}
                />
              </div>
            );
          })}

          {/* Loading indicator for new items */}
          {isLoadingMore && (
            <div className="flex justify-center py-8">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">
                    {t("loading.loadingMore")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!isLoading && filteredBookings.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden animate-fade-in-up">
            <EmptyState activeTab={activeTab} />
          </div>
        )}

        {/* Load More Section - Only show if there are bookings and more to load */}
        {hasMore &&
          !isLoading &&
          bookings.length > 0 &&
          totalCount > bookings.length && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="p-8">
                <div className="flex flex-col items-center space-y-6">
                  {/* Error State */}
                  {paginationError && (
                    <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl max-w-md shadow-lg">
                      <p className="text-red-600 dark:text-red-400 text-sm mb-4 font-medium">
                        {paginationError}
                      </p>
                      <button
                        onClick={handleRetryLoadMore}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold underline transition-colors"
                      >
                        {t("actions.tryAgain")}
                      </button>
                    </div>
                  )}

                  {/* Load More Button */}
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-700 border-2 border-blue-600 dark:border-blue-400 rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105"
                    aria-label={t("actions.loadMoreBookings")}
                  >
                    {isLoadingMore ? (
                      <>
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-3"></div>
                        {t("loading.loadingMore")}
                      </>
                    ) : (
                      <>
                        <span>{t("actions.loadMoreBookings")}</span>
                        <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>

                  {/* Results Count - Only show if there are bookings */}
                  {totalCount > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-xl px-4 py-2 border border-slate-200 dark:border-slate-600">
                      <p className="text-slate-600 dark:text-slate-400 text-sm text-center font-medium">
                        {t("results.showing", {
                          current: bookings.length,
                          total: totalCount,
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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
