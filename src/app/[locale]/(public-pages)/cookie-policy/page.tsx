import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

/**
 * HYDRATION-SAFE DATE
 * 
 * Use a stable date to prevent hydration mismatches.
 * The date is captured once during server-side rendering.
 */
const LAST_UPDATED_DATE = new Date("2024-12-23").toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Footer" });

  return {
    title: t("cookiePolicy"),
    description:
      "ManzelHelp Cookie Policy - Learn about how we use cookies and similar technologies.",
    openGraph: {
      title: t("cookiePolicy"),
      description:
        "ManzelHelp Cookie Policy - Learn about how we use cookies and similar technologies.",
      locale: locale,
      type: "website",
    },
  };
}

export default async function CookiePolicyPage({
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
            Cookie Policy
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            Learn about how we use cookies and similar technologies to improve
            your experience.
          </p>
          <p className="text-sm opacity-90">
            Last updated: {LAST_UPDATED_DATE}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <div className="bg-[var(--color-surface)] rounded-xl p-8 border border-[var(--color-border)]">
            <h2 className="text-2xl font-bold mb-6 text-[var(--color-text-primary)]">
              What Are Cookies?
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                Cookies are small text files that are placed on your computer or
                mobile device when you visit our website. They help us provide
                you with a better experience by remembering your preferences and
                enabling certain functionality.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              How We Use Cookies
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>We use cookies for several purposes:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>To remember your login status and preferences</li>
                <li>
                  To analyze how you use our website and improve our services
                </li>
                <li>To provide personalized content and recommendations</li>
                <li>To ensure the security of our platform</li>
                <li>To enable social media features and advertising</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              Types of Cookies We Use
            </h2>
            <div className="space-y-6 text-[var(--color-text-secondary)]">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  Essential Cookies
                </h3>
                <p>
                  These cookies are necessary for the website to function
                  properly. They enable basic functions like page navigation,
                  access to secure areas, and remembering your login status. The
                  website cannot function properly without these cookies.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  Performance Cookies
                </h3>
                <p>
                  These cookies collect information about how visitors use our
                  website, such as which pages are visited most often. This
                  helps us improve how our website works and provide a better
                  user experience.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  Functionality Cookies
                </h3>
                <p>
                  These cookies allow the website to remember choices you make
                  (such as your username, language, or region) and provide
                  enhanced, more personal features.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  Marketing Cookies
                </h3>
                <p>
                  These cookies are used to track visitors across websites. The
                  intention is to display ads that are relevant and engaging for
                  individual users and thereby more valuable for publishers and
                  third-party advertisers.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              Third-Party Cookies
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                We may also use third-party cookies from trusted partners to
                help us analyze website usage, provide social media features,
                and deliver relevant advertisements. These third parties may
                include:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Google Analytics for website analytics</li>
                <li>Social media platforms for sharing features</li>
                <li>Advertising networks for targeted advertising</li>
                <li>Payment processors for secure transactions</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              Managing Your Cookie Preferences
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>You have several options for managing cookies:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Use our cookie preference center to customize your settings
                </li>
                <li>
                  Configure your browser settings to block or delete cookies
                </li>
                <li>Use browser extensions that block tracking cookies</li>
                <li>Opt out of specific third-party advertising cookies</li>
              </ul>
              <p className="mt-4">
                <strong>Note:</strong> Disabling certain cookies may affect the
                functionality of our website and your user experience.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              Browser Settings
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                Most web browsers allow you to control cookies through their
                settings. Here's how to manage cookies in popular browsers:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Chrome:</strong> Settings → Privacy and security →
                  Cookies and other site data
                </li>
                <li>
                  <strong>Firefox:</strong> Options → Privacy & Security →
                  Cookies and Site Data
                </li>
                <li>
                  <strong>Safari:</strong> Preferences → Privacy → Manage
                  Website Data
                </li>
                <li>
                  <strong>Edge:</strong> Settings → Cookies and site permissions
                  → Cookies and site data
                </li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              Updates to This Policy
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                We may update this Cookie Policy from time to time to reflect
                changes in our practices or for other operational, legal, or
                regulatory reasons. We will notify you of any significant
                changes by posting the updated policy on our website.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              Contact Us
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                If you have any questions about our use of cookies or this
                Cookie Policy, please contact us at:
              </p>
              <div className="bg-[var(--color-bg)] p-4 rounded-lg">
                <p>
                  <strong>Email:</strong> privacy@manzelhelp.com
                </p>
                <p>
                  <strong>Address:</strong> ManzelHelp Privacy Team, [Your
                  Address]
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
