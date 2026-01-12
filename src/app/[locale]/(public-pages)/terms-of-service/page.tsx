import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

/**
 * HYDRATION-SAFE DATE
 * 
 * Use a stable date to prevent hydration mismatches.
 * The date is captured once during server-side rendering.
 */
const LAST_UPDATED_DATE = "2024-12-23";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "termsOfService" });

  return {
    title: t("hero.title"),
    description: t("hero.description"),
    openGraph: {
      title: t("hero.title"),
      description: t("hero.description"),
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
  const t = await getTranslations({ locale, namespace: "termsOfService" });

  // Format date according to locale
  const formattedDate = new Date(LAST_UPDATED_DATE).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            {t("hero.title")}
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            {t("hero.description")}
          </p>
          <p className="text-sm opacity-90">
            {t("hero.lastUpdated")} {formattedDate}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <div className="bg-[var(--color-surface)] rounded-xl p-8 border border-[var(--color-border)]">
            <h2 className="text-2xl font-bold mb-6 text-[var(--color-text-primary)]">
              {t("sections.acceptanceOfTerms.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                {t("sections.acceptanceOfTerms.description")}
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.descriptionOfService.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                {t("sections.descriptionOfService.description")}
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.userAccounts.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>{t("sections.userAccounts.description")}</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t("sections.userAccounts.items.accurateInfo")}</li>
                <li>{t("sections.userAccounts.items.maintainSecurity")}</li>
                <li>{t("sections.userAccounts.items.ageRequirement")}</li>
                <li>{t("sections.userAccounts.items.complyLaws")}</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.userResponsibilities.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>{t("sections.userResponsibilities.description")}</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t("sections.userResponsibilities.items.lawfulPurposes")}</li>
                <li>{t("sections.userResponsibilities.items.notInterfere")}</li>
                <li>{t("sections.userResponsibilities.items.notImpersonate")}</li>
                <li>{t("sections.userResponsibilities.items.respectUsers")}</li>
                <li>{t("sections.userResponsibilities.items.accurateServiceInfo")}</li>
                <li>{t("sections.userResponsibilities.items.completeServices")}</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.prohibitedActivities.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>{t("sections.prohibitedActivities.description")}</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t("sections.prohibitedActivities.items.falseInfo")}</li>
                <li>{t("sections.prohibitedActivities.items.harassment")}</li>
                <li>{t("sections.prohibitedActivities.items.spam")}</li>
                <li>{t("sections.prohibitedActivities.items.ipViolation")}</li>
                <li>{t("sections.prohibitedActivities.items.circumventPayment")}</li>
                <li>{t("sections.prohibitedActivities.items.illegalActivities")}</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.paymentTerms.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                {t("sections.paymentTerms.description")}
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t("sections.paymentTerms.items.payFees")}</li>
                <li>{t("sections.paymentTerms.items.accuratePayment")}</li>
                <li>{t("sections.paymentTerms.items.authorizeCharges")}</li>
                <li>
                  {t("sections.paymentTerms.items.finalSales")}
                </li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.disputeResolution.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                {t("sections.disputeResolution.description")}
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.limitationOfLiability.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                {t("sections.limitationOfLiability.description")}
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t("sections.limitationOfLiability.items.serviceQuality")}</li>
                <li>{t("sections.limitationOfLiability.items.userConduct")}</li>
                <li>{t("sections.limitationOfLiability.items.damages")}</li>
                <li>{t("sections.limitationOfLiability.items.thirdParty")}</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.intellectualProperty.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                {t("sections.intellectualProperty.description")}
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.termination.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                {t("sections.termination.description")}
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.changesToTerms.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                {t("sections.changesToTerms.description")}
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.governingLaw.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                {t("sections.governingLaw.description")}
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.contactInformation.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                {t("sections.contactInformation.description")}
              </p>
              <div className="bg-[var(--color-bg)] p-4 rounded-lg">
                <p>
                  <strong>{t("sections.contactInformation.email")}</strong> {t("sections.contactInformation.emailValue")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
