import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Footer" });

  return {
    title: t("privacyPolicy"),
    description:
      "ManzelHelp Privacy Policy - Learn how we protect and handle your personal information.",
    openGraph: {
      title: t("privacyPolicy"),
      description:
        "ManzelHelp Privacy Policy - Learn how we protect and handle your personal information.",
      locale: locale,
      type: "website",
    },
  };
}

export default async function PrivacyPolicyPage({
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
            Privacy Policy
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we
            collect, use, and protect your information.
          </p>
          <p className="text-sm opacity-90">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <div className="bg-[var(--color-surface)] rounded-xl p-8 border border-[var(--color-border)]">
            <h2 className="text-2xl font-bold mb-6 text-[var(--color-text-primary)]">
              1. Information We Collect
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  Personal Information
                </h3>
                <p>
                  We collect information you provide directly to us, such as
                  when you create an account, use our services, or contact us
                  for support. This may include:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Profile information and preferences</li>
                  <li>Payment and billing information</li>
                  <li>Communications with us and other users</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  Usage Information
                </h3>
                <p>
                  We automatically collect certain information about your use of
                  our services, including:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Device information and identifiers</li>
                  <li>Log data and analytics</li>
                  <li>Location information (with your permission)</li>
                  <li>Cookies and similar technologies</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              2. How We Use Your Information
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Personalize and improve your experience</li>
                <li>Ensure safety and security on our platform</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              3. Information Sharing
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>With other users as necessary to provide our services</li>
                <li>
                  With service providers who assist us in operating our platform
                </li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or acquisition</li>
                <li>With your consent or at your direction</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              4. Data Security
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction. However, no
                method of transmission over the internet or electronic storage
                is 100% secure.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              5. Your Rights
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of certain communications</li>
                <li>Request a copy of your data</li>
                <li>Object to certain processing activities</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              6. Cookies and Tracking
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                We use cookies and similar technologies to enhance your
                experience, analyze usage, and provide personalized content. You
                can control cookie settings through your browser, but disabling
                cookies may affect the functionality of our services.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              7. Children's Privacy
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                Our services are not intended for children under 13 years of
                age. We do not knowingly collect personal information from
                children under 13. If we become aware that we have collected
                such information, we will take steps to delete it.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              8. Changes to This Policy
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new policy on this page
                and updating the "Last updated" date. Your continued use of our
                services after any changes constitutes acceptance of the updated
                policy.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              9. Contact Us
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                If you have any questions about this Privacy Policy or our
                privacy practices, please contact us at:
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
