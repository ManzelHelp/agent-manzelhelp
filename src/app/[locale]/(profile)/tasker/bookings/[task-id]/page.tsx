"use client";

import React, { useState, useEffect, useCallback, useMemo, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  ArrowLeft,
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
  DollarSign,
  Shield,
  Clock3,
  CalendarDays,
  Info,
  X,
  MoreHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUserStore } from "@/stores/userStore";
import {
  getBookingById,
  updateBookingStatus,
  type BookingWithDetails,
} from "@/actions/bookings";
import { BookingStatus } from "@/types/supabase";

interface ConfirmationDialogState {
  isOpen: boolean;
  action: string;
  title: string;
  description: string;
  confirmText: string;
  variant: "default" | "success" | "warning" | "danger";
}

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ "task-id": string }>;
}) {
  // Use the use() hook to handle async params in client component
  const { "task-id": taskId } = use(params);

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
  const { user } = useUserStore();

  const fetchBookingData = useCallback(async () => {
    if (!user) {
      // User store not ready yet, wait for it
      return;
    }

    try {
      setIsLoading(true);
      const bookingData = await getBookingById(taskId);
      if (!bookingData) {
        toast.error("Booking not found");
        router.push("/tasker/bookings");
        return;
      }

      setBooking(bookingData);
    } catch (error) {
      console.error("Error fetching booking:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load booking details";
      toast.error(errorMessage);
      router.push("/tasker/bookings");
    } finally {
      setIsLoading(false);
    }
  }, [taskId, user, router]);

  useEffect(() => {
    fetchBookingData();
  }, [fetchBookingData]);

  const getStatusInfo = useCallback((status: BookingStatus) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          color: "bg-color-warning text-color-surface",
          icon: AlertCircle,
          description: "Waiting for your response",
        };
      case "accepted":
        return {
          label: "Accepted",
          color: "bg-color-info text-color-surface",
          icon: CheckCircle,
          description: "You've accepted this booking",
        };
      case "confirmed":
        return {
          label: "Confirmed",
          color: "bg-color-success text-color-surface",
          icon: CheckCircle,
          description: "Booking is confirmed and ready",
        };
      case "in_progress":
        return {
          label: "In Progress",
          color: "bg-color-primary text-color-surface",
          icon: Play,
          description: "Task is currently being performed",
        };
      case "completed":
        return {
          label: "Completed",
          color: "bg-color-success text-color-surface",
          icon: CheckCircle,
          description: "Task has been completed",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          color: "bg-color-error text-color-surface",
          icon: X,
          description: "Booking has been cancelled",
        };
      default:
        return {
          label: "Unknown",
          color: "bg-color-accent text-color-text-secondary",
          icon: Info,
          description: "Status unknown",
        };
    }
  }, []);

  const getBookingTypeInfo = useCallback((type: string) => {
    switch (type) {
      case "instant":
        return { label: "Instant", icon: Clock3 };
      case "scheduled":
        return { label: "Scheduled", icon: CalendarDays };
      case "recurring":
        return { label: "Recurring", icon: Calendar };
      default:
        return { label: "Scheduled", icon: CalendarDays };
    }
  }, []);

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
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const formatTime = useCallback((timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  const getCustomerName = useCallback(() => {
    if (!booking) return "Customer";
    const firstName = booking.customer_first_name || "";
    const lastName = booking.customer_last_name || "";
    return `${firstName} ${lastName}`.trim() || "Customer";
  }, [booking]);

  const getCustomerEmail = useCallback(() => {
    // This would need to be added to the booking query
    return "customer@example.com";
  }, []);

  const getCustomerPhone = useCallback(() => {
    // This would need to be added to the booking query
    return "+1 (555) 123-4567";
  }, []);

  const handleStatusAction = useCallback(
    async (action: string) => {
      if (!booking) return;

      const actionConfig = {
        start: {
          title: "Start Task",
          description: `Are you ready to start the task for ${getCustomerName()}?`,
          confirmText: "Start Task",
          variant: "success" as const,
          status: "in_progress" as BookingStatus,
        },
        complete: {
          title: "Complete Task",
          description: `Are you sure you want to mark this task as completed for ${getCustomerName()}?`,
          confirmText: "Complete Task",
          variant: "success" as const,
          status: "completed" as BookingStatus,
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
    [booking, getCustomerName]
  );

  const handleConfirmAction = useCallback(async () => {
    if (!booking) return;

    setIsUpdating(true);

    try {
      const statusMap: Record<string, BookingStatus> = {
        start: "in_progress",
        complete: "completed",
      };

      const newStatus = statusMap[confirmationDialog.action];
      if (!newStatus) return;

      const result = await updateBookingStatus(booking.id, newStatus, user!.id);

      if (result.success) {
        setBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
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
  }, [user, booking, confirmationDialog]);

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
      <div className="min-h-screen bg-color-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-color-primary mx-auto"></div>
          <p className="text-color-text-secondary">
            Loading booking details...
          </p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-color-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-color-text-secondary">Booking not found</p>
          <Button onClick={() => router.push("/tasker/bookings")}>
            Back to Bookings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-color-bg smooth-scroll">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-color-surface border-b border-color-border shadow-sm">
        <div className="container mx-auto px-4 py-4 mobile-spacing">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 touch-target mobile-focus"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-color-text-primary mobile-text-lg mobile-leading">
                Booking Details
              </h1>
              <p className="text-color-text-secondary text-sm mobile-text-sm">
                {booking.service_title || "Service"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 touch-target mobile-focus"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6 mobile-spacing">
        {/* Status Banner */}
        <Card className="border-color-border bg-color-surface shadow-sm">
          <CardContent className="p-4 mobile-spacing">
            <div className="flex items-center gap-3">
              <Badge className={`${statusInfo?.color} text-sm font-medium`}>
                {statusInfo?.icon && (
                  <statusInfo.icon className="h-4 w-4 mr-1" />
                )}
                {statusInfo?.label}
              </Badge>
              <span className="text-sm text-color-text-secondary mobile-text-sm">
                {statusInfo?.description}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card className="border-color-border bg-color-surface shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-color-text-primary mobile-text-lg">
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-color-primary rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-color-surface" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-color-text-primary mobile-text-base">
                  {getCustomerName()}
                </h3>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-color-text-secondary mobile-text-sm">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {getCustomerEmail()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {getCustomerPhone()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card className="border-color-border bg-color-surface shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-color-text-primary mobile-text-lg">
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-color-text-primary mobile-text-base mb-2">
                {booking.service_title || "Service"}
              </h3>
              <p className="text-sm text-color-text-secondary mobile-leading">
                {booking.category_name
                  ? `${booking.category_name} service`
                  : "Professional service"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-color-border">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-color-success" />
                <div>
                  <p className="text-sm text-color-text-secondary mobile-text-sm">
                    Price
                  </p>
                  <p className="font-semibold text-color-text-primary mobile-text-base">
                    {formatCurrency(booking.agreed_price, booking.currency)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-color-info" />
                <div>
                  <p className="text-sm text-color-text-secondary mobile-text-sm">
                    Duration
                  </p>
                  <p className="font-semibold text-color-text-primary mobile-text-base">
                    {formatDuration(booking.estimated_duration)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Information */}
        <Card className="border-color-border bg-color-surface shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-color-text-primary mobile-text-lg">
              Booking Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-color-primary" />
                <div>
                  <p className="text-sm text-color-text-secondary mobile-text-sm">
                    Date
                  </p>
                  <p className="font-medium text-color-text-primary mobile-text-base">
                    {formatDate(booking.scheduled_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-color-primary" />
                <div>
                  <p className="text-sm text-color-text-secondary mobile-text-sm">
                    Time
                  </p>
                  <p className="font-medium text-color-text-primary mobile-text-base">
                    {formatTime(booking.scheduled_time_start)} -{" "}
                    {formatTime(booking.scheduled_time_end)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {bookingTypeInfo?.icon && (
                  <bookingTypeInfo.icon className="h-5 w-5 text-color-secondary" />
                )}
                <div>
                  <p className="text-sm text-color-text-secondary mobile-text-sm">
                    Type
                  </p>
                  <p className="font-medium text-color-text-primary mobile-text-base">
                    {bookingTypeInfo?.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-color-warning" />
                <div>
                  <p className="text-sm text-color-text-secondary mobile-text-sm">
                    Payment
                  </p>
                  <p className="font-medium text-color-text-primary mobile-text-base capitalize">
                    {booking.payment_method}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border-color-border bg-color-surface shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-color-text-primary mobile-text-lg">
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-color-error mt-0.5" />
              <div>
                <p className="font-medium text-color-text-primary mobile-text-base">
                  {booking.street_address || "Address not specified"}
                </p>
                <p className="text-sm text-color-text-secondary mobile-text-sm">
                  {[booking.city, booking.region].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Requirements */}
        <Card className="border-color-border bg-color-surface shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-color-text-primary mobile-text-lg">
              Customer Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <h4 className="font-medium text-color-text-primary mobile-text-base mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Requirements
              </h4>
              <p className="text-sm text-color-text-secondary mobile-leading bg-color-accent-light p-3 rounded-lg">
                {booking.customer_requirements ||
                  "No specific requirements provided."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {booking.status === "confirmed" && (
            <Button
              onClick={() => handleStatusAction("start")}
              disabled={isUpdating}
              className="w-full bg-color-success text-color-surface hover:bg-color-success-dark touch-target mobile-focus"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Task
            </Button>
          )}

          {booking.status === "in_progress" && (
            <div className="space-y-3">
              <Button
                onClick={() => handleStatusAction("complete")}
                disabled={isUpdating}
                className="w-full bg-color-success text-color-surface hover:bg-color-success-dark touch-target mobile-focus"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Task
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="border-color-primary text-color-primary hover:bg-color-primary/10 touch-target mobile-focus"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button
              variant="outline"
              className="border-color-secondary text-color-secondary hover:bg-color-secondary/10 touch-target mobile-focus"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <Card className="border-color-border bg-color-surface shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-color-text-primary mobile-text-lg">
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-color-success rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-color-text-primary mobile-text-base">
                    Booking Created
                  </p>
                  <p className="text-sm text-color-text-secondary mobile-text-sm">
                    {formatDate(booking.created_at)}
                  </p>
                </div>
              </div>

              {booking.accepted_at && (
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-color-info rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-color-text-primary mobile-text-base">
                      Booking Accepted
                    </p>
                    <p className="text-sm text-color-text-secondary mobile-text-sm">
                      {formatDate(booking.accepted_at)}
                    </p>
                  </div>
                </div>
              )}

              {booking.confirmed_at && (
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-color-success rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-color-text-primary mobile-text-base">
                      Booking Confirmed
                    </p>
                    <p className="text-sm text-color-text-secondary mobile-text-sm">
                      {formatDate(booking.confirmed_at)}
                    </p>
                  </div>
                </div>
              )}

              {booking.started_at && (
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-color-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-color-text-primary mobile-text-base">
                      Task Started
                    </p>
                    <p className="text-sm text-color-text-secondary mobile-text-sm">
                      {formatDate(booking.started_at)}
                    </p>
                  </div>
                </div>
              )}

              {booking.completed_at && (
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-color-success rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-color-text-primary mobile-text-base">
                      Task Completed
                    </p>
                    <p className="text-sm text-color-text-secondary mobile-text-sm">
                      {formatDate(booking.completed_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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
