import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle,
  Star,
  DollarSign,
  Clock,
  Users,
  Shield,
  Zap,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Footer" });

  return {
    title: "Tasker Getting Started Guide - ManzelHelp",
    description:
      "Complete guide for new taskers on ManzelHelp. Learn how to set up your profile, find customers, and start earning money.",
    openGraph: {
      title: "Tasker Getting Started Guide - ManzelHelp",
      description:
        "Complete guide for new taskers on ManzelHelp. Learn how to set up your profile, find customers, and start earning money.",
      locale: locale,
      type: "website",
    },
  };
}

const GETTING_STARTED_STEPS = [
  {
    step: "1",
    title: "Create Your Account",
    description: "Sign up with your email and basic information",
    details: [
      "Choose a strong password",
      "Verify your email address",
      "Complete your profile setup",
      "Select your service categories",
    ],
    icon: <Users className="w-6 h-6" />,
  },
  {
    step: "2",
    title: "Complete Verification",
    description: "Go through our verification process to build trust",
    details: [
      "Submit government ID",
      "Complete background check",
      "Provide references",
      "Pass skill assessment",
    ],
    icon: <Shield className="w-6 h-6" />,
  },
  {
    step: "3",
    title: "Build Your Profile",
    description: "Create an attractive profile that stands out",
    details: [
      "Add professional photos",
      "Write compelling descriptions",
      "Set competitive pricing",
      "Define your service area",
    ],
    icon: <Star className="w-6 h-6" />,
  },
  {
    step: "4",
    title: "Start Earning",
    description: "Begin accepting jobs and building your reputation",
    details: [
      "Respond to job requests quickly",
      "Deliver excellent service",
      "Collect positive reviews",
      "Build repeat customers",
    ],
    icon: <DollarSign className="w-6 h-6" />,
  },
];

const SUCCESS_TIPS = [
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Be Responsive",
    description:
      "Reply to messages within 2 hours to increase your chances of getting hired",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Maintain Quality",
    description:
      "Consistently deliver excellent service to build a strong reputation",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Build Relationships",
    description:
      "Focus on building long-term relationships with repeat customers",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Stay Active",
    description:
      "Regularly update your availability and respond to new opportunities",
  },
];

const EARNING_POTENTIAL = [
  {
    service: "Cleaning Services",
    hourlyRate: "€15-25",
    monthlyPotential: "€1,200-2,000",
    description: "Regular and deep cleaning services",
  },
  {
    service: "Handyman Work",
    hourlyRate: "€20-40",
    monthlyPotential: "€1,600-3,200",
    description: "Furniture assembly, repairs, and maintenance",
  },
  {
    service: "Pet Care",
    hourlyRate: "€12-20",
    monthlyPotential: "€960-1,600",
    description: "Dog walking, pet sitting, and grooming",
  },
  {
    service: "Tutoring",
    hourlyRate: "€20-40",
    monthlyPotential: "€1,600-3,200",
    description: "Academic support and skill development",
  },
];

export default async function TaskerGuidePage({
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
            Getting Started as a Tasker
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            Your complete guide to becoming a successful tasker on ManzelHelp.
            Learn how to set up your profile, find customers, and start earning
            money.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)]"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Download Guide
            </Button>
          </div>
        </div>
      </section>

      {/* Getting Started Steps */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Your Journey to Success
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Follow these steps to become a successful tasker on our platform
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {GETTING_STARTED_STEPS.map((step, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white">
                      {step.icon}
                    </div>
                    <div>
                      <div className="text-sm text-[var(--color-primary)] font-semibold">
                        Step {step.step}
                      </div>
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-[var(--color-text-secondary)] mb-4">
                    {step.description}
                  </p>
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
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
              Tips for Success
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUCCESS_TIPS.map((tip, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {tip.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  {tip.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm">
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
              Earning Potential
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              See how much you can earn with different services (based on 40
              hours/week)
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {EARNING_POTENTIAL.map((service, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  {service.service}
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                  {service.description}
                </p>
                <div className="space-y-2">
                  <div>
                    <div className="text-2xl font-bold text-[var(--color-primary)]">
                      {service.hourlyRate}
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      per hour
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-[var(--color-secondary)]">
                      {service.monthlyPotential}
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      monthly potential
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
              Requirements to Get Started
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
                Basic Requirements
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[var(--color-secondary)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    Be at least 18 years old
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[var(--color-secondary)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    Have a valid government-issued ID
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[var(--color-secondary)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    Pass background check
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[var(--color-secondary)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    Have relevant skills and experience
                  </span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
                What You'll Need
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[var(--color-secondary)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    Smartphone with camera
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[var(--color-secondary)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    Reliable transportation
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[var(--color-secondary)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    Bank account for payments
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[var(--color-secondary)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    Professional references
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
            Ready to Start Earning?
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
            Join thousands of successful taskers who are already earning money
            doing what they love. Start your journey today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
            >
              Become a Tasker
              <ArrowRight className="ml-2 h-5 w-5" />
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
