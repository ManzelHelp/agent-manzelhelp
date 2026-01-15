import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageCircle, Sparkles } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return {
    title: `${t("hero.title")} - ManzelHelp`,
    description: t("hero.description"),
    openGraph: {
      title: `${t("hero.title")} - ManzelHelp`,
      description: t("hero.description"),
      locale: locale,
      type: "website",
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  // WhatsApp link - using Moroccan phone number format
  const whatsappNumber = "212607505722"; // 06 07 50 57 22 in international format
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  const contactMethods = [
    {
      icon: Mail,
      title: t("contactInfo.email.title"),
      description: t("contactInfo.email.description"),
      value: t("contactInfo.email.address"),
      link: `mailto:${t("contactInfo.email.address")}`,
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Phone,
      title: t("contactInfo.phone.title"),
      description: t("contactInfo.phone.description"),
      value: t("contactInfo.phone.number"),
      link: `tel:+${whatsappNumber}`,
      color: "from-green-500 to-green-600",
    },
    {
      icon: MessageCircle,
      title: t("contactInfo.whatsapp.title"),
      description: t("contactInfo.whatsapp.description"),
      value: t("contactInfo.whatsapp.button"),
      link: whatsappLink,
      color: "from-emerald-500 to-emerald-600",
      isButton: true,
    },
    {
      icon: MapPin,
      title: t("contactInfo.address.title"),
      description: t("contactInfo.address.description"),
      value: t("contactInfo.address.fullAddress"),
      link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t("contactInfo.address.fullAddress"))}`,
      color: "from-purple-500 to-purple-600",
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
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("contactInfo.title")}
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <Card
                  key={index}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-[var(--color-surface)]"
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                      {method.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                      {method.description}
                    </p>
                    {method.isButton ? (
                      <Button
                        asChild
                        className={`w-full bg-gradient-to-r ${method.color} hover:opacity-90 text-white`}
                      >
                        <a href={method.link} target="_blank" rel="noopener noreferrer">
                          {method.value}
                        </a>
                      </Button>
                    ) : (
                      <a
                        href={method.link}
                        className={`text-[var(--color-primary)] hover:underline font-medium break-words block`}
                        target={method.link.startsWith("http") ? "_blank" : undefined}
                        rel={method.link.startsWith("http") ? "noopener noreferrer" : undefined}
                      >
                        {(method.icon === Phone || method.icon === Mail) ? (
                          <span dir="ltr" className="text-left inline-block">
                            {method.value}
                          </span>
                        ) : (
                          <span className={locale === "ar" ? "text-right" : "text-left"}>
                            {method.value}
                          </span>
                        )}
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
