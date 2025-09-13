"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUserStore } from "@/stores/userStore";
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
const getActionButton = (booking: BookingWithDetails) => {
  const { status } = booking;

  const actionConfig = {
    pending: {
      text: "Cancel Booking",
      variant: "danger" as const,
      action: "cancel",
      className: "bg-color-error text-color-surface hover:bg-color-error-dark",
    },
    accepted: {
      text: "Cancel Booking",
      variant: "danger" as const,
      action: "cancel",
      className: "bg-color-error text-color-surface hover:bg-color-error-dark",
    },
    confirmed: {
      text: "Cancel Booking",
      variant: "danger" as const,
      action: "cancel",
      className: "bg-color-error text-color-surface hover:bg-color-error-dark",
    },
    in_progress: {
      text: "Cancel Booking",
      variant: "danger" as const,
      action: "cancel",
      className: "bg-color-error text-color-surface hover:bg-color-error-dark",
    },
    completed: {
      text: "Completed",
      variant: "default" as const,
      action: "none",
      className:
        "bg-color-success/10 text-color-success border border-color-success/20",
    },
    cancelled: {
      text: "Cancelled",
      variant: "default" as const,
      action: "none",
      className:
        "bg-color-error/10 text-color-error border border-color-error/20",
    },
    disputed: {
      text: "Disputed",
      variant: "default" as const,
      action: "none",
      className:
        "bg-color-warning/10 text-color-warning border border-color-warning/20",
    },
    refunded: {
      text: "Refunded",
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

  const router = useRouter();
  const { user } = useUserStore();

  // Redirect tasker users
  useEffect(() => {
    if (user && user.role === "tasker") {
      router.replace("/tasker/dashboard");
    }
  }, [user, router]);

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

  const handleActionClick = useCallback((booking: BookingWithDetails) => {
    const actionButton = getActionButton(booking);

    if (actionButton.action === "none") {
      return;
    }

    const actionConfig = {
      cancel: {
        title: "Cancel Booking",
        description: `Are you sure you want to cancel this booking with ${getTaskerName(
          booking
        )}? This action cannot be undone.`,
        confirmText: "Cancel Booking",
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
  }, []);

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
          toast.success("Booking cancelled successfully");
        } else {
          console.error("Failed to cancel booking:", result.error);
          toast.error(result.error || "Failed to cancel booking");
        }
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdating(false);
      setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
    }
  }, [confirmationDialog, user]);

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
    <div className="min-h-screen bg-color-bg smooth-scroll">
      <div className="container mx-auto px-4 py-6 space-y-6 mobile-spacing">
        {/* Page Header */}
        <div className="bg-color-surface border-b border-color-border pb-4">
          <div>
            <h1 className="text-2xl font-bold text-color-text-primary mobile-text-xl mobile-leading">
              My Bookings
            </h1>
            <p className="text-color-text-secondary text-sm mt-1 mobile-leading">
              Track and manage all your service bookings
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <BookingTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          bookingCounts={bookingCounts}
          isNavExpanded={isNavExpanded}
          onNavToggle={handleNavToggle}
          filteredBookingsLength={filteredBookings.length}
        />

        {/* Booking Cards */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const actionButton = getActionButton(booking);

            return (
              <CustomerBookingCard
                key={booking.id}
                booking={booking}
                onActionClick={handleActionClick}
                isUpdating={isUpdating}
                actionButton={actionButton}
              />
            );
          })}

          {/* Loading indicator for new items */}
          {isLoadingMore && (
            <div className="flex justify-center py-4">
              <div className="flex items-center space-x-2 text-color-text-secondary">
                <div className="w-4 h-4 border-2 border-color-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Loading more bookings...</span>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!isLoading && filteredBookings.length === 0 && (
          <EmptyState activeTab={activeTab} />
        )}

        {/* Load More Section - Only show if there are bookings and more to load */}
        {hasMore &&
          !isLoading &&
          bookings.length > 0 &&
          totalCount > bookings.length && (
            <div className="flex flex-col items-center pt-6 space-y-4">
              {/* Error State */}
              {paginationError && (
                <div className="text-center p-4 bg-color-error/5 border border-color-error/20 rounded-lg max-w-md">
                  <p className="text-color-error text-sm mb-3">
                    {paginationError}
                  </p>
                  <button
                    onClick={handleRetryLoadMore}
                    className="text-color-primary hover:text-color-primary-dark text-sm font-medium underline transition-colors"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Load More Button */}
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="group relative inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-color-primary bg-transparent border border-color-primary rounded-lg hover:bg-color-primary hover:text-color-surface focus:outline-none focus:ring-2 focus:ring-color-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
                aria-label="Load more bookings"
              >
                {isLoadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                    Loading more...
                  </>
                ) : (
                  <>
                    <span>Load More Bookings</span>
                    <svg
                      className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </>
                )}
              </button>

              {/* Results Count - Only show if there are bookings */}
              {totalCount > 0 && (
                <p className="text-color-text-secondary text-xs text-center">
                  Showing {bookings.length} of {totalCount} bookings
                </p>
              )}
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
