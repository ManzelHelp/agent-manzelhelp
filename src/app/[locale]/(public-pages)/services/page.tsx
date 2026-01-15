import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllCategoryHierarchies, getCategoryName, getCategoryDescription } from "@/lib/categories";
import ServicesPageClient from "./ServicesPageClient";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });

  return {
    title: `${t("hero.title")} - ManzelHelp`,
    description: t("hero.description"),
    openGraph: {
      title: `${t("hero.title")} - ManzelHelp`,
      description: t("hero.description"),
      locale: locale,
      type: "website",
    },
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");

  // Get all category hierarchies and localize them
  const categoryHierarchies = getAllCategoryHierarchies();
  const serviceCategories = categoryHierarchies.map(({ parent, subcategories }) => ({
    id: parent.id,
    name: getCategoryName(parent, locale),
    description: getCategoryDescription(parent, locale),
    icon: "🔧",
    color: "from-blue-500 to-blue-600",
    services: subcategories.map((service) => ({
      id: service.id,
      name: getCategoryName(service, locale),
      description: getCategoryDescription(service, locale),
    })),
  }));

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)] text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--color-secondary)] rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-secondary)] rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {t("hero.title")}
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto opacity-90">
            {t("hero.description")}
          </p>
        </div>
      </section>

      {/* Client Component for Interactive Parts */}
      <ServicesPageClient
        serviceCategories={serviceCategories}
        locale={locale}
        translations={{
          hero: {
            searchPlaceholder: t("hero.searchPlaceholder"),
          },
          categories: {
            title: t("categories.title"),
            servicesCount: t("categories.servicesCount", { count: 0 }),
          },
          servicesGrid: {
            title: t("servicesGrid.title", { category: "" }),
            description: t("servicesGrid.description", { category: "" }),
            rating: t("servicesGrid.rating"),
            duration: t("servicesGrid.duration"),
            location: t("servicesGrid.location"),
            viewServices: t("servicesGrid.viewServices"),
          },
        }}
      />

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-lg sm:text-xl mb-8 opacity-90">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white"
              asChild
            >
              <Link href="/find-a-helper">
                {t("cta.findHelper")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/become-a-helper">
                {t("cta.becomeHelper")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
