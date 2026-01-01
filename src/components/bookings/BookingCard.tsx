"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  Clock,
  MapPin,
  MessageSquare,
  Phone,
} from "lucide-react";
import { BookingWithDetails } from "@/actions/bookings";
import { useRouter } from "next/navigation";
import { createConversationAction } from "@/actions/messages";
import { toast } from "sonner";

interface BookingCardProps {
  booking: BookingWithDetails;
  onActionClick: (booking: BookingWithDetails) => void;
  isUpdating: boolean;
  actionButton: {
    text: string;
    action: string;
    className: string;
  };
}

// Utility functions moved outside component to avoid re-creation
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Date not set";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (timeString: string | null) => {
  if (!timeString) return "";
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDuration = (minutes: number | null) => {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
};

const getCustomerName = (booking: BookingWithDetails) => {
  const firstName = booking.customer_first_name || "";
  const lastName = booking.customer_last_name || "";
  return `${firstName} ${lastName}`.trim() || "Customer";
};

const getLocation = (booking: BookingWithDetails) => {
  const parts = [booking.street_address, booking.city, booking.region].filter(
    Boolean
  );
  return parts.join(", ") || "Location not specified";
};

export const BookingCard = React.memo<BookingCardProps>(
  ({ booking, onActionClick, isUpdating, actionButton }) => {
    const router = useRouter();
    const [isOpeningMessage, setIsOpeningMessage] = useState(false);
    const customerName = getCustomerName(booking);
    const location = getLocation(booking);

    const handleMessageClick = async () => {
      if (!booking.customer_id) {
        toast.error("Customer information not available");
        return;
      }

      try {
        setIsOpeningMessage(true);
        const result = await createConversationAction(
          booking.customer_id,
          undefined, // jobId
          undefined, // serviceId
          booking.id, // bookingId
          `Hello! I'd like to discuss the booking for "${booking.service_title || "service"}".` // initialMessage
        );

        if (result.conversation) {
          router.push(`/tasker/messages/${result.conversation.id}`);
        } else {
          toast.error(result.errorMessage || "Failed to open conversation");
        }
      } catch (error) {
        console.error("Error opening conversation:", error);
        toast.error("Failed to open conversation");
      } finally {
        setIsOpeningMessage(false);
      }
    };


    return (
      <Card className="border-color-border bg-color-surface shadow-sm hover:shadow-md transition-shadow">
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
                {booking.scheduled_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(booking.scheduled_date)}
                  </span>
                )}
                {booking.scheduled_time_start && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(booking.scheduled_time_start)} -{" "}
                    {formatTime(booking.scheduled_time_end)}
                    {booking.estimated_duration &&
                      ` (${formatDuration(booking.estimated_duration)})`}
                  </span>
                )}
              </div>
              {booking.customer_requirements && (
                <p className="text-sm text-color-text-secondary mobile-leading line-clamp-2">
                  {booking.customer_requirements.length > 100
                    ? `${booking.customer_requirements.substring(0, 100)}...`
                    : booking.customer_requirements}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-3 min-w-[120px] w-full sm:w-auto">
              <p className="text-xl font-bold text-color-text-primary mobile-text-lg">
                {formatCurrency(booking.agreed_price, booking.currency)}
              </p>

              {/* Primary Action Button */}
              {actionButton.action !== "none" && (
                <Button
                  size="sm"
                  onClick={() => onActionClick(booking)}
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
                onClick={() => router.push(`/tasker/bookings/${booking.id}`)}
                className="w-full sm:w-auto touch-target mobile-focus border-color-primary text-color-primary hover:bg-color-primary/10"
              >
                View Booking
              </Button>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMessageClick}
                  disabled={isOpeningMessage}
                  className="flex-1 sm:flex-none touch-target mobile-focus border-color-primary text-color-primary hover:bg-color-primary/10"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

BookingCard.displayName = "BookingCard";
