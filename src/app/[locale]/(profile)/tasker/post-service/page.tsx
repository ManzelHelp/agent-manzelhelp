"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  MapPin,
  DollarSign,
  Plus,
  X,
  ChevronDown,
  AlertCircle,
  Edit,
  Clock,
  Star,
  Shield,
  Sparkles,
  Info,
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { getAllCategoryHierarchies } from "@/lib/categories";
import {
  createTaskerService,
  getTaskerAddresses,
  getTaskerProfile,
  type CreateServiceData,
} from "@/actions/services";
import { useTranslations } from "next-intl";
import type {
  ServiceCategory,
  Service,
  Address,
  AvailabilitySlot,
  PricingType,
  TaskerProfile,
} from "@/types/supabase";

// Form data interfaces
interface BasicInfoData {
  title: string;
  description: string;
  categoryId: number;
  serviceId: number;
  selectedAddressId: string;
  serviceArea?: string;
}

interface PricingData {
  pricingType: PricingType;
  basePrice: number;
  hourlyRate: number;
  minimumBookingHours?: number;
  extras: { name: string; price: number }[];
  estimatedDuration?: number;
}

interface OfferFormData {
  basicInfo: BasicInfoData;
  pricing: PricingData;
}

const INITIAL_BASIC_INFO: BasicInfoData = {
  title: "",
  description: "",
  categoryId: 0,
  serviceId: 0,
  selectedAddressId: "",
  serviceArea: "",
};

const INITIAL_PRICING_DATA: PricingData = {
  pricingType: "fixed",
  basePrice: 0,
  hourlyRate: 0,
  minimumBookingHours: 1,
  extras: [],
  estimatedDuration: 1,
};

export default function CreateOfferPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const t = useTranslations("postService");

  const STEPS = [
    {
      id: 1,
      title: t("steps.basicInfo"),
      description: t("stepDescriptions.basicInfo"),
      icon: <Sparkles className="h-5 w-5" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: 2,
      title: t("steps.pricing"),
      description: t("stepDescriptions.pricing"),
      icon: <DollarSign className="h-5 w-5" />,
      color: "from-green-500 to-green-600",
    },
    {
      id: 3,
      title: t("steps.reviewPost"),
      description: t("stepDescriptions.reviewPost"),
      icon: <Shield className="h-5 w-5" />,
      color: "from-purple-500 to-purple-600",
    },
  ];
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<OfferFormData>({
    basicInfo: INITIAL_BASIC_INFO,
    pricing: INITIAL_PRICING_DATA,
  });

  // Data from database
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [taskerProfile, setTaskerProfile] = useState<TaskerProfile | null>(
    null
  );

  // Form states
  const [newExtra, setNewExtra] = useState({ name: "", price: 0 });

  // Validation errors - only show when user tries to continue
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);

  // Fetch initial data
  const fetchInitialData = React.useCallback(async () => {
    setLoading(true);

    try {
      // Use local categories from categories.ts
      const hierarchies = getAllCategoryHierarchies();
      const localCategories = hierarchies.map(({ parent }) => ({
        id: parent.id,
        name_en: parent.name_en,
        name_fr: parent.name_fr,
        name_ar: parent.name_ar,
        description_en: parent.description_en,
        description_fr: parent.description_fr,
        description_ar: parent.description_ar,
        icon_url: undefined,
        is_active: true,
        sort_order: parent.id,
      }));
      setCategories(localCategories);

      // Get all services from local categories
      const allServices: Service[] = [];
      hierarchies.forEach(({ parent, subcategories }) => {
        subcategories.forEach((service) => {
          allServices.push({
            id: service.id,
            category_id: parent.id,
            name_en: service.name_en,
            name_fr: service.name_fr,
            name_ar: service.name_ar,
            description_en: service.description_en,
            description_fr: service.description_fr,
            description_ar: service.description_ar,
            is_active: true,
            sort_order: service.id,
          });
        });
      });
      setServices(allServices);

      // Fetch user addresses using server action
      const addressesResult = await getTaskerAddresses();
      if (addressesResult.success && addressesResult.addresses) {
        setAddresses(addressesResult.addresses);

        // Auto-select the first address if available
        if (addressesResult.addresses.length > 0) {
          setFormData((prev) => ({
            ...prev,
            basicInfo: {
              ...prev.basicInfo,
              selectedAddressId: addressesResult.addresses![0].id || "",
            },
          }));
        }
      } else {
        console.error("Error fetching addresses:", addressesResult.error);
        toast.error("Failed to load addresses. Please try again.");
      }

      // Fetch user availability from tasker profile using server action
      const profileResult = await getTaskerProfile();
      if (profileResult.success && profileResult.profile) {
        setTaskerProfile(profileResult.profile);

        if (profileResult.profile.operation_hours) {
          // Filter out null values and ensure all slots have required properties
          const validSlots = (
            profileResult.profile.operation_hours as AvailabilitySlot[]
          ).filter(
            (slot): slot is AvailabilitySlot =>
              slot !== null && typeof slot === "object" && "enabled" in slot
          );
          setAvailability(validSlots);
        } else {
          // Ensure availability is always an array, even if operation_hours is null
          setAvailability([]);
        }
      } else {
        console.error("Error fetching profile:", profileResult.error);
        // Don't show error toast for profile as it's not critical
        setAvailability([]);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load form data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Validation functions
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.basicInfo.title.trim()) {
      newErrors.title = t("errors.titleRequired");
    }
    if (!formData.basicInfo.description.trim()) {
      newErrors.description = t("errors.descriptionRequired");
    }
    if (!formData.basicInfo.categoryId) {
      newErrors.category = t("errors.categoryRequired");
    }
    if (!formData.basicInfo.serviceId) {
      newErrors.service = t("errors.serviceRequired");
    }
    if (!formData.basicInfo.selectedAddressId && addresses.length === 0) {
      newErrors.address = t("errors.locationRequired");
    }

    setErrors(newErrors);
    setHasAttemptedValidation(true);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (
      (formData.pricing.pricingType === "fixed" ||
        formData.pricing.pricingType === "per_item") &&
      formData.pricing.basePrice <= 0
    ) {
      newErrors.basePrice = t("errors.priceGreaterThanZero");
    }
    if (
      formData.pricing.pricingType === "hourly" &&
      formData.pricing.hourlyRate <= 0
    ) {
      newErrors.hourlyRate = t("errors.priceGreaterThanZero");
    }
    if (
      formData.pricing.minimumBookingHours !== undefined &&
      formData.pricing.minimumBookingHours < 0.5
    ) {
      newErrors.minimumBookingHours = t("errors.minimumBookingGreaterThanZero");
    }

    setErrors(newErrors);
    setHasAttemptedValidation(true);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation functions
  const goToNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Helper functions
  const addExtra = () => {
    if (newExtra.name.trim() && newExtra.price > 0) {
      setFormData((prev) => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          extras: [...prev.pricing.extras, { ...newExtra }],
        },
      }));
      setNewExtra({ name: "", price: 0 });
    }
  };

  const removeExtra = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        extras: prev.pricing.extras.filter((_, i) => i !== index),
      },
    }));
  };

  const filteredServices = services.filter(
    (service) => service.category_id === formData.basicInfo.categoryId
  );

  // Submit function
  const handleSubmit = async () => {
    if (!user?.id || !validateStep2()) return;

    setSubmitting(true);

    try {
      // Get the selected address
      const selectedAddress = addresses.find(
        (a) => a.id === formData.basicInfo.selectedAddressId
      );

      if (!selectedAddress) {
        throw new Error("Selected address not found");
      }

      // Prepare service data
      const serviceData: CreateServiceData = {
        title: formData.basicInfo.title,
        description: formData.basicInfo.description,
        service_id: formData.basicInfo.serviceId,
        service_area: `${selectedAddress.city}, ${selectedAddress.region}`,
        pricing_type: formData.pricing.pricingType,
        base_price: formData.pricing.basePrice,
        hourly_rate: formData.pricing.hourlyRate,
        minimum_booking_hours: formData.pricing.minimumBookingHours,
        estimated_duration: formData.pricing.estimatedDuration,
        extras: formData.pricing.extras,
      };

      // Create the service using server action
      const result = await createTaskerService(serviceData);

      if (result.success) {
        toast.success(t("success.servicePosted"));
        router.push("/tasker/my-services");
      } else {
        toast.error(result.error || t("errors.serviceCreationFailed"));
      }
    } catch (error) {
      console.error("Error creating offer:", error);
      toast.error(t("errors.serviceCreationFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-white to-[var(--color-accent-light)] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[var(--color-border)] border-t-[var(--color-secondary)] rounded-full animate-spin mx-auto mb-6"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[var(--color-primary)] rounded-full animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            {t("title")}
          </h3>
          <p className="text-[var(--color-text-secondary)]">{t("subtitle")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-white to-[var(--color-accent-light)]">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-[var(--color-border)]">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
              {t("title")}
            </h1>
            <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Modern Progress Steps */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                  {/* Step Circle */}
                  <div className="relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                        currentStep >= step.id
                          ? `bg-gradient-to-r ${step.color} text-white scale-110`
                          : "bg-white border-2 border-[var(--color-border)] text-[var(--color-text-secondary)]"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    {currentStep === step.id && (
                      <div
                        className={`absolute inset-0 rounded-full bg-gradient-to-r ${step.color} animate-pulse opacity-20`}
                      />
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold text-sm sm:text-base transition-colors ${
                        currentStep >= step.id
                          ? "text-[var(--color-text-primary)]"
                          : "text-[var(--color-text-secondary)]"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block flex-1 h-0.5 mx-4 transition-all duration-300 ${
                      currentStep > step.id
                        ? `bg-gradient-to-r ${step.color}`
                        : "bg-[var(--color-border)]"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-xl rounded-2xl border-0 overflow-hidden animate-fade-in-up">
              {/* Step 1: Service Details */}
              {currentStep === 1 && (
                <>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-[var(--color-text-primary)]">
                          Service Details
                        </CardTitle>
                        <CardDescription className="text-[var(--color-text-secondary)]">
                          Tell us about the service you want to offer
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* User Profile Section */}
                    <div className="bg-gradient-to-r from-[var(--color-accent-light)] to-blue-50 rounded-xl p-4 border border-[var(--color-border)]">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center overflow-hidden shadow-lg">
                            {user?.avatar_url ? (
                              <Image
                                src={user.avatar_url}
                                alt="Profile"
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="h-8 w-8 text-white" />
                            )}
                          </div>
                          {!user?.avatar_url && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--color-warning)] rounded-full flex items-center justify-center">
                              <AlertCircle className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-[var(--color-text-primary)]">
                            {user?.first_name} {user?.last_name}
                          </h4>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {user?.email}
                          </p>
                          {!user?.avatar_url && (
                            <p className="text-xs text-[var(--color-warning)] mt-1 flex items-center">
                              <Info className="h-3 w-3 inline mr-1" />
                              Add a profile photo to build trust with customers
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Service Title */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="title"
                        className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2"
                      >
                        <Star className="h-4 w-4 text-[var(--color-secondary)]" />
                        Service Title *
                      </Label>
                      <Input
                        id="title"
                        value={formData.basicInfo.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            basicInfo: {
                              ...prev.basicInfo,
                              title: e.target.value,
                            },
                          }))
                        }
                        placeholder="e.g., Professional House Cleaning Service"
                        className={`h-12 text-base border-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] ${
                          hasAttemptedValidation && errors.title
                            ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
                            : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                        }`}
                      />
                      {hasAttemptedValidation && errors.title && (
                        <p className="text-sm text-[var(--color-error)] flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Service Description */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="description"
                        className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4 text-[var(--color-secondary)]" />
                        Service Description *
                      </Label>
                      <textarea
                        id="description"
                        value={formData.basicInfo.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            basicInfo: {
                              ...prev.basicInfo,
                              description: e.target.value,
                            },
                          }))
                        }
                        placeholder="Describe what you'll do, what's included, and any special expertise you have..."
                        rows={4}
                        className={`w-full min-h-[120px] px-4 py-3 text-base border-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] resize-y ${
                          hasAttemptedValidation && errors.description
                            ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
                            : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                        }`}
                      />
                      {hasAttemptedValidation && errors.description && (
                        <p className="text-sm text-[var(--color-error)] flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Category & Service Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[var(--color-secondary)]" />
                          Service Category *
                        </Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className={`h-12 w-full justify-between text-base border-2 rounded-xl transition-all duration-200 ${
                                hasAttemptedValidation && errors.category
                                  ? "border-[var(--color-error)]"
                                  : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                              }`}
                            >
                              <span className="truncate">
                                {formData.basicInfo.categoryId
                                  ? categories.find(
                                      (c) =>
                                        c.id === formData.basicInfo.categoryId
                                    )?.name_en || "Select category"
                                  : "Select category"}
                              </span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full min-w-[200px]">
                            {categories.map((category) => (
                              <DropdownMenuItem
                                key={category.id}
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    basicInfo: {
                                      ...prev.basicInfo,
                                      categoryId: category.id,
                                      serviceId: 0, // Reset service selection
                                    },
                                  }))
                                }
                                className="cursor-pointer"
                              >
                                {category.name_en}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {hasAttemptedValidation && errors.category && (
                          <p className="text-sm text-[var(--color-error)] flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.category}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                          <User className="h-4 w-4 text-[var(--color-secondary)]" />
                          Specific Service *
                        </Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className={`h-12 w-full justify-between text-base border-2 rounded-xl transition-all duration-200 ${
                                hasAttemptedValidation && errors.service
                                  ? "border-[var(--color-error)]"
                                  : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                              } ${
                                !formData.basicInfo.categoryId
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={!formData.basicInfo.categoryId}
                            >
                              <span className="truncate">
                                {formData.basicInfo.serviceId
                                  ? services.find(
                                      (s) =>
                                        s.id === formData.basicInfo.serviceId
                                    )?.name_en || "Select service"
                                  : "Select service"}
                              </span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full min-w-[200px]">
                            {filteredServices.map((service) => (
                              <DropdownMenuItem
                                key={service.id}
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    basicInfo: {
                                      ...prev.basicInfo,
                                      serviceId: service.id,
                                    },
                                  }))
                                }
                                className="cursor-pointer"
                              >
                                {service.name_en}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {hasAttemptedValidation && errors.service && (
                          <p className="text-sm text-[var(--color-error)] flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.service}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Location Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[var(--color-secondary)]" />
                        Service Location
                      </Label>
                      {addresses.length > 0 ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-12 w-full justify-between text-base border-2 border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)] transition-all duration-200"
                            >
                              <span className="truncate">
                                {formData.basicInfo.selectedAddressId
                                  ? addresses.find(
                                      (a) =>
                                        a.id ===
                                        formData.basicInfo.selectedAddressId
                                    )
                                    ? `${
                                        addresses.find(
                                          (a) =>
                                            a.id ===
                                            formData.basicInfo.selectedAddressId
                                        )?.street_address
                                      }, ${
                                        addresses.find(
                                          (a) =>
                                            a.id ===
                                            formData.basicInfo.selectedAddressId
                                        )?.city
                                      }`
                                    : "Select location"
                                  : addresses[0]
                                  ? `${addresses[0].street_address}, ${addresses[0].city}`
                                  : "Select location"}
                              </span>
                              <MapPin className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full min-w-[300px]">
                            {addresses.map((address) => (
                              <DropdownMenuItem
                                key={address.id}
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    basicInfo: {
                                      ...prev.basicInfo,
                                      selectedAddressId: address.id,
                                    },
                                  }))
                                }
                                className="cursor-pointer"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {address.label}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {address.street_address}, {address.city},{" "}
                                    {address.region}
                                  </span>
                                </div>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <div className="p-6 border-2 border-dashed border-[var(--color-border)] rounded-xl text-center bg-[var(--color-accent-light)]">
                          <MapPin className="h-12 w-12 text-[var(--color-text-secondary)] mx-auto mb-3" />
                          <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                            No addresses found. Please add an address in your
                            profile first.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                            onClick={() =>
                              router.push("/tasker/profile?section=addresses")
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Add Address
                          </Button>
                        </div>
                      )}
                      {hasAttemptedValidation && errors.address && (
                        <p className="text-sm text-[var(--color-error)] flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.address}
                        </p>
                      )}
                    </div>

                    {/* Working Hours Display */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[var(--color-secondary)]" />
                        Your Working Hours
                      </Label>
                      {availability && availability.length > 0 ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {availability
                              .filter((slot) => slot && slot.enabled)
                              .map((slot) => (
                                <div
                                  key={slot.day}
                                  className="flex items-center space-x-2 p-3 rounded-xl border-2 border-[var(--color-border)] bg-gradient-to-r from-[var(--color-accent-light)] to-white hover:border-[var(--color-primary)] transition-all duration-200"
                                >
                                  <div className="flex-1">
                                    <div className="font-semibold capitalize text-sm text-[var(--color-text-primary)]">
                                      {slot.day}
                                    </div>
                                    <div className="text-xs text-[var(--color-text-secondary)]">
                                      {slot.startTime} - {slot.endTime}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-[var(--color-accent-light)] rounded-xl">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                              onClick={() =>
                                router.push(
                                  "/tasker/profile?section=availability"
                                )
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Hours
                            </Button>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              Your working hours are managed in your profile
                              settings
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 border-2 border-dashed border-[var(--color-border)] rounded-xl text-center bg-[var(--color-accent-light)]">
                          <Clock className="h-12 w-12 text-[var(--color-text-secondary)] mx-auto mb-3" />
                          <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                            No availability set. Please add your working hours
                            in your profile first.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                            onClick={() =>
                              router.push(
                                "/tasker/profile?section=availability"
                              )
                            }
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Add Working Hours
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </>
              )}

              {/* Step 2: Pricing & Policies */}
              {currentStep === 2 && (
                <>
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-[var(--color-text-primary)]">
                          Pricing & Policies
                        </CardTitle>
                        <CardDescription className="text-[var(--color-text-secondary)]">
                          Set your rates and booking policies
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Pricing Model */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-[var(--color-secondary)]" />
                        Pricing Model *
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {["fixed", "hourly", "per_item"].map((type) => (
                          <label
                            key={type}
                            className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                              formData.pricing.pricingType === type
                                ? "border-[var(--color-secondary)] bg-gradient-to-r from-green-50 to-emerald-50"
                                : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <input
                                type="radio"
                                name="pricingType"
                                value={type}
                                checked={formData.pricing.pricingType === type}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    pricing: {
                                      ...prev.pricing,
                                      pricingType: e.target
                                        .value as PricingType,
                                    },
                                  }))
                                }
                                className="w-4 h-4 text-[var(--color-secondary)]"
                              />
                              <div>
                                <div className="font-semibold capitalize text-[var(--color-text-primary)]">
                                  {type === "per_item" ? "Per Item" : type} Rate
                                </div>
                                <div className="text-sm text-[var(--color-text-secondary)] mt-1">
                                  {type === "fixed" &&
                                    "One price for the entire job"}
                                  {type === "hourly" &&
                                    "Charge per hour worked"}
                                  {type === "per_item" && "Price per unit/item"}
                                </div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Price Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formData.pricing.pricingType === "fixed" && (
                        <div className="space-y-3">
                          <Label
                            htmlFor="basePrice"
                            className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2"
                          >
                            <DollarSign className="h-4 w-4 text-[var(--color-secondary)]" />
                            Fixed Price (€) *
                          </Label>
                          <Input
                            id="basePrice"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.pricing.basePrice || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                pricing: {
                                  ...prev.pricing,
                                  basePrice: parseFloat(e.target.value) || 0,
                                },
                              }))
                            }
                            placeholder="e.g., 50.00"
                            className={`h-12 text-base border-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] ${
                              hasAttemptedValidation && errors.basePrice
                                ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
                                : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                            }`}
                          />
                          {hasAttemptedValidation && errors.basePrice && (
                            <p className="text-sm text-[var(--color-error)] flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {errors.basePrice}
                            </p>
                          )}
                        </div>
                      )}

                      {formData.pricing.pricingType === "hourly" && (
                        <div className="space-y-3">
                          <Label
                            htmlFor="hourlyRate"
                            className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2"
                          >
                            <Clock className="h-4 w-4 text-[var(--color-secondary)]" />
                            Hourly Rate (€) *
                          </Label>
                          <Input
                            id="hourlyRate"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.pricing.hourlyRate || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                pricing: {
                                  ...prev.pricing,
                                  hourlyRate: parseFloat(e.target.value) || 0,
                                },
                              }))
                            }
                            placeholder="e.g., 25.00"
                            className={`h-12 text-base border-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] ${
                              hasAttemptedValidation && errors.hourlyRate
                                ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
                                : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                            }`}
                          />
                          {hasAttemptedValidation && errors.hourlyRate && (
                            <p className="text-sm text-[var(--color-error)] flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {errors.hourlyRate}
                            </p>
                          )}
                        </div>
                      )}

                      {formData.pricing.pricingType === "per_item" && (
                        <div className="space-y-3">
                          <Label
                            htmlFor="basePrice"
                            className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2"
                          >
                            <DollarSign className="h-4 w-4 text-[var(--color-secondary)]" />
                            Price Per Item (€) *
                          </Label>
                          <Input
                            id="basePrice"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.pricing.basePrice || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                pricing: {
                                  ...prev.pricing,
                                  basePrice: parseFloat(e.target.value) || 0,
                                },
                              }))
                            }
                            placeholder="e.g., 5.00"
                            className={`h-12 text-base border-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] ${
                              hasAttemptedValidation && errors.basePrice
                                ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
                                : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                            }`}
                          />
                          {hasAttemptedValidation && errors.basePrice && (
                            <p className="text-sm text-[var(--color-error)] flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {errors.basePrice}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="minimumBooking">
                          Minimum Booking (hours) - Optional
                        </Label>
                        <Input
                          id="minimumBooking"
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={formData.pricing.minimumBookingHours || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pricing: {
                                ...prev.pricing,
                                minimumBookingHours: e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined,
                              },
                            }))
                          }
                          placeholder="e.g., 1.0 (optional)"
                          className={
                            hasAttemptedValidation && errors.minimumBookingHours
                              ? "border-destructive"
                              : ""
                          }
                        />
                        {hasAttemptedValidation &&
                          errors.minimumBookingHours && (
                            <p className="text-sm text-destructive">
                              {errors.minimumBookingHours}
                            </p>
                          )}
                        <p className="text-sm text-muted-foreground">
                          Leave empty if no minimum booking time required
                        </p>
                      </div>
                    </div>

                    {/* Estimated Duration */}
                    <div className="space-y-2">
                      <Label htmlFor="estimatedDuration">
                        Estimated Duration (hours) - Optional
                      </Label>
                      <Input
                        id="estimatedDuration"
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={formData.pricing.estimatedDuration || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              estimatedDuration: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            },
                          }))
                        }
                        placeholder="e.g., 2.0 (optional)"
                        className="max-w-xs"
                      />
                      <p className="text-sm text-muted-foreground">
                        How long do you expect this service typically takes?
                        (optional)
                      </p>
                    </div>

                    {/* Extras/Add-ons */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold text-[var(--color-primary)]">
                        Extras/Add-ons
                      </Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={newExtra.name}
                            onChange={(e) =>
                              setNewExtra((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="e.g., Deep cleaning, Supply materials"
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newExtra.price || ""}
                            onChange={(e) =>
                              setNewExtra((prev) => ({
                                ...prev,
                                price: parseFloat(e.target.value) || 0,
                              }))
                            }
                            placeholder="Price (€)"
                            className="w-32"
                          />
                          <Button
                            onClick={addExtra}
                            variant="outline"
                            size="icon"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {formData.pricing.extras.length > 0 && (
                          <div className="space-y-2 mt-4">
                            {formData.pricing.extras.map((extra, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                              >
                                <div>
                                  <span className="font-medium">
                                    {extra.name}
                                  </span>
                                  <span className="text-muted-foreground ml-2">
                                    +€{extra.price}
                                  </span>
                                </div>
                                <Button
                                  onClick={() => removeExtra(index)}
                                  variant="ghost"
                                  size="icon"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {/* Step 3: Review & Submit */}
              {currentStep === 3 && (
                <>
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-[var(--color-primary)]">
                      Review Your Offer
                    </CardTitle>
                    <CardDescription className="text-[var(--color-text-secondary)]">
                      Please review all details before publishing your service
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Service Overview */}
                    <div className="border rounded-lg p-6 bg-[var(--color-surface)] shadow-md">
                      <h3 className="font-semibold text-lg mb-4 text-[var(--color-primary)]">
                        Service Overview
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Title:</span>
                          <p className="font-medium">
                            {formData.basicInfo.title}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Category:
                          </span>
                          <p className="font-medium">
                            {
                              categories.find(
                                (c) => c.id === formData.basicInfo.categoryId
                              )?.name_en
                            }
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Service:
                          </span>
                          <p className="font-medium">
                            {
                              services.find(
                                (s) => s.id === formData.basicInfo.serviceId
                              )?.name_en
                            }
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Location:
                          </span>
                          <p className="font-medium">
                            {addresses.find(
                              (a) =>
                                a.id === formData.basicInfo.selectedAddressId
                            )
                              ? `${
                                  addresses.find(
                                    (a) =>
                                      a.id ===
                                      formData.basicInfo.selectedAddressId
                                  )?.city
                                }, ${
                                  addresses.find(
                                    (a) =>
                                      a.id ===
                                      formData.basicInfo.selectedAddressId
                                  )?.region
                                }`
                              : "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className="text-muted-foreground">
                          Description:
                        </span>
                        <p className="mt-1">{formData.basicInfo.description}</p>
                      </div>
                    </div>

                    {/* Pricing Overview */}
                    <div className="border rounded-lg p-6 bg-[var(--color-surface)] shadow-md">
                      <h3 className="font-semibold text-lg mb-4 text-[var(--color-primary)]">
                        Pricing Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Pricing Model:
                          </span>
                          <p className="font-medium capitalize">
                            {formData.pricing.pricingType}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            {formData.pricing.pricingType === "fixed"
                              ? "Fixed Price:"
                              : formData.pricing.pricingType === "hourly"
                              ? "Hourly Rate:"
                              : "Price Per Item:"}
                          </span>
                          <p className="font-medium">
                            €
                            {formData.pricing.pricingType === "fixed" ||
                            formData.pricing.pricingType === "per_item"
                              ? formData.pricing.basePrice
                              : formData.pricing.hourlyRate}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Minimum Booking:
                          </span>
                          <p className="font-medium">
                            {formData.pricing.minimumBookingHours
                              ? `${formData.pricing.minimumBookingHours} hours`
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Estimated Duration:
                          </span>
                          <p className="font-medium">
                            {formData.pricing.estimatedDuration
                              ? `${formData.pricing.estimatedDuration} hours`
                              : "Not specified"}
                          </p>
                        </div>
                      </div>

                      {formData.pricing.extras.length > 0 && (
                        <div className="mt-4">
                          <span className="text-muted-foreground">Extras:</span>
                          <div className="mt-2 space-y-1">
                            {formData.pricing.extras.map((extra, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-sm"
                              >
                                <span>{extra.name}</span>
                                <span className="font-medium">
                                  +€{extra.price}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Availability Overview */}
                    {availability && availability.length > 0 && (
                      <div className="border rounded-lg p-6 bg-[var(--color-surface)] shadow-md">
                        <h3 className="font-semibold text-lg mb-4 text-[var(--color-primary)]">
                          Availability
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {availability
                            .filter((slot) => slot && slot.enabled)
                            .map((slot) => (
                              <div key={slot.day} className="text-sm">
                                <div className="font-medium capitalize">
                                  {slot.day}
                                </div>
                                <div className="text-muted-foreground">
                                  {slot.startTime} - {slot.endTime}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    {taskerProfile && (
                      <div className="border rounded-lg p-6 bg-[var(--color-surface)] shadow-md">
                        <h3 className="font-semibold text-lg mb-4 text-[var(--color-primary)]">
                          About You
                        </h3>
                        <div className="mb-2">
                          <span className="text-muted-foreground">Bio:</span>
                          <p className="font-medium">
                            {taskerProfile.bio || "No bio set."}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Experience Level:
                          </span>
                          <p className="font-medium capitalize">
                            {taskerProfile.experience_level || "Not specified"}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </>
              )}

              {/* Navigation Footer */}
              <CardFooter className="flex flex-row gap-4 w-full p-6 bg-gradient-to-r from-[var(--color-accent-light)] to-white border-t border-[var(--color-border)]">
                <Button
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={currentStep === 1 || loading}
                  className="flex-1 sm:flex-none bg-white text-[var(--color-text-primary)] border-2 border-[var(--color-border)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] rounded-xl py-3 px-6 text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {currentStep < STEPS.length ? (
                  <Button
                    onClick={goToNextStep}
                    disabled={loading}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:from-[var(--color-primary-dark)] hover:to-[var(--color-secondary-dark)] focus:ring-2 focus:ring-[var(--color-secondary)] rounded-xl py-3 px-6 text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] text-white hover:from-[var(--color-secondary-dark)] hover:to-[var(--color-primary-dark)] focus:ring-2 focus:ring-[var(--color-secondary)] rounded-xl py-3 px-6 text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {submitting ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Publish Service
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6 animate-fade-in-up animate-delay-200">
              {/* Tips Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[var(--color-secondary)]" />
                    Tips for Success
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-secondary)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Be specific about what you offer and what's included
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-secondary)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Set competitive but fair pricing based on your experience
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-secondary)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Add a professional profile photo to build trust
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Support Card */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[var(--color-secondary)]" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                    Our support team is here to help you create the perfect
                    service listing.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-[var(--color-secondary)] text-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-white"
                  >
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
