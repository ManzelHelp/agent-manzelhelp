import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import {
  Shield,
  CheckCircle,
  Users,
  AlertTriangle,
  MessageCircle,
  Sparkles,
  Info,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "safety" });

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

export default async function SafetyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("safety");

  const safetyFeatures = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: t("safetyFeatures.verification.title"),
      description: t("safetyFeatures.verification.description"),
      details: t.raw("safetyFeatures.verification.details"),
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t("safetyFeatures.reviews.title"),
      description: t("safetyFeatures.reviews.description"),
      details: t.raw("safetyFeatures.reviews.details"),
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: t("safetyFeatures.communication.title"),
      description: t("safetyFeatures.communication.description"),
      details: t.raw("safetyFeatures.communication.details"),
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: t("safetyFeatures.support.title"),
      description: t("safetyFeatures.support.description"),
      details: t.raw("safetyFeatures.support.details"),
    },
  ];

  const verificationSteps = [
    {
      step: "1",
      title: t("verificationProcess.steps.identity.title"),
      description: t("verificationProcess.steps.identity.description"),
    },
    {
      step: "2",
      title: t("verificationProcess.steps.profile.title"),
      description: t("verificationProcess.steps.profile.description"),
    },
    {
      step: "3",
      title: t("verificationProcess.steps.skills.title"),
      description: t("verificationProcess.steps.skills.description"),
    },
    {
      step: "4",
      title: t("verificationProcess.steps.contact.title"),
      description: t("verificationProcess.steps.contact.description"),
    },
  ];

  const safetyTips = [
    {
      title: t("safetyTips.forCustomers.title"),
      icon: "👥",
      tips: t.raw("safetyTips.forCustomers.tips"),
    },
    {
      title: t("safetyTips.forTaskers.title"),
      icon: "🔧",
      tips: t.raw("safetyTips.forTaskers.tips"),
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)]"
              asChild
            >
              <Link href="/contact">{t("hero.reportIssue")}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/help">{t("hero.learnMore")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Platform Disclaimer - Important */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-yellow-50 dark:bg-yellow-900/20 border-y-2 border-yellow-200 dark:border-yellow-800">
        <div className="max-w-6xl mx-auto">
          <Card className="border-2 border-yellow-400 dark:border-yellow-600 bg-yellow-100 dark:bg-yellow-900/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-yellow-900 dark:text-yellow-200">
                <Info className="w-6 h-6" />
                {t("platformDisclaimer.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-900 dark:text-yellow-200 mb-4 font-semibold">
                {t("platformDisclaimer.description")}
              </p>
              <ul className="space-y-2 text-yellow-800 dark:text-yellow-300">
                {t.raw("platformDisclaimer.points").map((point: string, index: number) => (
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

      {/* Safety Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("safetyFeatures.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-4">
              {t("safetyFeatures.subtitle")}
            </p>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {safetyFeatures.map((feature, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-xl transition-all duration-300 bg-white dark:bg-[var(--color-surface)] border-0"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  {feature.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="text-xs text-[var(--color-text-secondary)] space-y-1">
                  {feature.details.map((detail: string, detailIndex: number) => (
                    <li key={detailIndex} className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-[var(--color-secondary)] flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("verificationProcess.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              {t("verificationProcess.description")}
            </p>
            <div className="w-20 h-1 bg-[var(--color-primary)] mx-auto rounded-full mt-4"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {verificationSteps.map((step, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-xl transition-all duration-300 bg-white dark:bg-[var(--color-surface)] border-0"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  {step.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("safetyTips.title")}
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {safetyTips.map((section, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 bg-white dark:bg-[var(--color-surface)] border-0"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[var(--color-text-primary)]">
                    <span className="text-2xl">{section.icon}</span>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.tips.map((tip: string, tipIndex: number) => (
                      <li key={tipIndex} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[var(--color-secondary)] flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--color-text-secondary)] leading-relaxed">
                          {tip}
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

      {/* Legal Disclaimer */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-[var(--color-border)] bg-white dark:bg-[var(--color-surface)]">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
                {t("legalDisclaimer.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                {t("legalDisclaimer.description")}
              </p>
              <div className="bg-[var(--color-bg)] p-4 rounded-lg border border-[var(--color-border)]">
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {t("legalDisclaimer.content")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
            {t("contact.title")}
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
            {t("contact.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
              asChild
            >
              <Link href="/contact">{t("contact.contactSupport")}</Link>
            </Button>
            <Button
              size="lg"
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
              asChild
            >
              <Link href="/help">{t("contact.reportIssue")}</Link>
            </Button>
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
              <Link href="/sign-up">{t("cta.getStarted")}</Link>
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
