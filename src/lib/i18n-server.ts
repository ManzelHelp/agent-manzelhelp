"use server";

import { createClient } from "@/supabase/server";
import { getLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

export type Locale = (typeof routing.locales)[number];

type TranslationMessages = {
  [key: string]: any;
};

/**
 * Gets the user's preferred locale from their profile or falls back to the request locale
 * @param userId Optional user ID. If not provided, will try to get from authenticated session
 * @returns The locale string (e.g., 'en', 'fr', 'ar')
 */
export async function getUserLocale(userId?: string): Promise<Locale> {
  try {
    // First, try to get locale from next-intl/server if available
    try {
      const requestLocale = await getLocale();
      if (requestLocale && routing.locales.includes(requestLocale as Locale)) {
        return requestLocale as Locale;
      }
    } catch (error) {
      // getLocale() may fail in server actions - this is expected
      // Fall back to user profile
    }

    // If userId is provided, fetch from database
    if (userId) {
      const supabase = await createClient();
      const { data: user } = await supabase
        .from("users")
        .select("preferred_language")
        .eq("id", userId)
        .single();

      if (user?.preferred_language && routing.locales.includes(user.preferred_language as Locale)) {
        return user.preferred_language as Locale;
      }
    }

    // Otherwise, try to get from authenticated session
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser) {
      const { data: user } = await supabase
        .from("users")
        .select("preferred_language")
        .eq("id", authUser.id)
        .single();

      if (user?.preferred_language && routing.locales.includes(user.preferred_language as Locale)) {
        return user.preferred_language as Locale;
      }
    }
  } catch (error) {
    console.error("Error getting user locale:", error);
  }

  // Fallback to default locale
  return routing.defaultLocale;
}

/**
 * Loads translation messages for a given locale
 * @param locale The locale to load messages for
 * @returns The translation messages object
 */
async function loadMessages(locale: Locale): Promise<TranslationMessages> {
  try {
    const messages = await import(`../../messages/${locale}.json`);
    return messages.default || messages;
  } catch (error) {
    console.error(`Error loading messages for locale ${locale}:`, error);
    // Fallback to English if locale file doesn't exist
    if (locale !== "en") {
      const messages = await import(`../../messages/en.json`);
      return messages.default || messages;
    }
    return {};
  }
}

/**
 * Gets a translated string from the messages object
 * @param messages The messages object
 * @param key The translation key (e.g., 'notifications.titles.newMessage')
 * @param params Optional parameters to interpolate into the message
 * @returns The translated string
 */
function getTranslation(
  messages: TranslationMessages,
  key: string,
  params?: Record<string, string | number>
): string {
  const keys = key.split(".");
  let value: any = messages;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      // Key not found, return the key itself or a fallback
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  if (typeof value !== "string") {
    console.warn(`Translation value is not a string for key: ${key}`);
    return key;
  }

  // Replace placeholders like {amount}, {jobTitle}, etc.
  if (params) {
    return value.replace(/{(\w+)}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }

  return value;
}

/**
 * Gets a translated string for a given locale and key
 * @param locale The locale to use
 * @param key The translation key
 * @param params Optional parameters to interpolate
 * @returns The translated string
 */
export async function getTranslatedString(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): Promise<string> {
  const messages = await loadMessages(locale);
  return getTranslation(messages, key, params);
}
