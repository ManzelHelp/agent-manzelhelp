import ServiceSearchBar from "@/components/buttons/ServiceSearchBar";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import ServiceOfferCard from "@/components/ServiceOfferCard";
import { User, TaskerService } from "@/types/supabase";
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
  Sparkles,
  Zap,
  Heart,
  TrendingUp,
} from "lucide-react";
import { getPopularCategories } from "@/lib/categories";

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
      price,
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
    .eq("service_status", "active")
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
        price: service.price,
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
      {/* Hero Section - Modern Design */}
      <section className="relative bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)] text-white py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 overflow-hidden">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0">
          {/* Animated gradient orbs */}
          <div className="absolute top-0 left-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-light)] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 sm:w-96 sm:h-96 lg:w-[28rem] lg:h-[28rem] bg-gradient-to-tl from-[var(--color-accent)] to-[var(--color-accent-light)] rounded-full translate-x-1/2 translate-y-1/2 opacity-15 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-10 animate-pulse delay-500"></div>

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
            <Sparkles className="h-4 w-4 text-[var(--color-secondary)]" />
            <span className="text-sm font-medium text-white/90">
              Trusted by 1000+ customers
            </span>
          </div>

          {/* Enhanced Typography */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight px-2 bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl mb-8 sm:mb-10 text-white/90 max-w-3xl mx-auto px-2 leading-relaxed font-light">
            {t("description")}
          </p>

          {/* Enhanced Search Bar */}
          <div className="max-w-3xl mx-auto mb-8 sm:mb-12 px-2">
            <div className="relative">
              <ServiceSearchBar />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-[var(--color-secondary)] rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-12 sm:mt-16 px-2">
            <div className="group text-center bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-light)] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                500+
              </div>
              <div className="text-sm sm:text-base text-white/80 leading-tight">
                Verified Taskers
              </div>
            </div>

            <div className="group text-center bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-primary)]" />
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                50+
              </div>
              <div className="text-sm sm:text-base text-white/80 leading-tight">
                Service Categories
              </div>
            </div>

            <div className="group text-center bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-light)] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                1000+
              </div>
              <div className="text-sm sm:text-base text-white/80 leading-tight">
                Happy Customers
              </div>
            </div>

            <div className="group text-center bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Star className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-primary)]" />
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                4.8★
              </div>
              <div className="text-sm sm:text-base text-white/80 leading-tight">
                Average Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <PopularServices categories={getPopularCategories()} locale={locale} />

      {/* Featured Services Section - Modern Design */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-3 bg-[var(--color-secondary)]/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-[var(--color-secondary)]/20">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-light)] rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-[var(--color-secondary)]">
                Featured Services
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[var(--color-primary)] px-2 leading-tight">
              {t("servicesOffered")}
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-3xl mx-auto px-2 leading-relaxed font-light">
              Discover top-rated taskers offering professional services in your
              area
            </p>
          </div>

          {transformedServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
              {transformedServices.map((offer, index) => (
                <div
                  key={offer.service.id}
                  className="group transform transition-all duration-500 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ServiceOfferCard
                    service={offer.service}
                    tasker={offer.tasker}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 sm:py-20">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 text-[var(--color-primary)]" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--color-secondary)] rounded-full animate-ping"></div>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-[var(--color-text-primary)] mb-3">
                No services available at the moment
              </h3>
              <p className="text-[var(--color-text-secondary)] px-2 max-w-md mx-auto">
                Check back soon for amazing services from our verified taskers!
              </p>
            </div>
          )}

          {/* Enhanced View All Services Button */}
          <div className="text-center mt-12 sm:mt-16">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-light)] hover:from-[var(--color-secondary-dark)] hover:to-[var(--color-secondary)] text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg font-semibold min-h-[56px] sm:min-h-[64px] rounded-2xl border-0"
            >
              <span className="flex items-center gap-3">
                View All Services
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - Modern Design */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-bg)] to-[var(--color-accent-light)] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-primary)] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-[var(--color-secondary)] rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          {/* Enhanced Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-3 bg-[var(--color-primary)]/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-[var(--color-primary)]/20">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-full flex items-center justify-center">
                <Award className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-[var(--color-primary)]">
                Why Choose Us
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[var(--color-primary)] px-2 leading-tight">
              {t("whyTitle")}
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-3xl mx-auto px-2 leading-relaxed font-light">
              We connect you with verified, skilled professionals for all your
              home and business needs
            </p>
          </div>

          {/* Enhanced Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            <Card className="group p-6 sm:p-8 text-center hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)]"></div>
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-[var(--color-primary)]">
                  Verified Professionals
                </h3>
                <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed">
                  All our taskers are thoroughly vetted and background-checked
                  for your safety and peace of mind
                </p>
              </div>
            </Card>

            <Card className="group p-6 sm:p-8 text-center hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-light)]"></div>
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-light)] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-[var(--color-primary)]">
                  Quick & Reliable
                </h3>
                <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed">
                  Get matched with available taskers in your area within
                  minutes, 24/7 availability
                </p>
              </div>
            </Card>

            <Card className="group p-6 sm:p-8 text-center hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:scale-105 hover:-translate-y-2 relative overflow-hidden md:col-span-2 lg:col-span-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)]"></div>
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-[var(--color-primary)]">
                  Quality Guaranteed
                </h3>
                <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed">
                  Satisfaction guaranteed with our quality assurance and
                  dedicated customer support team
                </p>
              </div>
            </Card>
          </div>

          {/* Additional Benefits Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-12 sm:mt-16">
            <div className="text-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-primary)]" />
              </div>
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                Best Prices
              </h4>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Competitive rates for quality services
              </p>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[var(--color-secondary)]/20 to-[var(--color-secondary)]/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-secondary)]" />
              </div>
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                Trusted Platform
              </h4>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Secure payments and reviews
              </p>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-accent)]" />
              </div>
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                Instant Booking
              </h4>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Book services in seconds
              </p>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Star className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-primary)]" />
              </div>
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                Top Rated
              </h4>
              <p className="text-sm text-[var(--color-text-secondary)]">
                4.8★ average rating
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Modern Design */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto text-center">
          <Card className="p-8 sm:p-12 md:p-16 lg:p-20 bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)] text-white shadow-2xl relative overflow-hidden border-0 rounded-3xl">
            {/* Enhanced Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-light)] rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-28 h-28 sm:w-40 sm:h-40 lg:w-56 lg:h-56 bg-gradient-to-tl from-[var(--color-accent)] to-[var(--color-accent-light)] rounded-full opacity-15 translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)] rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500"></div>

              {/* Subtle pattern overlay */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              ></div>
            </div>

            <div className="relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 mb-8 border border-white/20">
                <Sparkles className="h-5 w-5 text-[var(--color-secondary)]" />
                <span className="text-sm font-semibold text-white/90">
                  Join Our Community
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 px-2 leading-tight">
                Ready to Get Started?
              </h2>
              <p className="text-xl sm:text-2xl md:text-3xl mb-8 sm:mb-12 text-white/90 px-2 leading-relaxed font-light max-w-4xl mx-auto">
                Join thousands of satisfied customers who trust us for their
                service needs
              </p>

              {/* Enhanced Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-2 max-w-2xl mx-auto">
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-light)] hover:from-[var(--color-secondary-dark)] hover:to-[var(--color-secondary)] text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg font-semibold min-h-[56px] sm:min-h-[64px] rounded-2xl border-0 flex-1"
                >
                  <span className="flex items-center justify-center gap-3">
                    <Users className="h-5 w-5" />
                    Find a Tasker
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>
                <Button
                  size="lg"
                  className="group bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border-2 border-white/30 hover:border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg font-semibold min-h-[56px] sm:min-h-[64px] rounded-2xl flex-1"
                >
                  <span className="flex items-center justify-center gap-3">
                    <Star className="h-5 w-5" />
                    Become a Tasker
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 mt-12 sm:mt-16 text-white/70">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">Secure Platform</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Verified Taskers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  <span className="text-sm font-medium">24/7 Support</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
