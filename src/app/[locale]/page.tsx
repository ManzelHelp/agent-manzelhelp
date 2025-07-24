import ServiceSearchBar from "@/components/buttons/ServiceSearchBar";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import ServiceOfferCard from "@/components/ServiceOfferCard";
import { User, TaskerService } from "@/types/supabase";

// Sample data for demonstration
const sampleOffers: { service: TaskerService; tasker: User }[] = [
  {
    service: {
      id: 1,
      tasker_id: "1",
      service_id: 1,
      base_price: 25,
      pricing_type: "hourly",
      title: "Professional House Cleaning",
      description:
        "Experienced in deep cleaning and organizing. Available for regular cleaning or one-time deep clean services.",
      service_area: "Dubai Marina",
    } as TaskerService,
    tasker: {
      id: "1",
      email: "sarah@example.com",
      first_name: "Sarah",
      last_name: "Johnson",
      avatar_url: "/sample-avatar-1.jpg",
    } as User,
  },
  {
    service: {
      id: 2,
      tasker_id: "2",
      service_id: 2,
      base_price: 35,
      pricing_type: "fixed",
      title: "Handyman Services",
      description:
        "Expert in home repairs, furniture assembly, and general maintenance. Quality work guaranteed.",
      service_area: "Downtown Dubai",
    } as TaskerService,
    tasker: {
      id: "2",
      email: "mike@example.com",
      first_name: "Mike",
      last_name: "Smith",
      avatar_url: "/sample-avatar-2.jpg",
    } as User,
  },
  {
    service: {
      id: 3,
      tasker_id: "3",
      service_id: 3,
      base_price: 30,
      pricing_type: "hourly",
      title: "Professional Gardening",
      description:
        "Specialized in garden maintenance, plant care, and landscape design. Creating beautiful outdoor spaces.",
      service_area: "Arabian Ranches",
    } as TaskerService,
    tasker: {
      id: "3",
      email: "emma@example.com",
      first_name: "Emma",
      last_name: "Davis",
      avatar_url: "/sample-avatar-3.jpg",
    } as User,
  },
];

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

      <div className="w-full max-w-7xl mt-12">
        {/* Services Offered Section */}
        <section className="mb-12">
          <h2
            className="text-2xl font-semibold mb-6 text-center"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("servicesOffered")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {sampleOffers.map((offer) => (
              <ServiceOfferCard
                key={offer.service.id}
                service={offer.service}
                tasker={offer.tasker}
              />
            ))}
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
