import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { readFileSync } from "fs";
import { join } from "path";
import { namespaces } from "./namespaces";

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Load all namespace files and merge them
  const messages: Record<string, any> = {};
  const messagesDir = join(process.cwd(), "messages", locale);

  for (const namespace of namespaces) {
    try {
      const filePath = join(messagesDir, `${namespace}.json`);
      const fileContent = readFileSync(filePath, "utf-8");
      const namespaceData = JSON.parse(fileContent);
      
      // Each file has the structure { "NamespaceName": {...} }
      // We merge it into the messages object
      Object.assign(messages, namespaceData);
    } catch (error) {
      // If a namespace file doesn't exist, log a warning but continue
      // This allows for gradual migration or missing translations
      console.warn(
        `Translation namespace "${namespace}" not found for locale "${locale}": ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return {
    locale,
    messages,
  };
});
