import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MessageCircle,
  Mail,
  BookOpen,
  Users,
  CreditCard,
  Shield,
} from "lucide-react";
import HelpPageContent from "@/components/help/HelpPageContent";
import FAQSectionWrapper from "@/components/help/FAQSectionWrapper";
import { HelpSearchProvider } from "@/components/help/HelpSearchContext";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "help" });

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

// FAQ categories and contact options will be built dynamically using translations

export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "help" });

  // Build FAQ categories dynamically
  const FAQ_CATEGORIES = [
    {
      icon: <Users className="w-6 h-6" />,
      title: t("faq.categories.gettingStarted.title"),
      questions: [
        {
          question: t("faq.categories.gettingStarted.questions.createAccount.question"),
          answer: t("faq.categories.gettingStarted.questions.createAccount.answer"),
        },
        {
          question: t("faq.categories.gettingStarted.questions.helperVsCustomer.question"),
          answer: t("faq.categories.gettingStarted.questions.helperVsCustomer.answer"),
        },
        {
          question: t("faq.categories.gettingStarted.questions.completeProfile.question"),
          answer: t("faq.categories.gettingStarted.questions.completeProfile.answer"),
        },
      ],
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: t("faq.categories.payments.title"),
      questions: [
        {
          question: t("faq.categories.payments.questions.howPaymentsWork.question"),
          answer: t("faq.categories.payments.questions.howPaymentsWork.answer"),
        },
        {
          question: t("faq.categories.payments.questions.paymentMethods.question"),
          answer: t("faq.categories.payments.questions.paymentMethods.answer"),
        },
        {
          question: t("faq.categories.payments.questions.whenGetPaid.question"),
          answer: t("faq.categories.payments.questions.whenGetPaid.answer"),
        },
      ],
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t("faq.categories.safety.title"),
      questions: [
        {
          question: t("faq.categories.safety.questions.verifyHelpers.question"),
          answer: t("faq.categories.safety.questions.verifyHelpers.answer"),
        },
        {
          question: t("faq.categories.safety.questions.notSatisfied.question"),
          answer: t("faq.categories.safety.questions.notSatisfied.answer"),
        },
        {
          question: t("faq.categories.safety.questions.personalInfoSafe.question"),
          answer: t("faq.categories.safety.questions.personalInfoSafe.answer"),
        },
      ],
    },
  ];

  // Build contact options dynamically
  const CONTACT_OPTIONS = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: t("contact.whatsapp.title"),
      description: t("contact.whatsapp.description"),
      action: t("contact.whatsapp.action"),
      available: t("contact.whatsapp.available"),
      href: "https://wa.me/212607505722",
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: t("contact.email.title"),
      description: t("contact.email.description"),
      action: t("contact.email.action"),
      available: t("contact.email.available"),
      href: "mailto:Info@manzelhelp.com",
    },
  ];

  return (
    <HelpSearchProvider>
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

            {/* Search Bar - Client Component */}
            <HelpPageContent
              searchPlaceholder={t("hero.searchPlaceholder")}
            />
          </div>
        </section>

      {/* Contact Options */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("contact.title")}
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {CONTACT_OPTIONS.map((option, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {option.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                  {option.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] mb-4">
                  {option.description}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                  {option.available}
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href={option.href} target="_blank" rel="noopener noreferrer">
                    {option.action}
                  </a>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - Client Component with Search */}
      <FAQSectionWrapper
        faqTitle={t("faq.title")}
        categories={FAQ_CATEGORIES}
      />

      {/* Additional Resources */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              {t("resources.title")}
            </h2>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <BookOpen className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                {t("resources.userGuide.title")}
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                {t("resources.userGuide.description")}
              </p>
              <Button variant="outline" size="sm">
                {t("resources.userGuide.action")}
              </Button>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Users className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                {t("resources.communityForum.title")}
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                {t("resources.communityForum.description")}
              </p>
              <Button variant="outline" size="sm">
                {t("resources.communityForum.action")}
              </Button>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Shield className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                {t("resources.safetyTips.title")}
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                {t("resources.safetyTips.description")}
              </p>
              <Button variant="outline" size="sm">
                {t("resources.safetyTips.action")}
              </Button>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <MessageCircle className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                {t("resources.videoTutorials.title")}
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                {t("resources.videoTutorials.description")}
              </p>
              <Button variant="outline" size="sm">
                {t("resources.videoTutorials.action")}
              </Button>
            </Card>
          </div>
        </div>
      </section>
      </div>
    </HelpSearchProvider>
  );
}
