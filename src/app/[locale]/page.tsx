import ServiceSearchBar from "@/components/buttons/ServiceSearchBar";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  // Get translations for the page content
  const t = await getTranslations({ locale, namespace: "homepage" });

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex flex-col items-center py-12 px-4">
      <section className="max-w-2xl w-full text-center mb-12">
        <h1
          className="text-4xl font-bold mb-4"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {t("title")}
        </h1>
        <p
          className="text-lg text-[var(--color-text-secondary)]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {t("description")}
        </p>
      </section>

      <ServiceSearchBar />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Services Offered Section */}
        <section className="bg-[var(--color-surface)] rounded-xl shadow p-6 flex flex-col items-center">
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("servicesOffered")}
          </h2>
          <div className="h-24 w-full flex items-center justify-center text-[var(--color-text-secondary)] border-2 border-dashed border-[var(--color-border)] rounded-lg">
            {/* Placeholder for service cards */}
            <span>{t("servicesOfferedPlaceholder")}</span>
          </div>
        </section>

        {/* Request a Service Section */}
        <section className="bg-[var(--color-surface)] rounded-xl shadow p-6 flex flex-col items-center">
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("requestService")}
          </h2>
          <div className="h-24 w-full flex items-center justify-center text-[var(--color-text-secondary)] border-2 border-dashed border-[var(--color-border)] rounded-lg">
            {/* Placeholder for request form */}
            <span>{t("requestServicePlaceholder")}</span>
          </div>
        </section>
      </div>

      <section className="mt-16 w-full max-w-2xl text-center">
        <div className="bg-[var(--color-accent)] text-white rounded-lg py-6 px-4 shadow">
          <h3
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("whyTitle")}
          </h3>
          <ul
            className="list-disc list-inside text-left mx-auto max-w-md"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <li>{t("why1")}</li>
            <li>{t("why2")}</li>
            <li>{t("why3")}</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
