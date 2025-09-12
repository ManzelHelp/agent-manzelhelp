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
    title: t("termsOfService"),
    description:
      "ManzelHelp Terms of Service - Read our terms and conditions for using our platform.",
    openGraph: {
      title: t("termsOfService"),
      description:
        "ManzelHelp Terms of Service - Read our terms and conditions for using our platform.",
      locale: locale,
      type: "website",
    },
  };
}

export default async function TermsOfServicePage({
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
            Terms of Service
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            Please read these terms carefully before using our services.
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
              1. Acceptance of Terms
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                By accessing and using ManzelHelp ("the Service"), you accept
                and agree to be bound by the terms and provision of this
                agreement. If you do not agree to abide by the above, please do
                not use this service.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              2. Description of Service
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                ManzelHelp is a platform that connects service providers
                ("Helpers") with customers seeking various services. We
                facilitate the connection but are not a party to the actual
                service agreements between users.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              3. User Accounts
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>To use our service, you must:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Be at least 18 years old (or have parental consent)</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              4. User Responsibilities
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>Users agree to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use the service only for lawful purposes</li>
                <li>Not interfere with or disrupt the service</li>
                <li>Not impersonate any person or entity</li>
                <li>Respect other users and maintain professional conduct</li>
                <li>Provide accurate information about services and pricing</li>
                <li>Complete agreed-upon services in a timely manner</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              5. Prohibited Activities
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>The following activities are prohibited:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Posting false, misleading, or fraudulent information</li>
                <li>Harassment, abuse, or threatening behavior</li>
                <li>Spam, unsolicited communications, or advertising</li>
                <li>Violation of intellectual property rights</li>
                <li>Attempting to circumvent our payment system</li>
                <li>Any illegal or harmful activities</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              6. Payment Terms
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                Payment processing is handled through secure third-party
                providers. Users agree to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Pay all fees and charges as described</li>
                <li>Provide accurate payment information</li>
                <li>Authorize charges for services rendered</li>
                <li>
                  Understand that all sales are final unless otherwise specified
                </li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              7. Dispute Resolution
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                In case of disputes between users, we encourage direct
                communication and resolution. ManzelHelp may assist in dispute
                resolution but is not responsible for the outcome of service
                agreements between users.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              8. Limitation of Liability
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                ManzelHelp acts as a platform connecting users and is not
                responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>The quality or outcome of services provided</li>
                <li>User conduct or interactions</li>
                <li>Damages resulting from service agreements</li>
                <li>Third-party actions or content</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              9. Intellectual Property
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                The ManzelHelp platform, including its design, functionality,
                and content, is protected by intellectual property laws. Users
                retain rights to their own content but grant us a license to use
                it in connection with our services.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              10. Termination
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                We reserve the right to terminate or suspend accounts that
                violate these terms. Users may also terminate their accounts at
                any time. Upon termination, certain provisions of these terms
                will continue to apply.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              11. Changes to Terms
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                We may modify these terms at any time. Continued use of the
                service after changes constitutes acceptance of the updated
                terms. We will notify users of significant changes through the
                platform or email.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              12. Governing Law
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                These terms are governed by the laws of [Your Jurisdiction]. Any
                disputes will be resolved in the courts of [Your Jurisdiction].
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              13. Contact Information
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                For questions about these Terms of Service, please contact us
                at:
              </p>
              <div className="bg-[var(--color-bg)] p-4 rounded-lg">
                <p>
                  <strong>Email:</strong> legal@manzelhelp.com
                </p>
                <p>
                  <strong>Address:</strong> ManzelHelp Legal Team, [Your
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
