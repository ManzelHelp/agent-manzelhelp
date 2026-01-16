import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  CheckCircle,
  Star,
  DollarSign,
  Clock,
  Users,
  Shield,
  Zap,
  Sparkles,
  AlertTriangle,
  Info,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "taskerGuide" });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    openGraph: {
      title: t("metadata.title"),
      description: t("metadata.description"),
      locale: locale,
      type: "website",
    },
  };
}

export default async function TaskerGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("taskerGuide");

  const gettingStartedSteps = [
    {
      step: "1",
      title: t("gettingStarted.steps.createAccount.title"),
      description: t("gettingStarted.steps.createAccount.description"),
      details: t.raw("gettingStarted.steps.createAccount.details"),
      icon: <Users className="w-6 h-6" />,
    },
    {
      step: "2",
      title: t("gettingStarted.steps.verification.title"),
      description: t("gettingStarted.steps.verification.description"),
      details: t.raw("gettingStarted.steps.verification.details"),
      icon: <Shield className="w-6 h-6" />,
    },
    {
      step: "3",
      title: t("gettingStarted.steps.buildProfile.title"),
      description: t("gettingStarted.steps.buildProfile.description"),
      details: t.raw("gettingStarted.steps.buildProfile.details"),
      icon: <Star className="w-6 h-6" />,
    },
    {
      step: "4",
      title: t("gettingStarted.steps.startEarning.title"),
      description: t("gettingStarted.steps.startEarning.description"),
      details: t.raw("gettingStarted.steps.startEarning.details"),
      icon: <DollarSign className="w-6 h-6" />,
    },
  ];

  const successTips = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: t("successTips.beResponsive.title"),
      description: t("successTips.beResponsive.description"),
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: t("successTips.maintainQuality.title"),
      description: t("successTips.maintainQuality.description"),
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t("successTips.buildRelationships.title"),
      description: t("successTips.buildRelationships.description"),
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t("successTips.stayActive.title"),
      description: t("successTips.stayActive.description"),
    },
  ];

  const earningServices = [
    {
      name: t("earningPotential.services.cleaning.name"),
      description: t("earningPotential.services.cleaning.description"),
      hourlyRate: t("earningPotential.services.cleaning.hourlyRate"),
      monthlyPotential: t("earningPotential.services.cleaning.monthlyPotential"),
    },
    {
      name: t("earningPotential.services.handyman.name"),
      description: t("earningPotential.services.handyman.description"),
      hourlyRate: t("earningPotential.services.handyman.hourlyRate"),
      monthlyPotential: t("earningPotential.services.handyman.monthlyPotential"),
    },
    {
      name: t("earningPotential.services.petcare.name"),
      description: t("earningPotential.services.petcare.description"),
      hourlyRate: t("earningPotential.services.petcare.hourlyRate"),
      monthlyPotential: t("earningPotential.services.petcare.monthlyPotential"),
    },
    {
      name: t("earningPotential.services.tutoring.name"),
      description: t("earningPotential.services.tutoring.description"),
      hourlyRate: t("earningPotential.services.tutoring.hourlyRate"),
      monthlyPotential: t("earningPotential.services.tutoring.monthlyPotential"),
    },
  ];

  const importantNotes = t.raw("importantNotes.points");

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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)]"
              asChild
            >
              <Link href="/become-a-helper">
                {t("hero.startJourney")}
                <ArrowRight className={locale === "ar" ? "mr-2 h-5 w-5" : "ml-2 h-5 w-5"} />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/help">{t("hero.downloadGuide")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Important Notes - Platform Disclaimer */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-yellow-50 dark:bg-yellow-900/20 border-y-2 border-yellow-200 dark:border-yellow-800">
        <div className="max-w-6xl mx-auto">
          <Card className="border-2 border-yellow-400 dark:border-yellow-600 bg-yellow-100 dark:bg-yellow-900/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-yellow-900 dark:text-yellow-200">
                <Info className="w-6 h-6" />
                {t("importantNotes.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-900 dark:text-yellow-200 mb-4 font-semibold">
                {t("importantNotes.description")}
              </p>
              <ul className="space-y-2 text-yellow-800 dark:text-yellow-300">
                {importantNotes.map((point: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Getting Started Steps */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("gettingStarted.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              {t("gettingStarted.description")}
            </p>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full mt-4"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {gettingStartedSteps.map((step, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 bg-white dark:bg-[var(--color-surface)] border-0"
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-full flex items-center justify-center text-white">
                      {step.icon}
                    </div>
                    <div>
                      <div className="text-sm text-[var(--color-primary)] font-semibold">
                        {t("common.step")} {step.step}
                      </div>
                      <CardTitle className="text-xl text-[var(--color-text-primary)]">
                        {step.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                    {step.description}
                  </p>
                  <ul className="space-y-2">
                    {step.details.map((detail: string, detailIndex: number) => (
                      <li key={detailIndex} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[var(--color-secondary)] flex-shrink-0" />
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Tips */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("successTips.title")}
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {successTips.map((tip, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-xl transition-all duration-300 bg-white dark:bg-[var(--color-surface)] border-0"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {tip.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  {tip.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  {tip.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Earning Potential */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("earningPotential.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              {t("earningPotential.description")}
            </p>
            <div className="w-20 h-1 bg-[var(--color-primary)] mx-auto rounded-full mt-4"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {earningServices.map((service, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-xl transition-all duration-300 bg-white dark:bg-[var(--color-surface)] border-0"
              >
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  {service.name}
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm mb-4 leading-relaxed">
                  {service.description}
                </p>
                <div className="space-y-2">
                  <div>
                    <div className="text-2xl font-bold text-[var(--color-primary)]">
                      {service.hourlyRate}
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      {t("earningPotential.perHour")}
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-[var(--color-secondary)]">
                      {service.monthlyPotential}
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      {t("earningPotential.monthlyPotential")}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("requirements.title")}
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-white dark:bg-[var(--color-surface)] border-0">
              <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
                {t("requirements.basic.title")}
              </h3>
              <ul className="space-y-3">
                {t.raw("requirements.basic.items").map((item: string, index: number) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-secondary)] flex-shrink-0" />
                    <span className="text-[var(--color-text-secondary)] leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-white dark:bg-[var(--color-surface)] border-0">
              <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
                {t("requirements.whatYouNeed.title")}
              </h3>
              <ul className="space-y-3">
                {t.raw("requirements.whatYouNeed.items").map((item: string, index: number) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-secondary)] flex-shrink-0" />
                    <span className="text-[var(--color-text-secondary)] leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-light)] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-lg mb-8 opacity-90 leading-relaxed max-w-2xl mx-auto">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/become-a-helper">
                {t("cta.becomeTasker")}
                <ArrowRight className={locale === "ar" ? "mr-2 h-5 w-5" : "ml-2 h-5 w-5"} />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-white text-[var(--color-secondary)] hover:bg-white/90"
              asChild
            >
              <Link href="/help">{t("cta.learnMore")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
