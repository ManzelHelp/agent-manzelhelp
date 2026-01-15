import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Check,
  Star,
  Clock,
  Shield,
  Users,
  Zap,
  Wallet,
  Gift,
  ArrowRight,
  Target,
  DollarSign,
  TrendingUp,
  Lock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });

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

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pricing");

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">{t("hero.title")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            {t("hero.title")}
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            {t("hero.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white"
              asChild
            >
              <Link href="/search/services">{t("hero.findServices")}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/become-a-helper">{t("hero.becomeTasker")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How Pricing Works */}
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

          <div className="grid lg:grid-cols-2 gap-8">
            {/* For Customers */}
            <Card className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[var(--color-text-primary)]">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  {t("howItWorks.forCustomers.title")}
                </CardTitle>
                <p className="text-[var(--color-text-secondary)] mt-2">
                  {t("howItWorks.forCustomers.description")}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-[var(--color-surface)] dark:bg-[var(--color-bg)] rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Target className="h-4 w-4 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">
                        {t("howItWorks.forCustomers.setYourBudget.title")}
                      </h4>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {t("howItWorks.forCustomers.setYourBudget.description")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-[var(--color-surface)] dark:bg-[var(--color-bg)] rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[var(--color-secondary)]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="h-4 w-4 text-[var(--color-secondary)]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">
                        {t("howItWorks.forCustomers.bookDirectly.title")}
                      </h4>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {t("howItWorks.forCustomers.bookDirectly.description")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">
                        {t("howItWorks.forCustomers.noFees.title")}
                      </h4>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {t("howItWorks.forCustomers.noFees.description")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* For Taskers */}
            <Card className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[var(--color-text-primary)]">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  {t("howItWorks.forTaskers.title")}
                </CardTitle>
                <p className="text-[var(--color-text-secondary)] mt-2">
                  {t("howItWorks.forTaskers.description")}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-[var(--color-surface)] dark:bg-[var(--color-bg)] rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <DollarSign className="h-4 w-4 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">
                        {t("howItWorks.forTaskers.setYourPrices.title")}
                      </h4>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {t("howItWorks.forTaskers.setYourPrices.description")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-[var(--color-surface)] dark:bg-[var(--color-bg)] rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[var(--color-secondary)]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TrendingUp className="h-4 w-4 text-[var(--color-secondary)]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">
                        {t("howItWorks.forTaskers.applyToJobs.title")}
                      </h4>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {t("howItWorks.forTaskers.applyToJobs.description")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">
                        {t("howItWorks.forTaskers.platformFee.title")}
                      </h4>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {t("howItWorks.forTaskers.platformFee.description")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Wallet System Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[var(--color-secondary)]/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-[var(--color-secondary)]/20">
              <Wallet className="h-5 w-5 text-[var(--color-secondary)]" />
              <span className="text-sm font-semibold text-[var(--color-secondary)]">
                {t("walletSystem.title")}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("walletSystem.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-3xl mx-auto mb-4">
              {t("walletSystem.subtitle")}
            </p>
            <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              {t("walletSystem.description")}
            </p>
          </div>

          {/* Free Credits Offer */}
          <Card className="mb-12 border-2 border-[var(--color-secondary)] bg-gradient-to-br from-[var(--color-secondary)]/10 to-[var(--color-secondary)]/5 dark:from-[var(--color-secondary)]/20 dark:to-[var(--color-secondary)]/10">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-dark)] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Gift className="h-10 w-10 text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {t("walletSystem.freeCredits.badge")}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                    {t("walletSystem.freeCredits.title")}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] mb-4">
                    {t("walletSystem.freeCredits.description")}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white"
                      asChild
                    >
                      <Link href="/become-a-helper">
                        {t("walletSystem.freeCredits.claimNow")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How Wallet Works */}
          <div className="mb-12">
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 text-center">
              {t("walletSystem.howItWorks.title")}
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center p-6 border-0 shadow-lg bg-white/95 dark:bg-[var(--color-surface)]">
                <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    1
                  </div>
                </div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                  {t("walletSystem.howItWorks.step1.title")}
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t("walletSystem.howItWorks.step1.description")}
                </p>
              </Card>
              <Card className="text-center p-6 border-0 shadow-lg bg-white/95 dark:bg-[var(--color-surface)]">
                <div className="w-16 h-16 bg-[var(--color-secondary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-12 h-12 bg-[var(--color-secondary)] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    2
                  </div>
                </div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                  {t("walletSystem.howItWorks.step2.title")}
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t("walletSystem.howItWorks.step2.description")}
                </p>
              </Card>
              <Card className="text-center p-6 border-0 shadow-lg bg-white/95 dark:bg-[var(--color-surface)]">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-12 h-12 bg-green-600 dark:bg-green-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    3
                  </div>
                </div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                  {t("walletSystem.howItWorks.step3.title")}
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t("walletSystem.howItWorks.step3.description")}
                </p>
              </Card>
            </div>
          </div>

          {/* Wallet Benefits */}
          <div>
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 text-center">
              {t("walletSystem.benefits.title")}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center border-0 shadow-lg bg-white/95 dark:bg-[var(--color-surface)]">
                <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                  {t("walletSystem.benefits.secure.title")}
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t("walletSystem.benefits.secure.description")}
                </p>
              </Card>
              <Card className="p-6 text-center border-0 shadow-lg bg-white/95 dark:bg-[var(--color-surface)]">
                <div className="w-12 h-12 bg-[var(--color-secondary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-[var(--color-secondary)]" />
                </div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                  {t("walletSystem.benefits.instant.title")}
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t("walletSystem.benefits.instant.description")}
                </p>
              </Card>
              <Card className="p-6 text-center border-0 shadow-lg bg-white/95 dark:bg-[var(--color-surface)]">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                  {t("walletSystem.benefits.flexible.title")}
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t("walletSystem.benefits.flexible.description")}
                </p>
              </Card>
              <Card className="p-6 text-center border-0 shadow-lg bg-white/95 dark:bg-[var(--color-surface)]">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                  {t("walletSystem.benefits.transparent.title")}
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t("walletSystem.benefits.transparent.description")}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Model Details */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("pricingModel.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-4">
              {t("pricingModel.subtitle")}
            </p>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Customer Model */}
            <Card className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[var(--color-text-primary)]">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  {t("pricingModel.customerModel.title")}
                </CardTitle>
                <p className="text-[var(--color-text-secondary)] mt-2">
                  {t("pricingModel.customerModel.description")}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-[var(--color-surface)] dark:bg-[var(--color-bg)] rounded-lg border-l-4 border-[var(--color-primary)]">
                  <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                    {t("pricingModel.customerModel.postJob.title")}
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                    {t("pricingModel.customerModel.postJob.description")}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] italic">
                    {t("pricingModel.customerModel.postJob.example")}
                  </p>
                </div>
                <div className="p-4 bg-[var(--color-surface)] dark:bg-[var(--color-bg)] rounded-lg border-l-4 border-[var(--color-secondary)]">
                  <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                    {t("pricingModel.customerModel.bookService.title")}
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                    {t("pricingModel.customerModel.bookService.description")}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] italic">
                    {t("pricingModel.customerModel.bookService.example")}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                    {t("pricingModel.customerModel.noFees.title")}
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {t("pricingModel.customerModel.noFees.description")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tasker Model */}
            <Card className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[var(--color-text-primary)]">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  {t("pricingModel.taskerModel.title")}
                </CardTitle>
                <p className="text-[var(--color-text-secondary)] mt-2">
                  {t("pricingModel.taskerModel.description")}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-[var(--color-surface)] dark:bg-[var(--color-bg)] rounded-lg border-l-4 border-[var(--color-primary)]">
                  <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                    {t("pricingModel.taskerModel.servicePrices.title")}
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                    {t("pricingModel.taskerModel.servicePrices.description")}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] italic">
                    {t("pricingModel.taskerModel.servicePrices.example")}
                  </p>
                </div>
                <div className="p-4 bg-[var(--color-surface)] dark:bg-[var(--color-bg)] rounded-lg border-l-4 border-[var(--color-secondary)]">
                  <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                    {t("pricingModel.taskerModel.jobProposals.title")}
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                    {t("pricingModel.taskerModel.jobProposals.description")}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] italic">
                    {t("pricingModel.taskerModel.jobProposals.example")}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">
                    {t("pricingModel.taskerModel.platformFee.title")}
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                    {t("pricingModel.taskerModel.platformFee.description")}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] italic">
                    {t("pricingModel.taskerModel.platformFee.example")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Real Examples */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("examples.title")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              {t("examples.subtitle")}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Example 1 */}
            <Card className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-[var(--color-text-primary)]">
                  {t("examples.example1.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    {t("examples.example1.scenario")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-[var(--color-secondary)]" />
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {t("examples.example1.taskers")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-[var(--color-secondary)]" />
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {t("examples.example1.customer")}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {t("examples.example1.tasker")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Example 2 */}
            <Card className="border-0 shadow-xl bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-[var(--color-text-primary)]">
                  {t("examples.example2.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    {t("examples.example2.scenario")}
                  </p>
                </div>
                <div className="p-3 bg-[var(--color-surface)] dark:bg-[var(--color-bg)] rounded-lg">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {t("examples.example2.total")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-[var(--color-secondary)]" />
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {t("examples.example2.customer")}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {t("examples.example2.tasker")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white"
              asChild
            >
              <Link href="/find-a-helper">{t("cta.findHelper")}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/become-a-helper">{t("cta.becomeTasker")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
