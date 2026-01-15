import React from "react";
import BecomeTaskerButton from "@/components/buttons/BecomeTaskerButton";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-teal-600/10 dark:from-blue-400/5 dark:to-teal-400/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in-up">
              <Sparkles className="h-4 w-4" />
              {t("hero.badge")}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up animate-delay-100">
              <span className="gradient-text">{t("hero.titlePart1")}</span>
              <br />
              {t("hero.titlePart2")}
            </h1>

            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200">
              {t("hero.description")}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {" "}
                {t("hero.descriptionBold")}
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animate-delay-300">
              <BecomeTaskerButton variant="gradient" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up animate-delay-400">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {t("stats.activeHelpers.value")}
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  {t("stats.activeHelpers.label")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                  2M+ {getCurrencySymbol()}
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  {t("stats.earned.label")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {t("stats.averageRating.value")}
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  {t("stats.averageRating.label")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 sm:py-24 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("benefitsSection.title")} <span className="gradient-text">{t("benefitsSection.titleHighlight")}</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {t("benefitsSection.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift border border-slate-200 dark:border-slate-700"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("howItWorks.title")} <span className="gradient-text">{t("howItWorks.titleHighlight")}</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {t("howItWorks.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-teal-200 dark:from-blue-700 dark:to-teal-700 transform translate-x-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 sm:py-24 bg-gradient-to-r from-blue-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            {t("cta.badge")}
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            {t("cta.title")}
            <br />
            <span className="text-yellow-300">{t("cta.titleHighlight")}</span>
          </h2>

          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t("cta.description")}
          </p>

          <BecomeTaskerButton variant="white" />

          <p className="text-blue-100 text-sm mt-4">
            {t("cta.features")}
          </p>
        </div>
      </div>
    </div>
  );
}
