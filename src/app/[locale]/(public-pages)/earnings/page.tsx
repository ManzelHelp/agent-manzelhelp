"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calculator,
  DollarSign,
  Clock,
  TrendingUp,
  Star,
  Users,
} from "lucide-react";

export default function EarningsPage() {
  const t = useTranslations("earnings");

  const SERVICE_CATEGORIES = useMemo(
    () => [
      {
        id: "cleaning",
        name: t("services.cleaning.name"),
        icon: "🧹",
        baseRate: 20,
        minRate: 15,
        maxRate: 35,
        description: t("services.cleaning.description"),
      },
      {
        id: "handyman",
        name: t("services.handyman.name"),
        icon: "🔧",
        baseRate: 30,
        minRate: 20,
        maxRate: 50,
        description: t("services.handyman.description"),
      },
      {
        id: "petcare",
        name: t("services.petcare.name"),
        icon: "🐕",
        baseRate: 16,
        minRate: 12,
        maxRate: 25,
        description: t("services.petcare.description"),
      },
      {
        id: "tutoring",
        name: t("services.tutoring.name"),
        icon: "📚",
        baseRate: 30,
        minRate: 20,
        maxRate: 50,
        description: t("services.tutoring.description"),
      },
      {
        id: "gardening",
        name: t("services.gardening.name"),
        icon: "🌱",
        baseRate: 18,
        minRate: 15,
        maxRate: 30,
        description: t("services.gardening.description"),
      },
      {
        id: "delivery",
        name: t("services.delivery.name"),
        icon: "📦",
        baseRate: 15,
        minRate: 10,
        maxRate: 25,
        description: t("services.delivery.description"),
      },
    ],
    [t]
  );

  const [selectedService, setSelectedService] = useState(() => SERVICE_CATEGORIES[0]);
  const [hourlyRate, setHourlyRate] = useState(() => SERVICE_CATEGORIES[0].baseRate);
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [weeksPerMonth, setWeeksPerMonth] = useState(4);

  const handleServiceChange = (service: (typeof SERVICE_CATEGORIES)[0]) => {
    setSelectedService(service);
    setHourlyRate(service.baseRate);
  };

  const weeklyEarnings = hourlyRate * hoursPerWeek;
  const monthlyEarnings = weeklyEarnings * weeksPerMonth;
  const yearlyEarnings = monthlyEarnings * 12;
  const platformFee = 0.1; // 10% platform fee
  const netMonthlyEarnings = monthlyEarnings * (1 - platformFee);
  const netYearlyEarnings = yearlyEarnings * (1 - platformFee);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            {t("hero.title")}
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            {t("hero.description")}
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  {t("calculator.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-[var(--color-text-primary)]">
                    {t("calculator.selectServiceCategory")}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SERVICE_CATEGORIES.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleServiceChange(service)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selectedService.id === service.id
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                            : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{service.icon}</span>
                          <div>
                            <div className="font-medium text-[var(--color-text-primary)]">
                              {service.name}
                            </div>
                            <div className="text-xs text-[var(--color-text-secondary)]">
                              {service.minRate}-{service.maxRate} {t("calculator.perHour")}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hourly Rate */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--color-text-primary)]">
                    {t("calculator.hourlyRate")}
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    min={selectedService.minRate}
                    max={selectedService.maxRate}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                  <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                    {t("calculator.range", { min: selectedService.minRate, max: selectedService.maxRate })}
                  </div>
                </div>

                {/* Hours Per Week */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--color-text-primary)]">
                    {t("calculator.hoursPerWeek")}
                  </label>
                  <input
                    type="number"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                    min="1"
                    max="60"
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                {/* Weeks Per Month */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--color-text-primary)]">
                    {t("calculator.weeksPerMonth")}
                  </label>
                  <input
                    type="number"
                    value={weeksPerMonth}
                    onChange={(e) => setWeeksPerMonth(Number(e.target.value))}
                    min="1"
                    max="5"
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {t("results.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Weekly Earnings */}
                <div className="bg-[var(--color-surface)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {t("results.weekly")}
                    </span>
                    <Clock className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  </div>
                  <div className="text-2xl font-bold text-[var(--color-primary)]">
                    {weeklyEarnings.toLocaleString()} MAD
                  </div>
                </div>

                {/* Monthly Earnings */}
                <div className="bg-[var(--color-surface)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {t("results.monthlyGross")}
                    </span>
                    <DollarSign className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  </div>
                  <div className="text-2xl font-bold text-[var(--color-primary)]">
                    {monthlyEarnings.toLocaleString()} MAD
                  </div>
                </div>

                {/* Monthly Net Earnings */}
                <div className="bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-light)] rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-90">{t("results.monthlyNet")}</span>
                    <Star className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold">
                    {netMonthlyEarnings.toLocaleString()} MAD
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    {t("results.afterPlatformFee")}
                  </div>
                </div>

                {/* Yearly Earnings */}
                <div className="bg-[var(--color-surface)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {t("results.yearlyNet")}
                    </span>
                    <TrendingUp className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  </div>
                  <div className="text-2xl font-bold text-[var(--color-primary)]">
                    {netYearlyEarnings.toLocaleString()} MAD
                  </div>
                </div>

                {/* Platform Fee Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {t("platformFee.title")}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {t("platformFee.description")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("maximizeEarnings.title")}
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                {t("maximizeEarnings.buildReputation.title")}
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                {t("maximizeEarnings.buildReputation.description")}
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                {t("maximizeEarnings.beAvailable.title")}
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                {t("maximizeEarnings.beAvailable.description")}
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                {t("maximizeEarnings.expandSkills.title")}
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                {t("maximizeEarnings.expandSkills.description")}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
            >
              {t("cta.becomeTasker")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
            >
              {t("cta.learnMore")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
