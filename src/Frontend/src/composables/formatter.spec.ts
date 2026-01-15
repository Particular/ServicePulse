import { describe, expect, test } from "vitest";
import { useFormatTime, useGetDayDiffFromToday, useFormatLargeNumber, createDateWithDayOffset } from "./formatter";

describe("useFormatTime", () => {
  describe("milliseconds formatting", () => {
    test("formats 0ms", () => {
      const result = useFormatTime(0);
      expect(result).toEqual({ value: "0", unit: "ms" });
    });

    test("formats 500ms", () => {
      const result = useFormatTime(500);
      expect(result).toEqual({ value: "500", unit: "ms" });
    });

    test("formats 999ms", () => {
      const result = useFormatTime(999);
      expect(result).toEqual({ value: "999", unit: "ms" });
    });

    test("handles undefined value", () => {
      const result = useFormatTime(undefined);
      expect(result).toEqual({ value: "0", unit: "ms" });
    });
  });

  describe("seconds formatting", () => {
    test("formats 1 second", () => {
      const result = useFormatTime(1000);
      expect(result).toEqual({ value: "1", unit: "sec" });
    });

    test("formats 30 seconds", () => {
      const result = useFormatTime(30 * 1000);
      expect(result).toEqual({ value: "30", unit: "sec" });
    });

    test("formats 59 seconds", () => {
      const result = useFormatTime(59 * 1000);
      expect(result).toEqual({ value: "59", unit: "sec" });
    });
  });

  describe("minutes formatting", () => {
    test("formats 1 minute", () => {
      const result = useFormatTime(60 * 1000);
      expect(result).toEqual({ value: "1:0", unit: "min" });
    });

    test("formats 5 minutes 30 seconds", () => {
      const result = useFormatTime(5 * 60 * 1000 + 30 * 1000);
      expect(result).toEqual({ value: "5:30", unit: "min" });
    });

    test("formats 59 minutes 59 seconds", () => {
      const result = useFormatTime(59 * 60 * 1000 + 59 * 1000);
      expect(result).toEqual({ value: "59:59", unit: "min" });
    });
  });

  describe("hours formatting", () => {
    test("formats 1 hour", () => {
      const result = useFormatTime(60 * 60 * 1000);
      expect(result).toEqual({ value: "01:00", unit: "hr" });
    });

    test("formats 2 hours 30 minutes", () => {
      const result = useFormatTime(2 * 60 * 60 * 1000 + 30 * 60 * 1000);
      expect(result).toEqual({ value: "02:30", unit: "hr" });
    });

    test("formats 23 hours 59 minutes", () => {
      const result = useFormatTime(23 * 60 * 60 * 1000 + 59 * 60 * 1000);
      expect(result).toEqual({ value: "23:59", unit: "hr" });
    });

    test("formats single-digit hours with leading zero", () => {
      const result = useFormatTime(5 * 60 * 60 * 1000);
      expect(result).toEqual({ value: "05:00", unit: "hr" });
    });
  });

  describe("days formatting", () => {
    test("formats 1 day", () => {
      const result = useFormatTime(24 * 60 * 60 * 1000);
      expect(result).toEqual({ value: "1 d 0 hrs", unit: "ms" });
    });

    test("formats 2 days 5 hours", () => {
      const result = useFormatTime(2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000);
      expect(result).toEqual({ value: "2 d 5 hrs", unit: "ms" });
    });

    test("formats 7 days 23 hours", () => {
      const result = useFormatTime(7 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000);
      expect(result).toEqual({ value: "7 d 23 hrs", unit: "ms" });
    });
  });
});

describe("useGetDayDiffFromToday", () => {
  test("returns 0 for today's date", () => {
    const today = createDateWithDayOffset();
    const result = useGetDayDiffFromToday(today.toISOString());
    expect(result).toBe(0);
  });

  test("returns positive number for future dates", () => {
    const tomorrow = createDateWithDayOffset(1);
    const result = useGetDayDiffFromToday(tomorrow.toISOString());
    expect(result).toBe(1);
  });

  test("returns negative number for past dates", () => {
    const yesterday = createDateWithDayOffset(-1);
    const result = useGetDayDiffFromToday(yesterday.toISOString());
    expect(result).toBe(-1);
  });

  test("returns 7 for date 7 days in the future", () => {
    const futureDate = createDateWithDayOffset(7);
    const result = useGetDayDiffFromToday(futureDate.toISOString());
    expect(result).toBe(7);
  });

  test("returns -30 for date 30 days in the past", () => {
    const pastDate = createDateWithDayOffset(-30);
    const result = useGetDayDiffFromToday(pastDate.toISOString());
    expect(result).toBe(-30);
  });

  test("handles dates without Z suffix", () => {
    const date = createDateWithDayOffset();
    const isoString = date.toISOString().replace("Z", "");
    const result = useGetDayDiffFromToday(isoString);
    expect(result).toBe(0);
  });
});

describe("useFormatLargeNumber", () => {
  describe("numbers less than 1 million", () => {
    test("formats 0", () => {
      const result = useFormatLargeNumber(0, 2);
      expect(result).toBe("0");
    });

    test("formats 100", () => {
      const result = useFormatLargeNumber(100, 2);
      expect(result).toBe("100");
    });

    test("formats 1,000 with comma separator", () => {
      const result = useFormatLargeNumber(1000, 2);
      expect(result).toBe("1,000");
    });

    test("formats 999,999", () => {
      const result = useFormatLargeNumber(999999, 2);
      expect(result).toBe("999,999");
    });
  });

  describe("millions (M)", () => {
    test("formats 1 million as 1M", () => {
      const result = useFormatLargeNumber(1000000, 0);
      expect(result).toBe("1M");
    });

    test("formats 1.5 million as 1.5M with 1 decimal", () => {
      const result = useFormatLargeNumber(1500000, 1);
      expect(result).toBe("1.5M");
    });

    test("formats 2.456 million as 2.46M with 2 decimals", () => {
      const result = useFormatLargeNumber(2456000, 2);
      expect(result).toBe("2.46M");
    });
  });

  describe("billions (G)", () => {
    test("formats 1 billion as 1G", () => {
      const result = useFormatLargeNumber(1000000000, 0);
      expect(result).toBe("1G");
    });

    test("formats 1.234 billion as 1.23G with 2 decimals", () => {
      const result = useFormatLargeNumber(1234000000, 2);
      expect(result).toBe("1.23G");
    });

    test("formats 999 billion as 999G", () => {
      const result = useFormatLargeNumber(999000000000, 0);
      expect(result).toBe("999G");
    });
  });

  describe("trillions (T)", () => {
    test("formats 1 trillion as 1T", () => {
      const result = useFormatLargeNumber(1000000000000, 0);
      expect(result).toBe("1T");
    });

    test("formats 5.678 trillion as 5.68T with 2 decimals", () => {
      const result = useFormatLargeNumber(5678000000000, 2);
      expect(result).toBe("5.68T");
    });
  });

  describe("edge cases", () => {
    test("returns empty string for NaN", () => {
      const result = useFormatLargeNumber(NaN, 2);
      expect(result).toBe("");
    });

    test("handles 0 decimals", () => {
      const result = useFormatLargeNumber(1234567, 0);
      expect(result).toBe("1M");
    });

    test("handles 3 decimals", () => {
      const result = useFormatLargeNumber(1234567, 3);
      expect(result).toBe("1.235M");
    });

    test("rounds decimals correctly", () => {
      const result = useFormatLargeNumber(1999999, 1);
      expect(result).toBe("2M");
    });
  });
});
