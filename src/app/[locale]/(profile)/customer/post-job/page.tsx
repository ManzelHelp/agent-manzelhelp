"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
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
  ChevronDown,
  AlertCircle,
  Edit,
  Clock,
  Star,
  Shield,
  Sparkles,
  Info,
  Calendar,
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { getAllCategoryHierarchies } from "@/lib/categories";
import { createJob, type CreateJobData } from "@/actions/jobs";
import { getUserAddresses } from "@/actions/profile";
import { getServices, getServiceCategories } from "@/actions/services";
import type { ServiceCategory, Service, Address } from "@/types/supabase";

// Form data interfaces
interface JobDetailsData {
  title: string;
  description: string;
  categoryId: number;
  serviceId: number;
  selectedAddressId: string;
  requirements: string;
  images: string[];
}

interface ScheduleBudgetData {
  preferredDate: string;
  preferredTimeStart: string;
  preferredTimeEnd: string;
  isFlexible: boolean;
  estimatedDuration: number;
  customerBudget: number;
  currency: string;
  maxApplications: number;
}

interface JobFormData {
  jobDetails: JobDetailsData;
  scheduleBudget: ScheduleBudgetData;
}

const INITIAL_JOB_DETAILS: JobDetailsData = {
  title: "",
  description: "",
  categoryId: 0,
  serviceId: 0,
  selectedAddressId: "",
  requirements: "",
  images: [],
};

const INITIAL_SCHEDULE_BUDGET: ScheduleBudgetData = {
  preferredDate: "",
  preferredTimeStart: "",
  preferredTimeEnd: "",
  isFlexible: false,
  estimatedDuration: 1,
  customerBudget: 0,
  currency: "MAD",
  maxApplications: 3,
};

const STEPS = [
  {
    id: 1,
    title: "Job Details",
    description: "Tell us about the job you need done",
    icon: <Sparkles className="h-5 w-5" />,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: 2,
    title: "Schedule & Budget",
    description: "Set your schedule and budget",
    icon: <DollarSign className="h-5 w-5" />,
    color: "from-green-500 to-green-600",
  },
  {
    id: 3,
    title: "Review & Post",
    description: "Review and publish your job",
    icon: <Shield className="h-5 w-5" />,
    color: "from-purple-500 to-purple-600",
  },
];

export default function PostJobPage() {
  const router = useRouter();
  const t = useTranslations("postJob");
  const { user } = useUserStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    jobDetails: INITIAL_JOB_DETAILS,
    scheduleBudget: INITIAL_SCHEDULE_BUDGET,
  });

  // Data from database
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Validation errors - only show when user tries to continue
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);

  // Fetch initial data
  const fetchInitialData = React.useCallback(async () => {
    setLoading(true);

    try {
      // Get categories from database to ensure they match with services
      const categoriesResult = await getServiceCategories();
      if (categoriesResult.success && categoriesResult.categories) {
        const dbCategories = categoriesResult.categories.map((category) => ({
          id: category.id,
          name_en: category.name_en,
          name_fr: category.name_fr,
          name_ar: category.name_ar,
          description_en: category.description_en || undefined,
          description_fr: category.description_fr || undefined,
          description_ar: category.description_ar || undefined,
          icon_url: category.icon_url || undefined,
          is_active: category.is_active,
          sort_order: category.sort_order,
        }));
        setCategories(dbCategories);
      } else {
        // Fallback to local categories if database fetch fails
        console.warn("Failed to load categories from database, using local categories:", categoriesResult.error);
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
      }

      // Get all services from the database to ensure we use correct IDs
      // This prevents foreign key constraint errors when creating jobs
      const servicesResult = await getServices();
      if (servicesResult.success && servicesResult.services) {
        // Map database services to the Service type expected by the component
        // Services from DB already have category_id that matches service_categories.id
        const dbServices: Service[] = servicesResult.services.map((service) => ({
          id: service.id,
          category_id: service.category_id, // This already matches the category ID from DB
          name_en: service.name_en,
          name_fr: service.name_fr,
          name_ar: service.name_ar,
          description_en: service.description_en || undefined,
          description_fr: service.description_fr || undefined,
          description_ar: service.description_ar || undefined,
          is_active: service.is_active,
          sort_order: service.sort_order,
        }));
        setServices(dbServices);
      } else {
        // Fallback to local services if database fetch fails
        console.warn("Failed to load services from database, using local services:", servicesResult.error);
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
      }

      // Fetch user addresses using server action
      const addressesResult = await getUserAddresses();
      if (addressesResult.success && addressesResult.addresses) {
        setAddresses(addressesResult.addresses);

        // Auto-select the first address if available
        if (addressesResult.addresses.length > 0) {
          setFormData((prev) => ({
            ...prev,
            jobDetails: {
              ...prev.jobDetails,
              selectedAddressId: addressesResult.addresses![0].id || "",
            },
          }));
        }
      } else {
        console.error("Error fetching addresses:", addressesResult.error);
        toast.error("Failed to load addresses. Please try again.");
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

    if (!formData.jobDetails.title.trim()) {
      newErrors.title = t("errors.titleRequired");
    }
    if (!formData.jobDetails.description.trim()) {
      newErrors.description = t("errors.descriptionRequired");
    }
    if (!formData.jobDetails.categoryId) {
      newErrors.category = t("errors.categoryRequired");
    }
    if (!formData.jobDetails.serviceId) {
      newErrors.service = t("errors.serviceRequired");
    }
    if (!formData.jobDetails.selectedAddressId && addresses.length === 0) {
      newErrors.address = t("errors.locationRequired");
    }

    setErrors(newErrors);
    setHasAttemptedValidation(true);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.scheduleBudget.preferredDate) {
      newErrors.preferredDate = t("errors.dateRequired");
    }
    if (
      !formData.scheduleBudget.customerBudget ||
      formData.scheduleBudget.customerBudget <= 0
    ) {
      newErrors.customerBudget = t("errors.budgetGreaterThanZero");
    }
    if (
      !formData.scheduleBudget.estimatedDuration ||
      formData.scheduleBudget.estimatedDuration <= 0
    ) {
      newErrors.estimatedDuration = t("errors.durationGreaterThanZero");
    }
    if (
      !formData.scheduleBudget.maxApplications ||
      formData.scheduleBudget.maxApplications <= 0
    ) {
      newErrors.maxApplications = t("errors.maxApplicationsGreaterThanZero");
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

  // Filter services by category
  // Services are now mapped with parent category_id, so simple filter works
  const filteredServices = React.useMemo(() => {
    if (!formData.jobDetails.categoryId) return [];
    
    return services.filter(
      (service) => service.category_id === formData.jobDetails.categoryId
    );
  }, [services, formData.jobDetails.categoryId]);

  // Submit function
  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setSubmitting(true);

    try {
      // Prepare job data
      const jobData: CreateJobData = {
        title: formData.jobDetails.title,
        description: formData.jobDetails.description,
        service_id: formData.jobDetails.serviceId,
        preferred_date: formData.scheduleBudget.preferredDate,
        preferred_time_start:
          formData.scheduleBudget.preferredTimeStart || undefined,
        preferred_time_end:
          formData.scheduleBudget.preferredTimeEnd || undefined,
        is_flexible: formData.scheduleBudget.isFlexible,
        estimated_duration: formData.scheduleBudget.estimatedDuration,
        customer_budget: formData.scheduleBudget.customerBudget,
        currency: formData.scheduleBudget.currency,
        address_id: formData.jobDetails.selectedAddressId,
        max_applications: formData.scheduleBudget.maxApplications,
        requirements: formData.jobDetails.requirements || undefined,
        images:
          formData.jobDetails.images.length > 0
            ? formData.jobDetails.images
            : undefined,
      };

      // Create the job using server action
      const result = await createJob(jobData);

      if (result.success) {
        toast.success(t("success.jobPosted"));
        router.push("/customer/my-jobs");
      } else {
        toast.error(result.error || t("errors.jobCreationFailed"));
      }
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error(t("errors.jobCreationFailed"));
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
            Loading Job Creator
          </h3>
          <p className="text-[var(--color-text-secondary)]">
            Preparing everything you need to create an amazing job posting...
          </p>
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
                      {t(
                        `steps.${
                          step.id === 1
                            ? "jobDetails"
                            : step.id === 2
                            ? "scheduleBudget"
                            : "reviewPost"
                        }`
                      )}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
                      {t(
                        `stepDescriptions.${
                          step.id === 1
                            ? "jobDetails"
                            : step.id === 2
                            ? "scheduleBudget"
                            : "reviewPost"
                        }`
                      )}
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
              {/* Step 1: Job Details */}
              {currentStep === 1 && (
                <>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-[var(--color-text-primary)]">
                          {t("steps.jobDetails")}
                        </CardTitle>
                        <CardDescription className="text-[var(--color-text-secondary)]">
                          {t("stepDescriptions.jobDetails")}
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
                            {user?.avatar_url && !avatarError ? (
                              <Image
                                src={user.avatar_url}
                                alt="Profile"
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                                unoptimized
                                onError={() => setAvatarError(true)}
                              />
                            ) : (
                              <User className="h-8 w-8 text-white" />
                            )}
                          </div>
                          {(!user?.avatar_url || avatarError) && (
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
                              Add a profile photo to build trust with taskers
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Job Title */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="title"
                        className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2"
                      >
                        <Star className="h-4 w-4 text-[var(--color-secondary)]" />
                        {t("jobDetails.title")} *
                      </Label>
                      <Input
                        id="title"
                        value={formData.jobDetails.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            jobDetails: {
                              ...prev.jobDetails,
                              title: e.target.value,
                            },
                          }))
                        }
                        placeholder={t("jobDetails.titlePlaceholder")}
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

                    {/* Job Description */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="description"
                        className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4 text-[var(--color-secondary)]" />
                        {t("jobDetails.description")} *
                      </Label>
                      <textarea
                        id="description"
                        value={formData.jobDetails.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            jobDetails: {
                              ...prev.jobDetails,
                              description: e.target.value,
                            },
                          }))
                        }
                        placeholder={t("jobDetails.descriptionPlaceholder")}
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
                          {t("jobDetails.category")} *
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
                                {formData.jobDetails.categoryId
                                  ? categories.find(
                                      (c) =>
                                        c.id === formData.jobDetails.categoryId
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
                                    jobDetails: {
                                      ...prev.jobDetails,
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
                          {t("jobDetails.service")} *
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
                                !formData.jobDetails.categoryId
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={!formData.jobDetails.categoryId}
                            >
                              <span className="truncate">
                                {formData.jobDetails.serviceId
                                  ? services.find(
                                      (s) =>
                                        s.id === formData.jobDetails.serviceId
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
                                    jobDetails: {
                                      ...prev.jobDetails,
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
                        {t("jobDetails.location")}
                      </Label>
                      {addresses.length > 0 ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-12 w-full justify-between text-base border-2 border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)] transition-all duration-200"
                            >
                              <span className="truncate">
                                {formData.jobDetails.selectedAddressId
                                  ? addresses.find(
                                      (a) =>
                                        a.id ===
                                        formData.jobDetails.selectedAddressId
                                    )
                                    ? `${
                                        addresses.find(
                                          (a) =>
                                            a.id ===
                                            formData.jobDetails
                                              .selectedAddressId
                                        )?.street_address
                                      }, ${
                                        addresses.find(
                                          (a) =>
                                            a.id ===
                                            formData.jobDetails
                                              .selectedAddressId
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
                                    jobDetails: {
                                      ...prev.jobDetails,
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
                              router.push("/customer/profile?section=addresses")
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

                    {/* Special Requirements */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="requirements"
                        className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2"
                      >
                        <Info className="h-4 w-4 text-[var(--color-secondary)]" />
                        {t("jobDetails.requirements")}
                      </Label>
                      <textarea
                        id="requirements"
                        value={formData.jobDetails.requirements}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            jobDetails: {
                              ...prev.jobDetails,
                              requirements: e.target.value,
                            },
                          }))
                        }
                        placeholder={t("jobDetails.requirementsPlaceholder")}
                        rows={3}
                        className="w-full min-h-[90px] px-4 py-3 text-base border-2 border-[var(--color-border)] rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] resize-y hover:border-[var(--color-primary)]"
                      />
                    </div>
                  </CardContent>
                </>
              )}

              {/* Step 2: Schedule & Budget */}
              {currentStep === 2 && (
                <>
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-[var(--color-text-primary)]">
                          {t("steps.scheduleBudget")}
                        </CardTitle>
                        <CardDescription className="text-[var(--color-text-secondary)]">
                          {t("stepDescriptions.scheduleBudget")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Date & Time Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-[var(--color-secondary)]" />
                        Preferred Schedule
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Preferred Date */}
                        <div className="space-y-3">
                          <Label
                            htmlFor="preferredDate"
                            className="text-sm font-semibold text-[var(--color-text-primary)]"
                          >
                            {t("scheduleBudget.preferredDate")} *
                          </Label>
                          <Input
                            id="preferredDate"
                            type="date"
                            value={formData.scheduleBudget.preferredDate}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                scheduleBudget: {
                                  ...prev.scheduleBudget,
                                  preferredDate: e.target.value,
                                },
                              }))
                            }
                            min={new Date().toISOString().split("T")[0]}
                            className={`h-12 text-base border-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] ${
                              hasAttemptedValidation && errors.preferredDate
                                ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
                                : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                            }`}
                          />
                          {hasAttemptedValidation && errors.preferredDate && (
                            <p className="text-sm text-[var(--color-error)] flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {errors.preferredDate}
                            </p>
                          )}
                        </div>

                        {/* Time Flexibility */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                            <Clock className="h-4 w-4 text-[var(--color-secondary)]" />
                            Time Flexibility
                          </Label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isFlexible"
                              checked={formData.scheduleBudget.isFlexible}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  scheduleBudget: {
                                    ...prev.scheduleBudget,
                                    isFlexible: e.target.checked,
                                  },
                                }))
                              }
                              className="w-4 h-4 text-[var(--color-secondary)] border-2 border-[var(--color-border)] rounded focus:ring-[var(--color-secondary)]"
                            />
                            <Label
                              htmlFor="isFlexible"
                              className="text-sm text-[var(--color-text-secondary)]"
                            >
                              {t("scheduleBudget.timeFlexible")}
                            </Label>
                          </div>
                        </div>
                      </div>

                      {/* Specific Time Selection (when not flexible) */}
                      {!formData.scheduleBudget.isFlexible && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <Label
                              htmlFor="timeStart"
                              className="text-sm font-semibold text-[var(--color-text-primary)]"
                            >
                              {t("scheduleBudget.preferredTime")} (Start)
                            </Label>
                            <Input
                              id="timeStart"
                              type="time"
                              value={formData.scheduleBudget.preferredTimeStart}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  scheduleBudget: {
                                    ...prev.scheduleBudget,
                                    preferredTimeStart: e.target.value,
                                  },
                                }))
                              }
                              className="h-12 text-base border-2 border-[var(--color-border)] rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] hover:border-[var(--color-primary)]"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label
                              htmlFor="timeEnd"
                              className="text-sm font-semibold text-[var(--color-text-primary)]"
                            >
                              {t("scheduleBudget.preferredTime")} (End)
                            </Label>
                            <Input
                              id="timeEnd"
                              type="time"
                              value={formData.scheduleBudget.preferredTimeEnd}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  scheduleBudget: {
                                    ...prev.scheduleBudget,
                                    preferredTimeEnd: e.target.value,
                                  },
                                }))
                              }
                              className="h-12 text-base border-2 border-[var(--color-border)] rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] hover:border-[var(--color-primary)]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Duration & Budget Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-[var(--color-secondary)]" />
                        Duration & Budget
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Estimated Duration */}
                        <div className="space-y-3">
                          <Label
                            htmlFor="duration"
                            className="text-sm font-semibold text-[var(--color-text-primary)]"
                          >
                            {t("scheduleBudget.estimatedDuration")} *
                          </Label>
                          <Input
                            id="duration"
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={formData.scheduleBudget.estimatedDuration}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                scheduleBudget: {
                                  ...prev.scheduleBudget,
                                  estimatedDuration:
                                    parseFloat(e.target.value) || 0,
                                },
                              }))
                            }
                            placeholder={t(
                              "scheduleBudget.durationPlaceholder"
                            )}
                            className={`h-12 text-base border-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] ${
                              hasAttemptedValidation && errors.estimatedDuration
                                ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
                                : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                            }`}
                          />
                          {hasAttemptedValidation &&
                            errors.estimatedDuration && (
                              <p className="text-sm text-[var(--color-error)] flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.estimatedDuration}
                              </p>
                            )}
                        </div>

                        {/* Max Applications */}
                        <div className="space-y-3">
                          <Label
                            htmlFor="maxApplications"
                            className="text-sm font-semibold text-[var(--color-text-primary)]"
                          >
                            {t("scheduleBudget.maxApplications")} *
                          </Label>
                          <Input
                            id="maxApplications"
                            type="number"
                            min="1"
                            max="20"
                            value={formData.scheduleBudget.maxApplications}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                scheduleBudget: {
                                  ...prev.scheduleBudget,
                                  maxApplications:
                                    parseInt(e.target.value) || 1,
                                },
                              }))
                            }
                            className={`h-12 text-base border-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] ${
                              hasAttemptedValidation && errors.maxApplications
                                ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
                                : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                            }`}
                          />
                          {hasAttemptedValidation && errors.maxApplications && (
                            <p className="text-sm text-[var(--color-error)] flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {errors.maxApplications}
                            </p>
                          )}
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {t("scheduleBudget.maxApplicationsDescription")}
                          </p>
                        </div>
                      </div>

                      {/* Budget Section */}
                      <div className="space-y-3">
                        <Label
                          htmlFor="budget"
                          className="text-sm font-semibold text-[var(--color-text-primary)]"
                        >
                          {t("scheduleBudget.budget")} *
                        </Label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Input
                              id="budget"
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.scheduleBudget.customerBudget}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  scheduleBudget: {
                                    ...prev.scheduleBudget,
                                    customerBudget:
                                      parseFloat(e.target.value) || 0,
                                  },
                                }))
                              }
                              placeholder={t(
                                "scheduleBudget.budgetPlaceholder"
                              )}
                              className={`h-12 text-base border-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] ${
                                hasAttemptedValidation && errors.customerBudget
                                  ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
                                  : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                              }`}
                            />
                            {hasAttemptedValidation &&
                              errors.customerBudget && (
                                <p className="text-sm text-[var(--color-error)] flex items-center gap-1 mt-1">
                                  <AlertCircle className="h-4 w-4" />
                                  {errors.customerBudget}
                                </p>
                              )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="h-12 px-4 border-2 border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-200"
                              >
                                {formData.scheduleBudget.currency}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    scheduleBudget: {
                                      ...prev.scheduleBudget,
                                      currency: "MAD",
                                    },
                                  }))
                                }
                              >
                                MAD
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    scheduleBudget: {
                                      ...prev.scheduleBudget,
                                      currency: "EUR",
                                    },
                                  }))
                                }
                              >
                                EUR
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    scheduleBudget: {
                                      ...prev.scheduleBudget,
                                      currency: "USD",
                                    },
                                  }))
                                }
                              >
                                USD
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {/* Step 3: Review & Post */}
              {currentStep === 3 && (
                <>
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-[var(--color-text-primary)]">
                          {t("review.title")}
                        </CardTitle>
                        <CardDescription className="text-[var(--color-text-secondary)]">
                          {t("review.description")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Job Overview */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                        <Star className="h-5 w-5 text-[var(--color-secondary)]" />
                        {t("review.jobOverview")}
                      </h3>
                      <div className="bg-gradient-to-r from-[var(--color-accent-light)] to-blue-50 rounded-xl p-4 border border-[var(--color-border)]">
                        <h4 className="font-bold text-lg text-[var(--color-text-primary)] mb-2">
                          {formData.jobDetails.title}
                        </h4>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                          {formData.jobDetails.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-[var(--color-secondary)] text-white text-xs rounded-full">
                            {
                              categories.find(
                                (c) => c.id === formData.jobDetails.categoryId
                              )?.name_en
                            }
                          </span>
                          <span className="px-3 py-1 bg-[var(--color-primary)] text-white text-xs rounded-full">
                            {
                              services.find(
                                (s) => s.id === formData.jobDetails.serviceId
                              )?.name_en
                            }
                          </span>
                        </div>
                        {formData.jobDetails.requirements && (
                          <div className="mt-3">
                            <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                              Special Requirements:
                            </p>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              {formData.jobDetails.requirements}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Schedule & Budget */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-[var(--color-secondary)]" />
                        {t("review.scheduleBudget")}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-[var(--color-border)] rounded-xl p-4">
                          <h4 className="font-semibold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[var(--color-secondary)]" />
                            Schedule
                          </h4>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            <strong>Date:</strong>{" "}
                            {new Date(
                              formData.scheduleBudget.preferredDate
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          {!formData.scheduleBudget.isFlexible &&
                            formData.scheduleBudget.preferredTimeStart && (
                              <p className="text-sm text-[var(--color-text-secondary)]">
                                <strong>Time:</strong>{" "}
                                {formData.scheduleBudget.preferredTimeStart} -{" "}
                                {formData.scheduleBudget.preferredTimeEnd}
                              </p>
                            )}
                          {formData.scheduleBudget.isFlexible && (
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              <strong>Time:</strong> Flexible
                            </p>
                          )}
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            <strong>Duration:</strong>{" "}
                            {formData.scheduleBudget.estimatedDuration} hours
                          </p>
                        </div>
                        <div className="bg-white border border-[var(--color-border)] rounded-xl p-4">
                          <h4 className="font-semibold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-[var(--color-secondary)]" />
                            Budget
                          </h4>
                          <p className="text-2xl font-bold text-[var(--color-secondary)]">
                            {formData.scheduleBudget.customerBudget}{" "}
                            {formData.scheduleBudget.currency}
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            Max applications:{" "}
                            {formData.scheduleBudget.maxApplications}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[var(--color-secondary)]" />
                        Location
                      </h3>
                      <div className="bg-white border border-[var(--color-border)] rounded-xl p-4">
                        {addresses.find(
                          (a) => a.id === formData.jobDetails.selectedAddressId
                        ) && (
                          <div>
                            <p className="font-semibold text-[var(--color-text-primary)]">
                              {
                                addresses.find(
                                  (a) =>
                                    a.id ===
                                    formData.jobDetails.selectedAddressId
                                )?.label
                              }
                            </p>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              {
                                addresses.find(
                                  (a) =>
                                    a.id ===
                                    formData.jobDetails.selectedAddressId
                                )?.street_address
                              }
                              ,
                              {
                                addresses.find(
                                  (a) =>
                                    a.id ===
                                    formData.jobDetails.selectedAddressId
                                )?.city
                              }
                              ,
                              {
                                addresses.find(
                                  (a) =>
                                    a.id ===
                                    formData.jobDetails.selectedAddressId
                                )?.region
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
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
                    {t("review.publishJob")}
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
                    {t("tips.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-secondary)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {t("tips.tip1")}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-secondary)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {t("tips.tip2")}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-secondary)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {t("tips.tip3")}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-secondary)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">4</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {t("tips.tip4")}
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
                    Our support team is here to help you create the perfect job
                    posting.
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
