import ServiceSearchBar from "@/components/buttons/ServiceSearchBar";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import ServiceOfferCard from "@/components/ServiceOfferCard";
import { User, TaskerService, ServiceCategory } from "@/types/supabase";
import PopularServices from "@/components/PopularServices";
import { createClient } from "@/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  Clock,
  Shield,
  ArrowRight,
  Users,
  Award,
  CheckCircle,
} from "lucide-react";

// Hardcoded popular service categories
const popularCategories: Pick<
  ServiceCategory,
  "id" | "name_en" | "name_fr" | "name_ar"
>[] = [
  {
    id: 1,
    name_en: "House Cleaning",
    name_fr: "Nettoyage de maison",
    name_ar: "تنظيف المنزل",
  },
  {
    id: 2,
    name_en: "Handyman Services",
    name_fr: "Services de bricolage",
    name_ar: "خدمات السباكة والكهرباء",
  },
  {
    id: 3,
    name_en: "Gardening",
    name_fr: "Jardinage",
    name_ar: "البستنة",
  },
  {
    id: 4,
    name_en: "Pet Care",
    name_fr: "Soins pour animaux",
    name_ar: "رعاية الحيوانات الأليفة",
  },
  {
    id: 5,
    name_en: "Tutoring",
    name_fr: "Cours particuliers",
    name_ar: "الدروس الخصوصية",
  },
  {
    id: 6,
    name_en: "Moving & Packing",
    name_fr: "Déménagement",
    name_ar: "النقل والتعبئة",
  },
  {
    id: 7,
    name_en: "Car Washing",
    name_fr: "Lavage de voiture",
    name_ar: "غسيل السيارات",
  },
  {
    id: 8,
    name_en: "Event Planning",
    name_fr: "Organisation d'événements",
    name_ar: "تخطيط الفعاليات",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  // Enable static rendering
  setRequestLocale(locale);

  // Get translations for the page content
  const t = await getTranslations({ locale, namespace: "homepage" });

  // Fetch featured tasker services with tasker information
  const { data: featuredServices } = await supabase
    .from("tasker_services")
    .select(
      `
      id,
      title,
      description,
      base_price,
      pricing_type,
      service_area,
      is_promoted,
      tasker_id,
      users!inner (
        id,
        first_name,
        last_name,
        avatar_url
      )
    `
    )
    .eq("is_available", true)
    .eq("verification_status", "verified")
    .order("is_promoted", { ascending: false })
    .limit(6);

  // Transform the data to match the expected format
  const transformedServices =
    featuredServices?.map((service) => ({
      service: {
        id: service.id,
        tasker_id: service.tasker_id,
        service_id: 0, // This would need to be fetched from the actual service relationship
        base_price: service.base_price,
        pricing_type: service.pricing_type,
        title: service.title,
        description: service.description || "",
        service_area: service.service_area || "",
        is_promoted: service.is_promoted,
      } as TaskerService,
      tasker: service.users as unknown as User,
    })) || [];

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)] text-white py-20 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-[var(--color-secondary)] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-accent)] rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {t("title")}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            {t("description")}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <ServiceSearchBar />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl md:text-3xl font-bold text-[var(--color-secondary)]">
                500+
              </div>
              <div className="text-sm md:text-base text-white/80">
                Verified Taskers
              </div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl md:text-3xl font-bold text-[var(--color-secondary)]">
                50+
              </div>
              <div className="text-sm md:text-base text-white/80">
                Service Categories
              </div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl md:text-3xl font-bold text-[var(--color-secondary)]">
                1000+
              </div>
              <div className="text-sm md:text-base text-white/80">
                Happy Customers
              </div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl md:text-3xl font-bold text-[var(--color-secondary)]">
                4.8★
              </div>
              <div className="text-sm md:text-base text-white/80">
                Average Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <PopularServices categories={popularCategories} locale={locale} />

      {/* Featured Services Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-secondary)] rounded-full mb-4">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--color-primary)]">
              {t("servicesOffered")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Discover top-rated taskers offering professional services in your
              area
            </p>
          </div>

          {transformedServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {transformedServices.map((offer) => (
                <ServiceOfferCard
                  key={offer.service.id}
                  service={offer.service}
                  tasker={offer.tasker}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[var(--color-accent)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-[var(--color-primary)]" />
              </div>
              <p className="text-[var(--color-text-secondary)]">
                No services available at the moment. Check back soon!
              </p>
            </div>
          )}

          {/* View All Services Button */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              View All Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-accent-light)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-primary)] rounded-full mb-4">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--color-primary)]">
              {t("whyTitle")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              We connect you with verified, skilled professionals for all your
              home and business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 text-center hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg">
              <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[var(--color-primary)]">
                Verified Professionals
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                All our taskers are thoroughly vetted and background-checked for
                your safety
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg">
              <div className="w-16 h-16 bg-[var(--color-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[var(--color-primary)]">
                Quick & Reliable
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                Get matched with available taskers in your area within minutes
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg">
              <div className="w-16 h-16 bg-[var(--color-accent)] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[var(--color-primary)]">
                Quality Guaranteed
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                Satisfaction guaranteed with our quality assurance and customer
                support
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-8 md:p-12 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)] text-white shadow-2xl">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--color-secondary)] rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-[var(--color-accent)] rounded-full opacity-20 translate-x-1/2 translate-y-1/2"></div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Join thousands of satisfied customers who trust us for their
                service needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Find a Tasker
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[var(--color-primary)] transition-all duration-300"
                >
                  Become a Tasker
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
