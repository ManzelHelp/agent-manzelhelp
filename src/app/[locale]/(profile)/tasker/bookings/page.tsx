"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  Calendar,
  User,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Play,
  X,
  MessageSquare,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUserStore } from "@/stores/userStore";
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

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<TaskStatus>("all");
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
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

  useEffect(() => {
    if (user && user.role === "customer") {
      router.replace("/customer/dashboard");
    }
  }, [user, router]);

  // Fetch bookings on mount
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return; // Let middleware handle auth redirects

      try {
        setIsLoading(true);
        const taskerBookings = await getTaskerBookings(user.id);
        setBookings(taskerBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load bookings";
        toast.error(errorMessage);
        setBookings([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  // Memoized utility functions for better performance
  const getStatusIcon = useCallback((status: TaskStatus) => {
    const icons = {
      all: User,
      pending: AlertCircle,
      accepted: CheckCircle,
      confirmed: CheckCircle,
      in_progress: Play,
      completed: CheckCircle,
      cancelled: X,
    };
    const Icon = icons[status];
    return <Icon className="h-4 w-4" />;
  }, []);

  const getStatusLabel = useCallback((status: TaskStatus) => {
    const labels = {
      all: "All Bookings",
      pending: "Pending Requests",
      accepted: "Accepted",
      confirmed: "Confirmed",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return labels[status];
  }, []);

  const getStatusColor = useCallback((status: TaskStatus) => {
    const colors = {
      all: "text-color-primary",
      pending: "text-color-warning",
      accepted: "text-color-info",
      confirmed: "text-color-success",
      in_progress: "text-color-primary",
      completed: "text-color-success",
      cancelled: "text-color-error",
    };
    return colors[status];
  }, []);

  const getStatusBgColor = useCallback((status: TaskStatus) => {
    const bgColors = {
      all: "bg-color-primary/10",
      pending: "bg-color-warning/10",
      accepted: "bg-color-info/10",
      confirmed: "bg-color-success/10",
      in_progress: "bg-color-primary/10",
      completed: "bg-color-success/10",
      cancelled: "bg-color-error/10",
    };
    return bgColors[status];
  }, []);

  const formatCurrency = useCallback((amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const formatTime = useCallback((timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
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

  const getCustomerName = useCallback((booking: BookingWithDetails) => {
    const firstName = booking.customer_first_name || "";
    const lastName = booking.customer_last_name || "";
    return `${firstName} ${lastName}`.trim() || "Customer";
  }, []);

  const getLocation = useCallback((booking: BookingWithDetails) => {
    const parts = [booking.street_address, booking.city, booking.region].filter(
      Boolean
    );
    return parts.join(", ") || "Location not specified";
  }, []);

  const getActionButton = useCallback((booking: BookingWithDetails) => {
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
        className:
          "bg-color-info/10 text-color-info border border-color-info/20",
      },
    };

    return actionConfig[status] || actionConfig.completed;
  }, []);

  const handleActionClick = useCallback(
    (booking: BookingWithDetails) => {
      const actionButton = getActionButton(booking);

      if (actionButton.action === "none") {
        return; // No action needed for completed/cancelled/disputed/refunded
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
    },
    [getActionButton, getCustomerName]
  );

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

  const TabButton = useCallback(
    ({ status, count }: { status: TaskStatus; count: number }) => (
      <button
        onClick={() => {
          setActiveTab(status);
          setIsNavExpanded(false);
        }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all touch-target mobile-focus shadow-sm
        ${
          activeTab === status
            ? "bg-color-primary text-color-surface shadow-md scale-105 z-10 ring-2 ring-color-primary-dark !border-none"
            : "bg-transparent text-color-text-secondary hover:text-color-text-primary hover:bg-color-accent-light !border-none"
        }
      `}
        style={{ minWidth: 0 }}
        aria-current={activeTab === status ? "page" : undefined}
      >
        <div
          className={`${
            activeTab === status ? "text-color-surface" : getStatusColor(status)
          }`}
        >
          {getStatusIcon(status)}
        </div>
        <span className="text-sm font-medium hidden sm:inline mobile-text-base">
          {getStatusLabel(status)}
        </span>
        <span className="text-xs font-medium sm:hidden mobile-text-sm">
          {status}
        </span>
        {count > 0 && (
          <span
            className={`text-xs rounded-full px-2 py-0.5 font-medium ${
              activeTab === status
                ? "bg-color-surface/20 text-color-surface"
                : "bg-color-accent text-color-text-secondary"
            }`}
          >
            {count}
          </span>
        )}
      </button>
    ),
    [activeTab, getStatusIcon, getStatusColor, getStatusLabel]
  );

  const MobileNavDropdown = useCallback(() => {
    return (
      <div className="sm:hidden">
        <button
          onClick={() => setIsNavExpanded(!isNavExpanded)}
          className="flex items-center justify-between w-full p-3 bg-color-accent-light border border-color-border rounded-lg text-color-text-primary hover:bg-color-accent transition-all touch-target mobile-focus"
        >
          <div className="flex items-center gap-2">
            <div className={`${getStatusColor(activeTab)}`}>
              {getStatusIcon(activeTab)}
            </div>
            <span className="font-medium mobile-text-base">
              {getStatusLabel(activeTab)}
            </span>
            <span className="text-xs bg-color-accent text-color-text-secondary px-2 py-0.5 rounded-full font-medium">
              {filteredBookings.length}
            </span>
          </div>
          {isNavExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {isNavExpanded && (
          <div className="mt-2 p-2 bg-color-surface border border-color-border rounded-lg shadow-sm space-y-1">
            {(
              [
                "all",
                "pending",
                "accepted",
                "confirmed",
                "in_progress",
                "completed",
                "cancelled",
              ] as TaskStatus[]
            ).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setActiveTab(status);
                  setIsNavExpanded(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all touch-target mobile-focus ${
                  activeTab === status
                    ? "bg-color-primary text-color-surface"
                    : "text-color-text-secondary hover:text-color-text-primary hover:bg-color-accent-light"
                }`}
              >
                <div
                  className={`${
                    activeTab === status
                      ? "text-color-surface"
                      : getStatusColor(status)
                  }`}
                >
                  {getStatusIcon(status)}
                </div>
                <span className="text-sm font-medium mobile-text-base">
                  {getStatusLabel(status)}
                </span>
                <span className="text-xs bg-color-accent text-color-text-secondary px-2 py-0.5 rounded-full font-medium ml-auto">
                  {bookingCounts[status]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }, [
    isNavExpanded,
    activeTab,
    getStatusColor,
    getStatusIcon,
    getStatusLabel,
    filteredBookings.length,
    bookingCounts,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-color-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-color-primary mx-auto"></div>
          <p className="text-color-text-secondary">Loading bookings...</p>
        </div>
      </div>
    );
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

        {/* Desktop Navigation Tabs */}
        <div className="hidden sm:flex gap-1 bg-color-accent-light p-2 rounded-xl">
          {(
            [
              "all",
              "pending",
              "accepted",
              "confirmed",
              "in_progress",
              "completed",
              "cancelled",
            ] as TaskStatus[]
          ).map((status) => (
            <TabButton
              key={status}
              status={status}
              count={bookingCounts[status]}
            />
          ))}
        </div>

        {/* Mobile Navigation Dropdown */}
        <MobileNavDropdown />

        {/* Booking Cards */}
        <div className="space-y-4">
          {isLoading
            ? // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <Card
                  key={index}
                  className="border-color-border bg-color-surface shadow-sm"
                >
                  <CardContent className="p-4 mobile-spacing">
                    <div className="animate-pulse space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-5 bg-color-accent rounded w-32"></div>
                        <div className="h-5 bg-color-accent rounded w-16"></div>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div className="h-4 bg-color-accent rounded w-24"></div>
                        <div className="h-4 bg-color-accent rounded w-32"></div>
                        <div className="h-4 bg-color-accent rounded w-20"></div>
                      </div>
                      <div className="h-4 bg-color-accent rounded w-full max-w-md"></div>
                      <div className="flex justify-end gap-3">
                        <div className="h-6 bg-color-accent rounded w-16"></div>
                        <div className="h-8 bg-color-accent rounded w-24"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            : filteredBookings.map((booking) => {
                const actionButton = getActionButton(booking);
                const customerName = getCustomerName(booking);
                const location = getLocation(booking);

                return (
                  <Card
                    key={booking.id}
                    className="border-color-border bg-color-surface shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 mobile-spacing">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-color-text-primary text-base mobile-text-base">
                              {booking.service_title || "Service"}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                booking.status === "pending"
                                  ? "bg-color-warning/10 text-color-warning"
                                  : booking.status === "completed"
                                  ? "bg-color-success/10 text-color-success"
                                  : "bg-color-accent text-color-text-secondary"
                              }`}
                            >
                              {booking.status.replace("_", " ")}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-color-text-secondary mobile-leading">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {customerName}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(booking.scheduled_date)}
                            </span>
                            {booking.scheduled_time_start && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(
                                  booking.scheduled_time_start
                                )} - {formatTime(booking.scheduled_time_end)}
                                {booking.estimated_duration &&
                                  ` (${formatDuration(
                                    booking.estimated_duration
                                  )})`}
                              </span>
                            )}
                          </div>
                          {booking.customer_requirements && (
                            <p className="text-sm text-color-text-secondary mobile-leading line-clamp-2">
                              {booking.customer_requirements}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-3 min-w-[120px] w-full sm:w-auto">
                          <p className="text-xl font-bold text-color-text-primary mobile-text-lg">
                            {formatCurrency(
                              booking.agreed_price,
                              booking.currency
                            )}
                          </p>

                          {/* Primary Action Button */}
                          {actionButton.action !== "none" && (
                            <Button
                              size="sm"
                              onClick={() => handleActionClick(booking)}
                              disabled={isUpdating}
                              className={`touch-target mobile-focus shadow-sm transition-all duration-200 w-full sm:w-auto ${actionButton.className}`}
                            >
                              {actionButton.text}
                            </Button>
                          )}

                          {/* View Booking Button - Always visible */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(`/tasker/bookings/${booking.id}`)
                            }
                            className="w-full sm:w-auto touch-target mobile-focus border-color-primary text-color-primary hover:bg-color-primary/10"
                          >
                            View Booking
                          </Button>

                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 sm:flex-none touch-target mobile-focus border-color-primary text-color-primary hover:bg-color-primary/10"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 sm:flex-none touch-target mobile-focus border-color-secondary text-color-secondary hover:bg-color-secondary/10"
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        {/* Empty State */}
        {!isLoading && filteredBookings.length === 0 && (
          <Card className="border-color-border bg-color-surface shadow-sm">
            <CardContent className="py-8 mobile-spacing">
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div
                    className={`p-3 rounded-full ${getStatusBgColor(
                      activeTab
                    )} ${getStatusColor(activeTab)}`}
                  >
                    {getStatusIcon(activeTab)}
                  </div>
                </div>
                <h3 className="font-semibold text-color-text-primary mobile-text-lg mobile-leading">
                  {activeTab === "all"
                    ? "No bookings found"
                    : `No ${getStatusLabel(activeTab).toLowerCase()}`}
                </h3>
                <p className="text-sm text-color-text-secondary mobile-leading">
                  {activeTab === "all"
                    ? "You have no bookings yet."
                    : activeTab === "pending"
                    ? "You have no new booking requests at the moment."
                    : activeTab === "completed"
                    ? "You have no completed bookings yet."
                    : `You have no ${getStatusLabel(
                        activeTab
                      ).toLowerCase()} at the moment.`}
                </p>
              </div>
            </CardContent>
          </Card>
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
