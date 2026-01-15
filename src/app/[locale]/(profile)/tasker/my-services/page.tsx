"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
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
import { formatDateShort } from "@/lib/date-utils";
import ServiceDeleteButton from "@/components/services/ServiceDeleteButton";
import { User } from "@/types/supabase";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";

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
  const t = useTranslations("services");
  const locale = useLocale();
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
        return "bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success)]/30";
      case "pending":
        return "bg-[var(--color-warning-light)] text-[var(--color-warning)] border border-[var(--color-warning)]/30";
      case "rejected":
        return "bg-[var(--color-error-light)] text-[var(--color-error)] border border-[var(--color-error)]/30";
      case "under_review":
        return "bg-[var(--color-info-light)] text-[var(--color-info)] border border-[var(--color-info)]/30";
      default:
        return "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "verified":
        return t("verified");
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

  return (
    <div className="group bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm hover:shadow-xl hover:border-[var(--color-secondary)]/30 transition-all duration-300 transform hover:-translate-y-1">
      {/* Service Image Placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-[var(--color-secondary)]/10 via-[var(--color-secondary)]/5 to-[var(--color-accent)]/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {service.service_status === "active" ? (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-success-light)] text-[var(--color-success)] rounded-full text-xs font-medium border border-[var(--color-success)]/30">
              <Eye className="h-3 w-3" />
              <span>{t("active")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-surface)] text-[var(--color-text-secondary)] rounded-full text-xs font-medium border border-[var(--color-border)]">
              <EyeOff className="h-3 w-3" />
              <span>{t("paused", { default: "Paused" })}</span>
            </div>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface)] backdrop-blur-sm rounded-full text-xs font-medium text-[var(--color-text-primary)] shadow-sm border border-[var(--color-border)]">
            <Star className="h-3 w-3 text-[var(--color-secondary)]" />
            <span>{service.category_name_en || "Service"}</span>
          </div>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-4 right-4">
          <div className="flex items-center gap-1 px-4 py-2 bg-[var(--color-surface)] backdrop-blur-sm rounded-xl shadow-lg border border-[var(--color-border)]">
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
                ? t("multipleAreas", { default: "Multiple areas" })
                : t("areaNotSpecified")}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3 mb-4 leading-relaxed">
          {service.description || t("noDescription", { default: "No description available" })}
        </p>

        {/* Service Details */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {service.created_at
                  ? formatDateShort(service.created_at, locale)
                  : t("unknownDate", { default: "Unknown date" })}
              </span>
            </div>
            {service.booking_count > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{service.booking_count} {t("bookings")}</span>
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
                service.verification_status === "under_review"
                  ? t("verificationStatus.pending", { default: "Pending verification by admin" })
                  : service.verification_status === "verified"
                  ? t("verificationStatus.verified", { default: "Service verified and approved by admin" })
                  : service.verification_status === "rejected"
                  ? t("verificationStatus.rejected", { default: "Service rejected by admin" })
                  : t("verificationStatus.title", { default: "Verification status" })
              }
            >
              {getStatusLabel(service.verification_status)}
            </span>
            {service.is_promoted && (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-dark)] text-white">
                <Sparkles className="h-3 w-3" />
                <span>{t("promoted", { default: "Promoted" })}</span>
              </span>
            )}
            <span className="px-3 py-1.5 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-text-secondary)] font-medium text-xs">
              {service.pricing_type === "hourly"
                ? t("pricingType.hourly", { default: "Hourly Rate" })
                : service.pricing_type === "per_item"
                ? t("pricingType.perItem", { default: "Per Item" })
                : t("pricingType.fixed", { default: "Fixed Price" })}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href={`./my-services/${service.id}`}
              className="p-3 rounded-xl bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)] transition-all min-h-[44px] min-w-[44px] flex items-center justify-center shadow-sm hover:shadow-md group/btn"
              title={t("actions.edit", { default: "Edit service" })}
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
  const t = useTranslations("services");
  const { toast } = useToast();
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
        toast({
          variant: "destructive",
          title: t("errors.loadFailed", { default: "Failed to load services" }),
        });
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

  // Ensure services is an array before using filter/reduce
  const servicesArray = services || [];

  try {
    // Calculate stats
    const activeServices = servicesArray.filter(
      (s) => s.service_status === "active"
    ).length;
    const totalBookings = servicesArray.reduce((sum, s) => sum + (s.booking_count || 0), 0);
    //  const promotedServices = servicesArray.filter((s) => s.is_promoted).length;
    const verifiedServices = servicesArray.filter(
      (s) => s.verification_status === "verified"
    ).length;

    return (
      <>
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
        </div>
        {/* Stats Cards - Only show when there are services */}
        {servicesArray.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-[var(--color-secondary)]/10 to-[var(--color-secondary)]/5 rounded-2xl p-4 border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--color-secondary)]/20 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-[var(--color-secondary)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {servicesArray.length}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {t("totalServices")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[var(--color-success)]/10 to-[var(--color-success)]/5 rounded-2xl p-4 border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--color-success)]/20 rounded-xl">
                  <Eye className="h-5 w-5 text-[var(--color-success)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {activeServices}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {t("active")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[var(--color-info)]/10 to-[var(--color-info)]/5 rounded-2xl p-4 border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--color-info)]/20 rounded-xl">
                  <Users className="h-5 w-5 text-[var(--color-info)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {totalBookings}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {t("bookings")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[var(--color-secondary)]/10 to-[var(--color-secondary)]/5 rounded-2xl p-4 border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--color-secondary)]/20 rounded-xl">
                  <Award className="h-5 w-5 text-[var(--color-secondary)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {verifiedServices}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {t("verified")}
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
              {t("yourServicePortfolio")}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {t("manageAndShowcase")}
            </p>
          </div>
          <Link
            href="./post-service"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-dark)] text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all min-h-[48px] mobile-button whitespace-nowrap group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span className="hidden sm:inline">{t("addNewService")}</span>
            <span className="sm:hidden">{t("addNewService", { default: "Add Service" })}</span>
          </Link>
        </div>

        {servicesArray.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-accent)]/5 rounded-3xl border-2 border-dashed border-[var(--color-border)]">
            <div className="text-center max-w-md mx-auto px-6">
              <div className="w-24 h-24 bg-gradient-to-br from-[var(--color-secondary)]/20 to-[var(--color-secondary)]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-12 w-12 text-[var(--color-secondary)]" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-[var(--color-text-primary)]">
                {t("startServiceJourney")}
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
                {t("createFirstServiceDescription")}
              </p>
              <Link
                href="./post-service"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-dark)] text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all group"
              >
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                {t("createFirstService")}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {servicesArray.map((service) => (
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
                      {t("loading")}
                    </span>
                  ) : (
                    t("loadMore")
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
            {t("oopsSomethingWentWrong")}
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
            {t("couldntLoadServices")}
          </p>
          <Link
            href="/tasker/my-services"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-dark)] text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            {t("tryAgain")}
          </Link>
        </div>
      </div>
    );
  }
}

export default function MyServicesPage() {
  const router = useRouter();
  const t = useTranslations("services");
  const { toast } = useToast();
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
          toast({
            variant: "default",
            title: t("pleaseCompleteProfile"),
          });
          router.replace("/finish-signUp");
          return;
        }

        setUser(userData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: t("failedToLoadData"),
        });
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
        <p>{t("loading")}</p>
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
          {t("accessRequired")}
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-6 max-w-sm">
          {t("pleaseSignIn")}
        </p>
        <Link
          href="/login"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-dark)] text-white font-semibold hover:shadow-lg transition-all"
        >
          {t("signIn")}
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
                {t("serviceManagementHub")}
              </h1>
              <p className="text-[var(--color-text-secondary)] mb-4 text-base sm:text-lg leading-relaxed">
                {t("buildAndManage")}
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-full text-sm font-medium text-[var(--color-text-primary)]">
                  <TrendingUp className="h-4 w-4 text-[var(--color-secondary)]" />
                  <span>{t("performanceTracking")}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-full text-sm font-medium text-[var(--color-text-primary)]">
                  <Users className="h-4 w-4 text-[var(--color-secondary)]" />
                  <span>{t("customerInsights")}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-full text-sm font-medium text-[var(--color-text-primary)]">
                  <Award className="h-4 w-4 text-[var(--color-secondary)]" />
                  <span>{t("qualityControl")}</span>
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
