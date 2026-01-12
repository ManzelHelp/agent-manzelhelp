"use client";

import React, { useState, useEffect } from "react";
import {
  getServiceDetails,
  updateTaskerService,
  deleteTaskerService,
  ServiceDetailsData,
} from "@/actions/services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/BackButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import type { ServiceStatus } from "@/types/supabase";
import {
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { getAllCategoryHierarchies } from "@/lib/categories";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateServiceSchema } from "@/lib/schemas/services";
import { cn } from "@/lib/utils";

export default function TaskerServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("services");
  const [data, setData] = useState<ServiceDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // React Hook Form for editing
  const editForm = useForm({
    resolver: zodResolver(updateServiceSchema),
    mode: "onChange",
    defaultValues: {
    title: "",
    description: "",
    price: 0,
    pricing_type: "fixed" as "fixed" | "hourly" | "per_item",
      minimum_duration: undefined as number | undefined,
    service_area: "",
    service_status: "active" as ServiceStatus,
    },
  });

  useEffect(() => {
    const fetchServiceData = async () => {
      if (!params["service-id"] || typeof params["service-id"] !== "string") {
        setError(t("errors.invalidServiceId", { default: "Invalid service ID" }));
        setLoading(false);
        return;
      }

      try {
        const result = await getServiceDetails(params["service-id"]);

        if (!result.success) {
          setError(result.error || t("errors.loadFailed"));
          setLoading(false);
          return;
        }

        const serviceData = result.data;
        if (!serviceData) {
          setError(t("errors.serviceNotFound", { default: "Service data not found" }));
          setLoading(false);
          return;
        }

        setData(serviceData);

        // Initialize edit form with react-hook-form
        editForm.reset({
          title: serviceData.title || "",
          description: serviceData.description || "",
          price: parseFloat(serviceData.price) || 0,
          pricing_type: serviceData.pricing_type || "fixed",
          minimum_duration: serviceData.minimum_duration || undefined,
          service_area:
            typeof serviceData.service_area === "string"
              ? serviceData.service_area
              : serviceData.service_area
              ? JSON.stringify(serviceData.service_area)
              : "",
          service_status: serviceData.service_status || "active",
        });
      } catch (err) {
        console.error("Error fetching service data:", err);
        setError(t("errors.loadServiceFailed", { default: "Failed to load the service. Please try again later." }));
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [params]);

  const handleSave = async (formData: any) => {
    if (!data) {
      console.error("No data available");
      return;
    }

    console.log("handleSave called with:", formData);

    try {
      const result = await updateTaskerService(
        data.tasker_service_id,
        data.tasker_id,
        {
          title: formData.title,
          description: formData.description,
          price: formData.price,
          pricing_type: formData.pricing_type,
          minimum_duration: formData.minimum_duration,
          service_area: formData.service_area
            ? { address: formData.service_area }
            : null,
          service_status: formData.service_status,
        }
      );

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.error || "Failed to update service",
        });
        return;
      }

      // Refresh data
      const refreshResult = await getServiceDetails(data.tasker_service_id);
      if (refreshResult.success && refreshResult.data) {
        setData(refreshResult.data);
        // Reset form with new data
        editForm.reset({
          title: refreshResult.data.title || "",
          description: refreshResult.data.description || "",
          price: parseFloat(refreshResult.data.price) || 0,
          pricing_type: refreshResult.data.pricing_type || "fixed",
          minimum_duration: refreshResult.data.minimum_duration || undefined,
          service_area:
            typeof refreshResult.data.service_area === "string"
              ? refreshResult.data.service_area
              : refreshResult.data.service_area
              ? JSON.stringify(refreshResult.data.service_area)
              : "",
          service_status: refreshResult.data.service_status || "active",
        });
      }

      toast({
        variant: "success",
        title: "Succès",
        description: "Le service a été mis à jour avec succès.",
      });

      setIsEditing(false);
    } catch (err) {
      console.error("Error updating service:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Failed to update service. Please try again.",
      });
    }
  };

  const handleCancel = () => {
    if (data) {
      editForm.reset({
        title: data.title || "",
        description: data.description || "",
        price: parseFloat(data.price) || 0,
        pricing_type: data.pricing_type || "fixed",
        minimum_duration: data.minimum_duration || undefined,
        service_area:
          typeof data.service_area === "string"
            ? data.service_area
            : data.service_area
            ? JSON.stringify(data.service_area)
            : "",
        service_status: data.service_status || "active",
      });
    }
    editForm.clearErrors();
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!data) return;

    setIsDeleting(true);
    try {
      const result = await deleteTaskerService(
        data.tasker_service_id,
        data.tasker_id
      );

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.error || "Failed to delete service",
        });
        setIsDeleting(false);
        return;
      }

      toast({
        variant: "success",
        title: "Succès",
        description: "Le service a été supprimé avec succès.",
      });

      setShowDeleteDialog(false);
      router.push("/tasker/my-services");
    } catch (err) {
      console.error("Error deleting service:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Failed to delete service. Please try again.",
      });
      setIsDeleting(false);
    }
  };

  const getPricingDisplay = () => {
    if (!data) return "0 MAD";

    if (data.pricing_type === "hourly") {
      return `${data.price} MAD/hr`;
    } else if (data.pricing_type === "per_item") {
      return `${data.price} MAD/item`;
    } else {
      return `${data.price} MAD`;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "under_review":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "under_review":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "verified":
        return t("verified", { default: "Verified" });
      case "pending":
        return t("pending", { default: "Pending" });
      case "rejected":
        return t("rejected", { default: "Rejected" });
      case "under_review":
        return t("underReview", { default: "Under Review" });
      default:
        return t("pending", { default: "Pending" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="animate-pulse space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-[var(--color-accent)] rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-6 bg-[var(--color-accent)] rounded w-32"></div>
                <div className="h-4 bg-[var(--color-accent)] rounded w-24"></div>
              </div>
            </div>

            {/* Service Card Skeleton */}
            <Card className="overflow-hidden">
              <div className="h-48 bg-[var(--color-accent)]"></div>
              <CardContent className="p-6 space-y-4">
                <div className="h-8 bg-[var(--color-accent)] rounded w-3/4"></div>
                <div className="h-4 bg-[var(--color-accent)] rounded w-full"></div>
                <div className="h-4 bg-[var(--color-accent)] rounded w-2/3"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="text-center p-8">
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <AlertCircle className="h-16 w-16 text-[var(--color-error)]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                  Oops!
                </h2>
                <p className="text-[var(--color-text-secondary)]">
                  {error || "Service not found"}
                </p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)]"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get category and service information from local data
  const hierarchies = getAllCategoryHierarchies();
  const categoryInfo = hierarchies.find(
    ({ parent }) => parent.id.toString() === data.category_id
  );
  const category = categoryInfo?.parent;
  const service = categoryInfo?.subcategories.find(
    (s) => s.id === data.service_id
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BackButton className="p-2 h-10 w-10 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]" />
            <div>
              <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {t("serviceDetails")}
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {t("manageServiceOffer")}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                {t("actions.edit", { default: "Edit" })}
              </Button>
            ) : (
              <>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Save button clicked, form errors:", editForm.formState.errors);
                    editForm.handleSubmit(handleSave)();
                  }}
                  className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white"
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t("actions.save", { default: "Enregistrer" })}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  className="border-[var(--color-border)]"
                >
                  <X className="h-4 w-4 mr-2" />
                  {t("actions.cancel", { default: "Annuler" })}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Service Status Card */}
          <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {data.service_status === "active" ? (
                      <Eye className="h-5 w-5 text-[var(--color-success)]" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-[var(--color-text-secondary)]" />
                    )}
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {data.service_status === "active"
                        ? t("available", { default: "Available" })
                        : t("unavailable", { default: "Unavailable" })}
                    </span>
                  </div>
                </div>
                <Badge className={getStatusColor(data.verification_status)}>
                  {getStatusIcon(data.verification_status)}
                  <span className="ml-1">
                    {getStatusLabel(data.verification_status)}
                  </span>
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Service Details Card */}
          <Card className="overflow-hidden border-[var(--color-border)] bg-[var(--color-surface)]">
            {/* Service Image */}
            {data.portfolio_images &&
              Array.isArray(data.portfolio_images) &&
              data.portfolio_images.length > 0 && (
                <div className="relative h-48 w-full">
                  <Image
                    src={data.portfolio_images[0] || "/placeholder-service.jpg"}
                    alt={data.title || "Service image"}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              )}

            <CardContent className="p-6">
              {isEditing ? (
                <form id="edit-service-form" onSubmit={editForm.handleSubmit(handleSave)} className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Service Title *
                    </Label>
                    <Input
                      id="title"
                      {...editForm.register("title")}
                      className={cn(
                        "w-full",
                        editForm.formState.errors.title
                          ? "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
                          : ""
                      )}
                    />
                    {editForm.formState.errors.title && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-4 w-4" />
                        {editForm.formState.errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      {t("description", { default: "Description" })} *
                    </Label>
                    <textarea
                      id="description"
                      {...editForm.register("description")}
                      rows={4}
                      className={cn(
                        "w-full p-3 border rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] resize-none",
                        editForm.formState.errors.description
                          ? "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
                          : "border-[var(--color-border)]"
                      )}
                    />
                    {editForm.formState.errors.description && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-4 w-4" />
                        {editForm.formState.errors.description.message}
                      </p>
                    )}
                    {!editForm.formState.errors.description && editForm.watch("description") && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {editForm.watch("description").length} caractères
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pricing_type" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        {t("pricingType.title", { default: "Pricing Type" })} *
                      </Label>
                      <select
                        id="pricing_type"
                        {...editForm.register("pricing_type")}
                        className={cn(
                          "w-full p-3 border rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]",
                          editForm.formState.errors.pricing_type
                            ? "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
                            : "border-[var(--color-border)]"
                        )}
                      >
                        <option value="fixed">{t("pricingType.fixed", { default: "Fixed" })}</option>
                        <option value="hourly">{t("pricingType.hourly", { default: "Hourly" })}</option>
                        <option value="per_item">{t("pricingType.perItem", { default: "Per Item" })}</option>
                      </select>
                      {editForm.formState.errors.pricing_type && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                          <AlertCircle className="h-4 w-4" />
                          {editForm.formState.errors.pricing_type.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="price" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        {editForm.watch("pricing_type") === "hourly"
                          ? t("pricingType.hourlyWithCurrency", { default: "Hourly Rate (MAD)" })
                          : t("pricingType.basePrice", { default: "Base Price (MAD)" })} *
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        {...editForm.register("price", { valueAsNumber: true })}
                        className={cn(
                          "w-full",
                          editForm.formState.errors.price
                            ? "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
                            : ""
                        )}
                      />
                      {editForm.formState.errors.price && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                          <AlertCircle className="h-4 w-4" />
                          {editForm.formState.errors.price.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minimum_duration" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        {t("minimumDuration", { default: "Minimum Duration (hours)" })}
                      </Label>
                      <Input
                        id="minimum_duration"
                        type="number"
                        {...editForm.register("minimum_duration", { valueAsNumber: true })}
                        className={cn(
                          "w-full",
                          editForm.formState.errors.minimum_duration
                            ? "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
                            : ""
                        )}
                      />
                      {editForm.formState.errors.minimum_duration && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                          <AlertCircle className="h-4 w-4" />
                          {editForm.formState.errors.minimum_duration.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="service_area" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        {t("serviceArea", { default: "Service Area" })}
                      </Label>
                      <Input
                        id="service_area"
                        type="text"
                        {...editForm.register("service_area")}
                        placeholder={t("serviceAreaPlaceholder", { default: "e.g., Berlin, Germany" })}
                        className={cn(
                          "w-full",
                          editForm.formState.errors.service_area
                            ? "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
                            : ""
                        )}
                      />
                      {editForm.formState.errors.service_area && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                          <AlertCircle className="h-4 w-4" />
                          {editForm.formState.errors.service_area.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="service_status"
                        name="service_status"
                        checked={editForm.watch("service_status") === "active"}
                        onChange={(e) => {
                          const newValue = e.target.checked ? "active" : "paused";
                          editForm.setValue("service_status", newValue, { 
                            shouldValidate: true,
                            shouldDirty: true 
                          });
                        }}
                        className="h-4 w-4 text-[var(--color-secondary)] focus:ring-[var(--color-secondary)] border-[var(--color-border)] rounded"
                      />
                      <Label
                        htmlFor="service_status"
                        className="text-sm text-[var(--color-text-primary)]"
                      >
                        {t("serviceAvailableForBooking", { default: "Service is available for booking" })}
                      </Label>
                    </div>
                    {/* Hidden input pour react-hook-form */}
                    <input
                      type="hidden"
                      {...editForm.register("service_status")}
                    />
                    {editForm.formState.errors.service_status && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-4 w-4" />
                        {editForm.formState.errors.service_status.message}
                      </p>
                    )}
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Header with Title and Price */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        {data.title}
                      </h2>
                      <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {t("listedOn", { default: "Listed on" })}{" "}
                          {format(new Date(data.created_at), "MMMM d, yyyy")}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-[var(--color-secondary)]" />
                        <span className="text-2xl font-bold text-[var(--color-secondary)]">
                          {getPricingDisplay()}
                        </span>
                      </div>
                      {data.minimum_duration && (
                        <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
                          <Clock className="h-4 w-4" />
                          <span>{t("minDuration", { duration: data.minimum_duration, default: `Min. ${data.minimum_duration}h` })}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Category and Service */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-[var(--color-accent)]/20 rounded-lg">
                    <div className="h-8 w-8 bg-[var(--color-secondary)] rounded-lg flex items-center justify-center">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {t("category", { default: "Category" })}
                        </p>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          {data.category_name_en || category?.name_en || t("unknownCategory", { default: "Unknown Category" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[var(--color-accent)]/20 rounded-lg">
                      <div className="h-8 w-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {t("service", { default: "Service" })}
                        </p>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          {service?.name_en || `Service ID: ${data.service_id}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-[var(--color-text-primary)]">
                      {t("description", { default: "Description" })}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] leading-relaxed">
                      {data.description || t("noDescription", { default: "Aucune description disponible" })}
                    </p>
                  </div>

                  {/* Service Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.service_area && (
                      <div className="flex items-center gap-3 p-3 bg-[var(--color-accent)]/20 rounded-lg">
                        <MapPin className="h-5 w-5 text-[var(--color-secondary)] flex-shrink-0" />
                        <div>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {t("serviceArea", { default: "Service Area" })}
                          </p>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {typeof data.service_area === "string"
                              ? data.service_area
                              : data.service_area
                              ? JSON.stringify(data.service_area)
                              : t("areaNotSpecified", { default: "Area not specified" })}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-[var(--color-accent)]/20 rounded-lg">
                      <Clock className="h-5 w-5 text-[var(--color-secondary)] flex-shrink-0" />
                      <div>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {t("pricingType.title", { default: "Pricing Type" })}
                        </p>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          {data.pricing_type === "hourly"
                            ? t("pricingType.hourly", { default: "Hourly" })
                            : data.pricing_type === "per_item"
                            ? t("pricingType.perItem", { default: "Per Item" })
                            : t("pricingType.fixed", { default: "Fixed" })}
                        </p>
                      </div>
                    </div>

                    {data.minimum_duration > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-[var(--color-accent)]/20 rounded-lg">
                        <Clock className="h-5 w-5 text-[var(--color-secondary)] flex-shrink-0" />
                        <div>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {t("minimumDuration", { default: "Minimum Duration" })}
                          </p>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {data.minimum_duration} {t("hours", { default: "heures" })}
                          </p>
                        </div>
                      </div>
                    )}

                    {data.extra_fees && data.extra_fees > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-[var(--color-accent)]/20 rounded-lg">
                        <DollarSign className="h-5 w-5 text-[var(--color-secondary)] flex-shrink-0" />
                        <div>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {t("extraFees", { default: "Extra Fees" })}
                          </p>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {data.extra_fees} MAD
                          </p>
                        </div>
                      </div>
                    )}

                    {data.service_radius_km > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-[var(--color-accent)]/20 rounded-lg">
                        <MapPin className="h-5 w-5 text-[var(--color-secondary)] flex-shrink-0" />
                        <div>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {t("serviceRadius", { default: "Rayon de service" })}
                          </p>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {data.service_radius_km} km
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-[var(--color-accent)]/20 rounded-lg">
                      <Calendar className="h-5 w-5 text-[var(--color-secondary)] flex-shrink-0" />
                      <div>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {t("lastUpdated", { default: "Dernière mise à jour" })}
                        </p>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          {format(new Date(data.updated_at), "MMMM d, yyyy 'at' HH:mm")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Images Gallery */}
                  {data.portfolio_images &&
                    Array.isArray(data.portfolio_images) &&
                    data.portfolio_images.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-[var(--color-text-primary)]">
                          {t("portfolioImages", { default: "Portfolio Images" })} ({data.portfolio_images.length})
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {data.portfolio_images.map((image, index) => (
                            <div
                              key={index}
                              className="relative h-32 w-full rounded-lg overflow-hidden border border-[var(--color-border)]"
                            >
                              <Image
                                src={image || "/placeholder-service.jpg"}
                                alt={`${data.title} - Image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Promotion Status - Note: promotion data not available in service_details_view */}
          {/* This section would need to be implemented separately if promotion data is needed */}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="flex-1 border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("deleteService", { default: "Delete Service" })}
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("deleteService", { default: "Delete Service" })}</DialogTitle>
              <DialogDescription>
                {t("deleteServiceConfirmation.description", {
                  default: "Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible. Si des réservations sont actives, le service ne peut pas être supprimé."
                })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                {t("deleteServiceConfirmation.cancel", { default: "Annuler" })}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    {t("deleteServiceConfirmation.deleting", { default: "Suppression..." })}
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("deleteServiceConfirmation.confirm", { default: "Supprimer le Service" })}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
