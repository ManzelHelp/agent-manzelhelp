import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/supabase/server";
import SearchBar from "@/components/buttons/SearchBar";
import JobOfferCard from "@/components/JobOfferCard";
import SearchCardSkeleton from "@/components/SearchCardSkeleton";
import SearchFilters from "@/components/filters/SearchFilters";
import MobileFiltersDropdown from "@/components/filters/MobileFiltersDropdown";
import SortDropdown from "@/components/SortDropdown";
import { getTranslations, setRequestLocale } from "next-intl/server";
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

// Interface matching the jobs table structure with related data
interface JobListing {
  id: string;
  customer_id: string;
  service_id: number;
  title: string;
  description: string;
  preferred_date: string;
  preferred_time_start: string | null;
  preferred_time_end: string | null;
  is_flexible: boolean;
  estimated_duration: number | null;
  customer_budget: number | null;
  final_price: number | null;
  is_promoted: boolean;
  promotion_expires_at: string | null;
  promotion_boost_score: number | null;
  assigned_tasker_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  images: object | null;
  requirements: string | null;
  currency: string | null;
  address_id: string;
  max_applications: number | null;
  premium_applications_purchased: number | null;
  current_applications: number | null;
  status: string | null;
  // Related data from joins
  customer_first_name: string;
  customer_last_name: string;
  customer_avatar_url: string;
  customer_verification_status: string;
  category_name_en: string;
  category_name_de: string;
  category_name_fr: string;
  street_address: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
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
  const title = query ? t("jobSearchResults", { query }) : t("allJobs");

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

  // Fetch jobs with related data using proper joins
  let query = supabase
    .from("jobs")
    .select(
      `
      *,
      users!customer_id (
        first_name,
        last_name,
        avatar_url,
        verification_status
      ),
      addresses!address_id (
        street_address,
        city,
        region,
        postal_code,
        country
      )
    `
    )
    .in("status", ["under_review", "active"]);

  // Apply filters
  if (resolvedSearchParams.q && resolvedSearchParams.q.trim()) {
    query = query.ilike("title", `%${resolvedSearchParams.q.trim()}%`);
  }

  if (resolvedSearchParams.category) {
    query = query.eq("service_id", parseInt(resolvedSearchParams.category));
  }

  if (resolvedSearchParams.minPrice) {
    query = query.gte(
      "customer_budget",
      parseFloat(resolvedSearchParams.minPrice)
    );
  }

  if (resolvedSearchParams.maxPrice) {
    query = query.lte(
      "customer_budget",
      parseFloat(resolvedSearchParams.maxPrice)
    );
  }

  if (resolvedSearchParams.location) {
    query = query.ilike("addresses.city", `%${resolvedSearchParams.location}%`);
  }

  // Apply sorting
  const sortBy = resolvedSearchParams.sort || "created_at";
  switch (sortBy) {
    case "price_low":
      query = query.order("customer_budget", { ascending: true });
      break;
    case "price_high":
      query = query.order("customer_budget", { ascending: false });
      break;
    case "date":
      query = query.order("preferred_date", { ascending: true });
      break;
    case "applications":
      query = query.order("current_applications", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  // Add pagination with validation
  const page = Math.max(1, parseInt(resolvedSearchParams.page || "1"));
  const limit = 12; // Show 12 jobs per page
  const offset = (page - 1) * limit;

  const {
    data: jobs,
    error,
    count,
  } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching jobs:", error);
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
            Error Loading Jobs
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-4">
            We're having trouble loading the jobs. Please try again later.
          </p>
          <Link
            href={`/${locale}/search/jobs`}
            className="inline-flex items-center px-4 py-2 bg-[var(--color-secondary)] text-white rounded-lg hover:bg-[var(--color-secondary-dark)] transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  // Transform the data to match our interface
  const transformedJobs = (jobs || []).map(
    (
      job: JobListing & {
        users: {
          first_name: string;
          last_name: string;
          avatar_url: string;
          verification_status: string;
        } | null;
        addresses: {
          street_address: string;
          city: string;
          region: string;
          postal_code: string;
          country: string;
        } | null;
      }
    ) => ({
      ...job,
      customer_first_name: job.users?.first_name || "Anonymous",
      customer_last_name: job.users?.last_name || "Customer",
      customer_avatar_url: job.users?.avatar_url || null,
      customer_verification_status:
        job.users?.verification_status || "pending",
      category_name_en: "", // Category info not available in jobs table
      category_name_de: "", // Category info not available in jobs table
      category_name_fr: "", // Category info not available in jobs table
      street_address: job.addresses?.street_address || "",
      city: job.addresses?.city || "",
      region: job.addresses?.region || "",
      postal_code: job.addresses?.postal_code || "",
      country: job.addresses?.country || "",
    })
  ) as JobListing[];

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
                : "Find Your Perfect Job"}
            </h1>
            <p className="text-white/90 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto animate-fade-in-up animate-delay-200">
              {resolvedSearchParams.q
                ? "Discover amazing job opportunities tailored to your skills"
                : "Connect with customers looking for your expertise"}
            </p>
          </div>
          <div className="max-w-2xl mx-auto animate-fade-in-up animate-delay-300">
            <SearchBar defaultValue={resolvedSearchParams.q} type="jobs" />
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
                type="jobs"
                translations={{
                  filters: t("filters"),
                  priceRange: t("priceRange"),
                  budgetRange: t("budgetRange"),
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
                type="jobs"
                translations={{
                  filters: t("filters"),
                  priceRange: t("priceRange"),
                  budgetRange: t("budgetRange"),
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
                        ? t("jobSearchResults", {
                            query: resolvedSearchParams.q,
                          })
                        : t("allJobs")}
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] w-fit">
                        {count || transformedJobs.length} {t("resultsFound")}
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
                      type="jobs"
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
                      <SearchCardSkeleton type="job" />
                    </div>
                  ))}
                </div>
              }
            >
              {transformedJobs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {transformedJobs.map((job, index) => (
                    <div
                      key={job.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <JobOfferCard
                        job={{
                          id: job.id,
                          title: job.title,
                          description: job.description,
                          customer_budget: job.customer_budget || 0,
                          currency: job.currency || "EUR",
                          estimated_duration: job.estimated_duration || 0,
                          preferred_date: job.preferred_date,
                          is_flexible: job.is_flexible || false,
                          is_promoted: job.is_promoted || false,
                          current_applications: job.current_applications || 0,
                          max_applications: job.max_applications || 0,
                          created_at: job.created_at,
                        }}
                        customer={{
                          id: job.customer_id,
                          first_name: job.customer_first_name,
                          last_name: job.customer_last_name,
                          avatar_url: job.customer_avatar_url,
                          verification_status:
                            job.customer_verification_status as
                              | "verified"
                              | "unverified"
                              | "under_review"
                              | "rejected"
                              | "suspended",
                          email: "", // Email not available in this context
                        }}
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
                      href={`/${locale}/search/jobs`}
                      className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-[var(--color-secondary)] text-white rounded-lg sm:rounded-xl hover:bg-[var(--color-secondary-dark)] transition-all duration-200 font-medium text-sm sm:text-base"
                    >
                      Clear All Filters
                    </Link>
                  </div>
                </div>
              )}
            </Suspense>

            {/* Enhanced Pagination */}
            {transformedJobs.length > 0 && (count || 0) > limit && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-8 sm:mt-12 animate-fade-in-up">
                {page > 1 && (
                  <Link
                    href={`/${locale}/search/jobs?${new URLSearchParams({
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
                    href={`/${locale}/search/jobs?${new URLSearchParams({
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
