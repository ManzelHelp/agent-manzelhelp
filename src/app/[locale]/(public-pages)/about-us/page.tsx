import React from "react";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Heart,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Target,
  ArrowRight,
  Star,
  MapPin,
  Clock,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutUs" });

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

export default async function AboutUsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("aboutUs");

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
            <span className="text-sm font-medium">{t("hero.subtitle")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {t("hero.title")}
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto opacity-90">
            {t("hero.description")}
          </p>
        </div>
      </section>

      {/* Journey Story */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("journey.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-4">
              {t("journey.subtitle")}
            </p>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* The Beginning */}
            <Card className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="inline-block bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] text-xs font-semibold px-3 py-1 rounded-full mb-2">
                      {t("journey.beginning.badge")}
                    </div>
                    <CardTitle className="text-[var(--color-text-primary)]">
                      {t("journey.beginning.title")}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
                  {t("journey.beginning.description")}
                </p>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                    {t("journey.beginning.experience")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Growth */}
            <Card className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--color-secondary)]/5 rounded-full -translate-y-1/2 -translate-x-1/2"></div>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-dark)] rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-[var(--color-text-primary)]">
                    {t("journey.growth.title")}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
                  {t("journey.growth.description")}
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                    {t("journey.growth.vision")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mission */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 dark:from-[var(--color-primary)]/10 dark:to-[var(--color-secondary)]/10 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                    {t("journey.mission.title")}
                  </h3>
                  <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                    {t("journey.mission.description")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("values.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-4">
              {t("values.subtitle")}
            </p>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-white/95 dark:bg-[var(--color-surface)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {t("values.community.title")}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {t("values.community.description")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/95 dark:bg-[var(--color-surface)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[var(--color-secondary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-[var(--color-secondary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {t("values.trust.title")}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {t("values.trust.description")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/95 dark:bg-[var(--color-surface)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {t("values.opportunity.title")}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {t("values.opportunity.description")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/95 dark:bg-[var(--color-surface)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {t("values.innovation.title")}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {t("values.innovation.description")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("howItWorks.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-4">
              {t("howItWorks.subtitle")}
            </p>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-white/95 dark:bg-[var(--color-surface)] text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {t("howItWorks.step1.title")}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t("howItWorks.step1.description")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/95 dark:bg-[var(--color-surface)] text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-dark)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {t("howItWorks.step2.title")}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t("howItWorks.step2.description")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/95 dark:bg-[var(--color-surface)] text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {t("howItWorks.step3.title")}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t("howItWorks.step3.description")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/95 dark:bg-[var(--color-surface)] text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-dark)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">4</span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {t("howItWorks.step4.title")}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t("howItWorks.step4.description")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[var(--color-secondary)]/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-[var(--color-secondary)]/20">
              <MapPin className="h-5 w-5 text-[var(--color-secondary)]" />
              <span className="text-sm font-semibold text-[var(--color-secondary)]">
                {t("impact.title")}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("impact.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              {t("impact.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent dark:from-[var(--color-primary)]/10 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-10 w-10 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
                  {t("impact.earners.title")}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {t("impact.earners.description")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-[var(--color-secondary)]/5 to-transparent dark:from-[var(--color-secondary)]/10 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-[var(--color-secondary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-10 w-10 text-[var(--color-secondary)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
                  {t("impact.services.title")}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {t("impact.services.description")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-100/50 to-transparent dark:from-green-900/20 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
                  {t("impact.local.title")}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {t("impact.local.description")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Future Vision */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
            <Star className="h-4 w-4" />
            <span className="text-sm font-medium">{t("future.title")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            {t("future.title")}
          </h2>
          <p className="text-lg mb-4 opacity-90 leading-relaxed max-w-3xl mx-auto">
            {t("future.subtitle")}
          </p>
          <p className="text-lg mb-8 opacity-90 leading-relaxed max-w-3xl mx-auto">
            {t("future.description")}
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
            <Heart className="h-5 w-5" />
            <span className="font-medium">{t("future.joinUs")}</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto leading-relaxed">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white"
              asChild
            >
              <Link href="/sign-up">
                {t("cta.getStarted")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
              asChild
            >
              <Link href="/search/services">
                {t("cta.exploreServices")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
