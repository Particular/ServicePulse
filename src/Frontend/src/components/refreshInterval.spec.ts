import { describe, expect, test } from "vitest";
import { abbreviateInterval, refreshIntervalOptions } from "@/components/refreshInterval";

describe("FEATURE: Auto-refresh interval labels", () => {
  describe("RULE: An interval reads as a short unit label, the way Grafana shows it", () => {
    test("EXAMPLE: Off, seconds, minutes and hours", () => {
      expect(abbreviateInterval(null)).toBe("Off");
      expect(abbreviateInterval(0)).toBe("Off");
      expect(abbreviateInterval(5000)).toBe("5s");
      expect(abbreviateInterval(30000)).toBe("30s");
      expect(abbreviateInterval(60000)).toBe("1m");
      expect(abbreviateInterval(600000)).toBe("10m");
      expect(abbreviateInterval(3600000)).toBe("1h");
    });
  });

  describe("RULE: The menu offers the same intervals as before, each with its short and long label", () => {
    test("EXAMPLE: Off first, then increasing intervals", () => {
      expect(refreshIntervalOptions.map((o) => o.short)).toEqual(["Off", "5s", "15s", "30s", "1m", "10m", "30m", "1h"]);
      expect(refreshIntervalOptions.find((o) => o.ms === 60000)?.long).toBe("Every minute");
      expect(refreshIntervalOptions.find((o) => o.ms === 0)?.long).toBe("Off");
    });
  });
});
