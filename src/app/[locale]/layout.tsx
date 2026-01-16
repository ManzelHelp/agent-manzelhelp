import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/providers/theme-provider";
import Header from "@/components/Header";
import { LogoutListener } from "@/components/auth/LogoutListener";
import { SessionSync } from "@/components/auth/SessionSync";
import { Toaster } from "@/components/ui/toaster";
import { localeDirection } from "@/i18n/config";

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

  let messages;
  try {
    messages = await getMessages();
  } catch (error) {
    console.error("Error loading messages:", error);
    messages = {};
  }

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
  const direction = localeDirection[locale] ?? "ltr";

  // ✅ Ici on applique RTL/LTR via un div racine
  return (
    <div dir={direction} lang={locale}>
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
          <main className="pt-[57px] md:pt-[73px]">
            {children}
          </main>
          <Toaster />
        </NextIntlClientProvider>
      </ThemeProvider>
    </div>
  );
}
