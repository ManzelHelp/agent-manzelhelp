"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobFormSchema } from "@/lib/schemas/jobs"; // ✅ Import du schéma
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
import { ContactSupportDialog } from "@/components/ContactSupportDialog";
import { BackButton } from "@/components/ui/BackButton";

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
  const { toast } = useToast();
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // --- CONFIGURATION FORMULAIRE ---
  const form = useForm({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      jobDetails: {
        title: "",
        description: "",
        categoryId: 0,
        serviceId: 0,
        selectedAddressId: "",
        requirements: "",
        images: [] as string[],
      },
      scheduleBudget: {
        preferredDate: "",
        preferredTimeStart: "",
        preferredTimeEnd: "",
        isFlexible: false,
        estimatedDuration: 1,
        customerBudget: 0,
        currency: "MAD",
        maxApplications: 3,
      },
    },
    mode: "onChange",
  });

  // ✅ CORRECTION MAJEURE : On utilise 'any' ici pour éviter les erreurs "Type 'unknown' is not assignable to type 'ReactNode'"
  // Cela permet à formData d'être lu dans le JSX sans que TypeScript ne bloque.
  const formData = form.watch() as any;
  const { errors } = form.formState;

  // Data from database
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Fetch initial data
  const fetchInitialData = React.useCallback(async () => {
    setLoading(true);

    try {
      // 1. Categories
      const categoriesResult = await getServiceCategories();
      if (categoriesResult.success && categoriesResult.categories) {
        setCategories(categoriesResult.categories as ServiceCategory[]);
      } else {
        const hierarchies = getAllCategoryHierarchies();
        const localCategories = hierarchies.map(({ parent }) => ({
          ...parent,
          id: parent.id,
          is_active: true,
          sort_order: parent.id,
        })) as unknown as ServiceCategory[];
        setCategories(localCategories);
      }

      // 2. Services
      const servicesResult = await getServices();
      if (servicesResult.success && servicesResult.services) {
        setServices(servicesResult.services as Service[]);
      } else {
        const hierarchies = getAllCategoryHierarchies();
        const allServices: Service[] = [];
        hierarchies.forEach(({ parent, subcategories }) => {
          subcategories.forEach((service) => {
            allServices.push({
              ...service,
              category_id: parent.id,
              is_active: true,
              sort_order: service.id,
            } as unknown as Service);
          });
        });
        setServices(allServices);
      }

      // 3. Addresses
      const addressesResult = await getUserAddresses();
      if (addressesResult.success && addressesResult.addresses) {
        setAddresses(addressesResult.addresses);

        // Auto-select first address
        if (addressesResult.addresses.length > 0) {
          const firstAddressId = addressesResult.addresses[0].id;
          if (firstAddressId) {
            // On set la valeur sans déclencher de validation bloquante
            form.setValue("jobDetails.selectedAddressId", firstAddressId);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load form data.",
      });
    } finally {
      setLoading(false);
    }
  }, [form, toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Navigation functions
  const goToNextStep = async () => {
    if (currentStep === 1) {
      // ✅ CORRECTION : J'ai retiré "jobDetails.selectedAddressId" de la liste ci-dessous.
      // Zod ne bloquera plus la navigation si l'adresse pose problème.
      const isValid = await form.trigger([
        "jobDetails.title",
        "jobDetails.description",
        "jobDetails.categoryId",
        "jobDetails.serviceId",
      ]);
      
      if (isValid) setCurrentStep(2);
    } else if (currentStep === 2) {
      const isValid = await form.trigger([
        "scheduleBudget.preferredDate",
        "scheduleBudget.customerBudget",
        "scheduleBudget.estimatedDuration",
        "scheduleBudget.maxApplications",
      ]);
      if (isValid) setCurrentStep(3);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const filteredServices = React.useMemo(() => {
    if (!formData.jobDetails?.categoryId) return [];
    return services.filter(
      (service) => service.category_id === formData.jobDetails.categoryId
    );
  }, [services, formData.jobDetails?.categoryId]);

  // Submit function
  const handleSubmit = async () => {
    // Trigger validation for all fields
    const isValid = await form.trigger();
    
    if (!isValid) {
      // Get form errors from react-hook-form
      const errors = form.formState.errors;
      
      // Find first error message
      const findFirstError = (errorObj: any): string | null => {
        for (const key in errorObj) {
          if (errorObj[key]?.message) {
            return errorObj[key].message;
          }
          if (typeof errorObj[key] === 'object' && errorObj[key] !== null) {
            const nested = findFirstError(errorObj[key]);
            if (nested) return nested;
          }
        }
        return null;
      };
      
      const firstError = findFirstError(errors);
      
      if (firstError) {
        toast({
          variant: "destructive",
          title: "Erreur de validation",
          description: firstError,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur de validation",
          description: "Veuillez remplir tous les champs requis",
        });
      }
      return;
    }

    setSubmitting(true);

    try {
      // Get validated data from form (already validated by react-hook-form with Zod)
      const data = form.getValues();

      // Ensure selectedAddressId is a string
      if (data.jobDetails.selectedAddressId && typeof data.jobDetails.selectedAddressId !== 'string') {
        data.jobDetails.selectedAddressId = String(data.jobDetails.selectedAddressId);
      }

      // Additional Zod validation as a safety check
      const validation = jobFormSchema.safeParse(data);
      if (!validation.success) {
        console.error("Validation errors:", validation.error.issues);
        const errors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          errors[path] = issue.message;
        });
        
        // Set errors in form - react-hook-form will handle nested paths automatically
        Object.entries(errors).forEach(([path, message]) => {
          const pathArray = path.split(".");
          if (pathArray.length === 2) {
            // Use type assertion for nested paths
            form.setError(pathArray as any, { message });
          }
        });
        
        // Show first error
        const firstError = Object.values(errors)[0];
        if (firstError) {
          toast({
            variant: "destructive",
            title: "Erreur de validation",
            description: firstError,
          });
        }
        setSubmitting(false);
        return;
      }

      // Use validated data
      const validatedData = validation.data;

      const jobData: CreateJobData = {
        title: validatedData.jobDetails.title,
        description: validatedData.jobDetails.description,
        service_id: validatedData.jobDetails.serviceId,
        preferred_date: validatedData.scheduleBudget.preferredDate,
        preferred_time_start: validatedData.scheduleBudget.preferredTimeStart || undefined,
        preferred_time_end: validatedData.scheduleBudget.preferredTimeEnd || undefined,
        is_flexible: validatedData.scheduleBudget.isFlexible,
        estimated_duration: validatedData.scheduleBudget.estimatedDuration,
        customer_budget: validatedData.scheduleBudget.customerBudget,
        currency: validatedData.scheduleBudget.currency,
        address_id: validatedData.jobDetails.selectedAddressId,
        max_applications: validatedData.scheduleBudget.maxApplications,
        requirements: validatedData.jobDetails.requirements || undefined,
        images: validatedData.jobDetails.images?.length > 0 ? validatedData.jobDetails.images : undefined,
      };

      const result = await createJob(jobData);

      if (result.success) {
        toast({
          variant: "success",
          title: t("success.jobPosted"),
        });
        router.push("/customer/my-jobs");
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.error || t("errors.jobCreationFailed"),
        });
      }
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: t("errors.jobCreationFailed"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] shadow-sm border-b border-[var(--color-border)]">
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
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
        </div>

        {/* Steps */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                  <div className="relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                        currentStep >= step.id
                          ? `bg-gradient-to-r ${step.color} text-white scale-110`
                          : "bg-white border-2 border-[var(--color-border)] text-[var(--color-text-secondary)]"
                      }`}
                    >
                      {currentStep > step.id ? <Check className="h-6 w-6" /> : step.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm sm:text-base ${currentStep >= step.id ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}>
                      {t(`steps.${step.id === 1 ? "jobDetails" : step.id === 2 ? "scheduleBudget" : "reviewPost"}`)}
                    </h3>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`hidden sm:block flex-1 h-0.5 mx-4 transition-all duration-300 ${currentStep > step.id ? `bg-gradient-to-r ${step.color}` : "bg-[var(--color-border)]"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-[var(--color-surface)] shadow-xl rounded-2xl border border-[var(--color-border)]">
              
              {/* STEP 1 */}
              {currentStep === 1 && (
                <>
                  <CardHeader className="bg-[var(--color-info-light)] border-b border-[var(--color-border)]">
                    <CardTitle className="text-xl font-bold">{t("steps.jobDetails")}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* User Info */}
                    <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)] flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center overflow-hidden">
                        {user?.avatar_url && !avatarError ? (
                          <Image src={user.avatar_url} alt="Profile" width={64} height={64} className="w-full h-full object-cover" onError={() => setAvatarError(true)} />
                        ) : (
                          <User className="h-8 w-8 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{user?.first_name} {user?.last_name}</h4>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>{t("jobDetails.title")} *</Label>
                      <Input {...form.register("jobDetails.title")} className={errors.jobDetails?.title ? "border-red-500" : ""} />
                      {errors.jobDetails?.title && <p className="text-red-500 text-sm">{t("errors.titleRequired")}</p>}
                    </div>

                    <div className="space-y-3">
                      <Label>{t("jobDetails.description")} *</Label>
                      <textarea 
                        {...form.register("jobDetails.description")} 
                        rows={4} 
                        maxLength={5000}
                        className={`w-full p-3 border rounded-xl ${errors.jobDetails?.description ? "border-red-500" : "border-[var(--color-border)]"}`} 
                      />
                      <div className="flex items-center justify-end">
                        <p className={`text-xs ${
                          (formData.jobDetails?.description?.length || 0) < 80
                            ? "text-red-500"
                            : (formData.jobDetails?.description?.length || 0) >= 80 && (formData.jobDetails?.description?.length || 0) < 100
                            ? "text-orange-500"
                            : "text-[var(--color-text-secondary)]"
                        }`}>
                          {formData.jobDetails?.description?.length || 0} / 80 caractères minimum
                          {formData.jobDetails?.description && formData.jobDetails.description.length < 80 && (
                            <span className="ml-1">({80 - formData.jobDetails.description.length} restants)</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label>{t("jobDetails.category")} *</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className={`w-full justify-between ${errors.jobDetails?.categoryId ? "border-red-500" : ""}`}>
                              {formData.jobDetails?.categoryId ? categories.find(c => c.id === formData.jobDetails.categoryId)?.name_en : "Select category"}
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            {categories.map((category) => (
                              <DropdownMenuItem key={category.id} onClick={() => {
                                form.setValue("jobDetails.categoryId", category.id, { shouldValidate: true });
                                form.setValue("jobDetails.serviceId", 0);
                              }}>
                                {category.name_en}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {errors.jobDetails?.categoryId && <p className="text-red-500 text-sm">{t("errors.categoryRequired")}</p>}
                      </div>

                      <div className="space-y-3">
                        <Label>{t("jobDetails.service")} *</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className={`w-full justify-between ${errors.jobDetails?.serviceId ? "border-red-500" : ""}`} disabled={!formData.jobDetails?.categoryId}>
                              {formData.jobDetails?.serviceId ? services.find(s => s.id === formData.jobDetails.serviceId)?.name_en : "Select service"}
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            {filteredServices.map((service) => (
                              <DropdownMenuItem key={service.id} onClick={() => form.setValue("jobDetails.serviceId", service.id, { shouldValidate: true })}>
                                {service.name_en}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {errors.jobDetails?.serviceId && <p className="text-red-500 text-sm">{t("errors.serviceRequired")}</p>}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>{t("jobDetails.location")}</Label>
                      {addresses.length > 0 ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              <span className="truncate">
                                {formData.jobDetails?.selectedAddressId
                                  ? addresses.find(a => a.id === formData.jobDetails.selectedAddressId)?.street_address + ", " + addresses.find(a => a.id === formData.jobDetails.selectedAddressId)?.city
                                  : "Select location"}
                              </span>
                              <MapPin className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            {addresses.map((address) => (
                              <DropdownMenuItem key={address.id} onClick={() => form.setValue("jobDetails.selectedAddressId", String(address.id))}>
                                {address.label} - {address.street_address}, {address.city}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <div className="p-4 border border-dashed rounded text-center">
                          <p className="text-sm mb-2">No addresses found.</p>
                          <Button variant="outline" size="sm" onClick={() => router.push("/customer/profile?section=addresses")}>Add Address</Button>
                        </div>
                      )}
                      {/* Pas d'erreur affichée ici car on suppose l'auto-selection */}
                    </div>

                    <div className="space-y-3">
                      <Label>{t("jobDetails.requirements")}</Label>
                      <textarea {...form.register("jobDetails.requirements")} rows={3} className="w-full p-3 border rounded-xl border-[var(--color-border)]" placeholder={t("jobDetails.requirementsPlaceholder")} />
                    </div>
                  </CardContent>
                </>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <>
                  <CardHeader className="bg-[var(--color-success-light)] border-b border-[var(--color-border)]">
                    <CardTitle className="text-xl font-bold">{t("steps.scheduleBudget")}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label>{t("scheduleBudget.preferredDate")} *</Label>
                        <Input type="date" {...form.register("scheduleBudget.preferredDate")} className={errors.scheduleBudget?.preferredDate ? "border-red-500" : ""} min={new Date().toISOString().split("T")[0]} />
                        {errors.scheduleBudget?.preferredDate && <p className="text-red-500 text-sm">{t("errors.dateRequired")}</p>}
                      </div>
                      <div className="space-y-3 flex items-center pt-8 gap-2">
                        <input type="checkbox" id="isFlexible" {...form.register("scheduleBudget.isFlexible")} className="w-4 h-4" />
                        <Label htmlFor="isFlexible">{t("scheduleBudget.timeFlexible")}</Label>
                      </div>
                    </div>

                    {!formData.scheduleBudget?.isFlexible && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label>{t("scheduleBudget.preferredTime")} (Start)</Label>
                          <Input type="time" {...form.register("scheduleBudget.preferredTimeStart")} />
                        </div>
                        <div className="space-y-3">
                          <Label>{t("scheduleBudget.preferredTime")} (End)</Label>
                          <Input type="time" {...form.register("scheduleBudget.preferredTimeEnd")} />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label>{t("scheduleBudget.estimatedDuration")} *</Label>
                        <Input type="number" step="0.5" {...form.register("scheduleBudget.estimatedDuration")} className={errors.scheduleBudget?.estimatedDuration ? "border-red-500" : ""} />
                        {errors.scheduleBudget?.estimatedDuration && <p className="text-red-500 text-sm">{t("errors.durationGreaterThanZero")}</p>}
                      </div>
                      <div className="space-y-3">
                        <Label>{t("scheduleBudget.maxApplications")} *</Label>
                        <Input type="number" min="1" max="20" {...form.register("scheduleBudget.maxApplications")} className={errors.scheduleBudget?.maxApplications ? "border-red-500" : ""} />
                        {errors.scheduleBudget?.maxApplications && <p className="text-red-500 text-sm">{t("errors.maxApplicationsGreaterThanZero")}</p>}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>{t("scheduleBudget.budget")} *</Label>
                      <div className="flex gap-2">
                        <Input type="number" step="0.01" {...form.register("scheduleBudget.customerBudget")} className={`flex-1 ${errors.scheduleBudget?.customerBudget ? "border-red-500" : ""}`} />
                        <Button variant="outline" className="w-20">{formData.scheduleBudget?.currency}</Button>
                      </div>
                      {errors.scheduleBudget?.customerBudget && <p className="text-red-500 text-sm">{t("errors.budgetGreaterThanZero")}</p>}
                    </div>
                  </CardContent>
                </>
              )}

              {/* STEP 3 - REVIEW */}
              {currentStep === 3 && (
                <>
                  <CardHeader className="bg-[var(--color-purple-light)] border-b border-[var(--color-border)]">
                    <CardTitle className="text-xl font-bold">{t("review.title")}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="bg-[var(--color-surface)] border rounded-xl p-4">
                      <h4 className="font-bold text-lg mb-2">{formData.jobDetails?.title}</h4>
                      <p className="text-sm text-gray-500 mb-3">{formData.jobDetails?.description}</p>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {categories.find(c => c.id === formData.jobDetails?.categoryId)?.name_en}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {services.find(s => s.id === formData.jobDetails?.serviceId)?.name_en}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-xl p-4">
                        <h4 className="font-bold mb-2 flex items-center gap-2"><Calendar className="h-4 w-4" /> Schedule</h4>
                        <p className="text-sm">
                          <strong>Date:</strong> {formData.scheduleBudget?.preferredDate}
                        </p>
                        <p className="text-sm">
                          <strong>Duration:</strong> {String(formData.scheduleBudget?.estimatedDuration)} hours
                        </p>
                      </div>
                      <div className="border rounded-xl p-4">
                        <h4 className="font-bold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Budget</h4>
                        <p className="text-2xl font-bold text-green-600">
                          {String(formData.scheduleBudget?.customerBudget)} {String(formData.scheduleBudget?.currency)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Max applications: {String(formData.scheduleBudget?.maxApplications)}
                        </p>
                      </div>
                    </div>

                    <div className="border rounded-xl p-4">
                      <h4 className="font-bold mb-2 flex items-center gap-2"><MapPin className="h-4 w-4" /> Location</h4>
                      <p className="text-sm">
                        {addresses.find(a => a.id === formData.jobDetails?.selectedAddressId)?.street_address}, 
                        {addresses.find(a => a.id === formData.jobDetails?.selectedAddressId)?.city}
                      </p>
                    </div>
                  </CardContent>
                </>
              )}

              <CardFooter className="flex gap-4 p-6 border-t">
                <Button variant="outline" onClick={goToPreviousStep} disabled={currentStep === 1 || loading}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Button>
                {currentStep < STEPS.length ? (
                  <Button onClick={goToNextStep} disabled={loading} className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white">
                    Next <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white">
                    {submitting ? "Publishing..." : "Publish Job"} <Sparkles className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-lg rounded-2xl border">
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">Our support team is here to help.</p>
                <Button variant="outline" className="w-full" onClick={() => setShowContactDialog(true)}>Contact Support</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ContactSupportDialog isOpen={showContactDialog} onClose={() => setShowContactDialog(false)} />
    </div>
  );
}