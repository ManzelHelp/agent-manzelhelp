"use client";

import React, { useState, useEffect } from "react";
import {
  getServiceDetails,
  updateTaskerService,
  ServiceDetailsData,
} from "@/actions/services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Euro,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { serviceCategories } from "@/lib/categories";

export default function TaskerServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ServiceDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: 0,
    pricing_type: "fixed" as "fixed" | "hourly" | "per_item",
    minimum_duration: 0,
    service_area: "",
    service_status: "active" as ServiceStatus,
  });

  useEffect(() => {
    const fetchServiceData = async () => {
      if (!params["service-id"] || typeof params["service-id"] !== "string") {
        setError("Invalid service ID");
        setLoading(false);
        return;
      }

      try {
        const result = await getServiceDetails(params["service-id"]);

        if (!result.success) {
          setError(result.error || "Failed to load service");
          setLoading(false);
          return;
        }

        const serviceData = result.data;
        if (!serviceData) {
          setError("Service data not found");
          setLoading(false);
          return;
        }

        setData(serviceData);

        // Initialize edit form
        setEditForm({
          title: serviceData.title || "",
          description: serviceData.description || "",
          price: parseFloat(serviceData.price) || 0,
          pricing_type: serviceData.pricing_type || "fixed",
          minimum_duration: serviceData.minimum_duration || 0,
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
        setError("Failed to load the service. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [params]);

  const handleSave = async () => {
    if (!data) return;

    try {
      const result = await updateTaskerService(
        data.tasker_service_id,
        data.tasker_id,
        {
          title: editForm.title,
          description: editForm.description,
          price: editForm.price,
          pricing_type: editForm.pricing_type,
          minimum_duration: editForm.minimum_duration,
          service_area: editForm.service_area
            ? { address: editForm.service_area }
            : null,
          service_status: editForm.service_status,
        }
      );

      if (!result.success) {
        setError(result.error || "Failed to update service");
        return;
      }

      // Refresh data
      const refreshResult = await getServiceDetails(data.tasker_service_id);
      if (refreshResult.success && refreshResult.data) {
        setData(refreshResult.data);
      }

      setIsEditing(false);
    } catch (err) {
      console.error("Error updating service:", err);
      setError("Failed to update service. Please try again.");
    }
  };

  const handleCancel = () => {
    if (data) {
      setEditForm({
        title: data.title || "",
        description: data.description || "",
        price: parseFloat(data.price) || 0,
        pricing_type: data.pricing_type || "fixed",
        minimum_duration: data.minimum_duration || 0,
        service_area:
          typeof data.service_area === "string"
            ? data.service_area
            : data.service_area
            ? JSON.stringify(data.service_area)
            : "",
        service_status: data.service_status || "active",
      });
    }
    setIsEditing(false);
  };

  const getPricingDisplay = () => {
    if (!data) return "€0";

    if (data.pricing_type === "hourly") {
      return `€${data.price}/hr`;
    } else if (data.pricing_type === "per_item") {
      return `€${data.price}/item`;
    } else {
      return `€${data.price}`;
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

  // Get category information from local data
  const category = serviceCategories.find(
    (cat) => cat.id.toString() === data.category_id
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2 h-10 w-10 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Service Details
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Manage your service offer
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
                Edit
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white"
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  className="border-[var(--color-border)]"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
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
                        ? "Available"
                        : "Unavailable"}
                    </span>
                  </div>
                </div>
                <Badge className={getStatusColor(data.verification_status)}>
                  {getStatusIcon(data.verification_status)}
                  <span className="ml-1 capitalize">
                    {data.verification_status || "pending"}
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Service Title
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        Pricing Type
                      </label>
                      <select
                        value={editForm.pricing_type}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            pricing_type: e.target.value as
                              | "fixed"
                              | "hourly"
                              | "per_item",
                          })
                        }
                        className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                      >
                        <option value="fixed">Fixed Price</option>
                        <option value="hourly">Hourly Rate</option>
                        <option value="per_item">Per Item</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        {editForm.pricing_type === "hourly"
                          ? "Hourly Rate (€)"
                          : "Base Price (€)"}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        Minimum Duration (hours)
                      </label>
                      <input
                        type="number"
                        value={editForm.minimum_duration}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            minimum_duration: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        Service Area
                      </label>
                      <input
                        type="text"
                        value={editForm.service_area}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            service_area: e.target.value,
                          })
                        }
                        placeholder="e.g., Berlin, Germany"
                        className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="service_status"
                      checked={editForm.service_status === "active"}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          service_status: e.target.checked
                            ? "active"
                            : "paused",
                        })
                      }
                      className="h-4 w-4 text-[var(--color-secondary)] focus:ring-[var(--color-secondary)] border-[var(--color-border)] rounded"
                    />
                    <label
                      htmlFor="service_status"
                      className="text-sm text-[var(--color-text-primary)]"
                    >
                      Service is available for booking
                    </label>
                  </div>
                </div>
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
                          Listed on{" "}
                          {format(new Date(data.created_at), "MMMM d, yyyy")}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Euro className="h-5 w-5 text-[var(--color-secondary)]" />
                        <span className="text-2xl font-bold text-[var(--color-secondary)]">
                          {getPricingDisplay()}
                        </span>
                      </div>
                      {data.minimum_duration && (
                        <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
                          <Clock className="h-4 w-4" />
                          <span>Min. {data.minimum_duration}h</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Category */}
                  <div className="flex items-center gap-3 p-3 bg-[var(--color-accent)]/20 rounded-lg">
                    <div className="h-8 w-8 bg-[var(--color-secondary)] rounded-lg flex items-center justify-center">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {category?.name_en || "Service"}
                      </p>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {category?.name_en || "Category"}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-[var(--color-text-primary)]">
                      Description
                    </h3>
                    <p className="text-[var(--color-text-secondary)] leading-relaxed">
                      {data.description || "No description available"}
                    </p>
                  </div>

                  {/* Service Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.service_area && (
                      <div className="flex items-center gap-3 p-3 bg-[var(--color-accent)]/20 rounded-lg">
                        <MapPin className="h-5 w-5 text-[var(--color-secondary)] flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            Service Area
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {typeof data.service_area === "string"
                              ? data.service_area
                              : data.service_area
                              ? JSON.stringify(data.service_area)
                              : "Area not specified"}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-[var(--color-accent)]/20 rounded-lg">
                      <Clock className="h-5 w-5 text-[var(--color-secondary)] flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          Pricing Type
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {data.pricing_type === "hourly"
                            ? "Hourly Rate"
                            : data.pricing_type === "per_item"
                            ? "Per Item"
                            : "Fixed Price"}
                        </p>
                      </div>
                    </div>
                  </div>
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
              className="flex-1 border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Service
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
