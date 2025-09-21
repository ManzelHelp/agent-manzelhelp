import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  CheckCircle,
  Users,
  AlertTriangle,
  Phone,
  MessageCircle,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Footer" });

  return {
    title: "Safety & Trust - ManzelHelp",
    description:
      "Learn about ManzelHelp's safety measures, verification process, and how we protect both customers and taskers.",
    openGraph: {
      title: "Safety & Trust - ManzelHelp",
      description:
        "Learn about ManzelHelp's safety measures, verification process, and how we protect both customers and taskers.",
      locale: locale,
      type: "website",
    },
  };
}

const SAFETY_FEATURES = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Background Checks",
    description: "All taskers undergo comprehensive background verification",
    details: [
      "Identity verification",
      "Criminal background check",
      "Reference verification",
      "Skill assessment",
    ],
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Community Reviews",
    description:
      "Real reviews from verified customers help you choose the right tasker",
    details: [
      "Verified customer reviews",
      "Rating system",
      "Response time tracking",
      "Service quality metrics",
    ],
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: "Secure Payments",
    description: "Your payments are protected with industry-standard security",
    details: [
      "Encrypted transactions",
      "Secure payment processing",
      "Dispute resolution",
      "Money-back guarantee",
    ],
  },
  {
    icon: <Phone className="w-6 h-6" />,
    title: "24/7 Support",
    description: "Our support team is always here to help with any concerns",
    details: [
      "Round-the-clock support",
      "Emergency assistance",
      "Dispute mediation",
      "Safety incident response",
    ],
  },
];

const SAFETY_TIPS = [
  {
    title: "For Customers",
    icon: "👥",
    tips: [
      "Always communicate through our platform",
      "Verify tasker identity before service",
      "Read reviews and ratings carefully",
      "Keep valuable items secure during service",
      "Report any concerns immediately",
    ],
  },
  {
    title: "For Taskers",
    icon: "🔧",
    tips: [
      "Meet in public places for initial consultations",
      "Inform someone about your work schedule",
      "Trust your instincts - if something feels wrong, leave",
      "Keep emergency contacts readily available",
      "Document your work with photos when appropriate",
    ],
  },
];

const VERIFICATION_STEPS = [
  {
    step: "1",
    title: "Identity Verification",
    description: "Submit government-issued ID and proof of address",
  },
  {
    step: "2",
    title: "Background Check",
    description: "Comprehensive criminal background verification",
  },
  {
    step: "3",
    title: "Skill Assessment",
    description: "Demonstrate expertise in your service areas",
  },
  {
    step: "4",
    title: "Reference Check",
    description: "Provide professional and personal references",
  },
  {
    step: "5",
    title: "Platform Training",
    description: "Complete safety and service quality training",
  },
];

export default async function SafetyPage({
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
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Safety & Trust
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            Your safety is our top priority. We've built comprehensive safety
            measures to protect both customers and taskers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)]"
            >
              Report a Safety Issue
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              How We Keep You Safe
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SAFETY_FEATURES.map((feature, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  {feature.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                  {feature.description}
                </p>
                <ul className="text-xs text-[var(--color-text-secondary)] space-y-1">
                  {feature.details.map((detail, detailIndex) => (
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
              Tasker Verification Process
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Every tasker goes through our rigorous 5-step verification process
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {VERIFICATION_STEPS.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  {step.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Safety Tips
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {SAFETY_TIPS.map((section, index) => (
              <Card key={index} className="p-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">{section.icon}</span>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[var(--color-secondary)] flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--color-text-secondary)]">
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

      {/* Emergency Support */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Emergency Support
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              If you ever feel unsafe or need immediate assistance, we're here
              to help
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[var(--color-text-primary)]">
                Emergency Hotline
              </h3>
              <p className="text-[var(--color-text-secondary)] mb-4">
                Available 24/7 for urgent safety concerns
              </p>
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                Call Emergency Line
              </Button>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[var(--color-text-primary)]">
                Report an Issue
              </h3>
              <p className="text-[var(--color-text-secondary)] mb-4">
                Report safety concerns or inappropriate behavior
              </p>
              <Button
                variant="outline"
                className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
              >
                Report Issue
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Statistics */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Trusted by Thousands
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--color-primary)] mb-2">
                99.8%
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                Safety Rating
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--color-primary)] mb-2">
                50K+
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                Verified Taskers
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--color-primary)] mb-2">
                4.9★
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                Average Rating
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--color-primary)] mb-2">
                24/7
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                Support Available
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Feel Safe, Get Help
          </h2>
          <p className="text-lg mb-8 text-[var(--color-accent-light)]">
            Join our community of verified helpers and customers who trust
            ManzelHelp for safe, reliable service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)]"
            >
              Get Started Today
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Learn More About Safety
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
