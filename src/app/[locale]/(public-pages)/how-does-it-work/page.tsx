import React from "react";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  CheckCircle,
  Star,
  Shield,
  Clock,
  Users,
  ArrowRight,
  Sparkles,
  Target,
  Heart,
  UserPlus,
  Briefcase,
  FileText,
  CheckCircle2,
  Calendar,
  DollarSign,
  MessageSquare,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "howDoesItWork" });

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

export default async function HowItWorksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("howDoesItWork");

  // Helper function for step labels
  const getStepLabel = (stepNumber: number) => {
    switch (locale) {
      case "ar":
        return `الخطوة ${stepNumber}`;
      case "fr":
        return `Étape ${stepNumber}`;
      case "de":
        return `Schritt ${stepNumber}`;
      default:
        return `Step ${stepNumber}`;
    }
  };

  const customerSteps = [
    {
      icon: FileText,
      title: t("customerGuide.steps.postJob.title"),
      description: t("customerGuide.steps.postJob.description"),
      details: t.raw("customerGuide.steps.postJob.details") as string[],
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: Users,
      title: t("customerGuide.steps.reviewApplications.title"),
      description: t("customerGuide.steps.reviewApplications.description"),
      details: t.raw("customerGuide.steps.reviewApplications.details") as string[],
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      icon: MessageCircle,
      title: t("customerGuide.steps.connectDiscuss.title"),
      description: t("customerGuide.steps.connectDiscuss.description"),
      details: t.raw("customerGuide.steps.connectDiscuss.details") as string[],
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      icon: CheckCircle,
      title: t("customerGuide.steps.getItDone.title"),
      description: t("customerGuide.steps.getItDone.description"),
      details: t.raw("customerGuide.steps.getItDone.details") as string[],
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  const taskerSteps = [
    {
      icon: UserPlus,
      title: t("taskerGuide.steps.signUp.title"),
      description: t("taskerGuide.steps.signUp.description"),
      details: t.raw("taskerGuide.steps.signUp.details") as string[],
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: Briefcase,
      title: t("taskerGuide.steps.setUpServices.title"),
      description: t("taskerGuide.steps.setUpServices.description"),
      details: t.raw("taskerGuide.steps.setUpServices.details") as string[],
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      icon: MessageSquare,
      title: t("taskerGuide.steps.communicateBook.title"),
      description: t("taskerGuide.steps.communicateBook.description"),
      details: t.raw("taskerGuide.steps.communicateBook.details") as string[],
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      icon: DollarSign,
      title: t("taskerGuide.steps.completeGetPaid.title"),
      description: t("taskerGuide.steps.completeGetPaid.description"),
      details: t.raw("taskerGuide.steps.completeGetPaid.details") as string[],
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  const customerFeatures = [
    {
      icon: FileText,
      title: t("customerBenefits.features.postJobs.title"),
      description: t("customerBenefits.features.postJobs.description"),
      benefits: t.raw("customerBenefits.features.postJobs.benefits") as string[],
    },
    {
      icon: MessageCircle,
      title: t("customerBenefits.features.directMessaging.title"),
      description: t("customerBenefits.features.directMessaging.description"),
      benefits: t.raw("customerBenefits.features.directMessaging.benefits") as string[],
    },
    {
      icon: Shield,
      title: t("customerBenefits.features.securePayments.title"),
      description: t("customerBenefits.features.securePayments.description"),
      benefits: t.raw("customerBenefits.features.securePayments.benefits") as string[],
    },
    {
      icon: Star,
      title: t("customerBenefits.features.qualityAssurance.title"),
      description: t("customerBenefits.features.qualityAssurance.description"),
      benefits: t.raw("customerBenefits.features.qualityAssurance.benefits") as string[],
    },
  ];

  const taskerFeatures = [
    {
      icon: Briefcase,
      title: t("taskerBenefits.features.dualOpportunities.title"),
      description: t("taskerBenefits.features.dualOpportunities.description"),
      benefits: t.raw("taskerBenefits.features.dualOpportunities.benefits") as string[],
    },
    {
      icon: CheckCircle2,
      title: t("taskerBenefits.features.verificationProcess.title"),
      description: t("taskerBenefits.features.verificationProcess.description"),
      benefits: t.raw("taskerBenefits.features.verificationProcess.benefits") as string[],
    },
    {
      icon: Calendar,
      title: t("taskerBenefits.features.flexibleSchedule.title"),
      description: t("taskerBenefits.features.flexibleSchedule.description"),
      benefits: t.raw("taskerBenefits.features.flexibleSchedule.benefits") as string[],
    },
    {
      icon: DollarSign,
      title: t("taskerBenefits.features.secureEarnings.title"),
      description: t("taskerBenefits.features.secureEarnings.description"),
      benefits: t.raw("taskerBenefits.features.secureEarnings.benefits") as string[],
    },
  ];

  const platformFeatures = [
    {
      icon: Shield,
      title: t("platformFeatures.features.secureSafe.title"),
      description: t("platformFeatures.features.secureSafe.description"),
    },
    {
      icon: Star,
      title: t("platformFeatures.features.qualityAssured.title"),
      description: t("platformFeatures.features.qualityAssured.description"),
    },
    {
      icon: Clock,
      title: t("platformFeatures.features.quickEasy.title"),
      description: t("platformFeatures.features.quickEasy.description"),
    },
    {
      icon: Users,
      title: t("platformFeatures.features.communityDriven.title"),
      description: t("platformFeatures.features.communityDriven.description"),
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
            <span className="text-sm font-medium">{t("hero.subtitle")}</span>
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
            <Link href="/sign-up">
              {t("hero.getStarted")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("overview.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-4">
              {t("overview.subtitle")}
            </p>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* For Customers */}
            <Card className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[var(--color-text-primary)]">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  {t("overview.forCustomers.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--color-text-secondary)] mb-4">
                  {t("overview.forCustomers.description")}
                </p>
                <ul className="space-y-2">
                  {t.raw("overview.forCustomers.features").map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* For Taskers */}
            <Card className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[var(--color-text-primary)]">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Heart className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  {t("overview.forTaskers.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--color-text-secondary)] mb-4">
                  {t("overview.forTaskers.description")}
                </p>
                <ul className="space-y-2">
                  {t.raw("overview.forTaskers.features").map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer Step-by-Step Guide */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("customerGuide.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-4">
              {t("customerGuide.subtitle")}
            </p>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {customerSteps.map((step, index) => (
              <Card
                key={index}
                className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm"
              >
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 ${step.bgColor} rounded-full flex-shrink-0`}
                    >
                      <step.icon className={`h-6 w-6 ${step.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                          {getStepLabel(index + 1)}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                        {step.title}
                      </h3>
                      <p className="text-[var(--color-text-secondary)] mb-4">
                        {step.description}
                      </p>
                      <ul className="space-y-1">
                        {step.details.map((detail, detailIndex) => (
                          <li
                            key={detailIndex}
                            className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"
                          >
                            <div className="w-1.5 h-1.5 bg-[var(--color-secondary)] rounded-full flex-shrink-0"></div>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tasker Step-by-Step Guide */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("taskerGuide.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-4">
              {t("taskerGuide.subtitle")}
            </p>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {taskerSteps.map((step, index) => (
              <Card
                key={index}
                className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm"
              >
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 ${step.bgColor} rounded-full flex-shrink-0`}
                    >
                      <step.icon className={`h-6 w-6 ${step.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                          {getStepLabel(index + 1)}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                        {step.title}
                      </h3>
                      <p className="text-[var(--color-text-secondary)] mb-4">
                        {step.description}
                      </p>
                      <ul className="space-y-1">
                        {step.details.map((detail, detailIndex) => (
                          <li
                            key={detailIndex}
                            className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"
                          >
                            <div className="w-1.5 h-1.5 bg-[var(--color-secondary)] rounded-full flex-shrink-0"></div>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("customerBenefits.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-4">
              {t("customerBenefits.subtitle")}
            </p>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {customerFeatures.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--color-secondary)]/10 rounded-full mb-4">
                    <feature.icon className="h-6 w-6 text-[var(--color-secondary)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                    {feature.description}
                  </p>
                  <ul className="space-y-1">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li
                        key={benefitIndex}
                        className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]"
                      >
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tasker Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("taskerBenefits.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-4">
              {t("taskerBenefits.subtitle")}
            </p>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {taskerFeatures.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--color-secondary)]/10 rounded-full mb-4">
                    <feature.icon className="h-6 w-6 text-[var(--color-secondary)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                    {feature.description}
                  </p>
                  <ul className="space-y-1">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li
                        key={benefitIndex}
                        className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]"
                      >
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("platformFeatures.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-4">
              {t("platformFeatures.subtitle")}
            </p>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformFeatures.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm text-center"
              >
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--color-secondary)]/10 rounded-full mb-4">
                    <feature.icon className="h-6 w-6 text-[var(--color-secondary)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Two Ways to Connect */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("twoWays.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-4">
              {t("twoWays.subtitle")}
            </p>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Post Job Method */}
            <Card className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[var(--color-text-primary)]">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  {t("twoWays.postJob.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--color-text-secondary)] mb-4">
                  {t("twoWays.postJob.description")}
                </p>
                <ul className="space-y-2">
                  {t.raw("twoWays.postJob.benefits").map((benefit: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                      <CheckCircle className="h-4 w-4 text-[var(--color-secondary)] flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Direct Booking Method */}
            <Card className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[var(--color-text-primary)]">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  {t("twoWays.bookDirectly.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--color-text-secondary)] mb-4">
                  {t("twoWays.bookDirectly.description")}
                </p>
                <ul className="space-y-2">
                  {t.raw("twoWays.bookDirectly.benefits").map((benefit: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                      <CheckCircle className="h-4 w-4 text-[var(--color-secondary)] flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm text-center">
            <CardContent className="p-8 sm:p-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
                {t("cta.title")}
              </h2>
              <p className="text-lg text-[var(--color-text-secondary)] mb-8">
                {t("cta.description")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
                    {t("cta.needHelp.title")}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                    {t("cta.needHelp.description")}
                  </p>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    asChild
                  >
                    <Link href="/sign-up">
                      {t("cta.needHelp.button")}
                    </Link>
                  </Button>
                </div>

                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
                    {t("cta.wantToEarn.title")}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                    {t("cta.wantToEarn.description")}
                  </p>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    asChild
                  >
                    <Link href="/become-a-helper">
                      {t("cta.wantToEarn.button")}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
