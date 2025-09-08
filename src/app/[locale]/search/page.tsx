import React, { Suspense } from "react";
import { createClient } from "@/supabase/server";
import ServiceSearchBar from "@/components/buttons/ServiceSearchBar";
import ServiceOfferCard from "@/components/ServiceOfferCard";
import ServiceCardSkeleton from "@/components/ServiceCardSkeleton";
import SearchFilters from "@/components/filters/SearchFilters";
import MobileFiltersDropdown from "@/components/filters/MobileFiltersDropdown";
import SortDropdown from "@/components/SortDropdown";
import { getTranslations } from "next-intl/server";
import {
  PricingType,
  ServiceStatus,
  ServiceVerificationStatus,
  UserRole,
  VerificationStatus,
} from "@/types/supabase";

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

async function SearchPage({ searchParams, params }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const resolvedParams = await params;
  const { locale } = resolvedParams;
  const supabase = await createClient();
  const t = await getTranslations("search");

  // Hardcoded categories based on actual service_ids found in database
  const categories = [
    {
      id: 1,
      name_en: "House Cleaning",
      name_fr: "Nettoyage de maison",
      name_ar: "تنظيف المنزل",
    },
    {
      id: 2,
      name_en: "Office Cleaning",
      name_fr: "Nettoyage de bureau",
      name_ar: "تنظيف المكتب",
    },
    {
      id: 3,
      name_en: "Deep Cleaning",
      name_fr: "Grand ménage",
      name_ar: "تنظيف عميق",
    },
    {
      id: 7,
      name_en: "Furniture Assembly",
      name_fr: "Montage de meubles",
      name_ar: "تجميع الأثاث",
    },
    {
      id: 62,
      name_en: "Pet Care",
      name_fr: "Garde d'animaux",
      name_ar: "رعاية الحيوانات",
    },
    {
      id: 65,
      name_en: "Event Organization",
      name_fr: "Organisation d'événements",
      name_ar: "تنظيم الفعاليات",
    },
  ];

  // Fetch services using the service_listing_view which has all the data we need
  let query = supabase
    .from("service_listing_view")
    .select("*")
    .eq("service_status", "active");

  // Apply filters
  if (resolvedSearchParams.q) {
    query = query.ilike("title", `%${resolvedSearchParams.q}%`);
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
    return <div>Error loading services</div>;
  }

  const filteredServices = (services || []) as ServiceListing[];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-surface)] to-[var(--color-bg)]">
      {/* Enhanced Search Header with Glass Morphism */}
      <div className="relative bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] py-12 sm:py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 animate-fade-in-up">
              {resolvedSearchParams.q
                ? `Search Results for "${resolvedSearchParams.q}"`
                : "Find Your Perfect Service"}
            </h1>
            <p className="text-white/90 text-lg sm:text-xl max-w-2xl mx-auto animate-fade-in-up animate-delay-200">
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
            <div className="bg-[var(--color-surface)] rounded-2xl p-6 mb-8 shadow-lg border border-[var(--color-border)] animate-fade-in-up">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                    {resolvedSearchParams.q
                      ? t("searchResults", { query: resolvedSearchParams.q })
                      : t("allServices")}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
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
                <div className="animate-fade-in-up animate-delay-200">
                  <SortDropdown
                    currentSort={resolvedSearchParams.sort || "created_at"}
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Results Grid with Staggered Animation */}
            <Suspense
              fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                  {Array.from({ length: 6 }).map((_, index) => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
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
                <div className="text-center py-16 animate-fade-in-up">
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-[var(--color-accent)]"
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
                    <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">
                      {t("noResults")}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] text-lg mb-6">
                      {t("tryAdjustingFilters")}
                    </p>
                    <button
                      onClick={() =>
                        (window.location.href = `/${locale}/search`)
                      }
                      className="inline-flex items-center px-6 py-3 bg-[var(--color-secondary)] text-white rounded-xl hover:bg-[var(--color-secondary-dark)] transition-all duration-200 font-medium"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </Suspense>

            {/* Enhanced Pagination */}
            {filteredServices.length > 0 && (count || 0) > limit && (
              <div className="flex justify-center items-center gap-3 mt-12 animate-fade-in-up">
                {page > 1 && (
                  <a
                    href={`/${locale}/search?${new URLSearchParams({
                      ...resolvedSearchParams,
                      page: (page - 1).toString(),
                    }).toString()}`}
                    className="inline-flex items-center px-6 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-secondary)] hover:text-white hover:border-[var(--color-secondary)] transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
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
                    Previous
                  </a>
                )}

                <div className="flex items-center gap-2 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm">
                  <span className="text-[var(--color-text-primary)] font-medium">
                    Page {page} of {Math.ceil((count || 0) / limit)}
                  </span>
                </div>

                {page < Math.ceil((count || 0) / limit) && (
                  <a
                    href={`/${locale}/search?${new URLSearchParams({
                      ...resolvedSearchParams,
                      page: (page + 1).toString(),
                    }).toString()}`}
                    className="inline-flex items-center px-6 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-secondary)] hover:text-white hover:border-[var(--color-secondary)] transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                  >
                    Next
                    <svg
                      className="w-4 h-4 ml-2"
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
                  </a>
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
