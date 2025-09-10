"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUserStore } from "@/stores/userStore";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { BookingCard } from "@/components/bookings/BookingCard";
import { BookingTabs } from "@/components/bookings/BookingTabs";
import { EmptyState } from "@/components/bookings/EmptyState";
import { BookingLoadingSkeleton } from "@/components/bookings/BookingLoadingSkeleton";
import {
  getTaskerBookings,
  updateBookingStatus,
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
      text: "Accept Request",
      variant: "success" as const,
      action: "accept",
      className:
        "bg-color-success text-color-surface hover:bg-color-success-dark",
    },
    accepted: {
      text: "Confirm Booking",
      variant: "success" as const,
      action: "confirm",
      className:
        "bg-color-success text-color-surface hover:bg-color-success-dark",
    },
    confirmed: {
      text: "Start Task",
      variant: "success" as const,
      action: "start",
      className:
        "bg-color-success text-color-surface hover:bg-color-success-dark",
    },
    in_progress: {
      text: "Complete Task",
      variant: "success" as const,
      action: "complete",
      className:
        "bg-color-success text-color-surface hover:bg-color-success-dark",
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

const getCustomerName = (booking: BookingWithDetails) => {
  const firstName = booking.customer_first_name || "";
  const lastName = booking.customer_last_name || "";
  return `${firstName} ${lastName}`.trim() || "Customer";
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<TaskStatus>("all");
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
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

  // Redirect customer users
  useEffect(() => {
    if (user && user.role === "customer") {
      router.replace("/customer/dashboard");
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

        const result = await getTaskerBookings(user.id, 20, page * 20, !append);

        if (append) {
          // Append new bookings to existing ones
          setBookings((prev) => [...prev, ...result.bookings]);
        } else {
          // Replace bookings for initial load or refresh
          setBookings(result.bookings);
        }

        setCurrentPage(page);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error("Error fetching bookings:", error);
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
      accept: {
        title: "Accept Booking Request",
        description: `Are you sure you want to accept this booking request from ${getCustomerName(
          booking
        )}?`,
        confirmText: "Accept Request",
        variant: "success" as const,
      },
      confirm: {
        title: "Confirm Booking",
        description: `Are you sure you want to confirm this booking with ${getCustomerName(
          booking
        )}?`,
        confirmText: "Confirm Booking",
        variant: "success" as const,
      },
      start: {
        title: "Start Task",
        description: `Are you ready to start the task for ${getCustomerName(
          booking
        )}?`,
        confirmText: "Start Task",
        variant: "success" as const,
      },
      complete: {
        title: "Complete Task",
        description: `Are you sure you want to mark this task as completed for ${getCustomerName(
          booking
        )}?`,
        confirmText: "Complete Task",
        variant: "success" as const,
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
      const statusMap: Record<string, BookingStatus> = {
        accept: "accepted",
        confirm: "confirmed",
        start: "in_progress",
        complete: "completed",
      };

      const newStatus = statusMap[confirmationDialog.action];
      if (!newStatus) return;

      const result = await updateBookingStatus(
        confirmationDialog.bookingId,
        newStatus,
        user.id
      );

      if (result.success) {
        // Update local state
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === confirmationDialog.bookingId
              ? { ...booking, status: newStatus }
              : booking
          )
        );
        toast.success("Booking status updated successfully");
      } else {
        console.error("Failed to update booking:", result.error);
        toast.error(result.error || "Failed to update booking status");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
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
    setHasMore(true);
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
              Manage your booking requests and ongoing tasks
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
              <BookingCard
                key={booking.id}
                booking={booking}
                onActionClick={handleActionClick}
                isUpdating={isUpdating}
                actionButton={actionButton}
              />
            );
          })}
        </div>

        {/* Empty State */}
        {!isLoading && filteredBookings.length === 0 && (
          <EmptyState activeTab={activeTab} />
        )}

        {/* Load More Button */}
        {hasMore && !isLoading && (
          <div className="flex flex-col items-center pt-4 space-y-3">
            {paginationError && (
              <div className="text-center">
                <p className="text-color-error text-sm mb-2">
                  {paginationError}
                </p>
                <button
                  onClick={handleRetryLoadMore}
                  className="text-color-primary hover:text-color-primary-dark text-sm underline"
                >
                  Try again
                </button>
              </div>
            )}
            <button
              onClick={() => fetchBookings(currentPage + 1, true)}
              disabled={isLoadingMore}
              className="px-6 py-2 bg-color-primary text-color-surface rounded-lg hover:bg-color-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 border-color-surface border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </>
              ) : (
                "Load More Bookings"
              )}
            </button>
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
