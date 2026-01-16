/**
 * Utility functions for date formatting
 * All dates should use the short format: DD.MM.YYYY
 */

/**
 * Get locale string for date/number formatting based on locale code
 * @param locale - Locale code (en, fr, ar, de)
 * @returns Locale string for Intl APIs
 */
export function getLocaleString(locale: string = "en"): string {
  const localeMap: Record<string, string> = {
    en: "en-US",
    fr: "fr-FR",
    de: "de-DE",
    ar: "ar-MA",
  };
  return localeMap[locale] || "en-US";
}

/**
 * Format a date string to DD.MM.YYYY format
 * @param dateString - ISO date string or date object
 * @param locale - Optional locale for formatting (defaults to en)
 * @returns Formatted date string (DD.MM.YYYY) or "N/A" if invalid
 */
export function formatDateShort(dateString: string | Date | null | undefined, locale: string = "en"): string {
  if (!dateString) return "N/A";
  
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return "N/A";
    }
    
    // For Arabic locale, use Intl.DateTimeFormat for proper RTL formatting
    if (locale === "ar") {
      return new Intl.DateTimeFormat("ar-MA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    }
    
    // For other locales, use the standard format
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
}

/**
 * Format a time string to HH:MM format with locale support
 * @param timeString - Time string (HH:MM:SS or HH:MM)
 * @param locale - Optional locale for formatting (defaults to en)
 * @returns Formatted time string (HH:MM) or empty string if invalid
 */
export function formatTimeShort(timeString: string | null | undefined, locale: string = "en"): string {
  if (!timeString) return "";
  
  try {
    // Handle both HH:MM:SS and HH:MM formats
    const parts = timeString.split(":");
    if (parts.length >= 2) {
      const hour = parseInt(parts[0], 10);
      const minute = parseInt(parts[1], 10);
      
      // For Arabic locale, use Intl.DateTimeFormat for proper formatting
      if (locale === "ar") {
        const date = new Date(`2000-01-01T${timeString}`);
        return new Intl.DateTimeFormat("ar-MA", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);
      }
      
      return `${parts[0]}:${parts[1]}`;
    }
    return "";
  } catch (error) {
    console.error("Error formatting time:", error);
    return "";
  }
}

/**
 * Format a date and time to DD.MM.YYYY HH:MM format
 * @param dateString - ISO date string
 * @param timeString - Time string (optional)
 * @param locale - Optional locale for formatting (defaults to en)
 * @returns Formatted date and time string
 */
export function formatDateTimeShort(
  dateString: string | Date | null | undefined,
  timeString?: string | null,
  locale: string = "en"
): string {
  const date = formatDateShort(dateString, locale);
  if (date === "N/A") return "N/A";
  
  if (timeString) {
    const time = formatTimeShort(timeString, locale);
    return time ? `${date} ${time}` : date;
  }
  
  return date;
}

/**
 * Format currency with locale support
 * @param amount - Amount to format
 * @param currency - Currency code (default: MAD)
 * @param locale - Optional locale for formatting (defaults to en)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = "MAD", locale: string = "en"): string {
  const numberLocale = getLocaleString(locale);
  
  // Robust currency code handling
  const cleanCurrency = (currency || "MAD").trim().toUpperCase().substring(0, 3);
  
  try {
    return new Intl.NumberFormat(numberLocale, {
      style: "currency",
      currency: cleanCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  } catch (error) {
    console.error("Error formatting currency:", error, "Value:", amount, "Currency:", cleanCurrency);
    // Fallback formatting
    return `${(amount || 0).toFixed(2)} ${cleanCurrency}`;
  }
}

/**
 * Format a number with locale support
 * @param number - Number to format
 * @param locale - Optional locale for formatting (defaults to en)
 * @param options - Optional Intl.NumberFormatOptions
 * @returns Formatted number string
 */
export function formatNumber(number: number, locale: string = "en", options?: Intl.NumberFormatOptions): string {
  const numberLocale = getLocaleString(locale);
  return new Intl.NumberFormat(numberLocale, options).format(number);
}
