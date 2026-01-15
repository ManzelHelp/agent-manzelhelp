import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  // Order matters: French is first as it's the default
  locales: ["fr", "ar", "de", "en"],

  // Used when no locale matches
  // French is now the default language
  defaultLocale: "fr",
  
  // Enable locale detection based on browser/device language
  // This uses the Accept-Language header automatically
  localeDetection: true,
});
