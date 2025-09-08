import React from "react";
import Link from "next/link";
import { getUserProfileAction } from "@/actions/auth";
import { createClient } from "@/supabase/server";
import { TaskerService, Service, ServiceCategory } from "@/types/supabase";
import {
  Plus,
  Edit,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  Euro,
  Star,
  Calendar,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

interface ServiceWithDetails extends TaskerService {
  service: Service | null;
  category: ServiceCategory | null;
}

async function getTaskerServices(
  taskerId: string
): Promise<ServiceWithDetails[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasker_services")
    .select(
      `
      *,
      service:service_id (
        *,
        category:category_id (*)
      )
    `
    )
    .eq("tasker_id", taskerId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}

export default async function MyServicesPage() {
  // Get current user (tasker)
  const { user } = await getUserProfileAction();
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <h2 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
          Not signed in
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-4">
          Please log in to view your services.
        </p>
        <Link
          href="/login"
          className="px-4 py-2 rounded-md bg-[var(--color-secondary)] text-white font-medium hover:bg-[var(--color-secondary-dark)] transition-all"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // Fetch tasker's services with details
  const services = await getTaskerServices(user.id);

  const getPricingDisplay = (service: TaskerService) => {
    if (service.pricing_type === "hourly") {
      return `€${service.hourly_rate}/hr`;
    } else if (service.pricing_type === "per_item") {
      return `€${service.base_price}/item`;
    } else {
      return `€${service.base_price}`;
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

  return (
    <main className="w-full min-h-[100dvh] bg-[var(--color-bg)] flex flex-col items-center px-0 sm:px-4 py-0">
      {/* Explanation & Quick Steps */}
      <section className="w-full max-w-2xl px-4 pt-6 pb-2">
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-md p-4 sm:p-6 border border-[var(--color-border)] mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            Manage Your Services
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-4 text-sm sm:text-base">
            Here you can view, add, and manage all the services you offer as a
            tasker. Keeping your service list up to date helps customers find
            and book you more easily.
          </p>
          <div>
            <h2 className="font-semibold text-[var(--color-text-primary)] mb-1 text-base">
              Quick Steps:
            </h2>
            <ol className="list-decimal list-inside space-y-1 text-[var(--color-text-secondary)] text-sm sm:text-base">
              <li>
                Click{" "}
                <span className="font-semibold text-[var(--color-secondary-dark)]">
                  Add New Service
                </span>{" "}
                to create a new offer.
              </li>
              <li>Review your existing services below.</li>
              <li>Edit or update your offers to keep them attractive.</li>
              <li>Remove services you no longer provide.</li>
            </ol>
          </div>
        </div>
        <div className="flex justify-end mb-2">
          <Link
            href="./post-service"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-secondary)] text-white font-semibold text-base shadow hover:bg-[var(--color-secondary-dark)] transition-all min-h-[44px] mobile-button whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add New Service</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full max-w-2xl px-4 pb-8 flex-1 flex flex-col">
        <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)] mt-6 mb-3 sm:mb-4">
          Your Service Offers
        </h3>
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-16 bg-[var(--color-surface)] rounded-xl shadow-inner border border-dashed border-[var(--color-border)] mt-2">
            <span className="text-6xl mb-4">🛠️</span>
            <h2 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
              No services yet
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-4 max-w-xs text-center">
              You haven't added any services. Start by creating your first
              service offer!
            </p>
            <Link
              href="./post-service"
              className="px-5 py-2.5 rounded-lg bg-[var(--color-secondary)] text-white font-semibold hover:bg-[var(--color-secondary-dark)] transition-all text-base shadow"
            >
              Add Service
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 mt-2">
            {services.map((serviceWithDetails) => (
              <div
                key={serviceWithDetails.id}
                className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Service Header */}
                <div className="p-4 border-b border-[var(--color-border)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-[var(--color-text-primary)] text-base sm:text-lg truncate">
                          {serviceWithDetails.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          {serviceWithDetails.is_available ? (
                            <Eye className="h-4 w-4 text-[var(--color-success)]" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-[var(--color-text-secondary)]" />
                          )}
                        </div>
                      </div>

                      {/* Service Category */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 bg-[var(--color-secondary)] rounded-md flex items-center justify-center">
                          <Star className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          {serviceWithDetails.service?.name_en ||
                            "Unknown Service"}{" "}
                          •{" "}
                          {serviceWithDetails.category?.name_en ||
                            "Unknown Category"}
                        </span>
                      </div>

                      {/* Service Area */}
                      {serviceWithDetails.service_area && (
                        <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">
                            {serviceWithDetails.service_area}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Price Display */}
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <Euro className="h-4 w-4 text-[var(--color-secondary)]" />
                        <span className="font-bold text-[var(--color-secondary)] text-lg">
                          {getPricingDisplay(serviceWithDetails)}
                        </span>
                      </div>
                      {serviceWithDetails.minimum_duration && (
                        <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                          <Clock className="h-3 w-3" />
                          <span>
                            Min {serviceWithDetails.minimum_duration}h
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Service Content */}
                <div className="p-4">
                  {/* Description */}
                  <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-4 leading-relaxed">
                    {serviceWithDetails.description ||
                      "No description available"}
                  </p>

                  {/* Service Details */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {serviceWithDetails.created_at
                          ? format(
                              new Date(serviceWithDetails.created_at),
                              "MMM d, yyyy"
                            )
                          : "Unknown date"}
                      </span>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-text-secondary)] font-medium text-xs">
                      {serviceWithDetails.pricing_type === "hourly"
                        ? "Hourly Rate"
                        : serviceWithDetails.pricing_type === "per_item"
                        ? "Per Item"
                        : "Fixed Price"}
                    </span>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          serviceWithDetails.verification_status
                        )}`}
                      >
                        {serviceWithDetails.verification_status || "pending"}
                      </span>
                      {serviceWithDetails.is_promoted && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-[var(--color-secondary)] text-white">
                          Promoted
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`./my-services/${serviceWithDetails.id}`}
                        className="p-2 rounded-lg bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)] transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button className="p-2 rounded-lg border border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
