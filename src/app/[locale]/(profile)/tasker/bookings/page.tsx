"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { BookingCard } from "@/components/bookings/BookingCard";
import { JobApplicationCard } from "@/components/bookings/JobApplicationCard";
import { TaskerBookingCard } from "@/components/bookings/TaskerBookingCard";
import {
  TaskerBookingTabs,
  type TaskerBookingTab,
} from "@/components/bookings/TaskerBookingTabs";
import { EmptyState } from "@/components/bookings/EmptyState";
import { BookingLoadingSkeleton } from "@/components/bookings/BookingLoadingSkeleton";
import {
  getTaskerBookings,
  getTaskerJobApplications,
  getTaskerAsCustomerBookings,
  updateBookingStatus,
  type BookingWithDetails,
  type TaskerJobApplicationWithDetails,
  type TaskerBookingWithDetails,
} from "@/actions/bookings";
import { BookingStatus } from "@/types/supabase";
import { Calendar, ArrowRight } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { useBookingsRealtime } from "@/hooks/useBookingsRealtime";
import { useJobApplicationsRealtime } from "@/hooks/useJobApplicationsRealtime";
import { BackButton } from "@/components/ui/BackButton";
import { useTranslations } from "next-intl";

// Removed unused TaskStatus type

interface ConfirmationDialogState {
  isOpen: boolean;
  bookingId: string;
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

// Utility functions moved outside component to avoid re-creation
const getActionButton = (booking: BookingWithDetails) => {
  const { status } = booking;

  const actionConfig = {
    pending: {
      text: "Accept Request",
      variant: "default" as const,
      action: "accept",
      className: "bg-green-600 text-white hover:bg-green-700",
    },
    accepted: {
      text: "Confirm Booking",
      variant: "default" as const,
      action: "confirm",
      className: "bg-green-600 text-white hover:bg-green-700",
    },
    confirmed: {
      text: "Start Task",
      variant: "default" as const,
      action: "start",
      className: "bg-green-600 text-white hover:bg-green-700",
    },
    in_progress: {
      text: "Complete Task",
      variant: "default" as const,
      action: "complete",
      className: "bg-green-600 text-white hover:bg-green-700",
    },
    completed: {
      text: "Completed",
      variant: "default" as const,
      action: "none",
      className:
        "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50",
    },
    cancelled: {
      text: "Cancelled",
      variant: "default" as const,
      action: "none",
      className:
        "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50",
    },
    disputed: {
      text: "Disputed",
      variant: "default" as const,
      action: "none",
      className:
        "bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50",
    },
    refunded: {
      text: "Refunded",
      variant: "default" as const,
      action: "none",
      className:
        "bg-cyan-100 text-cyan-800 border border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800/50",
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
  const { user } = useUserStore();
  const t = useTranslations("bookings");
  const { toast } = useToast();
  // Note: "booked-taskers" tab is hidden from UI but code is kept for future use
  const [activeTab, setActiveTab] = useState<TaskerBookingTab>("my-bookings");
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  
  // Prevent "booked-taskers" from being active (hidden feature)
  useEffect(() => {
    if (activeTab === "booked-taskers") {
      setActiveTab("my-bookings");
    }
  }, [activeTab]);

  // State for different data types
  const [myBookings, setMyBookings] = useState<BookingWithDetails[]>([]);
  const [bookedTaskers, setBookedTaskers] = useState<
    TaskerBookingWithDetails[]
  >([]);
  const [myApplications, setMyApplications] = useState<
    TaskerJobApplicationWithDetails[]
  >([]);

  // State for total counts (loaded separately for all tabs)
  const [totalCounts, setTotalCounts] = useState({
    myBookings: 0,
    bookedTaskers: 0,
    myApplications: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSwitchingTab, setIsSwitchingTab] = useState(false); // For tab switching indicator
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [paginationError, setPaginationError] = useState<string | null>(null);
  
  // Track which tabs have been loaded to avoid showing skeleton on tab switch
  // Using ref to avoid dependency issues in callbacks
  const loadedTabsRef = useRef<Set<TaskerBookingTab>>(new Set());
  const [loadedTabs, setLoadedTabs] = useState<Set<TaskerBookingTab>>(new Set());
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

  // Fetch data based on active tab
  const fetchData = useCallback(
    async (page: number = 0, append: boolean = false, isTabSwitch: boolean = false, tabOverride?: TaskerBookingTab) => {
      // Use tabOverride if provided, otherwise use activeTab
      const targetTab = tabOverride || activeTab;
      
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          // Only show full loading skeleton on initial load or if tab hasn't been loaded before
          const tabAlreadyLoaded = loadedTabsRef.current.has(targetTab);
          if (!isTabSwitch || !tabAlreadyLoaded) {
            setIsLoading(true);
          } else {
            // For tab switches with existing data, show a subtle loading indicator
            setIsSwitchingTab(true);
          }
        }

        // Clear any previous pagination errors
        setPaginationError(null);

        let result: {
          bookings?: BookingWithDetails[] | TaskerBookingWithDetails[];
          applications?: TaskerJobApplicationWithDetails[];
          hasMore: boolean;
        };
        switch (targetTab) {
          case "my-bookings":
            result = await getTaskerBookings(10, page * 10, !append);
            if (append) {
              setMyBookings((prev) => [
                ...prev,
                ...(result.bookings as BookingWithDetails[]),
              ]);
            } else {
              setMyBookings(result.bookings as BookingWithDetails[]);
            }
            break;
          case "booked-taskers":
            result = await getTaskerAsCustomerBookings(20, page * 20, !append);
            if (append) {
              setBookedTaskers((prev) => [
                ...prev,
                ...(result.bookings as TaskerBookingWithDetails[]),
              ]);
            } else {
              setBookedTaskers(result.bookings as TaskerBookingWithDetails[]);
            }
            break;
          case "my-applications":
            result = await getTaskerJobApplications(10, page * 10, !append);
            if (append) {
              setMyApplications((prev) => [
                ...prev,
                ...(result.applications as TaskerJobApplicationWithDetails[]),
              ]);
            } else {
              setMyApplications(
                result.applications as TaskerJobApplicationWithDetails[]
              );
            }
            break;
        }

        setCurrentPage(page);
        setHasMore(result.hasMore);
        
        // Mark this tab as loaded (using ref to avoid dependency issues)
        if (!append) {
          loadedTabsRef.current.add(targetTab);
          setLoadedTabs(new Set(loadedTabsRef.current));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load data";

        // Set pagination error for better UX
        setPaginationError(errorMessage);

        // Only show toast for initial load errors, not for load more errors
        if (!append) {
          toast({
            variant: "destructive",
            title: t("error"),
            description: errorMessage,
          });
          // Clear the appropriate state
          switch (targetTab) {
            case "my-bookings":
              setMyBookings([]);
              break;
            case "booked-taskers":
              setBookedTaskers([]);
              break;
            case "my-applications":
              setMyApplications([]);
              break;
          }
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsSwitchingTab(false);
      }
    },
    [activeTab] // Removed loadedTabs from dependencies to prevent infinite loop
  );

  // Use realtime hooks for bookings and applications
  useBookingsRealtime({
    userId: user?.id || null,
    enabled: !!user?.id && activeTab === "my-bookings",
    onBookingUpdate: (bookingId, updates) => {
      setMyBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, ...updates } : booking
        )
      );
    },
    onNewBooking: (booking) => {
      setMyBookings((prev) => {
        if (prev.some((b) => b.id === booking.id)) {
          return prev;
        }
        return [booking as BookingWithDetails, ...prev];
      });
    },
  });

  useJobApplicationsRealtime({
    taskerId: user?.id || null,
    enabled: !!user?.id && activeTab === "my-applications",
    onNewApplication: (application) => {
      setMyApplications((prev) => {
        if (prev.some((a) => a.id === application.id)) {
          return prev;
        }
        // Add new application at the beginning and sort by created_at descending
        const updated = [application as TaskerJobApplicationWithDetails, ...prev];
        return updated.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA; // Descending order (newest first)
        });
      });
    },
    onApplicationUpdate: (applicationId, updates) => {
      setMyApplications((prev) => {
        const updated = prev.map((app) =>
          app.id === applicationId ? { ...app, ...updates } : app
        );
        // Re-sort after update to maintain chronological order
        return updated.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA; // Descending order (newest first)
        });
      });
    },
  });

  // Load total counts for all tabs on initial mount
  const loadTotalCounts = useCallback(async () => {
    try {
      const [bookingsResult, applicationsResult, bookedTaskersResult] = await Promise.all([
        getTaskerBookings(1, 0, true), // Only get total, limit to 1
        getTaskerJobApplications(1, 0, true), // Only get total, limit to 1
        getTaskerAsCustomerBookings(1, 0, true), // Only get total, limit to 1
      ]);

      setTotalCounts({
        myBookings: bookingsResult.total,
        myApplications: applicationsResult.total,
        bookedTaskers: bookedTaskersResult.total,
      });
    } catch (error) {
      console.error("Error loading total counts:", error);
      // Don't show error toast, just log it - counts will update when tabs are clicked
    }
  }, []);

  // Load total counts on initial mount
  useEffect(() => {
    if (user?.id) {
      loadTotalCounts();
    }
  }, [user?.id, loadTotalCounts]);

  // Initial data fetch for active tab
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (user?.id && !hasInitialized.current && !loadedTabsRef.current.has(activeTab)) {
      hasInitialized.current = true;
      fetchData(0, false, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only depend on user.id to avoid loops

  // Get current data based on active tab
  const currentData = useMemo(() => {
    switch (activeTab) {
      case "my-bookings":
        return myBookings;
      case "booked-taskers":
        return bookedTaskers;
      case "my-applications":
        return myApplications;
      default:
        return [];
    }
  }, [activeTab, myBookings, bookedTaskers, myApplications]);

  // Memoized booking counts - use totalCounts when available, fallback to loaded data length
  const bookingCounts = useMemo(() => {
    return {
      myBookings: totalCounts.myBookings > 0 ? totalCounts.myBookings : myBookings.length,
      bookedTaskers: totalCounts.bookedTaskers > 0 ? totalCounts.bookedTaskers : bookedTaskers.length,
      myApplications: totalCounts.myApplications > 0 ? totalCounts.myApplications : myApplications.length,
    };
  }, [totalCounts, myBookings, bookedTaskers, myApplications]);

  const handleActionClick = useCallback(
    (
      item:
        | BookingWithDetails
        | TaskerBookingWithDetails
        | TaskerJobApplicationWithDetails
    ) => {
      // Only handle actions for my bookings (BookingWithDetails)
      if (
        activeTab !== "my-bookings" ||
        !("status" in item && "customer_first_name" in item)
      ) {
        return;
      }

      const booking = item as BookingWithDetails;
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
          variant: "default" as const,
        },
        confirm: {
          title: "Confirm Booking",
          description: `Are you sure you want to confirm this booking with ${getCustomerName(
            booking
          )}?`,
          confirmText: "Confirm Booking",
          variant: "default" as const,
        },
        start: {
          title: "Start Task",
          description: `Are you ready to start the task for ${getCustomerName(
            booking
          )}?`,
          confirmText: "Start Task",
          variant: "default" as const,
        },
        complete: {
          title: "Complete Task",
          description: `Are you sure you want to mark this task as completed for ${getCustomerName(
            booking
          )}?`,
          confirmText: "Complete Task",
          variant: "default" as const,
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
    [activeTab]
  );

  const handleConfirmAction = useCallback(async () => {
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
        newStatus
      );

      if (result.success) {
        // Reload bookings from server to get the latest data including timestamps
        // This ensures we have all updated fields (accepted_at, confirmed_at, etc.)
        try {
          const updatedBookings = await getTaskerBookings(10, 0, false);
          setMyBookings(updatedBookings.bookings);
          setHasMore(updatedBookings.hasMore);
        } catch (reloadError) {
          console.error("Error reloading bookings:", reloadError);
          // Fallback: update local state if reload fails
          setMyBookings((prev) =>
            prev.map((booking) =>
              booking.id === confirmationDialog.bookingId
                ? { ...booking, status: newStatus }
                : booking
            )
          );
        }
        toast({
          variant: "success",
          title: t("success"),
          description: t("bookingStatusUpdated"),
        });
      } else {
        console.error("Failed to update booking:", result.error);
        toast({
          variant: "destructive",
          title: t("error"),
          description: result.error || t("failedToUpdateBookingStatus"),
        });
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("unexpectedError"),
      });
    } finally {
      setIsUpdating(false);
      setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
    }
  }, [confirmationDialog]);

  const handleCloseDialog = useCallback(() => {
    setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleTabChange = useCallback(
    async (tab: TaskerBookingTab) => {
      // Prevent switching to "booked-taskers" (hidden feature, code kept for future use)
      if (tab === "booked-taskers") {
        console.log("[BookingsPage] booked-taskers tab is hidden, redirecting to my-bookings");
        tab = "my-bookings";
      }
      
      // If switching to the same tab, do nothing
      if (tab === activeTab) {
        return;
      }
      
      // Update active tab first
      setActiveTab(tab);
      setIsNavExpanded(false);
      // Reset pagination when changing tabs
      setCurrentPage(0);
      setHasMore(true);
      setPaginationError(null);
      
      // Fetch data for the new tab immediately (pass tab explicitly to ensure correct data is loaded)
      await fetchData(0, false, true, tab);
      
      // Update total count for the active tab after fetching
      try {
        if (tab === "my-bookings") {
          const result = await getTaskerBookings(1, 0, true);
          setTotalCounts((prev) => ({ ...prev, myBookings: result.total }));
        } else if (tab === "my-applications") {
          const result = await getTaskerJobApplications(1, 0, true);
          setTotalCounts((prev) => ({ ...prev, myApplications: result.total }));
        } else if (tab === "booked-taskers") {
          // Keep this code for future use, even though tab is hidden
          const result = await getTaskerAsCustomerBookings(1, 0, true);
          setTotalCounts((prev) => ({ ...prev, bookedTaskers: result.total }));
        }
      } catch (error) {
        console.error("Error updating total count:", error);
        // Don't show error, just log it
      }
    },
    [fetchData, activeTab]
  );

  const handleNavToggle = useCallback(() => {
    setIsNavExpanded((prev) => !prev);
  }, []);

  const handleRetryLoadMore = useCallback(() => {
    setPaginationError(null);
    fetchData(currentPage + 1, true);
  }, [fetchData, currentPage]);

  if (isLoading) {
    return <BookingLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-6 max-w-6xl space-y-8 relative">
        {/* Subtle loading indicator for tab switching */}
        {isSwitchingTab && (
          <div className="absolute top-0 left-0 right-0 z-10 flex justify-center animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-b-lg shadow-lg flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Loading...</span>
            </div>
          </div>
        )}
        
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
        </div>
        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 px-8 py-6 border-b border-slate-200/50 dark:border-slate-600/50">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              {t("taskerBookings", { default: "Tasker Bookings" })}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              {t("manageBookings")}
            </p>
          </div>
          <div className="p-6">
            <TaskerBookingTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              bookingCounts={bookingCounts}
              isNavExpanded={isNavExpanded}
              onNavToggle={handleNavToggle}
              filteredCount={currentData.length}
            />
          </div>
        </div>

        {/* Content Cards */}
        <div className={`space-y-6 ${isSwitchingTab ? "opacity-75" : "opacity-100"} transition-opacity duration-200`}>
          {currentData.map((item, index) => {
            if (activeTab === "my-bookings") {
              const booking = item as BookingWithDetails;
              const actionButton = getActionButton(booking);
              return (
                <div
                  key={booking.id}
                  className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden transform transition-all duration-500 hover:scale-[1.02] animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <BookingCard
                    booking={booking}
                    onActionClick={handleActionClick}
                    isUpdating={isUpdating}
                    actionButton={actionButton}
                  />
                </div>
              );
            } else if (activeTab === "booked-taskers") {
              const booking = item as TaskerBookingWithDetails;
              return (
                <div
                  key={booking.id}
                  className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden transform transition-all duration-500 hover:scale-[1.02] animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TaskerBookingCard
                    booking={booking}
                    onActionClick={handleActionClick}
                    isUpdating={isUpdating}
                  />
                </div>
              );
            } else if (activeTab === "my-applications") {
              const application = item as TaskerJobApplicationWithDetails;
              return (
                <div
                  key={application.id}
                  className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden transform transition-all duration-500 hover:scale-[1.02] animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <JobApplicationCard
                    application={application}
                    onActionClick={handleActionClick}
                    isUpdating={isUpdating}
                  />
                </div>
              );
            }
            return null;
          })}

          {/* Loading indicator for new items */}
          {isLoadingMore && (
            <div className="flex justify-center py-8">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Loading more...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!isLoading && currentData.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden animate-fade-in-up">
            <EmptyState activeTab="all" />
          </div>
        )}

        {/* Load More Section */}
        {hasMore && !isLoading && currentData.length > 0 && (
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
                      {t("tryAgain")}
                    </button>
                  </div>
                )}

                {/* Load More Button */}
                <button
                  onClick={() => fetchData(currentPage + 1, true)}
                  disabled={isLoadingMore}
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-700 border-2 border-blue-600 dark:border-blue-400 rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-3"></div>
                      Loading more...
                    </>
                  ) : (
                    <>
                      <span>Load More</span>
                      <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
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
