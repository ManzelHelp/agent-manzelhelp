import { AvailabilitySlot, OperationHoursObject } from "@/types/supabase";

/**
 * Converts operation hours from database format to AvailabilitySlot array
 * Handles both legacy array format and current object format
 *
 * @param operationHours - The operation hours data from the database
 * @returns Array of AvailabilitySlot objects
 *
 * @example
 * // Object format (current)
 * const slots = convertOperationHoursToSlots({
 *   monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
 *   tuesday: { enabled: false, startTime: "09:00", endTime: "17:00" }
 * });
 *
 * // Array format (legacy)
 * const slots = convertOperationHoursToSlots([
 *   { day: "monday", enabled: true, startTime: "09:00", endTime: "17:00" }
 * ]);
 */
export function convertOperationHoursToSlots(
  operationHours: OperationHoursObject | AvailabilitySlot[] | null | undefined
): AvailabilitySlot[] {
  if (!operationHours) {
    return [];
  }

  // Check if it's already an array (legacy format)
  if (Array.isArray(operationHours)) {
    // Legacy array format - filter out invalid entries
    return operationHours.filter(
      (slot): slot is AvailabilitySlot =>
        slot !== null &&
        typeof slot === "object" &&
        "enabled" in slot &&
        "startTime" in slot &&
        "endTime" in slot
    );
  }

  // Current object format - convert to array
  if (typeof operationHours === "object" && operationHours !== null) {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const validSlots: AvailabilitySlot[] = [];

    days.forEach((day) => {
      const dayData = operationHours[day as keyof OperationHoursObject];
      if (dayData && typeof dayData === "object" && "enabled" in dayData) {
        validSlots.push({
          day,
          enabled: dayData.enabled,
          startTime: dayData.startTime || "09:00",
          endTime: dayData.endTime || "17:00",
        });
      }
    });

    return validSlots;
  }

  // Invalid format - return empty array
  return [];
}

/**
 * Converts AvailabilitySlot array to operation hours object format for database storage
 *
 * @param slots - Array of AvailabilitySlot objects
 * @returns OperationHoursObject for database storage
 *
 * @example
 * const operationHours = convertSlotsToOperationHours([
 *   { day: "monday", enabled: true, startTime: "09:00", endTime: "17:00" },
 *   { day: "tuesday", enabled: false, startTime: "09:00", endTime: "17:00" }
 * ]);
 * // Returns: { monday: { enabled: true, startTime: "09:00", endTime: "17:00" }, ... }
 */
export function convertSlotsToOperationHours(
  slots: AvailabilitySlot[]
): OperationHoursObject {
  const operationHours: OperationHoursObject = {};

  slots.forEach((slot) => {
    if (slot.day && typeof slot.day === "string") {
      const dayKey = slot.day.toLowerCase() as keyof OperationHoursObject;
      if (
        dayKey in operationHours ||
        [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ].includes(dayKey)
      ) {
        operationHours[dayKey] = {
          enabled: slot.enabled,
          startTime: slot.startTime || "09:00",
          endTime: slot.endTime || "17:00",
        };
      }
    }
  });

  return operationHours;
}
