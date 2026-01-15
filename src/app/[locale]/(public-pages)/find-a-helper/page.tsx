import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Sparkles, Check, ArrowRight } from "lucide-react";
import GetStartedButton from "./GetStartedButton";

interface FindAHelperPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FindAHelperPage({
  params,
}: FindAHelperPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "findAHelper" });

  const ADVANTAGES = [
    {
      title: t("advantages.freeForCustomers.title"),
      description: t("advantages.freeForCustomers.description"),
      icon: "🎁",
    },
    {
      title: t("advantages.verifiedTrusted.title"),
      description: t("advantages.verifiedTrusted.description"),
      icon: "✅",
    },
    {
      title: t("advantages.flexibleFast.title"),
      description: t("advantages.flexibleFast.description"),
      icon: "⚡",
    },
    {
      title: t("advantages.wideRange.title"),
      description: t("advantages.wideRange.description"),
      icon: "🛠️",
    },
  ];

  // Get currency symbol based on locale
  const getCurrencySymbol = () => {
    return locale === "ar" ? "د.م." : "MAD";
  };

  const PRICING_ESTIMATES = [
    {
      service: t("pricing.cleaning.service"),
      range: `15 - 25 ${getCurrencySymbol()} / ${t("pricing.perHour")}`,
      note: t("pricing.cleaning.note"),
    },
    {
      service: t("pricing.handyman.service"),
      range: `20 - 40 ${getCurrencySymbol()} / ${t("pricing.perHour")}`,
      note: t("pricing.handyman.note"),
    },
    {
      service: t("pricing.gardening.service"),
      range: `18 - 30 ${getCurrencySymbol()} / ${t("pricing.perHour")}`,
      note: t("pricing.gardening.note"),
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
            <Link href="/search/services">
              {t("hero.startSearching")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("advantages.title")}
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ADVANTAGES.map((adv, idx) => (
              <Card
                key={idx}
                className="p-6 text-center hover:shadow-xl transition-all duration-300 bg-white dark:bg-[var(--color-surface)] border-0"
              >
                <div className="text-4xl mb-4" aria-hidden>
                  {adv.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  {adv.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  {adv.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("pricing.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-4">
              {t("pricing.description")}
            </p>
            <div className="w-20 h-1 bg-[var(--color-primary)] mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_ESTIMATES.map((item, idx) => (
              <Card
                key={idx}
                className="p-6 hover:shadow-xl transition-all duration-300 bg-white dark:bg-[var(--color-surface)] border-0"
              >
                <h3 className="text-lg font-semibold mb-3 text-[var(--color-text-primary)]">
                  {item.service}
                </h3>
                <div className="mb-4">
                  <span className="text-[var(--color-primary)] font-bold text-xl">
                    {item.range}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed pt-3 border-t border-[var(--color-border)]">
                  {item.note}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-6">
            {t("cta.title")}
          </h2>
          <GetStartedButton locale={locale} />
        </div>
      </section>
    </div>
  );
}
