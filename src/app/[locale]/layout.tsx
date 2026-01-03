import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/providers/theme-provider";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { LogoutListener } from "@/components/auth/LogoutListener";
import { SessionSync } from "@/components/auth/SessionSync";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();

  // Map locales to appropriate timezones following best practices
  const getTimezoneForLocale = (locale: string) => {
    const timezoneMap: Record<string, string> = {
      de: "Europe/Berlin", // German timezone for German locale
      en: "America/New_York", // US Eastern time for English locale
      ar: "Africa/Casablanca", // Moroccan timezone for Arabic locale
      fr: "Europe/Paris", // French timezone for French locale
    };
    // Fallback to UTC if locale not found
    return timezoneMap[locale] || "UTC";
  };

  // CRITICAL: Use a stable date for hydration to prevent React hydration mismatches
  // The date is captured once during server-side rendering and reused on client
  // This ensures the same value is used on both server and client during hydration
  const stableNow = new Date();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NextIntlClientProvider
        messages={messages}
        locale={locale}
        timeZone={getTimezoneForLocale(locale)}
        now={stableNow}
      >
        <SessionSync />
        <LogoutListener />
        <Header />
        {children}
        <Toaster />
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
