import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center px-4 py-8">
      {/* Hero Section */}
      <section className="w-full max-w-3xl text-center mb-12">
        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ color: "var(--primary)" }}
        >
          {t("hero.title")}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-6">
          {t("hero.description")}
        </p>
        <Link href="/search/services">
          <Button size="lg" className="rounded-full px-8 py-4 text-lg">
            {t("hero.startSearching")}
          </Button>
        </Link>
      </section>

      {/* Advantages Section */}
      <section className="w-full max-w-4xl grid gap-6 md:grid-cols-3 mb-16">
        {ADVANTAGES.map((adv, idx) => (
          <Card
            key={idx}
            className="flex flex-col items-center p-6 text-center shadow-md h-full"
          >
            <div className="text-4xl mb-3" aria-hidden>
              {adv.icon}
            </div>
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: "var(--primary)" }}
            >
              {adv.title}
            </h2>
            <p className="text-base text-muted-foreground">{adv.description}</p>
          </Card>
        ))}
      </section>

      {/* Pricing Section */}
      <section className="w-full max-w-2xl mb-16">
        <Card className="p-8">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: "var(--primary)" }}
          >
            {t("pricing.title")}
          </h2>
          <p className="mb-6 text-muted-foreground">
            {t("pricing.description")}
          </p>
          <div className="space-y-4">
            {PRICING_ESTIMATES.map((item, idx) => (
              <div
                key={idx}
                className="bg-accent/30 rounded-lg p-5 sm:p-6 border border-border/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
                  {/* Service Name */}
                  <h3 className="font-semibold text-lg sm:text-xl text-foreground">
                    {item.service}
                  </h3>
                  
                  {/* Price Range */}
                  <div className="flex-shrink-0">
                    <span className="text-primary font-bold text-lg sm:text-xl">
                      {item.range}
                    </span>
                  </div>
                </div>
                
                {/* Note */}
                <p className="text-sm text-muted-foreground leading-relaxed pt-2 border-t border-border/30">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Call to Action */}
      <section className="w-full max-w-2xl text-center">
        <h3 className="text-xl font-semibold mb-4">
          {t("cta.title")}
        </h3>
        <GetStartedButton locale={locale} />
      </section>
    </main>
  );
}
