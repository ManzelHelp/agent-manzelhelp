"use client";

import React, { useState } from "react";
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

const SERVICE_CATEGORIES = [
  {
    id: "cleaning",
    name: "Cleaning Services",
    icon: "🧹",
    baseRate: 20,
    minRate: 15,
    maxRate: 35,
    description: "House cleaning, deep cleaning, office cleaning",
  },
  {
    id: "handyman",
    name: "Handyman Work",
    icon: "🔧",
    baseRate: 30,
    minRate: 20,
    maxRate: 50,
    description: "Furniture assembly, repairs, maintenance",
  },
  {
    id: "petcare",
    name: "Pet Care",
    icon: "🐕",
    baseRate: 16,
    minRate: 12,
    maxRate: 25,
    description: "Dog walking, pet sitting, grooming",
  },
  {
    id: "tutoring",
    name: "Tutoring",
    icon: "📚",
    baseRate: 30,
    minRate: 20,
    maxRate: 50,
    description: "Academic support, language lessons",
  },
  {
    id: "gardening",
    name: "Gardening",
    icon: "🌱",
    baseRate: 18,
    minRate: 15,
    maxRate: 30,
    description: "Lawn care, garden maintenance, landscaping",
  },
  {
    id: "delivery",
    name: "Delivery Services",
    icon: "📦",
    baseRate: 15,
    minRate: 10,
    maxRate: 25,
    description: "Package delivery, grocery shopping",
  },
];

export default function EarningsPage() {
  const [selectedService, setSelectedService] = useState(SERVICE_CATEGORIES[0]);
  const [hourlyRate, setHourlyRate] = useState(selectedService.baseRate);
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
            Earnings Calculator
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            Calculate your potential earnings as a tasker on ManzelHelp. See how
            much you can make based on your skills and availability.
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
                  Calculate Your Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-[var(--color-text-primary)]">
                    Select Service Category
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
                              €{service.minRate}-{service.maxRate}/hour
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
                    Hourly Rate (€)
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
                    Range: €{selectedService.minRate} - €
                    {selectedService.maxRate}
                  </div>
                </div>

                {/* Hours Per Week */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--color-text-primary)]">
                    Hours per Week
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
                    Weeks per Month
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
                  Your Potential Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Weekly Earnings */}
                <div className="bg-[var(--color-surface)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      Weekly
                    </span>
                    <Clock className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  </div>
                  <div className="text-2xl font-bold text-[var(--color-primary)]">
                    €{weeklyEarnings.toLocaleString()}
                  </div>
                </div>

                {/* Monthly Earnings */}
                <div className="bg-[var(--color-surface)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      Monthly (Gross)
                    </span>
                    <DollarSign className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  </div>
                  <div className="text-2xl font-bold text-[var(--color-primary)]">
                    €{monthlyEarnings.toLocaleString()}
                  </div>
                </div>

                {/* Monthly Net Earnings */}
                <div className="bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-light)] rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-90">Monthly (Net)</span>
                    <Star className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold">
                    €{netMonthlyEarnings.toLocaleString()}
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    After 10% platform fee
                  </div>
                </div>

                {/* Yearly Earnings */}
                <div className="bg-[var(--color-surface)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      Yearly (Net)
                    </span>
                    <TrendingUp className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  </div>
                  <div className="text-2xl font-bold text-[var(--color-primary)]">
                    €{netYearlyEarnings.toLocaleString()}
                  </div>
                </div>

                {/* Platform Fee Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Platform Fee
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    ManzelHelp charges a 10% platform fee to cover payment
                    processing, customer support, and platform maintenance.
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
              Maximize Your Earnings
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                Build Your Reputation
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Excellent reviews and ratings help you charge premium rates and
                get more bookings.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                Be Available
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Respond quickly to requests and maintain flexible availability
                to get more jobs.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                Expand Your Skills
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Learn new skills and offer additional services to increase your
                earning potential.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
            Join thousands of taskers who are already earning money on
            ManzelHelp. Start your journey today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
            >
              Become a Tasker
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
