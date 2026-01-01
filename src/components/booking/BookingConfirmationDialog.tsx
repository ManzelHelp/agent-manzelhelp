"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getCustomerProfileData } from "@/actions/profile";
import {
  createServiceBooking,
  type CreateBookingData,
} from "@/actions/bookings";
import type { Address } from "@/types/supabase";

interface BookingConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
  serviceData: {
    id: string;
    title: string;
    price: number;
    pricing_type: string;
    minimum_duration?: number;
    tasker: {
      id: string;
      first_name: string;
      last_name: string;
      avatar_url?: string;
    };
  };
}

interface BookingFormData {
  booking_type: "instant" | "scheduled" | "recurring";
  scheduled_date: string;
  scheduled_time_start: string;
  scheduled_time_end: string;
  estimated_duration: number;
  address_id: string;
  service_address: string;
  agreed_price: number;
  customer_requirements: string;
  payment_method: "cash" | "online" | "wallet" | "pending";
}

const initialFormData: BookingFormData = {
  booking_type: "instant",
  scheduled_date: "",
  scheduled_time_start: "",
  scheduled_time_end: "",
  estimated_duration: 1,
  address_id: "",
  service_address: "",
  agreed_price: 0,
  customer_requirements: "",
  payment_method: "wallet",
};

export function BookingConfirmationDialog({
  isOpen,
  onClose,
  onSuccess,
  serviceData,
}: BookingConfirmationDialogProps) {
  const t = useTranslations("taskerOffer.bookingDialog");
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadAddresses = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const { addresses, error } = await getCustomerProfileData();

      if (error) {
        toast.error(t("toasts.failedToLoadAddresses"));
        return;
      }

      setAddresses(addresses);

      // Set default address if available
      if (addresses.length > 0) {
        const defaultAddress =
          addresses.find((addr) => addr.is_default) || addresses[0];
        setFormData((prev) => ({
          ...prev,
          address_id: defaultAddress.id,
        }));
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
      toast.error(t("toasts.failedToLoadAddresses"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // Load customer addresses when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadAddresses();
    }
  }, [isOpen, loadAddresses]);

  // Initialize form data when service data changes
  useEffect(() => {
    if (serviceData) {
      setFormData((prev) => ({
        ...prev,
        agreed_price: serviceData.price,
        estimated_duration: serviceData.minimum_duration || 1,
      }));
    }
  }, [serviceData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.address_id) {
      newErrors.address_id = t("errors.selectAddress");
    }

    if (formData.booking_type === "scheduled") {
      if (!formData.scheduled_date) {
        newErrors.scheduled_date = t("errors.selectDate");
      }
      if (!formData.scheduled_time_start) {
        newErrors.scheduled_time_start = t("errors.selectStartTime");
      }
      if (!formData.scheduled_time_end) {
        newErrors.scheduled_time_end = t("errors.selectEndTime");
      }
    }

    if (formData.agreed_price <= 0) {
      newErrors.agreed_price = t("errors.priceGreaterThanZero");
    }

    if (formData.estimated_duration <= 0) {
      newErrors.estimated_duration = t("errors.durationGreaterThanZero");
    }

    // Validate customer_requirements must be at least 100 characters
    if (!formData.customer_requirements.trim()) {
      newErrors.customer_requirements = t("errors.messageRequired");
    } else if (formData.customer_requirements.trim().length < 100) {
      newErrors.customer_requirements = t("errors.messageTooShort", { min: 100 });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const bookingData: CreateBookingData = {
        tasker_service_id: serviceData.id,
        booking_type: formData.booking_type,
        scheduled_date:
          formData.booking_type === "scheduled"
            ? formData.scheduled_date
            : undefined,
        scheduled_time_start:
          formData.booking_type === "scheduled"
            ? formData.scheduled_time_start
            : undefined,
        scheduled_time_end:
          formData.booking_type === "scheduled"
            ? formData.scheduled_time_end
            : undefined,
        estimated_duration: formData.estimated_duration,
        address_id: formData.address_id,
        service_address: formData.service_address,
        agreed_price: formData.agreed_price,
        customer_requirements: formData.customer_requirements,
        payment_method: formData.payment_method,
      };

      const result = await createServiceBooking(bookingData);

      if (result.success && result.bookingId) {
        // Show warnings if any
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach((warning) => {
            toast.warning(warning);
          });
        }
        toast.success(t("toasts.bookingCreatedSuccess"));
        onSuccess(result.bookingId);
        onClose();
      } else {
        toast.error(result.error || t("toasts.failedToCreateBooking"));
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error(t("toasts.failedToCreateBooking"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPricingDisplay = (price: number, pricingType: string) => {
    if (pricingType === "hourly") {
      return `MAD ${price}/hr`;
    } else if (pricingType === "per_item") {
      return `MAD ${price}/item`;
    } else {
      return `MAD ${price}`;
    }
  };

  const getTotalPrice = () => {
    if (serviceData.pricing_type === "hourly") {
      return formData.agreed_price * formData.estimated_duration;
    }
    return formData.agreed_price;
  };

  // const selectedAddress = addresses.find(addr => addr.id === formData.address_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                {t("title")}
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                {t("description")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Summary */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              {t("serviceDetails")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("service")}
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {serviceData.title}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("tasker")}
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {serviceData.tasker.first_name} {serviceData.tasker.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("basePrice")}
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {getPricingDisplay(
                    serviceData.price,
                    serviceData.pricing_type
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("totalPrice")}
                </p>
                <p className="font-semibold text-green-600 dark:text-green-400 text-lg">
                  MAD {getTotalPrice().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Type */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-slate-900 dark:text-white">
              {t("bookingType")}
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "instant", label: t("instant"), icon: Clock },
                { value: "scheduled", label: t("scheduled"), icon: Calendar },
                {
                  value: "recurring",
                  label: t("recurring"),
                  icon: MessageSquare,
                },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      booking_type: value as
                        | "instant"
                        | "scheduled"
                        | "recurring",
                    }))
                  }
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.booking_type === value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                  }`}
                >
                  <Icon className="h-6 w-6 mx-auto mb-2 text-slate-600 dark:text-slate-400" />
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Scheduling (if scheduled) */}
          {formData.booking_type === "scheduled" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">{t("date")}</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      scheduled_date: e.target.value,
                    }))
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className={errors.scheduled_date ? "border-red-500" : ""}
                />
                {errors.scheduled_date && (
                  <p className="text-sm text-red-500">
                    {errors.scheduled_date}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled_time_start">{t("startTime")}</Label>
                <Input
                  id="scheduled_time_start"
                  type="time"
                  value={formData.scheduled_time_start}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      scheduled_time_start: e.target.value,
                    }))
                  }
                  className={
                    errors.scheduled_time_start ? "border-red-500" : ""
                  }
                />
                {errors.scheduled_time_start && (
                  <p className="text-sm text-red-500">
                    {errors.scheduled_time_start}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled_time_end">{t("endTime")}</Label>
                <Input
                  id="scheduled_time_end"
                  type="time"
                  value={formData.scheduled_time_end}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      scheduled_time_end: e.target.value,
                    }))
                  }
                  className={errors.scheduled_time_end ? "border-red-500" : ""}
                />
                {errors.scheduled_time_end && (
                  <p className="text-sm text-red-500">
                    {errors.scheduled_time_end}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Duration (for hourly services) */}
          {serviceData.pricing_type === "hourly" && (
            <div className="space-y-2">
              <Label htmlFor="estimated_duration">{t("duration")}</Label>
              <Input
                id="estimated_duration"
                type="number"
                min="0.5"
                step="0.5"
                value={formData.estimated_duration}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    estimated_duration: parseFloat(e.target.value) || 0,
                  }))
                }
                className={errors.estimated_duration ? "border-red-500" : ""}
              />
              {errors.estimated_duration && (
                <p className="text-sm text-red-500">
                  {errors.estimated_duration}
                </p>
              )}
            </div>
          )}

          {/* Address Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              {t("serviceAddress")}
            </Label>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="ml-2 text-slate-600 dark:text-slate-400">
                  {t("loadingAddresses")}
                </span>
              </div>
            ) : addresses.length === 0 ? (
              <div className="p-4 border border-orange-200 dark:border-orange-700 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <AlertCircle className="h-5 w-5" />
                  <p className="font-medium">{t("noAddressesFound")}</p>
                </div>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  {t("addAddressFirst")}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        address_id: address.id,
                      }))
                    }
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      formData.address_id === address.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {address.label}
                          </p>
                          {address.is_default && (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {t("default")}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {address.street_address}, {address.city},{" "}
                          {address.region}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
                {errors.address_id && (
                  <p className="text-sm text-red-500">{errors.address_id}</p>
                )}
              </div>
            )}
          </div>

          {/* Customer Requirements */}
          <div className="space-y-2">
            <Label htmlFor="customer_requirements">
              {t("specialRequirements")} *
            </Label>
            <textarea
              id="customer_requirements"
              value={formData.customer_requirements}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  customer_requirements: e.target.value,
                }))
              }
              placeholder={t("specialRequirementsPlaceholder")}
              className={`w-full min-h-[120px] p-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.customer_requirements
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-200 dark:border-slate-600"
              }`}
            />
            <div className="flex justify-between items-center">
              <div>
                {errors.customer_requirements && (
                  <p className="text-sm text-red-500 font-medium">
                    {errors.customer_requirements}
                  </p>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {formData.customer_requirements.length}/100 min
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-slate-900 dark:text-white">
              {t("paymentMethod")}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "wallet", label: t("wallet") },
                { value: "online", label: t("online") },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      payment_method: value as
                        | "cash"
                        | "online"
                        | "wallet"
                        | "pending",
                    }))
                  }
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    formData.payment_method === value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                  }`}
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || addresses.length === 0}
            className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("creatingBooking")}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {t("confirmBooking")} (MAD {getTotalPrice().toFixed(2)})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
