import { describe, expect, test, beforeEach } from "vitest";
import { useDateFormatter } from "./dateFormatter";

describe("useDateFormatter", () => {
  let formatter: ReturnType<typeof useDateFormatter>;

  beforeEach(() => {
    formatter = useDateFormatter();
  });

  describe("formatDate", () => {
    test("formats UTC date by default", () => {
      const result = formatter.formatDate("2024-01-15T10:30:00Z");
      expect(result).toBeTruthy();
      expect(result).not.toBe("n/a");
    });

    test("returns empty text for null input", () => {
      const result = formatter.formatDate(null);
      expect(result).toBe("n/a");
    });

    test("returns custom empty text when specified", () => {
      const result = formatter.formatDate(null, { emptyText: "No date" });
      expect(result).toBe("No date");
    });

    test("returns empty text for empty date constant", () => {
      const result = formatter.formatDate("0001-01-01T00:00:00");
      expect(result).toBe("n/a");
    });

    test("formats date in local time by default", () => {
      const result = formatter.formatDate("2024-01-15T10:30:00Z", { showLocalTime: true });
      expect(result).toContain("2024");
    });

    test("formats date in UTC when showUtcTime is true", () => {
      const result = formatter.formatDate("2024-01-15T10:30:00Z", { showUtcTime: true, showLocalTime: false });
      expect(result).toContain("2024");
      expect(result).not.toContain("(local)");
      expect(result).not.toContain("(UTC)");
    });

    test("formats date with both local and UTC when both flags are true", () => {
      const result = formatter.formatDate("2024-01-15T10:30:00Z", { showLocalTime: true, showUtcTime: true });
      expect(result).toContain("(local)");
      expect(result).toContain("(UTC)");
    });

    test("formats relative time when showRelative is true", () => {
      const result = formatter.formatDate("2024-01-15T11:00:00Z", { showRelative: true });
      expect(result).toBeTruthy();
      // The exact format depends on dayjs relativeTime plugin
    });

    test("accepts custom format string", () => {
      const result = formatter.formatDate("2024-01-15T10:30:00Z", { format: "YYYY-MM-DD" });
      expect(result).toContain("2024");
    });

    test("formats Date object input", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const result = formatter.formatDate(date);
      expect(result).toBeTruthy();
      expect(result).not.toBe("n/a");
    });
  });

  describe("formatDateRange", () => {
    test("returns empty text for empty date range", () => {
      const result = formatter.formatDateRange([]);
      expect(result).toBe("No dates");
    });

    test("returns custom empty text when specified", () => {
      const result = formatter.formatDateRange([], { emptyText: "No range" });
      expect(result).toBe("No range");
    });

    test("formats date range when both dates are provided", () => {
      const fromDate = new Date("2024-01-15T10:00:00Z");
      const toDate = new Date("2024-01-16T10:00:00Z");
      const result = formatter.formatDateRange([fromDate, toDate]);
      expect(result).toContain("2024");
      expect(result).toContain("-");
    });

    test("returns error message when toDate is in the future", () => {
      const fromDate = new Date("2020-01-10T10:00:00Z");
      const futureDate = new Date("2099-12-31T10:00:00Z");
      const result = formatter.formatDateRange([fromDate, futureDate]);
      expect(result).toBe("Date cannot be in the future");
    });
  });

  describe("formatDateTooltip", () => {
    test("returns provided titleValue if given", () => {
      const result = formatter.formatDateTooltip("2024-01-15T10:30:00Z", "Custom title");
      expect(result).toBe("Custom title");
    });

    test("returns empty string for null date", () => {
      const result = formatter.formatDateTooltip(null);
      expect(result).toBe("");
    });

    test("returns empty string for empty date constant", () => {
      const result = formatter.formatDateTooltip("0001-01-01T00:00:00");
      expect(result).toBe("");
    });

    test("formats date with local and UTC time", () => {
      const result = formatter.formatDateTooltip("2024-01-15T10:30:00Z");
      expect(result).toContain("(local)");
      expect(result).toContain("(UTC)");
    });

    test("includes newline separator between local and UTC", () => {
      const result = formatter.formatDateTooltip("2024-01-15T10:30:00Z");
      expect(result).toContain("\n");
    });
  });

  describe("formatRelativeTime", () => {
    test("formats recent date as relative time", () => {
      const result = formatter.formatRelativeTime("2024-01-15T11:00:00Z");
      expect(result).toBeTruthy();
      expect(result).not.toBe("n/a");
    });

    test("returns empty text for null date", () => {
      const result = formatter.formatRelativeTime(null);
      expect(result).toBe("n/a");
    });

    test("returns custom empty text when specified", () => {
      const result = formatter.formatRelativeTime(null, { emptyText: "Unknown" });
      expect(result).toBe("Unknown");
    });

    test("returns empty text for empty date constant", () => {
      const result = formatter.formatRelativeTime("0001-01-01T00:00:00");
      expect(result).toBe("n/a");
    });

    test("formats Date object input", () => {
      const date = new Date("2024-01-15T11:00:00Z");
      const result = formatter.formatRelativeTime(date);
      expect(result).toBeTruthy();
    });
  });

  describe("formatLicenseDate", () => {
    test("returns empty string for null input", () => {
      const result = formatter.formatLicenseDate(null);
      expect(result).toBe("");
    });

    test("formats license date without Z suffix", () => {
      const result = formatter.formatLicenseDate("2024-01-15T10:30:00Z");
      expect(result).toBeTruthy();
      expect(result).not.toBe("");
    });

    test("formats date string correctly", () => {
      const result = formatter.formatLicenseDate("2024-12-31T00:00:00Z");
      expect(result).toContain("2024");
    });
  });

  describe("isValidDateRange", () => {
    test("returns true for empty date range", () => {
      const result = formatter.isValidDateRange([]);
      expect(result).toBe(true);
    });

    test("returns true when fromDate is before toDate", () => {
      const fromDate = new Date("2020-01-10T10:00:00Z");
      const toDate = new Date("2020-01-15T10:00:00Z");
      const result = formatter.isValidDateRange([fromDate, toDate]);
      expect(result).toBe(true);
    });

    test("returns true when fromDate equals toDate", () => {
      const date = new Date("2020-01-15T10:00:00Z");
      const result = formatter.isValidDateRange([date, date]);
      expect(result).toBe(true);
    });

    test("returns false when fromDate is after toDate", () => {
      const fromDate = new Date("2020-01-20T10:00:00Z");
      const toDate = new Date("2020-01-15T10:00:00Z");
      const result = formatter.isValidDateRange([fromDate, toDate]);
      expect(result).toBe(false);
    });

    test("returns false when toDate is in the future", () => {
      const fromDate = new Date("2020-01-10T10:00:00Z");
      const futureDate = new Date("2099-12-31T10:00:00Z");
      const result = formatter.isValidDateRange([fromDate, futureDate]);
      expect(result).toBe(false);
    });
  });

  describe("emptyDate constant", () => {
    test("provides emptyDate constant", () => {
      expect(formatter.emptyDate).toBe("0001-01-01T00:00:00");
    });

    test("emptyDate is recognized as empty in formatDate", () => {
      const result = formatter.formatDate(formatter.emptyDate);
      expect(result).toBe("n/a");
    });
  });
});
