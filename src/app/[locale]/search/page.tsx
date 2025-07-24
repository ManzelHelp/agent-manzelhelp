import React from "react";
import { createClient } from "@/supabase/server";
import ServiceSearchBar from "@/components/buttons/ServiceSearchBar";
import ServiceOfferCard from "@/components/ServiceOfferCard";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { TaskerService, User } from "@/types/supabase";

interface SearchPageProps {
  searchParams: { q?: string };
}

interface ServiceWithTasker extends TaskerService {
  tasker: User;
}

async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const t = await getTranslations("search");

  // Fetch services based on search query
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
    .eq("is_available", true);

  if (resolvedSearchParams.q) {
    query = query.ilike("title", `%${resolvedSearchParams.q}%`);
  }

  const { data: services, error } = await query;

  if (error) {
    console.error("Error fetching services:", error);
    return <div>Error loading services</div>;
  }

  const typedServices = (services || []) as ServiceWithTasker[];

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
            <Card className="p-4 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">{t("filters")}</h2>

              {/* Price Range */}
              <div className="space-y-4 mb-6">
                <Label>{t("priceRange")}</Label>
                <div className="space-y-2">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input type="number" placeholder="Min" />
                    </div>
                    <div className="flex-1">
                      <Input type="number" placeholder="Max" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Area */}
              <div className="space-y-4 mb-6">
                <Label>{t("location")}</Label>
                <Input placeholder={t("enterLocation")} />
              </div>

              {/* Rating Filter */}
              <div className="space-y-4 mb-6">
                <Label>{t("rating")}</Label>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-[var(--color-border)]"
                      />
                      <span>{"★".repeat(rating)} & up</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button className="w-full">{t("applyFilters")}</Button>
            </Card>
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
                {typedServices.length} {t("resultsFound")}
              </span>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {typedServices.map((service) => (
                <ServiceOfferCard
                  key={service.id}
                  service={service}
                  tasker={service.tasker}
                />
              ))}
            </div>

            {typedServices.length === 0 && (
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
