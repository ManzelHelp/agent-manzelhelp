import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, CheckCircle, Star, Users, TrendingUp } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Footer" });

  return {
    title: t("newsletter"),
    description:
      "Subscribe to ManzelHelp newsletter for updates, tips, and exclusive offers.",
    openGraph: {
      title: t("newsletter"),
      description:
        "Subscribe to ManzelHelp newsletter for updates, tips, and exclusive offers.",
      locale: locale,
      type: "website",
    },
  };
}

const BENEFITS = [
  {
    icon: <Star className="w-6 h-6" />,
    title: "Exclusive Offers",
    description: "Get special discounts and early access to new features",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Industry Insights",
    description: "Stay updated with the latest trends in service marketplaces",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Community Stories",
    description:
      "Read inspiring stories from our community of helpers and customers",
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: "Tips & Best Practices",
    description: "Learn how to maximize your success on our platform",
  },
];

export default async function NewsletterPage({
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
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Stay Connected
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            Subscribe to our newsletter and never miss out on updates, tips, and
            exclusive offers from ManzelHelp.
          </p>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-6 text-[var(--color-text-primary)]">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8">
              Join thousands of users who receive our weekly newsletter with the
              latest updates and insights.
            </p>

            <form className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <input
                  type="checkbox"
                  id="terms"
                  className="rounded border-[var(--color-border)]"
                  required
                />
                <label htmlFor="terms">
                  I agree to receive marketing emails and have read the Privacy
                  Policy
                </label>
              </div>

              <Button type="submit" className="w-full">
                Subscribe Now
              </Button>
            </form>

            <p className="text-xs text-[var(--color-text-secondary)] mt-4">
              You can unsubscribe at any time. We respect your privacy.
            </p>
          </Card>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              What You'll Get
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  {benefit.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Archive */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Recent Newsletters
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="space-y-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    Weekly Update: New Features & Community Highlights
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-2">
                    Discover the latest platform updates, meet featured helpers,
                    and learn about upcoming improvements.
                  </p>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    Published:{" "}
                    {new Date(
                      Date.now() - 7 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  Read More
                </Button>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    Success Stories: How Our Community is Growing
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-2">
                    Read inspiring stories from helpers who've built successful
                    businesses on our platform.
                  </p>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    Published:{" "}
                    {new Date(
                      Date.now() - 14 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  Read More
                </Button>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    Tips & Tricks: Maximizing Your Earnings as a Helper
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-2">
                    Expert advice on pricing, customer service, and building a
                    strong reputation.
                  </p>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    Published:{" "}
                    {new Date(
                      Date.now() - 21 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  Read More
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Ready to Stay Updated?
          </h2>
          <p className="text-lg mb-8 text-[var(--color-accent-light)]">
            Join our community and be the first to know about new features,
            success stories, and exclusive offers.
          </p>
          <Button
            size="lg"
            className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)]"
          >
            Subscribe to Newsletter
          </Button>
        </div>
      </section>
    </div>
  );
}
