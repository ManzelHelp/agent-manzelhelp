import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Heart, Zap, Globe, Award, Coffee, ArrowRight, Sparkles } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "careers" });

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

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("careers");

  const benefits = [
    {
      icon: Heart,
      title: t("whyWorkWithUs.benefits.healthWellness.title"),
      description: t("whyWorkWithUs.benefits.healthWellness.description"),
    },
    {
      icon: Zap,
      title: t("whyWorkWithUs.benefits.flexibleWork.title"),
      description: t("whyWorkWithUs.benefits.flexibleWork.description"),
    },
    {
      icon: Globe,
      title: t("whyWorkWithUs.benefits.globalImpact.title"),
      description: t("whyWorkWithUs.benefits.globalImpact.description"),
    },
    {
      icon: Award,
      title: t("whyWorkWithUs.benefits.careerGrowth.title"),
      description: t("whyWorkWithUs.benefits.careerGrowth.description"),
    },
    {
      icon: Coffee,
      title: t("whyWorkWithUs.benefits.greatCulture.title"),
      description: t("whyWorkWithUs.benefits.greatCulture.description"),
    },
    {
      icon: Users,
      title: t("whyWorkWithUs.benefits.teamBuilding.title"),
      description: t("whyWorkWithUs.benefits.teamBuilding.description"),
    },
  ];

  const openPositions = [
    {
      title: t("openPositions.positions.seniorFrontend.title"),
      department: t("openPositions.positions.seniorFrontend.department"),
      location: t("openPositions.positions.seniorFrontend.location"),
      type: t("openPositions.positions.seniorFrontend.type"),
      description: t("openPositions.positions.seniorFrontend.description"),
    },
    {
      title: t("openPositions.positions.productManager.title"),
      department: t("openPositions.positions.productManager.department"),
      location: t("openPositions.positions.productManager.location"),
      type: t("openPositions.positions.productManager.type"),
      description: t("openPositions.positions.productManager.description"),
    },
    {
      title: t("openPositions.positions.customerSuccess.title"),
      department: t("openPositions.positions.customerSuccess.department"),
      location: t("openPositions.positions.customerSuccess.location"),
      type: t("openPositions.positions.customerSuccess.type"),
      description: t("openPositions.positions.customerSuccess.description"),
    },
    {
      title: t("openPositions.positions.marketingSpecialist.title"),
      department: t("openPositions.positions.marketingSpecialist.department"),
      location: t("openPositions.positions.marketingSpecialist.location"),
      type: t("openPositions.positions.marketingSpecialist.type"),
      description: t("openPositions.positions.marketingSpecialist.description"),
    },
  ];

  const values = [
    {
      title: t("culture.values.innovation.title"),
      description: t("culture.values.innovation.description"),
    },
    {
      title: t("culture.values.community.title"),
      description: t("culture.values.community.description"),
    },
    {
      title: t("culture.values.trust.title"),
      description: t("culture.values.trust.description"),
    },
    {
      title: t("culture.values.growth.title"),
      description: t("culture.values.growth.description"),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)] text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--color-secondary)] rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-secondary)] rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">{t("hero.title")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {t("hero.title")}
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto opacity-90">
            {t("hero.description")}
          </p>
          <Button
            size="lg"
            className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white"
            asChild
          >
            <a href="#open-positions">
              {t("hero.viewPositions")}
              <ArrowRight className={locale === "ar" ? "mr-2 h-4 w-4" : "ml-2 h-4 w-4"} />
            </a>
          </Button>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("whyWorkWithUs.title")}
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card
                  key={index}
                  className="p-6 text-center hover:shadow-lg transition-all duration-300 bg-white dark:bg-[var(--color-surface)] border-0"
                >
                  <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                    {benefit.title}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-6">
            {t("mission.title")}
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-8">
            {t("mission.description")}
          </p>
          <div className="grid sm:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--color-primary)] mb-2">
                10K+
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                {t("mission.stats.activeHelpers")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--color-primary)] mb-2">
                50K+
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                {t("mission.stats.happyCustomers")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--color-primary)] mb-2">
                100K+
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                {t("mission.stats.servicesCompleted")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="open-positions" className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("openPositions.title")}
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid gap-6">
            {openPositions.map((position, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)]"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                      {position.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-secondary)] mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {position.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {position.location}
                      </span>
                      <span className="bg-[var(--color-primary-light)] text-[var(--color-primary)] px-2 py-1 rounded-full text-xs font-medium">
                        {position.type}
                      </span>
                    </div>
                    <p className="text-[var(--color-text-secondary)] leading-relaxed">
                      {position.description}
                    </p>
                  </div>
                  <Button variant="outline" className={locale === "ar" ? "md:mr-4" : "md:ml-4"}>
                    {t("openPositions.applyNow")}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-[var(--color-text-secondary)] mb-4">
              {t("openPositions.noPositionFit")}
            </p>
            <Button variant="outline">
              {t("openPositions.sendResume")}
            </Button>
          </div>
        </div>
      </section>

      {/* Culture & Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-6">
            {t("culture.title")}
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className={locale === "ar" ? "text-right" : "text-left"}>
                <h3 className="text-lg font-semibold mb-3 text-[var(--color-text-primary)]">
                  {value.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
