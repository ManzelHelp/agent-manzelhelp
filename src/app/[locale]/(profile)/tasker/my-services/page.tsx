"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getUserProfileAction,
  hasTaskerCompletedProfileAction,
} from "@/actions/auth";
import { getTaskerServices, ServiceWithDetails } from "@/actions/services";
import {
  Plus,
  Edit,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Calendar,
  TrendingUp,
  Users,
  Award,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import ServiceDeleteButton from "@/components/services/ServiceDeleteButton";
import { User } from "@/types/supabase";

// Enhanced loading component with modern design
function ServicesLoadingSkeleton() {
  return (
    <div className="w-full max-w-4xl px-4 pb-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-[var(--color-secondary)]/10 to-[var(--color-secondary)]/5 rounded-3xl p-6 sm:p-8 border border-[var(--color-border)] animate-pulse">
          <div className="h-8 bg-[var(--color-accent)]/30 rounded-lg mb-3 w-2/3"></div>
          <div className="h-4 bg-[var(--color-accent)]/20 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-[var(--color-accent)]/20 rounded w-3/4"></div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-border)] animate-pulse"
          >
            <div className="h-6 bg-[var(--color-accent)]/30 rounded mb-2"></div>
            <div className="h-4 bg-[var(--color-accent)]/20 rounded w-3/4"></div>
          </div>
        ))}
      </div>

      {/* Services skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm animate-pulse"
          >
            <div className="h-48 bg-[var(--color-accent)]/20"></div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-6 bg-[var(--color-accent)]/30 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-[var(--color-accent)]/20 rounded mb-2 w-1/2"></div>
                </div>
                <div className="h-8 bg-[var(--color-accent)]/30 rounded-full w-20"></div>
              </div>
              <div className="h-4 bg-[var(--color-accent)]/20 rounded mb-4 w-full"></div>
              <div className="h-4 bg-[var(--color-accent)]/20 rounded mb-4 w-2/3"></div>
              <div className="flex items-center justify-between">
                <div className="h-6 bg-[var(--color-accent)]/30 rounded w-16"></div>
                <div className="flex gap-2">
                  <div className="h-10 w-10 bg-[var(--color-accent)]/30 rounded-xl"></div>
                  <div className="h-10 w-10 bg-[var(--color-accent)]/30 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Service card component
function ServiceCard({
  service,
  taskerId,
}: {
  service: ServiceWithDetails;
  taskerId: string;
}) {
  const getPricingDisplay = (service: ServiceWithDetails) => {
    if (service.pricing_type === "hourly") {
      return `MAD ${service.price}/hr`;
    } else if (service.pricing_type === "per_item") {
      return `MAD ${service.price}/item`;
    } else {
      return `MAD ${service.price}`;
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

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "verified":
        return "Verified";
      case "pending":
        return "Pending";
      case "rejected":
        return "Rejected";
      case "under_review":
        return "Under Review";
      default:
        return "Pending";
    }
  };

  return (
    <div className="group bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm hover:shadow-xl hover:border-[var(--color-secondary)]/30 transition-all duration-300 transform hover:-translate-y-1">
      {/* Service Image Placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-[var(--color-secondary)]/10 via-[var(--color-secondary)]/5 to-[var(--color-accent)]/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {service.service_status === "active" ? (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <Eye className="h-3 w-3" />
              <span>Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              <EyeOff className="h-3 w-3" />
              <span>Paused</span>
            </div>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-[var(--color-text-primary)] shadow-sm">
            <Star className="h-3 w-3 text-[var(--color-secondary)]" />
            <span>{service.category_name_en || "Service"}</span>
          </div>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-4 right-4">
          <div className="flex items-center gap-1 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
            <DollarSign className="h-4 w-4 text-[var(--color-secondary)]" />
            <span className="font-bold text-[var(--color-secondary)] text-lg">
              {getPricingDisplay(service)}
            </span>
          </div>
        </div>
      </div>

      {/* Service Content */}
      <div className="p-6">
        {/* Title and Status */}
        <div className="mb-4">
          <h3 className="font-bold text-[var(--color-text-primary)] text-lg mb-2 line-clamp-1 group-hover:text-[var(--color-secondary)] transition-colors">
            {service.title}
          </h3>

          {/* Service Area */}
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-3">
            <MapPin className="h-4 w-4 text-[var(--color-secondary)]" />
            <span className="truncate">
              {service.service_area && typeof service.service_area === "string"
                ? service.service_area
                : service.service_area
                ? "Multiple areas"
                : "Area not specified"}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3 mb-4 leading-relaxed">
          {service.description || "No description available"}
        </p>

        {/* Service Details */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {service.created_at
                  ? format(new Date(service.created_at), "MMM d, yyyy")
                  : "Unknown date"}
              </span>
            </div>
            {service.booking_count > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{service.booking_count} bookings</span>
              </div>
            )}
            {service.minimum_duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Min {service.minimum_duration}h</span>
              </div>
            )}
          </div>
        </div>

        {/* Status and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Verification Status Badge - Shows admin verification status */}
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(
                service.verification_status
              )}`}
              title={
                service.verification_status === "pending"
                  ? "En attente de vérification par l'admin"
                  : service.verification_status === "verified"
                  ? "Service vérifié et approuvé par l'admin"
                  : service.verification_status === "rejected"
                  ? "Service rejeté par l'admin"
                  : "Statut de vérification"
              }
            >
              {getStatusLabel(service.verification_status)}
            </span>
            {service.is_promoted && (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-dark)] text-white">
                <Sparkles className="h-3 w-3" />
                <span>Promoted</span>
              </span>
            )}
            <span className="px-3 py-1.5 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-text-secondary)] font-medium text-xs">
              {service.pricing_type === "hourly"
                ? "Hourly Rate"
                : service.pricing_type === "per_item"
                ? "Per Item"
                : "Fixed Price"}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href={`./my-services/${service.id}`}
              className="p-3 rounded-xl bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)] transition-all min-h-[44px] min-w-[44px] flex items-center justify-center shadow-sm hover:shadow-md group/btn"
              title="Edit service"
            >
              <Edit className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
            </Link>
            <ServiceDeleteButton serviceId={service.id} taskerId={taskerId} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Services list component with enhanced design
function ServicesList({ taskerId }: { taskerId: string }) {
  const [services, setServices] = useState<ServiceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [total, setTotal] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const fetchServices = useCallback(
    async (page: number = 0, append: boolean = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const result = await getTaskerServices(
          taskerId,
          ITEMS_PER_PAGE,
          page * ITEMS_PER_PAGE,
          !append
        );

        if (append) {
          setServices((prev) => [...prev, ...result.services]);
        } else {
          setServices(result.services);
        }

        setCurrentPage(page);
        setHasMore(result.hasMore);
        setTotal(result.total);
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Failed to load services");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [taskerId]
  );

  useEffect(() => {
    fetchServices(0);
  }, [fetchServices]);

  const handleLoadMore = () => {
    fetchServices(currentPage + 1, true);
  };

  if (loading) {
    return <ServicesLoadingSkeleton />;
  }

  try {
    // Calculate stats
    const activeServices = services.filter(
      (s) => s.service_status === "active"
    ).length;
    const totalBookings = services.reduce((sum, s) => sum + s.booking_count, 0);
    //  const promotedServices = services.filter((s) => s.is_promoted).length;
    const verifiedServices = services.filter(
      (s) => s.verification_status === "verified"
    ).length;

    return (
      <>
        {/* Stats Cards - Only show when there are services */}
        {services.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-[var(--color-secondary)]/10 to-[var(--color-secondary)]/5 rounded-2xl p-4 border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--color-secondary)]/20 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-[var(--color-secondary)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {services.length}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Total Services
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-2xl p-4 border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <Eye className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {activeServices}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Active
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl p-4 border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {totalBookings}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Bookings
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl p-4 border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {verifiedServices}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Verified
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-1">
              Your Service Portfolio
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Manage and showcase your professional services
            </p>
          </div>
          <Link
            href="./post-service"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-dark)] text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all min-h-[48px] mobile-button whitespace-nowrap group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span className="hidden sm:inline">Add New Service</span>
            <span className="sm:hidden">Add Service</span>
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-accent)]/5 rounded-3xl border-2 border-dashed border-[var(--color-border)]">
            <div className="text-center max-w-md mx-auto px-6">
              <div className="w-24 h-24 bg-gradient-to-br from-[var(--color-secondary)]/20 to-[var(--color-secondary)]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-12 w-12 text-[var(--color-secondary)]" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-[var(--color-text-primary)]">
                Start Your Service Journey
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
                Create your first service offer and start connecting with
                customers who need your expertise. Build your professional
                portfolio and grow your business.
              </p>
              <Link
                href="./post-service"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-dark)] text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all group"
              >
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                Create Your First Service
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  taskerId={taskerId}
                />
              ))}
            </div>
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2 bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)] transition-all"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </span>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </>
    );
  } catch (error) {
    console.error("Error loading services:", error);
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-20 bg-gradient-to-br from-red-50 to-red-100/50 rounded-3xl border-2 border-dashed border-red-200">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Award className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-[var(--color-text-primary)]">
            Oops! Something went wrong
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
            We couldn't load your services right now. Please try refreshing the
            page or contact support if the problem persists.
          </p>
          <Link
            href="/tasker/my-services"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-dark)] text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }
}

export default function MyServicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Run profile check and user data fetching in parallel
        const [profileCheck, { user: userData }] = await Promise.all([
          hasTaskerCompletedProfileAction(),
          getUserProfileAction(),
        ]);

        // Check profile completion (non-blocking)
        if (!profileCheck.hasCompleted) {
          toast.info("Please complete your profile setup to continue");
          router.replace("/finish-signUp");
          return;
        }

        setUser(userData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Award className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-[var(--color-text-primary)]">
          Access Required
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-6 max-w-sm">
          Please sign in to access your service management dashboard and start
          building your professional portfolio.
        </p>
        <Link
          href="/login"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-dark)] text-white font-semibold hover:shadow-lg transition-all"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <main className="w-full min-h-[100dvh] bg-[var(--color-bg)] flex flex-col items-center px-0 sm:px-4 py-0">
      {/* Hero Header Section */}
      <section className="w-full max-w-4xl px-4 pt-6 pb-2">
        <div className="bg-gradient-to-r from-[var(--color-secondary)]/10 via-[var(--color-secondary)]/5 to-[var(--color-accent)]/10 rounded-3xl p-6 sm:p-8 border border-[var(--color-border)] mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-3">
                Service Management Hub
              </h1>
              <p className="text-[var(--color-text-secondary)] mb-4 text-base sm:text-lg leading-relaxed">
                Build and manage your professional service portfolio. Create
                compelling offers, track performance, and grow your business
                with our powerful tools.
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-full text-sm font-medium text-[var(--color-text-primary)]">
                  <TrendingUp className="h-4 w-4 text-[var(--color-secondary)]" />
                  <span>Performance Tracking</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-full text-sm font-medium text-[var(--color-text-primary)]">
                  <Users className="h-4 w-4 text-[var(--color-secondary)]" />
                  <span>Customer Insights</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-full text-sm font-medium text-[var(--color-text-primary)]">
                  <Award className="h-4 w-4 text-[var(--color-secondary)]" />
                  <span>Quality Control</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[var(--color-secondary)]/20 to-[var(--color-secondary)]/10 rounded-3xl flex items-center justify-center">
                <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-[var(--color-secondary)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full max-w-4xl px-4 pb-8 flex-1 flex flex-col">
        <ServicesList taskerId={user.id} />
      </section>
    </main>
  );
}
