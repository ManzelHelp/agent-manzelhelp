import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Sparkles } from "lucide-react";

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
  const t = await getTranslations({ locale, namespace: "cookiePolicy" });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    openGraph: {
      title: t("metadata.title"),
      description: t("metadata.description"),
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
  const t = await getTranslations("cookiePolicy");

  // Format date according to locale
  const formattedDate = new Date(LAST_UPDATED_DATE).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const cookieTypes = [
    {
      title: t("typesOfCookies.essential.title"),
      description: t("typesOfCookies.essential.description"),
    },
    {
      title: t("typesOfCookies.performance.title"),
      description: t("typesOfCookies.performance.description"),
    },
    {
      title: t("typesOfCookies.functionality.title"),
      description: t("typesOfCookies.functionality.description"),
    },
    {
      title: t("typesOfCookies.marketing.title"),
      description: t("typesOfCookies.marketing.description"),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)] text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--color-secondary)] rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-secondary)] rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">{t("hero.title")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {t("hero.title")}
          </h1>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto opacity-90">
            {t("hero.description")}
          </p>
          <p className="text-sm opacity-75">
            {t("hero.lastUpdated", { date: formattedDate })}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[var(--color-surface)] rounded-xl p-8 border border-[var(--color-border)] space-y-8">
            {/* What Are Cookies */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">
                {t("whatAreCookies.title")}
              </h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {t("whatAreCookies.description")}
              </p>
            </div>

            {/* How We Use Cookies */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">
                {t("howWeUseCookies.title")}
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                {t("howWeUseCookies.description")}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--color-text-secondary)]">
                {t.raw("howWeUseCookies.purposes").map((purpose: string, index: number) => (
                  <li key={index} className="leading-relaxed">{purpose}</li>
                ))}
              </ul>
            </div>

            {/* Types of Cookies */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-[var(--color-text-primary)]">
                {t("typesOfCookies.title")}
              </h2>
              <div className="space-y-6">
                {cookieTypes.map((type, index) => (
                  <div key={index}>
                    <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                      {type.title}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Third-Party Cookies */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">
                {t("thirdPartyCookies.title")}
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                {t("thirdPartyCookies.description")}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--color-text-secondary)]">
                {t.raw("thirdPartyCookies.partners").map((partner: string, index: number) => (
                  <li key={index} className="leading-relaxed">{partner}</li>
                ))}
              </ul>
            </div>

            {/* Managing Cookies */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">
                {t("managingCookies.title")}
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                {t("managingCookies.description")}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--color-text-secondary)] mb-4">
                {t.raw("managingCookies.options").map((option: string, index: number) => (
                  <li key={index} className="leading-relaxed">{option}</li>
                ))}
              </ul>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                <strong className="text-[var(--color-text-primary)]">
                  {t("common.note")}:
                </strong> {t("managingCookies.note")}
              </p>
            </div>

            {/* Browser Settings */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">
                {t("browserSettings.title")}
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                {t("browserSettings.description")}
              </p>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li className="leading-relaxed">
                  <strong className="text-[var(--color-text-primary)]">Chrome:</strong>{" "}
                  {t("browserSettings.browsers.chrome")}
                </li>
                <li className="leading-relaxed">
                  <strong className="text-[var(--color-text-primary)]">Firefox:</strong>{" "}
                  {t("browserSettings.browsers.firefox")}
                </li>
                <li className="leading-relaxed">
                  <strong className="text-[var(--color-text-primary)]">Safari:</strong>{" "}
                  {t("browserSettings.browsers.safari")}
                </li>
                <li className="leading-relaxed">
                  <strong className="text-[var(--color-text-primary)]">Edge:</strong>{" "}
                  {t("browserSettings.browsers.edge")}
                </li>
              </ul>
            </div>

            {/* Updates */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">
                {t("updates.title")}
              </h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {t("updates.description")}
              </p>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">
                {t("contact.title")}
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                {t("contact.description")}
              </p>
              <div className="bg-[var(--color-bg)] p-4 rounded-lg border border-[var(--color-border)]">
                <p className="text-[var(--color-text-secondary)] mb-2">
                  <strong className="text-[var(--color-text-primary)]">
                    {t("contact.email")}
                  </strong>
                </p>
                <p className="text-[var(--color-text-secondary)]">
                  <strong className="text-[var(--color-text-primary)]">
                    {t("contact.address")}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
