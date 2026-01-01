"use client";

import React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  User,
  MessageSquare,
} from "lucide-react";
import { TaskerBookingWithDetails } from "@/actions/bookings";
import { BookingStatus } from "@/types/supabase";
import { useTranslations } from "next-intl";

interface TaskerBookingCardProps {
  booking: TaskerBookingWithDetails;
  onActionClick?: (booking: TaskerBookingWithDetails) => void;
  isUpdating?: boolean;
  actionButton?: {
    text: string;
    variant:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    action: string;
    className: string;
  };
}

const getStatusColor = (status: BookingStatus) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    case "accepted":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "confirmed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "in_progress":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
    case "completed":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    case "disputed":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
    case "refunded":
      return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

export function TaskerBookingCard({
  booking,
  onActionClick,
  isUpdating,
  actionButton,
}: TaskerBookingCardProps) {
  const t = useTranslations("taskerBookings");
  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("labels.flexible");
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: booking.currency || "MAD",
    }).format(price);
  };

  const getTaskerName = () => {
    const firstName = booking.tasker_first_name || "";
    const lastName = booking.tasker_last_name || "";
    return `${firstName} ${lastName}`.trim() || t("labels.serviceProvider");
  };

  const getAddress = () => {
    const parts = [booking.street_address, booking.city, booking.region].filter(
      Boolean
    );
    return parts.length > 0
      ? parts.join(", ")
      : t("labels.addressNotSpecified");
  };

  return (
    <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 shadow-lg hover:scale-[1.01]">
      <div className="flex flex-col space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">
              {booking.service_title || "Service Booking"}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {booking.booking_type === "instant"
                ? t("bookingTypes.instant")
                : booking.booking_type === "scheduled"
                ? t("bookingTypes.scheduled")
                : t("bookingTypes.recurring")}
            </p>
          </div>
          <Badge className={`${getStatusColor(booking.status)} flex-shrink-0`}>
            {booking.status
              ? t(`status.${booking.status}`)
              : t("status.pending")}
          </Badge>
        </div>

        {/* Tasker Info */}
        <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            {booking.tasker_avatar ? (
              <Image
                src={booking.tasker_avatar}
                alt={getTaskerName()}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 dark:text-white truncate">
              {getTaskerName()}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
              {t("labels.serviceProvider")}
            </p>
          </div>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {formatPrice(booking.agreed_price)}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {t("labels.agreedPrice")}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {booking.estimated_duration
                  ? `${booking.estimated_duration}h`
                  : t("labels.flexible")}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {t("labels.duration")}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {formatDate(booking.scheduled_date)}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {booking.scheduled_time_start && booking.scheduled_time_end
                  ? `${formatTime(booking.scheduled_time_start)} - ${formatTime(
                      booking.scheduled_time_end
                    )}`
                  : t("labels.date")}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                {getAddress()}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {t("labels.location")}
              </p>
            </div>
          </div>
        </div>

        {/* Requirements */}
        {booking.customer_requirements && (
          <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-start space-x-2">
              <MessageSquare className="w-4 h-4 text-slate-600 dark:text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {t("labels.requirements")}:
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
                  {booking.customer_requirements.length > 150
                    ? `${booking.customer_requirements.substring(0, 150)}...`
                    : booking.customer_requirements}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {actionButton && actionButton.action !== "none" && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              onClick={() => onActionClick?.(booking)}
              disabled={isUpdating}
              className={`w-full ${actionButton.className}`}
              variant={actionButton.variant}
            >
              {isUpdating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                actionButton.text
              )}
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("labels.bookedOn")}{" "}
            {new Date(booking.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </Card>
  );
}
