import { afterEach, describe, expect, test, vi } from "vitest";
import { parseTimePoint, resolveTimeRange, loadDefaultRange, saveDefaultRange, factoryDefaultRange, narrowingPresets } from "@/components/audit/timeRange";

const NOW = new Date("2026-09-01T10:30:45.000Z");
const now = () => new Date(NOW);

describe("parseTimePoint — absolute RFC 3339", () => {
  test("full timestamp with Z is UTC", () => {
    const r = parseTimePoint("2026-09-01T08:00:00Z", false, now);
    expect(r.error).toBeUndefined();
    expect(r.date!.toISOString()).toBe("2026-09-01T08:00:00.000Z");
    expect(r.live).toBe(false);
  });

  test("space works as the date/time separator", () => {
    const r = parseTimePoint("2026-09-01 08:00:00Z", false, now);
    expect(r.date!.toISOString()).toBe("2026-09-01T08:00:00.000Z");
  });

  test("an explicit offset is honored", () => {
    const r = parseTimePoint("2026-09-01 00:00:00-03:00", false, now);
    expect(r.date!.toISOString()).toBe("2026-09-01T03:00:00.000Z");
  });

  test("seconds are optional", () => {
    const r = parseTimePoint("2026-09-01T08:15Z", false, now);
    expect(r.date!.toISOString()).toBe("2026-09-01T08:15:00.000Z");
  });

  test("a zone-less value is local wall time", () => {
    const r = parseTimePoint("2026-09-01 08:00:00", false, now);
    expect(r.date!.getFullYear()).toBe(2026);
    expect(r.date!.getHours()).toBe(8);
  });

  test("a bare date is local midnight", () => {
    const r = parseTimePoint("2026-08-31", false, now);
    expect(r.date!.getHours()).toBe(0);
    expect(r.date!.getDate()).toBe(31);
  });

  test("a bare date with Z forces UTC midnight", () => {
    const r = parseTimePoint("2026-08-31Z", false, now);
    expect(r.date!.toISOString()).toBe("2026-08-31T00:00:00.000Z");
  });

  test("a bare date with an offset is honored", () => {
    const r = parseTimePoint("2026-08-31+02:00", false, now);
    expect(r.date!.toISOString()).toBe("2026-08-30T22:00:00.000Z");
  });

  test("garbage is rejected with guidance", () => {
    expect(parseTimePoint("next tuesday", false, now).error).toContain("RFC 3339");
    expect(parseTimePoint("2026-13-45", false, now).error).toBeTruthy();
  });
});

describe("parseTimePoint — relative expressions", () => {
  test("now resolves to now and is live", () => {
    const r = parseTimePoint("now", false, now);
    expect(r.date!.getTime()).toBe(NOW.getTime());
    expect(r.live).toBe(true);
  });

  test("now-6h subtracts six hours", () => {
    const r = parseTimePoint("now-6h", false, now);
    expect(r.date!.toISOString()).toBe("2026-09-01T04:30:45.000Z");
  });

  test("now/d snaps to start of the local day in a From bound", () => {
    const r = parseTimePoint("now/d", false, now);
    expect(r.date!.getHours()).toBe(0);
    expect(r.date!.getMinutes()).toBe(0);
  });

  test("now-1d/d in a To bound means end of yesterday", () => {
    const from = parseTimePoint("now-1d/d", false, now).date!;
    const to = parseTimePoint("now-1d/d", true, now).date!;
    expect(to.getTime()).toBeGreaterThan(from.getTime());
    expect(to.getTime() - from.getTime()).toBe(86400e3 - 1000);
  });

  test("a malformed now-expression is rejected", () => {
    expect(parseTimePoint("now-6x", false, now).error).toBeTruthy();
    expect(parseTimePoint("nowhere", false, now).error).toBeTruthy();
  });
});

describe("resolveTimeRange", () => {
  test("both bounds resolve against the same instant", () => {
    const r = resolveTimeRange({ from: "now-6h", to: "now" }, now)!;
    expect(r.to.getTime() - r.from.getTime()).toBe(6 * 3600e3);
    expect(r.live).toBe(true);
  });

  test("bounds entered backwards are swapped", () => {
    const r = resolveTimeRange({ from: "now", to: "now-1h" }, now)!;
    expect(r.from.getTime()).toBeLessThan(r.to.getTime());
  });

  test("an invalid bound yields no range", () => {
    expect(resolveTimeRange({ from: "junk", to: "now" }, now)).toBeNull();
    expect(resolveTimeRange({ from: "", to: "" }, now)).toBeNull();
  });

  test("absolute and relative bounds mix", () => {
    const r = resolveTimeRange({ from: "2026-09-01T00:00:00Z", to: "now" }, now)!;
    expect(r.from.toISOString()).toBe("2026-09-01T00:00:00.000Z");
    expect(r.to.getTime()).toBe(NOW.getTime());
    expect(r.live).toBe(true);
  });
});

describe("default range storage", () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test("factory default is the last 6 hours", () => {
    expect(loadDefaultRange()).toEqual({ from: "now-6h", to: "now" });
    expect(factoryDefaultRange).toEqual({ from: "now-6h", to: "now" });
  });

  test("a saved default round-trips", () => {
    saveDefaultRange({ from: "now-24h", to: "now" });
    expect(loadDefaultRange()).toEqual({ from: "now-24h", to: "now" });
  });

  test("clearing the default restores the factory value", () => {
    saveDefaultRange({ from: "now-24h", to: "now" });
    saveDefaultRange(null);
    expect(loadDefaultRange()).toEqual(factoryDefaultRange);
  });

  test("corrupt storage falls back to the factory default", () => {
    localStorage.setItem("audit.defaultTimeRange", "{nonsense");
    expect(loadDefaultRange()).toEqual(factoryDefaultRange);
  });
});

describe("FEATURE: Narrowing suggestions after a timed-out query", () => {
  test("EXAMPLE: An unbounded query gets the widest still-bounded presets", () => {
    expect(narrowingPresets({ from: "", to: "" }, now).map((p) => p.label)).toEqual(["Last 7 days", "Last 24 hours"]);
  });

  test("EXAMPLE: Only presets strictly narrower than the failed range are offered", () => {
    expect(narrowingPresets({ from: "now-6h", to: "now" }, now).map((p) => p.label)).toEqual(["Last hour", "Last 15 minutes"]);
  });

  test("EXAMPLE: A custom absolute range gets the presets inside its span", () => {
    expect(narrowingPresets({ from: "2026-08-30 10:00Z", to: "2026-09-01 10:00Z" }, now).map((p) => p.label)).toEqual(["Last 24 hours", "Last 6 hours"]);
  });

  test("EXAMPLE: The narrowest preset has nowhere further to go", () => {
    expect(narrowingPresets({ from: "now-15m", to: "now" }, now)).toEqual([]);
  });
});
