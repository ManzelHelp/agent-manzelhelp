/**
 * Utility functions for date formatting
 * All dates should use the short format: DD.MM.YYYY
 */

/**
 * Format a date string to DD.MM.YYYY format
 * @param dateString - ISO date string or date object
 * @returns Formatted date string (DD.MM.YYYY) or "N/A" if invalid
 */
export function formatDateShort(dateString: string | Date | null | undefined): string {
  if (!dateString) return "N/A";
  
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return "N/A";
    }
    
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
 * Format a time string to HH:MM format
 * @param timeString - Time string (HH:MM:SS or HH:MM)
 * @returns Formatted time string (HH:MM) or empty string if invalid
 */
export function formatTimeShort(timeString: string | null | undefined): string {
  if (!timeString) return "";
  
  try {
    // Handle both HH:MM:SS and HH:MM formats
    const parts = timeString.split(":");
    if (parts.length >= 2) {
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
 * @returns Formatted date and time string
 */
export function formatDateTimeShort(
  dateString: string | Date | null | undefined,
  timeString?: string | null
): string {
  const date = formatDateShort(dateString);
  if (date === "N/A") return "N/A";
  
  if (timeString) {
    const time = formatTimeShort(timeString);
    return time ? `${date} ${time}` : date;
  }
  
  return date;
}

