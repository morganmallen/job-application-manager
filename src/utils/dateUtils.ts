/**
 * Formats a Date object to local datetime string in YYYY-MM-DDTHH:mm format
 * This avoids timezone conversion issues when sending to the backend
 */
export const formatLocalDateTime = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Formats a Date object to local date string in YYYY-MM-DD format
 * This avoids timezone conversion issues when sending to the backend
 */
export const formatLocalDate = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Gets current local time in Peru timezone format
 */
export const getCurrentLocalDateTime = (): string => {
  return formatLocalDateTime(new Date());
};

/**
 * Gets current local date in Peru timezone format
 */
export const getCurrentLocalDate = (): string => {
  return formatLocalDate(new Date());
};

/**
 * Formats a date string for display, handling timezone-safe date-only strings
 * @param dateString - Either YYYY-MM-DD or full datetime string
 * @param options - Intl.DateTimeFormatOptions for formatting
 */
export const formatDateForDisplay = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
): string => {
  // Handle date-only strings (YYYY-MM-DD) to avoid timezone conversion
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString("en-US", options);
  }

  // Handle full datetime strings - check if it's an ISO string from database
  const date = new Date(dateString);

  // If the date contains time information and options don't specify time format,
  // automatically include time for better user experience
  const hasTimeInOptions =
    options.hour !== undefined || options.minute !== undefined;
  const dateHasTime = dateString.includes("T") || dateString.includes(" ");

  if (dateHasTime && !hasTimeInOptions && !options.timeStyle) {
    // Add time formatting if the date has time but options don't specify time
    const enhancedOptions = {
      ...options,
      hour: "2-digit" as const,
      minute: "2-digit" as const,
    };
    return date.toLocaleDateString("en-US", enhancedOptions);
  }

  return date.toLocaleDateString("en-US", options);
};

/**
 * Formats a date string for display with full details (weekday, date, time)
 */
export const formatDateTimeForDisplay = (dateString: string): string => {
  return formatDateForDisplay(dateString, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
