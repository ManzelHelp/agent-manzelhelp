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
  const t = await getTranslations({ locale, namespace: "privacyPolicy" });

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

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "privacyPolicy" });

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
              {t("sections.informationWeCollect.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  {t("sections.informationWeCollect.personalInformation.title")}
                </h3>
                <p>
                  {t("sections.informationWeCollect.personalInformation.description")}
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>{t("sections.informationWeCollect.personalInformation.items.nameContact")}</li>
                  <li>{t("sections.informationWeCollect.personalInformation.items.profilePreferences")}</li>
                  <li>{t("sections.informationWeCollect.personalInformation.items.paymentBilling")}</li>
                  <li>{t("sections.informationWeCollect.personalInformation.items.communications")}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  {t("sections.informationWeCollect.usageInformation.title")}
                </h3>
                <p>
                  {t("sections.informationWeCollect.usageInformation.description")}
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>{t("sections.informationWeCollect.usageInformation.items.deviceInfo")}</li>
                  <li>{t("sections.informationWeCollect.usageInformation.items.logData")}</li>
                  <li>{t("sections.informationWeCollect.usageInformation.items.locationInfo")}</li>
                  <li>{t("sections.informationWeCollect.usageInformation.items.cookies")}</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.howWeUse.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>{t("sections.howWeUse.description")}</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t("sections.howWeUse.items.provideServices")}</li>
                <li>{t("sections.howWeUse.items.processTransactions")}</li>
                <li>{t("sections.howWeUse.items.sendNotices")}</li>
                <li>{t("sections.howWeUse.items.respondComments")}</li>
                <li>{t("sections.howWeUse.items.monitorAnalyze")}</li>
                <li>{t("sections.howWeUse.items.personalize")}</li>
                <li>{t("sections.howWeUse.items.ensureSafety")}</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.informationSharing.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                {t("sections.informationSharing.description")}
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t("sections.informationSharing.items.withUsers")}</li>
                <li>
                  {t("sections.informationSharing.items.withProviders")}
                </li>
                <li>{t("sections.informationSharing.items.requiredByLaw")}</li>
                <li>{t("sections.informationSharing.items.businessTransfer")}</li>
                <li>{t("sections.informationSharing.items.withConsent")}</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.dataSecurity.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                {t("sections.dataSecurity.description")}
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.yourRights.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                {t("sections.yourRights.description")}
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t("sections.yourRights.items.accessUpdate")}</li>
                <li>{t("sections.yourRights.items.deleteAccount")}</li>
                <li>{t("sections.yourRights.items.optOut")}</li>
                <li>{t("sections.yourRights.items.requestCopy")}</li>
                <li>{t("sections.yourRights.items.objectProcessing")}</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.cookiesTracking.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                {t("sections.cookiesTracking.description")}
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.childrenPrivacy.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                {t("sections.childrenPrivacy.description")}
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.changesToPolicy.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                {t("sections.changesToPolicy.description")}
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-8 text-[var(--color-text-primary)]">
              {t("sections.contactUs.title")}
            </h2>
            <div className="space-y-4 text-[var(--color-text-secondary)]">
              <p>
                {t("sections.contactUs.description")}
              </p>
              <div className="bg-[var(--color-bg)] p-4 rounded-lg">
                <p>
                  <strong>{t("sections.contactUs.email")}</strong> {t("sections.contactUs.emailValue")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
