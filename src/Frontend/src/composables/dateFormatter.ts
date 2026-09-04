import dayjs from "@/utils/dayjs";
import type { DateRange } from "@/types/date";

export interface DateDisplayOptions {
  showLocalTime?: boolean;
  showUtcTime?: boolean;
  showRelative?: boolean;
  format?: string;
  emptyText?: string;
}

/**
 * Composable for consistent date formatting across the application
 */
export function useDateFormatter() {
  const emptyDate = "0001-01-01T00:00:00";

  /**
   * Format a date range for display
   */
  function formatDateRange(dateRange: DateRange, options: DateDisplayOptions = {}): string {
    const { emptyText = "No dates" } = options;

    if (dateRange.length === 0) return emptyText;

    const [fromDate, toDate] = dateRange;

    if (toDate && toDate > new Date()) return "Date cannot be in the future";
    if (fromDate && toDate) return `${fromDate.toLocaleString()} - ${toDate.toLocaleString()}`;
    if (fromDate) return fromDate.toLocaleString();
    return emptyText;
  }

  /**
   * Format a single date with flexible options
   */
  function formatDate(dateInput: string | Date | null, options: DateDisplayOptions = {}): string {
    const { showLocalTime = true, showUtcTime = false, showRelative = false, format = "LLLL", emptyText = "n/a" } = options;

    if (!dateInput || dateInput === emptyDate) {
      return emptyText;
    }

    const m = dayjs.utc(dateInput);

    if (showRelative) {
      return m.fromNow();
    }

    if (showLocalTime && showUtcTime) {
      return `${m.local().format(format)} (local)\n${m.utc().format(format)} (UTC)`;
    }

    if (showUtcTime) {
      return m.utc().format(format);
    }

    return m.local().format(format);
  }

  /**
   * Format date for tooltip display (local and UTC)
   */
  // Coarse relative age: moments/minutes/hours/days/weeks/months/years ago
  function formatCoarseRelative(dateInput: string | Date, now: () => Date = () => new Date()): string {
    const then = dayjs.utc(dateInput).valueOf();
    const seconds = Math.max(0, Math.round((now().getTime() - then) / 1000));
    const unit = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"} ago`;
    if (seconds < 45) return "moments ago";
    if (seconds < 60 * 60) return unit(Math.max(1, Math.round(seconds / 60)), "minute");
    if (seconds < 24 * 60 * 60) return unit(Math.round(seconds / 3600), "hour");
    if (seconds < 7 * 24 * 60 * 60) return unit(Math.round(seconds / 86400), "day");
    if (seconds < 5 * 7 * 24 * 60 * 60) return unit(Math.round(seconds / (7 * 86400)), "week");
    if (seconds < 365 * 24 * 60 * 60) return unit(Math.max(1, Math.round(seconds / (30.44 * 86400))), "month");
    return unit(Math.max(1, Math.round(seconds / (365.25 * 86400))), "year");
  }

  // Age-adaptive absolute: time only for today, 'yesterday HH:MM' and weekday
  // names for the past week, the regular browser-formatted value beyond that.
  // In UTC mode both the instant and "now" are rebased to UTC wall time, so the
  // same code path also gets the day boundaries right for that zone.
  function formatAdaptiveDate(dateInput: string | Date, now: () => Date = () => new Date(), zone: "local" | "utc" = "local"): string {
    const toWall = (d: Date) => (zone === "utc" ? new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()) : d);
    const date = toWall(dayjs.utc(dateInput).toDate());
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayDiff = Math.round((startOfDay(toWall(now())) - startOfDay(date)) / 86400000);
    const time = date.toLocaleTimeString();
    if (dayDiff <= 0) return time;
    if (dayDiff === 1) return `yesterday ${time}`;
    if (dayDiff < 7) return `${date.toLocaleDateString(undefined, { weekday: "long" })} ${time}`;
    return date.toLocaleString();
  }

  function formatDateTooltip(dateInput: string | Date | null, titleValue?: string): string {
    if (titleValue) return titleValue;
    if (!dateInput || dateInput === emptyDate) return "";

    const m = dayjs.utc(dateInput);
    return `${m.local().format("LLLL")} (local)\n${m.utc().format("LLLL")} (UTC)`;
  }

  /**
   * Get relative time that updates periodically
   */
  function formatRelativeTime(dateInput: string | Date | null, options: DateDisplayOptions = {}): string {
    const { emptyText = "n/a" } = options;

    if (!dateInput || dateInput === emptyDate) {
      return emptyText;
    }

    return dayjs.utc(dateInput).fromNow();
  }

  /**
   * Format for license expiration dates
   */
  function formatLicenseDate(dateInput: string | null): string {
    if (!dateInput) return "";
    return new Date(dateInput.replace("Z", "")).toLocaleDateString();
  }

  /**
   * Validate if a date range is valid
   */
  function isValidDateRange(dateRange: DateRange): boolean {
    // Empty range is valid
    if (dateRange.length === 0) return true;

    const [fromDate, toDate] = dateRange;

    // If we have a toDate, it must not be in the future
    if (toDate && toDate > new Date()) return false;

    // If we have a fromDate but no toDate, that's valid
    if (fromDate && !toDate) return true;

    // If we have both dates, fromDate should be before or equal to toDate
    if (fromDate && toDate) return fromDate <= toDate;

    return true;
  }

  return {
    formatDate,
    formatDateRange,
    formatDateTooltip,
    formatRelativeTime,
    formatCoarseRelative,
    formatAdaptiveDate,
    formatLicenseDate,
    isValidDateRange,
    emptyDate,
  };
}
