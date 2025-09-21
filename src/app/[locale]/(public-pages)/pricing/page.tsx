import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Clock, Shield, Users, Zap } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Footer" });

  return {
    title: "Pricing Guide - ManzelHelp",
    description:
      "Transparent pricing for all services on ManzelHelp. Find out how much it costs to get help or earn money as a tasker.",
    openGraph: {
      title: "Pricing Guide - ManzelHelp",
      description:
        "Transparent pricing for all services on ManzelHelp. Find out how much it costs to get help or earn money as a tasker.",
      locale: locale,
      type: "website",
    },
  };
}

const SERVICE_CATEGORIES = [
  {
    name: "Cleaning Services",
    icon: "🧹",
    services: [
      {
        name: "House Cleaning",
        price: "€15-25/hour",
        description: "Regular home cleaning",
      },
      {
        name: "Deep Cleaning",
        price: "€20-35/hour",
        description: "Thorough cleaning service",
      },
      {
        name: "Office Cleaning",
        price: "€18-30/hour",
        description: "Commercial cleaning",
      },
      {
        name: "Window Cleaning",
        price: "€12-20/hour",
        description: "Interior and exterior windows",
      },
    ],
  },
  {
    name: "Handyman Services",
    icon: "🔧",
    services: [
      {
        name: "Furniture Assembly",
        price: "€20-40/hour",
        description: "IKEA and other furniture",
      },
      {
        name: "Minor Repairs",
        price: "€25-50/hour",
        description: "Small home repairs",
      },
      {
        name: "Painting",
        price: "€18-35/hour",
        description: "Interior and exterior painting",
      },
      {
        name: "Plumbing",
        price: "€30-60/hour",
        description: "Basic plumbing tasks",
      },
    ],
  },
  {
    name: "Pet Care",
    icon: "🐕",
    services: [
      {
        name: "Dog Walking",
        price: "€12-20/hour",
        description: "Regular dog walks",
      },
      {
        name: "Pet Sitting",
        price: "€15-25/hour",
        description: "In-home pet care",
      },
      {
        name: "Pet Grooming",
        price: "€25-45/session",
        description: "Basic grooming services",
      },
      {
        name: "Pet Training",
        price: "€30-50/hour",
        description: "Basic obedience training",
      },
    ],
  },
  {
    name: "Tutoring & Education",
    icon: "📚",
    services: [
      {
        name: "Math Tutoring",
        price: "€20-40/hour",
        description: "All levels of mathematics",
      },
      {
        name: "Language Lessons",
        price: "€18-35/hour",
        description: "Foreign language instruction",
      },
      {
        name: "Music Lessons",
        price: "€25-50/hour",
        description: "Instrument and vocal lessons",
      },
      {
        name: "Test Preparation",
        price: "€30-60/hour",
        description: "SAT, GRE, and other tests",
      },
    ],
  },
];

const PRICING_FACTORS = [
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Time Required",
    description: "Longer tasks may have different hourly rates or flat fees",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Experience Level",
    description: "More experienced taskers may charge higher rates",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Specialized Skills",
    description: "Technical or specialized services may cost more",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Location",
    description: "Rates may vary based on your city and local market",
  },
];

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Transparent Pricing
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            No hidden fees, no surprises. See exactly what services cost and how
            much you can earn as a tasker.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)]"
            >
              Find Services
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Become a Tasker
            </Button>
          </div>
        </div>
      </section>

      {/* How Pricing Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              How Our Pricing Works
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_FACTORS.map((factor, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {factor.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  {factor.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  {factor.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Service Pricing by Category
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Get an idea of what different services typically cost in your area
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {SERVICE_CATEGORIES.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white">
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {category.services.map((service, serviceIndex) => (
                      <div
                        key={serviceIndex}
                        className="flex justify-between items-start p-4 bg-[var(--color-surface)] rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">
                            {service.name}
                          </h4>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {service.description}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <span className="font-bold text-[var(--color-primary)]">
                            {service.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Fees */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Platform Fees
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  For Customers
                </h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-[var(--color-secondary)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    No booking fees or hidden charges
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-[var(--color-secondary)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    Pay only for services completed
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-[var(--color-secondary)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    Secure payment processing included
                  </span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[var(--color-secondary)] rounded-full flex items-center justify-center text-white">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  For Taskers
                </h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-[var(--color-secondary)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    Small service fee (typically 5-10%)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-[var(--color-secondary)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    Payment processing included
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-[var(--color-secondary)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    No monthly subscription fees
                  </span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust ManzelHelp for their service
            needs. Transparent pricing, quality service, and peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
            >
              Find a Helper
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
            >
              Become a Tasker
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
