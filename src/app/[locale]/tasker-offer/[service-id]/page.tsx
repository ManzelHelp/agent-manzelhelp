"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  MessageSquare,
  MapPin,
  Star,
  Clock,
  Calendar,
  AlertCircle,
  Euro,
  User as UserIcon,
  Award,
  Clock as ClockIcon,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useUserStore } from "@/stores/userStore";
import {
  getTaskerServiceOffer,
  getServiceInteractionStatus,
  type TaskerServiceOffer,
} from "@/actions/services";
import { BookingConfirmationDialog } from "@/components/booking/BookingConfirmationDialog";
import { ContactConfirmationDialog } from "@/components/booking/ContactConfirmationDialog";

export default function TaskerOfferPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("taskerOffer");
  const { user } = useUserStore();
  const [serviceData, setServiceData] = useState<TaskerServiceOffer | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [interactionStatus, setInteractionStatus] = useState<{
    isOwner: boolean;
    hasBooking: boolean;
    hasConversation: boolean;
    bookingId?: string;
    conversationId?: string;
  } | null>(null);

  const serviceId = params["service-id"] as string;

  // Fetch service data and interaction status
  useEffect(() => {
    const fetchServiceData = async () => {
      if (!serviceId) return;

      try {
        setIsLoading(true);
        setError(null);
        const result = await getTaskerServiceOffer(serviceId);

        if (result.success && result.data) {
          setServiceData(result.data);

          // Check interaction status if user is logged in
          if (user) {
            try {
              const interactionResult = await getServiceInteractionStatus(
                serviceId,
                user.id
              );
              if (interactionResult.success && interactionResult.data) {
                setInteractionStatus(interactionResult.data);
              } else {
                console.warn(
                  "Failed to get interaction status:",
                  interactionResult.error
                );
              }
            } catch (err) {
              console.error("Error checking interaction status:", err);
            }
          }
        } else {
          setError(result.error || t("serviceNotFound"));
        }
      } catch (err) {
        console.error("Error fetching service data:", err);
        setError(t("failedToLoad"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceData();
  }, [serviceId, t, user]);

  const getPricingDisplay = (price: number, pricingType: string) => {
    if (pricingType === "hourly") {
      return `€${price}/hr`;
    } else if (pricingType === "per_item") {
      return `€${price}/item`;
    } else {
      return `€${price}`;
    }
  };

  const getExperienceLevelColor = (level?: string) => {
    switch (level) {
      case "expert":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "beginner":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleBookService = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!serviceData) return;
    setShowBookingDialog(true);
  };

  const handleBookingSuccess = (bookingId: string) => {
    router.push(`/customer/bookings/${bookingId}`);
  };

  const handleContactTasker = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!serviceData) return;
    setShowContactDialog(true);
  };

  const handleContactSuccess = (conversationId: string) => {
    router.push(`/customer/messages/${conversationId}`);
  };

  const handleGoToBooking = () => {
    if (interactionStatus?.bookingId) {
      router.push(`/customer/bookings/${interactionStatus.bookingId}`);
    } else {
      console.error("No booking ID available");
    }
  };

  const handleGoToChat = () => {
    if (interactionStatus?.conversationId) {
      router.push(`/customer/messages/${interactionStatus.conversationId}`);
    } else {
      console.error("No conversation ID available");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  if (error || !serviceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 text-center p-12">
            <div className="space-y-8">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {t("error")}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  {error || t("serviceNotFound")}
                </p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {t("tryAgain")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
            {/* Service Image with Modern Overlay */}
            {serviceData.portfolio_images &&
            Array.isArray(serviceData.portfolio_images) &&
            serviceData.portfolio_images.length > 0 ? (
              <div className="relative h-80 md:h-96 w-full">
                <Image
                  src={
                    serviceData.portfolio_images[0] ||
                    "/placeholder-service.jpg"
                  }
                  alt={serviceData.title || "Service image"}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>

                {/* Floating Price Badge */}
                <div className="absolute top-6 right-6">
                  <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl border border-white/20">
                    <div className="flex items-center gap-2">
                      <Euro className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <span className="text-3xl font-bold text-slate-900 dark:text-white">
                        {getPricingDisplay(
                          serviceData.price,
                          serviceData.pricing_type
                        )}
                      </span>
                    </div>
                    {serviceData.minimum_duration && (
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 mt-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>Min. {serviceData.minimum_duration}h</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                      {serviceData.title}
                    </h1>
                    <div className="flex items-center gap-3 text-white/90">
                      <Calendar className="h-5 w-5" />
                      <span className="text-lg">
                        Listed on{" "}
                        {format(
                          new Date(serviceData.created_at),
                          "MMMM d, yyyy"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative h-80 md:h-96 w-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-white/20 dark:bg-slate-500/20 rounded-full flex items-center justify-center">
                    <Euro className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-2">
                    {serviceData.title}
                  </h1>
                  <div className="flex items-center justify-center gap-3 text-slate-600 dark:text-slate-300">
                    <Calendar className="h-5 w-5" />
                    <span className="text-lg">
                      Listed on{" "}
                      {format(new Date(serviceData.created_at), "MMMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Service Details Section */}
            <div className="p-8 md:p-12">
              {/* Description */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                  {t("aboutService")}
                </h3>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                    {serviceData.description || "No description available"}
                  </p>
                </div>
              </div>

              {/* Service Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {serviceData.service_area && (
                  <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-blue-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                          {t("serviceArea")}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          {typeof serviceData.service_area === "string"
                            ? serviceData.service_area
                            : serviceData.service_area
                            ? JSON.stringify(serviceData.service_area)
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-emerald-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {t("pricingType")}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 capitalize">
                        {serviceData.pricing_type || "Fixed"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasker Profile Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 px-8 py-6 border-b border-slate-200/50 dark:border-slate-600/50">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                {t("aboutTasker")}
              </h2>
            </div>

            <div className="p-8">
              {/* Tasker Header */}
              <div className="flex flex-col lg:flex-row lg:items-start gap-8 mb-8">
                {/* Profile Picture */}
                <div className="relative group">
                  <div className="relative h-32 w-32 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl">
                    <Image
                      src={
                        serviceData.tasker.avatar_url ||
                        "/placeholder-avatar.jpg"
                      }
                      alt={`${serviceData.tasker.first_name || "Tasker"} ${
                        serviceData.tasker.last_name || ""
                      }`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  {serviceData.tasker.profile?.experience_level && (
                    <div className="absolute -bottom-2 -right-2">
                      <Badge
                        className={`px-4 py-2 text-sm font-semibold shadow-lg ${getExperienceLevelColor(
                          serviceData.tasker.profile.experience_level
                        )}`}
                      >
                        <Award className="h-4 w-4 mr-2" />
                        {serviceData.tasker.profile.experience_level
                          .charAt(0)
                          .toUpperCase() +
                          serviceData.tasker.profile.experience_level.slice(1)}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Tasker Info */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                      {`${serviceData.tasker.first_name || "Tasker"} ${
                        serviceData.tasker.last_name || ""
                      }`}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                      {t("professionalServiceProvider")}
                    </p>
                  </div>

                  {/* Rating and Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-yellow-200/50 dark:border-yellow-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                          <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400 fill-current" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {serviceData.stats?.tasker_rating
                              ? serviceData.stats.tasker_rating.toFixed(1)
                              : "New"}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t("rating")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                          <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {serviceData.stats?.completed_jobs || 0}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t("jobsCompleted")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {serviceData.stats?.response_time_hours && (
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-4 border border-emerald-200/50 dark:border-emerald-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                            <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                              {serviceData.stats.response_time_hours}h
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {t("avgResponse")}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {serviceData.tasker.profile?.bio && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                    About
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                      {serviceData.tasker.profile.bio}
                    </p>
                  </div>
                </div>
              )}

              {/* Tasker Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center group">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 group-hover:shadow-lg transition-all duration-300">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {serviceData.stats?.completed_jobs || 0}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {t("jobs")}
                    </p>
                  </div>
                </div>

                <div className="text-center group">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-700/50 group-hover:shadow-lg transition-all duration-300">
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                      {serviceData.stats?.total_reviews || 0}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {t("reviews")}
                    </p>
                  </div>
                </div>

                <div className="text-center group">
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-yellow-200/50 dark:border-yellow-700/50 group-hover:shadow-lg transition-all duration-300">
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                      {serviceData.stats?.tasker_rating
                        ? `${serviceData.stats.tasker_rating.toFixed(1)}★`
                        : "New"}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {t("rating")}
                    </p>
                  </div>
                </div>

                <div className="text-center group">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50 group-hover:shadow-lg transition-all duration-300">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      {serviceData.tasker.created_at
                        ? format(
                            new Date(serviceData.tasker.created_at),
                            "MMM 'yy"
                          )
                        : "N/A"}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {t("memberSince")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-200/50 dark:border-slate-600/50">
                {interactionStatus?.isOwner ? (
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200/50 dark:border-amber-700/50">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                          {t("ownService")}
                        </h3>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-lg">
                        {t("ownServiceDescription")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Primary Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Booking Button */}
                      {interactionStatus?.hasBooking ? (
                        <Button
                          onClick={handleGoToBooking}
                          className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                          size="lg"
                        >
                          <CheckCircle className="h-6 w-6 mr-3" />
                          {t("goToBooking")}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleBookService}
                          className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                          size="lg"
                        >
                          <CheckCircle className="h-6 w-6 mr-3" />
                          {t("bookService")}
                        </Button>
                      )}

                      {/* Chat/Contact Button */}
                      {interactionStatus?.hasConversation ? (
                        <Button
                          onClick={handleGoToChat}
                          className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                          size="lg"
                        >
                          <MessageSquare className="h-6 w-6 mr-3" />
                          {t("goToChat")}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleContactTasker}
                          className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                          size="lg"
                        >
                          <MessageSquare className="h-6 w-6 mr-3" />
                          {t("contactTasker")}
                        </Button>
                      )}
                    </div>

                    {/* Status Messages */}
                    {interactionStatus?.hasBooking && (
                      <div className="text-center">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 border border-green-200/50 dark:border-green-700/50">
                          <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                            {t("bookingExists")}
                          </p>
                        </div>
                      </div>
                    )}

                    {interactionStatus?.hasConversation &&
                      !interactionStatus?.hasBooking && (
                        <div className="text-center">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                            <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                              {t("conversationExists")}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Dialog */}
      {serviceData && user && (
        <BookingConfirmationDialog
          isOpen={showBookingDialog}
          onClose={() => setShowBookingDialog(false)}
          onSuccess={handleBookingSuccess}
          serviceData={{
            id: serviceData.id,
            title: serviceData.title,
            price: serviceData.price,
            pricing_type: serviceData.pricing_type,
            minimum_duration: serviceData.minimum_duration || undefined,
            tasker: {
              id: serviceData.tasker.id,
              first_name: serviceData.tasker.first_name || "",
              last_name: serviceData.tasker.last_name || "",
              avatar_url: serviceData.tasker.avatar_url || undefined,
            },
          }}
          customerId={user.id}
        />
      )}

      {/* Contact Confirmation Dialog */}
      {serviceData && user && (
        <ContactConfirmationDialog
          isOpen={showContactDialog}
          onClose={() => setShowContactDialog(false)}
          onSuccess={handleContactSuccess}
          serviceData={{
            id: serviceData.id,
            title: serviceData.title,
            tasker: {
              id: serviceData.tasker.id,
              first_name: serviceData.tasker.first_name || "",
              last_name: serviceData.tasker.last_name || "",
              avatar_url: serviceData.tasker.avatar_url || undefined,
            },
          }}
        />
      )}
    </div>
  );
}
