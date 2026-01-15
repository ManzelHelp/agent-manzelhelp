import React from "react";
import BecomeTaskerButton from "@/components/buttons/BecomeTaskerButton";
import { Card } from "@/components/ui/card";
import {
  DollarSign,
  Users,
  Star,
  Clock,
  Shield,
  Sparkles,
  Heart,
  Zap,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

interface BecomeAHelperPageProps {
  params: Promise<{ locale: string }>;
}

export default async function BecomeAHelperPage({
  params,
}: BecomeAHelperPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "becomeAHelper" });

  // Get currency symbol based on locale
  const getCurrencySymbol = () => {
    return locale === "ar" ? "د.م." : "MAD";
  };

  const benefits = [
    {
      icon: DollarSign,
      title: t("benefits.earnMoney.title"),
      description: t("benefits.earnMoney.description"),
    },
    {
      icon: Users,
      title: t("benefits.helpCommunity.title"),
      description: t("benefits.helpCommunity.description"),
    },
    {
      icon: Star,
      title: t("benefits.buildReputation.title"),
      description: t("benefits.buildReputation.description"),
    },
    {
      icon: Clock,
      title: t("benefits.flexibleSchedule.title"),
      description: t("benefits.flexibleSchedule.description"),
    },
    {
      icon: Shield,
      title: t("benefits.securePayments.title"),
      description: t("benefits.securePayments.description"),
    },
    {
      icon: Heart,
      title: t("benefits.makeConnections.title"),
      description: t("benefits.makeConnections.description"),
    },
    {
      icon: DollarSign,
      title: t("benefits.walletSystem.title"),
      description: t("benefits.walletSystem.description"),
    },
  ];

  const steps = [
    {
      number: "01",
      title: t("steps.createAccount.title"),
      description: t("steps.createAccount.description"),
    },
    {
      number: "02",
      title: t("steps.buildProfile.title"),
      description: t("steps.buildProfile.description"),
    },
    {
      number: "03",
      title: t("steps.listServices.title"),
      description: t("steps.listServices.description"),
    },
    {
      number: "04",
      title: t("steps.startEarning.title"),
      description: t("steps.startEarning.description"),
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
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">{t("hero.badge")}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {t("hero.titlePart1")} {t("hero.titlePart2")}
            </h1>

            <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto opacity-90">
              {t("hero.description")}{" "}
              <span className="font-semibold">
                {t("hero.descriptionBold")}
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <BecomeTaskerButton variant="gradient" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {t("stats.activeHelpers.value")}
                </div>
                <div className="text-white/80 text-sm mt-1">
                  {t("stats.activeHelpers.label")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  2M+ {getCurrencySymbol()}
                </div>
                <div className="text-white/80 text-sm mt-1">
                  {t("stats.earned.label")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {t("stats.averageRating.value")}
                </div>
                <div className="text-white/80 text-sm mt-1">
                  {t("stats.averageRating.label")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("benefitsSection.title")} {t("benefitsSection.titleHighlight")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              {t("benefitsSection.description")}
            </p>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 bg-white dark:bg-[var(--color-surface)] border-0"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  {benefit.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("howItWorks.title")} {t("howItWorks.titleHighlight")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              {t("howItWorks.description")}
            </p>
            <div className="w-20 h-1 bg-[var(--color-primary)] mx-auto rounded-full mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-xl transition-all duration-300 bg-white dark:bg-[var(--color-surface)] border-0 relative"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold mb-3 text-[var(--color-text-primary)]">
                  {step.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-light)] text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">{t("cta.badge")}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">
            {t("cta.title")} {t("cta.titleHighlight")}
          </h2>

          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed">
            {t("cta.description")}
          </p>

          <BecomeTaskerButton variant="white" />

          <p className="text-white/80 text-sm mt-6">
            {t("cta.features")}
          </p>
        </div>
      </section>
    </div>
  );
}
