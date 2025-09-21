import { AvailabilitySlot, OperationHoursObject } from "@/types/supabase";

/**
 * Converts operation hours from database format to AvailabilitySlot array
 *
 * @param operationHours - The operation hours object from the database
 * @returns Array of AvailabilitySlot objects
 *
 * @example
 * const slots = convertOperationHoursToSlots({
 *   monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
 *   tuesday: { enabled: false, startTime: "09:00", endTime: "17:00" }
 * });
 */
export function convertOperationHoursToSlots(
  operationHours: OperationHoursObject | null | undefined
): AvailabilitySlot[] {
  if (!operationHours || typeof operationHours !== "object") {
    return [];
  }

  const days: (keyof OperationHoursObject)[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return days
    .map((day) => {
      const dayData = operationHours[day];
      if (!dayData || typeof dayData !== "object") {
        return null;
      }

      // Validate required properties
      if (
        typeof dayData.enabled !== "boolean" ||
        typeof dayData.startTime !== "string" ||
        typeof dayData.endTime !== "string"
      ) {
        return null;
      }

      return {
        day,
        enabled: dayData.enabled,
        startTime: dayData.startTime,
        endTime: dayData.endTime,
      } as AvailabilitySlot;
    })
    .filter((slot): slot is AvailabilitySlot => slot !== null);
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
  const validDays = new Set([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ]);

  return slots.reduce<OperationHoursObject>((acc, slot) => {
    if (!slot?.day || typeof slot.day !== "string") {
      return acc;
    }

    const dayKey = slot.day.toLowerCase() as keyof OperationHoursObject;

    if (validDays.has(dayKey)) {
      acc[dayKey] = {
        enabled: Boolean(slot.enabled),
        startTime: slot.startTime || "09:00",
        endTime: slot.endTime || "17:00",
      };
    }

    return acc;
  }, {});
}

/**
 * Validates if operation hours object has valid structure
 *
 * @param operationHours - The operation hours object to validate
 * @returns boolean indicating if the object is valid
 */
export function isValidOperationHours(
  operationHours: unknown
): operationHours is OperationHoursObject {
  if (!operationHours || typeof operationHours !== "object") {
    return false;
  }

  const obj = operationHours as Record<string, unknown>;
  const validDays = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  // Check if all days have valid structure
  return validDays.every((day) => {
    const dayData = obj[day];
    if (!dayData || typeof dayData !== "object") {
      return false;
    }

    const dayObj = dayData as Record<string, unknown>;
    return (
      typeof dayObj.enabled === "boolean" &&
      typeof dayObj.startTime === "string" &&
      typeof dayObj.endTime === "string" &&
      dayObj.startTime.length > 0 &&
      dayObj.endTime.length > 0
    );
  });
}

/**
 * Gets default operation hours (weekdays enabled, 9 AM to 5 PM)
 *
 * @returns Default OperationHoursObject
 */
export function getDefaultOperationHours(): OperationHoursObject {
  const days: (keyof OperationHoursObject)[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return days.reduce<OperationHoursObject>((acc, day) => {
    acc[day] = {
      enabled: day !== "saturday" && day !== "sunday", // Weekdays enabled by default
      startTime: "09:00",
      endTime: "17:00",
    };
    return acc;
  }, {});
}

/**
 * Validates time format (HH:MM)
 *
 * @param time - Time string to validate
 * @returns boolean indicating if time is valid
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Validates that start time is before end time
 *
 * @param startTime - Start time string
 * @param endTime - End time string
 * @returns boolean indicating if times are valid
 */
export function isValidTimeRange(startTime: string, endTime: string): boolean {
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return false;
  }

  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return startMinutes < endMinutes;
}

/**
 * Checks if operation hours has at least one enabled day
 *
 * @param operationHours - Operation hours object to check
 * @returns boolean indicating if at least one day is enabled
 */
export function hasEnabledDays(
  operationHours: OperationHoursObject | null | undefined
): boolean {
  if (!operationHours || typeof operationHours !== "object") {
    return false;
  }

  return Object.values(operationHours).some(
    (day) => day && typeof day === "object" && day.enabled === true
  );
}
