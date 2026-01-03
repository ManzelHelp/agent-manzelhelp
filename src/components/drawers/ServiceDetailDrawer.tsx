"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Image from "next/image";
import {
  MessageSquare,
  MapPin,
  Star,
  Clock,
  Calendar,
  AlertCircle,
  User as UserIcon,
  Award,
  Clock as ClockIcon,
  Loader2,
  CheckCircle,
  X,
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

interface ServiceDetailDrawerProps {
  serviceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceDetailDrawer({
  serviceId,
  open,
  onOpenChange,
}: ServiceDetailDrawerProps) {
  const router = useRouter();
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
  const [avatarError, setAvatarError] = useState(false);

  // Fetch service data when drawer opens
  useEffect(() => {
    const fetchServiceData = async () => {
      if (!serviceId || !open) return;

      // Ensure serviceId is a string
      const serviceIdString = String(serviceId);
      if (!serviceIdString || serviceIdString === "undefined" || serviceIdString === "null") {
        setError("Invalid service ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await getTaskerServiceOffer(serviceIdString);

        if (result.success && result.data) {
          setServiceData(result.data);
          setAvatarError(false);

          // Check interaction status if user is logged in
          if (user) {
            try {
              const interactionResult = await getServiceInteractionStatus(
                serviceId,
                user.id
              );
              if (interactionResult.success && interactionResult.data) {
                setInteractionStatus(interactionResult.data);
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
  }, [serviceId, open, t, user]);

  const getPricingDisplay = (price: number, pricingType: string) => {
    if (pricingType === "hourly") {
      return `MAD ${price}/hr`;
    } else if (pricingType === "per_item") {
      return `MAD ${price}/item`;
    } else {
      return `MAD ${price}`;
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
    onOpenChange(false);
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
    onOpenChange(false);
    router.push(`/customer/messages/${conversationId}`);
  };

  const handleGoToBooking = () => {
    if (interactionStatus?.bookingId) {
      onOpenChange(false);
      router.push(`/customer/bookings/${interactionStatus.bookingId}`);
    }
  };

  const handleGoToChat = () => {
    if (interactionStatus?.conversationId) {
      onOpenChange(false);
      router.push(`/customer/messages/${interactionStatus.conversationId}`);
    }
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
        <DrawerContent className="max-h-[96vh] flex flex-col overflow-hidden">
          <div className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto min-h-0 scrollbar-hide">
            {isLoading ? (
              <>
                <DrawerHeader>
                  <DrawerTitle className="sr-only">{t("loading")}</DrawerTitle>
                </DrawerHeader>
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                      {t("loading")}
                    </p>
                  </div>
                </div>
              </>
            ) : error || !serviceData ? (
              <>
                <DrawerHeader>
                  <DrawerTitle className="sr-only">{t("error")}</DrawerTitle>
                </DrawerHeader>
                <div className="flex items-center justify-center py-20 px-4">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      {t("error")}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      {error || t("serviceNotFound")}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 space-y-6 pb-8">
                {/* Header */}
                <DrawerHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <DrawerTitle className="text-2xl md:text-3xl font-bold mb-2">
                        {serviceData.title}
                      </DrawerTitle>
                      <DrawerDescription className="flex items-center gap-2 text-base">
                        <Calendar className="h-4 w-4" />
                        Listed on{" "}
                        {format(
                          new Date(serviceData.created_at),
                          "MMMM d, yyyy"
                        )}
                      </DrawerDescription>
                    </div>
                    <DrawerClose asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <X className="h-4 w-4" />
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerHeader>

                {/* Service Image */}
                {serviceData.portfolio_images &&
                Array.isArray(serviceData.portfolio_images) &&
                serviceData.portfolio_images.length > 0 ? (
                  <div className="relative h-64 w-full rounded-xl overflow-hidden">
                    <Image
                      src={
                        serviceData.portfolio_images[0] ||
                        "/placeholder-service.jpg"
                      }
                      alt={serviceData.title || "Service image"}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-xl">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {getPricingDisplay(
                            serviceData.price,
                            serviceData.pricing_type
                          )}
                        </div>
                        {serviceData.minimum_duration && (
                          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 mt-1">
                            <ClockIcon className="h-3 w-3" />
                            <span>Min. {serviceData.minimum_duration}h</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-64 w-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {serviceData.title}
                      </h2>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {t("aboutService")}
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {serviceData.description || "No description available"}
                    </p>
                  </div>
                </div>

                {/* Service Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {serviceData.service_area && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                            {t("serviceArea")}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
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

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                          {t("pricingType")}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                          {serviceData.pricing_type || "Fixed"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tasker Profile */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    {t("aboutTasker")}
                  </h3>

                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative group">
                      <div className="relative h-24 w-24 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
                        {serviceData.tasker.avatar_url && !avatarError ? (
                          <Image
                            src={serviceData.tasker.avatar_url}
                            alt={`${serviceData.tasker.first_name || "Tasker"} ${
                              serviceData.tasker.last_name || ""
                            }`}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            unoptimized
                            onError={() => setAvatarError(true)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserIcon className="h-12 w-12 text-white" />
                          </div>
                        )}
                      </div>
                      {serviceData.tasker.profile?.experience_level && (
                        <div className="absolute -bottom-2 -right-2">
                          <Badge
                            className={`px-3 py-1 text-xs font-semibold shadow-lg ${getExperienceLevelColor(
                              serviceData.tasker.profile.experience_level
                            )}`}
                          >
                            <Award className="h-3 w-3 mr-1" />
                            {serviceData.tasker.profile.experience_level
                              .charAt(0)
                              .toUpperCase() +
                              serviceData.tasker.profile.experience_level.slice(1)}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                          {`${serviceData.tasker.first_name || "Tasker"} ${
                            serviceData.tasker.last_name || ""
                          }`}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          {t("professionalServiceProvider")}
                        </p>
                      </div>

                      {/* Rating and Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-3 border border-yellow-200/50 dark:border-yellow-700/50">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                              <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400 fill-current" />
                            </div>
                            <div>
                              <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {serviceData.stats?.tasker_rating
                                  ? serviceData.stats.tasker_rating.toFixed(1)
                                  : "New"}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {t("rating")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 border border-blue-200/50 dark:border-blue-700/50">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {serviceData.stats?.completed_jobs || 0}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {t("jobsCompleted")}
                              </p>
                            </div>
                          </div>
                        </div>

                        {serviceData.stats?.response_time_hours && (
                          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-3 border border-emerald-200/50 dark:border-emerald-700/50">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                                <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">
                                  {serviceData.stats.response_time_hours}h
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {t("avgResponse")}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tasker Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="text-center group">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50 group-hover:shadow-lg transition-all duration-300">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                          {serviceData.stats?.completed_jobs || 0}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {t("jobs")}
                        </p>
                      </div>
                    </div>

                    <div className="text-center group">
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-700/50 group-hover:shadow-lg transition-all duration-300">
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                          {serviceData.stats?.total_reviews || 0}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {t("reviews")}
                        </p>
                      </div>
                    </div>

                    <div className="text-center group">
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-200/50 dark:border-yellow-700/50 group-hover:shadow-lg transition-all duration-300">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                          {serviceData.stats?.tasker_rating
                            ? `${serviceData.stats.tasker_rating.toFixed(1)}★`
                            : "New"}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {t("rating")}
                        </p>
                      </div>
                    </div>

                    <div className="text-center group">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50 group-hover:shadow-lg transition-all duration-300">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                          {serviceData.tasker.created_at
                            ? format(
                                new Date(serviceData.tasker.created_at),
                                "MMM yy"
                              )
                            : "N/A"}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {t("memberSince")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {serviceData.tasker.profile?.bio && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                        About
                      </h3>
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {serviceData.tasker.profile.bio}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-slate-200/50 dark:border-slate-600/50">
                    {interactionStatus?.isOwner ? (
                      <div className="text-center">
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200/50 dark:border-amber-700/50">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              {t("ownService")}
                            </h3>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400">
                            {t("ownServiceDescription")}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Primary Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Booking Button */}
                          {interactionStatus?.hasBooking ? (
                            <Button
                              onClick={handleGoToBooking}
                              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                              size="lg"
                            >
                              <CheckCircle className="h-5 w-5 mr-2" />
                              {t("goToBooking")}
                            </Button>
                          ) : (
                            <Button
                              onClick={handleBookService}
                              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                              size="lg"
                            >
                              <CheckCircle className="h-5 w-5 mr-2" />
                              {t("bookService")}
                            </Button>
                          )}

                          {/* Chat/Contact Button */}
                          {interactionStatus?.hasConversation ? (
                            <Button
                              onClick={handleGoToChat}
                              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                              size="lg"
                            >
                              <MessageSquare className="h-5 w-5 mr-2" />
                              {t("goToChat")}
                            </Button>
                          ) : (
                            <Button
                              onClick={handleContactTasker}
                              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                              size="lg"
                            >
                              <MessageSquare className="h-5 w-5 mr-2" />
                              {t("contactTasker")}
                            </Button>
                          )}
                        </div>

                        {/* Status Messages */}
                        {interactionStatus?.hasBooking && (
                          <div className="text-center">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-3 border border-green-200/50 dark:border-green-700/50">
                              <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                                {t("bookingExists")}
                              </p>
                            </div>
                          </div>
                        )}

                        {interactionStatus?.hasConversation &&
                          !interactionStatus?.hasBooking && (
                            <div className="text-center">
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 border border-blue-200/50 dark:border-blue-700/50">
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
            )}
          </div>
        </DrawerContent>
      </Drawer>

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
    </>
  );
}

