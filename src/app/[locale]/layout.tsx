import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/providers/theme-provider";
import Header from "@/components/Header";
import { LogoutListener } from "@/components/auth/LogoutListener";
import { SessionSync } from "@/components/auth/SessionSync";
import { Toaster } from "@/components/ui/toaster";

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

  const getTimezoneForLocale = (locale: string) => {
    const timezoneMap: Record<string, string> = {
      de: "Europe/Berlin",
      en: "America/New_York",
      ar: "Africa/Casablanca",
      fr: "Europe/Paris",
    };
    return timezoneMap[locale] || "UTC";
  };

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