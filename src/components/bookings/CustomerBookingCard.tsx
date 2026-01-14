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
} from "lucide-react";
import { BookingWithDetails } from "@/actions/bookings";
import { useRouter } from "next/navigation";
import { createConversationAction } from "@/actions/messages";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { formatDateShort } from "@/lib/date-utils";

interface CustomerBookingCardProps {
  booking: BookingWithDetails;
  onActionClick: (booking: BookingWithDetails) => void;
  isUpdating: boolean;
  actionButton: {
    text: string;
    action: string;
    className: string;
  };
}

// Fonctions utilitaires conservées et adaptées pour la traduction
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-color-warning/10 text-color-warning border-color-warning/20";
    case "accepted":
      return "bg-color-info/10 text-color-info border-color-info/20";
    case "confirmed":
      return "bg-color-success/10 text-color-success border-color-success/20";
    case "in_progress":
      return "bg-color-primary/10 text-color-primary border-color-primary/20";
    case "completed":
      return "bg-color-success/10 text-color-success border-color-success/20";
    case "cancelled":
      return "bg-color-error/10 text-color-error border-color-error/20";
    case "disputed":
      return "bg-color-warning/10 text-color-warning border-color-warning/20";
    case "refunded":
      return "bg-color-info/10 text-color-info border-color-info/20";
    default:
      return "bg-color-accent text-color-text-secondary border-color-border";
  }
};

export const CustomerBookingCard = React.memo<CustomerBookingCardProps>(
  ({ booking, onActionClick, isUpdating, actionButton }) => {
    const t = useTranslations("customerBookings");
    const router = useRouter();
    const [isOpeningMessage, setIsOpeningMessage] = useState(false);

    // Helpers utilisant les traductions
    const taskerName = `${booking.tasker_first_name || ""} ${booking.tasker_last_name || ""}`.trim() || t("tasker");
    
    const location = [booking.street_address, booking.city, booking.region]
      .filter(Boolean)
      .join(", ") || t("locationNotSpecified");

    const formatDate = (dateString: string | null) => {
      if (!dateString) return t("dateNotSet");
      return formatDateShort(dateString);
    };

    const handleMessageClick = async () => {
      if (!booking.tasker_id) {
        toast.error(t("errors.taskerNotAvailable"));
        return;
      }

      try {
        setIsOpeningMessage(true);
        const result = await createConversationAction(
          booking.tasker_id,
          undefined,
          undefined,
          booking.id,
          t("actions.initialMessage", { title: booking.service_title || t("service") })
        );

        if (result.conversation) {
          router.push(`/customer/messages/${result.conversation.id}`);
        } else {
          toast.error(result.errorMessage || t("errors.unexpectedError"));
        }
      } catch (error) {
        console.error("Error opening conversation:", error);
        toast.error(t("errors.unexpectedError"));
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
                  {booking.service_title || t("service")}
                </h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {t(`status.${booking.status}`)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-color-text-secondary mobile-leading">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {taskerName}
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

              {/* View Booking Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/customer/bookings/${booking.id}`)}
                className="w-full sm:w-auto touch-target mobile-focus border-color-primary text-color-primary hover:bg-color-primary/10"
              >
                {t("viewDetails")}
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

CustomerBookingCard.displayName = "CustomerBookingCard";