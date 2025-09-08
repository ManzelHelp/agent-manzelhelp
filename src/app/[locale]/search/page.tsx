import React from "react";
import { createClient } from "@/supabase/server";
import ServiceSearchBar from "@/components/buttons/ServiceSearchBar";
import ServiceOfferCard from "@/components/ServiceOfferCard";
import SearchFilters from "@/components/filters/SearchFilters";
import { getTranslations } from "next-intl/server";
import { TaskerService, User } from "@/types/supabase";

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    location?: string;
    ratings?: string;
  };
  params: {
    locale: string;
  };
}

interface ServiceWithTasker extends TaskerService {
  tasker: User;
}

async function SearchPage({ searchParams, params }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const resolvedParams = await params;
  const { locale } = resolvedParams;
  const supabase = await createClient();
  const t = await getTranslations("search");

  // Fetch categories for the filter
  const { data: categories } = await supabase
    .from("service_categories")
    .select("id, name_en, name_fr, name_ar")
    .eq("is_active", true)
    .order("sort_order");

  // Fetch services based on search query and filters
  let query = supabase
    .from("tasker_services")
    .select(
      `
      *,
      tasker:tasker_id(
        id,
        first_name,
        last_name,
        avatar_url,
        email
      )
    `
    )
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

  const { data: services, error } = await query;

  if (error) {
    console.error("Error fetching services:", error);
    return <div>Error loading services</div>;
  }

  const typedServices = (services || []) as ServiceWithTasker[];

  // Filter by ratings if specified
  let filteredServices = typedServices;
  if (resolvedSearchParams.ratings) {
    // Note: In a real app, you would join with a reviews table and calculate average ratings
    // This is just a placeholder for the filter UI
    filteredServices = typedServices;
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      {/* Search Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] py-6">
        <div className="container mx-auto px-4">
          <ServiceSearchBar defaultValue={resolvedSearchParams.q} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            {categories && (
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
            )}
          </aside>

          {/* Results Section */}
          <section className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">
                {resolvedSearchParams.q
                  ? t("searchResults", { query: resolvedSearchParams.q })
                  : t("allServices")}
              </h1>
              <span className="text-[var(--color-text-secondary)]">
                {filteredServices.length} {t("resultsFound")}
              </span>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <ServiceOfferCard
                  key={service.id}
                  service={service}
                  tasker={service.tasker}
                />
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">{t("noResults")}</h3>
                <p className="text-[var(--color-text-secondary)]">
                  {t("tryAdjustingFilters")}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default SearchPage;
