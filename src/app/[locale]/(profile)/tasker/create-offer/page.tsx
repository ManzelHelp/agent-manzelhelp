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
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { createClient } from "@/supabase/client";
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
  selectedAddressId: number;
  selectedWorkingHours: string[]; // array of day keys (e.g., ['monday', 'tuesday'])
  serviceArea?: string; // Added to match schema
}

interface PricingData {
  pricingType: PricingType;
  basePrice: number;
  hourlyRate: number;
  minimumBookingHours: number;
  extras: { name: string; price: number }[];
  estimatedDuration: number;
  cancellationPolicy: string;
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
  selectedAddressId: 0,
  selectedWorkingHours: [],
  serviceArea: "",
};

const INITIAL_PRICING_DATA: PricingData = {
  pricingType: "fixed",
  basePrice: 0,
  hourlyRate: 0,
  minimumBookingHours: 1,
  extras: [],
  estimatedDuration: 1,
  cancellationPolicy: "",
};

const STEPS = [
  {
    id: 1,
    title: "Basic Information",
    description: "Service details and availability",
    icon: <User className="h-5 w-5" />,
  },
  {
    id: 2,
    title: "Pricing Details",
    description: "Set your rates and policies",
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    id: 3,
    title: "Review & Submit",
    description: "Review your offer before publishing",
    icon: <Check className="h-5 w-5" />,
  },
];

export default function CreateOfferPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OfferFormData>({
    basicInfo: INITIAL_BASIC_INFO,
    pricing: INITIAL_PRICING_DATA,
  });

  // Data from database
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);

  // Form states
  const [newExtra, setNewExtra] = useState({ name: "", price: 0 });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Add state for taskerProfile
  const [taskerProfile, setTaskerProfile] = useState<TaskerProfile | null>(
    null
  );

  // Fetch initial data
  const fetchInitialData = React.useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    const supabase = createClient();

    try {
      // Fetch service categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("service_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch all services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch user addresses
      const { data: addressesData, error: addressesError } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (addressesError) throw addressesError;
      setAddresses(addressesData || []);

      // Fetch user availability from tasker profile
      const { data: profileData, error: profileError } = await supabase
        .from("tasker_profiles")
        .select("operation_hours")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching availability:", profileError);
      } else if (profileData?.operation_hours) {
        setAvailability(profileData.operation_hours as AvailabilitySlot[]);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load form data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch taskerProfile on mount
  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) return;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tasker_profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!error && data) setTaskerProfile(data as TaskerProfile);
    }
    fetchProfile();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      router.push("/login");
      return;
    }
    fetchInitialData();
  }, [user?.id, router, fetchInitialData]);

  // Validation functions
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.basicInfo.title.trim()) {
      newErrors.title = "Service title is required";
    }
    if (!formData.basicInfo.description.trim()) {
      newErrors.description = "Service description is required";
    }
    if (!formData.basicInfo.categoryId) {
      newErrors.category = "Please select a service category";
    }
    if (!formData.basicInfo.serviceId) {
      newErrors.service = "Please select a service";
    }
    if (!formData.basicInfo.selectedAddressId && addresses.length === 0) {
      newErrors.address = "Please add an address in your profile first";
    }
    if (formData.basicInfo.selectedWorkingHours.length === 0) {
      newErrors.workingHours = "Please select at least one working hour";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (
      formData.pricing.pricingType === "fixed" &&
      formData.pricing.basePrice <= 0
    ) {
      newErrors.basePrice = "Base price must be greater than 0";
    }
    if (
      formData.pricing.pricingType === "hourly" &&
      formData.pricing.hourlyRate <= 0
    ) {
      newErrors.hourlyRate = "Hourly rate must be greater than 0";
    }
    if (formData.pricing.minimumBookingHours < 0.5) {
      newErrors.minimumBookingHours =
        "Minimum booking must be at least 0.5 hours";
    }

    setErrors(newErrors);
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

    setLoading(true);
    const supabase = createClient();

    try {
      // Get the selected address
      const selectedAddress = addresses.find(
        (a) => a.id === formData.basicInfo.selectedAddressId
      );

      if (!selectedAddress) {
        throw new Error("Selected address not found");
      }

      // Create the tasker service entry
      const { error: serviceError } = await supabase
        .from("tasker_services")
        .insert({
          tasker_id: user.id,
          service_id: formData.basicInfo.serviceId,
          title: formData.basicInfo.title,
          description: formData.basicInfo.description,
          pricing_type: formData.pricing.pricingType,
          base_price:
            formData.pricing.pricingType === "fixed"
              ? formData.pricing.basePrice
              : null,
          hourly_rate:
            formData.pricing.pricingType === "hourly"
              ? formData.pricing.hourlyRate
              : null,
          minimum_duration: formData.pricing.minimumBookingHours,
          service_area: `${selectedAddress.city}, ${selectedAddress.region}`,
          is_available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          portfolio_images: null, // We can add image upload functionality later
        });

      if (serviceError) throw serviceError;

      // Only update tasker profile if they haven't set their availability yet
      if (
        !taskerProfile?.operation_hours &&
        formData.basicInfo.selectedWorkingHours.length > 0
      ) {
        // Use the existing availability from the profile if it exists
        const existingAvailability = availability.filter((slot) =>
          formData.basicInfo.selectedWorkingHours.includes(slot.day)
        );

        const { error: profileError } = await supabase
          .from("tasker_profiles")
          .update({
            operation_hours: existingAvailability,
            is_available: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (profileError) {
          console.error("Error updating operation hours:", profileError);
          // Don't throw here as the main service was created successfully
        }
      }

      toast.success("Service offer created successfully!");
      router.push("/tasker/dashboard");
    } catch (error) {
      console.error("Error creating offer:", error);
      toast.error("Failed to create offer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-10 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    currentStep >= step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="mt-3 text-center">
                  <h3
                    className={`font-semibold text-sm ${
                      currentStep >= step.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-4 transition-all ${
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <Card className="w-full">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Basic Service Information
              </CardTitle>
              <CardDescription>
                Tell us about the service you want to offer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Avatar & Info */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {user?.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt="Profile"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">
                    {user?.first_name} {user?.last_name}
                  </h4>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  {!user?.avatar_url && (
                    <p className="text-xs text-amber-600 mt-1">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      Add a profile photo in settings to build trust
                    </p>
                  )}
                </div>
              </div>

              {/* Service Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  value={formData.basicInfo.title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, title: e.target.value },
                    }))
                  }
                  placeholder="e.g., Professional House Cleaning Service"
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              {/* Service Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Service Description *</Label>
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
                  className={`flex w-full min-h-[80px] px-3 py-2 text-sm bg-transparent border border-input rounded-md shadow-xs transition-[color,box-shadow] outline-none resize-y ${
                    errors.description
                      ? "border-destructive focus-visible:ring-destructive/20"
                      : "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  }`}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Category & Service Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Service Category *</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-between ${
                          errors.category ? "border-destructive" : ""
                        }`}
                      >
                        {formData.basicInfo.categoryId
                          ? categories.find(
                              (c) => c.id === formData.basicInfo.categoryId
                            )?.name_en || "Select category"
                          : "Select category"}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
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
                        >
                          {category.name_en}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {errors.category && (
                    <p className="text-sm text-destructive">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Specific Service *</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-between ${
                          errors.service ? "border-destructive" : ""
                        }`}
                        disabled={!formData.basicInfo.categoryId}
                      >
                        {formData.basicInfo.serviceId
                          ? services.find(
                              (s) => s.id === formData.basicInfo.serviceId
                            )?.name_en || "Select service"
                          : "Select service"}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
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
                        >
                          {service.name_en}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {errors.service && (
                    <p className="text-sm text-destructive">{errors.service}</p>
                  )}
                </div>
              </div>

              {/* Location Selection */}
              <div className="space-y-2">
                <Label>Service Location</Label>
                {addresses.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {formData.basicInfo.selectedAddressId
                          ? addresses.find(
                              (a) =>
                                a.id === formData.basicInfo.selectedAddressId
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
                        <MapPin className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80">
                      {addresses.map((address) => (
                        <DropdownMenuItem
                          key={address.id}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              basicInfo: {
                                ...prev.basicInfo,
                                selectedAddressId: address.id || 0,
                              },
                            }))
                          }
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{address.label}</span>
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
                  <div className="p-4 border border-dashed rounded-lg text-center">
                    <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No addresses found. Please add an address in your profile
                      first.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        router.push("/tasker/profile?section=addresses")
                      }
                    >
                      Edit Addresses
                    </Button>
                  </div>
                )}
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address}</p>
                )}
              </div>

              {/* Working Hours Selection */}
              <div className="space-y-2">
                <Label>Working Hours</Label>
                {availability.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {availability
                        .filter((slot) => slot.enabled)
                        .map((slot) => (
                          <label
                            key={slot.day}
                            className="flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.basicInfo.selectedWorkingHours.includes(
                                slot.day
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    basicInfo: {
                                      ...prev.basicInfo,
                                      selectedWorkingHours: [
                                        ...prev.basicInfo.selectedWorkingHours,
                                        slot.day,
                                      ],
                                    },
                                  }));
                                } else {
                                  setFormData((prev) => ({
                                    ...prev,
                                    basicInfo: {
                                      ...prev.basicInfo,
                                      selectedWorkingHours:
                                        prev.basicInfo.selectedWorkingHours.filter(
                                          (d) => d !== slot.day
                                        ),
                                    },
                                  }));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <div className="flex-1">
                              <div className="font-medium capitalize text-sm">
                                {slot.day}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {slot.startTime} - {slot.endTime}
                              </div>
                            </div>
                          </label>
                        ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-fit mt-2"
                      onClick={() =>
                        router.push("/tasker/profile?section=availability")
                      }
                    >
                      Edit Working Hours
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 border border-dashed rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                      No availability set. Please add your working hours in your
                      profile first.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        router.push("/tasker/settings?section=availability")
                      }
                    >
                      Add Working Hours
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </>
        )}

        {/* Step 2: Pricing Details */}
        {currentStep === 2 && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Pricing Details
              </CardTitle>
              <CardDescription>
                Set your rates and booking policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pricing Model */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  Pricing Model *
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["fixed", "hourly", "per_item"].map((type) => (
                    <label
                      key={type}
                      className="flex flex-col p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
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
                                pricingType: e.target.value as PricingType,
                              },
                            }))
                          }
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium capitalize">
                            {type === "per_item" ? "Per Item" : type} Rate
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {type === "fixed" && "One price for the entire job"}
                            {type === "hourly" && "Charge per hour worked"}
                            {type === "per_item" && "Price per unit/item"}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.pricing.pricingType === "fixed" && (
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Fixed Price (€) *</Label>
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
                      className={errors.basePrice ? "border-destructive" : ""}
                    />
                    {errors.basePrice && (
                      <p className="text-sm text-destructive">
                        {errors.basePrice}
                      </p>
                    )}
                  </div>
                )}

                {formData.pricing.pricingType === "hourly" && (
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (€) *</Label>
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
                      className={errors.hourlyRate ? "border-destructive" : ""}
                    />
                    {errors.hourlyRate && (
                      <p className="text-sm text-destructive">
                        {errors.hourlyRate}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="minimumBooking">
                    Minimum Booking (hours)
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
                          minimumBookingHours: parseFloat(e.target.value) || 1,
                        },
                      }))
                    }
                    placeholder="e.g., 1.0"
                    className={
                      errors.minimumBookingHours ? "border-destructive" : ""
                    }
                  />
                  {errors.minimumBookingHours && (
                    <p className="text-sm text-destructive">
                      {errors.minimumBookingHours}
                    </p>
                  )}
                </div>
              </div>

              {/* Estimated Duration */}
              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">
                  Estimated Duration (hours)
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
                        estimatedDuration: parseFloat(e.target.value) || 1,
                      },
                    }))
                  }
                  placeholder="e.g., 2.0"
                  className="max-w-xs"
                />
                <p className="text-sm text-muted-foreground">
                  How long do you expect this service typically takes?
                </p>
              </div>

              {/* Extras/Add-ons */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">
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
                    <Button onClick={addExtra} variant="outline" size="icon">
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
                            <span className="font-medium">{extra.name}</span>
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

              {/* Cancellation Policy */}
              <div className="space-y-2">
                <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                <textarea
                  id="cancellationPolicy"
                  value={formData.pricing.cancellationPolicy}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pricing: {
                        ...prev.pricing,
                        cancellationPolicy: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g., Free cancellation up to 24 hours before scheduled time. 50% refund for cancellations within 24 hours."
                  rows={3}
                  className="flex w-full min-h-[80px] px-3 py-2 text-sm bg-transparent border border-input rounded-md shadow-xs transition-[color,box-shadow] outline-none resize-y focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                />
                <p className="text-sm text-muted-foreground">
                  Optional: Set clear expectations about cancellations and
                  refunds
                </p>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Review Your Offer
              </CardTitle>
              <CardDescription>
                Please review all details before publishing your service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Service Overview */}
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Service Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Title:</span>
                    <p className="font-medium">{formData.basicInfo.title}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium">
                      {
                        categories.find(
                          (c) => c.id === formData.basicInfo.categoryId
                        )?.name_en
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Service:</span>
                    <p className="font-medium">
                      {
                        services.find(
                          (s) => s.id === formData.basicInfo.serviceId
                        )?.name_en
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <p className="font-medium">
                      {addresses.find(
                        (a) => a.id === formData.basicInfo.selectedAddressId
                      )
                        ? `${
                            addresses.find(
                              (a) =>
                                a.id === formData.basicInfo.selectedAddressId
                            )?.city
                          }, ${
                            addresses.find(
                              (a) =>
                                a.id === formData.basicInfo.selectedAddressId
                            )?.region
                          }`
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-muted-foreground">Description:</span>
                  <p className="mt-1">{formData.basicInfo.description}</p>
                </div>
              </div>

              {/* Pricing Overview */}
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Pricing Details</h3>
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
                        : "Hourly Rate:"}
                    </span>
                    <p className="font-medium">
                      €
                      {formData.pricing.pricingType === "fixed"
                        ? formData.pricing.basePrice
                        : formData.pricing.hourlyRate}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Minimum Booking:
                    </span>
                    <p className="font-medium">
                      {formData.pricing.minimumBookingHours} hours
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Estimated Duration:
                    </span>
                    <p className="font-medium">
                      {formData.pricing.estimatedDuration} hours
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
                          <span className="font-medium">+€{extra.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.pricing.cancellationPolicy && (
                  <div className="mt-4">
                    <span className="text-muted-foreground">
                      Cancellation Policy:
                    </span>
                    <p className="mt-1 text-sm">
                      {formData.pricing.cancellationPolicy}
                    </p>
                  </div>
                )}
              </div>

              {/* Availability Overview */}
              {availability.length > 0 && (
                <div className="border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">Availability</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availability.map((slot) => (
                      <div key={slot.day} className="text-sm">
                        <div className="font-medium capitalize">{slot.day}</div>
                        <div className="text-muted-foreground">
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {taskerProfile && (
                <div className="border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">About You</h3>
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
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={goToNextStep} disabled={loading}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
              ) : null}
              Publish Service
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
