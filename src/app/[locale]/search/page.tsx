import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/supabase/server";
import ServiceSearchBar from "@/components/buttons/ServiceSearchBar";
import ServiceOfferCard from "@/components/ServiceOfferCard";
import ServiceCardSkeleton from "@/components/ServiceCardSkeleton";
import SearchFilters from "@/components/filters/SearchFilters";
import MobileFiltersDropdown from "@/components/filters/MobileFiltersDropdown";
import SortDropdown from "@/components/SortDropdown";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  PricingType,
  ServiceStatus,
  ServiceVerificationStatus,
  UserRole,
  VerificationStatus,
} from "@/types/supabase";
import { getParentCategoriesForSearch } from "@/lib/categories";

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    location?: string;
    ratings?: string;
    page?: string;
    sort?: string;
  };
  params: {
    locale: string;
  };
}

// Interface matching the service_listing_view structure
interface ServiceListing {
  tasker_service_id: string;
  service_id: number;
  tasker_id: string;
  title: string;
  description: string;
  price: number;
  pricing_type: string;
  service_status: string;
  verification_status: string;
  has_active_booking: boolean;
  created_at: string;
  updated_at: string;
  portfolio_images: object | null;
  minimum_duration: number | null;
  service_area: string;
  extra_fees: number | null;
  tasker_first_name: string;
  tasker_last_name: string;
  tasker_avatar_url: string;
  tasker_phone: string;
  tasker_created_at: string;
  tasker_role: string;
  experience_level: string;
  tasker_bio: string;
  tasker_verification_status: string;
  service_radius_km: number;
  tasker_is_available: boolean;
  operation_hours: object | null;
  company_id: string;
  tasker_rating: number;
  total_reviews: number;
  completed_jobs: number;
  total_earnings: number;
  response_time_hours: number;
  cancellation_rate: number;
  company_name: string;
  company_city: string;
  company_verification_status: string;
  is_available_for_booking: boolean;
}

export async function generateMetadata({
  searchParams,
  params,
}: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const resolvedParams = await params;
  const { locale } = resolvedParams;
  const t = await getTranslations({ locale, namespace: "search" });

  const query = resolvedSearchParams.q;
  const title = query ? t("searchResults", { query }) : t("allServices");

  return {
    title,
    description: t("tryAdjustingFilters"),
  };
}

async function SearchPage({ searchParams, params }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const resolvedParams = await params;
  const { locale } = resolvedParams;

  // Enable static rendering
  setRequestLocale(locale);

  const supabase = await createClient();
  const t = await getTranslations("search");

  // Use centralized categories - get all parent categories for search
  const categories = getParentCategoriesForSearch();

  // Fetch services using the service_listing_view which has all the data we need
  let query = supabase
    .from("service_listing_view")
    .select("*")
    .eq("service_status", "active");

  // Apply filters
  if (resolvedSearchParams.q && resolvedSearchParams.q.trim()) {
    query = query.ilike("title", `%${resolvedSearchParams.q.trim()}%`);
  }

  if (resolvedSearchParams.category) {
    query = query.eq("service_id", parseInt(resolvedSearchParams.category));
  }

  if (resolvedSearchParams.minPrice) {
    query = query.gte("price", parseFloat(resolvedSearchParams.minPrice));
  }

  if (resolvedSearchParams.maxPrice) {
    query = query.lte("price", parseFloat(resolvedSearchParams.maxPrice));
  }

  if (resolvedSearchParams.location) {
    query = query.ilike("service_area", `%${resolvedSearchParams.location}%`);
  }

  // Apply rating filter server-side for accurate pagination
  if (resolvedSearchParams.ratings) {
    const minRating = Math.min(
      ...resolvedSearchParams.ratings.split(",").map((r) => parseInt(r))
    );
    query = query.gte("tasker_rating", minRating);
  }

  // Apply sorting
  const sortBy = resolvedSearchParams.sort || "created_at";
  switch (sortBy) {
    case "price_low":
      query = query.order("price", { ascending: true });
      break;
    case "price_high":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("tasker_rating", { ascending: false });
      break;
    case "reviews":
      query = query.order("total_reviews", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  // Add pagination with validation
  const page = Math.max(1, parseInt(resolvedSearchParams.page || "1"));
  const limit = 12; // Show 12 services per page
  const offset = (page - 1) * limit;

  const {
    data: services,
    error,
    count,
  } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching services:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-surface)] to-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
            Error Loading Services
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-4">
            We're having trouble loading the services. Please try again later.
          </p>
          <Link
            href={`/${locale}/search`}
            className="inline-flex items-center px-4 py-2 bg-[var(--color-secondary)] text-white rounded-lg hover:bg-[var(--color-secondary-dark)] transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  const filteredServices = (services || []) as ServiceListing[];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-surface)] to-[var(--color-bg)]">
      {/* Enhanced Search Header with Glass Morphism */}
      <div className="relative bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] py-8 sm:py-12 lg:py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 animate-fade-in-up">
              {resolvedSearchParams.q
                ? `Search Results for "${resolvedSearchParams.q}"`
                : "Find Your Perfect Service"}
            </h1>
            <p className="text-white/90 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto animate-fade-in-up animate-delay-200">
              {resolvedSearchParams.q
                ? "Discover amazing services tailored to your needs"
                : "Connect with skilled professionals in your area"}
            </p>
          </div>
          <div className="max-w-2xl mx-auto animate-fade-in-up animate-delay-300">
            <ServiceSearchBar defaultValue={resolvedSearchParams.q} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Enhanced Filters Sidebar - Desktop Only */}
          <aside className="hidden lg:block w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-8">
              <SearchFilters
                categories={categories}
                locale={locale}
                translations={{
                  filters: t("filters"),
                  priceRange: t("priceRange"),
                  location: t("location"),
                  enterLocation: t("enterLocation"),
                  rating: t("rating"),
                  applyFilters: t("applyFilters"),
                  categories: t("categories"),
                  allCategories: t("allCategories"),
                }}
              />
            </div>
          </aside>

          {/* Enhanced Results Section */}
          <section className="flex-1 min-w-0">
            {/* Mobile Filters Dropdown */}
            <div className="relative mb-4 lg:hidden">
              <MobileFiltersDropdown
                categories={categories}
                locale={locale}
                translations={{
                  filters: t("filters"),
                  priceRange: t("priceRange"),
                  location: t("location"),
                  enterLocation: t("enterLocation"),
                  rating: t("rating"),
                  applyFilters: t("applyFilters"),
                  categories: t("categories"),
                  allCategories: t("allCategories"),
                }}
              />
            </div>
            {/* Results Header with Modern Styling */}
            <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg border border-[var(--color-border)] animate-fade-in-up">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                      {resolvedSearchParams.q
                        ? t("searchResults", { query: resolvedSearchParams.q })
                        : t("allServices")}
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] w-fit">
                        {count || filteredServices.length} {t("resultsFound")}
                      </span>
                      {resolvedSearchParams.q && (
                        <span className="text-[var(--color-text-secondary)] text-sm">
                          for "{resolvedSearchParams.q}"
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Sort Dropdown */}
                  <div className="animate-fade-in-up animate-delay-200 w-full sm:w-auto">
                    <SortDropdown
                      currentSort={resolvedSearchParams.sort || "created_at"}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Results Grid with Staggered Animation */}
            <Suspense
              fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ServiceCardSkeleton />
                    </div>
                  ))}
                </div>
              }
            >
              {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {filteredServices.map((service, index) => (
                    <div
                      key={service.tasker_service_id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ServiceOfferCard
                        service={{
                          id: service.tasker_service_id,
                          tasker_id: service.tasker_id,
                          service_id: service.service_id,
                          title: service.title,
                          description: service.description,
                          price: service.price,
                          pricing_type: service.pricing_type as PricingType,
                          service_status:
                            service.service_status as ServiceStatus,
                          service_area:
                            service.service_area as unknown as object,
                          verification_status:
                            service.verification_status as ServiceVerificationStatus,
                          has_active_booking: service.has_active_booking,
                          created_at: service.created_at,
                          updated_at: service.updated_at,
                          portfolio_images: service.portfolio_images,
                          minimum_duration:
                            service.minimum_duration || undefined,
                          extra_fees: service.extra_fees || undefined,
                          is_promoted: false,
                          promotion_expires_at: undefined,
                          promotion_boost_score: undefined,
                        }}
                        tasker={{
                          id: service.tasker_id,
                          first_name: service.tasker_first_name,
                          last_name: service.tasker_last_name,
                          avatar_url: service.tasker_avatar_url,
                          email: service.tasker_phone, // Using phone as fallback since email not in view
                          phone: service.tasker_phone,
                          role: service.tasker_role as UserRole,
                          verification_status:
                            service.tasker_verification_status as VerificationStatus,
                          created_at: service.tasker_created_at,
                        }}
                        rating={service.tasker_rating}
                        totalReviews={service.total_reviews}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16 animate-fade-in-up">
                  <div className="max-w-md mx-auto px-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--color-accent)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-2 sm:mb-3">
                      {t("noResults")}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] text-base sm:text-lg mb-4 sm:mb-6">
                      {t("tryAdjustingFilters")}
                    </p>
                    <Link
                      href={`/${locale}/search`}
                      className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-[var(--color-secondary)] text-white rounded-lg sm:rounded-xl hover:bg-[var(--color-secondary-dark)] transition-all duration-200 font-medium text-sm sm:text-base"
                    >
                      Clear All Filters
                    </Link>
                  </div>
                </div>
              )}
            </Suspense>

            {/* Enhanced Pagination */}
            {filteredServices.length > 0 && (count || 0) > limit && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-8 sm:mt-12 animate-fade-in-up">
                {page > 1 && (
                  <Link
                    href={`/${locale}/search?${new URLSearchParams({
                      ...resolvedSearchParams,
                      page: (page - 1).toString(),
                    }).toString()}`}
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg sm:rounded-xl hover:bg-[var(--color-secondary)] hover:text-white hover:border-[var(--color-secondary)] transition-all duration-200 font-medium shadow-sm hover:shadow-md text-sm sm:text-base"
                  >
                    <svg
                      className="w-4 h-4 mr-1 sm:mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg sm:rounded-xl shadow-sm">
                  <span className="text-[var(--color-text-primary)] font-medium text-sm sm:text-base">
                    Page {page} of {Math.ceil((count || 0) / limit)}
                  </span>
                </div>

                {page < Math.ceil((count || 0) / limit) && (
                  <Link
                    href={`/${locale}/search?${new URLSearchParams({
                      ...resolvedSearchParams,
                      page: (page + 1).toString(),
                    }).toString()}`}
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg sm:rounded-xl hover:bg-[var(--color-secondary)] hover:text-white hover:border-[var(--color-secondary)] transition-all duration-200 font-medium shadow-sm hover:shadow-md text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                    <svg
                      className="w-4 h-4 ml-1 sm:ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default SearchPage;
