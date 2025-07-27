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
      {/* Hero Section - Mobile First */}
      <section className="relative bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)] text-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 overflow-hidden">
        {/* Background Pattern - Optimized for mobile */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-[var(--color-secondary)] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[var(--color-accent)] rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Mobile-optimized typography */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-2">
            {t("title")}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-white/90 max-w-2xl mx-auto px-2 leading-relaxed">
            {t("description")}
          </p>

          {/* Enhanced Search Bar for Mobile */}
          <div className="max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
            <ServiceSearchBar />
          </div>

          {/* Stats - Mobile Optimized Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mt-8 sm:mt-12 px-2">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-secondary)]">
                500+
              </div>
              <div className="text-xs sm:text-sm md:text-base text-white/80 leading-tight">
                Verified Taskers
              </div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-secondary)]">
                50+
              </div>
              <div className="text-xs sm:text-sm md:text-base text-white/80 leading-tight">
                Service Categories
              </div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-secondary)]">
                1000+
              </div>
              <div className="text-xs sm:text-sm md:text-base text-white/80 leading-tight">
                Happy Customers
              </div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-secondary)]">
                4.8★
              </div>
              <div className="text-xs sm:text-sm md:text-base text-white/80 leading-tight">
                Average Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <PopularServices categories={popularCategories} locale={locale} />

      {/* Featured Services Section - Mobile Optimized */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-[var(--color-secondary)] rounded-full mb-3 sm:mb-4">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-[var(--color-primary)] px-2">
              {t("servicesOffered")}
            </h2>
            <p className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto px-2 leading-relaxed">
              Discover top-rated taskers offering professional services in your
              area
            </p>
          </div>

          {transformedServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {transformedServices.map((offer) => (
                <ServiceOfferCard
                  key={offer.service.id}
                  service={offer.service}
                  tasker={offer.tasker}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--color-accent)] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-primary)]" />
              </div>
              <p className="text-[var(--color-text-secondary)] px-2">
                No services available at the moment. Check back soon!
              </p>
            </div>
          )}

          {/* View All Services Button - Mobile Optimized */}
          <div className="text-center mt-8 sm:mt-12">
            <Button
              size="lg"
              className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base sm:text-lg min-h-[48px] sm:min-h-[56px]"
            >
              View All Services
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - Mobile Optimized */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-accent-light)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-[var(--color-primary)] rounded-full mb-3 sm:mb-4">
              <Award className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-[var(--color-primary)] px-2">
              {t("whyTitle")}
            </h2>
            <p className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto px-2 leading-relaxed">
              We connect you with verified, skilled professionals for all your
              home and business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-[var(--color-primary)]">
                Verified Professionals
              </h3>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
                All our taskers are thoroughly vetted and background-checked for
                your safety
              </p>
            </Card>

            <Card className="p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--color-secondary)] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-[var(--color-primary)]">
                Quick & Reliable
              </h3>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
                Get matched with available taskers in your area within minutes
              </p>
            </Card>

            <Card className="p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--color-accent)] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-[var(--color-primary)]">
                Quality Guaranteed
              </h3>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
                Satisfaction guaranteed with our quality assurance and customer
                support
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-6 sm:p-8 md:p-12 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-[var(--color-secondary)] rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-[var(--color-accent)] rounded-full opacity-20 translate-x-1/2 translate-y-1/2"></div>
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">
                Ready to Get Started?
              </h2>
              <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-white/90 px-2 leading-relaxed">
                Join thousands of satisfied customers who trust us for their
                service needs
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
                <Button
                  size="lg"
                  className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base sm:text-lg min-h-[48px] sm:min-h-[56px]"
                >
                  Find a Tasker
                </Button>
                <Button
                  size="lg"
                  className="bg-white text-[var(--color-primary)] hover:bg-gray-100 hover:text-[var(--color-primary)] border-2 border-white hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base sm:text-lg min-h-[48px] sm:min-h-[56px] font-medium"
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
