import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search,
  MessageCircle,
  Phone,
  Mail,
  BookOpen,
  Users,
  CreditCard,
  Shield,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Footer" });

  return {
    title: t("helpCenter"),
    description:
      "Get help with ManzelHelp. Find answers to common questions and contact our support team.",
    openGraph: {
      title: t("helpCenter"),
      description:
        "Get help with ManzelHelp. Find answers to common questions and contact our support team.",
      locale: locale,
      type: "website",
    },
  };
}

const FAQ_CATEGORIES = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Getting Started",
    questions: [
      {
        question: "How do I create an account?",
        answer:
          "Click the 'Sign Up' button in the top right corner, fill in your details, and verify your email address.",
      },
      {
        question: "What's the difference between a Helper and Customer?",
        answer:
          "Helpers offer services to others, while Customers book services. You can be both on the same account.",
      },
      {
        question: "How do I complete my profile?",
        answer:
          "Go to your profile page and add your skills, experience, photos, and availability to attract more clients.",
      },
    ],
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: "Payments & Billing",
    questions: [
      {
        question: "How do payments work?",
        answer:
          "Payments are processed securely through our platform. Customers pay upfront, and Helpers receive payment after service completion.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards, PayPal, and bank transfers in supported regions.",
      },
      {
        question: "When do I get paid?",
        answer:
          "Helpers receive payment within 2-3 business days after the customer confirms service completion.",
      },
    ],
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Safety & Security",
    questions: [
      {
        question: "How do you verify Helpers?",
        answer:
          "All Helpers undergo background checks, identity verification, and skill assessments before joining our platform.",
      },
      {
        question: "What if I'm not satisfied with a service?",
        answer:
          "Contact our support team within 24 hours. We'll work with you to resolve the issue or provide a refund.",
      },
      {
        question: "Is my personal information safe?",
        answer:
          "Yes, we use industry-standard encryption and security measures to protect your data. Read our Privacy Policy for details.",
      },
    ],
  },
];

const CONTACT_OPTIONS = [
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Live Chat",
    description: "Get instant help from our support team",
    action: "Start Chat",
    available: "Available 24/7",
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Email Support",
    description: "Send us a detailed message",
    action: "Send Email",
    available: "Response within 24 hours",
  },
  {
    icon: <Phone className="w-6 h-6" />,
    title: "Phone Support",
    description: "Speak directly with our team",
    action: "Call Now",
    available: "Mon-Fri 9AM-6PM",
  },
];

export default async function HelpPage({
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
            Help Center
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            Find answers to your questions and get the support you need.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full pl-10 pr-4 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Get in Touch
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {CONTACT_OPTIONS.map((option, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {option.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  {option.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] mb-4">
                  {option.description}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                  {option.available}
                </p>
                <Button variant="outline" className="w-full">
                  {option.action}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Frequently Asked Questions
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="space-y-12">
            {FAQ_CATEGORIES.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
                    {category.title}
                  </h3>
                </div>

                <div className="grid gap-4">
                  {category.questions.map((faq, faqIndex) => (
                    <Card key={faqIndex} className="p-6">
                      <details className="group">
                        <summary className="flex justify-between items-center cursor-pointer list-none">
                          <h4 className="text-lg font-medium text-[var(--color-text-primary)] group-open:text-[var(--color-primary)]">
                            {faq.question}
                          </h4>
                          <div className="ml-4 flex-shrink-0">
                            <svg
                              className="w-5 h-5 text-[var(--color-text-secondary)] group-open:rotate-180 transition-transform"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </summary>
                        <div className="mt-4 text-[var(--color-text-secondary)] leading-relaxed">
                          {faq.answer}
                        </div>
                      </details>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Additional Resources
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <BookOpen className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                User Guide
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                Complete guide to using ManzelHelp
              </p>
              <Button variant="outline" size="sm">
                Read Guide
              </Button>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Users className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                Community Forum
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                Connect with other users
              </p>
              <Button variant="outline" size="sm">
                Join Forum
              </Button>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Shield className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                Safety Tips
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                Stay safe while using our platform
              </p>
              <Button variant="outline" size="sm">
                Learn More
              </Button>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <MessageCircle className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                Video Tutorials
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                Watch step-by-step tutorials
              </p>
              <Button variant="outline" size="sm">
                Watch Now
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
